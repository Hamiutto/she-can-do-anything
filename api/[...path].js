import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'
import { query, pool } from './_lib/db.js'
import { signToken, verifyRequest } from './_lib/auth.js'
import { applyCors, readJsonBody, sendJson } from './_lib/http.js'
import { createUser, findUserByEmail, findUserById, toApiUser, updateUserProfile } from './_lib/users.js'

const scryptAsync = promisify(scrypt)
const validTimeTypes = ['survival', 'earning', 'beauty', 'fun', 'flow']
const palette = ['#FFB5A7', '#B5D8F7', '#C9B1FF', '#FFD6A5', '#A8E6CF']

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

async function verifyPassword(password, hash) {
  const [salt, keyHex] = String(hash || '').split(':')
  if (!salt || !keyHex) return false
  const derivedKey = await scryptAsync(password, salt, 64)
  return derivedKey.toString('hex') === keyHex
}

function pathParts(req) {
  const raw = req.query.path
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') return raw.split('/').filter(Boolean)
  return []
}

function normalizeQuestion(row) {
  if (!row) return null
  return {
    ...row,
    particle_x: row.particle_x == null ? null : Number(row.particle_x),
    particle_y: row.particle_y == null ? null : Number(row.particle_y),
  }
}

async function getQuestionWithAnswers(id) {
  const questionResult = await query('select * from questions where id = $1', [id])
  const question = normalizeQuestion(questionResult.rows[0])
  if (!question) return null

  const answersResult = await query(
    'select * from answers where question_id = $1 order by created_at asc',
    [id]
  )

  return { ...question, answers: answersResult.rows }
}

async function handleRegister(req, res) {
  const { email, password, nickname } = await readJsonBody(req)

  if (!email || !password) {
    sendJson(res, 400, { error: '邮箱和密码不能为空' })
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendJson(res, 400, { error: '邮箱格式不正确' })
    return
  }

  if (password.length < 6) {
    sendJson(res, 400, { error: '密码至少需要 6 个字符' })
    return
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    sendJson(res, 409, { error: '该邮箱已注册' })
    return
  }

  const user = await createUser(email, await hashPassword(password), nickname || null)
  sendJson(res, 201, { token: signToken(user), user: toApiUser(user) })
}

async function handleLogin(req, res) {
  const { email, password } = await readJsonBody(req)

  if (!email || !password) {
    sendJson(res, 400, { error: '邮箱和密码不能为空' })
    return
  }

  const user = await findUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    sendJson(res, 401, { error: '邮箱或密码不正确' })
    return
  }

  sendJson(res, 200, { token: signToken(user), user: toApiUser(user) })
}

