import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getPostBySlug } from './blog'
import { POSTS_ROUTE } from './blog/paths'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site'
import { tools } from './tools'

export interface PageMeta {
  title: string
  description: string
  /** Absolute `rel="canonical"` / `og:url` value. */
  canonical: string
}

/** Path without the query string, the hash, or a trailing slash. */
export function canonicalPath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '/'
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1)
  return withoutQuery || '/'
}

/** Absolute URL for a route path, e.g. `/posts/1` -> `https://…/posts/1`. */
export function canonicalUrl(path: string): string {
  const clean = canonicalPath(path)
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`
}

const NOT_FOUND_META: PageMeta = {
  title: `页面未找到 - ${SITE_NAME}`,
  // A 404 has no canonical URL of its own; pointing at the root avoids
  // advertising whatever the visitor typed as the address of the page.
  canonical: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
}

/**
 * Title, description and canonical URL for every routable page.
 *
 * Before prerendering existed this information was split between route
 * `meta.title` and a `document.title = ...` assignment inside the article view,
 * so the build could only ever write one `<title>` for all twenty-odd pages.
 * Resolving it from the path gives the prerender step and the client router the
 * same answer, so a prerendered page and a client-side navigation onto it agree.
 */
const STATIC_META: Record<string, PageMeta> = {
  '/': {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    canonical: `${SITE_URL}/`,
  },
  '/posts': {
    title: `博客 - ${SITE_NAME}`,
    description: 'Hachimi2333 的博客：建站、数码、游戏与日常的记录。',
    canonical: `${SITE_URL}/posts`,
  },
  '/tools': {
    title: `工具 - ${SITE_NAME}`,
    description: `Hachimi2333 的在线工具：${tools.map((tool) => tool.name).join('、')}。`,
    canonical: `${SITE_URL}/tools`,
  },
}

for (const tool of tools) {
  STATIC_META[tool.route] = {
    title: `${tool.name} - ${SITE_NAME}`,
    description: tool.description,
    canonical: `${SITE_URL}${tool.route}`,
  }
}

export function resolvePageMeta(path: string): PageMeta {
  const clean = canonicalPath(path)

  if (clean.startsWith(`${POSTS_ROUTE}/`)) {
    const post = getPostBySlug(decodeURIComponent(clean.slice(POSTS_ROUTE.length + 1)))
    if (post) {
      return {
        title: `${post.title} - ${SITE_NAME}`,
        description: post.excerpt || post.description || SITE_DESCRIPTION,
        canonical: `${SITE_URL}${clean}`,
      }
    }
  }

  return STATIC_META[clean] ?? NOT_FOUND_META
}

/** Convenience wrapper for the router guard. */
export function resolveRouteMeta(route: RouteLocationNormalizedLoaded): PageMeta {
  return resolvePageMeta(route.path)
}

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  const element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (element) element.content = content
}

/**
 * Write resolved metadata into the live document.
 *
 * These values duplicate what the prerender step bakes into the HTML; the client
 * only needs to correct them after a client-side navigation.
 */
export function applyPageMeta(meta: PageMeta): void {
  if (typeof document === 'undefined') return

  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', meta.canonical)

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) canonical.href = meta.canonical
}
