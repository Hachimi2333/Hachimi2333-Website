import { Marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { renderer, parseCodeMeta } from './renderer'
import type { ShikiTransformer } from 'shiki'
import type { Element } from 'hast'

const marked = new Marked(gfmHeadingId(), { renderer })

// 每次 renderMarkdown 调用时重置
let currentMetaIndex = 0
let currentMetaList: { title: string | null; del: number[]; ins: number[] }[] = []

function createDiffTransformer(): ShikiTransformer {
  return {
    name: 'code-diff',
    enforce: 'pre',
    code(codeEl) {
      const meta = currentMetaList[currentMetaIndex]
      currentMetaIndex++
      if (!meta) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = this as any

      const lineSpans = codeEl.children.filter(
        (c: any) => c.type === 'element' && c.tagName === 'span' && c.properties?.class?.includes('line')
      ) as Element[]

      for (let i = 0; i < lineSpans.length; i++) {
        const lineNum = i + 1
        const span = lineSpans[i]
        if (meta.del.includes(lineNum)) {
          ctx.addClassToHast(span, 'diff del')
        }
        if (meta.ins.includes(lineNum)) {
          ctx.addClassToHast(span, 'diff ins')
        }
      }

      if (meta.del.length || meta.ins.length) {
        ctx.addClassToHast(codeEl, 'has-diff')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const preEl = (codeEl as any).parent as Element | undefined
        if (preEl) ctx.addClassToHast(preEl, 'has-diff')
      }

      if (meta.title) {
        ctx.options._shikiTitle = meta.title
      }
    },
    pre(preEl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = this as any

      // 标题栏
      const title = ctx.options._shikiTitle as string | undefined
      if (title) {
        const titleBar: Element = {
          type: 'element',
          tagName: 'div',
          properties: { class: 'shiki-title' },
          children: [{ type: 'text', value: title }],
        }
        preEl.children.unshift(titleBar)
      }

      // 复制按钮
      const copyBtn: Element = {
        type: 'element',
        tagName: 'button',
        properties: {
          class: 'copy-btn',
          'aria-label': '复制代码',
          onclick: `(() => { const c = this.parentElement.querySelector('code'); if (!c) return; const t = Array.from(c.querySelectorAll('.line')).map(l => l.textContent || '').join('\\n').replace(/\\n$/, ''); navigator.clipboard.writeText(t).then(() => { this.textContent = '✓'; this.classList.add('copied'); setTimeout(() => { this.textContent = '⧉'; this.classList.remove('copied'); }, 1500); }); })()`,
        } as any,
        children: [{ type: 'text', value: '⧉' }],
      }
      preEl.children.push(copyBtn)
    },
  }
}

export async function renderMarkdown(content: string, isDark: boolean): Promise<string> {
  const html = marked.parse(content) as string

  const { codeToHtml, bundledLanguages } = await import('shiki')
  const regex = /<pre><code class="language-(\w+) shiki-code" data-info="([^"]*)">([\s\S]*?)<\/code><\/pre>/g

  let result = html
  let match: RegExpExecArray | null

  // 收集所有 code block 的 meta
  const allMatches: { full: string; lang: string; rawInfo: string; code: string; meta: ReturnType<typeof parseCodeMeta> }[] = []
  while ((match = regex.exec(html)) !== null) {
    const [full, lang, encodedInfo, code] = match
    const rawInfo = decodeAttr(encodedInfo)
    allMatches.push({ full, lang, rawInfo, code, meta: parseCodeMeta(rawInfo) })
  }

  // 按顺序处理，每次重置索引
  currentMetaList = allMatches.map((m) => m.meta)
  currentMetaIndex = 0

  for (const m of allMatches) {
    const langForShiki = (m.lang && m.lang in bundledLanguages) ? m.lang : 'text'
    try {
      const highlighted = await codeToHtml(decodeEntities(m.code), {
        lang: langForShiki,
        theme: isDark ? 'github-dark' : 'github-light',
        transformers: [createDiffTransformer()],
      })
      result = result.replace(m.full, highlighted)
    } catch {
      // 保留原始代码块
    }
  }

  currentMetaList = []
  currentMetaIndex = 0
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

function decodeAttr(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
}
