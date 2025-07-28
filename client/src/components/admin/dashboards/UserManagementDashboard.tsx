/**
 * UserManagementDashboard - Fully refactored using shared admin architecture
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Complete example of migrating complex admin functionality to new architecture
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Download, Edit, Trash2, Shield, Mail } from 'lucide-react';
import {
  AdminLayout,
  StatusBadge,
  MetricsCard,
  AdminTable,
  AdminFormBuilder,
  LoadingSpinner,
  ErrorState,
  useAdminUserApi,
  usePermissions,
  PermissionGate,
  PERMISSIONS
} from '../shared';
import type { TableColumn, TableAction, FormSchema } from '../shared';
interface User {
  id: string;,
  name: string;
  email: string;,
  status: 'active' | 'suspended' | 'deleted' | 'locked' | 'pending_activation';
  roles: string;,
  lastLogin: string | null;
  createdAt: string;,
  loginAttempts: number;
  export const UserManagementDashboard: React.FC = () => {,
  const [users, setUsers] = useState<User>([]);
  const [selectedUsers, setSelectedUsers] = useState<User>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Pagination state
  const [pagination, setPagination] = useState({)
  current: 1,
  pageSize: 10,
  total: 0,
});
  const { getUsers, updateUserStatus, deleteUser, loading, error } = useAdminUserApi();
  const { hasPermission } = usePermissions();
  // Load users
  const loadUsers = useCallback(async () => {
  try {
  const response = await getUsers({)
  page: pagination.current,
  limit: pagination.pageSize,
  search: searchTerm,
  status: statusFilter,
});
      setUsers(response.data.users || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err) {
  console.error('Failed to load users:', err);
}, [getUsers, pagination.current, pagination.pageSize, searchTerm, statusFilter]);
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  // Handle user status change
  const handleStatusChange = useCallback(async (userId: string, newStatus: string, reason: string) => {
    try {
      await updateUserStatus(userId, newStatus, reason);
      await loadUsers();
    } catch (err) {
  console.error('Failed to update user status:', err);
}, [updateUserStatus, loadUsers]);
  // Handle user deletion
  const handleDeleteUser = useCallback(async (userId: string, reason: string) => {
    try {
      await deleteUser(userId, reason);
      await loadUsers();
    } catch (err) {
  console.error('Failed to delete user:', err);
}, [deleteUser, loadUsers]);
  // Bulk operations
  const handleBulkStatusChange = useCallback(async (newStatus: string, reason: string) => {
    for (const user of selectedUsers) {
      await handleStatusChange(user.id, newStatus, reason);
    setSelectedUsers([]);
  }, [selectedUsers, handleStatusChange]);
  // Calculate metrics
  const metrics = [;
    {
  value: users.length,
  label: 'Total Users',
  format: 'number' as const,
}
    {
  value: users.filter(u => u.status === 'active').length,
  label: 'Active Users',
  format: 'number' as const,
  trend: {,
  value: 8,
  direction: 'up' as const,
  label: 'vs last month',
}
    {
  value: users.filter(u => u.status === 'pending_activation').length,
  label: 'Pending Activation',
  format: 'number' as const,
}
    {
      value: Math.round((users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length / Math.max(users.length, 1)) * 100),
      label: 'Active This Month',
      format: 'percentage' as const];
  // Table columns
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      title: 'User',
      dataIndex: 'name',
      sortable: true,
      render: (_, record) => ()
        <div>
          <div style={{ fontWeight: '500', color: '#1f2937' }}>
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {record.email}
          </div>
        </div>
  }
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [,
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Locked', value: 'locked' },
        { label: 'Pending', value: 'pending_activation' }
      ],
      render: (status) => <StatusBadge status={status} />
  }
    {
      key: 'roles',
      title: 'Roles',
      dataIndex: 'roles',
      render: (roles: string) => (),
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {roles.slice(0, 2).map(role => ()
            <StatusBadge key={role} status="medium" size="small">
              {role}
            </StatusBadge>
          ))}
          {roles.length > 2 && ()
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              +{roles.length - 2} more
            </span>
          )}
        </div>
  }
    {
      key: 'lastLogin',
      title: 'Last Login',
      dataIndex: 'lastLogin',
      sortable: true,
      render: (lastLogin) => (),
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}
        </div>
  }
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      render: (createdAt) => (),
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {new Date(createdAt).toLocaleDateString()}
        </div>
  ];
  // Table actions
  const actions: TableAction<User>[] = [
    {
  key: 'edit',
  label: 'Edit',
  icon: Edit,
  onClick: (user) => {,
  setEditingUser(user);
  setShowEditModal(true);
},
  disabled: (user) => !hasPermission('users', 'update') || user.status === 'deleted'
  }
    {
  key: 'message',
  label: 'Send Message',
  icon: Mail,
  onClick: (user) => {,
  console.log('Send message to:', user.email);
},
  disabled: (user) => user.status !== 'active';
  }
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: (user) => {,
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {}
          handleDeleteUser(user.id, 'Deleted via admin dashboard');
  },
  disabled: (user) => !hasPermission('users', 'delete'),
      danger: true];
  // Bulk actions
  const bulkActions = [;
    {
  key: 'activate',
  label: 'Activate Selected',
  icon: Shield,
  onClick: (selectedUsers: User) => {,
  const reason = prompt('Enter reason for activation:');
  if (reason) {
  handleBulkStatusChange('active', reason);
}
    {
  key: 'suspend',
  label: 'Suspend Selected',
  onClick: (selectedUsers: User) => {,
  const reason = prompt('Enter reason for suspension:');
  if (reason) {
  handleBulkStatusChange('suspended', reason);
},
  danger: true];
  // Create user form schema
  const createUserSchema: FormSchema = {,
  title: 'Create New User',
  description: 'Add a new user to the system',
  layout: 'two-column',
  fields: [,
  {
  name: 'name',
  label: 'Full Name',
  type: 'text',
  required: true,
  placeholder: 'Enter full name',
  validation: {,
  minLength: 2,
  maxLength: 100,
}
      {
  name: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  placeholder: 'Enter email address',
  validation: {,
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
}
      {
        name: 'roles',
        label: 'Roles',
        type: 'multiselect',
        required: true,
        options: [,
          { label: 'Admin', value: 'admin' },
          { label: 'Moderator', value: 'moderator' },
          { label: 'User', value: 'user' },
          { label: 'Viewer', value: 'viewer' }
        ]
  }
      {
        name: 'department',
        label: 'Department',
        type: 'select',
        options: [,
          { label: 'Engineering', value: 'engineering' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'Sales', value: 'sales' },
          { label: 'Support', value: 'support' }
        ]
  }
      {
  name: 'sendWelcomeEmail',
  label: 'Send Welcome Email',
  type: 'checkbox',
  defaultValue: true,
  help: 'User will receive an email with login instructions',
}
      {
  name: 'requirePasswordChange',
  label: 'Require Password Change',
  type: 'checkbox',
  defaultValue: true,
  help: 'User must change password on first login'],
  submitText: 'Create User',
  cancelText: 'Cancel',
};
  const breadcrumbs = [;
    { label: 'Admin', href: '/admin' },
    { label: 'User Management' }
  ];
  const headerActions = (;);
    <div style={{ display: 'flex', gap: '12px' }}>
      <PermissionGate resource="users" action="view">
        <button
          onClick={() => {/* Export logic */}}
          style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
}}
        >
          <Download size={16} />
          Export
        </button>
      </PermissionGate>
      <PermissionGate resource="users" action="create">
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
}}
        >
          <Plus size={16} />
          Add User
        </button>
      </PermissionGate>
    </div>
  );
  return;
    <AdminLayout
      title="User Management"
      subtitle="Manage user accounts, roles, and permissions"
      breadcrumbs={breadcrumbs}
      actions={headerActions}
    >
      {/* Metrics */}
      <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '24px',
}}>
        <MetricsCard
          title="User Analytics"
          metrics={metrics}
          icon={Users}
          variant="default"
        />
      </div>
      {/* Users Table */}
      <AdminTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        selectable={hasPermission('users', 'update')}
        selectedRows={selectedUsers}
        onSelectionChange={setSelectedUsers}
        actions={actions}
        bulkActions={bulkActions}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
  },
  showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100]
        }}
        emptyText="No users found"
        emptyAction={hasPermission('users', 'create') ? {
  label: 'Add First User',
  onClick: () => setShowCreateModal(true),
} : undefined}
      />
      {/* Create User Modal */}
      {showCreateModal && ()
        <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}}>
          <div style={{
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  width: '600px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
}}>
            <AdminFormBuilder
              schema={createUserSchema}
              onSubmit={async (values) => {
  console.log('Creating user:', values);
  // API call would go here
  setShowCreateModal(false);
  loadUsers();
}}
              onCancel={() => setShowCreateModal(false)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagementDashboard;