/**
 * Site-wide identity.
 *
 * Deliberately dependency-free. The header, the footer and the page metadata all
 * read from here, and `@/lib/seo` must not drag the post index into the entry
 * chunk just to render a wordmark.
 */

export const SITE_NAME = 'Hachimi2333'

export const SITE_DESCRIPTION = 'Hachimi2333 的个人网站 - 博客、工具和更多'

export const GITHUB_URL = 'https://github.com/hachimi2333'

/**
 * Canonical origin, used for `rel="canonical"`, `og:url` and the sitemap.
 *
 * Injected by `define` in `vite.config.ts` from the `SITE_URL` environment
 * variable, defaulting to production:
 *   SITE_URL=https://staging.example.com npm run build
 */
export const SITE_URL: string = __SITE_URL__
