const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const {
  getActiveBot,
  getBotServers,
  generateInviteURL
} = require('../utils/discord');
const { getPersistentClientServers, getClient } = require('../utils/slashCommands');

const BUILTIN_BOT_USER = 'discordgpt-system';

router.use(authMiddleware);

router.get('/status', async (req, res) => {
  try {
    const botSession = getActiveBot(BUILTIN_BOT_USER);

    if (!botSession) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      bot: {
        id: botSession.botInfo.id,
        username: botSession.botInfo.username,
        avatar: botSession.botInfo.avatar
      }
    });
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

router.get('/servers', async (req, res) => {
  try {
    const persistentServers = getPersistentClientServers();
    if (persistentServers) {
      return res.json(persistentServers);
    }

    const botSession = getActiveBot(BUILTIN_BOT_USER);
    if (!botSession) {
      return res.status(400).json({ error: 'Bot is not connected. Please try again later.' });
    }

    const servers = await getBotServers(botSession.token);
    res.json(servers);
  } catch (error) {
    console.error('Get bot servers error:', error);
    res.status(500).json({ error: 'Failed to get bot servers' });
  }
});

router.get('/invite', async (req, res) => {
  try {
    const botSession = getActiveBot(BUILTIN_BOT_USER);
    if (!botSession) {
      return res.status(400).json({ error: 'Bot is not connected' });
    }

    const inviteURL = generateInviteURL(botSession.botInfo.id);
    res.json({ inviteURL });
  } catch (error) {
    console.error('Generate invite URL error:', error);
    res.status(500).json({ error: 'Failed to generate invite URL' });
  }
});

module.exports = router;
