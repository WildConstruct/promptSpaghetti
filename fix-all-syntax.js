#!/usr/bin/env node
/**
 * Script to fix all syntax errors introduced by linter
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern fixes
const fixes = [
  // Fix object literal syntax: { , -> {
  {
    pattern: /(\{)\s*,/g,
    replacement: '$1'
  },
  // Fix arrow function syntax: ) => { ... }) -> ) => { ... }
  {
    pattern: /\}\s*\)\s*\)/g,
    replacement: '})'
  },
  // Fix missing commas in object literals
  {
    pattern: /(['"])\s*\n\s*(\w+):/g,
    replacement: '$1,\n  $2:'
  },
  // Fix callback syntax: useCallback(, -> useCallback(
  {
    pattern: /useCallback\(\s*,/g,
    replacement: 'useCallback('
  },
  // Fix ternary operators: ? () -> ? (
  {
    pattern: /\?\s*\(\)/g,
    replacement: '? ('
  },
  // Fix array literal syntax: [; -> [
  {
    pattern: /\[\s*;/g,
    replacement: '['
  },
  // Fix extra closing braces in object methods
  {
    pattern: /(\w+)\s*\}\s*;/g,
    replacement: '$1;'
  },
  // Fix object property syntax (multiline)
  {
    pattern: /(\w+):\s*\{,\n\s*(\w+):/g,
    replacement: '$1: {\n    $2:'
  },
  // Fix missing commas before closing braces
  {
    pattern: /(['"])\s*\n\s*\}/g,
    replacement: '$1\n  }'
  },
  // Fix object nested syntax
  {
    pattern: /\},\n\s*(\w+):\s*\{,/g,
    replacement: '},\n  $1: {'
  }
];

// Files to fix
const filesToFix = [
  'client/src/App.tsx',
  'client/src/components/NodePrototype.tsx',
  'client/src/components/EnhancedGraphEditor.tsx',
  'client/src/components/BrowserSafeGraphEditor.tsx',
  'client/src/components/GraphNode.tsx',
  'client/src/components/NodePalette.tsx',
  'client/src/components/StatusBar.tsx',
  'packages/core/components/**/*.tsx',
  'packages/core/components/**/*.ts',
];

let fixedCount = 0;

console.log('🔧 Fixing syntax errors...\n');

// Process each file pattern
filesToFix.forEach(pattern => {
  const files = glob.sync(pattern, { 
    cwd: __dirname,
    absolute: true,
    ignore: ['**/node_modules/**', '**/__tests__/**']
  });
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      let fileFixed = false;
      
      // Apply all fixes
      fixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          fileFixed = true;
        }
      });
      
      // Additional manual fixes for common patterns
      // Fix object literals with trailing comma issues
      content = content.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix double closing parentheses
      content = content.replace(/\)\s*\)\s*\)/g, '))');
      
      // Fix alert statement issues
      content = content.replace(/alert\([^)]+\)\s*\}/g, (match) => {
        return match.replace(/\)\s*\}/, ');');
      });
      
      if (fileFixed && content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}: ${error.message}`);
    }
  });
});

console.log(`\n✨ Fixed ${fixedCount} files`);
console.log('\n💡 Next steps:');
console.log('1. Run: pnpm build');
console.log('2. Fix any remaining errors manually');
console.log('3. Test the application');