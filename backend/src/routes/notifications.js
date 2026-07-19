import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// GET /:userName - get notifications for a user
router.get('/:userName', (req, res) => {
  try {
    const db = getDb();
    const notifications = db
      .prepare(
        `SELECT n.*, q.content as question_content, q.author as question_author,
                a.content as answer_content, a.author as answer_author
         FROM notifications n
         LEFT JOIN questions q ON n.question_id = q.id
         LEFT JOIN answers a ON n.answer_id = a.id
         WHERE n.user_name = ?
         ORDER BY n.created_at DESC`
      )
      .all(req.params.userName);

    res.json(notifications);
  } catch (err) {
    console.error('[GET /notifications/:userName]', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /:id/read - mark notification as read
router.post('/:id/read', (req, res) => {
  try {
    const db = getDb();
    const result = db
      .prepare('UPDATE notifications SET is_read = 1 WHERE id = ?')
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    res.json(notification);
  } catch (err) {
    console.error('[POST /notifications/:id/read]', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
