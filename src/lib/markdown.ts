import { Marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { renderer } from './renderer'

const marked = new Marked(
  gfmHeadingId(),
  { renderer },
)

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}
