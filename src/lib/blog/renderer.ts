import { Renderer, type Tokens } from 'marked'

export interface CodeMeta {
  lang: string
  title: string | null
  del: number[]
  ins: number[]
}

export interface TocHeading {
  level: number
  id: string
  text: string
}

/**
 * Parse the fenced-code info string, e.g. `vue title="App.vue" ins={2-4} del={7}`.
 */
export function parseCodeMeta(info: string): CodeMeta {
  const parts = info.trim().split(/\s+/)
  const lang = parts[0] ?? 'text'
  let title: string | null = null
  const del: number[] = []
  const ins: number[] = []

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    const titleMatch = part.match(/^title=["'](.*)["']$/)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }
    const delMatch = part.match(/^del=\{(.+)\}$/)
    if (delMatch) {
      del.push(...parseLineRanges(delMatch[1]))
      continue
    }
    const insMatch = part.match(/^ins=\{(.+)\}$/)
    if (insMatch) {
      ins.push(...parseLineRanges(insMatch[1]))
    }
  }

  return { lang, title, del, ins }
}

function parseLineRanges(value: string): number[] {
  const lines: number[] = []
  for (const part of value.split(',')) {
    const bounds = part.trim().split('-').map(Number)
    if (bounds.length === 2 && !Number.isNaN(bounds[0]) && !Number.isNaN(bounds[1])) {
      for (let line = bounds[0]; line <= bounds[1]; line++) lines.push(line)
    } else if (!Number.isNaN(bounds[0])) {
      lines.push(bounds[0])
    }
  }
  return lines
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Escape a value for use inside a double-quoted HTML attribute. */
export function encodeForAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/**
 * Reverse {@link encodeForAttr}.
 *
 * The order matters: `&` is escaped first and `"` second, so decoding has to
 * undo them in the opposite order. Decoding `&amp;` first would turn a literal
 * `&quot;` in the source into a real quote.
 */
export function decodeAttr(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

/** Anchor-friendly slug that keeps Unicode letters, so CJK headings work. */
function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

const EXTERNAL_LINK_RE = /^(?:https?:)?\/\//i

/**
 * The renderer overrides handed to marked.
 *
 * This is a plain object with only renderer methods as own enumerable keys.
 * `Marked.use()` walks the object with `for...in` and throws
 * `renderer '<key>' does not exist` for anything else, so **state must not live
 * on this object** and a `Renderer` subclass cannot be used: class instances
 * expose their fields as own enumerable properties, which marked then tries to
 * register as renderer methods. All mutable state lives in the closure created
 * by {@link createBlogRenderer} instead.
 */
export interface BlogRendererObject {
  heading(this: Renderer, token: Tokens.Heading): string
  code(this: Renderer, token: Tokens.Code): string
  image(this: Renderer, token: Tokens.Image): string
  link(this: Renderer, token: Tokens.Link): string
}

export interface BlogRenderer {
  /** Pass to `new Marked({ renderer })`. */
  renderer: BlogRendererObject
  /** Code metadata in document order, aligned with the emitted `<pre>` blocks. */
  getCodeMetas(): CodeMeta[]
}

/**
 * Build a renderer for one Markdown render pass.
 *
 * A fresh instance is created per render, so heading IDs, the heading outline,
 * and the code-block list never leak between calls. The previous implementation
 * kept a shared cursor inside `marked-gfm-heading-id` plus two module-level
 * arrays, so two interleaved renders corrupted each other.
 */
export function createBlogRenderer(headings: TocHeading[]): BlogRenderer {
  const codeMetas: CodeMeta[] = []
  const usedHeadingIds = new Map<string, number>()

  const renderer: BlogRendererObject = {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens)
      const text = inner.replace(/<[^>]*>/g, '').trim()

      // GitHub-style de-duplication: `title`, `title-1`, `title-2`, …
      const base = slugify(text)
      const seen = usedHeadingIds.get(base) ?? 0
      const id = seen === 0 ? base : `${base}-${seen}`
      usedHeadingIds.set(base, seen + 1)

      headings.push({ level: depth, id, text })
      return `<h${depth} id="${encodeForAttr(id)}">${inner}</h${depth}>\n`
    },

    code({ text, lang, escaped }) {
      const meta = parseCodeMeta(lang ?? '')
      codeMetas.push(meta)

      const code = escaped ? text : escapeHtml(text)
      return `<pre><code class="language-${encodeForAttr(meta.lang)}" data-code-info="${encodeForAttr(lang ?? '')}">${code}</code></pre>\n`
    },

    image({ href, title, text }) {
      const titleAttr = title ? ` title="${encodeForAttr(title)}"` : ''
      return `<img src="${encodeForAttr(href)}" alt="${encodeForAttr(text ?? '')}"${titleAttr} loading="lazy" decoding="async" />`
    },

    link({ href, title, text }) {
      const titleAttr = title ? ` title="${encodeForAttr(title)}"` : ''
      const rel = EXTERNAL_LINK_RE.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${encodeForAttr(href)}"${titleAttr}${rel}>${text}</a>`
    },
  }

  return { renderer, getCodeMetas: () => codeMetas }
}
