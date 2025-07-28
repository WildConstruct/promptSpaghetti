/**
 * AdminHeader - Consistent header for admin pages
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides title, breadcrumbs, user info, and page actions
 */
import React from 'react';
import { Menu, User, Settings, LogOut, ChevronRight } from 'lucide-react';
interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  showSidebarToggle?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;

export const AdminHeader: React.FC<AdminHeaderProps> = ({)
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  showSidebarToggle = true,
  sidebarCollapsed = false,
  onSidebarToggle
}) => {
  return;
    <header className="admin-header">
      <div className="admin-header-left">
        {/* Sidebar Toggle */}
        {showSidebarToggle && ()
          <button
            className="sidebar-toggle"
            onClick={onSidebarToggle}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>
        )}
        {/* Page Title & Breadcrumbs */}
        <div className="header-content">
          {breadcrumbs.length > 0 && ()
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => ()
                  <li key={index} className="breadcrumb-item">
                    {crumb.href ? ()
                      <a href={crumb.href} className="breadcrumb-link">
                        {crumb.label}
                      </a>
                    ) : ()
                      <span className="breadcrumb-current">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && ()
                      <ChevronRight size={14} className="breadcrumb-separator" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {title && ()
            <div className="header-title-section">
              <h1 className="admin-page-title">{title}</h1>
              {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
      <div className="admin-header-right">
        {/* Page Actions */}
        {actions && ()
          <div className="header-actions">
            {actions}
          </div>
        )}
        {/* User Menu */}
        <div className="user-menu">
          <button className="user-menu-trigger">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <span className="user-name">Admin User</span>
          </button>
          <div className="user-menu-dropdown">
            <a href="/admin/profile" className="menu-item">
              <User size={16} />
              Profile
            </a>
            <a href="/admin/settings" className="menu-item">
              <Settings size={16} />
              Settings
            </a>
            <div className="menu-divider" />
            <button className="menu-item logout">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;