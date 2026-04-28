// Lightweight frontmatter parser that works in the browser without eval
import type { BlogPost, BlogMeta } from '@/types/blog'
import { parseFrontmatter } from './frontmatter'

// Vite glob import for all markdown files in src/blog/post/
const mdModules = import.meta.glob('/src/blog/post/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function parseMarkdownFiles(): BlogPost[] {
  const posts: BlogPost[] = []

  for (const [path, raw] of Object.entries(mdModules)) {
    const slug = path.match(/\/([^/]+)\.md$/)?.[1] ?? ''
    const { data, content } = parseFrontmatter(raw)

    const meta: BlogMeta = {
      title: (data.title as string) ?? slug,
      published: (data.published as string) ?? (data.date as string) ?? '',
      description: (data.description as string) ?? '',
      image: (data.image as string) ?? '',
      tags: Array.isArray(data.tags) ? data.tags as string[] : [],
      category: (data.category as string) ?? '未分类',
      draft: (data.draft as boolean) ?? false,
    }

    posts.push({ slug, ...meta, content })
  }

  // Sort by published date descending
  posts.sort((a, b) => (a.published > b.published ? -1 : 1))
  return posts.filter((p) => !p.draft)
}

const allPosts = parseMarkdownFiles()

export function getAllPosts(): BlogPost[] {
  return allPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

export function getAllCategories(): string[] {
  const cats = new Set(allPosts.map((p) => p.category))
  return [...cats]
}

export function getAllTags(): string[] {
  const tags = new Set(allPosts.flatMap((p) => p.tags))
  return [...tags]
}

export function getPostsByCategory(category: string): BlogPost[] {
  return allPosts.filter((p) => p.category === category)
}

export function getPostsByTag(tag: string): BlogPost[] {
  return allPosts.filter((p) => p.tags.includes(tag))
}

export function searchPosts(query: string): BlogPost[] {
  const q = query.toLowerCase()
  return allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q),
  )
}

export interface ArchiveGroup {
  label: string
  year: number
  month: number
  posts: BlogPost[]
}

export interface YearArchiveGroup {
  year: number
  label: string
  posts: BlogPost[]
}

export function getArchives(category?: string | null): ArchiveGroup[] {
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts
  const map = new Map<string, ArchiveGroup>()

  for (const post of posts) {
    if (!post.published) continue
    const d = new Date(post.published)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const key = `${year}-${String(month).padStart(2, '0')}`
    const label = `${year}年${month}月`

    if (!map.has(key)) {
      map.set(key, { label, year, month, posts: [] })
    }
    map.get(key)!.posts.push(post)
  }

  return [...map.values()].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
}

export function getArchivesByYear(category?: string | null): YearArchiveGroup[] {
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts
  const map = new Map<number, YearArchiveGroup>()

  for (const post of posts) {
    if (!post.published) continue
    const year = new Date(post.published).getFullYear()

    if (!map.has(year)) {
      map.set(year, { year, label: `${year}`, posts: [] })
    }
    map.get(year)!.posts.push(post)
  }

  return [...map.values()].sort((a, b) => b.year - a.year)
}
