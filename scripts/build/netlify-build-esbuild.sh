#!/bin/bash

# Exit on error
set -e

echo "=== Netlify ESBuild Script ==="
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

# Install with npm
echo "=== Installing client dependencies with npm ==="
npm install --no-audit --no-fund

# Create dist directory
mkdir -p dist

# Copy static files
cp index.html dist/
cp -r public/* dist/ 2>/dev/null || true

# Copy core files first (like build-standalone.js does)
echo "=== Copying core files ==="
if [ ! -d "src/core" ] && [ -d "../packages/core" ]; then
  cp -r ../packages/core src/
  echo "Core files copied"
else
  echo "Core files already exist or source not found"
fi

# Find the actual entry point
echo "=== Locating entry point ==="
if [ -f "src/index.tsx" ]; then
  ENTRY="src/index.tsx"
elif [ -f "src/index.js" ]; then
  ENTRY="src/index.js"
elif [ -f "src/main.tsx" ]; then
  ENTRY="src/main.tsx"
else
  echo "Could not find entry point!"
  find src -name "index.*" -o -name "main.*" | head -5
  exit 1
fi

echo "Using entry point: $ENTRY"

# Build with esbuild directly (more forgiving than vite/rollup)
echo "=== Building with esbuild ==="
npx esbuild "$ENTRY" \
  --bundle \
  --outfile=dist/bundle.js \
  --platform=browser \
  --target=es2020 \
  --jsx=automatic \
  --loader:.js=jsx \
  --loader:.ts=tsx \
  --loader:.tsx=tsx \
  --loader:.css=text \
  --define:process.env.NODE_ENV=\"production\" \
  --minify || {
    echo "ESBuild failed, trying without minification..."
    npx esbuild "$ENTRY" \
      --bundle \
      --outfile=dist/bundle.js \
      --platform=browser \
      --target=es2020 \
      --jsx=automatic \
      --loader:.js=jsx \
      --loader:.ts=tsx \
      --loader:.tsx=tsx \
      --loader:.css=text \
      --define:process.env.NODE_ENV=\"production\"
  }

# Update index.html to use bundle.js
sed -i 's|type="module" src="/src/index.tsx"|src="/bundle.js"|' dist/index.html 2>/dev/null || \
sed -i '' 's|type="module" src="/src/index.tsx"|src="/bundle.js"|' dist/index.html

echo "=== Build complete! ==="
ls -la dist/