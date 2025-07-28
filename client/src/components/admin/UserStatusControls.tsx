/**
 * User Status Controls
 * Epic 17.3.1 - User Management Dashboard
 * Task: E17-1753114397016-18BAC3
 * 
 * Administrative controls for managing user account lifecycle states.
 * Provides status change controls, bulk operations, and audit compliance.
 */
import React, { useState, useCallback } from 'react';

// User Status Types
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'locked' | 'pending_activation';

export interface UserStatusInfo {
  userId: string;
  email: string;
  name: string;
  currentStatus: UserStatus;
  lastStatusChange?: string;
  statusChangedBy?: string;
  statusReason?: string;
  lockedUntil?: string;
  suspendedUntil?: string;
  loginAttempts?: number;
  lastLogin?: string;
  createdAt: string;
  roles: string[];
}

export interface StatusChangeRequest {
  userId: string;
  newStatus: UserStatus;
  reason: string;
  expiresAt?: string; // For temporary suspensions/locks
  notifyUser?: boolean;
  bulkOperation?: boolean;
}
interface UserStatusControlsProps {
  users: UserStatusInfo[];
  selectedUserIds: string[];
  currentUserRole: string;
  onStatusChange: (request: StatusChangeRequest) => Promise<void>;
  onBulkStatusChange: (requests: StatusChangeRequest[]) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

export const UserStatusControls: React.FC<UserStatusControlsProps> = ({)
  users,
  selectedUserIds,
  currentUserRole,
  onStatusChange,
  onBulkStatusChange,
  onRefresh,
  isLoading = false,
  className = ''
}) => {
  // State Management
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserStatusInfo | null>(null);
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Permission checks
  const canChangeStatus = (targetStatus: UserStatus, userRole: string) => {
    if (userRole === 'super_admin') return true;
    if (userRole === 'admin') {
      return !['deleted'].includes(targetStatus); // Admins can't permanently delete
    }
    return false;
  };
  const canBulkOperation = (userRole: string) => {
    return ['super_admin', 'admin'].includes(userRole);
  };
  // Status configurations
  const statusConfigs = {
    active: {,
      label: 'Active',
      color: '#10b981',
      icon: '✅',
      description: 'User can access the system normally',
    },
    suspended: {,
      label: 'Suspended',
      color: '#f59e0b',
      icon: '⏸️',
      description: 'User access temporarily disabled',
    },
    deleted: {,
      label: 'Deleted',
      color: '#ef4444',
      icon: '🗑️',
      description: 'Account soft-deleted (retained for compliance)',
    },
    locked: {,
      label: 'Locked',
      color: '#dc2626',
      icon: '🔒',
      description: 'Account locked due to security concerns',
    },
    pending_activation: {,
      label: 'Pending',
      color: '#6b7280',
      icon: '⏳',
      description: 'Account awaiting activation',
    }
  };
  // Get selected users for bulk operations
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.userId));
  // Handle single user status change
  const handleStatusChange = useCallback(async (user: UserStatusInfo, status: UserStatus) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusReason('');
    setExpiresAt('');
    setNotifyUser(true);
    setShowStatusModal(true);
  }, []);
  // Handle bulk status change
  const handleBulkStatusChange = useCallback(() => {
    if (selectedUsers.length === 0) return;
    setNewStatus('suspended');
    setStatusReason('');
    setExpiresAt('');
    setNotifyUser(true);
    setShowBulkModal(true);
  }, [selectedUsers]);
  // Submit status change
  const submitStatusChange = useCallback(async () => {
    if (!selectedUser || !statusReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onStatusChange({)
        userId: selectedUser.userId,
        newStatus,
        reason: statusReason,
        expiresAt: expiresAt || undefined,
        notifyUser
      });
      setShowStatusModal(false);
      setSelectedUser(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to change user status:', error);
      // Error handling would show notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedUser, newStatus, statusReason, expiresAt, notifyUser, onStatusChange, onRefresh]);
  // Submit bulk status change
  const submitBulkStatusChange = useCallback(async () => {
    if (selectedUsers.length === 0 || !statusReason.trim()) return;
    setIsSubmitting(true);
    try {
      const requests = selectedUsers.map(user => ({)
        userId: user.userId,
        newStatus,
        reason: statusReason,
        expiresAt: expiresAt || undefined,
        notifyUser,
        bulkOperation: true,
      }));
      await onBulkStatusChange(requests);
      setShowBulkModal(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to perform bulk status change:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedUsers, newStatus, statusReason, expiresAt, notifyUser, onBulkStatusChange, onRefresh]);
  // Status Badge Component
  const StatusBadge: React.FC<{ status: UserStatus; size?: 'small' | 'medium' }> = ({ )
    status, 
    size = 'medium' 
  }) => {
    const config = statusConfigs[status];
    const isSmall = size === 'small';
    return ()
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 6px' : '4px 8px',
        backgroundColor: `${config.color}15`,}
        border: `1px solid ${config.color}40`,}
        borderRadius: '12px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: '500',
        color: config.color,
      }}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };
  // User Status Row Component
  // eslint-disable-next-line react/prop-types
  const UserStatusRow: React.FC<{ user: UserStatusInfo }> = ({ user }) => {
    const isSelected = selectedUserIds.includes(user.userId);
    return ()
      <tr style={{
        backgroundColor: isSelected ? '#dbeafe' : '#FFFFFF',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {user.email}
              </div>
            </div>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <StatusBadge status={user.currentStatus} />
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {user.roles.join(', ')}
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          {user.lastStatusChange && ()
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(user.lastStatusChange).toLocaleDateString()}
              </div>
              {user.statusChangedBy && ()
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  by {user.statusChangedBy}
                </div>
              )}
            </div>
          )}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {canChangeStatus('active', currentUserRole) && user.currentStatus !== 'active' && ()
              <button
                onClick={() => handleStatusChange(user, 'active')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#10b981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
                title="Activate user"
              >
                Activate
              </button>
            )}
            {canChangeStatus('suspended', currentUserRole) && user.currentStatus === 'active' && ()
              <button
                onClick={() => handleStatusChange(user, 'suspended')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f59e0b',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
                title="Suspend user"
              >
                Suspend
              </button>
            )}
            {canChangeStatus('locked', currentUserRole) && !['locked', 'deleted'].includes(user.currentStatus) && ()
              <button
                onClick={() => handleStatusChange(user, 'locked')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
                title="Lock user"
              >
                Lock
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };
  // Status Change Modal
  const StatusChangeModal = () => {
    if (!showStatusModal || !selectedUser) return null;
    return ()
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
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Change User Status
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
              <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Current status:</span>
              <StatusBadge status={selectedUser.currentStatus} size="small" />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UserStatus)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {Object.entries(statusConfigs).map(([status, config]) => ()
                <option key={status} value={status} disabled={!canChangeStatus(status as UserStatus, currentUserRole)}>
                  {config.icon} {config.label} - {config.description}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Reason (Required) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for this status change..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {['suspended', 'locked'].includes(newStatus) && ()
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Leave empty for permanent status change
              </div>
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                Send notification to user
              </span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitStatusChange}
              disabled={isSubmitting || !statusReason.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: statusReason.trim() ? '#3b82f6' : '#9ca3af',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: statusReason.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting ? 'Changing Status...' : 'Change Status'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Bulk Status Modal (similar structure, simplified for brevity)
  const BulkStatusModal = () => {
    if (!showBulkModal) return null;
    return ()
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
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Bulk Status Change
          </h3>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#92400e', marginBottom: '4px' }}>
              ⚠️ Warning: Bulk Operation
            </div>
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              This will change the status of {selectedUsers.length} selected users.
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UserStatus)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {Object.entries(statusConfigs).map(([status, config]) => ()
                <option key={status} value={status} disabled={!canChangeStatus(status as UserStatus, currentUserRole)}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Reason (Required) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for this bulk status change..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowBulkModal(false)}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitBulkStatusChange}
              disabled={isSubmitting || !statusReason.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: statusReason.trim() ? '#dc2626' : '#9ca3af',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: statusReason.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting ? 'Changing Status...' : `Change ${selectedUsers.length} Users`}
            </button>
          </div>
        </div>
      </div>
    );
  };
  return ()
    <div className={`user-status-controls ${className}`} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', overflow: 'hidden' }}>}
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#f9fafb',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            User Status Management
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            {users.length} users • {selectedUserIds.length} selected
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            {isLoading ? '⟳ Refreshing...' : '🔄 Refresh'}
          </button>
          {canBulkOperation(currentUserRole) && selectedUserIds.length > 0 && ()
            <button
              onClick={handleBulkStatusChange}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f59e0b',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Bulk Change ({selectedUserIds.length})
            </button>
          )}
        </div>
      </div>
      {/* User Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                User
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Roles
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Last Login
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status Changed
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => ()
              // eslint-disable-next-line react/prop-types
              <UserStatusRow key={user.userId} user={user} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {users.length === 0 && !isLoading && ()
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#6b7280',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Users Found</div>
          <div style={{ fontSize: '14px' }}>Users will appear here once they are loaded.</div>
        </div>
      )}
      {/* Status Change Modal */}
      <StatusChangeModal />
      {/* Bulk Status Modal */}
      <BulkStatusModal />
    </div>
  );
};

export default UserStatusControls;