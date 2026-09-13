const https = require('https');

const BACKEND_URL = 'https://discordgpt-api.onrender.com/api/health';
const INTERVAL_MS = 50 * 1000; // 50 seconds

function ping() {
  const time = new Date().toLocaleTimeString();
  https.get(BACKEND_URL, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(`[${time}] PING OK - ${res.statusCode}`);
    });
  }).on('error', (err) => {
    console.log(`[${time}] PING FAIL - ${err.message}`);
  });
}

console.log('=== DiscordGPT Keep-Alive Started ===');
console.log(`Target: ${BACKEND_URL}`);
console.log(`Interval: ${INTERVAL_MS / 1000}s`);
console.log('Press Ctrl+C to stop\n');

ping();
setInterval(ping, INTERVAL_MS);
