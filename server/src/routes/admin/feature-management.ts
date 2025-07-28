// Epic 17 Story 17.1 - Administrative Feature Management API Routes
// Comprehensive API endpoints for feature toggle administration with dashboard controls

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { FeatureManagementService } from '../../../admin/feature-management.service';
import { FeatureToggleService } from '../../services/feature-toggle-service';
import { EnhancedToggleEvaluationService } from '../../services/EnhancedToggleEvaluationService';
import {
  CreateFeatureRequest,
  UpdateFeatureRequest,
  FeatureToggleAdmin,
  FeatureDashboardStats
} from '../../../admin/feature-management.service';

// Request schemas for validation
const createFeatureSchema = {
  type: 'object',
  required: ['key', 'name', 'type', 'value'],
  properties: {
    key: { 
      type: 'string', 
      pattern: '^[a-z0-9_.-]+$',
      minLength: 3,
      maxLength: 100
  }
    name: { 
      type: 'string', 
      minLength: 1, 
      maxLength: 255 
  }
    description: { 
      type: 'string', 
      maxLength: 1000 
  }
    type: { 
      type: 'string', 
      enum: ['boolean', 'string', 'number', 'json', 'percentage', 'experiment'] 
  }
    value: {},
    enabled: { 
      type: 'boolean',
      default: false
  }
    user_targeting: {
      type: 'object',
      properties: {
        segments: { type: 'array', items: { type: 'string' } },
        user_ids: { type: 'array', items: { type: 'string' } },
        percentage: { type: 'number', minimum: 0, maximum: 100 },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            required: ['field', 'operator', 'value'],
            properties: {
              field: { type: 'string' },
              operator: { 
                type: 'string', 
                enum: ['equals', 'not_equals', 'in', 'not_in', 'contains', 'regex', 'greater_than', 'less_than']
  }
              value: {},
              condition: { type: 'string', enum: ['and', 'or'] }
            }
          }
        }
      }
  }
    scheduling: {
      type: 'object',
      properties: {
        enable_at: { type: 'string', format: 'date-time' },
        disable_at: { type: 'string', format: 'date-time' },
        rollout_strategy: { type: 'string', enum: ['immediate', 'gradual', 'scheduled'] },
        rollout_percentage: { type: 'number', minimum: 0, maximum: 100 },
        rollout_duration_hours: { type: 'number', minimum: 1, maximum: 168 }
      }
  }
    dependencies: {
      type: 'object',
      properties: {
        requires: { type: 'array', items: { type: 'string' } },
        conflicts_with: { type: 'array', items: { type: 'string' } }
      }
  }
    monitoring: {
      type: 'object',
      properties: {
        track_usage: { type: 'boolean', default: true },
        alert_on_change: { type: 'boolean', default: false },
        health_check_enabled: { type: 'boolean', default: true },
        rollback_conditions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['metric', 'threshold', 'operator', 'window_minutes', 'action'],
            properties: {
              metric: { type: 'string' },
              threshold: { type: 'number' },
              operator: { type: 'string', enum: ['greater_than', 'less_than', 'equals'] },
              window_minutes: { type: 'number', minimum: 1, maximum: 1440 },
              action: { type: 'string', enum: ['disable', 'rollback', 'alert'] }
            }
          }
        }
      }
    }
  }
};

const updateFeatureSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 },
    value: {},
    enabled: { type: 'boolean' },
    user_targeting: createFeatureSchema.properties.user_targeting,
    scheduling: createFeatureSchema.properties.scheduling,
    dependencies: createFeatureSchema.properties.dependencies,
    monitoring: createFeatureSchema.properties.monitoring,
    reason: { type: 'string', maxLength: 500 }
  }
};

const emergencyOverrideSchema = {
  type: 'object',
  required: ['reason'],
  properties: {
    reason: { 
      type: 'string', 
      minLength: 10, 
      maxLength: 1000 
    }
  }
};

export async function adminFeatureManagementRoutes(fastify: FastifyInstance) {
  const db: Pool = fastify.pg;
  const featureToggleService = new FeatureToggleService(fastify.pg);
  const enhancedEvaluationService = new EnhancedToggleEvaluationService(
    featureToggleService,
    {} as any // FeatureToggleDependencyService would be injected here
  );
  const featureManagementService = new FeatureManagementService(
    db,
    featureToggleService,
    enhancedEvaluationService
  );

  // Middleware for admin authentication and permissions
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.permissions?.includes('feature.admin')) {
      return reply.code(403).send({ 
        error: 'Administrative permissions required for feature management' 
      });
    }
  };

  // Dashboard - Get feature management dashboard statistics
  fastify.get('/admin/features/dashboard', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Get comprehensive feature management dashboard statistics',
      tags: ['admin', 'features'],
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await featureManagementService.getDashboardStats();
      return reply.send({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      request.log.error('Error fetching dashboard stats:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch dashboard statistics',
        details: error.message 
      });
    }
  });

  // List all administrative features with filtering
  fastify.get('/admin/features', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'List all administrative feature toggles with advanced filtering',
      tags: ['admin', 'features'],
      querystring: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          type: { type: 'string', enum: ['boolean', 'string', 'number', 'json', 'percentage', 'experiment'] },
          has_targeting: { type: 'boolean' },
          has_scheduling: { type: 'boolean' },
          search: { type: 'string', minLength: 1, maxLength: 100 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
  }
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = request.query as any;
      const features = await featureManagementService.getAllFeatures(filters);
      
      return reply.send({
        success: true,
        data: features,
        pagination: {
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          total: features.length
        }
      });
    } catch (error) {
      request.log.error('Error listing features:', error);
      return reply.code(500).send({ 
        error: 'Failed to list features',
        details: error.message 
      });
    }
  });

  // Create new administrative feature
  fastify.post('/admin/features', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Create new administrative feature toggle',
      tags: ['admin', 'features'],
      body: createFeatureSchema,
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const featureData = request.body as CreateFeatureRequest;
      const user = (request as any).user;
      
      const feature = await featureManagementService.createFeature(user.id, featureData);
      
      return reply.code(201).send({
        success: true,
        data: feature,
        message: `Feature '${feature.key}' created successfully`
      });
    } catch (error) {
      request.log.error('Error creating feature:', error);
      
      if (error.message.includes('already exists')) {
        return reply.code(409).send({ 
          error: 'Feature key already exists',
          details: error.message 
        });
      }
      
      if (error.message.includes('Required features not found')) {
        return reply.code(400).send({ 
          error: 'Invalid dependencies',
          details: error.message 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Failed to create feature',
        details: error.message 
      });
    }
  });

  // Get specific feature by ID with full details
  fastify.get('/admin/features/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Get detailed information about a specific feature',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const feature = await featureManagementService.getFeatureById(id);
      
      if (!feature) {
        return reply.code(404).send({ 
          error: 'Feature not found',
          feature_id: id 
        });
      }
      
      // Get additional audit information
      const auditLog = await featureManagementService.getFeatureAuditLog(id, 20);
      
      return reply.send({
        success: true,
        data: {
          ...feature,
          recent_audit: auditLog
        }
      });
    } catch (error) {
      request.log.error('Error fetching feature:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch feature',
        details: error.message 
      });
    }
  });

  // Update administrative feature
  fastify.put('/admin/features/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Update administrative feature toggle configuration',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      body: updateFeatureSchema,
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as UpdateFeatureRequest;
      const user = (request as any).user;
      
      const feature = await featureManagementService.updateFeature(id, user.id, updates);
      
      return reply.send({
        success: true,
        data: feature,
        message: `Feature '${feature.key}' updated successfully`
      });
    } catch (error) {
      request.log.error('Error updating feature:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Feature not found',
          feature_id: id 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Failed to update feature',
        details: error.message 
      });
    }
  });

  // Toggle feature enabled/disabled state
  fastify.post('/admin/features/:id/toggle', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Toggle feature enabled/disabled state',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      body: {
        type: 'object',
        required: ['enabled'],
        properties: {
          enabled: { type: 'boolean' },
          reason: { type: 'string', maxLength: 500 }
        }
  }
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { enabled, reason } = request.body as { enabled: boolean; reason?: string };
      const user = (request as any).user;
      
      await featureManagementService.toggleFeature(id, user.id, enabled, reason);
      
      return reply.send({
        success: true,
        message: `Feature ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: { feature_id: id, enabled, reason }
      });
    } catch (error) {
      request.log.error('Error toggling feature:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Feature not found',
          feature_id: id 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Failed to toggle feature',
        details: error.message 
      });
    }
  });

  // Emergency disable feature
  fastify.post('/admin/features/:id/emergency-disable', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Emergency disable feature with high-priority logging',
      tags: ['admin', 'features', 'emergency'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      body: emergencyOverrideSchema,
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason: string };
      const user = (request as any).user;
      
      await featureManagementService.emergencyDisableFeature(id, user.id, reason);
      
      // Log emergency action
      request.log.warn('Emergency feature disable executed', {
        feature_id: id,
        admin_user_id: user.id,
        reason,
        timestamp: new Date().toISOString()
      });
      
      return reply.send({
        success: true,
        message: 'Feature emergency disabled successfully',
        data: { 
          feature_id: id, 
          disabled_at: new Date().toISOString(),
          reason 
        }
      });
    } catch (error) {
      request.log.error('Error emergency disabling feature:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Feature not found',
          feature_id: id 
        });
      }
      
      return reply.code(500).send({ 
        error: 'Failed to emergency disable feature',
        details: error.message 
      });
    }
  });

  // Delete/archive feature
  fastify.delete('/admin/features/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Delete administrative feature toggle',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 500 }
        }
  }
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = (request.body as { reason?: string }) || {};
      const user = (request as any).user;
      
      await featureManagementService.deleteFeature(id, user.id, reason);
      
      return reply.code(204).send();
    } catch (error) {
      request.log.error('Error deleting feature:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Feature not found',
          feature_id: id 
        });
      }
      
      if (error.message.includes('required by')) {
        return reply.code(409).send({ 
          error: 'Cannot delete feature due to dependencies',
          details: error.message 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Failed to delete feature',
        details: error.message 
      });
    }
  });

  // Get audit log for specific feature
  fastify.get('/admin/features/:id/audit', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Get comprehensive audit log for feature',
      tags: ['admin', 'features', 'audit'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
  }
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 500, default: 100 }
        }
  }
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit = 100 } = request.query as { limit?: number };
      
      const auditLog = await featureManagementService.getFeatureAuditLog(id, limit);
      
      return reply.send({
        success: true,
        data: auditLog,
        pagination: {
          limit,
          total: auditLog.length
        }
      });
    } catch (error) {
      request.log.error('Error fetching audit log:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch audit log',
        details: error.message 
      });
    }
  });

  // Health check endpoint for administrative features
  fastify.get('/admin/features/health', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      description: 'Get health status of all administrative features',
      tags: ['admin', 'features', 'health'],
      security: [{ bearer: [] }]
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get all features with health status
      const features = await featureManagementService.getAllFeatures();
      
      const healthSummary = {
        total_features: features.length,
        healthy: features.filter(f => f.health_status?.status === 'healthy').length,
        warning: features.filter(f => f.health_status?.status === 'warning').length,
        critical: features.filter(f => f.health_status?.status === 'critical').length,
        disabled: features.filter(f => f.health_status?.status === 'disabled').length,
        features_with_issues: features.filter(f => 
          f.health_status?.issues && f.health_status.issues.length > 0
        ),
        overall_status: features.some(f => f.health_status?.status === 'critical') ? 'critical' :
                       features.some(f => f.health_status?.status === 'warning') ? 'warning' : 'healthy'
      };
      
      return reply.send({
        success: true,
        data: healthSummary,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      request.log.error('Error fetching health status:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch health status',
        details: error.message 
      });
    }
  });

  // System health check
  fastify.get('/admin/features/system/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthCheck = {
        status: 'healthy',
        service: 'Administrative Feature Management',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        database_connection: true,
        features_service: true
      };
      
      // Test database connection
      try {
        await db.query('SELECT 1');
      } catch (dbError) {
        healthCheck.status = 'unhealthy';
        healthCheck.database_connection = false;
      }
      
      return reply.code(healthCheck.status === 'healthy' ? 200 : 503).send(healthCheck);
    } catch (error) {
      return reply.code(503).send({ 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}