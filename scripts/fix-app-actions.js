#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix action callback syntax issues in App.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix pattern for action callbacks in customCommandPaletteActions
const actionPattern = /action: \(\) => \{\s*setShowCommandPalette\(false\);\s*menuBarHandlers\.(\w+)\((.*?)\);\s*\n\s*}/g;

content = content.replace(actionPattern, (match, handler, args) => {
  const argsStr = args ? args : '';
  return `action: () => {
        setShowCommandPalette(false);
        menuBarHandlers.${handler}(${argsStr});
      }`;
});

// Fix missing closing braces in array items
content = content.replace(/}\s*,\s*{/g, '},\n    {');

// Fix closing of customCommandPaletteActions array
content = content.replace(/}\s*\n\s*];/g, '}\n    ]\n  ];');

// Ensure proper object formatting
content = content.replace(/,\s*\n\s*action: \(\) => {/g, ',\n      action: () => {');

// Fix specific pattern issues
content = content.replace(/}\s*\n\s*id: /g, '},\n    {\n      id: ');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed action callback syntax issues in App.tsx');