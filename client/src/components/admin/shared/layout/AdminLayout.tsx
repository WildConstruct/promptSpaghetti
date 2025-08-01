/**
 * AdminLayout - Base layout component for all admin pages
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides consistent structure, navigation, and header for admin interfaces
 */
import React from 'react';
import { SidebarNavigation } from './SidebarNavigation';
import { AdminHeader } from './AdminHeader';
import './AdminLayout.css';


interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;


  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;

export const AdminLayout: React.FC<AdminLayoutProps> = ({)
  children,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle,
  className = ''
}) => {
  return;
    <div className={`admin-layout ${className} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>}
      {/* Admin Header */}
      <AdminHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={actions}
        showSidebarToggle={showSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={onSidebarToggle}
      />
      <div className="admin-layout-body">
        {/* Sidebar Navigation */}
        {showSidebar && ()
          <SidebarNavigation 
            collapsed={sidebarCollapsed}
            onToggle={onSidebarToggle}
          />
        )}
        {/* Main Content Area */}
        <main className="admin-main-content">
          <div className="admin-content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;