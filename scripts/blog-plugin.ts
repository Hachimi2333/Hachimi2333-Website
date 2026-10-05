import fs from 'node:fs'
import path from 'node:path'
import type { HmrContext, Plugin, ViteDevServer } from 'vite'
// Relative imports on purpose: this module is loaded by Vite's config loader,
// which runs before `resolve.alias` exists, so `@/…` would not resolve here.
import {
  parseFrontmatter,
  readBoolean,
  readDate,
  readString,
  readStringArray,
} from '../src/lib/blog/frontmatter'
import { renderMarkdown } from '../src/lib/blog/markdown'
import { POSTS_DIR, slugFromPath } from '../src/lib/blog/paths'
import type { BlogPost, RenderedPostMap } from '../src/types/blog'

/**
 * Compiles `content/posts/*.md` into two virtual modules at build time.
 *
 * Why this replaced `import.meta.glob`:
 *
 * 1. The site is fully prerendered, so the article body has to exist during the
 *    *first* render on both the server and the client. `import.meta.glob` gave
 *    the browser raw Markdown and an `await renderMarkdown()` in `onMounted`,
 *    which cannot match server HTML — hydration would have mismatched on every
 *    article page and flashed a loading skeleton over prerendered content.
 * 2. `import.meta.glob` silently inlined zero posts when its pattern was not a
 *    call-site literal. Reading the directory in Node cannot fail that way: a
 *    missing directory or an empty match is a hard build error.
 * 3. Post metadata, the excerpt fallback, the reading time and the highlighted
 *    HTML now come from one pass over one directory. Shiki is a build-time
 *    dependency and no longer ships to the browser at all.
 *
 * The two modules are split so the (small) metadata can be imported by the list
 * page without dragging the (large) article HTML into the same chunk.
 */
export const POSTS_MODULE = 'virtual:blog-posts'
export const CONTENT_MODULE = 'virtual:blog-content'

const RESOLVED_POSTS = `\0${POSTS_MODULE}`
const RESOLVED_CONTENT = `\0${CONTENT_MODULE}`

interface CompiledPost extends BlogPost {
  /** Markdown source. Never leaves the build process. */
  content: string
}

/** First usable prose line, used when frontmatter has no `description`. */
function buildExcerpt(description: string, content: string): string {
  if (description) return description

  const line = content
    .split('\n')
    .map((raw) => raw.trim())
    .find(
      (raw) =>
        raw !== '' &&
        !raw.startsWith('#') &&
        !raw.startsWith('!') &&
        !raw.startsWith('>') &&
        !raw.startsWith('|') &&
        !raw.startsWith('```') &&
        !/^-{3,}$/.test(raw),
    )

  return (line ?? '').replace(/\*\*|__|\*|_|\[.*?\]\(.*?\)|`{1,3}/g, '').slice(0, 120)
}

function compilePosts(postsDir: string): CompiledPost[] {
  if (!fs.existsSync(postsDir)) {
    throw new Error(
      `[blog] content directory "${postsDir}" does not exist. Check POSTS_DIR in src/lib/blog/paths.ts.`,
    )
  }

  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'))
  if (files.length === 0) {
    throw new Error(`[blog] no "*.md" files in "${postsDir}"; the blog would render empty.`)
  }

  const posts: CompiledPost[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const slug = slugFromPath(file)
    const { data, content: body } = parseFrontmatter(content)

    if (readBoolean(data, 'draft')) continue

    posts.push({
      slug,
      title: readString(data, 'title', slug),
      published: readDate(data),
      description: readString(data, 'description'),
      excerpt: buildExcerpt(readString(data, 'description'), body),
      image: readString(data, 'image'),
      tags: readStringArray(data, 'tags'),
      category: readString(data, 'category', '未分类'),
      readingTime: Math.max(1, Math.ceil(body.length / 400)),
      content: body,
    })
  }

  // Newest first. `published` is an ISO date string by now, so a lexicographic
  // compare is chronologically correct. Falling back to the slug keeps the
  // order stable for posts that share a date (or have none).
  posts.sort((a, b) => {
    if (a.published !== b.published) return a.published < b.published ? 1 : -1
    return a.slug.localeCompare(b.slug)
  })

  return posts
}

/**
 * Serialize a value for a generated ES module.
 *
 * `JSON.stringify` leaves U+2028/U+2029 raw, which are line terminators in
 * JavaScript source: a post containing one would break the generated module.
 */
function toModuleSource(value: unknown): string {
  const json = JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
  return `export default ${json}\n`
}

export function blogPlugin(): Plugin {
  let postsDir = ''
  let cache: CompiledPost[] | null = null
  let contentCache: RenderedPostMap | null = null

  const load = (): CompiledPost[] => (cache ??= compilePosts(postsDir))

  const invalidate = () => {
    cache = null
    contentCache = null
  }

  const invalidateVirtualModules = (server: ViteDevServer) => {
    for (const id of [RESOLVED_POSTS, RESOLVED_CONTENT]) {
      const mod = server.moduleGraph.getModuleById(id)
      if (mod) server.moduleGraph.invalidateModule(mod)
    }
  }

  return {
    name: 'blog-content',

    configResolved(config) {
      postsDir = path.resolve(config.root, POSTS_DIR)
    },

    buildStart() {
      invalidate()
    },

    resolveId(id) {
      if (id === POSTS_MODULE) return RESOLVED_POSTS
      if (id === CONTENT_MODULE) return RESOLVED_CONTENT
      return null
    },

    async load(id) {
      if (id === RESOLVED_POSTS) {
        const posts = load().map(({ content: _content, ...meta }) => meta)
        return toModuleSource(posts)
      }

      if (id === RESOLVED_CONTENT) {
        if (!contentCache) {
          const rendered: RenderedPostMap = {}
          for (const post of load()) {
            rendered[post.slug] = await renderMarkdown(post.content)
          }
          contentCache = rendered
        }
        return toModuleSource(contentCache)
      }

      return null
    },

    handleHotUpdate(context: HmrContext) {
      if (!context.file.startsWith(postsDir)) return

      invalidate()
      invalidateVirtualModules(context.server)

      const modules = [RESOLVED_POSTS, RESOLVED_CONTENT]
        .map((id) => context.server.moduleGraph.getModuleById(id))
        .filter((mod) => mod !== undefined)

      return [...context.modules, ...modules]
    },
  }
}
