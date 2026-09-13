const db = require('../database');

async function usageLimitMiddleware(req, res, next) {
  try {
    if (!req.user) return next();

    const [usageCount, limit] = await Promise.all([
      db.getUserDailyUsageCount(req.user.id),
      db.getDailyUsageLimit()
    ]);

    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const resetAt = midnightUTC.toISOString();

    res.set('X-Usage-Count', String(usageCount));
    res.set('X-Usage-Limit', String(limit));
    res.set('X-Usage-Reset', resetAt);

    if (usageCount >= limit) {
      return res.status(429).json({
        error: 'Daily message limit reached',
        usage: { count: usageCount, limit, resetAt }
      });
    }

    next();
  } catch (error) {
    console.error('Usage limit middleware error:', error);
    next();
  }
}

module.exports = { usageLimitMiddleware };
