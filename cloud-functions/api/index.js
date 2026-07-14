import 'dotenv/config'
import express from 'express'
import authRoutes from '../auth/routes/auth.js'
import userRoutes from '../auth/routes/users.js'
import adminRoutes from '../auth/routes/admin.js'

const app = express()
app.use(express.json())

// ============================================================
// CORS
// ============================================================
const FRONTEND_ORIGIN = process.env.AUTH_FRONTEND_ORIGIN || 'https://hachimi2333.top'
const ALLOWED_ORIGINS = FRONTEND_ORIGIN.split(',').map(s => s.trim())

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

// ============================================================
// 路由
// ============================================================
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/admin', adminRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================
// 导出（不能调用 app.listen()）
// ============================================================
export default app
