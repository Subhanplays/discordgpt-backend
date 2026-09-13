const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await db.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await db.createUser(username, email, password);

    const expiryMs = parseInt(process.env.SESSION_EXPIRY) || 86400000;
    const session = await db.createSession(user.id, expiryMs);

    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role, plan_id: 'free', credits_balance: 50 },
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordHash = db.hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.updateUserLastLogin(user.id);

    const expiryMs = parseInt(process.env.SESSION_EXPIRY) || 86400000;
    const session = await db.createSession(user.id, expiryMs);

    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role, plan_id: user.plan_id || 'free', credits_balance: user.credits_balance || 0 },
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    await db.deleteSession(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      plan_id: user.plan_id || 'free',
      credits_balance: user.credits_balance || 0,
      credits_used_this_month: user.credits_used_this_month || 0,
      created_at: user.created_at,
      last_login: user.last_login,
      discord_id: user.discord_id || null,
      discord_avatar: user.discord_avatar || null,
      discord_discriminator: user.discord_discriminator || '0',
      discord_banner: user.discord_banner || null,
      discord_accent_color: user.discord_accent_color || null,
      discord_public_flags: user.discord_public_flags || 0,
      discord_locale: user.discord_locale || 'en-US',
      discord_mfa_enabled: user.discord_mfa_enabled || false,
      two_fa_enabled: user.two_fa_enabled || false
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/session', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token: req.headers.authorization.split(' ')[1]
    });
  } catch (error) {
    res.status(500).json({ error: 'Session check failed' });
  }
});

router.post('/2fa/verify', async (req, res) => {
  try {
    const { user_id, code } = req.body;
    if (!user_id || !code) {
      return res.status(400).json({ error: 'user_id and code are required' });
    }

    const user = await db.getPool().query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    if (!userData.two_fa_enabled || !userData.two_fa_secret) {
      return res.status(400).json({ error: '2FA is not enabled for this user' });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: userData.two_fa_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    const expiryMs = parseInt(process.env.SESSION_EXPIRY) || 86400000;
    const session = await db.createSession(userData.id, expiryMs);

    res.json({
      user: { id: userData.id, username: userData.username, email: userData.email, role: userData.role, plan_id: userData.plan_id || 'free', credits_balance: userData.credits_balance || 0 },
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const QRCode = require('qrcode');

    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      name: `DiscordGPT (${user.username})`,
      issuer: 'DiscordGPT'
    });

    await db.getPool().query(
      'UPDATE users SET two_fa_secret = $1 WHERE id = $2',
      [secret.base32, user.id]
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: '2FA setup failed' });
  }
});

router.post('/2fa/enable', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const speakeasy = require('speakeasy');

    const user = await db.getPool().query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    if (!userData.two_fa_secret) {
      return res.status(400).json({ error: 'Please setup 2FA first' });
    }

    const verified = speakeasy.totp.verify({
      secret: userData.two_fa_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    await db.getPool().query(
      'UPDATE users SET two_fa_enabled = true WHERE id = $1',
      [req.user.id]
    );

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
});

router.post('/2fa/disable', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const speakeasy = require('speakeasy');

    const user = await db.getPool().query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    if (!userData.two_fa_enabled || !userData.two_fa_secret) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: userData.two_fa_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    await db.getPool().query(
      'UPDATE users SET two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1',
      [req.user.id]
    );

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

module.exports = router;
