# Hachimi2333-Website

个人网站 — Vue 3 + shadcn-vue + Tailwind CSS 4，纯静态，**每个路由都预渲染成独立 HTML**，部署在 Cloudflare Workers（Static Assets）。
无后端、无数据库、无认证。

本文件是**开发约束**：目录位置、代码规范、协作流程，以及一组「失败时不报错」的坑。
写代码前先扫一眼第 5、6、8 节。

## 1. 技术栈

- Vue 3.5+（Composition API，`<script setup lang="ts">`）
- TypeScript 6（strict，`noUnusedLocals` / `noUnusedParameters` 开启）
- Vite 8（Node `^20.19.0 || >=22.12.0`），**客户端构建 + SSR 构建两趟**
- @vue/server-renderer 3.5（预渲染用 `renderToString`）
- Tailwind CSS 4 + tw-animate-css
- shadcn-vue，预设 `reka-nova`（基于 reka-ui）
- vue-router 4（浏览器 history 模式，预渲染时 memory history）
- marked 18 + Shiki 4（**仅构建期**）+ js-yaml 4（仅构建期）
- @lucide/vue、@vueuse/core

## 2. 命令

```bash
npm run dev        # 开发服务器（纯 SPA，不预渲染、不 hydrate）
npm run typecheck  # vue-tsc -b（仅类型检查）
npm run build      # typecheck + SSR 构建 + 客户端构建 + 预渲染
npm run preview    # 本地预览 dist/（会解析 <path>.html）
npm run deploy     # build + wrangler deploy
npm run cf:dev     # build + wrangler dev（Workers 运行时）
```

`npm run build` 的三段（顺序不可换）：

```
vue-tsc -b
vite build --ssr src/entry-server.ts --outDir dist-ssr
vite build                      # closeBundle 里跑 scripts/prerender.ts
```

判断构建成功的标志是最后两行同时出现：

```
  ℹ [sitemap] 17 URLs for https://www.hachimi2333.top
  ℹ [prerender] 20 pages written to dist/
```

页数 = 3 个静态页 + 工具页 + 已发布文章数 + 1 个 `404.html`。加了文章而页数没涨，就是预渲染坏了。

## 3. 项目结构

```
├── content/posts/            # Markdown 博客文章，文件名即 slug
├── scripts/                  # 只在 Node 里跑，绝不进前端包
│   ├── blog-plugin.ts        # 把文章编译成 virtual:blog-* 虚拟模块
│   ├── prerender.ts          # 把每个路由渲染成 dist/<route>.html
│   └── sitemap.ts            # 构建期 sitemap 插件
├── public/                   # _headers / robots.txt / avatar / favicon
├── src/
│   ├── components/
│   │   ├── blog/             # ArticleToc
│   │   ├── common/           # 手写组件：ClientOnly, ColorPicker, ImageLightbox
│   │   ├── icons/            # 品牌图标（GithubMark，Lucide 已移除品牌图标）
│   │   ├── layout/           # AppLayout, AppHeader, AppFooter, BackToTop,
│   │   │                     # BeianInfo, SystemInfoPopover, PageContainer, PageHeader
│   │   ├── tools/            # ToolLayout
│   │   └── ui/               # shadcn-vue 组件，只由 CLI 管理
│   ├── composables/          # useTheme, useSystemInfo
│   ├── lib/
│   │   ├── blog/             # index(查询), content(HTML), paths, frontmatter, markdown, renderer
│   │   ├── date.ts, build.ts, iconify.ts, network.ts, seo.ts, site.ts, tools.ts, utils.ts
│   ├── router/
│   ├── types/                # 共享类型
│   ├── views/                # HomeView, ToolsView, NotFoundView, blog/, tools/
│   ├── app.ts                # createSiteApp()：两个 entry 共用
│   ├── entry-client.ts       # 浏览器挂载 / hydrate
│   ├── entry-server.ts       # renderToString + 路由清单
│   ├── App.vue, style.css, env.d.ts
├── index.html                # 预渲染模板 + 首帧前设置 .dark 的内联脚本
├── components.json           # shadcn-vue 配置（别名来源）
├── wrangler.jsonc
└── vite.config.ts
```

## 4. 位置规则（硬性）

- **`src/components/ui/` 只放 shadcn-vue CLI 产物**。手写组件一律放 `src/components/common/`（扁平文件 + 默认导入，不用 barrel）。
  CLI **没有 `remove` 命令**；确认某个 ui 组件不再被引用后，手工 `git rm -r` 整个目录。
