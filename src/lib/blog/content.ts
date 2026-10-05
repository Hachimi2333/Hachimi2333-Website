import type { RenderedPost, RenderedPostMap } from '@/types/blog'
import rendered from 'virtual:blog-content'

/**
 * Pre-rendered article bodies, keyed by slug.
 *
 * `scripts/blog-plugin.ts` runs `renderMarkdown()` for every published post
 * during the build, so the highlighting, the heading anchors and the table of
 * contents are all fixed before the page is written. That is what lets the
 * article view render synchronously: the prerendered HTML and the first client
 * render agree, so hydration matches and there is no loading skeleton.
 *
 * Imported **only** by `src/views/blog/PostDetailView.vue`. It is by far the
 * largest module in the app, and keeping it out of `@/lib/blog` keeps it out of
 * the post-list chunk.
 */
const renderedPosts: RenderedPostMap = rendered

export function getRenderedPost(slug: string): RenderedPost | undefined {
  return renderedPosts[slug]
}
