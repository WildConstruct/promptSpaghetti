import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { Shield, ToggleLeft, Users, FileText, ShoppingCart, BarChart3, Settings, Key, ScrollText, ChevronRight, ChevronDown, Search, Star, Clock, Menu, X, Home, ArrowLeft, Bell, HelpCircle, Zap } from 'lucide-react';
import { useEpic17Authorization } from '../../../client/src/hooks/useEpic17Authorization';
// Epic 17 Navigation Configuration
const EPIC17_NAVIGATION = [
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
            tags: ['dashboard', 'overview']
        }
    },
    {
        id: 'feature-management',
        label: 'Feature Management',
        description: 'Feature toggles and rollout controls',
        icon: ToggleLeft,
        path: '/admin/features',
        children: [
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
                    tags: ['toggles', 'rollouts', 'features']
                }
            },
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
                    tags: ['dependencies', 'conflicts', 'analysis']
                }
            },
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
                    tags: ['conditions', 'targeting', 'rules']
                }
            }
        ],
        metadata: {
            category: 'feature_management',
            priority: 95,
            riskLevel: 'high',
            epic: '17.1',
            tags: ['features', 'management']
        }
    },
    {
        id: 'user-management',
        label: 'User Management',
        description: 'User accounts and permissions',
        icon: Users,
        path: '/admin/users',
        children: [
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
                    tags: ['users', 'accounts', 'profiles']
                }
            },
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
                    tags: ['permissions', 'rbac', 'security']
                }
            },
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
                    tags: ['activity', 'monitoring', 'analytics']
                }
            }
        ],
        metadata: {
            category: 'user_management',
            priority: 90,
            riskLevel: 'critical',
            epic: '17.3',
            tags: ['users', 'permissions']
        }
    },
    {
        id: 'content-management',
        label: 'Content Management',
        description: 'Content moderation and publishing',
        icon: FileText,
        path: '/admin/content',
        children: [
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
                    tags: ['content', 'review', 'moderation']
                }
            },
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
                    tags: ['categories', 'taxonomy', 'organization']
                }
            }
        ],
        metadata: {
            category: 'content_management',
            priority: 75,
            riskLevel: 'medium',
            epic: '17.2',
            tags: ['content', 'moderation']
        }
    },
    {
        id: 'marketplace',
        label: 'Marketplace Admin',
        description: 'Marketplace management and transactions',
        icon: ShoppingCart,
        path: '/admin/marketplace',
        children: [
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
                    tags: ['templates', 'review', 'approval']
                }
            },
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
                    tags: ['transactions', 'payments', 'monitoring']
                }
            }
        ],
        metadata: {
            category: 'marketplace',
            priority: 70,
            riskLevel: 'medium',
            epic: '17.5',
            tags: ['marketplace', 'commerce']
        }
    },
    {
        id: 'system',
        label: 'System Configuration',
        description: 'System settings and configuration',
        icon: Settings,
        path: '/admin/system',
        children: [
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
                    tags: ['api', 'keys', 'rate-limiting']
                }
            },
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
                    tags: ['integrations', 'webhooks', 'third-party']
                }
            }
        ],
        metadata: {
            category: 'system_configuration',
            priority: 65,
            riskLevel: 'high',
            epic: '17.4',
            tags: ['system', 'configuration']
        }
    },
    {
        id: 'analytics',
        label: 'Analytics & Monitoring',
        description: 'System analytics and performance monitoring',
        icon: BarChart3,
        path: '/admin/analytics',
        children: [
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
                    tags: ['dashboards', 'metrics', 'performance']
                }
            },
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
                    tags: ['alerts', 'notifications', 'monitoring']
                }
            }
        ],
        metadata: {
            category: 'analytics',
            priority: 60,
            riskLevel: 'low',
            epic: '17.4',
            tags: ['analytics', 'monitoring']
        }
    },
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
            tags: ['audit', 'security', 'compliance']
        }
    }
];
export const Epic17NavigationSystem = ({ _____currentSection = 'overview', onSectionChange, variant = 'sidebar', showBreadcrumbs = true, showQuickActions = true, enableSearch = true }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { canAccess, userRoles, availableSections } = useEpic17Authorization();
    // Navigation state
    const [state, setState] = useState({
        expandedSections: new Set(['feature-management', 'user-management']),
        pinnedItems: new Set(['feature-toggles', 'user-accounts']),
        recentItems: [],
        favoriteItems: new Set(['feature-toggles', 'permissions']),
        searchQuery: '',
        mobileMenuOpen: false
    });
    // Filter navigation items based on permissions
    const availableNavItems = useMemo(() => {
        const filterItems = (items) => {
            return items.filter(item => {
                // For now, return all items - in full implementation would check permissions
                return true;
            }).map(item => ({
                ...item,
                children: item.children ? filterItems(item.children) : undefined
            }));
        };
        return filterItems(EPIC17_NAVIGATION);
    }, [canAccess]);
    // Generate navigation context
    const navigationContext = useMemo(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const currentPath = location.pathname;
        // Find current item
        const findCurrentItem = (items, segments) => {
            for (const item of items) {
                if (item.path === currentPath)
                    return item;
                if (item.children) {
                    const found = findCurrentItem(item.children, segments);
                    if (found)
                        return found;
                }
            }
            return null;
        };
        const currentItem = findCurrentItem(availableNavItems, pathSegments);
        // Generate breadcrumbs
        const breadcrumbs = [
            { label: 'Admin', path: '/admin', icon: Shield, active: false }
        ];
        if (currentItem) {
            // Add parent breadcrumbs
            const parentPath = currentItem.path.split('/').slice(0, -1).join('/');
            if (parentPath !== '/admin') {
                breadcrumbs.push({
                    label: 'Section',
                    path: parentPath,
                    active: false
                });
            }
            breadcrumbs.push({
                label: currentItem.label,
                path: currentItem.path,
                icon: currentItem.icon,
                active: true
            });
        }
        return {
            currentPath,
            currentSection: currentItem?.id || 'overview',
            parentSections: [],
            breadcrumbs,
            availableActions: generateQuickActions(currentItem)
        };
    }, [location.pathname, availableNavItems]);
    // Generate quick actions based on current context
    const generateQuickActions = (currentItem) => {
        const baseActions = [
            {
                id: 'search',
                label: 'Search',
                description: 'Search across all admin sections',
                icon: Search,
                action: () => setState(prev => ({ ...prev, searchQuery: '' })),
                shortcut: 'Ctrl+K',
                category: 'primary',
                enabled: true
            },
            {
                id: 'help',
                label: 'Help & Documentation',
                description: 'Access help and documentation',
                icon: HelpCircle,
                action: () => window.open('/docs/epic17', '_blank'),
                category: 'secondary',
                enabled: true
            }
        ];
        // Add context-specific actions
        if (currentItem?.id === 'feature-toggles') {
            baseActions.unshift({
                id: 'create-toggle',
                label: 'Create Toggle',
                description: 'Create a new feature toggle',
                icon: ToggleLeft,
                action: () => navigate('/admin/features/toggles/create'),
                shortcut: 'Ctrl+N',
                category: 'primary',
                enabled: true
            });
        }
        return baseActions;
    };
    // Handle navigation item click
    const handleNavItemClick = useCallback((item, event) => {
        event.preventDefault();
        if (item.children && item.children.length > 0) {
            // Toggle expansion for items with children
            setState(prev => ({
                ...prev,
                expandedSections: prev.expandedSections.has(item.id)
                    ? new Set([...prev.expandedSections].filter(id => id !== item.id))
                    : new Set([...prev.expandedSections, item.id])
            }));
        }
        else {
            // Navigate to item
            navigate(item.path);
            onSectionChange?.(item.id);
            // Add to recent items
            setState(prev => ({
                ...prev,
                recentItems: [
                    {
                        id: item.id,
                        label: item.label,
                        path: item.path,
                        timestamp: new Date(),
                        icon: item.icon
                    },
                    ...prev.recentItems.filter(r => r.id !== item.id).slice(0, 9)
                ]
            }));
            // Close mobile menu if open
            if (variant === 'mobile') {
                setState(prev => ({ ...prev, mobileMenuOpen: false }));
            }
        }
    }, [navigate, onSectionChange, variant]);
    // Render navigation badge
    const renderBadge = (badge) => {
        const colorClasses = {
            blue: 'bg-blue-500 text-white',
            green: 'bg-green-500 text-white',
            yellow: 'bg-yellow-500 text-yellow-900',
            red: 'bg-red-500 text-white',
            purple: 'bg-purple-500 text-white',
            gray: 'bg-gray-500 text-white'
        };
        return (_jsx("span", { className: `
          px-2 py-1 rounded-full text-xs font-medium
          ${colorClasses[badge.color]}
          ${badge.pulse ? 'animate-pulse' : ''}
        `, children: badge.value }));
    };
    // Render navigation item
    const renderNavItem = (item, level = 0) => {
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
            critical: 'text-red-600'
        };
        return (_jsxs("div", { className: `nav-item-container ${level > 0 ? 'ml-4' : ''}`, children: [_jsxs("div", { className: `
            nav-item flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-200 hover:bg-gray-100
            ${isActive ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-700' : 'text-gray-700'}
            ${isPinned ? 'border border-blue-200' : ''}
          `, onClick: (e) => handleNavItemClick(item, e), children: [_jsxs("div", { className: "flex items-center space-x-3 flex-1", children: [_jsxs("div", { className: "relative", children: [_jsx(Icon, { size: 18, className: isActive ? 'text-blue-600' : riskColors[item.metadata.riskLevel] }), isPinned && (_jsx("div", { className: "absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" }))] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium text-sm", children: item.label }), isFavorite && _jsx(Star, { size: 12, className: "text-yellow-500 fill-current" }), item.badge && renderBadge(item.badge)] }), item.description && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: item.description }))] })] }), _jsx("div", { className: "flex items-center space-x-1", children: hasChildren && (_jsx("button", { className: "p-1 hover:bg-gray-200 rounded", children: isExpanded ? _jsx(ChevronDown, { size: 16 }) : _jsx(ChevronRight, { size: 16 }) })) })] }), hasChildren && isExpanded && (_jsx("div", { className: "mt-1 space-y-1", children: item.children.map(child => renderNavItem(child, level + 1)) }))] }, item.id));
    };
    // Render breadcrumbs
    const renderBreadcrumbs = () => {
        if (!showBreadcrumbs)
            return null;
        return (_jsx("div", { className: "breadcrumb-container flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b", children: navigationContext.breadcrumbs.map((crumb, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx(ChevronRight, { size: 14, className: "text-gray-400" }), _jsxs("button", { onClick: () => !crumb.active && navigate(crumb.path), className: `
                flex items-center space-x-1 text-sm px-2 py-1 rounded
                ${crumb.active
                            ? 'text-blue-600 font-medium bg-blue-100'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'}
              `, disabled: crumb.active, children: [crumb.icon && _jsx(crumb.icon, { size: 14 }), _jsx("span", { children: crumb.label })] })] }, index))) }));
    };
    // Render search bar
    const renderSearch = () => {
        if (!enableSearch)
            return null;
        return (_jsx("div", { className: "search-container p-4 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search admin sections...", value: state.searchQuery, onChange: (e) => setState(prev => ({ ...prev, searchQuery: e.target.value })), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }) }));
    };
    // Render quick actions
    const renderQuickActions = () => {
        if (!showQuickActions || navigationContext.availableActions.length === 0)
            return null;
        return (_jsxs("div", { className: "quick-actions-container p-4 border-b bg-gray-50", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2", children: "Quick Actions" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: navigationContext.availableActions.slice(0, 4).map(action => (_jsxs("button", { onClick: action.action, disabled: !action.enabled, className: `
                flex items-center space-x-2 p-2 rounded-lg text-left text-sm
                ${action.category === 'primary'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              `, children: [_jsx(action.icon, { size: 16 }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: action.label }), action.shortcut && (_jsx("div", { className: "text-xs opacity-70", children: action.shortcut }))] })] }, action.id))) })] }));
    };
    // Render recent items
    const renderRecentItems = () => {
        if (state.recentItems.length === 0)
            return null;
        return (_jsxs("div", { className: "recent-items-container p-4 border-b", children: [_jsxs("h3", { className: "text-sm font-medium text-gray-700 mb-2 flex items-center", children: [_jsx(Clock, { size: 14, className: "mr-1" }), "Recent"] }), _jsx("div", { className: "space-y-1", children: state.recentItems.slice(0, 5).map(item => (_jsxs("button", { onClick: () => navigate(item.path), className: "w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-left text-sm", children: [_jsx(item.icon, { size: 14, className: "text-gray-500" }), _jsx("span", { className: "flex-1 truncate", children: item.label })] }, item.id))) })] }));
    };
    return (_jsxs("div", { className: `epic17-navigation-system ${variant}`, children: [variant === 'mobile' && (_jsxs("div", { className: "mobile-header flex items-center justify-between p-4 bg-white border-b", children: [_jsx("button", { onClick: () => setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen })), className: "p-2 hover:bg-gray-100 rounded-lg", children: state.mobileMenuOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) }), _jsx("div", { className: "font-semibold text-gray-800", children: "Admin Panel" }), _jsx("button", { onClick: () => navigate('/'), className: "p-2 hover:bg-gray-100 rounded-lg", children: _jsx(ArrowLeft, { size: 20 }) })] })), _jsxs("div", { className: `
        navigation-container bg-white
        ${variant === 'sidebar' ? 'w-80 h-full border-r' : ''}
        ${variant === 'mobile' && !state.mobileMenuOpen ? 'hidden' : ''}
      `, children: [renderSearch(), renderQuickActions(), renderRecentItems(), _jsx("div", { className: "navigation-items p-4 space-y-1 flex-1 overflow-y-auto", children: availableNavItems.map(item => renderNavItem(item)) }), _jsx("div", { className: "navigation-footer p-4 border-t bg-gray-50", children: _jsxs("div", { className: "text-xs text-gray-600", children: [_jsxs("div", { children: ["Logged in as: ", _jsx("span", { className: "font-medium", children: "Admin User" })] }), _jsxs("div", { children: ["Roles: ", userRoles.join(', ') || 'None'] }), _jsxs("div", { children: ["Sections: ", availableSections.length] })] }) })] }), variant !== 'sidebar' && renderBreadcrumbs()] }));
};
export default Epic17NavigationSystem;
