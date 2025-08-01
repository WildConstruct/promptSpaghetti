#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'packages', 'core', 'PreviewModal.tsx');

console.log('🔧 Fixing PreviewModal.tsx formatting issues...');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix patterns where style props are broken across lines improperly
// Pattern 1: Fix style={{ on one line and properties on next lines
content = content.replace(/style=\{\{\s*\n\s*([^}]+)\s*\n\s*\}\}/g, (match, props) => {
  // Clean up the properties and format them properly
  const cleanedProps = props
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
  return `style={{ ${cleanedProps} }}`;
});

// Pattern 2: Fix cases where const/return statements are improperly indented after {
content = content.replace(/\{\s*\n\s*(const|return|let|var)\s+/g, '{\n                    $1 ');

// Pattern 3: Fix closing braces that are on wrong indentation
content = content.replace(/\n\s*\}\>/g, '}>');

// Pattern 4: Fix style props that span multiple lines - consolidate simple ones
const lines = content.split('\n');
const newLines = [];
let inStyleProp = false;
let styleBuffer = [];
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed.includes('style={{') && !trimmed.includes('}}')) {
    inStyleProp = true;
    styleBuffer = [line];
    braceCount = 2; // We have two opening braces
    continue;
  }
  
  if (inStyleProp) {
    styleBuffer.push(line);
    
    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // If we've closed all braces, process the style
    if (braceCount === 0) {
      inStyleProp = false;
      
      // Extract the style properties
      const fullStyle = styleBuffer.join('\n');
      const styleMatch = fullStyle.match(/style=\{\{([^}]+)\}\}/s);
      
      if (styleMatch) {
        const props = styleMatch[1]
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        // If it's a simple style (less than 3 properties), put on one line
        if (props.length <= 3 && props.every(p => !p.includes('\n'))) {
          const indent = styleBuffer[0].match(/^\s*/)[0];
          newLines.push(`${indent}style={{ ${props.join(', ')} }}>`);
        } else {
          // Otherwise, keep it multi-line but properly formatted
          newLines.push(...styleBuffer);
        }
      } else {
        newLines.push(...styleBuffer);
      }
      
      styleBuffer = [];
    }
  } else {
    newLines.push(line);
  }
}

// Join back together
content = newLines.join('\n');

// Write the fixed content
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ PreviewModal.tsx formatting fixed!');
console.log('📝 Please run: pnpm --filter client build');