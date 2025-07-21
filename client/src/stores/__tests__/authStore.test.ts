/**
 * Authentication Store Tests
 * 
 * Comprehensive test suite for the Zustand authentication store
 */

import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../authStore';

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Authentication Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.getState().logout();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.tokenExpiration).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.returnUrl).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        roles: ['user'],
        permissions: ['graphs:read']
      };

      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
        expiresAt: new Date(Date.now() + 900000).toISOString(), // 15 minutes
        sessionId: 'mock-session-id'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123', true);
      });

      expect(success!).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.accessToken).toBe('mock-access-token');
      expect(result.current.refreshToken).toBe('mock-refresh-token');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login failure gracefully', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'wrong-password');
      });

      expect(success!).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(controlledPromise as any);

      // Start login
      act(() => {
        result.current.login('test@example.com', 'password');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: false,
          json: () => Promise.resolve({ message: 'Error' }),
        });
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Registration Functionality', () => {
    it('should register successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful' }),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.register({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        });
      });

      expect(success!).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle registration failure', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        });
      });

      expect(success!).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Token Refresh Functionality', () => {
    it('should refresh tokens successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          accessToken: 'old-access-token',
          refreshToken: 'valid-refresh-token',
          tokenExpiration: Date.now() + 60000, // 1 minute
        });
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.refreshTokens();
      });

      expect(success!).toBe(true);
      expect(result.current.accessToken).toBe('new-access-token');
      expect(result.current.refreshToken).toBe('new-refresh-token');
      expect(result.current.error).toBeNull();
    });

    it('should logout on refresh failure', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          accessToken: 'access-token',
          refreshToken: 'invalid-refresh-token',
          user: { id: '1', email: 'test@example.com' }
        });
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid refresh token' }),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.refreshTokens();
      });

      expect(success!).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
    });

    it('should handle missing refresh token', async () => {
      const { result } = renderHook(() => useAuthStore());

      let success: boolean;
      await act(async () => {
        success = await result.current.refreshTokens();
      });

      expect(success!).toBe(false);
    });
  });

  describe('Authentication Status Check', () => {
    it('should return false for unauthenticated user', async () => {
      const { result } = renderHook(() => useAuthStore());

      let status: boolean;
      await act(async () => {
        status = await result.current.checkAuthStatus();
      });

      expect(status!).toBe(false);
    });

    it('should refresh expired tokens', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state with expired token
      act(() => {
        useAuthStore.setState({
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh-token',
          tokenExpiration: Date.now() - 60000, // Expired 1 minute ago
        });
      });

      // Mock successful refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }),
      } as Response);

      let status: boolean;
      await act(async () => {
        status = await result.current.checkAuthStatus();
      });

      expect(status!).toBe(true);
      expect(result.current.accessToken).toBe('new-access-token');
    });

    it('should verify valid token with server', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state with valid token
      act(() => {
        useAuthStore.setState({
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          tokenExpiration: Date.now() + 600000, // Valid for 10 minutes
        });
      });

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: null,
        roles: ['user'],
        permissions: ['graphs:read']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      let status: boolean;
      await act(async () => {
        status = await result.current.checkAuthStatus();
      });

      expect(status!).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout Functionality', () => {
    it('should clear all auth state on logout', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          user: { id: '1', email: 'test@example.com' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          tokenExpiration: Date.now() + 600000,
          error: 'some error',
          returnUrl: '/dashboard'
        });
      });

      // Mock logout endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.tokenExpiration).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.returnUrl).toBeNull();
    });

    it('should call logout endpoint with refresh token', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({
          refreshToken: 'refresh-token-to-invalidate'
        });
      });

      act(() => {
        result.current.logout();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: undefined })
        })
      );
    });
  });

  describe('OAuth Functionality', () => {
    it('should initiate OAuth login successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockOAuthResponse = {
        url: 'https://oauth-provider.com/auth?state=abc123',
        state: 'abc123'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOAuthResponse),
      } as Response);

      let oauthResult: { url: string; state: string };
      await act(async () => {
        oauthResult = await result.current.oauthLogin('google', '/dashboard');
      });

      expect(oauthResult!).toEqual(mockOAuthResponse);
      expect(result.current.isLoading).toBe(false);
    });

    it('should process OAuth callback successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: '1',
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        isEmailVerified: true,
        roles: ['user']
      };

      const mockCallbackResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'oauth-access-token',
          refreshToken: 'oauth-refresh-token',
          expiresAt: new Date(Date.now() + 900000).toISOString()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCallbackResponse),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.processOAuthCallback('google', 'auth-code', 'state-123');
      });

      expect(success!).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('oauth@example.com');
      expect(result.current.accessToken).toBe('oauth-access-token');
    });
  });

  describe('Utility Functions', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ error: 'Some error occurred' });
      });

      expect(result.current.error).toBe('Some error occurred');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set return URL', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setReturnUrl('/protected-page');
      });

      expect(result.current.returnUrl).toBe('/protected-page');
    });

    it('should update user data', () => {
      const { result } = renderHook(() => useAuthStore());

      const initialUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: false,
        roles: ['user']
      };

      act(() => {
        useAuthStore.setState({ user: initialUser });
      });

      act(() => {
        result.current.updateUser({ firstName: 'Updated', isEmailVerified: true });
      });

      expect(result.current.user?.firstName).toBe('Updated');
      expect(result.current.user?.isEmailVerified).toBe(true);
      expect(result.current.user?.lastName).toBe('User'); // Should preserve other fields
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password');
      });

      expect(success!).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle malformed API responses', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password');
      });

      expect(success!).toBe(false);
      expect(result.current.error).toBe('Invalid JSON');
    });
  });
});