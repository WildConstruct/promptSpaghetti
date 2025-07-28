/**
 * User Management Dashboard Component
 * 
 * Epic 17.3 - User & Permission Management Dashboard
 * Task: E17-1753114397001-C8C856 - Implement user listing
 * 
 * Comprehensive user listing interface with search, filtering, bulk operations,
 * and detailed user management capabilities for the Backstage Admin Controls system.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, UserPlus, Download, RefreshCw, 
  MoreVertical, User, Shield, Clock,
  ChevronLeft, ChevronRight, Grid, List,
  Users, MapPin
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  department?: string;
  location?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  permissions?: string[];
  teams?: string[];
}
interface UserFilters {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  departmentFilter: string;
  locationFilter: string;
}
interface UserManagementState {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  selectedUsers: Set<string>;
  viewMode: 'table' | 'cards';
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showBulkActions: boolean;
  showAdvancedFilters: boolean;
}
const UserManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: currentUser } = useAuthStore();
  // State management
  const [state, setState] = useState<UserManagementState>({)
    users: [],
    loading: true,
    error: null,
    filters: {,
      searchTerm: '',
      roleFilter: '',
      statusFilter: '',
      departmentFilter: '',
      locationFilter: '',
    },
    selectedUsers: new Set<string>(),
    viewMode: 'table',
    currentPage: 1,
    pageSize: 25,
    sortBy: 'name',
    sortOrder: 'asc',
    showBulkActions: false,
    showAdvancedFilters: false,
  });
  // Mock data for demonstration - wrapped in useMemo to prevent recreation
  const mockUsers: User[] = useMemo(() => [
    {
      id: 'user-1',
      name: 'John Smith',
      email: 'j.smith@company.com',
      firstName: 'John',
      lastName: 'Smith',
      displayName: 'John Smith',
      role: 'Administrator',
      department: 'IT Security',
      location: 'New York',
      status: 'active',
      lastLogin: '2025-07-22T16:30:00Z',
      createdAt: '2022-01-15T10:00:00Z',
      permissions: ['admin', 'user-management'],
      teams: ['Engineering', 'DevOps']
    },
    {
      id: 'user-2', 
      name: 'Maria Davis',
      email: 'm.davis@company.com',
      firstName: 'Maria',
      lastName: 'Davis',
      displayName: 'Maria Davis',
      role: 'Project Manager',
      department: 'Engineering',
      location: 'San Francisco',
      status: 'active',
      lastLogin: '2025-07-22T18:45:00Z',
      createdAt: '2023-03-10T14:30:00Z',
      permissions: ['project-management'],
      teams: ['Engineering'],
    },
    {
      id: 'user-3',
      name: 'Robert Johnson',
      email: 'r.johnson@company.com',
      firstName: 'Robert',
      lastName: 'Johnson',
      displayName: 'Robert Johnson',
      role: 'Developer',
      department: 'Engineering',
      location: 'Remote',
      status: 'pending',
      createdAt: '2025-07-20T09:15:00Z',
      permissions: ['developer'],
      teams: ['Engineering'],
    },
    {
      id: 'user-4',
      name: 'Lisa Wilson',
      email: 'l.wilson@company.com',
      firstName: 'Lisa',
      lastName: 'Wilson',
      displayName: 'Lisa Wilson',
      role: 'Designer',
      department: 'Design',
      location: 'New York',
      status: 'suspended',
      lastLogin: '2025-07-15T12:00:00Z',
      createdAt: '2023-08-22T11:45:00Z',
      permissions: ['designer'],
      teams: ['Design'],
    },
    {
      id: 'user-5',
      name: 'Alex Chen',
      email: 'a.chen@company.com',
      firstName: 'Alex',
      lastName: 'Chen',
      displayName: 'Alex Chen',
      role: 'QA Engineer',
      department: 'Engineering',
      location: 'San Francisco',
      status: 'active',
      lastLogin: '2025-07-22T17:20:00Z',
      createdAt: '2023-11-05T16:00:00Z',
      permissions: ['qa'],
      teams: ['Engineering', 'QA']
    }
  ], []); // Empty dependency array since this is static mock data
  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setState(prev => ({ )
          ...prev, 
          users: mockUsers, 
          loading: false ,
        }));
      } catch {
        setState(prev => ({ )
          ...prev, 
          error: 'Failed to load users', 
          loading: false ,
        }));
      }
    };
    loadUsers();
  }, [mockUsers]);
  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = state.users.filter(user => {)
      const searchMatch = !state.filters.searchTerm || ;
        user.name.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(state.filters.searchTerm.toLowerCase());
      const roleMatch = !state.filters.roleFilter || user.role === state.filters.roleFilter;
      const statusMatch = !state.filters.statusFilter || user.status === state.filters.statusFilter;
      const deptMatch = !state.filters.departmentFilter || user.department === state.filters.departmentFilter;
      const locationMatch = !state.filters.locationFilter || user.location === state.filters.locationFilter;
      return searchMatch && roleMatch && statusMatch && deptMatch && locationMatch;
    });
    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[state.sortBy as keyof User] as string;
      const bValue = b[state.sortBy as keyof User] as string;
      if (state.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    return filtered;
  }, [state.users, state.filters, state.sortBy, state.sortOrder]);
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / state.pageSize);
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + state.pageSize);
  // Event handlers
  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setState(prev => ({)
      ...prev,
      filters: { ...prev.filters, [key]: value },
      currentPage: 1 // Reset to first page when filtering,
    }));
  };
  const handleSort = (field: string) => {
    setState(prev => ({)
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };
  const handleSelectUser = (userId: string) => {
    setState(prev => {)
      const newSelected = new Set(prev.selectedUsers);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return {
        ...prev,
        selectedUsers: newSelected,
        showBulkActions: newSelected.size > 0,
      };
    });
  };
  const handleSelectAll = () => {
    setState(prev => {)
      const allSelected = prev.selectedUsers.size === paginatedUsers.length;
      const newSelected = allSelected ? new Set<string>() : new Set(paginatedUsers.map(u => u.id));
      return {
        ...prev,
        selectedUsers: newSelected,
        showBulkActions: newSelected.size > 0,
      };
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'active': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'suspended': return '#ef4444';
    case 'inactive': return '#6b7280';
    default: return '#9ca3af';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
    case 'active': return '🟢';
    case 'pending': return '🟡';
    case 'suspended': return '🔴';
    case 'inactive': return '⚪';
    default: return '⚫';
    }
  };
  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;}
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleDateString();
  };
  // Get unique values for filters
  const uniqueRoles = [...new Set(state.users.map(u => u.role))];
  const uniqueDepartments = [...new Set(state.users.map(u => u.department).filter(Boolean))];
  const uniqueLocations = [...new Set(state.users.map(u => u.location).filter(Boolean))];
  if (state.loading) {
    return ()
      <div className="user-management-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: '#6b7280' }}>Loading user directory...</p>
      </div>
    );
  }
  return ()
    <div className="user-management-dashboard" style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0',
            }}>
              👥 User Management Dashboard
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
            }}>
              Manage users, roles, and permissions • Total: {state.users.length} users
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
            >
              <ChevronLeft size={16} />
              Back to App
            </button>
          </div>
        </div>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
        }}>
          {[
            { 
              label: 'Total Users', 
              value: state.users.length, 
              icon: '👥',
              change: '+23 this week',
            },
            { 
              label: 'Active Users', 
              value: state.users.filter(u => u.status === 'active').length,
              icon: '✅',
              change: '87.3% online',
            },
            { 
              label: 'Pending', 
              value: state.users.filter(u => u.status === 'pending').length,
              icon: '🔄',
              change: 'Verification',
            },
            { 
              label: 'Issues', 
              value: state.users.filter(u => u.status === 'suspended').length,
              icon: '⚠️',
              change: 'Violations',
            }
          ].map((stat, index) => ()
            <div key={index} style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {stat.icon}
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#111827',
                marginBottom: '2px' ,
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                marginBottom: '2px' ,
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Filters and Actions */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
      }}>
        {/* Search and Primary Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '300px', flex: '1' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search users, emails, departments..."
              value={state.filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
          {/* Role Filter */}
          <select
            value={state.filters.roleFilter}
            onChange={(e) => handleFilterChange('roleFilter', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              minWidth: '120px',
            }}
          >
            <option value="">All Roles</option>
            {uniqueRoles.map(role => ()
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {/* Status Filter */}
          <select
            value={state.filters.statusFilter}
            onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              minWidth: '120px',
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setState(prev => ({)
              ...prev, 
              showAdvancedFilters: !prev.showAdvancedFilters,
            }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: state.showAdvancedFilters ? '#3b82f6' : '#f3f4f6',
              color: state.showAdvancedFilters ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <Filter size={16} />
            Advanced
          </button>
        </div>
        {/* Advanced Filters Panel */}
        {state.showAdvancedFilters && ()
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '16px',
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}>
                  Department
                </label>
                <select
                  value={state.filters.departmentFilter}
                  onChange={(e) => handleFilterChange('departmentFilter', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map(dept => ()
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}>
                  Location
                </label>
                <select
                  value={state.filters.locationFilter}
                  onChange={(e) => handleFilterChange('locationFilter', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => ()
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setState(prev => ({)
                  ...prev,
                  filters: {,
                    searchTerm: '',
                    roleFilter: '',
                    statusFilter: '',
                    departmentFilter: '',
                    locationFilter: '',
                  },
                  currentPage: 1,
                }))}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <UserPlus size={16} />
              Add User
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <Download size={16} />
              Export
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <RefreshCw size={16} />
              Sync Directory
            </button>
          </div>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setState(prev => ({ ...prev, viewMode: 'table' }))}
              style={{
                padding: '8px 12px',
                backgroundColor: state.viewMode === 'table' ? '#3b82f6' : '#f3f4f6',
                color: state.viewMode === 'table' ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, viewMode: 'cards' }))}
              style={{
                padding: '8px 12px',
                backgroundColor: state.viewMode === 'cards' ? '#3b82f6' : '#f3f4f6',
                color: state.viewMode === 'cards' ? '#ffffff' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <Grid size={14} />
            </button>
          </div>
        </div>
      </div>
      {/* Bulk Actions Panel */}
      {state.showBulkActions && ()
        <div style={{
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <strong>{state.selectedUsers.size} users selected</strong>
            <span style={{ opacity: 0.9, marginLeft: '8px' }}>
              Choose an action to apply to all selected users
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Update Status
            </button>
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Send Email
            </button>
            <button
              onClick={() => setState(prev => ({ )
                ...prev, 
                selectedUsers: new Set(), 
                showBulkActions: false ,
              }))}
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(239,68,68,0.8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* User List */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
          }}>
            User Directory ({filteredAndSortedUsers.length} users)
          </h3>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {startIndex + 1}-{Math.min()
              startIndex + state.pageSize,
              filteredAndSortedUsers.length
            )} of {filteredAndSortedUsers.length}
          </div>
        </div>
        {/* Table View */}
        {state.viewMode === 'table' && ()
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    borderBottom: '1px solid #e5e7eb',
                    width: '40px',
                  }}>
                    <input
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && state.selectedUsers.size === paginatedUsers.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  {[
                    { key: 'name', label: 'User', sortable: true },
                    { key: 'role', label: 'Role', sortable: true },
                    { key: 'department', label: 'Department', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'lastLogin', label: 'Last Login', sortable: true },
                    { key: 'actions', label: 'Actions', sortable: false }
                  ].map(column => ()
                    <th
                      key={column.key}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: column.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {column.label}
                        {column.sortable && state.sortBy === column.key && ()
                          <span style={{ fontSize: '10px' }}>
                            {state.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => ()
                  <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px' }}>
                      <input
                        type="checkbox"
                        checked={state.selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#111827' ,
                          }}>
                            {user.name}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280' ,
                          }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                      {user.role}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                      {user.department || '-'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(user.status)}20`,}
                        color: getStatusColor(user.status),
                      }}>
                        {getStatusIcon(user.status)}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                      {formatLastLogin(user.lastLogin)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#6b7280',
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Cards View */}
        {state.viewMode === 'cards' && ()
          <div style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {paginatedUsers.map(user => ()
              <div
                key={user.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                }}>
                  <input
                    type="checkbox"
                    checked={state.selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: '0 auto 12px',
                  }}>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0',
                  }}>
                    {user.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 8px 0',
                  }}>
                    {user.email}
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: `${getStatusColor(user.status)}20`,}
                    color: getStatusColor(user.status),
                  }}>
                    {getStatusIcon(user.status)}
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={14} style={{ color: '#6b7280' }} />
                    <span>{user.role}</span>
                  </div>
                  {user.department && ()
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} style={{ color: '#6b7280' }} />
                      <span>{user.department}</span>
                    </div>
                  )}
                  {user.location && ()
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ color: '#6b7280' }} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: '#6b7280' }} />
                    <span>Last: {formatLastLogin(user.lastLogin)}</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    style={{
                      flex: '1',
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    style={{
                      flex: '1',
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && ()
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', color: '#374151' }}>
                Show:
              </label>
              <select
                value={state.pageSize}
                onChange={(e) => setState(prev => ({)
                  ...prev,
                  pageSize: parseInt(e.target.value),
                  currentPage: 1,
                }))}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>per page</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setState(prev => ({ )
                  ...prev, 
                  currentPage: Math.max(1, prev.currentPage - 1) 
                }))}
                disabled={state.currentPage <= 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: state.currentPage <= 1 ? '#f9fafb' : '#ffffff',
                  color: state.currentPage <= 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: state.currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span style={{ 
                fontSize: '14px', 
                color: '#374151',
                padding: '0 16px',
              }}>
                Page {state.currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setState(prev => ({ )
                  ...prev, 
                  currentPage: Math.min(totalPages, prev.currentPage + 1) 
                }))}
                disabled={state.currentPage >= totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: state.currentPage >= totalPages ? '#f9fafb' : '#ffffff',
                  color: state.currentPage >= totalPages ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: state.currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Loading Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserManagementDashboard;