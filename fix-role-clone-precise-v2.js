#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Precise Fix v2');
console.log('======================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

console.log('📋 Applying precise fixes based on error analysis...\n');

// Fix 1: Fix the operation declaration - should be single object, not array
console.log('1️⃣ Fixing CloneOperation declaration...');
content = content.replace('const operation: CloneOperation[] ={{', 'const operation: CloneOperation = {');

// Fix 2: Fix Role declaration - should be single object, not array
console.log('2️⃣ Fixing Role declaration...');
content = content.replace('const clonedRole: Role[] = {', 'const clonedRole: Role = {');

// Fix 3: Fix the broken arrow function syntax
console.log('3️⃣ Fixing arrow function syntax...');
// Fix: role => ;);
content = content.replace(/role => ;[\s]*\);/g, 'role =>');
// Fix: op => ),
content = content.replace(/op => \),/g, 'op =>');

// Fix 4: Fix ternary operator syntax
console.log('4️⃣ Fixing ternary operators...');
// Fix: error instanceof Error?: error.message :
content = content.replace(/error instanceof Error\?:/g, 'error instanceof Error ?');

// Fix 5: Fix the closing brace issue after operationId
console.log('5️⃣ Fixing operation ID syntax...');
content = content.replace(/const operationId = `clone-\${Date\.now\(\)}`;\}/g, 'const operationId = `clone-${Date.now()}`;');

// Fix 6: Fix broken object syntax
console.log('6️⃣ Fixing object syntax...');
// Remove the extra brace and comma after id
content = content.replace(/id: `role_\${Date\.now\(\)}`[\s]*\},/g, 'id: `role_${Date.now()}`,');

// Fix 7: Fix conditional rendering syntax
console.log('7️⃣ Fixing conditional rendering...');
// Fix: {state.error && (),
content = content.replace(/\{state\.error && \(\),/g, '{state.error && (');
// Fix: {onClose && (),
content = content.replace(/\{onClose && \(\),/g, '{onClose && (');

// Fix 8: Fix the export/default issue
console.log('8️⃣ Fixing export statement...');
// Make sure export default is at the right place
const lines = content.split('\n');
// Remove the misplaced export default
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === 'export default RoleCloneManager;' && i < lines.length - 10) {
    lines.splice(i, 1);
    break;
  }
}
// Remove extra closing braces at the end
let lastContentLine = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() && lines[i].trim() !== '}') {
    lastContentLine = i;
    break;
  }
}
// Remove all lines after the last content line
if (lastContentLine > 0) {
  lines.splice(lastContentLine + 1);
}
// Add proper export
lines.push('');
lines.push('export default RoleCloneManager;');

content = lines.join('\n');

// Fix 9: Fix missing colons in object properties  
console.log('9️⃣ Fixing object property syntax...');
// Fix cases like ": role" which should be part of ternary
content = content.replace(/\n\s*: role\s*\n/g, '\n        : role\n');
content = content.replace(/\n\s*: op\),\s*\n/g, '\n        : op\n      ),\n');

// Fix 10: Fix the interface declarations with extra closing brace
console.log('🔟 Fixing interface declarations...');
// The extra }; at line 31 should just be }
content = content.replace(/}\s*;\s*}\s*\n\s*interface/g, '}\n\ninterface');

// Write the fixed content
fs.writeFileSync(filePath, content);

// Check results
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorCount = (error.stdout.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show specific error types
  const errorOutput = error.stdout || '';
  const errorTypes = {};
  const matches = errorOutput.matchAll(/error (TS\d+):/g);
  for (const match of matches) {
    errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
  }
  
  console.log('\nError breakdown:');
  Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count} occurrences`);
    });
}