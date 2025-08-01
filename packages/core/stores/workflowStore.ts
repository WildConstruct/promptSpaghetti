// Epic 9.4 - Workflow Store
// Zustand store for workflow state management
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Type definitions for workflow entities


export interface WorkflowState { id: string;
  workspace_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_initial: boolean;
  is_final: boolean;
  is_locked: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date }



export interface WorkflowTransition { id: string;
  workspace_id: string;
  from_state_id?: string;
  to_state_id: string;
  name: string;
  description?: string;
  requires_approval: boolean;
  required_permissions: bigint;
  conditions: Record<string, unknown>;
  created_at: Date }



export interface WorkflowApproval { id: string;
  workspace_id: string;
  resource_id: string;
  transition_id: string;
  requester_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_at: Date;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
  approval_comment?: string;
  created_at: Date;
  updated_at: Date }



export interface WorkflowLock { id: string;
  workspace_id: string;
  resource_id: string;
  locked_by: string;
  lock_type: 'edit' | 'state_change' | 'delete' | 'custom';
  lock_reason?: string;
  locked_at: Date;
  expires_at?: Date;
  auto_release: boolean;
  metadata: Record<string, unknown> }



export interface WorkflowHistoryEntry { id: string;
  workspace_id: string;
  resource_id: string;
  action_type: string;
  previous_state_id?: string;
  new_state_id?: string;
  actor_id: string;
  action_timestamp: Date;
  approval_id?: string;
  transition_id?: string;
  comment?: string;
  metadata: Record<string, unknown> }



export interface WorkflowStatistics { total_states: number;
  total_transitions: number;
  pending_approvals: number;
  active_locks: number;
  scheduled_executions: number;
  resources_by_state: Record<string, number>;
  approval_stats: { }
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  avg_approval_time_hours: number;


};
  lock_stats: { 
  total_active: number;
  by_type: Record<string, number>;
  avg_lock_duration_hours: number };
  schedule_stats: { 
  total_active: number;
  by_type: Record<string, number>;
  successful_executions: number;
  failed_executions: number };


export interface StateTransitionResult { success: boolean;
  new_state_id?: string;
  approval_required?: boolean;
  approval_id?: string;
  error?: string;
  workflow_history_id?: string;
  // Store interface
  interface WorkflowStore {
  // State
  states: WorkflowState;
  transitions: WorkflowTransition;
  approvals: WorkflowApproval;
  locks: WorkflowLock;
  history: WorkflowHistoryEntry;
  statistics: WorkflowStatistics | null;
  loading: boolean;
  error: string | null;
  // Actions - State Management
  fetchStates: (workspaceId: string) => Promise<void>
  createState: (data: Partial<WorkflowState>) => Promise<WorkflowState>
  updateState: (id: string, updates: Partial<WorkflowState>) => Promise<WorkflowState>
  deleteState: (id: string) => Promise<void>;
  // Actions - Transition Management
  fetchTransitions: (workspaceId: string, fromStateId?: string) => Promise<void>;
  createTransition: (data: Partial<WorkflowTransition>) => Promise<WorkflowTransition>
  deleteTransition: (id: string) => Promise<void>;
  // Actions - State Transitions
  transitionResourceState: ();
  resourceId: string;
  toStateId: string;
  actorId: string;
  options?: {;
  comment?: string;
  metadata?: Record<string, unknown>;
  force?: boolean;
  lockDuration?: number;
  ) => Promise<StateTransitionResult>;
  // Actions - Approval Management
  fetchApprovals: (workspaceId: string, filters?: Record<string, string>) => Promise<void>;
  createApproval: (data: Partial<WorkflowApproval>) => Promise<WorkflowApproval>
  approveWorkflow: (approvalId: string, approverId: string, comment?: string) => Promise<StateTransitionResult>;
  rejectWorkflow: (approvalId: string, rejectorId: string, reason: string) => Promise<boolean>;
  // Actions - Lock Management
  fetchLocks: (workspaceId: string, filters?: Record<string, string>) => Promise<void>;
  acquireLock: ();
  resourceId: string;
  userId: string;
  lockType?: 'edit' | 'state_change' | 'delete' | 'custom';
  options?: {;
  reason?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  ) => Promise<WorkflowLock>;
  releaseLock: (lockId: string, userId: string) => Promise<boolean>
  releaseLocksByResource: (resourceId: string, userId: string, lockType?: string) => Promise<number>;
  // Actions - History and Statistics
  fetchHistory: (workspaceId: string, filters?: Record<string, string>) => Promise<void>;
  fetchStatistics: (workspaceId: string) => Promise<void>;
  // Actions - Utilities
  validateStateTransition: (resourceId: string, toStateId: string) => Promise<{ }
  valid: boolean;
  transition?: WorkflowTransition;
  error?: string;


>;
  canUserTransitionState: (userId: string, resourceId: string, toStateId: string) => Promise<boolean>
  isResourceLocked: (resourceId: string, lockType?: string) => Promise<boolean>;
  performMaintenance: () => Promise<unknown>;
  // Internal actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void;

// API base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Utility function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api/workflow${endpoint}`;}
  const response = await fetch(url, { )
  ...options
  headers: {
  'Content-Type': 'application/json'
  'x-user-id': 'current-user-id', // TODO: Get from auth context }
  ...options.headers
});
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);}
  return response.json();

