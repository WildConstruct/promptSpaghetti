/**
 * Rate Limiting Setup and Configuration
 * Epic 19: Authentication Enhancement & Security Hardening
 * 
 * Example setup file showing how to integrate rate limiting middleware
 */

import { FastifyInstance } from 'fastify';
import { RedisService } from '../auth/database/RedisService';
import { 
  createRateLimitPlugin, 
  RateLimitEndpoints,
  RateLimitMiddleware 
} from './rate-limit';
import { 
  RateLimitConfigurationManager,
  RateLimitConfigurationPresets 
} from '../../../packages/core/security/RateLimitConfigurationManager';
import { RateLimitPresets } from '../../../packages/core/security/RateLimiter';

/**
 * Setup rate limiting for the application
 */
export async function setupRateLimiting(
  fastify: FastifyInstance, 
  redisService?: RedisService
) {
  // Create configuration manager based on environment
  const configManager = new RateLimitConfigurationManager({
    environment: process.env.NODE_ENV as any || 'development',
    region: process.env.AWS_REGION || process.env.REGION,
    organizationId: process.env.ORG_ID,
    features: process.env.FEATURES?.split(',') || []
  });

  // Load additional profiles
  if (process.env.NODE_ENV === 'production') {
    configManager.addProfile(RateLimitConfigurationPresets.createWebAppProfile());
    configManager.addProfile(RateLimitConfigurationPresets.createAPIProfile());
  }

  // Register the rate limit plugin
  await fastify.register(createRateLimitPlugin({
    redis: redisService,
    configManager,
    enableDynamicRules: true,
    trustProxy: process.env.TRUST_PROXY === 'true',
    
    // Default configuration for all endpoints
    defaultConfig: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests, please try again later.',
      statusCode: 429
    },

    // Custom key extractor to include more context
    keyExtractor: (request) => ({
      ip: request.ip,
      userId: request.userId?.toString(),
      sessionId: request.sessionId,
      organizationId: request.organizationId,
      endpoint: request.routeOptions?.url || request.url,
      method: request.method,
      path: request.url,
      userAgent: request.headers['user-agent'],
      headers: request.headers as Record<string, string>,
      timestamp: Date.now()
    }),

    // Custom error handler
    errorHandler: (error, request, reply) => {
      console.error('Rate limit error:', {
        error: error.message,
        path: request.url,
        method: request.method,
        ip: request.ip
      });

      // Fail open - allow the request if rate limiting fails
      // In production, you might want to fail closed instead
      return;
    },

    // Custom handler when limit is reached
    onLimitReached: (request, reply, result) => {
      // Log rate limit violations
      console.warn('Rate limit exceeded:', {
        ip: request.ip,
        userId: request.userId,
        path: request.url,
        method: request.method,
        limit: result.info.totalHitsInWindow,
        resetTime: result.info.resetTime
      });

      // You could also:
      // - Send alerts for repeated violations
      // - Track violations in analytics
      // - Implement progressive penalties
      // - Trigger CAPTCHA challenges

      reply.code(429).send({
        error: 'Too Many Requests',
        message: result.error || 'Rate limit exceeded. Please try again later.',
        retryAfter: result.info.retryAfter,
        limit: request.rateLimit?.limit,
        remaining: result.info.remainingRequests,
        resetTime: result.info.resetTime,
        documentation: 'https://docs.example.com/rate-limiting'
      });
    }
  }));

  // Get the middleware instance
  const rateLimitMiddleware = fastify.rateLimit;

  // Register endpoint-specific rate limits
  rateLimitMiddleware.registerEndpoints(fastify, [
    // Authentication endpoints - very strict
    {
      path: '/auth/login',
      method: 'POST',
      config: {
        ...RateLimitPresets.authentication(),
        onLimitReached: (context, info) => {
          // Could trigger account security alerts here
          console.error('Excessive login attempts:', {
            ip: context.ip,
            userId: context.userId,
            attempts: info.totalHitsInWindow
          });
        }
      }
    },
    {
      path: '/auth/register',
      method: 'POST',
      config: RateLimitPresets.authentication()
    },
    {
      path: '/auth/password-reset/request',
      method: 'POST',
      config: RateLimitPresets.passwordReset()
    },
    {
      path: '/auth/password-reset/confirm',
      method: 'POST',
      config: RateLimitPresets.passwordReset()
    },
    {
      path: '/auth/refresh',
      method: 'POST',
      config: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 10
      }
    },
    {
      path: '/auth/change-password',
      method: 'POST',
      config: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 3 // Very restrictive for password changes
      }
    },

    // OAuth endpoints
    {
      path: '/auth/oauth',
      config: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 20
      }
    },

    // API endpoints - moderate limits
    {
      path: '/preview',
      method: 'POST',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30,
        message: 'Preview generation rate limit exceeded. Please wait before generating more previews.'
      }
    },
    {
      path: '/api/corrections',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/workspace',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/workflow',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/approval',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/locking',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/randomizer',
      config: RateLimitPresets.api()
    },
    {
      path: '/api/analytics',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 300,
        skipSuccessfulRequests: true // Only count errors
      }
    },
    {
      path: '/api/marketplace',
      config: RateLimitPresets.api()
    },

    // File upload endpoints - strict limits
    {
      path: '/api/marketplace/submissions/*/files',
      method: 'POST',
      config: RateLimitPresets.fileUpload()
    },
    {
      path: '/auth/profile/avatar',
      method: 'POST',
      config: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5, // Very restrictive for avatar uploads
        message: 'Avatar upload rate limit exceeded. Please try again later.'
      }
    },

    // WebSocket connection attempts
    {
      path: '/ws',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
        message: 'Too many WebSocket connection attempts'
      }
    },
    {
      path: '/ws/status',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100
      }
    },
    {
      path: '/ws/documents',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50
      }
    },

    // Health check endpoints - no limits
    {
      path: '/health',
      config: {
        windowMs: 1000,
        maxRequests: Number.MAX_SAFE_INTEGER
      }
    },
    {
      path: '/',
      config: {
        windowMs: 1000,
        maxRequests: Number.MAX_SAFE_INTEGER
      }
    },
    
    // Admin endpoints - restricted but higher limits for monitoring
    {
      path: '/admin/rate-limits',
      config: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50
      }
    }
  ]);

  // Add dynamic rules for special cases
  if (configManager) {
    // Strict limits for known bot user agents
    configManager.addRule({
      id: 'bot-restriction',
      name: 'Bot Rate Limiting',
      description: 'Restrict bot crawling rate',
      enabled: true,
      priority: 1000,
      conditions: [
        {
          type: 'header',
          field: 'user-agent',
          operator: 'regex',
          value: '(bot|crawler|spider|scraper)',
          caseSensitive: false
        }
      ],
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      scope: 'IP' as any,
      action: { type: 'block' },
      customMessage: 'Bot rate limit exceeded. Please respect our crawl rate.',
      logViolations: true
    });

    // Geolocation-based rules
    if (process.env.ENABLE_GEO_RULES === 'true') {
      configManager.addRule({
        id: 'high-risk-geo',
        name: 'High Risk Geography',
        description: 'Stricter limits for high-risk regions',
        enabled: true,
        priority: 900,
        conditions: [
          {
            type: 'geo',
            operator: 'in',
            values: ['XX', 'YY'] // Replace with actual country codes
          }
        ],
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50,
        scope: 'IP' as any,
        action: { type: 'block' },
        alertThreshold: 70,
        logViolations: true
      });
    }

    // Time-based rules (e.g., stricter limits during off-hours)
    configManager.addRule({
      id: 'off-hours',
      name: 'Off Hours Rate Limiting',
      description: 'Reduced limits during off hours',
      enabled: process.env.ENABLE_OFF_HOURS_LIMITS === 'true',
      priority: 500,
      conditions: [
        {
          type: 'time',
          operator: 'range',
          value: { start: '22:00', end: '06:00' }
        }
      ],
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 500, // Half the normal limit
      scope: 'USER' as any,
      action: { type: 'block' },
      schedule: {
        timezone: process.env.TZ || 'UTC',
        rules: [
          {
            days: [0, 1, 2, 3, 4, 5, 6], // All days
            startTime: '22:00',
            endTime: '06:00',
            maxRequests: 500
          }
        ]
      }
    });

    // Suspicious pattern detection
    configManager.addRule({
      id: 'suspicious-pattern',
      name: 'Suspicious Activity',
      description: 'Detect and limit suspicious request patterns',
      enabled: true,
      priority: 2000,
      conditions: [
        {
          type: 'header',
          field: 'user-agent',
          operator: 'equals',
          value: ''
        },
        {
          type: 'header',
          field: 'accept',
          operator: 'exists',
          negate: true
        }
      ],
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20,
      scope: 'IP' as any,
      action: { type: 'block' },
      customMessage: 'Suspicious request pattern detected',
      alertThreshold: 50,
      logViolations: true
    });
  }

  // Setup monitoring endpoint for rate limit stats
  fastify.get('/admin/rate-limits/stats', {
    preHandler: [
      // Add authentication middleware here
      // fastify.authenticate,
      // fastify.authorize({ role: 'admin' })
    ]
  }, async (request, reply) => {
    const stats = await rateLimitMiddleware.getStats();
    return {
      ...stats,
      profiles: configManager.getAllProfiles().map(p => ({
        id: p.id,
        name: p.name,
        rulesCount: p.rules.length,
        active: configManager.getActiveProfile()?.id === p.id
      }))
    };
  });

  // Setup endpoint to view current rules
  fastify.get('/admin/rate-limits/rules', {
    preHandler: [
      // Add authentication middleware here
    ]
  }, async (request, reply) => {
    const activeProfile = configManager.getActiveProfile();
    return {
      activeProfile: activeProfile?.id,
      rules: activeProfile?.rules || []
    };
  });

  console.log('Rate limiting middleware configured successfully');
}

/**
 * Example of how to use in your main server file:
 * 
 * import { setupRateLimiting } from './middleware/rate-limit-setup';
 * 
 * // In your server initialization:
 * const redisService = new RedisService(redisConfig);
 * await redisService.connect();
 * 
 * await setupRateLimiting(fastify, redisService);
 */