- **`src/lib/utils.ts` 的位置不可变**：`components.json` 的 `"utils": "@/lib/utils"` 直接指向它，挪走 CLI 就找不到 `cn()`。
- **根 `tsconfig.json` 的 `baseUrl` + `paths` 不可删**：shadcn-vue CLI 靠它解析 `@/` 别名（`preflights/preflight-init.ts` 在缺失时报 `No import alias found in your tsconfig.json file.`）。`tsconfig.app.json` 里那份是重复但必需的。
- **只跑在 Node 的代码放 `scripts/`**，不要放 `src/`。`src/lib/blog/markdown.ts` 是例外：它本身不依赖 `node:`，但**只能被 `scripts/` 引用**，前端任何地方都不要 import 它。
- `scripts/` 由 Vite config loader 加载，**`@/` 别名尚未生效**，必须用相对路径导入 `src/`。
- 路由视图一律放 `src/views/`（含 `views/blog/`、`views/tools/`）；`src/lib/` 只放无副作用的模块。
- **页面元数据只有一处来源：`src/lib/seo.ts`**。不要在路由 `meta` 或视图里再写一遍标题。
- **`src/lib/blog/index.ts` 只能导入 `virtual:blog-posts`，`src/lib/blog/content.ts` 只能导入 `virtual:blog-content`**。两个虚拟模块分开就是为了让文章列表的 chunk 不含正文 HTML。
- `@vue/server-renderer` 必须留在 `devDependencies`：SSR bundle 直接 import 它。

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
  注意 CLI 会顺手改 `package.json` / `package-lock.json`（曾把 `@lucide/vue` 提了一个 minor），并可能往 `src/style.css` 顶部塞 Google Fonts 的 `@import`——提交前用 `git diff` 检查并撤掉。
- 视图建议 <200 行，超了抽子组件
- 页面骨架统一用 `PageContainer` + `PageHeader`，不要各写各的 `container max-w-* px-* py-*`

### 预渲染（最容易踩的一节）
- **会被预渲染的组件里不要写 `<Teleport>`**。SSR 不会把 teleport 内容写进目标元素，只会留下 `<!--teleport start/end-->` 占位，客户端要重新造锚点再 hydrate。`ArticleToc` 和 `ImageLightbox` 都因此改成原地 `position: fixed`。
- **第三方浮层用 `<ClientOnly>` 包起来**，并**必须给 fallback 且占位一致**：
  ```vue
  <ClientOnly>
    <SomePopover />
    <template #fallback>
      <span class="px-1.5 font-mono text-xs">{{ hash }}</span>
    </template>
  </ClientOnly>
  ```
  服务端与客户端首帧都渲染 fallback，挂载后再换成真组件，因此不会 mismatch。
- **首页 HTML 是模板**：`scripts/prerender.ts` 用正则替换 `index.html` 里的 `<div id="app">`、`<title>`、`description`、`og:title`、`og:description`、`og:url`、`canonical`。改动这些标签的形状必须同步 `scripts/prerender.ts` 的正则——匹配不上会直接让构建失败，不会静默产出 20 个同标题的页面。
- 组件在 SSR 与客户端首帧必须渲染出同样的**元素结构**。属性级别的差异 Vue 会在 hydrate 时 patch（见 8.3），但结构不同会导致节点被丢弃重建。

### 样式
- 只用语义化 token（`bg-background`、`text-muted-foreground`），**不写 `dark:` 颜色覆盖**
- 纵向排列用 `flex flex-col gap-*`，**禁止 `space-y-*`**
- 宽高相等用 `size-*`，不要 `w-4 h-4`
- 条件 class 用 `cn()`（`@/lib/utils`）
- 主题色是 oklch CSS 变量，定义在 `src/style.css`；暗色靠 `.dark` class
- 图标从 `@lucide/vue` 导入；放进 `Button` 时用 `data-icon="inline-start|inline-end"`，且**不要加 `size-*`**（组件自己控制尺寸）
- 徽章用 `Badge`，分隔用 `border-*` / `divide-*`，不要手搓
- 覆盖层组件（Dialog/Popover 等）不要手写 `z-index`
- 页面背景是纯色 `bg-background`，不要加动画背景

### 字号
- **字号只有一处来源：`src/style.css` 顶部的 `@theme` 字号表。** 要整体放大或缩小，只改那一块；不要在视图里写 `text-[14px]` 这类一次性值。
- 角色固定，按语义选，不要按“看起来差不多”选：

  | 角色 | class | px | 用在哪 |
  |---|---|---|---|
  | 微型标注 | `text-xs` | 13 | 徽章、计数、代码块标题栏 |
  | 次级 | `text-sm` | 15 | 导航、按钮、表单标签、meta 行、目录 |
  | 正文 | `text-base` | 17 | 文章正文、描述 |
  | 小标题 | `text-lg` | 19 | 列表项标题、小节标题 |
  | 页面标题 | `text-xl` 及以上 | 22+ | 页面标题、文章标题 |

