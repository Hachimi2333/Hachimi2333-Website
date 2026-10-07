import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { sitemapPlugin } from './scripts/sitemap'
import { blogPlugin } from './scripts/blog-plugin'
import { prerenderPlugin } from './scripts/prerender'

const GITHUB_REPO = 'https://github.com/Hachimi2333/Hachimi2333-Website'

/**
 * Canonical origin for absolute URLs.
 *
 * Overridable so a preview build does not advertise production URLs:
 *   SITE_URL=https://staging.example.com npm run build
 *
 * Resolved here, once, and handed to both `define` (so the client can build
 * `rel="canonical"`) and the sitemap plugin (so the two can never disagree).
 */
const siteUrl = (process.env.SITE_URL || 'https://www.hachimi2333.top').replace(/\/+$/, '')

/**
 * Run a git command and return its trimmed stdout.
 *
 * Builds must not depend on git being present or on the history being complete:
 * a shallow CI clone (depth 1) has no `HEAD~1`, and a source tarball has no
 * repository at all. Every failure degrades to an empty string so the build
 * still succeeds — the commit popover simply shows a fallback.
 */
function git(args: string[]): string {
  try {
    return execFileSync('git', args, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const commitHash = git(['rev-parse', '--short=7', 'HEAD']) || 'dev'
const commitHashFull = git(['rev-parse', 'HEAD'])
const commitSubject = git(['log', '-1', '--pretty=%s'])
const commitBody = git(['log', '-1', '--pretty=%b'])

/**
 * One instant, shared by every build-time timestamp below.
 *
 * Reading the clock once keeps `__BUILD_YEAR__`, `__BUILD_TIME__` and
 * `__BUILD_TIMESTAMP__` describing the same build even if the process crosses a
 * minute (or a year) boundary halfway through -- inconsistent metadata is worse
 * than metadata that is off by a second.
 */
const buildTime = new Date()

/**
 * `YYYY-MM-DD HH:mm UTC+8` -- the build instant rendered in Beijing time.
 *
 * Anchored to a fixed UTC+8 offset rather than the build host's local timezone,
 * so a build run on a non-Beijing machine (CI in another region) still reports
 * the wall-clock the visitor expects. `toLocaleString` is avoided: its output
 * depends on the ICU data built into the running Node, and every formatting
 * option is a timezone conversion waiting to be wrong. The parts are read
 * directly from a timestamp shifted into UTC+8, and the offset is shown so the
 * reader knows which clock the numbers describe.
 */
function formatBuildTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000)

  return (
    `${beijing.getUTCFullYear()}-${pad(beijing.getUTCMonth() + 1)}-${pad(beijing.getUTCDate())} ` +
    `${pad(beijing.getUTCHours())}:${pad(beijing.getUTCMinutes())} UTC+8`
  )
}

const rootPackageJson = path.join(fileURLToPath(new URL('.', import.meta.url)), 'package.json')

/**
 * The site's own version, read from the manifest rather than restated here.
 *
 * A constant next to `define` would drift the first time `npm version` ran.
 */
function readPackageVersion(): string {
  try {
    return String(JSON.parse(fs.readFileSync(rootPackageJson, 'utf-8')).version ?? '')
  } catch {
    return ''
  }
}

export default defineConfig(({ command }) => ({
  plugins: [vue(), tailwindcss(), blogPlugin(), sitemapPlugin({ siteUrl }), prerenderPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Pin the Vue runtime and vue-router into a single chunk.
        //
        // Left to the default splitting, vue-router landed in its own chunk
        // (`index-*.js`) separate from the Vue runtime
        // (`_plugin-vue_export-helper-*.js`). Re-exporting `inject` across that
        // boundary went wrong: `useRoute()` and `useRouter()` both collapsed to
        // a bare `inject()` call with no key, so they returned `undefined` in
        // every component rendered by `<RouterView>` -- the post list crashed
        // reading `route.query`, while `AppHeader` (outside `<RouterView>`)
        // worked because it never crossed the boundary.
        manualChunks(id: string) {
          return /[\\/]node_modules[\\/](vue|vue-router|@vue)[\\/]/.test(id) ? 'vue' : undefined
        },
      },
    },
  },
  define: {
    // `vite build` always emits prerendered HTML, so the client always hydrates;
    // `vite dev` serves an empty `<div id="app">`, so it must not. Deriving this
    // from `command` rather than `import.meta.env.DEV` also means
    // `vite build --mode development` still hydrates, which is what makes it
    // possible to run the prerendered output against Vue's *dev* hydration
    // warnings.
    __HYDRATE__: JSON.stringify(command === 'build'),
    __SITE_URL__: JSON.stringify(siteUrl),
    __BUILD_YEAR__: String(buildTime.getFullYear()),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __COMMIT_HASH_FULL__: JSON.stringify(commitHashFull),
    __COMMIT_SUBJECT__: JSON.stringify(commitSubject),
    __COMMIT_BODY__: JSON.stringify(commitBody),
    __GITHUB_REPO__: JSON.stringify(GITHUB_REPO),
    __PKG_VERSION__: JSON.stringify(readPackageVersion()),
    __BUILD_TIME__: JSON.stringify(formatBuildTime(buildTime)),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTime.getTime()),
    __BUILD_PLATFORM__: JSON.stringify(process.platform),
    __BUILD_ARCH__: JSON.stringify(process.arch),
    __BUILD_NODE_VERSION__: JSON.stringify(process.version),
  },
}))
