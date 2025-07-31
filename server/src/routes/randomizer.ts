// Epic 12 - LLM Agent Randomizer System
// Server routes for randomizer API functionality

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { LLMRandomizerSystem } from '../../packages/core/llm-randomizer';

// Request/Response schemas
const RandomizerGenerateRequestSchema = z.object({
  parameters: z.object({
    purpose: z.string().min(1),
    complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
    nodeCount: z.number().int().min(3).max(100).optional(),
    style: z.enum(['creative', 'logical', 'balanced']).optional(),
    provider: z.enum(['openai', 'claude', 'gemini']).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxRetries: z.number().int().min(1).max(10).optional(),
    domain: z.string().optional(),
    specificRequirements: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    qualityLevel: z.enum(['draft', 'standard', 'high']).optional(),
    diversityScore: z.number().min(0).max(1).optional(),
    includeMetadata: z.boolean().optional(),
    validateOutput: z.boolean().optional(),
    includeExplanation: z.boolean().optional()
  }
});

const RandomizerValidateRequestSchema = z.object({
  parameters: z.object({
    purpose: z.string().optional(),
    complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
    nodeCount: z.number().int().min(3).max(100).optional(),
    style: z.enum(['creative', 'logical', 'balanced']).optional(),
    provider: z.enum(['openai', 'claude', 'gemini']).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxRetries: z.number().int().min(1).max(10).optional(),
    domain: z.string().optional(),
    specificRequirements: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    qualityLevel: z.enum(['draft', 'standard', 'high']).optional(),
    diversityScore: z.number().min(0).max(1).optional(),
    includeMetadata: z.boolean().optional(),
    validateOutput: z.boolean().optional(),
    includeExplanation: z.boolean().optional()
  }
});

// Type definitions
type RandomizerGenerateRequest = z.infer<typeof RandomizerGenerateRequestSchema>;
type RandomizerValidateRequest = z.infer<typeof RandomizerValidateRequestSchema>;

}
}
interface RandomizerGenerateResponse {
  success: boolean;
  graph?: unknown;
  metadata?: {
    generationTime: number;
    provider: string;
    requestId: string;
    timestamp: string;
}
}
  };
  errors?: Array<{
    type: string;
    message: string;
    details?: unknown;
  }>;
  warnings?: Array<{
    type: string;
    message: string;
    suggestion?: string;
  }>;
}

}
}
interface RandomizerValidateResponse {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
}
}
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
  suggestions?: {
    nodeCount?: number;
    temperature?: number;
    focusAreas?: string[];
    recommendedProvider?: string;
  };
}

// Global randomizer system instance
const randomizerSystem = new LLMRandomizerSystem();

/**
 * Randomizer routes plugin
 */
