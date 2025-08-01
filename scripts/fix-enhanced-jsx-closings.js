#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix JSX closing syntax errors in EnhancedGraphEditor.tsx
 */

const filePath = path.join(__dirname, '..', 'client/src/components/EnhancedGraphEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix pattern: }</div}}>  to </div>
content = content.replace(/\}\s*<\/div\s*\}\s*\}\s*>/g, '}</div>');

// Fix pattern where style objects are not properly closed before JSX content
content = content.replace(/lineHeight:\s*([0-9.]+)\s*>\s*\{/g, 'lineHeight: $1\n      }}\n    >\n      {');

// Fix any remaining style objects that are missing closing braces
const lines = content.split('\n');
let inStyleProp = false;
let braceCount = 0;
let styleStartLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of style prop
  if (line.includes('style={{') && !line.includes('}}')) {
    inStyleProp = true;
    styleStartLine = i;
    braceCount = 2; // Starting with {{
    
    // Count braces on the same line after style={{
    const afterStyle = line.substring(line.indexOf('style={{') + 8);
    for (const char of afterStyle) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
  } else if (inStyleProp) {
    // Count braces in current line
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // Check if we need to close the style prop
    if (braceCount > 0 && (line.trim() === '>' || line.includes('>') && !line.includes('}}'))) {
      // We need to add closing braces
      if (line.trim() === '>') {
        lines[i] = '      }}\n    >';
      } else if (line.includes('>')) {
        lines[i] = line.replace(/(\s*)>/, '$1}}\n    >');
      }
      inStyleProp = false;
      braceCount = 0;
    } else if (braceCount === 0) {
      inStyleProp = false;
    }
  }
}

content = lines.join('\n');

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ Fixed JSX closing syntax in EnhancedGraphEditor.tsx');