- **承载信息的文字不得小于 `text-sm`。** `text-xs` 只用于纯标注。曾经的坑：文章列表把标题写成 14px、摘要和日期行写成 12px，比 16px 的正文还小，层级是反的。
- `body` 上挂了 `text-base`，正文尺寸由字号表决定，**不要依赖浏览器默认的 16px**（`--text-base` 改了而正文没变，就是这个原因）。
- 行高用无单位比例（与 Tailwind 默认一致），不要用 `leading-7` 这类基于 rem 的绝对值——那样改字号时行高不会跟着走。

### 状态
- composable + module-level ref 实现 singleton，不用 Pinia/Vuex
- 主题用 `useTheme()`；`dark` class 由 `index.html` 内联脚本在首帧前设置，`useTheme` 只读写，**不要**在 `onMounted` 里重新初始化（会闪主题）
- 「首帧必须与服务端一致、挂载后再变」的值（当前年份、`ClientOnly` 开关）要有一个 SSR 也成立初值，例如 `AppFooter` 用 `__BUILD_YEAR__` 打底再在 `onMounted` 里更新

### 博客与渲染
- Markdown 放 `content/posts/`，文件名即 slug，URL 是 `/posts/<slug>`
- Frontmatter：title, published, description, image, tags, category, draft
- `published` 可能是 YAML `Date`，统一用 `@/lib/blog/frontmatter` 的 `readDate()` 归一化
- **`renderMarkdown()` 只在构建期调用**（由 `scripts/blog-plugin.ts` 驱动），返回 `{ html, headings }`；前端从 `virtual:blog-content` 同步取结果，不要再加 loading 状态
- 摘要、阅读时长、draft 过滤都在构建期算好；视图里不要重新推导
- 渲染状态（标题锚点、目录、代码块元数据）全部在 `createBlogRenderer()` 的闭包里，**不要往模块级塞状态**——并发渲染会互相污染
- 新增代码块语言改 `src/lib/blog/markdown.ts` 的 `LANGUAGE_IMPORTS`；**不要用 `import('shiki')` 全量打包**
- 日期显示统一走 `@/lib/date`，不要在视图里用 `toLocaleDateString`

## 6. 硬性禁止

| 禁止 | 原因 |
|---|---|
| 手工改 `src/components/ui/**` | 由 CLI 拥有 |
| 在会被预渲染的组件里用 `<Teleport>` | 见 8.1，SSR 写不进目标元素 |
| `<ClientOnly>` 不给 fallback | 挂载后布局跳动 |
| 删掉 `vite.config.ts` 里的 `manualChunks` | 见 8.2，`useRoute()` 会变 `undefined` |
| 用 `import.meta.env.DEV` 决定是否 hydrate | 见 8.4，`vite build --mode development` 会退化成纯挂载 |
| 从 `src/`（除 `scripts/`）import `@/lib/blog/markdown` | 会把 Shiki 打回前端包 |
| `space-y-*` | 项目统一用 `flex + gap-*` |
| `dark:` 颜色覆盖 | 只用语义化 token |
| 给 `Button` 内图标加 `size-*` | 组件已处理 |
| 模块级渲染状态 | 并发渲染互相污染 |
| `import('shiki')` 全量打包 | 曾产出 324 文件 / 9.7 MB |
| 改动 `public/` 文件却不检查 `public/_headers` | 缓存头会失配 |

## 7. 协作流程

### 提交信息

**每条提交都必须有正文，只有标题的提交一律视为未完成。** 提交前用 `git log -1` 自己看一眼。

```
<type>(<scope>): <imperative English summary>      ← 标题，≤ 72 字符

<为什么改、改了什么取舍、怎么验证的>                ← 正文，空一行后开始
```

- `type`：`feat` / `fix` / `refactor` / `docs` / `chore` / `style` / `perf` / `build` / `test`
- `scope` 可选，用目录或领域名：`blog`、`tools`、`build`、`ui`、`ssg`
- 标题用英文祈使句（`add`，不是 `added`），句尾不加句号
- 正文用英文。写**动机、约束和被否决的方案**，不要复述 diff（`git show` 已经能看到）
- 一次提交只做一件事，跨领域的改动拆开；正文要点用 `-` 列表
- 行为变化、破坏性影响、验证方式都要写清楚
- 多段正文用 `git commit -F <file>` 或第二个 `-m`，不要在一条 `-m` 里塞 `\n`

