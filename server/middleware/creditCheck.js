const db = require('../database');

async function creditCheckMiddleware(req, res, next) {
  try {
    if (!req.user) return next();

    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const balance = user.credits_balance || 0;
    const creditCost = 1;

    if (balance < creditCost) {
      return res.status(403).json({
        error: 'Insufficient credits',
        balance,
        cost: creditCost,
        plan: user.plan_id || 'free',
        upgradeUrl: '/pricing'
      });
    }

    req.creditCost = creditCost;
    res.setHeader('X-Credits-Balance', String(balance));
    res.setHeader('X-Credits-Cost', String(creditCost));
    next();
  } catch (error) {
    console.error('Credit check error:', error);
    next();
  }
}

module.exports = { creditCheckMiddleware };
