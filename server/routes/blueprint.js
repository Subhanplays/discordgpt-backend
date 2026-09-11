const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { getActiveBot, generateInviteURL } = require('../utils/discord');

const BUILTIN_BOT_USER = 'discordgpt-system';

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { blueprint, serverName } = req.body;
    if (!blueprint) {
      return res.status(400).json({ error: 'Blueprint is required' });
    }

    const botSession = getActiveBot(BUILTIN_BOT_USER);
    const botClientId = botSession ? botSession.botInfo.id : process.env.DISCORD_CLIENT_ID || '1547979894548336720';
    const inviteURL = generateInviteURL(botClientId);

    const result = await db.createPendingBlueprint(req.user.id, blueprint, serverName || blueprint.serverName || blueprint.name);

    res.json({
      code: result.code,
      inviteURL,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    console.error('Save blueprint error:', error);
    res.status(500).json({ error: 'Failed to save blueprint' });
  }
});

router.get('/:code', authMiddleware, async (req, res) => {
  try {
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
