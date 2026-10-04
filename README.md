# Hachimi2333 个人网站

基于 Vue 3 + shadcn-vue + Tailwind CSS 4 的静态个人网站，包含个人主页、博客系统和工具页面三大模块。
无后端：全部内容在构建时静态生成，部署到 Cloudflare Workers（Static Assets）。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 前端框架 |
| TypeScript | 6.x | 类型安全（strict） |
| Vite | 8.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| shadcn-vue | `reka-nova` 预设 | UI 组件（源码写入 `components/ui/`） |
| reka-ui | 2.x | shadcn-vue 底层无障碍原语 |
| vue-router | 4.x | 路由（history 模式 + 懒加载） |
| marked | 18.x | Markdown 解析 |
| Shiki | 4.x | 代码语法高亮（细粒度打包 + 双主题） |
| js-yaml | 4.x | Frontmatter 解析 |
| @lucide/vue | 1.x | 图标库 |
| Wrangler | 4.x | Cloudflare 部署 |

## 项目结构

```
├── content/
│   └── posts/                  # Markdown 博客文章（文件名即 slug）
├── build/
│   └── sitemap.ts              # 构建期 sitemap 生成插件（Node only）
├── public/                     # 原样复制的静态资源
│   ├── _headers                # Cloudflare 响应头规则
│   ├── avatar.webp
│   ├── robots.txt
│   └── tools/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── blog/               # 博客组件（ArticleToc）
│   │   ├── icons/              # 品牌图标（Lucide 已移除品牌图标）
│   │   ├── layout/             # 布局（AppLayout/Header/Footer/SquareRain…）
│   │   └── ui/                 # shadcn-vue 组件（每个组件一个目录 + index.ts）
│   ├── composables/            # useTheme, useGitInfo
│   ├── lib/                    # blog, blog-paths, frontmatter, markdown,
│   │                           # renderer, date, iconify, utils
│   ├── router/
│   ├── tools/                  # 工具页（CoverGenerator / AppIconGenerator）
│   ├── types/
│   ├── views/                  # HomeView, ToolsView, NotFoundView, blog/
│   ├── App.vue
│   ├── main.ts
│   └── style.css               # Tailwind + shadcn-vue 主题变量 + .prose
├── wrangler.jsonc              # Cloudflare Workers + Static Assets 配置
└── package.json
```

## 开发

```bash
npm install
npm run dev        # 开发服务器 http://localhost:5173
npm run typecheck  # 仅类型检查
npm run build      # 类型检查 + 构建到 dist/
npm run preview    # 本地预览构建产物
```

## 部署（Cloudflare Workers + Static Assets）

`wrangler.jsonc` 已把 `dist/` 作为静态资源目录，并把 `not_found_handling` 设为
`single-page-application`，因此 `/posts/1` 这类深链接会回退到 `index.html`，与
vue-router 的 history 模式匹配。**没有 Worker 脚本**，只有静态资源。

```bash
npm run deploy          # 构建并发布到生产
npm run deploy:preview  # 构建并上传一个预览版本（wrangler versions upload）
npm run cf:dev          # 本地以 Workers 运行时预览 dist/
```

首次部署需要先登录：

```bash
npx wrangler login
```

### 需要手动完成的一次性配置

