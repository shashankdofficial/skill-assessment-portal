// backend/src/routes/report.js
const express = require('express');
const router = express.Router();
const { fn, col, literal, Op } = require('sequelize');
const models = require('../models'); // adjust if your project exports differently
const { User, Skill, Question, QuizAttempt, sequelize } = models;

// auth and role middlewares — adjust paths if your middlewares live elsewhere
const requireAuth = require('../middlewares/auth');
const requireRole = require('../middlewares/role'); // expects usage: requireRole('admin') or requireRole('user')

/**
 * GET /api/reports/time
 * Returns a summary (avg score and attempt count) grouped by user over last N days.
 * Response: { byUser: [{ userId, avg_score, attempts }] }
 */
router.get('/time', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Use Op.gte here (imported above)
    const rows = await QuizAttempt.findAll({
      attributes: [
        'userId',
        [fn('AVG', col('score')), 'avg_score'],
        [fn('COUNT', col('id')), 'attempts']
      ],
      where: {
        created_at: { [Op.gte]: since } // if your columns are underscored use created_at; else createdAt
      },
      group: ['userId'],
      raw: true
    });

    res.json({ byUser: rows });
  } catch (err) {
    console.error('GET /api/reports/time error', err);
    res.status(500).json({ message: 'Failed to compute time report' });
  }
});

/**
 * GET /api/reports/user/:userId
 * Returns all quiz attempts for a user (latest first)
 */
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== 'admin' && String(req.user.id) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Try to detect the alias used for Skill on QuizAttempt
    let skillInclude = null;
    try {
      const assocKeys = Object.keys(QuizAttempt.associations || {});
      for (const key of assocKeys) {
        const assoc = QuizAttempt.associations[key];
        if (assoc && assoc.target && assoc.target.name === (Skill && Skill.name)) {
          skillInclude = { model: Skill, as: assoc.as || key, attributes: ['id', 'name'] };
          break;
        }
      }
    } catch (e) {
      console.warn('Skill alias detection failed:', e && e.message);
    }

    const includeArr = skillInclude ? [skillInclude] : [{ model: Skill, attributes: ['id', 'name'] }];

    const attempts = await QuizAttempt.findAll({
      where: { userId },
      include: includeArr,
      order: [['createdAt', 'DESC']]
    });

    res.json({ attempts });
  } catch (err) {
    console.error('GET /api/reports/user/:userId error', err);
    res.status(500).json({ message: 'Failed to fetch user reports' });
  }
});


/**
 * GET /api/reports/skill-gaps?userId=...&threshold=60
 * Compare user's avg per skill vs global avg per skill and return gaps where userAvg < threshold
 * Response: [{ skillId, skillName, userAvg, globalAvg, pct }]
 */
// skill-gaps handler: computes average percentages (score/total * 100)
router.get('/skill-gaps', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'userId query parameter is required' });

    const threshold = Number(req.query.threshold || 0);

    // Use raw SQL expressions to compute percentage per attempt then average across attempts.
    // This works even if score/total are integers.
    // Sequelize.fn/literal used to compute: AVG((score / NULLIF(total,0)) * 100)
    const userRows = await QuizAttempt.findAll({
      attributes: [
        ['skill_id', 'skillId'],
        [fn('AVG', literal('((score * 1.0) / NULLIF(total, 0)) * 100')), 'userAvg'],
        [fn('COUNT', col('id')), 'userAttempts']
      ],
      where: { user_id: userId },
      group: ['skill_id'],
      raw: true
    });

    const globalRows = await QuizAttempt.findAll({
      attributes: [
        ['skill_id', 'skillId'],
        [fn('AVG', literal('((score * 1.0) / NULLIF(total, 0)) * 100')), 'globalAvg'],
        [fn('COUNT', col('id')), 'globalAttempts']
      ],
      group: ['skill_id'],
      raw: true
    });

    const userMap = {};
    userRows.forEach(r => userMap[String(r.skillId)] = { userAvg: Number(r.userAvg || 0), userAttempts: Number(r.userAttempts || 0) });

    const globalMap = {};
    globalRows.forEach(r => globalMap[String(r.skillId)] = { globalAvg: Number(r.globalAvg || 0), globalAttempts: Number(r.globalAttempts || 0) });

    // Fetch all skills so skills with zero attempts show up
    const allSkills = await Skill.findAll({ attributes: ['id', 'name'], order: [['id','ASC']] });

    const gaps = [];
    for (const s of allSkills) {
      const sid = String(s.id);
      const u = userMap[sid] || { userAvg: 0, userAttempts: 0 };
      const g = globalMap[sid] || { globalAvg: 0, globalAttempts: 0 };

      const userAvg = Number(u.userAvg || 0);
      const globalAvg = Number(g.globalAvg || 0);
      const gap = Math.round((globalAvg - userAvg) * 100) / 100;
      const pctBelow = globalAvg === 0 ? 0 : Math.round(((globalAvg - userAvg) / globalAvg) * 100);

      const item = {
        skillId: s.id,
        skillName: s.name,
        userAvg,
        userAttempts: u.userAttempts,
        globalAvg,
        globalAttempts: g.globalAttempts,
        gap,
        pctBelow
      };

      if (!threshold || userAvg < threshold) gaps.push(item);
    }

    // sort by largest gap desc
    gaps.sort((a, b) => b.gap - a.gap);

    res.json(gaps);
  } catch (err) {
    console.error('GET /api/reports/skill-gaps error', err);
    res.status(500).json({ message: 'Failed to compute skill gaps' });
  }
});


module.exports = router;
