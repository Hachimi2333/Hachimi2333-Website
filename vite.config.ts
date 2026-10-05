import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { sitemapPlugin } from './scripts/sitemap'
import { blogPlugin } from './scripts/blog-plugin'

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

// Additions/deletions/file count for the current HEAD commit.
const commitStat = git(['diff', '--shortstat', 'HEAD~1', 'HEAD'])
const insertions = commitStat.match(/(\d+) insertion/)?.[1] ?? '0'
const deletions = commitStat.match(/(\d+) deletion/)?.[1] ?? '0'
const filesChanged = commitStat.match(/(\d+) file/)?.[1] ?? '0'

export default defineConfig({
  plugins: [vue(), tailwindcss(), blogPlugin(), sitemapPlugin({ siteUrl })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
    __BUILD_YEAR__: String(new Date().getFullYear()),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __COMMIT_HASH_FULL__: JSON.stringify(commitHashFull),
    __COMMIT_SUBJECT__: JSON.stringify(commitSubject),
    __COMMIT_BODY__: JSON.stringify(commitBody),
    __COMMIT_INSERTIONS__: JSON.stringify(insertions),
    __COMMIT_DELETIONS__: JSON.stringify(deletions),
    __FILES_CHANGED__: JSON.stringify(filesChanged),
    __GITHUB_REPO__: JSON.stringify(GITHUB_REPO),
  },
})
