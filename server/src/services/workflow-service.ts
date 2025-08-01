// Epic 9.4 - Workflow Orchestration Service
// Business logic for workflow state management

import { WorkflowDAO } from '../database/workflow-dao';
import Database from 'better-sqlite3';
import { z } from 'zod';
import {
  WorkflowState,
  WorkflowTransition,
  WorkflowApproval,
  WorkflowLock,
  WorkflowSchedule,
  WorkflowStatistics,
  StateTransitionRequest,
  StateTransitionResult,
  WorkflowEvent,
  WorkflowEventHandler,
  WorkflowConfiguration,
  CreateWorkflowStateSchema,
  CreateWorkflowTransitionSchema,
  CreateWorkflowApprovalSchema,
  CreateWorkflowLockSchema,
  CreateWorkflowScheduleSchema,
  ApproveWorkflowSchema,
  RejectWorkflowSchema,
} from '../database/workflow-models';

export class WorkflowService {
  private dao: WorkflowDAO;
  private eventHandlers: Map<string, WorkflowEventHandler[]> = new Map();
  private config: WorkflowConfiguration;

  constructor(db: Database.Database) {
    this.dao = new WorkflowDAO(db);
    this.config = this.getDefaultConfiguration();
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  private getDefaultConfiguration(): WorkflowConfiguration {
    return {
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
        schedule_failed: true,
      },
    };
  }

  setConfiguration(config: Partial<WorkflowConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  getConfiguration(): WorkflowConfiguration {
    return { ...this.config };
  }

  // =============================================================================
  // EVENT SYSTEM
  // =============================================================================

  addEventListener(eventType: string, handler: WorkflowEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  removeEventListener(eventType: string, handler: WorkflowEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private async emitEvent(event: WorkflowEvent): Promise<void> {

    const handlers = this.eventHandlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  // =============================================================================
  // WORKFLOW STATE MANAGEMENT
  // =============================================================================

  async createWorkflowState(data: z.infer<typeof CreateWorkflowStateSchema>): Promise<WorkflowState> {

    const state = await this.dao.createWorkflowState(data);

    await this.emitEvent({
      type: 'state_changed',
      workspace_id: data.workspace_id,
      resource_id: '', // Not applicable for state creation
      actor_id: 'system',
      timestamp: new Date(),
      data: { action: 'state_created', state_id: state.id, state_name: state.name },
    });

    return state;
  }

  async getWorkflowStates(workspaceId: string): Promise<WorkflowState[]> {

    return this.dao.getWorkflowStates({ workspace_id: workspaceId });
  }

  async updateWorkflowState(id: string, updates: Partial<WorkflowState>): Promise<WorkflowState | null> {

    return this.dao.updateWorkflowState(id, updates);
  }

  async deleteWorkflowState(id: string): Promise<boolean> {

    return this.dao.deleteWorkflowState(id);
  }

  // =============================================================================
  // WORKFLOW TRANSITIONS
  // =============================================================================

  async createWorkflowTransition(data: z.infer<typeof CreateWorkflowTransitionSchema>): Promise<WorkflowTransition> {

    return this.dao.createWorkflowTransition(data);
  }

  async getWorkflowTransitions(workspaceId: string, fromStateId?: string): Promise<WorkflowTransition[]> {

    return this.dao.getWorkflowTransitions(workspaceId, fromStateId);
  }

  async deleteWorkflowTransition(id: string): Promise<boolean> {

    return this.dao.deleteWorkflowTransition(id);
  }

  // =============================================================================
  // STATE TRANSITION LOGIC
  // =============================================================================

  async transitionResourceState(
    resourceId: string,
    toStateId: string,
    actorId: string,
    options: {
      comment?: string;
      metadata?: Record<string, any>;
      force?: boolean;
      lockDuration?: number; // minutes
    } = {}
  ): Promise<StateTransitionResult> {

    // Auto-lock resource if configured
    if (this.config.auto_lock_on_state_change) {
      await this.acquireLock(resourceId, actorId, 'state_change', {
        reason: 'Auto-lock for state transition',
        duration: options.lockDuration || 60, // 1 hour default
      });
    }

    const request: StateTransitionRequest = {
      resource_id: resourceId,
      to_state_id: toStateId,
      comment: options.comment,
      metadata: options.metadata,
      force: options.force,
    };

    const result = await this.dao.transitionResourceState(request, actorId);

    // Emit appropriate event
    if (result.success) {
      if (result.approval_required) {
        await this.emitEvent({
          type: 'approval_requested',
          workspace_id: '', // Will be filled by DAO
          resource_id: resourceId,
          actor_id: actorId,
          timestamp: new Date(),
          data: { approval_id: result.approval_id, to_state_id: toStateId },
        });
      } else {
        await this.emitEvent({
          type: 'state_changed',
          workspace_id: '', // Will be filled by DAO
          resource_id: resourceId,
          actor_id: actorId,
          timestamp: new Date(),
          data: { new_state_id: result.new_state_id, comment: options.comment },
        });

        // Auto-release lock if configured
        if (this.config.auto_release_locks_on_completion) {
          await this.releaseLocksByResource(resourceId, actorId, 'state_change');
        }
      }
    }

    return result;
  }

  // =============================================================================
  // APPROVAL MANAGEMENT
  // =============================================================================

  async createWorkflowApproval(data: z.infer<typeof CreateWorkflowApprovalSchema>): Promise<WorkflowApproval> {

    // Set default due date if not provided
    if (!data.due_date) {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + this.config.default_approval_timeout_hours);
      data.due_date = dueDate;
    }

    const approval = await this.dao.createWorkflowApproval(data);

    await this.emitEvent({
      type: 'approval_requested',
      workspace_id: data.workspace_id,
      resource_id: data.resource_id,
      actor_id: data.requester_id,
      timestamp: new Date(),
      data: { approval_id: approval.id, transition_id: data.transition_id },
    });

    return approval;
  }

  async getWorkflowApprovals(workspaceId: string, filters: any = {}): Promise<WorkflowApproval[]> {

    return this.dao.getWorkflowApprovals({ workspace_id: workspaceId, ...filters });
  }

  async approveWorkflow(approvalId: string, approverId: string, comment?: string): Promise<StateTransitionResult> {

    const data = { approved_by: approverId, approval_comment: comment };
    const result = await this.dao.approveWorkflow(approvalId, data);

    if (result.success) {
      await this.emitEvent({
        type: 'approval_completed',
        workspace_id: '', // Will be filled by DAO
        resource_id: '', // Will be filled by DAO
        actor_id: approverId,
        timestamp: new Date(),
        data: { approval_id: approvalId, status: 'approved', comment },
      });

      // Auto-release locks if configured
      if (this.config.auto_release_locks_on_completion) {
        // Resource ID would need to be retrieved from approval
        // await this.releaseLocksByResource(resourceId, approverId, 'state_change');
      }
    }

    return result;
  }

  async rejectWorkflow(approvalId: string, rejectorId: string, reason: string): Promise<boolean> {

    const data = { approved_by: rejectorId, rejection_reason: reason };
    const result = await this.dao.rejectWorkflow(approvalId, data);

    if (result) {
      await this.emitEvent({
        type: 'approval_completed',
        workspace_id: '', // Will be filled by DAO
        resource_id: '', // Will be filled by DAO
        actor_id: rejectorId,
        timestamp: new Date(),
        data: { approval_id: approvalId, status: 'rejected', reason },
      });
    }

    return result;
  }

  // =============================================================================
  // LOCK MANAGEMENT
  // =============================================================================

  async acquireLock(
    resourceId: string,
    userId: string,
    lockType: 'edit' | 'state_change' | 'delete' | 'custom' = 'edit',
    options: {
      reason?: string;
      duration?: number; // minutes
      metadata?: Record<string, any>;
    } = {}
  ): Promise<WorkflowLock> {

    // Check existing locks
    const existingLocks = await this.dao.getWorkflowLocks({ resource_id: resourceId });

    if (existingLocks.length >= this.config.max_concurrent_locks_per_resource) {
      throw new Error(
        `Maximum concurrent locks (${this.config.max_concurrent_locks_per_resource}) exceeded for resource`
      );
    }

    // Check for conflicting locks
    const conflictingLock = existingLocks.find(lock => lock.lock_type === lockType);
    if (conflictingLock) {
      throw new Error(`Resource already has a ${lockType} lock`);
    }

    const expiresAt = options.duration ? new Date(Date.now() + options.duration * 60 * 1000) : undefined;

    const lockData = {
      workspace_id: '', // Will be filled by DAO from resource
      resource_id: resourceId,
      locked_by: userId,
      lock_type: lockType,
      lock_reason: options.reason,
      expires_at: expiresAt,
      metadata: options.metadata || {},
    };

    const lock = await this.dao.createWorkflowLock(lockData);

    await this.emitEvent({
      type: 'lock_acquired',
      workspace_id: lock.workspace_id,
      resource_id: resourceId,
      actor_id: userId,
      timestamp: new Date(),
      data: { lock_id: lock.id, lock_type: lockType, expires_at: expiresAt },
    });

    return lock;
  }

  async releaseLock(lockId: string, userId: string): Promise<boolean> {

    const result = await this.dao.releaseWorkflowLock(lockId, userId);

    if (result) {
      await this.emitEvent({
        type: 'lock_released',
        workspace_id: '', // Will be filled by DAO
        resource_id: '', // Will be filled by DAO
        actor_id: userId,
        timestamp: new Date(),
        data: { lock_id: lockId },
      });
    }

    return result;
  }

  async releaseLocksByResource(resourceId: string, userId: string, lockType?: string): Promise<number> {

    const locks = await this.dao.getWorkflowLocks({
      resource_id: resourceId,
      lock_type: lockType as any,
    });

    let releasedCount = 0;
    for (const lock of locks) {
      if (await this.releaseLock(lock.id, userId)) {
        releasedCount++;
      }
    }

    return releasedCount;
  }

  async getWorkflowLocks(workspaceId: string, filters: any = {}): Promise<WorkflowLock[]> {

    return this.dao.getWorkflowLocks({ workspace_id: workspaceId, ...filters });
  }

  async releaseExpiredLocks(): Promise<number> {

    return this.dao.releaseExpiredLocks();
  }

  // =============================================================================
  // WORKFLOW HISTORY
  // =============================================================================

  async getWorkflowHistory(workspaceId: string, filters: any = {}): Promise<any[]> {

    return this.dao.getWorkflowHistory({ workspace_id: workspaceId, ...filters });
  }

  // =============================================================================
  // STATISTICS AND REPORTING
  // =============================================================================

  async getWorkflowStatistics(workspaceId: string): Promise<WorkflowStatistics> {

    return this.dao.getWorkflowStatistics(workspaceId);
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  async validateStateTransition(
    _____resourceId: string,
    _____toStateId: string
  ): Promise<{
    valid: boolean;
    transition?: WorkflowTransition;
    error?: string;
  }> {

    // This would include logic to validate if a transition is allowed
    // based on current state, user permissions, etc.
    return { valid: true };
  }

  async canUserTransitionState(_____userId: string, _____resourceId: string, _____toStateId: string): Promise<boolean> {

    // This would check user permissions against the transition requirements
    return true;
  }

  async isResourceLocked(resourceId: string, lockType?: string): Promise<boolean> {

    const locks = await this.dao.getWorkflowLocks({
      resource_id: resourceId,
      lock_type: lockType as any,
    });
    return locks.length > 0;
  }

  // =============================================================================
  // MAINTENANCE TASKS
  // =============================================================================

  async performMaintenance(): Promise<{
    expired_locks_released: number;
    overdue_approvals: number;
    cleanup_tasks_completed: number;
  }> {

    const expiredLocks = await this.releaseExpiredLocks();

    // Get overdue approvals
    const overdueApprovals = await this.dao.getWorkflowApprovals({ overdue: true });

    // Additional cleanup tasks could be added here

    return {
      expired_locks_released: expiredLocks,
      overdue_approvals: overdueApprovals.length,
      cleanup_tasks_completed: 1,
    };
  }
}
