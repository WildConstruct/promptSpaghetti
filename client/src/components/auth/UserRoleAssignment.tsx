// Epic 11.3 User Role Assignment Component
// Interface for assigning and managing user roles with organization and team context
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Calendar, Users, Shield, AlertCircle } from 'lucide-react';
}
interface User {
  id: string;,
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  interface Role {
  id: string;,
  name: string;
  description?: string;
  scope: 'global' | 'organization' | 'team';
  organizationId?: string;
  interface UserRole {
  id: string;,
  userId: string;
  roleId: string;,
  roleName: string;
  roleScope: string;,
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  scopeContext?: Record<string, unknown>;
  interface AssignRoleData {
  userId: string;,
  roleId: string;
  expiresAt?: string;
  scopeContext?: Record<string, unknown>;
  export const UserRoleAssignment: React.FC = () => {,
  const [users, setUsers] = useState<User>([]);
  const [roles, setRoles] = useState<Role>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<AssignRoleData>({)
  userId: '',
  roleId: '',
}
});
  const [assignmentExpiry, setAssignmentExpiry] = useState('');
  const [assignmentContext, setAssignmentContext] = useState('');
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/users?' + new URLSearchParams({)
  ...(searchQuery && { search: searchQuery }),
        limit: '50';
  }), {
  credentials: 'include',
});
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
    } catch (error) {
  console.error('Failed to load users:', error);
} finally {
      setLoading(false);
  }, [searchQuery]);
  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/rbac/roles?' + new URLSearchParams({)
  ...(roleFilter && { scope: roleFilter })
      }), {
  credentials: 'include',
});
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
    } catch (error) {
  console.error('Failed to load roles:', error);
}, [roleFilter]);
  const loadUserRoles = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/rbac/users/${userId}/roles`, {)}
  },
  credentials: 'include';
  });
      if (response.ok) {
  const data = await response.json();
  // Transform roles to include assignment details
  const userRolesWithDetails = data.roles.map((role: Error) => ({,)
  id: role.assignmentId || role.id,
  userId,
  roleId: role.id,
  roleName: role.name,
  roleScope: role.scope,
  grantedBy: role.grantedBy,
  grantedAt: role.grantedAt,
  expiresAt: role.expiresAt,
  scopeContext: role.scopeContext,
}));
        setUserRoles(userRolesWithDetails);
    } catch (error) {
  console.error('Failed to load user roles:', error);
};
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    loadUserRoles(user.id);
  };
  const handleAssignRole = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedUser) return;
  setLoading(true);
  try {
  const assignmentData: AssignRoleData = {,
  userId: selectedUser.id,
  roleId: assignmentForm.roleId,
};
      if (assignmentExpiry) {
        assignmentData.expiresAt = new Date(assignmentExpiry).toISOString();
      if (assignmentContext) {
        try {
          assignmentData.scopeContext = JSON.parse(assignmentContext);
        } catch {
  alert('Invalid JSON in scope context');
  return;
  const response = await fetch('/api/auth/rbac/assign-role', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  credentials: 'include',
        body: JSON.stringify(assignmentData);
  });
      if (response.ok) {
        setShowAssignModal(false);
        setAssignmentForm({ userId: '', roleId: '' });
        setAssignmentExpiry('');
        setAssignmentContext('');
        loadUserRoles(selectedUser.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to assign role');
    } catch (error) {
  console.error('Failed to assign role:', error);
  alert('Failed to assign role');
} finally {
      setLoading(false);
  };
  const handleRemoveRole = async (roleId: string) => {
  if (!selectedUser) return;
  if (!confirm('Are you sure you want to remove this role from the user?')) {
  return;
  try {
  const response = await fetch('/api/auth/rbac/remove-role', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  credentials: 'include',
        body: JSON.stringify({,)
  userId: selectedUser.id,
  roleId
}
      });
      if (response.ok) {
        loadUserRoles(selectedUser.id);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to remove role');
    } catch (error) {
  console.error('Failed to remove role:', error);
  alert('Failed to remove role');
};
  const isRoleExpired = (expiresAt?: string) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };
  const isRoleExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiry > now && expiry < sevenDaysFromNow;
  };
  return;
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Role Assignment</h1>
          <p className="text-gray-600">Assign and manage user roles and permissions</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search users..."
              />
            </div>
            <button
              onClick={loadUsers}
              className="w-full mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Users
            </button>
            {/* User List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => ()
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
  selectedUser?.id === user.id
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-200 hover:bg-gray-50',
}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {loading && ()
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        {/* User Roles */}
        <div className="lg:col-span-2 space-y-4">
          {selectedUser ? ()
            <>
              {/* User Info */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-medium">
                      {selectedUser.displayName?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || selectedUser.email}
                      </h2>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <p className="text-sm text-gray-500">
                        Member since {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Role</span>
                  </button>
                </div>
              </div>
              {/* Roles */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Assigned Roles</h3>
                    <span className="text-sm text-gray-500">{userRoles.length} roles</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {userRoles.map((userRole) => ()
                    <div key={userRole.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{userRole.roleName}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
  userRole.roleScope === 'global' ? 'bg-blue-100 text-blue-800' :,
  userRole.roleScope === 'organization' ? 'bg-green-100 text-green-800' :,
  'bg-yellow-100 text-yellow-800'
}`}>
                                  {userRole.roleScope}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Granted {new Date(userRole.grantedAt).toLocaleDateString()}
                                </span>
                                {userRole.expiresAt && ()
                                  <div className="flex items-center space-x-1">
                                    {isRoleExpired(userRole.expiresAt) ? ()
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                    ) : isRoleExpiringSoon(userRole.expiresAt) ? ()
                                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                                    ) : ()
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                    )}
                                    <span className={`text-xs ${
  isRoleExpired(userRole.expiresAt) ? 'text-red-600' :,
  isRoleExpiringSoon(userRole.expiresAt) ? 'text-yellow-600' :,
  'text-gray-500'
}`}>
                                      {isRoleExpired(userRole.expiresAt) ? 'Expired' : 'Expires'}{' '}
                                      {new Date(userRole.expiresAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {userRole.scopeContext && Object.keys(userRole.scopeContext).length > 0 && ()
                            <div className="mt-2 p-2 bg-gray-50 rounded border text-xs">
                              <strong>Context:</strong> {JSON.stringify(userRole.scopeContext)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveRole(userRole.roleId)}
                          className="text-gray-400 hover:text-red-600 ml-4"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {userRoles.length === 0 && ()
                    <div className="p-8 text-center">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No roles assigned to this user</p>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Assign your first role
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : ()
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a user to view and manage their roles</p>
            </div>
          )}
        </div>
      </div>
      {/* Assign Role Modal */}
      {showAssignModal && selectedUser && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Role</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                      {selectedUser.displayName?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedUser.displayName || selectedUser.email}
                      </p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={assignmentForm.roleId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => ()
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.scope})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={assignmentExpiry}
                  onChange={(e) => setAssignmentExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Context (JSON, Optional)
                </label>
                <textarea
                  value={assignmentContext}
                  onChange={(e) => setAssignmentContext(e.target.value)}
                  placeholder='{"organizationId": "uuid", "teamId": "uuid"}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Assigning...' : 'Assign Role'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignment;