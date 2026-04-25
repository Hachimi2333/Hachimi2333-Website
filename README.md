# Hachimi2333 个人网站

基于 Vue 3 + Shadcn-Vue + Tailwind CSS 4 的静态个人网站，包含个人主页、博客系统和工具页面三大模块。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 前端框架 |
| TypeScript | 6.x | 类型安全 |
| Shadcn-Vue | 手动实现 | UI 组件库 |
| Tailwind CSS | 4.x | 样式框架 |
| Vite | 8.x | 构建工具 |
| Vue Router | 4.x | 路由管理 |
| Marked | - | Markdown 解析 |
| Shiki | - | 代码语法高亮 |
| Gray Matter | - | Frontmatter 解析 |
| Lucide Icons | - | 图标库 |

## 项目结构

```
src/
├── assets/                    # 静态资源
├── blog/
│   └── post/                  # Markdown 博客文章
│       ├── welcome.md
│       ├── vue3-shadcn-blog.md
│       └── typescript-type-gymnastics.md
├── components/
│   ├── layout/                # 布局组件
│   │   ├── AppHeader.vue      # 顶部导航栏
│   │   ├── AppFooter.vue      # 页脚
│   │   └── AppLayout.vue      # 整体布局
│   └── ui/                    # Shadcn-Vue UI 组件
│       ├── badge/             # 徽章
│       ├── breadcrumb/        # 面包屑
│       ├── button/            # 按钮
│       ├── card/              # 卡片
│       └── input/             # 输入框
├── lib/                       # 工具函数
│   ├── blog.ts                # 博客数据处理
│   ├── markdown.ts            # Markdown 渲染
│   ├── renderer.ts            # Markdown 自定义渲染器
│   └── utils.ts               # 通用工具（cn 函数）
├── router/
│   └── index.ts               # 路由配置
├── types/
│   └── blog.ts                # 博客类型定义
├── views/                     # 页面视图
│   ├── HomeView.vue           # 个人主页 (/)
│   ├── ToolsView.vue          # 工具页面 (/tools)
│   └── blog/
│       ├── PostListView.vue   # 博客列表 (/post)
│       └── PostDetailView.vue # 文章详情 (/post/:slug)
├── App.vue                    # 根组件
├── main.ts                    # 入口文件
└── style.css                  # 全局样式（Tailwind + 主题变量）
```

## 功能模块

### 1. 个人主页 (`/`)

- 简约设计：头像 + 一句话 + 几个按钮
- 渐变头像占位符
- 快速导航到博客和工具页面

### 2. 博客系统 (`/post`)

- **文章列表**：展示所有博客文章，支持分类、标签、搜索筛选
- **文章详情** (`/post/[filename]`)：Markdown 渲染、代码高亮、阅读时间估算
- **分类筛选**：按文章分类过滤
- **标签筛选**：按标签过滤
- **搜索功能**：标题、描述、标签、分类关键词搜索
- **Markdown 支持**：标题、列表、代码块、表格、引用、图片、链接等

### 3. 工具页面 (`/tools`)

- 工具列表框架，预留了工具项的数据结构
- 每个工具项包含：名称、描述、状态（即将推出/开发中/可用）
- 便于后续扩展具体工具功能

## 博客文章编写

在 `src/blog/post/` 目录下创建 `.md` 文件，格式如下：

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

### Frontmatter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| published | string | 是 | 发布日期 (YYYY-MM-DD) |
| description | string | 否 | 文章描述（建议加引号） |
| image | string | 否 | 封面图 URL |
| tags | string[] | 否 | 标签列表 |
| category | string | 否 | 分类（默认"未分类"） |
| draft | boolean | 否 | 是否为草稿（默认 false，草稿不会显示） |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看网站。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录下。

### 预览生产版本

```bash
npm run preview
```

## 设计特点

- **响应式设计**：适配桌面端和移动端
- **暗色模式**：跟随系统偏好自动切换
- **路由懒加载**：所有页面组件按需加载
- **动画过渡**：页面切换、列表渲染、元素出现均有平滑过渡
- **Shadcn-Vue 规范**：遵循 CVA + Tailwind Merge 的组件设计模式

## 扩展指南

### 添加新博客文章

在 `src/blog/post/` 中新建 `.md` 文件，添加 frontmatter 和内容即可。

### 添加新工具

编辑 `src/views/ToolsView.vue`，在 `tools` 数组中添加新工具项，然后创建对应的工具页面组件。

### 添加新 UI 组件

参照 `src/components/ui/` 下现有组件的模式，使用 CVA（class-variance-authority）+ Tailwind Merge 实现。
