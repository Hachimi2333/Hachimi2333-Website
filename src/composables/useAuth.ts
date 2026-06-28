import { ref, computed } from 'vue'
import { apiFetch } from '@/lib/http'
import type { User, AuthResponse } from '@/types/user'

const AUTH_CACHE_KEY = 'auth_user'

const user = ref<User | null>(null)
const authInitialized = ref(false)
const verified = ref(false)
const isAuthenticated = computed(() => !!user.value)
const isAdmin = computed(() => user.value?.isAdmin ?? false)

// 从缓存恢复用户状态（同步，立即生效）
function restoreFromCache(): boolean {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY)
    if (cached) {
      user.value = JSON.parse(cached)
      return true
    }
  } catch {}
  return false
}

function saveCache(u: User | null) {
  if (u) {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(u))
  } else {
    localStorage.removeItem(AUTH_CACHE_KEY)
  }
}

export function useAuth() {
  async function login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await apiFetch<{ user: User }>('/auth/login', {
        method: 'POST',
        json: { email, password },
      })
      user.value = data.user
      saveCache(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '登录失败' }
    }
  }

  async function register(email: string, name: string, password: string): Promise<AuthResponse> {
    try {
      const data = await apiFetch<{ user: User }>('/auth/register', {
        method: 'POST',
        json: { email, name, password },
      })
      user.value = data.user
      saveCache(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '注册失败' }
    }
  }

  async function fetchUser(force = false): Promise<boolean> {
    // 已初始化且非强制刷新，直接返回缓存状态
    if (authInitialized.value && !force) {
      return !!user.value
    }

    // 首次加载：先从缓存恢复，再用 API 验证
    if (!authInitialized.value) {
      restoreFromCache()
      authInitialized.value = true
    }

    try {
      const data = await apiFetch<User>('/users/me')
      user.value = data
      saveCache(data)
      verified.value = true
      return true
    } catch {
      // API 失败说明 session 过期，清除缓存
      user.value = null
      saveCache(null)
      verified.value = true
      return false
    }
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {}
    user.value = null
    saveCache(null)
    verified.value = false
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    authInitialized,
    verified,
    login,
    register,
    logout,
    fetchUser,
  }
}
