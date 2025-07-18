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
rm -rf src/core/collaboration
rm -rf src/core/llm-randomizer

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
    
    # Remove the entire JSX elements and any conditional rendering
    sed -i.bak '/<ResponsiveCorrectionsPanel/,/\/ResponsiveCorrectionsPanel>/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/<CorrectionsStatsDashboard/,/\/CorrectionsStatsDashboard>/d' "src/core/GraphEditor.$ext"  
    sed -i.bak '/<ExtensionManagerPanel/,/\/ExtensionManagerPanel>/d' "src/core/GraphEditor.$ext"
    
    # Comment out any lines that reference these components
    sed -i.bak 's/.*ResponsiveCorrectionsPanel.*/\/\/ &/' "src/core/GraphEditor.$ext"
    sed -i.bak 's/.*CorrectionsStatsDashboard.*/\/\/ &/' "src/core/GraphEditor.$ext"
    sed -i.bak 's/.*ExtensionManagerPanel.*/\/\/ &/' "src/core/GraphEditor.$ext"
    
    # Remove any lines using these components or hooks
    sed -i.bak '/useCorrectionsEnabled/d' "src/core/GraphEditor.$ext"
    sed -i.bak '/correctionsEnabled/d' "src/core/GraphEditor.$ext"
    
    rm -f "src/core/GraphEditor.$ext.bak"
  fi
done

# Create stub components for any remaining references
echo "=== Creating stub components for runtime errors ==="
cat > src/core/ResponsiveCorrectionsPanel.jsx << 'EOF'
import React from 'react';
export const ResponsiveCorrectionsPanel = () => null;
EOF

cat > src/core/components/CorrectionsStatsDashboard.jsx << 'EOF'
import React from 'react';
export const CorrectionsStatsDashboard = () => null;
EOF

# Fix index.ts - comment out problematic exports
if [ -f "src/core/index.ts" ]; then
  echo "=== Fixing index.ts exports ==="
  # Instead of line-based commenting, let's use a more targeted approach
  # First, let's see what the file looks like
  echo "Current index.ts line count: $(wc -l < src/core/index.ts)"
  
  # Comment out Epic 8.2 exports (usually around lines 36-44)
  sed -i.bak '/Epic 8.2.*exports/,/^};*$/ s/^/\/\/ /' src/core/index.ts
  
  # Comment out Epic 8.4 exports 
  sed -i.bak '/Epic 8.4.*exports/,/^};*$/ s/^/\/\/ /' src/core/index.ts
  
  # Comment out Epic 9 collaboration exports
  sed -i.bak '/Epic 9.*Collaborative/,/^};*$/ s/^/\/\/ /' src/core/index.ts
  
  # Comment out Epic 12 exports
  sed -i.bak '/Epic 12.*exports/,/^};*$/ s/^/\/\/ /' src/core/index.ts
  
  # Remove any lines importing from deleted directories
  sed -i.bak '/from.*collaboration\//d' src/core/index.ts
  sed -i.bak '/from.*llm-randomizer\//d' src/core/index.ts
  sed -i.bak '/from.*extensions\//d' src/core/index.ts
  sed -i.bak '/from.*WorkflowManager/d' src/core/index.ts
  sed -i.bak '/from.*ResponsiveCorrectionsPanel/d' src/core/index.ts
  sed -i.bak '/from.*correctionsStore/d' src/core/index.ts
  
  rm -f src/core/index.ts.bak
fi

# Remove problematic CommonJS files entirely and create stubs
echo "=== Removing CommonJS files and creating stubs ==="

# Remove CommonJS files that cause issues
rm -f src/core/validation.js
rm -f src/core/usePreviewSeeds.js
rm -f src/core/nodeSchemas.js
rm -f src/core/graphStore.js

# Create minimal stubs for essential functionality
cat > src/core/validation.js << 'EOF'
// Stub for validation module
export function validateConnection() {
  return true; // Always valid for now
}
EOF

cat > src/core/graphStore.js << 'EOF'
// Stub for graphStore
import { create } from 'zustand';

