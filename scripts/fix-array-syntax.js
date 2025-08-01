#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix array object syntax in App.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the customCommandPaletteActions array
const arrayStartIndex = content.indexOf('const customCommandPaletteActions = [');
const arrayEndIndex = content.indexOf('  ];', arrayStartIndex);

if (arrayStartIndex > -1 && arrayEndIndex > -1) {
  let arrayContent = content.substring(arrayStartIndex, arrayEndIndex + 4);
  
  // Fix missing closing braces for objects
  arrayContent = arrayContent.replace(/}\s*,\s*{\s*id:/g, '},\n    {\n      id:');
  
  // Fix action function indentation
  arrayContent = arrayContent.replace(/action: \(\) => {/g, 'action: () => {');
  
  // Fix closing braces and commas
  arrayContent = arrayContent.replace(/}\s*\n\s*]/g, '}\n  ]');
  
  // Make sure each object has proper closing
  const lines = arrayContent.split('\n');
  let fixedLines = [];
  let braceCount = 0;
  let inObject = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('{')) {
      braceCount++;
      inObject = true;
    }
    
    if (trimmed.includes('}')) {
      braceCount -= (line.match(/}/g) || []).length;
    }
    
    // Check if we need to add a closing brace
    if (i < lines.length - 1) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.startsWith('{') && braceCount > 1) {
        // Need to close current object
        fixedLines.push(line);
        if (!line.trim().endsWith('},')) {
          fixedLines.push('    },');
        }
        continue;
      }
    }
    
    fixedLines.push(line);
  }
  
  // Replace the array content
  content = content.substring(0, arrayStartIndex) + fixedLines.join('\n') + content.substring(arrayEndIndex + 4);
}

// Fix the final array closing - ensure MainApp function closes properly
content = content.replace(/]\s*;\s*return \(/g, '  ];\n  return (');

// Fix missing closing brace for MainApp function
const mainAppEnd = content.indexOf('</div>\n  );');
if (mainAppEnd > -1) {
  const afterMainApp = mainAppEnd + '</div>\n  );'.length;
  if (!content.substring(afterMainApp, afterMainApp + 5).includes('}')) {
    content = content.substring(0, afterMainApp) + '\n}' + content.substring(afterMainApp);
  }
}

fs.writeFileSync(filePath, content);
console.log('✅ Fixed array object syntax in App.tsx');