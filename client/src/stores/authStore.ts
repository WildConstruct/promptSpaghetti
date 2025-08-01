/**
 * Authentication Store - Zustand-based state management for user authentication
 * 
 * Manages user login state, JWT tokens, and session persistence
 * Following patterns established in graphStore.ts
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


export interface User {
  id: string;,
  email: string;,
  firstName: string;,
  lastName: string;,
  isEmailVerified: boolean;,
  roles: string;
  preferences?: {,
  theme?: 'light' | 'dark';
  notifications?: boolean;


};



export interface AuthState {
  // User state
  user: User | null;,
  isAuthenticated: boolean;,
  isLoading: boolean;
  // Token management
  accessToken: string | null;,
  refreshToken: string | null;,
  tokenExpiration: number | null;
  // UI state
  error: string | null;,
  returnUrl: string | null;
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: {),
  email: string;,
  password: string;,
  firstName: string;,
  lastName: string;


}) => Promise<boolean>;
  oauthLogin: (provider: string, returnUrl?: string) => Promise<{ url: string; state: string }>;
  processOAuthCallback: (provider: string, code: string, state: string) => Promise<boolean>;,
  logout: () => void;,
  refreshTokens: () => Promise<boolean>;,
  clearError: () => void;,
  setReturnUrl: (url: string) => void;,
  updateUser: (userData: Partial<User>) => void;,
  checkAuthStatus: () => Promise<boolean>;

// API base URL - use environment variable or default to server port
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthState>()()
  persist();
    (set, get) => ({)
  // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiration: null,
      error: null,
      returnUrl: null,
      // Login action
      login: async (email: string, password: string, rememberMe: boolean = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {)}
  },
  method: 'POST',
            headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ ),
              email, 
              password, 
              rememberMe 

          });
          if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Login failed');
  const data = await response.json();
  // Calculate token expiration from expiresAt field
  const tokenExpiration = new Date(data.expiresAt).getTime();
  set({)
  user: data.user,
  isAuthenticated: true,
  isLoading: false,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  tokenExpiration,
  error: null,
});
          return true;
 catch (error) {
  set({)
  isLoading: false,
  error: error instanceof Error ? error.message : 'Login failed',
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
});
          return false;

      // Register action
      register: async (userData) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {)}
  },
  method: 'POST',
            headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify(userData);
  });
          if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Registration failed');
  const data = await response.json();
  set({)
  isLoading: false,
  error: null,
});
          // Note: After registration, user typically needs to verify email
          // so we don't automatically log them in
          return true;
 catch (error) {
  set({)
  isLoading: false,
  error: error instanceof Error ? error.message : 'Registration failed',
});
          return false;

      // OAuth login initiation
      oauthLogin: async (provider: string, returnUrl?: string) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams({)
  provider,
            ...(returnUrl && { returnUrl })
          });
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/authorize?${queryParams.toString()}`, {},},
  method: 'GET',
            headers: {
  'Content-Type': 'application/json',
});
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'OAuth authorization failed');
          const data = await response.json();
          set({ isLoading: false });
          return { url: data.url, state: data.state };
 catch (error) {
  set({)
  isLoading: false,
  error: error instanceof Error ? error.message : 'OAuth authorization failed',
});
          throw error;

      // Process OAuth callback
      processOAuthCallback: async (provider: string, code: string, state: string) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams({)
  code,
            state
          });
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/callback/${provider}?${queryParams.toString()}`, {},},
  method: 'GET',
            headers: {
  'Content-Type': 'application/json',
});
          if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'OAuth callback failed');
  const data = await response.json();
  // Calculate token expiration
  const tokenExpiration = new Date(data.tokens.expiresAt).getTime();
  set({)
  user: data.user,
  isAuthenticated: true,
  isLoading: false,
  accessToken: data.tokens.accessToken,
  refreshToken: data.tokens.refreshToken,
  tokenExpiration,
  error: null,
});
          return true;
 catch (error) {
  set({)
  isLoading: false,
  error: error instanceof Error ? error.message : 'OAuth callback failed',
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
});
          return false;

      // Logout action
      logout: () => {,
        const { refreshToken } = get();
        // Call logout endpoint to invalidate refresh token on server
        if (refreshToken) {
          fetch(`${API_BASE_URL}/api/auth/logout`, {)}
  },
  method: 'POST',
            headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ sessionId: undefined })
          }).catch(console.error); // Don't block logout on server error
        set({)
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  error: null,
  returnUrl: null,
});

      // Refresh tokens
      refreshTokens: async () => {,
        const { refreshToken } = get();
        if (!refreshToken) {
          return false;
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {)}
  },
  method: 'POST',
            headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({ refreshToken })
          });
          if (!response.ok) {
  throw new Error('Token refresh failed');
  const data = await response.json();
  const tokenExpiration = Date.now() + (15 * 60 * 1000); // 15 minutes;
  set({)
  accessToken: data.accessToken,
  refreshToken: data.refreshToken || refreshToken,
  tokenExpiration,
  error: null,
});
          return true;
 catch (error) {
          // Refresh failed, clear auth state
          get().logout();
          return false;

      // Clear error
      clearError: () => {,
        set({ error: null });

      // Set return URL for post-login redirect
      setReturnUrl: (url: string) => {,
        set({ returnUrl: url });

      // Update user data
      updateUser: (userData: Partial<User>) => {,
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });

      // Check authentication status (for app initialization)
      checkAuthStatus: async () => {,
        const { accessToken, refreshToken, tokenExpiration } = get();
        if (!accessToken || !refreshToken) {
          return false;
        // Check if token is expired
        if (tokenExpiration && Date.now() >= tokenExpiration) {
          // Try to refresh token
          return await get().refreshTokens();
        // Token is still valid, verify with server
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {)}
  },
  headers: {
              'Authorization': `Bearer ${accessToken}`}
          });
          if (!response.ok) {
  throw new Error('Authentication check failed');
  const userData = await response.json();
  set({ )
  user: userData,
  isAuthenticated: true,
});
          return true;
 catch (error) {
          // Auth check failed, try to refresh
          return await get().refreshTokens();
    }),
    {
  name: 'auth-storage', // localStorage key,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({),
  // Only persist essential auth data
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  tokenExpiration: state.tokenExpiration,
  returnUrl: state.returnUrl,

);

// Utility function to get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`}

      'Content-Type': 'application/json'
    };
  return {
  'Content-Type': 'application/json',
};
};

// Utility function to make authenticated API calls
export const authenticatedFetch = async (((
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
  const authHeaders = getAuthHeaders();
  const response = await fetch(url, {)
  ...options,
  headers: {,
  ...authHeaders,
  ...options.headers
});
  // If token expired, try to refresh and retry
  if (response.status === 401) {
  const authStore = useAuthStore.getState();
  const refreshed = await authStore.refreshTokens();
  if (refreshed) {
  // Retry with new token
  const newAuthHeaders = getAuthHeaders();
  return fetch(url, {)
  ...options,
  headers: {,
  ...newAuthHeaders,
  ...options.headers
});
  return response;
};

// Auto-refresh token setup
export const setupTokenRefresh = (): (() => void) => {
  const checkAndRefresh = async () => {
    const { isAuthenticated, tokenExpiration, refreshTokens } = useAuthStore.getState();
    if (isAuthenticated && tokenExpiration) {
      // Refresh token 5 minutes before expiration
      const refreshTime = tokenExpiration - (5 * 60 * 1000);
      if (Date.now() >= refreshTime) {
        await refreshTokens();
  };
  // Check every minute
  const interval = setInterval(checkAndRefresh, 60 * 1000);
  // Return cleanup function
  return () => clearInterval(interval);
};

export default useAuthStore;