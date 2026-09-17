const { Pool } = require('pg');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

let pool;

function getPool() {
  if (!pool) {
    const config = {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000
    };
    if (process.env.DATABASE_URL?.includes('neon.tech')) {
      config.ssl = { rejectUnauthorized: false };
    }
    pool = new Pool(config);
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDatabase() {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (now()::text),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (now()::text),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      blueprint_json TEXT,
      created_at TEXT DEFAULT (now()::text),
      updated_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      blueprint_json TEXT NOT NULL,
      created_at TEXT DEFAULT (now()::text),
      updated_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS bot_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bot_token_hash TEXT NOT NULL,
      bot_username TEXT,
      bot_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS server_configs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bot_connection_id TEXT REFERENCES bot_connections(id) ON DELETE SET NULL,
      server_id TEXT,
      server_name TEXT,
      blueprint_json TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS generation_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
      prompt TEXT,
      ai_response TEXT,
      status TEXT DEFAULT 'success',
      error_message TEXT,
      duration_ms INTEGER,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT,
      updated_at TEXT DEFAULT (now()::text),
      UNIQUE(user_id, key)
    );

    CREATE TABLE IF NOT EXISTS ai_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      api_key TEXT,
      base_url TEXT,
      models TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (now()::text),
      updated_at TEXT DEFAULT (now()::text)
    );

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

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      credits_per_month INTEGER NOT NULL,
      credit_price_cents INTEGER NOT NULL,
      max_servers INTEGER NOT NULL,
      ai_access_level TEXT NOT NULL DEFAULT 'basic',
      priority_support BOOLEAN DEFAULT false,
      stripe_price_id TEXT,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
      plan_id TEXT NOT NULL REFERENCES plans(id),
      status TEXT NOT NULL DEFAULT 'active',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      credits_used_this_period INTEGER DEFAULT 0,
      current_period_start TEXT,
      current_period_end TEXT,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS credit_purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      credits INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL,
      stripe_session_id TEXT,
      stripe_payment_intent TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_username TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#5865F2',
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS blueprint_versions (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blueprint_json TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS friend_tokens (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      created_by TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (now()::text)
    );
  `);

  // Create default admin if none exists
  const adminCheck = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
  if (adminCheck.rows.length === 0) {
    const adminId = uuidv4();
    await db.query(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [adminId, 'admin', 'admin@discordgpt.com', hashPassword('admin123'), 'admin']
    );
  }

  console.log('Database initialized');

  try {
    await q('ALTER TABLE bot_connections ADD COLUMN IF NOT EXISTS bot_token TEXT');
  } catch (e) {
    // column may already exist
  }

  try {
    await q('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS blueprint_json TEXT');
  } catch (e) {
    // column may already exist
  }

  // Discord profile columns
  const discordMigrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_avatar TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_discriminator TEXT DEFAULT '0'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_banner TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_accent_color INTEGER`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_public_flags INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_locale TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_mfa_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TEXT DEFAULT (now()::text)`,
    `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TEXT`,
    `CREATE TABLE IF NOT EXISTS ip_bans (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, reason TEXT, banned_by TEXT, created_at TEXT DEFAULT (now()::text))`
  ];
  for (const sql of discordMigrations) {
    try { await db.query(sql); } catch (e) { /* already exists */ }
  }

  console.log('Discord profile columns ready');

  // Billing/plan columns
  const billingMigrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used_this_month INTEGER DEFAULT 0`
  ];
  for (const sql of billingMigrations) {
    try { await db.query(sql); } catch (e) { /* already exists */ }
  }

  // Seed default plans
  const plansCheck = await db.query('SELECT COUNT(*) as count FROM plans');
  if (parseInt(plansCheck.rows[0].count) === 0) {
    const defaultPlans = [
      { id: 'free', name: 'free', display_name: 'Free', credits_per_month: 50, credit_price_cents: 0, max_servers: 3, ai_access_level: 'basic', priority_support: false },
      { id: 'pro', name: 'pro', display_name: 'Pro', credits_per_month: 500, credit_price_cents: 200, max_servers: 25, ai_access_level: 'all', priority_support: true },
      { id: 'enterprise', name: 'enterprise', display_name: 'Enterprise', credits_per_month: 5000, credit_price_cents: 150, max_servers: -1, ai_access_level: 'all', priority_support: true }
    ];
    for (const p of defaultPlans) {
      await db.query(
        'INSERT INTO plans (id, name, display_name, credits_per_month, credit_price_cents, max_servers, ai_access_level, priority_support) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [p.id, p.name, p.display_name, p.credits_per_month, p.credit_price_cents, p.max_servers, p.ai_access_level, p.priority_support]
      );
    }
    console.log('Default plans seeded');
  }

  // Ensure existing users have default plan and credits
  try {
    await db.query(`UPDATE users SET plan_id = 'free' WHERE plan_id IS NULL`);
    await db.query(`UPDATE users SET credits_balance = 50 WHERE credits_balance IS NULL`);
  } catch (e) { /* column may not exist yet */ }

  console.log('Billing columns ready');

  try {
    await q('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS folder_id TEXT REFERENCES folders(id)');
  } catch (e) {
    // column may already exist
  }

  try {
    await q('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_pinned INTEGER DEFAULT 0');
  } catch (e) {
    // column may already exist
  }

  console.log('Folder and versioning columns ready');
}

