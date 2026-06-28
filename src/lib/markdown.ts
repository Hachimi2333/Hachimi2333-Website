import { Marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { renderer } from './renderer'

const marked = new Marked(gfmHeadingId(), { renderer })

export async function renderMarkdown(content: string, isDark: boolean): Promise<string> {
  const html = marked.parse(content) as string

  const { codeToHtml } = await import('shiki')
  const regex = /<pre><code class="language-(\w+) shiki-code">([\s\S]*?)<\/code><\/pre>/g

  let result = html
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const [full, lang, code] = match
    try {
      const highlighted = await codeToHtml(decodeEntities(code), {
        lang: lang || 'text',
        theme: isDark ? 'github-dark' : 'github-light',
      })
      result = result.replace(full, highlighted)
    } catch {
      // 保留原始代码块
    }
  }
  return result
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}
