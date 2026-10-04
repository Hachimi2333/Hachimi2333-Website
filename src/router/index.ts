import { createRouter, createWebHistory } from 'vue-router'

const BASE_TITLE = 'Hachimi2333'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: BASE_TITLE },
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('@/views/blog/PostListView.vue'),
      meta: { title: `博客 - ${BASE_TITLE}` },
    },
    {
      path: '/posts/:slug',
      name: 'post-detail',
      component: () => import('@/views/blog/PostDetailView.vue'),
      // The real title is set by the view once the post is resolved.
      meta: { title: `文章 - ${BASE_TITLE}` },
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('@/views/ToolsView.vue'),
      meta: { title: `工具 - ${BASE_TITLE}` },
    },
    {
      path: '/tools/cover-generator',
      name: 'cover-generator',
      component: () => import('@/tools/CoverGeneratorView.vue'),
      meta: { title: `文章封面生成器 - ${BASE_TITLE}` },
    },
    {
      path: '/tools/app-icon-generator',
      name: 'app-icon-generator',
      component: () => import('@/tools/AppIconGeneratorView.vue'),
      meta: { title: `App 图标生成器 - ${BASE_TITLE}` },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: `页面未找到 - ${BASE_TITLE}` },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Restore the browser's position on back/forward.
    if (savedPosition) return savedPosition
    // Keep the scroll position when only the query string changes (pagination),
    // and jump instantly on a real page change — a smooth scroll from the bottom
    // of a long list looks broken.
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? BASE_TITLE
})

export default router
