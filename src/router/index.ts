import { createRouter, createWebHistory } from 'vue-router'
import { applyPageMeta, resolveRouteMeta } from '@/lib/seo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('@/views/blog/PostListView.vue'),
    },
    {
      path: '/posts/:slug',
      name: 'post-detail',
      component: () => import('@/views/blog/PostDetailView.vue'),
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('@/views/ToolsView.vue'),
    },
    {
      path: '/tools/cover-generator',
      name: 'cover-generator',
      component: () => import('@/views/tools/CoverGeneratorView.vue'),
    },
    {
      path: '/tools/app-icon-generator',
      name: 'app-icon-generator',
      component: () => import('@/views/tools/AppIconGeneratorView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Restore the browser's position on back/forward.
    if (savedPosition) return savedPosition
    // Keep the scroll position when only the query string changes (filtering),
    // and jump instantly on a real page change -- a smooth scroll from the bottom
    // of a long list looks broken.
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

// Titles live in one place (`@/lib/seo`) so the prerender step and the client
// cannot disagree about what a page is called.
router.afterEach((to) => {
  applyPageMeta(resolveRouteMeta(to))
})

export default router
