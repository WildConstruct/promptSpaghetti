/**
 * Comprehensive Tests for Workflow Store
 * Tests all workflow state management functionality including:
 * - State CRUD operations
 * - Transition management 
 * - Approval workflows
 * - Lock management
 * - History and statistics
 * - Error handling and edge cases
 */
import { renderHook, act } from '@testing-library/react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type {
  WorkflowState,
  WorkflowTransition,
  WorkflowApproval,
  WorkflowLock,
  WorkflowHistoryEntry,
  WorkflowStatistics,
  StateTransitionResult
} from '../../stores/workflowStore';

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Test data generators
const createMockState = (overrides: Partial<WorkflowState> = {}): WorkflowState => ({)
  id: 'state-1',
  workspace_id: 'workspace-1',
  name: 'Draft',
  description: 'Initial draft state',
  color: '#gray',
  icon: 'draft',
  is_initial: true,
  is_final: false,
  is_locked: false,
  sort_order: 1,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides
});
const createMockTransition = (overrides: Partial<WorkflowTransition> = {}): WorkflowTransition => ({)
  id: 'transition-1',
  workspace_id: 'workspace-1',
  from_state_id: 'state-1',
  to_state_id: 'state-2',
  name: 'Submit for Review',
  description: 'Move to review state',
  requires_approval: true,
  required_permissions: BigInt(4),
  conditions: {},
  created_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides
});
const createMockApproval = (overrides: Partial<WorkflowApproval> = {}): WorkflowApproval => ({)
  id: 'approval-1',
  workspace_id: 'workspace-1',
  resource_id: 'resource-1',
  transition_id: 'transition-1',
  requester_id: 'user-1',
  status: 'pending',
  requested_at: new Date('2024-01-01T00:00:00Z'),
  due_date: new Date('2024-01-08T00:00:00Z'),
  priority: 'medium',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides
});
const createMockLock = (overrides: Partial<WorkflowLock> = {}): WorkflowLock => ({)
  id: 'lock-1',
  workspace_id: 'workspace-1',
  resource_id: 'resource-1',
  locked_by: 'user-1',
  lock_type: 'edit',
  lock_reason: 'Editing content',
  locked_at: new Date('2024-01-01T00:00:00Z'),
  expires_at: new Date('2024-01-01T01:00:00Z'),
  auto_release: true,
  metadata: {},
  ...overrides
});
const createMockHistoryEntry = (overrides: Partial<WorkflowHistoryEntry> = {}): WorkflowHistoryEntry => ({)
  id: 'history-1',
  workspace_id: 'workspace-1',
  resource_id: 'resource-1',
  action_type: 'state_transition',
  previous_state_id: 'state-1',
  new_state_id: 'state-2',
  actor_id: 'user-1',
  action_timestamp: new Date('2024-01-01T00:00:00Z'),
  approval_id: 'approval-1',
  transition_id: 'transition-1',
  comment: 'Approved for review',
  metadata: {},
  ...overrides
});
const createMockStatistics = (overrides: Partial<WorkflowStatistics> = {}): WorkflowStatistics => ({)
  total_states: 5,
  total_transitions: 8,
  pending_approvals: 3,
  active_locks: 2,
  scheduled_executions: 1,
  resources_by_state: {
  'state-1': 10,
  'state-2': 5,
  'state-3': 2,
},
  approval_stats: {
  pending: 3,
  approved: 15,
  rejected: 2,
  cancelled: 1,
  avg_approval_time_hours: 24.5,
},
  lock_stats: {
  total_active: 2,
  by_type: {
  edit: 1,
  state_change: 1,
},
  avg_lock_duration_hours: 2.5;
  },
  schedule_stats: {
  total_active: 1,
  by_type: {
  cron: 1,
},
  successful_executions: 45,
    failed_executions: 2;
  }
  ...overrides
});

// Helper to mock successful API response
const mockApiResponse = (data: any) => {
  mockFetch.mockResolvedValueOnce({)
  ok: true,
  json: async () => data,
} as Response);
};

