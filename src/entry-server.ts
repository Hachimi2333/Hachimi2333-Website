import { renderToString } from '@vue/server-renderer'
import { createSiteApp } from './app'
import { getAllPosts } from './lib/blog'
import { postUrl } from './lib/blog/paths'
import { tools } from './lib/tools'

export { canonicalUrl, resolvePageMeta } from './lib/seo'

export interface PrerenderPage {
  /** Router path to render. */
  url: string
  /** Path relative to `dist/`. */
  file: string
}

function pageFor(url: string): PrerenderPage {
  return { url, file: url === '/' ? 'index.html' : `${url.slice(1)}.html` }
}

/**
 * Every route that gets its own HTML file.
 *
 * Files (`posts/hello-world.html`) rather than folder indexes
 * (`posts/hello-world/index.html`), because of how Workers resolves HTML assets.
 * With `html_handling` of `drop-trailing-slash`, `/posts/hello-world` serves
 * `posts/hello-world.html` directly with a 200, while `/posts/hello-world/` 307s
 * back to it. A folder index would invert that: the canonical URL would be the
 * one that redirects.
 *
 * It also keeps `npm run preview` honest -- Vite's static preview server maps an
 * extension-less path onto `<path>.html`, not onto `<path>/index.html`.
 */
export function listPages(): PrerenderPage[] {
  return [
    pageFor('/'),
    pageFor('/posts'),
    pageFor('/tools'),
    ...tools.map((tool) => pageFor(tool.route)),
    ...getAllPosts().map((post) => pageFor(postUrl(post.slug))),
  ]
}

/**
 * The page rendered into `404.html`, which `assets.not_found_handling` of
 * `"404-page"` serves with a 404 status for anything not prerendered.
 *
 * `/404` is not a route; it falls through to the `:pathMatch(.*)*` catch-all,
 * which is exactly the view that belongs in that file.
 */
export const NOT_FOUND_PAGE: PrerenderPage = { url: '/404', file: '404.html' }

/**
 * Render one route to HTML.
 *
 * A fresh app and router per call: `router.push()` mutates router state, and
 * reusing one instance across twenty routes leaks the previous route into the
 * next render.
 */
export async function render(url: string): Promise<string> {
  const { app, router } = createSiteApp({ ssr: true })
  await router.push(url)
  await router.isReady()
  return renderToString(app)
}
