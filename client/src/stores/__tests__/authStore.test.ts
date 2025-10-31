import { act, renderHook } from '@testing-library/react';
import { authInitialState, useAuthStore } from '../authStore';

const mockFetch = jest.fn();

beforeEach(() => {
  Object.defineProperty(global, 'fetch', {
    value: mockFetch,
    writable: true
  });

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    },
    writable: true
  });

  useAuthStore.setState({ ...authInitialState });
  mockFetch.mockReset();
});

describe('authStore', () => {
  it('logs in successfully', async () => {
    const user = { id: '1', email: 'test@example.com' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'token',
        refreshToken: 'refresh',
        user,
        expiresAt: new Date(Date.now() + 60_000).toISOString()
      })
    } as Response);

    const { result } = renderHook(() => useAuthStore());
    let success = false;
    await act(async () => {
      success = await result.current.login('test@example.com', 'password', true);
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it('handles login failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid credentials' })
    } as Response);

    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.login('wrong@example.com', 'bad-password');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('refreshes tokens when available', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: '1', email: 'test@example.com' }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'new-token',
          refreshToken: 'new-refresh'
        })
      } as Response);

    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await act(async () => {
      const refreshed = await result.current.refreshTokens();
      expect(refreshed).toBe(true);
    });

    expect(result.current.accessToken).toBe('new-token');
  });

  it('logs out and clears state', () => {
    useAuthStore.setState({
      ...authInitialState,
      user: { id: '1', email: 'user@example.com' },
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true
    });

    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

