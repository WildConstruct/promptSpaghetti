/**
 * Historical Analytics API Routes - Story 1.5 Task 5
 * 
 * Provides REST API endpoints for historical analytics data access,
 * time series queries, retention management, and archival operations.
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import HistoricalAnalyticsService, { HistoricalQuerySchema } from '../analytics/HistoricalAnalyticsService';
import { AnalyticsAuthorizationService } from '../analytics/AnalyticsAuthorization';
import { EventRepository } from '../analytics/EventPersistenceLayer';

// Time Range Query Schema
const TimeRangeQuerySchema = z.object({
  startDate: z.number(),
  endDate: z.number(),
  timezone: z.string().default('UTC'),
  includeWeekends: z.boolean().default(true)
});

// Retention Policy Schema for API
const RetentionPolicyRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  rules: z.array(z.object({
    eventTypes: z.array(z.string()),
    categories: z.array(z.string()),
    retentionDays: z.number().min(1).max(3650), // Max 10 years
    archiveBeforeDelete: z.boolean().default(true),
    compressionLevel: z.enum(['none', 'low', 'medium', 'high']).default('medium')
  })),
  enabled: z.boolean().default(true)
});

/**
 * Historical Analytics API Routes
 */
export async function historicalAnalyticsRoutes(fastify: FastifyInstance) {
  const historicalService = fastify.historicalAnalyticsService as HistoricalAnalyticsService;
  const authService = fastify.authService as AnalyticsAuthorizationService;
  const eventRepository = fastify.eventRepository as EventRepository;

  /**
   * Execute historical analytics query with time series data
   */
  fastify.post('/historical/query', {
    schema: {
      description: 'Execute historical analytics query with time series aggregation',
      tags: ['analytics', 'historical'],
      body: HistoricalQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            query: { type: 'object' },
            dataPoints: { type: 'array' },
            statistics: { type: 'object' },
            cacheInfo: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.body as z.infer<typeof HistoricalQuerySchema>;
      
      // Create auth context and authorize query
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Build filter with authorization constraints
      const authorizedFilter = {
        ...query.filter,
        userId: authContext.role !== 'admin' ? authContext.userId : query.filter?.userIds?.[0],
        organizationId: authContext.organizationId
      };

      const authorizedQuery = { ...query, filter: authorizedFilter };
      
      // Execute historical query
      const result = await historicalService.queryHistoricalData(authorizedQuery);
      
      return reply.send(result);

    } catch (error) {
      console.error('Historical query error:', error);
      return reply.code(500).send({
        error: 'Historical query failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get historical events with pagination
   */
  fastify.post('/historical/events', {
    schema: {
      description: 'Retrieve historical events with filtering and pagination',
      tags: ['analytics', 'historical'],
      body: z.object({
        timeRange: TimeRangeQuerySchema,
        filter: z.object({
          types: z.array(z.string()).optional(),
          categories: z.array(z.string()).optional(),
          sources: z.array(z.string()).optional(),
          severities: z.array(z.string()).optional(),
          search: z.string().optional()
        }).optional(),
        pagination: z.object({
          limit: z.number().min(1).max(1000).default(50),
          offset: z.number().min(0).default(0)
        }).optional()
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            events: { type: 'array' },
            pagination: { type: 'object' },
            totalCount: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeRange, filter = {}, pagination = {} } = request.body as any;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Apply authorization to filter
      const authorizedFilter = {
        ...filter,
        userId: authContext.role !== 'admin' ? authContext.userId : undefined,
        organizationId: authContext.organizationId,
        startTime: timeRange.startDate,
        endTime: timeRange.endDate
      };

      // Get events and total count
      const [events, totalCount] = await Promise.all([
        historicalService.getHistoricalEvents(
          timeRange.startDate,
          timeRange.endDate,
          authorizedFilter,
          pagination.limit || 50,
          pagination.offset || 0
        ),
        eventRepository.count(authorizedFilter)
      ]);

      return reply.send({
        events,
        pagination: {
          limit: pagination.limit || 50,
          offset: pagination.offset || 0,
          hasMore: totalCount > (pagination.offset || 0) + events.length
        },
        totalCount
      });

    } catch (error) {
      console.error('Historical events retrieval error:', error);
      return reply.code(500).send({
        error: 'Failed to retrieve historical events',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get historical analytics performance metrics
   */
  fastify.get('/historical/metrics', {
    schema: {
      description: 'Get historical analytics performance and volume metrics',
      tags: ['analytics', 'historical', 'metrics'],
      response: {
        200: {
          type: 'object',
          properties: {
            queryPerformance: { type: 'object' },
            dataVolume: { type: 'object' },
            retentionExecution: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can view system metrics
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for historical analytics metrics'
        });
      }

      const metrics = await historicalService.getHistoricalAnalyticsMetrics();
      return reply.send(metrics);

    } catch (error) {
      console.error('Historical metrics error:', error);
      return reply.code(500).send({
        error: 'Failed to retrieve historical metrics',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Create retention policy
   */
  fastify.post('/historical/retention-policies', {
    schema: {
      description: 'Create new data retention policy',
      tags: ['analytics', 'historical', 'retention'],
      body: RetentionPolicyRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            policyId: { type: 'string' },
            created: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const policyData = request.body as z.infer<typeof RetentionPolicyRequestSchema>;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can create retention policies
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for retention policy management'
        });
      }

      const policyId = await historicalService.createRetentionPolicy(policyData);
      
      return reply.code(201).send({
        policyId,
        created: true
      });

    } catch (error) {
      console.error('Retention policy creation error:', error);
      return reply.code(500).send({
        error: 'Failed to create retention policy',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Execute retention policies manually
   */
  fastify.post('/historical/retention/execute', {
    schema: {
      description: 'Manually execute retention policies',
      tags: ['analytics', 'historical', 'retention'],
      response: {
        200: {
          type: 'object',
          properties: {
            processed: { type: 'number' },
            archived: { type: 'number' },
            deleted: { type: 'number' },
            executionTime: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can execute retention policies
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for retention policy execution'
        });
      }

      const startTime = Date.now();
      const result = await historicalService.executeRetentionPolicies();
      const executionTime = Date.now() - startTime;

      return reply.send({
        ...result,
        executionTime
      });

    } catch (error) {
      console.error('Retention policy execution error:', error);
      return reply.code(500).send({
        error: 'Failed to execute retention policies',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Optimize historical data storage
   */
  fastify.post('/historical/optimize', {
    schema: {
      description: 'Optimize historical data storage and indexing',
      tags: ['analytics', 'historical', 'optimization'],
      response: {
        200: {
          type: 'object',
          properties: {
            optimized: { type: 'boolean' },
            improvements: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can optimize storage
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for storage optimization'
        });
      }

      const result = await historicalService.optimizeHistoricalStorage();
      return reply.send(result);

    } catch (error) {
      console.error('Storage optimization error:', error);
      return reply.code(500).send({
        error: 'Failed to optimize historical storage',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get data export for historical analytics
   */
  fastify.post('/historical/export', {
    schema: {
      description: 'Export historical analytics data',
      tags: ['analytics', 'historical', 'export'],
      body: z.object({
        timeRange: TimeRangeQuerySchema,
        format: z.enum(['json', 'csv', 'parquet']).default('json'),
        filter: z.object({
          types: z.array(z.string()).optional(),
          categories: z.array(z.string()).optional()
        }).optional(),
        compression: z.boolean().default(false)
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            exportId: { type: 'string' },
            status: { type: 'string' },
            estimatedCompletion: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeRange, format, filter, compression } = request.body as any;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Check export permissions
      if (!authContext.permissions.includes('analytics:export_data')) {
        return reply.code(403).send({
          error: 'Export permission required'
        });
      }

      // Generate export ID
      const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In production, this would queue an async export job
      console.log(`Queuing export ${exportId} for time range ${timeRange.startDate} to ${timeRange.endDate}`);
      
      return reply.send({
        exportId,
        status: 'queued',
        estimatedCompletion: Date.now() + (5 * 60 * 1000) // 5 minutes
      });

    } catch (error) {
      console.error('Data export error:', error);
      return reply.code(500).send({
        error: 'Failed to queue data export',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Health check for historical analytics system
   */
  fastify.get('/historical/health', {
    schema: {
      description: 'Check health of historical analytics system',
      tags: ['analytics', 'historical', 'health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            components: { type: 'object' },
            lastOptimization: { type: 'number' },
            retentionStatus: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const metrics = await historicalService.getHistoricalAnalyticsMetrics();
      
      // Determine overall health status
      const status = metrics.queryPerformance.slowQueries < 10 && 
                    metrics.retentionExecution.errorsEncountered === 0 
                    ? 'healthy' : 'degraded';

      return reply.send({
        status,
        components: {
          queryEngine: metrics.queryPerformance.slowQueries < 10 ? 'healthy' : 'degraded',
          dataStorage: metrics.dataVolume.totalEvents > 0 ? 'healthy' : 'unknown',
          retentionSystem: metrics.retentionExecution.errorsEncountered === 0 ? 'healthy' : 'error'
        },
        lastOptimization: Date.now() - (24 * 60 * 60 * 1000), // Mock: 24 hours ago
        retentionStatus: {
          lastExecution: metrics.retentionExecution.lastRunTime,
          eventsProcessed: metrics.retentionExecution.eventsProcessed
        }
      });

    } catch (error) {
      console.error('Historical health check error:', error);
      return reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

export default historicalAnalyticsRoutes;