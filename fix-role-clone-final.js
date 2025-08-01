#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Final Fix');
console.log('=================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Applying final fixes for remaining syntax errors...\n');

// Fix 1: Fix the broken arrow function on line 337
console.log('1️⃣ Fixing broken arrow functions...');
// Line 337: role => ;);
lines[336] = 'const updatedRoles = state.availableRoles.map(role =>';
lines[337] = '  role.id === state.selectedSourceRole?.id';
// Fix line 344: should have closing brace
lines[343] = '    cloneCount: (role.metadata?.cloneCount || 0) + 1';
lines[344] = '  }';
lines[345] = '}';
// Add the missing parts
lines.splice(346, 0, ': role');
lines.splice(347, 0, ');');

// Fix 2: Fix the second broken arrow function around line 349
console.log('2️⃣ Fixing cloneOperations map...');
// Find and fix the line
for (let i = 340; i < 360; i++) {
  if (lines[i].includes('cloneOperations: prev.cloneOperations.map(op =>),')) {
    lines[i] = '    cloneOperations: prev.cloneOperations.map(op =>';
    // Insert the proper ternary
    lines.splice(i + 1, 0, '      op.id === operationId');
    lines.splice(i + 2, 0, '        ? { ...op, status: \'success\' as const }');
    lines.splice(i + 3, 0, '        : op');
    lines.splice(i + 4, 0, '    ),');
    // Remove the broken lines
    for (let j = i + 5; j < i + 10; j++) {
      if (lines[j].includes('op.id === operationId')) {
        lines.splice(j, 4); // Remove the broken ternary
        break;
      }
    }
    break;
  }
}

// Fix 3: Remove the duplicate/misplaced error handling
console.log('3️⃣ Fixing error handling structure...');
// Find and remove the misplaced ": op" and error handling
for (let i = 360; i < 380; i++) {
  if (lines[i].trim() === ': op') {
    lines.splice(i, 1);
    break;
  }
}

// Remove duplicate error state updates
for (let i = 365; i < 375; i++) {
  if (lines[i].includes('isLoading: false,') && lines[i + 1].includes('error: error instanceof Error')) {
    if (lines[i + 2].includes('isLoading: false,')) {
      // Remove the duplicate lines
      lines.splice(i + 1, 2);
      break;
    }
  }
}

// Fix 4: Fix the catch block structure
console.log('4️⃣ Fixing catch block...');
// Find the catch statement
for (let i = 360; i < 380; i++) {
  if (lines[i].trim() === 'catch (error) {') {
    // Make sure it's properly connected to the try block
    // Add closing brace for try if missing
    let j = i - 1;
    while (j > 0 && lines[j].trim() === '') {
      j--;
    }
    if (!lines[j].trim().endsWith('}')) {
      lines.splice(i, 0, '}');
      i++; // Adjust index
    }
    break;
  }
}

// Fix 5: Remove the broken object property at line 325
console.log('5️⃣ Fixing clonedRole object...');
for (let i = 320; i < 330; i++) {
  if (lines[i].includes('id: `role_${Date.now()}`,') && lines[i + 1].trim() === '},') {
    lines[i + 1] = ''; // Remove the extra closing brace
    break;
  }
}

// Fix 6: Clean up the structure
console.log('6️⃣ Cleaning up structure...');
// Remove empty lines that break syntax
let cleanedLines = [];
let inObjectLiteral = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Track brace depth
  for (const char of line) {
    if (char === '{') braceDepth++;
    if (char === '}') braceDepth--;
  }
  
  // Don't add empty lines in the middle of object literals
  if (trimmed === '' && braceDepth > 0 && i > 0 && i < lines.length - 1) {
    const prevNonEmpty = lines.slice(0, i).reverse().find(l => l.trim()).trim();
    const nextNonEmpty = lines.slice(i + 1).find(l => l.trim()).trim();
    
    // Skip empty lines between object properties
    if ((prevNonEmpty.endsWith(',') || prevNonEmpty.endsWith('{')) && 
        !nextNonEmpty.startsWith('}')) {
      continue;
    }
  }
  
  cleanedLines.push(line);
}

// Write the fixed content
content = cleanedLines.join('\n');
fs.writeFileSync(filePath, content);

// Check results
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorCount = (error.stdout.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show first few errors with line numbers
  const errorOutput = error.stdout || '';
  const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
  console.log('\nFirst 5 errors:');
  errorLines.slice(0, 5).forEach(line => {
    const match = line.match(/\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (match) {
      console.log(`  Line ${match[1]}: ${match[3]} - ${match[4]}`);
    }
  });
}