// Create the store

export const useWorkflowStore = create<WorkflowStore>()()
  devtools();
    (set, get) => ({ )
  // Initial state
      states: []
      transitions: []
      approvals: []
      locks: []
      history: []
      statistics: null
      loading: false
      error: null
      // State management actions
      fetchStates: async (workspaceId: string) => { }
        try {
          set({ loading: true, error: null });
          const states = await apiCall(`/states/${workspaceId}`);}
          set({ states, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch states', loading: false })

  createState: async (data: Partial<WorkflowState>) => {
        try {
          set({ loading: true, error: null });
          const newState = await apiCall('/states', { )
  method: 'POST'
  body: JSON.stringify(data) }
});
          set(state => ({ )
            states: [...state.states, newState].sort((a, b) => a.sort_order - b.sort_order) }
            loading: false ;
  }));
          return newState;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create state', loading: false });
          throw error

  updateState: async (id: string, updates: Partial<WorkflowState>) => {
        try {
          set({ loading: true, error: null });
          const updatedState = await apiCall(`/states/${id}`, {)}

  method: 'PUT'
            body: JSON.stringify(updates);
  });
          set(state => ({ )
  states: state.states.map(s => s.id === id ? updatedState : s)
  loading: false }
}));
          return updatedState;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update state', loading: false });
          throw error

  deleteState: async (id: string) => {
        try {
          set({ loading: true, error: null });
          await apiCall(`/states/${id}`, { method: 'DELETE' });}
          set(state => ({ )
  states: state.states.filter(s => s.id !== id)
  loading: false }
}));
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete state', loading: false });
          throw error;

      // Transition management actions
      fetchTransitions: async (workspaceId: string, fromStateId?: string) => {
        try {
          set({ loading: true, error: null });
          const queryParams = fromStateId ? `?from_state_id=${fromStateId}` : '';}
          const transitions = await apiCall(`/transitions/${workspaceId}${queryParams}`);}
          set({ transitions, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch transitions', loading: false })

  createTransition: async (data: Partial<WorkflowTransition>) => {
        try {
          set({ loading: true, error: null });
          const newTransition = await apiCall('/transitions', { )
  method: 'POST'
  body: JSON.stringify(data) }
});
          set(state => ({ )
            transitions: [...state.transitions, newTransition] }
            loading: false ;
  }));
          return newTransition;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create transition', loading: false });
          throw error

  deleteTransition: async (id: string) => {
        try {
          set({ loading: true, error: null });
          await apiCall(`/transitions/${id}`, { method: 'DELETE' });}
          set(state => ({ )
  transitions: state.transitions.filter(t => t.id !== id)
  loading: false }
}));
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete transition', loading: false });
          throw error;

      // State transition actions
      transitionResourceState: async ()
        resourceId: string
        toStateId: string
        actorId: string
        options = {}
      ) => {
        try {
          set({ loading: true, error: null });
          const result = await apiCall(`/resources/${resourceId}/transition`, {)}

  method: 'POST'
            body: JSON.stringify({ );
  to_state_id: toStateId }
  ...options

          });
          set({ loading: false });
          return result;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to transition state', loading: false });
          throw error;

      // Approval management actions
      fetchApprovals: async (workspaceId: string, filters = {}) => {
        try {
          set({ loading: true, error: null });
          const queryParams = new URLSearchParams(filters).toString();
          const approvals = await apiCall(`/approvals/${workspaceId}?${queryParams}`);}
          set({ approvals, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch approvals', loading: false })

  createApproval: async (data: Partial<WorkflowApproval>) => {
        try {
          set({ loading: true, error: null });
          const newApproval = await apiCall('/approvals', { )
  method: 'POST'
  body: JSON.stringify(data) }
});
          set(state => ({ )
            approvals: [...state.approvals, newApproval] }
            loading: false ;
  }));
          return newApproval;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create approval', loading: false });
          throw error

  approveWorkflow: async (approvalId: string, approverId: string, comment?: string) => {
        try {
          set({ loading: true, error: null });
          const result = await apiCall(`/approvals/${approvalId}/approve`, {)}

  method: 'POST'
            body: JSON.stringify({ comment })
          });
          // Update approval status in local state
          set(state => ({ )
  approvals: state.approvals.map(a => ) }
              a.id === approvalId 
                ? { ...a, status: 'approved' as const, approved_by: approverId, approved_at: new Date() }
                : a
            )
            loading: false;
  }));
          return result;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to approve workflow', loading: false });
          throw error

  rejectWorkflow: async (approvalId: string, rejectorId: string, reason: string) => {
        try {
          set({ loading: true, error: null });
          const result = await apiCall(`/approvals/${approvalId}/reject`, {)}

  method: 'POST'
            body: JSON.stringify({ reason })
          });
          // Update approval status in local state
          set(state => ({ )
  approvals: state.approvals.map(a => ) }
              a.id === approvalId 
                ? { ...a, status: 'rejected' as const, approved_by: rejectorId, rejection_reason: reason }
                : a
            )
            loading: false;
  }));
          return result;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reject workflow', loading: false });
          throw error;

      // Lock management actions
      fetchLocks: async (workspaceId: string, filters = {}) => {
        try {
          set({ loading: true, error: null });
          const queryParams = new URLSearchParams(filters).toString();
          const locks = await apiCall(`/locks/${workspaceId}?${queryParams}`);}
          set({ locks, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch locks', loading: false })

  acquireLock: async ()
        resourceId: string
        userId: string
        lockType = 'edit'
        options = {}
      ) => {
        try {
          set({ loading: true, error: null });
          const newLock = await apiCall('/locks', { )
  method: 'POST'
  body: JSON.stringify({);
  resource_id: resourceId
  lock_type: lockType }
  ...options

          });
          set(state => ({ )
            locks: [...state.locks, newLock] }
            loading: false ;
  }));
          return newLock;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to acquire lock', loading: false });
          throw error

  releaseLock: async (lockId: string, userId: string) => {
        try {
          set({ loading: true, error: null });
          await apiCall(`/locks/${lockId}`, { method: 'DELETE' });}
          set(state => ({ )
  locks: state.locks.filter(l => l.id !== lockId)
  loading: false }
}));
          return true;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to release lock', loading: false });
          throw error

  releaseLocksByResource: async (resourceId: string, userId: string, lockType?: string) => {
        try {
          set({ loading: true, error: null });
          const queryParams = lockType ? `?lock_type=${lockType}` : '';}
          const result = await apiCall(`/locks/resource/${resourceId}${queryParams}`, {)}

  method: 'DELETE';
  });
          // Remove locks from local state
          set(state => ({ )
  locks: state.locks.filter(l => l.resource_id !== resourceId || (lockType && l.lock_type !== lockType))
  loading: false }
}));
          return result.released_count;
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to release locks', loading: false });
          throw error;

      // History and statistics actions
      fetchHistory: async (workspaceId: string, filters = {}) => {
        try {
          set({ loading: true, error: null });
          const queryParams = new URLSearchParams(filters).toString();
          const history = await apiCall(`/history/${workspaceId}?${queryParams}`);}
          set({ history, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch history', loading: false })

  fetchStatistics: async (workspaceId: string) => {
        try {
          set({ loading: true, error: null });
          const statistics = await apiCall(`/statistics/${workspaceId}`);}
          set({ statistics, loading: false });
 catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch statistics', loading: false });

      // Utility actions
      validateStateTransition: async (resourceId: string, toStateId: string) => {
        try {
          return await apiCall(`/validate/transition?resource_id=${resourceId}&to_state_id=${toStateId}&user_id=current-user-id`);}
 catch (error) {
          return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' }

  canUserTransitionState: async (userId: string, resourceId: string, toStateId: string) => {
        try {
          const result = await apiCall(`/validate/transition?resource_id=${resourceId}&to_state_id=${toStateId}&user_id=${userId}`);}
          return result.can_transition;
 catch (error) { return false }
  isResourceLocked: async (resourceId: string, lockType?: string) => {
        try {
          const queryParams = lockType ? `?lock_type=${lockType}` : '';}
          const result = await apiCall(`/validate/lock?resource_id=${resourceId}${queryParams}`);}
          return result.is_locked;
 catch (error) { return false }
  performMaintenance: async () => {
        try {
          return await apiCall('/maintenance', { method: 'POST' });
 catch (error) { throw error }
      // Internal actions
      setLoading: (loading: boolean) => set({ loading })
      setError: (error: string | null) => set({ error })
      clearError: () => set({ error: null })
    })
    {
      name: 'workflow-store');