#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix style object syntax issues in client files
 */

function fixStyleObjects(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Find all style={{ patterns and fix them
  const styleRegex = /style=\{\{([^}]*)\n\}/gm;
  
  content = content.replace(styleRegex, (match, styleContent) => {
    // Check if it's properly closed with }}
    if (!match.endsWith('}}')) {
      changed = true;
      return `style={{${styleContent}\n}}`;
    }
    return match;
  });
  
  // Fix multi-line style objects that are missing closing }}
  const multiLineStyleRegex = /style=\{\{([^}]+)\}\s*(?!})/gm;
  
  content = content.replace(multiLineStyleRegex, (match, styleContent) => {
    if (!match.trim().endsWith('}}')) {
      changed = true;
      return `style={{${styleContent}}}`;
    }
    return match;
  });
  
  // Fix style objects that have only one closing brace
  content = content.replace(/style=\{\{([^}]+)\}(?!\})/gm, (match, styleContent) => {
    changed = true;
    return `style={{${styleContent}}}`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed style objects in ${path.basename(filePath)}`);
  }
  
  return changed;
}

// Fix all client files
const clientFiles = [
  'client/src/App.tsx',
  'client/src/components/EnhancedGraphEditor.tsx',
  'client/src/components/EpicDashboard.tsx',
  'client/src/components/GraphNode.tsx'
];

let totalFixed = 0;
clientFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    if (fixStyleObjects(filePath)) {
      totalFixed++;
    }
  }
});

console.log(`\n📊 Fixed style objects in ${totalFixed} files`);