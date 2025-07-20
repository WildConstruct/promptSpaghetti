// Epic 11 Authentication Hook
// React hook for managing authentication state and operations

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { z } from 'zod';

// User and authentication types
const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable(),
  roles: z.array(z.string()),
  permissions: z.array(z.string())
});

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().default(false),
  deviceInfo: z.object({
    fingerprint: z.string().optional(),
    userAgent: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
});

type User = z.infer<typeof UserSchema>;
type LoginRequest = z.infer<typeof LoginRequestSchema>;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest, context?: { geoLocation?: any }) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

// Create authentication context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication storage keys
const STORAGE_KEYS = {
  USER: 'auth_user',
  SESSION: 'auth_session',
  REMEMBER_ME: 'auth_remember_me'
} as const;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If no context, create standalone hook
    return useStandaloneAuth();
  }
  return context;
};

// Standalone authentication hook for components not wrapped in AuthProvider
const useStandaloneAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const parsedUser = UserSchema.parse(JSON.parse(storedUser));
          
          // Validate session with server
          const isValid = await validateSession();
          if (isValid) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.SESSION);
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Auto-refresh token every 10 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Don't automatically logout on refresh failure
        // The user will be logged out when they make their next request
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const validateSession = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  const login = useCallback(async (
    credentials: LoginRequest,
    context?: { geoLocation?: any }
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...credentials,
          deviceInfo: {
            ...credentials.deviceInfo,
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Parse and store user data
      const validatedUser = UserSchema.parse(data.user);
      setUser(validatedUser);

      // Store user in localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(validatedUser));
        localStorage.setItem(STORAGE_KEYS.SESSION, data.sessionId);
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        // Store in sessionStorage for current session only
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(validatedUser));
        sessionStorage.setItem(STORAGE_KEYS.SESSION, data.sessionId);
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION) || 
                       sessionStorage.getItem(STORAGE_KEYS.SESSION);

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if server request fails
    } finally {
      // Clear local state and storage
      setUser(null);
      setError(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: '' // Token is in HTTP-only cookie
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshToken,
    clearError
  };
};

// Helper hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }, [user]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  }, [user]);

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions
  };
};

// Helper hook for managing authentication redirects
export const useAuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const redirectToLogin = useCallback((returnUrl?: string) => {
    const loginUrl = '/auth/login';
    const url = returnUrl ? `${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}` : loginUrl;
    window.location.href = url;
  }, []);

  const redirectToDashboard = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const redirectAfterLogin = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    if (returnUrl) {
      window.location.href = decodeURIComponent(returnUrl);
    } else {
      redirectToDashboard();
    }
  }, [redirectToDashboard]);

  return {
    redirectToLogin,
    redirectToDashboard,
    redirectAfterLogin,
    shouldRedirectToLogin: !isAuthenticated && !isLoading,
    shouldRedirectAfterLogin: isAuthenticated && !isLoading
  };
};

// Hook for authentication form validation
export const useAuthValidation = () => {
  const validateEmail = useCallback((email: string): string | null => {
    try {
      z.string().email().parse(email);
      return null;
    } catch {
      return 'Please enter a valid email address';
    }
  }, []);

  const validatePassword = useCallback((password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (password.length > 128) {
      return 'Password is too long (maximum 128 characters)';
    }
    return null;
  }, []);

  const validateForm = useCallback((email: string, password: string) => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    return {
      email: emailError,
      password: passwordError,
      isValid: !emailError && !passwordError
    };
  }, [validateEmail, validatePassword]);

  return {
    validateEmail,
    validatePassword,
    validateForm
  };
};

export default useAuth;