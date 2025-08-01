#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Debugging RoleCloneManager.tsx Errors');
console.log('=======================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Function to get TypeScript errors
function getTypeScriptErrors() {
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
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Get all errors
const errors = getTypeScriptErrors();
console.log(`Total errors: ${errors.length}\n`);

// Group errors by line number to see problematic areas
const errorsByLine = {};
errors.forEach(error => {
  if (!errorsByLine[error.line]) {
    errorsByLine[error.line] = [];
  }
  errorsByLine[error.line].push(error);
});

// Show the most problematic lines
console.log('Most problematic lines (with multiple errors):');
const problemLines = Object.entries(errorsByLine)
  .filter(([line, errs]) => errs.length > 1)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

problemLines.forEach(([lineNum, errs]) => {
  console.log(`\nLine ${lineNum} (${errs.length} errors):`);
  if (lines[lineNum - 1]) {
    console.log(`  Code: ${lines[lineNum - 1].trim()}`);
  }
  errs.forEach(err => {
    console.log(`  - ${err.code}: ${err.message}`);
  });
});

// Analyze specific patterns
console.log('\n\n🔍 Pattern Analysis:\n');

// Check for unclosed braces/brackets
let braceBalance = 0;
let parenBalance = 0;
let bracketBalance = 0;
let inString = false;
let stringChar = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let lineBraces = 0;
  let lineParens = 0;
  let lineBrackets = 0;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    // Count only if not in string
    if (!inString) {
      if (char === '{') { braceBalance++; lineBraces++; }
      if (char === '}') { braceBalance--; lineBraces--; }
      if (char === '(') { parenBalance++; lineParens++; }
      if (char === ')') { parenBalance--; lineParens--; }
      if (char === '[') { bracketBalance++; lineBrackets++; }
      if (char === ']') { bracketBalance--; lineBrackets--; }
    }
  }
  
  // Report imbalanced lines
  if (lineBraces !== 0 || lineParens !== 0 || lineBrackets !== 0) {
    const lineErrors = errorsByLine[i + 1] || [];
    if (lineErrors.length > 0) {
      console.log(`Line ${i + 1} has imbalance and errors:`);
      console.log(`  Braces: ${lineBraces}, Parens: ${lineParens}, Brackets: ${lineBrackets}`);
      console.log(`  Code: ${line.trim()}`);
    }
  }
}

console.log(`\nOverall Balance:`);
console.log(`  Braces: ${braceBalance}`);
console.log(`  Parentheses: ${parenBalance}`);
console.log(`  Brackets: ${bracketBalance}`);

// Find specific syntax patterns that are problematic
console.log('\n\n🔍 Specific Syntax Issues:\n');

// Pattern 1: Broken arrow functions
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/=>\s*[;,)\]]/)) {
    console.log(`Line ${i + 1}: Broken arrow function`);
    console.log(`  ${lines[i].trim()}`);
  }
}

// Pattern 2: Missing commas in objects
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/^\s*[a-zA-Z_]\w*:\s*[^,]+$/) && 
      i < lines.length - 1 && 
      lines[i + 1].match(/^\s*[a-zA-Z_]\w*:/)) {
    console.log(`Line ${i + 1}: Possibly missing comma`);
    console.log(`  ${lines[i].trim()}`);
  }
}

// Pattern 3: Conditional rendering issues
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('&& ()')) {
    console.log(`Line ${i + 1}: Broken conditional rendering`);
    console.log(`  ${lines[i].trim()}`);
  }
}

// Export specific recommendations
console.log('\n\n📝 Recommendations:\n');

const recommendations = [];

// Check for specific error codes
const errorCounts = {};
errors.forEach(err => {
  errorCounts[err.code] = (errorCounts[err.code] || 0) + 1;
});

if (errorCounts['TS1005'] > 50) {
  recommendations.push('- Many punctuation errors (TS1005) - likely missing commas, semicolons, or braces');
}

if (errorCounts['TS1128'] > 20) {
  recommendations.push('- Many "Declaration or statement expected" errors - check for incomplete statements');
}

if (errorCounts['TS1109'] > 10) {
  recommendations.push('- Many "Expression expected" errors - check for empty expressions or broken syntax');
}

recommendations.forEach(rec => console.log(rec));

// Debugger breakpoint
debugger;

console.log('\n✅ Debug analysis complete');