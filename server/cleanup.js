const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Set DATABASE_URL environment variable');
  process.exit(1);
}

async function cleanup() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
  });

  const tables = [
    'messages',
    'conversations',
    'templates',
    'generation_logs',
    'pending_blueprints',
    'audit_logs',
    'folders',
    'blueprint_versions',
    'credit_transactions',
    'credit_purchases',
    'subscriptions',
    'plans',
    'server_configs',
    'bot_connections',
    'ip_bans'
  ];

  for (const table of tables) {
    try {
      const result = await pool.query(`DELETE FROM ${table}`);
      console.log(`Cleared ${table}: ${result.rowCount} rows deleted`);
    } catch (e) {
      console.log(`Skipped ${table}: ${e.message}`);
    }
  }

  // Reset user data but keep accounts
  try {
    const result = await pool.query('UPDATE users SET usage_count = 0, last_usage_reset = NOW()::text');
    console.log(`Reset usage for ${result.rowCount} users`);
  } catch (e) {
    console.log(`Skipped user reset: ${e.message}`);
  }

  // Keep ai_providers (API keys) - do NOT delete

  console.log('\nDone! Chat data cleared. API keys preserved.');
  await pool.end();
}

cleanup().catch(e => { console.error(e); process.exit(1); });