1. **自定义域名的 www → 非 www 跳转。**
   `_redirects` 只支持路径级跳转，Cloudflare 明确不支持域名级跳转
   （见 [Redirects 文档](https://developers.cloudflare.com/workers/static-assets/redirects/)）。
   原先 `edgeone.json` 里的 `www` → 裸域 301 需要在
   **Cloudflare 控制台 → 你的域名 → Rules → Redirect Rules** 里重建一条规则：
   当 hostname 等于 `www.hachimi2333.top` 时 301 到 `https://hachimi2333.top` 的对应路径。
2. **DNS / 自定义域**：在 Workers 的 Settings → Domains & Routes 里绑定
   `hachimi2333.top`（以及 `www`，用于上面的跳转）。
3. 构建环境需要 `git`（用于页脚的 commit 信息），但不是必需的：拿不到 git 信息时
   会降级显示 `dev`。

### 构建期环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SITE_URL` | `https://www.hachimi2333.top` | sitemap 里使用的站点源 |

```bash
SITE_URL=https://staging.example.com npm run build
```

## 写博客

在 `content/posts/` 下新建 `.md` 文件，**文件名（去掉 `.md`）就是 URL 里的 slug**，
例如 `content/posts/1.md` → `/posts/1`。

```markdown
---
title: 文章标题
published: 2026-04-24
description: "文章描述"
image: "https://example.com/cover.webp"
tags: ["标签1", "标签2"]
category: 分类名称
draft: false
---

# 文章内容

在这里写 Markdown 内容...
```

### Frontmatter 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题（缺省时回退为 slug） |
| published | string | 是 | 发布日期 `YYYY-MM-DD`（也可写 `date`） |
| description | string | 否 | 文章描述（含特殊字符时建议加引号） |
| image | string | 否 | 封面图 URL |
| tags | string[] | 否 | 标签列表 |
| category | string | 否 | 分类（默认「未分类」） |
| draft | boolean | 否 | 草稿，`true` 时不出现在列表与 sitemap 中 |

> `published` 写 `2026-04-24`（不加引号）时 YAML 会解析成 `Date` 对象，
> 读取时会统一归一化成 `YYYY-MM-DD` 字符串，排序、显示和 sitemap 都安全。

### 代码块增强

````markdown
```ts title="main.ts" ins={2-3} del={7}
````

- `title="..."` 在代码块顶部显示标题栏
- `ins={2-3,5}` / `del={7}` 高亮新增/删除行（支持 `2-4` 区间与逗号分隔）
- 代码块右上角有复制按钮

### 新增代码块语言

Shiki 使用**细粒度打包**，只注册用到的语法。要支持一门新语言，在
`src/lib/markdown.ts` 的 `LANGUAGE_IMPORTS` 里加一行：

```ts
import('@shikijs/langs/rust'),
```

> 不要改回 `import('shiki')`：全量打包会为每个语法生成一个 chunk，
> 曾让构建产物达到 324 个文件 / 9.7 MB。

## 架构约定

### 组件
- 一律 `<script setup lang="ts">`
- shadcn-vue 组件放 `src/components/ui/`，通过目录内 `index.ts` barrel 导出
- 增删 shadcn-vue 组件用 CLI，不要手写或从 GitHub 拷文件：
  ```bash
  npx shadcn-vue@latest add <component>
  npx shadcn-vue@latest add <component> --dry-run   # 更新前先看差异
  npx shadcn-vue@latest info                        # 查看当前预设/别名
  ```
- 当前预设是 `reka-nova`（`--radius: 0.625rem`）。切换预设用
  `npx shadcn-vue@latest apply --preset <name>`；`src/style.css` 里
  `.prose` 与 Shiki 相关样式是手写的，切预设后需要确认没被覆盖。

### 样式
- 只用语义化 token（`bg-background`、`text-muted-foreground`），不写 `dark:` 颜色覆盖
- 纵向排列用 `flex flex-col gap-*`，**不要用 `space-y-*`**
- 宽高相同时用 `size-*`
- 条件 class 用 `cn()`
- 图标：从 `@lucide/vue` 导入；放进 `Button` 时用 `data-icon="inline-start|inline-end"`，
  且不要加 `size-*`（组件自己控制尺寸）

### 状态
- composable + module-level ref 实现 singleton，不用 Pinia/Vuex
- 主题：`useTheme()`。`dark` class 由 `index.html` 的内联脚本在首帧前设置，
  `useTheme` 只负责读取与写入，**不要**在 `onMounted` 里重新初始化，否则会闪主题

### 博客渲染
- `src/lib/blog.ts` 用 `import.meta.glob` 在构建时把 `content/posts/*.md` 内联进来
- `src/lib/blog-paths.ts` 是内容目录与 URL 的唯一来源，博客索引和 sitemap 共用
- `src/lib/renderer.ts` 的 `BlogRenderer` **每次渲染新建实例**，标题锚点、目录、
  代码块元数据都挂在实例上。不要在模块级保存渲染状态——并发渲染会互相污染
- `renderMarkdown()` 返回 `{ html, headings }`，调用方不需要（也不要）再碰
  marked 插件的全局状态

### 构建期工具
- 只跑在 Node 的代码放 `build/`，不要放 `src/`
- `build/` 里的模块被 Vite 的 config loader 加载，`@/` 别名尚未生效，
  因此要用相对路径导入 `src/lib/` 下共享的同构模块
- `tsconfig.node.json` 的 `include` 必须覆盖 `build/**/*.ts`
