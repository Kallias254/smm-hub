#!/bin/sh
set -e

# Check if node_modules exists and is not empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "📦 node_modules is missing or empty. Installing dependencies via pnpm..."
    pnpm install
else
    echo "✅ node_modules exists. Skipping install."
fi

# Execute the passed command (e.g., "pnpm dev")
exec "$@"
