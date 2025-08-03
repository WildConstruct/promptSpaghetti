// Epic 9.4 - Workflow Store
// Zustand store for workflow state management
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
;
lock_stats: {
    total_active: number;
    by_type: Record;
    avg_lock_duration_hours: number;
}
;
schedule_stats: {
    total_active: number;
    by_type: Record;
    successful_executions: number;
    failed_executions: number;
}
;
    > ;
canUserTransitionState: (userId, resourceId, toStateId) => Promise;
isResourceLocked: (resourceId, lockType) => Promise;
performMaintenance: () => Promise;
// Internal actions
setLoading: (loading) => void setError;
(error) => void clearError;
() => void ;
// API base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}/api/workflow${endpoint}`;
}
const response = await fetch(url, {});
options;
headers: {
    'Content-Type';
    'application/json';
    'x-user-id';
    'current-user-id',
    ; // TODO: Get from auth context }
    options.headers;
}
;
if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
}
return response.json();
// Create the store
export const useWorkflowStore = create()();
devtools();
(set, get) => ({
    // Initial state
    states: [],
    transitions: [],
    approvals: [],
    locks: [],
    history: [],
    statistics: null,
    loading: false,
    error: null
    // State management actions
    ,
    // State management actions
    fetchStates: async (workspaceId) => { },
    try: {
        const: states = await apiCall(`/states/${workspaceId}`)
    },
    catch(error) {
        set({ error: error instanceof Error ? error.message : 'Failed to fetch states', loading: false });
        createState: async (data) => {
            try {
                set({ loading: true, error: null });
                const newState = await apiCall('/states', {});
                method: 'POST';
                body: JSON.stringify(data);
            }
            finally {
            }
        };
        ;
        set(state => ({}), states, [...state.states, newState].sort((a, b) => a.sort_order - b.sort_order));
    },
    loading: false });
;
return newState;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to create state', loading: false });
    throw error;
    updateState: async (id, updates) => {
        try {
            set({ loading: true, error: null });
            const updatedState = await apiCall(`/states/${id}`, {});
        }
        finally {
        }
        method: 'PUT';
        body: JSON.stringify(updates);
    };
    ;
    set(state => ({}), states, state.states.map(s => s.id === id ? updatedState : s), loading, false);
}
;
return updatedState;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to update state', loading: false });
    throw error;
    deleteState: async (id) => {
        try {
            set({ loading: true, error: null });
            await apiCall(`/states/${id}`, { method: 'DELETE' });
        }
        finally {
        }
        set(state => ({}), states, state.states.filter(s => s.id !== id), loading, false);
    };
}
;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to delete state', loading: false });
    throw error;
    // Transition management actions
    fetchTransitions: async (workspaceId, fromStateId) => {
        try {
            set({ loading: true, error: null });
            const queryParams = fromStateId ? `?from_state_id=${fromStateId}` : '';
        }
        finally {
        }
        const transitions = await apiCall(`/transitions/${workspaceId}${queryParams}`);
    };
    set({ transitions, loading: false });
    try {
    }
    catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to fetch transitions', loading: false });
        createTransition: async (data) => {
            try {
                set({ loading: true, error: null });
                const newTransition = await apiCall('/transitions', {});
                method: 'POST';
                body: JSON.stringify(data);
            }
            finally {
            }
        };
        ;
        set(state => ({}), transitions, [...state.transitions, newTransition]);
    }
    loading: false;
}
;
return newTransition;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to create transition', loading: false });
    throw error;
    deleteTransition: async (id) => {
        try {
            set({ loading: true, error: null });
            await apiCall(`/transitions/${id}`, { method: 'DELETE' });
        }
        finally {
        }
        set(state => ({}), transitions, state.transitions.filter(t => t.id !== id), loading, false);
    };
}
;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to delete transition', loading: false });
    throw error;
    // State transition actions
    transitionResourceState: async();
    resourceId: string;
    toStateId: string;
    actorId: string;
    options = {};
    {
        try {
            set({ loading: true, error: null });
            const result = await apiCall(`/resources/${resourceId}/transition`, {});
        }
        finally {
        }
        method: 'POST';
        body: JSON.stringify({});
        to_state_id: toStateId;
    }
    options;
}
;
set({ loading: false });
return result;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to transition state', loading: false });
    throw error;
    // Approval management actions
    fetchApprovals: async (workspaceId, filters = {}) => {
        try {
            set({ loading: true, error: null });
            const queryParams = new URLSearchParams(filters).toString();
            const approvals = await apiCall(`/approvals/${workspaceId}?${queryParams}`);
        }
        finally {
        }
        set({ approvals, loading: false });
        try {
        }
        catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch approvals', loading: false });
            createApproval: async (data) => {
                try {
                    set({ loading: true, error: null });
                    const newApproval = await apiCall('/approvals', {});
                    method: 'POST';
                    body: JSON.stringify(data);
                }
                finally {
                }
            };
            ;
            set(state => ({}), approvals, [...state.approvals, newApproval]);
        }
        loading: false;
    };
    ;
    return newApproval;
    try {
    }
    catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create approval', loading: false });
        throw error;
        approveWorkflow: async (approvalId, approverId, comment) => {
            try {
                set({ loading: true, error: null });
                const result = await apiCall(`/approvals/${approvalId}/approve`, {});
            }
            finally {
            }
            method: 'POST';
            body: JSON.stringify({ comment });
        };
        ;
        // Update approval status in local state
        set(state => ({}), approvals, state.approvals.map(a => ));
    }
    a.id === approvalId
        ? { ...a, status: 'approved', approved_by: approverId, approved_at: new Date() }
        : a;
    loading: false;
}
;
return result;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to approve workflow', loading: false });
    throw error;
    rejectWorkflow: async (approvalId, rejectorId, reason) => {
        try {
            set({ loading: true, error: null });
            const result = await apiCall(`/approvals/${approvalId}/reject`, {});
        }
        finally {
        }
        method: 'POST';
        body: JSON.stringify({ reason });
    };
    ;
    // Update approval status in local state
    set(state => ({}), approvals, state.approvals.map(a => ));
}
a.id === approvalId
    ? { ...a, status: 'rejected', approved_by: rejectorId, rejection_reason: reason }
    : a;
