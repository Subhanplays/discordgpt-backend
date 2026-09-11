require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database');
const { validateBotToken, setActiveBot } = require('./utils/discord');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const botRoutes = require('./routes/bot');
const serverRoutes = require('./routes/server');
const templateRoutes = require('./routes/templates');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');

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
app.use('/api/conversations', chatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

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
