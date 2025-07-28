/**
 * RouteGuard - Enhanced route protection with role-based access control
 * 
 * Provides comprehensive authentication and authorization for protected routes
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// =============================================================================
// Types and Interfaces
// =============================================================================
/**
 * User roles for access control
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'viewer';
/**
 * Permission types for fine-grained access control
 */
export type Permission = 
  | 'graphs:read'
  | 'graphs:write'
  | 'graphs:delete'
  | 'graphs:export'
  | 'graphs:share'
  | 'admin:users'
  | 'admin:settings'
  | 'admin:analytics'
  | 'randomizer:use'
  | 'epic:view'
  | 'epic:manage';
/**
 * Route access requirements
 */
export interface RouteAccessRequirements {
  /** Required authentication status */
  requireAuth?: boolean;
  /** Required user roles (user must have at least one) */
  requiredRoles?: UserRole[];
  /** Required permissions (user must have all) */
  requiredPermissions?: Permission[];
  /** Custom access checker function */
  customCheck?: (user: unknown) => boolean | Promise<boolean>;
  /** Redirect destination for unauthorized access */
  unauthorizedRedirect?: string;
  /** Redirect destination for unauthenticated access */
  unauthenticatedRedirect?: string;
}
/**
 * RouteGuard component props
 */
interface RouteGuardProps {
  children: React.ReactNode;
  access?: RouteAccessRequirements;
  /** Loading component while checking access */
  loadingComponent?: React.ReactNode;
  /** Fallback component for unauthorized access */
  unauthorizedComponent?: React.ReactNode;
}

// =============================================================================
// Default Access Requirements by Route
// =============================================================================
const DEFAULT_ROUTE_ACCESS: Record<string, RouteAccessRequirements> = {
  // Public routes - no authentication required
  '/login': { requireAuth: false },
  '/register': { requireAuth: false },
  '/reset-password': { requireAuth: false },
  '/verify-email': { requireAuth: false },
  '/unauthorized': { requireAuth: false },
  '/auth/callback': { requireAuth: false },
  // Main application routes - authentication required
  '/': { 
    requireAuth: true,
    requiredPermissions: ['graphs:read'],
  },
  '/randomizer': { 
    requireAuth: true,
    requiredPermissions: ['randomizer:use'],
  },
  '/epic-status': { 
    requireAuth: true,
    requiredPermissions: ['epic:view'],
  },
  // Admin routes - admin role required
  '/admin': {
    requireAuth: true,
    requiredRoles: ['admin'],
    unauthorizedRedirect: '/unauthorized',
  },
  '/admin/users': {
    requireAuth: true,
    requiredRoles: ['admin'],
    requiredPermissions: ['admin:users'],
  },
  '/admin/settings': {
    requireAuth: true,
    requiredRoles: ['admin'],
    requiredPermissions: ['admin:settings'],
  }
};

// =============================================================================
// Permission and Role Management
// =============================================================================
/**
 * Default permissions for each role
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  viewer: ['graphs:read', 'epic:view'],
  user: [,
    'graphs:read', 
    'graphs:write', 
    'graphs:export', 
    'graphs:share',
    'randomizer:use',
    'epic:view'
  ],
  moderator: [,
    'graphs:read', 
    'graphs:write', 
    'graphs:export', 
    'graphs:share',
    'graphs:delete',
    'randomizer:use',
    'epic:view',
    'epic:manage'
  ],
  admin: [,
    'graphs:read', 
    'graphs:write', 
    'graphs:export', 
    'graphs:share',
    'graphs:delete',
    'randomizer:use',
    'epic:view',
    'epic:manage',
    'admin:users',
    'admin:settings',
    'admin:analytics'
  ]
};
/**
 * Check if user has required role
 */
function hasRequiredRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}
/**
 * Check if user has required permissions
 */
function hasRequiredPermissions(userRoles: UserRole[], requiredPermissions: Permission[]): boolean {
  const userPermissions = userRoles.flatMap(role => ROLE_PERMISSIONS[role] || []);
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
/**
 * Get user permissions from roles
 */
function getUserPermissions(userRoles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>();
  userRoles.forEach(role => {)
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
  });
  return Array.from(permissions);
}

