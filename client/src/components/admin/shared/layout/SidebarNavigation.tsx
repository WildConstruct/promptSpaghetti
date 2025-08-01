/**
 * SidebarNavigation - Consistent navigation for admin interfaces
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides hierarchical navigation with permissions and active state management
 */
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Shield, 
  ToggleLeft, 
  BarChart3, 
  Settings, 
  Database,
  FileText,
  Bell,
  Lock,
  ChevronDown,
  ChevronRight
 from 'lucide-react';


interface NavItem {
  id: string;,
  label: string;
  href?: string;


  icon?: React.ComponentType<{ size?: number }>;
  children?: NavItem;
  permission?: string;
  badge?: string | number;


interface SidebarNavigationProps {
  collapsed?: boolean;
  onToggle?: () => void;
  currentPath?: string;
  const navigationItems: NavItem = [
  {
  id: 'dashboard',
  label: 'Dashboard',
  href: '/admin',
  icon: Home,



  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    children: [
      { id: 'users-list', label: 'All Users', href: '/admin/users' },
      { id: 'users-roles', label: 'Roles & Permissions', href: '/admin/users/roles' },
      { id: 'users-groups', label: 'User Groups', href: '/admin/users/groups' }
    ]

  {
    id: 'features',
    label: 'Feature Toggles',
    icon: ToggleLeft,
    children: [
      { id: 'features-list', label: 'All Toggles', href: '/admin/features' },
      { id: 'features-create', label: 'Create Toggle', href: '/admin/features/create' },
      { id: 'features-audit', label: 'Audit Log', href: '/admin/features/audit' }
    ]

  {
    id: 'policies',
    label: 'Policy Management',
    icon: Shield,
    children: [
      { id: 'policies-list', label: 'Policies', href: '/admin/policies' },
      { id: 'policies-assignments', label: 'Assignments', href: '/admin/policies/assignments' },
      { id: 'policies-compliance', label: 'Compliance', href: '/admin/policies/compliance' }
    ]

  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { id: 'analytics-usage', label: 'Usage Metrics', href: '/admin/analytics/usage' },
      { id: 'analytics-performance', label: 'Performance', href: '/admin/analytics/performance' },
      { id: 'analytics-reports', label: 'Reports', href: '/admin/analytics/reports' }
    ]

  {
    id: 'data',
    label: 'Data Management',
    icon: Database,
    children: [
      { id: 'data-sources', label: 'Data Sources', href: '/admin/data/sources' },
      { id: 'data-classification', label: 'Classification', href: '/admin/data/classification' },
      { id: 'data-retention', label: 'Retention', href: '/admin/data/retention' }
    ]

  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: FileText,
    children: [
      { id: 'audit-logs', label: 'Audit Logs', href: '/admin/audit/logs' },
      { id: 'audit-reports', label: 'Reports', href: '/admin/audit/reports' },
      { id: 'audit-calendar', label: 'Calendar', href: '/admin/audit/calendar' }
    ]

  {
  id: 'notifications',
  label: 'Notifications',
  href: '/admin/notifications',
  icon: Bell,
  badge: 3,

  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    children: [
      { id: 'security-monitoring', label: 'Monitoring', href: '/admin/security/monitoring' },
      { id: 'security-incidents', label: 'Incidents', href: '/admin/security/incidents' },
      { id: 'security-settings', label: 'Settings', href: '/admin/security/settings' }
    ]

  {
  id: 'settings',
  label: 'System Settings',
  href: '/admin/settings',
  icon: Settings];
  export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({),
  collapsed = false,
  currentPath = '/admin'
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['users', 'features']));
  const toggleExpanded = (itemId: string) => {,
  if (collapsed) return; // Don't expand when sidebar is collapsed
  setExpandedItems(prev => {)
  const newSet = new Set(prev);
  if (newSet.has(itemId)) {
  newSet.delete(itemId);
 else {
        newSet.add(itemId);
      return newSet;
    });
  };
  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  };
  const hasActiveChild = (children?: NavItem) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };
  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isActive(item.href);
    const hasActiveChildItem = hasActiveChild(item.children);
    const showAsActive = isItemActive || hasActiveChildItem;
    return;
      <li key={item.id} className="nav-item">
        <div
          className={`nav-link ${showAsActive ? 'active' : ''} ${level > 0 ? 'child' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
 else if (item.href) {
              window.location.href = item.href;
}
        >
          {/* Icon */}
          {item.icon && level === 0 && ()
            <span className="nav-icon">
              <item.icon size={18} />
            </span>
          )}
          {/* Label */}
          {!collapsed && ()
            <span className="nav-label">{item.label}</span>
          )}
          {/* Badge */}
          {!collapsed && item.badge && ()
            <span className="nav-badge">{item.badge}</span>
          )}
          {/* Expand/Collapse Arrow */}
          {!collapsed && hasChildren && ()
            <span className="nav-arrow">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </div>
        {/* Children */}
        {!collapsed && hasChildren && isExpanded && ()
          <ul className="nav-children">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };
  return;
    <nav className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>}
      <div className="sidebar-header">
        {!collapsed && ()
          <div className="sidebar-logo">
            <h2>Admin Panel</h2>
          </div>
        )}
      </div>
      <div className="sidebar-content">
        <ul className="nav-list">
          {navigationItems.map(item => renderNavItem(item))}
        </ul>
      </div>
      <div className="sidebar-footer">
        {!collapsed && ()
          <div className="sidebar-version">
            <span>v2.1.0</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SidebarNavigation;