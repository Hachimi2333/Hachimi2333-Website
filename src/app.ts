import { createApp, createSSRApp, type App } from 'vue'
import type { Router } from 'vue-router'
import AppRoot from './App.vue'
import { createAppRouter } from './router'

export interface SiteApp {
  app: App
  router: Router
}

/**
 * Build the application for either environment.
 *
 * `ssr: true` uses `createSSRApp`, whose `mount()` hydrates instead of replacing
 * the container. The two entries differ only in that flag:
 *
 * - `entry-client.ts` asks for hydration in a production build (where the HTML
 *   came from `scripts/prerender.ts`) and for a plain mount in dev (where Vite
 *   serves an empty `<div id="app">`).
 * - `entry-server.ts` always renders on the server.
 */
export function createSiteApp(options: { ssr: boolean }): SiteApp {
  const app = options.ssr ? createSSRApp(AppRoot) : createApp(AppRoot)
  const router = createAppRouter()
  app.use(router)
  return { app, router }
}
