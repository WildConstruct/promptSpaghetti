#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix all style={{ ... }> patterns to style={{ ... }}>
function fixStyleBraces(content) {
  // Fix style objects that end with }> instead of }}>
  return content.replace(/style=\{\{([^}]|\}[^}])*\}\s*>/g, (match) => {
    // Count the opening and closing braces
    let openCount = (match.match(/\{/g) || []).length;
    let closeCount = (match.match(/\}/g) || []).length;
    
    // If we're missing a closing brace, add it
    if (openCount > closeCount) {
      return match.replace(/\}\s*>$/, '}}>');
    }
    return match;
  });
}

// Files to process
const files = [
  'packages/core/PreviewModal.tsx',
  'packages/core/GraphEditor.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    continue;
  }
  
  console.log(`🔧 Processing ${file}...`);
  
  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply fixes
  content = fixStyleBraces(content);
  
  // Check if changes were made
  if (content !== originalContent) {
    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    
    // Count fixes
    const fixes = (originalContent.match(/style=\{\{[^}]*\}\s*>/g) || []).length;
    console.log(`   Fixed ${fixes} style prop issues`);
  } else {
    console.log(`   No changes needed`);
  }
}

console.log('\n✨ Style fixing complete!');