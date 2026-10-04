# Hachimi2333-Website

个人网站 — Vue 3 + shadcn-vue + Tailwind CSS 4，纯静态，部署在 Cloudflare Workers（Static Assets）。
无后端、无数据库、无认证。

本文件是**开发约束**：目录位置、代码规范、协作流程，以及一组「失败时不报错」的坑。
写代码前先扫一眼第 5、7、8 节。

## 1. 技术栈

- Vue 3.5+（Composition API，`<script setup lang="ts">`）
- TypeScript 6（strict，`noUnusedLocals` / `noUnusedParameters` 开启）
- Vite 8（Node `^20.19.0 || >=22.12.0`）
- Tailwind CSS 4 + tw-animate-css
- shadcn-vue，预设 `reka-nova`（基于 reka-ui）
- vue-router 4（history 模式，懒加载）
- marked 18 + Shiki 4（细粒度打包、双主题）+ js-yaml 4
- @lucide/vue、@vueuse/core

## 2. 命令

```bash
npm run dev        # 开发服务器
npm run typecheck  # vue-tsc -b（仅类型检查）
npm run build      # typecheck + Vite 构建到 dist/
npm run preview    # 本地预览 dist/
npm run deploy     # build + wrangler deploy
npm run cf:dev     # build + wrangler dev（Workers 运行时）
```

## 3. 项目结构

```
├── content/posts/            # Markdown 博客文章，文件名即 slug
├── scripts/sitemap.ts        # 构建期 sitemap 插件（仅 Node）
├── public/                   # _headers / robots.txt / avatar / favicon 等
├── src/
│   ├── components/
│   │   ├── blog/             # ArticleToc
│   │   ├── common/           # 手写的非 registry 组件（ColorPicker, ImageLightbox）
│   │   ├── icons/            # 品牌图标（GithubMark，Lucide 已移除品牌图标）
│   │   ├── layout/           # AppLayout, AppHeader, AppFooter, BackToTop,
│   │   │                     # BeianInfo, GitCommitPopover, PageBreadcrumb, SquareRain
│   │   ├── tools/            # ToolLayout
│   │   └── ui/               # shadcn-vue 组件，只由 CLI 管理
│   ├── composables/          # useTheme, useGitInfo
│   ├── lib/
│   │   ├── blog/             # index, paths, frontmatter, markdown, renderer
│   │   ├── date.ts, iconify.ts, tools.ts, utils.ts
│   ├── router/
│   ├── types/                # 共享类型
│   ├── views/                # HomeView, ToolsView, NotFoundView, blog/, tools/
│   ├── App.vue, main.ts, style.css, env.d.ts
├── index.html                # 含首帧前设置 .dark 的内联脚本
├── components.json           # shadcn-vue 配置（别名来源）
├── wrangler.jsonc
└── vite.config.ts
```

## 4. 位置规则（硬性）

- **`src/components/ui/` 只放 shadcn-vue CLI 产物**。手写组件一律放 `src/components/common/`（扁平文件 + 默认导入，不用 barrel）。
- **`src/lib/utils.ts` 的位置不可变**：`components.json` 的 `"utils": "@/lib/utils"` 直接指向它，挪走 CLI 就找不到 `cn()`。
- **根 `tsconfig.json` 的 `baseUrl` + `paths` 不可删**：shadcn-vue CLI 靠它解析 `@/` 别名（`preflights/preflight-init.ts` 在缺失时报 `No import alias found in your tsconfig.json file.`）。`tsconfig.app.json` 里那份是重复但必需的。
- **只跑在 Node 的代码放 `scripts/`**，不要放 `src/`——`src/` 会被打进前端包，而这类代码依赖 `node:fs`。
- `scripts/` 由 Vite config loader 加载，**`@/` 别名尚未生效**，必须用相对路径导入 `src/lib/`。
- 路由视图一律放 `src/views/`（含 `views/blog/`、`views/tools/`）；`src/lib/` 只放无副作用的模块。

## 5. 代码规范

