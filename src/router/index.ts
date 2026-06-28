import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

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
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: `登录 - ${BASE_TITLE}`, guest: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { title: `注册 - ${BASE_TITLE}`, guest: true },
    },
    {
      path: '/auth/profile',
      name: 'profile',
      component: () => import('@/views/auth/ProfileView.vue'),
      meta: { title: `个人资料 - ${BASE_TITLE}` },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminView.vue'),
      meta: { title: `后台管理 - ${BASE_TITLE}`, requiresAuth: true, requiresAdmin: true },
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

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isAdmin, authInitialized, fetchUser } = useAuth()

  // 首次加载：同步读缓存立即确定状态，API 验证在后台进行
  if (!authInitialized.value) {
    fetchUser()
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ path: '/auth/login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !isAdmin.value) {
    next('/')
  } else if (to.meta.guest && isAuthenticated.value) {
    next('/auth/profile')
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || BASE_TITLE
})

export default router
