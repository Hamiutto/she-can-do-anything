import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// GET / - get all pending questions
router.get('/', (_req, res) => {
  try {
    const db = getDb();
    const questions = db
      .prepare('SELECT * FROM questions WHERE status = ? ORDER BY created_at DESC')
      .all('pending');
    res.json(questions);
  } catch (err) {
    console.error('[GET /questions]', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /:id - get single question with its answers
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const question = db
      .prepare('SELECT * FROM questions WHERE id = ?')
      .get(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answers = db
      .prepare('SELECT * FROM answers WHERE question_id = ? ORDER BY created_at ASC')
      .all(req.params.id);

    res.json({ ...question, answers });
  } catch (err) {
    console.error('[GET /questions/:id]', err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// POST / - create new question
router.post('/', (req, res) => {
  try {
    const { content, author, time_type } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!author || !author.trim()) {
      return res.status(400).json({ error: 'Author is required' });
    }

    const palette = ['#FFB5A7', '#B5D8F7', '#C9B1FF', '#FFD6A5', '#A8E6CF'];
    const validTimeTypes = ['survival', 'earning', 'beauty', 'fun', 'flow'];
    const timeType = validTimeTypes.includes(time_type) ? time_type : 'fun';
    const px = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000;
    const py = Math.round((0.3 + Math.random() * 0.4) * 1000) / 1000;
    const color = palette[Math.floor(Math.random() * palette.length)];

    const db = getDb();
    const result = db
      .prepare(
        'INSERT INTO questions (content, author, time_type, particle_x, particle_y, color) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(content.trim(), author.trim(), timeType, px, py, color);

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(question);
  } catch (err) {
    console.error('[POST /questions]', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// POST /:id/answer - answer a question
router.post('/:id/answer', (req, res) => {
  try {
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!author || !author.trim()) {
      return res.status(400).json({ error: 'Author is required' });
    }

    const db = getDb();
    const questionId = parseInt(req.params.id, 10);

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.status !== 'pending') {
      return res.status(400).json({ error: 'Question has already been answered' });
    }

    const runTransaction = db.transaction(() => {
      // Insert answer
      const answerResult = db
        .prepare('INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)')
        .run(questionId, content.trim(), author.trim());

      // Update question status
      db.prepare("UPDATE questions SET status = 'answered' WHERE id = ?").run(questionId);

      // Create notification for the question author
      db.prepare(
        'INSERT INTO notifications (user_name, type, title, message, question_id, answer_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        question.author,
        'answer',
        `${author} 回答了你的问题`,
        content.trim(),
        questionId,
        answerResult.lastInsertRowid
      );
    });

    runTransaction();

    const questionWithAnswers = db
      .prepare('SELECT * FROM questions WHERE id = ?')
      .get(questionId);
    const answers = db
      .prepare('SELECT * FROM answers WHERE question_id = ? ORDER BY created_at ASC')
      .all(questionId);

    res.status(201).json({ ...questionWithAnswers, answers });
  } catch (err) {
    console.error('[POST /questions/:id/answer]', err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
