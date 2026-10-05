import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { POSTS_ROUTE } from './blog/paths'
import { SITE_DESCRIPTION, SITE_NAME } from './site'
import { tools } from './tools'

export interface PageMeta {
  title: string
  description: string
}

const NOT_FOUND_META: PageMeta = {
  title: `页面未找到 - ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
}

/**
 * Title and description for every routable page.
 *
 * Before prerendering existed this information was split between route
 * `meta.title` and a `document.title = ...` assignment inside the article view,
 * so the build could only ever write one `<title>` for all 20-odd pages.
 * Resolving it from the path gives the prerender step and the client router the
 * same answer, so a prerendered page and a client-side navigation onto it agree.
 */
const STATIC_META: Record<string, PageMeta> = {
  '/': { title: SITE_NAME, description: SITE_DESCRIPTION },
  '/posts': {
    title: `博客 - ${SITE_NAME}`,
    description: 'Hachimi2333 的博客：建站、数码、游戏与日常的记录。',
  },
  '/tools': {
    title: `工具 - ${SITE_NAME}`,
    description: `Hachimi2333 的在线工具：${tools.map((tool) => tool.name).join('、')}。`,
  },
}

for (const tool of tools) {
  STATIC_META[tool.route] = {
    title: `${tool.name} - ${SITE_NAME}`,
    description: tool.description,
  }
}

/** Path without the query string, the hash, or a trailing slash. */
export function canonicalPath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '/'
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1)
  return withoutQuery || '/'
}

export async function resolvePageMeta(path: string): Promise<PageMeta> {
  const clean = canonicalPath(path)

  if (clean.startsWith(`${POSTS_ROUTE}/`)) {
    // Imported on demand: the post index is a shared chunk with the list view,
    // and the entry bundle should not carry every post's metadata just so the
    // header can title a page.
    const { getPostBySlug } = await import('./blog')
    const post = getPostBySlug(decodeURIComponent(clean.slice(POSTS_ROUTE.length + 1)))
    if (post) {
      return {
        title: `${post.title} - ${SITE_NAME}`,
        description: post.excerpt || post.description || SITE_DESCRIPTION,
      }
    }
  }

  return STATIC_META[clean] ?? NOT_FOUND_META
}

/** Convenience wrapper for the router guard. */
export function resolveRouteMeta(route: RouteLocationNormalizedLoaded): Promise<PageMeta> {
  return resolvePageMeta(route.path)
}

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  const element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (element) element.content = content
}

/**
 * Write resolved metadata into the live document.
 *
 * These values duplicate what the prerender step bakes into the HTML; the client
 * only needs to correct them after a client-side navigation.
 */
export function applyPageMeta(meta: PageMeta): void {
  if (typeof document === 'undefined') return

  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
}
