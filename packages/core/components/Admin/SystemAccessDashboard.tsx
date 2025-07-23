/**
 * System Access Management Dashboard - Epic 17
 * 
 * Comprehensive admin interface for managing system access, user roles,
 * permissions, and access requests with RBAC controls.
 * 
 * Task: E17-1753114397018-1B4251 - Add system access management
 * Epic: 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Users, 
  Shield, 
  Key, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus, 
  Search, 
  Filter, 
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertCircle,
  Lock,
  Unlock,
  Crown,
  Activity
} from 'lucide-react';

import {
  systemAccessManager,
  SystemUser,
  SystemRole,
  AccessRequest,
  AccessFilter,
  AccessStats,
  UserStatus,
  SystemAccessLevel,
  SecurityClearance,
  AccessRequestStatus
} from '../../services/SystemAccessManager';

interface SystemAccessDashboardProps {
  className?: string;
  userId?: string;
  userRole?: string;
}

const ACCESS_LEVEL_CONFIG = {
  none: { color: 'text-gray-600 bg-gray-100', icon: Lock, priority: 0 },
  basic: { color: 'text-blue-600 bg-blue-100', icon: Users, priority: 1 },
  advanced: { color: 'text-green-600 bg-green-100', icon: Key, priority: 2 },
  admin: { color: 'text-orange-600 bg-orange-100', icon: Shield, priority: 3 },
  super_admin: { color: 'text-red-600 bg-red-100', icon: Crown, priority: 4 },
  system: { color: 'text-purple-600 bg-purple-100', icon: Settings, priority: 5 }
};

const STATUS_CONFIG = {
  active: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  inactive: { color: 'text-gray-600 bg-gray-100', icon: Clock },
  suspended: { color: 'text-red-600 bg-red-100', icon: XCircle },
  locked: { color: 'text-orange-600 bg-orange-100', icon: Lock },
  pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  deactivated: { color: 'text-gray-600 bg-gray-100', icon: UserMinus }
};

export const SystemAccessDashboard: React.FC<SystemAccessDashboardProps> = ({
  className = '',
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [_____userFilter, _____setUserFilter] = useState<AccessFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [accessLevelFilter, setAccessLevelFilter] = useState<SystemAccessLevel | 'all'>('all');

  // Load data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load users
      const filter: AccessFilter = {
        searchQuery: searchQuery || undefined,
        statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
        accessLevels: accessLevelFilter !== 'all' ? [accessLevelFilter] : undefined,
        includeInactive: true
      };
      
      const usersList = systemAccessManager.getUsers(filter);
      setUsers(usersList);

      // Load stats
      const statsData = systemAccessManager.getAccessStats();
      setStats(statsData);

      // Mock access requests - in real implementation, this would come from the service
      setAccessRequests([
        {
          id: 'req_001',
          requesterId: 'user_001',
          requesterName: 'John Doe',
          type: 'role_assignment',
          targetUserId: 'user_002',
          roleId: 'admin',
          businessJustification: 'Need admin access for project management',
          urgency: 'medium',
          status: 'pending',
          approvers: [{
            userId: 'admin_001',
            displayName: 'System Admin',
            order: 1,
            required: true,
            status: 'pending'
          }],
          requestedAt: new Date(),
          auditTrail: []
        }
      ]);

    } catch (error) {
      console.error('Failed to load system access data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // Mock user creation
    try {
      const _____newUser = await systemAccessManager.createUser({
        username: 'newuser',
        email: 'new@example.com',
        displayName: 'New User',
        status: 'pending',
        isActive: true,
        isVerified: false,
        profile: {
          timezone: 'UTC',
          language: 'en'
        },
        roles: [],
        permissions: [],
        systemAccess: 'basic',
        mfaEnabled: false,
        securityClearance: 'public'
      }, userId || 'admin');
      
      loadData();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleAssignRole = async (targetUserId: string, roleId: string) => {
    try {
      await systemAccessManager.assignRole(targetUserId, roleId, userId || 'admin');
      loadData();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleRevokeRole = async (targetUserId: string, roleId: string) => {
    try {
      await systemAccessManager.revokeRole(targetUserId, roleId, userId || 'admin');
      loadData();
    } catch (error) {
      console.error('Failed to revoke role:', error);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!user.username.toLowerCase().includes(query) &&
            !user.email.toLowerCase().includes(query) &&
            !user.displayName.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }
      
      if (accessLevelFilter !== 'all' && user.systemAccess !== accessLevelFilter) {
        return false;
      }
      
      return true;
    });
  }, [users, searchQuery, statusFilter, accessLevelFilter]);

  const renderUsersTab = () => (
    <div className="users-section">
      {/* Header Controls */}
      <div className="users-controls">
        <div className="search-filters">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="locked">Locked</option>
            <option value="pending">Pending</option>
          </Select>

          <Select
            value={accessLevelFilter}
            onValueChange={(value) => setAccessLevelFilter(value as SystemAccessLevel | 'all')}
          >
            <option value="all">All Access Levels</option>
            <option value="none">None</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="system">System</option>
          </Select>
        </div>

        <div className="action-buttons">
          <Button onClick={loadData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="users-grid">
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onSelect={setSelectedUser}
            onAssignRole={handleAssignRole}
            onRevokeRole={handleRevokeRole}
            currentUserId={userId}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new user.</p>
        </div>
      )}
    </div>
  );

  const renderAccessRequestsTab = () => (
    <div className="requests-section">
      <div className="requests-header">
        <h3 className="text-lg font-semibold">Pending Access Requests</h3>
        <Badge className="bg-yellow-100 text-yellow-800">
          {accessRequests.filter(r => r.status === 'pending').length} pending
        </Badge>
      </div>

      <div className="requests-list">
        {accessRequests.map(request => (
          <AccessRequestCard
            key={request.id}
            request={request}
            onApprove={(id) => console.log('Approve:', id)}
            onReject={(id) => console.log('Reject:', id)}
          />
        ))}
      </div>

      {accessRequests.length === 0 && (
        <div className="empty-state">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No access requests</h3>
          <p className="text-gray-500">All access requests have been processed.</p>
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => {
    if (!stats) return <div>Loading statistics...</div>;

    return (
      <div className="stats-section">
        <div className="stats-grid">
          <Card>
            <CardContent className="p-6">
              <div className="stat-item">
                <div className="stat-icon">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-change positive">+{stats.recentActivity.newUsers} this week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="stat-item">
                <div className="stat-icon">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Active Users</div>
                  <div className="stat-value">{stats.activeUsers}</div>
                  <div className="stat-description">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="stat-item">
                <div className="stat-icon">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Pending Requests</div>
                  <div className="stat-value">{stats.pendingRequests}</div>
                  <div className="stat-description">Awaiting approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="stat-item">
                <div className="stat-icon">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <div className="stat-info">
                  <div className="stat-label">MFA Enabled</div>
                  <div className="stat-value">{stats.compliance.mfaEnabled}</div>
                  <div className="stat-description">
                    {((stats.compliance.mfaEnabled / stats.totalUsers) * 100).toFixed(1)}% adoption
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="charts-section">
          <Card>
            <CardHeader>
              <CardTitle>Access Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="access-level-chart">
                {Object.entries(stats.byAccessLevel).map(([level, count]) => {
                  const config = ACCESS_LEVEL_CONFIG[level as SystemAccessLevel];
                  const percentage = (count / stats.totalUsers) * 100;
                  
                  return (
                    <div key={level} className="chart-item">
                      <div className="chart-label">
                        <config.icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                        <span>{level.replace('_', ' ')}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`chart-fill ${config.color.split(' ')[1]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="chart-value">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="status-chart">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const config = STATUS_CONFIG[status as UserStatus];
                  const percentage = (count / stats.totalUsers) * 100;
                  
                  return (
                    <div key={status} className="chart-item">
                      <div className="chart-label">
                        <config.icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                        <span>{status}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`chart-fill ${config.color.split(' ')[1]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="chart-value">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={`system-access-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-info">
          <h2>System Access Management</h2>
          <p>Manage user access, roles, permissions, and security controls</p>
        </div>
        
        <div className="header-actions">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users">
            Users
            <Badge className="ml-2 text-xs">{stats?.totalUsers || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            Access Requests
            {stats && stats.pendingRequests > 0 && (
              <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-800">
                {stats.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="tab-content">
          {renderUsersTab()}
        </TabsContent>

        <TabsContent value="requests" className="tab-content">
          {renderAccessRequestsTab()}
        </TabsContent>

        <TabsContent value="roles" className="tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Role management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="tab-content">
          {renderStatsTab()}
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadData}
          currentUserId={userId}
        />
      )}

      <style jsx>{`
        .system-access-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .users-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .search-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar .lucide {
          position: absolute;
          left: 0.75rem;
          z-index: 1;
        }

        .search-input {
          padding-left: 2.25rem;
          min-width: 300px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1rem;
        }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          padding: 0.75rem;
          border-radius: 8px;
          background: #f3f4f6;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-change.positive {
          color: #059669;
        }

        .stat-description {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .access-level-chart,
        .status-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chart-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .chart-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .chart-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .chart-value {
          min-width: 40px;
          text-align: right;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .requests-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .requests-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-state h3 {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .users-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// User Card Component
interface UserCardProps {
  user: SystemUser;
  onSelect: (user: SystemUser) => void;
  onAssignRole: (userId: string, roleId: string) => void;
  onRevokeRole: (userId: string, roleId: string) => void;
  currentUserId?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onSelect, 
  onAssignRole, 
  onRevokeRole, 
  currentUserId 
}) => {
  const statusConfig = STATUS_CONFIG[user.status];
  const accessConfig = ACCESS_LEVEL_CONFIG[user.systemAccess];
  const StatusIcon = statusConfig.icon;
  const AccessIcon = accessConfig.icon;

  return (
    <Card className="user-card">
      <CardContent className="p-4">
        <div className="user-card-header">
          <div className="user-info">
            <div className="user-name">{user.displayName}</div>
            <div className="user-email">{user.email}</div>
            <div className="user-username">@{user.username}</div>
          </div>
          <div className="user-badges">
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {user.status}
            </Badge>
            <Badge className={accessConfig.color}>
              <AccessIcon className="w-3 h-3 mr-1" />
              {user.systemAccess}
            </Badge>
            {user.mfaEnabled && (
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                MFA
              </Badge>
            )}
          </div>
        </div>

        <div className="user-details">
          <div className="detail-item">
            <span className="detail-label">Roles:</span>
            <span className="detail-value">
              {user.roles.length > 0 
                ? user.roles.map(r => r.roleName).join(', ')
                : 'No roles assigned'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Active:</span>
            <span className="detail-value">
              {user.lastActivityAt 
                ? user.lastActivityAt.toLocaleDateString()
                : 'Never'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {user.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="user-actions">
          <Button 
            onClick={() => onSelect(user)} 
            variant="outline" 
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            onClick={() => onAssignRole(user.id, 'admin')} 
            size="sm"
            disabled={user.roles.some(r => r.roleId === 'admin')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Role
          </Button>
        </div>
      </CardContent>

      <style jsx>{`
        .user-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .user-email {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .user-username {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .user-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #1f2937;
          text-align: right;
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </Card>
  );
};

// Access Request Card Component
interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const AccessRequestCard: React.FC<AccessRequestCardProps> = ({
  request,
  onApprove,
  onReject
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="request-card">
      <CardContent className="p-4">
        <div className="request-header">
          <div className="request-info">
            <div className="request-title">
              {request.type.replace('_', ' ').toUpperCase()} Request
            </div>
            <div className="request-requester">
              From: {request.requesterName}
            </div>
            <div className="request-time">
              {new Date(request.requestedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="request-badges">
            <Badge className={getUrgencyColor(request.urgency)}>
              {request.urgency.toUpperCase()}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              {request.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="request-details">
          <p className="request-justification">
            <strong>Justification:</strong> {request.businessJustification}
          </p>
          {request.targetUserId && (
            <p className="request-target">
              <strong>Target User:</strong> {request.targetUserId}
            </p>
          )}
          {request.roleId && (
            <p className="request-role">
              <strong>Requested Role:</strong> {request.roleId}
            </p>
          )}
        </div>

        <div className="request-actions">
          <Button 
            onClick={() => onApprove(request.id)}
            size="sm"
            className="approve-btn"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button 
            onClick={() => onReject(request.id)}
            size="sm"
            variant="outline"
            className="reject-btn"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </CardContent>

      <style jsx>{`
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .request-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .request-requester,
        .request-time {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .request-badges {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
        }

        .request-details {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .request-details p {
          margin-bottom: 0.5rem;
        }

        .request-details p:last-child {
          margin-bottom: 0;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .approve-btn {
          background: #059669;
          border-color: #059669;
        }

        .approve-btn:hover {
          background: #047857;
          border-color: #047857;
        }

        .reject-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .reject-btn:hover {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </Card>
  );
};

// User Detail Modal Component
interface UserDetailModalProps {
  user: SystemUser;
  onClose: () => void;
  onUpdate: () => void;
  currentUserId?: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onUpdate,
  currentUserId
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>User Details: {user.displayName}</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            ✕
          </Button>
        </div>

        <div className="modal-body">
          <div className="user-details-grid">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-item">
                <label>Display Name:</label>
                <span>{user.displayName}</span>
              </div>
              <div className="detail-item">
                <label>Username:</label>
                <span>{user.username}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <Badge className={STATUS_CONFIG[user.status].color}>
                  {user.status}
                </Badge>
              </div>
            </div>

            <div className="detail-section">
              <h3>Access Control</h3>
              <div className="detail-item">
                <label>System Access:</label>
                <Badge className={ACCESS_LEVEL_CONFIG[user.systemAccess].color}>
                  {user.systemAccess}
                </Badge>
              </div>
              <div className="detail-item">
                <label>Security Clearance:</label>
                <span>{user.securityClearance}</span>
              </div>
              <div className="detail-item">
                <label>MFA Enabled:</label>
                <Badge className={user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {user.mfaEnabled ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            <div className="detail-section">
              <h3>Roles</h3>
              <div className="roles-list">
                {user.roles.map(role => (
                  <div key={role.id} className="role-item">
                    <span>{role.roleName}</span>
                    <span className="role-date">
                      Assigned: {role.assignedAt.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>Activity</h3>
              <div className="detail-item">
                <label>Last Login:</label>
                <span>
                  {user.lastLoginAt 
                    ? user.lastLoginAt.toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="detail-item">
                <label>Last Activity:</label>
                <span>
                  {user.lastActivityAt 
                    ? user.lastActivityAt.toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{user.createdAt.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={() => { onUpdate(); onClose(); }}>
            Edit User
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90vw;
          max-width: 800px;
          max-height: 80vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .user-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .detail-item label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-item span {
          color: #1f2937;
        }

        .roles-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .role-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .role-date {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .user-details-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemAccessDashboard;