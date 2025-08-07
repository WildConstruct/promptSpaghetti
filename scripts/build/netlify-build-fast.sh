#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Fast Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
fi

# Clean any existing modules to avoid cache issues
echo "=== Cleaning cached dependencies ==="
rm -rf node_modules client/node_modules packages/*/node_modules || true

# Check for pnpm
echo "=== Checking for pnpm ==="
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found, installing..."
    npm install -g pnpm@10.13.1
else
    echo "pnpm is already installed"
fi

echo "pnpm version: $(pnpm --version)"

# Install only production dependencies for the client
echo "=== Installing client production dependencies only ==="
cd client
pnpm install --prod --no-optional --no-frozen-lockfile --reporter=append-only

echo "=== Building client ==="
pnpm build

echo "=== Build complete ==="
echo "=== Listing dist contents ==="
ls -la dist/

echo "=== Build successful! ==="