### 组件
- 一律 `<script setup lang="ts">`
- **只用 CLI 增删 shadcn-vue 组件**：
  ```bash
  npx shadcn-vue@latest add <name>
  npx shadcn-vue@latest add <name> --dry-run   # 更新已有组件前先看差异
  npx shadcn-vue@latest info                   # 查看当前预设与别名解析结果
  ```
  不要手工从 GitHub 拷文件，也不要手工改 `components/ui/` 里的实现（下次 CLI 更新会被覆盖或产生冲突）。
- 视图建议 <200 行，超了抽子组件

### 样式
- 只用语义化 token（`bg-background`、`text-muted-foreground`），**不写 `dark:` 颜色覆盖**
- 纵向排列用 `flex flex-col gap-*`，**禁止 `space-y-*`**
- 宽高相等用 `size-*`，不要 `w-4 h-4`
- 条件 class 用 `cn()`（`@/lib/utils`）
- 主题色是 oklch CSS 变量，定义在 `src/style.css`；暗色靠 `.dark` class
- 图标从 `@lucide/vue` 导入；放进 `Button` 时用 `data-icon="inline-start|inline-end"`，
  且**不要加 `size-*`**（组件自己控制尺寸）
- 徽章用 `Badge`，加载占位用 `Skeleton`，分隔用 `Separator`，不要手搓
- 覆盖层组件（Dialog/Popover 等）不要手写 `z-index`

### 状态
- composable + module-level ref 实现 singleton，不用 Pinia/Vuex
- 主题用 `useTheme()`；`dark` class 由 `index.html` 内联脚本在首帧前设置，
  `useTheme` 只读写，**不要**在 `onMounted` 里重新初始化（会闪主题）

### 博客与渲染
- Markdown 放 `content/posts/`，文件名即 slug，URL 是 `/posts/<slug>`
- Frontmatter：title, published, description, image, tags, category, draft
- `published` 可能是 YAML `Date`，统一用 `@/lib/blog/frontmatter` 的 `readDate()` 归一化
- `renderMarkdown()` 返回 `{ html, headings }`，调用方不要碰 marked 的全局状态
- 渲染状态（标题锚点、目录、代码块元数据）全部在 `createBlogRenderer()` 的闭包里，
  **不要往模块级塞状态**——并发渲染会互相污染
- 新增代码块语言改 `src/lib/blog/markdown.ts` 的 `LANGUAGE_IMPORTS`；
  **不要用 `import('shiki')` 全量打包**
- 日期显示统一走 `@/lib/date`，不要在视图里用 `toLocaleDateString`

## 6. 硬性禁止

| 禁止 | 原因 |
|---|---|
| 手工改 `src/components/ui/**` | 由 CLI 拥有 |
| `space-y-*` | 项目统一用 `flex + gap-*` |
| `dark:` 颜色覆盖 | 只用语义化 token |
| 给 `Button` 内图标加 `size-*` | 组件已处理 |
| 模块级渲染状态 | 并发渲染互相污染 |
| `import('shiki')` 全量打包 | 曾产出 324 文件 / 9.7 MB |
| 在 `import.meta.glob` 里用变量 | 见 8.1，生产构建会静默打 0 篇 |
| 改动 `public/` 文件却不检查 `public/_headers` | 缓存头会失配 |

## 7. 协作流程

### 提交信息
`<type>(<scope>): <imperative English summary>`，单行不超过约 72 字符。

- `type`：`feat` / `fix` / `refactor` / `docs` / `chore` / `style` / `perf` / `build` / `test`
- `scope` 可选，用目录或领域名：`blog`、`tools`、`build`、`ui`
- 摘要用英文祈使句（`add`，不是 `added`）
- 例：`fix(blog): inline the import.meta.glob literal so posts actually bundle`

### 提交前必须双绿
```bash
npm run typecheck && npm run build
```
`build` 里已经包含 `typecheck`，但类型错误和构建产物的**静默**问题（见第 8 节）是两回事，两个都要看。

博客相关改动额外确认：`dist/` 产物里能看到**全部**文章标题（而不是 0 篇）。

