import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.resolve(__dirname, '../../data/users.json')

let data = null
let transactionDepth = 0

function createEmptyStore() {
  return {
    users: [],
    nextIds: {
      users: 1,
    },
  }
}

function ensureDbDir() {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadDb() {
  ensureDbDir()
  if (fs.existsSync(dbPath)) {
    const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    data = normalizeStore(raw)
    return
  }
  data = createEmptyStore()
}

function saveDb() {
  ensureDbDir()
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function normalizeStore(raw) {
  const store = raw && typeof raw === 'object' ? raw : createEmptyStore()
  store.users = Array.isArray(store.users) ? store.users : []
  const maxUserId = store.users.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  store.nextIds = {
    users: Math.max(maxUserId + 1, Number(store.nextIds?.users) || 1),
  }
  return store
}

function cloneStore(store) {
  return JSON.parse(JSON.stringify(store))
}

function nowIso() {
  return new Date().toISOString()
}

function unwrapParams(params) {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0]
  }
  return params
}

function get(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase()
  const values = unwrapParams(params)

  if (normalized === 'select * from users where id = ?') {
    const id = Number(values[0])
    const user = data.users.find((u) => Number(u.id) === id)
    return user ? { ...user } : null
  }

  if (normalized === 'select * from users where email = ?') {
    const email = String(values[0]).toLowerCase()
    const user = data.users.find((u) => u.email?.toLowerCase() === email)
    return user ? { ...user } : null
  }

  if (normalized === 'select count(*) as count from users') {
    return { count: data.users.length }
  }

  return null
}

function all(sql, params = []) {
  return []
}

function run(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase()
  const values = unwrapParams(params)

  if (normalized.startsWith('insert into users')) {
    const [email, passwordHash, nickname] = values
    const user = {
      id: data.nextIds.users++,
      email: String(email).trim().toLowerCase(),
      password_hash: String(passwordHash),
      nickname: nickname ? String(nickname).trim() : null,
      city: null,
      age: null,
      education: null,
      industry: null,
      marriage: null,
      tagline: null,
      lifeStory: null,
      canHelp: null,
      expertise: null,
      referrer: null,
      timeTags: [],
      hobbies: [],
      mbti: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    data.users.push(user)
    if (transactionDepth === 0) saveDb()
    return { lastInsertRowid: user.id, changes: 1 }
  }

  if (normalized.startsWith('update users')) {
    // Generic update: extract id from WHERE clause
    const idMatch = normalized.match(/where id = (\d+)/)
    const id = idMatch ? Number(idMatch[1]) : Number(values[values.length - 1])
    const user = data.users.find((u) => Number(u.id) === id)
    if (!user) {
      return { lastInsertRowid: null, changes: 0 }
    }

    // Parse SET clause
    const setMatch = normalized.match(/set\s+(.+?)\s+where/i)
    if (setMatch) {
      const setClause = setMatch[1]
      const pairs = setClause.split(',').map((s) => s.trim().split('='))
      for (const [key] of pairs) {
        const cleanKey = key.trim()
        const idx = pairs.indexOf([key])
        const val = values[idx]
        if (val !== undefined && cleanKey !== 'updated_at') {
          if (cleanKey === 'timeTags' || cleanKey === 'hobbies') {
            user[cleanKey] = typeof val === 'string' ? JSON.parse(val) : val
          } else {
            user[cleanKey] = val
          }
        }
      }
    }
    user.updated_at = nowIso()
    if (transactionDepth === 0) saveDb()
    return { lastInsertRowid: null, changes: 1 }
  }

  return { lastInsertRowid: null, changes: 0 }
}

function transaction(fn) {
  transactionDepth += 1
  const snapshot = cloneStore(data)
  try {
    const result = fn()
    saveDb()
    return result
  } catch (err) {
    data = snapshot
    throw err
  } finally {
    transactionDepth = Math.max(0, transactionDepth - 1)
  }
}

/**
 * Direct API for user operations (bypassing SQL emulation)
 */
export function findUserByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email])
}

export function findUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id])
}

export function createUser(email, passwordHash, nickname) {
  run('INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)', [email, passwordHash, nickname])
  return findUserByEmail(email)
}

export function updateUserProfile(userId, profile) {
  const userIdNum = Number(userId)
  const user = data.users.find((u) => Number(u.id) === userIdNum)
  if (!user) return null

  const updatableFields = [
    'nickname', 'city', 'age', 'education', 'industry', 'marriage',
    'tagline', 'lifeStory', 'canHelp', 'expertise', 'referrer',
    'timeTags', 'hobbies', 'mbti',
  ]

  for (const field of updatableFields) {
    if (profile[field] !== undefined) {
      user[field] = profile[field]
    }
  }
  user.updated_at = nowIso()
  saveDb()
  // Return a fresh copy (without password_hash) so callers get clean data
  return sanitizeUser(user)
}

export function sanitizeUser(user) {
  if (!user) return null
  const { password_hash, ...safe } = user
  return safe
}

export async function initUsersDb() {
  if (!data) {
    loadDb()
  }
  saveDb()
  console.log('[initUsersDb] Users database initialized.')
}

export function getDb() {
  return {
    prepare(sql) {
      return {
        get(...params) { return get(sql, params) },
        all(...params) { return all(sql, params) },
        run(...params) { return run(sql, params) },
      }
    },
    transaction(fn) {
      return () => transaction(fn)
    },
  }
}