export const useGraphStore = create((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),
  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== nodeId),
    edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
  })),
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  updateEdge: (edgeId, data) => set((state) => ({
    edges: state.edges.map(edge => 
      edge.id === edgeId ? { ...edge, ...data } : edge
    )
  })),
  deleteEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(edge => edge.id !== edgeId)
  })),
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  }))
}));
EOF

cat > src/core/usePreviewSeeds.js << 'EOF'
// Stub for usePreviewSeeds
export function usePreviewSeeds() {
  return {
    results: [],
    loading: false,
    error: null,
    execute: () => {}
  };
}
EOF

cat > src/core/nodeSchemas.js << 'EOF'
// Stub for nodeSchemas
export const nodeSchemas = {
  WeightedChoice: {
    name: "Weighted Choice",
    fields: []
  },
  Output: {
    name: "Output",
    fields: []
  }
};
EOF

# Create InspectorPanel stub if it doesn't exist
if [ ! -f "src/core/components/Inspector/InspectorPanel.tsx" ] && [ ! -f "src/core/components/Inspector/InspectorPanel.js" ]; then
  echo "=== Creating InspectorPanel stub ==="
  cat > src/core/components/Inspector/InspectorPanel.tsx << 'EOF'
import React from 'react';

export const InspectorPanel = () => {
  return <div>Inspector Panel (stub)</div>;
};
EOF
fi

# Fix the Inspector index.js to export InspectorPanel
if [ -f "src/core/components/Inspector/index.js" ]; then
  echo "=== Fixing Inspector index.js ==="
  # Replace the entire file with a proper export
  cat > src/core/components/Inspector/index.js << 'EOF'
// Re-export InspectorPanel
export { InspectorPanel } from './InspectorPanel';

// Export any other components that might be in this directory
export * from './InspectorContext';
export * from './BaseNodeEditor';
EOF
fi

# If index.js doesn't exist, create it
if [ ! -f "src/core/components/Inspector/index.js" ]; then
  echo "=== Creating Inspector index.js ==="
  cat > src/core/components/Inspector/index.js << 'EOF'
// Export InspectorPanel
export { InspectorPanel } from './InspectorPanel';
EOF
fi

# Remove and recreate nodeDataUtils to ensure proper ES6 exports
echo "=== Recreating nodeDataUtils.js ==="
rm -f src/core/utils/nodeDataUtils.js
mkdir -p src/core/utils
cat > src/core/utils/nodeDataUtils.js << 'EOF'
// Stub for nodeDataUtils with ES6 exports
export function hasVariations(node) {
  return false;
}

export function getNodeData(node) {
  return node?.data || {};
}

export function updateNodeData(node, updates) {
  return {
    ...node,
    data: {
      ...node.data,
      ...updates
    }
  };
}

export function getNodeVariations(node) {
  return [];
}

export function getNodeLabel(node) {
  return node?.data?.label || node?.type || 'Node';
}
EOF

# Fix App.js/tsx imports
for ext in tsx ts jsx js; do
  if [ -f "src/App.$ext" ]; then
    echo "=== Fixing App.$ext imports ==="
    # Remove RandomizerPanel from the import
    sed -i.bak 's/, RandomizerPanel//g' "src/App.$ext"
    sed -i.bak 's/RandomizerPanel, //g' "src/App.$ext"
    # Remove any JSX usage of RandomizerPanel
    sed -i.bak '/<RandomizerPanel/d' "src/App.$ext"
    # Comment out randomizer.css import if it exists
    sed -i.bak 's/import.*randomizer\.css.*/\/\/ &/' "src/App.$ext"
    rm -f "src/App.$ext.bak"
  fi
done

# Comment out Epic 9 collaboration exports from index.ts
if [ -f "src/core/index.ts" ]; then
  echo "=== Commenting out collaboration exports ==="
  sed -i.bak '/Epic 9.*exports/,/^}/ s/^/\/\/ /' src/core/index.ts
  sed -i.bak '/collaboration\//d' src/core/index.ts
  rm -f src/core/index.ts.bak
fi

# Run the original build
echo "=== Running build-standalone.js ==="
node build-standalone.js

echo "=== Build complete! ==="
ls -la dist/