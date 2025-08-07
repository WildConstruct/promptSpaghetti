#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Complete RoleCloneManager.tsx Restructuring');
console.log('=============================================\n');

const filePath = 'client/src/components/admin/RoleCloneManager.tsx';

// Read and fix the file with a complete rewrite of problematic sections
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Fix array type declarations in interfaces
content = content.replace(/includePermissions: string;/g, 'includePermissions: string[];');
content = content.replace(/excludePermissions: string;/g, 'excludePermissions: string[];');

// Fix 2: Fix the missing braces and syntax in mock data
console.log('🔧 Fixing mock data structure...');

// Fix the mockRoles array
content = content.replace(
  /const mockRoles: Role\[\] = \[\s*{[\s\S]*?\];/,
  `const mockRoles: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full administrative access with all permissions',
    permissions: [
      'perm_read_projects', 'perm_edit_projects', 'perm_delete_projects',
      'perm_admin_users', 'perm_admin_roles', 'perm_view_analytics',
      'perm_export_data'
    ],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    metadata: { cloneCount: 3 }
  },
  {
    id: 'role_editor',
    name: 'Editor',
    description: 'Content creation and editing permissions',
    permissions: ['perm_read_projects', 'perm_edit_projects', 'perm_share_projects'],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
    metadata: { cloneCount: 1 }
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to projects and basic information',
    permissions: ['perm_read_projects', 'perm_view_analytics'],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
    metadata: { cloneCount: 0 }
  }
];`
);

// Fix 3: Fix function syntax errors
console.log('🔧 Fixing function syntax...');

// Fix the loadData function
content = content.replace(
  /const loadData = async \(\) => \{[\s\S]*?\};/,
  `const loadData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  };`
);

// Fix the useEffect for name validation
content = content.replace(
  /useEffect\(\(\) => \{\s*if \(state\.targetName\.trim\(\)\) \{[\s\S]*?\}, \[state\.targetName, state\.availableRoles\]\);/,
  `useEffect(() => {
    if (state.targetName.trim()) {
      const exists = state.availableRoles.some(role => 
        role.name.toLowerCase() === state.targetName.toLowerCase()
      );
      setState(prev => ({ ...prev, nameExists: exists }));
    } else {
      setState(prev => ({ ...prev, nameExists: false }));
    }
  }, [state.targetName, state.availableRoles]);`
);

// Fix the validation useEffect
content = content.replace(
  /useEffect\(\(\) => \{\s*const errors: string\[\] = \[\];[\s\S]*?\}, \[state\.targetName, state\.targetDescription, state\.selectedPermissions, state\.nameExists, state\.selectedSourceRole\]\);/,
  `useEffect(() => {
    const errors: string[] = [];
    
    if (!state.targetName.trim()) {
      errors.push('Role name is required');
    } else if (state.nameExists) {
      errors.push('Role name already exists');
    }
    
    if (!state.targetDescription.trim()) {
      errors.push('Role description is required');
    }
    
    if (state.selectedPermissions.size === 0 && state.selectedSourceRole) {
      errors.push('At least one permission must be selected');
    }
    
    setState(prev => ({ ...prev, validationErrors: errors }));
  }, [state.targetName, state.targetDescription, state.selectedPermissions, state.nameExists, state.selectedSourceRole]);`
);

// Fix 4: Fix the handleSourceRoleSelect function
console.log('🔧 Fixing callback functions...');

content = content.replace(
  /const handleSourceRoleSelect = useCallback\(\(role: Role\) => \{[\s\S]*?\}, \[\]\);/,
  `const handleSourceRoleSelect = useCallback((role: Role) => {
    setState(prev => ({
      ...prev,
      selectedSourceRole: role,
      targetName: \`\${role.name} Copy\`,
      targetDescription: \`Cloned from \${role.name}: \${role.description}\`,
      targetScope: role.scope,
      selectedPermissions: new Set(role.permissions),
      excludedPermissions: new Set()
    }));
  }, []);`
);

// Fix 5: Fix the handleCloneRole function
content = content.replace(
  /const handleCloneRole = async \(\) => \{[\s\S]*?\};/,
  `const handleCloneRole = async () => {
    if (state.validationErrors.length > 0) return;
    if (!state.selectedSourceRole) return;
    
    const operationId = \`clone-\${Date.now()}\`;
    const operation: CloneOperation = {
      id: operationId,
      sourceRoleId: state.selectedSourceRole.id,
      targetRoleName: state.targetName,
      targetDescription: state.targetDescription,
      targetScope: state.targetScope,
      includePermissions: Array.from(state.selectedPermissions),
      excludePermissions: Array.from(state.excludedPermissions),
      timestamp: new Date(),
      status: 'pending'
    };
    
    setState(prev => ({
      ...prev,
      cloneOperations: [...prev.cloneOperations, operation],
      isLoading: true,
      error: null
    }));
    
    try {
      // TODO: Make actual API call to clone role
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const clonedRole: Role = {
        id: \`role_\${Date.now()}\`,
        name: state.targetName,
        description: state.targetDescription,
        permissions: Array.from(state.selectedPermissions),
        scope: state.targetScope,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          clonedFrom: state.selectedSourceRole.id,
          cloneCount: 0
        }
      };
      
      // Update source role clone count
      const updatedRoles = state.availableRoles.map(role =>
        role.id === state.selectedSourceRole?.id
          ? {
              ...role,
              metadata: {
                ...role.metadata,
                cloneCount: (role.metadata?.cloneCount || 0) + 1
              }
            }
          : role
      );
      
      setState(prev => ({
        ...prev,
        availableRoles: [...updatedRoles, clonedRole],
        cloneOperations: prev.cloneOperations.map(op =>
          op.id === operationId
            ? { ...op, status: 'success' as const }
            : op
        ),
        isLoading: false,
        // Reset form
        selectedSourceRole: undefined,
        targetName: '',
        targetDescription: '',
        selectedPermissions: new Set(),
        excludedPermissions: new Set()
      }));
      
      onRoleCloned?.(clonedRole);
    } catch (error) {
      setState(prev => ({
        ...prev,
        cloneOperations: prev.cloneOperations.map(op =>
          op.id === operationId
            ? {
                ...op,
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Clone operation failed'
              }
            : op
        ),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to clone role'
      }));
    }
  };`
);

// Fix 6: Fix switch statement in handlePresetClone
console.log('🔧 Fixing switch statements...');

content = content.replace(
  /selectedPermissions = new Set\(\),[\s\S]*?break;/g,
  function(match) {
    if (match.includes('minimal')) {
      return `selectedPermissions = new Set(
        Array.from(sourcePermissions).filter(id =>
          mockPermissions.find(p => p.id === id)?.action === 'read'
        )
      );
      break;`;
    } else if (match.includes('standard')) {
      return `selectedPermissions = new Set(
        Array.from(sourcePermissions).filter(id => {
          const permission = mockPermissions.find(p => p.id === id);
          return permission && ['read', 'write'].includes(permission.action);
        })
      );
      break;`;
    }
    return match;
  }
);

// Fix 7: Fix JSX syntax errors
console.log('🔧 Fixing JSX syntax...');

// Fix style object closing
content = content.replace(/style=\{\{([^}]+)\}\},/g, 'style={{$1}}');
content = content.replace(/borderRadius: '4px'\s*\n/g, 'borderRadius: \'4px\'\n}}');

// Fix conditional rendering
content = content.replace(/\{state\.nameExists && \(\),/g, '{state.nameExists && (');
content = content.replace(/\{onClose && \(\),/g, '{onClose && (');

// Fix onClick handlers
content = content.replace(/onClick=\{\(\) => \{\}\} => /g, 'onClick={() => ');

// Fix 8: Fix the filtered roles logic
content = content.replace(
  /const filteredRoles = state\.availableRoles\.filter\(role => \{[\s\S]*?\}\);/,
  `const filteredRoles = state.availableRoles.filter(role => {
    const matchesSearch = !state.searchTerm || 
      role.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesScope = !state.filterScope || role.scope === state.filterScope;
    return matchesSearch && matchesScope;
  });`
);

// Fix 9: Fix the permissionsByCategory reduce
content = content.replace(
  /const permissionsByCategory = mockPermissions\.reduce\(\(acc, permission\) => \{[\s\S]*?\}, \{\} as Record<string, Permission>\s*\);/,
  `const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);`
);

// Fix 10: Final cleanup
console.log('🔧 Final cleanup...');

// Ensure proper closing of the component
if (!content.includes('export default RoleCloneManager;')) {
  content = content.replace(/}\s*$/, '};\\n\\nexport default RoleCloneManager;');
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
  
  // Show first 5 unique error types
  const errorTypes = {};
  const matches = errorOutput.matchAll(/error (TS\d+): (.+)/g);
  for (const match of matches) {
    const [, code, msg] = match;
    if (!errorTypes[code]) {
      errorTypes[code] = { msg, count: 0 };
    }
    errorTypes[code].count++;
  }
  
  console.log('\nError summary:');
  Object.entries(errorTypes).slice(0, 5).forEach(([code, { msg, count }]) => {
    console.log(`  ${code} (${count}x): ${msg}`);
  });
}