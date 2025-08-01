#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Remove standalone closing braces that appear before export/interface/type/class declarations
function removeExtraBraces(content) {
  const lines = content.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (trimmed === '') {
      result.push(line);
      continue;
    }
    
    // Check if this is a standalone closing brace
    if (trimmed === '}') {
      // Look at the next non-empty line
      let nextNonEmptyIndex = i + 1;
      while (nextNonEmptyIndex < lines.length && lines[nextNonEmptyIndex].trim() === '') {
        nextNonEmptyIndex++;
      }
      
      if (nextNonEmptyIndex < lines.length) {
        const nextLine = lines[nextNonEmptyIndex].trim();
        // If next line starts with export/interface/type/class/const/let/var, skip this brace
        if (/^(export|interface|type|class|const|let|var|function|async)/.test(nextLine)) {
          console.log(`  Removing extra brace at line ${i + 1}`);
          continue;
        }
      }
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

// Process type files specifically
const typeFiles = [
  'packages/core/types/DataClassification.ts',
  'packages/core/types/NodeTypes.ts',
  'packages/core/types/UTDG.ts',
];

console.log('🔧 Removing extra braces from type files...\n');

for (const file of typeFiles) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    continue;
  }
  
  console.log(`📝 Processing ${file}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = removeExtraBraces(content);
  
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`   No changes needed`);
  }
}

console.log('\n✨ Done removing extra braces!');