#!/bin/bash

# Don't exit on error immediately - we want to see what's happening
set +e

echo "=== Netlify Debug Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
  echo "Restored package.json.real to package.json"
else
  echo "No package.json.real found"
fi

# Check what we have
echo "=== Repository structure ==="
ls -la
echo "=== Client directory ==="
ls -la client/

# Go to client directory
cd client
echo "=== Now in: $(pwd) ==="

# Check client structure
echo "=== Client structure ==="
ls -la
echo "=== Client src directory ==="
ls -la src/ || echo "No src directory found"

# Clean everything
echo "=== Cleaning client dependencies ==="
rm -rf node_modules package-lock.json dist

# Skip problematic dependencies
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install with npm
echo "=== Installing client dependencies with npm ==="
npm install --no-audit --no-fund || {
  echo "npm install failed with exit code $?"
  echo "=== Package.json contents ==="
  cat package.json
  exit 1
}

# Copy core files first (like build-standalone.js does)
echo "=== Copying core files ==="
if [ ! -d "src/core" ] && [ -d "../packages/core" ]; then
  cp -r ../packages/core src/
  echo "Core files copied from ../packages/core to src/core"
elif [ -d "src/core" ]; then
  echo "src/core already exists"
else
  echo "Could not find ../packages/core"
  echo "=== Looking for packages directory ==="
  find .. -name "packages" -type d | head -5
fi

# Check what's in src now
echo "=== Contents of src directory after copy ==="
ls -la src/
echo "=== Looking for entry files ==="
find src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | grep -E "(index|main|app|App)" | head -10

# Try the original build first
echo "=== Trying original build with build-standalone.js ==="
if [ -f "build-standalone.js" ]; then
  node build-standalone.js || {
    echo "build-standalone.js failed with exit code $?"
    echo "Continuing with esbuild attempt..."
  }
else
  echo "No build-standalone.js found"
fi

# If we got here and dist exists, we're done
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "=== Build successful with build-standalone.js ==="
  ls -la dist/
  exit 0
fi

echo "=== Build failed or incomplete, showing detailed error information ==="
exit 1