export function listNotifications(db, userName) {
  return db
    .prepare(
      `SELECT n.*, q.content as question_content, q.author as question_author,
              a.content as answer_content, a.author as answer_author
       FROM notifications n
       LEFT JOIN questions q ON n.question_id = q.id
       LEFT JOIN answers a ON n.answer_id = a.id
       WHERE n.user_name = ?
       ORDER BY n.created_at DESC`
    )
    .all(userName)
}

export function markNotificationRead(db, id) {
  const result = db
    .prepare('UPDATE notifications SET is_read = 1 WHERE id = ?')
    .run(id)

  if (result.changes === 0) {
    return null
  }

  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id)
}
