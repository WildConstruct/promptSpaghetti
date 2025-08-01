#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Systematic Fix');
console.log('======================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

console.log('📋 Applying systematic fixes for all syntax errors...\n');

// Fix 1: Fix interface declarations
console.log('1️⃣ Fixing interface declarations...');
// Fix closing braces in interfaces
content = content.replace(/(\s+)}\s*;\s*}\s*interface/g, '$1}\n}\n\ninterface');
// Fix array type declarations
content = content.replace(/permissions: string,/g, 'permissions: string[],');
content = content.replace(/permissions: string;/g, 'permissions: string[];');
content = content.replace(/includePermissions: string,/g, 'includePermissions: string[],');
content = content.replace(/excludePermissions: string;/g, 'excludePermissions: string[];');
// Fix other array types
content = content.replace(/availableRoles: Role;/g, 'availableRoles: Role[];');
content = content.replace(/availablePermissions: Permission;/g, 'availablePermissions: Permission[];');
content = content.replace(/cloneOperations: CloneOperation;/g, 'cloneOperations: CloneOperation[];');
content = content.replace(/validationErrors: string;/g, 'validationErrors: string[];');

// Fix 2: Fix property declarations with wrong syntax
console.log('2️⃣ Fixing property syntax...');
// Remove trailing commas after types
content = content.replace(/: string;,/g, ': string;');
content = content.replace(/: Date;,/g, ': Date;');
content = content.replace(/: boolean;,/g, ': boolean;');
// Fix stray semicolons in interfaces
content = content.replace(/,\s*;/g, ';');

// Fix 3: Fix mock data arrays
console.log('3️⃣ Fixing mock data arrays...');
content = content.replace(/const mockRoles: Role = \[/g, 'const mockRoles: Role[] = [');
content = content.replace(/const mockPermissions: Permission = \[/g, 'const mockPermissions: Permission[] = [');

// Fix 4: Fix array/object syntax errors
console.log('4️⃣ Fixing array and object syntax...');
// Fix permissions array syntax
content = content.replace(/permissions: \[,/g, 'permissions: [');
// Fix errors array syntax
content = content.replace(/const errors: string = \[\];/g, 'const errors: string[] = [];');

// Fix 5: Fix broken arrow functions
console.log('5️⃣ Fixing arrow functions...');
// Fix the common pattern: role => ;);
content = content.replace(/role => ;[)\s]*;/g, 'role =>');
content = content.replace(/op => \),/g, 'op =>');

// Fix 6: Fix setState calls with broken syntax
console.log('6️⃣ Fixing setState calls...');
// Fix excludedPermissions: new Set();
content = content.replace(/excludedPermissions: new Set\(\);/g, 'excludedPermissions: new Set()');
// Fix selectedPermissions: new Set();
content = content.replace(/selectedPermissions: new Set\(\);/g, 'selectedPermissions: new Set()');

// Fix 7: Fix conditional rendering
console.log('7️⃣ Fixing conditional rendering...');
// Fix: {onClose && ()
content = content.replace(/\{([^}]+) && \(\)/g, '{$1 && (');
// Fix: ) : ()
content = content.replace(/\) : \(\)/g, ') : (');

// Fix 8: Fix object declarations
console.log('8️⃣ Fixing object declarations...');
// Fix: const operation: CloneOperation = {,
content = content.replace(/const operation: CloneOperation = \{,/g, 'const operation: CloneOperation = {');
// Fix: const clonedRole: Role = {,
content = content.replace(/const clonedRole: Role = \{,/g, 'const clonedRole: Role = {');

// Fix 9: Fix closing braces and structure
console.log('9️⃣ Fixing closing braces...');
// Remove stray closing braces at the beginning
content = content.replace(/^}\s*interface/m, 'interface');
// Fix double closing braces
content = content.replace(/}\s*}\s*$/gm, '}');
// Fix operationId closing
content = content.replace(/const operationId = `clone-\${Date\.now\(\)}`;\}/g, 'const operationId = `clone-${Date.now()}`;');

// Fix 10: Fix style object syntax
console.log('🔟 Fixing style objects...');
// Fix style objects with wrong closing
content = content.replace(/border: `([^`]+)`}\s*},/g, 'border: `$1`');
content = content.replace(/borderRadius: '4px';\s*}}/g, 'borderRadius: \'4px\'');
// Fix backgroundColor ternary
content = content.replace(/backgroundColor: operation\.status === 'success' \? '#d4edda' : ,/g, 
  'backgroundColor: operation.status === \'success\' ? \'#d4edda\' :');
content = content.replace(/backgroundColor: operation\.status === 'success' \? '#28a745' :,/g,
  'backgroundColor: operation.status === \'success\' ? \'#28a745\' :');

// Fix 11: Fix function calls and returns
console.log('1️⃣1️⃣ Fixing function calls and returns...');
// Fix return statements
content = content.replace(/return;/g, 'return (');
// Fix the specific pattern in filter
content = content.replace(/const matchesSearch = !state\.searchTerm \|\| ;/g, 
  'const matchesSearch = !state.searchTerm ||');
// Fix Array.from syntax
content = content.replace(/selectedPermissions = new Set\(\)\s*Array\.from/g, 
  'selectedPermissions = new Set(\n        Array.from');
// Fix closing of Array operations
content = content.replace(/mockPermissions\.find\(p => p\.id === id\)\?\.action === 'read'\s*\);/g,
  'mockPermissions.find(p => p.id === id)?.action === \'read\'\n        )\n      );');

// Fix 12: Fix specific structural issues
console.log('1️⃣2️⃣ Fixing specific structural issues...');
// Fix the metadata placement
content = content.replace(/updatedAt: new Date\('2024-01-15'\)\s*}\s*metadata: \{ cloneCount: 3 \}/g,
  'updatedAt: new Date(\'2024-01-15\'),\n    metadata: { cloneCount: 3 }');

// Fix the loadData catch block
content = content.replace(/setState\(prev => \(\{\s*([^}]+)\s*\}\)\);\s*};/g, 
  'setState(prev => ({\n      $1\n    }));\n    }\n  };');

// Fix the missing braces in objects
content = content.replace(/id: `role_\${Date\.now\(\)}`}\s*},/g, 'id: `role_${Date.now()}`,');

// Fix className placement
content = content.replace(/}\s*className\?: string;/g, '  className?: string;');

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
  
  // Show error breakdown
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
    
  // Show first few specific errors
  const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
  console.log('\nFirst 5 errors:');
  errorLines.slice(0, 5).forEach(line => {
    const match = line.match(/\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (match) {
      console.log(`  Line ${match[1]}: ${match[3]} - ${match[4]}`);
    }
  });
}