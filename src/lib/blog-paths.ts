/**
 * Single source of truth for the blog content location.
 *
 * Imported by both the browser-side blog index (`src/lib/blog.ts`) and the
 * Node-side sitemap plugin (`src/lib/sitemap.ts`), so this module must stay
 * free of `import.meta.glob`, `node:` built-ins, and any other environment
 * specific API.
 */

/** Repository-relative directory holding one Markdown file per post. */
export const POSTS_DIR = 'content/posts'

/** Vite root-absolute glob used by `import.meta.glob` in the browser. */
export const POSTS_GLOB = `/${POSTS_DIR}/*.md`

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
