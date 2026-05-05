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
      component: () => import('@/views/tools/CoverGeneratorView.vue'),
      meta: { title: `文章封面生成器 - ${BASE_TITLE}` },
    },
    {
      path: '/tools/app-icon-generator',
      name: 'app-icon-generator',
      component: () => import('@/views/tools/AppIconGeneratorView.vue'),
      meta: { title: `App 图标生成器 - ${BASE_TITLE}` },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: `404 - ${BASE_TITLE}` },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || BASE_TITLE
})

export default router
