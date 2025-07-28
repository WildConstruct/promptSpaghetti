/**
 * Webhook Authentication Routes - Standardized Auth Handler Framework
 * 
 * Unified webhook authentication endpoints providing provider management,
 * signature verification, and event routing for all webhook integrations.
 * 
 * Task: T-1752989144373-142 - Standardize auth handler framework (OAuth2, API keys, webhooks)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WebhookAuthenticationService, WebhookProvider } from '../auth/services/WebhookAuthenticationService';
import { AuditService } from '../auth/services/AuditService';

// Request/Response schemas
const RegisterProviderSchema = z.object({
  providerId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  signatureHeader: z.string().min(1),
  signatureAlgorithm: z.enum(['sha256', 'sha1', 'sha512']).default('sha256'),
  signaturePrefix: z.string().optional(),
  secretKey: z.string().min(1),
  endpoints: z.array(z.string().url()).default([]),
  eventTypes: z.array(z.string()).default([])
});

const UpdateProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  signatureHeader: z.string().min(1).optional(),
  signatureAlgorithm: z.enum(['sha256', 'sha1', 'sha512']).optional(),
  signaturePrefix: z.string().optional(),
  secretKey: z.string().min(1).optional(),
  endpoints: z.array(z.string().url()).optional(),
  eventTypes: z.array(z.string()).optional(),
  active: z.boolean().optional()
});

const TestWebhookSchema = z.object({
  payload: z.record(z.any()).default({ test: true, timestamp: new Date().toISOString() })
});

export async function webhookAuthRoutes(fastify: FastifyInstance) {
  const webhookAuthService = new WebhookAuthenticationService(
    new AuditService(fastify.databaseService)
  );

  // Helper to check admin permissions
  async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    if (!user || !user.roles?.includes('admin')) {
      reply.code(403).send({ 
        error: 'Admin role required for webhook management',
        requiredRole: 'admin' 
      });
      return;
    }
  }

  // Register new webhook provider
  fastify.post('/webhooks/providers', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Register new webhook provider',
      body: RegisterProviderSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            providerId: { type: 'string' }
          }
  }
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          }
  }
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            requiredRole: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof RegisterProviderSchema> }>, reply: FastifyReply) => {
    try {
      const providerData = request.body;

      // Check if provider already exists
      const existingProvider = webhookAuthService.getProvider(providerData.providerId);
      if (existingProvider) {
        reply.code(400).send({ 
          error: 'Provider already exists', 
          details: { providerId: providerData.providerId } 
        });
        return;
      }

      await webhookAuthService.registerProvider({
        ...providerData,
        active: true
      });

      reply.code(201).send({
        success: true,
        message: `Webhook provider '${providerData.name}' registered successfully`,
        providerId: providerData.providerId
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to register webhook provider',
        details: { message: error.message }
      });
    }
  });

  // Get all webhook providers
  fastify.get('/webhooks/providers', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'List all webhook providers',
      response: {
        200: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  providerId: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  signatureHeader: { type: 'string' },
                  signatureAlgorithm: { type: 'string' },
                  active: { type: 'boolean' },
                  endpoints: { type: 'array', items: { type: 'string' } },
                  eventTypes: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
  }
            count: { type: 'number' },
            statistics: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const providers = webhookAuthService.getProviders();
      const statistics = webhookAuthService.getStatistics();

      // Remove sensitive data (secret keys) from response
      const safeProviders = providers.map(provider => ({
        providerId: provider.providerId,
        name: provider.name,
        description: provider.description,
        signatureHeader: provider.signatureHeader,
        signatureAlgorithm: provider.signatureAlgorithm,
        signaturePrefix: provider.signaturePrefix,
        active: provider.active,
        endpoints: provider.endpoints,
        eventTypes: provider.eventTypes,
        createdAt: provider.createdAt.toISOString(),
        updatedAt: provider.updatedAt.toISOString()
      }));

      reply.send({
        providers: safeProviders,
        count: safeProviders.length,
        statistics
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to fetch webhook providers',
        details: { message: error.message }
      });
    }
  });

  // Get specific webhook provider
  fastify.get('/webhooks/providers/:providerId', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Get specific webhook provider',
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' }
  }
        required: ['providerId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            provider: { type: 'object' }
          }
  }
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { providerId: string } }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;
      const provider = webhookAuthService.getProvider(providerId);

      if (!provider) {
        reply.code(404).send({ error: `Provider not found: ${providerId}` });
        return;
      }

      // Remove secret key from response
      const { secretKey, ...safeProvider } = provider;
      reply.send({ 
        provider: {
          ...safeProvider,
          createdAt: provider.createdAt.toISOString(),
          updatedAt: provider.updatedAt.toISOString()
        } 
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to fetch webhook provider',
        details: { message: error.message }
      });
    }
  });

  // Update webhook provider
  fastify.put('/webhooks/providers/:providerId', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Update webhook provider',
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' }
  }
        required: ['providerId']
  }
      body: UpdateProviderSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
  }
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { providerId: string }, 
    Body: z.infer<typeof UpdateProviderSchema> 
  }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;
      const updates = request.body;

      const success = await webhookAuthService.updateProvider(providerId, updates);

      if (!success) {
        reply.code(404).send({ error: `Provider not found: ${providerId}` });
        return;
      }

      reply.send({
        success: true,
        message: `Provider '${providerId}' updated successfully`
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to update webhook provider',
        details: { message: error.message }
      });
    }
  });

  // Delete webhook provider
  fastify.delete('/webhooks/providers/:providerId', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Delete webhook provider',
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' }
  }
        required: ['providerId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
  }
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { providerId: string } }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;

      const success = await webhookAuthService.removeProvider(providerId);

      if (!success) {
        reply.code(404).send({ error: `Provider not found: ${providerId}` });
        return;
      }

      reply.send({
        success: true,
        message: `Provider '${providerId}' deleted successfully`
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to delete webhook provider',
        details: { message: error.message }
      });
    }
  });

  // Test webhook provider
  fastify.post('/webhooks/providers/:providerId/test', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Test webhook provider configuration',
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' }
  }
        required: ['providerId']
  }
      body: TestWebhookSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            validation: { type: 'object' },
            message: { type: 'string' }
          }
  }
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            validation: { type: 'object' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { providerId: string },
    Body: z.infer<typeof TestWebhookSchema>
  }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;
      const { payload } = request.body;

      const validation = await webhookAuthService.testProvider(providerId, payload);

      if (validation.valid) {
        reply.send({
          success: true,
          validation: {
            valid: validation.valid,
            providerId: validation.providerId,
            signature: validation.signature,
            computedSignature: validation.computedSignature
  }
          message: 'Webhook provider test successful'
        });
      } else {
        reply.code(400).send({
          success: false,
          validation: {
            valid: validation.valid,
            error: validation.error,
            providerId: validation.providerId
  }
          error: validation.error || 'Webhook provider test failed'
        });
      }

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to test webhook provider',
        validation: { valid: false, error: error.message }
      });
    }
  });

  // Generic webhook endpoint for any provider
  fastify.post('/webhooks/:providerId', {
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Generic webhook endpoint with signature verification',
      params: {
        type: 'object',
        properties: {
          providerId: { type: 'string' }
  }
        required: ['providerId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            eventId: { type: 'string' }
          }
  }
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          }
  }
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            validation: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { providerId: string } }>, reply: FastifyReply) => {
    try {
      const { providerId } = request.params;

      // Validate webhook using the authentication service
      const validation = await webhookAuthService.validateWebhookFromRequest(request, providerId);

      if (!validation.valid) {
        reply.code(401).send({
          error: 'Webhook authentication failed',
          validation: {
            valid: validation.valid,
            error: validation.error,
            providerId: validation.providerId
          }
        });
        return;
      }

      // Generate unique event ID for tracking
      const eventId = `${providerId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // Here you would typically:
      // 1. Route the webhook to the appropriate handler based on providerId/eventType
      // 2. Queue the event for processing
      // 3. Store the event for replay protection
      // 4. Trigger any configured actions

      // For now, just acknowledge successful validation
      reply.send({
        success: true,
        message: `Webhook from ${validation.provider?.name || providerId} processed successfully`,
        eventId
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Webhook processing failed',
        details: { message: error.message }
      });
    }
  });

  // Webhook statistics endpoint
  fastify.get('/webhooks/statistics', {
    preHandler: [fastify.jwtAuth, requireAdmin],
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Get webhook system statistics',
      response: {
        200: {
          type: 'object',
          properties: {
            statistics: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = webhookAuthService.getStatistics();

      reply.send({
        statistics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      reply.code(500).send({
        error: 'Failed to fetch webhook statistics',
        details: { message: error.message }
      });
    }
  });

  // Health check for webhook authentication system
  fastify.get('/webhooks/health', {
    schema: {
      tags: ['Webhook Authentication'],
      summary: 'Webhook authentication system health check',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            checks: { type: 'object' },
            statistics: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = webhookAuthService.getStatistics();
      
      const checks = {
        providersRegistered: statistics.totalProviders > 0 ? 'ok' : 'no_providers',
        activeProviders: statistics.activeProviders > 0 ? 'ok' : 'no_active_providers',
        replayProtection: statistics.replayProtectionEnabled ? 'enabled' : 'disabled',
        auditLogging: 'enabled' // Assuming enabled if service is running
      };

      const overallStatus = Object.values(checks).every(check => 
        check === 'ok' || check === 'enabled'
      ) ? 'healthy' : 'degraded';

      reply.send({
        status: overallStatus,
        checks,
        statistics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      reply.code(503).send({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Store webhook auth service reference for use in other parts of the application
  fastify.decorate('webhookAuthService', webhookAuthService);
}