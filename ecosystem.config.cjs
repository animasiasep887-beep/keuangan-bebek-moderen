const fs = require('node:fs');
const path = require('node:path');

const apps = [
  {
    name: 'ternak-fun',
    script: 'server/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '350M',
    restart_delay: 2000,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    time: true,
  },
];

const cloudflaredExe = path.join(__dirname, 'cloudflared.exe');
const tunnelJson = path.join(__dirname, 'tunnel.json');

if (fs.existsSync(cloudflaredExe) && fs.existsSync(tunnelJson)) {
  apps.push({
    name: 'ternak-tunnel',
    script: cloudflaredExe,
    args: `tunnel --credentials-file "${tunnelJson}" run --url http://127.0.0.1:3001 0def092e-cd92-4db7-9eba-9bbfd69c75a8`,
    autorestart: true,
    watch: false,
    restart_delay: 3000,
    time: true,
  });
}

module.exports = { apps };

