import type { Tokens } from 'marked'

export const renderer = {
  code({ text, lang }: Tokens.Code) {
    const language = lang || 'plaintext'
    return `<pre><code class="language-${language} shiki-code">${escapeHtml(text)}</code></pre>`
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
