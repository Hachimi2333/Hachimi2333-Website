import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
// Relative imports on purpose: this module is loaded by Vite's config loader,
// which runs before `resolve.alias` exists, so `@/…` would not resolve here.
import { parseFrontmatter, readBoolean, readDate } from '../src/lib/blog/frontmatter'
import { POSTS_DIR, postUrl } from '../src/lib/blog/paths'

/**
 * Site origin used for canonical sitemap URLs.
 *
 * Overridable so a preview/staging build does not emit production URLs:
 *   SITE_URL=https://staging.example.com npm run build
 */
const DEFAULT_SITE_URL = 'https://www.hachimi2333.top'

/** Static pages that always exist, with their crawl hints. */
const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/posts', priority: '0.9', changefreq: 'weekly' },
  { path: '/tools', priority: '0.7', changefreq: 'monthly' },
]

interface PostEntry {
  slug: string
  published: string
}

function collectPosts(postsDir: string): PostEntry[] {
  if (!fs.existsSync(postsDir)) return []

  const entries: PostEntry[] = []

  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith('.md')) continue
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const { data } = parseFrontmatter(raw)
    if (readBoolean(data, 'draft')) continue
    entries.push({ slug: file.replace(/\.md$/, ''), published: readDate(data) })
  }

  entries.sort((a, b) => {
    if (a.published !== b.published) return a.published < b.published ? 1 : -1
    return a.slug.localeCompare(b.slug)
  })

  return entries
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildSitemapXml(entries: PostEntry[], siteUrl: string): string {
  const today = new Date().toISOString().slice(0, 10)

  const url = (loc: string, lastmod: string, changefreq: string, priority: string) =>
    [
      '  <url>',
      `    <loc>${escapeXml(siteUrl + loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]

  for (const page of STATIC_PAGES) {
    lines.push(url(page.path, today, page.changefreq, page.priority))
  }

  for (const entry of entries) {
    lines.push(url(postUrl(entry.slug), entry.published || today, 'never', '0.6'))
  }

  lines.push('</urlset>', '')
  return lines.join('\n')
}

export function sitemapPlugin(): Plugin {
  let root = ''
  let outDir = ''

  return {
    name: 'sitemap-generator',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    closeBundle() {
      const siteUrl = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
      const entries = collectPosts(path.resolve(root, POSTS_DIR))
      const sitemap = buildSitemapXml(entries, siteUrl)

      const resolvedOutDir = path.resolve(root, outDir)
      fs.mkdirSync(resolvedOutDir, { recursive: true })
      fs.writeFileSync(path.join(resolvedOutDir, 'sitemap.xml'), sitemap, 'utf-8')

      console.log(
        `  \u2139 [sitemap] ${entries.length + STATIC_PAGES.length} URLs for ${siteUrl}`,
      )
    },
  }
}
