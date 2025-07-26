/**
 * AuthenticationRouter - Comprehensive routing for authentication flows
 * 
 * Provides centralized routing for all authentication-related pages with
 * enhanced navigation, breadcrumbs, and state management
 */

import React, { useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RouteGuard } from './RouteGuard';
import { AuthenticationMiddleware } from './AuthenticationMiddleware';

// Import authentication pages
import LoginPage from '../../pages/LoginPage';
import RegistrationPage from '../../pages/RegistrationPage';
import PasswordResetPage from '../../pages/PasswordResetPage';
import EmailVerificationPage from '../../pages/EmailVerificationPage';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import { OAuthCallback } from './OAuthCallback';

// Authentication-specific route configuration
const AUTH_ROUTE_CONFIG = {
  // Public authentication routes (no auth required)
  public: [
    { path: '/login', component: LoginPage, title: 'Sign In' },
    { path: '/register', component: RegistrationPage, title: 'Create Account' },
    { path: '/reset-password', component: PasswordResetPage, title: 'Reset Password' },
    { path: '/verify-email', component: EmailVerificationPage, title: 'Verify Email' },
    { path: '/unauthorized', component: UnauthorizedPage, title: 'Access Denied' },
    { path: '/auth/callback/google', component: OAuthCallback, title: 'Google Authentication' },
    { path: '/auth/callback/github', component: OAuthCallback, title: 'GitHub Authentication' },
    { path: '/auth/callback', component: OAuthCallback, title: 'OAuth Authentication' }
  ],
  
  // Protected authentication routes (auth required)
  protected: [
    // These would be for authenticated users managing their auth settings
    // { path: '/auth/profile', component: ProfilePage, title: 'Profile Settings' },
    // { path: '/auth/security', component: SecurityPage, title: 'Security Settings' },
  ]
};

/**
 * Authentication breadcrumb component
 */
interface AuthBreadcrumbProps {
  currentPath: string;
}

const AuthBreadcrumb: React.FC<AuthBreadcrumbProps> = React.memo(({ currentPath }) => {
  const route = useMemo(() => 
    AUTH_ROUTE_CONFIG.public.find(r => r.path === currentPath) ||
    AUTH_ROUTE_CONFIG.protected.find(r => r.path === currentPath),
    [currentPath]
  );
  
  if (!route) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      color: '#666',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    }}>
      <span>🔐 {route.title}</span>
    </div>
  );
});

AuthBreadcrumb.displayName = 'AuthBreadcrumb';

/**
 * Authentication progress indicator
 */
const AuthProgressIndicator: React.FC = React.memo(() => {
  const { isLoading } = useAuthStore();
  
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      backgroundColor: '#e9ecef',
      zIndex: 1001
    }}>
      <div style={{
        height: '100%',
        backgroundColor: '#007bff',
        animation: 'progressBar 2s ease-in-out infinite',
        transformOrigin: 'left'
      }} />
      
      <style>{`
        @keyframes progressBar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
});

AuthProgressIndicator.displayName = 'AuthProgressIndicator';

/**
 * Authentication error boundary
 */
interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AuthErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Replace with structured error reporting service
    console.error('Authentication error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f8d7da',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 30px',
              fontSize: '40px',
              color: '#dc3545'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '16px'
            }}>
              Authentication Error
            </h1>
            
            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '30px'
            }}>
              Something went wrong with the authentication system. Please try again.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main Authentication Router Component
 */
export const AuthenticationRouter: React.FC = React.memo(() => {
  const { isAuthenticated } = useAuthStore();
  
  const currentPath = useMemo(() => window.location.pathname, []);
  
  const publicRoutes = useMemo(() => 
    AUTH_ROUTE_CONFIG.public.map(({ path, component: Component }) => (
      <Route
        key={path}
        path={path}
        element={
          <RouteGuard access={{ requireAuth: false }}>
            <Component />
          </RouteGuard>
        }
      />
    )), []
  );
  
  const protectedRoutes = useMemo(() => 
    AUTH_ROUTE_CONFIG.protected.map(({ path, component: Component }) => (
      <Route
        key={path}
        path={path}
        element={
          <RouteGuard access={{ requireAuth: true }}>
            <Component />
          </RouteGuard>
        }
      />
    )), []
  );
  
  const redirectElement = useMemo(() => (
    <Navigate 
      to={isAuthenticated ? '/' : '/login'} 
      replace 
    />
  ), [isAuthenticated]);

  return (
    <AuthErrorBoundary>
      <AuthenticationMiddleware>
        <AuthProgressIndicator />
        <AuthBreadcrumb currentPath={currentPath} />
        
        <Routes>
          {/* Public Authentication Routes */}
          {publicRoutes}
          
          {/* Protected Authentication Routes */}
          {protectedRoutes}
          
          {/* Authentication redirects */}
          <Route 
            path="/auth" 
            element={redirectElement}
          />
          
          {/* Catch-all for auth routes */}
          <Route 
            path="/auth/*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </AuthenticationMiddleware>
    </AuthErrorBoundary>
  );
});

AuthenticationRouter.displayName = 'AuthenticationRouter';

/**
 * Authentication route utilities
 */
export const AuthRouteUtils = {
  /**
   * Get authentication route metadata
   */
  getRouteInfo: (path: string) => {
    return AUTH_ROUTE_CONFIG.public.find(r => r.path === path) ??
           AUTH_ROUTE_CONFIG.protected.find(r => r.path === path);
  },

  /**
   * Check if a path is an authentication route
   */
  isAuthRoute: (path: string): boolean => {
    return path.startsWith('/auth') || 
           path === '/login' || 
           path === '/register' || 
           path === '/reset-password' ||
           path === '/verify-email' ||
           path === '/unauthorized';
  },

  /**
   * Get next authentication step suggestion
   */
  getNextStep: (currentPath: string, isAuthenticated: boolean): string => {
    if (isAuthenticated) return '/';
    
    const stepMap: Record<string, string> = {
      '/register': '/verify-email',
      '/verify-email': '/login',
      '/login': '/',
      '/reset-password': '/login'
    };
    
    return stepMap[currentPath] ?? '/login';
  },

  /**
   * Get authentication breadcrumb path
   */
  getBreadcrumb: (path: string): string[] => {
    const breadcrumbs: string[] = ['Authentication'];
    const route = AuthRouteUtils.getRouteInfo(path);
    
    if (route) {
      breadcrumbs.push(route.title);
    }
    
    return breadcrumbs;
  }
};

export default AuthenticationRouter;