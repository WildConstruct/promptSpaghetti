#!/bin/bash

# Exit on error
set -e

echo "=== Netlify NPM Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
fi

# Go to client directory
cd client

# Clean everything
echo "=== Cleaning client dependencies ==="
rm -rf node_modules package-lock.json

# Skip puppeteer download
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install with npm (ignoring workspace)
echo "=== Installing client dependencies with npm ==="
npm install --production --no-optional --no-audit --no-fund

echo "=== Building client ==="
npm run build

echo "=== Build complete! ==="
ls -la dist/