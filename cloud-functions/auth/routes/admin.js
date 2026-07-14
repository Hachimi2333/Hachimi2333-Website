import { Router } from 'express'
import { getUsersCollection } from '../lib/db.js'
import { requireAdmin } from '../lib/middleware.js'
import { serializeAdminUser } from '../lib/serialize.js'

const router = Router()
const MONGO_URI = process.env.AUTH_MONGODB_URI || ''

// GET /users — 用户列表
router.get('/users', async (req, res) => {
  try {
    const claims = requireAdmin(req, res)
    if (!claims) return

    const users = await getUsersCollection(MONGO_URI)
    const allUsers = await users.find({}).sort({ id: 1 }).toArray()

    res.json(allUsers.map(serializeAdminUser))
  } catch (err) {
    console.error('List users error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// GET /users/:id — 用户详情
router.get('/users/:id', async (req, res) => {
  try {
    const claims = requireAdmin(req, res)
    if (!claims) return

    const id = parseInt(req.params.id)
    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ id })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(serializeAdminUser(user))
  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// PUT /users/:id — 更新用户
router.put('/users/:id', async (req, res) => {
  try {
    const claims = requireAdmin(req, res)
    if (!claims) return

    const id = parseInt(req.params.id)
    const { name, email, avatar, signature, region, bio, isAdmin } = req.body

    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ id })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (avatar !== undefined) updateData.avatar = avatar
    if (signature !== undefined) updateData.signature = signature
    if (region !== undefined) updateData.region = region
    if (bio !== undefined) updateData.bio = bio
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin
    updateData.updatedAt = new Date()

    await users.updateOne({ id }, { $set: updateData })

    res.json({ success: true })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// DELETE /users/:id — 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const claims = requireAdmin(req, res)
    if (!claims) return

    const id = parseInt(req.params.id)
    if (claims.id === id) {
      return res.status(400).json({ error: '不能删除自己的账户' })
    }

    const users = await getUsersCollection(MONGO_URI)
    const user = await users.findOne({ id })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    await users.deleteOne({ id })

    res.json({ success: true })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
