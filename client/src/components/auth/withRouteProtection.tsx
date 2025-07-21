/**
 * withRouteProtection - Higher-order component for protecting routes
 * 
 * Alternative pattern for route protection using HOC instead of wrapper components
 */

import React, { ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export interface RouteProtectionOptions {
  requireAuth?: boolean;
  requiredRoles?: string[];
  requireAllRoles?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ComponentType;
  unauthorizedComponent?: React.ComponentType;
}

export function withRouteProtection<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: RouteProtectionOptions = {}
) {
  const {
    requireAuth = true,
    requiredRoles = [],
    requireAllRoles = false,
    redirectTo = '/login',
    loadingComponent: LoadingComponent,
    unauthorizedComponent: UnauthorizedComponent
  } = options;

  const ProtectedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading component while checking authentication
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          <div>Checking authentication status...</div>
        </div>
      );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role requirements
    if (isAuthenticated && user && requiredRoles.length > 0) {
      const userRoles = user.roles || [];
      const hasRequiredRoles = requireAllRoles 
        ? requiredRoles.every(role => userRoles.includes(role))
        : requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRoles) {
        if (UnauthorizedComponent) {
          return <UnauthorizedComponent />;
        }
        return <Navigate to="/unauthorized" state={{ from: location, reason: 'insufficient_permissions' }} replace />;
      }
    }

    // User has access, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  ProtectedComponent.displayName = `withRouteProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}

// Convenience HOCs for common use cases
export 
export 
export 
export default withRouteProtection;