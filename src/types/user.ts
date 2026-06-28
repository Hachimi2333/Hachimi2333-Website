export interface User {
  id: number
  email: string
  name: string
  avatar: string
  signature: string
  region: string
  bio: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  user?: User
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
