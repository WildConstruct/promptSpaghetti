/**
 * Epic 23: Conflict Resolution API Endpoints
 * 
 * REST API for managing conflict resolution, rollbacks, and real-time 
 * collaborative editing conflicts in workspace resources.
 * 
 * Task: E23-1753115279513-6E9F4C - Implement conflict resolution & rollback logic
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConflictResolutionService } from '../../collaboration/ConflictResolutionService';
import { Epic23WorkspaceDAO } from '../../database/epic23-workspace-dao';
import { ResolutionStrategy, ConflictSeverity } from '../../collaboration/ConflictResolutionEngine';
import { COLLABORATIVE_PERMISSIONS } from '../../database/epic23-workspace-models';

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

}
interface GetConflictsRequest {
  Params: {
    resourceId: string;
}
  };
}

}
interface ResolveConflictRequest {
  Params: {
    resourceId: string;
}
  };
  Body: {
    strategy: ResolutionStrategy;
    user_resolution?: any;
  };
}

}
interface RollbackRequest {
  Params: {
    resourceId: string;
}
  };
  Body: {
    rollback_id?: string;
  };
}

}
interface CreateRollbackPointRequest {
  Params: {
    resourceId: string;
}
  };
  Body: {
    label?: string;
  };
}

}
interface ConflictAnalysisRequest {
  Params: {
    resourceId: string;
}
  };
}

}
interface StartMonitoringRequest {
  Params: {
    resourceId: string;
}
  };
}

}
interface StopMonitoringRequest {
  Params: {
    resourceId: string;
}
  };
}

}
interface GetStatisticsRequest {
  Params: {
    resourceId?: string;
}
  };
}

}
interface UpdateConfigRequest {
  Body: {
    default_strategy?: ResolutionStrategy;
    auto_resolution_enabled?: boolean;
    max_resolution_time_ms?: number;
    rollback_enabled?: boolean;
    max_rollback_points?: number;
    notification_enabled?: boolean;
    conflict_threshold_seconds?: number;
}
  };
}

// =============================================================================
// API ROUTE DEFINITIONS
// =============================================================================

export async function conflictResolutionRoutes(
  fastify: FastifyInstance,
  workspaceDAO: Epic23WorkspaceDAO
): Promise<void> {

  const conflictService = new ConflictResolutionService(workspaceDAO);

  // =============================================================================
  // CONFLICT DETECTION & MONITORING
  // =============================================================================

  /**
   * GET /api/collaboration/conflicts/:resourceId
   * Get active conflicts for a resource
   */
  fastify.get<GetConflictsRequest>(
    '/conflicts/:resourceId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
        }
      }
  }
    async (request: FastifyRequest<GetConflictsRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        // Check if user has permission to view conflicts
        const sessions = await workspaceDAO.getActiveEditSessions(resourceId);
        if (sessions.length > 0) {
          const workspaceId = sessions[0].workspace_id;
          const canView = await workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.REAL_TIME_EDIT
          );

          if (!canView) {
            return reply.status(403).send({ error: 'Insufficient permissions' });
          }
        }

        const conflicts = await conflictService.checkResourceForConflicts(resourceId);

        return reply.send({
          resource_id: resourceId,
          conflicts,
          conflict_count: conflicts.length,
          last_checked: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to get conflicts');
        return reply.status(500).send({ error: 'Failed to retrieve conflicts' });
      }
    }
  );

  /**
   * POST /api/collaboration/conflicts/:resourceId/start-monitoring
   * Start monitoring resource for conflicts
   */
  fastify.post<StartMonitoringRequest>(
    '/conflicts/:resourceId/start-monitoring',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
        }
      }
  }
    async (request: FastifyRequest<StartMonitoringRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        // Check permissions
        const sessions = await workspaceDAO.getActiveEditSessions(resourceId);
        if (sessions.length > 0) {
          const workspaceId = sessions[0].workspace_id;
          const canMonitor = await workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.SESSION_MANAGE
          );

          if (!canMonitor) {
            return reply.status(403).send({ error: 'Insufficient permissions' });
          }
        }

        await conflictService.startConflictMonitoring(resourceId);

        return reply.send({
          resource_id: resourceId,
          monitoring_started: true,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to start monitoring');
        return reply.status(500).send({ error: 'Failed to start conflict monitoring' });
      }
    }
  );

  /**
   * POST /api/collaboration/conflicts/:resourceId/stop-monitoring
   * Stop monitoring resource for conflicts
   */
  fastify.post<StopMonitoringRequest>(
    '/conflicts/:resourceId/stop-monitoring',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
        }
      }
  }
    async (request: FastifyRequest<StopMonitoringRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        conflictService.stopConflictMonitoring(resourceId);

        return reply.send({
          resource_id: resourceId,
          monitoring_stopped: true,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to stop monitoring');
        return reply.status(500).send({ error: 'Failed to stop conflict monitoring' });
      }
    }
  );

  // =============================================================================
  // CONFLICT RESOLUTION
  // =============================================================================

  /**
   * POST /api/collaboration/conflicts/:resourceId/resolve
   * Resolve conflicts for a resource
   */
  fastify.post<ResolveConflictRequest>(
    '/conflicts/:resourceId/resolve',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
  }
        body: {
          type: 'object',
          properties: {
            strategy: {
              type: 'string',
              enum: Object.values(ResolutionStrategy)
  }
            user_resolution: { type: 'object' }
  }
          required: ['strategy']
        }
      }
  }
    async (request: FastifyRequest<ResolveConflictRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const { strategy, user_resolution } = request.body;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        // Check if user has permission to resolve conflicts
        const sessions = await workspaceDAO.getActiveEditSessions(resourceId);
        if (sessions.length > 0) {
          const workspaceId = sessions[0].workspace_id;
          const canResolve = await workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.CONFLICT_RESOLVE
          );

          if (!canResolve) {
            return reply.status(403).send({ error: 'Insufficient permissions to resolve conflicts' });
          }
        }

        const result = await conflictService.resolveConflictsManually(
          resourceId,
          strategy,
          user_resolution,
          userId
        );

        const statusCode = result.success ? 200 : 422;
        return reply.status(statusCode).send({
          resource_id: resourceId,
          resolution_result: result,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to resolve conflicts');
        return reply.status(500).send({ error: 'Failed to resolve conflicts' });
      }
    }
  );

  /**
   * GET /api/collaboration/conflicts/:resourceId/analysis
   * Get conflict risk analysis for a resource
   */
  fastify.get<ConflictAnalysisRequest>(
    '/conflicts/:resourceId/analysis',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
        }
      }
  }
    async (request: FastifyRequest<ConflictAnalysisRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const analysis = await conflictService.analyzeConflictRisk(resourceId);

        return reply.send({
          resource_id: resourceId,
          analysis,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to analyze conflicts');
        return reply.status(500).send({ error: 'Failed to analyze conflict risk' });
      }
    }
  );

  // =============================================================================
  // ROLLBACK OPERATIONS
  // =============================================================================

  /**
   * POST /api/collaboration/rollback/:resourceId
   * Perform rollback on a resource
   */
  fastify.post<RollbackRequest>(
    '/rollback/:resourceId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
  }
        body: {
          type: 'object',
          properties: {
            rollback_id: { type: 'string' }
          }
        }
      }
  }
    async (request: FastifyRequest<RollbackRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const { rollback_id } = request.body;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const success = await conflictService.performRollback(resourceId, rollback_id, userId);

        const statusCode = success ? 200 : 422;
        return reply.status(statusCode).send({
          resource_id: resourceId,
          rollback_id,
          success,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to perform rollback');
        return reply.status(500).send({ error: 'Failed to perform rollback' });
      }
    }
  );

  /**
   * POST /api/collaboration/rollback/:resourceId/create-point
   * Create rollback point for a resource
   */
  fastify.post<CreateRollbackPointRequest>(
    '/rollback/:resourceId/create-point',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
  }
        body: {
          type: 'object',
          properties: {
            label: { type: 'string' }
          }
        }
      }
  }
    async (request: FastifyRequest<CreateRollbackPointRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const { label } = request.body;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        // Check permissions
        const sessions = await workspaceDAO.getActiveEditSessions(resourceId);
        if (sessions.length > 0) {
          const workspaceId = sessions[0].workspace_id;
          const canCreateRollback = await workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.VERSION_CONTROL
          );

          if (!canCreateRollback) {
            return reply.status(403).send({ error: 'Insufficient permissions to create rollback points' });
          }
        }

        const rollbackId = await conflictService.createRollbackPoint(resourceId, label, userId);

        return reply.send({
          resource_id: resourceId,
          rollback_id: rollbackId,
          label,
          created_by: userId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to create rollback point');
        return reply.status(500).send({ error: 'Failed to create rollback point' });
      }
    }
  );

  /**
   * GET /api/collaboration/rollback/:resourceId/points
   * Get available rollback points for a resource
   */
  fastify.get<{ Params: { resourceId: string } }>(
    '/rollback/:resourceId/points',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            resourceId: { type: 'string' }
  }
          required: ['resourceId']
        }
      }
  }
    async (request, reply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const rollbackPoints = conflictService.getRollbackPoints(resourceId);

        return reply.send({
          resource_id: resourceId,
          rollback_points: rollbackPoints,
          count: rollbackPoints.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error, resourceId: request.params.resourceId }, 'Failed to get rollback points');
        return reply.status(500).send({ error: 'Failed to retrieve rollback points' });
      }
    }
  );

  // =============================================================================
  // STATISTICS & MONITORING
  // =============================================================================

  /**
   * GET /api/collaboration/conflicts/statistics
   * Get conflict resolution statistics
   */
  fastify.get<GetStatisticsRequest>(
    '/conflicts/statistics/:resourceId?',
    async (request: FastifyRequest<GetStatisticsRequest>, reply: FastifyReply) => {
      try {
        const { resourceId } = request.params;
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const statistics = conflictService.getConflictStatistics(resourceId);

        return reply.send({
          resource_id: resourceId || 'all',
          statistics,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error }, 'Failed to get conflict statistics');
        return reply.status(500).send({ error: 'Failed to retrieve statistics' });
      }
    }
  );

  /**
   * PUT /api/collaboration/conflicts/config
   * Update conflict resolution configuration
   */
  fastify.put<UpdateConfigRequest>(
    '/conflicts/config',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            default_strategy: {
              type: 'string',
              enum: Object.values(ResolutionStrategy)
  }
            auto_resolution_enabled: { type: 'boolean' },
            max_resolution_time_ms: { type: 'integer', minimum: 1000 },
            rollback_enabled: { type: 'boolean' },
            max_rollback_points: { type: 'integer', minimum: 1, maximum: 50 },
            notification_enabled: { type: 'boolean' },
            conflict_threshold_seconds: { type: 'integer', minimum: 1 }
          }
        }
      }
  }
    async (request: FastifyRequest<UpdateConfigRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        // For now, allow any authenticated user to update config
        // In production, this should be admin-only
        conflictService.updateConfig(request.body);

        return reply.send({
          message: 'Configuration updated successfully',
          config: request.body,
          updated_by: userId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error }, 'Failed to update conflict resolution config');
        return reply.status(500).send({ error: 'Failed to update configuration' });
      }
    }
  );

  // =============================================================================
  // CLEANUP ENDPOINT
  // =============================================================================

  /**
   * POST /api/collaboration/conflicts/cleanup
   * Manual cleanup of conflict resolution service resources
   */
  fastify.post(
    '/conflicts/cleanup',
    async (request, reply) => {
      try {
        const userId = request.user?.id;

        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        conflictService.cleanup();

        return reply.send({
          message: 'Conflict resolution service cleanup completed',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        request.log.error({ error }, 'Failed to cleanup conflict resolution service');
        return reply.status(500).send({ error: 'Failed to cleanup service' });
      }
    }
  );

  // =============================================================================
  // EVENT HANDLING SETUP
  // =============================================================================

  // Set up event listeners for real-time notifications
  conflictService.on('conflicts_detected', (notification) => {
    // In production, this would emit WebSocket events to affected users
    fastify.log.info({ notification }, 'Conflicts detected');
  });

  conflictService.on('conflicts_auto_resolved', (notification) => {
    fastify.log.info({ notification }, 'Conflicts auto-resolved');
  });

  conflictService.on('auto_resolution_failed', (notification) => {
    fastify.log.warn({ notification }, 'Auto-resolution failed');
  });

  conflictService.on('manual_resolution_completed', ({ resourceId, result, userId }) => {
    fastify.log.info({ resourceId, success: result.success, userId }, 'Manual resolution completed');
  });

  conflictService.on('rollback_performed', ({ resourceId, rollbackId, userId }) => {
    fastify.log.info({ resourceId, rollbackId, userId }, 'Rollback performed');
  });

  // Clean up on server shutdown
  fastify.addHook('onClose', async () => {
    conflictService.cleanup();
  });
}