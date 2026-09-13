const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [usageCount, limit] = await Promise.all([
      db.getUserDailyUsageCount(req.user.id),
      db.getDailyUsageLimit()
    ]);

    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    res.json({
      count: usageCount,
      limit,
      remaining: Math.max(0, limit - usageCount),
      resetAt: midnightUTC.toISOString()
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

module.exports = router;
