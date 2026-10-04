import type { BlogPost, BlogMeta } from '@/types/blog'
import {
  parseFrontmatter,
  readBoolean,
  readDate,
  readString,
  readStringArray,
} from './frontmatter'
import { POSTS_GLOB, slugFromPath } from './blog-paths'

// Eagerly inline every post as raw text; `?raw` keeps the frontmatter intact.
const mdModules = import.meta.glob(POSTS_GLOB, {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function parseMarkdownFiles(): BlogPost[] {
  const posts: BlogPost[] = []

  for (const [path, raw] of Object.entries(mdModules)) {
    const slug = slugFromPath(path)
    const { data, content } = parseFrontmatter(raw)

    const meta: BlogMeta = {
      title: readString(data, 'title', slug),
      published: readDate(data),
      description: readString(data, 'description'),
      image: readString(data, 'image'),
      tags: readStringArray(data, 'tags'),
      category: readString(data, 'category', '未分类'),
      draft: readBoolean(data, 'draft'),
    }

    posts.push({ slug, ...meta, content })
  }

  // Newest first. `published` is an ISO date string by now, so a lexicographic
  // compare is chronologically correct. Falling back to the slug keeps the
  // order stable for posts that share a date (or have none).
  posts.sort((a, b) => {
    if (a.published !== b.published) return a.published < b.published ? 1 : -1
    return a.slug.localeCompare(b.slug)
  })

  return posts.filter((post) => !post.draft)
}

const allPosts = parseMarkdownFiles()

export function getAllPosts(): BlogPost[] {
  return allPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((post) => post.slug === slug)
}

export function getAllCategories(): string[] {
  return [...new Set(allPosts.map((post) => post.category))]
}

export function getAllTags(): string[] {
  return [...new Set(allPosts.flatMap((post) => post.tags))]
}

export function getPostsByCategory(category: string): BlogPost[] {
  return allPosts.filter((post) => post.category === category)
}

export function getPostsByTag(tag: string): BlogPost[] {
  return allPosts.filter((post) => post.tags.includes(tag))
}

export function searchPosts(query: string): BlogPost[] {
  const q = query.trim().toLowerCase()
  if (!q) return allPosts
  return allPosts.filter((post) =>
    [post.title, post.description, post.category, ...post.tags]
      .some((field) => field.toLowerCase().includes(q)),
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

function selectPosts(category?: string | null): BlogPost[] {
  if (!category) return allPosts
  return allPosts.filter((post) => post.category === category)
}

export function getArchives(category?: string | null): ArchiveGroup[] {
  const map = new Map<string, ArchiveGroup>()

  for (const post of selectPosts(category)) {
    if (!post.published) continue
    const date = new Date(post.published)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const key = `${year}-${String(month).padStart(2, '0')}`

    let group = map.get(key)
    if (!group) {
      group = { label: `${year}年${month}月`, year, month, posts: [] }
      map.set(key, group)
    }
    group.posts.push(post)
  }

  return [...map.values()].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  )
}

export function getArchivesByYear(category?: string | null): YearArchiveGroup[] {
  const map = new Map<number, YearArchiveGroup>()

  for (const post of selectPosts(category)) {
    if (!post.published) continue
    const year = new Date(post.published).getUTCFullYear()

    let group = map.get(year)
    if (!group) {
      group = { year, label: `${year}`, posts: [] }
      map.set(year, group)
    }
    group.posts.push(post)
  }

  return [...map.values()].sort((a, b) => b.year - a.year)
}
