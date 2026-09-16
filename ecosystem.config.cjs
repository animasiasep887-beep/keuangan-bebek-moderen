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

const caddyExe = path.join(__dirname, 'caddy.exe');
const caddyConfig = path.join(__dirname, 'Caddyfile');

if (fs.existsSync(caddyExe) && fs.existsSync(caddyConfig)) {
  apps.push({
    name: 'caddy-proxy',
    script: caddyExe,
    args: `run --config "${caddyConfig}"`,
    autorestart: true,
    watch: false,
    restart_delay: 3000,
    time: true,
  });
}

module.exports = { apps };
