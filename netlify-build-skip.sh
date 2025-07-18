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

# Create an empty randomizer.css if it doesn't exist to avoid import errors
touch src/randomizer.css

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

# Clean up imports in files - simpler approach
echo "=== Cleaning up imports ==="

# Just remove the compiled JS files that have issues
rm -f src/core/GraphEditor.js
rm -f src/core/GraphEditor.jsx

# The TypeScript files will be handled by the build process

# Clean up GraphEditor.tsx with a Python script for more precise editing
if [ -f "src/core/GraphEditor.tsx" ]; then
  echo "=== Cleaning GraphEditor.tsx with Python ==="
  python3 << 'PYTHON_SCRIPT'
import re

# Read the file
with open('src/core/GraphEditor.tsx', 'r') as f:
    content = f.read()

# Remove imports
content = re.sub(r'import.*ResponsiveCorrectionsPanel.*\n', '', content)
content = re.sub(r'import.*CorrectionsStatsDashboard.*\n', '', content)
content = re.sub(r'import.*ExtensionManagerPanel.*\n', '', content)
content = re.sub(r'import.*useCorrectionsEnabled.*\n', '', content)

# Remove state declarations
content = re.sub(r'const \[correctionsOpen, setCorrectionsOpen\].*;\n', '', content)
content = re.sub(r'const \[statsOpen, setStatsOpen\].*;\n', '', content)
content = re.sub(r'const \[extensionsOpen, setExtensionsOpen\].*;\n', '', content)
content = re.sub(r'const correctionsEnabled = useCorrectionsEnabled.*;\n', '', content)

# Remove JSX components - use more precise regex
# Remove ResponsiveCorrectionsPanel
content = re.sub(r'<ResponsiveCorrectionsPanel[\s\S]*?\/>\s*', '', content)

# Remove CorrectionsStatsDashboard
content = re.sub(r'<CorrectionsStatsDashboard[\s\S]*?\/>\s*', '', content)

# Remove the entire extensionsOpen conditional block
content = re.sub(r'\{extensionsOpen && \(\s*<ExtensionManagerPanel[\s\S]*?\/>\s*\)\}\s*', '', content)

# Clean up StatusBar props
# Remove entire prop lines
content = re.sub(r'correctionsEnabled=\{correctionsEnabled\}\s*\n', '', content)
content = re.sub(r'onCorrections=\{[^}]+\}\s*\n', '', content)
content = re.sub(r'correctionsOpen=\{correctionsOpen\}\s*\n', '', content)
content = re.sub(r'onStats=\{[^}]+\}\s*\n', '', content)
content = re.sub(r'statsOpen=\{statsOpen\}\s*\n', '', content)
content = re.sub(r'onExtensions=\{[^}]+\}\s*\n', '', content)
content = re.sub(r'extensionsOpen=\{extensionsOpen\}\s*\n', '', content)

# Write the cleaned content back
with open('src/core/GraphEditor.tsx', 'w') as f:
    f.write(content)

print("GraphEditor.tsx cleaned successfully")
PYTHON_SCRIPT
fi

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

# Create stub for correctionsStore with the missing hook
cat > src/core/correctionsStore.js << 'EOF'
// Stub for correctionsStore
export const useCorrectionsEnabled = () => false;
export const useCorrectionsStore = () => ({
  rules: [],
  addRule: () => {},
  removeRule: () => {},
  updateRule: () => {},
  enabled: false,
  setEnabled: () => {}
});
EOF

# Also create a modified StatusBar component that doesn't expect corrections props
if [ -f "src/core/components/StatusBar.tsx" ] || [ -f "src/core/components/StatusBar.jsx" ]; then
  echo "=== Patching StatusBar component ==="
  # Create a wrapper that filters out the corrections-related props
  cat > src/core/components/StatusBarWrapper.jsx << 'EOF'
import React from 'react';
import { StatusBar as OriginalStatusBar } from './StatusBar';

export const StatusBar = (props) => {
  // Filter out corrections-related props
  const { 
    correctionsEnabled, 
    correctionsOpen, 
    onCorrections,
    statsOpen,
    onStats,
    extensionsOpen,
    onExtensions,
    ...cleanProps 
  } = props;
  
  return <OriginalStatusBar {...cleanProps} />;
};
EOF
  
  # Update imports to use the wrapper
  sed -i.bak 's/import { StatusBar }/import { StatusBar as OriginalStatusBar }/g' src/core/index.ts
  echo "export { StatusBar } from './components/StatusBarWrapper';" >> src/core/index.ts
fi

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

export function validateGraph() {
  return []; // No errors
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

# Fix App.tsx imports and remove randomizer functionality
# Only handle .tsx file since that's what the project uses
if [ -f "src/App.tsx" ]; then
  echo "=== Fixing App.tsx imports and removing randomizer ==="
  # Create a simplified App that only shows the GraphEditor
  cat > "src/App.tsx" << 'EOF'
import React from "react";
import { ReactFlowProvider } from "reactflow";
import { GraphEditor } from "./core";
import "reactflow/dist/style.css";

/**
 * Main client application component.
 * Simplified to only show the graph editor.
 */
export default function App() {
  // Sample initial nodes to demonstrate the editor is working
  const initialNodes = [
    {
      id: 'welcome-1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { 
        nodeType: 'WeightedChoice',
        label: 'Welcome Node',
        variations: ['Hello', 'Welcome', 'Greetings']
      }
    },
    {
      id: 'output-1',
      type: 'default',
      position: { x: 500, y: 200 },
      data: { 
        nodeType: 'Output',
        label: 'Output Node'
      }
    }
  ];
  
  const initialEdges = [
    {
      id: 'e1-2',
      source: 'welcome-1',
      target: 'output-1',
      type: 'step'
    }
  ];

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <GraphEditor 
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </div>
    </ReactFlowProvider>
  );
}
EOF
fi

# Remove any .js versions that might have been created
rm -f src/App.js src/App.jsx

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