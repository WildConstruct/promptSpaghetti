#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 RoleCloneManager.tsx Manual Fix');
console.log('==================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('📋 Applying manual fixes for critical issues...\n');

// Manual fixes line by line
const fixes = [
  // Fix interface closing
  { line: 61, find: 'cloneOperations: CloneOperation[];}', replace: 'cloneOperations: CloneOperation[];' },
  { line: 79, find: 'validationErrors: string[]', replace: 'validationErrors: string[];' },
  
  // Fix mock data
  { line: 84, find: 'id: \'role_admin\';', replace: 'id: \'role_admin\',' },
  { line: 85, find: 'name: \'Administrator\';', replace: 'name: \'Administrator\',' },
  { line: 86, find: 'description: \'Full administrative access with all permissions\';', replace: 'description: \'Full administrative access with all permissions\',' },
  { line: 91, find: '];', replace: '],' },
  { line: 92, find: 'scope: \'organization\';', replace: 'scope: \'organization\',' },
  { line: 93, find: 'createdAt: new Date(\'2024-01-01\');', replace: 'createdAt: new Date(\'2024-01-01\'),' },
  { line: 94, find: 'updatedAt: new Date(\'2024-01-15\');', replace: 'updatedAt: new Date(\'2024-01-15\'),' },
  { line: 98, find: 'id: \'role_editor\';', replace: 'id: \'role_editor\',' },
  { line: 99, find: 'name: \'Editor\';', replace: 'name: \'Editor\',' },
  { line: 100, find: 'description: \'Content creation and editing permissions\';', replace: 'description: \'Content creation and editing permissions\',' },
  { line: 101, find: 'permissions: [\'perm_read_projects\', \'perm_edit_projects\', \'perm_share_projects\'];', replace: 'permissions: [\'perm_read_projects\', \'perm_edit_projects\', \'perm_share_projects\'],' },
  { line: 102, find: 'scope: \'organization\';', replace: 'scope: \'organization\',' },
  { line: 103, find: 'createdAt: new Date(\'2024-01-01\');', replace: 'createdAt: new Date(\'2024-01-01\'),' },
  { line: 104, find: 'updatedAt: new Date(\'2024-01-10\');', replace: 'updatedAt: new Date(\'2024-01-10\'),' },
  { line: 108, find: 'id: \'role_viewer\';', replace: 'id: \'role_viewer\',' },
  { line: 109, find: 'name: \'Viewer\';', replace: 'name: \'Viewer\',' },
  { line: 110, find: 'description: \'Read-only access to projects and basic information\';', replace: 'description: \'Read-only access to projects and basic information\',' },
  { line: 111, find: 'permissions: [\'perm_read_projects\', \'perm_view_analytics\'];', replace: 'permissions: [\'perm_read_projects\', \'perm_view_analytics\'],' },
  { line: 112, find: 'scope: \'organization\';', replace: 'scope: \'organization\',' },
  { line: 113, find: 'createdAt: new Date(\'2024-01-01\');', replace: 'createdAt: new Date(\'2024-01-01\'),' },
  { line: 114, find: 'updatedAt: new Date(\'2024-01-05\');', replace: 'updatedAt: new Date(\'2024-01-05\'),' },
  { line: 116, find: '];', replace: '  }\n];' },
  
  // Fix permission objects
  { line: 119, find: 'id: \'perm_read_projects\';', replace: 'id: \'perm_read_projects\',' },
  { line: 120, find: 'name: \'Read Projects\';', replace: 'name: \'Read Projects\',' },
  { line: 121, find: 'resource: \'projects\';', replace: 'resource: \'projects\',' },
  { line: 122, find: 'action: \'read\';', replace: 'action: \'read\',' },
  { line: 123, find: 'scope: \'own\';', replace: 'scope: \'own\',' },
  { line: 124, find: 'description: \'View project details and contents\';', replace: 'description: \'View project details and contents\',' },
  
  // Fix function component props
  { line: 192, find: 'onRoleCloned;', replace: 'onRoleCloned,' },
  { line: 193, find: 'onClose;', replace: 'onClose,' },
  
  // Fix state object
  { line: 198, find: 'availableRoles: mockRoles;', replace: 'availableRoles: mockRoles,' },
  { line: 199, find: 'availablePermissions: mockPermissions;', replace: 'availablePermissions: mockPermissions,' },
  { line: 200, find: 'cloneOperations: [];', replace: 'cloneOperations: [],' },
  { line: 201, find: 'targetName: \'\';', replace: 'targetName: \'\',' },
  { line: 202, find: 'targetDescription: \'\';', replace: 'targetDescription: \'\',' },
  { line: 203, find: 'targetScope: \'organization\';', replace: 'targetScope: \'organization\',' },
  { line: 204, find: 'selectedPermissions: new Set();', replace: 'selectedPermissions: new Set(),' },
  { line: 205, find: 'excludedPermissions: new Set();', replace: 'excludedPermissions: new Set(),' },
  { line: 206, find: 'searchTerm: \'\';', replace: 'searchTerm: \'\',' },
  { line: 207, find: 'filterScope: \'\';', replace: 'filterScope: \'\',' },
  { line: 208, find: 'showAdvancedOptions: false;', replace: 'showAdvancedOptions: false,' },
  { line: 209, find: 'isLoading: false;', replace: 'isLoading: false,' },
  { line: 210, find: 'error: null;', replace: 'error: null,' },
  { line: 211, find: 'nameExists: false;', replace: 'nameExists: false,' },
  
  // Fix setState calls
  { line: 244, find: '...prev;', replace: '...prev,' },
  { line: 245, find: 'isLoading: false;', replace: 'isLoading: false,' },
  { line: 253, find: '...prev;', replace: '...prev,' },
  { line: 254, find: 'selectedSourceRole: role;', replace: 'selectedSourceRole: role,' },
  { line: 255, find: 'targetName: `${role.name, Copy`},', replace: 'targetName: `${role.name} Copy`,' },
  { line: 256, find: 'targetDescription: `Cloned from ${role.name}: ${role.description}`;', replace: 'targetDescription: `Cloned from ${role.name}: ${role.description}`,' },
  { line: 257, find: 'targetScope: role.scope;', replace: 'targetScope: role.scope,' },
  { line: 258, find: 'selectedPermissions: new Set(role.permissions);', replace: 'selectedPermissions: new Set(role.permissions),' },
  
  // Fix return statement
  { line: 273, find: '...prev;', replace: '...prev,' },
  { line: 274, find: 'selectedPermissions: newSelected;', replace: 'selectedPermissions: newSelected,' },
  { line: 275, find: 'excludedPermissions: newExcluded;', replace: 'excludedPermissions: newExcluded' },
  
  // Fix operation object
  { line: 284, find: 'id: operationId;', replace: 'id: operationId,' },
  { line: 285, find: 'sourceRoleId: state.selectedSourceRole.id;', replace: 'sourceRoleId: state.selectedSourceRole.id,' },
  { line: 286, find: 'targetRoleName: state.targetName;', replace: 'targetRoleName: state.targetName,' },
  { line: 287, find: 'targetDescription: state.targetDescription;', replace: 'targetDescription: state.targetDescription,' },
  { line: 288, find: 'targetScope: state.targetScope;', replace: 'targetScope: state.targetScope,' },
  { line: 289, find: 'includePermissions: Array.from(state.selectedPermissions);', replace: 'includePermissions: Array.from(state.selectedPermissions),' },
  { line: 290, find: 'excludePermissions: Array.from(state.excludedPermissions);', replace: 'excludePermissions: Array.from(state.excludedPermissions),' },
  { line: 291, find: 'timestamp: new Date();', replace: 'timestamp: new Date(),' },
  { line: 292, find: 'status: \'pending\';', replace: 'status: \'pending\'' },
  
  // Fix another setState
  { line: 295, find: '...prev;', replace: '...prev,' },
  { line: 296, find: 'cloneOperations: [...prev.cloneOperations, operation];', replace: 'cloneOperations: [...prev.cloneOperations, operation],' },
  { line: 297, find: 'isLoading: true;', replace: 'isLoading: true,' },
  { line: 298, find: 'error: null;', replace: 'error: null' },
  
  // Fix clonedRole object
  { line: 304, find: 'id: `role_${Date.now()}`;', replace: 'id: `role_${Date.now()}`,' },
  { line: 305, find: 'name: state.targetName;', replace: 'name: state.targetName,' },
  { line: 306, find: 'description: state.targetDescription;', replace: 'description: state.targetDescription,' },
  { line: 307, find: 'permissions: Array.from(state.selectedPermissions);', replace: 'permissions: Array.from(state.selectedPermissions),' },
  { line: 308, find: 'scope: state.targetScope;', replace: 'scope: state.targetScope,' },
  { line: 309, find: 'createdAt: new Date();', replace: 'createdAt: new Date(),' },
  { line: 310, find: 'updatedAt: new Date();', replace: 'updatedAt: new Date(),' },
  { line: 312, find: 'clonedFrom: state.selectedSourceRole.id;', replace: 'clonedFrom: state.selectedSourceRole.id,' },
  { line: 313, find: 'cloneCount: 0;', replace: 'cloneCount: 0' },
  { line: 314, find: '};', replace: '}' },
];

// Apply fixes
console.log(`Applying ${fixes.length} manual fixes...`);
fixes.forEach(fix => {
  if (lines[fix.line - 1]) {
    lines[fix.line - 1] = lines[fix.line - 1].replace(fix.find, fix.replace);
  }
});

// Additional structural fixes
console.log('\n📐 Fixing structural issues...');

// Add missing closing brace for RoleCloneState interface
lines.splice(79, 0, '}');

// Fix the array.map arrow function
for (let i = 316; i < 320; i++) {
  if (lines[i] && lines[i].includes('role.id === state.selectedSourceRole?.id')) {
    lines[i - 1] = '      const updatedRoles = state.availableRoles.map(role =>';
    break;
  }
}

// Fix object syntax
for (let i = 319; i < 325; i++) {
  if (lines[i] && lines[i].includes('...role;')) {
    lines[i] = '              ...role,';
    break;
  }
}

// Fix metadata object
for (let i = 320; i < 326; i++) {
  if (lines[i] && lines[i].includes('...role.metadata;')) {
    lines[i] = '                ...role.metadata,';
    break;
  }
}

// Fix the missing closing for role
for (let i = 323; i < 326; i++) {
  if (lines[i] && lines[i].includes(': role')) {
    lines[i] = '            }';
    lines.splice(i + 1, 0, '          } : role');
    break;
  }
}

// Fix another setState
for (let i = 326; i < 330; i++) {
  if (lines[i] && lines[i].includes('...prev;')) {
    lines[i] = '        ...prev,';
    break;
  }
}

// Fix cloneOperations
for (let i = 327; i < 335; i++) {
  if (lines[i] && lines[i].includes('availableRoles: [...updatedRoles, clonedRole];')) {
    lines[i] = '        availableRoles: [...updatedRoles, clonedRole],';
    break;
  }
}

// Fix map function syntax
for (let i = 328; i < 332; i++) {
  if (lines[i] && lines[i].includes('prev.cloneOperations.map(op =>);')) {
    lines[i] = '        cloneOperations: prev.cloneOperations.map(op =>';
    break;
  }
}

// Fix isLoading
for (let i = 333; i < 336; i++) {
  if (lines[i] && lines[i].includes(');')) {
    lines[i] = '        ),';
    break;
  }
}

// Fix selectedSourceRole
for (let i = 335; i < 340; i++) {
  if (lines[i] && lines[i].includes('selectedSourceRole: undefined;')) {
    lines[i] = '        selectedSourceRole: undefined,';
    break;
  }
}

// Fix error handler setState
for (let i = 344; i < 350; i++) {
  if (lines[i] && lines[i].includes('...prev;')) {
    lines[i] = '        ...prev,';
    break;
  }
}

// Fix another map
for (let i = 345; i < 350; i++) {
  if (lines[i] && lines[i].includes('prev.cloneOperations.map(op =>);')) {
    lines[i] = '        cloneOperations: prev.cloneOperations.map(op =>';
    break;
  }
}

// Fix the filter
for (let i = 366; i < 370; i++) {
  if (lines[i] && lines[i].includes('Array.from(sourcePermissions).filter(id =>)')) {
    lines[i] = '        Array.from(sourcePermissions).filter(id =>';
    break;
  }
}

// Fix setState prev
for (let i = 389; i < 395; i++) {
  if (lines[i] && lines[i].includes('...prev;')) {
    lines[i] = '      ...prev,';
    break;
  }
}

// Fix selectedPermissions
for (let i = 390; i < 392; i++) {
  if (lines[i] && lines[i].includes('selectedPermissions;')) {
    lines[i] = '      selectedPermissions,';
    break;
  }
}

// Fix return statements
for (let i = 411; i < 413; i++) {
  if (lines[i] && lines[i].includes('return;')) {
    lines[i] = '    return (';
    break;
  }
}

for (let i = 416; i < 418; i++) {
  if (lines[i] && lines[i].includes('return;')) {
    lines[i] = '  return (';
    break;
  }
}

// Write the fixed content
content = lines.join('\n');
fs.writeFileSync(filePath, content);

// Check results
console.log('\n📊 Checking results...');
try {
  execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
  console.log('✅ No TypeScript errors!');
} catch (error) {
  const errorCount = (error.stdout.match(/error TS/g) || []).length;
  console.log(`⚠️  ${errorCount} errors remaining`);
  
  // Show first few errors
  const errorOutput = error.stdout || '';
  const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
  console.log('\nFirst 10 errors:');
  errorLines.slice(0, 10).forEach(line => {
    const match = line.match(/\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (match) {
      console.log(`  Line ${match[1]}: ${match[3]} - ${match[4]}`);
    }
  });
}