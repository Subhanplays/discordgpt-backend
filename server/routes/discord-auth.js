const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1547995368695009281';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = 'https://discordgpt-api.onrender.com/api/auth/discord/callback';
const FRONTEND_REDIRECT = 'https://client-six-zeta-13.vercel.app/auth/callback';

let migrationDone = false;

async function initDiscordAuth() {
  if (migrationDone) return;
  try {
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TEXT DEFAULT (now()::text)`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_avatar TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_discriminator TEXT DEFAULT '0'`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_banner TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_accent_color INTEGER`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_public_flags INTEGER DEFAULT 0`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_locale TEXT`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_mfa_enabled BOOLEAN DEFAULT false`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false`);
    await db.getPool().query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret TEXT`);
    await db.getPool().query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
  } catch (e) {
    console.log('Migration note:', e.message);
  }
  migrationDone = true;
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

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0') % 5}.png`;

    const existing = await db.getPool().query('SELECT * FROM users WHERE discord_id = $1', [discordUser.id]);

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await db.getPool().query(
        `UPDATE users SET discord_access_token = $1, username = $2, discord_avatar = $3,
         discord_discriminator = $4, discord_banner = $5, discord_accent_color = $6,
         discord_public_flags = $7, discord_locale = $8, discord_mfa_enabled = $9, updated_at = now()::text
         WHERE discord_id = $10`,
        [
          tokenData.access_token, discordUser.username, avatarUrl,
          discordUser.discriminator || '0', discordUser.banner || null,
          discordUser.accent_color || null, discordUser.public_flags || 0,
          discordUser.locale || 'en-US', discordUser.mfa_enabled || false,
          discordUser.id
        ]
      );
      user.username = discordUser.username;
      user.discord_avatar = avatarUrl;
      user.discord_discriminator = discordUser.discriminator || '0';
    } else {
      const email = discordUser.email || `${discordUser.id}@discord.local`;
      const result = await db.getPool().query(
        `INSERT INTO users (id, username, email, discord_id, discord_access_token, role,
         discord_avatar, discord_discriminator, discord_banner, discord_accent_color,
         discord_public_flags, discord_locale, discord_mfa_enabled)
         VALUES ($1, $2, $3, $4, $5, 'user', $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          crypto.randomUUID(), discordUser.username, email, discordUser.id, tokenData.access_token,
          avatarUrl, discordUser.discriminator || '0', discordUser.banner || null,
          discordUser.accent_color || null, discordUser.public_flags || 0,
          discordUser.locale || 'en-US', discordUser.mfa_enabled || false
        ]
      );
      user = result.rows[0];
    }

    if (user.two_fa_enabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      await db.getPool().query(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [crypto.randomUUID(), user.id, 'pending_2fa_' + tempToken, new Date(Date.now() + 300000).toISOString()]
      );
      const encodedTemp = encodeURIComponent(tempToken);
      res.redirect(`${FRONTEND_REDIRECT}?pending_2fa=true&temp=${encodedTemp}&user_id=${user.id}`);
      return;
    }

    const expiryMs = parseInt(process.env.SESSION_EXPIRY) || 86400000;
    const session = await db.createSession(user.id, expiryMs);

    console.log('Auth success:', user.username);

    const encodedToken = encodeURIComponent(session.token);
    res.redirect(`${FRONTEND_REDIRECT}?token=${encodedToken}`);
  } catch (err) {
    console.error('Discord callback error:', err.message);
    res.redirect(`${FRONTEND_REDIRECT.replace('/auth/callback', '/auth')}?error=callback_failed`);
  }
});

module.exports = router;
