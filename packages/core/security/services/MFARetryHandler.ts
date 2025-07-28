/**
 * MFA Retry Handler Service
 * 
 * Provides comprehensive retry and timeout handling for MFA operations.
 * Includes exponential backoff, circuit breaker patterns, and intelligent
 * retry strategies for different types of MFA failures.
 * 
 * Features:
 * - Configurable retry strategies (exponential, linear, custom)
 * - Circuit breaker pattern for failing services
 * - Operation-specific timeout handling
 * - Rate limiting and abuse prevention
 * - Comprehensive error tracking and reporting
 * - Recovery mechanisms for transient failures
 */
import { EventEmitter } from 'events';

// Retry strategies
export enum RetryStrategy {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  FIXED = 'fixed',
  CUSTOM = 'custom'
}

// Operation types
export enum MFAOperation {
  TOTP_VERIFICATION = 'totp_verification',
  SMS_SEND = 'sms_send',
  SMS_VERIFICATION = 'sms_verification',
  EMAIL_SEND = 'email_send',
  EMAIL_VERIFICATION = 'email_verification',
  BACKUP_CODE_VERIFICATION = 'backup_code_verification',
  DEVICE_REGISTRATION = 'device_registration',
  METHOD_SETUP = 'method_setup',
  METHOD_DISABLE = 'method_disable'
}

// Failure types
export enum FailureType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
  INVALID_CODE = 'invalid_code',
  EXPIRED_CODE = 'expired_code',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  AUTHENTICATION_FAILED = 'authentication_failed',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Circuit breaker states
export enum CircuitBreakerStateEnum {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

// Configuration interfaces
export interface RetryConfig {
  maxAttempts: number;
  strategy: RetryStrategy;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs: number;
  timeoutMs: number;
  retryableErrors: FailureType[];
  customDelayFunction?: (attempt: number, baseDelay: number) => number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringWindowMs: number;
  halfOpenMaxAttempts: number;
}

export interface MFARetryConfig {
  operationConfigs: {,
    [key in MFAOperation]: RetryConfig;
  };
  circuitBreaker: CircuitBreakerConfig;
  globalTimeoutMs: number;
  enableMetrics: boolean;
  enableLogging: boolean;
}

// Operation context
export interface OperationContext {
  operationId: string;
  operation: MFAOperation;
  userId: string;
  sessionId?: string;
  startTime: Date;
  attempt: number;
  metadata: Record<string, any>;
}

// Retry attempt data
export interface RetryAttempt {
  attempt: number;
  startTime: Date;
  endTime?: Date;
  delayMs: number;
  error?: Error;
  success: boolean;
  timeoutReached: boolean;
}

// Operation result
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: RetryAttempt[];
  totalDurationMs: number;
  circuitBreakerTriggered: boolean;
  rateLimited: boolean;
}

// Circuit breaker state
interface CircuitBreakerStateData {
  state: CircuitBreakerStateEnum;
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
  halfOpenAttempts: number;
}

// Metrics
export interface RetryMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalRetries: number;
  averageAttempts: number;
  averageDuration: number;
  circuitBreakerTrips: number;
  operationMetrics: {,
    [key in MFAOperation]: {
      count: number;
      successRate: number;
      averageAttempts: number;
      averageDuration: number;
    };
  };
  errorMetrics: {,
    [key in FailureType]: number;
  };
}
/**
 * MFA Retry Handler Service
 */
