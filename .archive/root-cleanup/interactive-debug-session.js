#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Interactive TypeScript Debugging Session');
console.log('==========================================\n');

// File we're debugging
const targetFile = 'client/src/components/admin/RoleCloneManager.tsx';
console.log(`Target file: ${targetFile}`);

// Read the file
const content = fs.readFileSync(targetFile, 'utf8');
const lines = content.split('\n');

// Get specific errors for this file
console.log('\n📋 Analyzing errors...');
let errors = [];
try {
  execSync(`pnpm tsc --noEmit ${targetFile} 2>&1`, { encoding: 'utf8' });
} catch (error) {
  const output = error.stdout || '';
  const errorLines = output.split('\n');

  errorLines.forEach(line => {
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
}

console.log(`Found ${errors.length} errors\n`);

// Group errors by type
const errorTypes = {};
errors.forEach(error => {
  if (!errorTypes[error.code]) {
    errorTypes[error.code] = [];
  }
  errorTypes[error.code].push(error);
});

console.log('📊 Error breakdown:');
Object.entries(errorTypes).forEach(([code, errs]) => {
  console.log(`   ${code}: ${errs.length} occurrences`);
});

// Show first 5 errors with context
console.log('\n🔍 First 5 errors with context:\n');
errors.slice(0, 5).forEach((error, index) => {
  console.log(`Error ${index + 1}: Line ${error.line}, Column ${error.column}`);
  console.log(`Type: ${error.code} - ${error.message}`);

  // Show the problematic line with context
  const startLine = Math.max(0, error.line - 3);
  const endLine = Math.min(lines.length - 1, error.line + 1);

  console.log('\nCode context:');
  for (let i = startLine; i <= endLine; i++) {
    const marker = i === error.line - 1 ? '>>> ' : '    ';
    console.log(`${marker}${i + 1}: ${lines[i]}`);
  }

  // Show the specific error position
  if (error.line - 1 < lines.length) {
    const errorLine = lines[error.line - 1];
    const pointer = ' '.repeat(error.column + 7) + '^';
    console.log(pointer);
  }

  console.log('\n' + '-'.repeat(60) + '\n');
});

// Apply automated fixes
console.log('🔧 Applying automated fixes...\n');

let fixedContent = content;
let fixCount = 0;

// Fix 1: Common syntax patterns
if (errorTypes['TS1005']) {
  // Punctuation expected
  console.log('Fixing punctuation errors...');

  // Fix missing commas in interfaces
  fixedContent = fixedContent.replace(
    /(\w+):\s*(\w+)\s*\n\s*(\w+):/g,
    '$1: $2,\n  $3:'
  );

  // Fix missing semicolons
  fixedContent = fixedContent.replace(/}\s*\n\s*const\s+/g, '};\n\nconst ');
  fixedContent = fixedContent.replace(/}\s*\n\s*export\s+/g, '};\n\nexport ');

  fixCount += errorTypes['TS1005'].length;
}

if (errorTypes['TS1128']) {
  // Declaration or statement expected
  console.log('Fixing declaration errors...');

  // Remove extra closing braces
  const braceBalance =
    (fixedContent.match(/{/g) || []).length -
    (fixedContent.match(/}/g) || []).length;
  if (braceBalance < 0) {
    // Remove trailing closing braces
    fixedContent = fixedContent.replace(/}\s*}\s*}\s*$/, '}}');
  }

  fixCount += Math.min(5, errorTypes['TS1128'].length);
}

// Write the fixed content
fs.writeFileSync(targetFile, fixedContent);

// Check new error count
let newErrors = 0;
try {
  execSync(`pnpm tsc --noEmit ${targetFile} 2>&1`, { encoding: 'utf8' });
} catch (error) {
  newErrors = (error.stdout.match(/error TS/g) || []).length;
}

console.log(`\n✅ Results:`);
console.log(`   Errors before: ${errors.length}`);
console.log(`   Errors after: ${newErrors}`);
console.log(`   Fixed: ${errors.length - newErrors}`);

// Show remaining errors if any
if (newErrors > 0) {
  console.log('\n⚠️  Some errors remain. Manual intervention needed.');
  console.log('   Run the following to see remaining errors:');
  console.log(`   pnpm tsc --noEmit ${targetFile}`);
}
