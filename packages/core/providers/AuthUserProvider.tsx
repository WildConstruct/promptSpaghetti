/**
 * Enhanced User Provider with complete Supabase authentication integration
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import {
  retryWithBackoff,
  TokenRefreshScheduler,
  AuthStateBroadcaster,
  OfflineAuthQueue,
  transformAuthError,
  AuthDebugLogger
} from '../utils/authHelpers';
import { authRateLimiter } from '../utils/rateLimiter';

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Profile update interface
 */
interface ProfileUpdate {
  username?: string;
  avatar_url?: string;
  full_name?: string;
}

/**
 * User context value with auth methods
 */
interface UserContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshSession: async () => {},
  clearError: () => {}
});

interface AuthUserProviderProps {
  children: React.ReactNode;
}

export function AuthUserProvider({ children }: AuthUserProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  // Utilities
  const tokenScheduler = useRef<TokenRefreshScheduler | null>(null);
  const broadcaster = useRef<AuthStateBroadcaster | null>(null);
  const offlineQueue = useRef<OfflineAuthQueue | null>(null);
  const logger = useRef<AuthDebugLogger | null>(null);

  // Refresh session method
  const refreshSession = useCallback(async () => {
    if (!supabase) return;

    logger.current?.log('Refreshing session');

    try {
      const {
        data: { session },
        error
      } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (session) {
        logger.current?.log('Session refreshed', { userId: session.user.id });
        setAuthState(prev => ({
          ...prev,
          session,
          user: session.user
        }));
        tokenScheduler.current?.schedule(session);
      }
    } catch (error) {
      logger.current?.error('Session refresh failed', error);
      // Don't update error state for refresh failures as they might be transient
    }
  }, []);

  const refreshSessionRef = useRef(refreshSession);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);

  // Initialize utilities
  useEffect(() => {
    if (!tokenScheduler.current) {
      tokenScheduler.current = new TokenRefreshScheduler(async () => {
        await refreshSessionRef.current();
      });
    }

    if (!broadcaster.current) {
      broadcaster.current = new AuthStateBroadcaster();
    }

    if (!offlineQueue.current) {
      offlineQueue.current = new OfflineAuthQueue();
    }

    if (!logger.current) {
      logger.current = new AuthDebugLogger();
    }

    return () => {
      tokenScheduler.current?.cancel();
      broadcaster.current?.close();
      offlineQueue.current?.clear();
    };
  }, [refreshSession]);

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!supabase) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        logger.current?.log('Restoring session');
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) {
          logger.current?.error('Session restoration failed', error);
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
          return;
        }

        if (session) {
          logger.current?.log('Session restored', { userId: session.user.id });
          setAuthState({
            user: session.user,
            session,
            loading: false,
            error: null,
            isAuthenticated: true
          });
          tokenScheduler.current?.schedule(session);
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
        }
      } catch (error) {
        logger.current?.error('Session restoration error', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: transformAuthError(error),
          isAuthenticated: false
        });
      }
    };

    restoreSession();
  }, [refreshSession]);

  // Auth state subscription
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.current?.log('Auth state change', {
        event,
        userId: session?.user.id
      });

      switch (event) {
        case 'SIGNED_IN':
          setAuthState({
            user: session!.user,
            session,
            loading: false,
            error: null,
            isAuthenticated: true
          });
          tokenScheduler.current?.schedule(session!);
          broadcaster.current?.broadcast('signin', {
            userId: session!.user.id
          });
          break;

        case 'SIGNED_OUT':
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
          tokenScheduler.current?.cancel();
          broadcaster.current?.broadcast('signout');
          break;

        case 'TOKEN_REFRESHED':
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null
          }));
          if (session) {
            tokenScheduler.current?.schedule(session);
            broadcaster.current?.broadcast('session_refresh', {
              userId: session.user.id
            });
          }
          break;

        case 'USER_UPDATED':
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null
          }));
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    if (!broadcaster.current) return;

    const unsubscribe = broadcaster.current.subscribe((event, data) => {
      logger.current?.log('Cross-tab auth event', { event, data });

      switch (event) {
        case 'signin':
          // Another tab signed in, refresh our session
          void refreshSessionRef.current();
          break;

        case 'signout':
          // Another tab signed out, clear our session
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
          tokenScheduler.current?.cancel();
          break;

        case 'session_refresh':
          // Another tab refreshed, we should too
          void refreshSessionRef.current();
          break;
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication is not available');
    }

    // Check rate limiting
    const rateLimitKey = `signin_${email}`;
    const { limited, retryAfter } = authRateLimiter.isRateLimited(rateLimitKey);

    if (limited) {
      const errorMessage = `Too many attempts. Please try again in ${retryAfter} seconds`;
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    logger.current?.log('Sign in attempt', { email });

    try {
      authRateLimiter.recordAttempt(rateLimitKey);

      const operation = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return data;
      };

      const data = await retryWithBackoff(operation);
      logger.current?.log('Sign in successful', { userId: data.user.id });

      // Reset rate limiting on success
      authRateLimiter.reset(rateLimitKey);

      // State update handled by onAuthStateChange
    } catch (error) {
      logger.current?.error('Sign in failed', error);
      const errorMessage = transformAuthError(error);

      // Show remaining attempts if not at limit yet
      const remaining = authRateLimiter.getRemainingAttempts(rateLimitKey);
      const finalMessage =
        remaining > 0 && remaining < 3
          ? `${errorMessage} (${remaining} attempts remaining)`
          : errorMessage;

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: finalMessage
      }));
      throw new Error(finalMessage);
    }
  }, []);

  // Sign up method
  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication is not available');
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    logger.current?.log('Sign up attempt', { email });

    try {
      const operation = async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) throw error;
        return data;
      };

      const data = await retryWithBackoff(operation);
      logger.current?.log('Sign up successful', { userId: data.user?.id });

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Please check your email to confirm your account'
        }));
      }
      // State update handled by onAuthStateChange if auto-confirmed
    } catch (error) {
      logger.current?.error('Sign up failed', error);
      const errorMessage = transformAuthError(error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    if (!supabase) return;

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    logger.current?.log('Sign out attempt');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      logger.current?.log('Sign out successful');
      // State update handled by onAuthStateChange
    } catch (error) {
      logger.current?.error('Sign out failed', error);
      const errorMessage = transformAuthError(error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Reset password method
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error('Authentication is not available');
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    logger.current?.log('Password reset attempt', { email });

    try {
      const operation = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) throw error;
      };

      await retryWithBackoff(operation);
      logger.current?.log('Password reset email sent', { email });

      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      logger.current?.error('Password reset failed', error);
      const errorMessage = transformAuthError(error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Update profile method
  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!supabase || !authState.user) {
        throw new Error('Must be signed in to update profile');
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      logger.current?.log('Profile update attempt', updates);

      try {
        const { data, error } = await supabase.auth.updateUser({
          data: updates
        });

        if (error) throw error;

        logger.current?.log('Profile updated', { userId: data.user.id });
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          loading: false
        }));
      } catch (error) {
        logger.current?.error('Profile update failed', error);
        const errorMessage = transformAuthError(error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        throw new Error(errorMessage);
      }
    },
    [authState.user]
  );

  // Clear error method
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Memoized context value
  const value = useMemo(
    () => ({
      ...authState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshSession,
      clearError
    }),
    [
      authState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshSession,
      clearError
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthUserProvider');
  }
  return context;
}

/**
 * Hook to get just the user ID (for backward compatibility)
 */
export function useUserId(): string | null {
  const { user } = useAuth();
  return user?.id ?? null;
}
