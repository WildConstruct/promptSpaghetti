#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Fix all remaining style object syntax issues
 */

function fixStyleObjects(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix button style objects followed by closing angle bracket
  content = content.replace(/style=\{\{([^}]+)\}\s*>\s*\{/gm, (match, styleContent) => {
    changed = true;
    return `style={{${styleContent}}}>\n            {`;
  });
  
  // Fix style objects that have incorrect line breaks
  content = content.replace(/style=\{\{([^}]+)\n\s*\}\s*(?!})/gm, (match, styleContent) => {
    changed = true;
    return `style={{${styleContent}}}`;
  });
  
  // Fix style objects with missing closing braces
  const lines = content.split('\n');
  let inStyleObject = false;
  let styleStartIndex = -1;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('style={{') && !line.includes('}}')) {
      inStyleObject = true;
      styleStartIndex = i;
      braceCount = 2; // Start with {{ 
      
      // Count any additional braces on the same line
      for (let j = line.indexOf('style={{') + 8; j < line.length; j++) {
        if (line[j] === '{') braceCount++;
        if (line[j] === '}') braceCount--;
      }
      continue;
    }
    
    if (inStyleObject) {
      // Count braces in current line
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') braceCount++;
        if (line[j] === '}') braceCount--;
      }
      
      // Check if we should close the style object
      if (braceCount === 1 && (line.trim() === '' || line.includes('>') || i === lines.length - 1)) {
        // We need to close the style object
        if (line.includes('>')) {
          lines[i] = line.replace('>', '}}>');
        } else {
          lines[i] = line + '}}';
        }
        inStyleObject = false;
        changed = true;
      } else if (braceCount === 0) {
        inStyleObject = false;
      }
    }
  }
  
  if (changed) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed style objects in ${path.basename(filePath)}`);
  }
  
  return changed;
}

// Fix specific files
const files = [
  'client/src/App.tsx',
  'client/src/components/EnhancedGraphEditor.tsx',
  'client/src/components/EpicDashboard.tsx',
  'client/src/components/GraphNode.tsx'
];

let totalFixed = 0;
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    if (fixStyleObjects(filePath)) {
      totalFixed++;
    }
  }
});

console.log(`\n📊 Fixed style objects in ${totalFixed} files`);