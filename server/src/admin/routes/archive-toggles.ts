/**
 * Archive Toggle API Routes (Epic 19)
 * 
 * REST API endpoints for managing archive toggles as part of Epic 19's
 * Data Protection & Privacy Controls. Provides comprehensive archiving
 * toggle management with fine-grained permissions and audit logging.
 * 
 * Features:
 * - CRUD operations for archive toggles
 * - Toggle state management (enable/disable)
 * - Emergency override capabilities
 * - Compliance evaluation endpoints
 * - Comprehensive audit trails
 * - Integration with Epic 17 feature toggle system
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ArchiveToggleService } from '../ArchiveToggleService';
import { ArchiveManagementService } from '../ArchiveManagementService';
import { AuditService } from '../../auth/services/AuditService';
import {
  CreateArchiveToggleRequest,
  UpdateArchiveToggleRequest,
  ArchiveToggleMode,
  ArchiveToggleScope,
  ArchiveToggleEvaluationContext,
  ArchiveType,
  ArchiveCategory,
  DataClassification
} from '../ArchiveToggleTypes';

// Request/Response schemas for validation
const createArchiveToggleSchema = {
  type: 'object',
  required: ['name', 'description', 'scope', 'mode'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    scope: { type: 'string', enum: Object.values(ArchiveToggleScope) },
    mode: { type: 'string', enum: Object.values(ArchiveToggleMode) },
    enabledByDefault: { type: 'boolean' },
    requiresExplicitConsent: { type: 'boolean' },
    complianceRequired: { type: 'boolean' },
    customSettings: { type: 'object' },
    orgId: { type: 'string', format: 'uuid' }
  }
};

const updateArchiveToggleSchema = {
  type: 'object',
  required: ['reason'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    mode: { type: 'string', enum: Object.values(ArchiveToggleMode) },
    enabledByDefault: { type: 'boolean' },
    requiresExplicitConsent: { type: 'boolean' },
    complianceRequired: { type: 'boolean' },
    reason: { type: 'string', minLength: 10, maxLength: 500 },
    customSettings: { type: 'object' }
  }
};

const setToggleStateSchema = {
  type: 'object',
  required: ['enabled', 'reason'],
  properties: {
    enabled: { type: 'boolean' },
    reason: { type: 'string', minLength: 10, maxLength: 200 }
  }
};

const emergencyOverrideSchema = {
  type: 'object',
  required: ['enabled', 'reason', 'ttlMinutes'],
  properties: {
    enabled: { type: 'boolean' },
    reason: { type: 'string', minLength: 10, maxLength: 500 },
    ttlMinutes: { type: 'number', minimum: 1, maximum: 1440 } // Max 24 hours
  }
};

const evaluateArchivingSchema = {
  type: 'object',
  required: ['archiveType', 'category', 'dataClassification', 'sourceIdentifier', 'triggeredBy'],
  properties: {
    userId: { type: 'string' },
    orgId: { type: 'string' },
    archiveType: { type: 'string', enum: Object.values(ArchiveType) },
    category: { type: 'string', enum: Object.values(ArchiveCategory) },
    dataClassification: { type: 'string', enum: Object.values(DataClassification) },
    sourceIdentifier: { type: 'string', minLength: 1, maxLength: 255 },
    complianceRequirements: { 
      type: 'array', 
      items: { type: 'string' }
    },
    hasUserConsent: { type: 'boolean' },
    isEmergency: { type: 'boolean' },
    isScheduled: { type: 'boolean' },
    triggeredBy: { 
      type: 'string', 
      enum: ['user', 'system', 'policy', 'emergency'] 
    },
    requestId: { type: 'string' }
  }
};

export async function archiveToggleRoutes(fastify: FastifyInstance) {
  // Initialize services
  const auditService = new AuditService(fastify.pg);
  // Note: In a real implementation, these would be properly injected
  const archiveService = new ArchiveManagementService(
    fastify.dbService, 
    auditService, 
    fastify.uploaderService, 
    fastify.archiveConfig
  );
  const toggleService = new ArchiveToggleService(
    fastify.dbService,
    auditService,
    archiveService
  );

  // Middleware to check admin permissions for archive toggles
  const requireArchiveAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.permissions?.includes('archive.manage')) {
      return reply.code(403).send({ 
        error: 'Archive management permissions required',
        required_permission: 'archive.manage'
      });
    }
  };

  // Middleware for compliance officer permissions
  const requireComplianceOfficer = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.permissions?.includes('compliance.manage')) {
      return reply.code(403).send({ 
        error: 'Compliance management permissions required',
        required_permission: 'compliance.manage'
      });
    }
  };

  // GET /archive-toggles - List archive toggles
  fastify.get('/archive-toggles', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: Object.values(ArchiveToggleScope) },
          mode: { type: 'string', enum: Object.values(ArchiveToggleMode) },
          enabled: { type: 'boolean' },
          orgId: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      
      const configs = toggleService.listToggleConfigs({
        scope: query.scope,
        mode: query.mode,
        enabled: query.enabled,
        orgId: query.orgId
      });

      // Apply pagination
      const total = configs.length;
      const paginatedConfigs = configs.slice(query.offset, query.offset + query.limit);

      // Get states for each config
      const configsWithStates = paginatedConfigs.map(config => {
        const state = toggleService.getToggleState(config.id);
        return {
          config,
          state,
          lastUpdated: Math.max(
            config.updatedAt.getTime(),
            state?.lastToggleTime?.getTime() || 0
          )
        };
      });

      return reply.send({
        toggles: configsWithStates,
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + paginatedConfigs.length < total
      });
    } catch (error) {
      request.log.error('Error listing archive toggles:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /archive-toggles - Create new archive toggle
  fastify.post('/archive-toggles', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: { body: createArchiveToggleSchema }
  }, async (request, reply) => {
    try {
      const body = request.body as CreateArchiveToggleRequest;
      const user = (request as any).user;
      
      const config = await toggleService.createArchiveToggle(body, user.id);
      const state = toggleService.getToggleState(config.id);
      
      return reply.code(201).send({
        config,
        state
      });
    } catch (error) {
      request.log.error('Error creating archive toggle:', error);
      
      if (error.message.includes('already exists')) {
        return reply.code(409).send({ 
          error: 'Conflict',
          message: error.message 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // GET /archive-toggles/:id - Get specific archive toggle
  fastify.get('/archive-toggles/:id', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const config = toggleService.getToggleConfig(id);
      if (!config) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found',
          toggleId: id
        });
      }

      const state = toggleService.getToggleState(id);
      
      return reply.send({
        config,
        state,
        auditTrail: state?.auditTrail?.slice(-20) || [], // Last 20 entries
        lastUpdated: Math.max(
          config.updatedAt.getTime(),
          state?.lastToggleTime?.getTime() || 0
        )
      });
    } catch (error) {
      request.log.error('Error getting archive toggle:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /archive-toggles/:id - Update archive toggle configuration
  fastify.put('/archive-toggles/:id', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      body: updateArchiveToggleSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as Partial<UpdateArchiveToggleRequest>;
      const user = (request as any).user;
      
      const updateRequest: UpdateArchiveToggleRequest = { ...body, id };
      const config = await toggleService.updateArchiveToggle(updateRequest, user.id);
      const state = toggleService.getToggleState(id);
      
      return reply.send({
        config,
        state
      });
    } catch (error) {
      request.log.error('Error updating archive toggle:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found' 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // POST /archive-toggles/:id/state - Enable/disable archive toggle
  fastify.post('/archive-toggles/:id/state', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      body: setToggleStateSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { enabled, reason } = request.body as { enabled: boolean; reason: string };
      const user = (request as any).user;
      
      const state = await toggleService.setToggleState(id, enabled, reason, user.id);
      const config = toggleService.getToggleConfig(id);
      
      return reply.send({
        config,
        state,
        action: enabled ? 'enabled' : 'disabled',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      request.log.error('Error setting toggle state:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found' 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // POST /archive-toggles/:id/emergency-override - Apply emergency override
  fastify.post('/archive-toggles/:id/emergency-override', {
    preHandler: [fastify.authenticate, requireComplianceOfficer],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      body: emergencyOverrideSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { enabled, reason, ttlMinutes } = request.body as { 
        enabled: boolean; 
        reason: string; 
        ttlMinutes: number; 
      };
      const user = (request as any).user;
      
      // TODO: Implement 2FA check for emergency operations
      
      const state = await toggleService.applyEmergencyOverride(
        id, enabled, reason, ttlMinutes, user.id
      );
      const config = toggleService.getToggleConfig(id);
      
      return reply.send({
        config,
        state,
        override: {
          enabled,
          reason,
          expiresAt: state.overrideExpiresAt?.toISOString(),
          ttlMinutes,
          appliedBy: user.id,
          appliedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      request.log.error('Error applying emergency override:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found' 
        });
      }
      
      if (error.message.includes('not allowed')) {
        return reply.code(403).send({ 
          error: 'Emergency override not allowed for this toggle' 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // POST /archive-toggles/evaluate - Evaluate archiving permissions
  fastify.post('/archive-toggles/evaluate', {
    preHandler: [fastify.authenticate], // Any authenticated user can evaluate
    schema: { body: evaluateArchivingSchema }
  }, async (request, reply) => {
    try {
      const body = request.body as Omit<ArchiveToggleEvaluationContext, 'timestamp'>;
      const user = (request as any).user;
      
      // Add user context if not provided
      const context: ArchiveToggleEvaluationContext = {
        ...body,
        userId: body.userId || user?.id,
        orgId: body.orgId || user?.orgId,
        timestamp: new Date()
      };
      
      const evaluation = await toggleService.evaluateArchiving(context);
      
      return reply.send({
        evaluation,
        context: {
          ...context,
          timestamp: context.timestamp.toISOString()
        },
        evaluatedAt: new Date().toISOString(),
        evaluatedFor: user?.id || 'system'
      });
    } catch (error) {
      request.log.error('Error evaluating archive toggle:', error);
      return reply.code(400).send({ 
        error: 'Evaluation failed',
        message: error instanceof Error ? error.message : 'Invalid evaluation context'
      });
    }
  });

  // GET /archive-toggles/:id/audit - Get detailed audit history
  fastify.get('/archive-toggles/:id/audit', {
    preHandler: [fastify.authenticate, requireComplianceOfficer],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          action: { type: 'string' },
          actorId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      
      const config = toggleService.getToggleConfig(id);
      if (!config) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found',
          toggleId: id
        });
      }

      const state = toggleService.getToggleState(id);
      let auditTrail = state?.auditTrail || [];

      // Apply filters
      if (query.startDate) {
        const startDate = new Date(query.startDate);
        auditTrail = auditTrail.filter(entry => entry.timestamp >= startDate);
      }

      if (query.endDate) {
        const endDate = new Date(query.endDate);
        auditTrail = auditTrail.filter(entry => entry.timestamp <= endDate);
      }

      if (query.action) {
        auditTrail = auditTrail.filter(entry => entry.action === query.action);
      }

      if (query.actorId) {
        auditTrail = auditTrail.filter(entry => entry.actorId === query.actorId);
      }

      // Sort by timestamp (newest first) and apply limit
      auditTrail = auditTrail
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, query.limit);

      return reply.send({
        toggleId: id,
        toggleName: config.name,
        auditTrail,
        totalEntries: state?.auditTrail?.length || 0,
        filteredEntries: auditTrail.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      request.log.error('Error getting audit history:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /archive-toggles/:id/compliance - Get compliance status
  fastify.get('/archive-toggles/:id/compliance', {
    preHandler: [fastify.authenticate, requireComplianceOfficer],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const config = toggleService.getToggleConfig(id);
      const state = toggleService.getToggleState(id);
      
      if (!config || !state) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found',
          toggleId: id
        });
      }

      // Calculate compliance metrics
      const complianceReport = {
        toggleId: id,
        toggleName: config.name,
        complianceStatus: state.complianceStatus,
        complianceSettings: {
          gdprCompliant: config.gdprCompliant,
          hipaaCompliant: config.hipaaCompliant,
          soxCompliant: config.soxCompliant,
          complianceRequired: config.complianceRequired,
          requiresExplicitConsent: config.requiresExplicitConsent
        },
        operationalMetrics: {
          totalArchiveOperations: state.archiveOperationsCount,
          failedOperations: state.failedArchiveOperations,
          successRate: state.archiveOperationsCount > 0 
            ? ((state.archiveOperationsCount - state.failedArchiveOperations) / state.archiveOperationsCount * 100).toFixed(2) + '%'
            : 'N/A',
          lastOperation: state.lastArchiveOperation?.toISOString()
        },
        consentStatus: {
          hasUserConsent: state.hasUserConsent,
          lastConsentCheck: state.lastConsentCheck?.toISOString(),
          consentRequired: config.requiresExplicitConsent
        },
        auditStatus: {
          auditingEnabled: config.auditArchiveOperations,
          totalAuditEntries: state.auditTrail.length,
          lastAuditEntry: state.auditTrail.length > 0 
            ? state.auditTrail[state.auditTrail.length - 1].timestamp.toISOString()
            : null
        },
        generatedAt: new Date().toISOString()
      };

      return reply.send(complianceReport);
    } catch (error) {
      request.log.error('Error getting compliance status:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /archive-toggles/:id - Archive/disable toggle (soft delete)
  fastify.delete('/archive-toggles/:id', {
    preHandler: [fastify.authenticate, requireArchiveAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      querystring: {
        type: 'object',
        properties: {
          reason: { type: 'string', minLength: 10, maxLength: 200 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.query as { reason?: string };
      const user = (request as any).user;
      
      // For archive toggles, we disable rather than delete
      const defaultReason = reason || 'Archive toggle disabled via API';
      const state = await toggleService.setToggleState(id, false, defaultReason, user.id);
      
      return reply.code(200).send({
        message: 'Archive toggle disabled successfully',
        toggleId: id,
        state,
        disabledAt: new Date().toISOString(),
        disabledBy: user.id,
        reason: defaultReason
      });
    } catch (error) {
      request.log.error('Error disabling archive toggle:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({ 
          error: 'Archive toggle not found' 
        });
      }
      
      return reply.code(400).send({ 
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  });

  // Health check endpoint
  fastify.get('/archive-toggles/health', async (request, reply) => {
    try {
      const configs = toggleService.listToggleConfigs();
      const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'archive-toggles',
        version: process.env.npm_package_version || '1.0.0',
        statistics: {
          totalToggles: configs.length,
          enabledToggles: configs.filter(c => {
            const state = toggleService.getToggleState(c.id);
            return state?.isEnabled;
          }).length,
          overriddenToggles: configs.filter(c => {
            const state = toggleService.getToggleState(c.id);
            return state?.isOverridden;
          }).length
        }
      };
      
      return reply.send(healthCheck);
    } catch (error) {
      return reply.code(500).send({ 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}