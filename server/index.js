require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database');
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
const billingRoutes = require('./routes/billing');

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
app.use('/api/billing', billingRoutes);

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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
