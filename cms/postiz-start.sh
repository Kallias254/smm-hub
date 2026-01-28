#!/bin/sh
set -e

echo "🚀 Starting Postiz Custom Bootstrap (100yr Dev Mode)..."

# 1. Wait for Database
echo "⏳ Waiting for Postgres..."
node -e "
const net = require('net');
const check = () => {
  const client = net.createConnection({ port: 5432, host: 'postiz-postgres' }, () => {
    console.log('✅ Postgres is UP!');
    process.exit(0);
  });
  client.on('error', () => {
    setTimeout(check, 1000);
  });
};
check();
"

# 2. Run Prisma Push
echo "📦 Syncing Database Schema..."
npx prisma db push --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma --accept-data-loss

# 3. Start Services via PM2
echo "⚡ Starting Services..."
pm2 delete all || true
pm2 start npx --name frontend -- next start ./apps/frontend -p 4200
pm2 start node --name backend -- --experimental-require-module ./apps/backend/dist/apps/backend/src/main.js
pm2 start node --name orchestrator -- --experimental-require-module ./apps/orchestrator/dist/apps/orchestrator/src/main.js

# 4. Start Internal Proxy (Required for port 5000)
# Note: nginx usually requires a daemon off flag if run as primary, but here we run it in background
echo "🌐 Starting Internal Proxy..."
nginx -g "daemon on;"

echo "🛰️ Bootstrap Complete. Tailing logs..."
pm2 logs
