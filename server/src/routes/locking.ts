// Epic 9.4.3 - Enhanced Locking API Routes
// REST API endpoints for advanced locking management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { LockingService, LockRequest, LockPolicy } from '../services/locking-service';
import { Database } from '../database/connection';

// Zod schemas for validation
const LockRequestSchema = z.object({
  resource_id: z.string().uuid(),
  user_id: z.string().uuid(),
  lock_type: z.enum(['edit', 'state_change', 'delete', 'admin', 'custom']),
  scope: z.enum(['resource', 'project', 'workspace']),
  reason: z.string().optional(),
  duration_minutes: z.number().min(1).max(1440).optional(),
  force: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

const LockPolicySchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  max_locks_per_user: z.number().min(1).max(100).default(10),
  max_locks_per_resource: z.number().min(1).max(20).default(5),
  default_duration_minutes: z.number().min(1).max(1440).default(60),
  max_duration_minutes: z.number().min(1).max(10080).default(1440), // 7 days max
  auto_lock_on_edit: z.boolean().default(false),
  auto_lock_on_state_change: z.boolean().default(false),
  auto_lock_duration_minutes: z.number().min(1).max(1440).default(30),
  allow_lock_breaking: z.boolean().default(true),
  lock_breaking_roles: z.array(z.string()).default([]),
  require_justification: z.boolean().default(true),
  conflict_resolution_strategy: z.enum(['queue', 'reject', 'notify', 'escalate']).default('reject'),
  escalation_timeout_minutes: z.number().min(1).max(1440).default(60)
});

const BreakLockSchema = z.object({
  lock_id: z.string().uuid(),
  breaker_user_id: z.string().uuid(),
  justification: z.string().optional(),
  force: z.boolean().default(false)
});

const WorkspaceParamsSchema = z.object({
  workspaceId: z.string().uuid()
});

const ResourceParamsSchema = z.object({
  resourceId: z.string().uuid()
});

const UserParamsSchema = z.object({
  userId: z.string().uuid()
});

const LockParamsSchema = z.object({
  lockId: z.string().uuid()
});