### 不要自动 push
**未经用户明确确认，不得 `git push`。** 改动先落在本地分支、验证通过、报告结果，等指示。

### 变更 `components/ui/` 前
先 `npx shadcn-vue@latest info` 确认别名仍解析正确；切换预设前先问用户要 overwrite、merge 还是 skip。

## 8. 已知坑（失败时不报错，重点看）

1. **`import.meta.glob` 的匹配串必须是调用处的字面量。** 用 `const` 或模板字符串会触发
   `Could only use literals`：`vite dev` 抛 500，而 **`vite build` 退出码 0 却静默内联 0 篇文章**
   （博客空白，但直接读目录的 sitemap 仍列出全部文章）。`src/lib/blog/index.ts` 里加了两道守卫，
   但守卫只能在构建期兜住漂移，不能帮你绕过这条限制。
2. **marked 的 `Renderer` 不能用类实例。** marked 用 `for...in` 合并 renderer 对象，类实例的字段会被
   当成 renderer 方法名，报 `renderer '<key>' does not exist`。必须传**普通对象**——
   `createBlogRenderer()` 就是为此把状态放进闭包的。
3. **`String.replace` 只替换第一处。** 高亮代码块若用 replace 定位，两个内容完全相同的代码块会漏掉一个。
   现在按精确 offset 重建 HTML。
4. **Shiki 双主题靠 CSS 变量。** 输出是 `--shiki-light` / `--shiki-dark`，切主题是纯 CSS，不重渲染。
   注意高亮块上没有 `language-*` class（只有未高亮的兜底路径才有），断言时别写错。
5. **无引号的 YAML 日期会变成 `Date` 对象。** `published: 2026-09-11` 经 js-yaml 就是 `Date`，
   曾让 sitemap 的 `<lastmod>` 输出 `Mon Jun 29 2026 ... (中国标准时间)`。统一走 `readDate()`。
6. **日期不要做时区转换。** ISO 日期解析成 `Date` 是 UTC 零点，用本地时区格式化会让 UTC 以西的访客
   看到前一天。`src/lib/date.ts` 直接读日期分段。
7. **`.dark` 必须在首帧前设置。** 放在 `onMounted` 会让暗色访客闪一帧白屏，所以它在 `index.html`
   的内联脚本里，与 `useTheme` 的逻辑必须保持同步。
8. **构建不依赖 git 完整历史。** `vite.config.ts` 的 `git()` 失败时返回空串，页脚降级显示 `dev`；
   浅克隆（`depth 1`）没有 `HEAD~1`，不要假设 git 一定可用。

## 9. 部署

Cloudflare Workers + Static Assets，配置在 `wrangler.jsonc`：
`assets.directory = ./dist`，`not_found_handling = single-page-application`（SPA 回退）。
没有 Worker 脚本。`public/_headers` 会被复制到 `dist/` 并提供缓存与安全响应头。

**跳转方向：`hachimi2333.top` → `www.hachimi2333.top`（apex → www，`www` 是 canonical）。**
`_redirects` **不支持域名级跳转**（官方支持矩阵里明确标 ❌），所以这条规则不能写进仓库，
必须在控制台 **Rules → Overview → Create rule → Redirect Rule** 里配：
`https://hachimi2333.top/*` → `https://www.hachimi2333.top/${1}`，status `301`，勾选保留 query string。

凡是与 canonical host 相关的常量都必须指向 `www.hachimi2333.top`，**改方向时这几处要一起改**：

| 位置 | 内容 |
|---|---|
| `index.html` | `rel="canonical"` 与 `og:url` |
| `scripts/sitemap.ts` | `SITE_URL` 默认值 |
| `public/robots.txt` | `Sitemap:` 行 |
| `src/components/layout/AppFooter.vue` | 页脚的自我链接 |
| `content/posts/*.md` | 封面图与正文链接走 `static.hachimi2333.top`（内容，非配置） |

构建期站点源用 `SITE_URL` 覆盖（默认 `https://www.hachimi2333.top`），影响 `sitemap.xml` 的绝对 URL。
