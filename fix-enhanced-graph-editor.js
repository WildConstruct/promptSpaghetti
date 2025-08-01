#!/usr/bin/env node
/**
 * Fix EnhancedGraphEditor.tsx syntax errors
 */

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/components/EnhancedGraphEditor.tsx');

try {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix arrow function syntax issues
  content = content.replace(/const deleteNode = useCallback\(;\)/g, 'const deleteNode = useCallback(');
  
  // Fix missing parentheses in JSX
  content = content.replace(/\)\)\}/g, '))');
  
  // Look for unbalanced parentheses around line 965
  const lines = content.split('\n');
  let parenBalance = 0;
  let braceBalance = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Count parentheses
    for (const char of line) {
      if (char === '(') parenBalance++;
      if (char === ')') parenBalance--;
      if (char === '{') braceBalance++;
      if (char === '}') braceBalance--;
    }
    
    // Check for specific pattern around line 965
    if (i >= 960 && i <= 970) {
      if (line.includes('))}') && parenBalance < 0) {
        lines[i] = line.replace('))}', '))');
        console.log(`Fixed line ${i + 1}: ${lines[i]}`);
      }
    }
  }
  
  content = lines.join('\n');
  
  fs.writeFileSync(file, content);
  console.log('✅ Fixed EnhancedGraphEditor.tsx');
  
} catch (error) {
  console.error('Error:', error.message);
}