function q(text, params) {
  return getPool().query(text, params);
}

function qOne(text, params) {
  return getPool().query(text, params).then(r => r.rows[0]);
}

function qAll(text, params) {
  return getPool().query(text, params).then(r => r.rows);
}

module.exports = {
  getPool,
  hashToken,
  hashPassword,
  initDatabase,

  // Users
  async createUser(username, email, password) {
    const id = uuidv4();
    const passwordHash = hashPassword(password);
    await q(
      'INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)',
      [id, username, email, passwordHash]
    );
    return { id, username, email, role: 'user' };
  },

  async getUserByEmail(email) {
    return qOne('SELECT * FROM users WHERE email = $1', [email]);
  },

  async getUserByUsername(username) {
    return qOne('SELECT * FROM users WHERE username = $1', [username]);
  },

  async getUserById(id) {
    return qOne('SELECT * FROM users WHERE id = $1', [id]);
  },

  async getAllUsers() {
    return qAll('SELECT id, username, email, role, created_at, last_login FROM users ORDER BY created_at DESC');
  },

  async updateUserLastLogin(userId) {
    await q('UPDATE users SET last_login = now()::text WHERE id = $1', [userId]);
  },

  async disableUser(userId) {
    await q('DELETE FROM users WHERE id = $1', [userId]);
  },

  // Sessions
  async createSession(userId, expiryMs) {
    const id = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + expiryMs).toISOString();
    await q(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [id, userId, token, expiresAt]
    );
    return { token, expiresAt };
  },

  async getSessionByToken(token) {
    return qOne(
      `SELECT s.*, u.username, u.email, u.role
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > now()::text`,
      [token]
    );
  },

  async deleteSession(token) {
    await q('DELETE FROM sessions WHERE token = $1', [token]);
  },

  async deleteUserSessions(userId) {
    await q('DELETE FROM sessions WHERE user_id = $1', [userId]);
  },

  // Conversations
  async createConversation(userId, title) {
    const id = uuidv4();
    await q(
      'INSERT INTO conversations (id, user_id, title) VALUES ($1, $2, $3)',
      [id, userId, title]
    );
    return { id, user_id: userId, title };
  },

  async getUserConversations(userId) {
    return qAll(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
  },

  async getConversationById(id, userId) {
    return qOne(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  },

  async updateConversation(id, title) {
    await q(
      'UPDATE conversations SET title = $1, updated_at = now()::text WHERE id = $2',
      [title, id]
    );
  },

  async updateConversationBlueprint(id, blueprintJson) {
    await q(
      'UPDATE conversations SET blueprint_json = $1, updated_at = now()::text WHERE id = $2',
      [blueprintJson, id]
    );
  },

  async deleteConversation(id) {
    await q('DELETE FROM conversations WHERE id = $1', [id]);
  },

  // Messages
  async createMessage(conversationId, role, content) {
    const id = uuidv4();
    await q(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES ($1, $2, $3, $4)',
      [id, conversationId, role, content]
    );
    await q('UPDATE conversations SET updated_at = now()::text WHERE id = $1', [conversationId]);
    return { id, conversation_id: conversationId, role, content };
  },

  async getConversationMessages(conversationId) {
    return qAll(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
  },

  // Templates
  async createTemplate(userId, name, description, blueprintJson) {
    const id = uuidv4();
    await q(
      'INSERT INTO templates (id, user_id, name, description, blueprint_json) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, name, description || '', JSON.stringify(blueprintJson)]
    );
    return { id, user_id: userId, name, description, blueprint_json: blueprintJson };
  },

  async getUserTemplates(userId) {
    const rows = await qAll(
      'SELECT * FROM templates WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return rows.map(t => ({ ...t, blueprint_json: JSON.parse(t.blueprint_json) }));
  },

  async getTemplateById(id, userId) {
    const t = await qOne('SELECT * FROM templates WHERE id = $1 AND user_id = $2', [id, userId]);
    if (t) t.blueprint_json = JSON.parse(t.blueprint_json);
    return t;
  },

  async getAllTemplates() {
    const rows = await qAll('SELECT * FROM templates ORDER BY created_at DESC');
    return rows.map(t => ({ ...t, blueprint_json: JSON.parse(t.blueprint_json) }));
  },

  async updateTemplate(id, name, description, blueprintJson) {
    await q(
      'UPDATE templates SET name = $1, description = $2, blueprint_json = $3, updated_at = now()::text WHERE id = $4',
      [name, description || '', JSON.stringify(blueprintJson), id]
    );
  },

  async deleteTemplate(id) {
    await q('DELETE FROM templates WHERE id = $1', [id]);
  },

  // Bot Connections
  async createBotConnection(userId, tokenHash, botUsername, botId, botToken) {
    const id = uuidv4();
    await q(
      `INSERT INTO bot_connections (id, user_id, bot_token_hash, bot_username, bot_id, bot_token, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT (user_id) DO UPDATE SET
         bot_token_hash = EXCLUDED.bot_token_hash,
         bot_username = EXCLUDED.bot_username,
         bot_id = EXCLUDED.bot_id,
         bot_token = EXCLUDED.bot_token,
         is_active = 1`,
      [id, userId, tokenHash, botUsername, botId, botToken || null]
    );
    return { id, user_id: userId, bot_username: botUsername, bot_id: botId, is_active: 1 };
  },

  async getBotConnectionByUserId(userId) {
    return qOne('SELECT * FROM bot_connections WHERE user_id = $1 AND is_active = 1', [userId]);
  },

  async getAllBotConnections() {
    return qAll(
      `SELECT bc.*, u.username
       FROM bot_connections bc
       JOIN users u ON bc.user_id = u.id
       ORDER BY bc.created_at DESC`
    );
  },

  async deactivateBotConnection(userId) {
    await q('UPDATE bot_connections SET is_active = 0 WHERE user_id = $1', [userId]);
  },

  // Server Configs
  async createServerConfig(userId, botConnectionId, serverId, serverName, blueprintJson, status) {
    const id = uuidv4();
    await q(
      'INSERT INTO server_configs (id, user_id, bot_connection_id, server_id, server_name, blueprint_json, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, botConnectionId, serverId, serverName, JSON.stringify(blueprintJson), status]
    );
    return { id, status };
  },

  async getServerConfigById(id) {
    const c = await qOne('SELECT * FROM server_configs WHERE id = $1', [id]);
    if (c) c.blueprint_json = JSON.parse(c.blueprint_json);
    return c;
  },

  async updateServerConfigStatus(id, status) {
    await q('UPDATE server_configs SET status = $1 WHERE id = $2', [status, id]);
  },

  // Generation Logs
  async createGenerationLog(userId, conversationId, prompt, aiResponse, status, errorMessage, durationMs) {
    const id = uuidv4();
    await q(
      'INSERT INTO generation_logs (id, user_id, conversation_id, prompt, ai_response, status, error_message, duration_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, userId, conversationId, prompt, aiResponse, status, errorMessage, durationMs]
    );
    return id;
  },

  async getGenerationLogs(limit = 100) {
    return qAll(
      `SELECT gl.*, u.username
       FROM generation_logs gl
       JOIN users u ON gl.user_id = u.id
       ORDER BY gl.created_at DESC
       LIMIT $1`,
      [limit]
    );
  },

  async getGenerationLogStats() {
    return qAll('SELECT status, COUNT(*) as count FROM generation_logs GROUP BY status');
  },

  // Settings
  async getSettings(userId) {
    const rows = await qAll('SELECT key, value FROM settings WHERE user_id = $1', [userId]);
    const result = {};
    rows.forEach(s => { result[s.key] = s.value; });
    return result;
  },

  async updateSetting(userId, key, value) {
    await q(
      `INSERT INTO settings (id, user_id, key, value, updated_at)
       VALUES ($1, $2, $3, $4, now()::text)
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()::text`,
      [uuidv4(), userId, key, value]
    );
  },

  // Stats
  async getStats() {
    const [users, conversations, messages, bots, templates, servers, aiProviders, aiRequests] = await Promise.all([
      q('SELECT COUNT(*) as count FROM users'),
      q('SELECT COUNT(*) as count FROM conversations'),
      q('SELECT COUNT(*) as count FROM messages'),
      q('SELECT COUNT(*) as count FROM bot_connections WHERE is_active = 1'),
      q('SELECT COUNT(*) as count FROM templates'),
      q('SELECT COUNT(*) as count FROM server_configs'),
      q('SELECT COUNT(*) as count FROM ai_providers'),
      q('SELECT COUNT(*) as count FROM generation_logs')
    ]);
    return {
      totalUsers: parseInt(users.rows[0].count),
      totalConversations: parseInt(conversations.rows[0].count),
      totalMessages: parseInt(messages.rows[0].count),
      totalBots: parseInt(bots.rows[0].count),
      totalTemplates: parseInt(templates.rows[0].count),
      totalServers: parseInt(servers.rows[0].count),
      totalAiProviders: parseInt(aiProviders.rows[0].count),
      totalAiRequests: parseInt(aiRequests.rows[0].count)
    };
  },

  // AI Providers
  async createAiProvider(name, provider, apiKey, baseUrl, models) {
    const id = uuidv4();
    await q(
      'INSERT INTO ai_providers (id, name, provider, api_key, base_url, models) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, provider, apiKey || null, baseUrl || null, JSON.stringify(models || [])]
    );
    return { id, name, provider, models: models || [] };
  },

  async getAllAiProviders() {
    const rows = await qAll('SELECT * FROM ai_providers ORDER BY created_at DESC');
    return rows.map(p => ({ ...p, models: JSON.parse(p.models || '[]'), api_key: p.api_key ? '***' + p.api_key.slice(-4) : null }));
  },

  async getAiProviderById(id) {
    const p = await qOne('SELECT * FROM ai_providers WHERE id = $1', [id]);
    if (p) p.models = JSON.parse(p.models || '[]');
    return p;
  },

  async getActiveAiProvider() {
    const p = await qOne('SELECT * FROM ai_providers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1');
    if (p) p.models = JSON.parse(p.models || '[]');
    return p;
  },

  async updateAiProvider(id, name, provider, apiKey, baseUrl, models, isActive) {
    const existing = await qOne('SELECT * FROM ai_providers WHERE id = $1', [id]);
    if (!existing) return null;
    await q(
      `UPDATE ai_providers SET name = $1, provider = $2, api_key = $3, base_url = $4, models = $5, is_active = $6, updated_at = now()::text WHERE id = $7`,
      [
        name || existing.name,
        provider || existing.provider,
        apiKey !== undefined ? (apiKey || null) : existing.api_key,
        baseUrl !== undefined ? (baseUrl || null) : existing.base_url,
        models ? JSON.stringify(models) : existing.models,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        id
      ]
    );
    return this.getAiProviderById(id);
  },

  async deleteAiProvider(id) {
    await q('DELETE FROM ai_providers WHERE id = $1', [id]);
  },

  // Daily Usage Tracking
  async getUserDailyUsageCount(userId) {
    const result = await qOne(
      `SELECT COUNT(*) as count FROM generation_logs
       WHERE user_id = $1 AND created_at >= (now() at time zone 'utc')::date::text`,
      [userId]
    );
    return parseInt(result?.count || '0');
  },

  async getDailyUsageLimit() {
    const result = await qOne(
      `SELECT value FROM settings WHERE user_id = 'system' AND key = 'daily_message_limit'`
    );
    return parseInt(result?.value || '50');
  },

  async setDailyUsageLimit(limit) {
    await q(
      `INSERT INTO settings (id, user_id, key, value, updated_at)
       VALUES ($1, 'system', 'daily_message_limit', $2, now()::text)
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()::text`,
      [require('uuid').v4(), String(limit)]
    );
  },

  async getDailyUsageStats() {
    return qAll(
      `SELECT user_id, COUNT(*) as count
       FROM generation_logs
       WHERE created_at >= (now() at time zone 'utc')::date::text
       GROUP BY user_id`
    );
  },

  async resetAllDailyUsage() {
    const result = await q(
      `DELETE FROM generation_logs
       WHERE created_at >= (now() at time zone 'utc')::date::text`
    );
    return result;
  },

  async banUser(userId, reason) {
    await q('UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2', [reason || '', userId]);
    await q('DELETE FROM sessions WHERE user_id = $1', [userId]);
  },

  async unbanUser(userId) {
    await q('UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = $1', [userId]);
  },

  async resetUserUsage(userId) {
    const result = await q(
      `DELETE FROM generation_logs
       WHERE user_id = $1 AND created_at >= (now() at time zone 'utc')::date::text`,
      [userId]
    );
    return result;
  },

  async banIp(ip, reason, bannedBy) {
    const id = uuidv4();
    await q(
      'INSERT INTO ip_bans (id, ip, reason, banned_by) VALUES ($1, $2, $3, $4) ON CONFLICT (ip) DO UPDATE SET reason = $2, banned_by = $3',
      [id, ip, reason || '', bannedBy]
    );
  },

  async unbanIp(ip) {
    await q('DELETE FROM ip_bans WHERE ip = $1', [ip]);
  },

  async getBannedIps() {
    return (await q('SELECT * FROM ip_bans ORDER BY created_at DESC')).rows;
  },

  async isIpBanned(ip) {
    const row = await qOne('SELECT id FROM ip_bans WHERE ip = $1', [ip]);
    return !!row;
  },

  async searchUsers(query) {
    const pattern = `%${query}%`;
    return (await q(
      `SELECT id, username, email, discord_id, role, is_banned, ban_reason, created_at, last_login, last_ip
       FROM users WHERE username ILIKE $1 OR email ILIKE $1 OR discord_id ILIKE $1
       ORDER BY created_at DESC`, [pattern]
    )).rows;
  },

  async getUserConversations(userId) {
    return (await q(
      `SELECT id, title, created_at, is_pinned FROM conversations WHERE user_id = $1 ORDER BY is_pinned DESC, created_at DESC`,
      [userId]
    )).rows;
  },

  async deleteConversation(conversationId, userId) {
    await q('DELETE FROM messages WHERE conversation_id = $1', [conversationId]);
    await q('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [conversationId, userId]);
  },

  async togglePinConversation(conversationId, userId) {
    const result = await q(
      `UPDATE conversations SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END
       WHERE id = $1 AND user_id = $2 RETURNING is_pinned`,
      [conversationId, userId]
    );
    return result.rows[0] ? result.rows[0].is_pinned : null;
  },

  async getAllConversations(limit = 100) {
    return (await q(
      `SELECT c.id, c.title, c.created_at, c.user_id, u.username,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
       FROM conversations c LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC LIMIT $1`, [limit]
    )).rows;
  },

  async getAllBlueprints(limit = 100) {
    return (await q(
      `SELECT c.id, c.title, c.blueprint_json, c.created_at, u.username
       FROM conversations c LEFT JOIN users u ON c.user_id = u.id
       WHERE c.blueprint_json IS NOT NULL
       ORDER BY c.created_at DESC LIMIT $1`, [limit]
    )).rows;
  },

  async setUserMessageLimit(userId, limit) {
    await q(
      `INSERT INTO settings (id, user_id, key, value, updated_at)
       VALUES ($1, $2, 'personal_message_limit', $3, now()::text)
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()::text`,
      [require('uuid').v4(), userId, String(limit)]
    );
  },

  async getUserMessageLimit(userId) {
    const row = await qOne(
      `SELECT value FROM settings WHERE user_id = $1 AND key = 'personal_message_limit'`,
      [userId]
    );
    return row ? parseInt(row.value) : null;
  },

  async impersonateUser(userId) {
    const user = await qOne('SELECT id, username, role FROM users WHERE id = $1', [userId]);
    return user;
  },

  async createBroadcast(announcement, createdBy) {
    const id = require('uuid').v4();
    await q(
      `INSERT INTO settings (id, user_id, key, value, updated_at)
       VALUES ($1, 'system', 'broadcast', $2, now()::text)`,
      [id, JSON.stringify({ announcement, createdBy, createdAt: new Date().toISOString() })]
    );
    return { id, announcement, createdBy };
  },

  async getBroadcasts() {
    const rows = await qAll(
      `SELECT value FROM settings WHERE user_id = 'system' AND key = 'broadcast' ORDER BY updated_at DESC`
    );
    return rows.map(r => { try { return JSON.parse(r.value); } catch { return null; } }).filter(Boolean);
  },

  async exportUsers() {
    return (await q(
      `SELECT id, username, email, discord_id, role, is_banned, created_at, last_login FROM users ORDER BY created_at DESC`
    )).rows;
  },

  async exportLogs(limit = 1000) {
    return (await q(
      `SELECT g.id, g.user_id, u.username, g.prompt, g.status, g.duration_ms, g.created_at
       FROM generation_logs g LEFT JOIN users u ON g.user_id = u.id
       ORDER BY g.created_at DESC LIMIT $1`, [limit]
    )).rows;
  },

  async getServerDeployments() {
    return (await q(
      `SELECT p.id, p.code, p.server_name, p.expires_at, p.created_at, u.username
       FROM pending_blueprints p LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    )).rows;
  },

  // Pending Blueprints (deploy codes)
  async createPendingBlueprint(userId, blueprintJson, serverName) {
    const id = uuidv4();
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await q(
      'INSERT INTO pending_blueprints (id, code, user_id, blueprint_json, server_name, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, code, userId, JSON.stringify(blueprintJson), serverName || blueprintJson.serverName || '', expiresAt]
    );
    return { id, code, expiresAt };
  },

  async getPendingBlueprintByCode(code) {
    const row = await qOne(
      `SELECT * FROM pending_blueprints WHERE code = $1 AND used = 0 AND expires_at > now()::text`,
      [code.toUpperCase()]
    );
    if (row) row.blueprint_json = JSON.parse(row.blueprint_json);
    return row;
  },

  async markBlueprintUsed(code) {
    await q('UPDATE pending_blueprints SET used = 1 WHERE code = $1', [code.toUpperCase()]);
  },

  // ===== Plans =====
  async getAllPlans() {
    return qAll('SELECT * FROM plans ORDER BY credit_price_cents ASC');
  },

  async getPlanById(id) {
    return qOne('SELECT * FROM plans WHERE id = $1', [id]);
  },

  async getPlanByName(name) {
    return qOne('SELECT * FROM plans WHERE name = $1', [name]);
  },

  async createPlan(name, displayName, creditsPerMonth, creditPriceCents, maxServers, aiAccessLevel, prioritySupport, stripePriceId) {
    const id = name;
    await q(
      'INSERT INTO plans (id, name, display_name, credits_per_month, credit_price_cents, max_servers, ai_access_level, priority_support, stripe_price_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [id, name, displayName, creditsPerMonth, creditPriceCents, maxServers, aiAccessLevel, prioritySupport, stripePriceId || null]
    );
    return { id, name, display_name: displayName };
  },

  async updatePlan(id, updates) {
    const existing = await qOne('SELECT * FROM plans WHERE id = $1', [id]);
    if (!existing) return null;
    await q(
      `UPDATE plans SET display_name = $1, credits_per_month = $2, credit_price_cents = $3, max_servers = $4, ai_access_level = $5, priority_support = $6, stripe_price_id = $7 WHERE id = $8`,
      [
        updates.display_name || existing.display_name,
        updates.credits_per_month ?? existing.credits_per_month,
        updates.credit_price_cents ?? existing.credit_price_cents,
        updates.max_servers ?? existing.max_servers,
        updates.ai_access_level || existing.ai_access_level,
        updates.priority_support ?? existing.priority_support,
        updates.stripe_price_id ?? existing.stripe_price_id,
        id
      ]
    );
    return qOne('SELECT * FROM plans WHERE id = $1', [id]);
  },

  async deletePlan(id) {
    await q('DELETE FROM plans WHERE id = $1', [id]);
  },

  // ===== Subscriptions =====
  async getUserSubscription(userId) {
    return qOne(
      `SELECT s.*, p.name as plan_name, p.display_name, p.credits_per_month, p.credit_price_cents, p.max_servers, p.ai_access_level, p.priority_support
       FROM subscriptions s JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1`, [userId]
    );
  },

  async createSubscription(userId, planId, stripeCustomerId, stripeSubscriptionId) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await q(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end)
       VALUES ($1,$2,$3,'active',$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET plan_id = $3, status = 'active', stripe_customer_id = $4, stripe_subscription_id = $5, current_period_start = $6, current_period_end = $7`,
      [id, userId, planId, stripeCustomerId || null, stripeSubscriptionId || null, now, periodEnd]
    );
    await q('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, userId]);
  },

  async updateSubscriptionStatus(userId, status) {
    await q('UPDATE subscriptions SET status = $1 WHERE user_id = $2', [status, userId]);
  },

  async cancelSubscription(userId) {
    await q(`UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1`, [userId]);
    await q(`UPDATE users SET plan_id = 'free' WHERE id = $1`, [userId]);
  },

  async updateSubscriptionPeriod(userId, periodStart, periodEnd) {
    await q('UPDATE subscriptions SET current_period_start = $1, current_period_end = $2, credits_used_this_period = 0 WHERE user_id = $3', [periodStart, periodEnd, userId]);
  },

  async getSubscriptionByStripeId(stripeSubscriptionId) {
    return qOne('SELECT * FROM subscriptions WHERE stripe_subscription_id = $1', [stripeSubscriptionId]);
  },

  async getSubscriptionByStripeCustomer(stripeCustomerId) {
    return qOne('SELECT * FROM subscriptions WHERE stripe_customer_id = $1', [stripeCustomerId]);
  },

  // ===== Credits =====
  async getUserCredits(userId) {
    const row = await qOne('SELECT credits_balance FROM users WHERE id = $1', [userId]);
    return row ? row.credits_balance : 0;
  },

  async deductCredits(userId, amount) {
    const result = await q(
      'UPDATE users SET credits_balance = GREATEST(0, credits_balance - $1), credits_used_this_month = credits_used_this_month + $1 WHERE id = $2 RETURNING credits_balance',
      [amount, userId]
    );
    return result.rows[0] ? result.rows[0].credits_balance : 0;
  },

  async addCredits(userId, amount) {
    const result = await q(
      'UPDATE users SET credits_balance = credits_balance + $1 WHERE id = $2 RETURNING credits_balance',
      [amount, userId]
    );
    return result.rows[0] ? result.rows[0].credits_balance : 0;
  },

  async setCredits(userId, amount) {
    await q('UPDATE users SET credits_balance = $1 WHERE id = $2', [amount, userId]);
  },

  async resetMonthlyCredits(userId) {
    const user = await qOne('SELECT plan_id FROM users WHERE id = $1', [userId]);
    if (!user) return;
    const plan = await qOne('SELECT credits_per_month FROM plans WHERE id = $1', [user.plan_id]);
    if (!plan) return;
    await q('UPDATE users SET credits_balance = $1, credits_used_this_month = 0 WHERE id = $2', [plan.credits_per_month, userId]);
  },

  async logCreditTransaction(userId, amount, balanceAfter, type, description) {
    const id = uuidv4();
    await q(
      'INSERT INTO credit_transactions (id, user_id, amount, balance_after, type, description) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, userId, amount, balanceAfter, type, description || null]
    );
    return id;
  },

  async getCreditTransactions(userId, limit = 50) {
    return qAll('SELECT * FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [userId, limit]);
  },

  async getAllSubscriptions(limit = 100) {
    return qAll(
      `SELECT s.*, u.username, p.display_name as plan_display_name
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN plans p ON s.plan_id = p.id
       ORDER BY s.created_at DESC LIMIT $1`, [limit]
    );
  },

  async getUserServersCount(userId) {
    const result = await qOne('SELECT COUNT(*) as count FROM server_configs WHERE user_id = $1', [userId]);
    return parseInt(result?.count || '0');
  },

  // ===== Credit Purchases =====
  async createCreditPurchase(userId, credits, amountCents, stripeSessionId) {
    const id = uuidv4();
    await q(
      'INSERT INTO credit_purchases (id, user_id, credits, amount_cents, stripe_session_id, status) VALUES ($1,$2,$3,$4,$5,\'pending\')',
      [id, userId, credits, amountCents, stripeSessionId]
    );
    return id;
  },

  async updateCreditPurchase(stripeSessionId, status, stripePaymentIntent) {
    await q(
      'UPDATE credit_purchases SET status = $1, stripe_payment_intent = $2 WHERE stripe_session_id = $3',
      [status, stripePaymentIntent || null, stripeSessionId]
    );
  },

  async getCreditPurchases(userId, limit = 50) {
    return qAll('SELECT * FROM credit_purchases WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [userId, limit]);
  },

  // ===== Audit Logs =====
  async logAudit(adminId, adminUsername, action, targetType, targetId, details) {
    const id = uuidv4();
    await q(
      'INSERT INTO audit_logs (id, admin_id, admin_username, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, adminId, adminUsername, action, targetType || null, targetId || null, details || null]
    );
    return id;
  },

  async getAuditLogs(limit = 50, offset = 0) {
    return qAll(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
  },

  async getAuditLogStats() {
    return qAll('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action');
  },

  // ===== Folders =====
  async getFolders(userId) {
    return qAll('SELECT * FROM folders WHERE user_id = $1 ORDER BY name ASC', [userId]);
  },

  async createFolder(userId, name, color) {
    const id = uuidv4();
    await q(
      'INSERT INTO folders (id, user_id, name, color) VALUES ($1,$2,$3,$4)',
      [id, userId, name, color || '#5865F2']
    );
    return { id, user_id: userId, name, color: color || '#5865F2' };
  },

  async deleteFolder(id, userId) {
    await q('UPDATE conversations SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2', [id, userId]);
    await q('DELETE FROM folders WHERE id = $1 AND user_id = $2', [id, userId]);
  },

  async moveConversationToFolder(conversationId, folderId, userId) {
    if (folderId) {
      const folder = await qOne('SELECT id FROM folders WHERE id = $1 AND user_id = $2', [folderId, userId]);
      if (!folder) return false;
    }
    const conv = await qOne('SELECT id FROM conversations WHERE id = $1 AND user_id = $2', [conversationId, userId]);
    if (!conv) return false;
    await q('UPDATE conversations SET folder_id = $1, updated_at = now()::text WHERE id = $2', [folderId, conversationId]);
    return true;
  },

  // ===== Blueprint Versions =====
  async saveBlueprintVersion(conversationId, userId, blueprintJson) {
    const id = uuidv4();
    const lastVersion = await qOne(
      'SELECT MAX(version_number) as max_ver FROM blueprint_versions WHERE conversation_id = $1',
      [conversationId]
    );
    const versionNumber = (lastVersion?.max_ver || 0) + 1;
    await q(
      'INSERT INTO blueprint_versions (id, conversation_id, user_id, blueprint_json, version_number) VALUES ($1,$2,$3,$4,$5)',
      [id, conversationId, userId, blueprintJson, versionNumber]
    );
    return { id, version_number: versionNumber };
  },

  async getBlueprintVersions(conversationId) {
    return qAll(
      'SELECT * FROM blueprint_versions WHERE conversation_id = $1 ORDER BY version_number DESC',
      [conversationId]
    );
  },

  async getBlueprintVersionById(versionId, conversationId) {
    return qOne(
      'SELECT * FROM blueprint_versions WHERE id = $1 AND conversation_id = $2',
      [versionId, conversationId]
    );
  }
};
