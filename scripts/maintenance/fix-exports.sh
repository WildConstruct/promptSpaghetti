#!/bin/bash

echo "=== Removing ES6 exports that cause circular dependencies ==="

cd packages/core

# Remove the ES6 exports we added
echo "Fixing validation.js..."
sed -i.bak '/^\/\/ ES6 export for build compatibility/,/^export { validateConnection };/d' validation.js

echo "Fixing usePreviewSeeds.js..."
sed -i.bak '/^\/\/ ES6 export for build compatibility/,/^export { usePreviewSeeds };/d' usePreviewSeeds.js

echo "Fixing nodeSchemas.js..."
sed -i.bak '/^\/\/ ES6 export for build compatibility/,/^export { nodeSchemas };/d' nodeSchemas.js

echo "Fixing ExtensionManagerStore.js..."
sed -i.bak '/^\/\/ ES6 export for build compatibility/,/^export const useExtensionManagerStore/d' components/ExtensionManager/ExtensionManagerStore.js

echo "Fixing ExtensionManifest.js..."
sed -i.bak '/^\/\/ Add missing export for parseExtensionManifest/,/^export const ExtensionManifest/d' extensions/ExtensionManifest.js

# Clean up backup files
rm -f *.bak components/ExtensionManager/*.bak extensions/*.bak

echo "=== Done removing problematic exports ==="