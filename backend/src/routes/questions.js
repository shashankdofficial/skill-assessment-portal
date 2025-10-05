// backend/src/routes/questions.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { Question } = require('../models');
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');

/**
 * GET /api/questions
 * Supports optional ?skillId, ?page, ?limit, ?search
 */
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { skillId, search } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Number(req.query.limit) || 5);
    const offset = (page - 1) * limit;

    const where = {};
    if (skillId) where.skillId = skillId;
    if (search) {
      where[Op.or] = [
        { text: { [Op.like]: `%${search}%` } },
        { options: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit,
      offset
    });

    // parse JSON options for frontend
    const parsed = rows.map(r => {
      const plain = r.get({ plain: true });
      try {
        plain.options = typeof plain.options === 'string' ? JSON.parse(plain.options) : plain.options;
      } catch (e) {}
      return plain;
    });

    res.json({
      rows: parsed,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('GET /api/questions error', err);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

/**
 * GET /api/questions/:id
 */
router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    const plain = q.get({ plain: true });
    plain.options = typeof plain.options === 'string' ? JSON.parse(plain.options) : plain.options;
    res.json(plain);
  } catch (err) {
    console.error('GET /api/questions/:id error', err);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

/**
 * POST /api/questions
 * Admin only — validate inputs properly
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('skillId').isNumeric(),
    body('text').isLength({ min: 3 }),
    body('options').isArray({ min: 2 }),
    body('correct_option').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { skillId, text, options, correct_option, weight } = req.body;
      const q = await Question.create({
        skillId,
        text,
        options: JSON.stringify(options),
        correct_option,
        weight: weight || 1
      });
      res.status(201).json(q);
    } catch (err) {
      console.error('POST /api/questions error', err);
      res.status(500).json({ message: 'Failed to create question' });
    }
  }
);

/**
 * PUT /api/questions/:id — Update question
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });

    const update = { ...req.body };
    if (update.options && Array.isArray(update.options)) {
      update.options = JSON.stringify(update.options);
    }

    await q.update(update);
    const output = q.get({ plain: true });
    output.options = typeof output.options === 'string' ? JSON.parse(output.options) : output.options;
    res.json(output);
  } catch (err) {
    console.error('PUT /api/questions/:id error', err);
    res.status(500).json({ message: 'Failed to update question' });
  }
});

/**
 * DELETE /api/questions/:id
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    await q.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/questions/:id error', err);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

module.exports = router;
