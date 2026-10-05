/**
 * Single source of truth for the blog content location.
 *
 * Imported by the build-time compiler (`scripts/blog-plugin.ts`) and the Node
 * sitemap plugin (`scripts/sitemap.ts`), so this module must stay free of
 * `node:` built-ins and of any other environment-specific API.
 */

/** Repository-relative directory holding one Markdown file per post. */
export const POSTS_DIR = 'content/posts'

/** Public URL prefix for a post detail page. */
export const POSTS_ROUTE = '/posts'

/** Slug for a post is its filename without the `.md` extension. */
export function slugFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() ?? ''
  return fileName.replace(/\.md$/, '')
}

export function postUrl(slug: string): string {
  return `${POSTS_ROUTE}/${slug}`
}
