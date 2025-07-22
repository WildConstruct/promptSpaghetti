// Epic 17.1 - Feature Toggle API Routes

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FeatureToggleService } from '../services/feature-toggle-service';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  CreateToggleRequest,
  UpdateToggleRequest,
  EmergencyOverrideRequest,
  ToggleEvaluationContext,
  ToggleType,
  ClaudeImpact
} from '../database/feature-toggle-models';

// Request/Response schemas for validation
const createToggleSchema = {
  type: 'object',
  required: ['key', 'name', 'type', 'value'],
  properties: {
    key: { type: 'string', pattern: '^[a-z0-9_.-]+$' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    type: { type: 'string', enum: Object.values(ToggleType) },
    value: { type: 'object' },
    orgId: { type: 'string', format: 'uuid' },
    claudeCompat: { type: 'array', items: { type: 'string' } },
    claudeImpact: { type: 'string', enum: Object.values(ClaudeImpact) },
    enabled: { type: 'boolean' }
  }
};

const updateToggleSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    value: { type: 'object' },
    claudeCompat: { type: 'array', items: { type: 'string' } },
    claudeImpact: { type: 'string', enum: Object.values(ClaudeImpact) },
    enabled: { type: 'boolean' },
    reason: { type: 'string', maxLength: 200 }
  }
};

const evaluateToggleSchema = {
  type: 'object',
  properties: {
    toggles: { 
      type: 'array', 
      items: { type: 'string' },
      minItems: 1,
      maxItems: 50
    },
    context: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        orgId: { type: 'string' },
        userAttributes: { type: 'object' },
        timestamp: { type: 'string', format: 'date-time' },
        ipAddress: { type: 'string' },
        userAgent: { type: 'string' },
        experimentId: { type: 'string' }
      }
    }
  }
};

const emergencyOverrideSchema = {
  type: 'object',
  required: ['action', 'reason'],
  properties: {
    action: { type: 'string', enum: ['enable', 'disable'] },
    reason: { type: 'string', minLength: 10, maxLength: 500 },
    ttlMinutes: { type: 'number', minimum: 1, maximum: 1440 } // Max 24 hours
  }
};

