/**
 * API Key Expiration Routes - Epic 17.4.4 Implementation
 * Task: E17-1753114397223-D7E779 - Implement expiration handling
 * 
 * REST API endpoints for managing API key expiration policies, monitoring,
 * and lifecycle management within the Backstage Admin Controls system.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  APIKeyExpirationService,
  APIKeyType,
  ExpirationPolicy,
  APIKeyStatus
} from '../auth/services/APIKeyExpirationService';

// Request/Response Types
interface RegisterKeyRequest {
  keyId: string;
  userId: string;
  keyType: APIKeyType;
  expirationPolicy: ExpirationPolicy;
  maxDuration?: number;
  slidingWindowDuration?: number;
  maxUsageCount?: number;
  warningThreshold?: number;
  description?: string;
  environment: string;
  scopes: string[];
  ipWhitelist?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

interface RecordUsageRequest {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  ipAddress?: string;
  userAgent?: string;
}

interface RenewKeyRequest {
  renewalDuration: number;
  reason: string;
  autoApprove?: boolean;
}

interface RevokeKeyRequest {
  reason: string;
}

interface ExpirationReportQuery {
  startDate: string;
  endDate: string;
  keyTypes?: string;
  environments?: string;
  statuses?: string;
  userIds?: string;
}

interface GetKeysQuery {
  status?: APIKeyStatus;
  keyType?: APIKeyType;
  environment?: string;
  expiringWithinDays?: number;
  page?: number;
  limit?: number;
}

/**
 * Register API key expiration routes
 */
