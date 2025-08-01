#!/usr/bin/env node
/**
 * Fix JSON.stringify syntax errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to fix JSON.stringify with misplaced parenthesis
const patterns = [
  // Fix JSON.stringify([),
  {
    pattern: /JSON\.stringify\(\[\),/g,
    replacement: 'JSON.stringify(['
  },
  // Fix other arrow function issues
  {
    pattern: /: React\.FC<(\w+)> = \(\{\)/g,
    replacement: ': React.FC<$1> = ({'
  },
  // Fix arrow functions with wrong syntax
  {
    pattern: /useCallback\(;\)/g,
    replacement: 'useCallback('
  },
  // Fix return statement with arrow syntax
  {
    pattern: /return \(\)\s*</g,
    replacement: 'return (\n    <'
  }
];

const filesToFix = [
  'packages/core/components/**/*.tsx',
  'packages/core/components/**/*.ts',
  'client/src/components/**/*.tsx',
  'client/src/components/**/*.ts'
];

let fixedCount = 0;

console.log('🔧 Fixing JSON.stringify and syntax errors...\n');

filesToFix.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: __dirname,
    absolute: true,
    ignore: ['**/node_modules/**']
  });
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      let fileFixed = false;
      
      patterns.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          fileFixed = true;
        }
      });
      
      if (fileFixed && content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
      }
    } catch (error) {
      // Ignore errors
    }
  });
});

console.log(`\n✨ Fixed ${fixedCount} files`);
