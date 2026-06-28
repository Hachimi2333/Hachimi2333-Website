# Hachimi2333-Website

个人网站 — Vue 3 + shadcn-vue + Tailwind CSS 4

## 技术栈

- Vue 3.5+ (Composition API, `<script setup>`)
- TypeScript (strict mode)
- Vite 8
- Tailwind CSS 4 + tw-animate-css
- shadcn-vue (new-york style, 基于 reka-ui)
- vue-router 4 (history mode, 懒加载)
- @vueuse/core

## 项目结构

```
src/
├── components/
│   ├── auth/          # 认证相关组件（协议弹窗、编辑弹窗）
│   ├── blog/          # 博客组件（ArticleToc）
│   ├── layout/        # 布局组件（AppLayout, Header, Footer, PageBreadcrumb）
│   └── ui/            # shadcn-vue UI 组件（barrel export）
├── composables/       # 组合式函数（useAuth, useProfile, useTheme, useGitInfo）
├── lib/               # 工具库（http, blog, markdown, date, iconify, admin）
├── router/            # 路由配置
├── tools/             # 工具页面（独立模块，不与网站组件共享）
├── types/             # TypeScript 类型定义
├── views/             # 页面视图
└── blog/post/         # Markdown 博客文章
```

## 开发规范

### 组件
- 使用 `<script setup lang="ts">`
- UI 组件放 `components/ui/`，遵循 shadcn-vue 模式
- 页面视图放 `views/`，每个文件 <200 行
- 超过 200 行的视图应抽取子组件到对应目录

### 样式
- 使用 Tailwind CSS utility classes
- 使用 `cn()` 工具函数合并 class（来自 `@/lib/utils`）
- 主题色通过 CSS 变量（oklch）定义在 style.css
- 暗色模式使用 `.dark` class 切换

### 状态管理
- 使用 composable + module-level ref 实现 singleton 状态
- 不使用 Pinia/Vuex
- 主题状态通过 `useTheme()` composable
- 认证状态通过 `useAuth()` composable

### API 调用
- 使用 `src/lib/http.ts` 的 `apiFetch()` 函数
- 认证接口使用 cookie（credentials: 'include'）

### 博客
- Markdown 文件放 `src/blog/post/`
- Frontmatter 字段：title, published, description, image, tags, category, draft
- 构建时通过 Vite glob import 加载

## 构建

```bash
npm run dev      # 开发服务器
npm run build    # TypeScript 检查 + Vite 构建
npm run preview  # 预览构建产物
```
