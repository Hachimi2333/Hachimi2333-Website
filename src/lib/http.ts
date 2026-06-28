const API_BASE = import.meta.env.VITE_API_BASE || 'https://auth.hachimi2333.top/api'

interface RequestOptions extends RequestInit {
  json?: unknown
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, ...init } = options
  const headers: HeadersInit = {}

  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(json)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { ...headers, ...init.headers },
    ...init,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}
