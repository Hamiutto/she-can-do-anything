import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'
import { findUserByEmail, createUser, sanitizeUser } from '../db/users.js'
import { signToken } from '../middleware/auth.js'

const scryptAsync = promisify(scrypt)

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

async function verifyPassword(password, hash) {
  const [salt, keyHex] = hash.split(':')
  const derivedKey = await scryptAsync(password, salt, 64)
  return derivedKey.toString('hex') === keyHex
}

/**
 * POST /api/auth/register
 * Body: { email, password, nickname? }
 */
export async function handleRegister(sendJson, body) {
  const { email, password, nickname } = body

  if (!email || !password) {
    sendJson(400, { error: '邮箱和密码不能为空' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    sendJson(400, { error: '邮箱格式不正确' })
    return
  }

  if (password.length < 6) {
    sendJson(400, { error: '密码至少需要 6 个字符' })
    return
  }

  const existing = findUserByEmail(email)
  if (existing) {
    sendJson(409, { error: '该邮箱已注册' })
    return
  }

  const passwordHash = await hashPassword(password)
  const user = createUser(email, passwordHash, nickname || null)

  const token = signToken(user)
  sendJson(201, {
    token,
    user: sanitizeUser(user),
  })
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function handleLogin(sendJson, body) {
  const { email, password } = body

  if (!email || !password) {
    sendJson(400, { error: '邮箱和密码不能为空' })
    return
  }

  const user = findUserByEmail(email)
  if (!user) {
    sendJson(401, { error: '邮箱或密码不正确' })
    return
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    sendJson(401, { error: '邮箱或密码不正确' })
    return
  }

  const token = signToken(user)
  sendJson(200, {
    token,
    user: sanitizeUser(user),
  })
}

/**
 * GET /api/auth/me
 * Requires: Authorization: Bearer <token>
 */
export function handleMe(sendJson, user) {
  if (!user) {
    sendJson(401, { error: '未登录' })
    return
  }
  sendJson(200, { user })
}

/**
 * POST /api/auth/logout
 * In a stateless JWT system, logout is a client-side operation.
 * We just return success.
 */
export function handleLogout(sendJson) {
  sendJson(200, { ok: true })
}
