/**
 * Epic 17 Dashboard Navigation System
 * 
 * Advanced navigation system for Epic 17 Backstage Admin Controls providing:
 * - Hierarchical navigation with breadcrumbs and context switching
 * - Role-based navigation with dynamic menu generation
 * - Smart navigation with recent items, favorites, and quick actions
 * - Responsive design with mobile-first approach
 * - Integration with authorization system for permission-based navigation
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  ToggleLeft,
  Users,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  Key,
  ScrollText,
  ChevronRight,
  ChevronDown,
  Search,
  Star,
  Clock,
  Menu,
  X,
  Home,
  ArrowLeft,
  Bell,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useEpic17Authorization } from '../../../client/src/hooks/useEpic17Authorization';

// Navigation configuration interfaces

export interface NavigationItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<unknown>;
  path: string;
  children?: NavigationItem;
  requiredPermissions?: {
  resource: string;
  actions: string;
}[];
  badge?: NavigationBadge;
  metadata: {
  category: string;
  priority: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  epic?: string;
  story?: string;
  tags: string;
};
}
export interface NavigationBadge {
  type: 'count' | 'status' | 'alert' | 'info';
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  pulse?: boolean;
}
export interface NavigationContext {
  currentPath: string;
  currentSection: string;
  parentSections: string;
  breadcrumbs: BreadcrumbItem;
  availableActions: QuickAction;
}
export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<unknown>;
  active: boolean;
}
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<unknown>;
  action: () => void;
  shortcut?: string;
  category: 'primary' | 'secondary' | 'tertiary';
  enabled: boolean;
}
export interface NavigationState {
  expandedSections: Set<string>;
  pinnedItems: Set<string>;
  recentItems: RecentItem;
  favoriteItems: Set<string>;
  searchQuery: string;
  mobileMenuOpen: boolean;
}
export interface RecentItem {
  id: string;
  label: string;
  path: string;
  timestamp: Date;
  icon: React.ComponentType<unknown>;
  // Epic 17 Navigation Configuration
  const EPIC17_NAVIGATION: NavigationItem = [
  {
  id: 'overview',
  label: 'Overview',
  description: 'System overview and dashboard',
  icon: Home,
  path: '/admin',
  metadata: {
  category: 'dashboard',
  priority: 100,
  riskLevel: 'low',
  tags: ['dashboard', 'overview'],
}
  {
    id: 'feature-management',
    label: 'Feature Management',
    description: 'Feature toggles and rollout controls',
    icon: ToggleLeft,
    path: '/admin/features',
    children: [,
      {
        id: 'feature-toggles',
        label: 'Feature Toggles',
        description: 'Manage feature flags and rollouts',
        icon: ToggleLeft,
        path: '/admin/features/toggles',
        badge: { type: 'count', value: 12, color: 'blue' },
        metadata: {
  category: 'feature_toggles',
  priority: 90,
  riskLevel: 'high',
  epic: '17.1',
  tags: ['toggles', 'rollouts', 'features'],
}
      {
  id: 'toggle-dependencies',
  label: 'Dependencies',
  description: 'Manage toggle dependencies and conflicts',
  icon: Zap,
  path: '/admin/features/dependencies',
  metadata: {
  category: 'dependencies',
  priority: 85,
  riskLevel: 'high',
  tags: ['dependencies', 'conflicts', 'analysis'],
}
      {
  id: 'toggle-conditions',
  label: 'Conditions',
  description: 'Advanced targeting and conditions',
  icon: Settings,
  path: '/admin/features/conditions',
  metadata: {
  category: 'conditions',
  priority: 80,
  riskLevel: 'medium',
  tags: ['conditions', 'targeting', 'rules']],
  metadata: {
  category: 'feature_management',
  priority: 95,
  riskLevel: 'high',
  epic: '17.1',
  tags: ['features', 'management'],
}
  {
    id: 'user-management',
    label: 'User Management',
    description: 'User accounts and permissions',
    icon: Users,
    path: '/admin/users',
    children: [,
      {
        id: 'user-accounts',
        label: 'User Accounts',
        description: 'Manage user accounts and profiles',
        icon: Users,
        path: '/admin/users/accounts',
        badge: { type: 'count', value: 1247, color: 'green' },
        metadata: {
  category: 'user_accounts',
  priority: 80,
  riskLevel: 'critical',
  tags: ['users', 'accounts', 'profiles'],
}
      {
        id: 'permissions',
        label: 'Permissions',
        description: 'Role-based access control',
        icon: Shield,
        path: '/admin/users/permissions',
        badge: { type: 'alert', value: '!', color: 'yellow', pulse: true },
        metadata: {
  category: 'permissions',
  priority: 85,
  riskLevel: 'critical',
  tags: ['permissions', 'rbac', 'security'],
}
      {
  id: 'activity-monitoring',
  label: 'Activity Monitoring',
  description: 'User activity and behavior tracking',
  icon: BarChart3,
  path: '/admin/users/activity',
  metadata: {
  category: 'monitoring',
  priority: 70,
  riskLevel: 'medium',
  tags: ['activity', 'monitoring', 'analytics']],
  metadata: {
  category: 'user_management',
  priority: 90,
  riskLevel: 'critical',
  epic: '17.3',
  tags: ['users', 'permissions'],
}
  {
    id: 'content-management',
    label: 'Content Management',
    description: 'Content moderation and publishing',
    icon: FileText,
    path: '/admin/content',
    children: [,
      {
        id: 'content-review',
        label: 'Content Review',
        description: 'Moderate and review content',
        icon: FileText,
        path: '/admin/content/review',
        badge: { type: 'count', value: 23, color: 'red', pulse: true },
        metadata: {
  category: 'content_review',
  priority: 75,
  riskLevel: 'medium',
  tags: ['content', 'review', 'moderation'],
}
      {
  id: 'content-categories',
  label: 'Categories',
  description: 'Manage content categories and tags',
  icon: Settings,
  path: '/admin/content/categories',
  metadata: {
  category: 'categories',
  priority: 60,
  riskLevel: 'low',
  tags: ['categories', 'taxonomy', 'organization']],
  metadata: {
  category: 'content_management',
  priority: 75,
  riskLevel: 'medium',
  epic: '17.2',
  tags: ['content', 'moderation'],
}
  {
    id: 'marketplace',
    label: 'Marketplace Admin',
    description: 'Marketplace management and transactions',
    icon: ShoppingCart,
    path: '/admin/marketplace',
    children: [,
      {
        id: 'template-review',
        label: 'Template Review',
        description: 'Review and approve templates',
        icon: FileText,
        path: '/admin/marketplace/review',
        badge: { type: 'count', value: 8, color: 'purple' },
        metadata: {
  category: 'template_review',
  priority: 70,
  riskLevel: 'medium',
  tags: ['templates', 'review', 'approval'],
}
      {
  id: 'transactions',
  label: 'Transactions',
  description: 'Monitor transactions and payments',
  icon: BarChart3,
  path: '/admin/marketplace/transactions',
  metadata: {
  category: 'transactions',
  priority: 65,
  riskLevel: 'high',
  tags: ['transactions', 'payments', 'monitoring']],
  metadata: {
  category: 'marketplace',
  priority: 70,
  riskLevel: 'medium',
  epic: '17.5',
  tags: ['marketplace', 'commerce'],
}
  {
  id: 'system',
  label: 'System Configuration',
  description: 'System settings and configuration',
  icon: Settings,
  path: '/admin/system',
  children: [,
  {
  id: 'api-management',
  label: 'API Management',
  description: 'Manage API keys and rate limits',
  icon: Key,
  path: '/admin/system/api',
  metadata: {
  category: 'api_management',
  priority: 60,
  riskLevel: 'high',
  tags: ['api', 'keys', 'rate-limiting'],
}
      {
  id: 'integrations',
  label: 'Integrations',
  description: 'Third-party integrations and webhooks',
  icon: Zap,
  path: '/admin/system/integrations',
  metadata: {
  category: 'integrations',
  priority: 55,
  riskLevel: 'medium',
  tags: ['integrations', 'webhooks', 'third-party']],
  metadata: {
  category: 'system_configuration',
  priority: 65,
  riskLevel: 'high',
  epic: '17.4',
  tags: ['system', 'configuration'],
}
  {
  id: 'analytics',
  label: 'Analytics & Monitoring',
  description: 'System analytics and performance monitoring',
  icon: BarChart3,
  path: '/admin/analytics',
  children: [,
  {
  id: 'dashboards',
  label: 'Dashboards',
  description: 'System health and performance dashboards',
  icon: BarChart3,
  path: '/admin/analytics/dashboards',
  metadata: {
  category: 'dashboards',
  priority: 50,
  riskLevel: 'low',
  tags: ['dashboards', 'metrics', 'performance'],
}
      {
        id: 'alerts',
        label: 'Alerts',
        description: 'System alerts and notifications',
        icon: Bell,
        path: '/admin/analytics/alerts',
        badge: { type: 'status', value: 'OK', color: 'green' },
        metadata: {
  category: 'alerts',
  priority: 65,
  riskLevel: 'medium',
  tags: ['alerts', 'notifications', 'monitoring']],
  metadata: {
  category: 'analytics',
  priority: 60,
  riskLevel: 'low',
  epic: '17.4',
  tags: ['analytics', 'monitoring'],
}
  {
    id: 'audit',
    label: 'Audit & Security',
    description: 'Audit logs and security monitoring',
    icon: ScrollText,
    path: '/admin/audit',
    badge: { type: 'info', value: 'New', color: 'blue' },
    metadata: {
  category: 'audit_security',
  priority: 85,
  riskLevel: 'critical',
  tags: ['audit', 'security', 'compliance']];
  interface Epic17NavigationSystemProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  variant?: 'sidebar' | 'top' | 'mobile';
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  enableSearch?: boolean;
}
export const Epic17NavigationSystem: React.FC<Epic17NavigationSystemProps> = ({)
  currentSection = 'overview',
  onSectionChange,
  variant = 'sidebar',
  showBreadcrumbs = true,
  showQuickActions = true,
  enableSearch = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess, userRoles, availableSections } = useEpic17Authorization();
  // Navigation state
  const [state, setState] = useState<NavigationState>({)
  expandedSections: new Set(['feature-management', 'user-management']),
  pinnedItems: new Set(['feature-toggles', 'user-accounts']),
  recentItems: [],
  favoriteItems: new Set(['feature-toggles', 'permissions']),
  searchQuery: '',
  mobileMenuOpen: false,
});
  // Filter navigation items based on permissions
  const availableNavItems = useMemo(() => {
  const filterItems = (items: NavigationItem): NavigationItem => {,
  return items.filter(item => {)
  // For now, return all items - in full implementation would check permissions
  return true;
}).map(item => ({)
  ...item,
  children: item.children ? filterItems(item.children) : undefined,
}));
    };
    return filterItems(EPIC17_NAVIGATION);
  }, [canAccess]);
  // Generate navigation context
  const navigationContext: NavigationContext = useMemo(() => {
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPath = location.pathname;
  // Find current item
  const findCurrentItem = (items: NavigationItem, segments: string): NavigationItem | null => {,
  for (const item of items) {
  if (item.path === currentPath) return item;
  if (item.children) {
  const found = findCurrentItem(item.children, segments);
  if (found) return found;
  return null;
};
    const currentItem = findCurrentItem(availableNavItems, pathSegments);
    // Generate breadcrumbs
    const breadcrumbs: BreadcrumbItem = [
      { label: 'Admin', path: '/admin', icon: Shield, active: false }
    ];
    if (currentItem) {
  // Add parent breadcrumbs
  const parentPath = currentItem.path.split('/').slice(0, -1).join('/');
  if (parentPath !== '/admin') {
  breadcrumbs.push({)
  label: 'Section',
  path: parentPath,
  active: false,
});
      breadcrumbs.push({)
  label: currentItem.label,
  path: currentItem.path,
  icon: currentItem.icon,
  active: true,
});
    return {
  currentPath,
  currentSection: currentItem?.id || 'overview',
  parentSections: [],
  breadcrumbs,
  availableActions: generateQuickActions(currentItem),
};
  }, [location.pathname, availableNavItems]);
  // Generate quick actions based on current context
  const generateQuickActions = (currentItem: NavigationItem | null): QuickAction => {
    const baseActions: QuickAction = [
      {
        id: 'search',
        label: 'Search',
        description: 'Search across all admin sections',
        icon: Search,
        action: () => setState(prev => ({ ...prev, searchQuery: '' })),
        shortcut: 'Ctrl+K',
        category: 'primary',
        enabled: true;
  }
      {
  id: 'help',
  label: 'Help & Documentation',
  description: 'Access help and documentation',
  icon: HelpCircle,
  action: () => window.open('/docs/epic17', '_blank'),
  category: 'secondary',
  enabled: true];
  // Add context-specific actions
  if (currentItem?.id === 'feature-toggles') {
  baseActions.unshift({)
  id: 'create-toggle',
  label: 'Create Toggle',
  description: 'Create a new feature toggle',
  icon: ToggleLeft,
  action: () => navigate('/admin/features/toggles/create'),
  shortcut: 'Ctrl+N',
  category: 'primary',
  enabled: true,
});
    return baseActions;
  };
  // Handle navigation item click
  const handleNavItemClick = useCallback((item: NavigationItem, event: React.MouseEvent) => {
  event.preventDefault();
  if (item.children && item.children.length > 0) {
  // Toggle expansion for items with children
  setState(prev => ({)
  ...prev,
  expandedSections: prev.expandedSections.has(item.id),
  ? new Set([...prev.expandedSections].filter(id => id !== item.id))
  : new Set([...prev.expandedSections, item.id]),
}));
    } else {
  // Navigate to item
  navigate(item.path);
  onSectionChange?.(item.id);
  // Add to recent items
  setState(prev => ({)
  ...prev,
  recentItems: [,
  {
  id: item.id,
  label: item.label,
  path: item.path,
  timestamp: new Date(),
  icon: item.icon,
}
          ...prev.recentItems.filter(r => r.id !== item.id).slice(0, 9)
        ]
      }));
      // Close mobile menu if open
      if (variant === 'mobile') {
        setState(prev => ({ ...prev, mobileMenuOpen: false }));
  }, [navigate, onSectionChange, variant]);
  // Render navigation badge
  const renderBadge = (badge: NavigationBadge) => {
  const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-yellow-900',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  gray: 'bg-gray-500 text-white',
};
    return;
      <span
        className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${colorClasses[badge.color]}
          ${badge.pulse ? 'animate-pulse' : ''}
        `}
      >
        {badge.value}
      </span>
    );
  };
  // Render navigation item
  const renderNavItem = (item: NavigationItem, level = 0) => {
  const isActive = navigationContext.currentPath === item.path;
  const isExpanded = state.expandedSections.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const isPinned = state.pinnedItems.has(item.id);
  const isFavorite = state.favoriteItems.has(item.id);
  const Icon = item.icon;
  const riskColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};
    return;
      <div key={item.id} className={`nav-item-container ${level > 0 ? 'ml-4' : ''}`}>}
        <div
          className={`
            nav-item flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-200 hover:bg-gray-100
            ${isActive ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-700' : 'text-gray-700'}
            ${isPinned ? 'border border-blue-200' : ''}
          `}
          onClick={(e) => handleNavItemClick(item, e)}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <Icon
                size={18}
                className={isActive ? 'text-blue-600' : riskColors[item.metadata.riskLevel]}
              />
              {isPinned && ()
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{item.label}</span>
                {isFavorite && <Star size={12} className="text-yellow-500 fill-current" />}
                {item.badge && renderBadge(item.badge)}
              </div>
              {item.description && ()
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {hasChildren && ()
              <button className="p-1 hover:bg-gray-200 rounded">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </div>
        {/* Children */}
        {hasChildren && isExpanded && ()
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs) return null;
    return;
      <div className="breadcrumb-container flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b">
        {navigationContext.breadcrumbs.map((crumb, index) => ()
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
            <button
              onClick={() => !crumb.active && navigate(crumb.path)}
              className={`
                flex items-center space-x-1 text-sm px-2 py-1 rounded
                ${crumb.active }
            ? 'text-blue-600 font-medium bg-blue-100' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              `}
              disabled={crumb.active}
            >
              {crumb.icon && <crumb.icon size={14} />}
              <span>{crumb.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };
  // Render search bar
  const renderSearch = () => {
    if (!enableSearch) return null;
    return;
      <div className="search-container p-4 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admin sections..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    );
  };
  // Render quick actions
  const renderQuickActions = () => {
    if (!showQuickActions || navigationContext.availableActions.length === 0) return null;
    return;
      <div className="quick-actions-container p-4 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {navigationContext.availableActions.slice(0, 4).map(action => ()
            <button
              key={action.id}
              onClick={action.action}
              disabled={!action.enabled}
              className={`
                flex items-center space-x-2 p-2 rounded-lg text-left text-sm
                ${action.category === 'primary' }
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  disabled:opacity-50 disabled:cursor-not-allowed,
                transition-colors duration-200
              `}
            >
              <action.icon size={16} />
              <div className="flex-1">
                <div className="font-medium">{action.label}</div>
                {action.shortcut && ()
                  <div className="text-xs opacity-70">{action.shortcut}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  // Render recent items
  const renderRecentItems = () => {
    if (state.recentItems.length === 0) return null;
    return;
      <div className="recent-items-container p-4 border-b">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Clock size={14} className="mr-1" />
          Recent
        </h3>
        <div className="space-y-1">
          {state.recentItems.slice(0, 5).map(item => ()
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-left text-sm"
            >
              <item.icon size={14} className="text-gray-500" />
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  return;
    <div className={`epic17-navigation-system ${variant}`}>}
      {/* Mobile Header */}
      {variant === 'mobile' && ()
        <div className="mobile-header flex items-center justify-between p-4 bg-white border-b">
          <button
            onClick={() => setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {state.mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="font-semibold text-gray-800">Admin Panel</div>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      )}
      {/* Main Navigation Container */}
      <div className={`
        navigation-container bg-white
        ${variant === 'sidebar' ? 'w-80 h-full border-r' : ''}
        ${variant === 'mobile' && !state.mobileMenuOpen ? 'hidden' : ''}
      `}>
        {/* Search */}
        {renderSearch()}
        {/* Quick Actions */}
        {renderQuickActions()}
        {/* Recent Items */}
        {renderRecentItems()}
        {/* Main Navigation */}
        <div className="navigation-items p-4 space-y-1 flex-1 overflow-y-auto">
          {availableNavItems.map(item => renderNavItem(item))}
        </div>
        {/* User Info Footer */}
        <div className="navigation-footer p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            <div>Logged in as: <span className="font-medium">Admin User</span></div>
            <div>Roles: {userRoles.join(', ') || 'None'}</div>
            <div>Sections: {availableSections.length}</div>
          </div>
        </div>
      </div>
      {/* Breadcrumbs (for non-sidebar variants) */}
      {variant !== 'sidebar' && renderBreadcrumbs()}
    </div>
  );
};

export default Epic17NavigationSystem;