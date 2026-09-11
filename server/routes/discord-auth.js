const express = require('express');
const router = express.Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547979894548336720';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const REDIRECT_URI = 'https://discordgpt-api.onrender.com/api/auth/discord/callback';
const FRONTEND_REDIRECT = 'https://client-six-zeta-13.vercel.app/auth/callback';

let migrationDone = false;

async function query(text, params) {
  const { getPool } = require('../database');
  return getPool().query(text, params);
}

async function initDiscordAuth() {
  if (migrationDone) return;
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token TEXT`);
  migrationDone = true;
}

function generateToken(user) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// GET /api/auth/discord
router.get('/', async (req, res) => {
  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds',
      permissions: '8',
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  } catch (err) {
    console.error('Discord auth redirect error:', err);
    res.status(500).json({ error: 'Failed to initiate Discord auth' });
  }
});

// GET /api/auth/discord/callback
router.get('/callback', async (req, res) => {
  try {
    await initDiscordAuth();

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Failed to get access token', details: tokenData });
    }

    // Fetch user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userRes.json();
    if (!discordUser.id) {
      return res.status(401).json({ error: 'Failed to fetch Discord user' });
    }

    // Fetch user's guilds
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const guilds = await guildsRes.json();

    // Upsert user in database
    const existing = await query('SELECT * FROM users WHERE discord_id = $1', [discordUser.id]);

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await query(
        'UPDATE users SET discord_access_token = $1, username = $2, updated_at = NOW() WHERE discord_id = $3',
        [tokenData.access_token, discordUser.username, discordUser.id]
      );
      user.username = discordUser.username;
      user.discord_access_token = tokenData.access_token;
    } else {
      const email = discordUser.email || `${discordUser.id}@discord.local`;
      const result = await query(
        `INSERT INTO users (username, email, discord_id, discord_access_token, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'user', NOW(), NOW())
         RETURNING *`,
        [discordUser.username, email, discordUser.id, tokenData.access_token]
      );
      user = result.rows[0];
    }

    const jwtToken = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_REDIRECT}?token=${jwtToken}`);
  } catch (err) {
    console.error('Discord callback error:', err);
    res.status(500).json({ error: 'Discord auth callback failed' });
  }
});

// GET /api/auth/discord/servers
router.get('/servers', async (req, res) => {
  try {
    await initDiscordAuth();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    if (!user.discord_access_token) {
      return res.status(400).json({ error: 'No Discord access token. Please re-authenticate.' });
    }

    // Fetch user's guilds from Discord
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${user.discord_access_token}` },
    });

    if (!guildsRes.ok) {
      return res.status(401).json({ error: 'Failed to fetch Discord servers. Please re-authenticate.' });
    }

    const guilds = await guildsRes.json();

    // Filter to servers where user has manage_guild or administrator permission
    const manageableGuilds = guilds.filter((g) => {
      const perms = BigInt(g.permissions);
      return (perms & BigInt(0x20)) === BigInt(0x20) || (perms & BigInt(0x8)) === BigInt(0x8);
    });

    // Check which servers the bot is already in
    let botGuilds = [];
    if (DISCORD_BOT_TOKEN) {
      const botGuildsRes = await fetch('https://discord.com/api/guilds', {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      });
      if (botGuildsRes.ok) {
        botGuilds = await botGuildsRes.json();
      }
    }

    const botGuildIds = new Set(botGuilds.map((g) => g.id));

    const servers = manageableGuilds.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
      botAdded: botGuildIds.has(g.id),
    }));

    res.json({ servers });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Discord servers fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch Discord servers' });
  }
});

module.exports = router;
