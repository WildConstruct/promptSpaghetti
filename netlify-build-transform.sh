#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Transform Build Script ==="
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
rm -rf node_modules package-lock.json dist src/core

# Skip problematic dependencies
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install with npm
echo "=== Installing client dependencies with npm ==="
npm install

# Copy core files
echo "=== Copying core files ==="
cp -r ../packages/core src/

# Transform CommonJS exports to ES6 in .js files
echo "=== Transforming CommonJS exports to ES6 ==="
find src/core -name "*.js" -type f | while read file; do
  # Skip if file already has ES6 exports
  if grep -q "^export " "$file" 2>/dev/null; then
    continue
  fi
  
  # Transform exports.name = value to export const name = value
  sed -i.bak 's/^exports\.\([a-zA-Z_][a-zA-Z0-9_]*\) = \(.*\);$/export const \1 = \2;/g' "$file"
  
  # Transform module.exports = to export default
  sed -i.bak 's/^module\.exports = /export default /g' "$file"
  
  # Remove Object.defineProperty exports lines
  sed -i.bak '/^Object\.defineProperty(exports/d' "$file"
  
  # Clean up backup files
  rm -f "${file}.bak"
done

# Update imports to use .js extension
echo "=== Updating imports to include .js extension ==="
find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read file; do
  # Add .js to relative imports that don't have an extension
  sed -i.bak "s/from '\(\.\.[^']*\)'/from '\1.js'/g" "$file"
  sed -i.bak 's/from "\(\.\.[^"]*\)"/from "\1.js"/g' "$file"
  
  # But don't add .js if it already has an extension
  sed -i.bak "s/\.js\.js'/.js'/g" "$file"
  sed -i.bak 's/\.js\.js"/.js"/g' "$file"
  
  rm -f "${file}.bak"
done

# Update App.tsx import
if [ -f "src/App.tsx" ]; then
  sed -i 's/from "\.\.\/\.\.\/packages\/core"/from ".\/core"/g' src/App.tsx
fi

# Build with standard npm build
echo "=== Building client ==="
npm run build

echo "=== Build complete! ==="
ls -la dist/