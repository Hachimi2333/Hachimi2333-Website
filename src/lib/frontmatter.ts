export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { data: {}, content: raw }
  }

  const [, frontmatter, content] = match
  const data: Record<string, unknown> = {}

  let currentKey = ''
  let inArray = false
  let arrayValues: unknown[] = []

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const inlineArrayMatch = trimmed.match(/^(\w+):\s*\[(.*)\]$/)
    if (inlineArrayMatch) {
      const [, key, values] = inlineArrayMatch
      data[key] = values.split(',').map((v) => {
        const s = v.trim().replace(/^["']|["']$/g, '')
        return s
      })
      inArray = false
      continue
    }

    if (inArray && trimmed.startsWith('- ')) {
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, '')
      if (val === 'true') arrayValues.push(true)
      else if (val === 'false') arrayValues.push(false)
      else arrayValues.push(val)
      continue
    }

    if (inArray && currentKey) {
      data[currentKey] = arrayValues
      inArray = false
      arrayValues = []
    }

    const kvMatch = trimmed.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      const [, key, value] = kvMatch
      if (value === '') {
        currentKey = key
        inArray = true
        arrayValues = []
      } else {
        currentKey = key
        const cleanVal = value.replace(/^["']|["']$/g, '')
        if (cleanVal === 'true') data[key] = true
        else if (cleanVal === 'false') data[key] = false
        else data[key] = cleanVal
        inArray = false
      }
    }
  }

  if (inArray && currentKey) {
    data[currentKey] = arrayValues
  }

  return { data, content }
}
