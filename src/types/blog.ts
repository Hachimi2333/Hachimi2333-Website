import type { TocHeading } from '../lib/blog/renderer'

/**
 * One post's metadata, compiled from `content/posts/<slug>.md` at build time.
 *
 * There is no `content` field on purpose: the Markdown body never reaches the
 * browser as source. `virtual:blog-content` carries the HTML that
 * `src/lib/blog/markdown.ts` produced during the build, and this type carries
 * everything the list, the sitemap and the page `<head>` need.
 */
export interface BlogPost {
  slug: string
  title: string
  published: string
  description: string
  /** `description` when set, otherwise the first usable line of the body. */
  excerpt: string
  image: string
  tags: string[]
  category: string
  /** Whole minutes, estimated from the Markdown source length. */
  readingTime: number
}

/** Rendered body of one post, keyed by slug in `virtual:blog-content`. */
export interface RenderedPost {
  html: string
  headings: TocHeading[]
}

/** Slug -> rendered body for every published post. */
export type RenderedPostMap = Record<string, RenderedPost>
