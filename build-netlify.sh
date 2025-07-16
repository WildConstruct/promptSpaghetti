#!/bin/bash

# Netlify build script with enhanced debugging
set -e  # Exit on any error
set -x  # Print each command as it executes

# Handle errors gracefully
trap 'echo "Build failed at line $LINENO"; exit 1' ERR

echo "=== Starting Netlify Build ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "=== Step 1: Installing root dependencies ==="
cd ..
echo "Root directory: $(pwd)"
echo "Root package.json exists: $(test -f package.json && echo 'YES' || echo 'NO')"
npm install --no-audit --include=dev

echo "=== Step 2: Installing client dependencies ==="
cd client
echo "Client directory: $(pwd)"
echo "Client package.json exists: $(test -f package.json && echo 'YES' || echo 'NO')"
npm install --no-audit

echo "=== Step 3: Running build ==="
echo "Available scripts:"
npm run --silent 2>/dev/null || echo "No scripts found"
echo "Starting build..."
npm run build

echo "=== Build completed successfully ==="
echo "Build output:"
ls -la dist/