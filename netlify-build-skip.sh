#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Skip Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
fi

# Use the original build script but skip the problematic extensions
cd client

# Remove problematic extension files before copying
echo "=== Preparing core files ==="
if [ -d "../packages/core" ]; then
  # Create a temp copy
  cp -r ../packages/core ../packages/core-temp
  
  # Remove problematic files
  rm -rf ../packages/core-temp/components/ExtensionManager
  rm -rf ../packages/core-temp/extensions
  rm -rf ../packages/core-temp/components/WorkflowManager*
  
  # Copy the cleaned version
  rm -rf src/core
  cp -r ../packages/core-temp src/core
  
  # Clean up
  rm -rf ../packages/core-temp
fi

# Run the original build
echo "=== Running build-standalone.js ==="
node build-standalone.js

echo "=== Build complete! ==="
ls -la dist/