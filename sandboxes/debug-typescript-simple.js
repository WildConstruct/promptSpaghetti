#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TypeScript Error Debugger');
console.log('============================\n');

// Analyze a specific problematic file
const targetFile = process.argv[2] || 'client/src/components/admin/RoleCloneManager.tsx';

console.log(`📄 Analyzing ${targetFile}...\n`);

// Get errors for this file
function getFileErrors(filePath) {
  try {
    execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    const lines = output.split('\n');
    const errors = [];
    
    lines.forEach(line => {
      const match = line.match(/\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        errors.push({
          line: parseInt(match[1]),
          column: parseInt(match[2]),
          code: match[3],
          message: match[4]
        });
      }
    });
    
    return errors;
  }
}

// Read file content
const content = fs.readFileSync(targetFile, 'utf8');
const lines = content.split('\n');

// Get errors
const errors = getFileErrors(targetFile);
console.log(`Found ${errors.length} errors\n`);

// Group errors by type
const errorTypes = {};
errors.forEach(error => {
  if (!errorTypes[error.code]) {
    errorTypes[error.code] = {
      message: error.message,
      count: 0,
      examples: []
    };
  }
  errorTypes[error.code].count++;
  if (errorTypes[error.code].examples.length < 3) {
    errorTypes[error.code].examples.push({
      line: error.line,
      column: error.column
    });
  }
});

// Show error summary
console.log('Error Summary:');
Object.entries(errorTypes)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([code, data]) => {
    console.log(`\n${code} (${data.count}x): ${data.message}`);
    data.examples.forEach(ex => {
      console.log(`  Line ${ex.line}, Col ${ex.column}`);
      if (lines[ex.line - 1]) {
        console.log(`  > ${lines[ex.line - 1].trim()}`);
      }
    });
  });

// Analyze structure
console.log('\n\n📊 File Structure Analysis:');

// Count braces
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let inString = false;
let stringChar = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\\\') {
      inString = false;
      stringChar = null;
    }
    
    // Count only if not in string
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
  }
}

console.log(`Brace balance: ${braceCount} ${braceCount > 0 ? '(missing closing braces)' : braceCount < 0 ? '(extra closing braces)' : '(balanced)'}`);
console.log(`Paren balance: ${parenCount} ${parenCount > 0 ? '(missing closing parens)' : parenCount < 0 ? '(extra closing parens)' : '(balanced)'}`);
console.log(`Bracket balance: ${bracketCount} ${bracketCount > 0 ? '(missing closing brackets)' : bracketCount < 0 ? '(extra closing brackets)' : '(balanced)'}`);

// Find problematic patterns
console.log('\n\n🔍 Problematic Patterns Found:');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Check for interface issues
  if (line.includes('interface') && line.includes('{')) {
    if (i < lines.length - 1 && lines[i + 1].trim().startsWith('interface')) {
      console.log(`Line ${lineNum}: Interface not properly closed before next interface`);
    }
  }
  
  // Check for array type issues
  if (line.match(/:\\s*\\w+\\s+=/)) {
    console.log(`Line ${lineNum}: Possible missing array brackets - "${line.trim()}"`);
  }
  
  // Check for broken JSX
  if (line.includes(') : (),')) {
    console.log(`Line ${lineNum}: Broken ternary with empty parentheses - "${line.trim()}"`);
  }
  
  // Check for function syntax issues
  if (line.includes('=>') && line.includes(';') && !line.includes('(')) {
    console.log(`Line ${lineNum}: Arrow function with semicolon issue - "${line.trim()}"`);
  }
}