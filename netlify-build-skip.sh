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

# Create a custom vite config for netlify build
echo "=== Creating custom vite config ==="
cat > vite.config.netlify.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom plugin to handle CommonJS modules
const commonjsCompatibility = () => {
  return {
    name: 'commonjs-compatibility',
    transform(code, id) {
      // Handle validation.js
      if (id.endsWith('validation.js') && code.includes('exports.validateConnection')) {
        return code + '\nexport { validateConnection };';
      }
      // Handle usePreviewSeeds.js
      if (id.endsWith('usePreviewSeeds.js') && code.includes('exports.usePreviewSeeds')) {
        return code + '\nexport { usePreviewSeeds };';
      }
      // Handle nodeSchemas.js
      if (id.endsWith('nodeSchemas.js') && code.includes('exports.nodeSchemas')) {
        return code + '\nexport { nodeSchemas };';
      }
      return null;
    }
  };
};

export default defineConfig({
  plugins: [react(), commonjsCompatibility()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        warn(warning);
      }
    }
  }
});
EOF

# Run build with custom config
echo "=== Running build with custom config ==="
npx vite build --config vite.config.netlify.ts

echo "=== Build complete! ==="
ls -la dist/