export class MFARetryHandler extends EventEmitter {
  private config: MFARetryConfig;
  private circuitBreakers: Map<MFAOperation, CircuitBreakerStateData> = new Map();
  private metrics: RetryMetrics;
  private activeOperations: Map<string, OperationContext> = new Map();
  constructor(config: Partial<MFARetryConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.metrics = this.initializeMetrics();
    this.initializeCircuitBreakers();
  }
  /**
   * Execute an MFA operation with retry and timeout handling
   */
  public async executeWithRetry<T>()
    operation: MFAOperation,
    operationFn: () => Promise<T>,
    context: Partial<OperationContext> = {}
  ): Promise<OperationResult<T>> {
    const operationId = context.operationId || this.generateOperationId();
    const fullContext: OperationContext = {
      operationId,
      operation,
      userId: context.userId || 'unknown',
      sessionId: context.sessionId,
      startTime: new Date(),
      attempt: 0,
      metadata: context.metadata || {}
    };
    this.activeOperations.set(operationId, fullContext);
    try {
      return await this.executeOperation(operation, operationFn, fullContext);
    } finally {
      this.activeOperations.delete(operationId);
    }
  }
  /**
   * Check if an operation should be attempted based on circuit breaker state
   */
  public canAttemptOperation(operation: MFAOperation): boolean {
    const circuitBreaker = this.circuitBreakers.get(operation);
    if (!circuitBreaker) return true;
    switch (circuitBreaker.state) {
    case CircuitBreakerStateEnum.CLOSED:
      return true;
    case CircuitBreakerStateEnum.OPEN:
      if (circuitBreaker.nextAttemptTime && new Date() >= circuitBreaker.nextAttemptTime) {
        // Transition to half-open
        circuitBreaker.state = CircuitBreakerStateEnum.HALF_OPEN;
        circuitBreaker.halfOpenAttempts = 0;
        return true;
      }
      return false;
    case CircuitBreakerStateEnum.HALF_OPEN:
      return circuitBreaker.halfOpenAttempts < this.config.circuitBreaker.halfOpenMaxAttempts;
    default:
      return true;
    }
  }
  /**
   * Get current metrics
   */
  public getMetrics(): RetryMetrics {
    return { ...this.metrics };
  }
  /**
   * Get active operations
   */
  public getActiveOperations(): OperationContext[] {
    return Array.from(this.activeOperations.values());
  }
  /**
   * Reset circuit breaker for an operation
   */
  public resetCircuitBreaker(operation: MFAOperation): void {
    const circuitBreaker = this.circuitBreakers.get(operation);
    if (circuitBreaker) {
      circuitBreaker.state = CircuitBreakerStateEnum.CLOSED;
      circuitBreaker.failureCount = 0;
      circuitBreaker.lastFailureTime = undefined;
      circuitBreaker.nextAttemptTime = undefined;
      circuitBreaker.halfOpenAttempts = 0;
      this.emit('circuitBreakerReset', {)
        operation,
        timestamp: new Date()
      });
    }
  }
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MFARetryConfig>): void {
    this.config = this.mergeConfig(newConfig);
    this.emit('configUpdated', { config: this.config });
  }
  // Private methods
  private async executeOperation<T>()
    operation: MFAOperation,
    operationFn: () => Promise<T>,
    context: OperationContext,
  ): Promise<OperationResult<T>> {
    const config = this.config.operationConfigs[operation];
    const attempts: RetryAttempt[] = [];
    const startTime = new Date();
    let lastError: Error | undefined;
    let result: T | undefined;
    let success = false;
    // Check circuit breaker
    if (!this.canAttemptOperation(operation)) {
      return {
        success: false,
        error: new Error(`Circuit breaker is open for operation: ${operation}`),}
        attempts: [],
        totalDurationMs: 0,
        circuitBreakerTriggered: true,
        rateLimited: false,
      };
    }
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      context.attempt = attempt;
      const attemptStartTime = new Date();
      // Calculate delay for this attempt (skip delay for first attempt)
      const delayMs = attempt > 1 ? this.calculateDelay(attempt - 1, config) : 0;
      if (delayMs > 0) {
        await this.sleep(delayMs);
      }
      const attemptData: RetryAttempt = {
        attempt,
        startTime: attemptStartTime,
        delayMs,
        success: false,
        timeoutReached: false,
      };
      try {
        // Execute with timeout
        result = await this.executeWithTimeout(operationFn, config.timeoutMs);
        attemptData.success = true;
        attemptData.endTime = new Date();
        success = true;
        this.handleSuccess(operation, context);
        // Record successful attempt before breaking
        attempts.push(attemptData);
        break;
      } catch (error) {
        attemptData.error = error instanceof Error ? error : new Error(String(error));
        attemptData.endTime = new Date();
        attemptData.timeoutReached = error instanceof Error && error.message.includes('timeout');
        lastError = attemptData.error;
        this.handleFailure(operation, context, attemptData.error);
        // Record failed attempt
        attempts.push(attemptData);
        // Check if error is retryable
        const failureType = this.categorizeError(attemptData.error);
        if (!config.retryableErrors.includes(failureType)) {
          this.logOperation('Non-retryable error encountered', {)
            operation,
            attempt,
            error: attemptData.error.message,
            failureType
          });
          break;
        }
        // Check if we should continue retrying
        if (attempt === config.maxAttempts) {
          this.logOperation('Max retry attempts reached', {)
            operation,
            attempt,
            error: attemptData.error.message,
          });
          break;
        }
        this.logOperation('Retrying operation', {)
          operation,
          attempt,
          nextAttempt: attempt + 1,
          delayMs: this.calculateDelay(attempt, config),
          error: attemptData.error.message,
        });
      }
    }
    const totalDurationMs = new Date().getTime() - startTime.getTime();
    // Update metrics
    this.updateMetrics(operation, success, attempts.length, totalDurationMs);
    return {
      success,
      data: result,
      error: lastError,
      attempts,
      totalDurationMs,
      circuitBreakerTriggered: false,
      rateLimited: false,
    };
  }
  private async executeWithTimeout<T>()
    operationFn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeoutMs}ms`));}
      }, timeoutMs);
      operationFn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;
    switch (config.strategy) {
    case RetryStrategy.EXPONENTIAL:
      delay = Math.min()
        config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs
      );
      break;
    case RetryStrategy.LINEAR:
      delay = Math.min()
        config.baseDelayMs * attempt,
        config.maxDelayMs
      );
      break;
    case RetryStrategy.FIXED:
      delay = config.baseDelayMs;
      break;
    case RetryStrategy.CUSTOM:
      if (config.customDelayFunction) {
        delay = config.customDelayFunction(attempt, config.baseDelayMs);
      } else {
        delay = config.baseDelayMs;
      }
      break;
    default:
      delay = config.baseDelayMs;
    }
    // Add jitter to prevent thundering herd
    if (config.jitterMs > 0) {
      const jitter = Math.random() * config.jitterMs;
      delay += jitter;
    }
    return Math.max(0, Math.min(delay, config.maxDelayMs));
  }
  private categorizeError(error: Error): FailureType {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) {
      return FailureType.TIMEOUT;
    }
    if (message.includes('network') || message.includes('connection')) {
      return FailureType.NETWORK_ERROR;
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return FailureType.RATE_LIMITED;
    }
    if (message.includes('invalid code') || message.includes('incorrect code')) {
      return FailureType.INVALID_CODE;
    }
    if (message.includes('expired') || message.includes('code has expired')) {
      return FailureType.EXPIRED_CODE;
    }
    if (message.includes('service unavailable') || message.includes('server error')) {
      return FailureType.SERVICE_UNAVAILABLE;
    }
    if (message.includes('authentication failed') || message.includes('unauthorized')) {
      return FailureType.AUTHENTICATION_FAILED;
    }
    if (message.includes('validation') || message.includes('invalid input')) {
      return FailureType.VALIDATION_ERROR;
    }
    return FailureType.UNKNOWN_ERROR;
  }
  private handleSuccess(operation: MFAOperation, context: OperationContext): void {
    const circuitBreaker = this.circuitBreakers.get(operation);
    if (circuitBreaker) {
      if (circuitBreaker.state === CircuitBreakerStateEnum.HALF_OPEN) {
        // Successful operation in half-open state - close circuit breaker
        circuitBreaker.state = CircuitBreakerStateEnum.CLOSED;
        circuitBreaker.failureCount = 0;
        circuitBreaker.halfOpenAttempts = 0;
        this.emit('circuitBreakerClosed', {)
          operation,
          context,
          timestamp: new Date()
        });
      }
    }
    this.emit('operationSuccess', {)
      operation,
      context,
      timestamp: new Date()
    });
  }
  private handleFailure(operation: MFAOperation, context: OperationContext, error: Error): void {
    const circuitBreaker = this.circuitBreakers.get(operation);
    if (circuitBreaker) {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = new Date();
      if (circuitBreaker.state === CircuitBreakerStateEnum.HALF_OPEN) {
        circuitBreaker.halfOpenAttempts++;
      }
      // Check if we should open the circuit breaker
      if (circuitBreaker.state === CircuitBreakerStateEnum.CLOSED &&)
          circuitBreaker.failureCount >= this.config.circuitBreaker.failureThreshold) {
        circuitBreaker.state = CircuitBreakerStateEnum.OPEN;
        circuitBreaker.nextAttemptTime = new Date()
          Date.now() + this.config.circuitBreaker.resetTimeoutMs
        );
        this.metrics.circuitBreakerTrips++;
        this.emit('circuitBreakerOpened', {)
          operation,
          context,
          failureCount: circuitBreaker.failureCount,
          timestamp: new Date()
        });
      }
    }
    this.emit('operationFailure', {)
      operation,
      context,
      error,
      timestamp: new Date()
    });
  }
  private updateMetrics()
    operation: MFAOperation,
    success: boolean,
    attempts: number,
    durationMs: number,
  ): void {
    this.metrics.totalOperations++;
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }
    this.metrics.totalRetries += attempts - 1; // Subtract 1 for initial attempt
    this.metrics.averageAttempts = this.metrics.totalRetries / this.metrics.totalOperations;
    this.metrics.averageDuration = 
      ((this.metrics.averageDuration * (this.metrics.totalOperations - 1)) + durationMs) / 
      this.metrics.totalOperations;
    // Update operation-specific metrics
    const opMetrics = this.metrics.operationMetrics[operation];
    opMetrics.count++;
    opMetrics.successRate = success ? 
      ((opMetrics.successRate * (opMetrics.count - 1)) + 1) / opMetrics.count :
      (opMetrics.successRate * (opMetrics.count - 1)) / opMetrics.count;
    opMetrics.averageAttempts = 
      ((opMetrics.averageAttempts * (opMetrics.count - 1)) + attempts) / opMetrics.count;
    opMetrics.averageDuration = 
      ((opMetrics.averageDuration * (opMetrics.count - 1)) + durationMs) / opMetrics.count;
  }
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  private generateOperationId(): string {
    return `mfa_op_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;}
  }
  private logOperation(message: string, data: any): void {
    if (this.config.enableLogging) {
      this.emit('log', {)
        level: 'info',
        message,
        data,
        timestamp: new Date()
      });
    }
  }
  private mergeConfig(config: Partial<MFARetryConfig>): MFARetryConfig {
    const defaultRetryConfig: RetryConfig = {
      maxAttempts: 3,
      strategy: RetryStrategy.EXPONENTIAL,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      jitterMs: 100,
      timeoutMs: 10000,
      retryableErrors: [,
        FailureType.NETWORK_ERROR,
        FailureType.TIMEOUT,
        FailureType.SERVICE_UNAVAILABLE
      ]
    };
    return {
      operationConfigs: {,
        [MFAOperation.TOTP_VERIFICATION]: {
          ...defaultRetryConfig,
          maxAttempts: 2,
          timeoutMs: 5000,
          retryableErrors: [FailureType.NETWORK_ERROR, FailureType.TIMEOUT]
        },
        [MFAOperation.SMS_SEND]: {
          ...defaultRetryConfig,
          maxAttempts: 3,
          timeoutMs: 15000,
          retryableErrors: [,
            FailureType.NETWORK_ERROR,
            FailureType.TIMEOUT,
            FailureType.SERVICE_UNAVAILABLE
          ]
        },
        [MFAOperation.SMS_VERIFICATION]: {
          ...defaultRetryConfig,
          maxAttempts: 2,
          timeoutMs: 5000,
          retryableErrors: [FailureType.NETWORK_ERROR, FailureType.TIMEOUT]
        },
        [MFAOperation.EMAIL_SEND]: {
          ...defaultRetryConfig,
          maxAttempts: 3,
          timeoutMs: 20000,
          retryableErrors: [,
            FailureType.NETWORK_ERROR,
            FailureType.TIMEOUT,
            FailureType.SERVICE_UNAVAILABLE
          ]
        },
        [MFAOperation.EMAIL_VERIFICATION]: {
          ...defaultRetryConfig,
          maxAttempts: 2,
          timeoutMs: 5000,
          retryableErrors: [FailureType.NETWORK_ERROR, FailureType.TIMEOUT]
        },
        [MFAOperation.BACKUP_CODE_VERIFICATION]: {
          ...defaultRetryConfig,
          maxAttempts: 1,
          timeoutMs: 5000,
          retryableErrors: [FailureType.NETWORK_ERROR, FailureType.TIMEOUT]
        },
        [MFAOperation.DEVICE_REGISTRATION]: {
          ...defaultRetryConfig,
          maxAttempts: 3,
          timeoutMs: 15000,
          retryableErrors: [,
            FailureType.NETWORK_ERROR,
            FailureType.TIMEOUT,
            FailureType.SERVICE_UNAVAILABLE
          ]
        },
        [MFAOperation.METHOD_SETUP]: {
          ...defaultRetryConfig,
          maxAttempts: 3,
          timeoutMs: 20000,
          retryableErrors: [,
            FailureType.NETWORK_ERROR,
            FailureType.TIMEOUT,
            FailureType.SERVICE_UNAVAILABLE
          ]
        },
        [MFAOperation.METHOD_DISABLE]: {
          ...defaultRetryConfig,
          maxAttempts: 2,
          timeoutMs: 10000,
          retryableErrors: [FailureType.NETWORK_ERROR, FailureType.TIMEOUT]
        },
        ...config.operationConfigs
      },
      circuitBreaker: {,
        failureThreshold: 5,
        resetTimeoutMs: 60000, // 1 minute
        monitoringWindowMs: 300000, // 5 minutes
        halfOpenMaxAttempts: 3,
        ...config.circuitBreaker
      },
      globalTimeoutMs: config.globalTimeoutMs || 60000,
      enableMetrics: config.enableMetrics !== false,
      enableLogging: config.enableLogging !== false
    };
  }
  private initializeMetrics(): RetryMetrics {
    const operationMetrics = {} as RetryMetrics['operationMetrics'];
    const errorMetrics = {} as RetryMetrics['errorMetrics'];
    // Initialize operation metrics
    Object.values(MFAOperation).forEach(operation => {)
      operationMetrics[operation] = {
        count: 0,
        successRate: 0,
        averageAttempts: 0,
        averageDuration: 0,
      };
    });
    // Initialize error metrics
    Object.values(FailureType).forEach(errorType => {)
      errorMetrics[errorType] = 0;
    });
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalRetries: 0,
      averageAttempts: 0,
      averageDuration: 0,
      circuitBreakerTrips: 0,
      operationMetrics,
      errorMetrics
    };
  }
  private initializeCircuitBreakers(): void {
    Object.values(MFAOperation).forEach(operation => {)
      this.circuitBreakers.set(operation, {)
        state: CircuitBreakerStateEnum.CLOSED,
        failureCount: 0,
        halfOpenAttempts: 0,
      });
    });
  }
}

// Export default class
export default MFARetryHandler;