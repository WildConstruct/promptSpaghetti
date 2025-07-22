/**
 * Navigation Hook
 * 
 * AUTH-985114-AF38: Update Navigation System for Authentication
 * 
 * Provides role-based navigation utilities and route checking
 * for authenticated users. Integrates with the auth store to
 * provide navigation features based on user roles and permissions.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCallback, useMemo } from 'react';

interface NavigationOptions {
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  // Check if user has required role
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user || !user.roles) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.some(role => user.roles.includes(role));
  }, [user]);

  // Check if user can access a route
  const canAccess = useCallback((options: NavigationOptions = {}): boolean => {
    const { requireAuth = true, requiredRoles = [] } = options;
    
    if (requireAuth && !isAuthenticated) return false;
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) return false;
    
    return true;
  }, [isAuthenticated, hasRole]);

  // Navigate with authentication checks
  const navigateTo = useCallback((
    path: string, 
    options: NavigationOptions = {}
  ): boolean => {
    const { fallbackUrl = '/login' } = options;
    
    if (!canAccess(options)) {
      navigate(fallbackUrl);
      return false;
    }
    
    navigate(path);
    return true;
  }, [navigate, canAccess]);

  // Navigate to admin panel (with role check)
  const navigateToAdmin = useCallback((section?: string): boolean => {
    const adminPath = section ? `/admin/${section}` : '/admin';
    
    return navigateTo(adminPath, {
      requiredRoles: ['admin', 'administrator'],
      fallbackUrl: '/unauthorized'
    });
  }, [navigateTo]);

  // Navigate back to main app
  const navigateToMain = useCallback((): void => {
    navigate('/');
  }, [navigate]);

  // Get available admin sections for current user
  const getAvailableAdminSections = useMemo(() => {
    if (!user || !user.roles) return [];
    
    const adminSections = [
      {
        id: 'feature-toggles',
        label: 'Feature Toggles',
        requiredRoles: ['admin', 'administrator', 'feature-admin']
      },
      {
        id: 'users',
        label: 'User Management',
        requiredRoles: ['admin', 'administrator', 'user-admin']
      },
      {
        id: 'content',
        label: 'Content Management',
        requiredRoles: ['admin', 'administrator', 'content-moderator']
      },
      {
        id: 'api-management',
        label: 'API Management',
        requiredRoles: ['admin', 'administrator', 'api-admin']
      },
      {
        id: 'marketplace',
        label: 'Marketplace Admin',
        requiredRoles: ['admin', 'administrator', 'marketplace-admin']
      },
      {
        id: 'analytics',
        label: 'Analytics & Monitoring',
        requiredRoles: ['admin', 'administrator', 'analyst']
      },
      {
        id: 'system',
        label: 'System Configuration',
        requiredRoles: ['admin', 'administrator']
      }
    ];
    
    return adminSections.filter(section => 
      section.requiredRoles.some(role => user.roles.includes(role))
    );
  }, [user]);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      
      // Map common routes
      const routeMap: Record<string, string> = {
        admin: 'Admin Panel',
        profile: 'Profile',
        settings: 'Settings',
        marketplace: 'Marketplace',
        'feature-toggles': 'Feature Toggles',
        users: 'User Management',
        analytics: 'Analytics'
      };
      
      breadcrumbs.push({
        label: routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      });
    }
    
    return breadcrumbs;
  }, [location.pathname]);

  // Check if current route is active
  const isActiveRoute = useCallback((path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  // Get user's allowed main app tabs
  const getAvailableTabs = useMemo(() => {
    const baseTabs = [
      { id: 'editor', label: 'Graph Editor', path: '/' },
      { id: 'randomizer', label: 'LLM Randomizer', path: '/randomizer' }
    ];
    
    // Add Epic Status tab for all authenticated users
    if (isAuthenticated) {
      baseTabs.push({ id: 'epic-status', label: 'Epic Status', path: '/epic-status' });
    }
    
    return baseTabs;
  }, [isAuthenticated]);

  return {
    // Navigation functions
    navigateTo,
    navigateToAdmin,
    navigateToMain,
    
    // Permission checks
    hasRole,
    canAccess,
    isActiveRoute,
    
    // User-specific data
    getAvailableAdminSections,
    getAvailableTabs,
    getBreadcrumbs,
    
    // Current state
    currentPath: location.pathname,
    isAuthenticated,
    user
  };
};