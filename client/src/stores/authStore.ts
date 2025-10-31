import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresAt?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  returnUrl: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setReturnUrl: (url: string | null) => void;
  setUser: (user: AuthUser | null) => void;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  returnUrl: null
} satisfies Omit<AuthState, 'login' | 'register' | 'refreshTokens' | 'logout' | 'clearError' | 'setReturnUrl' | 'setUser'>;

export const authInitialState = { ...initialState };

const persistTokens = (accessToken: string | null, refreshToken: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (accessToken || refreshToken) {
    window.localStorage.setItem(
      'auth.tokens',
      JSON.stringify({ accessToken, refreshToken })
    );
  } else {
    window.localStorage.removeItem('auth.tokens');
  }
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') {
      return data.message;
    }
  } catch {
    // ignore parsing issues
  }
  return `${response.status} ${response.statusText}`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as LoginResponse;
      const tokenExpiration = data.expiresAt ? Date.parse(data.expiresAt) : null;

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiration,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      if (remember) {
        persistTokens(data.accessToken, data.refreshToken);
      }

      return true;
    } catch (error) {
      set({
        ...initialState,
        error: error instanceof Error ? error.message : 'Unable to login',
        isLoading: false
      });
      persistTokens(null, null);
      return false;
    }
  },

  register: async payload => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      set({ isLoading: false, error: null });
      return true;
    } catch (error) {
      set({
        ...initialState,
        error: error instanceof Error ? error.message : 'Unable to register',
        isLoading: false
      });
      return false;
    }
  },

  refreshTokens: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      set({ ...initialState });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as Partial<LoginResponse>;
      const tokenExpiration = data.expiresAt ? Date.parse(data.expiresAt) : null;

      set({
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? refreshToken,
        tokenExpiration,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      persistTokens(data.accessToken ?? null, data.refreshToken ?? refreshToken);
      return true;
    } catch (error) {
      set({ ...initialState, error: error instanceof Error ? error.message : 'Token refresh failed' });
      persistTokens(null, null);
      return false;
    }
  },

  logout: () => {
    set({ ...initialState });
    persistTokens(null, null);
  },

  clearError: () => set({ error: null }),

  setReturnUrl: url => set({ returnUrl: url }),

  setUser: user => set({ user, isAuthenticated: Boolean(user) })
}));
