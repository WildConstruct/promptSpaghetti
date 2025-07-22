/**
 * Toggle Parameters API Routes - Epic 17
 * Task: E17-1753114396732-810080 - Create server-side integration
 * 
 * API routes for managing advanced feature toggle parameters including
 * validation, presets, change tracking, and parameter templates.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ToggleParametersService } from '../services/ToggleParametersService';
import { Database } from '../database/connection';
import { ToggleType } from '../database/feature-toggle-models';

interface ToggleParametersRouteOptions {
  db: Database;
}

// Request schemas for validation
const validateParametersSchema = {
  type: 'object',
  required: ['toggleType', 'parameters'],
  properties: {
    toggleType: { 
      type: 'string', 
      enum: Object.values(ToggleType)
    },
    parameters: { type: 'object' }
  }
};

const updateParametersSchema = {
  type: 'object',
  required: ['parameters'],
  properties: {
    parameters: { type: 'object' },
    reason: { type: 'string', maxLength: 500 }
  }
};

const createPresetSchema = {
  type: 'object',
  required: ['name', 'toggleType', 'parameters'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    toggleType: { 
      type: 'string', 
      enum: Object.values(ToggleType)
    },
    parameters: { type: 'object' },
    tags: { 
      type: 'array', 
      items: { type: 'string' },
      maxItems: 10
    },
    usage: { 
      type: 'string',
      enum: ['development', 'staging', 'production', 'experiment']
    }
  }
};

export default async function toggleParametersRoutes(
  fastify: FastifyInstance,
  options: ToggleParametersRouteOptions
) {
  const parametersService = new ToggleParametersService(options.db);

  // Middleware for authentication check
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
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
  // PARAMETER VALIDATION & TEMPLATES
  // ==========================================

  // POST /api/toggle-parameters/validate
  // Validate toggle parameters for a specific type
  fastify.post('/validate', {
    preHandler: [requireAuth],
    schema: { body: validateParametersSchema }
  }, async (request, reply) => {
    try {
      const { toggleType, parameters } = request.body as {
        toggleType: ToggleType;
        parameters: Record<string, any>;
      };

      const validation = await parametersService.validateParameters(toggleType, parameters);

      return reply.send({
        success: true,
        validation
      });
    } catch (error) {
      fastify.log.error('Failed to validate parameters:', error);
      return reply.status(400).send({
        success: false,
        error: 'Parameter validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-parameters/template/:type
  // Get parameter template for a toggle type
  fastify.get('/template/:type', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { 
            type: 'string', 
            enum: Object.values(ToggleType)
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { type } = request.params as { type: ToggleType };
      const template = parametersService.getParameterTemplate(type);
      const defaultParameters = await parametersService.getDefaultParameters(type);

      return reply.send({
        success: true,
        template,
        defaultParameters
      });
    } catch (error) {
      fastify.log.error('Failed to get parameter template:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to get parameter template',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // PARAMETER MANAGEMENT
  // ==========================================

  // PUT /api/toggle-parameters/:toggleId
  // Update toggle parameters
  fastify.put('/:toggleId', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['toggleId'],
        properties: {
          toggleId: { type: 'string' }
        }
      },
      body: updateParametersSchema
    }
  }, async (request, reply) => {
    try {
      const { toggleId } = request.params as { toggleId: string };
      const { parameters, reason } = request.body as {
        parameters: Record<string, any>;
        reason?: string;
      };
      const user = (request as any).user;

      const updatedToggle = await parametersService.updateToggleParameters(
        toggleId,
        parameters,
        user.id,
        reason
      );

      return reply.send({
        success: true,
        toggle: updatedToggle
      });
    } catch (error) {
      fastify.log.error('Failed to update toggle parameters:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to update toggle parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-parameters/:toggleId/history
  // Get parameter change history
  fastify.get('/:toggleId/history', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['toggleId'],
        properties: {
          toggleId: { type: 'string' }
        }
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
      const { toggleId } = request.params as { toggleId: string };
      const { limit } = request.query as { limit?: number };

      const history = await parametersService.getParameterChangeHistory(
        toggleId,
        limit || 50
      );

      return reply.send({
        success: true,
        history
      });
    } catch (error) {
      fastify.log.error('Failed to get parameter change history:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to get parameter change history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // PARAMETER PRESETS
  // ==========================================

  // GET /api/toggle-parameters/presets
  // List parameter presets
  fastify.get('/presets', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          toggleType: { 
            type: 'string', 
            enum: Object.values(ToggleType)
          },
          usage: { 
            type: 'string',
            enum: ['development', 'staging', 'production', 'experiment']
          },
          tags: { 
            type: 'array', 
            items: { type: 'string' } 
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleType, usage, tags } = request.query as {
        toggleType?: ToggleType;
        usage?: string;
        tags?: string[];
      };

      const presets = await parametersService.listParameterPresets(
        toggleType,
        usage,
        tags
      );

      return reply.send({
        success: true,
        presets
      });
    } catch (error) {
      fastify.log.error('Failed to list parameter presets:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to list parameter presets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-parameters/presets
  // Create parameter preset
  fastify.post('/presets', {
    preHandler: [requireAuth, requireAdmin],
    schema: { body: createPresetSchema }
  }, async (request, reply) => {
    try {
      const presetData = request.body as {
        name: string;
        description?: string;
        toggleType: ToggleType;
        parameters: Record<string, any>;
        tags?: string[];
        usage: 'development' | 'staging' | 'production' | 'experiment';
      };
      const user = (request as any).user;

      const presetId = await parametersService.createParameterPreset({
        ...presetData,
        createdBy: user.id
      });

      return reply.code(201).send({
        success: true,
        presetId
      });
    } catch (error) {
      fastify.log.error('Failed to create parameter preset:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to create parameter preset',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-parameters/:toggleId/apply-preset/:presetId
  // Apply parameter preset to toggle
  fastify.post('/:toggleId/apply-preset/:presetId', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['toggleId', 'presetId'],
        properties: {
          toggleId: { type: 'string' },
          presetId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 500 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleId, presetId } = request.params as { 
        toggleId: string; 
        presetId: string; 
      };
      const { reason } = request.body as { reason?: string };
      const user = (request as any).user;

      const updatedToggle = await parametersService.applyParameterPreset(
        toggleId,
        presetId,
        user.id,
        reason
      );

      return reply.send({
        success: true,
        toggle: updatedToggle
      });
    } catch (error) {
      fastify.log.error('Failed to apply parameter preset:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to apply parameter preset',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // PARAMETER EVALUATION
  // ==========================================

  // POST /api/toggle-parameters/:toggleId/evaluate
  // Evaluate toggle parameters with context
  fastify.post('/:toggleId/evaluate', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['toggleId'],
        properties: {
          toggleId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          context: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              orgId: { type: 'string' },
              userAttributes: { type: 'object' },
              timestamp: { type: 'string', format: 'date-time' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleId } = request.params as { toggleId: string };
      const { context = {} } = request.body as { 
        context?: any 
      };
      const user = (request as any).user;

      // Get the toggle first
      const toggle = await parametersService['getToggleById'](toggleId);
      if (!toggle) {
        return reply.status(404).send({
          success: false,
          error: 'Toggle not found'
        });
      }

      // Add user context if not provided
      const evaluationContext = {
        ...context,
        userId: context.userId || user?.id,
        orgId: context.orgId || user?.orgId,
        timestamp: context.timestamp ? new Date(context.timestamp) : new Date(),
        ipAddress: context.ipAddress || request.ip,
        userAgent: context.userAgent || request.headers['user-agent']
      };

      const result = await parametersService.evaluateParameters(
        toggle,
        evaluationContext
      );

      return reply.send({
        success: true,
        result
      });
    } catch (error) {
      fastify.log.error('Failed to evaluate toggle parameters:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to evaluate toggle parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  // GET /api/toggle-parameters/health
  // Health check for parameter service
  fastify.get('/health', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'toggle-parameters',
        version: '1.0.0'
      };

      return reply.send(health);
    } catch (error) {
      return reply.status(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Export route registration function
export { toggleParametersRoutes };