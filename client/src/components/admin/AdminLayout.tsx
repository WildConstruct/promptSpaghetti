// Epic 17.1.2 - Admin Layout Component
// AUTH-985114-AF38: Updated for authentication integration
// Task: E17-1753114396757-764E97 - Implement alert indicators

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  Settings, 
  ToggleLeft, 
  Users, 
  FileText, 
  ShoppingCart,
  BarChart3,
  Shield,
  Menu,
  X,
  LogOut,
  Key,
  ArrowLeft,
  ScrollText
} from 'lucide-react';
import { 
  AlertIndicatorBadge, 
  AlertStatusIndicator, 
  createEmptyAlertCount,
  AlertCount
} from './AlertIndicators';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const adminSections = [
  {
    id: 'feature-toggles',
    label: 'Feature Toggles',
    icon: ToggleLeft,
    description: 'Manage feature flags and rollouts',
    requiredRoles: ['admin', 'administrator', 'feature-admin']
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    description: 'Manage users and permissions',
    requiredRoles: ['admin', 'administrator', 'user-admin']
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: FileText,
    description: 'Moderate and manage content',
    requiredRoles: ['admin', 'administrator', 'content-moderator']
  },
  {
    id: 'api-management',
    label: 'API Management',
    icon: Key,
    description: 'Manage API keys and access control',
    requiredRoles: ['admin', 'administrator', 'api-admin']
  },
  {
    id: 'marketplace',
    label: 'Marketplace Admin',
    icon: ShoppingCart,
    description: 'Review templates and transactions',
    requiredRoles: ['admin', 'administrator', 'marketplace-admin']
  },
  {
    id: 'analytics',
    label: 'Analytics & Monitoring',
    icon: BarChart3,
    description: 'View system metrics and health',
    requiredRoles: ['admin', 'administrator', 'analyst']
  },
  {
    id: 'system',
    label: 'System Configuration',
    icon: Settings,
    description: 'Configure system settings',
    requiredRoles: ['admin', 'administrator']
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: ScrollText,
    description: 'View system audit trail and security logs',
    requiredRoles: ['admin', 'administrator', 'security-admin']
  },
  {
    id: 'data-protection',
    label: 'Data Protection',
    icon: Shield,
    description: 'Manage data retention, deletion workflows, and compliance',
    requiredRoles: ['admin', 'administrator', 'privacy-officer', 'compliance-admin']
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentSection,
  onSectionChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCounts, setAlertCounts] = useState<AlertCount>(createEmptyAlertCount());
  const [lastAlertUpdate, setLastAlertUpdate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Mock alert data - in real implementation, this would come from API
  useEffect(() => {
    const mockAlertData: AlertCount = {
      critical: 2,
      high: 5,
      medium: 8,
      low: 3,
      info: 1
    };
    
    setAlertCounts(mockAlertData);
    setLastAlertUpdate(new Date());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastAlertUpdate(new Date());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle alert indicator clicks
  const handleViewAlerts = () => {
    // Navigate to alerts management or open alerts panel
    console.log('Navigate to alerts management');
  };

  const currentSectionData = adminSections.find(s => s.id === currentSection);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  // Get user display information
  const displayName = user 
    ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0])
    : 'Admin User';
    
  const userInitials = user && user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : (displayName.slice(0, 2));

  // Filter sections based on user roles
  const availableSections = adminSections.filter(section => {
    if (!user || !user.roles) return false;
    return section.requiredRoles.some(role => user.roles.includes(role));
  });

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="mobile-header-content">
          <Shield size={20} />
          <span>Admin Panel</span>
        </div>
        
        <div className="mobile-header-actions">
          {/* Alert Status Indicator */}
          <AlertStatusIndicator
            alertCounts={alertCounts}
            lastUpdated={lastAlertUpdate}
            size="sm"
            onClick={handleViewAlerts}
          />
          
          {/* Alert Count Badge */}
          <AlertIndicatorBadge
            alertCounts={alertCounts}
            size="sm"
            onClick={handleViewAlerts}
            animate={true}
          />
          
          <button 
            className="mobile-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={24} />
            <span>Admin Panel</span>
            
            {/* Alert Status in Sidebar */}
            <div className="sidebar-alert-status">
              <AlertStatusIndicator
                alertCounts={alertCounts}
                lastUpdated={lastAlertUpdate}
                size="sm"
                onClick={handleViewAlerts}
              />
            </div>
          </div>
          <button
            className="back-to-app-btn"
            onClick={handleBackToApp}
            title="Back to Main App"
            style={{
              padding: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {availableSections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === currentSection;
            
            // Mock section-specific alert counts (in real implementation, this would be calculated)
            const getSectionAlertCounts = (sectionId: string): AlertCount => {
              const mockSectionAlerts = {
                'feature-toggles': { critical: 1, high: 2, medium: 3, low: 1, info: 0 },
                'users': { critical: 0, high: 1, medium: 2, low: 0, info: 1 },
                'content': { critical: 1, high: 1, medium: 1, low: 1, info: 0 },
                'api-management': { critical: 0, high: 1, medium: 2, low: 1, info: 0 },
                'system': { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
                'data-protection': { critical: 1, high: 2, medium: 3, low: 1, info: 0 }
              };
              return mockSectionAlerts[sectionId] || createEmptyAlertCount();
            };
            
            const sectionAlerts = getSectionAlertCounts(section.id);
            const hasSectionAlerts = Object.values(sectionAlerts).some(count => count > 0);
            
            return (
              <button
                key={section.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange(section.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <div className="nav-item-content">
                  <div className="nav-item-header">
                    <span className="nav-item-label">{section.label}</span>
                    {hasSectionAlerts && (
                      <AlertIndicatorBadge
                        alertCounts={sectionAlerts}
                        size="sm"
                        showIcon={false}
                      />
                    )}
                  </div>
                  <span className="nav-item-description">{section.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div 
              className="user-avatar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '600'
              }}
            >
              {userInitials.toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{displayName}</div>
              <div className="user-role">
                {user?.roles?.includes('admin') || user?.roles?.includes('administrator') 
                  ? 'Administrator' 
                  : user?.roles?.[0] || 'User'
                }
              </div>
            </div>
          </div>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="admin-main">
        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <span className="breadcrumb-item">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item current">
            {currentSectionData?.label || 'Dashboard'}
          </span>
        </div>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};