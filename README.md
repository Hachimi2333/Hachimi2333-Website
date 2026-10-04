# Hachimi2333

> Personal website — a blog, a small tool box, and a one-page intro. Fully static: no backend, no database, no auth. Every post is inlined at build time and the whole thing is served as static assets.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178bf?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)
![shadcn-vue](https://img.shields.io/badge/shadcn--vue-reka--nova-000000?logo=shadcnui&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)
![Node](https://img.shields.io/badge/Node-%5E20.19%20%7C%7C%20%3E%3D22.12-5fa04e?logo=nodedotjs&logoColor=white)

<!-- Drop a screenshot here once you have one:
![Home](https://user-images.githubusercontent.com/REPLACE/REPLACE.png)
-->

## Features

- **Blog** — Markdown posts with tags, categories, client-side search, and a year-grouped archive. Post bodies are inlined at build time as raw text and rendered in the browser, so there is no backend and no API round trip.
- **Syntax highlighting** — Shiki with a fine-grained bundle (only the languages actually used), dual light/dark themes emitted as CSS variables so switching themes costs zero re-rendering.
- **Code block extras** — `title="…"` header bars, `ins={…}` / `del={…}` line highlighting, and a copy button on every block.
- **Article TOC** — heading anchors are de-duplicated and collected into a sticky, scroll-tracking table of contents: a sidebar on large screens, a floating button with a drawer on small ones.
- **Image lightbox** — click any image in a post to zoom (wheel / pinch), pan (drag), and close with `Esc`.
- **Tools** — a cover generator and an app icon generator, both fully client-side, with Iconify icon search.
- **Dark mode without the flash** — an inline script in `index.html` sets the `dark` class before the first paint.
- **Rounded, accessible UI** — [shadcn-vue](https://shadcn-vue.com) with the `reka-nova` preset on top of [reka-ui](https://reka-ui.com) primitives.
- **Real 404s, real pagination** — a catch-all route; the blog's page number lives in `?page=`, so the browser back button works.

## Tech stack

| Tech | Version | Role |
| --- | --- | --- |
| [Vue](https://vuejs.org) | 3.5+ | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 6.x | Strict type checking |
| [Vite](https://vite.dev) | 8.x | Build tool |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Styling (`@theme inline`, oklch tokens) |
| [shadcn-vue](https://shadcn-vue.com) | `reka-nova` preset | UI components (copied into `src/components/ui/`) |
| [reka-ui](https://reka-ui.com) | 2.x | Accessible primitives under shadcn-vue |
| [vue-router](https://router.vuejs.org) | 4.x | History mode, lazy routes |
| [marked](https://marked.js.org) | 18.x | Markdown parsing |
| [Shiki](https://shiki.style) | 4.x | Syntax highlighting (fine-grained, dual themes) |
| [js-yaml](https://github.com/nodeca/js-yaml) | 4.x | Frontmatter parsing |
| [@lucide/vue](https://lucide.dev) | 1.x | Icons |
| [@vueuse/core](https://vueuse.org) | 14.x | Composables |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | 4.x | Cloudflare deployment |

## Project structure

```
.
├── content/
│   └── posts/                  # Markdown posts; the filename is the slug
├── scripts/
│   └── sitemap.ts              # Build-time sitemap plugin (Node only)
├── public/                     # Copied verbatim into dist/
│   ├── _headers                # Cloudflare cache + security headers
│   ├── avatar.webp
│   ├── favicon.ico
│   ├── robots.txt
│   └── BingSiteAuth.xml
├── src/
│   ├── components/
│   │   ├── blog/               # ArticleToc
│   │   ├── common/             # Hand-written, non-registry UI
│   │   │                       #   (ColorPicker, ImageLightbox)
│   │   ├── icons/              # Brand icons Lucide no longer ships
│   │   ├── layout/             # AppLayout, AppHeader, AppFooter, BackToTop,
│   │   │                       #   BeianInfo, GitCommitPopover,
│   │   │                       #   PageBreadcrumb, SquareRain
│   │   ├── tools/              # ToolLayout
│   │   └── ui/                 # shadcn-vue components — CLI-managed only
│   ├── composables/            # useTheme, useGitInfo
│   ├── lib/
│   │   ├── blog/               # index, paths, frontmatter, markdown, renderer
│   │   ├── date.ts             # Timezone-safe date formatting
│   │   ├── iconify.ts          # Iconify API client
│   │   ├── tools.ts            # Tool registry/manifest
│   │   └── utils.ts            # cn()
│   ├── router/
│   ├── types/                  # Shared types
│   ├── views/
│   │   ├── blog/               # PostListView, PostDetailView
│   │   ├── tools/              # CoverGeneratorView, AppIconGeneratorView
│   │   ├── HomeView.vue
│   │   ├── ToolsView.vue
│   │   └── NotFoundView.vue
│   ├── App.vue
│   ├── env.d.ts                # Build-time constant declarations
│   ├── main.ts
│   └── style.css               # Tailwind + theme tokens + .prose + Shiki
├── index.html                  # Pre-paint theme script + meta tags
├── components.json             # shadcn-vue config
├── wrangler.jsonc              # Cloudflare Workers + Static Assets
└── vite.config.ts              # Aliases, build-time git info, sitemap plugin
```

## Getting started

The [Vite 8](https://vite.dev) requirement applies: **Node `^20.19.0 || >=22.12.0`**.

```bash
git clone https://github.com/Hachimi2333/Hachimi2333-Website.git
cd Hachimi2333-Website
npm install
npm run dev
```

The dev server prints its URL, usually <http://localhost:5173>.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run typecheck` | `vue-tsc -b` — types only, no emit |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run deploy` | Build, then publish to production with Wrangler |
| `npm run deploy:preview` | Build, then upload a preview version |
| `npm run cf:dev` | Build, then run `dist/` inside the Workers runtime |

## Writing a post

Create a `.md` file in `content/posts/`. **The filename without `.md` is the slug**, so `content/posts/1.md` is served at `/posts/1`.

```markdown
---
title: Hello, world
published: 2026-04-24
description: "A short summary shown in the list, the RSS-less index, and search"
image: "https://example.com/cover.webp"
tags: ["Vue", "Notes"]
category: Engineering
draft: false
---

# Heading

Body text...
```

### Frontmatter

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | no | Falls back to the slug |
| `published` | string | yes | `YYYY-MM-DD`; the legacy `date` key also works |
| `description` | string | no | Summary shown in the post list, the search results, and the page metadata |
| `image` | string | no | Cover image URL |
| `tags` | string[] | no | Used by search and the tag display |
| `category` | string | no | Defaults to `未分类` |
| `draft` | boolean | no | Hidden from the list, the archives, and the sitemap |

> An unquoted `published: 2026-04-24` is parsed by YAML as a `Date` object. Everything reads it through `readDate()` in `src/lib/blog/frontmatter.ts`, which normalizes it to a `YYYY-MM-DD` string, so sorting, display, and the sitemap are all safe either way. Quote `description` and `title` when they contain a `:` or a leading `#`, or YAML will misparse them.

### Code block extras

````markdown
```ts title="main.ts" ins={2-3} del={7}
````

- `title="…"` renders a title bar above the block
- `ins={2-3,5}` / `del={7}` highlight added / removed lines (ranges and comma-separated lists)
- Every block gets a copy button in the top-right corner

### Adding a language

Shiki is bundled **fine-grained**, so only registered grammars ship. To support a new language, add one line to `LANGUAGE_IMPORTS` in `src/lib/blog/markdown.ts`:

```ts
import('@shikijs/langs/rust'),
```

> Do not switch back to `import('shiki')`. The full bundle emitted one chunk per grammar and once pushed the build output to 324 files / 9.7 MB.

## Deployment

The site is deployed to **Cloudflare Workers with Static Assets**. [`wrangler.jsonc`](./wrangler.jsonc) points `assets.directory` at `./dist` and sets `not_found_handling` to `single-page-application`, so deep links like `/posts/1` fall back to `index.html` and match vue-router's history mode. There is **no Worker script** — static assets only. [`public/_headers`](./public/_headers) is copied into `dist/` and supplies cache and security response headers.

```bash
npx wrangler login     # once
npm run deploy         # build + publish to production
```

### One-time manual configuration

These cannot be expressed in the repository:

1. **`www` → apex redirect.** `_redirects` only supports path-level rules, and Cloudflare explicitly does not support domain-level redirects (see the [Redirects docs](https://developers.cloudflare.com/workers/static-assets/redirects/)). Recreate the old rule in **Cloudflare dashboard → your zone → Rules → Redirect Rules**: when the hostname is `www.hachimi2333.top`, `301` to `https://hachimi2333.top` with the same path.
2. **DNS / custom domain.** In the Worker's **Settings → Domains & Routes**, bind `hachimi2333.top` (and `www` for the redirect above).

### Build-time environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `https://www.hachimi2333.top` | Origin used for canonical URLs in `sitemap.xml` |

```bash
SITE_URL=https://staging.example.com npm run build
```

`git` is used to surface the deployed commit in the footer. It is optional: a shallow CI clone or a source tarball has no history, and the build degrades gracefully instead of failing.

## Conventions

Working on the code? The hard rules live in [`AGENTS.md`](./AGENTS.md) — shadcn-vue components are CLI-managed, semantic color tokens only, no `space-y-*`, no rendering state at module scope, and a handful of build-time traps that fail *silently* rather than loudly. The short version:

- Add or update UI primitives with the CLI, never by hand: `npx shadcn-vue@latest add <component>`.
- `src/components/ui/` is CLI-owned. Hand-written UI belongs in `src/components/common/`.
- Only Node-side build tooling goes in `scripts/`, and it imports `src/lib/` by relative path (the Vite config loader runs before `@/` exists).
- Run `npm run typecheck` and `npm run build` before committing.

## Branches

The pre-refactor version of this site is preserved on the [`V1`](https://github.com/Hachimi2333/Hachimi2333-Website/tree/V1) branch. `main` is the current rewrite.
