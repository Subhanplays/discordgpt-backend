const express = require('express');
const router = express.Router();
const db = require('../database');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547995368695009281';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const REDIRECT_URI = 'https://discordgpt-api.onrender.com/api/auth/discord/callback';
const FRONTEND_REDIRECT = 'https://client-six-zeta-13.vercel.app/auth/callback';

let migrationDone = false;

async function initDiscordAuth() {
  if (migrationDone) return;
  try {
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TEXT DEFAULT (now()::text)`);
    await db.getPool().query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
  } catch (e) {
    console.log('Migration note:', e.message);
  }
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
    res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=redirect_failed`);
  }
});

router.get('/callback', async (req, res) => {
  try {
    await initDiscordAuth();

    const { code } = req.query;
    if (!code) {
      return res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=no_code`);
    }

    console.log('Discord callback: exchanging code...');

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
    console.log('Token response:', tokenRes.status, tokenData.error || 'OK');

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', JSON.stringify(tokenData));
      return res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=token_failed`);
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userRes.json();

    if (!discordUser.id) {
      console.error('Discord user fetch failed:', JSON.stringify(discordUser));
      return res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=user_fetch_failed`);
    }

    console.log('Discord user:', discordUser.username);

    const existing = await db.getPool().query('SELECT * FROM users WHERE discord_id = $1', [discordUser.id]);

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await db.getPool().query(
        'UPDATE users SET discord_access_token = $1, username = $2, updated_at = now()::text WHERE discord_id = $3',
        [tokenData.access_token, discordUser.username, discordUser.id]
      );
      user.username = discordUser.username;
    } else {
      const email = discordUser.email || `${discordUser.id}@discord.local`;
      const result = await db.getPool().query(
        `INSERT INTO users (id, username, email, discord_id, discord_access_token, role)
         VALUES ($1, $2, $3, $4, $5, 'user')
         RETURNING *`,
        [require('crypto').randomUUID(), discordUser.username, email, discordUser.id, tokenData.access_token]
      );
      user = result.rows[0];
    }

    const jwtToken = generateToken(user);
    console.log('Auth success:', user.username);

    res.redirect(`${FRONTEND_REDIRECT}?token=${jwtToken}`);
  } catch (err) {
    console.error('Discord callback error:', err.message);
    res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=callback_failed`);
  }
});

module.exports = router;
