#!/usr/bin/env node
/**
 * Fix template string syntax in style objects
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to fix template strings without commas in style objects
const patterns = [
  // Fix template string followed by property without comma
  {
    pattern: /`([^`]+)`\}\s*\n\s*(\w+):/g,
    replacement: '`$1`,\n      $2:'
  },
  // Fix compact version
  {
    pattern: /`([^`]+)`\}(\s*)(\w+):/g,
    replacement: '`$1`,$2$3:'
  }
];

const filesToFix = [
  'client/src/components/**/*.tsx',
  'client/src/components/**/*.ts',
  'packages/core/components/**/*.tsx',
  'packages/core/components/**/*.ts'
];

let fixedCount = 0;

console.log('🔧 Fixing template string syntax errors...\n');

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