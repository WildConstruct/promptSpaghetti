/**
 * Comprehensive Timeout Manager Service
 * 
 * Provides centralized timeout management with:
 * - Configurable timeouts for different operation types
 * - Graceful degradation strategies
 * - Retry mechanisms with exponential backoff
 * - Circuit breaker patterns
 * - Monitoring and metrics collection
 */

import { EventEmitter } from 'events';

}
}
export interface TimeoutConfig {
  // Database timeouts
  database: {
    connect: number;
    query: number;
    transaction: number;
    migration: number;
}
}
  };
  
  // Redis timeouts
  redis: {
    connect: number;
    operation: number;
    pipeline: number;
    publish: number;
  };
  
  // External API timeouts
  api: {
    authentication: number;
    webhook: number;
    notification: number;
    export: number;
  };
  
  // Authentication flow timeouts
  auth: {
    login: number;
    register: number;
    passwordReset: number;
    tokenRefresh: number;
    captcha: number;
    twoFactor: number;
  };
  
  // File operation timeouts
  file: {
    upload: number;
    download: number;
    processing: number;
    validation: number;
  };
  
  // Email sending timeouts
  email: {
    send: number;
    verify: number;
    template: number;
  };
}

}
}
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
}
}
}

}
}
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}
}
}

}
}
export interface TimeoutMetrics {
  totalOperations: number;
  timeouts: number;
  retries: number;
  circuitBreakerTrips: number;
  averageExecutionTime: number;
  lastTimeout: Date | null;
}
}
}

}
}
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
  timedOut: boolean;
  circuitBreakerOpen: boolean;
}

type OperationType = keyof TimeoutConfig;
type OperationSubtype<T extends OperationType> = keyof TimeoutConfig[T];

enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

}
}
interface CircuitBreaker {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
}
}
}

export class TimeoutManager extends EventEmitter {
  private config: TimeoutConfig;
  private retryConfig: RetryConfig;
  private circuitBreakerConfig: CircuitBreakerConfig;
  private metrics: Map<string, TimeoutMetrics> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private activeOperations: Map<string, AbortController> = new Map();

