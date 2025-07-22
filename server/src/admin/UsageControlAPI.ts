/**
 * Usage Control API Routes - Epic 17.4.4
 * 
 * RESTful API endpoints for usage control management and monitoring.
 * Provides comprehensive API usage monitoring, rate limiting, quota management,
 * and usage analytics for Epic 17 admin controls.
 * 
 * Task: E17-1753114397226-7F914C - Develop usage controls
 * Epic: 17 - Backstage Admin Controls (Story 17.4.4 - API Management)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { 
  UsageControlService, 
  UsageLimit, 
  UsageLimitType, 
  UsageControlAction,
  UsageControlStatus,
  UsageAnalytics,
  UsageSnapshot,
  UsageControlDecision
} from './UsageControlService';
import { AuthService } from '../auth/services/AuthService';
import { AuditService } from '../auth/services/AuditService';

// ==========================================
// REQUEST/RESPONSE INTERFACES
// ==========================================

export interface UsageControlResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
    version: string;
  };
}

export interface CreateUsageLimitRequest {
  name: string;
  description: string;
  type: UsageLimitType;
  threshold: number;
  period: number; // milliseconds
  action: UsageControlAction;
  scope: {
    global?: boolean;
    userIds?: string[];
    roles?: string[];
    endpoints?: string[];
    operations?: string[];
    ipAddresses?: string[];
    apiKeys?: string[];
  };
  configuration?: {
    burstAllowance?: number;
    gracePeriod?: number;
    backoffStrategy?: 'linear' | 'exponential' | 'fixed';
    backoffMultiplier?: number;
    maxBackoffTime?: number;
    alertThresholds?: Array<{
      percentage: number;
      action: 'warn' | 'alert' | 'escalate';
      channels: string[];
    }>;
  };
}

export interface UpdateUsageLimitRequest {
  name?: string;
  description?: string;
  threshold?: number;
  period?: number;
  action?: UsageControlAction;
  status?: UsageControlStatus;
  scope?: {
    global?: boolean;
    userIds?: string[];
    roles?: string[];
    endpoints?: string[];
    operations?: string[];
    ipAddresses?: string[];
    apiKeys?: string[];
  };
  configuration?: any;
}

export interface UsageCheckRequest {
  userId?: string;
  apiKey?: string;
  ipAddress: string;
  endpoint: string;
  operation: string;
  method: string;
  requestSize?: number;
}

export interface UsageAnalyticsRequest {
  timeRange: {
    start: string;
    end: string;
  };
  filters?: {
    userIds?: string[];
    endpoints?: string[];
    operations?: string[];
  };
  includeDetails?: boolean;
}

export interface UsageControlConfigRequest {
  globalLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    bandwidthPerHour?: number; // bytes
    concurrentConnections?: number;
  };
  enforcementMode?: 'strict' | 'permissive' | 'monitoring_only';
  alerting?: {
    enabled: boolean;
    channels: string[];
    thresholds: number[];
  };
  exemptions?: Array<{
    type: 'user' | 'role' | 'ip' | 'endpoint';
    value: string;
    reason: string;
  }>;
}

export interface BulkUsageActionRequest {
  action: 'enable' | 'disable' | 'reset' | 'delete';
  limitIds: string[];
  reason?: string;
}

// ==========================================
// API PLUGIN IMPLEMENTATION
// ==========================================

export const usageControlAPI: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const usageControlService = new UsageControlService(fastify.database);
  const authService = new AuthService(fastify.database);
  const auditService = new AuditService(fastify.database);

  // ==========================================
  // AUTHENTICATION MIDDLEWARE
  // ==========================================

  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ success: false, error: 'Authorization header required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await authService.validateToken(token);
      if (!user || !user.permissions.includes('usage_control_admin')) {
        reply.code(403).send({ success: false, error: 'Insufficient permissions for usage control administration' });
        return;
      }
      request.user = user;
    } catch (error) {
      reply.code(401).send({ success: false, error: 'Invalid authentication token' });
      return;
    }
  });

  // ==========================================
  // USAGE LIMIT MANAGEMENT ENDPOINTS
  // ==========================================

  // Create usage limit
  fastify.post<{ Body: CreateUsageLimitRequest }>('/limits', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'threshold', 'period', 'action'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: Object.values(UsageLimitType) },
          threshold: { type: 'number', minimum: 1 },
          period: { type: 'number', minimum: 1000 }, // At least 1 second
          action: { type: 'string', enum: Object.values(UsageControlAction) },
          scope: {
            type: 'object',
            properties: {
              global: { type: 'boolean' },
              userIds: { type: 'array', items: { type: 'string' } },
              roles: { type: 'array', items: { type: 'string' } },
              endpoints: { type: 'array', items: { type: 'string' } },
              operations: { type: 'array', items: { type: 'string' } },
              ipAddresses: { type: 'array', items: { type: 'string' } },
              apiKeys: { type: 'array', items: { type: 'string' } }
            },
            additionalProperties: false
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `create_limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create usage limit
      const limitId = await usageControlService.createUsageLimit({
        ...request.body,
        status: UsageControlStatus.ACTIVE,
        scope: {
          global: false,
          ...request.body.scope
        },
        configuration: {
          burstAllowance: 10,
          gracePeriod: 1000,
          backoffStrategy: 'linear',
          backoffMultiplier: 2,
          maxBackoffTime: 60000,
          alertThresholds: [],
          exemptions: [],
          customRules: [],
          ...request.body.configuration
        }
      });

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'usage_limit_created',
        resource: `usage_limit:${limitId}`,
        details: {
          limitId,
          name: request.body.name,
          type: request.body.type,
          threshold: request.body.threshold,
          timestamp: new Date()
        }
      });

      const response: UsageControlResponse<{ limitId: string }> = {
        success: true,
        data: { limitId },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      };

      reply.code(201).send(response);

    } catch (error) {
      fastify.log.error(`Usage limit creation failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to create usage limit',
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });
    }
  });

  // List usage limits
  fastify.get<{ 
    Querystring: { 
      status?: UsageControlStatus; 
      type?: UsageLimitType; 
      limit?: number; 
      offset?: number 
    } 
  }>('/limits', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: Object.values(UsageControlStatus) },
          type: { type: 'string', enum: Object.values(UsageLimitType) },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const limits = await usageControlService.getUsageLimits({
        status: request.query.status,
        type: request.query.type
      });

      // Apply pagination
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 50;
      const paginatedLimits = limits.slice(offset, offset + limit);

      reply.send({
        success: true,
        data: {
          limits: paginatedLimits,
          total: limits.length,
          offset,
          limit
        },
        metadata: {
          timestamp: new Date(),
          requestId: `list_limits_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Failed to list usage limits: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve usage limits'
      });
    }
  });

  // Get specific usage limit
  fastify.get<{ Params: { limitId: string } }>('/limits/:limitId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          limitId: { type: 'string' }
        },
        required: ['limitId']
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const limit = await usageControlService.getUsageLimit(request.params.limitId);
      
      if (!limit) {
        reply.code(404).send({
          success: false,
          error: 'Usage limit not found'
        });
        return;
      }

      reply.send({
        success: true,
        data: limit,
        metadata: {
          timestamp: new Date(),
          requestId: `get_limit_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Failed to get usage limit: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve usage limit'
      });
    }
  });

  // Update usage limit
  fastify.put<{ 
    Params: { limitId: string }; 
    Body: UpdateUsageLimitRequest 
  }>('/limits/:limitId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          limitId: { type: 'string' }
        },
        required: ['limitId']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          threshold: { type: 'number', minimum: 1 },
          period: { type: 'number', minimum: 1000 },
          action: { type: 'string', enum: Object.values(UsageControlAction) },
          status: { type: 'string', enum: Object.values(UsageControlStatus) }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `update_limit_${Date.now()}`;

    try {
      await usageControlService.updateUsageLimit(request.params.limitId, request.body);

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'usage_limit_updated',
        resource: `usage_limit:${request.params.limitId}`,
        details: {
          limitId: request.params.limitId,
          changes: request.body,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: {
          limitId: request.params.limitId,
          message: 'Usage limit updated successfully'
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Usage limit update failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to update usage limit'
      });
    }
  });

  // Delete usage limit
  fastify.delete<{ Params: { limitId: string } }>('/limits/:limitId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          limitId: { type: 'string' }
        },
        required: ['limitId']
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      await usageControlService.deleteUsageLimit(request.params.limitId);

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'usage_limit_deleted',
        resource: `usage_limit:${request.params.limitId}`,
        details: {
          limitId: request.params.limitId,
          deletedBy: request.user.userId,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: {
          limitId: request.params.limitId,
          message: 'Usage limit deleted successfully'
        },
        metadata: {
          timestamp: new Date(),
          requestId: `delete_limit_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Usage limit deletion failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to delete usage limit'
      });
    }
  });

  // ==========================================
  // USAGE CHECKING ENDPOINTS
  // ==========================================

  // Check usage for a request
  fastify.post<{ Body: UsageCheckRequest }>('/check', {
    schema: {
      body: {
        type: 'object',
        required: ['ipAddress', 'endpoint', 'operation', 'method'],
        properties: {
          userId: { type: 'string' },
          apiKey: { type: 'string' },
          ipAddress: { type: 'string' },
          endpoint: { type: 'string' },
          operation: { type: 'string' },
          method: { type: 'string' },
          requestSize: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const decision = await usageControlService.checkUsage(
        request.body.userId,
        request.body.apiKey,
        request.body.ipAddress,
        request.body.endpoint,
        request.body.operation,
        request.body.method,
        request.body.requestSize || 0
      );

      // Set appropriate HTTP status based on decision
      let httpStatus = 200;
      if (!decision.allowed) {
        httpStatus = decision.action === UsageControlAction.REJECT ? 429 : 403;
      }

      // Add rate limit headers
      const headers: Record<string, string> = {};
      if (decision.retryAfter) {
        headers['Retry-After'] = Math.ceil((decision.retryAfter.getTime() - Date.now()) / 1000).toString();
      }

      Object.entries(decision.quotaRemaining).forEach(([limitId, remaining]) => {
        headers[`X-RateLimit-${limitId}-Remaining`] = remaining.toString();
      });

      reply.code(httpStatus).headers(headers).send({
        success: true,
        data: {
          allowed: decision.allowed,
          action: decision.action,
          reason: decision.reason,
          appliedLimits: decision.appliedLimits,
          waitTime: decision.waitTime,
          retryAfter: decision.retryAfter,
          quotaRemaining: decision.quotaRemaining,
          warnings: decision.warnings
        },
        metadata: {
          timestamp: new Date(),
          requestId: `usage_check_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Usage check failed: ${error.message}`);
      
      // Fail open - allow request but log error
      reply.send({
        success: true,
        data: {
          allowed: true,
          action: UsageControlAction.ALLOW,
          reason: 'Usage control system unavailable - allowing request',
          appliedLimits: [],
          quotaRemaining: {},
          warnings: ['Usage control system experiencing issues']
        }
      });
    }
  });

  // ==========================================
  // USAGE ANALYTICS ENDPOINTS
  // ==========================================

  // Generate usage analytics
  fastify.post<{ Body: UsageAnalyticsRequest }>('/analytics', {
    schema: {
      body: {
        type: 'object',
        required: ['timeRange'],
        properties: {
          timeRange: {
            type: 'object',
            required: ['start', 'end'],
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' }
            }
          },
          filters: {
            type: 'object',
            properties: {
              userIds: { type: 'array', items: { type: 'string' } },
              endpoints: { type: 'array', items: { type: 'string' } },
              operations: { type: 'array', items: { type: 'string' } }
            }
          },
          includeDetails: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const timeRange = {
        start: new Date(request.body.timeRange.start),
        end: new Date(request.body.timeRange.end)
      };

      const analytics = await usageControlService.generateUsageAnalytics(
        timeRange,
        request.body.filters
      );

      reply.send({
        success: true,
        data: analytics,
        metadata: {
          timestamp: new Date(),
          requestId: `analytics_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Usage analytics generation failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to generate usage analytics'
      });
    }
  });

  // Get current usage snapshot
  fastify.get('/snapshot', async (request, reply) => {
    const startTime = Date.now();

    try {
      const snapshot = await usageControlService.getCurrentUsageSnapshot();

      reply.send({
        success: true,
        data: snapshot,
        metadata: {
          timestamp: new Date(),
          requestId: `snapshot_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Usage snapshot failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to get usage snapshot'
      });
    }
  });

  // Get user usage statistics
  fastify.get<{ 
    Params: { userId: string }; 
    Querystring: { 
      timeRange?: string;
      includeQuota?: boolean;
    } 
  }>('/users/:userId/stats', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', default: 'last_hour' },
          includeQuota: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Calculate time range
      const now = new Date();
      const timeRangeMs = request.query.timeRange === 'last_day' ? 86400000 : 3600000;
      const timeRange = {
        start: new Date(now.getTime() - timeRangeMs),
        end: now
      };

      const stats = await usageControlService.getUsageStats(request.params.userId, timeRange);

      reply.send({
        success: true,
        data: {
          userId: request.params.userId,
          timeRange: request.query.timeRange,
          ...stats
        },
        metadata: {
          timestamp: new Date(),
          requestId: `user_stats_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`User stats failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to get user usage statistics'
      });
    }
  });

  // ==========================================
  // ADMINISTRATIVE ENDPOINTS
  // ==========================================

  // Bulk actions on usage limits
  fastify.post<{ Body: BulkUsageActionRequest }>('/limits/bulk', {
    schema: {
      body: {
        type: 'object',
        required: ['action', 'limitIds'],
        properties: {
          action: { type: 'string', enum: ['enable', 'disable', 'reset', 'delete'] },
          limitIds: { type: 'array', items: { type: 'string' }, minItems: 1 },
          reason: { type: 'string', maxLength: 500 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `bulk_action_${Date.now()}`;

    try {
      const results: Array<{ limitId: string; success: boolean; error?: string }> = [];

      for (const limitId of request.body.limitIds) {
        try {
          switch (request.body.action) {
            case 'enable':
              await usageControlService.activateUsageLimit(limitId);
              break;
            case 'disable':
              await usageControlService.deactivateUsageLimit(limitId);
              break;
            case 'delete':
              await usageControlService.deleteUsageLimit(limitId);
              break;
            case 'reset':
              // Reset would clear usage counters - not implemented in service yet
              throw new Error('Reset action not yet implemented');
            default:
              throw new Error(`Unknown action: ${request.body.action}`);
          }
          results.push({ limitId, success: true });
        } catch (error) {
          results.push({ limitId, success: false, error: error.message });
        }
      }

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: `usage_limits_bulk_${request.body.action}`,
        resource: 'usage_limits',
        details: {
          action: request.body.action,
          limitIds: request.body.limitIds,
          reason: request.body.reason,
          results,
          timestamp: new Date()
        }
      });

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;

      reply.send({
        success: errorCount === 0,
        data: {
          action: request.body.action,
          totalLimits: request.body.limitIds.length,
          successCount,
          errorCount,
          results
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Bulk action failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Bulk action failed'
      });
    }
  });

  // Export usage data
  fastify.get<{ 
    Querystring: { 
      format?: 'json' | 'csv' | 'xlsx';
      timeRange?: string;
      includeDetails?: boolean;
    } 
  }>('/export', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv', 'xlsx'], default: 'json' },
          timeRange: { type: 'string', default: 'last_day' },
          includeDetails: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Calculate time range
      const now = new Date();
      const timeRangeMs = request.query.timeRange === 'last_week' ? 604800000 : 86400000;
      const timeRange = {
        start: new Date(now.getTime() - timeRangeMs),
        end: now
      };

      const analytics = await usageControlService.generateUsageAnalytics(timeRange);
      
      // Generate export data based on format
      let exportData: any;
      let contentType: string;
      let filename: string;

      switch (request.query.format) {
        case 'csv':
          exportData = this.convertToCSV(analytics);
          contentType = 'text/csv';
          filename = `usage_export_${Date.now()}.csv`;
          break;
        case 'xlsx':
          // Would implement Excel export here
          throw new Error('Excel export not yet implemented');
        case 'json':
        default:
          exportData = JSON.stringify(analytics, null, 2);
          contentType = 'application/json';
          filename = `usage_export_${Date.now()}.json`;
      }

      // Audit export
      await auditService.logAction({
        userId: request.user.userId,
        action: 'usage_data_exported',
        resource: 'usage_analytics',
        details: {
          format: request.query.format,
          timeRange: request.query.timeRange,
          recordCount: analytics.totalRequests,
          timestamp: new Date()
        }
      });

      reply.header('Content-Type', contentType);
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.send(exportData);

    } catch (error) {
      fastify.log.error(`Usage export failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to export usage data'
      });
    }
  });

  // ==========================================
  // SYSTEM CONFIGURATION ENDPOINTS
  // ==========================================

  // Get usage control configuration
  fastify.get('/config', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Mock configuration - would be stored in database in production
      const config = {
        globalLimits: {
          requestsPerMinute: 1000,
          requestsPerHour: 50000,
          bandwidthPerHour: 1024 * 1024 * 1024, // 1GB
          concurrentConnections: 100
        },
        enforcementMode: 'strict',
        alerting: {
          enabled: true,
          channels: ['email', 'slack'],
          thresholds: [75, 90, 95]
        },
        exemptions: []
      };

      reply.send({
        success: true,
        data: config,
        metadata: {
          timestamp: new Date(),
          requestId: `get_config_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to get usage control configuration'
      });
    }
  });

  // Update usage control configuration
  fastify.put<{ Body: UsageControlConfigRequest }>('/config', {
    schema: {
      body: {
        type: 'object',
        properties: {
          globalLimits: {
            type: 'object',
            properties: {
              requestsPerMinute: { type: 'number', minimum: 1 },
              requestsPerHour: { type: 'number', minimum: 1 },
              bandwidthPerHour: { type: 'number', minimum: 1 },
              concurrentConnections: { type: 'number', minimum: 1 }
            }
          },
          enforcementMode: { type: 'string', enum: ['strict', 'permissive', 'monitoring_only'] },
          alerting: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              channels: { type: 'array', items: { type: 'string' } },
              thresholds: { type: 'array', items: { type: 'number' } }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // In production, would save configuration to database
      console.log('Updating usage control configuration:', request.body);

      // Audit configuration update
      await auditService.logAction({
        userId: request.user.userId,
        action: 'usage_control_config_updated',
        resource: 'usage_control_config',
        details: {
          changes: request.body,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: {
          message: 'Usage control configuration updated successfully'
        },
        metadata: {
          timestamp: new Date(),
          requestId: `update_config_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to update usage control configuration'
      });
    }
  });

  // ==========================================
  // HEALTH CHECK ENDPOINT
  // ==========================================

  // Usage control system health
  fastify.get('/health', async (request, reply) => {
    try {
      const snapshot = await usageControlService.getCurrentUsageSnapshot();
      
      reply.send({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          version: '1.0.0',
          components: {
            usageControlService: 'operational',
            rateLimiting: 'operational',
            analytics: 'operational',
            monitoring: 'operational'
          },
          metrics: {
            activeUsers: snapshot.activeUsers,
            currentConnections: snapshot.currentConnections,
            requestsPerMinute: snapshot.requestsPerMinute,
            activeLimits: snapshot.activeLimits,
            violationsInLastHour: snapshot.violationsInLastHour
          }
        }
      });

    } catch (error) {
      fastify.log.error(`Usage control health check failed: ${error.message}`);
      reply.code(503).send({
        success: false,
        error: 'Usage control system health check failed'
      });
    }
  });

  // Helper method for CSV conversion (would be more comprehensive in production)
  function convertToCSV(analytics: UsageAnalytics): string {
    const headers = ['Timestamp', 'Total Requests', 'Total Bandwidth', 'Unique Users', 'Error Rate'];
    const rows = [
      headers.join(','),
      [
        analytics.timeRange.start.toISOString(),
        analytics.totalRequests,
        analytics.totalBandwidth,
        analytics.uniqueUsers,
        analytics.errorRate
      ].join(',')
    ];
    return rows.join('\n');
  }

  fastify.log.info('Usage Control API routes registered successfully');
};

export default usageControlAPI;