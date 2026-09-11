const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { getActiveBot, createServerStructure } = require('../utils/discord');
const { generateBlueprint } = require('../utils/ai');

router.use(authMiddleware);

router.post('/preview', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    const blueprint = generateBlueprint(prompt);
    res.json({ blueprint, prompt });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { blueprint, serverId } = req.body;
    if (!blueprint) return res.status(400).json({ error: 'Blueprint is required' });
    if (!serverId) return res.status(400).json({ error: 'Server ID is required' });

    const botSession = getActiveBot(req.user.id);
    if (!botSession) return res.status(404).json({ error: 'No active bot connection. Please connect a bot first.' });

    const dbConnection = await db.getBotConnectionByUserId(req.user.id);
    const configId = await db.createServerConfig(
      req.user.id,
      dbConnection ? dbConnection.id : null,
      serverId,
      blueprint.serverName || blueprint.server?.name || 'Server',
      blueprint,
      'in_progress'
    );

    try {
      const result = await createServerStructure(
        botSession.token,
        serverId,
        blueprint,
        (progress) => {
          console.log(`Progress: ${progress.step}/${progress.total} - ${progress.message}`);
        }
      );

      await db.updateServerConfigStatus(configId.id, 'completed');

      res.json({ success: true, configId: configId.id, result });
    } catch (createError) {
      console.error('Server creation error:', createError);
      await db.updateServerConfigStatus(configId.id, 'failed');
      res.status(500).json({ error: 'Server creation failed: ' + createError.message });
    }
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Failed to create server' });
  }
});

router.get('/status/:id', async (req, res) => {
  try {
    const config = await db.getServerConfigById(req.params.id);
    if (!config) return res.status(404).json({ error: 'Server config not found' });
    if (config.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    res.json({
      id: config.id,
      serverId: config.server_id,
      serverName: config.server_name,
      status: config.status,
      createdAt: config.created_at
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
