const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const {
  validateBotToken,
  setActiveBot,
  getActiveBot,
  removeActiveBot,
  getBotServers,
  generateInviteURL
} = require('../utils/discord');

router.use(authMiddleware);

router.post('/connect', async (req, res) => {
  try {
    const { botToken } = req.body;
    if (!botToken) {
      return res.status(400).json({ error: 'Bot token is required' });
    }

    const validation = await validateBotToken(botToken);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const tokenHash = db.hashToken(botToken);

    const existingConnection = await db.getBotConnectionByUserId(req.user.id);
    if (existingConnection) {
      removeActiveBot(req.user.id);
    }

    const connection = await db.createBotConnection(
      req.user.id,
      tokenHash,
      validation.botInfo.username,
      validation.botInfo.id
    );

    setActiveBot(req.user.id, botToken, validation.botInfo);

    res.json({
      id: connection.id,
      bot: {
        id: validation.botInfo.id,
        username: validation.botInfo.username,
        avatar: validation.botInfo.avatar,
        bot: validation.botInfo.bot
      },
      connectedAt: connection.created_at
    });
  } catch (error) {
    console.error('Bot connect error:', error);
    res.status(500).json({ error: 'Failed to connect bot' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const botSession = getActiveBot(req.user.id);
    const dbConnection = await db.getBotConnectionByUserId(req.user.id);

    if (!botSession && !dbConnection) {
      return res.json({ connected: false });
    }

    if (botSession) {
      res.json({
        connected: true,
        bot: {
          id: botSession.botInfo.id,
          username: botSession.botInfo.username,
          avatar: botSession.botInfo.avatar
        },
        connectedAt: botSession.connectedAt
      });
    } else {
      res.json({
        connected: false,
        lastConnection: {
          botUsername: dbConnection.bot_username,
          botId: dbConnection.bot_id,
          isActive: dbConnection.is_active
        }
      });
    }
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

router.delete('/disconnect', async (req, res) => {
  try {
    const botSession = getActiveBot(req.user.id);
    if (!botSession) {
      return res.status(404).json({ error: 'No active bot connection' });
    }

    removeActiveBot(req.user.id);
    await db.deactivateBotConnection(req.user.id);

    res.json({ message: 'Bot disconnected successfully' });
  } catch (error) {
    console.error('Bot disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bot' });
  }
});

router.get('/servers', async (req, res) => {
  try {
    const botSession = getActiveBot(req.user.id);
    if (!botSession) {
      return res.status(404).json({ error: 'No active bot connection' });
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
    const botSession = getActiveBot(req.user.id);
    if (!botSession) {
      return res.status(404).json({ error: 'No active bot connection' });
    }

    const inviteURL = generateInviteURL(botSession.botInfo.id);
    res.json({ inviteURL });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: 'Failed to generate invite URL' });
  }
});

module.exports = router;
