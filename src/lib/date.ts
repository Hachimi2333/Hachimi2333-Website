/**
 * Date formatting helpers.
 *
 * Post dates come from frontmatter as `YYYY-MM-DD` strings. Parsing those with
 * `new Date(value)` yields UTC midnight, so formatting them with the *local*
 * timezone (the default for `toLocaleDateString` / `getDate`) renders the
 * previous day for every visitor west of UTC. These helpers therefore read the
 * date parts directly and never do a timezone conversion.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/

interface DateParts {
  year: number
  month: number
  day: number
}

function parseParts(value: string): DateParts | null {
  const match = ISO_DATE_RE.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

/** `2022-09-11` → `2022年9月11日` */
export function formatDate(value: string): string {
  const parts = parseParts(value)
  if (!parts) return value
  return `${parts.year}年${parts.month}月${parts.day}日`
}
