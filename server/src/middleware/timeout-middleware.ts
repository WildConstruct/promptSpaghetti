/**
 * Timeout Middleware for Fastify
 * 
 * Provides request-level timeout management with automatic operation
 * categorization and integration with the TimeoutManager service.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getTimeoutManager } from '../services/TimeoutManager';

}
}
export interface TimeoutMiddlewareConfig {
  // Default timeouts by route pattern
  routeTimeouts: {
    [pattern: string]: {
      operationType: string;
      operationSubtype: string;
      timeout?: number;
}
}
    };
  };
  
  // Global timeout settings
  defaultTimeout: number;
  enableRequestTracking: boolean;
  enableMetricsCollection: boolean;
  
  // Headers to extract operation context
  operationHeaders: {
    sessionId: string;
    userId: string;
    operationId: string;
  };
}

}
}
export interface RequestTimeoutContext {
  operationId: string;
  operationType: string;
  operationSubtype: string;
  startTime: number;
  timeoutManager: ReturnType<typeof getTimeoutManager>;
}
}
}

declare module 'fastify' {
  interface FastifyRequest {
    timeoutContext?: RequestTimeoutContext;
}
}
  }
}

const defaultConfig: TimeoutMiddlewareConfig = {
  routeTimeouts: {
    '/preview': {
      operationType: 'api',
      operationSubtype: 'export',
      timeout: 30000
  }
    '/auth/login': {
      operationType: 'auth',
      operationSubtype: 'login'
  }
    '/auth/register': {
      operationType: 'auth',
      operationSubtype: 'register'
  }
    '/auth/password-reset': {
      operationType: 'auth',
      operationSubtype: 'passwordReset'
  }
    '/auth/refresh': {
      operationType: 'auth',
      operationSubtype: 'tokenRefresh'
  }
    '/auth/verify-captcha': {
      operationType: 'auth',
      operationSubtype: 'captcha'
  }
    '/auth/verify-2fa': {
      operationType: 'auth',
      operationSubtype: 'twoFactor'
  }
    '/api/workspace': {
      operationType: 'database',
      operationSubtype: 'query'
  }
    '/api/workflow': {
      operationType: 'database',
      operationSubtype: 'transaction'
  }
    '/api/corrections': {
      operationType: 'database',
      operationSubtype: 'query'
  }
    '/api/randomizer': {
      operationType: 'api',
      operationSubtype: 'export'
  }
    '/api/analytics': {
      operationType: 'database',
      operationSubtype: 'query'
  }
    '/api/marketplace': {
      operationType: 'api',
      operationSubtype: 'authentication'
  }
    '/health': {
      operationType: 'database',
      operationSubtype: 'query'
    }
  }
  defaultTimeout: 30000,
  enableRequestTracking: true,
  enableMetricsCollection: true,
  operationHeaders: {
    sessionId: 'x-session-id',
    userId: 'x-user-id',
    operationId: 'x-operation-id'
  }
};

/**
 * Create timeout middleware for Fastify
 */
export function createTimeoutMiddleware(config?: Partial<TimeoutMiddlewareConfig>) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async function timeoutMiddleware(
    fastify: FastifyInstance,
    options: Record<string, unknown>
  ) {
    const timeoutManager = getTimeoutManager();

    // Add timeout context to request
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      const operationContext = getOperationContext(request, finalConfig);
      
      request.timeoutContext = {
        operationId: operationContext.operationId,
        operationType: operationContext.operationType,
        operationSubtype: operationContext.operationSubtype,
        startTime: Date.now(),
        timeoutManager
      };

      // Set request timeout if configured
      if (operationContext.timeout) {
        request.setTimeout(operationContext.timeout, () => {
          reply.status(408).send({
            error: 'Request timeout',
            operationType: operationContext.operationType,
            operationSubtype: operationContext.operationSubtype,
            timeout: operationContext.timeout
          });
        });
      }
    });

    // Track request completion metrics
    fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.timeoutContext && finalConfig.enableMetricsCollection) {
        const duration = Date.now() - request.timeoutContext.startTime;
        const success = reply.statusCode < 400;
        
        // Record metrics in timeout manager
                
        // We'll track this through the timeout manager's internal metrics
        // when operations are executed through executeWithTimeout
        
        if (request.log) {
          request.log.info({
            operationId: request.timeoutContext.operationId,
            operationType: request.timeoutContext.operationType,
            operationSubtype: request.timeoutContext.operationSubtype,
            duration,
            success,
            statusCode: reply.statusCode
          }, 'Request completed');
        }
      }
    });

    // Add timeout utility methods to request
    fastify.decorateRequest('executeWithTimeout', function(
      this: FastifyRequest,
      operation: () => Promise<any>
    ) {
      if (!this.timeoutContext) {
        throw new Error('Timeout context not initialized');
      }

      return this.timeoutContext.timeoutManager.executeWithTimeout(
        operation,
        this.timeoutContext.operationType as any,
        this.timeoutContext.operationSubtype,
        this.timeoutContext.operationId
      );
    });

    fastify.decorateRequest('executeWithFallback', function(
      this: FastifyRequest,
      primaryOperation: () => Promise<any>,
      fallbackOperation: () => Promise<any>
    ) {
      if (!this.timeoutContext) {
        throw new Error('Timeout context not initialized');
      }

      return this.timeoutContext.timeoutManager.executeWithFallback(
        primaryOperation,
        fallbackOperation,
        this.timeoutContext.operationType as any,
        this.timeoutContext.operationSubtype
      );
    });

    fastify.decorateRequest('cancelOperation', function(this: FastifyRequest) {
      if (!this.timeoutContext) {
        return false;
      }

      return this.timeoutContext.timeoutManager.cancelOperation(
        this.timeoutContext.operationId
      );
    });
  };
}

