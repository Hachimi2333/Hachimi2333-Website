import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from './frontmatter'

const BASE_URL = 'https://www.hachimi2333.top'

interface PostEntry {
  slug: string
  published: string
}

function collectPosts(postsDir: string): PostEntry[] {
  if (!fs.existsSync(postsDir)) return []

  const entries: PostEntry[] = []
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))

  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const fm = parseFrontmatter(raw).data
    if (fm.draft) continue
    entries.push({
      slug: file.replace(/\.md$/, ''),
      published: (fm.published as string) ?? (fm.date as string) ?? '',
    })
  }
  entries.sort((a, b) => (a.published > b.published ? -1 : 1))
  return entries
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildSitemapXML(entries: PostEntry[]): string {
  const today = new Date().toISOString().slice(0, 10)

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  const pages: { loc: string; priority: string; changefreq: string }[] = [
    { loc: '/', priority: '1.0', changefreq: 'monthly' },
    { loc: '/posts', priority: '0.9', changefreq: 'weekly' },
    { loc: '/tools', priority: '0.7', changefreq: 'monthly' },
  ]

  for (const p of pages) {
    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(BASE_URL)}${escapeXml(p.loc)}</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`
    xml += `    <priority>${p.priority}</priority>\n`
    xml += '  </url>\n'
  }

  for (const entry of entries) {
    const lastmod = entry.published || today
    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(BASE_URL)}/posts/${escapeXml(entry.slug)}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += '    <changefreq>never</changefreq>\n'
    xml += '    <priority>0.6</priority>\n'
    xml += '  </url>\n'
  }

  xml += '</urlset>\n'
  return xml
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
      const postsDir = path.resolve(root, 'src/blog/post')
      const entries = collectPosts(postsDir)
      const sitemap = buildSitemapXML(entries)

      const resolvedOutDir = path.resolve(root, outDir)
      if (!fs.existsSync(resolvedOutDir)) {
        fs.mkdirSync(resolvedOutDir, { recursive: true })
      }
      fs.writeFileSync(path.join(resolvedOutDir, 'sitemap.xml'), sitemap, 'utf-8')

      const count = entries.length + 3
      console.log(`  ℹ [sitemap] Generated sitemap.xml with ${count} URLs`)
    },
  }
}
