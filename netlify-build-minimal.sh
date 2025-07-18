#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Minimal Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
fi

# Create a temporary build directory outside the workspace
echo "=== Creating isolated build environment ==="
BUILD_DIR="/tmp/netlify-build-$$"
mkdir -p "$BUILD_DIR"

# Copy only what we need for the client build
echo "=== Copying client files ==="
cp -r client "$BUILD_DIR/"
cp -r packages/core "$BUILD_DIR/packages/"

# Create a minimal package.json in the build directory
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "netlify-build",
  "private": true,
  "workspaces": ["client", "packages/core"]
}
EOF

# Move to build directory
cd "$BUILD_DIR"

# Install pnpm if needed
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@10.13.1
fi

echo "=== Installing dependencies in isolated environment ==="
# Install with minimal settings
PUPPETEER_SKIP_DOWNLOAD=true pnpm install --no-optional --ignore-scripts --filter client --filter @promptscape/core

echo "=== Building client ==="
cd client
pnpm build

echo "=== Copying build output back ==="
cp -r dist/* /opt/build/repo/client/dist/

echo "=== Build complete! ==="
ls -la /opt/build/repo/client/dist/