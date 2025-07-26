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
export declare enum RetryStrategy {
    EXPONENTIAL = "exponential",
    LINEAR = "linear",
    FIXED = "fixed",
    CUSTOM = "custom"
}
export declare enum MFAOperation {
    TOTP_VERIFICATION = "totp_verification",
    SMS_SEND = "sms_send",
    SMS_VERIFICATION = "sms_verification",
    EMAIL_SEND = "email_send",
    EMAIL_VERIFICATION = "email_verification",
    BACKUP_CODE_VERIFICATION = "backup_code_verification",
    DEVICE_REGISTRATION = "device_registration",
    METHOD_SETUP = "method_setup",
    METHOD_DISABLE = "method_disable"
}
export declare enum FailureType {
    NETWORK_ERROR = "network_error",
    TIMEOUT = "timeout",
    RATE_LIMITED = "rate_limited",
    INVALID_CODE = "invalid_code",
    EXPIRED_CODE = "expired_code",
    SERVICE_UNAVAILABLE = "service_unavailable",
    AUTHENTICATION_FAILED = "authentication_failed",
    VALIDATION_ERROR = "validation_error",
    UNKNOWN_ERROR = "unknown_error"
}
export declare enum CircuitBreakerStateEnum {
    CLOSED = "closed",
    OPEN = "open",
    HALF_OPEN = "half_open"
}
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
    operationConfigs: {
        [key in MFAOperation]: RetryConfig;
    };
    circuitBreaker: CircuitBreakerConfig;
    globalTimeoutMs: number;
    enableMetrics: boolean;
    enableLogging: boolean;
}
export interface OperationContext {
    operationId: string;
    operation: MFAOperation;
    userId: string;
    sessionId?: string;
    startTime: Date;
    attempt: number;
    metadata: Record<string, any>;
}
export interface RetryAttempt {
    attempt: number;
    startTime: Date;
    endTime?: Date;
    delayMs: number;
    error?: Error;
    success: boolean;
    timeoutReached: boolean;
}
export interface OperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: RetryAttempt[];
    totalDurationMs: number;
    circuitBreakerTriggered: boolean;
    rateLimited: boolean;
}
export interface RetryMetrics {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    totalRetries: number;
    averageAttempts: number;
    averageDuration: number;
    circuitBreakerTrips: number;
    operationMetrics: {
        [key in MFAOperation]: {
            count: number;
            successRate: number;
            averageAttempts: number;
            averageDuration: number;
        };
    };
    errorMetrics: {
        [key in FailureType]: number;
    };
}
/**
 * MFA Retry Handler Service
 */
export declare class MFARetryHandler extends EventEmitter {
    private config;
    private circuitBreakers;
    private metrics;
    private activeOperations;
    constructor(config?: Partial<MFARetryConfig>);
    /**
     * Execute an MFA operation with retry and timeout handling
     */
    executeWithRetry<T>(
      operation: MFAOperation,
      operationFn: (
    ) => Promise<T>, context?: Partial<OperationContext>): Promise<OperationResult<T>>;
    /**
     * Check if an operation should be attempted based on circuit breaker state
     */
    canAttemptOperation(operation: MFAOperation): boolean;
    /**
     * Get current metrics
     */
    getMetrics(): RetryMetrics;
    /**
     * Get active operations
     */
    getActiveOperations(): OperationContext[];
    /**
     * Reset circuit breaker for an operation
     */
    resetCircuitBreaker(operation: MFAOperation): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<MFARetryConfig>): void;
    private executeOperation;
    private executeWithTimeout;
    private calculateDelay;
    private categorizeError;
    private handleSuccess;
    private handleFailure;
    private updateMetrics;
    private sleep;
    private generateOperationId;
    private logOperation;
    private mergeConfig;
    private initializeMetrics;
    private initializeCircuitBreakers;
}
export default MFARetryHandler;
//# sourceMappingURL=MFARetryHandler.d.ts.map