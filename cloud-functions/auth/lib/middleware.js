import { getUserFromRequest } from './auth.js'

/** 将 Express Request 的 headers 转为 Web API Headers */
function toWebHeaders(req) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value)
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(', '))
    }
  }
  return headers
}

/** 校验登录，返回 claims 或 null（已发送 401） */
export function requireAuth(req, res) {
  const jwtSecret = process.env.AUTH_JWT_SECRET || 'hachimi-auth-secret-key-change-in-production'
  const headers = toWebHeaders(req)
  const claims = getUserFromRequest({ headers }, jwtSecret)
  if (!claims) {
    res.status(401).json({ error: '未登录' })
    return null
  }
  return claims
}

/** 校验管理员权限，返回 claims 或 null（已发送 401/403） */
export function requireAdmin(req, res) {
  const claims = requireAuth(req, res)
  if (!claims) return null
  if (!claims.isAdmin) {
    res.status(403).json({ error: '需要管理员权限' })
    return null
  }
  return claims
}
