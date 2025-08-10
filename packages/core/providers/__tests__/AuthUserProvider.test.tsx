/**
 * Tests for AuthUserProvider with Supabase integration
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthUserProvider, useAuth, useUserId } from '../AuthUserProvider';
import { supabase } from '../../utils/supabaseClient';

// Mock Supabase client
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      refreshSession: jest.fn(),
      onAuthStateChange: jest.fn()
    }
  }
}));

// Mock auth helpers
jest.mock('../../utils/authHelpers', () => ({
  retryWithBackoff: jest.fn(fn => fn()),
  TokenRefreshScheduler: jest.fn().mockImplementation(() => ({
    schedule: jest.fn(),
    cancel: jest.fn()
  })),
  AuthStateBroadcaster: jest.fn().mockImplementation(() => ({
    broadcast: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    close: jest.fn()
  })),
  OfflineAuthQueue: jest.fn().mockImplementation(() => ({
    enqueue: jest.fn(fn => fn()),
    clear: jest.fn()
  })),
  transformAuthError: jest.fn(error => error?.message || 'Error'),
  AuthDebugLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn()
  }))
}));

// Test component to access auth context
function TestComponent() {
  const auth = useAuth();
  const userId = useUserId();

  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user-id">{userId || 'none'}</div>
      <div data-testid="error">{auth.error || 'none'}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button onClick={() => auth.resetPassword('test@example.com')}>
        Reset Password
      </button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
    </div>
  );
}

describe('AuthUserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    });

    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    });
  });

  describe('Session Restoration', () => {
    it('should restore existing session on mount', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // Wait for session restoration
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
      });
    });

    it('should handle no session on mount', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-id')).toHaveTextContent('none');
      });
    });

    it('should handle session restoration error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: new Error('Session error')
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser, expires_at: Date.now() + 3600000 };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Simulate auth state change
      let authChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(cb => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click sign in
      const signInButton = screen.getByText('Sign In');
      await act(async () => {
        signInButton.click();
      });

      // Simulate auth state change
      act(() => {
        authChangeCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
      });
    });

    it('should handle sign in error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        new Error('Invalid login credentials')
      );

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click sign in
      const signInButton = screen.getByText('Sign In');
      await act(async () => {
        try {
          signInButton.click();
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid login credentials'
        );
      });
    });
  });

  describe('Sign Up', () => {
    it('should sign up successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser, expires_at: Date.now() + 3600000 };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click sign up
      const signUpButton = screen.getByText('Sign Up');
      await act(async () => {
        signUpButton.click();
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback')
        }
      });
    });

    it('should handle email confirmation required', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null }, // No session = confirmation required
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click sign up
      const signUpButton = screen.getByText('Sign Up');
      await act(async () => {
        signUpButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Please check your email to confirm your account'
        );
      });
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null
      });

      // Simulate auth state change
      let authChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(cb => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click sign out
      const signOutButton = screen.getByText('Sign Out');
      await act(async () => {
        signOutButton.click();
      });

      // Simulate auth state change
      act(() => {
        authChangeCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-id')).toHaveTextContent('none');
      });
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click reset password
      const resetButton = screen.getByText('Reset Password');
      await act(async () => {
        resetButton.click();
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/auth/reset-password')
        }
      );
    });
  });

  describe('Auth State Changes', () => {
    it('should handle token refresh', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        expires_at: Math.floor(Date.now() / 1000) + 7200
      };

      let authChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(cb => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Simulate token refresh
      act(() => {
        authChangeCallback('TOKEN_REFRESHED', mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });
    });

    it('should handle user update', async () => {
      const updatedUser = { id: 'user-123', email: 'updated@example.com' };
      const mockSession = {
        user: updatedUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      let authChangeCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(cb => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Simulate user update
      act(() => {
        authChangeCallback('USER_UPDATED', mockSession);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error', async () => {
      // Set initial error state
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(
        new Error('Initial error')
      );

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Initial error');
      });

      // Clear error
      const clearButton = screen.getByText('Clear Error');
      act(() => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('none');
      });
    });
  });

  describe('Hooks', () => {
    it('should throw error when useAuth is used outside provider', () => {
      const TestComponentOutside = () => {
        useAuth(); // This should throw
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponentOutside />);
      }).toThrow('useAuth must be used within AuthUserProvider');

      console.error = originalError;
    });

    it('should provide user ID through useUserId hook', async () => {
      const mockSession = {
        user: { id: 'user-456', email: 'test@example.com' },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      render(
        <AuthUserProvider>
          <TestComponent />
        </AuthUserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-456');
      });
    });
  });
});