// Helper to mock API error response
const mockApiError = (status: number = 500, statusText: string = 'Internal Server Error') => {
  mockFetch.mockResolvedValueOnce({)
  ok: false,
    status,
    statusText,
    json: async () => ({ error: statusText })
  } as Response);
};
describe('Workflow Store', () => {
  beforeEach(() => {
  mockFetch.mockClear();
  // Reset store state before each test
  useWorkflowStore.setState({)
  states: [],
  transitions: [],
  approvals: [],
  locks: [],
  history: [],
  statistics: null,
  loading: false,
  error: null,
});
  });
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useWorkflowStore());
      expect(result.current.states).toEqual([]);
      expect(result.current.transitions).toEqual([]);
      expect(result.current.approvals).toEqual([]);
      expect(result.current.locks).toEqual([]);
      expect(result.current.history).toEqual([]);
      expect(result.current.statistics).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
  describe('State Management', () => {
    describe('fetchStates', () => {
      it('should fetch states successfully', async () => {
        const mockStates = [createMockState(), createMockState({ id: 'state-2', name: 'Review' })];
        mockApiResponse(mockStates);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.fetchStates('workspace-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/states/workspace-1',
          expect.objectContaining({)
  headers: expect.objectContaining({,)
  'Content-Type': 'application/json',
  'x-user-id': 'current-user-id',
}
  }
        );
        expect(result.current.states).toEqual(mockStates);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
      it('should handle fetch states error', async () => {
        mockApiError(404, 'Workspace not found');
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.fetchStates('nonexistent-workspace');
        });
        expect(result.current.states).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('API call failed: 404 Workspace not found');
      });
    });
    describe('createState', () => {
  it('should create state successfully', async () => {
  const newStateData = {
  workspace_id: 'workspace-1',
  name: 'New State',
  color: '#blue',
  sort_order: 2,
};
        const createdState = createMockState({ ...newStateData, id: 'state-new' });
        mockApiResponse(createdState);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const state = await result.current.createState(newStateData);
          expect(state).toEqual(createdState);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/states',
          expect.objectContaining({)
  method: 'POST',
  body: JSON.stringify(newStateData),
}
        );
        expect(result.current.states).toContain(createdState);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
      it('should sort states by sort_order after creation', async () => {
        const existingState1 = createMockState({ id: 'state-1', sort_order: 1 });
        const existingState3 = createMockState({ id: 'state-3', sort_order: 3 });
        const newState = createMockState({ id: 'state-2', sort_order: 2 });
        // Set initial states
        useWorkflowStore.setState({ states: [existingState1, existingState3] });
        mockApiResponse(newState);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.createState({ name: 'Middle State', sort_order: 2 });
        });
        expect(result.current.states).toEqual([existingState1, newState, existingState3]);
      });
      it('should handle create state error', async () => {
        mockApiError(400, 'Invalid state data');
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await expect(result.current.createState({})).rejects.toThrow();
        });
        expect(result.current.error).toBe('API call failed: 400 Invalid state data');
        expect(result.current.loading).toBe(false);
      });
    });
    describe('updateState', () => {
      it('should update state successfully', async () => {
        const existingState = createMockState();
        const updates = { name: 'Updated Draft', color: '#green' };
        const updatedState = { ...existingState, ...updates };
        useWorkflowStore.setState({ states: [existingState] });
        mockApiResponse(updatedState);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const state = await result.current.updateState('state-1', updates);
          expect(state).toEqual(updatedState);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/states/state-1',
          expect.objectContaining({)
  method: 'PUT',
  body: JSON.stringify(updates),
}
        );
        expect(result.current.states[0]).toEqual(updatedState);
      });
    });
    describe('deleteState', () => {
      it('should delete state successfully', async () => {
        const state1 = createMockState({ id: 'state-1' });
        const state2 = createMockState({ id: 'state-2' });
        useWorkflowStore.setState({ states: [state1, state2] });
        mockApiResponse({});
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.deleteState('state-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/states/state-1',
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(result.current.states).toEqual([state2]);
      });
    });
  });
  describe('Transition Management', () => {
    describe('fetchTransitions', () => {
      it('should fetch all transitions for workspace', async () => {
        const mockTransitions = [;
          createMockTransition(),
          createMockTransition({ id: 'transition-2', name: 'Approve' })
        ];
        mockApiResponse(mockTransitions);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.fetchTransitions('workspace-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/transitions/workspace-1',
          expect.any(Object)
        );
        expect(result.current.transitions).toEqual(mockTransitions);
      });
      it('should fetch transitions filtered by from_state_id', async () => {
        const mockTransitions = [createMockTransition()];
        mockApiResponse(mockTransitions);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.fetchTransitions('workspace-1', 'state-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/transitions/workspace-1?from_state_id=state-1',
          expect.any(Object)
        );
      });
    });
    describe('createTransition', () => {
  it('should create transition successfully', async () => {
  const transitionData = {
  workspace_id: 'workspace-1',
  from_state_id: 'state-1',
  to_state_id: 'state-2',
  name: 'New Transition',
  requires_approval: false,
};
        const createdTransition = createMockTransition({ ...transitionData, id: 'transition-new' });
        mockApiResponse(createdTransition);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const transition = await result.current.createTransition(transitionData);
          expect(transition).toEqual(createdTransition);
        });
        expect(result.current.transitions).toContain(createdTransition);
      });
    });
    describe('deleteTransition', () => {
      it('should delete transition successfully', async () => {
        const transition1 = createMockTransition({ id: 'transition-1' });
        const transition2 = createMockTransition({ id: 'transition-2' });
        useWorkflowStore.setState({ transitions: [transition1, transition2] });
        mockApiResponse({});
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.deleteTransition('transition-1');
        });
        expect(result.current.transitions).toEqual([transition2]);
      });
    });
  });
  describe('State Transitions', () => {
  describe('transitionResourceState', () => {
  it('should transition resource state successfully', async () => {
  const transitionResult: StateTransitionResult = {,
  success: true,
  new_state_id: 'state-2',
  approval_required: false,
  workflow_history_id: 'history-1',
};
        mockApiResponse(transitionResult);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.transitionResourceState(;);
            'resource-1',
            'state-2',
            'user-1',
            { comment: 'Moving to review', force: false }
          );
          expect(result_data).toEqual(transitionResult);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/resources/resource-1/transition',
          expect.objectContaining({)
  method: 'POST',
  body: JSON.stringify({,)
  to_state_id: 'state-2',
  comment: 'Moving to review',
  force: false,
}
  }
        );
      });
      it('should handle transition requiring approval', async () => {
  const transitionResult: StateTransitionResult = {,
  success: true,
  approval_required: true,
  approval_id: 'approval-1',
  error: undefined,
};
        mockApiResponse(transitionResult);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.transitionResourceState(;);
            'resource-1',
            'state-2',
            'user-1'
          );
          expect(result_data.approval_required).toBe(true);
          expect(result_data.approval_id).toBe('approval-1');
        });
      });
    });
  });
  describe('Approval Management', () => {
    describe('fetchApprovals', () => {
      it('should fetch approvals with filters', async () => {
        const mockApprovals = [createMockApproval(), createMockApproval({ id: 'approval-2' })];
        mockApiResponse(mockApprovals);
        const { result } = renderHook(() => useWorkflowStore());
        const filters = { status: 'pending', priority: 'high' };
        await act(async () => {
          await result.current.fetchApprovals('workspace-1', filters);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/approvals/workspace-1?status=pending&priority=high',
          expect.any(Object)
        );
        expect(result.current.approvals).toEqual(mockApprovals);
      });
    });
    describe('approveWorkflow', () => {
      it('should approve workflow successfully', async () => {
        const approval = createMockApproval({ id: 'approval-1', status: 'pending' });
        const transitionResult: StateTransitionResult = {,
  success: true,
  new_state_id: 'state-2',
  workflow_history_id: 'history-1',
};
        useWorkflowStore.setState({ approvals: [approval] });
        mockApiResponse(transitionResult);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.approveWorkflow('approval-1', 'user-2', 'Looks good!');
          expect(result_data).toEqual(transitionResult);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/approvals/approval-1/approve',
          expect.objectContaining({)
  method: 'POST',
            body: JSON.stringify({ comment: 'Looks good!' })
  }
        );
        // Check that approval status was updated in local state
        const updatedApproval = result.current.approvals.find(a => a.id === 'approval-1');
        expect(updatedApproval?.status).toBe('approved');
        expect(updatedApproval?.approved_by).toBe('user-2');
        expect(updatedApproval?.approved_at).toBeInstanceOf(Date);
      });
    });
    describe('rejectWorkflow', () => {
      it('should reject workflow successfully', async () => {
        const approval = createMockApproval({ id: 'approval-1', status: 'pending' });
        useWorkflowStore.setState({ approvals: [approval] });
        mockApiResponse({ success: true });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.rejectWorkflow('approval-1', 'user-2', 'Needs more work');
          expect(result_data).toBe(true);
        });
        // Check that approval status was updated
        const updatedApproval = result.current.approvals.find(a => a.id === 'approval-1');
        expect(updatedApproval?.status).toBe('rejected');
        expect(updatedApproval?.approved_by).toBe('user-2');
        expect(updatedApproval?.rejection_reason).toBe('Needs more work');
      });
    });
  });
  describe('Lock Management', () => {
    describe('acquireLock', () => {
      it('should acquire lock successfully', async () => {
        const newLock = createMockLock();
        mockApiResponse(newLock);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const lock = await result.current.acquireLock(;);
            'resource-1',
            'user-1',
            'edit',
            { reason: 'Editing content', duration: 3600 }
          );
          expect(lock).toEqual(newLock);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/locks',
          expect.objectContaining({)
  method: 'POST',
  body: JSON.stringify({,)
  resource_id: 'resource-1',
  lock_type: 'edit',
  reason: 'Editing content',
  duration: 3600,
}
  }
        );
        expect(result.current.locks).toContain(newLock);
      });
      it('should use default lock type when not specified', async () => {
        const newLock = createMockLock({ lock_type: 'edit' });
        mockApiResponse(newLock);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.acquireLock('resource-1', 'user-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/locks',
          expect.objectContaining({)
  body: JSON.stringify({,)
  resource_id: 'resource-1',
  lock_type: 'edit',
}
  }
        );
      });
    });
    describe('releaseLock', () => {
      it('should release lock successfully', async () => {
        const lock1 = createMockLock({ id: 'lock-1' });
        const lock2 = createMockLock({ id: 'lock-2' });
        useWorkflowStore.setState({ locks: [lock1, lock2] });
        mockApiResponse({});
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.releaseLock('lock-1', 'user-1');
          expect(result_data).toBe(true);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/locks/lock-1',
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(result.current.locks).toEqual([lock2]);
      });
    });
    describe('releaseLocksByResource', () => {
      it('should release all locks for resource', async () => {
        const lock1 = createMockLock({ id: 'lock-1', resource_id: 'resource-1', lock_type: 'edit' });
        const lock2 = createMockLock({ id: 'lock-2', resource_id: 'resource-1', lock_type: 'state_change' });
        const lock3 = createMockLock({ id: 'lock-3', resource_id: 'resource-2', lock_type: 'edit' });
        useWorkflowStore.setState({ locks: [lock1, lock2, lock3] });
        mockApiResponse({ released_count: 2 });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const count = await result.current.releaseLocksByResource('resource-1', 'user-1');
          expect(count).toBe(2);
        });
        expect(result.current.locks).toEqual([lock3]); // Only resource-2 lock should remain
      });
      it('should release locks by specific type for resource', async () => {
        const lock1 = createMockLock({ id: 'lock-1', resource_id: 'resource-1', lock_type: 'edit' });
        const lock2 = createMockLock({ id: 'lock-2', resource_id: 'resource-1', lock_type: 'state_change' });
        useWorkflowStore.setState({ locks: [lock1, lock2] });
        mockApiResponse({ released_count: 1 });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const count = await result.current.releaseLocksByResource('resource-1', 'user-1', 'edit');
          expect(count).toBe(1);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/locks/resource/resource-1?lock_type=edit',
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(result.current.locks).toEqual([lock2]); // Only state_change lock should remain
      });
    });
  });
  describe('History and Statistics', () => {
    describe('fetchHistory', () => {
      it('should fetch history with filters', async () => {
        const mockHistory = [createMockHistoryEntry()];
        mockApiResponse(mockHistory);
        const { result } = renderHook(() => useWorkflowStore());
        const filters = { resource_id: 'resource-1', limit: '10' };
        await act(async () => {
          await result.current.fetchHistory('workspace-1', filters);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/history/workspace-1?resource_id=resource-1&limit=10',
          expect.any(Object)
        );
        expect(result.current.history).toEqual(mockHistory);
      });
    });
    describe('fetchStatistics', () => {
      it('should fetch statistics successfully', async () => {
        const mockStats = createMockStatistics();
        mockApiResponse(mockStats);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          await result.current.fetchStatistics('workspace-1');
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/statistics/workspace-1',
          expect.any(Object)
        );
        expect(result.current.statistics).toEqual(mockStats);
      });
    });
  });
  describe('Utility Functions', () => {
  describe('validateStateTransition', () => {
  it('should return valid transition', async () => {
  const validationResult = {
  valid: true,
  transition: createMockTransition(),
  can_transition: true,
};
        mockApiResponse(validationResult);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.validateStateTransition('resource-1', 'state-2');
          expect(result_data.valid).toBe(true);
          expect(result_data.transition).toBeDefined();
        });
      });
      it('should handle validation error gracefully', async () => {
        mockApiError(400, 'Invalid transition');
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.validateStateTransition('resource-1', 'invalid-state');
          expect(result_data.valid).toBe(false);
          expect(result_data.error).toContain('Invalid transition');
        });
      });
    });
    describe('canUserTransitionState', () => {
      it('should return true when user can transition', async () => {
        mockApiResponse({ can_transition: true });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const canTransition = await result.current.canUserTransitionState('user-1', 'resource-1', 'state-2');
          expect(canTransition).toBe(true);
        });
      });
      it('should return false when user cannot transition', async () => {
        mockApiResponse({ can_transition: false });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const canTransition = await result.current.canUserTransitionState('user-1', 'resource-1', 'state-2');
          expect(canTransition).toBe(false);
        });
      });
      it('should return false on API error', async () => {
        mockApiError(403, 'Forbidden');
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const canTransition = await result.current.canUserTransitionState('user-1', 'resource-1', 'state-2');
          expect(canTransition).toBe(false);
        });
      });
    });
    describe('isResourceLocked', () => {
      it('should return lock status', async () => {
        mockApiResponse({ is_locked: true });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const isLocked = await result.current.isResourceLocked('resource-1');
          expect(isLocked).toBe(true);
        });
      });
      it('should check specific lock type', async () => {
        mockApiResponse({ is_locked: false });
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const isLocked = await result.current.isResourceLocked('resource-1', 'edit');
          expect(isLocked).toBe(false);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/validate/lock?resource_id=resource-1&lock_type=edit',
          expect.any(Object)
        );
      });
    });
    describe('performMaintenance', () => {
  it('should perform maintenance successfully', async () => {
  const maintenanceResult = {
  expired_locks_released: 5,
  expired_approvals_cancelled: 2,
  maintenance_timestamp: new Date().toISOString(),
};
        mockApiResponse(maintenanceResult);
        const { result } = renderHook(() => useWorkflowStore());
        await act(async () => {
          const result_data = await result.current.performMaintenance();
          expect(result_data).toEqual(maintenanceResult);
        });
        expect(mockFetch).toHaveBeenCalledWith()
          'http://localhost:8000/api/workflow/maintenance',
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });
  describe('Internal Actions', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useWorkflowStore());
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.loading).toBe(true);
    });
    it('should set error state', () => {
      const { result } = renderHook(() => useWorkflowStore());
      act(() => {
        result.current.setError('Test error');
      });
      expect(result.current.error).toBe('Test error');
    });
    it('should clear error state', () => {
      const { result } = renderHook(() => useWorkflowStore());
      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });
  describe('Error Handling', () => {
    it('should handle network errors appropriately', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        await result.current.fetchStates('workspace-1');
      });
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        await result.current.fetchStates('workspace-1');
      });
      expect(result.current.error).toBe('Failed to fetch states');
      expect(result.current.loading).toBe(false);
    });
    it('should set loading to false on error', async () => {
      mockApiError(500, 'Server error');
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        await result.current.fetchStatistics('workspace-1');
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Server error');
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty API responses gracefully', async () => {
      mockApiResponse([]);
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        await result.current.fetchStates('workspace-1');
      });
      expect(result.current.states).toEqual([]);
      expect(result.current.error).toBeNull();
    });
    it('should handle concurrent API calls', async () => {
      const state1 = createMockState({ id: 'state-1' });
      const state2 = createMockState({ id: 'state-2' });
      // Mock two different responses
      mockApiResponse([state1]);
      mockApiResponse([state2]);
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        // Fire both calls simultaneously
        const promise1 = result.current.fetchStates('workspace-1');
        const promise2 = result.current.fetchStates('workspace-2');
        await Promise.all([promise1, promise2]);
      });
      // Last response should win
      expect(result.current.states).toEqual([state2]);
      expect(result.current.error).toBeNull();
    });
    it('should handle very large datasets', async () => {
      // Generate large dataset
      const largeStateArray = Array.from({ length: 1000 }, (_, i) => 
        createMockState({ id: `state-${i}`, name: `State ${i}`, sort_order: i })}
      );
      mockApiResponse(largeStateArray);
      const { result } = renderHook(() => useWorkflowStore());
      await act(async () => {
        await result.current.fetchStates('workspace-1');
      });
      expect(result.current.states).toHaveLength(1000);
      expect(result.current.states[0].id).toBe('state-0');
      expect(result.current.states[999].id).toBe('state-999');
    });
  });
});