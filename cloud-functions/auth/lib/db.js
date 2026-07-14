import { MongoClient } from 'mongodb'
import dns from 'node:dns'

// 使用公共 DNS 服务器，解决 SRV 解析问题
dns.setServers(['8.8.8.8', '114.114.114.114'])

let client = null
let db = null

/**
 * 获取 MongoDB 数据库实例（带连接池复用）
 */
export async function getDb(uri) {
  if (db) return db

  if (!uri) {
    throw new Error('AUTH_MONGODB_URI is not configured')
  }

  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
  })
  await client.connect()
  db = client.db('auth')

  return db
}

export async function getUsersCollection(uri) {
  const database = await getDb(uri)
  return database.collection('users')
}

export async function getCountersCollection(uri) {
  const database = await getDb(uri)
  return database.collection('counters')
}

export async function getNextSequence(uri, name) {
  const counters = await getCountersCollection(uri)
  const result = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  )
  return result?.seq ?? 0
}