  constructor(
    config?: Partial<TimeoutConfig>,
    retryConfig?: Partial<RetryConfig>,
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>
  ) {
    super();
    
    this.config = this.buildConfig(config);
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterEnabled: true,
      ...retryConfig
    };
    this.circuitBreakerConfig = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 300000,
      ...circuitBreakerConfig
    };

    // Clean up circuit breakers periodically
    setInterval(() => this.cleanupCircuitBreakers(), this.circuitBreakerConfig.monitoringPeriod);
  }

  /**
   * Build timeout configuration with environment variable overrides
   */
  private buildConfig(overrides?: Partial<TimeoutConfig>): TimeoutConfig {
    const defaultConfig: TimeoutConfig = {
      database: {
        connect: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
        query: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
        transaction: parseInt(process.env.DB_TRANSACTION_TIMEOUT || '60000'),
        migration: parseInt(process.env.DB_MIGRATION_TIMEOUT || '300000')
  }
      redis: {
        connect: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000'),
        operation: parseInt(process.env.REDIS_OP_TIMEOUT || '10000'),
        pipeline: parseInt(process.env.REDIS_PIPELINE_TIMEOUT || '15000'),
        publish: parseInt(process.env.REDIS_PUBLISH_TIMEOUT || '5000')
  }
      api: {
        authentication: parseInt(process.env.API_AUTH_TIMEOUT || '15000'),
        webhook: parseInt(process.env.API_WEBHOOK_TIMEOUT || '30000'),
        notification: parseInt(process.env.API_NOTIFICATION_TIMEOUT || '10000'),
        export: parseInt(process.env.API_EXPORT_TIMEOUT || '120000')
  }
      auth: {
        login: parseInt(process.env.AUTH_LOGIN_TIMEOUT || '10000'),
        register: parseInt(process.env.AUTH_REGISTER_TIMEOUT || '15000'),
        passwordReset: parseInt(process.env.AUTH_PASSWORD_RESET_TIMEOUT || '30000'),
        tokenRefresh: parseInt(process.env.AUTH_TOKEN_REFRESH_TIMEOUT || '5000'),
        captcha: parseInt(process.env.AUTH_CAPTCHA_TIMEOUT || '10000'),
        twoFactor: parseInt(process.env.AUTH_2FA_TIMEOUT || '30000')
  }
      file: {
        upload: parseInt(process.env.FILE_UPLOAD_TIMEOUT || '120000'),
        download: parseInt(process.env.FILE_DOWNLOAD_TIMEOUT || '60000'),
        processing: parseInt(process.env.FILE_PROCESSING_TIMEOUT || '300000'),
        validation: parseInt(process.env.FILE_VALIDATION_TIMEOUT || '30000')
  }
      email: {
        send: parseInt(process.env.EMAIL_SEND_TIMEOUT || '15000'),
        verify: parseInt(process.env.EMAIL_VERIFY_TIMEOUT || '10000'),
        template: parseInt(process.env.EMAIL_TEMPLATE_TIMEOUT || '5000')
      }
    };

    return this.mergeDeep(defaultConfig, overrides || {});
  }

  /**
   * Deep merge configuration objects
   */
  private mergeDeep(target: unknown, source: Error): unknown {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Execute operation with timeout, retry, and circuit breaker protection
   */
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    operationType: OperationType,
    operationSubtype: string,
    operationId?: string
  ): Promise<OperationResult<T>> {
    const startTime = Date.now();
    const opId = operationId || `${operationType}.${operationSubtype}.${Date.now()}`;
    const metricKey = `${operationType}.${operationSubtype}`;
    
    // Check circuit breaker
    const circuitBreaker = this.getCircuitBreaker(metricKey);
    if (circuitBreaker.state === CircuitBreakerState.OPEN) {
      if (Date.now() < (circuitBreaker.nextAttemptTime?.getTime() || 0)) {
        this.updateMetrics(metricKey, false, 0, true, false);
        return {
          success: false,
          error: new Error(`Circuit breaker is open for ${metricKey}`),
          attempts: 0,
          totalTime: Date.now() - startTime,
          timedOut: false,
          circuitBreakerOpen: true
        };
      } else {
        // Move to half-open state
        circuitBreaker.state = CircuitBreakerState.HALF_OPEN;
      }
    }

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= this.retryConfig.maxRetries) {
      attempts++;
      
      try {
        const result = await this.executeWithTimeoutInternal(
          operation,
          operationType,
          operationSubtype as any,
          opId
        );

        // Success - reset circuit breaker if it was half-open
        if (circuitBreaker.state === CircuitBreakerState.HALF_OPEN) {
          this.resetCircuitBreaker(metricKey);
        }

        const totalTime = Date.now() - startTime;
        this.updateMetrics(metricKey, true, totalTime, false, false);

        return {
          success: true,
          data: result,
          attempts,
          totalTime,
          timedOut: false,
          circuitBreakerOpen: false
        };

      } catch (error) {
        lastError = error as Error;
        
        // Update circuit breaker on failure
        this.recordFailure(metricKey);

        // Don't retry if circuit breaker opened or if it's the last attempt
        if (circuitBreaker.state === CircuitBreakerState.OPEN || attempts > this.retryConfig.maxRetries) {
          break;
        }

        // Wait before retry
        if (attempts <= this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempts - 1);
          await this.sleep(delay);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const timedOut = lastError?.name === 'TimeoutError';
    
    this.updateMetrics(metricKey, false, totalTime, false, timedOut);
    
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts,
      totalTime,
      timedOut,
      circuitBreakerOpen: circuitBreaker.state === CircuitBreakerState.OPEN
    };
  }

  /**
   * Internal method to execute operation with timeout
   */
  private async executeWithTimeoutInternal<T>(
    operation: () => Promise<T>,
    operationType: OperationType,
    operationSubtype: OperationSubtype<typeof operationType>,
    operationId: string
  ): Promise<T> {

    const timeout = this.config[operationType][operationSubtype] as number;
    const controller = new AbortController();
    
    this.activeOperations.set(operationId, controller);

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);

        // Clear timeout if operation completes
        controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
      });

      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      return result;
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Execute operation with fallback
   */
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationType: OperationType,
    operationSubtype: string
  ): Promise<OperationResult<T>> {
    const primaryResult = await this.executeWithTimeout(
      primaryOperation,
      operationType,
      operationSubtype
    );

    if (primaryResult.success) {
      return primaryResult;
    }

    // Try fallback operation
    const fallbackResult = await this.executeWithTimeout(
      fallbackOperation,
      operationType,
      `${operationSubtype}_fallback`
    );

    // Emit fallback event
    this.emit('fallback_used', {
      operationType,
      operationSubtype,
      primaryError: primaryResult.error,
      fallbackSuccess: fallbackResult.success
    });

    return fallbackResult;
  }

  /**
   * Cancel active operation
   */
  cancelOperation(operationId: string): boolean {
    const controller = this.activeOperations.get(operationId);
    if (controller) {
      controller.abort();
      this.activeOperations.delete(operationId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all active operations
   */
  cancelAllOperations(): number {
    const count = this.activeOperations.size;
    
    for (const controller of this.activeOperations.values()) {
      controller.abort();
    }
    
    this.activeOperations.clear();
    return count;
  }

  /**
   * Get circuit breaker for operation
   */
  private getCircuitBreaker(metricKey: string): CircuitBreaker {
    if (!this.circuitBreakers.has(metricKey)) {
      this.circuitBreakers.set(metricKey, {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null
      });
    }
    return this.circuitBreakers.get(metricKey)!;
  }

  /**
   * Record failure for circuit breaker
   */
  private recordFailure(metricKey: string): void {
    const circuitBreaker = this.getCircuitBreaker(metricKey);
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = new Date();

    if (circuitBreaker.failureCount >= this.circuitBreakerConfig.failureThreshold) {
      circuitBreaker.state = CircuitBreakerState.OPEN;
      circuitBreaker.nextAttemptTime = new Date(
        Date.now() + this.circuitBreakerConfig.resetTimeout
      );

      this.emit('circuit_breaker_opened', { metricKey, failureCount: circuitBreaker.failureCount });
    }
  }

  /**
   * Reset circuit breaker
   */
  private resetCircuitBreaker(metricKey: string): void {
    const circuitBreaker = this.getCircuitBreaker(metricKey);
    circuitBreaker.state = CircuitBreakerState.CLOSED;
    circuitBreaker.failureCount = 0;
    circuitBreaker.lastFailureTime = null;
    circuitBreaker.nextAttemptTime = null;

    this.emit('circuit_breaker_reset', { metricKey });
  }

  /**
   * Clean up old circuit breakers
   */
  private cleanupCircuitBreakers(): void {
    const cutoffTime = Date.now() - this.circuitBreakerConfig.monitoringPeriod;
    
    for (const [key, breaker] of this.circuitBreakers.entries()) {
      if (breaker.lastFailureTime && breaker.lastFailureTime.getTime() < cutoffTime) {
        if (breaker.state === CircuitBreakerState.CLOSED && breaker.failureCount === 0) {
          this.circuitBreakers.delete(key);
        }
      }
    }
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    const cappedDelay = Math.min(baseDelay, this.retryConfig.maxDelay);
    
    if (this.retryConfig.jitterEnabled) {
      // Add 0-25% jitter to prevent thundering herd
      const jitter = cappedDelay * 0.25 * Math.random();
      return cappedDelay + jitter;
    }
    
    return cappedDelay;
  }

  /**
   * Update metrics for operation
   */
  private updateMetrics(
    metricKey: string,
    success: boolean,
    executionTime: number,
    circuitBreakerTrip: boolean,
    timeout: boolean
  ): void {
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        totalOperations: 0,
        timeouts: 0,
        retries: 0,
        circuitBreakerTrips: 0,
        averageExecutionTime: 0,
        lastTimeout: null
      });
    }

    const metrics = this.metrics.get(metricKey)!;
    metrics.totalOperations++;
    
    if (timeout) {
      metrics.timeouts++;
      metrics.lastTimeout = new Date();
    }
    
    if (circuitBreakerTrip) {
      metrics.circuitBreakerTrips++;
    }

    // Update average execution time
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.totalOperations - 1) + executionTime) / metrics.totalOperations;

    // Emit timeout event
    if (timeout) {
      this.emit('timeout', {
        metricKey,
        executionTime,
        totalTimeouts: metrics.timeouts
      });
    }
  }

  /**
   * Get metrics for operation type
   */
  getMetrics(operationType?: string): Map<string, TimeoutMetrics> | TimeoutMetrics | null {
    if (!operationType) {
      return this.metrics;
    }
    
    return this.metrics.get(operationType) || null;
  }

  /**
   * Get all circuit breaker states
   */
  getCircuitBreakerStates(): Map<string, CircuitBreaker> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    activeOperations: number;
    openCircuitBreakers: number;
    totalTimeouts: number;
    operationTypes: string[];
    } {
    const openCircuitBreakers = Array.from(this.circuitBreakers.values())
      .filter(cb => cb.state === CircuitBreakerState.OPEN).length;

    const totalTimeouts = Array.from(this.metrics.values())
      .reduce((sum, metrics) => sum + metrics.timeouts, 0);

    return {
      activeOperations: this.activeOperations.size,
      openCircuitBreakers,
      totalTimeouts,
      operationTypes: Array.from(this.metrics.keys())
    };
  }

  /**
   * Reset all metrics and circuit breakers
   */
  reset(): void {
    this.metrics.clear();
    this.circuitBreakers.clear();
    this.cancelAllOperations();
  }

  /**
   * Get timeout configuration
   */
  getConfig(): TimeoutConfig {
    return { ...this.config };
  }

  /**
   * Update timeout configuration
   */
  updateConfig(updates: Partial<TimeoutConfig>): void {
    this.config = this.mergeDeep(this.config, updates);
    this.emit('config_updated', this.config);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Error classes
export class TimeoutError extends Error {
  constructor(operation: string, timeout: number) {
    super(`Operation '${operation}' timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(operation: string) {
    super(`Circuit breaker is open for operation '${operation}'`);
    this.name = 'CircuitBreakerOpenError';
  }
}

// Singleton instance
let timeoutManagerInstance: TimeoutManager | null = null;

export function getTimeoutManager(): TimeoutManager {
  if (!timeoutManagerInstance) {
    timeoutManagerInstance = new TimeoutManager();
  }
  return timeoutManagerInstance;
}

export function initializeTimeoutManager(
  config?: Partial<TimeoutConfig>,
  retryConfig?: Partial<RetryConfig>,
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>
): TimeoutManager {
  timeoutManagerInstance = new TimeoutManager(config, retryConfig, circuitBreakerConfig);
  return timeoutManagerInstance;
}