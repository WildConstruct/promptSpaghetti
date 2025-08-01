#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix extra closing braces that appear on their own line
function fixExtraBraces(content) {
  const lines = content.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this line is just a closing brace
    if (trimmed === '}') {
      // Look at the next line
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        
        // If the next line starts with 'export', 'interface', 'type', 'class', 'function', 'const', 'let', 'var'
        // and the previous non-empty line also ends with '}', then this is likely an extra brace
        let prevNonEmptyIndex = i - 1;
        while (prevNonEmptyIndex >= 0 && lines[prevNonEmptyIndex].trim() === '') {
          prevNonEmptyIndex--;
        }
        
        if (prevNonEmptyIndex >= 0) {
          const prevLine = lines[prevNonEmptyIndex].trim();
          const startsWithDeclaration = /^(export|interface|type|class|function|const|let|var|\/\/|\/\*|\*)/;
          
          if (prevLine.endsWith('}') && startsWithDeclaration.test(nextLine)) {
            console.log(`  Removing extra brace at line ${i + 1}`);
            continue; // Skip this line
          }
        }
      }
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

// Process TypeScript/TSX files
const files = glob.sync('packages/core/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

console.log(`Found ${files.length} TypeScript files to check...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const fixed = fixExtraBraces(content);
  
  if (content !== fixed) {
    console.log(`\n🔧 Fixing ${path.relative(process.cwd(), file)}`);
    fs.writeFileSync(file, fixed, 'utf8');
  }
}

console.log('\n✅ Done fixing extra braces!');