/**
 * Get operation context from request
 */
function getOperationContext(
  request: FastifyRequest,
  config: TimeoutMiddlewareConfig
): {
  operationId: string;
  operationType: string;
  operationSubtype: string;
  timeout?: number;
} {
  // Extract headers
  const sessionId = request.headers[config.operationHeaders.sessionId] as string;
  const userId = request.headers[config.operationHeaders.userId] as string;
  const operationId = (request.headers[config.operationHeaders.operationId] as string) ||
    `${request.method}_${request.url}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Find matching route configuration
  const routeConfig = findRouteConfig(request.url, config.routeTimeouts);
  
  if (routeConfig) {
    return {
      operationId,
      operationType: routeConfig.operationType,
      operationSubtype: routeConfig.operationSubtype,
      timeout: routeConfig.timeout
    };
  }

  // Default to API operation
  return {
    operationId,
    operationType: 'api',
    operationSubtype: categorizeOperation(request),
    timeout: config.defaultTimeout
  };
}

/**
 * Find route configuration by URL pattern matching
 */
function findRouteConfig(
  url: string,
  routeTimeouts: TimeoutMiddlewareConfig['routeTimeouts']
): TimeoutMiddlewareConfig['routeTimeouts'][string] | null {
  // Exact match first
  if (routeTimeouts[url]) {
    return routeTimeouts[url];
  }

  // Pattern matching
  for (const [pattern, config] of Object.entries(routeTimeouts)) {
    if (url.startsWith(pattern)) {
      return config;
    }
  }

  return null;
}

/**
 * Categorize operation based on request characteristics
 */
function categorizeOperation(request: FastifyRequest): string {
  const method = request.method.toLowerCase();
  const url = request.url;

  // Authentication operations
  if (url.includes('/auth/')) {
    if (url.includes('/login')) return 'login';
    if (url.includes('/register')) return 'register';
    if (url.includes('/password')) return 'passwordReset';
    if (url.includes('/refresh')) return 'tokenRefresh';
    if (url.includes('/captcha')) return 'captcha';
    if (url.includes('/2fa')) return 'twoFactor';
    return 'authentication';
  }

  // File operations
  if (url.includes('/upload')) return 'upload';
  if (url.includes('/download')) return 'download';

  // Database operations based on method
  if (method === 'get') return 'query';
  if (method === 'post' || method === 'put' || method === 'patch') return 'transaction';
  if (method === 'delete') return 'query';

  // Default
  return 'authentication';
}

/**
 * Timeout-aware route wrapper
 */
export function withTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  operationType: string,
  operationSubtype: string
) {
  return async function(this: unknown, ...args: T): Promise<R> {

    const request = args[0] as FastifyRequest;
    
    if (request.timeoutContext) {
      const result = await request.timeoutContext.timeoutManager.executeWithTimeout(
        () => handler.apply(this, args),
        operationType as any,
        operationSubtype,
        request.timeoutContext.operationId
      );

      if (!result.success) {
        throw result.error || new Error('Operation failed');
      }

      return result.data!;
    }

    // Fallback to direct execution if no timeout context
    return handler.apply(this, args);
  };
}

/**
 * Database query wrapper with timeout
 */
export function withDatabaseTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  queryType: 'query' | 'transaction' | 'migration' = 'query'
) {
  return withTimeout(handler, 'database', queryType);
}

/**
 * Redis operation wrapper with timeout
 */
export function withRedisTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  operationType: 'operation' | 'pipeline' | 'publish' = 'operation'
) {
  return withTimeout(handler, 'redis', operationType);
}

/**
 * External API wrapper with timeout
 */
export function withAPITimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  apiType: 'authentication' | 'webhook' | 'notification' | 'export' = 'authentication'
) {
  return withTimeout(handler, 'api', apiType);
}

/**
 * Authentication wrapper with timeout
 */
export function withAuthTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  authType: 'login' | 'register' | 'passwordReset' | 'tokenRefresh' | 'captcha' | 'twoFactor'
) {
  return withTimeout(handler, 'auth', authType);
}

/**
 * File operation wrapper with timeout
 */
export function withFileTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  fileType: 'upload' | 'download' | 'processing' | 'validation'
) {
  return withTimeout(handler, 'file', fileType);
}

/**
 * Email operation wrapper with timeout
 */
export function withEmailTimeout<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  emailType: 'send' | 'verify' | 'template' = 'send'
) {
  return withTimeout(handler, 'email', emailType);
}

// Extended request interface for TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    executeWithTimeout<T>(operation: () => Promise<T>): Promise<import('../services/TimeoutManager').OperationResult<T>>;
    executeWithFallback<T>(
      primaryOperation: () => Promise<T>,
      fallbackOperation: () => Promise<T>
    ): Promise<import('../services/TimeoutManager').OperationResult<T>>;
    cancelOperation(): boolean;
}
}
  }
}