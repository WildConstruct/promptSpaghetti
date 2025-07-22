/**
 * User Profile Detail Component
 * 
 * Epic 17.3 - User & Permission Management Dashboard
 * Task: E17-1753114397007-F6384C - Develop user profiles
 * 
 * Comprehensive user profile detail interface with tabbed sections for profile,
 * permissions, activity, team assignments, settings, and security management.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Shield, Activity, Users, Settings, Lock,
  Edit, Mail, Phone, Calendar, MapPin, Building, Clock,
  CheckCircle, AlertCircle, XCircle, MoreVertical, Key,
  Download, RefreshCw, Trash2, UserCheck
} from 'lucide-react';

// Types
interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  manager?: string;
  employeeId: string;
  location: string;
  timeZone: string;
  startDate: string;
  employmentType: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  roles: string[];
  permissions: string[];
  teams: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  mfaEnabled: boolean;
  sessionCount: number;
  passwordLastChanged?: string;
}

interface ActivityLog {
  id: string;
  type: 'login' | 'logout' | 'permission_change' | 'profile_update' | 'password_reset';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

interface TeamMembership {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
  memberCount: number;
  department: string;
}

const UserProfileDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'activity' | 'team' | 'settings' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);

  // Mock data for demonstration
  const mockUser: UserProfile = {
    id: userId || 'user-1',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    email: 'j.smith@company.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Administrator',
    department: 'IT Security',
    manager: 'Sarah Johnson',
    employeeId: 'EMP-001247',
    location: 'New York - Office 4B',
    timeZone: 'EST (UTC-5)',
    startDate: '2022-01-15',
    employmentType: 'Full-time',
    status: 'active',
    roles: ['Administrator', 'Team Lead - Engineering', 'DevOps Specialist'],
    permissions: ['admin', 'user-management', 'project-management', 'system-config'],
    teams: ['Engineering', 'DevOps', 'Security Committee'],
    lastLogin: '2025-07-22T16:30:00Z',
    createdAt: '2022-01-15T10:00:00Z',
    updatedAt: '2025-07-22T18:30:00Z',
    mfaEnabled: true,
    sessionCount: 1,
    passwordLastChanged: '2024-12-15T14:20:00Z'
  };

  const mockActivityLog: ActivityLog[] = [
    {
      id: '1',
      type: 'login',
      description: 'Successful login from 192.168.1.45',
      timestamp: '2025-07-22T16:30:00Z',
      ipAddress: '192.168.1.45',
      location: 'New York, NY'
    },
    {
      id: '2',
      type: 'profile_update',
      description: 'Modified user profile for maria.davis@company.com',
      timestamp: '2025-07-22T15:30:00Z'
    },
    {
      id: '3',
      type: 'permission_change',
      description: 'Granted "Project Manager" role to robert.johnson@company.com',
      timestamp: '2025-07-22T13:30:00Z'
    }
  ];

  const mockTeamMemberships: TeamMembership[] = [
    {
      id: '1',
      name: 'Engineering Team',
      role: 'Team Lead',
      joinedAt: '2022-01-15',
      memberCount: 12,
      department: 'Engineering'
    },
    {
      id: '2',
      name: 'DevOps Core Team',
      role: 'Senior Member',
      joinedAt: '2023-06-05',
      memberCount: 6,
      department: 'Operations'
    },
    {
      id: '3',
      name: 'Security Committee',
      role: 'Member',
      joinedAt: '2024-03-01',
      memberCount: 8,
      department: 'Cross-functional'
    }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(mockUser);
        setActivityLog(mockActivityLog);
        setTeamMemberships(mockTeamMemberships);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

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
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'suspended': return <XCircle size={16} />;
      case 'inactive': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280' }}>Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <XCircle size={48} style={{ color: '#ef4444' }} />
        <p style={{ color: '#6b7280' }}>User not found</p>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Back to User List
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/admin/users')}
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
              color: '#374151'
            }}
          >
            <ArrowLeft size={16} />
            Back to User List
          </button>
          
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            🔄 Last updated: 2 minutes ago
          </div>
        </div>

        {/* User Header Card */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {/* Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '600'
            }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            
            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  {user.name}
                </h1>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: `${getStatusColor(user.status)}20`,
                  color: getStatusColor(user.status)
                }}>
                  {getStatusIcon(user.status)}
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </div>
                
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#dc262620',
                  color: '#dc2626'
                }}>
                  🔒 Admin
                </div>
              </div>
              
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {user.jobTitle}
              </p>
              
              <p style={{
                fontSize: '14px',
                color: '#9ca3af',
                margin: '0 0 8px 0'
              }}>
                {user.email} • Employee ID: {user.employeeId}
              </p>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Edit size={14} />
                Edit
              </button>
              
              <button
                style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          
          {/* Quick Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {[
              { icon: <Users size={16} />, label: 'Teams', value: user.teams.join(', ') },
              { icon: <Building size={16} />, label: 'Department', value: user.department },
              { icon: <MapPin size={16} />, label: 'Location', value: user.location },
              { icon: <Calendar size={16} />, label: 'Joined', value: formatDate(user.createdAt) }
            ].map((info, index) => (
              <div key={index} style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                  {info.icon}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  {info.label}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  {info.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { icon: <Lock size={14} />, label: 'Suspend', color: '#ef4444' },
              { icon: <RefreshCw size={14} />, label: 'Reset Password', color: '#f59e0b' },
              { icon: <Mail size={14} />, label: 'Send Email', color: '#3b82f6' },
              { icon: <Key size={14} />, label: 'Edit Permissions', color: '#8b5cf6' }
            ].map((action, index) => (
              <button
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: `${action.color}20`,
                  color: action.color,
                  border: `1px solid ${action.color}40`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {[
            { id: 'profile', label: 'Profile', icon: <User size={16} /> },
            { id: 'permissions', label: 'Permissions', icon: <Shield size={16} /> },
            { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
            { id: 'team', label: 'Team', icon: <Users size={16} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
            { id: 'security', label: 'Security', icon: <Lock size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                📋 Profile Information
              </h2>
              
              {/* Personal Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Personal Information
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Edit size={12} />
                    Edit Section
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Display Name', value: user.displayName },
                    { label: 'Preferred Name', value: user.firstName },
                    { label: 'Email Address', value: user.email },
                    { label: 'Phone Number', value: user.phone || 'Not set' },
                    { label: 'Time Zone', value: user.timeZone }
                  ].map((field, index) => (
                    <div key={index}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {field.label}
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Employment Information
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Edit size={12} />
                    Edit Section
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {[
                    { label: 'Job Title', value: user.jobTitle },
                    { label: 'Department', value: user.department },
                    { label: 'Manager', value: user.manager || 'Not assigned' },
                    { label: 'Employee ID', value: user.employeeId },
                    { label: 'Start Date', value: formatDate(user.startDate) },
                    { label: 'Employment Type', value: user.employmentType },
                    { label: 'Office Location', value: user.location },
                    { label: 'Remote Work', value: '2 days/week' },
                    { label: 'Cost Center', value: 'CC-IT-001' }
                  ].map((field, index) => (
                    <div key={index}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {field.label}
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Status */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Account Status
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Settings size={12} />
                    Manage Status
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {[
                    { 
                      label: 'Account Status', 
                      value: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(user.status)}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      )
                    },
                    { 
                      label: 'Last Login', 
                      value: user.lastLogin ? formatDateTime(user.lastLogin) : 'Never' 
                    },
                    { 
                      label: 'Password Status', 
                      value: (
                        <div style={{ color: '#10b981' }}>
                          ✅ Strong (Last changed: 30d ago)
                        </div>
                      )
                    },
                    { 
                      label: 'MFA Status', 
                      value: (
                        <div style={{ color: user.mfaEnabled ? '#10b981' : '#ef4444' }}>
                          {user.mfaEnabled ? '🔒 Enabled (Authenticator App)' : '❌ Disabled'}
                        </div>
                      )
                    },
                    { label: 'Login Attempts', value: '0 failed (last 24h), 15 successful' },
                    { label: 'Session Info', value: `${user.sessionCount} active session (Desktop - Chrome)` }
                  ].map((field, index) => (
                    <div key={index}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {field.label}
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#111827'
                      }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                🔑 Permissions & Access Control
              </h2>
              
              {/* Assigned Roles */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Assigned Roles
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ➕ Add Role
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {user.roles.map((role, index) => (
                    <div key={index} style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          🔒 {role}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '2px'
                        }}>
                          Full system access, user management, security controls
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af'
                        }}>
                          Assigned: Jan 15, 2022 by Sarah Johnson • Expires: Never
                        </div>
                      </div>
                      
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}
                      >
                        ⋯ Actions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Direct Permissions Table */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Direct Permissions
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ➕ Add Permission
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        {['Resource', 'Create', 'Read', 'Update', 'Delete', 'Special'].map(header => (
                          <th key={header} style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { resource: 'Users', create: true, read: true, update: true, delete: true, special: 'Bulk Ops' },
                        { resource: 'Groups', create: true, read: true, update: true, delete: false, special: '-' },
                        { resource: 'Projects', create: true, read: true, update: true, delete: 'limited', special: 'Archive' },
                        { resource: 'Settings', create: false, read: true, update: 'limited', delete: false, special: '-' },
                        { resource: 'Audit Logs', create: false, read: true, update: false, delete: false, special: 'Export' }
                      ].map((perm, index) => (
                        <tr key={index}>
                          <td style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: '#111827',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            {perm.resource}
                          </td>
                          {['create', 'read', 'update', 'delete'].map(action => (
                            <td key={action} style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              {perm[action as keyof typeof perm] === true && (
                                <span style={{ color: '#10b981' }}>✅ Yes</span>
                              )}
                              {perm[action as keyof typeof perm] === false && (
                                <span style={{ color: '#ef4444' }}>❌ No</span>
                              )}
                              {perm[action as keyof typeof perm] === 'limited' && (
                                <span style={{ color: '#f59e0b' }}>⚠️ Limited</span>
                              )}
                            </td>
                          ))}
                          <td style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: '#6b7280',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            {perm.special}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                📊 User Activity & Audit Trail
              </h2>
              
              {/* Activity Summary */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Activity Summary (Last 30 Days)
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  {[
                    { icon: '🔑', label: 'Logins', value: '42', change: '+5 this week' },
                    { icon: '📝', label: 'Actions', value: '234', change: '+12% avg' },
                    { icon: '🏗️', label: 'Projects', value: '8', change: '3 active' },
                    { icon: '⏱️', label: 'Hours', value: '156', change: '39h/week' }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      backgroundColor: '#ffffff',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {stat.icon}
                      </div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        {stat.value}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Recent Activity Timeline
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Download size={12} />
                    Export Full Log
                  </button>
                </div>
                
                <div style={{ padding: '20px' }}>
                  {activityLog.map((activity, index) => (
                    <div key={activity.id} style={{
                      display: 'flex',
                      gap: '16px',
                      paddingBottom: index < activityLog.length - 1 ? '20px' : '0',
                      marginBottom: index < activityLog.length - 1 ? '20px' : '0',
                      borderBottom: index < activityLog.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: activity.type === 'login' ? '#10b981' : '#3b82f6',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {activity.type === 'login' && '🔑'}
                        {activity.type === 'profile_update' && '👥'}
                        {activity.type === 'permission_change' && '🔒'}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {activity.type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </div>
                        
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          {activity.description}
                        </div>
                        
                        {activity.location && (
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>
                            {activity.ipAddress && `${activity.ipAddress} • `}
                            {activity.location}
                          </div>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        flexShrink: 0
                      }}>
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                🏢 Team & Project Associations
              </h2>
              
              {/* Team Memberships */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Team Memberships
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ➕ Add to Team
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {teamMemberships.map((team, index) => (
                    <div key={team.id} style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '4px'
                          }}>
                            👥 {team.name}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            marginBottom: '8px'
                          }}>
                            Role: {team.role} • Members: {team.memberCount} • Department: {team.department}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>
                            Joined: {formatDate(team.joinedAt)}
                            {team.role === 'Team Lead' && ' • Direct Reports: 4'}
                          </div>
                        </div>
                        
                        <button
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#6b7280'
                          }}
                        >
                          ⋯ Options
                        </button>
                      </div>
                      
                      {index === 0 && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#6b7280',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          Team Members: Maria D., Robert J., Alex C., Lisa W.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Organizational Chart Position */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                  Organizational Chart Position
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    padding: '12px 20px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      Sarah Johnson
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      VP Engineering
                    </div>
                  </div>
                  
                  <div style={{ width: '2px', height: '20px', backgroundColor: '#d1d5db' }}></div>
                  
                  <div style={{
                    padding: '12px 20px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    border: '2px solid #3b82f6'
                  }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      John Smith
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Sr. Administrator
                    </div>
                  </div>
                  
                  <div style={{ width: '2px', height: '20px', backgroundColor: '#d1d5db' }}></div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    width: '100%'
                  }}>
                    {[
                      { name: 'Maria D.', role: 'Dev' },
                      { name: 'Robert J.', role: 'Dev' },
                      { name: 'Alex C.', role: 'QA' },
                      { name: 'Lisa W.', role: 'Designer' }
                    ].map((person, index) => (
                      <div key={index} style={{
                        padding: '8px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {person.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {person.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  marginTop: '20px'
                }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📊 View Full Org Chart
                  </button>
                  
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    👥 Manage Direct Reports
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                ⚙️ User Settings & Configuration
              </h2>
              
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Account Preferences
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    💾 Save Changes
                  </button>
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                  Settings configured by administrators for this user account.
                </div>
                
                <div style={{
                  display: 'grid',
                  gap: '20px'
                }}>
                  {/* Notification Settings */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      Notification Settings
                    </h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {[
                        { label: 'Email notifications for account changes', checked: true },
                        { label: 'SMS alerts for security events', checked: true },
                        { label: 'Browser push notifications', checked: false },
                        { label: 'Weekly activity summary', checked: true }
                      ].map((setting, index) => (
                        <label key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: '#374151',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={setting.checked}
                            style={{ cursor: 'pointer' }}
                            readOnly
                          />
                          {setting.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interface Preferences */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      Interface Preferences
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                          Theme
                        </label>
                        <select style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: '#ffffff'
                        }}>
                          <option>Dark Mode</option>
                          <option>Light Mode</option>
                          <option>System Default</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                          Language
                        </label>
                        <select style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: '#ffffff'
                        }}>
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                🛡️ Security & Compliance
              </h2>
              
              {/* MFA Settings */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Multi-Factor Authentication
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ⚙️ Configure
                  </button>
                </div>
                
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '2px' }}>
                        Primary Method: Authenticator App
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                        App: Microsoft Authenticator
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        Last Used: 2 hours ago
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#10b981'
                    }}>
                      <span>🟢 Active</span>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: '#6b7280'
                        }}
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <strong>Backup Methods:</strong>
                  <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                    <li>SMS to +1 (555) ***-4567</li>
                    <li>Backup Codes: 8 remaining</li>
                    <li>Hardware Token: YubiKey 5 NFC</li>
                  </ul>
                </div>
              </div>
              
              {/* Compliance Status */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Compliance Status
                  </h3>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📋 Full Report
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    92/100
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                      🟢 Excellent
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Security Score
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  {[
                    { label: 'Password Policy Compliance', status: 'pass' },
                    { label: 'MFA Enabled & Active', status: 'pass' },
                    { label: 'Regular Login Activity', status: 'pass' },
                    { label: 'No Suspended Permissions', status: 'pass' },
                    { label: 'API Keys Properly Managed', status: 'pass' },
                    { label: 'Admin privileges (180 days)', status: 'warning' }
                  ].map((check, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: check.status === 'pass' ? '#10b981' : '#f59e0b'
                    }}>
                      <span>{check.status === 'pass' ? '✅' : '⚠️'}</span>
                      <span>{check.label}</span>
                      {check.status === 'warning' && (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          - Review Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '16px'
                }}>
                  <strong style={{ fontSize: '12px', color: '#0369a1' }}>
                    Recommendations:
                  </strong>
                  <ul style={{ 
                    margin: '4px 0 0 20px', 
                    padding: 0, 
                    fontSize: '11px',
                    color: '#0369a1'
                  }}>
                    <li>Schedule quarterly access review</li>
                    <li>Consider hardware token for critical operations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
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

export default UserProfileDetail;