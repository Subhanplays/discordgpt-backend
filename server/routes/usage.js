const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    const subscription = await db.getUserSubscription(req.user.id);
    const balance = user ? user.credits_balance || 0 : 0;
    const plan = subscription ? {
      id: subscription.plan_id,
      name: subscription.plan_name,
      display_name: subscription.display_name,
      credits_per_month: subscription.credits_per_month,
      max_servers: subscription.max_servers,
      ai_access_level: subscription.ai_access_level
    } : { id: 'free', name: 'free', display_name: 'Free', credits_per_month: 50, max_servers: 3, ai_access_level: 'basic' };

    res.json({
      count: user ? user.credits_used_this_month || 0 : 0,
      limit: plan.credits_per_month,
      remaining: balance,
      balance,
      plan,
      resetAt: null
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

module.exports = router;