loading: false;
;
return result;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to reject workflow', loading: false });
    throw error;
    // Lock management actions
    fetchLocks: async (workspaceId, filters = {}) => {
        try {
            set({ loading: true, error: null });
            const queryParams = new URLSearchParams(filters).toString();
            const locks = await apiCall(`/locks/${workspaceId}?${queryParams}`);
        }
        finally {
        }
        set({ locks, loading: false });
        try {
        }
        catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch locks', loading: false });
            acquireLock: async();
            resourceId: string;
            userId: string;
            lockType = 'edit';
            options = {};
            {
                try {
                    set({ loading: true, error: null });
                    const newLock = await apiCall('/locks', {});
                    method: 'POST';
                    body: JSON.stringify({});
                    resource_id: resourceId;
                    lock_type: lockType;
                }
                finally {
                }
                options;
            }
            ;
            set(state => ({}), locks, [...state.locks, newLock]);
        }
        loading: false;
    };
    ;
    return newLock;
    try {
    }
    catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to acquire lock', loading: false });
        throw error;
        releaseLock: async (lockId, userId) => {
            try {
                set({ loading: true, error: null });
                await apiCall(`/locks/${lockId}`, { method: 'DELETE' });
            }
            finally {
            }
            set(state => ({}), locks, state.locks.filter(l => l.id !== lockId), loading, false);
        };
    }
    ;
    return true;
    try {
    }
    catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to release lock', loading: false });
        throw error;
        releaseLocksByResource: async (resourceId, userId, lockType) => {
            try {
                set({ loading: true, error: null });
                const queryParams = lockType ? `?lock_type=${lockType}` : '';
            }
            finally {
            }
            const result = await apiCall(`/locks/resource/${resourceId}${queryParams}`, {});
        };
        method: 'DELETE';
    }
    ;
    // Remove locks from local state
    set(state => ({}), locks, state.locks.filter(l => l.resource_id !== resourceId || (lockType && l.lock_type !== lockType)), loading, false);
}
;
return result.released_count;
try {
}
catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to release locks', loading: false });
    throw error;
    // History and statistics actions
    fetchHistory: async (workspaceId, filters = {}) => {
        try {
            set({ loading: true, error: null });
            const queryParams = new URLSearchParams(filters).toString();
            const history = await apiCall(`/history/${workspaceId}?${queryParams}`);
        }
        finally {
        }
        set({ history, loading: false });
        try {
        }
        catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch history', loading: false });
            fetchStatistics: async (workspaceId) => {
                try {
                    set({ loading: true, error: null });
                    const statistics = await apiCall(`/statistics/${workspaceId}`);
                }
                finally {
                }
                set({ statistics, loading: false });
                try {
                }
                catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Failed to fetch statistics', loading: false });
                    // Utility actions
                    validateStateTransition: async (resourceId, toStateId) => {
                        try {
                            return await apiCall(`/validate/transition?resource_id=${resourceId}&to_state_id=${toStateId}&user_id=current-user-id`);
                        }
                        catch (error) {
                            return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
                            canUserTransitionState: async (userId, resourceId, toStateId) => {
                                try {
                                    const result = await apiCall(`/validate/transition?resource_id=${resourceId}&to_state_id=${toStateId}&user_id=${userId}`);
                                }
                                finally {
                                }
                                return result.can_transition;
                                try {
                                }
                                catch (error) {
                                    return false;
                                }
                                isResourceLocked: async (resourceId, lockType) => {
                                    try {
                                        const queryParams = lockType ? `?lock_type=${lockType}` : '';
                                    }
                                    finally {
                                    }
                                    const result = await apiCall(`/validate/lock?resource_id=${resourceId}${queryParams}`);
                                };
                                return result.is_locked;
                                try {
                                }
                                catch (error) {
                                    return false;
                                }
                                performMaintenance: async () => {
                                    try {
                                        return await apiCall('/maintenance', { method: 'POST' });
                                        try {
                                        }
                                        catch (error) {
                                            throw error;
                                        }
                                        // Internal actions
                                        setLoading: (loading) => set({ loading });
                                        setError: (error) => set({ error });
                                        clearError: () => set({ error: null });
                                    }
                                    finally { }
                                    {
                                        name: 'workflow-store';
                                        ;
                                    }
                                };
                            };
                        }
                    };
                }
            };
        }
    };
}
