#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Advanced RoleCloneManager.tsx Fixer');
console.log('=====================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
console.log('📖 Reading file...');

// Fix 1: Fix the broken interface declarations
console.log('🔧 Fixing interface declarations...');

// Fix permissions array type
content = content.replace(/permissions: string;/g, 'permissions: string[];');

// Fix metadata optional property
content = content.replace(/metadata \? \{/g, 'metadata?: {');

// Fix nested interface declarations that are incorrectly placed
content = content.replace(/\}\s*;\s*\n\s*interface Permission \{/g, '}\n\ninterface Permission {');
content = content.replace(/\}\s*;\s*\n\s*interface CloneOperation \{/g, '}\n\ninterface CloneOperation {');
content = content.replace(/\}\s*;\s*\n\s*interface RoleCloneManagerProps \{/g, '}\n\ninterface RoleCloneManagerProps {');

// Fix 2: Fix the state interface declaration
console.log('🔧 Fixing state interface...');

// Find and fix the RoleCloneState interface
const stateInterfaceRegex = /interface RoleCloneState \{[\s\S]*?\n\s*cloneOperations: CloneOperation;\s*\}/;
const stateInterfaceMatch = content.match(stateInterfaceRegex);

if (stateInterfaceMatch) {
  let fixedStateInterface = `interface RoleCloneState {
  availableRoles: Role[];
  availablePermissions: Permission[];
  selectedSourceRole?: Role;
  cloneOperations: CloneOperation[];`;
  
  content = content.replace(stateInterfaceRegex, fixedStateInterface);
}

// Fix 3: Fix the mock data arrays
console.log('🔧 Fixing mock data arrays...');

// Fix Role array closing
content = content.replace(/metadata: \{ cloneCount: 0 \}\s*\];/g, 'metadata: { cloneCount: 0 }\n  }\n];');

// Fix missing closing braces in mock data
const mockRolesRegex = /const mockRoles: Role\[\] = \[[\s\S]*?\];/;
const mockRolesMatch = content.match(mockRolesRegex);

if (mockRolesMatch) {
  let mockRoles = mockRolesMatch[0];
  
  // Count opening and closing braces
  const openBraces = (mockRoles.match(/\{/g) || []).length;
  const closeBraces = (mockRoles.match(/\}/g) || []).length;
  
  if (openBraces > closeBraces) {
    // Add missing closing braces before the array closing
    mockRoles = mockRoles.replace(/\n\s*\];/, '\n  }\n];');
  }
  
  content = content.replace(mockRolesRegex, mockRoles);
}

// Fix 4: Fix mock permissions array
const mockPermissionsRegex = /const mockPermissions: Permission\[\] = \[[\s\S]*?\];/;
const mockPermissionsMatch = content.match(mockPermissionsRegex);

if (mockPermissionsMatch) {
  let mockPermissions = mockPermissionsMatch[0];
  
  // Add missing closing braces for each permission object
  mockPermissions = mockPermissions.replace(/category: 'Projects'\s*\n\s*\{/g, 'category: \'Projects\'\n  },\n  {');
  mockPermissions = mockPermissions.replace(/category: 'Administration'\s*\n\s*\{/g, 'category: \'Administration\'\n  },\n  {');
  mockPermissions = mockPermissions.replace(/category: 'Analytics'\s*\n\s*\{/g, 'category: \'Analytics\'\n  },\n  {');
  mockPermissions = mockPermissions.replace(/category: 'Data Management'\];/g, 'category: \'Data Management\'\n  }\n];');
  
  content = content.replace(mockPermissionsRegex, mockPermissions);
}

// Fix 5: Fix function syntax errors
console.log('🔧 Fixing function syntax...');

// Fix setState callback syntax
content = content.replace(/role\.name\.toLowerCase\(\) === state\.targetName\.toLowerCase\(\)\s*\);/g, 
  'role.name.toLowerCase() === state.targetName.toLowerCase()');

// Fix async function syntax
content = content.replace(/catch \(error\) \{[\s\S]*?error instanceof Error\?: error\.message : /g, 
  'catch (error) {\n      setState(prev => ({\n        ...prev,\n        isLoading: false,\n        error: error instanceof Error ? error.message : ');

// Fix 6: Fix JSX syntax
console.log('🔧 Fixing JSX syntax...');

// Fix onClick handlers
content = content.replace(/onClick=\{() => \{\}\} => /g, 'onClick={() => ');

// Fix ternary operator in JSX
content = content.replace(/\) : \(\),/g, ') : (');

// Fix style object syntax
content = content.replace(/style=\{\{\}\},/g, 'style={{');
content = content.replace(/borderRadius: '4px';\s*\n/g, 'borderRadius: \'4px\'\n');

// Fix 7: Fix array/object syntax issues
console.log('🔧 Fixing array/object syntax...');

// Fix array type declarations
content = content.replace(/: Role\[\] =\{\{/g, ': Role = {');
content = content.replace(/: Permission\[\]/g, ': Permission[]');

// Fix 8: Clean up extra braces and semicolons
console.log('🔧 Cleaning up syntax...');

// Remove extra closing braces at end of file
const lines = content.split('\n');
let braceCount = 0;
for (const line of lines) {
  braceCount += (line.match(/\{/g) || []).length;
  braceCount -= (line.match(/\}/g) || []).length;
}

if (braceCount < 0) {
  // Remove extra closing braces from the end
  for (let i = 0; i < Math.abs(braceCount); i++) {
    content = content.replace(/\n\s*\}\s*$/, '');
  }
}

// Write the fixed content
fs.writeFileSync(filePath, content);

// Check error count
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorOutput = error.stdout || '';
  const errorCount = (errorOutput.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show first 5 errors
  const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
  console.log('\nFirst 5 remaining errors:');
  errorLines.slice(0, 5).forEach(line => {
    console.log(`  ${line.trim()}`);
  });
}