### 提交前必须双绿
```bash
npm run typecheck && npm run build
```
`build` 里已经包含 `typecheck`，但类型错误和构建产物的**静默**问题（见第 8 节）是两回事，两个都要看。

预渲染相关改动额外确认：
- 构建末尾出现 `[prerender] N pages`，N 与文章数对得上
- `dist/posts.html`、`dist/posts/<slug>.html`、`dist/404.html` 都在，`dist-ssr/` 已删除
- 抽查两个页面的 `<title>` / `rel="canonical"` 不是同一个值

### 不要自动 push
**未经用户明确确认，不得 `git push`。** 改动先落在本地分支、验证通过、报告结果，等指示。
改写已推送的历史（`git rebase` / `--amend`）前必须先建备份 ref，并在报告里说明。

### 变更 `components/ui/` 前
先 `npx shadcn-vue@latest info` 确认别名仍解析正确；切换预设前先问用户要 overwrite、merge 还是 skip。

## 8. 已知坑（失败时不报错，重点看）

1. **`<Teleport>` 在预渲染页面上是不可靠的。** `@vue/server-renderer` 把 teleport 内容写进 `ssrContext.teleports`，不写进目标元素，只留下 `<!--teleport start/end-->` 占位；客户端 hydrate 时会去目标里找锚点、找不到就现造，槽内容对着 app 容器后面的节点 hydrate。表现是「页面能看，但控制台报 mismatch」。需要浮层就用 `position: fixed` 原地渲染（本项目的布局没有任何祖先元素创建 containing block）。
2. **分包会把 Vue 运行时拆成两份，`useRoute()` / `useRouter()` 会变成 `undefined`。** vue-router 落到自己的 chunk、Vue 运行时落到另一个 chunk 时，跨 chunk 转出去的 `inject` 拿不到活动实例：`useRoute()` 返回 `undefined`，于是**只由 `<RouterView>` 渲染的组件炸掉**，而 `AppHeader` 这类不在 `RouterView` 下的组件正常——很容易误判成组件自己的问题。`vite.config.ts` 的 `manualChunks` 把 `vue` / `vue-router` / `@vue/*` 钉进同一个 chunk 就是为此，**不要删**。
   > 顺带一提：只把 Vite 从 lock 里的 8.0.10 换成 8.3.2，重复的 Vue 运行时就出现在另一个 chunk 里了。**装依赖时不要用 `--no-package-lock`**，它会绕过 lock 把整个依赖树重解析一遍。
