// // backend/src/routes/adminUsers.js
// const express = require('express');
// const router = express.Router();
// const models = require('../models');
// const { User } = models;
// const requireAuth = require('../middlewares/auth');
// const requireRole = require('../middlewares/role');

// router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ['id', 'name', 'email', 'role'],
//       order: [['id', 'ASC']]
//     });
//     res.json(users);
//   } catch (err) {
//     console.error('GET /api/admin/users error', err);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// });

// module.exports = router;


// backend/src/routes/adminUsers.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const models = require('../models');
const { User, QuizAttempt } = models;
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');

/**
 * GET /api/admin/users
 * Supports:
 *   - pagination & search (if query params provided)
 *   - raw array output (for dropdowns if no pagination params)
 */
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const hasParams = Object.keys(req.query).length > 0;
    const { page, limit, search } = req.query;

    // When AdminReports (no pagination) calls this — return simple array
    if (!hasParams) {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role'],
        order: [['id', 'ASC']]
      });
      return res.json(users);
    }

    // Pagination / search mode
    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(200, Number(limit) || 5);
    const offset = (pg - 1) * lim;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      limit: lim,
      offset,
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt']
    });

    res.json({ rows, count, page: pg, limit: lim });
  } catch (err) {
    console.error('GET /api/admin/users error', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * PUT/PATCH /api/admin/users/:id — update role or active
 */
router.put('/users/:id', requireAuth, requireRole('admin'), updateUser);
router.patch('/users/:id', requireAuth, requireRole('admin'), updateUser);

async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { role, active, name } = req.body;
    if (role) user.role = role;
    if (typeof active !== 'undefined') user.active = !!active;
    if (name) user.name = name;

    await user.save();
    res.json({ message: 'Updated', user });
  } catch (err) {
    console.error('PUT/PATCH /api/admin/users/:id error', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
}


/**
 * DELETE /api/admin/users/:id — soft deactivate
 */
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.active = false;
    await user.save();
    res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error', err);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

/**
 * Optional — get user attempts summary
 */
router.get('/users/:id/attempts', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { user_id: req.params.id },
      include: [{ model: models.Skill, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ attempts });
  } catch (err) {
    console.error('GET /api/admin/users/:id/attempts error', err);
    res.status(500).json({ message: 'Failed to load attempts' });
  }
});

module.exports = router;
