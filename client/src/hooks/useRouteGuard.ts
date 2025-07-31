/**
 * useRouteGuard - Hook for programmatic route protection
 * 
 * Provides utilities for checking authentication and permissions in components
 */
import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

}
export interface RouteGuardOptions {
  requireAuth?: boolean;
  requiredRoles?: string;
  requireAllRoles?: boolean;
  redirectTo?: string;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}
}
export const useRouteGuard = (options: RouteGuardOptions = {}) => {
  const {
    requireAuth = true,
    requiredRoles = [],
    requireAllRoles = false,
    redirectTo = '/login',
    onUnauthorized,
    onForbidden
  } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading, setReturnUrl } = useAuthStore();
  // Check if user has required roles
  const hasRequiredRoles = useCallback(() => {
  if (!user || requiredRoles.length === 0) {
  return true;
  const userRoles = user.roles || [];
  return requireAllRoles
  ? requiredRoles.every(role => userRoles.includes(role))
  : requiredRoles.some(role => userRoles.includes(role));
}, [user, requiredRoles, requireAllRoles]);
  // Check authentication status
  const checkAccess = useCallback(() => {
    // Skip checks while loading
    if (isLoading) {
      return { canAccess: false, isLoading: true };

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      return { canAccess: false, reason: 'not_authenticated' };

    // Check role requirements
    if (isAuthenticated && !hasRequiredRoles()) {
      return { canAccess: false, reason: 'insufficient_permissions' };

    return { canAccess: true };
  }, [requireAuth, isAuthenticated, hasRequiredRoles, isLoading]);
  // Guard effect - runs on component mount and dependency changes
  useEffect(() => {
    const accessResult = checkAccess();
    if (accessResult.isLoading) {
      return; // Wait for auth check to complete

    if (!accessResult.canAccess) {
      if (accessResult.reason === 'not_authenticated') {
        // Set return URL for post-login redirect
        setReturnUrl(location.pathname + location.search);
        onUnauthorized?.();
        navigate(redirectTo, { replace: true });
      } else if (accessResult.reason === 'insufficient_permissions') {
  onForbidden?.();
  navigate('/unauthorized', { )
  state: {
  from: location,
  reason: 'insufficient_permissions',
},
  replace: true ;
  });


  }, [
    checkAccess,
    location.pathname,
    location.search,
    navigate,
    redirectTo,
    setReturnUrl,
    onUnauthorized,
    onForbidden
  ]);
  // Utility functions for manual checks
  const canAccess = useCallback(() => {
    const result = checkAccess();
    return result.canAccess;
  }, [checkAccess]);
  const canAccessRole = useCallback((roles: string, requireAll = false) => {
  if (!user) return false;
  const userRoles = user.roles || [];
  return requireAll
  ? roles.every(role => userRoles.includes(role))
  : roles.some(role => userRoles.includes(role));
}, [user]);
  const requireRole = useCallback((roles: string, requireAll = false) => {
  if (!canAccessRole(roles, requireAll)) {
  navigate('/unauthorized', { )
  state: {
  from: location,
  reason: 'insufficient_permissions',
},
  replace: true ;
  });
      return false;

    return true;
  }, [canAccessRole, navigate, location]);
  return {
  // Status
  isAuthenticated,
  user,
  isLoading,
  // Access checks
  canAccess,
  canAccessRole,
  hasRequiredRoles: hasRequiredRoles(),
  // Actions
  requireRole,
  // Current check result
  accessResult: checkAccess(),
};
};

export default useRouteGuard;