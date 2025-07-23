/**
 * Epic 9.2.1 - useWorkspaces Hook
 * React hook for workspace management operations
 */
import { useState, useEffect, useCallback } from 'react';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
export function useWorkspaces(userId, options = {}) {
    const { autoRefresh = false, refreshInterval = 30000 } = options;
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Fetch workspaces from API
    const fetchWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE}/workspaces`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId // Mock auth header
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
            }
            const data = await response.json();
            setWorkspaces(data.data || []);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Failed to fetch workspaces:', err);
        }
        finally {
            setLoading(false);
        }
    }, [userId]);
    // Create new workspace
    const createWorkspace = useCallback(async (data) => {
        const response = await fetch(`${API_BASE}/workspaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create workspace: ${response.statusText}`);
        }
        const newWorkspace = await response.json();
        // Add to local state
        setWorkspaces(prev => [newWorkspace, ...prev]);
        return newWorkspace;
    }, [userId]);
    // Update existing workspace
    const updateWorkspace = useCallback(async (workspaceId, data) => {
        const response = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update workspace: ${response.statusText}`);
        }
        const updatedWorkspace = await response.json();
        // Update local state
        setWorkspaces(prev => prev.map(ws => ws.id === workspaceId ? updatedWorkspace : ws));
        return updatedWorkspace;
    }, [userId]);
    // Archive workspace
    const archiveWorkspace = useCallback(async (workspaceId) => {
        const response = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
            method: 'DELETE',
            headers: {
                'X-User-Id': userId
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to archive workspace: ${response.statusText}`);
        }
        // Remove from local state
        setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    }, [userId]);
    // Invite user to workspace
    const inviteUser = useCallback(async (workspaceId, userIdToInvite, role) => {
        const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify({
                user_id: userIdToInvite,
                role
            })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to invite user: ${response.statusText}`);
        }
    }, [userId]);
    // Refresh workspaces
    const refreshWorkspaces = useCallback(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);
    // Initial fetch
    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);
    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(fetchWorkspaces, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchWorkspaces]);
    return {
        workspaces,
        loading,
        error,
        createWorkspace,
        updateWorkspace,
        archiveWorkspace,
        inviteUser,
        refreshWorkspaces
    };
}
