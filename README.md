# Hachimi2333

> Personal website — a blog, a small tool box, and a one-page intro. Fully static: no backend, no database, no auth. Every page is prerendered to its own HTML file at build time and served as a static asset.

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

- **Prerendered pages** — `npm run build` writes one HTML file per route (`posts.html`, `posts/1.html`, `tools.html`, …). The browser gets the finished page immediately and Vue hydrates it; there is no client-side render on first load.
- **Blog** — Markdown posts with tags, a category filter and client-side search, grouped by year on a single page. `?q=` and `?category=` live in the URL, so back/forward and shared links restore the view.
- **Build-time syntax highlighting** — Shiki runs during the build, so the highlighted HTML is part of the page and **Shiki never ships to the browser**. A fine-grained bundle keeps only the languages actually used, and both themes are emitted as CSS variables so switching themes costs zero re-rendering.
- **Code block extras** — `title="…"` header bars, `ins={…}` / `del={…}` line highlighting, and a copy button on every block.
- **Article TOC** — heading anchors are de-duplicated and collected into a scroll-tracking table of contents: a sticky rail on large screens, a disclosure above the body on small ones.
- **Image lightbox** — click any image in a post to zoom (wheel / pinch), pan (drag), and close with `Esc`.
- **Tools** — a cover generator and an app icon generator, both fully client-side, with Iconify icon search.
- **Dark mode without the flash** — an inline script in `index.html` sets the `dark` class before the first paint.
- **Real per-page metadata** — title, description, canonical URL and Open Graph tags are written into each prerendered file, and updated again after a client-side navigation.
- **Rounded, accessible UI** — [shadcn-vue](https://shadcn-vue.com) with the `reka-nova` preset on top of [reka-ui](https://reka-ui.com) primitives.
- **Real 404s** — anything that was not prerendered is answered with `dist/404.html` and a 404 status.
- **System info panel** — the footer's commit hash opens a panel showing the site version, the deployed commit, the build time and platform, and the CDN / edge the request was answered from. Every value is detected: the commit comes from `git`, the build facts from `process` and `package.json`, and the CDN from one `HEAD` request's response headers. Nothing is written down in the source.

## Tech stack

| Tech | Version | Role |
| --- | --- | --- |
| [Vue](https://vuejs.org) | 3.5+ | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 6.x | Strict type checking |
| [Vite](https://vite.dev) | 8.x | Build tool (client + SSR builds) |
| [@vue/server-renderer](https://github.com/vuejs/core/tree/main/packages/server-renderer) | 3.5+ | `renderToString` for the prerender step |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Styling (`@theme inline`, oklch tokens) |
| [shadcn-vue](https://shadcn-vue.com) | `reka-nova` preset | UI components (copied into `src/components/ui/`) |
| [reka-ui](https://reka-ui.com) | 2.x | Accessible primitives under shadcn-vue |
| [vue-router](https://router.vuejs.org) | 4.x | History mode in the browser, memory history while prerendering |
| [marked](https://marked.js.org) | 18.x | Markdown parsing (build only) |
| [Shiki](https://shiki.style) | 4.x | Syntax highlighting (build only, fine-grained, dual themes) |
| [js-yaml](https://github.com/nodeca/js-yaml) | 4.x | Frontmatter parsing (build only) |
| [@lucide/vue](https://lucide.dev) | 1.x | Icons |
| [@vueuse/core](https://vueuse.org) | 14.x | Composables |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | 4.x | Cloudflare deployment |

## How it works

`npm run build` chains three stages:

```bash
vue-tsc -b                                              # types
vite build --ssr src/entry-server.ts --outDir dist-ssr   # Node bundle for rendering
vite build                                               # client bundle -> dist/
```

The third stage also runs the prerender step, in its `closeBundle` hook, because that is where `dist/index.html` and every hashed asset already exist:

1. `scripts/blog-plugin.ts` reads `content/posts/*.md` in Node and exposes two virtual modules — `virtual:blog-posts` (metadata) and `virtual:blog-content` (the highlighted HTML). This is why the Markdown body is *finished* before anything renders, and why Shiki, marked and js-yaml are build-only dependencies.
2. `scripts/prerender.ts` imports the SSR bundle, renders every route in `listPages()`, and substitutes the app markup, `<title>`, description, `og:*` and canonical link into the client's `index.html`.
3. Each result is written to `dist/<route>.html`, `dist/404.html` included, and `dist-ssr/` is deleted.

Output files rather than folder indexes, because of how Workers resolves HTML: with `html_handling: drop-trailing-slash`, `/posts/1` serves `posts/1.html` directly and `/posts/1/` redirects back to it. A folder index would invert that and make the canonical URL the one that redirects.

## Project structure

```
.
├── content/
│   └── posts/                  # Markdown posts; the filename is the slug
├── scripts/                    # Node-only build tooling (never shipped)
│   ├── blog-plugin.ts          # Compiles posts into virtual:blog-* modules
│   ├── prerender.ts            # Renders every route to dist/<route>.html
│   └── sitemap.ts              # Build-time sitemap plugin
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
│   │   │                       #   (ClientOnly, ColorPicker, ImageLightbox)
│   │   ├── icons/              # Brand icons Lucide no longer ships
│   │   ├── layout/             # AppLayout, AppHeader, AppFooter, BackToTop,
│   │   │                       #   BeianInfo, SystemInfoPopover,
│   │   │                       #   PageContainer, PageHeader
│   │   ├── tools/              # ToolLayout
│   │   └── ui/                 # shadcn-vue components — CLI-managed only
│   ├── composables/            # useTheme, useSystemInfo
│   ├── lib/
│   │   ├── blog/               # index (queries), content (HTML), paths,
│   │   │                       #   frontmatter, markdown, renderer
│   │   ├── date.ts             # Timezone-safe date formatting
│   │   ├── build.ts            # Build facts injected by vite.config.ts
│   │   ├── iconify.ts          # Iconify API client
│   │   ├── network.ts          # Runtime CDN / edge detection
│   │   ├── seo.ts              # Per-route title / description / canonical
│   │   ├── site.ts             # Site name, origin, links
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
│   ├── app.ts                  # createSiteApp() — shared by both entries
│   ├── entry-client.ts         # Mounts (and hydrates) in the browser
│   ├── entry-server.ts         # renderToString + the route list
│   ├── env.d.ts                # Build-time constant declarations
│   └── style.css               # Tailwind + theme tokens + .prose + Shiki
├── index.html                  # Prerender template + prepaint theme script
├── components.json             # shadcn-vue config
├── wrangler.jsonc              # Cloudflare Workers + Static Assets
└── vite.config.ts              # Aliases, build-time constants, plugins
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

`npm run dev` serves a plain SPA shell — no prerendering, no hydration — so it stays fast and hot-reloads Markdown edits through `scripts/blog-plugin.ts`. To see the real thing, use `npm run build && npm run preview` or `npm run cf:dev`.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run typecheck` | `vue-tsc -b` — types only, no emit |
| `npm run build` | Type-check, build the SSR bundle, build the client, prerender every route |
| `npm run preview` | Serve the built `dist/` locally (prerendered pages included) |
| `npm run deploy` | Build, then publish to production with Wrangler |
| `npm run deploy:preview` | Build, then upload a preview version |
| `npm run cf:dev` | Build, then run `dist/` inside the Workers runtime |

## Writing a post

Create a `.md` file in `content/posts/`. **The filename without `.md` is the slug**, so `content/posts/1.md` is served at `/posts/1`.

```markdown
---
title: Hello, world
published: 2026-04-24
description: "A short summary shown in the list, the search results, and the page metadata"
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
| `description` | string | no | Summary in the post list, search, and the page metadata. Falls back to the first usable body line |
| `image` | string | no | Cover image URL |
| `tags` | string[] | no | Used by search and the tag display |
| `category` | string | no | Defaults to `未分类`; drives the filter chips |
| `draft` | boolean | no | Excluded from the list, the archives, the sitemap **and the prerendered output** |

> An unquoted `published: 2026-04-24` is parsed by YAML as a `Date` object. Everything reads it through `readDate()` in `src/lib/blog/frontmatter.ts`, which normalizes it to a `YYYY-MM-DD` string, so sorting, display, and the sitemap are all safe either way. Quote `description` and `title` when they contain a `:` or a leading `#`, or YAML will misparse them.

Restart or save — the plugin watches `content/posts/` and invalidates both virtual modules, so a Markdown edit hot-reloads like any other source file. Adding or removing a post also adds or removes its `<slug>.html`, `<title>` and sitemap entry on the next build.

### Code block extras

````markdown
```ts title="main.ts" ins={2-3} del={7}
````

- `title="…"` renders a title bar above the block
- `ins={2-3,5}` / `del={7}` highlight added / removed lines (ranges and comma-separated lists)
- Every block gets a copy button in the top-right corner

### Adding a language

Shiki is bundled **fine-grained**, so only registered grammars are used. To support a new language, add one line to `LANGUAGE_IMPORTS` in `src/lib/blog/markdown.ts`:

```ts
import('@shikijs/langs/rust'),
```

> Do not switch back to `import('shiki')`. The full bundle emitted one chunk per grammar and once pushed the build output to 324 files / 9.7 MB. The grammars are now a build-time dependency, so the cost lands on `npm run build` rather than on every visitor.

## Deployment

The site is deployed to **Cloudflare Workers with Static Assets**. There is **no Worker script** — static assets only. [`wrangler.jsonc`](./wrangler.jsonc) points `assets.directory` at `./dist` and configures how requests map onto the prerendered files:

| Setting | Value | Why |
| --- | --- | --- |
| `html_handling` | `drop-trailing-slash` | Canonical URLs are served with a 200; a trailing slash redirects to the canonical form |
| `not_found_handling` | `404-page` | Anything not prerendered gets `dist/404.html` with a 404 status, instead of the home page at 200 |

[`public/_headers`](./public/_headers) is copied into `dist/` and supplies cache and security response headers, including `must-revalidate` for every prerendered HTML path so a new deploy is picked up immediately.

```bash
npx wrangler login     # once
npm run deploy         # build + publish to production
```

### One-time manual configuration

These cannot be expressed in the repository:

1. **Apex → `www` redirect.** The `_redirects` file explicitly does not support domain-level redirects — see the "Domain-level redirects ❌" row in Cloudflare's [supported features table](https://developers.cloudflare.com/workers/static-assets/redirects/#advanced-redirects) — so this cannot live in the repository. In the dashboard, open **Rules → Overview → Create rule → Redirect Rule** and apply the official [root → WWW recipe](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-root-to-www/):

   | Field | Value |
   | --- | --- |
   | When incoming requests match | Wildcard pattern |
   | Request URL | `https://hachimi2333.top/*` |
   | Target URL | `https://www.hachimi2333.top/${1}` |
   | Status code | `301` |
   | Preserve query string | Enabled |

   `www.hachimi2333.top` is already the canonical host everywhere in this repository, so **no code change is needed for this direction** — only the rule above. The host constants that must always agree with it:

   | Where | What |
   | --- | --- |
   | [`src/lib/site.ts`](./src/lib/site.ts) | the `SITE_URL` default in [`vite.config.ts`](./vite.config.ts), inlined into the client and handed to the sitemap |
   | [`index.html`](./index.html) | the template `rel="canonical"` and `og:url` |
   | [`public/robots.txt`](./public/robots.txt) | the `Sitemap:` line |
   | `content/posts/*.md` | cover images and in-post links point at `static.hachimi2333.top` |

   If the canonical host is ever flipped, all of them have to move together.

   > The pattern matches `https://` only — the official recipe deliberately leaves `http://hachimi2333.top/…` alone. Turn on **SSL/TLS → Edge Certificates → Always Use HTTPS** so the plain-HTTP apex request is upgraded first and then caught by this rule. Without it, `http` on the apex host is served as-is and becomes a duplicate of the canonical site.
2. **DNS / custom domain.** In the Worker's **Settings → Domains & Routes**, bind **both** hostnames: `www.hachimi2333.top` (canonical) and `hachimi2333.top` (so the redirect rule above has traffic to act on). Custom Domains are proxied by Cloudflare automatically, which Redirect Rules require.

### Build-time environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `https://www.hachimi2333.top` | Origin for canonical URLs. Inlined as `__SITE_URL__` and passed to the sitemap, so a staging build never advertises production URLs |

```bash
SITE_URL=https://staging.example.com npm run build
```

`git` is used to surface the deployed commit in the footer. It is optional: a shallow CI clone or a source tarball has no history, and the build degrades gracefully instead of failing.

## Conventions

Working on the code? The hard rules live in [`AGENTS.md`](./AGENTS.md) — shadcn-vue components are CLI-managed, semantic color tokens only, no `space-y-*`, no rendering state at module scope, and a handful of build-time traps that fail *silently* rather than loudly. The short version:

- Add or update UI primitives with the CLI, never by hand: `npx shadcn-vue@latest add <component>`. There is no `remove` command; delete unused folders manually.
- `src/components/ui/` is CLI-owned. Hand-written UI belongs in `src/components/common/`.
- Only Node-side build tooling goes in `scripts/`, and it imports `src/lib/` by relative path (the Vite config loader runs before `@/` exists).
- Never render a `<Teleport>` on a prerendered page, and always give `<ClientOnly>` a fallback that occupies the same space.
- Page metadata has exactly one source: `src/lib/seo.ts`.
- Run `npm run typecheck` and `npm run build`, and confirm the build reports `[prerender] 20 pages`, before committing.

## Branches

The pre-refactor version of this site is preserved on the [`V1`](https://github.com/Hachimi2333/Hachimi2333-Website/tree/V1) branch. `main` is the current rewrite.
