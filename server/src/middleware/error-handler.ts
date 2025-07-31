/**
 * Centralized Error Handler Middleware for Backend API Error Handling & Resilience
 */

import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { 
  BaseError, 
  ErrorCategory, 
  ErrorSeverity,
  ValidationError,
  InternalError,
  ErrorContext,
  ErrorDetail,
  isBaseError 
} from '../types/errors';
import { logger } from '../utils/logger';

}
}
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    correlationId: string;
    timestamp: string;
    retryable: boolean;
    details?: ErrorDetail[];
    context?: {
      endpoint?: string;
      method?: string;
      requestId?: string;
}
}
    };
  };
}

}
}
interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByEndpoint: Record<string, number>;
  lastReset: Date;
}
}
}

class ErrorHandlerService {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCategory: Object.values(ErrorCategory).reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ErrorCategory, number>),
    errorsBySeverity: Object.values(ErrorSeverity).reduce((acc, sev) => ({ ...acc, [sev]: 0 }), {} as Record<ErrorSeverity, number>),
    errorsByEndpoint: {},
    lastReset: new Date(};

  private static instance: ErrorHandlerService;

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  public getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByCategory: Object.values(ErrorCategory).reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ErrorCategory, number>),
      errorsBySeverity: Object.values(ErrorSeverity).reduce((acc, sev) => ({ ...acc, [sev]: 0 }), {} as Record<ErrorSeverity, number>),
      errorsByEndpoint: {},
      lastReset: new Date(};
  }

  private updateMetrics(error: BaseError, endpoint?: string): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByCategory[error.category]++;
    this.metrics.errorsBySeverity[error.severity]++;
    
    if (endpoint) {
      this.metrics.errorsByEndpoint[endpoint] = (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;
    }
  }

  private createErrorContext(request: FastifyRequest): ErrorContext {
    return {
      correlationId: this.generateCorrelationId(),
      requestId: request.id,
      endpoint: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'] as string,
      ip: request.ip,
      timestamp: new Date().toISOString(// Don't include sensitive data like authorization headers
    };
  }

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleZodError(error: ZodError, context: ErrorContext): ValidationError {
    const details: ErrorDetail[] = error.errors.map(issue => ({
      field: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
      value: issue.received || issue.input
    }));

    return new ValidationError(
      'Validation failed',
      details,
      context.correlationId,
      context
    );
  }

  private handleFastifyError(error: FastifyError, context: ErrorContext): BaseError {
    // Handle specific Fastify error types
    if (error.statusCode === 400) {
      return new ValidationError(error.message, undefined, context.correlationId, context);
    }
    
    if (error.statusCode === 401) {
      const { AuthenticationError } = require('../types/errors');
      return new AuthenticationError(error.message, context.correlationId, context);
    }
    
    if (error.statusCode === 403) {
      const { AuthorizationError } = require('../types/errors');
      return new AuthorizationError(error.message, context.correlationId, context);
    }
    
    if (error.statusCode === 404) {
      const { NotFoundError } = require('../types/errors');
      return new NotFoundError(error.message || 'Resource', context.correlationId, context);
    }
    
    if (error.statusCode === 409) {
      const { ConflictError } = require('../types/errors');
      return new ConflictError(error.message, context.correlationId, context);
    }
    
    if (error.statusCode === 429) {
      const { RateLimitError } = require('../types/errors');
      return new RateLimitError(error.message, undefined, context.correlationId, context);
    }

    // Default to internal error
    return new InternalError(error.message, context.correlationId, context);
  }

  private handleUnknownError(error: unknown, context: ErrorContext): BaseError {
    if (error instanceof Error) {
      return new InternalError(
        `Unexpected error: ${error.message}`,
        context.correlationId,
        { ...context, stackTrace: error.stack }
      );
    }

    return new InternalError(
      `Unknown error: ${String(error)}`,
      context.correlationId,
      context
    );
  }

  public normalizeError(error: unknown, request: FastifyRequest): BaseError {
    const context = this.createErrorContext(request);

    let normalizedError: BaseError;

    if (isBaseError(error)) {
      // Already a structured error, just update context
      normalizedError = error;
      normalizedError.context = { ...normalizedError.context, ...context };
    } else if (error instanceof ZodError) {
      normalizedError = this.handleZodError(error, context);
    } else if (error && typeof error === 'object' && 'statusCode' in error) {
      normalizedError = this.handleFastifyError(error as FastifyError, context);
    } else {
      normalizedError = this.handleUnknownError(error, context);
    }

    // Update metrics
    this.updateMetrics(normalizedError, context.endpoint);

    return normalizedError;
  }

  private shouldLogError(error: BaseError): boolean {
    // Always log critical and high severity errors
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      return true;
    }

    // Log medium severity errors in production
    if (error.severity === ErrorSeverity.MEDIUM && process.env.NODE_ENV === 'production') {
      return true;
    }

    // Log validation errors in development for debugging
    if (error.category === ErrorCategory.VALIDATION && process.env.NODE_ENV === 'development') {
      return true;
    }

    return false;
  }

  public logError(error: BaseError): void {
    if (!this.shouldLogError(error)) {
      return;
    }

    const logData = {
      correlationId: error.correlationId,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
      details: error.details,
      stack: error.stack
    };

    switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error('CRITICAL ERROR', logData);
      // In a real implementation, this would trigger alerts/notifications
      break;
    case ErrorSeverity.HIGH:
      logger.error('HIGH SEVERITY ERROR', logData);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn('MEDIUM SEVERITY ERROR', logData);
      break;
    case ErrorSeverity.LOW:
      logger.info('LOW SEVERITY ERROR', logData);
      break;
    }
  }

  public formatErrorResponse(error: BaseError, includeStack: boolean = false): ErrorResponse {
    const response: ErrorResponse = {
      error: {
        code: error.name,
        message: error.message,
        category: error.category,
        severity: error.severity,
        correlationId: error.correlationId,
        timestamp: error.timestamp,
        retryable: error.retryable,
        context: {
          endpoint: error.context?.endpoint,
          method: error.context?.method,
          requestId: error.context?.requestId
        }
      }
    };

    // Include validation details if present
    if (error.details && error.details.length > 0) {
      response.error.details = error.details;
    }

    // Include stack trace in development
    if (includeStack && process.env.NODE_ENV === 'development') {
      (response.error as any).stack = error.stack;
    }

    return response;
  }
}

