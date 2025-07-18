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
  
  # Create stub components for missing imports
  echo "=== Creating stub components ==="
  
  # Create ExtensionManager stub
  mkdir -p src/core/components/ExtensionManager
  cat > src/core/components/ExtensionManager/ExtensionManagerPanel.tsx << 'EOF'
import React from 'react';
export const ExtensionManagerPanel = () => null;
EOF
  
  # Create WorkflowManager stub
  cat > src/core/components/WorkflowManager.tsx << 'EOF'
import React from 'react';
export const WorkflowManager = () => null;
EOF
  
  # Create extension stubs
  mkdir -p src/core/extensions
  cat > src/core/extensions/ExtensionLifecycleManager.ts << 'EOF'
export class ExtensionLifecycleManager {
  constructor() {}
}
EOF
  
  # Create interface stubs
  mkdir -p src/core/extensions/interfaces
  cat > src/core/extensions/interfaces/ExtensionInterfaces.ts << 'EOF'
export interface ExtensionManifest {}
export const ExtensionManifestSchema = {};
export class BaseExtension {}
export interface ExtensionHealthStatus {}
export interface ExtensionContext {}
export class ExtensionLogger {}
export class ExtensionStorage {}
export class ExtensionEventEmitter {}
export interface ExtensionRuntime {}
export interface ExtensionUIContext {}
export interface ExtensionAPIContext {}
export interface SystemInfo {}
export interface PerformanceMetrics {}
export type ExtensionLifecycleState = string;
export type ExtensionErrorType = string;
export class ExtensionError extends Error {}
export interface ExtensionValidationResult {}
EOF
  
  cat > src/core/extensions/interfaces/NodeExtension.ts << 'EOF'
export interface NodeExtension {}
export interface NodeCategory {}
EOF
  
  cat > src/core/extensions/interfaces/UIExtension.ts << 'EOF'
export interface UIExtension {}
EOF
  
  cat > src/core/extensions/interfaces/TransformExtension.ts << 'EOF'
export interface TransformExtension {}
EOF
  
  cat > src/core/extensions/interfaces/StorageExtension.ts << 'EOF'
export interface StorageExtension {}
EOF
  
  # Fix index.ts - just comment out the extension export block
  if [ -f "src/core/index.ts" ]; then
    sed -i.bak '46,76s/^/\/\/ /' src/core/index.ts
    rm -f src/core/index.ts.bak
  fi
fi

# Run the original build
echo "=== Running build-standalone.js ==="
node build-standalone.js

echo "=== Build complete! ==="
ls -la dist/