3. **reka-ui 的部分组件在服务端渲染不出可 hydrate 的结构。** `Popover` 关闭时服务端吐一个 `<!--v-if-->` 占位、客户端吐的是一串 fragment 锚点，每页都会报 mismatch，必须用 `<ClientOnly>` 包住。`Slider` 更轻：thumb 的几何与 `aria-valuenow` 只在客户端算，服务端是 `display:none` + `left:calc(0% + 0px)`，属于**纯属性差异**，Vue 会在 hydrate 时 patch，可以接受。
4. **SSR 构建必须先于客户端构建。** 预渲染跑在客户端构建的 `closeBundle` 里，只有那时 `config.build.outDir` 才是 `dist`、`index.html` 也才存在。顺序写反会报 `dist-ssr/index.html is missing`。
5. **`import.meta.env.DEV` 不能用来决定「要不要 hydrate」。** 生产构建和 `vite build --mode development` 都是 `DEV === false`，而 `vite dev` 也需要 `DEV === true`。真正该看的是 Vite 的 `command`，所以有 `__HYDRATE__`（见 `vite.config.ts` 的 `define`）。用 `--mode development` 构建能同时拿到预渲染产物和 Vue 的 **dev** 版 hydration 警告，是排查 mismatch 的唯一实用手段。
6. **`createWebHistory()` 在构造时就读 `window.history`。** 预渲染跑在 Node 里，必须走 `createMemoryHistory()`（`src/router/index.ts` 用 `import.meta.env.SSR` 分支，字面量会被静态替换，浏览器包里不留这段）。
7. **marked 的 `Renderer` 不能用类实例。** marked 用 `for...in` 合并 renderer 对象，类实例的字段会被当成 renderer 方法名，报 `renderer '<key>' does not exist`。必须传**普通对象**——`createBlogRenderer()` 就是为此把状态放进闭包的。
8. **`String.replace` 只替换第一处。** 高亮代码块若用 replace 定位，两个内容完全相同的代码块会漏掉一个。现在按精确 offset 重建 HTML。
9. **Shiki 双主题靠 CSS 变量。** 输出是 `--shiki-light` / `--shiki-dark`，切主题是纯 CSS，不重渲染。注意高亮块上没有 `language-*` class（只有未高亮的兜底路径才有），断言时别写错。
10. **无引号的 YAML 日期会变成 `Date` 对象。** `published: 2026-09-11` 经 js-yaml 就是 `Date`，曾让 sitemap 的 `<lastmod>` 输出 `Mon Jun 29 2026 ... (中国标准时间)`。统一走 `readDate()`。
11. **日期不要做时区转换。** ISO 日期解析成 `Date` 是 UTC 零点，用本地时区格式化会让 UTC 以西的访客看到前一天。`src/lib/date.ts` 直接读日期分段。
12. **`.dark` 必须在首帧前设置。** 放在 `onMounted` 会让暗色访客闪一帧白屏，所以它在 `index.html` 的内联脚本里，与 `useTheme` 的逻辑必须保持同步。
13. **构建不依赖 git 完整历史。** `vite.config.ts` 的 `git()` 失败时返回空串，页脚降级显示 `dev`；浅克隆（`depth 1`）没有 `HEAD~1`，不要假设 git 一定可用。
14. **验证预渲染结果时，一个进程只能挂载一个路由。** vue-router 的 `started` 是模块级标志：同一个 Node 进程里第二次 `install()` 不会做首次导航，`router.isReady()` 永不 resolve，于是「什么都没挂载」看起来和「hydrate 完美」一模一样——`#app` 前后一致，假绿。必须每个路由开一个进程。
15. **`npm run preview` 只做 SPA 回退**，真实的路由/404 行为只能靠 `npm run cf:dev` 或线上验证。`dist/` 里 HTML 按 `<path>.html` 平铺，是为了让 preview 也能解析到（sirv 只认 `<path>.html`，不认 `<path>/index.html`）。
16. **`data-v-*`（scoped style）与 `value=""` 会在 hydrate 时与首帧有属性级差异。** 前者是 Vue 在 hydrate 时补写 scope id，后者是 `v-model` 走 DOM property 而非 attribute。都不影响元素结构，字符串对比时要先把注释剥掉再比。
17. **模板注释里不要再出现注释结束符。** `ImageLightbox.vue` 的解释性注释里嵌了一个「teleport start/end」注释字面量，HTML 解析到第一个结束符就把注释截断了，**剩下的注释文字会被当成正文渲染到页面上**——文章页底部因此多出过一段英文。模板注释里提到注释标记时只写 `teleport start/end`，不要带尖括号。单独出现的 `--` 无害，只有 `-->` 和 `--!>` 会提前终止注释；`.vue` 模板与 Markdown 都适用。

## 9. 部署

Cloudflare Workers + Static Assets，配置在 `wrangler.jsonc`：

| 配置 | 值 | 原因 |
|---|---|---|
| `assets.directory` | `./dist` | Vite 输出目录 |
| `assets.html_handling` | `drop-trailing-slash` | 规范 URL 直接 200；带尾斜杠的请求 307 回规范形式 |
| `assets.not_found_handling` | `404-page` | 未预渲染的路径返回 `dist/404.html` + 404 状态，而不是 200 的首页 |

没有 Worker 脚本。`public/_headers` 会被复制到 `dist/` 并提供缓存与安全响应头；**每条预渲染路由都要在那里列一遍**（规则匹配的是请求路径，不是落到的文件）。

**跳转方向：`hachimi2333.top` → `www.hachimi2333.top`（apex → www，`www` 是 canonical）。**
`_redirects` **不支持域名级跳转**（官方支持矩阵里明确标 ❌），所以这条规则不能写进仓库，
必须在控制台 **Rules → Overview → Create rule → Redirect Rule** 里配：
`https://hachimi2333.top/*` → `https://www.hachimi2333.top/${1}`，status `301`，勾选保留 query string。

凡是与 canonical host 相关的常量都必须指向 `www.hachimi2333.top`，**改方向时这几处要一起改**：

| 位置 | 内容 |
|---|---|
| `vite.config.ts` | `SITE_URL` 默认值，`define` 成 `__SITE_URL__` 并传给 sitemap |
| `src/lib/site.ts` | `SITE_URL` 的再导出，客户端与预渲染共用 |
| `index.html` | 模板里的 `rel="canonical"` 与 `og:url`（预渲染会逐页覆盖） |
| `public/robots.txt` | `Sitemap:` 行 |
| `content/posts/*.md` | 封面图与正文链接走 `static.hachimi2333.top`（内容，非配置） |

构建期站点源用 `SITE_URL` 覆盖（默认 `https://www.hachimi2333.top`），影响 `sitemap.xml` 与每页的 canonical。
