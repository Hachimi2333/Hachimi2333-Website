/**
 * 用户数据序列化函数
 * 根据不同场景返回不同的字段集合
 */

// 公开资料（游客可见）- 用于名片展示
export function serializePublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar || null,
    signature: user.signature || null,
    region: user.region || null,
    bio: user.bio || null,
    createdAt: user.createdAt,
  }
}

// 个人信息（本人可见）- 包含邮箱等敏感信息
export function serializeCurrentUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    signature: user.signature || null,
    region: user.region || null,
    bio: user.bio || null,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// 管理员查看（管理员可见）- 完整信息
export function serializeAdminUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    signature: user.signature || null,
    region: user.region || null,
    bio: user.bio || null,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
