import { createServer } from 'node:http'
import { URL } from 'node:url'
import { initDb, getDb } from './db/database.js'
import { answerQuestion, createQuestion, getQuestionWithAnswers, listPendingQuestions } from './routes/questions.js'
import { listNotifications, markNotificationRead } from './routes/notifications.js'

const PORT = Number(process.env.PORT || 3001)

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function notFound(res) {
  sendJson(res, 404, { error: 'Not found' })
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: 'Method not allowed' })
}

function extractId(parts) {
  const id = Number(parts[2])
  return Number.isFinite(id) ? id : null
}

await initDb()

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const parts = url.pathname.split('/').filter(Boolean)
  const db = getDb()

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
      return
    }

    if (parts[0] !== 'api') {
      notFound(res)
      return
    }

    if (parts[1] === 'questions') {
      if (req.method === 'GET' && parts.length === 2) {
        sendJson(res, 200, listPendingQuestions(db))
        return
      }

      if (req.method === 'GET' && parts.length === 3) {
        const question = getQuestionWithAnswers(db, extractId(parts))
        if (!question) {
          sendJson(res, 404, { error: 'Question not found' })
          return
        }
        sendJson(res, 200, question)
        return
      }

      if (req.method === 'POST' && parts.length === 2) {
        const body = await readJsonBody(req)
        const result = createQuestion(db, body)
        if (result?.error) {
          sendJson(res, result.status || 400, { error: result.error })
          return
        }
        sendJson(res, 201, result)
        return
      }

      if (req.method === 'POST' && parts.length === 4 && parts[3] === 'answer') {
        const body = await readJsonBody(req)
        const result = answerQuestion(db, extractId(parts), body)
        if (result?.error) {
          sendJson(res, result.status || 400, { error: result.error })
          return
        }
        sendJson(res, 201, result)
        return
      }

      methodNotAllowed(res)
      return
    }

    if (parts[1] === 'notifications') {
      if (req.method === 'GET' && parts.length === 3) {
        sendJson(res, 200, listNotifications(db, decodeURIComponent(parts[2])))
        return
      }

      if (req.method === 'POST' && parts.length === 4 && parts[3] === 'read') {
        const notification = markNotificationRead(db, extractId(parts))
        if (!notification) {
          sendJson(res, 404, { error: 'Notification not found' })
          return
        }
        sendJson(res, 200, notification)
        return
      }

      methodNotAllowed(res)
      return
    }

    notFound(res)
  } catch (err) {
    console.error('[backend]', err)
    sendJson(res, 500, { error: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
