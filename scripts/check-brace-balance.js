#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function checkBraceBalance(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let braceStack = [];
  let issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '{') {
        braceStack.push({ line: lineNum, col: j + 1, type: '{' });
      } else if (char === '}') {
        if (braceStack.length === 0) {
          issues.push(`Line ${lineNum}: Unexpected closing brace }`);
        } else {
          const opened = braceStack.pop();
          if (opened.type !== '{') {
            issues.push(`Line ${lineNum}: Mismatched brace (expected to close ${opened.type} from line ${opened.line})`);
          }
        }
      }
    }
  }
  
  // Check for unclosed braces
  if (braceStack.length > 0) {
    issues.push(`\nUnclosed braces:`);
    braceStack.forEach(({ line, col, type }) => {
      issues.push(`  Line ${line}, col ${col}: Unclosed ${type}`);
    });
  }
  
  return { issues, unclosedCount: braceStack.length };
}

const filePath = path.join(__dirname, '..', 'packages/core/GraphEditor.tsx');
console.log(`Checking brace balance in GraphEditor.tsx...\n`);

const result = checkBraceBalance(filePath);

if (result.issues.length === 0) {
  console.log('✅ All braces are balanced!');
} else {
  console.log(`❌ Found ${result.issues.length} issues:\n`);
  result.issues.forEach(issue => console.log(issue));
  console.log(`\nTotal unclosed braces: ${result.unclosedCount}`);
}