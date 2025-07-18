#!/bin/bash

# Exit on error and print commands as they execute
set -e
set -x

# Function to handle errors
handle_error() {
    echo "ERROR: Build failed at line $1"
    echo "Command that failed: $BASH_COMMAND"
    exit 1
}

# Set error trap
trap 'handle_error $LINENO' ERR

echo "=== Netlify Build Script (Improved) ==="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Print environment info
echo "=== Environment Information ==="
echo "Node version: $(node --version || echo 'Node not found')"
echo "NPM version: $(npm --version || echo 'NPM not found')"
echo "PATH: $PATH"

# Check if package.json.real exists and restore it
echo "=== Checking for package.json.real ==="
if [ -f "package.json.real" ]; then
    echo "Found package.json.real, restoring..."
    mv -v package.json.real package.json
    echo "package.json restored successfully"
else
    echo "No package.json.real found, using existing package.json"
fi

# Verify package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    exit 1
fi

echo "=== package.json content preview ==="
head -20 package.json

# Clean any existing modules to avoid cache issues
echo "=== Cleaning cached dependencies ==="
echo "Removing node_modules directories..."
rm -rf node_modules || echo "No root node_modules to remove"
rm -rf client/node_modules || echo "No client/node_modules to remove"
rm -rf packages/*/node_modules || echo "No packages/*/node_modules to remove"
echo "Cleanup complete"

# Install pnpm globally
echo "=== Installing pnpm globally ==="
npm install -g pnpm@8.15.4 || {
    echo "Failed to install pnpm globally, trying with npx"
    exit 1
}

# Verify pnpm installation
echo "=== Verifying pnpm installation ==="
which pnpm || echo "pnpm not found in PATH"
pnpm --version || {
    echo "ERROR: pnpm installation failed"
    exit 1
}

# Check if pnpm-lock.yaml exists
echo "=== Checking for pnpm-lock.yaml ==="
if [ -f "pnpm-lock.yaml" ]; then
    echo "pnpm-lock.yaml found"
else
    echo "WARNING: pnpm-lock.yaml not found"
fi

# Install dependencies from root
echo "=== Installing dependencies with pnpm ==="
echo "Running pnpm install..."
pnpm install --no-frozen-lockfile || {
    echo "ERROR: pnpm install failed"
    echo "Trying with --force flag..."
    pnpm install --no-frozen-lockfile --force || {
        echo "ERROR: pnpm install with --force also failed"
        exit 1
    }
}

# Verify installation
echo "=== Verifying installation ==="
echo "Checking if node_modules exists:"
[ -d "node_modules" ] && echo "Root node_modules exists" || echo "WARNING: Root node_modules missing"
[ -d "client/node_modules" ] && echo "Client node_modules exists" || echo "WARNING: Client node_modules missing"

# List workspace packages
echo "=== Listing workspace packages ==="
pnpm list --depth=0 || echo "WARNING: Could not list packages"

# Build the client
echo "=== Building client ==="
echo "Changing to client directory..."
cd client || {
    echo "ERROR: Could not change to client directory"
    exit 1
}

echo "Current directory: $(pwd)"
echo "Client directory contents:"
ls -la

# Check if package.json exists in client
if [ ! -f "package.json" ]; then
    echo "ERROR: client/package.json not found!"
    exit 1
fi

echo "Running pnpm build..."
pnpm build || {
    echo "ERROR: Client build failed"
    echo "Checking for build script in package.json:"
    grep -A2 -B2 '"build"' package.json || echo "Build script not found"
    exit 1
}

# Verify build output
echo "=== Verifying build output ==="
if [ -d "dist" ]; then
    echo "Build output (dist) contents:"
    ls -la dist/
    echo "Total size of dist:"
    du -sh dist/
else
    echo "ERROR: dist directory not found after build!"
    exit 1
fi

echo "=== Build completed successfully ==="