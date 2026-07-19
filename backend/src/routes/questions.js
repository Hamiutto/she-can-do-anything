const palette = ['#FFB5A7', '#B5D8F7', '#C9B1FF', '#FFD6A5', '#A8E6CF']
const validTimeTypes = ['survival', 'earning', 'beauty', 'fun', 'flow']

export function listPendingQuestions(db) {
  return db
    .prepare('SELECT * FROM questions WHERE status = ? ORDER BY created_at DESC')
    .all('pending')
}

export function getQuestionWithAnswers(db, id) {
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id)
  if (!question) return null

  const answers = db
    .prepare('SELECT * FROM answers WHERE question_id = ? ORDER BY created_at ASC')
    .all(id)

  return { ...question, answers }
}

export function createQuestion(db, payload) {
  const content = String(payload?.content || '').trim()
  const author = String(payload?.author || '').trim()
  const timeType = validTimeTypes.includes(payload?.time_type) ? payload.time_type : 'fun'
  const userId = payload?.user_id ? Number(payload.user_id) : null

  if (!content) {
    return { status: 400, error: 'Content is required' }
  }
  if (!author) {
    return { status: 400, error: 'Author is required' }
  }

  const px = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
  const py = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000
  const color = palette[Math.floor(Math.random() * palette.length)]

  const result = db
    .prepare(
      'INSERT INTO questions (content, author, time_type, particle_x, particle_y, color, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(content, author, timeType, px, py, color, userId)

  return getQuestionWithAnswers(db, result.lastInsertRowid)
}

export function answerQuestion(db, id, payload) {
  const content = String(payload?.content || '').trim()
  const author = String(payload?.author || '').trim()
  const userId = payload?.user_id ? Number(payload.user_id) : null

  if (!content) {
    return { status: 400, error: 'Content is required' }
  }
  if (!author) {
    return { status: 400, error: 'Author is required' }
  }

  const questionId = Number(id)
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId)
  if (!question) {
    return { status: 404, error: 'Question not found' }
  }

  if (question.status !== 'pending') {
    return { status: 400, error: 'Question has already been answered' }
  }

  db.transaction(() => {
    const answerResult = db
      .prepare('INSERT INTO answers (question_id, content, author, user_id) VALUES (?, ?, ?, ?)')
      .run(questionId, content, author, userId)

    db.prepare("UPDATE questions SET status = 'answered' WHERE id = ?").run(questionId)

    db.prepare(
      'INSERT INTO notifications (user_name, type, title, message, question_id, answer_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      question.author,
      'answer',
      `${author} 回答了你的问题`,
      content,
      questionId,
      answerResult.lastInsertRowid
    )
  })()

  return getQuestionWithAnswers(db, questionId)
}
