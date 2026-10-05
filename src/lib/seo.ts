import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getPostBySlug } from './blog'
import { POSTS_ROUTE } from './blog/paths'
import { tools } from './tools'

export const SITE_NAME = 'Hachimi2333'
export const SITE_DESCRIPTION = 'Hachimi2333 的个人网站 - 博客、工具和更多'

export interface PageMeta {
  title: string
  description: string
}

/**
 * Title and description for every routable page.
 *
 * Before prerendering existed this information was split between route
 * `meta.title` and a `document.title = ...` assignment inside the article view,
 * which meant the build could only ever write one `<title>` for all 20-odd
 * pages. Resolving it from the path instead gives the prerender step and the
 * client router the same answer, so a prerendered page and a client-side
 * navigation to it agree.
 */
const STATIC_META: Record<string, PageMeta> = {
  '/': { title: SITE_NAME, description: SITE_DESCRIPTION },
  '/posts': {
    title: `博客 - ${SITE_NAME}`,
    description: `Hachimi2333 的博客：建站、数码、游戏与日常的记录。`,
  },
  '/tools': {
    title: `工具 - ${SITE_NAME}`,
    description: `Hachimi2333 的在线工具：${tools.map((tool) => tool.name).join('、')}。`,
  },
  '/404': { title: `页面未找到 - ${SITE_NAME}`, description: SITE_DESCRIPTION },
}

for (const tool of tools) {
  STATIC_META[tool.route] = {
    title: `${tool.name} - ${SITE_NAME}`,
    description: tool.description,
  }
}

function normalisePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '/'
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) return withoutQuery.slice(0, -1)
  return withoutQuery || '/'
}

export function resolvePageMeta(path: string): PageMeta {
  const clean = normalisePath(path)

  if (clean.startsWith(`${POSTS_ROUTE}/`)) {
    const slug = decodeURIComponent(clean.slice(POSTS_ROUTE.length + 1))
    const post = getPostBySlug(slug)
    if (post) {
      return {
        title: `${post.title} - ${SITE_NAME}`,
        description: post.excerpt || post.description || SITE_DESCRIPTION,
      }
    }
  }

  return STATIC_META[clean] ?? STATIC_META['/404']
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
 * The values here duplicate what the prerender step bakes into the HTML; the
 * client only needs to correct them after a client-side navigation.
 */
export function applyPageMeta(meta: PageMeta): void {
  if (typeof document === 'undefined') return

  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
}
