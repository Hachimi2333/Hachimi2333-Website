import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'

/**
 * Static site generation.
 *
 * `npm run build` chains two Vite builds:
 *
 *   1. `vite build --ssr src/entry-server.ts --outDir dist-ssr` — a Node bundle
 *   2. `vite build` — the client build, which writes `dist/`
 *
 * This plugin then runs in the *second* build's `closeBundle`, where
 * `config.build.outDir` is the client output directory and every asset already
 * exists:
 *
 * 1. import the SSR bundle written by step 1
 * 2. render each route in `listPages()` to an HTML string
 * 3. substitute the app markup, `<title>`, description, og tags and canonical
 *    link into the client's `index.html`
 * 4. write `dist/<route>.html` (and `dist/404.html`)
 * 5. delete `dist-ssr/`
 *
 * The SSR pass deliberately comes first. Running it second would make
 * `config.build.outDir` refer to `dist-ssr`, and driving an SSR build from
 * inside the client build's `closeBundle` would mean re-entrant builds sharing
 * plugin instances.
 */

const SSR_OUT_DIR = 'dist-ssr'
const SSR_ENTRY_STEM = 'entry-server'

interface PrerenderPage {
  url: string
  file: string
}

interface PageMeta {
  title: string
  description: string
  canonical: string
}

interface SsrBundle {
  render(url: string): Promise<string>
  listPages(): PrerenderPage[]
  resolvePageMeta(path: string): Promise<PageMeta>
  NOT_FOUND_PAGE: PrerenderPage
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

/**
 * Replace a pattern that must exist.
 *
 * `index.html` is the template for every page, so a pattern that stops matching
 * would silently leave twenty pages sharing the home page's title -- exactly the
 * class of failure this whole pipeline exists to avoid. Fail the build instead.
 */
function replaceOnce(html: string, pattern: RegExp, replacement: string, label: string): string {
  if (!pattern.test(html)) {
    throw new Error(
      `[prerender] index.html no longer matches ${label} (${pattern}). Update scripts/prerender.ts.`,
    )
  }
  return html.replace(pattern, replacement)
}

function injectPage(template: string, appHtml: string, meta: PageMeta): string {
  let html = replaceOnce(
    template,
    /<div id="app">\s*<\/div>/,
    `<div id="app">${appHtml}</div>`,
    'the #app container',
  )

  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`, '<title>')
  html = replaceOnce(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    'the description meta tag',
  )
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    'og:title',
  )
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    'og:description',
  )
  html = replaceOnce(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    'og:url',
  )
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    'the canonical link',
  )

  return html
}

function findSsrEntry(ssrDir: string): string {
  const entry = fs
    .readdirSync(ssrDir)
    .find((file) => file.startsWith(SSR_ENTRY_STEM) && /\.(js|mjs)$/.test(file))

  if (!entry) {
    throw new Error(`[prerender] no ${SSR_ENTRY_STEM}.{js,mjs} in ${ssrDir}`)
  }
  return path.join(ssrDir, entry)
}

export function prerenderPlugin(): Plugin {
  let root = ''
  let outDir = ''
  let isSsrBuild = false

  return {
    name: 'prerender',

    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
      isSsrBuild = Boolean(config.build.ssr)
    },

    async closeBundle() {
      // The SSR pass only produces the bundle this hook consumes; the client
      // pass is where `outDir` is `dist/` and the template exists.
      if (isSsrBuild) return

      const ssrDir = path.resolve(root, SSR_OUT_DIR)
      const distDir = path.resolve(root, outDir)

      if (!fs.existsSync(ssrDir)) {
        throw new Error(
          `[prerender] ${ssrDir}/ is missing. Run "vite build --ssr src/entry-server.ts --outDir ${SSR_OUT_DIR}" first.`,
        )
      }

      const templatePath = path.join(distDir, 'index.html')
      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `[prerender] ${templatePath} is missing. Run the SSR build before the client build.`,
        )
      }

      const bundle = (await import(pathToFileURL(findSsrEntry(ssrDir)).href)) as SsrBundle
      const template = fs.readFileSync(templatePath, 'utf-8')

      const pages = [...bundle.listPages(), bundle.NOT_FOUND_PAGE]

      for (const page of pages) {
        // Sequential on purpose: each render builds a fresh app and router, and
        // the highlighter and post index are cached after the first one.
        const appHtml = await bundle.render(page.url)
        const meta = await bundle.resolvePageMeta(page.url)

        const target = path.join(distDir, page.file)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, injectPage(template, appHtml, meta), 'utf-8')
      }

      fs.rmSync(ssrDir, { recursive: true, force: true })

      console.log(`  \u2139 [prerender] ${pages.length} pages written to ${outDir}/`)
    },
  }
}
