#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node fix-jsx-closing-braces.js <file-path>');
  process.exit(1);
}

console.log(`🔧 Fixing JSX closing braces in ${path.basename(filePath)}...`);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
let fixCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
  const nextTrimmed = nextLine.trim();
  
  // Pattern 1: }>{something}</span> or similar
  if (trimmed.match(/^}>[^<]*<\/\w+>$/)) {
    // This is likely a closing style prop followed by content and closing tag
    const match = trimmed.match(/^(}>)(.*)$/);
    if (match) {
      const indent = line.match(/^\s*/)[0];
      lines[i] = indent + '}}' + match[2];
      fixCount++;
      console.log(`  Fixed line ${i + 1}: ${trimmed} → }}${match[2]}`);
    }
  }
  
  // Pattern 2: }> at end of line followed by content
  else if (trimmed === '}>' && nextTrimmed && !nextTrimmed.startsWith('<') && !nextTrimmed.startsWith('{') && !nextTrimmed.startsWith('}')) {
    const indent = line.match(/^\s*/)[0];
    lines[i] = indent + '}}>'; 
    fixCount++;
    console.log(`  Fixed line ${i + 1}: }> → }}>`);
  }
  
  // Pattern 3: style prop ending with }>( instead of }}>
  else if (line.includes('}>({ ')) {
    lines[i] = line.replace('}>({ ', '}}>({ ');
    fixCount++;
    console.log(`  Fixed line ${i + 1}: }>({ → }}>({ `);
  }
}

// Write the fixed content
content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Fixed ${fixCount} JSX closing brace issues!`);
console.log('📝 Please run build to verify fixes.');