/**
 * Toggle State API Routes - Epic 17
 * Task: E17-1753114396733-DEC5DC - Design API for toggle state
 * 
 * Comprehensive API for querying, monitoring, and managing feature toggle states
 * with bulk operations, real-time updates, and state analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ToggleStateService, ToggleStateQuery, BulkStateOperation } from '../services/ToggleStateService';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import { ToggleEvaluationContext, ToggleType, ClaudeImpact } from '../database/feature-toggle-models';

}
interface ToggleStateRouteOptions {
  dao: FeatureToggleDAO;
}
}

// Request schemas for validation
const stateQuerySchema = {
  type: 'object',
  properties: {
    keys: { 
      type: 'array', 
      items: { type: 'string' },
      maxItems: 100
  }
    types: {
      type: 'array',
      items: { type: 'string', enum: Object.values(ToggleType) }
  }
    enabled: { type: 'boolean' },
    claudeImpact: {
      type: 'array',
      items: { type: 'string', enum: Object.values(ClaudeImpact) }
  }
    orgId: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    lastModified: { 
      type: 'object',
      properties: {
        since: { type: 'string', format: 'date-time' },
        until: { type: 'string', format: 'date-time' }
      }
  }
    includeMetadata: { type: 'boolean', default: false },
    includeAudit: { type: 'boolean', default: false }
  }
};

const bulkStateOperationSchema = {
  type: 'object',
  required: ['operation', 'toggles'],
  properties: {
    operation: {
      type: 'string',
      enum: ['enable', 'disable', 'toggle', 'update_values']
  }
    toggles: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' }, // Toggle key/ID
          {
            type: 'object',
            required: ['key'],
            properties: {
              key: { type: 'string' },
              value: {},
              reason: { type: 'string' }
            }
          }
        ]
  }
      minItems: 1,
      maxItems: 50
  }
    reason: { type: 'string', maxLength: 500 },
    dryRun: { type: 'boolean', default: false },
    rollbackOnError: { type: 'boolean', default: true }
  }
};

const stateWatchSchema = {
  type: 'object',
  properties: {
    keys: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 20
  }
    events: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['state_changed', 'value_updated', 'enabled', 'disabled', 'created', 'archived']
  }
      default: ['state_changed', 'value_updated']
  }
    filters: stateQuerySchema
  }
};

export default async function toggleStateRoutes(
  fastify: FastifyInstance,
  options: ToggleStateRouteOptions
) {
  const stateService = new ToggleStateService(options.dao);

  // Middleware for authentication check
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    // Integration with Epic 11 auth system
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Middleware for admin permissions
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.permissions?.includes('toggle.manage')) {
      return reply.code(403).send({ error: 'Admin permissions required' });
    }
  };

  // ==========================================
  // TOGGLE STATE QUERIES
  // ==========================================

  // GET /api/toggle-state/query
  // Query toggle states with flexible filtering
  fastify.get('/query', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          ...stateQuerySchema.properties,
          format: {
            type: 'string',
            enum: ['full', 'minimal', 'keys_only', 'summary'],
            default: 'full'
  }
          sort: {
            type: 'string',
            enum: ['name', 'key', 'created_at', 'updated_at', 'usage_count'],
            default: 'name'
  }
          order: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
  }
          limit: { type: 'number', minimum: 1, maximum: 500, default: 100 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            states: { type: 'array' },
            total: { type: 'number' },
            metadata: {
              type: 'object',
              properties: {
                queryTime: { type: 'number' },
                cacheHit: { type: 'boolean' },
                filters: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const query = request.query as any;
      const user = (request as any).user;

      // Build state query
      const stateQuery: ToggleStateQuery = {
        keys: query.keys,
        types: query.types,
        enabled: query.enabled,
        claudeImpact: query.claudeImpact,
        orgId: query.orgId || user.orgId,
        tags: query.tags,
        lastModified: query.lastModified,
        includeMetadata: query.includeMetadata,
        includeAudit: query.includeAudit,
        limit: query.limit,
        offset: query.offset,
        sort: query.sort,
        order: query.order
      };

      const result = await stateService.queryStates(stateQuery, query.format);
      const queryTime = Date.now() - startTime;

      return reply.send({
        success: true,
        states: result.states,
        total: result.total,
        metadata: {
          queryTime,
          cacheHit: result.cacheHit || false,
          filters: stateQuery
        }
      });
    } catch (error) {
      fastify.log.error('Failed to query toggle states:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to query toggle states',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-state/summary
  // Get aggregated state summary and statistics
  fastify.get('/summary', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
          groupBy: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['type', 'enabled', 'claudeImpact', 'created_by', 'updated_by']
  }
            default: ['type', 'enabled']
  }
          timeRange: {
            type: 'string',
            enum: ['1h', '24h', '7d', '30d', 'all'],
            default: '24h'
          }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            summary: {
              type: 'object',
              properties: {
                totalToggles: { type: 'number' },
                activeToggles: { type: 'number' },
                recentlyModified: { type: 'number' },
                claudeImpactToggles: { type: 'number' },
                groupedCounts: { type: 'object' },
                healthMetrics: { type: 'object' },
                topModified: { type: 'array' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { orgId, groupBy, timeRange } = request.query as any;
      const user = (request as any).user;

      const summary = await stateService.getStateSummary({
        orgId: orgId || user.orgId,
        groupBy,
        timeRange
      });

      return reply.send({
        success: true,
        summary
      });
    } catch (error) {
      fastify.log.error('Failed to get state summary:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get state summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-state/changes
  // Get recent state changes with diff information
  fastify.get('/changes', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          since: { type: 'string', format: 'date-time' },
          until: { type: 'string', format: 'date-time' },
          keys: { type: 'array', items: { type: 'string' } },
          actors: { type: 'array', items: { type: 'string' } },
          actions: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['created', 'updated', 'activated', 'deactivated', 'archived', 'override']
            }
  }
          limit: { type: 'number', minimum: 1, maximum: 200, default: 50 },
          includeDiff: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      const user = (request as any).user;

      const changes = await stateService.getStateChanges({
        ...query,
        orgId: user.orgId
      });

      return reply.send({
        success: true,
        changes
      });
    } catch (error) {
      fastify.log.error('Failed to get state changes:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get state changes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  // POST /api/toggle-state/bulk
  // Perform bulk operations on toggle states
  fastify.post('/bulk', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: bulkStateOperationSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            operation: { type: 'string' },
            results: {
              type: 'object',
              properties: {
                successful: { type: 'array' },
                failed: { type: 'array' },
                rollbacks: { type: 'array' }
              }
  }
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                skipped: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const bulkOperation = request.body as BulkStateOperation;
      const user = (request as any).user;

      // Add user context to operation
      const operation: BulkStateOperation = {
        ...bulkOperation,
        actorId: user.id,
        timestamp: new Date()
      };

      const result = await stateService.executeBulkOperation(operation);

      return reply.send({
        success: true,
        operation: operation.operation,
        results: result.results,
        summary: result.summary
      });
    } catch (error) {
      fastify.log.error('Failed to execute bulk operation:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to execute bulk operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-state/clone
  // Clone toggle states from one environment/organization to another
  fastify.post('/clone', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        required: ['source', 'target'],
        properties: {
          source: {
            type: 'object',
            properties: {
              orgId: { type: 'string' },
              keys: { type: 'array', items: { type: 'string' } },
              filters: stateQuerySchema
            }
  }
          target: {
            type: 'object',
            required: ['orgId'],
            properties: {
              orgId: { type: 'string' },
              keyPrefix: { type: 'string' },
              keyMapping: { type: 'object' },
              overwriteExisting: { type: 'boolean', default: false }
            }
  }
          options: {
            type: 'object',
            properties: {
              includeDisabled: { type: 'boolean', default: true },
              includeAuditTrail: { type: 'boolean', default: false },
              dryRun: { type: 'boolean', default: false }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { source, target, options = {} } = request.body as any;
      const user = (request as any).user;

      const result = await stateService.cloneStates({
        source: { ...source, orgId: source.orgId || user.orgId },
        target,
        options: { ...options, actorId: user.id }
      });

      return reply.send({
        success: true,
        cloneResult: result
      });
    } catch (error) {
      fastify.log.error('Failed to clone toggle states:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to clone toggle states',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // REAL-TIME STATE MONITORING
  // ==========================================

  // GET /api/toggle-state/watch (Server-Sent Events)
  // Real-time toggle state change notifications
  fastify.get('/watch', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          ...stateWatchSchema.properties,
          heartbeat: { type: 'number', minimum: 5, maximum: 300, default: 30 }
        }
      }
    }
  }, async (request, reply) => {
    const query = request.query as any;
    const user = (request as any).user;

    // Set up Server-Sent Events
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const sendEvent = (eventType: string, data: any) => {
      reply.raw.write(`event: ${eventType}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial connection confirmation
    sendEvent('connected', {
      timestamp: new Date().toISOString(),
      userId: user.id,
      filters: query
    });

    // Set up state change listener
    const unsubscribe = await stateService.watchStates({
      keys: query.keys,
      events: query.events || ['state_changed', 'value_updated'],
      filters: { ...query.filters, orgId: query.filters?.orgId || user.orgId },
      callback: (event) => {
        sendEvent('state_change', event);
      }
    });

    // Set up heartbeat
    const heartbeatInterval = setInterval(() => {
      sendEvent('heartbeat', { timestamp: new Date().toISOString() });
    }, (query.heartbeat || 30) * 1000);

    // Handle client disconnect
    request.raw.on('close', () => {
      clearInterval(heartbeatInterval);
      unsubscribe();
      fastify.log.info('State watch connection closed');
    });

    // Keep connection alive
    return reply;
  });

  // ==========================================
  // STATE COMPARISON & DIFF
  // ==========================================

  // POST /api/toggle-state/compare
  // Compare toggle states between environments or time points
  fastify.post('/compare', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['left', 'right'],
        properties: {
          left: {
            type: 'object',
            properties: {
              orgId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              filters: stateQuerySchema
            }
  }
          right: {
            type: 'object',
            properties: {
              orgId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              filters: stateQuerySchema
            }
  }
          options: {
            type: 'object',
            properties: {
              includeValues: { type: 'boolean', default: true },
              includeMetadata: { type: 'boolean', default: false },
              diffFormat: {
                type: 'string',
                enum: ['unified', 'split', 'json'],
                default: 'unified'
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { left, right, options = {} } = request.body as any;
      const user = (request as any).user;

      const comparison = await stateService.compareStates({
        left: { ...left, orgId: left.orgId || user.orgId },
        right: { ...right, orgId: right.orgId || user.orgId },
        options
      });

      return reply.send({
        success: true,
        comparison
      });
    } catch (error) {
      fastify.log.error('Failed to compare toggle states:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to compare toggle states',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // HEALTH & DIAGNOSTICS
  // ==========================================

  // GET /api/toggle-state/health
  // Get toggle state system health and diagnostics
  fastify.get('/health', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          includeDetails: { type: 'boolean', default: false },
          orgId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { includeDetails, orgId } = request.query as any;
      const user = (request as any).user;

      const health = await stateService.getSystemHealth({
        orgId: orgId || user.orgId,
        includeDetails
      });

      return reply.send({
        success: true,
        health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error('Failed to get system health:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get system health',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-state/validate
  // Validate toggle state configuration and dependencies
  fastify.post('/validate', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          keys: { type: 'array', items: { type: 'string' } },
          orgId: { type: 'string' },
          checks: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['dependencies', 'conflicts', 'claude_impact', 'performance', 'consistency']
  }
            default: ['dependencies', 'conflicts', 'claude_impact']
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { keys, orgId, checks } = request.body as any;
      const user = (request as any).user;

      const validation = await stateService.validateStates({
        keys,
        orgId: orgId || user.orgId,
        checks
      });

      return reply.send({
        success: true,
        validation
      });
    } catch (error) {
      fastify.log.error('Failed to validate toggle states:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to validate toggle states',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Export route registration function
export { toggleStateRoutes };