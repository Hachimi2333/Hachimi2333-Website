import { Marked } from 'marked'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { Element } from 'hast'
import type { ShikiTransformer } from 'shiki'
import { createBlogRenderer, decodeAttr, escapeHtml, type CodeMeta, type TocHeading } from './renderer'

export type { TocHeading } from './renderer'

export interface RenderedMarkdown {
  html: string
  headings: TocHeading[]
}

/**
 * Languages registered with Shiki.
 *
 * This is a fine-grained bundle on purpose. `await import('shiki')` pulls in the
 * full bundle, which made Vite emit one chunk per grammar — 324 files / ~9.7 MB
 * of assets for a blog whose posts only use five languages. Adding a language
 * here costs one small chunk; bundling them all costs nothing extra.
 * `content/posts/*.md` currently uses: powershell, vue, astro, css, txt.
 */
const LANGUAGE_IMPORTS = [
  import('@shikijs/langs/powershell'),
  import('@shikijs/langs/vue'),
  import('@shikijs/langs/astro'),
  import('@shikijs/langs/css'),
]

const THEME_IMPORTS = {
  light: import('@shikijs/themes/github-light'),
  dark: import('@shikijs/themes/github-dark'),
}

const CODE_BLOCK_SOURCE =
  '<pre><code class="language-([^"]*)" data-code-info="([^"]*)">([\\s\\S]*?)<\\/code><\\/pre>'

let highlighterPromise: Promise<HighlighterCore> | null = null

/**
 * Lazily create the Shiki highlighter exactly once.
 *
 * The JavaScript regex engine is used instead of the default Oniguruma/WASM
 * engine: it removes a ~620 KB WebAssembly chunk from the bundle, and its
 * grammar support is sufficient for the languages registered above.
 */
function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [THEME_IMPORTS.light, THEME_IMPORTS.dark],
    langs: LANGUAGE_IMPORTS,
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}

function decodeEntities(value: string): string {
  // Reverse of `escapeHtml`, in reverse escape order.
  return value
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
}

/**
 * Transformer carrying one code block's metadata.
 *
 * The metadata is captured per block instead of being read from module state, so
 * highlighting two posts concurrently can no longer cross-contaminate them.
 */
function codeMetaTransformer(meta: CodeMeta): ShikiTransformer {
  return {
    name: 'blog-code-meta',
    enforce: 'pre',

    code(node) {
      if (meta.del.length === 0 && meta.ins.length === 0) return

      const lines = node.children.filter(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'span',
      )

      lines.forEach((line, index) => {
        const lineNumber = index + 1
        if (meta.del.includes(lineNumber)) this.addClassToHast(line, 'diff del')
        if (meta.ins.includes(lineNumber)) this.addClassToHast(line, 'diff ins')
      })

      this.addClassToHast(node, 'has-diff')
    },

    pre(node) {
      // Mark the `<pre>` too so the shared gutter styles apply. The `pre` hook
      // runs on the outer element, so there is no parent lookup here.
      if (meta.del.length > 0 || meta.ins.length > 0) {
        this.addClassToHast(node, 'has-diff')
      }

      if (meta.title) {
        node.children.unshift({
          type: 'element',
          tagName: 'div',
          properties: { class: 'shiki-title' },
          children: [{ type: 'text', value: meta.title }],
        })
      }

      // The click handler lives in PostDetailView (event delegation), so the
      // button carries no inline `onclick` and works under a strict CSP.
      node.children.push({
        type: 'element',
        tagName: 'button',
        properties: {
          class: 'copy-btn',
          type: 'button',
          'data-copy-code': '',
          'aria-label': '复制代码',
        },
        children: [{ type: 'text', value: '⧉' }],
      })
    },
  }
}

interface CodeBlockMatch {
  start: number
  end: number
  lang: string
  info: string
  code: string
}

function findCodeBlocks(html: string): CodeBlockMatch[] {
  const blocks: CodeBlockMatch[] = []
  const regex = new RegExp(CODE_BLOCK_SOURCE, 'g')
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    blocks.push({
      start: match.index,
      end: match.index + match[0].length,
      lang: match[1],
      info: decodeAttr(match[2]),
      code: match[3],
    })
  }

  return blocks
}

/**
 * Render Markdown to HTML with syntax highlighting.
 *
 * Both themes are emitted at once as CSS custom properties (`--shiki-light` /
 * `--shiki-dark`), so toggling the site theme only flips CSS — the article no
 * longer has to be re-rendered, and there is no flash of the wrong theme.
 */
export async function renderMarkdown(content: string): Promise<RenderedMarkdown> {
  const headings: TocHeading[] = []
  const blog = createBlogRenderer(headings)
  const marked = new Marked({ renderer: blog.renderer })

  const html = marked.parse(content) as string
  const blocks = findCodeBlocks(html)

  // Nothing to highlight: skip loading Shiki entirely.
  if (blocks.length === 0) {
    return { html, headings }
  }

  const highlighter = await getHighlighter()
  const loadedLanguages = new Set<string>(highlighter.getLoadedLanguages())
  const codeMetas = blog.getCodeMetas()

  // Rebuild the document by exact offset instead of `String.replace`, which
  // always replaces the first occurrence and therefore highlighted the same
  // block twice when two blocks were byte-identical.
  const parts: string[] = []
  let cursor = 0

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]
    const meta = codeMetas[index] ?? {
      lang: block.lang,
      title: null,
      del: [],
      ins: [],
    }

    parts.push(html.slice(cursor, block.start))

    const lang = loadedLanguages.has(meta.lang) ? meta.lang : 'text'
    try {
      parts.push(
        highlighter.codeToHtml(decodeEntities(block.code), {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
          transformers: [codeMetaTransformer(meta)],
        }),
      )
    } catch {
      // Keep the unhighlighted block rather than dropping the post body.
      parts.push(
        `<pre><code class="language-${escapeHtml(meta.lang)}">${block.code}</code></pre>`,
      )
    }

    cursor = block.end
  }

  parts.push(html.slice(cursor))

  return { html: parts.join(''), headings }
}
