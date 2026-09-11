const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');
const { getActiveBot } = require('../utils/discord');
const { generateBlueprint } = require('../utils/ai');
const queue = require('../utils/queue');

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
    if (!botSession) {
      return res.status(400).json({ error: 'No bot connected. Please connect your Discord bot first.' });
    }

    const job = queue.submit(
      req.user.id,
      blueprint,
      serverId,
      botSession.token,
      botSession.botInfo
    );

    if (job.error) {
      return res.status(409).json({ error: job.error, jobId: job.jobId });
    }

    await db.createServerConfig(
      req.user.id,
      null,
      serverId,
      blueprint.serverName || blueprint.server?.name || 'Server',
      blueprint,
      'queued'
    );

    res.json({
      success: true,
      jobId: job.jobId,
      position: job.position,
      message: `Job queued. Position: ${job.position}`
    });
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Failed to queue server creation' });
  }
});

router.get('/queue/:jobId', async (req, res) => {
  try {
    const job = queue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    res.json({
      id: job.id,
      status: job.status,
      position: job.status === 'queued' ? queue.getQueueLength() : 0,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

router.get('/queue', async (req, res) => {
  try {
    const jobs = queue.getJobsByUser(req.user.id);
    const active = jobs.filter(j => ['queued', 'processing'].includes(j.status));
    const recent = jobs.filter(j => ['completed', 'failed'].includes(j.status)).slice(0, 5);

    res.json({
      active: active.map(j => ({
        id: j.id,
        status: j.status,
        position: j.status === 'queued' ? queue.getQueueLength() : 0,
        progress: j.progress,
        createdAt: j.createdAt
      })),
      recent: recent.map(j => ({
        id: j.id,
        status: j.status,
        result: j.result,
        error: j.error,
        createdAt: j.createdAt
      })),
      queueLength: queue.getQueueLength(),
      processing: !!queue.getActiveJob()
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Failed to get queue status' });
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
