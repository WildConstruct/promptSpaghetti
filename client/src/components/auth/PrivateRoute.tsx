/**
 * PrivateRoute - Component for protecting authenticated routes
 * 
 * Redirects unauthenticated users to login and preserves intended destination
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, checkAuthStatus, setReturnUrl } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated && !isLoading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  useEffect(() => {
    // Set return URL if not authenticated
    if (!isAuthenticated && location.pathname !== redirectTo) {
      setReturnUrl(location.pathname + location.search);
    }
  }, [isAuthenticated, location.pathname, location.search, redirectTo, setReturnUrl]);

  // Show loading state while checking authentication
  if (isLoading) {
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

export default PrivateRoute;