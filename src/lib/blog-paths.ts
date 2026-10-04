/**
 * Single source of truth for the blog content location.
 *
 * Imported by both the browser-side blog index (`src/lib/blog.ts`) and the
 * Node-side sitemap plugin (`build/sitemap.ts`), so this module must stay free of
 * `import.meta.glob`, `node:` built-ins, and any other environment specific API.
 *
 * `blog.ts` needs the directory as a glob pattern, but Vite only accepts a
 * string written literally at the `import.meta.glob` call site — a `const`, even
 * a template literal built from `POSTS_DIR`, is rejected ("Could only use
 * literals") and the **production** build silently inlines zero posts. So the
 * pattern is duplicated there on purpose and validated against `POSTS_DIR`.
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
