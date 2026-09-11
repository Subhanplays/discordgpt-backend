const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { getActiveBot, generateInviteURL } = require('../utils/discord');

const BUILTIN_BOT_USER = 'discordgpt-system';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  try {
    await db.getPool().query(`
      CREATE TABLE IF NOT EXISTS pending_blueprints (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blueprint_json TEXT NOT NULL,
        server_name TEXT,
        created_at TEXT DEFAULT (now()::text),
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0
      );
    `);
    tableReady = true;
  } catch (e) {
    console.error('Failed to create pending_blueprints table:', e.message);
  }
}

router.post('/save', authMiddleware, async (req, res) => {
  try {
    await ensureTable();

    const { blueprint, serverName } = req.body;
    if (!blueprint) {
      return res.status(400).json({ error: 'Blueprint is required' });
    }

    const botSession = getActiveBot(BUILTIN_BOT_USER);
    const botClientId = botSession ? botSession.botInfo.id : (process.env.DISCORD_CLIENT_ID || '1547979894548336720');
    const inviteURL = generateInviteURL(botClientId);

    const result = await db.createPendingBlueprint(req.user.id, blueprint, serverName || blueprint.serverName || blueprint.name);

    res.json({
      code: result.code,
      inviteURL,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    console.error('Save blueprint error:', error);
    res.status(500).json({ error: 'Failed to generate code: ' + error.message });
  }
});

router.get('/:code', authMiddleware, async (req, res) => {
  try {
    await ensureTable();

    const { code } = req.params;
    const pending = await db.getPendingBlueprintByCode(code);
    if (!pending) {
      return res.status(404).json({ error: 'Code invalid or expired' });
    }
    res.json({
      blueprint: pending.blueprint_json,
      serverName: pending.server_name,
      expiresAt: pending.expires_at
    });
  } catch (error) {
    console.error('Fetch blueprint error:', error);
    res.status(500).json({ error: 'Failed to fetch blueprint' });
  }
});

module.exports = router;
