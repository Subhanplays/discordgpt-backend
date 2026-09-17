require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');
const { initDatabase, getSessionByToken } = require('./database');
const { validateBotToken, setActiveBot } = require('./utils/discord');
const { startPersistentClient, stopPersistentClient } = require('./utils/slashCommands');

const authRoutes = require('./routes/auth');
const discordAuthRoutes = require('./routes/discord-auth');
const chatRoutes = require('./routes/chat');
const botRoutes = require('./routes/bot');
const serverRoutes = require('./routes/server');
const templateRoutes = require('./routes/templates');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const blueprintRoutes = require('./routes/blueprint');
const usageRoutes = require('./routes/usage');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/stats/public', async (req, res) => {
  try {
    const pool = require('./database').getPool();
    const [users, conversations, servers] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM conversations'),
      pool.query('SELECT COUNT(*) as count FROM server_configs')
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalConversations: parseInt(conversations.rows[0].count),
      totalServers: parseInt(servers.rows[0].count)
    });
  } catch (error) {
    res.json({ totalUsers: 0, totalConversations: 0, totalServers: 0 });
  }
});

app.post('/api/auth/friend-login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const pool = require('./database').getPool();
    const result = await pool.query(
      'SELECT * FROM friend_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    const ft = result.rows[0];

    if (ft.used === 1) {
      return res.status(410).json({ error: 'This link has already been used' });
    }

    if (new Date(ft.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    await pool.query('UPDATE friend_tokens SET used = 1 WHERE id = $1', [ft.id]);

    const { v4: uuidv4 } = require('uuid');
    const crypto = require('crypto');

    const userId = uuidv4();
    const passwordHash = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('hex')).digest('hex');
    const email = `${ft.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@friend.discordgpt.bond`;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const session = await require('./database').createSession(existing.rows[0].id, 86400000);
      return res.json({
        user: { id: existing.rows[0].id, username: ft.username, email, role: 'user' },
        token: session.token,
        expiresAt: session.expiresAt
      });
    }

    await pool.query(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, ft.username, email, passwordHash, 'user']
    );

    const session = await require('./database').createSession(userId, 86400000);

    res.json({
      user: { id: userId, username: ft.username, email, role: 'user' },
      token: session.token,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Friend login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/discord', discordAuthRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blueprint', blueprintRoutes);
app.use('/api/usage', usageRoutes);

app.post('/api/bootstrap/promote', async (req, res) => {
  try {
    const { discord_id } = req.body;
    if (discord_id !== '1314595225741688877') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const pool = require('./database').getPool();
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE discord_id = $1 RETURNING id, username, role`,
      [discord_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please log in with Discord first.' });
    }
    res.json({ message: 'Admin promoted', user: result.rows[0] });
  } catch (error) {
    console.error('Bootstrap promote error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const BUILTIN_BOT_USER = 'discordgpt-system';

async function connectBuiltinBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log('No DISCORD_BOT_TOKEN in env — built-in bot disabled');
    return;
  }
  try {
    const validation = await validateBotToken(token);
    if (validation.valid) {
      setActiveBot(BUILTIN_BOT_USER, token, validation.botInfo);
      console.log(`Built-in bot connected: ${validation.botInfo.username} (${validation.botInfo.id})`);

      startPersistentClient(token, validation.botInfo).catch(err => {
        console.error('Persistent client failed:', err.message);
      });
    } else {
      console.error('Built-in bot token invalid:', validation.error);
    }
  } catch (e) {
    console.error('Failed to connect built-in bot:', e.message);
  }
}

async function start() {
  try {
    await initDatabase();
    console.log('Database connected');

    await connectBuiltinBot();

    const server = http.createServer(app);

    const wss = new WebSocketServer({ server });
    const wsClients = new Map();

    wss.on('connection', (ws, req) => {
      const params = new url.URL(req.url, `http://${req.headers.host}`).searchParams;
      const token = params.get('token');

      if (!token) {
        ws.close(4001, 'Token required');
        return;
      }

      const { getSessionByToken } = require('./database');
      getSessionByToken(token).then(session => {
        if (!session) {
          ws.close(4002, 'Invalid token');
          return;
        }

        ws.userId = session.user_id;
        ws.subscriptions = new Set();

        if (!wsClients.has(session.user_id)) {
          wsClients.set(session.user_id, new Set());
        }
        wsClients.get(session.user_id).add(ws);

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data);
            if (msg.type === 'subscribe' && msg.jobId) {
              ws.subscriptions.add(msg.jobId);
            }
          } catch (e) {}
        });

        ws.on('close', () => {
          const userClients = wsClients.get(ws.userId);
          if (userClients) {
            userClients.delete(ws);
            if (userClients.size === 0) wsClients.delete(ws.userId);
          }
        });
      }).catch(() => {
        ws.close(4002, 'Auth error');
      });
    });

    global.broadcastJobUpdate = (userId, jobId, progress) => {
      const userClients = wsClients.get(userId);
      if (userClients) {
        const payload = JSON.stringify({ type: 'job_update', jobId, progress });
        for (const ws of userClients) {
          if (ws.readyState === 1 && (ws.subscriptions.size === 0 || ws.subscriptions.has(jobId))) {
            ws.send(payload);
          }
        }
      }
    };

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