export async function randomizerRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/randomizer/generate
   * Generate a graph using LLM randomizer
   */
  fastify.post<{
    Body: RandomizerGenerateRequest;
    Reply: RandomizerGenerateResponse;
  }>('/generate', {
    schema: {
      body: {
        type: 'object',
        required: ['parameters'],
        properties: {
          parameters: {
            type: 'object',
            required: ['purpose'],
            properties: {
              purpose: { type: 'string', minLength: 1 },
              complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
              nodeCount: { type: 'integer', minimum: 3, maximum: 100 },
              style: { type: 'string', enum: ['creative', 'logical', 'balanced'] },
              provider: { type: 'string', enum: ['openai', 'claude', 'gemini'] },
              temperature: { type: 'number', minimum: 0, maximum: 2 },
              maxRetries: { type: 'integer', minimum: 1, maximum: 10 },
              domain: { type: 'string' },
              specificRequirements: { type: 'array', items: { type: 'string' } },
              constraints: { type: 'array', items: { type: 'string' } },
              qualityLevel: { type: 'string', enum: ['draft', 'standard', 'high'] },
              diversityScore: { type: 'number', minimum: 0, maximum: 1 },
              includeMetadata: { type: 'boolean' },
              validateOutput: { type: 'boolean' },
              includeExplanation: { type: 'boolean' }
            }
          }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            graph: { type: 'object' },
            metadata: {
              type: 'object',
              properties: {
                generationTime: { type: 'number' },
                provider: { type: 'string' },
                requestId: { type: 'string' },
                timestamp: { type: 'string' }
              }
  }
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'object' }
                }
              }
  }
            warnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  suggestion: { type: 'string' }
                }
              }
            }
          }
  }
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
  }
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
  }
    handler: async (request: FastifyRequest<{ Body: RandomizerGenerateRequest }>, reply: FastifyReply) => {
      try {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        // Validate request
        const validatedRequest = RandomizerGenerateRequestSchema.parse(request.body);
        
        // Generate graph using randomizer system
        const result = await randomizerSystem.fullWorkflow(
          validatedRequest.parameters,
          validatedRequest.parameters.provider || 'openai'
        );
        
        const generationTime = Date.now() - startTime;
        
        if (result.success) {
          const response: RandomizerGenerateResponse = {
            success: true,
            graph: result.parsedGraph,
            metadata: {
              generationTime,
              provider: validatedRequest.parameters.provider || 'openai',
              requestId,
              timestamp: new Date().toISOString()
  }
            errors: result.errors || [],
            warnings: result.warnings || []
          };
          
          reply.code(200).send(response);
        } else {
          const response: RandomizerGenerateResponse = {
            success: false,
            errors: result.errors || [{
              type: 'generation_error',
              message: 'Failed to generate graph'
            }],
            warnings: result.warnings || []
          };
          
          reply.code(400).send(response);
        }
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof z.ZodError) {
          reply.code(400).send({
            success: false,
            errors: [{
              type: 'validation_error',
              message: `Invalid request: ${error.message}`
            }]
          });
        } else {
          reply.code(500).send({
            success: false,
            errors: [{
              type: 'server_error',
              message: error instanceof Error ? error.message : 'Unknown error'
            }]
          });
        }
      }
    }
  });

  /**
   * POST /api/randomizer/validate
   * Validate randomizer parameters
   */
  fastify.post<{
    Body: RandomizerValidateRequest;
    Reply: RandomizerValidateResponse;
  }>('/validate', {
    schema: {
      body: {
        type: 'object',
        required: ['parameters'],
        properties: {
          parameters: {
            type: 'object',
            properties: {
              purpose: { type: 'string' },
              complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
              nodeCount: { type: 'integer', minimum: 3, maximum: 100 },
              style: { type: 'string', enum: ['creative', 'logical', 'balanced'] },
              provider: { type: 'string', enum: ['openai', 'claude', 'gemini'] },
              temperature: { type: 'number', minimum: 0, maximum: 2 },
              maxRetries: { type: 'integer', minimum: 1, maximum: 10 },
              domain: { type: 'string' },
              specificRequirements: { type: 'array', items: { type: 'string' } },
              constraints: { type: 'array', items: { type: 'string' } },
              qualityLevel: { type: 'string', enum: ['draft', 'standard', 'high'] },
              diversityScore: { type: 'number', minimum: 0, maximum: 1 },
              includeMetadata: { type: 'boolean' },
              validateOutput: { type: 'boolean' },
              includeExplanation: { type: 'boolean' }
            }
          }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  severity: { type: 'string', enum: ['error', 'warning'] }
                }
              }
  }
            warnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  suggestion: { type: 'string' }
                }
              }
  }
            suggestions: {
              type: 'object',
              properties: {
                nodeCount: { type: 'number' },
                temperature: { type: 'number' },
                focusAreas: { type: 'array', items: { type: 'string' } },
                recommendedProvider: { type: 'string' }
              }
            }
          }
        }
      }
  }
    handler: async (request: FastifyRequest<{ Body: RandomizerValidateRequest }>, reply: FastifyReply) => {
      try {
        const validatedRequest = RandomizerValidateRequestSchema.parse(request.body);
        
        // Import the parameter manager to validate parameters
        const { ParameterManager } = await import('../../../packages/core/llm-randomizer/generator/parameters/parameter-manager');
        const parameterManager = new ParameterManager();
        
        // Validate parameters
        const validationResult = parameterManager.validateParameters(validatedRequest.parameters);
        
        // Get suggestions
        const suggestions = parameterManager.getSuggestions(validatedRequest.parameters);
        
        const response: RandomizerValidateResponse = {
          isValid: validationResult.isValid,
          errors: validationResult.errors.map(error => ({
            field: error.field,
            message: error.message,
            severity: 'error' as const
          })),
          warnings: validationResult.warnings.map(warning => ({
            field: warning.field,
            message: warning.message,
            suggestion: warning.suggestion
          })),
          suggestions: {
            nodeCount: suggestions.nodeCount,
            temperature: suggestions.temperature,
            focusAreas: suggestions.focusAreas,
            recommendedProvider: suggestions.recommendedProvider
          }
        };
        
        reply.code(200).send(response);
      } catch (error) {
        request.log.error(error);
        
        if (error instanceof z.ZodError) {
          reply.code(400).send({
            isValid: false,
            errors: [{
              field: 'request',
              message: `Invalid request: ${error.message}`,
              severity: 'error' as const
            }],
            warnings: []
          });
        } else {
          reply.code(500).send({
            isValid: false,
            errors: [{
              field: 'server',
              message: error instanceof Error ? error.message : 'Unknown error',
              severity: 'error' as const
            }],
            warnings: []
          });
        }
      }
    }
  });

  /**
   * GET /api/randomizer/presets
   * Get available parameter presets
   */
  fastify.get('/presets', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            presets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  parameters: { type: 'object' }
                }
              }
  }
            categories: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'object' }
              }
            }
          }
        }
      }
  }
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { ParameterManager } = await import('../../../packages/core/llm-randomizer/generator/parameters/parameter-manager');
        const parameterManager = new ParameterManager();
        
        const presets = parameterManager.getPresets();
        const categories = parameterManager.getPresetsByCategory();
        
        reply.code(200).send({
          presets,
          categories
        });
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({
          presets: [],
          categories: {}
        });
      }
    }
  });

  /**
   * GET /api/randomizer/health
   * Health check for randomizer system
   */
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            services: {
              type: 'object',
              properties: {
                randomizer: { type: 'string' },
                llm_agents: { type: 'string' },
                parser: { type: 'string' },
                serializer: { type: 'string' }
              }
            }
          }
        }
      }
  }
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Test basic functionality
        await randomizerSystem.fullWorkflow({
          purpose: 'test health check',
          complexity: 'simple',
          nodeCount: 3,
          provider: 'openai'
        });
        
        reply.code(200).send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            randomizer: 'healthy',
            llm_agents: 'healthy',
            parser: 'healthy',
            serializer: 'healthy'
          }
        });
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            randomizer: 'unhealthy',
            llm_agents: 'unknown',
            parser: 'unknown',
            serializer: 'unknown'
          }
        });
      }
    }
  });
}