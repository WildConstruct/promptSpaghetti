import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AttributionService } from '../services/attribution-service';
import { 
  CreateAttributionRequestSchema,
  AttributionFilterSchema,
  AttributionStatsRequestSchema,
  UpdatePrivacySettingsRequestSchema
} from '../../../packages/core/types/attribution';

export async function attributionRoutes(fastify: FastifyInstance) {
  const attributionService = new AttributionService(fastify.db, fastify.log);

  // Record change attribution
  fastify.post('/attribution/record', {
    schema: {
      body: CreateAttributionRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      const context = {
        projectId: request.body.projectId,
        userId,
        sessionId: request.headers['x-session-id'] as string,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        isAnonymous: !userId,
        trackingConsent: request.headers['x-tracking-consent'] === 'true'
      };

      const attribution = await attributionService.recordAttribution(request.body, context);
      
      reply.status(201).send({
        success: true,
        data: attribution
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to record attribution'
      });
    }
  });

  // Get attribution statistics
  fastify.get('/attribution/stats/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      },
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['hour', 'day', 'week', 'month'] },
          authorId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          resourceType: { type: 'string', enum: ['node', 'edge', 'property', 'position', 'graph'] },
          changeType: { type: 'string', enum: ['create', 'update', 'delete', 'move', 'property_change', 'connection_change'] },
          includeAggregations: { type: 'boolean', default: true },
          includeTimeline: { type: 'boolean', default: false },
          includeHeatmap: { type: 'boolean', default: false },
          includeCollaborationMetrics: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const query = request.query as any;
      
      const statsRequest = {
        projectId,
        period: query.period,
        authorId: query.authorId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        resourceType: query.resourceType,
        changeType: query.changeType,
        includeAggregations: query.includeAggregations,
        includeTimeline: query.includeTimeline,
        includeHeatmap: query.includeHeatmap,
        includeCollaborationMetrics: query.includeCollaborationMetrics
      };

      const stats = await attributionService.getAttributionStats(statsRequest);
      
      reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get attribution statistics'
      });
    }
  });

  // Get attribution timeline
  fastify.get('/attribution/timeline/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      },
      querystring: {
        type: 'object',
        properties: {
          resourceType: { type: 'string', enum: ['node', 'edge', 'property', 'position', 'graph'] },
          resourceId: { type: 'string' },
          changeType: { type: 'string', enum: ['create', 'update', 'delete', 'move', 'property_change', 'connection_change'] },
          authorId: { type: 'string', format: 'uuid' },
          authorType: { type: 'string', enum: ['user', 'anonymous', 'guest', 'system', 'api'] },
          sessionId: { type: 'string' },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const query = request.query as any;
      
      const filter = {
        projectId,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
        changeType: query.changeType,
        authorId: query.authorId,
        authorType: query.authorType,
        sessionId: query.sessionId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        limit: query.limit || 100,
        offset: query.offset || 0
      };

      const timeline = await attributionService.getAttributionTimeline(projectId, filter);
      
      reply.send({
        success: true,
        data: timeline
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get attribution timeline'
      });
    }
  });

  // Get contributor statistics
  fastify.get('/attribution/contributors/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      },
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const query = request.query as any;
      
      const dateRange = (query.startDate || query.endDate) ? {
        start: query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: query.endDate ? new Date(query.endDate) : new Date()
      } : undefined;

      const contributors = await attributionService.getContributorStats(projectId, dateRange);
      
      reply.send({
        success: true,
        data: contributors
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get contributor statistics'
      });
    }
  });

  // List attributions with filtering
  fastify.get('/attribution/list', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          resourceType: { type: 'string', enum: ['node', 'edge', 'property', 'position', 'graph'] },
          resourceId: { type: 'string' },
          changeType: { type: 'string', enum: ['create', 'update', 'delete', 'move', 'property_change', 'connection_change'] },
          authorId: { type: 'string', format: 'uuid' },
          authorType: { type: 'string', enum: ['user', 'anonymous', 'guest', 'system', 'api'] },
          sessionId: { type: 'string' },
          batchId: { type: 'string', format: 'uuid' },
          snapshotId: { type: 'string', format: 'uuid' },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
          isCollaborative: { type: 'boolean' },
          minConfidenceScore: { type: 'number', minimum: 0, maximum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['created_at', 'effective_at', 'change_size', 'confidence_score'], default: 'created_at' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      
      const filter = {
        projectId: query.projectId,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
        changeType: query.changeType,
        authorId: query.authorId,
        authorType: query.authorType,
        sessionId: query.sessionId,
        batchId: query.batchId,
        snapshotId: query.snapshotId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        isCollaborative: query.isCollaborative,
        minConfidenceScore: query.minConfidenceScore,
        limit: query.limit || 100,
        offset: query.offset || 0,
        sortBy: query.sortBy || 'created_at',
        sortOrder: query.sortOrder || 'desc'
      };

      const attributions = await attributionService.listAttributions(filter);
      
      reply.send({
        success: true,
        data: attributions
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to list attributions'
      });
    }
  });

  // Start attribution session
  fastify.post('/attribution/session/start', {
    schema: {
      body: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          sessionId: { type: 'string' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId, sessionId } = request.body as { projectId: string; sessionId?: string };
      const userId = request.user?.id;
      
      const context = {
        projectId,
        userId,
        sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        isAnonymous: !userId,
        trackingConsent: request.headers['x-tracking-consent'] === 'true'
      };

      const session = await attributionService.startSession(context);
      
      reply.status(201).send({
        success: true,
        data: session
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to start attribution session'
      });
    }
  });

  // End attribution session
  fastify.post('/attribution/session/end', {
    schema: {
      body: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' }
        },
        required: ['sessionId']
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.body as { sessionId: string };
      
      await attributionService.endSession(sessionId);
      
      reply.send({
        success: true,
        message: 'Session ended successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to end attribution session'
      });
    }
  });

  // Update privacy settings
  fastify.put('/attribution/privacy/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      },
      body: {
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            properties: {
              showInAttribution: { type: 'boolean' },
              showDetailedChanges: { type: 'boolean' },
              showTimingInfo: { type: 'boolean' },
              showLocationInfo: { type: 'boolean' },
              trackPropertyChanges: { type: 'boolean' },
              trackPositionChanges: { type: 'boolean' },
              trackMouseMovements: { type: 'boolean' },
              trackKeystrokes: { type: 'boolean' },
              retentionDays: { type: 'integer', minimum: 1, maximum: 3650 },
              autoAnonymizeAfterDays: { type: 'integer', minimum: 1, maximum: 365 }
            }
          }
        },
        required: ['settings']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { projectId } = request.params as { projectId: string };
      const { settings } = request.body as { settings: any };

      const updateRequest = {
        projectId,
        settings
      };

      const privacySettings = await attributionService.updatePrivacySettings(updateRequest, userId);
      
      reply.send({
        success: true,
        data: privacySettings
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update privacy settings'
      });
    }
  });

  // Get privacy settings
  fastify.get('/attribution/privacy/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { projectId } = request.params as { projectId: string };
      
      const privacySettings = await attributionService.getPrivacySettings(projectId, userId);
      
      reply.send({
        success: true,
        data: privacySettings
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get privacy settings'
      });
    }
  });

  // Clean up old attribution data
  fastify.post('/attribution/cleanup/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      
      await attributionService.cleanupOldData(projectId);
      
      reply.send({
        success: true,
        message: 'Attribution data cleanup completed'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to cleanup attribution data'
      });
    }
  });

  // Get attribution for specific resource
  fastify.get('/attribution/resource/:projectId/:resourceType/:resourceId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          resourceType: { type: 'string', enum: ['node', 'edge', 'property', 'position', 'graph'] },
          resourceId: { type: 'string' }
        },
        required: ['projectId', 'resourceType', 'resourceId']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId, resourceType, resourceId } = request.params as { 
        projectId: string; 
        resourceType: string; 
        resourceId: string; 
      };
      const query = request.query as any;
      
      const filter = {
        projectId,
        resourceType: resourceType as any,
        resourceId,
        limit: query.limit || 20,
        offset: query.offset || 0,
        sortBy: 'created_at' as any,
        sortOrder: 'desc' as any
      };

      const attributions = await attributionService.listAttributions(filter);
      
      reply.send({
        success: true,
        data: attributions
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get resource attribution'
      });
    }
  });

  // Get attribution for specific author
  fastify.get('/attribution/author/:projectId/:authorId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          authorId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId', 'authorId']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId, authorId } = request.params as { projectId: string; authorId: string };
      const query = request.query as any;
      
      const filter = {
        projectId,
        authorId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        limit: query.limit || 20,
        offset: query.offset || 0,
        sortBy: 'created_at' as any,
        sortOrder: 'desc' as any
      };

      const attributions = await attributionService.listAttributions(filter);
      
      reply.send({
        success: true,
        data: attributions
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get author attribution'
      });
    }
  });

  // Batch record multiple attributions
  fastify.post('/attribution/batch', {
    schema: {
      body: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          batchId: { type: 'string', format: 'uuid' },
          attributions: {
            type: 'array',
            items: CreateAttributionRequestSchema.omit({ projectId: true }),
            maxItems: 100
          }
        },
        required: ['projectId', 'attributions']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId, batchId, attributions } = request.body as {
        projectId: string;
        batchId?: string;
        attributions: any[];
      };
      
      const userId = request.user?.id;
      const context = {
        projectId,
        userId,
        sessionId: request.headers['x-session-id'] as string,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        isAnonymous: !userId,
        trackingConsent: request.headers['x-tracking-consent'] === 'true'
      };

      const results = [];
      
      for (const attribution of attributions) {
        const attributionRequest = {
          ...attribution,
          projectId,
          batchId
        };
        
        const result = await attributionService.recordAttribution(attributionRequest, context);
        results.push(result);
      }
      
      reply.status(201).send({
        success: true,
        data: results
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to record batch attributions'
      });
    }
  });
}