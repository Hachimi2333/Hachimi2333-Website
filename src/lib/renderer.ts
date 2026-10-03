import type { Tokens } from 'marked'

export interface CodeMeta {
  lang: string
  title: string | null
  del: number[]
  ins: number[]
}

export function parseCodeMeta(info: string): CodeMeta {
  const parts = info.trim().split(/\s+/)
  const lang = parts[0] || 'text'
  let title: string | null = null
  const del: number[] = []
  const ins: number[] = []

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    const titleMatch = part.match(/^title=["'](.+)["']$/)
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
      continue
    }
  }

  return { lang, title, del, ins }
}

function parseLineRanges(str: string): number[] {
  const lines: number[] = []
  for (const part of str.split(',')) {
    const range = part.trim().split('-').map(Number)
    if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
      for (let i = range[0]; i <= range[1]; i++) lines.push(i)
    } else if (!isNaN(range[0])) {
      lines.push(range[0])
    }
  }
  return lines
}

export const renderer = {
  code({ text, lang }: Tokens.Code) {
    const meta = parseCodeMeta(lang || '')
    const language = meta.lang || 'plaintext'
    // 把完整 info string 编码到 class 属性中，方便 shiki transformer 直接读取
    const encodedInfo = encodeForAttr(lang || '')
    return `<pre><code class="language-${language} shiki-code" data-info="${encodedInfo}">${escapeHtml(text)}</code></pre>`
  },
  image({ href, title, text }: Tokens.Image) {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    const alt = text || ''
    return `<img src="${href}" alt="${escapeHtml(alt)}"${titleAttr} loading="lazy" class="max-w-full rounded-lg" />`
  },
  link({ href, title, text }: Tokens.Link) {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    const isExternal = href.startsWith('http')
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${href}"${titleAttr}${target}>${text}</a>`
  },
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function encodeForAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}
