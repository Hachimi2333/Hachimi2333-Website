import YAML from 'js-yaml'

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { data: {}, content: raw }
  }

  const [, frontmatter, content] = match
  try {
    const data = YAML.load(frontmatter) as Record<string, unknown> || {}
    return { data, content }
  } catch {
    // Fallback: return empty data if YAML parse fails
    return { data: {}, content }
  }
}
