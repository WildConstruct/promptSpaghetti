/**
 * Referrer Policy Plugin - Epic 19 Implementation
 * Fastify plugin for referrer policy middleware integration
 */

import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { ReferrerPolicyService } from '../middleware/referrer-policy';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

export interface ReferrerPolicyPluginOptions {
  enabled?: boolean;
  defaultPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  strictMode?: boolean;
  enableReporting?: boolean;
  maxViolationHistory?: number;
  cacheTimeout?: number;
}

async function referrerPolicyPlugin(
  fastify: FastifyInstance,
  options: ReferrerPolicyPluginOptions = {}
) {
  // Initialize services (these would typically be injected or retrieved from the app context)
  const db = new DatabaseService();
  const redis = new RedisService();
  
  // Create referrer policy service with configuration
  const referrerPolicyService = new ReferrerPolicyService(db, redis, {
    defaultPolicy: options.defaultPolicy || 'strict-origin-when-cross-origin',
    strictModeDefault: options.strictMode !== false,
    enableReporting: options.enableReporting !== false,
    maxViolationHistory: options.maxViolationHistory || 10000,
    cacheTimeout: options.cacheTimeout || 3600
  });

  // Register the service for dependency injection
  fastify.decorate('referrerPolicyService', referrerPolicyService);

  // Add type declarations
  declare module 'fastify' {
    interface FastifyInstance {
      referrerPolicyService: ReferrerPolicyService;
    }
  }

  // Register the middleware if enabled
  if (options.enabled !== false) {
    await fastify.register(async function (fastify) {
      fastify.addHook('onRequest', referrerPolicyService.middleware());
    });
  }

  // Register API routes for policy management
  await fastify.register(async function (fastify) {
    // Create new policy configuration
    fastify.post('/api/referrer-policy/configs', async (request, reply) => {
      try {
        const configData = request.body as any;
        const result = await referrerPolicyService.createPolicyConfig({
          ...configData,
          createdBy: (request as any).user?.id || 'system'
        });
        
        if (result.success) {
          reply.status(201).send(result);
        } else {
          reply.status(400).send(result);
        }
      } catch (error) {
        reply.status(500).send({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    // Update existing policy configuration
    fastify.put('/api/referrer-policy/configs/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const updates = request.body as any;
        
        const result = await referrerPolicyService.updatePolicyConfig(id, {
          ...updates,
          lastModifiedBy: (request as any).user?.id || 'system'
        });
        
        if (result.success) {
          reply.send(result);
        } else {
          reply.status(400).send(result);
        }
      } catch (error) {
        reply.status(500).send({
          success: false,
          message: 'Internal server error'
        });
      }
    });

    // Get policy statistics
    fastify.get('/api/referrer-policy/statistics', async (request, reply) => {
      try {
        const query = request.query as any;
        const timeRange = {
          start: query.start ? new Date(query.start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: query.end ? new Date(query.end) : new Date()
        };
        
        const filters = {
          configIds: query.configIds?.split(','),
          paths: query.paths?.split(','),
          policies: query.policies?.split(','),
          severities: query.severities?.split(',')
        };

        const statistics = await referrerPolicyService.getStatistics(timeRange, filters);
        reply.send(statistics);
      } catch (error) {
        reply.status(500).send({
          error: 'Failed to get statistics',
          message: error.message
        });
      }
    });

    // Get policy recommendations
    fastify.get('/api/referrer-policy/recommendations', async (request, reply) => {
      try {
        const query = request.query as any;
        const timeRange = {
          start: query.start ? new Date(query.start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: query.end ? new Date(query.end) : new Date()
        };

        const recommendations = await referrerPolicyService.getPolicyRecommendations(timeRange);
        reply.send({ recommendations });
      } catch (error) {
        reply.status(500).send({
          error: 'Failed to get recommendations',
          message: error.message
        });
      }
    });

    // Health check endpoint
    fastify.get('/api/referrer-policy/health', async (request, reply) => {
      reply.send({
        status: 'healthy',
        service: 'referrer-policy',
        timestamp: new Date(),
        version: '1.0.0'
      });
    });
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    referrerPolicyService.destroy();
  });
}

export default fp(referrerPolicyPlugin, {
  name: 'referrer-policy',
  dependencies: []
});