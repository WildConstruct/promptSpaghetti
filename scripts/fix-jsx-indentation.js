#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node fix-jsx-indentation.js <file-path>');
  process.exit(1);
}

console.log(`🔧 Fixing JSX indentation in ${path.basename(filePath)}...`);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
let fixCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Fix lines that start with }}> at wrong indentation
  if (trimmed === '}}>') {
    // Look backwards to find the matching style={{ line
    let indentLevel = null;
    for (let j = i - 1; j >= 0 && j > i - 20; j--) {
      const prevLine = lines[j];
      if (prevLine.includes('style={{') || prevLine.includes('<span style={{') || prevLine.includes('<div style={{')) {
        // Get the indentation of the element, not the style prop
        indentLevel = prevLine.match(/^(\s*)/)[1];
        break;
      }
    }
    
    if (indentLevel !== null) {
      // The closing }}> should be indented at the same level as the last property + 2 spaces
      const currentIndent = line.match(/^(\s*)/)[1];
      const expectedIndent = indentLevel + '                    '; // Match property indentation
      if (currentIndent !== expectedIndent) {
        lines[i] = expectedIndent + '}}>';
        fixCount++;
        console.log(`  Fixed line ${i + 1}: indentation adjusted`);
      }
    }
  }
}

// Write the fixed content
content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Fixed ${fixCount} JSX indentation issues!`);
console.log('📝 Please run build to verify fixes.');