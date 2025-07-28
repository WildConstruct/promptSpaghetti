/**
 * Challenge Routes
 * Task: T-1752989143997-935 - Integrate CAPTCHA service (reCAPTCHA, hCaptcha)
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChallengeService } from '../services/ChallengeService';
import { ChallengeMiddleware } from '../middleware/ChallengeMiddleware';
import { 
  ChallengeType, 
  ChallengeDifficulty,
  ChallengeConfig
} from '../types';
import { z } from 'zod';

// ========================================
// Request/Response Schemas
// ========================================

const GenerateChallengeSchema = z.object({
  type: z.nativeEnum(ChallengeType).optional(),
  difficulty: z.nativeEnum(ChallengeDifficulty).optional(),
  context: z.object({
    action: z.string(),
    resource: z.string().optional()
  }).optional()
});

const ValidateChallengeSchema = z.object({
  challengeId: z.string(),
  solution: z.string()
});

const RefreshChallengeSchema = z.object({
  challengeId: z.string()
});

// ========================================
// Route Registration
// ========================================

export async function challengeRoutes(fastify: FastifyInstance) {
  // Initialize challenge service
  const challengeConfig: ChallengeConfig = {
    providers: {
      recaptcha: {
        siteKey: process.env.RECAPTCHA_SITE_KEY || '',
        secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
        v2Enabled: process.env.RECAPTCHA_V2_ENABLED === 'true',
        v3Enabled: process.env.RECAPTCHA_V3_ENABLED === 'true',
        v3Threshold: parseFloat(process.env.RECAPTCHA_V3_THRESHOLD || '0.5')
  }
      hcaptcha: {
        siteKey: process.env.HCAPTCHA_SITE_KEY || '',
        secretKey: process.env.HCAPTCHA_SECRET_KEY || '',
        enabled: process.env.HCAPTCHA_ENABLED === 'true'
  }
      custom: {
        enabled: true,
        difficulty: ChallengeDifficulty.MEDIUM,
        maxAttempts: parseInt(process.env.CHALLENGE_MAX_ATTEMPTS || '3'),
        expiryMinutes: parseInt(process.env.CHALLENGE_EXPIRY_MINUTES || '10')
      }
  }
    rules: [],
    escalation: {
      enabled: process.env.CHALLENGE_ESCALATION_ENABLED === 'true',
      thresholds: {
        failedAttempts: parseInt(process.env.CHALLENGE_ESCALATION_ATTEMPTS || '3'),
        timeWindow: parseInt(process.env.CHALLENGE_ESCALATION_WINDOW || '300'),
        escalateAfter: parseInt(process.env.CHALLENGE_ESCALATE_AFTER || '5')
      }
  }
    progressive: {
      enabled: process.env.CHALLENGE_PROGRESSIVE_ENABLED === 'true',
      stages: [
        {
          stage: 1,
          challengeType: ChallengeType.MATH_PUZZLE,
          difficulty: ChallengeDifficulty.EASY,
          triggerConditions: {
            failedAttempts: 1,
            timeWindow: 300
  }
          escalationDelay: 0
  }
        {
          stage: 2,
          challengeType: ChallengeType.TEXT_CAPTCHA,
          difficulty: ChallengeDifficulty.MEDIUM,
          triggerConditions: {
            failedAttempts: 3,
            timeWindow: 600
  }
          escalationDelay: 60
  }
        {
          stage: 3,
          challengeType: ChallengeType.RECAPTCHA_V2,
          difficulty: ChallengeDifficulty.HARD,
          triggerConditions: {
            failedAttempts: 5,
            timeWindow: 900
  }
          escalationDelay: 300
        }
      ]
    }
  };

  const challengeService = new ChallengeService(challengeConfig);

  // Initialize middleware
  const challengeMiddleware = new ChallengeMiddleware({
    challengeService,
    rules: [
      {
        path: '/auth/login',
        method: 'POST',
        challengeType: ChallengeType.MATH_PUZZLE,
        skipAuth: false,
        riskThreshold: 0.3,
        conditions: [
          {
            type: 'failedAttempts',
            threshold: 3
          }
        ]
  }
      {
        path: '/auth/register',
        method: 'POST',
        challengeType: ChallengeType.TEXT_CAPTCHA,
        difficulty: ChallengeDifficulty.MEDIUM,
        skipAuth: false,
        riskThreshold: 0.2
  }
      {
        path: '/auth/password-reset',
        method: 'POST',
        challengeType: ChallengeType.RECAPTCHA_V2,
        skipAuth: false,
        riskThreshold: 0.1
  }
      {
        path: /^\/api\/sensitive/,
        challengeType: ChallengeType.RECAPTCHA_V3,
        skipAuth: true,
        riskThreshold: 0.5
      }
    ],
    defaultChallenge: {
      type: ChallengeType.TEXT_CAPTCHA,
      difficulty: ChallengeDifficulty.MEDIUM
  }
    bypassTokens: process.env.CHALLENGE_BYPASS_TOKENS?.split(',') || [],
    trustProxy: process.env.TRUST_PROXY === 'true'
  });

  // Apply middleware to protected routes
  fastify.addHook('preHandler', challengeMiddleware.middleware());

  // Challenge generation endpoint
  fastify.post('/challenge/generate', {
    schema: {
      body: GenerateChallengeSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            challenge: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                data: { type: 'object' },
                expiresAt: { type: 'string' },
                maxAttempts: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, challengeMiddleware.generateChallengeRoute());

  // Challenge validation endpoint
  fastify.post('/challenge/validate', {
    schema: {
      body: ValidateChallengeSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            valid: { type: 'boolean' },
            token: { type: 'string' },
            message: { type: 'string' }
          }
  }
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            valid: { type: 'boolean' },
            error: { type: 'string' },
            remainingAttempts: { type: 'number' },
            escalationRequired: { type: 'boolean' }
          }
        }
      }
    }
  }, challengeMiddleware.validateChallengeRoute());

  // Challenge refresh endpoint
  fastify.post('/challenge/refresh', {
    schema: {
      body: RefreshChallengeSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { challengeId } = request.body as z.infer<typeof RefreshChallengeSchema>;
      
      const newChallenge = await challengeService.refreshChallenge(challengeId);
      
      reply.send({
        success: true,
        challenge: {
          id: newChallenge.id,
          type: newChallenge.type,
          data: newChallenge.challenge,
          expiresAt: newChallenge.expiresAt,
          maxAttempts: newChallenge.maxAttempts
        }
      });
    } catch (error) {
      request.log.error('Challenge refresh error:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh challenge'
      });
    }
  });

  // Get challenge configuration (for client-side integration)
  fastify.get('/challenge/config', async (request: FastifyRequest, reply: FastifyReply) => {
    const config = {
      providers: {
        recaptcha: {
          v2Enabled: challengeConfig.providers.recaptcha?.v2Enabled,
          v3Enabled: challengeConfig.providers.recaptcha?.v3Enabled,
          siteKey: challengeConfig.providers.recaptcha?.siteKey
  }
        hcaptcha: {
          enabled: challengeConfig.providers.hcaptcha?.enabled,
          siteKey: challengeConfig.providers.hcaptcha?.siteKey
        }
  }
      types: Object.values(ChallengeType),
      difficulties: Object.values(ChallengeDifficulty)
    };

    reply.send({
      success: true,
      config
    });
  });

  // Get challenge statistics (admin endpoint)
  fastify.get('/challenge/stats', {
    preHandler: async (request, reply) => {
      // Add admin authentication check here
      // For now, just check for admin header
      if (request.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) {
        reply.status(403).send({ error: 'Unauthorized' });
        return;
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await challengeService.getStats();
      
      reply.send({
        success: true,
        stats
      });
    } catch (error) {
      request.log.error('Stats retrieval error:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve statistics'
      });
    }
  });

  // Health check for challenge service
  fastify.get('/challenge/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const health = {
      status: 'healthy',
      providers: {
        recaptcha: {
          v2: !!challengeConfig.providers.recaptcha?.v2Enabled,
          v3: !!challengeConfig.providers.recaptcha?.v3Enabled,
          configured: !!(challengeConfig.providers.recaptcha?.siteKey && challengeConfig.providers.recaptcha?.secretKey)
  }
        hcaptcha: {
          enabled: !!challengeConfig.providers.hcaptcha?.enabled,
          configured: !!(challengeConfig.providers.hcaptcha?.siteKey && challengeConfig.providers.hcaptcha?.secretKey)
  }
        custom: {
          enabled: !!challengeConfig.providers.custom?.enabled
        }
  }
      features: {
        escalation: !!challengeConfig.escalation.enabled,
        progressive: !!challengeConfig.progressive.enabled
      }
    };

    reply.send(health);
  });
}

export default challengeRoutes;