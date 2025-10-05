const express = require('express');
const { Question, QuizAttempt, QuizAnswer, Skill, sequelize } = require('../models');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.get('/skill/:skillId', async (req, res) => {
  try {
    const skillId = Number(req.params.skillId);
    const limit = Math.min(200, Number(req.query.limit) || 10);
    const where = { skillId };

    // If you have logic to randomize/select questions, keep it. Example:
    const rows = await Question.findAll({
      where,
      order: [['id', 'ASC']], // or randomize: sequelize.random()
      limit
    });

    // Ensure options are parsed as an array
    const parsed = (rows || []).map(r => {
      // if r is a Sequelize model instance:
      const plain = r.get ? r.get({ plain: true }) : r;
      if (plain.options && typeof plain.options === 'string') {
        try {
          plain.options = JSON.parse(plain.options);
        } catch (e) {
          // fallback: attempt pipe-separated or similar
          plain.options = String(plain.options).split('|').map((t, i) => ({ id: String(i), text: t.trim() }));
        }
      } else if (!plain.options) {
        plain.options = [];
      }
      return plain;
    });

    res.json(parsed);
  } catch (err) {
    console.error('GET /api/quiz/skill/:skillId error', err);
    res.status(500).json({ message: 'Failed to load quiz questions' });
  }
});

router.post('/attempt', auth, [ body('skillId').isNumeric(), body('answers').isArray({ min: 1 }) ], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { skillId, answers } = req.body;
    const userId = req.user.id;

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.findAll({ where: { id: questionIds } });

    let total = 0, score = 0;
    const answersToCreate = [];

    for (const q of questions) {
      const userAnswer = answers.find(a => a.questionId === q.id);
      const correct = String(q.correct_option);
      total += q.weight;
      const isCorrect = userAnswer && String(userAnswer.selected_option) === correct;
      const earned = isCorrect ? q.weight : 0;
      if (isCorrect) score += earned;

      answersToCreate.push({ questionId: q.id, selected_option: userAnswer ? userAnswer.selected_option : null, is_correct: !!isCorrect, points_earned: earned });
    }

    const attempt = await QuizAttempt.create({ userId, skillId, score, total, completed_at: new Date() });

    for (const a of answersToCreate) {
      await QuizAnswer.create({ attemptId: attempt.id, questionId: a.questionId, selected_option: a.selected_option, is_correct: a.is_correct, points_earned: a.points_earned });
    }

    res.json({ attemptId: attempt.id, score, total });
  } catch (err) { next(err); }
});

module.exports = router;
