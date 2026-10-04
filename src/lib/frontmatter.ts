import YAML from 'js-yaml'

/** Raw frontmatter block, before normalisation. */
export type RawFrontmatter = Record<string, unknown>

export interface ParsedFrontmatter {
  data: RawFrontmatter
  content: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/**
 * Parse a Markdown file with an optional YAML frontmatter block.
 *
 * Runs in both the browser (blog index) and Node (sitemap plugin), so it must
 * stay dependency-light and isomorphic — no `node:` imports.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { data: {}, content: raw }
  }

  const [, block, content] = match
  try {
    const data = YAML.load(block) as RawFrontmatter | null
    return { data: data ?? {}, content }
  } catch {
    // Malformed YAML: keep the body so the post still renders.
    return { data: {}, content }
  }
}

/**
 * Normalise a frontmatter date to a `YYYY-MM-DD` string.
 *
 * js-yaml parses an unquoted YAML timestamp (`published: 2022-09-11`) into a JS
 * `Date`, while a quoted one (`published: "2022-09-11"`) stays a string. Both
 * shapes exist in `content/posts/*.md`, and everything downstream — sorting,
 * `formatDate`, and the `<lastmod>` field of the sitemap — expects a plain
 * ISO date string. Without this, a `Date` leaks into the XML as
 * `Mon Jun 29 2026 08:00:00 GMT+0800 (中国标准时间)`, which is not a valid
 * sitemap timestamp.
 */
export function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString().slice(0, 10)
  }
  return ''
}

/** Read a frontmatter field that may be `published` or the legacy `date`. */
export function readDate(data: RawFrontmatter): string {
  return toIsoDate(data.published) || toIsoDate(data.date)
}

export function readString(data: RawFrontmatter, key: string, fallback = ''): string {
  const value = data[key]
  if (value === null || value === undefined) return fallback
  if (value instanceof Date) return toIsoDate(value)
  return typeof value === 'string' ? value : String(value)
}

export function readStringArray(data: RawFrontmatter, key: string): string[] {
  const value = data[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function readBoolean(data: RawFrontmatter, key: string): boolean {
  return data[key] === true
}
