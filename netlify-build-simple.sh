#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Simple Build Script ==="
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
rm -rf node_modules package-lock.json dist

# Skip problematic dependencies
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install all dependencies (not just production)
echo "=== Installing all client dependencies with npm ==="
npm install --no-audit --no-fund

# Try building with standard vite command
echo "=== Building client with standard vite ==="
npx vite build || {
    echo "Standard build failed, trying with legacy peer deps..."
    npm install --legacy-peer-deps --no-audit --no-fund
    npx vite build
}

echo "=== Build complete! ==="
ls -la dist/