import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'
import { sitemapPlugin } from './src/lib/sitemap'

// 获取 Git commit 信息
const commitHash = execSync('git rev-parse --short=7 HEAD').toString().trim()
const commitHashFull = execSync('git rev-parse HEAD').toString().trim()
const commitSubject = execSync('git log -1 --pretty=%s').toString().trim()
const commitBody = execSync('git log -1 --pretty=%b').toString().trim()

// 获取 commit 的增删行数和修改文件数
const commitStat = execSync('git diff --shortstat HEAD~1 HEAD').toString().trim()
const insertions = commitStat.match(/(\d+) insertion/)?.[1] || '0'
const deletions = commitStat.match(/(\d+) deletion/)?.[1] || '0'
const filesChanged = commitStat.match(/(\d+) file/)?.[1] || '0'

export default defineConfig({
  plugins: [vue(), tailwindcss(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __COMMIT_HASH_FULL__: JSON.stringify(commitHashFull),
    __COMMIT_SUBJECT__: JSON.stringify(commitSubject),
    __COMMIT_BODY__: JSON.stringify(commitBody),

    __COMMIT_INSERTIONS__: JSON.stringify(insertions),
    __COMMIT_DELETIONS__: JSON.stringify(deletions),
    __FILES_CHANGED__: JSON.stringify(filesChanged),
  },
})