// Export singleton instance
export const errorHandlerService = ErrorHandlerService.getInstance();

// Error handler plugin for Fastify
export const errorHandlerPlugin = async (fastify: FastifyInstance) => {
  // Global error handler
  fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Normalize the error
    const normalizedError = errorHandlerService.normalizeError(error, request);

    // Log the error
    errorHandlerService.logError(normalizedError);

    // Format response
    const includeStack = process.env.NODE_ENV === 'development';
    const errorResponse = errorHandlerService.formatErrorResponse(normalizedError, includeStack);

    // Set appropriate headers for retryable errors
    if (normalizedError.retryable) {
      reply.header('Retry-After', '60'); // Default 60 seconds
    }

    // Special handling for rate limit errors
    if (normalizedError.category === ErrorCategory.RATE_LIMIT) {
      const rateLimitError = normalizedError as any;
      if (rateLimitError.retryAfter) {
        reply.header('Retry-After', String(rateLimitError.retryAfter));
      }
    }

    // Send the error response
    reply.status(normalizedError.httpStatusCode).send(errorResponse);
  });

  // Not found handler
  fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const context = {
      correlationId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.id,
      endpoint: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    };

    const error = new (require('../types/errors').NotFoundError)(
      `Route ${request.method} ${request.url}`,
      context.correlationId,
      context
    );

    errorHandlerService.logError(error);
    const errorResponse = errorHandlerService.formatErrorResponse(error);

    reply.status(404).send(errorResponse);
  });

  // Add error metrics endpoint
  fastify.get('/api/system/error-metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = errorHandlerService.getMetrics();
    reply.send(metrics);
  });

  // Add error metrics reset endpoint (for development/testing)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post('/api/system/error-metrics/reset', async (request: FastifyRequest, reply: FastifyReply) => {
      errorHandlerService.resetMetrics();
      reply.send({ message: 'Error metrics reset successfully' });
    });
  }
};

// Export error utilities for use in other parts of the application
export { ErrorHandlerService };

export default errorHandlerPlugin;