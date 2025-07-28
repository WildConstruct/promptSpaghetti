/**
 * Comprehensive Tests for Workflow Service
 * Tests all workflow business logic including:
 * - Configuration management
 * - Event system
 * - State management operations
 * - Transition logic with auto-locking
 * - Approval workflows with timeouts
 * - Lock management with conflict detection
 * - Maintenance tasks
 * - Error handling and edge cases
 */

import { WorkflowService } from '../../services/workflow-service';
import { WorkflowDAO } from '../../database/workflow-dao';
import { Database } from '../../database/connection';
import {
  WorkflowState,
  WorkflowTransition,
  WorkflowApproval,
  WorkflowLock,
  WorkflowEvent,
  WorkflowConfiguration,
  StateTransitionResult
} from '../../database/workflow-models';

// Mock the WorkflowDAO
jest.mock('../../database/workflow-dao');
const MockedWorkflowDAO = WorkflowDAO as jest.MockedClass<typeof WorkflowDAO>;

// Mock database
const mockDb = {} as Database;

// Test data generators
const createMockState = (overrides: Partial<WorkflowState> = {}): WorkflowState => ({
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

const createMockTransition = (overrides: Partial<WorkflowTransition> = {}): WorkflowTransition => ({
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

const createMockApproval = (overrides: Partial<WorkflowApproval> = {}): WorkflowApproval => ({
  id: 'approval-1',
  workspace_id: 'workspace-1',
  resource_id: 'resource-1',
  transition_id: 'transition-1',
  requester_id: 'user-1',
  status: 'pending',
  requested_at: new Date('2024-01-01T00:00:00Z'),
  due_date: new Date('2024-01-08T00:00:00Z'),
  priority: 'medium',
  approved_by: null,
  approved_at: null,
  rejection_reason: null,
  approval_comment: null,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  ...overrides
});

const createMockLock = (overrides: Partial<WorkflowLock> = {}): WorkflowLock => ({
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

const createMockTransitionResult = (overrides: Partial<StateTransitionResult> = {}): StateTransitionResult => ({
  success: true,
  new_state_id: 'state-2',
  approval_required: false,
  approval_id: null,
  error: null,
  workflow_history_id: 'history-1',
  ...overrides
});

describe('WorkflowService', () => {
  let service: WorkflowService;
  let mockDAO: jest.Mocked<WorkflowDAO>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create service instance
    service = new WorkflowService(mockDb);
    
    // Get the mocked DAO instance
    mockDAO = MockedWorkflowDAO.mock.instances[0] as jest.Mocked<WorkflowDAO>;
  });

  describe('Configuration Management', () => {
    it('should initialize with default configuration', () => {
      const config = service.getConfiguration();
      
      expect(config).toEqual({
        auto_lock_on_state_change: true,
        auto_release_locks_on_completion: true,
        require_approval_for_final_states: true,
        default_approval_timeout_hours: 72,
        max_concurrent_locks_per_resource: 3,
        audit_retention_days: 365,
        notification_settings: {
          approval_requested: true,
          approval_completed: true,
          lock_acquired: true,
          schedule_failed: true
        }
      });
    });

    it('should allow partial configuration updates', () => {
      const updates: Partial<WorkflowConfiguration> = {
        default_approval_timeout_hours: 48,
        max_concurrent_locks_per_resource: 5
      };
      
      service.setConfiguration(updates);
      const config = service.getConfiguration();
      
      expect(config.default_approval_timeout_hours).toBe(48);
      expect(config.max_concurrent_locks_per_resource).toBe(5);
      expect(config.auto_lock_on_state_change).toBe(true); // Should retain original value
    });

    it('should return a copy of configuration to prevent external modification', () => {
      const config1 = service.getConfiguration();
      const config2 = service.getConfiguration();
      
      expect(config1).not.toBe(config2); // Different object references
      expect(config1).toEqual(config2); // But same content
      
      config1.default_approval_timeout_hours = 999;
      expect(service.getConfiguration().default_approval_timeout_hours).toBe(72); // Should remain unchanged
    });
  });

  describe('Event System', () => {
    it('should register and handle event listeners', async () => {
      const mockHandler = jest.fn();
      const testEvent: WorkflowEvent = {
        type: 'state_changed',
        workspace_id: 'workspace-1',
        resource_id: 'resource-1',
        actor_id: 'user-1',
        timestamp: new Date(),
        data: { new_state_id: 'state-2' }
      };

      service.addEventListener('state_changed', mockHandler);
      
      // Trigger an event indirectly through service method
      mockDAO.createWorkflowState.mockResolvedValue(createMockState());
      
      await service.createWorkflowState({
        workspace_id: 'workspace-1',
        name: 'Test State',
        color: '#blue',
        sort_order: 1
      });
      
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state_changed',
          workspace_id: 'workspace-1',
          actor_id: 'system',
          data: expect.objectContaining({
            action: 'state_created'
  }
  }
      );
    });

    it('should handle multiple event listeners for the same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      service.addEventListener('state_changed', handler1);
      service.addEventListener('state_changed', handler2);

      mockDAO.createWorkflowState.mockResolvedValue(createMockState());
      
      await service.createWorkflowState({
        workspace_id: 'workspace-1',
        name: 'Test State',
        color: '#blue',
        sort_order: 1
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should remove event listeners', async () => {
      const mockHandler = jest.fn();

      service.addEventListener('state_changed', mockHandler);
      service.removeEventListener('state_changed', mockHandler);

      mockDAO.createWorkflowState.mockResolvedValue(createMockState());
      
      await service.createWorkflowState({
        workspace_id: 'workspace-1',
        name: 'Test State',
        color: '#blue',
        sort_order: 1
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle event listener errors gracefully', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
      const successHandler = jest.fn();

      service.addEventListener('state_changed', errorHandler);
      service.addEventListener('state_changed', successHandler);

      mockDAO.createWorkflowState.mockResolvedValue(createMockState());
      
      // Should not throw despite handler error
      await expect(service.createWorkflowState({
        workspace_id: 'workspace-1',
        name: 'Test State',
        color: '#blue',
        sort_order: 1
      })).resolves.not.toThrow();

      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('Workflow State Management', () => {
    describe('createWorkflowState', () => {
      it('should create state and emit event', async () => {
        const stateData = {
          workspace_id: 'workspace-1',
          name: 'Test State',
          color: '#blue',
          sort_order: 1
        };
        const createdState = createMockState(stateData);
        
        mockDAO.createWorkflowState.mockResolvedValue(createdState);
        const eventHandler = jest.fn();
        service.addEventListener('state_changed', eventHandler);

        const result = await service.createWorkflowState(stateData);

        expect(mockDAO.createWorkflowState).toHaveBeenCalledWith(stateData);
        expect(result).toEqual(createdState);
        expect(eventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'state_changed',
            data: expect.objectContaining({
              action: 'state_created',
              state_id: createdState.id,
              state_name: createdState.name
  }
  }
        );
      });
    });

    describe('getWorkflowStates', () => {
      it('should retrieve workflow states', async () => {
        const mockStates = [createMockState(), createMockState({ id: 'state-2' })];
        mockDAO.getWorkflowStates.mockResolvedValue(mockStates);

        const result = await service.getWorkflowStates('workspace-1');

        expect(mockDAO.getWorkflowStates).toHaveBeenCalledWith({ workspace_id: 'workspace-1' });
        expect(result).toEqual(mockStates);
      });
    });

    describe('updateWorkflowState', () => {
      it('should update workflow state', async () => {
        const updates = { name: 'Updated State', color: '#green' };
        const updatedState = createMockState(updates);
        
        mockDAO.updateWorkflowState.mockResolvedValue(updatedState);

        const result = await service.updateWorkflowState('state-1', updates);

        expect(mockDAO.updateWorkflowState).toHaveBeenCalledWith('state-1', updates);
        expect(result).toEqual(updatedState);
      });
    });

    describe('deleteWorkflowState', () => {
      it('should delete workflow state', async () => {
        mockDAO.deleteWorkflowState.mockResolvedValue(true);

        const result = await service.deleteWorkflowState('state-1');

        expect(mockDAO.deleteWorkflowState).toHaveBeenCalledWith('state-1');
        expect(result).toBe(true);
      });
    });
  });

  describe('State Transition Logic', () => {
    describe('transitionResourceState', () => {
      it('should transition state with auto-locking enabled', async () => {
        const transitionResult = createMockTransitionResult();
        
        mockDAO.getWorkflowLocks.mockResolvedValue([]); // No existing locks
        mockDAO.createWorkflowLock.mockResolvedValue(createMockLock({ lock_type: 'state_change' }));
        mockDAO.transitionResourceState.mockResolvedValue(transitionResult);
        mockDAO.releaseLocksByResource.mockResolvedValue(1);

        const result = await service.transitionResourceState(
          'resource-1',
          'state-2',
          'user-1',
          { comment: 'Moving to review' }
        );

        expect(mockDAO.createWorkflowLock).toHaveBeenCalledWith(expect.objectContaining({
          resource_id: 'resource-1',
          locked_by: 'user-1',
          lock_type: 'state_change',
          lock_reason: 'Auto-lock for state transition'
        }));
        expect(mockDAO.transitionResourceState).toHaveBeenCalledWith(
          expect.objectContaining({
            resource_id: 'resource-1',
            to_state_id: 'state-2',
            comment: 'Moving to review'
          }),
          'user-1'
        );
        expect(mockDAO.releaseLocksByResource).toHaveBeenCalledWith('resource-1', 'user-1', 'state_change');
        expect(result).toEqual(transitionResult);
      });

      it('should handle transition requiring approval', async () => {
        const transitionResult = createMockTransitionResult({
          approval_required: true,
          approval_id: 'approval-1',
          new_state_id: undefined
        });
        
        mockDAO.getWorkflowLocks.mockResolvedValue([]);
        mockDAO.createWorkflowLock.mockResolvedValue(createMockLock());
        mockDAO.transitionResourceState.mockResolvedValue(transitionResult);
        
        const approvalHandler = jest.fn();
        service.addEventListener('approval_requested', approvalHandler);

        const result = await service.transitionResourceState('resource-1', 'state-2', 'user-1');

        expect(result.approval_required).toBe(true);
        expect(result.approval_id).toBe('approval-1');
        expect(approvalHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'approval_requested',
            data: expect.objectContaining({
              approval_id: 'approval-1',
              to_state_id: 'state-2'
  }
  }
        );
        // Should not auto-release locks when approval is required
        expect(mockDAO.releaseLocksByResource).not.toHaveBeenCalled();
      });

      it('should emit state_changed event on successful transition', async () => {
        const transitionResult = createMockTransitionResult();
        
        mockDAO.getWorkflowLocks.mockResolvedValue([]);
        mockDAO.createWorkflowLock.mockResolvedValue(createMockLock());
        mockDAO.transitionResourceState.mockResolvedValue(transitionResult);
        mockDAO.releaseLocksByResource.mockResolvedValue(1);
        
        const stateChangeHandler = jest.fn();
        service.addEventListener('state_changed', stateChangeHandler);

        await service.transitionResourceState('resource-1', 'state-2', 'user-1');

        expect(stateChangeHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'state_changed',
            resource_id: 'resource-1',
            actor_id: 'user-1',
            data: expect.objectContaining({
              new_state_id: 'state-2'
  }
  }
        );
      });

      it('should skip auto-locking when disabled', async () => {
        service.setConfiguration({ auto_lock_on_state_change: false });
        
        const transitionResult = createMockTransitionResult();
        mockDAO.transitionResourceState.mockResolvedValue(transitionResult);

        await service.transitionResourceState('resource-1', 'state-2', 'user-1');

        expect(mockDAO.createWorkflowLock).not.toHaveBeenCalled();
        expect(mockDAO.transitionResourceState).toHaveBeenCalledWith(
          expect.objectContaining({
            resource_id: 'resource-1',
            to_state_id: 'state-2'
          }),
          'user-1'
        );
      });
    });
  });

  describe('Approval Management', () => {
    describe('createWorkflowApproval', () => {
      it('should create approval with default due date', async () => {
        const approvalData = {
          workspace_id: 'workspace-1',
          resource_id: 'resource-1',
          transition_id: 'transition-1',
          requester_id: 'user-1',
          priority: 'medium' as const
        };
        
        const createdApproval = createMockApproval(approvalData);
        mockDAO.createWorkflowApproval.mockResolvedValue(createdApproval);
        
        const eventHandler = jest.fn();
        service.addEventListener('approval_requested', eventHandler);

        const result = await service.createWorkflowApproval(approvalData);

        // Should add default due date (72 hours from now)
        expect(mockDAO.createWorkflowApproval).toHaveBeenCalledWith(
          expect.objectContaining({
            ...approvalData,
            due_date: expect.any(Date)
  }
        );
        
        // Check that due date is approximately 72 hours from now
        const calledArgs = mockDAO.createWorkflowApproval.mock.calls[0][0];
        const expectedDueDate = new Date();
        expectedDueDate.setHours(expectedDueDate.getHours() + 72);
        const actualDueDate = calledArgs.due_date;
        
        expect(Math.abs(actualDueDate.getTime() - expectedDueDate.getTime())).toBeLessThan(1000); // Within 1 second
        
        expect(result).toEqual(createdApproval);
        expect(eventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'approval_requested',
            data: expect.objectContaining({
              approval_id: createdApproval.id,
              transition_id: approvalData.transition_id
  }
  }
        );
      });

      it('should respect provided due date', async () => {
        const customDueDate = new Date('2024-12-31T23:59:59Z');
        const approvalData = {
          workspace_id: 'workspace-1',
          resource_id: 'resource-1',
          transition_id: 'transition-1',
          requester_id: 'user-1',
          due_date: customDueDate,
          priority: 'high' as const
        };
        
        const createdApproval = createMockApproval({ ...approvalData });
        mockDAO.createWorkflowApproval.mockResolvedValue(createdApproval);

        await service.createWorkflowApproval(approvalData);

        expect(mockDAO.createWorkflowApproval).toHaveBeenCalledWith(
          expect.objectContaining({
            due_date: customDueDate
  }
        );
      });
    });

    describe('approveWorkflow', () => {
      it('should approve workflow and emit completion event', async () => {
        const transitionResult = createMockTransitionResult();
        mockDAO.approveWorkflow.mockResolvedValue(transitionResult);
        
        const eventHandler = jest.fn();
        service.addEventListener('approval_completed', eventHandler);

        const result = await service.approveWorkflow('approval-1', 'user-2', 'Looks good!');

        expect(mockDAO.approveWorkflow).toHaveBeenCalledWith('approval-1', {
          approved_by: 'user-2',
          approval_comment: 'Looks good!'
        });
        expect(result).toEqual(transitionResult);
        expect(eventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'approval_completed',
            actor_id: 'user-2',
            data: expect.objectContaining({
              approval_id: 'approval-1',
              status: 'approved',
              comment: 'Looks good!'
  }
  }
        );
      });

      it('should not emit event on failed approval', async () => {
        const failedResult = createMockTransitionResult({ success: false, error: 'Approval failed' });
        mockDAO.approveWorkflow.mockResolvedValue(failedResult);
        
        const eventHandler = jest.fn();
        service.addEventListener('approval_completed', eventHandler);

        const result = await service.approveWorkflow('approval-1', 'user-2');

        expect(result.success).toBe(false);
        expect(eventHandler).not.toHaveBeenCalled();
      });
    });

    describe('rejectWorkflow', () => {
      it('should reject workflow and emit completion event', async () => {
        mockDAO.rejectWorkflow.mockResolvedValue(true);
        
        const eventHandler = jest.fn();
        service.addEventListener('approval_completed', eventHandler);

        const result = await service.rejectWorkflow('approval-1', 'user-2', 'Needs more work');

        expect(mockDAO.rejectWorkflow).toHaveBeenCalledWith('approval-1', {
          approved_by: 'user-2',
          rejection_reason: 'Needs more work'
        });
        expect(result).toBe(true);
        expect(eventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'approval_completed',
            data: expect.objectContaining({
              approval_id: 'approval-1',
              status: 'rejected',
              reason: 'Needs more work'
  }
  }
        );
      });
    });
  });

  describe('Lock Management', () => {
    describe('acquireLock', () => {
      it('should acquire lock successfully', async () => {
        const newLock = createMockLock();
        mockDAO.getWorkflowLocks.mockResolvedValue([]); // No existing locks
        mockDAO.createWorkflowLock.mockResolvedValue(newLock);

        const result = await service.acquireLock('resource-1', 'user-1', 'edit', {
          reason: 'Editing content',
          duration: 120
        });

        expect(mockDAO.getWorkflowLocks).toHaveBeenCalledWith({ resource_id: 'resource-1' });
        expect(mockDAO.createWorkflowLock).toHaveBeenCalledWith(expect.objectContaining({
          resource_id: 'resource-1',
          locked_by: 'user-1',
          lock_type: 'edit',
          lock_reason: 'Editing content'
        }));
        expect(result).toEqual(newLock);
      });

      it('should prevent exceeding maximum concurrent locks', async () => {
        const existingLocks = [
          createMockLock({ id: 'lock-1', lock_type: 'edit' }),
          createMockLock({ id: 'lock-2', lock_type: 'state_change' }),
          createMockLock({ id: 'lock-3', lock_type: 'delete' })
        ];
        mockDAO.getWorkflowLocks.mockResolvedValue(existingLocks);

        await expect(service.acquireLock('resource-1', 'user-1', 'custom'))
          .rejects
          .toThrow('Maximum concurrent locks (3) exceeded for resource');
      });

      it('should prevent conflicting locks of same type', async () => {
        const existingLocks = [createMockLock({ lock_type: 'edit' })];
        mockDAO.getWorkflowLocks.mockResolvedValue(existingLocks);

        await expect(service.acquireLock('resource-1', 'user-2', 'edit'))
          .rejects
          .toThrow('Resource already has a edit lock');
      });

      it('should allow different lock types on same resource', async () => {
        const existingLocks = [createMockLock({ lock_type: 'edit' })];
        const newLock = createMockLock({ lock_type: 'state_change' });
        
        mockDAO.getWorkflowLocks.mockResolvedValue(existingLocks);
        mockDAO.createWorkflowLock.mockResolvedValue(newLock);

        const result = await service.acquireLock('resource-1', 'user-1', 'state_change');

        expect(result).toEqual(newLock);
        expect(mockDAO.createWorkflowLock).toHaveBeenCalled();
      });

      it('should use default lock type when not specified', async () => {
        const newLock = createMockLock({ lock_type: 'edit' });
        mockDAO.getWorkflowLocks.mockResolvedValue([]);
        mockDAO.createWorkflowLock.mockResolvedValue(newLock);

        await service.acquireLock('resource-1', 'user-1');

        expect(mockDAO.createWorkflowLock).toHaveBeenCalledWith(
          expect.objectContaining({ lock_type: 'edit' })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle DAO errors gracefully', async () => {
      mockDAO.getWorkflowStates.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getWorkflowStates('workspace-1'))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle missing approval data', async () => {
      mockDAO.approveWorkflow.mockResolvedValue(createMockTransitionResult({ success: false }));

      const result = await service.approveWorkflow('nonexistent-approval', 'user-1');

      expect(result.success).toBe(false);
    });

    it('should handle event emission failures', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Event handler failed'));
      service.addEventListener('state_changed', errorHandler);
      
      mockDAO.createWorkflowState.mockResolvedValue(createMockState());

      // Should complete successfully despite event handler error
      const result = await service.createWorkflowState({
        workspace_id: 'workspace-1',
        name: 'Test State',
        color: '#blue',
        sort_order: 1
      });

      expect(result).toEqual(expect.any(Object));
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete approval workflow', async () => {
      // Setup: Create approval requiring workflow
      const approval = createMockApproval();
      const transitionResult = createMockTransitionResult({
        approval_required: true,
        approval_id: 'approval-1'
      });
      
      mockDAO.getWorkflowLocks.mockResolvedValue([]);
      mockDAO.createWorkflowLock.mockResolvedValue(createMockLock());
      mockDAO.transitionResourceState.mockResolvedValue(transitionResult);
      
      // Step 1: Initiate transition requiring approval
      const initialResult = await service.transitionResourceState('resource-1', 'state-2', 'user-1');
      expect(initialResult.approval_required).toBe(true);
      
      // Step 2: Approve the workflow
      const approvalResult = createMockTransitionResult({ approval_id: null });
      mockDAO.approveWorkflow.mockResolvedValue(approvalResult);
      mockDAO.releaseLocksByResource.mockResolvedValue(1);
      
      const finalResult = await service.approveWorkflow('approval-1', 'user-2', 'Approved');
      expect(finalResult.success).toBe(true);
    });

    it('should handle lock conflicts during transitions', async () => {
      // Setup: Resource already has conflicting lock
      const existingLock = createMockLock({ lock_type: 'state_change' });
      mockDAO.getWorkflowLocks.mockResolvedValue([existingLock]);

      // Should fail when trying to acquire another state_change lock
      await expect(service.transitionResourceState('resource-1', 'state-2', 'user-2'))
        .rejects
        .toThrow('Resource already has a state_change lock');
    });

    it('should handle configuration changes affecting behavior', async () => {
      // Initial transition with auto-locking enabled
      service.setConfiguration({ auto_lock_on_state_change: true });
      mockDAO.getWorkflowLocks.mockResolvedValue([]);
      mockDAO.createWorkflowLock.mockResolvedValue(createMockLock());
      mockDAO.transitionResourceState.mockResolvedValue(createMockTransitionResult());
      mockDAO.releaseLocksByResource.mockResolvedValue(1);

      await service.transitionResourceState('resource-1', 'state-2', 'user-1');
      expect(mockDAO.createWorkflowLock).toHaveBeenCalledTimes(1);
      
      // Change configuration to disable auto-locking
      jest.clearAllMocks();
      service.setConfiguration({ auto_lock_on_state_change: false });
      mockDAO.transitionResourceState.mockResolvedValue(createMockTransitionResult());

      await service.transitionResourceState('resource-2', 'state-2', 'user-1');
      expect(mockDAO.createWorkflowLock).not.toHaveBeenCalled();
    });
  });
});