export async function featureToggleRoutes(fastify: FastifyInstance) {
  const dao = new FeatureToggleDAO(fastify.pg);
  const service = new FeatureToggleService(dao);

  // Middleware to check admin permissions
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    // TODO: Integrate with Epic 11 auth system
    const user = (request as any).user;
    if (!user || !user.permissions?.includes('toggle.manage')) {
      return reply.code(403).send({ error: 'Admin permissions required' });
    }
  };

  // GET /toggles - List feature toggles
  fastify.get('/toggles', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
          enabled: { type: 'boolean' },
          type: { type: 'string', enum: Object.values(ToggleType) },
          claudeImpact: { type: 'string', enum: Object.values(ClaudeImpact) },
          search: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      const result = await dao.listToggles({
        orgId: query.orgId,
        enabled: query.enabled,
        type: query.type,
        claudeImpact: query.claudeImpact,
        search: query.search,
        limit: query.limit,
        offset: query.offset
      });

      return reply.send({
        toggles: result.toggles,
        total: result.total,
        limit: query.limit,
        offset: query.offset
      });
    } catch (error) {
      request.log.error('Error listing toggles:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /toggles - Create feature toggle
  fastify.post('/toggles', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: { body: createToggleSchema }
  }, async (request, reply) => {
    try {
      const body = request.body as CreateToggleRequest;
      const user = (request as any).user;
      
      const toggle = await service.createToggle(body, user.id);
      
      return reply.code(201).send(toggle);
    } catch (error) {
      request.log.error('Error creating toggle:', error);
      
      if (error.code === '23505') { // Unique violation
        return reply.code(409).send({ error: 'Toggle key already exists' });
      }
      
      return reply.code(400).send({ error: error.message });
    }
  });

  // GET /toggles/:id - Get specific toggle
  fastify.get('/toggles/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const toggle = await dao.getToggleById(id);
      
      if (!toggle) {
        return reply.code(404).send({ error: 'Toggle not found' });
      }
      
      // Get additional data
      const [scopes, audit, dependencies] = await Promise.all([
        dao.getToggleScopes(id),
        dao.getToggleAuditHistory(id, 20),
        dao.getDependencyAnalysis(id)
      ]);
      
      return reply.send({
        ...toggle,
        scopes,
        recentAudit: audit,
        dependencies
      });
    } catch (error) {
      request.log.error('Error getting toggle:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // PUT /toggles/:id - Update toggle
  fastify.put('/toggles/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: updateToggleSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as Partial<UpdateToggleRequest>;
      const user = (request as any).user;
      
      const updateRequest: UpdateToggleRequest = { ...body, id };
      const toggle = await service.updateToggle(updateRequest, user.id);
      
      return reply.send(toggle);
    } catch (error) {
      request.log.error('Error updating toggle:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // POST /toggles/:id/activate - Activate toggle (with dry-run option)
  fastify.post('/toggles/:id/activate', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      querystring: {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean', default: false }
        }
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 200 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { dryRun } = request.query as { dryRun?: boolean };
      const { reason } = request.body as { reason?: string };
      const user = (request as any).user;
      
      if (dryRun) {
        // Simulate impact analysis
        const toggle = await dao.getToggleById(id);
        if (!toggle) {
          return reply.code(404).send({ error: 'Toggle not found' });
        }
        
        const dependencies = await dao.getDependencyAnalysis(id);
        
        return reply.send({
          impact: {
            togglesAffected: dependencies.impactRadius,
            dependencies: dependencies.dependencies,
            dependents: dependencies.dependents,
            estimatedUserImpact: 'TBD', // TODO: Integrate with Epic 13 analytics
            claudeImpact: toggle.claudeImpact
          },
          wouldActivate: true
        });
      }
      
      const toggle = await service.updateToggle({
        id,
        enabled: true,
        reason
      }, user.id);
      
      return reply.send(toggle);
    } catch (error) {
      request.log.error('Error activating toggle:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // POST /toggles/:id/deactivate - Deactivate toggle (with dry-run option)
  fastify.post('/toggles/:id/deactivate', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      querystring: {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean', default: false }
        }
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 200 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { dryRun } = request.query as { dryRun?: boolean };
      const { reason } = request.body as { reason?: string };
      const user = (request as any).user;
      
      if (dryRun) {
        // Simulate impact analysis for deactivation
        const toggle = await dao.getToggleById(id);
        if (!toggle) {
          return reply.code(404).send({ error: 'Toggle not found' });
        }
        
        const dependencies = await dao.getDependencyAnalysis(id);
        
        return reply.send({
          impact: {
            togglesAffected: dependencies.impactRadius,
            dependencies: dependencies.dependencies,
            dependents: dependencies.dependents,
            estimatedUserImpact: 'TBD', // TODO: Integrate with Epic 13 analytics
            claudeImpact: toggle.claudeImpact,
            deactivationRisk: toggle.enabled ? 'MEDIUM' : 'LOW'
          },
          wouldDeactivate: true
        });
      }
      
      const toggle = await service.updateToggle({
        id,
        enabled: false,
        reason
      }, user.id);
      
      return reply.send(toggle);
    } catch (error) {
      request.log.error('Error deactivating toggle:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // POST /toggles/:id/rollback - Rollback toggle to previous version
  fastify.post('/toggles/:id/rollback', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 10, maxLength: 500 },
          version: { type: 'number', minimum: 1 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason, version } = request.body as { reason: string; version?: number };
      const user = (request as any).user;
      
      // TODO: Implement 2FA check for rollback operations
      // For now, just require extra confirmation
      
      // Get current toggle
      const toggle = await dao.getToggleById(id);
      if (!toggle) {
        return reply.code(404).send({ error: 'Toggle not found' });
      }
      
      // For now, just disable the toggle (full rollback would need version history)
      const rolledBackToggle = await service.updateToggle({
        id,
        enabled: false,
        reason: `ROLLBACK: ${reason}`
      }, user.id);
      
      // Create special audit entry
      await dao.createAuditEntry({
        toggleId: id,
        actorId: user.id,
        action: 'rollback' as any,
        beforeValue: { enabled: toggle.enabled, version: toggle.version },
        afterValue: { enabled: false, version: rolledBackToggle.version },
        reason,
        isEmergency: true
      });
      
      return reply.send(rolledBackToggle);
    } catch (error) {
      request.log.error('Error rolling back toggle:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // GET /toggles/:id/audit - Get audit history
  fastify.get('/toggles/:id/audit', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit } = request.query as { limit: number };
      
      const audit = await dao.getToggleAuditHistory(id, limit);
      
      return reply.send({ audit });
    } catch (error) {
      request.log.error('Error getting audit history:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /toggles/:id/override - Emergency override
  fastify.post('/toggles/:id/override', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: emergencyOverrideSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as Omit<EmergencyOverrideRequest, 'toggleId'>;
      const user = (request as any).user;
      
      // TODO: Implement emergency permission check and 2FA
      
      const overrideRequest: EmergencyOverrideRequest = {
        ...body,
        toggleId: id
      };
      
      await service.emergencyOverride(overrideRequest, user.id);
      
      return reply.code(200).send({ 
        message: 'Emergency override applied',
        action: body.action,
        expiresAt: body.ttlMinutes 
          ? new Date(Date.now() + body.ttlMinutes * 60000).toISOString()
          : null
      });
    } catch (error) {
      request.log.error('Error applying emergency override:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // DELETE /toggles/:id - Archive toggle
  fastify.delete('/toggles/:id', {
    preHandler: [fastify.authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      
      await dao.archiveToggle(id, user.id);
      
      return reply.code(204).send();
    } catch (error) {
      request.log.error('Error archiving toggle:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // POST /evaluate - Evaluate toggles for a context
  fastify.post('/evaluate', {
    preHandler: [fastify.authenticate], // Any authenticated user can evaluate
    schema: { body: evaluateToggleSchema }
  }, async (request, reply) => {
    try {
      const { toggles, context = {} } = request.body as { 
        toggles: string[]; 
        context?: ToggleEvaluationContext 
      };
      
      // Add user context if not provided
      const user = (request as any).user;
      const evaluationContext: ToggleEvaluationContext = {
        ...context,
        userId: context.userId || user?.id,
        orgId: context.orgId || user?.orgId,
        timestamp: context.timestamp ? new Date(context.timestamp) : new Date(),
        ipAddress: context.ipAddress || request.ip,
        userAgent: context.userAgent || request.headers['user-agent']
      };
      
      const results = await service.evaluateToggles(toggles, evaluationContext);
      
      return reply.send({ results });
    } catch (error) {
      request.log.error('Error evaluating toggles:', error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // GET /snapshot - Get toggle configuration snapshot
  fastify.get('/snapshot', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          orgId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { orgId } = request.query as { orgId?: string };
      const user = (request as any).user;
      
      // Use user's org if not specified
      const targetOrgId = orgId || user?.orgId;
      
      const snapshot = await service.generateSnapshot(targetOrgId);
      
      // Set cache headers for CDN
      reply.header('Cache-Control', 'public, max-age=30');
      reply.header('ETag', `"${snapshot.checksum}"`);
      
      return reply.send(snapshot);
    } catch (error) {
      request.log.error('Error generating snapshot:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Simple health check
      const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      };
      
      return reply.send(healthCheck);
    } catch (error) {
      return reply.code(500).send({ 
        status: 'unhealthy', 
        error: error.message 
      });
    }
  });
}