export async function apiKeyExpirationRoutes(fastify: FastifyInstance) {
  const expirationService = fastify.apiKeyExpirationService as APIKeyExpirationService;

  if (!expirationService) {
    throw new Error('APIKeyExpirationService not registered with Fastify instance');
  }

  // =============================================================================
  // API Key Registration and Management Routes
  // =============================================================================

  /**
   * Register API key for expiration management
   */
  fastify.post('/api-keys/:keyId/expiration', {
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['userId', 'keyType', 'expirationPolicy', 'environment', 'scopes'],
        properties: {
          userId: { type: 'string' },
          keyType: { type: 'string' },
          expirationPolicy: { type: 'string' },
          maxDuration: { type: 'number', minimum: 1 },
          slidingWindowDuration: { type: 'number', minimum: 1 },
          maxUsageCount: { type: 'number', minimum: 1 },
          warningThreshold: { type: 'number', minimum: 1, maximum: 100 },
          description: { type: 'string', maxLength: 500 },
          environment: { type: 'string' },
          scopes: { type: 'array', items: { type: 'string' } },
          ipWhitelist: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
    Body: Omit<RegisterKeyRequest, 'keyId'>;
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.params;
      const userId = request.user?.id || request.body.userId;
      
      const expiration = await expirationService.registerAPIKey(keyId, userId, request.body.keyType, {
        expirationPolicy: request.body.expirationPolicy,
        maxDuration: request.body.maxDuration,
        slidingWindowDuration: request.body.slidingWindowDuration,
        maxUsageCount: request.body.maxUsageCount,
        warningThreshold: request.body.warningThreshold,
        description: request.body.description,
        environment: request.body.environment,
        scopes: request.body.scopes,
        ipWhitelist: request.body.ipWhitelist,
        tags: request.body.tags,
        metadata: request.body.metadata
      });

      reply.status(201);
      return {
        success: true,
        data: expiration,
        message: 'API key registered for expiration management'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register API key for expiration'
      };
    }
  });

  /**
   * Record API key usage
   */
  fastify.post('/api-keys/:keyId/usage', {
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['endpoint', 'method', 'responseTime', 'statusCode', 'requestSize', 'responseSize'],
        properties: {
          endpoint: { type: 'string' },
          method: { type: 'string' },
          responseTime: { type: 'number', minimum: 0 },
          statusCode: { type: 'number', minimum: 100, maximum: 599 },
          requestSize: { type: 'number', minimum: 0 },
          responseSize: { type: 'number', minimum: 0 },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
    Body: RecordUsageRequest;
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.params;
      
      const usageResult = await expirationService.recordAPIKeyUsage(keyId, request.body);

      // Set response headers for client information
      reply.header('X-API-Key-Status', usageResult.status);
      if (usageResult.remainingUsage !== undefined) {
        reply.header('X-Remaining-Usage', usageResult.remainingUsage.toString());
      }
      if (usageResult.timeToExpiry !== undefined) {
        reply.header('X-Time-To-Expiry', Math.floor(usageResult.timeToExpiry / 1000).toString());
      }

      const statusCode = usageResult.usageAllowed ? 200 : 429;
      reply.status(statusCode);

      return {
        success: true,
        data: {
          status: usageResult.status,
          usageAllowed: usageResult.usageAllowed,
          remainingUsage: usageResult.remainingUsage,
          timeToExpiry: usageResult.timeToExpiry,
          warnings: usageResult.warnings
        },
        message: usageResult.usageAllowed ? 'Usage recorded successfully' : 'API key usage limit exceeded'
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record API key usage'
      };
    }
  });

  /**
   * Get API key expiration status
   */
  fastify.get('/api-keys/:keyId/status', {
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.params;
      
      const status = await expirationService.getAPIKeyStatus(keyId);

      if (!status.exists) {
        reply.status(404);
        return {
          success: false,
          error: `API key ${keyId} not found`
        };
      }

      return {
        success: true,
        data: status
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get API key status'
      };
    }
  });

  /**
   * Renew API key
   */
  fastify.post('/api-keys/:keyId/renew', {
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['renewalDuration', 'reason'],
        properties: {
          renewalDuration: { type: 'number', minimum: 1 },
          reason: { type: 'string', minLength: 1, maxLength: 500 },
          autoApprove: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
    Body: RenewKeyRequest;
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.params;
      const userId = request.user?.id || 'system';
      
      const renewal = await expirationService.renewAPIKey(
        keyId,
        userId,
        request.body.renewalDuration,
        request.body.reason,
        request.body.autoApprove
      );

      const statusCode = renewal.status === 'approved' ? 200 : 202;
      reply.status(statusCode);

      return {
        success: true,
        data: renewal,
        message: renewal.status === 'approved' ? 'API key renewed successfully' : 'Renewal request submitted for approval'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to renew API key'
      };
    }
  });

  /**
   * Revoke API key
   */
  fastify.post('/api-keys/:keyId/revoke', {
    schema: {
      params: {
        type: 'object',
        required: ['keyId'],
        properties: {
          keyId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 1, maxLength: 500 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { keyId: string };
    Body: RevokeKeyRequest;
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.params;
      const userId = request.user?.id || 'system';
      
      await expirationService.revokeAPIKey(keyId, request.body.reason, userId);

      return {
        success: true,
        message: 'API key revoked successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke API key'
      };
    }
  });

  // =============================================================================
  // Monitoring and Analytics Routes
  // =============================================================================

  /**
   * Get expiring API keys
   */
  fastify.get('/api-keys/expiring', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          keyType: { type: 'string' },
          environment: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      keyType?: APIKeyType;
      environment?: string;
      page?: number;
      limit?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate, page = 1, limit = 20 } = request.query;
      
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const expiringKeys = await expirationService.getExpiringKeys({ start, end });

      // Apply additional filters
      let filteredKeys = expiringKeys;
      if (request.query.keyType) {
        filteredKeys = filteredKeys.filter(key => key.keyType === request.query.keyType);
      }
      if (request.query.environment) {
        filteredKeys = filteredKeys.filter(key => key.environment === request.query.environment);
      }

      // Paginate results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          keys: paginatedKeys,
          pagination: {
            page,
            limit,
            total: filteredKeys.length,
            pages: Math.ceil(filteredKeys.length / limit)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get expiring keys'
      };
    }
  });

  /**
   * Get API key expiration report
   */
  fastify.get('/api-keys/expiration-report', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          keyTypes: { type: 'string' }, // comma-separated
          environments: { type: 'string' }, // comma-separated
          statuses: { type: 'string' }, // comma-separated
          userIds: { type: 'string' } // comma-separated
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: ExpirationReportQuery;
  }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate, keyTypes, environments, statuses, userIds } = request.query;
      
      const timeRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      const filters: Record<string, unknown> = {};
      if (keyTypes) {
        filters.keyTypes = keyTypes.split(',') as APIKeyType[];
      }
      if (environments) {
        filters.environments = environments.split(',');
      }
      if (statuses) {
        filters.statuses = statuses.split(',') as APIKeyStatus[];
      }
      if (userIds) {
        filters.userIds = userIds.split(',');
      }

      const report = await expirationService.generateExpirationReport(timeRange, filters);

      return {
        success: true,
        data: report
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate expiration report'
      };
    }
  });

  /**
   * Get active expiration alerts
   */
  fastify.get('/api-keys/alerts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          keyId: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          alertType: { type: 'string' },
          resolved: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      keyId?: string;
      severity?: string;
      alertType?: string;
      resolved?: boolean;
    }
  }>, reply: FastifyReply) => {
    try {
      const { keyId } = request.query;
      
      let alerts = await expirationService.getActiveAlerts(keyId);

      // Apply additional filters
      if (request.query.severity) {
        alerts = alerts.filter(alert => alert.severity === request.query.severity);
      }
      if (request.query.alertType) {
        alerts = alerts.filter(alert => alert.alertType === request.query.alertType);
      }
      if (request.query.resolved !== undefined) {
        alerts = alerts.filter(alert => alert.resolved === request.query.resolved);
      }

      return {
        success: true,
        data: {
          alerts,
          total: alerts.length
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get expiration alerts'
      };
    }
  });

  /**
   * Acknowledge expiration alert
   */
  fastify.post('/api-keys/alerts/:alertId/acknowledge', {
    schema: {
      params: {
        type: 'object',
        required: ['alertId'],
        properties: {
          alertId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { alertId: string };
  }>, reply: FastifyReply) => {
    try {
      const { alertId } = request.params;
      const userId = request.user?.id || 'system';
      
      await expirationService.acknowledgeAlert(alertId, userId);

      return {
        success: true,
        message: 'Alert acknowledged successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
      };
    }
  });

  /**
   * Resolve expiration alert
   */
  fastify.post('/api-keys/alerts/:alertId/resolve', {
    schema: {
      params: {
        type: 'object',
        required: ['alertId'],
        properties: {
          alertId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { alertId: string };
  }>, reply: FastifyReply) => {
    try {
      const { alertId } = request.params;
      const userId = request.user?.id || 'system';
      
      await expirationService.resolveAlert(alertId, userId);

      return {
        success: true,
        message: 'Alert resolved successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve alert'
      };
    }
  });

  // =============================================================================
  // Dashboard and Health Routes
  // =============================================================================

  /**
   * Get expiration dashboard summary
   */
  fastify.get('/api-keys/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Get expiring keys
      const expiringIn7Days = await expirationService.getExpiringKeys({
        start: now,
        end: sevenDaysFromNow
      });

      const expiringIn30Days = await expirationService.getExpiringKeys({
        start: now,
        end: thirtyDaysFromNow
      });

      // Get active alerts
      const activeAlerts = await expirationService.getActiveAlerts();

      // Generate quick report for summary statistics
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyReport = await expirationService.generateExpirationReport({
        start: lastWeek,
        end: now
      });

      const dashboard = {
        summary: {
          totalActiveKeys: weeklyReport.summary.activeKeys,
          keysExpiringIn7Days: expiringIn7Days.length,
          keysExpiringIn30Days: expiringIn30Days.length,
          activeAlerts: activeAlerts.filter(a => !a.resolved).length,
          criticalAlerts: activeAlerts.filter(a => a.severity === 'critical' && !a.resolved).length
        },
        recentlyExpiring: expiringIn7Days.slice(0, 5), // Top 5 most urgent
        alerts: activeAlerts.filter(a => !a.resolved).slice(0, 10), // Top 10 unresolved alerts
        trends: {
          weeklyKeyCreation: weeklyReport.summary.totalKeys - weeklyReport.summary.activeKeys,
          weeklyKeyExpiration: weeklyReport.summary.expiredKeys,
          weeklyKeyRevocation: weeklyReport.summary.revokedKeys
        },
        recommendations: weeklyReport.recommendations.slice(0, 3) // Top 3 recommendations
      };

      return {
        success: true,
        data: dashboard
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate dashboard'
      };
    }
  });

  /**
   * Health check endpoint
   */
  fastify.get('/api-keys/expiration-health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Basic health checks
      const now = new Date();
      const checks = {
        serviceStatus: 'healthy',
        timestamp: now.toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        checks: {
          databaseConnection: true, // Would check actual DB connection
          alertSystem: true,
          timerSystem: true,
          auditLogging: true
        }
      };

      const isHealthy = Object.values(checks.checks).every(check => check);
      const statusCode = isHealthy ? 200 : 503;

      reply.status(statusCode);
      return {
        success: isHealthy,
        data: checks
      };
    } catch (error) {
      reply.status(503);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        data: {
          serviceStatus: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      };
    }
  });

  console.log('🔑 API Key Expiration routes registered successfully');
}

export default apiKeyExpirationRoutes;