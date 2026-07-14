import { Router } from 'express'
import { getUsersCollection } from '../lib/db.js'
import { requireAuth } from '../lib/middleware.js'
import { serializeCurrentUser, serializePublicUser } from '../lib/serialize.js'

const router = Router()
const MONGO_URI = process.env.AUTH_MONGODB_URI || ''

// GET /me — 当前用户详情（含邮箱）
router.get('/me', async (req, res) => {
  try {
    const claims = requireAuth(req, res)
    if (!claims) return

    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ id: claims.id })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(serializeCurrentUser(user))
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// PUT /me — 更新当前用户
router.put('/me', async (req, res) => {
  try {
    const claims = requireAuth(req, res)
    if (!claims) return

    const { name, avatar, signature, region, bio } = req.body

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar
    if (signature !== undefined) updateData.signature = signature
    if (region !== undefined) updateData.region = region
    if (bio !== undefined) updateData.bio = bio
    updateData.updatedAt = new Date()

    const users = await getUsersCollection(MONGO_URI)
    await users.updateOne({ id: claims.id }, { $set: updateData })

    res.json({ success: true })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// GET /:id — 公开名片（无需登录）
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (!id) {
      return res.status(400).json({ error: '无效的用户 ID' })
    }

    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ id })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(serializePublicUser(user))
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
