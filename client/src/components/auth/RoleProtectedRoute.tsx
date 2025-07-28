/**
 * RoleProtectedRoute - Component for protecting routes based on user roles
 * 
 * Extends authentication protection with role-based access control
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PrivateRoute } from './PrivateRoute';
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  requireAll?: boolean; // If true, user must have ALL roles; if false, ANY role
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ )
  children, 
  requiredRoles,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback = null
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  // First ensure user is authenticated
  if (!isAuthenticated || isLoading || !user) {
    return ()
      <PrivateRoute>
        {children}
      </PrivateRoute>
    );
  }
  // Check if user has required roles (skip check if no roles required)
  if (requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRoles = requireAll ;
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRoles) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={redirectTo} state={{ from: location, reason: 'insufficient_permissions' }} replace />;
    }
  }
  // User is authenticated and has required roles
  return <>{children}</>;
};

export default RoleProtectedRoute;