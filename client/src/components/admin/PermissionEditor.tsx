/**
 * PermissionEditor - Admin interface for managing user permissions and roles
 * 
 * Provides comprehensive RBAC management with:
 * - Role-based permission assignment
 * - Granular permission control
 * - Resource-level permissions
 * - Bulk operations
 * - Audit trail integration
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types for permission management


interface Permission {
  id: string;,
  name: string,
  resource: string;,
  action: string,
  scope: 'global' | 'organization' | 'team' | 'own';,
  description: string,
  category: string;
  interface Role {
  id: string;,
  name: string,
  description: string;,
  permissions: string,
  scope: 'global' | 'organization' | 'team';
  organizationId?: string,
  createdAt: Date;,
  updatedAt: Date;
  interface User {
  id: string;,
  username: string,
  email: string;,
  roles: string,
  directPermissions: string;,
  isActive: boolean;
  interface PermissionEditorProps {
  userId?: string;
  roleId?: string,
  mode: 'user' | 'role' | 'resource';
  onSave?: (changes: unknown) => void;
  onCancel?: () => void;



className?: string;
  interface PermissionEditorState {
  selectedUser?: User;
  selectedRole?: Role,
  availablePermissions: Permission;,
  availableRoles: Role,
  users: User;,
  searchTerm: string,
  filterCategory: string;,
  filterScope: string,
  isLoading: boolean;,
  error: string | null,
  hasChanges: boolean;,
  selectedPermissions: Set<string>
},
  selectedRoles: Set<string>;}


  // Mock data for development
  const mockPermissions: Permission = [
  {
  id: 'perm_read_projects',
  name: 'Read Projects',
  resource: 'projects',
  action: 'read',
  scope: 'own',
  description: 'View project details and contents',
  category: 'Projects'


  {
  id: 'perm_edit_projects',
  name: 'Edit Projects',
  resource: 'projects',
  action: 'write',
  scope: 'own',
  description: 'Create and modify project files',
  category: 'Projects'

  {
  id: 'perm_delete_projects',
  name: 'Delete Projects',
  resource: 'projects',
  action: 'delete',
  scope: 'own',
  description: 'Delete project files and folders',
  category: 'Projects'

  {
  id: 'perm_share_projects',
  name: 'Share Projects',
  resource: 'projects',
  action: 'share',
  scope: 'team',
  description: 'Share projects with team members',
  category: 'Projects'

  {
  id: 'perm_admin_users',
  name: 'Manage Users',
  resource: 'users',
  action: 'manage',
  scope: 'organization',
  description: 'Create, edit, and deactivate user accounts',
  category: 'Administration'

  {
  id: 'perm_admin_roles',
  name: 'Manage Roles',
  resource: 'roles',
  action: 'manage',
  scope: 'organization',
  description: 'Create and modify roles and permissions',
  category: 'Administration'

  {
  id: 'perm_view_analytics',
  name: 'View Analytics',
  resource: 'analytics',
  action: 'read',
  scope: 'team',
  description: 'Access usage and performance analytics',
  category: 'Analytics'

  {
  id: 'perm_export_data',
  name: 'Export Data',
  resource: 'data',
  action: 'export',
  scope: 'organization',
  description: 'Export system data and reports',
  category: 'Data Management'

  {
  id: 'perm_system_config',
  name: 'System Configuration',
  resource: 'system',
  action: 'configure',
  scope: 'global',
  description: 'Modify system-wide settings',
  category: 'System'];
  const mockRoles: Role = [
  {
  id: 'role_viewer',
  name: 'Viewer',
  description: 'Can view projects and basic information',
  permissions: ['perm_read_projects', 'perm_view_analytics'],
  scope: 'organization',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')

  {
  id: 'role_editor',
  name: 'Editor',
  description: 'Can create and edit projects',
  permissions: ['perm_read_projects', 'perm_edit_projects', 'perm_share_projects'],
  scope: 'organization',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')

  {
  id: 'role_admin',
  name: 'Administrator',
  description: 'Full administrative access',
  permissions: [
  'perm_read_projects', 'perm_edit_projects', 'perm_delete_projects',
  'perm_share_projects', 'perm_admin_users', 'perm_admin_roles',
  'perm_view_analytics', 'perm_export_data'
  ],
  scope: 'organization',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')

  {
  id: 'role_superadmin',
  name: 'Super Administrator',
  description: 'Global system administration',
  permissions: [
  'perm_read_projects', 'perm_edit_projects', 'perm_delete_projects',
  'perm_share_projects', 'perm_admin_users', 'perm_admin_roles',
  'perm_view_analytics', 'perm_export_data', 'perm_system_config'
  ],
  scope: 'global',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')];
  const mockUsers: User = [
  {
  id: 'user_1',
  username: 'john_doe',
  email: 'john@example.com',
  roles: ['role_editor'],
  directPermissions: ['perm_view_analytics'],
  isActive: true

  {
  id: 'user_2',
  username: 'jane_smith',
  email: 'jane@example.com',
  roles: ['role_admin'],
  directPermissions: [],
  isActive: true

  {
  id: 'user_3',
  username: 'bob_viewer',
  email: 'bob@example.com',
  roles: ['role_viewer'],
  directPermissions: [],
  isActive: false];
  export const PermissionEditor: React.FC<PermissionEditorProps> = ({
  userId,
  roleId,
  mode,
  onSave,
  onCancel,
  className = ''
}) => {
  useAuthStore(); // Hook for potential future use
  const [state, setState] = useState<PermissionEditorState>({
  availablePermissions: mockPermissions,
  availableRoles: mockRoles,
  users: mockUsers,
  searchTerm: '',
  filterCategory: '',
  filterScope: '',
  isLoading: false,
  error: null,
  hasChanges: false,
  selectedPermissions: new Set(),
  selectedRoles: new Set()
});
  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
  // TODO: Replace with actual API calls,
  if (userId && mode === 'user') {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
  setState(prev => ({
  ...prev,
  selectedUser: user,
  selectedPermissions: new Set(user.directPermissions),
  selectedRoles: new Set(user.roles),
  isLoading: false
}));
 else if (roleId && mode === 'role') {
  const role = mockRoles.find(r => r.id === roleId);
  if (role) {
  setState(prev => ({
  ...prev,
  selectedRole: role,
  selectedPermissions: new Set(role.permissions),
  isLoading: false
}));
 else {
        setState(prev => ({ ...prev, isLoading: false }));
 catch (error) {
  setState(prev => ({
  ...prev,
  isLoading: false,
  error: error instanceof Error ? error.message : 'Failed to load data'
}));
  }, [userId, roleId, mode, setState]);
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setState(prev => {
  const newSelected = new Set(prev.selectedPermissions);
      if (newSelected.has(permissionId)) {
        newSelected.delete(permissionId);
 else {
  newSelected.add(permissionId);
  return {
  ...prev,
  selectedPermissions: newSelected,
  hasChanges: true
};
    });
  }, []);
  const handleRoleToggle = useCallback((roleId: string) => {
    setState(prev => {
  const newSelected = new Set(prev.selectedRoles);
      if (newSelected.has(roleId)) {
        newSelected.delete(roleId);
 else {
  newSelected.add(roleId);
  return {
  ...prev,
  selectedRoles: newSelected,
  hasChanges: true
};
    });
  }, []);
  const handleBulkPermissionChange = (category: string, grant: boolean) => {
    setState(prev => {
  const categoryPermissions = prev.availablePermissions;
        .filter(p => p.category === category)
        .map(p => p.id);
      const newSelected = new Set(prev.selectedPermissions);
      if (grant) {
        categoryPermissions.forEach(id => newSelected.add(id));
 else {
  categoryPermissions.forEach(id => newSelected.delete(id));
  return {
  ...prev,
  selectedPermissions: newSelected,
  hasChanges: true
};
    });
  };
  const handleSave = async () => {
    if (!state.hasChanges) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
  const changes = {
  permissions: Array.from(state.selectedPermissions),
  roles: Array.from(state.selectedRoles),
  userId: state.selectedUser?.id,
  roleId: state.selectedRole?.id,
  mode
};
      // TODO: Make actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave?.(changes);
      setState(prev => ({ ...prev, hasChanges: false, isLoading: false }));
 catch (error) {
  setState(prev => ({
  ...prev,
  isLoading: false,
  error: error instanceof Error ? error.message : 'Failed to save changes'
}));
  };
  const filteredPermissions = state.availablePermissions.filter(permission => {
  const matchesSearch = !state.searchTerm || ;
      permission.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesCategory = !state.filterCategory || permission.category === state.filterCategory;
    const matchesScope = !state.filterScope || permission.scope === state.filterScope;
    return matchesSearch && matchesCategory && matchesScope;
  });
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission>);
  const categories = Array.from(new Set(state.availablePermissions.map(p => p.category)));
  const scopes = ['global', 'organization', 'team', 'own'];
  if (state.isLoading) {
    return;
      <div className={`permission-editor ${className}`} style={{ padding: '20px', textAlign: 'center' }}>}
        Loading permission data...
      </div>
    );
  return;
    <div className={`permission-editor ${className}`} style={{ }},
  padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd';
}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          {mode === 'user' ? 'User Permissions' : mode === 'role' ? 'Role Permissions' : 'Resource Permissions'}
        </h2>
        {state.selectedUser && ()
          <p style={{ margin: 0, color: '#666' }}>
            Managing permissions for: {state.selectedUser.username} ({state.selectedUser.email})
          </p>
        )}
        {state.selectedRole && ()
          <p style={{ margin: 0, color: '#666' }}>
            Managing permissions for role: {state.selectedRole.name}
          </p>
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
}>
          {state.error}
        </div>
      )}
      {/* Search and Filter Controls */}
      <div style={{
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  alignItems: 'center',
  flexWrap: 'wrap'
}>
        <input
          type="text"
          placeholder="Search permissions..."
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          style={{
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  minWidth: '200px'
}
        />
        <select
          value={state.filterCategory}
          onChange={(e) => setState(prev => ({ ...prev, filterCategory: e.target.value }))}
          style={{
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px'
}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={state.filterScope}
          onChange={(e) => setState(prev => ({ ...prev, filterScope: e.target.value }))}
          style={{
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px'
}
        >
          <option value="">All Scopes</option>
          {scopes.map(scope => (
            <option key={scope} value={scope}>
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {/* Role Assignment (User Mode) */}
      {mode === 'user' && ()
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Role Assignment
          </h3>
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '12px'
}>
            {state.availableRoles.map(role => (
              <div
                key={role.id}
                style={{
                  padding: '16px',
                  border: `2px solid ${state.selectedRoles.has(role.id) ? '#007bff' : '#eee'}`}
},
  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: state.selectedRoles.has(role.id) ? '#f0f8ff' : '#fff',
                  transition: 'all 0.2s ease';

                onClick={() => handleRoleToggle(role.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={state.selectedRoles.has(role.id)}
                    onChange={() => {}} // Handled by parent click
                    style={{ marginRight: '8px' }}
                  />
                  <strong>{role.name}</strong>
                  <span style={{
  marginLeft: 'auto',
  padding: '2px 8px',
  backgroundColor: role.scope === 'global' ? '#ffc107' : role.scope === 'organization' ? '#28a745' : '#6c757d',
  color: 'white',
  borderRadius: '12px',
  fontSize: '10px'
}>
                    {role.scope}
                  </span>
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
      )}
      {/* Permission Categories */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Direct Permissions
        </h3>
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} style={{
  marginBottom: '24px',
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden'
}>
            {/* Category Header */}
            <div style={{
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {category}
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleBulkPermissionChange(category, true)}
                  style={{
  padding: '4px 8px',
  border: '1px solid #28a745',
  backgroundColor: '#28a745',
  color: 'white',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer'
}
                >
                  Grant All
                </button>
                <button
                  onClick={() => handleBulkPermissionChange(category, false)}
                  style={{
  padding: '4px 8px',
  border: '1px solid #dc3545',
  backgroundColor: '#dc3545',
  color: 'white',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer'
}
                >
                  Revoke All
                </button>
              </div>
            </div>
            {/* Permissions List */}
            <div style={{ padding: '16px' }}>
              {permissions.map(permission => (
                <div
                  key={permission.id}
                  style={{
  display: 'flex',
  alignItems: 'flex-start',
  padding: '12px',
  border: '1px solid #eee',
  borderRadius: '6px',
  marginBottom: '8px',
  cursor: 'pointer',
  backgroundColor: state.selectedPermissions.has(permission.id) ? '#f0f8ff' : '#fff'

                  onClick={() => handlePermissionToggle(permission.id)}
                >
                  <input
                    type="checkbox"
                    checked={state.selectedPermissions.has(permission.id)}
                    onChange={() => {}} // Handled by parent click
                    style={{ marginRight: '12px', marginTop: '2px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ marginRight: '8px' }}>{permission.name}</strong>
                      <span style={{
  padding: '2px 6px',
  backgroundColor: permission.scope === 'global' ? '#ffc107' : ,
  permission.scope === 'organization' ? '#28a745' :,
  permission.scope === 'team' ? '#17a2b8' : '#6c757d',
  color: 'white',
  borderRadius: '10px',
  fontSize: '10px'
}>
                        {permission.scope}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                      {permission.description}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                      Resource: {permission.resource} | Action: {permission.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Action Buttons */}
      <div style={{
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  paddingTop: '16px',
  borderTop: '1px solid #eee'
}>
        <button
          onClick={onCancel}
          style={{
  padding: '8px 16px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  borderRadius: '4px',
  cursor: 'pointer'
}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!state.hasChanges || state.isLoading}
          style={{
  padding: '8px 16px',
  border: '1px solid #007bff',
  backgroundColor: state.hasChanges && !state.isLoading ? '#007bff' : '#6c757d',
  color: 'white',
  borderRadius: '4px',
  cursor: state.hasChanges && !state.isLoading ? 'pointer' : 'not-allowed'

        >
          {state.isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {/* Summary */}
      {state.hasChanges && ()
        <div style={{
  marginTop: '16px',
  padding: '12px',
  backgroundColor: '#e7f3ff',
  border: '1px solid #b3d9ff',
  borderRadius: '4px'
}>
          <strong>Pending Changes:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>{Array.from(state.selectedPermissions).length} direct permissions selected</li>
            {mode === 'user' && <li>{Array.from(state.selectedRoles).length} roles assigned</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PermissionEditor;