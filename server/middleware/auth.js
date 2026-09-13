const db = require('../database');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Try session-based auth first
    const session = await db.getSessionByToken(token);
    if (session) {
      req.user = {
        id: session.user_id,
        username: session.username,
        email: session.email,
        role: session.role
      };

      const banCheck = await db.getPool().query('SELECT is_banned, ban_reason FROM users WHERE id = $1', [session.user_id]);
      if (banCheck.rows[0]?.is_banned) {
        return res.status(403).json({ error: 'Account banned', reason: banCheck.rows[0].ban_reason || 'No reason provided' });
      }

      const clientIp = req.ip || req.connection?.remoteAddress || '';
      if (clientIp && await db.isIpBanned(clientIp)) {
        return res.status(403).json({ error: 'IP address banned' });
      }

      return next();
    }

    // Fallback to JWT auth (for Discord OAuth tokens)
    if (JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.getUserById(decoded.id);
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          };
          return next();
        }
      } catch (e) {
        // JWT invalid or expired, fall through
      }
    }

    // Fallback: look up user directly by token as user_id (for Discord OAuth users)
    try {
      const user = await db.getPool().query(
        'SELECT id, username, email, role FROM users WHERE id = $1',
        [token]
      );
      if (user.rows.length > 0) {
        req.user = user.rows[0];
        return next();
      }
    } catch (e) {
      // ignore
    }

    return res.status(401).json({ error: 'Invalid or expired token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
