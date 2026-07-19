import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.resolve(__dirname, '../../data/questions.db')

let SQL
let db = null

async function ensureDbDir() {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function loadDb() {
  await ensureDbDir()
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }
}

function saveDb() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

// Helper: run a query and return the first row
function get(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  if (stmt.step()) {
    const row = stmt.getAsObject()
    stmt.free()
    return row
  }
  stmt.free()
  return null
}

// Helper: run a query and return all rows
function all(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// Helper: run an INSERT/UPDATE/DELETE and return metadata
function run(sql, params = []) {
  db.run(sql, params)
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]
  const changes = db.exec('SELECT changes() as changes')[0]
  return {
    lastInsertRowid: lastId ? lastId.values[0][0] : null,
    changes: changes ? changes.values[0][0] : 0,
  }
}

// Transaction helper
function transaction(fn) {
  try {
    db.run('BEGIN TRANSACTION')
    const result = fn()
    db.run('COMMIT')
    return result
  } catch (err) {
    db.run('ROLLBACK')
    throw err
  }
}

export async function initDb() {
  const wasmPath = path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm')
  SQL = await initSqlJs({ locateFile: () => wasmPath })
  await loadDb()

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      time_type TEXT NOT NULL DEFAULT 'fun',
      particle_x REAL NOT NULL,
      particle_y REAL NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      question_id INTEGER,
      answer_id INTEGER,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id),
      FOREIGN KEY (answer_id) REFERENCES answers(id)
    )
  `)

  // Check if we need to seed data
  const count = get('SELECT COUNT(*) as count FROM questions')
  if (!count || count.count === 0) {
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

    const insertSql = 'INSERT INTO questions (content, author, time_type, particle_x, particle_y, color) VALUES (?, ?, ?, ?, ?, ?)'
    for (const q of seedQuestions) {
      const px = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
      const py = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
      const color = palette[Math.floor(Math.random() * palette.length)]
      db.run(insertSql, [q.content, q.author, q.timeType, px, py, color])
    }

    console.log(`[initDb] Seeded ${seedQuestions.length} questions.`)
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
      // Return a function that, when called, executes the transaction
      return () => transaction(fn)
    },
  }
}
