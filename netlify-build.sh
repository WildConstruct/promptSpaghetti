#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Build Script ==="
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

# Install pnpm
echo "=== Installing pnpm ==="
npm install -g pnpm@10.13.1

# Verify pnpm installation
echo "pnpm version: $(pnpm --version)"

# Install dependencies from root
echo "=== Installing dependencies with pnpm ==="
# Install without frozen lockfile to avoid version conflicts
pnpm install --no-frozen-lockfile

# Build the client
echo "=== Building client ==="
cd client
pnpm build

echo "=== Build complete ==="
ls -la dist/