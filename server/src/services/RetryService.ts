/**
 * Retry Strategy Framework with Exponential Backoff
 */

import { logger } from '../utils/logger';
import { isRetryableError, TimeoutError, ExternalServiceError, DatabaseError } from '../types/errors';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMax: number;           // Maximum jitter percentage (0-1)
  retryCondition?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, nextDelayMs: number) => void;
  name?: string;               // Operation name for logging
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalTimeMs: number;
  errors: unknown[];
}

export interface RetryMetrics {
  operationName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalAttempts: number;
  averageAttempts: number;
  successRate: number;
  averageSuccessTimeMs: number;
  lastExecutionTime: number;
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
}

class RetryStrategy {
  private readonly options: Required<RetryOptions>;
  private metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalAttempts: number;
    totalSuccessTimeMs: number;
    errors: Map<string, number>;
    lastExecutionTime: number;
  };

  constructor(options: RetryOptions) {
    this.options = {
      maxAttempts: options.maxAttempts,
      initialDelayMs: options.initialDelayMs,
      maxDelayMs: options.maxDelayMs,
      backoffMultiplier: options.backoffMultiplier,
      jitterMax: options.jitterMax,
      retryCondition: options.retryCondition || this.defaultRetryCondition,
      onRetry: options.onRetry || (() => {}),
      name: options.name || 'anonymous-operation'
    };

    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalAttempts: 0,
      totalSuccessTimeMs: 0,
      errors: new Map(),
      lastExecutionTime: 0
    };
  }

  private defaultRetryCondition(error: unknown, _____attempt: number): boolean {
    // Retry on network errors, timeouts, and specific HTTP status codes
    if (isRetryableError(error)) {
      return true;
    }

    // Retry on specific error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const retryableMessages = [
        'network error',
        'connection refused',
        'timeout',
        'temporary failure',
        'service unavailable',
        'too many requests',
        'internal server error'
      ];

      return retryableMessages.some(msg => message.includes(msg));
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    // Calculate exponential backoff delay
    const baseDelay = this.options.initialDelayMs * Math.pow(this.options.backoffMultiplier, attempt - 1);
    
    // Cap at maximum delay
    const cappedDelay = Math.min(baseDelay, this.options.maxDelayMs);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * this.options.jitterMax * Math.random();
    
    return Math.floor(cappedDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private recordError(error: unknown): void {
    const errorKey = error instanceof Error ? error.constructor.name : 'UnknownError';
    const currentCount = this.metrics.errors.get(errorKey) || 0;
    this.metrics.errors.set(errorKey, currentCount + 1);
  }

  public async execute<T>(operation: () => Promise<T>): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const errors: unknown[] = [];
    let lastError: unknown;

    this.metrics.totalExecutions++;
    this.metrics.lastExecutionTime = startTime;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      this.metrics.totalAttempts++;

      try {
        logger.debug(`Executing operation '${this.options.name}' (attempt ${attempt}/${this.options.maxAttempts})`);
        
        const result = await operation();
        
        // Success!
        const totalTimeMs = Date.now() - startTime;
        this.metrics.successfulExecutions++;
        this.metrics.totalSuccessTimeMs += totalTimeMs;

        logger.info(`Operation '${this.options.name}' succeeded`, {
          attempt,
          totalTimeMs,
          retriesNeeded: attempt - 1
        });

        return {
          result,
          attempts: attempt,
          totalTimeMs,
          errors
        };
      } catch (error) {
        lastError = error;
        errors.push(error);
        this.recordError(error);

        logger.warn(`Operation '${this.options.name}' failed on attempt ${attempt}`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxAttempts: this.options.maxAttempts
        });

        // Check if we should retry
        if (attempt === this.options.maxAttempts) {
          // Last attempt, don't retry
          break;
        }

        if (!this.options.retryCondition(error, attempt)) {
          logger.info(`Operation '${this.options.name}' will not be retried`, {
            reason: 'retry condition failed',
            error: error instanceof Error ? error.message : String(error)
          });
          break;
        }

        // Calculate delay and wait
        const delayMs = this.calculateDelay(attempt);
        
        logger.debug(`Retrying operation '${this.options.name}' in ${delayMs}ms`, {
          nextAttempt: attempt + 1,
          maxAttempts: this.options.maxAttempts
        });

        this.options.onRetry(error, attempt, delayMs);
        
        await this.sleep(delayMs);
      }
    }

    // All attempts failed
    const totalTimeMs = Date.now() - startTime;
    this.metrics.failedExecutions++;

    logger.error(`Operation '${this.options.name}' failed after all retry attempts`, {
      totalAttempts: this.options.maxAttempts,
      totalTimeMs,
      finalError: lastError instanceof Error ? lastError.message : String(lastError)
    });

    throw lastError;
  }

  public getMetrics(): RetryMetrics {
    const totalExecutions = this.metrics.totalExecutions || 1; // Avoid division by zero
    const successfulExecutions = this.metrics.successfulExecutions;
    
    // Calculate common errors
    const totalErrors = Array.from(this.metrics.errors.values()).reduce((sum, count) => sum + count, 0);
    const commonErrors = Array.from(this.metrics.errors.entries())
      .map(([error, count]) => ({
        error,
        count,
        percentage: Math.round((count / totalErrors) * 100 * 100) / 100 // Round to 2 decimal places
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 errors

    return {
      operationName: this.options.name,
      totalExecutions: this.metrics.totalExecutions,
      successfulExecutions,
      failedExecutions: this.metrics.failedExecutions,
      totalAttempts: this.metrics.totalAttempts,
      averageAttempts: Math.round((this.metrics.totalAttempts / totalExecutions) * 100) / 100,
      successRate: Math.round((successfulExecutions / totalExecutions) * 100 * 100) / 100,
      averageSuccessTimeMs: successfulExecutions > 0 
        ? Math.round((this.metrics.totalSuccessTimeMs / successfulExecutions) * 100) / 100
        : 0,
      lastExecutionTime: this.metrics.lastExecutionTime,
      commonErrors
    };
  }

  public resetMetrics(): void {
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalAttempts: 0,
      totalSuccessTimeMs: 0,
      errors: new Map(),
      lastExecutionTime: 0
    };
  }
}

export class RetryService {
  private strategies: Map<string, RetryStrategy> = new Map();
  private static instance: RetryService;

  static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  public createStrategy(name: string, options: RetryOptions): RetryStrategy {
    const strategy = new RetryStrategy({ ...options, name });
    this.strategies.set(name, strategy);
    return strategy;
  }

  public getStrategy(name: string): RetryStrategy | undefined {
    return this.strategies.get(name);
  }

  public getAllMetrics(): Record<string, RetryMetrics> {
    const metrics: Record<string, RetryMetrics> = {};
    this.strategies.forEach((strategy, name) => {
      metrics[name] = strategy.getMetrics();
    });
    return metrics;
  }

  // Predefined retry strategies for common operations
  public getDatabaseRetryStrategy(): RetryStrategy {
    const name = 'database';
    let strategy = this.getStrategy(name);

    if (!strategy) {
      strategy = this.createStrategy(name, {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterMax: 0.1,
        retryCondition: (error) => {
          return error instanceof DatabaseError || 
                 (error instanceof Error && error.message.includes('connection'));
        }
      });
    }

    return strategy;
  }

  public getExternalAPIRetryStrategy(serviceName?: string): RetryStrategy {
    const name = serviceName ? `external-api-${serviceName}` : 'external-api';
    let strategy = this.getStrategy(name);

    if (!strategy) {
      strategy = this.createStrategy(name, {
        maxAttempts: 4,
        initialDelayMs: 2000,
        maxDelayMs: 30000,
        backoffMultiplier: 2.5,
        jitterMax: 0.2,
        retryCondition: (error) => {
          return error instanceof ExternalServiceError ||
                 error instanceof TimeoutError ||
                 (error instanceof Error && 
                  (error.message.includes('network') || 
                   error.message.includes('timeout') ||
                   error.message.includes('503') ||
                   error.message.includes('502')));
        }
      });
    }

    return strategy;
  }

  public getFileSystemRetryStrategy(): RetryStrategy {
    const name = 'filesystem';
    let strategy = this.getStrategy(name);

    if (!strategy) {
      strategy = this.createStrategy(name, {
        maxAttempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        jitterMax: 0.1,
        retryCondition: (error) => {
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('ebusy') || 
                   message.includes('eagain') ||
                   message.includes('temporary');
          }
          return false;
        }
      });
    }

    return strategy;
  }

  public async executeWithRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    let strategy = this.getStrategy(operationName);

    if (!strategy) {
      const defaultOptions: RetryOptions = {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterMax: 0.1,
        name: operationName,
        ...options
      };
      strategy = this.createStrategy(operationName, defaultOptions);
    }

    return strategy.execute(operation);
  }
}

// Export singleton instance
export const retryService = RetryService.getInstance();

// Helper functions for common retry scenarios
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>
): Promise<RetryResult<T>> {
  return retryService.getDatabaseRetryStrategy().execute(operation);
}

export async function withExternalAPIRetry<T>(
  serviceName: string,
  operation: () => Promise<T>
): Promise<RetryResult<T>> {
  return retryService.getExternalAPIRetryStrategy(serviceName).execute(operation);
}

export async function withFileSystemRetry<T>(
  operation: () => Promise<T>
): Promise<RetryResult<T>> {
  return retryService.getFileSystemRetryStrategy().execute(operation);
}

// Simplified helper that just returns the result (not the retry metadata)
export async function retryOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const result = await retryService.executeWithRetry(operationName, operation, options);
  return result.result;
}

export { RetryStrategy };
export default RetryService;