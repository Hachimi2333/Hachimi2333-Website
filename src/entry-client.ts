import { createSiteApp } from './app'
import './style.css'

// `__HYDRATE__` is inlined from the Vite `command`: true for every build (which
// always follows the prerender step) and false for the dev server, whose
// `index.html` has an empty app container.
const { app, router } = createSiteApp({ ssr: __HYDRATE__ })

// Wait for the initial navigation to resolve before mounting, so the first
// render already knows which route it is hydrating.
void router.isReady().then(() => {
  app.mount('#app')
})
