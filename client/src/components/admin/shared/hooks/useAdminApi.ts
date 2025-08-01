/**
 * useAdminApi - Centralized API calls with authentication
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Provides authenticated API calls, error handling, and loading states
 */
import { useState, useCallback, useRef } from 'react';


interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  interface ApiResponse<T = any> {
  data: T;,
  status: number;,
  headers: Headers;
  interface UseAdminApiReturn {
  loading: boolean;,
  error: string | null;,
  apiCall: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
  clearError: () => void;,
  abort: () => void;
  // Mock auth token getter - replace with actual auth implementation
  const getAuthToken = (): string | null => {,
  return localStorage.getItem('admin_token') || localStorage.getItem('token');


};

export const useAdminApi = (): UseAdminApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiCall = useCallback(async <T = any>(;);
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = options.signal || abortControllerRef.current.signal;
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })}
      };
      const requestOptions: RequestInit = {,
  method: options.method || 'GET',
  headers: {
  ...defaultHeaders,
  ...options.headers

        signal,
        ...(options.body && {)
  body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),

      };
      // Ensure endpoint starts with / or is a full URL
      const url = endpoint.startsWith('http') ? endpoint :
                  endpoint.startsWith('/') ? endpoint : `/${endpoint}`;}
      const response = await fetch(url, requestOptions);
      // Handle different response types
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
 else {
        data = await response.text() as any;
      if (!response.ok) {
        // Extract error message from response
        const errorMessage = typeof data === 'object' && data && 'error' in data;
          ? (data as any).error
          : typeof data === 'object' && data && 'message' in data
          ? (data as any).message
          : `HTTP ${response.status}: ${response.statusText}`;}
        throw new Error(errorMessage);
      return {
  data,
  status: response.status,
  headers: response.headers,
};
 catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Request was aborted, don't set error state
          throw err;
        setError(err.message);
        throw err;
 else {
        const errorMessage = 'An unexpected error occurred';
        setError(errorMessage);
        throw new Error(errorMessage);
 finally {
      setLoading(false);
  }, []);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
  }, []);
  return {
    loading,
    error,
    apiCall,
    clearError,
    abort
  };
};

// Specialized hooks for common admin operations
export const useAdminUserApi = () => { return null; }, [apiCall]);
  const updateUserStatus = useCallback(async (userId: string, status: string, reason: string) => {
    return apiCall(`/api/admin/users/${userId}/status`, {)}
  },
  method: 'PUT',
      body: { status, reason }
    });
  }, [apiCall]);
  const deleteUser = useCallback(async (userId: string, reason: string) => {
    return apiCall(`/api/admin/users/${userId}`, {)}
  },
  method: 'DELETE',
      body: { reason }
    });
  }, [apiCall]);
  return {
    getUsers,
    updateUserStatus,
    deleteUser,
    loading,
    error,
    clearError
  };
};

export const useAdminFeatureToggleApi = () => { return null; }, [apiCall]);
  const createToggle = useCallback(async (toggleData: any) => {
  return apiCall('/api/admin/feature-toggles', {)
  method: 'POST',
  body: toggleData,
});
  }, [apiCall]);
  const updateToggle = useCallback(async (toggleId: string, data: any) => {
    return apiCall(`/api/admin/feature-toggles/${toggleId}`, {)}
  },
  method: 'PUT',
      body: data;
  });
  }, [apiCall]);
  const toggleEnabled = useCallback(async (toggleId: string, enabled: boolean, reason: string) => {
    return apiCall(`/api/admin/feature-toggles/${toggleId}/toggle`, {)}
  },
  method: 'POST',
      body: { enabled, reason }
    });
  }, [apiCall]);
  return {
    getToggles,
    createToggle,
    updateToggle,
    toggleEnabled,
    loading,
    error,
    clearError
  };
};

export default useAdminApi;