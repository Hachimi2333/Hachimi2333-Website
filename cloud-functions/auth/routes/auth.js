import { Router } from 'express'
import { getUsersCollection, getNextSequence } from '../lib/db.js'
import { hashPassword, verifyPassword, generateToken, buildSetCookie, buildClearCookie } from '../lib/auth.js'
import { serializeCurrentUser } from '../lib/serialize.js'

const router = Router()
const MONGO_URI = process.env.AUTH_MONGODB_URI || ''
const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'hachimi-auth-secret-key-change-in-production'

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: '所有字段都是必填的' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少需要6个字符' })
    }

    const users = await getUsersCollection(MONGO_URI)
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' })
    }

    const hashedPassword = hashPassword(password)
    const id = await getNextSequence(MONGO_URI, 'users')

    const user = {
      id,
      name,
      email,
      password: hashedPassword,
      avatar: '',
      signature: '',
      region: '',
      bio: '',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(user)

    const token = generateToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET
    )
    res.setHeader('Set-Cookie', buildSetCookie(token))

    res.json({ user: serializeCurrentUser(user) })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码都是必填的' })
    }

    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    const isValid = verifyPassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    const token = generateToken(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET
    )
    res.setHeader('Set-Cookie', buildSetCookie(token))

    res.json({ user: serializeCurrentUser(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// POST /logout
router.post('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', buildClearCookie())
  res.json({ success: true })
})

export default router
