import type { BlogPost } from '@/types/blog'
import posts from 'virtual:blog-posts'

/**
 * Post metadata compiled at build time by `scripts/blog-plugin.ts`.
 *
 * The list is already sorted newest-first and has drafts removed, so every
 * accessor below is a plain read. Nothing in this module renders Markdown: the
 * HTML lives in `@/lib/blog/content`, which only the article view imports, so
 * the list page never downloads an article body.
 */
const allPosts: BlogPost[] = posts

// Unreachable while the plugin is doing its job -- it throws when the content
// directory is missing or empty. Kept so a future refactor that stops feeding
// this module fails loudly instead of shipping an empty blog.
if (allPosts.length === 0) {
  throw new Error(
    'virtual:blog-posts resolved no posts. See scripts/blog-plugin.ts and POSTS_DIR in src/lib/blog/paths.ts.',
  )
}

export function getAllPosts(): BlogPost[] {
  return allPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((post) => post.slug === slug)
}

export function getAllCategories(): string[] {
  return [...new Set(allPosts.map((post) => post.category))]
}

export interface PostFilter {
  /** Substring match against the title, excerpt, category and tags. */
  search?: string
  category?: string | null
}

export function filterPosts(filter: PostFilter = {}): BlogPost[] {
  const query = filter.search?.trim().toLowerCase() ?? ''
  const category = filter.category ?? null

  return allPosts.filter((post) => {
    if (category && post.category !== category) return false
    if (!query) return true
    return [post.title, post.excerpt, post.category, ...post.tags].some((field) =>
      field.toLowerCase().includes(query),
    )
  })
}

export interface YearArchiveGroup {
  year: number
  label: string
  posts: BlogPost[]
}

/**
 * Group an already-filtered list by year, newest year first.
 *
 * The year is read from the ISO string rather than `new Date(...).getFullYear()`:
 * a UTC-midnight date read with a local getter lands on the previous year for
 * visitors west of UTC on January 1st.
 */
export function groupPostsByYear(source: BlogPost[]): YearArchiveGroup[] {
  const map = new Map<number, YearArchiveGroup>()

  for (const post of source) {
    const year = Number(post.published.slice(0, 4))
    if (!Number.isInteger(year)) continue

    let group = map.get(year)
    if (!group) {
      group = { year, label: `${year}`, posts: [] }
      map.set(year, group)
    }
    group.posts.push(post)
  }

  return [...map.values()].sort((a, b) => b.year - a.year)
}
