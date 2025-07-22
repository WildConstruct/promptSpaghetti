// Epic 17.1.2 - Admin Layout Component

import React, { useState } from 'react';
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
  Key
} from 'lucide-react';

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
    description: 'Manage feature flags and rollouts'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    description: 'Manage users and permissions'
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: FileText,
    description: 'Moderate and manage content'
  },
  {
    id: 'api-management',
    label: 'API Management',
    icon: Key,
    description: 'Manage API keys and access control'
  },
  {
    id: 'marketplace',
    label: 'Marketplace Admin',
    icon: ShoppingCart,
    description: 'Review templates and transactions'
  },
  {
    id: 'analytics',
    label: 'Analytics & Monitoring',
    icon: BarChart3,
    description: 'View system metrics and health'
  },
  {
    id: 'system',
    label: 'System Configuration',
    icon: Settings,
    description: 'Configure system settings'
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentSection,
  onSectionChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSectionData = adminSections.find(s => s.id === currentSection);

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
        
        <button className="mobile-logout-btn">
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={24} />
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === currentSection;
            
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
                  <span className="nav-item-label">{section.label}</span>
                  <span className="nav-item-description">{section.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          
          <button className="logout-btn">
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