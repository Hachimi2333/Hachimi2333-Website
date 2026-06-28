import { apiFetch } from './http'
import type { User } from '@/types/user'

export async function adminGetUsers(): Promise<User[]> {
  try {
    return await apiFetch<User[]>('/admin/users')
  } catch {
    return []
  }
}

export async function adminGetUser(id: number): Promise<User | null> {
  try {
    return await apiFetch<User>(`/admin/users/${id}`)
  } catch {
    return null
  }
}

export async function adminUpdateUser(
  id: number,
  data: { name?: string; avatar?: string; signature?: string; region?: string; bio?: string; isAdmin?: boolean },
): Promise<boolean> {
  try {
    await apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: 'PUT', json: data })
    return true
  } catch {
    return false
  }
}

export async function adminDeleteUser(id: number): Promise<boolean> {
  try {
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}
