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
  
  # Fix imports in various files
  echo "=== Fixing imports in core files ==="
  
  # Fix index.ts
  if [ -f "src/core/index.ts" ]; then
    # Comment out lines that reference deleted components
    sed -i.bak 's/.*WorkflowManager.*/\/\/ &/' src/core/index.ts
    sed -i.bak 's/.*ExtensionLifecycleManager.*/\/\/ &/' src/core/index.ts
    sed -i.bak 's/.*ExtensionManager.*/\/\/ &/' src/core/index.ts
    sed -i.bak 's/.*extensions\/.*/\/\/ &/' src/core/index.ts
    
    # Comment out the entire problematic export block (lines 46-76)
    sed -i.bak '46,76s/^/\/\/ /' src/core/index.ts
    
    rm -f src/core/index.ts.bak
  fi
  
  # Fix GraphEditor.js
  if [ -f "src/core/GraphEditor.js" ]; then
    echo "=== Fixing GraphEditor.js imports ==="
    # Comment out ExtensionManagerPanel import
    sed -i.bak 's/.*ExtensionManagerPanel.*/\/\/ &/' src/core/GraphEditor.js
    # Comment out any JSX that uses ExtensionManagerPanel
    sed -i.bak 's/.*<ExtensionManagerPanel.*/\/\/ &/' src/core/GraphEditor.js
    sed -i.bak 's/.*ExtensionManagerPanel>.*/\/\/ &/' src/core/GraphEditor.js
    rm -f src/core/GraphEditor.js.bak
  fi
  
  # Fix any other files that might import extension components
  find src/core -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "ExtensionManager\|WorkflowManager\|extensions\/" "$file" 2>/dev/null; then
      echo "Fixing imports in: $file"
      sed -i.bak 's/.*ExtensionManager.*/\/\/ &/' "$file"
      sed -i.bak 's/.*WorkflowManager.*/\/\/ &/' "$file"
      sed -i.bak 's/.*extensions\/.*/\/\/ &/' "$file"
      rm -f "${file}.bak"
    fi
  done
fi

# Run the original build
echo "=== Running build-standalone.js ==="
node build-standalone.js

echo "=== Build complete! ==="
ls -la dist/