export default async function lockingRoutes(fastify: FastifyInstance) {
  const db = fastify.db as Database;
  const lockingService = new LockingService(db);

  // =============================================================================
  // LOCK ACQUISITION AND RELEASE
  // =============================================================================

  // Acquire a lock
  fastify.post('/locks/acquire', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lockRequest = LockRequestSchema.parse(request.body);
      const result = await lockingService.acquireLock(lockRequest);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          lock: result.lock,
          message: 'Lock acquired successfully'
        });
      } else {
        reply.code(409).send({
          success: false,
          error: result.error,
          conflict: result.conflict,
          queue_position: result.queue_position
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Release a lock
  fastify.delete('/locks/:lockId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lockId } = LockParamsSchema.parse(request.params);
      const { user_id } = z.object({ user_id: z.string().uuid() }).parse(request.body);
      
      const result = await lockingService.releaseLock(lockId, user_id);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          message: 'Lock released successfully'
        });
      } else {
        reply.code(400).send({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Break a lock
  fastify.post('/locks/break', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lock_id, breaker_user_id, justification, force } = BreakLockSchema.parse(request.body);
      
      const result = await lockingService.breakLock(lock_id, breaker_user_id, justification, force);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          message: 'Lock broken successfully',
          notification_sent: result.notification_sent
        });
      } else {
        reply.code(400).send({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Get locks for a resource
  fastify.get('/resources/:resourceId/locks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { resourceId } = ResourceParamsSchema.parse(request.params);
      const locks = await lockingService.getResourceLocks(resourceId);
      
      reply.code(200).send({
        success: true,
        locks,
        count: locks.length
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Get locks for a user
  fastify.get('/users/:userId/locks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = UserParamsSchema.parse(request.params);
      const locks = await lockingService.getUserLocks(userId);
      
      reply.code(200).send({
        success: true,
        locks,
        count: locks.length
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // LOCK POLICIES
  // =============================================================================

  // Create lock policy
  fastify.post('/workspaces/:workspaceId/lock-policy', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = WorkspaceParamsSchema.parse(request.params);
      const policyData = LockPolicySchema.parse({ ...request.body, workspace_id: workspaceId });
      
      const policy = await lockingService.createLockPolicy(policyData);
      
      reply.code(201).send({
        success: true,
        policy,
        message: 'Lock policy created successfully'
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Get lock policy
  fastify.get('/workspaces/:workspaceId/lock-policy', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = WorkspaceParamsSchema.parse(request.params);
      const policy = await lockingService.getLockPolicy(workspaceId);
      
      if (policy) {
        reply.code(200).send({
          success: true,
          policy
        });
      } else {
        reply.code(404).send({
          success: false,
          error: 'Lock policy not found'
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Update lock policy
  fastify.put('/workspaces/:workspaceId/lock-policy', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = WorkspaceParamsSchema.parse(request.params);
      const policyData = LockPolicySchema.parse({ ...request.body, workspace_id: workspaceId });
      
      const policy = await lockingService.updateLockPolicy(workspaceId, policyData);
      
      reply.code(200).send({
        success: true,
        policy,
        message: 'Lock policy updated successfully'
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // LOCK QUEUE MANAGEMENT
  // =============================================================================

  // Get lock queue for resource
  fastify.get('/resources/:resourceId/lock-queue', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { resourceId } = ResourceParamsSchema.parse(request.params);
      const queue = await lockingService.getLockQueue(resourceId);
      
      reply.code(200).send({
        success: true,
        queue,
        count: queue.length
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Remove from lock queue
  fastify.delete('/lock-queue/:queueId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { queueId } = z.object({ queueId: z.string().uuid() }).parse(request.params);
      const { user_id } = z.object({ user_id: z.string().uuid() }).parse(request.body);
      
      const result = await lockingService.removeFromQueue(queueId, user_id);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          message: 'Removed from queue successfully'
        });
      } else {
        reply.code(400).send({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // LOCK CONFLICTS
  // =============================================================================

  // Get lock conflicts for workspace
  fastify.get('/workspaces/:workspaceId/lock-conflicts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = WorkspaceParamsSchema.parse(request.params);
      const { status } = z.object({ 
        status: z.enum(['pending', 'resolved', 'rejected']).optional() 
      }).parse(request.query);
      
      const conflicts = await lockingService.getLockConflicts(workspaceId, status);
      
      reply.code(200).send({
        success: true,
        conflicts,
        count: conflicts.length
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Resolve lock conflict
  fastify.post('/lock-conflicts/:conflictId/resolve', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { conflictId } = z.object({ conflictId: z.string().uuid() }).parse(request.params);
      const { resolution, user_id } = z.object({
        resolution: z.enum(['approve', 'reject', 'escalate']),
        user_id: z.string().uuid()
      }).parse(request.body);
      
      const result = await lockingService.resolveLockConflict(conflictId, resolution, user_id);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          message: 'Conflict resolved successfully'
        });
      } else {
        reply.code(400).send({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  // Get lock notifications for user
  fastify.get('/users/:userId/lock-notifications', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = UserParamsSchema.parse(request.params);
      const { unread_only } = z.object({ 
        unread_only: z.boolean().default(false) 
      }).parse(request.query);
      
      const notifications = await lockingService.getLockNotifications(userId, unread_only);
      
      reply.code(200).send({
        success: true,
        notifications,
        count: notifications.length
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Mark notification as read
  fastify.post('/lock-notifications/:notificationId/read', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { notificationId } = z.object({ notificationId: z.string().uuid() }).parse(request.params);
      
      const result = await lockingService.markNotificationAsRead(notificationId);
      
      if (result.success) {
        reply.code(200).send({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        reply.code(400).send({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // STATISTICS AND REPORTING
  // =============================================================================

  // Get locking statistics
  fastify.get('/workspaces/:workspaceId/lock-statistics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { workspaceId } = WorkspaceParamsSchema.parse(request.params);
      const statistics = await lockingService.getLockingStatistics(workspaceId);
      
      reply.code(200).send({
        success: true,
        statistics
      });
    } catch (error) {
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // =============================================================================
  // MAINTENANCE
  // =============================================================================

  // Clean up expired locks
  fastify.post('/maintenance/cleanup-expired-locks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const expiredCount = await lockingService.releaseExpiredLocks();
      
      reply.code(200).send({
        success: true,
        expired_count: expiredCount,
        message: `Cleaned up ${expiredCount} expired locks`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed'
      });
    }
  });

  // Send expiration warnings
  fastify.post('/maintenance/send-expiration-warnings', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const warningCount = await lockingService.sendExpirationWarnings();
      
      reply.code(200).send({
        success: true,
        warning_count: warningCount,
        message: `Sent ${warningCount} expiration warnings`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Warning sending failed'
      });
    }
  });

  // Health check
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({
      success: true,
      service: 'locking-service',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  });
}