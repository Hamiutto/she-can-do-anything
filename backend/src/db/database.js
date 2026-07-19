import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.resolve(__dirname, '../../data/questions.json')

let data = null
let transactionDepth = 0

function createEmptyStore() {
  return {
    questions: [],
    answers: [],
    notifications: [],
    nextIds: {
      questions: 1,
      answers: 1,
      notifications: 1,
    },
  }
}

function ensureDbDir() {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function normalizeStore(raw) {
  const store = raw && typeof raw === 'object' ? raw : createEmptyStore()
  store.questions = Array.isArray(store.questions) ? store.questions : []
  store.answers = Array.isArray(store.answers) ? store.answers : []
  store.notifications = Array.isArray(store.notifications) ? store.notifications : []
  const maxQuestionId = store.questions.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  const maxAnswerId = store.answers.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  const maxNotificationId = store.notifications.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  store.nextIds = {
    questions: Math.max(maxQuestionId + 1, Number(store.nextIds?.questions) || 1),
    answers: Math.max(maxAnswerId + 1, Number(store.nextIds?.answers) || 1),
    notifications: Math.max(maxNotificationId + 1, Number(store.nextIds?.notifications) || 1),
  }
  return store
}

function loadDb() {
  ensureDbDir()
  if (fs.existsSync(dbPath)) {
    const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    data = normalizeStore(raw)
    return
  }
  data = seedStore()
}

function saveDb() {
  ensureDbDir()
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function cloneStore(store) {
  return JSON.parse(JSON.stringify(store))
}

function unwrapParams(params) {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0]
  }
  return params
}

function nowIso() {
  return new Date().toISOString()
}

function seededTimestamp(index) {
  return new Date(Date.now() - index * 60_000).toISOString()
}

function seedStore() {
  const palette = ['#FFB5A7', '#B5D8F7', '#C9B1FF', '#FFD6A5', '#A8E6CF']
  const seedQuestions = [
    { content: '你觉得人生的意义是什么？', author: '小明', timeType: 'flow' },
    { content: '如果能回到过去，你最想改变什么？', author: '小红', timeType: 'fun' },
    { content: '你相信平行宇宙吗？', author: '阿杰', timeType: 'fun' },
    { content: '童年最快乐的回忆是什么？', author: '小华', timeType: 'fun' },
    { content: '你做过最勇敢的事是什么？', author: '小丽', timeType: 'flow' },
    { content: '你觉得AI会取代人类吗？', author: '大白', timeType: 'earning' },
    { content: '如果能拥有一个超能力，你选什么？', author: '闪电', timeType: 'fun' },
    { content: '你最想对10年后的自己说什么？', author: '远方', timeType: 'flow' },
    { content: '你觉得幸福是什么？', author: '暖暖', timeType: 'flow' },
    { content: '如果你可以瞬间学会一项技能，会是什么？', author: '学霸', timeType: 'earning' },
    { content: '你最喜欢的书是哪本？为什么？', author: '书虫', timeType: 'earning' },
    { content: '你觉得世界上最美的地方是哪里？', author: '旅行者', timeType: 'beauty' },
    { content: '如果明天是世界末日，你今天会做什么？', author: '哲学家', timeType: 'survival' },
    { content: '你最感恩的一件事是什么？', author: '感恩者', timeType: 'flow' },
    { content: '你觉得什么是真正的自由？', author: '追风', timeType: 'flow' },
  ]

  const store = createEmptyStore()
  seedQuestions.forEach((question, index) => {
    const px = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
    const py = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
    const color = palette[Math.floor(Math.random() * palette.length)]
    store.questions.push({
      id: store.nextIds.questions++,
      content: question.content,
      author: question.author,
      status: 'pending',
      time_type: question.timeType,
      particle_x: px,
      particle_y: py,
      color,
      created_at: seededTimestamp(index),
    })
  })

  return store
}

function get(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase()
  const values = unwrapParams(params)

  if (normalized === 'select count(*) as count from questions') {
    return { count: data.questions.length }
  }

  if (normalized === 'select * from questions where id = ?') {
    const id = Number(values[0])
    return data.questions.find((item) => Number(item.id) === id) || null
  }

  if (normalized === 'select * from notifications where id = ?') {
    const id = Number(values[0])
    return data.notifications.find((item) => Number(item.id) === id) || null
  }

  return null
}

