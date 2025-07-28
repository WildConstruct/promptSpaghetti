/**
 * Consent Enforcement Plugin for Fastify
 * Integrates consent enforcement middleware with the Fastify server
 */

import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ConsentEnforcementMiddleware } from '../middleware/consent-enforcement';
import { ConsentBasedDataFilterService } from '../services/ConsentBasedDataFilterService';
import { ConsentCollectionService } from '../services/ConsentCollectionService';

}
interface ConsentEnforcementPluginOptions extends FastifyPluginOptions {
  enableStrict?: boolean;
  enableCookieEnforcement?: boolean;
  enableCrossServicePropagation?: boolean;
  exemptPaths?: string[];
}

async function consentEnforcementPlugin(
  fastify: FastifyInstance,
  options: ConsentEnforcementPluginOptions
): Promise<void> {

  const {
    enableStrict = true,
    enableCookieEnforcement = true,
    enableCrossServicePropagation = true,
    exemptPaths = []
  } = options;

  // Initialize consent services
  const consentFilterService = new ConsentBasedDataFilterService();
  const consentCollectionService = new ConsentCollectionService();

  // Create consent enforcement middleware
  const consentMiddleware = new ConsentEnforcementMiddleware(
    consentFilterService,
    consentCollectionService
  );

  // Add custom exempt paths
  exemptPaths.forEach(path => {
    (consentMiddleware as any).exemptPaths.add(path);
  });

  // Register main consent enforcement middleware
  await fastify.addHook('preHandler', consentMiddleware.createMiddleware());

  // Register cookie enforcement if enabled
  if (enableCookieEnforcement) {
    await fastify.addHook('onRequest', async (request, reply) => {
      consentMiddleware.enforceCookieConsent(request, reply);
    });
  }

  // Register consent management routes
  fastify.register(async function (fastify) {
    // Get consent enforcement statistics
    fastify.get('/api/admin/consent/enforcement/stats', async (request, reply) => {
      try {
        const stats = consentMiddleware.getEnforcementStats();
        return reply.send({
          success: true,
          data: stats
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: 'Failed to get enforcement statistics'
        });
      }
    });

    // Add new enforcement rule
    fastify.post('/api/admin/consent/enforcement/rules', async (request, reply) => {
      try {
        const rule = request.body as any;
        consentMiddleware.addEnforcementRule(rule);
        
        return reply.send({
          success: true,
          message: 'Enforcement rule added successfully'
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: 'Failed to add enforcement rule'
        });
      }
    });

    // Remove enforcement rule
    fastify.delete('/api/admin/consent/enforcement/rules/:ruleId', async (request, reply) => {
      try {
        const { ruleId } = request.params as { ruleId: string };
        consentMiddleware.removeEnforcementRule(ruleId);
        
        return reply.send({
          success: true,
          message: 'Enforcement rule removed successfully'
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: 'Failed to remove enforcement rule'
        });
      }
    });

    // Handle consent change propagation
    if (enableCrossServicePropagation) {
      fastify.post('/api/consent/propagate', async (request, reply) => {
        try {
          const { userId, consentType, granted } = request.body as {
            userId: string;
            consentType: string;
            granted: boolean;
          };

          await consentMiddleware.propagateConsentChange(userId, consentType, granted);
          
          return reply.send({
            success: true,
            message: 'Consent change propagated successfully'
          });
        } catch (error) {
          return reply.code(500).send({
            success: false,
            error: 'Failed to propagate consent change'
          });
        }
      });
    }
  });

  // Decorate fastify with consent enforcement utilities
  fastify.decorate('consentEnforcement', {
    middleware: consentMiddleware,
    checkConsent: async (userId: string, consentType: string) => {
      // Utility method for checking consent
      const userConsents = await consentCollectionService.getUserConsent(userId);
      return userConsents?.consents?.[consentType]?.granted || false;
  }
    propagateConsentChange: async (userId: string, consentType: string, granted: boolean) => {
      return consentMiddleware.propagateConsentChange(userId, consentType, granted);
    }
  });

  fastify.log.info('Consent enforcement plugin registered successfully');
}

export default fp(consentEnforcementPlugin, {
  fastify: '4.x',
  name: 'consent-enforcement'
});

// Type augmentation for Fastify
declare module 'fastify' {
  export interface FastifyInstance {
    consentEnforcement: {
      middleware: ConsentEnforcementMiddleware;
      checkConsent: (userId: string, consentType: string) => Promise<boolean>;
      propagateConsentChange: (userId: string, consentType: string, granted: boolean) => Promise<void>;
}
    };
  }
}