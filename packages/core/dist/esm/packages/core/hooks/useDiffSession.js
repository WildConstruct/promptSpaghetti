// Hook for managing visual diff sessions
// Story 9.3.2 - Visual Diff Tool
import { useState, useCallback } from 'react';
from;
'../types/comparison';
export const useDiffSession = () => { };
const [session, setSession] = useState(null);
const [comparison, setComparison] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const apiCall = useCallback(async (url, options = {}) => {
    const response = await fetch(`/api/visual-diff${url}`, {});
}, headers, { 'Content-Type': 'application/json' }, ...options.headers, ...options);
;
const data = await response.json();
if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
    return data;
}
[];
;
const createSession = useCallback(async (request) => {
    setLoading(true);
    setError(null);
    try {
        const result = await apiCall('/sessions', {});
        method: 'POST';
        body: JSON.stringify(request);
    }
    finally {
    }
});
setSession(result.data);
// Fetch the comparison data
const sessionData = await apiCall(`/sessions/${result.session_id}`);
setComparison(sessionData.data.comparison);
try {
}
catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
    setError(errorMessage);
    console.error('Failed to create diff session:', err);
}
finally {
    setLoading(false);
}
[apiCall];
;
const updateSession = useCallback(async (sessionId, updates) => {
    if (!session)
        return;
    setLoading(true);
    setError(null);
    try {
        const result = await apiCall(`/sessions/${sessionId}`, {});
    }
    finally {
    }
    method: 'PATCH';
    body: JSON.stringify(updates);
});
setSession(result.data);
try {
}
catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
    setError(errorMessage);
    console.error('Failed to update diff session:', err);
}
finally {
    setLoading(false);
}
[session, apiCall];
;
const deleteSession = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
        await apiCall(`/sessions/${sessionId}`, {});
    }
    finally {
    }
    method: 'DELETE';
});
setSession(null);
setComparison(null);
try {
}
catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
    setError(errorMessage);
    console.error('Failed to delete diff session:', err);
}
finally {
    setLoading(false);
}
[apiCall];
;
const clearError = useCallback(() => { setError(null); }, []);
return { session,
    comparison,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession };
clearError;
;
;
