/**
 * RoleCloneManager - Advanced role cloning system for RBAC management
 * 
 * Provides comprehensive role duplication functionality:
 * - Complete role cloning with permissions
 * - Selective permission copying
 * - Role template creation
 * - Bulk role operations
 * - Clone history tracking
 * - Validation and conflict detection
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types for role cloning operations
}
interface Role {
  id: string;,
  name: string,
  description: string;,
  permissions: string,
  scope: 'global' | 'organization' | 'team';
  organizationId?: string,
  createdAt: Date;,
  updatedAt: Date;
  metadata?: {
  clonedFrom?: string,
  cloneCount: number;
  templateVersion?: string;
}
};
}
interface Permission {
  id: string;,
  name: string,
  resource: string;,
  action: string,
  scope: 'global' | 'organization' | 'team' | 'own';,
  description: string,
  category: string;
}
interface CloneOperation {
  id: string;,
  sourceRoleId: string,
  targetRoleName: string;,
  targetDescription: string,
  targetScope: Role['scope'];,
  includePermissions: string,
  excludePermissions: string;,
  timestamp: Date,
  status: 'pending' | 'success' | 'failed';
  error?: string;
}
interface RoleCloneManagerProps {
  onRoleCloned?: (clonedRole: Role) => void;
  onClose?: () => void;
  }

className?: string;
}
interface RoleCloneState {
  availableRoles: Role;,
  availablePermissions: Permission;
  selectedSourceRole?: Role,
  cloneOperations: CloneOperation;}


  // Clone configuration
  targetName: string;,
  targetDescription: string,
  targetScope: Role['scope'];,
  selectedPermissions: Set<string>,
  excludedPermissions: Set<string>;
  // UI state
  searchTerm: string;,
  filterScope: string,
  showAdvancedOptions: boolean;,
  isLoading: boolean,
  error: string | null;
  // Validation
  nameExists: boolean;,
  validationErrors: string;

// Mock data for development
const mockRoles: Role = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full administrative access with all permissions',
    permissions: [,
      'perm_read_projects', 'perm_edit_projects', 'perm_delete_projects',
      'perm_admin_users', 'perm_admin_roles', 'perm_view_analytics',
      'perm_export_data'
    ],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
}
    metadata: { cloneCount: 3 }
  }
  {
    id: 'role_editor',
    name: 'Editor',
    description: 'Content creation and editing permissions',
    permissions: ['perm_read_projects', 'perm_edit_projects', 'perm_share_projects'],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
    metadata: { cloneCount: 1 }
  }
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to projects and basic information',
    permissions: ['perm_read_projects', 'perm_view_analytics'],
    scope: 'organization',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
    metadata: { cloneCount: 0 }
];
const mockPermissions: Permission = [
  {
  id: 'perm_read_projects',
  name: 'Read Projects',
  resource: 'projects',
  action: 'read',
  scope: 'own',
  description: 'View project details and contents',
  category: 'Projects'
}
  {
  id: 'perm_edit_projects',
  name: 'Edit Projects',
  resource: 'projects',
  action: 'write',
  scope: 'own',
  description: 'Create and modify project files',
  category: 'Projects'
}
  {
  id: 'perm_delete_projects',
  name: 'Delete Projects',
  resource: 'projects',
  action: 'delete',
  scope: 'own',
  description: 'Delete project files and folders',
  category: 'Projects'
}
  {
  id: 'perm_share_projects',
  name: 'Share Projects',
  resource: 'projects',
  action: 'share',
  scope: 'team',
  description: 'Share projects with team members',
  category: 'Projects'
}
  {
  id: 'perm_admin_users',
  name: 'Manage Users',
  resource: 'users',
  action: 'manage',
  scope: 'organization',
  description: 'Create, edit, and deactivate user accounts',
  category: 'Administration'
}
  {
  id: 'perm_admin_roles',
  name: 'Manage Roles',
  resource: 'roles',
  action: 'manage',
  scope: 'organization',
  description: 'Create and modify roles and permissions',
  category: 'Administration'
}
  {
  id: 'perm_view_analytics',
  name: 'View Analytics',
  resource: 'analytics',
  action: 'read',
  scope: 'team',
  description: 'Access usage and performance analytics',
  category: 'Analytics'
}
  {
  id: 'perm_export_data',
  name: 'Export Data',
  resource: 'data',
  action: 'export',
  scope: 'organization',
  description: 'Export system data and reports',
  category: 'Data Management'];
  export const RoleCloneManager: React.FC<RoleCloneManagerProps> = ({
  onRoleCloned,
  onClose,
  className = ''
}) => {
  useAuthStore(); // Hook for potential future use
  const [state, setState] = useState<RoleCloneState>({
  availableRoles: mockRoles,
  availablePermissions: mockPermissions,
  cloneOperations: [],
  targetName: '',
  targetDescription: '',
  targetScope: 'organization',
  selectedPermissions: new Set(),
  excludedPermissions: new Set(),
  searchTerm: '',
  filterScope: '',
  showAdvancedOptions: false,
  isLoading: false,
  error: null,
  nameExists: false,
  validationErrors: []
});
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  // Validate target role name
  useEffect(() => {
    if (state.targetName.trim()) {
      const exists = state.availableRoles.some(role => ;);
        role.name.toLowerCase() === state.targetName.toLowerCase()
      );
      setState(prev => ({ ...prev, nameExists: exists }));
    } else {
      setState(prev => ({ ...prev, nameExists: false }));
  }, [state.targetName, state.availableRoles]);
  // Validation
  useEffect(() => {
  const errors: string = [];
  if (!state.targetName.trim()) {
  errors.push('Role name is required');
} else if (state.nameExists) {
      errors.push('Role name already exists');
    if (!state.targetDescription.trim()) {
      errors.push('Role description is required');
    if (state.selectedPermissions.size === 0 && state.selectedSourceRole) {
      errors.push('At least one permission must be selected');
    setState(prev => ({ ...prev, validationErrors: errors }));
  }, [state.targetName, state.targetDescription, state.selectedPermissions, state.nameExists, state.selectedSourceRole]);
  const loadData = async () => {
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
  };
  const handleSourceRoleSelect = useCallback((role: Role) => {
    setState(prev => ({
  ...prev,
      selectedSourceRole: role,
      targetName: `${role.name} Copy`}
},
  targetDescription: `Cloned from ${role.name}: ${role.description}`}
},
  targetScope: role.scope,
      selectedPermissions: new Set(role.permissions),
      excludedPermissions: new Set();
  }));
  }, []);
  const handlePermissionToggle = useCallback((permissionId: string, include: boolean) => {
    setState(prev => {
  const newSelected = new Set(prev.selectedPermissions);
      const newExcluded = new Set(prev.excludedPermissions);
      if (include) {
        newSelected.add(permissionId);
        newExcluded.delete(permissionId);
      } else {
  newSelected.delete(permissionId);
  newExcluded.add(permissionId);
  return {
  ...prev,
  selectedPermissions: newSelected,
  excludedPermissions: newExcluded
};
    });
  }, []);
  const handleCloneRole = async () => {
    if (state.validationErrors.length > 0) return;
    if (!state.selectedSourceRole) return;
    const operationId = `clone-${Date.now()}`;}
    const operation: CloneOperation = {,
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
      const clonedRole: Role = {,
  id: `role_${Date.now()}`}
},
  name: state.targetName,
        description: state.targetDescription,
        permissions: Array.from(state.selectedPermissions),
        scope: state.targetScope,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
  clonedFrom: state.selectedSourceRole.id,
  cloneCount: 0
};
      // Update source role clone count
      const updatedRoles = state.availableRoles.map(role =>;);
        role.id === state.selectedSourceRole?.id
          ? {
            ...role,
            metadata: {
              ...role.metadata,
              cloneCount: (role.metadata?.cloneCount || 0) + 1,
          : role
      );
      setState(prev => ({
  ...prev,
        availableRoles: [...updatedRoles, clonedRole],
        cloneOperations: prev.cloneOperations.map(op =>),
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
        excludedPermissions: new Set();
  }));
      onRoleCloned?.(clonedRole);
    } catch (error) {
  setState(prev => ({
  ...prev,
  cloneOperations: prev.cloneOperations.map(op =>),
  op.id === operationId
  ? {
  ...op,
  status: 'failed' as const,
  error: error instanceof Error ? error.message : 'Clone operation failed',
  : op),
  isLoading: false,
  error: error instanceof Error ? error.message : 'Failed to clone role'
}));
  };
  const handlePresetClone = (presetType: 'minimal' | 'standard' | 'extended') => {
  if (!state.selectedSourceRole) return;
  const sourcePermissions = new Set(state.selectedSourceRole.permissions);
  let selectedPermissions: Set<string>;
  switch (presetType) {
  case 'minimal':,
  // Only basic read permissions
  selectedPermissions = new Set()
  Array.from(sourcePermissions).filter(id =>)
  mockPermissions.find(p => p.id === id)?.action === 'read'
  );
  break;
  case 'standard':,
  // Read and basic write permissions
  selectedPermissions = new Set()
  Array.from(sourcePermissions).filter(id => {
  const permission = mockPermissions.find(p => p.id === id);
  return permission && ['read', 'write'].includes(permission.action);
}
      );
      break;
    case 'extended':
      // All permissions from source
      selectedPermissions = new Set(sourcePermissions);
      break;
    default:
      selectedPermissions = new Set();
    setState(prev => ({
  ...prev,
  selectedPermissions,
  excludedPermissions: new Set()
}));
  };
  const filteredRoles = state.availableRoles.filter(role => {
  const matchesSearch = !state.searchTerm || ;
      role.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesScope = !state.filterScope || role.scope === state.filterScope;
    return matchesSearch && matchesScope;
  });
  const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission>);
  const scopes = ['global', 'organization', 'team'];
  if (state.isLoading && !state.selectedSourceRole) {
    return;
      <div className={`role-clone-manager ${className}`} style={{ padding: '20px', textAlign: 'center' }}>}
        Loading roles...
      </div>
    );
  return;
    <div className={`role-clone-manager ${className}`} style={{}}
  padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      maxWidth: '1200px',
      margin: '0 auto';
  }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
            Role Cloning Manager
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            Create new roles by cloning existing ones with customizable permissions
          </p>
        </div>
        {onClose && ()
          <button
            onClick={onClose}
            style={{
  padding: '6px 12px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  borderRadius: '4px',
  cursor: 'pointer'
}}
          >
            ✕
          </button>
        )}
      </div>
      {/* Error Display */}
      {state.error && ()
        <div style={{
  padding: '12px',
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderRadius: '4px',
  color: '#c33',
  marginBottom: '16px'
}}>
          {state.error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Source Role Selection */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Select Source Role
          </h3>
          {/* Search and filters */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search roles..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              style={{
  flex: 1,
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px'
}}
            />
            <select
              value={state.filterScope}
              onChange={(e) => setState(prev => ({ ...prev, filterScope: e.target.value }))}
              style={{
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px'
}}
            >
              <option value="">All Scopes</option>
              {scopes.map(scope => (
                <option key={scope} value={scope}>
                  {scope.charAt(0).toUpperCase() + scope.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* Role list */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredRoles.map(role => (
              <div
                key={role.id}
                style={{
                  padding: '16px',
                  border: `2px solid ${state.selectedSourceRole?.id === role.id ? '#007bff' : '#eee'}`}
},
  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  backgroundColor: state.selectedSourceRole?.id === role.id ? '#f0f8ff' : '#fff',
                  transition: 'all 0.2s ease';
  }}
                onClick={() => handleSourceRoleSelect(role)}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ marginRight: '8px' }}>{role.name}</strong>
                  <span style={{
  padding: '2px 8px',
  backgroundColor: role.scope === 'global' ? '#ffc107' : role.scope === 'organization' ? '#28a745' : '#6c757d',
  color: 'white',
  borderRadius: '12px',
  fontSize: '10px'
}}>
                    {role.scope}
                  </span>
                  {role.metadata?.cloneCount !== undefined && ()
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>
                      Cloned {role.metadata.cloneCount} times
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                  {role.description}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  {role.permissions.length} permissions
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Clone Configuration */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Clone Configuration
          </h3>
          {!state.selectedSourceRole ? ()
            <div style={{
  padding: '40px',
  textAlign: 'center',
  color: '#666',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '2px dashed #ddd'
}}>
              Select a source role to begin cloning
            </div>
          ) : ()
            <>
              {/* Target role details */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                    New Role Name *
                  </label>
                  <input
                    type="text"
                    value={state.targetName}
                    onChange={(e) => setState(prev => ({ ...prev, targetName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${state.nameExists ? '#dc3545' : '#ddd'}`}
},
  borderRadius: '4px';
  }}
                    placeholder="Enter new role name"
                  />
                  {state.nameExists && ()
                    <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '4px' }}>
                      Role name already exists
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                    Description *
                  </label>
                  <textarea
                    value={state.targetDescription}
                    onChange={(e) => setState(prev => ({ ...prev, targetDescription: e.target.value }))}
                    style={{
  width: '100%',
  height: '60px',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  resize: 'vertical'
}}
                    placeholder="Describe the new role"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                    Scope
                  </label>
                  <select
                    value={state.targetScope}
                    onChange={(e) => setState(prev => ({ ...prev, targetScope: e.target.value as Role['scope'] }))}
                    style={{
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px'
}}
                  >
                    {scopes.map(scope => (
                      <option key={scope} value={scope}>
                        {scope.charAt(0).toUpperCase() + scope.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Permission presets */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Permission Presets
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePresetClone('minimal')}
                    style={{
  padding: '6px 12px',
  border: '1px solid #6c757d',
  backgroundColor: '#6c757d',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
}}
                  >
                    Minimal
                  </button>
                  <button
                    onClick={() => handlePresetClone('standard')}
                    style={{
  padding: '6px 12px',
  border: '1px solid #17a2b8',
  backgroundColor: '#17a2b8',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
}}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => handlePresetClone('extended')}
                    style={{
  padding: '6px 12px',
  border: '1px solid #28a745',
  backgroundColor: '#28a745',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
}}
                  >
                    Extended
                  </button>
                </div>
              </div>
              {/* Permission selection */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  Select Permissions ({state.selectedPermissions.size} selected)
                </h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} style={{ borderBottom: '1px solid #eee' }}>
                      <div style={{
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold',
  fontSize: '14px'
}}>
                        {category}
                      </div>
                      {permissions.map(permission => {
  const isSelected = state.selectedPermissions.has(permission.id);
                        const wasInSource = state.selectedSourceRole?.permissions.includes(permission.id) ?? false;
                        return;
                          <div
                            key={permission.id}
                            style={{
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: isSelected ? '#f0f8ff' : '#fff',
  borderLeft: wasInSource ? '3px solid #007bff' : '3px solid transparent'
}}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handlePermissionToggle(permission.id, e.target.checked)}
                              style={{ marginRight: '8px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: wasInSource ? 'bold' : 'normal' }}>
                                {permission.name}
                                {wasInSource && ()
                                  <span style={{
  marginLeft: '8px',
  fontSize: '10px',
  color: '#007bff'
}}>
                                    (from source)
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* Validation errors */}
              {state.validationErrors.length > 0 && ()
                <div style={{
  padding: '12px',
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderRadius: '4px',
  marginBottom: '16px'
}}>
                  <strong style={{ color: '#c33' }}>Please fix the following errors:</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#c33' }}>
                    {state.validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setState(prev => ({ )
                    ...prev, 
                    selectedSourceRole: undefined,
                    targetName: '',
                    targetDescription: '',
                    selectedPermissions: new Set(),
                    excludedPermissions: new Set();
  }))}
                  style={{
  padding: '8px 16px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  borderRadius: '4px',
  cursor: 'pointer'
}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloneRole}
                  disabled={state.validationErrors.length > 0 || state.isLoading}
                  style={{
  padding: '8px 16px',
  border: '1px solid #28a745',
  backgroundColor: state.validationErrors.length === 0 && !state.isLoading ? '#28a745' : '#6c757d',
  color: 'white',
  borderRadius: '4px',
  cursor: state.validationErrors.length === 0 && !state.isLoading ? 'pointer' : 'not-allowed'
}}
                >
                  {state.isLoading ? 'Cloning Role...' : 'Clone Role'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Clone operations history */}
      {state.cloneOperations.length > 0 && ()
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Clone Operations
          </h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {state.cloneOperations.map(operation => (
              <div
                key={operation.id}
                style={{
  padding: '12px',
  border: '1px solid #eee',
  borderRadius: '4px',
  marginBottom: '8px',
  backgroundColor: operation.status === 'success' ? '#d4edda' : ,
  operation.status === 'failed' ? '#f8d7da' : '#fff3cd'
}}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {operation.targetRoleName}
                  </span>
                  <span style={{
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '10px',
  backgroundColor: operation.status === 'success' ? '#28a745' :,
  operation.status === 'failed' ? '#dc3545' : '#ffc107',
  color: 'white'
}}>
                    {operation.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Cloned from: {state.availableRoles.find(r => r.id === operation.sourceRoleId)?.name}
                  {operation.error && ()
                    <div style={{ color: '#dc3545', marginTop: '4px' }}>
                      Error: {operation.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCloneManager;