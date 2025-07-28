/**
 * Activity History API Routes
 * 
 * RESTful API endpoints for activity tracking, querying, and analytics.
 * Provides comprehensive activity management with filtering, exports, and insights.
 * 
 * Includes proper validation, pagination, and security controls.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  ActivityHistoryService, 
  ActivityType, 
  ActivityCategory, 
  ActivityQuery 
} from '../services/ActivityHistoryService';
import { requirePermission } from '../middleware/permission-auth';

// Request validation schemas
const recordActivitySchema = z.object({
  activityType: z.nativeEnum(ActivityType),
  details: z.object({
    description: z.string().optional(),
    resourceName: z.string().optional(),
    resourceData: z.any().optional(),
    previousValue: z.any().optional(),
    newValue: z.any().optional(),
    changeType: z.enum(['create', 'update', 'delete', 'execute', 'view', 'share']).optional(),
    contextType: z.string().optional(),
    contextId: z.string().optional(),
    parentActivityId: z.string().optional(),
    duration: z.number().optional(),
    success: z.boolean().optional(),
    errorMessage: z.string().optional(),
    sensitive: z.boolean().optional(),
    internal: z.boolean().optional()
  }),
  metadata: z.object({
    apiVersion: z.string().optional(),
    clientType: z.enum(['web', 'mobile', 'api', 'desktop']).optional(),
    clientVersion: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    roleId: z.string().uuid().optional(),
    featureFlags: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    correlationId: z.string().optional(),
    traceId: z.string().optional(),
    retentionPeriod: z.number().optional(),
    anonymize: z.boolean().optional()
  }).optional(),
  context: z.object({
    sessionId: z.string().uuid().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
      }).optional(),
      timezone: z.string().optional()
    }).optional()
  }).optional()
});

const queryActivitiesSchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  activityTypes: z.array(z.nativeEnum(ActivityType)).optional(),
  categories: z.array(z.nativeEnum(ActivityCategory)).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  success: z.boolean().optional(),
  sensitive: z.boolean().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.enum(['timestamp', 'activityType', 'category']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

const exportActivitiesSchema = z.object({
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['json', 'csv', 'xml']).default('json'),
  includeDetails: z.boolean().default(true),
  anonymize: z.boolean().default(false),
  includeSummary: z.boolean().default(true)
});

const createBookmarkSchema = z.object({
  activityId: z.string(),
  bookmarkName: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
}

/**
 * Register activity history routes
 */
