/**
 * AuthProvider - Comprehensive authentication context and provider
 * 
 * Provides unified authentication context with enhanced security features,
 * role-based access control, and session management
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole, Permission, usePermissions } from './RouteGuard';

// =============================================================================
// Authentication Context Types
// =============================================================================
/**
 * Enhanced user interface with role-based access control
 */

export interface AuthUser {
  id: string;,
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  isEmailVerified: boolean;,
  roles: UserRole;
  permissions: Permission;
  preferences?: {,
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
};
  metadata?: {
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  lastActiveAt?: string;
};
/**
 * Authentication context interface
 */
}
export interface AuthContextValue {
  // Authentication state
  user: AuthUser | null;,
  isAuthenticated: boolean;
  isLoading: boolean;,
  error: string | null;
  // Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;,
  register: (userData: unknown) => Promise<boolean>;
  // OAuth actions
  oauthLogin: (provider: string, returnUrl?: string) => Promise<{ url: string; state: string }>;
  processOAuthCallback: (provider: string, code: string, state: string) => Promise<boolean>;
  // Session management
  refreshSession: () => Promise<boolean>;,
  checkAuthStatus: () => Promise<boolean>;
  // User management
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>;,
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  // Permission checking
  hasPermission: (permission: Permission) => boolean;,
  hasRole: (role: UserRole) => boolean;,
  hasAnyRole: (roles: UserRole) => boolean;,
  hasAllPermissions: (permissions: Permission) => boolean;
  // Security features
  enableTwoFactor: () => Promise<boolean>;,
  disableTwoFactor: (code: string) => Promise<boolean>;,
  verifyTwoFactor: (code: string) => Promise<boolean>;
  // Session information
  sessionInfo: {,
  tokenExpiration: number | null;
  lastActivity: number;
  sessionId?: string;
};
  // Utility functions
  clearError: () => void;,
  setReturnUrl: (url: string) => void;

// =============================================================================
// Authentication Context
// =============================================================================
const AuthContext = createContext<AuthContextValue | null>(null);
/**
 * Hook to use authentication context
 */
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  return context;

// =============================================================================
// Authentication Provider Component
// =============================================================================
/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
/**
 * Enhanced authentication provider with comprehensive security features
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  const permissions = usePermissions();
  // Additional state for enhanced features
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionId, setSessionId] = useState<string | undefined>();
  // Convert auth store user to enhanced auth user
  const user: AuthUser | null = authStore.user ? {,
  id: authStore.user.id,
    email: authStore.user.email,
    firstName: authStore.user.firstName,
    lastName: authStore.user.lastName,
    displayName: `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim() || authStore.user.email}
},
  isEmailVerified: authStore.user.isEmailVerified,
    roles: (authStore.user.roles as UserRole) || ['user'],
    permissions: permissions.userPermissions,
    preferences: authStore.user.preferences,
    metadata: {,
  createdAt: authStore.user.createdAt || new Date().toISOString(),
  lastLoginAt: authStore.user.lastLoginAt,
  lastActiveAt: new Date().toISOString(),
} : null;
  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    if (authStore.isAuthenticated) {
      const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {)
  document.addEventListener(event, updateActivity, true);
      });
      return () => {
        events.forEach(event => {)
  document.removeEventListener(event, updateActivity, true);
        });
      };
  }, [authStore.isAuthenticated]);
  // Enhanced permission checking functions
  const hasPermission = (permission: Permission): boolean => {
    return permissions.hasPermission(permission);
  };
  const hasRole = (role: UserRole): boolean => {
    return permissions.hasRole(role);
  };
  const hasAnyRole = (roles: UserRole): boolean => {
    return roles.some(role => permissions.hasRole(role));
  };
  const hasAllPermissions = (requiredPermissions: Permission): boolean => {
    return requiredPermissions.every(permission => permissions.hasPermission(permission));
  };
  // Enhanced authentication functions
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const success = await authStore.login(email, password, rememberMe);
      if (success) {
        setLastActivity(Date.now());
        // Could generate session ID here
        setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);}
      return success;
    } catch (error) {
  console.error('Login error:', error);
  return false;
};
  const logout = (): void => {
    setLastActivity(0);
    setSessionId(undefined);
    authStore.logout();
  };
  const register = async (userData: unknown): Promise<boolean> => {
    try {
      return await authStore.register(userData);
    } catch (error) {
  console.error('Registration error:', error);
  return false;
};
  const oauthLogin = async (provider: string, returnUrl?: string): Promise<{ url: string; state: string }> => {
    try {
      return await authStore.oauthLogin(provider, returnUrl);
    } catch (error) {
  console.error('OAuth login error:', error);
  throw error;
};
  const processOAuthCallback = async (provider: string, code: string, state: string): Promise<boolean> => {
    try {
      const success = await authStore.processOAuthCallback(provider, code, state);
      if (success) {
        setLastActivity(Date.now());
        setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);}
      return success;
    } catch (error) {
  console.error('OAuth callback error:', error);
  return false;
};
  const refreshSession = async (): Promise<boolean> => {
    try {
      const success = await authStore.refreshTokens();
      if (success) {
        setLastActivity(Date.now());
      return success;
    } catch (error) {
  console.error('Session refresh error:', error);
  return false;
};
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      return await authStore.checkAuthStatus();
    } catch (error) {
  console.error('Auth status check error:', error);
  return false;
};
  // User management functions
  const updateProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    try {
      // Update user profile via API
      const response = await fetch('/api/auth/profile', {)
  method: 'PATCH',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`}
  },
  body: JSON.stringify(updates);
  });
      if (response.ok) {
        const updatedUser = await response.json();
        authStore.updateUser(updatedUser);
        return true;
      return false;
    } catch (error) {
  console.error('Profile update error:', error);
  return false;
};
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/change-password', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`}
  },
  body: JSON.stringify({ currentPassword, newPassword })
      });
      return response.ok;
    } catch (error) {
  console.error('Password change error:', error);
  return false;
};
  // Two-factor authentication functions
  const enableTwoFactor = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/2fa/enable', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`}
      });
      return response.ok;
    } catch (error) {
  console.error('2FA enable error:', error);
  return false;
};
  const disableTwoFactor = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/2fa/disable', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`}
  },
  body: JSON.stringify({ code })
      });
      return response.ok;
    } catch (error) {
  console.error('2FA disable error:', error);
  return false;
};
  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/2fa/verify', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.accessToken}`}
  },
  body: JSON.stringify({ code })
      });
      return response.ok;
    } catch (error) {
  console.error('2FA verify error:', error);
  return false;
};
  // Context value
  const contextValue: AuthContextValue = {
  // Authentication state
  user,
  isAuthenticated: authStore.isAuthenticated,
  isLoading: authStore.isLoading,
  error: authStore.error,
  // Authentication actions
  login,
  logout,
  register,
  // OAuth actions
  oauthLogin,
  processOAuthCallback,
  // Session management
  refreshSession,
  checkAuthStatus,
  // User management
  updateProfile,
  changePassword,
  // Permission checking
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllPermissions,
  // Security features
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  // Session information
  sessionInfo: {,
  tokenExpiration: authStore.tokenExpiration,
  lastActivity,
  sessionId
}
    // Utility functions
    clearError: authStore.clearError,
    setReturnUrl: authStore.setReturnUrl;
  };
  return;
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =============================================================================
// Higher-Order Components
// =============================================================================
/**
 * HOC for components that require authentication
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return <div>Loading...</div>;
    if (!isAuthenticated) {
      return <div>Unauthorized</div>;
    return <Component {...props} />;
  };
/**
 * HOC for components that require specific permissions
 */
export function withPermissions<P extends object>(()
    Component: React.ComponentType<P>,
    requiredPermissions: Permission,
  ): React.FC<P> {
  return function PermissionProtectedComponent(props: P) {
    const { hasAllPermissions, isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return <div>Loading...</div>;
    if (!isAuthenticated || !hasAllPermissions(requiredPermissions)) {
      return <div>Access Denied</div>;
    return <Component {...props} />;
  };
/**
 * HOC for components that require specific roles
 */
export function withRoles<P extends object>(()
    Component: React.ComponentType<P>,
    requiredRoles: UserRole,
  ): React.FC<P> {
  return function RoleProtectedComponent(props: P) {
    const { hasAnyRole, isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return <div>Loading...</div>;
    if (!isAuthenticated || !hasAnyRole(requiredRoles)) {
      return <div>Access Denied</div>;
    return <Component {...props} />;
  };

export default AuthProvider;