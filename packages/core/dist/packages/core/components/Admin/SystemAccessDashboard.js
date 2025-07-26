import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * System Access Management Dashboard - Epic 17
 *
 * Comprehensive admin interface for managing system access, user roles,
 * permissions, and access requests with RBAC controls.
 *
 * Task: E17-1753114397018-1B4251 - Add system access management
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Users, Shield, Key, Clock, CheckCircle, XCircle, Plus, Search, Download, Settings, Eye, UserPlus, UserMinus, RefreshCw, Lock, Crown, Activity } from 'lucide-react';
import { systemAccessManager } from '../../services/SystemAccessManager';
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
export const SystemAccessDashboard = ({ className = '', userId, userRole }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Filters
    const [_____userFilter, _____setUserFilter] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accessLevelFilter, setAccessLevelFilter] = useState('all');
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
            const filter = {
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
        }
        catch (error) {
            console.error('Failed to load system access data:', error);
        }
        finally {
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
        }
        catch (error) {
            console.error('Failed to create user:', error);
        }
    };
    const handleAssignRole = async (targetUserId, roleId) => {
        try {
            await systemAccessManager.assignRole(targetUserId, roleId, userId || 'admin');
            loadData();
        }
        catch (error) {
            console.error('Failed to assign role:', error);
        }
    };
    const handleRevokeRole = async (targetUserId, roleId) => {
        try {
            await systemAccessManager.revokeRole(targetUserId, roleId, userId || 'admin');
            loadData();
        }
        catch (error) {
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
    const renderUsersTab = () => (_jsxs("div", { className: "users-section", children: [_jsxs("div", { className: "users-controls", children: [_jsxs("div", { className: "search-filters", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx(Input, { placeholder: "Search users...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "suspended", children: "Suspended" }), _jsx("option", { value: "locked", children: "Locked" }), _jsx("option", { value: "pending", children: "Pending" })] }), _jsxs(Select, { value: accessLevelFilter, onValueChange: (value) => setAccessLevelFilter(value), children: [_jsx("option", { value: "all", children: "All Access Levels" }), _jsx("option", { value: "none", children: "None" }), _jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "super_admin", children: "Super Admin" }), _jsx("option", { value: "system", children: "System" })] })] }), _jsxs("div", { className: "action-buttons", children: [_jsxs(Button, { onClick: loadData, disabled: isLoading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] }), _jsxs(Button, { onClick: handleCreateUser, children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), "Add User"] })] })] }), _jsx("div", { className: "users-grid", children: filteredUsers.map(user => (_jsx(UserCard, { user: user, onSelect: setSelectedUser, onAssignRole: handleAssignRole, onRevokeRole: handleRevokeRole, currentUserId: userId }, user.id))) }), filteredUsers.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx(Users, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No users found" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your filters or create a new user." })] }))] }));
    const renderAccessRequestsTab = () => (_jsxs("div", { className: "requests-section", children: [_jsxs("div", { className: "requests-header", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Pending Access Requests" }), _jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: [accessRequests.filter(r => r.status === 'pending').length, " pending"] })] }), _jsx("div", { className: "requests-list", children: accessRequests.map(request => (_jsx(AccessRequestCard, { request: request, onApprove: (id) => console.log('Approve:', id), onReject: (id) => console.log('Reject:', id) }, request.id))) }), accessRequests.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx(Clock, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No access requests" }), _jsx("p", { className: "text-gray-500", children: "All access requests have been processed." })] }))] }));
    const renderStatsTab = () => {
        if (!stats)
            return _jsx("div", { children: "Loading statistics..." });
        return (_jsxs("div", { className: "stats-section", children: [_jsxs("div", { className: "stats-grid", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Users, { className: "w-8 h-8 text-blue-600" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-label", children: "Total Users" }), _jsx("div", { className: "stat-value", children: stats.totalUsers }), _jsxs("div", { className: "stat-change positive", children: ["+", stats.recentActivity.newUsers, " this week"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Activity, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-label", children: "Active Users" }), _jsx("div", { className: "stat-value", children: stats.activeUsers }), _jsxs("div", { className: "stat-description", children: [((stats.activeUsers / stats.totalUsers) * 100).toFixed(1), "% of total"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Clock, { className: "w-8 h-8 text-yellow-600" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-label", children: "Pending Requests" }), _jsx("div", { className: "stat-value", children: stats.pendingRequests }), _jsx("div", { className: "stat-description", children: "Awaiting approval" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Shield, { className: "w-8 h-8 text-purple-600" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-label", children: "MFA Enabled" }), _jsx("div", { className: "stat-value", children: stats.compliance.mfaEnabled }), _jsxs("div", { className: "stat-description", children: [((stats.compliance.mfaEnabled / stats.totalUsers) * 100).toFixed(1), "% adoption"] })] })] }) }) })] }), _jsxs("div", { className: "charts-section", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Access Level Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "access-level-chart", children: Object.entries(stats.byAccessLevel).map(([level, count]) => {
                                            const config = ACCESS_LEVEL_CONFIG[level];
                                            const percentage = (count / stats.totalUsers) * 100;
                                            return (_jsxs("div", { className: "chart-item", children: [_jsxs("div", { className: "chart-label", children: [_jsx(config.icon, { className: `w-4 h-4 ${config.color.split(' ')[0]}` }), _jsx("span", { children: level.replace('_', ' ') })] }), _jsx("div", { className: "chart-bar", children: _jsx("div", { className: `chart-fill ${config.color.split(' ')[1]}`, style: { width: `${percentage}%` } }) }), _jsx("div", { className: "chart-value", children: count })] }, level));
                                        }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "User Status Breakdown" }) }), _jsx(CardContent, { children: _jsx("div", { className: "status-chart", children: Object.entries(stats.byStatus).map(([status, count]) => {
                                            const config = STATUS_CONFIG[status];
                                            const percentage = (count / stats.totalUsers) * 100;
                                            return (_jsxs("div", { className: "chart-item", children: [_jsxs("div", { className: "chart-label", children: [_jsx(config.icon, { className: `w-4 h-4 ${config.color.split(' ')[0]}` }), _jsx("span", { children: status })] }), _jsx("div", { className: "chart-bar", children: _jsx("div", { className: `chart-fill ${config.color.split(' ')[1]}`, style: { width: `${percentage}%` } }) }), _jsx("div", { className: "chart-value", children: count })] }, status));
                                        }) }) })] })] })] }));
    };
    return (_jsxs("div", { className: `system-access-dashboard ${className}`, children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "System Access Management" }), _jsx("p", { children: "Manage user access, roles, permissions, and security controls" })] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsxs(TabsTrigger, { value: "users", children: ["Users", _jsx(Badge, { className: "ml-2 text-xs", children: stats?.totalUsers || 0 })] }), _jsxs(TabsTrigger, { value: "requests", children: ["Access Requests", stats && stats.pendingRequests > 0 && (_jsx(Badge, { className: "ml-2 text-xs bg-yellow-100 text-yellow-800", children: stats.pendingRequests }))] }), _jsx(TabsTrigger, { value: "roles", children: "Roles" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "users", className: "tab-content", children: renderUsersTab() }), _jsx(TabsContent, { value: "requests", className: "tab-content", children: renderAccessRequestsTab() }), _jsx(TabsContent, { value: "roles", className: "tab-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Role Management" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Role management interface coming soon..." }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "tab-content", children: renderStatsTab() })] }), selectedUser && (_jsx(UserDetailModal, { user: selectedUser, onClose: () => setSelectedUser(null), onUpdate: loadData, currentUserId: userId })), _jsx("style", { children: `
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
      ` })] }));
};
const UserCard = ({ user, onSelect, onAssignRole, onRevokeRole, currentUserId }) => {
    const statusConfig = STATUS_CONFIG[user.status];
    const accessConfig = ACCESS_LEVEL_CONFIG[user.systemAccess];
    const StatusIcon = statusConfig.icon;
    const AccessIcon = accessConfig.icon;
    return (_jsxs(Card, { className: "user-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "user-card-header", children: [_jsxs("div", { className: "user-info", children: [_jsx("div", { className: "user-name", children: user.displayName }), _jsx("div", { className: "user-email", children: user.email }), _jsxs("div", { className: "user-username", children: ["@", user.username] })] }), _jsxs("div", { className: "user-badges", children: [_jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-3 h-3 mr-1" }), user.status] }), _jsxs(Badge, { className: accessConfig.color, children: [_jsx(AccessIcon, { className: "w-3 h-3 mr-1" }), user.systemAccess] }), user.mfaEnabled && (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(Shield, { className: "w-3 h-3 mr-1" }), "MFA"] }))] })] }), _jsxs("div", { className: "user-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Roles:" }), _jsx("span", { className: "detail-value", children: user.roles.length > 0
                                            ? user.roles.map(r => r.roleName).join(', ')
                                            : 'No roles assigned' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Last Active:" }), _jsx("span", { className: "detail-value", children: user.lastActivityAt
                                            ? user.lastActivityAt.toLocaleDateString()
                                            : 'Never' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Created:" }), _jsx("span", { className: "detail-value", children: user.createdAt.toLocaleDateString() })] })] }), _jsxs("div", { className: "user-actions", children: [_jsxs(Button, { onClick: () => onSelect(user), variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View"] }), _jsxs(Button, { onClick: () => onAssignRole(user.id, 'admin'), size: "sm", disabled: user.roles.some(r => r.roleId === 'admin'), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Role"] })] })] }), _jsx("style", { children: `
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
      ` })] }));
};
const AccessRequestCard = ({ request, onApprove, onReject }) => {
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    return (_jsxs(Card, { className: "request-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "request-header", children: [_jsxs("div", { className: "request-info", children: [_jsxs("div", { className: "request-title", children: [request.type.replace('_', ' ').toUpperCase(), " Request"] }), _jsxs("div", { className: "request-requester", children: ["From: ", request.requesterName] }), _jsx("div", { className: "request-time", children: new Date(request.requestedAt).toLocaleDateString() })] }), _jsxs("div", { className: "request-badges", children: [_jsx(Badge, { className: getUrgencyColor(request.urgency), children: request.urgency.toUpperCase() }), _jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: request.status.toUpperCase() })] })] }), _jsxs("div", { className: "request-details", children: [_jsxs("p", { className: "request-justification", children: [_jsx("strong", { children: "Justification:" }), " ", request.businessJustification] }), request.targetUserId && (_jsxs("p", { className: "request-target", children: [_jsx("strong", { children: "Target User:" }), " ", request.targetUserId] })), request.roleId && (_jsxs("p", { className: "request-role", children: [_jsx("strong", { children: "Requested Role:" }), " ", request.roleId] }))] }), _jsxs("div", { className: "request-actions", children: [_jsxs(Button, { onClick: () => onApprove(request.id), size: "sm", className: "approve-btn", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Approve"] }), _jsxs(Button, { onClick: () => onReject(request.id), size: "sm", variant: "outline", className: "reject-btn", children: [_jsx(XCircle, { className: "w-4 h-4 mr-1" }), "Reject"] })] })] }), _jsx("style", { children: `
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
      ` })] }));
};
const UserDetailModal = ({ user, onClose, onUpdate, currentUserId }) => {
    return (_jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h2", { children: ["User Details: ", user.displayName] }), _jsx(Button, { onClick: onClose, variant: "outline", size: "sm", children: "\u2715" })] }), _jsx("div", { className: "modal-body", children: _jsxs("div", { className: "user-details-grid", children: [_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Basic Information" }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Display Name:" }), _jsx("span", { children: user.displayName })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Username:" }), _jsx("span", { children: user.username })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Email:" }), _jsx("span", { children: user.email })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Status:" }), _jsx(Badge, { className: STATUS_CONFIG[user.status].color, children: user.status })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Access Control" }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "System Access:" }), _jsx(Badge, { className: ACCESS_LEVEL_CONFIG[user.systemAccess].color, children: user.systemAccess })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Security Clearance:" }), _jsx("span", { children: user.securityClearance })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "MFA Enabled:" }), _jsx(Badge, { className: user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', children: user.mfaEnabled ? 'Yes' : 'No' })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Roles" }), _jsx("div", { className: "roles-list", children: user.roles.map(role => (_jsxs("div", { className: "role-item", children: [_jsx("span", { children: role.roleName }), _jsxs("span", { className: "role-date", children: ["Assigned: ", role.assignedAt.toLocaleDateString()] })] }, role.id))) })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Activity" }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Last Login:" }), _jsx("span", { children: user.lastLoginAt
                                                        ? user.lastLoginAt.toLocaleString()
                                                        : 'Never' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Last Activity:" }), _jsx("span", { children: user.lastActivityAt
                                                        ? user.lastActivityAt.toLocaleString()
                                                        : 'Never' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Created:" }), _jsx("span", { children: user.createdAt.toLocaleString() })] })] })] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { onClick: onClose, variant: "outline", children: "Close" }), _jsx(Button, { onClick: () => { onUpdate(); onClose(); }, children: "Edit User" })] })] }), _jsx("style", { children: `
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
      ` })] }));
};
export default SystemAccessDashboard;