async function handleQuestions(req, res, parts, user) {
  if (req.method === 'GET' && parts.length === 1) {
    const { rows } = await query(
      "select * from questions where status = 'pending' order by created_at desc"
    )
    sendJson(res, 200, rows.map(normalizeQuestion))
    return
  }

  if (req.method === 'GET' && parts.length === 2) {
    const question = await getQuestionWithAnswers(Number(parts[1]))
    if (!question) {
      sendJson(res, 404, { error: 'Question not found' })
      return
    }
    sendJson(res, 200, question)
    return
  }

  if (req.method === 'POST' && parts.length === 1) {
    const body = await readJsonBody(req)
    const content = String(body.content || '').trim()
    const author = String(user?.nickname || body.author || '匿名用户').trim()
    const timeType = validTimeTypes.includes(body.time_type) ? body.time_type : 'fun'

    if (!content) {
      sendJson(res, 400, { error: 'Content is required' })
      return
    }

    const particleX = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
    const particleY = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
    const color = palette[Math.floor(Math.random() * palette.length)]

    const { rows } = await query(
      `insert into questions
       (content, author, time_type, particle_x, particle_y, color, user_id)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [content, author, timeType, particleX, particleY, color, user?.userId || null]
    )

    sendJson(res, 201, await getQuestionWithAnswers(rows[0].id))
    return
  }

  if (req.method === 'POST' && parts.length === 3 && parts[2] === 'answer') {
    const questionId = Number(parts[1])
    const body = await readJsonBody(req)
    const content = String(body.content || '').trim()
    const author = String(user?.nickname || body.author || '匿名用户').trim()

    if (!content) {
      sendJson(res, 400, { error: 'Content is required' })
      return
    }

    const client = await pool.connect()
    try {
      await client.query('begin')
      const questionResult = await client.query('select * from questions where id = $1 for update', [questionId])
      const question = questionResult.rows[0]
      if (!question) {
        await client.query('rollback')
        sendJson(res, 404, { error: 'Question not found' })
        return
      }
      if (question.status !== 'pending') {
        await client.query('rollback')
        sendJson(res, 400, { error: 'Question has already been answered' })
        return
      }

      const answerResult = await client.query(
        `insert into answers (question_id, content, author, user_id)
         values ($1, $2, $3, $4)
         returning id`,
        [questionId, content, author, user?.userId || null]
      )

      await client.query("update questions set status = 'answered' where id = $1", [questionId])
      await client.query(
        `insert into notifications
         (user_name, type, title, message, question_id, answer_id)
         values ($1, $2, $3, $4, $5, $6)`,
        [question.author, 'answer', `${author} 回答了你的问题`, content, questionId, answerResult.rows[0].id]
      )
      await client.query('commit')
      sendJson(res, 201, await getQuestionWithAnswers(questionId))
    } catch (err) {
      await client.query('rollback')
      throw err
    } finally {
      client.release()
    }
    return
  }

  sendJson(res, 405, { error: 'Method not allowed' })
}

async function handleProfile(req, res, parts, user) {
  if (req.method === 'GET' && parts.length === 1) {
    if (!user) {
      sendJson(res, 401, { error: '未登录' })
      return
    }
    const row = await findUserById(user.userId)
    if (!row) {
      sendJson(res, 404, { error: '用户不存在' })
      return
    }
    sendJson(res, 200, { user: toApiUser(row) })
    return
  }

  if (req.method === 'PUT' && parts.length === 1) {
    if (!user) {
      sendJson(res, 401, { error: '未登录' })
      return
    }
    const updated = await updateUserProfile(user.userId, await readJsonBody(req))
    if (!updated) {
      sendJson(res, 404, { error: '用户不存在' })
      return
    }
    sendJson(res, 200, { user: toApiUser(updated) })
    return
  }

  if (req.method === 'GET' && parts.length === 2) {
    const row = await findUserById(Number(parts[1]))
    if (!row) {
      sendJson(res, 404, { error: '用户不存在' })
      return
    }
    sendJson(res, 200, { user: toApiUser(row) })
    return
  }

  sendJson(res, 405, { error: 'Method not allowed' })
}

async function handleNotifications(req, res, parts) {
  if (req.method === 'GET' && parts.length === 2) {
    const { rows } = await query(
      `select n.*, q.content as question_content, q.author as question_author,
              a.content as answer_content, a.author as answer_author
       from notifications n
       left join questions q on n.question_id = q.id
       left join answers a on n.answer_id = a.id
       where n.user_name = $1
       order by n.created_at desc`,
      [decodeURIComponent(parts[1])]
    )
    sendJson(res, 200, rows)
    return
  }

  if (req.method === 'POST' && parts.length === 3 && parts[2] === 'read') {
    const { rows } = await query(
      'update notifications set is_read = true where id = $1 returning *',
      [Number(parts[1])]
    )
    if (!rows[0]) {
      sendJson(res, 404, { error: 'Notification not found' })
      return
    }
    sendJson(res, 200, rows[0])
    return
  }

  sendJson(res, 405, { error: 'Method not allowed' })
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  const parts = pathParts(req)
  const user = verifyRequest(req)

  try {
    if (req.method === 'GET' && parts[0] === 'health') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
      return
    }

    if (parts[0] === 'auth') {
      if (req.method === 'POST' && parts[1] === 'register') return handleRegister(req, res)
      if (req.method === 'POST' && parts[1] === 'login') return handleLogin(req, res)
      if (req.method === 'GET' && parts[1] === 'me') return sendJson(res, user ? 200 : 401, user ? { user } : { error: '未登录' })
      if (req.method === 'POST' && parts[1] === 'logout') return sendJson(res, 200, { ok: true })
    }

    if (parts[0] === 'questions') return handleQuestions(req, res, parts, user)
    if (parts[0] === 'profile') return handleProfile(req, res, parts, user)
    if (parts[0] === 'notifications') return handleNotifications(req, res, parts)

    sendJson(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('[api]', err)
    sendJson(res, 500, { error: 'Internal server error' })
  }
}
