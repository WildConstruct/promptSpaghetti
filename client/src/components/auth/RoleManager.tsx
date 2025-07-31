// Epic 11.3 Role Manager Component
// Administrative interface for creating, editing, and managing roles and permissions
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, Users, Shield, Settings, Filter, Search } from 'lucide-react';
}
interface Permission {
  id: string;,
  roleId: string;
  resource: string;,
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, unknown>;
  createdAt: string;
  interface Role {
  id: string;,
  name: string;
  description?: string;
  scope: 'global' | 'organization' | 'team';
  organizationId?: string;
  createdAt: string;,
  updatedAt: string;
  interface RoleWithDetails extends Role {
  permissions: Permission;,
  assignedUsers: unknown;
  interface CreateRoleData {
  name: string;
  description?: string;
  scope: 'global' | 'organization' | 'team';
  organizationId?: string;
  permissions: {
  resource: string;,
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, unknown>;
}
}[];
}
interface RoleStats {
  totalRoles: number;,
  rolesByScope: Record<string, number>;
  totalAssignments: number;,
  recentAssignments: number;
  export const RoleManager: React.FC = () => {,
  const [roles, setRoles] = useState<Role>([]);
  const [selectedRole, setSelectedRole] = useState<RoleWithDetails | null>(null);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  // Filters and search
  const [scopeFilter, setScopeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('');
  // Form state
  const [formData, setFormData] = useState<CreateRoleData>({)
  name: '',
  description: '',
  scope: 'global',
  permissions: [],
}
});
  // Permission templates for common role types
  const permissionTemplates = {
    admin: [,
      { resource: 'users', action: 'read', scope: 'global' as const },
      { resource: 'users', action: 'write', scope: 'global' as const },
      { resource: 'roles', action: 'read', scope: 'global' as const },
      { resource: 'roles', action: 'write', scope: 'global' as const },
      { resource: 'system', action: 'admin', scope: 'global' as const }
    ],
    editor: [,
      { resource: 'graphs', action: 'read', scope: 'global' as const },
      { resource: 'graphs', action: 'write', scope: 'own' as const },
      { resource: 'graphs', action: 'execute', scope: 'global' as const }
    ],
    viewer: [,
      { resource: 'graphs', action: 'read', scope: 'global' as const },
      { resource: 'graphs', action: 'execute', scope: 'global' as const }
    ]
  };
  useEffect(() => {
    loadData();
  }, [scopeFilter, searchQuery, organizationFilter, loadData]);
  const loadData = useCallback(async () => {
    try {
      const [rolesResponse, statsResponse] = await Promise.all([)
        fetch('/api/auth/rbac/roles?' + new URLSearchParams({)
  ...(scopeFilter && { scope: scopeFilter }),
          ...(searchQuery && { search: searchQuery }),
          ...(organizationFilter && { organizationId: organizationFilter })
        }), {
  credentials: 'include',
}),
        fetch('/api/auth/rbac/stats', {)
  credentials: 'include',
}
      ]);
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
    } catch (error) {
  console.error('Failed to load RBAC data:', error);
} finally {
      setLoading(false);
  }, [scopeFilter, searchQuery, organizationFilter]);
  const loadRoleDetails = async (roleId: string) => {
    try {
      const response = await fetch(`/api/auth/rbac/roles/${roleId}`, {)}
  },
  credentials: 'include';
  });
      if (response.ok) {
  const data = await response.json();
  setSelectedRole({)
  ...data.role,
  permissions: data.permissions,
  assignedUsers: data.assignedUsers,
});
    } catch (error) {
  console.error('Failed to load role details:', error);
};
  const handleCreateRole = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
  const response = await fetch('/api/auth/rbac/roles', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  credentials: 'include',
        body: JSON.stringify(formData);
  });
      if (response.ok) {
  setCreating(false);
  setFormData({)
  name: '',
  description: '',
  scope: 'global',
  permissions: [],
});
        await loadData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create role');
    } catch (error) {
  console.error('Failed to create role:', error);
  alert('Failed to create role');
} finally {
      setLoading(false);
  };
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    try {
      const response = await fetch(`/api/auth/rbac/roles/${roleId}`, {)}
  },
  method: 'DELETE',
        credentials: 'include';
  });
      if (response.ok) {
        await loadData();
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete role');
    } catch (error) {
  console.error('Failed to delete role:', error);
  alert('Failed to delete role');
};
  const toggleRoleExpansion = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
      loadRoleDetails(roleId);
    setExpandedRoles(newExpanded);
  };
  const applyPermissionTemplate = (template: keyof typeof permissionTemplates) => {
  setFormData({)
  ...formData,
  permissions: [...permissionTemplates[template]],
});
  };
  const addPermission = () => {
    setFormData({)
  ...formData,
      permissions: [,
        ...formData.permissions,
        { resource: '', action: '', scope: 'global' }
      ]
    });
  };
  const updatePermission = (index: number, field: string, value: string) => {
    const newPermissions = [...formData.permissions];
    newPermissions[index] = { ...newPermissions[index], [field]: value };
    setFormData({ ...formData, permissions: newPermissions });
  };
  const removePermission = (index: number) => {
  setFormData({)
  ...formData,
  permissions: formData.permissions.filter((_, i) => i !== index),
});
  };
  if (loading && !roles.length) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage roles and permissions for your organization</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>
      {/* Statistics */}
      {stats && ()
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRoles}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentAssignments}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Global Roles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rolesByScope.global || 0}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search roles..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Scopes</option>
                  <option value="global">Global</option>
                  <option value="organization">Organization</option>
                  <option value="team">Team</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Organizations</option>
                  {/* Organization options would be populated from API */}
                </select>
              </div>
            </div>
          </div>
          {/* Role List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-200">
              {roles.map((role) => ()
                <div key={role.id}>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleRoleExpansion(role.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRoles.has(role.id) ? ()
                            <ChevronDown className="w-4 h-4" />
                          ) : ()
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-medium text-gray-900">{role.name}</h3>
                          {role.description && ()
                            <p className="text-sm text-gray-600">{role.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
  role.scope === 'global' ? 'bg-blue-100 text-blue-800' :,
  role.scope === 'organization' ? 'bg-green-100 text-green-800' :,
  'bg-yellow-100 text-yellow-800'
}`}>
                              {role.scope}
                            </span>
                            <span className="text-xs text-gray-500">
                              Created {new Date(role.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRole(null);
                            setEditing(true);
                            loadRoleDetails(role.id);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Expanded Role Details */}
                  {expandedRoles.has(role.id) && selectedRole?.id === role.id && ()
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                          <div className="space-y-1">
                            {selectedRole.permissions.map((permission) => ()
                              <div
                                key={permission.id}
                                className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded border"
                              >
                                <span>{permission.resource}:{permission.action}</span>
                                <span className={`px-2 py-1 text-xs rounded ${
  permission.scope === 'global' ? 'bg-blue-100 text-blue-800' :,
  permission.scope === 'organization' ? 'bg-green-100 text-green-800' :,
  permission.scope === 'team' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-purple-100 text-purple-800'
}`}>
                                  {permission.scope}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Assigned Users ({selectedRole.assignedUsers.length})</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedRole.assignedUsers.map((user) => ()
                              <div key={user.id} className="flex items-center space-x-2 text-sm">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                  {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                <span>{user.displayName || user.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Create/Edit Role Form */}
        {(creating || editing) && ()
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {creating ? 'Create Role' : 'Edit Role'}
              </h2>
              <button
                onClick={() => {
  setCreating(false);
  setEditing(false);
  setFormData({)
  name: '',
  description: '',
  scope: 'global',
  permissions: [],
});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as 'global' | 'organization' | 'team' | 'own' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="global">Global</option>
                  <option value="organization">Organization</option>
                  <option value="team">Team</option>
                </select>
              </div>
              {/* Permission Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Templates
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPermissionTemplate('admin')}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPermissionTemplate('editor')}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPermissionTemplate('viewer')}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Viewer
                  </button>
                </div>
              </div>
              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Permissions
                  </label>
                  <button
                    type="button"
                    onClick={addPermission}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Permission
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.permissions.map((permission, index) => ()
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Resource"
                        value={permission.resource}
                        onChange={(e) => updatePermission(index, 'resource', e.target.value)}
                        className="col-span-4 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Action"
                        value={permission.action}
                        onChange={(e) => updatePermission(index, 'action', e.target.value)}
                        className="col-span-3 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={permission.scope}
                        onChange={(e) => updatePermission(index, 'scope', e.target.value)}
                        className="col-span-4 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="global">Global</option>
                        <option value="organization">Organization</option>
                        <option value="team">Team</option>
                        <option value="own">Own</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removePermission(index)}
                        className="col-span-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : (creating ? 'Create Role' : 'Update Role')}
                </button>
                <button
                  type="button"
                  onClick={() => {
  setCreating(false);
  setEditing(false);
  setFormData({)
  name: '',
  description: '',
  scope: 'global',
  permissions: [],
});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManager;