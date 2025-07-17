// Epic 9.4 - Workflow Orchestration API Routes
// REST API endpoints for workflow state management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WorkflowService } from '../services/workflow-service';
import { database } from '../database/connection';
import {
  CreateWorkflowStateSchema,
  CreateWorkflowTransitionSchema,
  CreateWorkflowApprovalSchema,
  CreateWorkflowLockSchema,
  CreateWorkflowScheduleSchema,
  ApproveWorkflowSchema,
  RejectWorkflowSchema
} from '../database/workflow-models';

export async function workflowRoutes(fastify: FastifyInstance) {
  const workflowService = new WorkflowService(database);

  // =============================================================================
  // WORKFLOW STATE ENDPOINTS
  // =============================================================================

  // GET /api/workflow/states/:workspaceId - Get workflow states for workspace
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: { 
      is_initial?: boolean;
      is_final?: boolean;
      is_locked?: boolean;
      name_contains?: string;
    };
  }>('/states/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        is_initial: z.boolean().optional(),
        is_final: z.boolean().optional(),
        is_locked: z.boolean().optional(),
        name_contains: z.string().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const filters = request.query || {};
      
      const states = await workflowService.getWorkflowStates(workspaceId);
      const filteredStates = states.filter(state => {
        if (filters.is_initial !== undefined && state.is_initial !== filters.is_initial) return false;
        if (filters.is_final !== undefined && state.is_final !== filters.is_final) return false;
        if (filters.is_locked !== undefined && state.is_locked !== filters.is_locked) return false;
        if (filters.name_contains && !state.name.toLowerCase().includes(filters.name_contains.toLowerCase())) return false;
        return true;
      });
      
      reply.send(filteredStates);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow states' });
    }
  });

  // POST /api/workflow/states - Create new workflow state
  fastify.post<{
    Body: Zod.infer<typeof CreateWorkflowStateSchema>;
  }>('/states', {
    schema: {
      body: CreateWorkflowStateSchema
    }
  }, async (request, reply) => {
    try {
      const state = await workflowService.createWorkflowState(request.body);
      reply.status(201).send(state);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create workflow state' });
    }
  });

  // PUT /api/workflow/states/:id - Update workflow state
  fastify.put<{
    Params: { id: string };
    Body: Partial<Zod.infer<typeof CreateWorkflowStateSchema>>;
  }>('/states/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: CreateWorkflowStateSchema.partial()
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const state = await workflowService.updateWorkflowState(id, request.body);
      
      if (!state) {
        return reply.status(404).send({ error: 'Workflow state not found' });
      }
      
      reply.send(state);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update workflow state' });
    }
  });

  // DELETE /api/workflow/states/:id - Delete workflow state
  fastify.delete<{
    Params: { id: string };
  }>('/states/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await workflowService.deleteWorkflowState(id);
      
      if (!deleted) {
        return reply.status(404).send({ error: 'Workflow state not found' });
      }
      
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete workflow state' });
    }
  });

  // =============================================================================
  // WORKFLOW TRANSITION ENDPOINTS
  // =============================================================================

  // GET /api/workflow/transitions/:workspaceId - Get workflow transitions
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: { from_state_id?: string };
  }>('/transitions/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        from_state_id: z.string().uuid().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const { from_state_id } = request.query || {};
      
      const transitions = await workflowService.getWorkflowTransitions(workspaceId, from_state_id);
      reply.send(transitions);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow transitions' });
    }
  });

  // POST /api/workflow/transitions - Create workflow transition
  fastify.post<{
    Body: Zod.infer<typeof CreateWorkflowTransitionSchema>;
  }>('/transitions', {
    schema: {
      body: CreateWorkflowTransitionSchema
    }
  }, async (request, reply) => {
    try {
      const transition = await workflowService.createWorkflowTransition(request.body);
      reply.status(201).send(transition);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create workflow transition' });
    }
  });

  // DELETE /api/workflow/transitions/:id - Delete workflow transition
  fastify.delete<{
    Params: { id: string };
  }>('/transitions/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await workflowService.deleteWorkflowTransition(id);
      
      if (!deleted) {
        return reply.status(404).send({ error: 'Workflow transition not found' });
      }
      
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete workflow transition' });
    }
  });

  // =============================================================================
  // STATE TRANSITION ENDPOINTS
  // =============================================================================

  // POST /api/workflow/resources/:resourceId/transition - Transition resource state
  fastify.post<{
    Params: { resourceId: string };
    Body: {
      to_state_id: string;
      comment?: string;
      metadata?: Record<string, any>;
      force?: boolean;
      lock_duration?: number;
    };
    Headers: { 'x-user-id': string };
  }>('/resources/:resourceId/transition', {
    schema: {
      params: z.object({
        resourceId: z.string().uuid()
      }),
      body: z.object({
        to_state_id: z.string().uuid(),
        comment: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        force: z.boolean().optional(),
        lock_duration: z.number().optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { resourceId } = request.params;
      const { to_state_id, comment, metadata, force, lock_duration } = request.body;
      const userId = request.headers['x-user-id'];
      
      const result = await workflowService.transitionResourceState(
        resourceId,
        to_state_id,
        userId,
        { comment, metadata, force, lockDuration: lock_duration }
      );
      
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to transition resource state' });
    }
  });

  // =============================================================================
  // APPROVAL ENDPOINTS
  // =============================================================================

  // GET /api/workflow/approvals/:workspaceId - Get workflow approvals
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: {
      resource_id?: string;
      requester_id?: string;
      status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      overdue?: boolean;
    };
  }>('/approvals/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        resource_id: z.string().uuid().optional(),
        requester_id: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        overdue: z.boolean().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const filters = request.query || {};
      
      const approvals = await workflowService.getWorkflowApprovals(workspaceId, filters);
      reply.send(approvals);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow approvals' });
    }
  });

  // POST /api/workflow/approvals - Create workflow approval
  fastify.post<{
    Body: Zod.infer<typeof CreateWorkflowApprovalSchema>;
  }>('/approvals', {
    schema: {
      body: CreateWorkflowApprovalSchema
    }
  }, async (request, reply) => {
    try {
      const approval = await workflowService.createWorkflowApproval(request.body);
      reply.status(201).send(approval);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create workflow approval' });
    }
  });

  // POST /api/workflow/approvals/:id/approve - Approve workflow
  fastify.post<{
    Params: { id: string };
    Body: { comment?: string };
    Headers: { 'x-user-id': string };
  }>('/approvals/:id/approve', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        comment: z.string().optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { comment } = request.body;
      const userId = request.headers['x-user-id'];
      
      const result = await workflowService.approveWorkflow(id, userId, comment);
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to approve workflow' });
    }
  });

  // POST /api/workflow/approvals/:id/reject - Reject workflow
  fastify.post<{
    Params: { id: string };
    Body: { reason: string };
    Headers: { 'x-user-id': string };
  }>('/approvals/:id/reject', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        reason: z.string().min(1)
      }),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { reason } = request.body;
      const userId = request.headers['x-user-id'];
      
      const result = await workflowService.rejectWorkflow(id, userId, reason);
      
      if (!result) {
        return reply.status(404).send({ error: 'Workflow approval not found' });
      }
      
      reply.send({ success: true });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to reject workflow' });
    }
  });

  // =============================================================================
  // LOCK ENDPOINTS
  // =============================================================================

  // GET /api/workflow/locks/:workspaceId - Get workflow locks
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: {
      resource_id?: string;
      locked_by?: string;
      lock_type?: 'edit' | 'state_change' | 'delete' | 'custom';
      expired?: boolean;
    };
  }>('/locks/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        resource_id: z.string().uuid().optional(),
        locked_by: z.string().optional(),
        lock_type: z.enum(['edit', 'state_change', 'delete', 'custom']).optional(),
        expired: z.boolean().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const filters = request.query || {};
      
      const locks = await workflowService.getWorkflowLocks(workspaceId, filters);
      reply.send(locks);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow locks' });
    }
  });

  // POST /api/workflow/locks - Acquire workflow lock
  fastify.post<{
    Body: {
      resource_id: string;
      lock_type?: 'edit' | 'state_change' | 'delete' | 'custom';
      reason?: string;
      duration?: number;
      metadata?: Record<string, any>;
    };
    Headers: { 'x-user-id': string };
  }>('/locks', {
    schema: {
      body: z.object({
        resource_id: z.string().uuid(),
        lock_type: z.enum(['edit', 'state_change', 'delete', 'custom']).optional(),
        reason: z.string().optional(),
        duration: z.number().optional(),
        metadata: z.record(z.any()).optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { resource_id, lock_type, reason, duration, metadata } = request.body;
      const userId = request.headers['x-user-id'];
      
      const lock = await workflowService.acquireLock(resource_id, userId, lock_type, {
        reason,
        duration,
        metadata
      });
      
      reply.status(201).send(lock);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to acquire workflow lock' });
    }
  });

  // DELETE /api/workflow/locks/:id - Release workflow lock
  fastify.delete<{
    Params: { id: string };
    Headers: { 'x-user-id': string };
  }>('/locks/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.headers['x-user-id'];
      
      const released = await workflowService.releaseLock(id, userId);
      
      if (!released) {
        return reply.status(404).send({ error: 'Workflow lock not found' });
      }
      
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: 'Failed to release workflow lock' });
    }
  });

  // DELETE /api/workflow/locks/resource/:resourceId - Release all locks for resource
  fastify.delete<{
    Params: { resourceId: string };
    Querystring: { lock_type?: string };
    Headers: { 'x-user-id': string };
  }>('/locks/resource/:resourceId', {
    schema: {
      params: z.object({
        resourceId: z.string().uuid()
      }),
      querystring: z.object({
        lock_type: z.string().optional()
      }).optional(),
      headers: z.object({
        'x-user-id': z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { resourceId } = request.params;
      const { lock_type } = request.query || {};
      const userId = request.headers['x-user-id'];
      
      const releasedCount = await workflowService.releaseLocksByResource(resourceId, userId, lock_type);
      
      reply.send({ released_count: releasedCount });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to release workflow locks' });
    }
  });

  // =============================================================================
  // HISTORY ENDPOINTS
  // =============================================================================

  // GET /api/workflow/history/:workspaceId - Get workflow history
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: {
      resource_id?: string;
      actor_id?: string;
      action_type?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    };
  }>('/history/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        resource_id: z.string().uuid().optional(),
        actor_id: z.string().optional(),
        action_type: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const filters = request.query || {};
      
      // Parse date filters
      const historyFilters = {
        ...filters,
        date_from: filters.date_from ? new Date(filters.date_from) : undefined,
        date_to: filters.date_to ? new Date(filters.date_to) : undefined
      };
      
      const history = await workflowService.getWorkflowHistory(workspaceId, historyFilters);
      reply.send(history);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow history' });
    }
  });

  // =============================================================================
  // STATISTICS ENDPOINTS
  // =============================================================================

  // GET /api/workflow/statistics/:workspaceId - Get workflow statistics
  fastify.get<{
    Params: { workspaceId: string };
  }>('/statistics/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const statistics = await workflowService.getWorkflowStatistics(workspaceId);
      reply.send(statistics);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch workflow statistics' });
    }
  });

  // =============================================================================
  // MAINTENANCE ENDPOINTS
  // =============================================================================

  // POST /api/workflow/maintenance - Perform maintenance tasks
  fastify.post('/maintenance', async (request, reply) => {
    try {
      const result = await workflowService.performMaintenance();
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to perform maintenance' });
    }
  });

  // POST /api/workflow/maintenance/expired-locks - Release expired locks
  fastify.post('/maintenance/expired-locks', async (request, reply) => {
    try {
      const releasedCount = await workflowService.releaseExpiredLocks();
      reply.send({ released_count: releasedCount });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to release expired locks' });
    }
  });

  // =============================================================================
  // VALIDATION ENDPOINTS
  // =============================================================================

  // GET /api/workflow/validate/transition - Validate state transition
  fastify.get<{
    Querystring: {
      resource_id: string;
      to_state_id: string;
      user_id: string;
    };
  }>('/validate/transition', {
    schema: {
      querystring: z.object({
        resource_id: z.string().uuid(),
        to_state_id: z.string().uuid(),
        user_id: z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { resource_id, to_state_id, user_id } = request.query;
      
      const validation = await workflowService.validateStateTransition(resource_id, to_state_id);
      const canTransition = await workflowService.canUserTransitionState(user_id, resource_id, to_state_id);
      const isLocked = await workflowService.isResourceLocked(resource_id, 'state_change');
      
      reply.send({
        ...validation,
        can_transition: canTransition,
        is_locked: isLocked
      });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to validate state transition' });
    }
  });

  // GET /api/workflow/validate/lock - Check if resource is locked
  fastify.get<{
    Querystring: {
      resource_id: string;
      lock_type?: string;
    };
  }>('/validate/lock', {
    schema: {
      querystring: z.object({
        resource_id: z.string().uuid(),
        lock_type: z.string().optional()
      })
    }
  }, async (request, reply) => {
    try {
      const { resource_id, lock_type } = request.query;
      
      const isLocked = await workflowService.isResourceLocked(resource_id, lock_type);
      reply.send({ is_locked: isLocked });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to check resource lock status' });
    }
  });
}