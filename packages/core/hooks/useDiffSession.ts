// Hook for managing visual diff sessions
// Story 9.3.2 - Visual Diff Tool
import { useState, useCallback } from 'react';
import {
  VisualDiffSession,
  DetailedComparison,
  CreateDiffSessionRequest,
  UpdateDiffSessionRequest
} from '../types/comparison';
interface UseDiffSessionResult {
  session: VisualDiffSession | null;
  comparison: DetailedComparison | null;
  loading: boolean;
  error: string | null;
  createSession: (request: CreateDiffSessionRequest) => Promise<void>;
  updateSession: (sessionId: string, updates: UpdateDiffSessionRequest) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export const useDiffSession = (): UseDiffSessionResult => {
  const [session, setSession] = useState<VisualDiffSession | null>(null);
  const [comparison, setComparison] = useState<DetailedComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`/api/visual-diff${url}`, {)}
      headers: {,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    return data;
  }, []);
  const createSession = useCallback(async (request: CreateDiffSessionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall('/sessions', {)
        method: 'POST',
        body: JSON.stringify(request),
      });
      setSession(result.data);
      // Fetch the comparison data
      const sessionData = await apiCall(`/sessions/${result.session_id}`);}
      setComparison(sessionData.data.comparison);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      console.error('Failed to create diff session:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);
  const updateSession = useCallback(async (sessionId: string, updates: UpdateDiffSessionRequest) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(`/sessions/${sessionId}`, {)}
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setSession(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      console.error('Failed to update diff session:', err);
    } finally {
      setLoading(false);
    }
  }, [session, apiCall]);
  const deleteSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiCall(`/sessions/${sessionId}`, {)}
        method: 'DELETE',
      });
      setSession(null);
      setComparison(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      console.error('Failed to delete diff session:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  return {
    session,
    comparison,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    clearError
  };
};