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

# Remove src/core if it exists to start fresh
rm -rf src/core

# Copy core files
echo "=== Copying core files ==="
cp -r ../packages/core src/

# Remove problematic files after copying
echo "=== Removing problematic files ==="
rm -rf src/core/components/ExtensionManager
rm -rf src/core/extensions
rm -rf src/core/components/WorkflowManager*
rm -rf src/core/ResponsiveCorrectionsPanel*
rm -rf src/core/components/CorrectionsStatsDashboard*
rm -rf src/core/components/MobileCorrectionsPanel*
rm -rf src/core/components/NotificationSystem*
rm -rf src/core/correctionsStore*
rm -rf src/core/components/Inspector/EnhancedTextAreaEditor*

# Clean up imports in files
echo "=== Cleaning up imports ==="

# Remove/comment imports from GraphEditor files (could be .tsx or .js after build process)
for ext in tsx ts jsx js; do
  if [ -f "src/core/GraphEditor.$ext" ]; then
    echo "Cleaning imports from GraphEditor.$ext"
    # Remove import lines
    sed -i.bak '/import.*ResponsiveCorrectionsPanel/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/import.*CorrectionsStatsDashboard/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/import.*ExtensionManagerPanel/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/import.*useCorrectionsEnabled/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/import.*correctionsStore/d' "src/core/GraphEditor.$ext"
    
    # Also remove any JSX references to these components
    sed -i.bak '/<ResponsiveCorrectionsPanel/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/<CorrectionsStatsDashboard/d' "src/core/GraphEditor.$ext"  
    sed -i.bak '/<ExtensionManagerPanel/d' "src/core/GraphEditor.$ext"
    
    # Remove any lines using these components or hooks
    sed -i.bak '/useCorrectionsEnabled/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/correctionsEnabled/d' "src/core/GraphEditor.$ext"
    
    rm -f "src/core/GraphEditor.$ext.bak"
  fi
done

# Fix index.ts - comment out problematic exports
if [ -f "src/core/index.ts" ]; then
  # Comment out Epic 8.2 exports (lines 36-44)
  sed -i.bak '36,44s/^/\/\/ /' src/core/index.ts
  # Comment out Epic 8.4 exports (lines 45-76)
  sed -i.bak '45,76s/^/\/\/ /' src/core/index.ts
  rm -f src/core/index.ts.bak
fi

# Create ES6 wrapper modules for CommonJS files
echo "=== Creating ES6 wrappers ==="

# Create validation wrapper
if [ -f "src/core/validation.js" ]; then
  mv src/core/validation.js src/core/validation-commonjs.js
  cat > src/core/validation.js << 'EOF'
// ES6 wrapper for CommonJS validation module
import * as validationModule from './validation-commonjs.js';
export const validateConnection = validationModule.validateConnection || validationModule.default?.validateConnection;
export default validationModule.default || validationModule;
EOF
fi

# Create usePreviewSeeds wrapper
if [ -f "src/core/usePreviewSeeds.js" ]; then
  mv src/core/usePreviewSeeds.js src/core/usePreviewSeeds-commonjs.js
  cat > src/core/usePreviewSeeds.js << 'EOF'
// ES6 wrapper for CommonJS usePreviewSeeds module
import * as usePreviewSeedsModule from './usePreviewSeeds-commonjs.js';
export const usePreviewSeeds = usePreviewSeedsModule.usePreviewSeeds || usePreviewSeedsModule.default?.usePreviewSeeds;
export default usePreviewSeedsModule.default || usePreviewSeedsModule;
EOF
fi

# Create nodeSchemas wrapper
if [ -f "src/core/nodeSchemas.js" ]; then
  mv src/core/nodeSchemas.js src/core/nodeSchemas-commonjs.js
  cat > src/core/nodeSchemas.js << 'EOF'
// ES6 wrapper for CommonJS nodeSchemas module
import * as nodeSchemasModule from './nodeSchemas-commonjs.js';
export const nodeSchemas = nodeSchemasModule.nodeSchemas || nodeSchemasModule.default?.nodeSchemas;
export default nodeSchemasModule.default || nodeSchemasModule;
EOF
fi

# Run the original build
echo "=== Running build-standalone.js ==="
node build-standalone.js

echo "=== Build complete! ==="
ls -la dist/