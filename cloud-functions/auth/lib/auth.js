import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const TOKEN_NAME = 'auth_token'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret)
}

/**
 * 从请求中提取并验证用户身份
 * 支持 Cookie (auth_token) 和 Authorization Bearer Token 两种方式
 */
export function getUserFromRequest(request, jwtSecret) {
  let token = null

  // 优先从 Cookie 读取
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${TOKEN_NAME}=([^;]+)`))
    if (match) token = match[1]
  }

  // 回退到 Authorization Bearer Token
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  if (!token) return null

  try {
    return verifyToken(token, jwtSecret)
  } catch {
    return null
  }
}

/**
 * 生成 Set-Cookie 头值
 */
export function buildSetCookie(token, maxAge = 60 * 60 * 24 * 7) {
  return `${TOKEN_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
}

/**
 * 生成清除 Cookie 的 Set-Cookie 头值
 */
export function buildClearCookie() {
  return `${TOKEN_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}
