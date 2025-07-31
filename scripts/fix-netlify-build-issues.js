#!/usr/bin/env node

/**
 * Fix Netlify Build Issues Script
 * 
 * Fixes critical syntax errors in packages/core files that are blocking
 * Netlify deployment after the comprehensive TypeScript repair script
 * introduced many stray closing braces.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Netlify build issues...');

// Critical files imported by client that need fixing
const criticalFiles = [
  'packages/core/GraphEditor.tsx',
  'packages/core/PreviewModal.tsx', 
  'packages/core/Palette.tsx',
  'packages/core/InspectorSidebar.tsx',
  'packages/core/CorrectionsManagerPanel.tsx',
  'packages/core/ResponsiveCorrectionsPanel.tsx'
];

let totalFixed = 0;

for (const filePath of criticalFiles) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Remove standalone closing braces on their own lines
    content = content.replace(/^\s*}\s*$/gm, '');
    
    // Fix malformed interface blocks (common pattern from repair script)
    content = content.replace(/(\w+:\s*\w+[^;]*)\n\s*}\s*\n\s*}/g, '$1\n}');
    
    // Fix double closing braces
    content = content.replace(/}\s*}/g, '}');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    } else {
      console.log(`✓ Clean: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Fixed ${totalFixed} files for Netlify deployment`);

if (totalFixed > 0) {
  console.log('\n📝 Next steps:');
  console.log('1. Test the build locally: cd client && npm run build');
  console.log('2. Commit and push: git add . && git commit -m "fix: resolve build issues" && git push');
  console.log('3. Monitor Netlify deployment');
}