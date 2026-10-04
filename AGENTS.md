# Hachimi2333-Website

个人网站 — Vue 3 + shadcn-vue + Tailwind CSS 4，纯静态，部署在 Cloudflare Workers（Static Assets）。
无后端、无数据库、无认证。

## 技术栈

- Vue 3.5+（Composition API，`<script setup lang="ts">`）
- TypeScript（strict）
- Vite 8
- Tailwind CSS 4 + tw-animate-css
- shadcn-vue，预设 `reka-nova`（基于 reka-ui）
- vue-router 4（history 模式，懒加载）
- marked + Shiki（细粒度打包、双主题）+ js-yaml
- @lucide/vue
- @vueuse/core

## 项目结构

```
├── content/posts/            # Markdown 博客文章，文件名即 slug
├── build/sitemap.ts          # 构建期 sitemap 插件（仅 Node）
├── public/                   # _headers / robots.txt / avatar / tools
├── src/
│   ├── components/
│   │   ├── blog/             # ArticleToc
│   │   ├── icons/            # 品牌图标（GithubMark）
│   │   ├── layout/           # AppLayout, AppHeader, AppFooter, BackToTop,
│   │   │                     # BeianInfo, GitCommitPopover, PageBreadcrumb,
│   │   │                     # SquareRain
│   │   └── ui/               # shadcn-vue 组件（目录 + index.ts barrel）
│   ├── composables/          # useTheme, useGitInfo
│   ├── lib/                  # blog, blog-paths, frontmatter, markdown,
│   │                         # renderer, date, iconify, utils
│   ├── router/
│   ├── tools/                # 工具页 + manifest + components/ToolLayout
│   ├── types/                # blog.ts
│   ├── views/                # HomeView, ToolsView, NotFoundView, blog/
│   ├── App.vue, main.ts, style.css, env.d.ts
├── wrangler.jsonc
└── package.json
```

## 命令

```bash
npm run dev        # 开发服务器
npm run typecheck  # vue-tsc 类型检查
npm run build      # 类型检查 + Vite 构建
npm run preview    # 预览 dist/
npm run deploy     # build + wrangler deploy
npm run cf:dev     # build + wrangler dev（Workers 运行时）
```

## 开发规范

### 组件
- 一律 `<script setup lang="ts">`
- shadcn-vue 组件放 `components/ui/`，用 `index.ts` barrel 导出
- **只用 CLI 增删 shadcn-vue 组件**：`npx shadcn-vue@latest add <name>`；
  更新已有组件前先 `--dry-run` 看差异，不要手工从 GitHub 拷文件
- 视图放 `views/`，建议 <200 行；超了就抽子组件

### 样式
- 只用语义化 token（`bg-background`、`text-muted-foreground`），不要 `dark:` 颜色覆盖
- 纵向排列用 `flex flex-col gap-*`，**禁止 `space-y-*`**
- 宽高相等用 `size-*`，不要 `w-4 h-4`
- 条件 class 用 `cn()`（`@/lib/utils`）
- 主题色是 oklch CSS 变量，定义在 `src/style.css`；暗色靠 `.dark` class
- 图标从 `@lucide/vue` 导入；在 `Button` 里用 `data-icon="inline-start|inline-end"`，
  不要给图标加 `size-*`
- 徽章用 `Badge`，加载占位用 `Skeleton`，分隔用 `Separator`，不要手搓

### 状态
- composable + module-level ref 实现 singleton，不用 Pinia/Vuex
- 主题用 `useTheme()`；`dark` class 由 `index.html` 内联脚本在首帧前设置，
  `useTheme` 只读写，不要在 `onMounted` 里重新初始化（会闪主题）

### 博客
- Markdown 放 `content/posts/`，文件名即 slug，URL 是 `/posts/<slug>`
- Frontmatter：title, published, description, image, tags, category, draft
- `published` 可能是 YAML `Date`，统一用 `@/lib/frontmatter` 的 `readDate()` 归一化
- 渲染入口是 `renderMarkdown()`，返回 `{ html, headings }`；渲染状态全部在
  `BlogRenderer` 实例上，不要往模块级塞状态
- 新增代码块语言改 `src/lib/markdown.ts` 的 `LANGUAGE_IMPORTS`；
  不要用 `import('shiki')` 全量打包

### 构建期代码
- 仅 Node 的代码放 `build/`，不要放 `src/`
- `build/` 被 Vite config loader 加载，`@/` 别名不可用，须用相对路径导入 `src/lib/`

## 部署

Cloudflare Workers + Static Assets，配置在 `wrangler.jsonc`：
`assets.directory = ./dist`，`not_found_handling = single-page-application`（SPA 回退）。
没有 Worker 脚本。`public/_headers` 会被复制到 `dist/` 并提供缓存与安全响应头。

**www → 非 www 跳转无法写在 `_redirects` 里**（Cloudflare 不支持域名级跳转），
需要在控制台的 Redirect Rules 里单独配置。详见 README。
