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
      `SELECT id, title, created_at FROM conversations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )).rows;
  },

  async deleteConversation(conversationId, userId) {
    await q('DELETE FROM messages WHERE conversation_id = $1', [conversationId]);
    await q('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [conversationId, userId]);
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
  }
};
