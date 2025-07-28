/**
 * Rate Limiting Middleware for Fastify
 * Epic 19: Authentication Enhancement & Security Hardening
 * 
 * Integrates with the existing rate limiting system from packages/core/security
 * Provides flexible endpoint-specific rate limiting with Redis fallback
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { 
  RateLimiter, 
  RateLimitConfig, 
  RateLimitContext,
  RateLimitResult,
  RateLimitPresets,
  RateLimitKeyGenerator,
  RateLimitUtils
} from '../../../packages/core/security/RateLimiter';
import { 
  RedisRateLimitStore, 
  RedisClient 
} from '../../../packages/core/security/RedisRateLimitStore';
import { 
  RateLimitConfigurationManager,
  DynamicRateLimitRule
} from '../../../packages/core/security/RateLimitConfigurationManager';
import { RedisService } from '../auth/database/RedisService';

// ========================================
// Types and Interfaces
// ========================================

}
export interface RateLimitMiddlewareConfig {
  redis?: RedisService;
  configManager?: RateLimitConfigurationManager;
  defaultConfig?: Partial<RateLimitConfig>;
  enableDynamicRules?: boolean;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  trustProxy?: boolean;
  keyExtractor?: (request: FastifyRequest) => RateLimitContext;
  onLimitReached?: (request: FastifyRequest, reply: FastifyReply, result: RateLimitResult) => void;
  errorHandler?: (error: Error, request: FastifyRequest, reply: FastifyReply) => void;
}
}

}
export interface EndpointRateLimitConfig {
  path: string;
  method?: string | string[];
  config: Partial<RateLimitConfig>;
}
}

// Augment Fastify request to include rate limit info
declare module 'fastify' {
  interface FastifyRequest {
    rateLimit?: {
      limit: number;
      remaining: number;
      resetTime: Date;
      exceeded: boolean;
}
    };
    userId?: string | number;
    sessionId?: string;
    organizationId?: string;
  }
}

// ========================================
// Redis Client Adapter
// ========================================

class RedisClientAdapter implements RedisClient {
  constructor(private redisService: RedisService) {}

  async get(key: string): Promise<string | null> {

    return this.redisService.get(key);
  }

  async set(key: string, value: string, options?: { EX?: number; PX?: number }): Promise<string | null> {

    if (options?.EX) {
      await this.redisService.setex(key, options.EX, value);
    } else if (options?.PX) {
      await this.redisService.setex(key, Math.ceil(options.PX / 1000), value);
    } else {
      await this.redisService.set(key, value);
    }
    return 'OK';
  }

  async incr(key: string): Promise<number> {

    return this.redisService.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {

    await this.redisService.expire(key, seconds);
    return 1;
  }

  async pexpire(key: string, milliseconds: number): Promise<number> {

    await this.redisService.expire(key, Math.ceil(milliseconds / 1000));
    return 1;
  }

  async ttl(key: string): Promise<number> {

    return this.redisService.ttl(key);
  }

  async del(key: string): Promise<number> {

    await this.redisService.del(key);
    return 1;
  }

  async eval(script: string, keys: string[], args: string[]): Promise<unknown> {

    const client = this.redisService.getClient();
    return client.eval(script, keys.length, ...keys, ...args);
  }

  async ping(): Promise<string> {

    const healthy = await this.redisService.healthCheck();
    return healthy ? 'PONG' : '';
  }

  async quit(): Promise<string> {

    await this.redisService.close();
    return 'OK';
  }

  async *scanStream(options?: { match?: string; count?: number }): AsyncIterable<string[]> {
    const client = this.redisService.getClient();
    const stream = client.scanStream(options);
    
    for await (const keys of stream) {
      yield keys;
    }
  }
}

// ========================================
// Rate Limit Middleware Factory
// ========================================

export class RateLimitMiddleware {
  private limiters: Map<string, RateLimiter> = new Map();
  private configManager?: RateLimitConfigurationManager;
  private redisStore?: RedisRateLimitStore;
  private defaultKeyExtractor: (request: FastifyRequest) => RateLimitContext;

  constructor(private config: RateLimitMiddlewareConfig = {}) {
    // Setup Redis store if Redis service is provided
    if (config.redis) {
      const redisClient = new RedisClientAdapter(config.redis);
      this.redisStore = new RedisRateLimitStore({
        client: redisClient,
        keyPrefix: 'rate_limit:',
        enableScripting: true,
        fallbackToMemory: true
      });
    }

    // Use provided config manager or create a default one
    this.configManager = config.configManager || new RateLimitConfigurationManager({
      environment: process.env.NODE_ENV as any || 'development',
      region: process.env.REGION,
      features: []
    });

    // Setup default key extractor
    this.defaultKeyExtractor = config.keyExtractor || this.createDefaultKeyExtractor();
  }

  /**
   * Create default key extractor that extracts context from request
   */
  private createDefaultKeyExtractor(): (request: FastifyRequest) => RateLimitContext {
    return (request: FastifyRequest): RateLimitContext => {
      // Extract IP address
      const ip = this.extractIP(request);

      // Extract user ID from request (could be set by auth middleware)
      const userId = request.userId?.toString();

      // Extract session ID
      const sessionId = request.sessionId;

      // Extract organization ID
      const organizationId = request.organizationId;

      // Build context
      return {
        ip,
        userId,
        sessionId,
        organizationId,
        endpoint: request.routeOptions?.url || request.url,
        method: request.method,
        path: request.url,
        userAgent: request.headers['user-agent'],
        headers: request.headers as Record<string, string>,
        timestamp: Date.now(};
    };
  }

  /**
   * Extract IP address from request, respecting proxy headers
   */
  private extractIP(request: FastifyRequest): string {
    if (this.config.trustProxy) {
      // Try to extract from proxy headers
      const proxyIP = RateLimitUtils.extractIP(request.headers as Record<string, string>);
      if (proxyIP) return proxyIP;
    }

    // Fallback to request IP
    return request.ip || 'unknown';
  }

  /**
   * Get or create rate limiter for specific configuration
   */
  private getRateLimiter(configKey: string, config: Partial<RateLimitConfig>): RateLimiter {
    let limiter = this.limiters.get(configKey);
    
    if (!limiter) {
      // Add Redis store if available
      if (this.redisStore) {
        config.store = this.redisStore;
      }

      // Merge with default config
      const finalConfig = {
        ...this.config.defaultConfig,
        ...config
      };

      limiter = new RateLimiter(finalConfig);
      this.limiters.set(configKey, limiter);
    }

    return limiter;
  }

  /**
   * Create middleware for a specific endpoint
   */
  createEndpointMiddleware(endpointConfig: Partial<RateLimitConfig> | string) {
    // Handle preset configurations
    const config = typeof endpointConfig === 'string' 
      ? (RateLimitPresets as any)[endpointConfig]()
      : endpointConfig;

    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check if dynamic rules are enabled
        if (this.config.enableDynamicRules && this.configManager) {
          const context = this.defaultKeyExtractor(request);
          const matchingRules = this.configManager.findMatchingRules(context);

          if (matchingRules.length > 0) {
            // Use the highest priority rule
            const rule = matchingRules[0];
            const dynamicConfig = this.configManager.createRateLimitConfig(rule);
            return this.applyRateLimit(request, reply, dynamicConfig, `dynamic:${rule.id}`);
          }
        }

        // Apply static configuration
        return this.applyRateLimit(request, reply, config, 'static:endpoint');
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        
        // Call error handler if provided
        if (this.config.errorHandler) {
          return this.config.errorHandler(error as Error, request, reply);
        }

        // Default: fail open (allow request)
        return;
      }
    };
  }

  /**
   * Apply rate limiting logic
   */
  private async applyRateLimit(
    request: FastifyRequest, 
    reply: FastifyReply, 
    config: Partial<RateLimitConfig>,
    configKey: string
  ) {
    // Skip based on request outcome if configured
    if (this.config.skipFailedRequests && reply.statusCode >= 400) return;
    if (this.config.skipSuccessfulRequests && reply.statusCode < 400) return;

    // Get rate limiter
    const limiter = this.getRateLimiter(configKey, config);

    // Extract context
    const context = this.defaultKeyExtractor(request);

    // Check rate limit
    const result = await limiter.checkLimit(context);

    // Add rate limit info to request
    request.rateLimit = {
      limit: config.maxRequests || 100,
      remaining: result.info.remainingRequests,
      resetTime: result.info.resetTime,
      exceeded: result.info.exceeded
    };

    // Set headers
    Object.entries(result.headers).forEach(([header, value]) => {
      reply.header(header, value);
    });

    // Handle limit exceeded
    if (!result.allowed) {
      // Call custom handler if provided
      if (this.config.onLimitReached) {
        return this.config.onLimitReached(request, reply, result);
      }

      // Default response
      reply.code(config.statusCode || 429).send({
        error: 'Too Many Requests',
        message: result.error || 'Rate limit exceeded',
        retryAfter: result.info.retryAfter,
        limit: config.maxRequests,
        remaining: result.info.remainingRequests,
        resetTime: result.info.resetTime
      });
    }
  }

  /**
   * Create global rate limit middleware
   */
  createGlobalMiddleware(config?: Partial<RateLimitConfig>) {
    const finalConfig = config || this.config.defaultConfig || RateLimitPresets.api();
    
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip health checks and metrics endpoints
      if (request.url === '/health' || request.url === '/metrics') {
        return;
      }

      return this.createEndpointMiddleware(finalConfig)(request, reply);
    };
  }

  /**
   * Register multiple endpoint-specific rate limits
   */
  registerEndpoints(fastify: FastifyInstance, endpoints: EndpointRateLimitConfig[]) {
    endpoints.forEach(endpoint => {
      const middleware = this.createEndpointMiddleware(endpoint.config);
      
      // Register for specific methods if provided
      if (endpoint.method) {
        const methods = Array.isArray(endpoint.method) ? endpoint.method : [endpoint.method];
        
        methods.forEach(method => {
          fastify.addHook('preHandler', async (request, reply) => {
            if (request.method === method.toUpperCase() && 
                (request.routeOptions?.url === endpoint.path || request.url.startsWith(endpoint.path))) {
              await middleware(request, reply);
            }
          });
        });
      } else {
        // Register for all methods
        fastify.addHook('preHandler', async (request, reply) => {
          if (request.routeOptions?.url === endpoint.path || request.url.startsWith(endpoint.path)) {
            await middleware(request, reply);
          }
        });
      }
    });
  }

  /**
   * Get statistics about rate limiting
   */
  async getStats() {
    const stats: Record<string, unknown> = {
      limiters: this.limiters.size,
      redis: {
        available: false,
        totalKeys: 0,
        fallbackKeys: 0
      }
    };

    if (this.redisStore) {
      const redisStats = await this.redisStore.getStats();
      stats.redis = redisStats;
    }

    return stats;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.redisStore) {
      await this.redisStore.cleanup();
      await this.redisStore.close();
    }

    for (const limiter of this.limiters.values()) {
      await limiter.cleanup();
    }

    this.limiters.clear();
  }
}

// ========================================
// Fastify Plugin
// ========================================

export function createRateLimitPlugin(config: RateLimitMiddlewareConfig = {}) {
  return async function rateLimitPlugin(fastify: FastifyInstance, options: Record<string, unknown>) {
    const middleware = new RateLimitMiddleware(config);

    // Decorate Fastify instance with rate limit methods
    fastify.decorate('rateLimit', middleware);
    fastify.decorate('rateLimitEndpoint', (endpointConfig: Partial<RateLimitConfig>) => {
      return middleware.createEndpointMiddleware(endpointConfig);
    });

    // Add cleanup hook
    fastify.addHook('onClose', async () => {
      await middleware.cleanup();
    });

    // Register global middleware if default config is provided
    if (config.defaultConfig) {
      fastify.addHook('preHandler', middleware.createGlobalMiddleware());
    }
  };
}

// ========================================
// Preset Configurations
// ========================================


// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    rateLimit: RateLimitMiddleware;
    rateLimitEndpoint: (config: Partial<RateLimitConfig>) => ReturnType<RateLimitMiddleware['createEndpointMiddleware']>;
}
  }
}

export default RateLimitMiddleware;