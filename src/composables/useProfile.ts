import { apiFetch } from '@/lib/http'
import { useAuth } from './useAuth'
import type { PublicProfile, AuthResponse } from '@/types/user'

export function useProfile() {
  const { fetchUser } = useAuth()

  async function fetchProfile(id: number): Promise<PublicProfile | null> {
    try {
      return await apiFetch<PublicProfile>(`/users/${id}`)
    } catch {
      return null
    }
  }

  async function updateProfile(data: {
    name?: string
    avatar?: string
    signature?: string
    region?: string
    bio?: string
  }): Promise<AuthResponse> {
    try {
      await apiFetch<{ success: boolean }>('/users/me', {
        method: 'PUT',
        json: data,
      })
      await fetchUser(true)
      return { success: true }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '更新失败' }
    }
  }

  return { fetchProfile, updateProfile }
}
