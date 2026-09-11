const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const db = require('../database');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.put('/users/:id/disable', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }
    await db.disableUser(id);
    res.json({ message: 'User disabled' });
  } catch (error) {
    console.error('Disable user error:', error);
    res.status(500).json({ error: 'Failed to disable user' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await db.getGenerationLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.get('/bots', async (req, res) => {
  try {
    const bots = await db.getAllBotConnections();
    res.json(bots);
  } catch (error) {
    console.error('Get bots error:', error);
    res.status(500).json({ error: 'Failed to get bots' });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = await db.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const { name, description, blueprint_json } = req.body;
    if (!name || !blueprint_json) {
      return res.status(400).json({ error: 'Name and blueprint are required' });
    }
    const template = await db.createTemplate(req.user.id, name, description || '', blueprint_json);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    await db.deleteTemplate(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

router.get('/ai-providers', async (req, res) => {
  try {
    const providers = await db.getAllAiProviders();
    res.json(providers);
  } catch (error) {
    console.error('Get AI providers error:', error);
    res.status(500).json({ error: 'Failed to get AI providers' });
  }
});

router.post('/ai-providers', async (req, res) => {
  try {
    const { name, provider, api_key, base_url, models } = req.body;
    if (!name || !provider) {
      return res.status(400).json({ error: 'Name and provider type are required' });
    }
    const newProvider = await db.createAiProvider(name, provider, api_key, base_url, models);
    res.status(201).json(newProvider);
  } catch (error) {
    console.error('Create AI provider error:', error);
    res.status(500).json({ error: 'Failed to create AI provider' });
  }
});

router.put('/ai-providers/:id', async (req, res) => {
  try {
    const { name, provider, api_key, base_url, models, is_active } = req.body;
    const updated = await db.updateAiProvider(req.params.id, name, provider, api_key, base_url, models, is_active);
    if (!updated) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update AI provider error:', error);
    res.status(500).json({ error: 'Failed to update AI provider' });
  }
});

router.delete('/ai-providers/:id', async (req, res) => {
  try {
    await db.deleteAiProvider(req.params.id);
    res.json({ message: 'AI provider deleted' });
  } catch (error) {
    console.error('Delete AI provider error:', error);
    res.status(500).json({ error: 'Failed to delete AI provider' });
  }
});

module.exports = router;
