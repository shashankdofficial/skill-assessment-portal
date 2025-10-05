// backend/src/routes/skills.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const models = require('../models');
const { Skill } = models;
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');

/**
 * GET /api/skills
 * Query params:
 *  - page (1-indexed)
 *  - limit
 *  - search (search in name or description)
 *
 * If no query params provided, it returns the full array (backwards-compatible).
 */
router.get('/', async (req, res) => {
  try {
    const hasParams = Object.keys(req.query).length > 0;
    const { page, limit, search } = req.query;

    // If no query params: return full array (keeps old dropdowns working)
    if (!hasParams) {
      const skills = await Skill.findAll({ order: [['id', 'ASC']] });
      return res.json(skills);
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(200, Number(limit) || 5);
    const offset = (pg - 1) * lim;
    const where = {};

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { description: { [Op.like]: q } }
      ];
    }

    const { rows, count } = await Skill.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit: lim,
      offset
    });

    res.json({
      rows,
      count,
      page: pg,
      limit: lim,
      totalPages: Math.max(1, Math.ceil((count || 0) / lim))
    });
  } catch (err) {
    console.error('GET /api/skills error', err);
    res.status(500).json({ message: 'Failed to fetch skills' });
  }
});

/**
 * POST /api/skills
 * Admin only - create new skill
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const skill = await Skill.create({ name, description });
    res.status(201).json(skill);
  } catch (err) {
    console.error('POST /api/skills error', err);
    res.status(500).json({ message: 'Failed to create skill' });
  }
});

/**
 * PUT /api/skills/:id
 * Admin only - update
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    await skill.update(req.body);
    res.json(skill);
  } catch (err) {
    console.error('PUT /api/skills/:id error', err);
    res.status(500).json({ message: 'Failed to update skill' });
  }
});

/**
 * DELETE /api/skills/:id
 * Admin only - delete
 */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    await skill.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/skills/:id error', err);
    res.status(500).json({ message: 'Failed to delete skill' });
  }
});

module.exports = router;
