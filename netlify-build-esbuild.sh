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

# Build with esbuild directly (more forgiving than vite/rollup)
echo "=== Building with esbuild ==="
npx esbuild src/index.tsx \
  --bundle \
  --outfile=dist/bundle.js \
  --platform=browser \
  --target=es2020 \
  --jsx=automatic \
  --loader:.js=jsx \
  --loader:.ts=tsx \
  --loader:.tsx=tsx \
  --define:process.env.NODE_ENV=\"production\" \
  --minify || {
    echo "ESBuild failed, trying without minification..."
    npx esbuild src/index.tsx \
      --bundle \
      --outfile=dist/bundle.js \
      --platform=browser \
      --target=es2020 \
      --jsx=automatic \
      --loader:.js=jsx \
      --loader:.ts=tsx \
      --loader:.tsx=tsx \
      --define:process.env.NODE_ENV=\"production\"
  }

# Update index.html to use bundle.js
sed -i 's|type="module" src="/src/index.tsx"|src="/bundle.js"|' dist/index.html 2>/dev/null || \
sed -i '' 's|type="module" src="/src/index.tsx"|src="/bundle.js"|' dist/index.html

echo "=== Build complete! ==="
ls -la dist/