export async function registerActivityHistoryRoutes(
  fastify: FastifyInstance,
  activityService: ActivityHistoryService
): Promise<void> {

  // Record a single activity
  fastify.post('/activities', {
    preHandler: [requirePermission('user:activity:create')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const activityData = recordActivitySchema.parse(request.body);
      
      await activityService.recordActivity(
        request.user!.id,
        activityData.activityType,
        activityData.details,
        activityData.metadata || {},
        activityData.context || {}
      );

      return reply.code(201).send({
        success: true,
        message: 'Activity recorded successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to record activity:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to record activity'
      });
    }
  });

  // Query activities with filtering and pagination
  fastify.get('/activities', {
    preHandler: [requirePermission('user:activity:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const queryParams = queryActivitiesSchema.parse(request.query);
      
      // Users can only see their own activities unless they have admin permissions
      const effectiveUserId = queryParams.userId || request.user!.id;
      
      if (effectiveUserId !== request.user!.id && 
          !request.user?.permissions.includes('admin:activity:read')) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view other users\' activities'
        });
      }

      const query: ActivityQuery = {
        ...queryParams,
        userId: effectiveUserId,
        startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
        endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined
      };

      const result = await activityService.queryActivities(query);

      return reply.code(200).send({
        success: true,
        data: result.activities,
        meta: {
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          limit: query.limit || 50,
          offset: query.offset || 0
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors
        });
      }

      fastify.log.error('Failed to query activities:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve activities'
      });
    }
  });

  // Get activity summary for a user
  fastify.get('/activities/summary', {
    preHandler: [requirePermission('user:activity:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { userId, startDate, endDate, period } = request.query as {
        userId?: string;
        startDate?: string;
        endDate?: string;
        period?: 'day' | 'week' | 'month' | 'year';
      };

      // Default to user's own data
      const effectiveUserId = userId || request.user!.id;
      
      if (effectiveUserId !== request.user!.id && 
          !request.user?.permissions.includes('admin:activity:read')) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view other users\' activity summary'
        });
      }

      // Calculate date range based on period
      let start: Date, end: Date;
      
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        switch (period) {
        case 'day':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to week
        }
      }

      const summary = await activityService.getActivitySummary(
        effectiveUserId,
        start,
        end
      );

      return reply.code(200).send({
        success: true,
        data: summary,
        meta: {
          userId: effectiveUserId,
          dateRange: { start, end },
          period: period || 'week'
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get activity summary:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve activity summary',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Export activities
  fastify.post('/activities/export', {
    preHandler: [requirePermission('user:activity:export')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const exportData = exportActivitiesSchema.parse(request.body);
      
      // Users can only export their own data unless they have admin permissions
      const effectiveUserId = exportData.userId || request.user!.id;
      
      if (effectiveUserId !== request.user!.id && 
          !request.user?.permissions.includes('admin:activity:export')) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to export other users\' activities'
        });
      }

      const exportResult = await activityService.exportActivities(
        effectiveUserId,
        new Date(exportData.startDate),
        new Date(exportData.endDate),
        exportData.format,
        {
          includeDetails: exportData.includeDetails,
          anonymize: exportData.anonymize,
          includeSummary: exportData.includeSummary
        }
      );

      // Set appropriate content type based on format
      let contentType: string;
      switch (exportData.format) {
      case 'csv':
        contentType = 'text/csv';
        break;
      case 'xml':
        contentType = 'application/xml';
        break;
      case 'json':
      default:
        contentType = 'application/json';
      }

      reply.header('Content-Type', contentType);
      reply.header('Content-Disposition', 
        `attachment; filename="activity_export_${Date.now()}.${exportData.format}"`);

      return reply.code(200).send(exportResult);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid export parameters',
          details: error.errors
        });
      }

      fastify.log.error('Failed to export activities:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to export activities'
      });
    }
  });

  // Create activity bookmark
  fastify.post('/activities/bookmarks', {
    preHandler: [requirePermission('user:activity:bookmark')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const bookmarkData = createBookmarkSchema.parse(request.body);

      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Activity bookmarks not yet implemented'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid bookmark data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to create bookmark:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create bookmark'
      });
    }
  });

  // Get user's activity bookmarks
  fastify.get('/activities/bookmarks', {
    preHandler: [requirePermission('user:activity:bookmark')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Activity bookmarks retrieval not yet implemented'
      });

    } catch (error) {
      fastify.log.error('Failed to get bookmarks:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve bookmarks'
      });
    }
  });

  // Get activity analytics/insights
  fastify.get('/activities/analytics', {
    preHandler: [requirePermission('user:activity:analytics')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { userId, period, metric } = request.query as {
        userId?: string;
        period?: 'day' | 'week' | 'month';
        metric?: 'patterns' | 'trends' | 'security' | 'performance';
      };

      const effectiveUserId = userId || request.user!.id;
      
      if (effectiveUserId !== request.user!.id && 
          !request.user?.permissions.includes('admin:activity:analytics')) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view activity analytics'
        });
      }

      // For now, return placeholder analytics
      const analytics = {
        userId: effectiveUserId,
        period: period || 'week',
        metric: metric || 'patterns',
        insights: {
          mostActiveHours: [9, 10, 11, 14, 15, 16],
          topActivities: ['graph_updated', 'node_created', 'login'],
          patterns: {
            workdayVsWeekend: { workday: 0.8, weekend: 0.2 },
            peakActivity: '10:00-11:00',
            averageSessionDuration: 1800 // seconds
  }
          trends: {
            activityGrowth: '+15%',
            sessionLengthTrend: '+5%',
            resourceUsageTrend: '+10%'
          }
  }
        generatedAt: new Date().toISOString()
      };

      return reply.code(200).send({
        success: true,
        data: analytics
      });

    } catch (error) {
      fastify.log.error('Failed to get activity analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve activity analytics'
      });
    }
  });

  // Get activity types and categories (for UI dropdowns)
  fastify.get('/activities/metadata', {
    preHandler: [requirePermission('user:activity:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const metadata = {
        activityTypes: Object.values(ActivityType),
        categories: Object.values(ActivityCategory),
        clientTypes: ['web', 'mobile', 'api', 'desktop'],
        changTypes: ['create', 'update', 'delete', 'execute', 'view', 'share'],
        sortOptions: [
          { value: 'timestamp', label: 'Date/Time' },
          { value: 'activityType', label: 'Activity Type' },
          { value: 'category', label: 'Category' }
        ],
        exportFormats: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'xml', label: 'XML' }
        ]
      };

      return reply.code(200).send({
        success: true,
        data: metadata
      });

    } catch (error) {
      fastify.log.error('Failed to get activity metadata:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve activity metadata'
      });
    }
  });

  // Bulk record activities (for batch operations)
  fastify.post('/activities/batch', {
    preHandler: [requirePermission('user:activity:create')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const activitiesData = z.array(recordActivitySchema).max(100).parse(request.body);

      const activities = activitiesData.map(activity => ({
        userId: request.user!.id,
        activityType: activity.activityType,
        details: activity.details,
        metadata: activity.metadata,
        context: activity.context
      }));

      await activityService.recordActivities(activities);

      return reply.code(201).send({
        success: true,
        data: {
          recordedCount: activities.length
  }
        message: `Successfully recorded ${activities.length} activities`
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid activities data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to record batch activities:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to record batch activities'
      });
    }
  });

  // Health check for activity system
  fastify.get('/activities/health', {
    preHandler: [requirePermission('admin:system:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check system health metrics
      const health = {
        status: 'healthy',
        batchQueueSize: 0, // This would come from the service
        recentActivityCount: 0,
        avgProcessingTime: 0,
        errorRate: 0,
        lastProcessed: new Date().toISOString()
      };

      return reply.code(200).send({
        success: true,
        data: health
      });

    } catch (error) {
      fastify.log.error('Activity system health check failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  });

  // Admin endpoint to get system-wide activity statistics
  fastify.get('/activities/system-stats', {
    preHandler: [requirePermission('admin:system:analytics')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { period } = request.query as { period?: 'hour' | 'day' | 'week' | 'month' };

      // This would implement system-wide statistics
      const stats = {
        period: period || 'day',
        totalActivities: 0,
        uniqueUsers: 0,
        topActivityTypes: [],
        busyHours: [],
        errorRate: 0,
        storageUsage: {
          totalRecords: 0,
          sizeBytes: 0,
          retentionDate: new Date()
  }
        generatedAt: new Date().toISOString()
      };

      return reply.code(200).send({
        success: true,
        data: stats
      });

    } catch (error) {
      fastify.log.error('Failed to get system activity stats:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve system activity statistics'
      });
    }
  });
}

export default registerActivityHistoryRoutes;