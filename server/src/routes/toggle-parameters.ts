/**
 * Toggle Parameters API Routes - Epic 17
 * Task: E17-1753114396772-E6C1FD - Create toggle parameters
 * 
 * RESTful API endpoints for managing feature toggle parameters including
 * validation, presets, templates, and change tracking.
 */

import { FastifyInstance } from 'fastify';
import { 
  ToggleParametersService, 
  ToggleParameterValidation,
  ParameterPreset 
} from '../services/ToggleParametersService';
import { ToggleType } from '../database/feature-toggle-models';
import { Database } from '../database/connection';

interface ToggleParametersRouteOptions {
  db: Database;
}

export default async function toggleParametersRoutes(
  fastify: FastifyInstance, 
  options: ToggleParametersRouteOptions
) {
  const toggleParametersService = new ToggleParametersService(options.db);

  // ==========================================
  // PARAMETER VALIDATION & TEMPLATES
  // ==========================================

  // GET /api/toggle-parameters/templates
  // Get parameter templates for toggle types
  fastify.get('/templates', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          toggleType: { 
            type: 'string',
            enum: ['boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic']
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            templates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  defaultParameters: { type: 'object' },
                  requiredFields: { type: 'array', items: { type: 'string' } },
                  optionalFields: { type: 'array', items: { type: 'string' } },
                  validationRules: { type: 'array' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleType } = request.query as { toggleType?: ToggleType };

      if (toggleType) {
        const template = toggleParametersService.getParameterTemplate(toggleType);
        return reply.send({
          success: true,
          templates: [template]
        });
      } else {
        const templates = Object.values(ToggleType).map(type => 
          toggleParametersService.getParameterTemplate(type)
        );
        
        return reply.send({
          success: true,
          templates
        });
      }
    } catch (error) {
      fastify.log.error('Failed to get parameter templates:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get parameter templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-parameters/templates/:type/defaults
  // Get default parameters for a specific toggle type
  fastify.get('/templates/:type/defaults', {
    schema: {
      params: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { 
            type: 'string',
            enum: ['boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic']
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            toggleType: { type: 'string' },
            defaultParameters: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { type } = request.params as { type: ToggleType };
      
      const defaultParameters = await toggleParametersService.getDefaultParameters(type);
      
      return reply.send({
        success: true,
        toggleType: type,
        defaultParameters
      });
    } catch (error) {
      fastify.log.error(`Failed to get default parameters for ${(request.params as any).type}:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get default parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-parameters/validate
  // Validate toggle parameters
  fastify.post('/validate', {
    schema: {
      body: {
        type: 'object',
        required: ['toggleType', 'parameters'],
        properties: {
          toggleType: { 
            type: 'string',
            enum: ['boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic']
          },
          parameters: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            validation: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean' },
                errors: { type: 'array', items: { type: 'string' } },
                warnings: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleType, parameters } = request.body as {
        toggleType: ToggleType;
        parameters: Record<string, any>;
      };

      const validation = await toggleParametersService.validateParameters(toggleType, parameters);

      return reply.send({
        success: true,
        validation
      });
    } catch (error) {
      fastify.log.error('Parameter validation failed:', error);
      return reply.status(500).send({
        success: false,
        error: 'Parameter validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // PARAMETER MANAGEMENT
  // ==========================================

  // PUT /api/toggle-parameters/toggles/:id/parameters
  // Update toggle parameters
  fastify.put('/toggles/:id/parameters', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['parameters'],
        properties: {
          parameters: { type: 'object' },
          reason: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            toggle: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { parameters, reason } = request.body as {
        parameters: Record<string, any>;
        reason?: string;
      };

      // Get user from JWT token (assuming authentication middleware sets request.user)
      const userId = (request as any).user?.id || 'unknown';

      const updatedToggle = await toggleParametersService.updateToggleParameters(
        id,
        parameters,
        userId,
        reason
      );

      return reply.send({
        success: true,
        toggle: updatedToggle
      });
    } catch (error) {
      fastify.log.error(`Failed to update parameters for toggle ${(request.params as any).id}:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Toggle not found',
          details: error.message
        });
      }

      if (error instanceof Error && error.message.includes('validation failed')) {
        return reply.status(400).send({
          success: false,
          error: 'Parameter validation failed',
          details: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Failed to update toggle parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/toggle-parameters/toggles/:id/history
  // Get parameter change history for a toggle
  fastify.get('/toggles/:id/history', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  toggleId: { type: 'string' },
                  fieldName: { type: 'string' },
                  oldValue: {},
                  newValue: {},
                  reason: { type: 'string' },
                  changedBy: { type: 'string' },
                  changedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit = 50 } = request.query as { limit?: number };

      const changes = await toggleParametersService.getParameterChangeHistory(id, limit);

      return reply.send({
        success: true,
        changes
      });
    } catch (error) {
      fastify.log.error(`Failed to get parameter history for toggle ${(request.params as any).id}:`, error);
      return reply.status(500).send({
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
    schema: {
      querystring: {
        type: 'object',
        properties: {
          toggleType: { 
            type: 'string',
            enum: ['boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic']
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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            presets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  toggleType: { type: 'string' },
                  parameters: { type: 'object' },
                  tags: { type: 'array', items: { type: 'string' } },
                  usage: { type: 'string' },
                  createdBy: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
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

      const presets = await toggleParametersService.listParameterPresets(toggleType, usage, tags);

      return reply.send({
        success: true,
        presets
      });
    } catch (error) {
      fastify.log.error('Failed to list parameter presets:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to list parameter presets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-parameters/presets
  // Create a new parameter preset
  fastify.post('/presets', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'toggleType', 'parameters'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 1000 },
          toggleType: { 
            type: 'string',
            enum: ['boolean', 'percentage_rollout', 'multivariate', 'scheduled', 'segmentation', 'dynamic']
          },
          parameters: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          usage: {
            type: 'string',
            enum: ['development', 'staging', 'production', 'experiment'],
            default: 'development'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            presetId: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, description, toggleType, parameters, tags, usage } = request.body as {
        name: string;
        description?: string;
        toggleType: ToggleType;
        parameters: Record<string, any>;
        tags?: string[];
        usage?: 'development' | 'staging' | 'production' | 'experiment';
      };

      // Get user from JWT token
      const userId = (request as any).user?.id || 'unknown';

      const presetId = await toggleParametersService.createParameterPreset({
        name,
        description: description || '',
        toggleType,
        parameters,
        tags: tags || [],
        usage: usage || 'development',
        createdBy: userId
      });

      return reply.status(201).send({
        success: true,
        presetId
      });
    } catch (error) {
      fastify.log.error('Failed to create parameter preset:', error);
      
      if (error instanceof Error && error.message.includes('parameters invalid')) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid preset parameters',
          details: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Failed to create parameter preset',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/toggle-parameters/toggles/:id/apply-preset
  // Apply a parameter preset to a toggle
  fastify.post('/toggles/:id/apply-preset', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['presetId'],
        properties: {
          presetId: { type: 'string' },
          reason: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            toggle: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { presetId, reason } = request.body as {
        presetId: string;
        reason?: string;
      };

      // Get user from JWT token
      const userId = (request as any).user?.id || 'unknown';

      const updatedToggle = await toggleParametersService.applyParameterPreset(
        id,
        presetId,
        userId,
        reason
      );

      return reply.send({
        success: true,
        toggle: updatedToggle
      });
    } catch (error) {
      fastify.log.error(`Failed to apply preset to toggle ${(request.params as any).id}:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: 'Toggle or preset not found',
          details: error.message
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Failed to apply parameter preset',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // PARAMETER EVALUATION (TESTING)
  // ==========================================

  // POST /api/toggle-parameters/evaluate
  // Test parameter evaluation with given context
  fastify.post('/evaluate', {
    schema: {
      body: {
        type: 'object',
        required: ['toggle', 'context'],
        properties: {
          toggle: {
            type: 'object',
            required: ['id', 'key', 'type', 'value', 'enabled'],
            properties: {
              id: { type: 'string' },
              key: { type: 'string' },
              type: { type: 'string' },
              value: { type: 'object' },
              enabled: { type: 'boolean' }
            }
          },
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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                value: {},
                variantKey: { type: 'string' },
                reason: { type: 'string' },
                ruleMatched: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggle, context } = request.body as {
        toggle: any;
        context: any;
      };

      const result = await toggleParametersService.evaluateParameters(toggle, context);

      return reply.send({
        success: true,
        result
      });
    } catch (error) {
      fastify.log.error('Parameter evaluation failed:', error);
      return reply.status(500).send({
        success: false,
        error: 'Parameter evaluation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // ANALYTICS & HEALTH
  // ==========================================

  // GET /api/toggle-parameters/analytics/usage
  // Get parameter usage analytics
  fastify.get('/analytics/usage', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          toggleId: { type: 'string' },
          period: {
            type: 'string',
            enum: ['24h', '7d', '30d'],
            default: '7d'
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { toggleId, period = '7d' } = request.query as {
        toggleId?: string;
        period?: string;
      };

      // This would be implemented with proper analytics queries
      // For now, return a placeholder response
      return reply.send({
        success: true,
        analytics: {
          period,
          toggleId,
          totalEvaluations: 0,
          successRate: 1.0,
          averageEvaluationTime: 0,
          popularParameters: [],
          errorTypes: []
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get parameter usage analytics:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get parameter usage analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Export route registration function
export { toggleParametersRoutes };