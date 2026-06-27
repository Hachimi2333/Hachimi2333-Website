import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://auth.hachimi2333.top/api'

export interface User {
  id: number
  email: string
  name: string
  avatar: string
  signature: string
  region: string
  bio: string
  isAdmin: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface PublicProfile {
  id: number
  name: string
  avatar: string | null
  signature: string | null
  region: string | null
  bio: string | null
  createdAt: string
}

export interface AdminUser {
  id: number
  name: string
  email: string
  avatar: string
  signature: string
  region: string
  bio: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

const user = ref<User | null>(null)
const authInitialized = ref(false)
const isAuthenticated = computed(() => !!user.value)
const isAdmin = computed(() => user.value?.isAdmin ?? false)

export function useAuth() {
  async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.user) {
      user.value = data.user
      return { success: true, user: data.user }
    }
    return { success: false, message: data.message || '登录失败' }
  }

  async function register(email: string, name: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, name, password })
    })
    const data = await res.json()
    if (data.user) {
      user.value = data.user
      return { success: true, user: data.user }
    }
    return { success: false, message: data.message || '注册失败' }
  }

  async function fetchUser(force = false): Promise<boolean> {
    // Skip if already initialized and not forced
    if (authInitialized.value && !force) {
      return !!user.value
    }

    authInitialized.value = true
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id) {
          user.value = data
          return true
        }
      }
    } catch {}
    user.value = null
    return false
  }

  async function logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    user.value = null
  }

  async function fetchUserProfile(id: number): Promise<PublicProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/profile`)
      if (res.ok) return await res.json()
    } catch {}
    return null
  }

  async function updateProfile(data: { name?: string; avatar?: string; signature?: string; region?: string; bio?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/profile/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.success) {
      // Re-fetch user data after successful update
      await fetchUser(true)
      return { success: true, user: user.value || undefined }
    }
    return { success: false, message: result.message || '更新失败' }
  }

  // 管理员接口
  async function adminGetUsers(): Promise<AdminUser[]> {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' })
    if (res.ok) return await res.json()
    return []
  }

  async function adminGetUser(id: number): Promise<AdminUser | null> {
    const res = await fetch(`${API_BASE}/users/${id}`, { credentials: 'include' })
    if (res.ok) return await res.json()
    return null
  }

  async function adminUpdateUser(id: number, data: { name?: string; isAdmin?: boolean }): Promise<AdminUser | null> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    if (res.ok) return await res.json()
    return null
  }

  async function adminDeleteUser(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    return res.ok
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    fetchUserProfile,
    updateProfile,
    adminGetUsers,
    adminGetUser,
    adminUpdateUser,
    adminDeleteUser
  }
}