function all(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase()
  const values = unwrapParams(params)

  if (normalized === 'select * from questions where status = ? order by created_at desc') {
    const status = String(values[0] ?? '')
    return data.questions
      .filter((item) => item.status === status)
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  }

  if (normalized === 'select * from answers where question_id = ? order by created_at asc') {
    const questionId = Number(values[0])
    return data.answers
      .filter((item) => Number(item.question_id) === questionId)
      .slice()
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  }

  if (
    normalized ===
    'select n.*, q.content as question_content, q.author as question_author, a.content as answer_content, a.author as answer_author from notifications n left join questions q on n.question_id = q.id left join answers a on n.answer_id = a.id where n.user_name = ? order by n.created_at desc'
  ) {
    const userName = String(values[0] ?? '')
    return data.notifications
      .filter((item) => item.user_name === userName)
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((item) => {
        const question = data.questions.find((entry) => Number(entry.id) === Number(item.question_id))
        const answer = data.answers.find((entry) => Number(entry.id) === Number(item.answer_id))
        return {
          ...item,
          question_content: question?.content ?? null,
          question_author: question?.author ?? null,
          answer_content: answer?.content ?? null,
          answer_author: answer?.author ?? null,
        }
      })
  }

  return []
}

function run(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase()
  const values = unwrapParams(params)

  if (normalized.startsWith('insert into questions')) {
    const [content, author, timeType, particleX, particleY, color, userId] = values
    const question = {
      id: data.nextIds.questions++,
      content: String(content).trim(),
      author: String(author).trim(),
      status: 'pending',
      time_type: String(timeType || 'fun'),
      particle_x: Number(particleX),
      particle_y: Number(particleY),
      color: String(color),
      user_id: userId ? Number(userId) : null,
      created_at: nowIso(),
    }
    data.questions.push(question)
    if (transactionDepth === 0) saveDb()
    return {
      lastInsertRowid: question.id,
      changes: 1,
    }
  }

  if (normalized.startsWith('insert into answers')) {
    const [questionId, content, author, userId] = values
    const answer = {
      id: data.nextIds.answers++,
      question_id: Number(questionId),
      content: String(content).trim(),
      author: String(author).trim(),
      user_id: userId ? Number(userId) : null,
      created_at: nowIso(),
    }
    data.answers.push(answer)
    if (transactionDepth === 0) saveDb()
    return {
      lastInsertRowid: answer.id,
      changes: 1,
    }
  }

  if (normalized.startsWith('insert into notifications')) {
    const [userName, type, title, message, questionId, answerId] = values
    const notification = {
      id: data.nextIds.notifications++,
      user_name: String(userName).trim(),
      type: String(type).trim(),
      title: String(title).trim(),
      message: String(message).trim(),
      question_id: questionId == null ? null : Number(questionId),
      answer_id: answerId == null ? null : Number(answerId),
      is_read: 0,
      created_at: nowIso(),
    }
    data.notifications.push(notification)
    if (transactionDepth === 0) saveDb()
    return {
      lastInsertRowid: notification.id,
      changes: 1,
    }
  }

  if (normalized === "update questions set status = 'answered' where id = ?") {
    const id = Number(values[0])
    const question = data.questions.find((item) => Number(item.id) === id)
    if (!question) {
      return { lastInsertRowid: null, changes: 0 }
    }
    question.status = 'answered'
    if (transactionDepth === 0) saveDb()
    return { lastInsertRowid: null, changes: 1 }
  }

  if (normalized === 'update notifications set is_read = 1 where id = ?') {
    const id = Number(values[0])
    const notification = data.notifications.find((item) => Number(item.id) === id)
    if (!notification) {
      return { lastInsertRowid: null, changes: 0 }
    }
    notification.is_read = 1
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

export async function initDb() {
  if (!data) {
    loadDb()
  }
  saveDb()
  console.log('[initDb] Database initialized.')
}

export function getDb() {
  return {
    prepare(sql) {
      return {
        get(...params) {
          return get(sql, params)
        },
        all(...params) {
          return all(sql, params)
        },
        run(...params) {
          return run(sql, params)
        },
      }
    },
    transaction(fn) {
      return () => transaction(fn)
    },
  }
}
