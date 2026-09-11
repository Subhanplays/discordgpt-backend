const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { getActiveBot, createServerStructure } = require('../utils/discord');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const templates = await db.getUserTemplates(req.user.id);
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, blueprint } = req.body;
    if (!name) return res.status(400).json({ error: 'Template name is required' });
    if (!blueprint) return res.status(400).json({ error: 'Blueprint is required' });

    const template = await db.createTemplate(req.user.id, name, description || '', blueprint);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await db.getTemplateById(req.params.id, req.user.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.getTemplateById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    const { name, description, blueprint } = req.body;
    if (!name) return res.status(400).json({ error: 'Template name is required' });
    if (!blueprint) return res.status(400).json({ error: 'Blueprint is required' });

    await db.updateTemplate(req.params.id, name, description || '', blueprint);
    const updated = await db.getTemplateById(req.params.id, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const template = await db.getTemplateById(req.params.id, req.user.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    await db.deleteTemplate(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

router.post('/:id/use', async (req, res) => {
  try {
    const { serverId } = req.body;
    if (!serverId) return res.status(400).json({ error: 'Server ID is required' });

    const template = await db.getTemplateById(req.params.id, req.user.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const botSession = getActiveBot(req.user.id);
    if (!botSession) return res.status(404).json({ error: 'No active bot connection. Please connect a bot first.' });

    const blueprint = template.blueprint_json;
    const result = await createServerStructure(botSession.token, serverId, blueprint, (progress) => {
      console.log(`Progress: ${progress.step}/${progress.total} - ${progress.message}`);
    });

    res.json({ success: true, templateName: template.name, result });
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({ error: 'Failed to apply template' });
  }
});

module.exports = router;