// =============================================================================
// Route Guard Component
// =============================================================================
/**
 * Enhanced route guard with role-based access control
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({)
  children,
  access,
  loadingComponent,
  unauthorizedComponent
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    checkAuthStatus, 
    setReturnUrl 
  } = useAuthStore();
  const [accessCheckStatus, setAccessCheckStatus] = useState<'checking' | 'granted' | 'denied' | 'unauthenticated'>('checking');
  const [, setCustomCheckResult] = useState<boolean | null>(null);
  // Determine access requirements for current route
  const routeAccess = useMemo(() => ;
    access || DEFAULT_ROUTE_ACCESS[location.pathname] || { requireAuth: true }, 
    [access, location.pathname]
  );
  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading && routeAccess.requireAuth) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus, routeAccess.requireAuth]);
  // Set return URL for post-authentication redirect
  useEffect(() => {
    if (!isAuthenticated && routeAccess.requireAuth) {
      const redirectPath = routeAccess.unauthenticatedRedirect || '/login';
      if (location.pathname !== redirectPath) {
        setReturnUrl(location.pathname + location.search);
      }
    }
  }, [isAuthenticated, location.pathname, location.search, routeAccess, setReturnUrl]);
  // Perform access check
  useEffect(() => {
    async function performAccessCheck() {
      setAccessCheckStatus('checking');
      // No authentication required
      if (!routeAccess.requireAuth) {
        setAccessCheckStatus('granted');
        return;
      }
      // Not authenticated
      if (!isAuthenticated) {
        setAccessCheckStatus('unauthenticated');
        return;
      }
      // User not loaded yet
      if (!user) {
        return; // Keep checking
      }
      try {
        // Get user roles (fallback to 'user' if not specified)
        const userRoles: UserRole[] = user.roles?.length > 0 ? user.roles as UserRole[] : ['user'];
        // Check role requirements
        if (routeAccess.requiredRoles && !hasRequiredRole(userRoles, routeAccess.requiredRoles)) {
          setAccessCheckStatus('denied');
          return;
        }
        // Check permission requirements
        if (routeAccess.requiredPermissions && !hasRequiredPermissions(userRoles, routeAccess.requiredPermissions)) {
          setAccessCheckStatus('denied');
          return;
        }
        // Custom access check
        if (routeAccess.customCheck) {
          const customResult = await routeAccess.customCheck(user);
          setCustomCheckResult(customResult);
          if (!customResult) {
            setAccessCheckStatus('denied');
            return;
          }
        }
        // All checks passed
        setAccessCheckStatus('granted');
      } catch (error) {
        console.error('Access check error:', error);
        setAccessCheckStatus('denied');
      }
    }
    performAccessCheck();
  }, [isAuthenticated, user, routeAccess, location.pathname]);
  // Show loading state
  if (isLoading || accessCheckStatus === 'checking') {
    return loadingComponent || ()
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '500',
          marginBottom: '12px',
          color: '#333',
        }}>
          Loading...
        </div>
        <div style={{ 
          fontSize: '14px',
          color: '#666',
        }}>
          Checking access permissions...
        </div>
      </div>
    );
  }
  // Redirect unauthenticated users
  if (accessCheckStatus === 'unauthenticated') {
    const redirectTo = routeAccess.unauthenticatedRedirect || '/login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  // Show unauthorized page/component
  if (accessCheckStatus === 'denied') {
    const redirectTo = routeAccess.unauthorizedRedirect;
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return unauthorizedComponent || ()
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '500px',
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            fontSize: '24px',
            color: '#dc3545',
            marginBottom: '16px',
          }}>
            Access Denied
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
          }}>
            You don&apos;t have permission to access this page.
          </p>
          {routeAccess.requiredRoles && ()
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              Required roles: {routeAccess.requiredRoles.join(', ')}
            </p>
          )}
          {routeAccess.requiredPermissions && ()
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
              Required permissions: {routeAccess.requiredPermissions.join(', ')}
            </p>
          )}
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  // Access granted - render protected content
  return <>{children}</>;
};

// =============================================================================
// Convenience Components and Hooks
// =============================================================================
/**
 * Admin-only route protection
 */
export 
/**
 * Moderator or admin route protection
 */
export 
/**
 * Hook to check user permissions
 */
export function usePermissions(): {
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  userRoles: UserRole[];
  userPermissions: Permission[];
  const { user } = useAuthStore();
  const userRoles: UserRole[] = user?.roles?.length > 0 ? user.roles as UserRole[] : ['user'];
  const userPermissions = getUserPermissions(userRoles);
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };
  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };
  return {
    hasPermission,
    hasRole,
    userRoles,
    userPermissions
  };
}
/**
 * Hook to check if current route is accessible
 */
export function useRouteAccess(pathname?: string): {
  isAccessible: boolean;
  isLoading: boolean;
  requiresAuth: boolean;
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const currentPath = pathname || location.pathname;
  const routeAccess = DEFAULT_ROUTE_ACCESS[currentPath] || { requireAuth: true };
  if (!routeAccess.requireAuth) {
    return { isAccessible: true, isLoading: false, requiresAuth: false };
  }
  if (!isAuthenticated) {
    return { isAccessible: false, isLoading: false, requiresAuth: true };
  }
  if (!user) {
    return { isAccessible: false, isLoading: true, requiresAuth: true };
  }
  const userRoles: UserRole[] = user.roles?.length > 0 ? user.roles as UserRole[] : ['user'];
  let isAccessible = true;
  if (routeAccess.requiredRoles && !hasRequiredRole(userRoles, routeAccess.requiredRoles)) {
    isAccessible = false;
  }
  if (routeAccess.requiredPermissions && !hasRequiredPermissions(userRoles, routeAccess.requiredPermissions)) {
    isAccessible = false;
  }
  return { isAccessible, isLoading: false, requiresAuth: true };
}

export default RouteGuard;