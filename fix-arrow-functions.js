#!/usr/bin/env node
/**
 * Fix all arrow function syntax errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const patterns = [
  // Fix ) => ()
  {
    pattern: /\) => \(\)/g,
    replacement: ') => ('
  },
  // Fix => ()
  {
    pattern: / => \(\)\s*\n/g,
    replacement: ' => (\n'
  },
  // Fix map(x => ()
  {
    pattern: /\.map\(([^)]+)\s*=>\s*\(\)/g,
    replacement: '.map($1 => ('
  },
  // Fix {x && ()
  {
    pattern: /(\{[^}]+&&)\s*\(\)/g,
    replacement: '$1 ('
  },
  // Fix specific patterns
  {
    pattern: /const (\w+) = \(([^)]+)\) => \(\)/g,
    replacement: 'const $1 = ($2) => ('
  },
  // Fix specific template string issues
  {
    pattern: /`([^`]+)`\}\s*([,;])/g,
    replacement: '`$1`$2'
  }
];

const filesToFix = [
  'client/src/components/**/*.tsx',
  'client/src/components/**/*.ts',
  'packages/core/components/**/*.tsx',
  'packages/core/components/**/*.ts'
];

let fixedCount = 0;

console.log('🔧 Fixing arrow function syntax errors...\n');

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