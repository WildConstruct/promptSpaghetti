#!/usr/bin/env node
/**
 * Fix all syntax errors in TypeScript/TSX files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to fix template strings without commas in style objects
const patterns = [
  // Fix template string followed by closing brace without comma
  {
    pattern: /`([^`]+)`\}\s*\}/g,
    replacement: '`$1`\n        }'
  },
  // Fix arrow function syntax - return ()
  {
    pattern: /return\s*\(\)\s*</g,
    replacement: 'return (\n    <'
  },
  // Fix style object closing without proper syntax
  {
    pattern: /(\w+):\s*`([^`]+)`\}\s*\n\s*\}/g,
    replacement: '$1: `$2`\n      }'
  },
  // Fix multiline template strings in objects
  {
    pattern: /([\w-]+):\s*`([^`]+)`\}(\s*)(\n\s*\})/g,
    replacement: '$1: `$2`$3$4'
  },
  // Fix compact JSX return syntax
  {
    pattern: /=>\s*\(\)\s*</g,
    replacement: '=> (\n    <'
  },
  // Fix missing semicolons after template literals in style objects
  {
    pattern: /(backgroundColor|color|border|borderLeft|scrollbarColor):\s*`([^`]+)`\}(\s*\n\s*)(\w+):/g,
    replacement: '$1: `$2`,\n        $4:'
  }
];

const filesToFix = [
  'client/src/components/**/*.tsx',
  'client/src/components/**/*.ts',
  'packages/core/components/**/*.tsx',
  'packages/core/components/**/*.ts'
];

let fixedCount = 0;

console.log('🔧 Fixing all syntax errors...\n');

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
      
      // Additional specific fixes
      // Fix style objects with template strings missing commas
      content = content.replace(
        /([\w-]+):\s*`([^`\n]+)`\}\n(\s*)}}/g,
        '$1: `$2`\n$3}}'
      );
      
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
