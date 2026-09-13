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

router.get('/usage-limits', async (req, res) => {
  try {
    const limit = await db.getDailyUsageLimit();
    const stats = await db.getDailyUsageStats();
    const users = await db.getAllUsers();
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.username; });

    const usage = stats.map(s => ({
      userId: s.user_id,
      username: userMap[s.user_id] || 'Unknown',
      count: parseInt(s.count)
    }));

    res.json({ limit, usage });
  } catch (error) {
    console.error('Get usage limits error:', error);
    res.status(500).json({ error: 'Failed to get usage limits' });
  }
});

router.put('/usage-limits', async (req, res) => {
  try {
    const { limit } = req.body;
    if (!limit || limit < 1 || limit > 10000) {
      return res.status(400).json({ error: 'Limit must be between 1 and 10000' });
    }
    await db.setDailyUsageLimit(limit);
    res.json({ limit, message: 'Usage limit updated' });
  } catch (error) {
    console.error('Update usage limits error:', error);
    res.status(500).json({ error: 'Failed to update usage limits' });
  }
});

router.post('/reset-usage', async (req, res) => {
  try {
    const result = await db.resetAllDailyUsage();
    res.json({ message: 'All daily usage counts reset', affected: result });
  } catch (error) {
    console.error('Reset usage error:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
});

router.post('/users/:id/reset-usage', async (req, res) => {
  try {
    const result = await db.resetUserUsage(req.params.id);
    res.json({ message: 'User usage reset' });
  } catch (error) {
    console.error('Reset user usage error:', error);
    res.status(500).json({ error: 'Failed to reset user usage' });
  }
});

router.post('/users/:id/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }
    await db.banUser(req.params.id, reason);
    res.json({ message: 'User banned and sessions revoked' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

router.post('/users/:id/unban', async (req, res) => {
  try {
    await db.unbanUser(req.params.id);
    res.json({ message: 'User unbanned' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

router.post('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    await db.getPool().query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.get('/ip-bans', async (req, res) => {
  try {
    const bans = await db.getBannedIps();
    res.json(bans);
  } catch (error) {
    console.error('Get IP bans error:', error);
    res.status(500).json({ error: 'Failed to get IP bans' });
  }
});

router.post('/ip-bans', async (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    await db.banIp(ip, reason, req.user.id);
    res.json({ message: `IP ${ip} banned` });
  } catch (error) {
    console.error('Ban IP error:', error);
    res.status(500).json({ error: 'Failed to ban IP' });
  }
});

router.delete('/ip-bans/:ip', async (req, res) => {
  try {
    await db.unbanIp(req.params.ip);
    res.json({ message: `IP ${req.params.ip} unbanned` });
  } catch (error) {
    console.error('Unban IP error:', error);
    res.status(500).json({ error: 'Failed to unban IP' });
  }
});

router.post('/clear-sessions', async (req, res) => {
  try {
    await db.getPool().query('DELETE FROM sessions');
    res.json({ message: 'All sessions cleared' });
  } catch (error) {
    console.error('Clear sessions error:', error);
    res.status(500).json({ error: 'Failed to clear sessions' });
  }
});

router.post('/promote', async (req, res) => {
  try {
    const { discord_id } = req.body;
    if (!discord_id) {
      return res.status(400).json({ error: 'discord_id is required' });
    }
    const result = await db.getPool().query(
      `UPDATE users SET role = 'admin' WHERE discord_id = $1 RETURNING id, username, role`,
      [discord_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with that Discord ID' });
    }
    res.json({ message: 'User promoted to admin', user: result.rows[0] });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await db.getPool().query(
      `SELECT id, username, discord_id, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/search-users', async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) return res.json(await db.getAllUsers());
    const users = await db.searchUsers(query);
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

router.get('/users/:id/conversations', async (req, res) => {
  try {
    const conversations = await db.getUserConversations(req.params.id);
    res.json(conversations);
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.delete('/conversations/:id', async (req, res) => {
  try {
    const conv = await db.getPool().query('SELECT user_id FROM conversations WHERE id = $1', [req.params.id]);
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });
    await db.deleteConversation(req.params.id, conv.rows[0].user_id);
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

router.get('/all-conversations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const conversations = await db.getAllConversations(limit);
    res.json(conversations);
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.get('/blueprints', async (req, res) => {
  try {
    const blueprints = await db.getAllBlueprints(100);
    res.json(blueprints);
  } catch (error) {
    console.error('Get blueprints error:', error);
    res.status(500).json({ error: 'Failed to get blueprints' });
  }
});

router.post('/users/:id/message-limit', async (req, res) => {
  try {
    const { limit } = req.body;
    if (!limit || limit < 0) return res.status(400).json({ error: 'Invalid limit' });
    await db.setUserMessageLimit(req.params.id, limit);
    res.json({ message: `User message limit set to ${limit}` });
  } catch (error) {
    console.error('Set user message limit error:', error);
    res.status(500).json({ error: 'Failed to set limit' });
  }
});

router.get('/users/:id/message-limit', async (req, res) => {
  try {
    const limit = await db.getUserMessageLimit(req.params.id);
    res.json({ limit });
  } catch (error) {
    console.error('Get user message limit error:', error);
    res.status(500).json({ error: 'Failed to get limit' });
  }
});

router.post('/impersonate', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const user = await db.impersonateUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const expiryMs = parseInt(process.env.SESSION_EXPIRY) || 86400000;
    const session = await db.createSession(user.id, expiryMs);
    res.json({ token: session.token, user });
  } catch (error) {
    console.error('Impersonate error:', error);
    res.status(500).json({ error: 'Failed to impersonate' });
  }
});

router.post('/broadcast', async (req, res) => {
  try {
    const { announcement } = req.body;
    if (!announcement) return res.status(400).json({ error: 'Announcement text required' });
    const result = await db.createBroadcast(announcement, req.user.id);
    res.json({ message: 'Broadcast sent', broadcast: result });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

router.get('/broadcasts', async (req, res) => {
  try {
    const broadcasts = await db.getBroadcasts();
    res.json(broadcasts);
  } catch (error) {
    console.error('Get broadcasts error:', error);
    res.status(500).json({ error: 'Failed to get broadcasts' });
  }
});

router.get('/export/users', async (req, res) => {
  try {
    const users = await db.exportUsers();
    const csv = ['id,username,email,discord_id,role,is_banned,created_at,last_login'];
    users.forEach(u => csv.push(`${u.id},${u.username || ''},${u.email || ''},${u.discord_id || ''},${u.role},${u.is_banned},${u.created_at || ''},${u.last_login || ''}`));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv.join('\n'));
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export' });
  }
});

router.get('/export/logs', async (req, res) => {
  try {
    const logs = await db.exportLogs(1000);
    const csv = ['id,username,prompt,status,duration_ms,created_at'];
    logs.forEach(l => csv.push(`${l.id},"${(l.username || '').replace(/"/g, '""')}","${(l.prompt || '').replace(/"/g, '""').replace(/\n/g, ' ')}",${l.status},${l.duration_ms || ''},${l.created_at || ''}`));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
    res.send(csv.join('\n'));
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ error: 'Failed to export' });
  }
});

router.get('/deployments', async (req, res) => {
  try {
    const deployments = await db.getServerDeployments();
    res.json(deployments);
  } catch (error) {
    console.error('Get deployments error:', error);
    res.status(500).json({ error: 'Failed to get deployments' });
  }
});

// ===== Plan Management =====
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.getAllPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const updated = await db.updatePlan(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Plan not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// ===== Credit Management =====
router.post('/users/:id/grant-credits', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    const balance = await db.addCredits(req.params.id, amount);
    await db.logCreditTransaction(req.params.id, amount, balance, 'admin_adjust', `Admin granted ${amount} credits`);
    res.json({ balance });
  } catch (error) {
    console.error('Grant credits error:', error);
    res.status(500).json({ error: 'Failed to grant credits' });
  }
});

router.post('/users/:id/assign-plan', async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await db.getPlanById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await db.getPool().query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, req.params.id]);
    const balance = await db.addCredits(req.params.id, plan.credits_per_month);
    await db.logCreditTransaction(req.params.id, plan.credits_per_month, balance, 'grant', `${plan.display_name} plan assigned by admin`);
    res.json({ plan: planId, balance });
  } catch (error) {
    console.error('Assign plan error:', error);
    res.status(500).json({ error: 'Failed to assign plan' });
  }
});

router.post('/users/:id/set-credits', async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined) return res.status(400).json({ error: 'Amount required' });
    await db.setCredits(req.params.id, amount);
    res.json({ balance: amount });
  } catch (error) {
    console.error('Set credits error:', error);
    res.status(500).json({ error: 'Failed to set credits' });
  }
});

router.post('/reset-monthly-credits', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    for (const u of users) {
      await db.resetMonthlyCredits(u.id);
    }
    res.json({ message: 'Monthly credits reset for all users' });
  } catch (error) {
    console.error('Reset credits error:', error);
    res.status(500).json({ error: 'Failed to reset credits' });
  }
});

module.exports = router;
