#!/usr/bin/env node
/**
 * Fix critical syntax errors preventing build
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'packages/core/components/epic1/examples/KeyboardShortcutExample.tsx',
    fixes: [
      // Fix line 49: closing brace issue
      {
        search: /setMessage\(`↪️ Redid: \${last}`\);\}/g,
        replace: 'setMessage(`↪️ Redid: ${last}`);'
      },
      // Fix line 94-96: button onClick syntax
      {
        search: /const action = `Action \${undoStack\.length \+ 1}`;\}/g,
        replace: 'const action = `Action ${undoStack.length + 1}`;'
      },
      {
        search: /setMessage\(`✅ Performed: \${action}`\);\}/g,
        replace: 'setMessage(`✅ Performed: ${action}`);'
      }
    ]
  },
  {
    file: 'client/src/components/NodePrototype.tsx',
    fixes: [
      // Fix lines with trailing commas in array definitions
      {
        search: /options: \[,/g,
        replace: 'options: ['
      },
      // Fix nested parentheses in components
      {
        search: /\) : \(\)/g,
        replace: ') : ('
      }
    ]
  }
];

console.log('🔧 Fixing critical syntax errors...\n');

fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped ${file} (not found)`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fileFixes.forEach(fix => {
      const newContent = content.replace(fix.search, fix.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}: ${error.message}`);
  }
});

console.log('\n✨ Done!');