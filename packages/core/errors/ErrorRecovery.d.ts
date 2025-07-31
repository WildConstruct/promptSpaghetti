/**
 * Epic 18.2.5 - Error Recovery Utilities
 *
 * Provides graceful error recovery mechanisms, fallback strategies,
 * and retry logic for improved system resilience.
 */

}
export interface RetryOptions {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryCondition?: (error: Error) => boolean;

}
export interface FallbackOptions<T> {
    fallbackValue?: T;
    fallbackFunction?: () => T | Promise<T>;
    logError?: boolean;

}
export interface CircuitBreakerOptions {
    threshold: number;
    resetTimeout: number;
    monitoringWindow: number;
/**
 * Centralized error recovery utilities
 */
export declare class ErrorRecovery {
    private static circuitBreakers;
    /**
     * Execute operation with retry logic and exponential backoff
     */
    static withRetry<T>(operation: () => Promise<T>, context: string, options?: Partial<RetryOptions>): Promise<T>;
    /**
     * Execute operation with fallback on failure
     */
    static withFallback<T>(operation: () => Promise<T>, context: string, options?: FallbackOptions<T>): Promise<T>;
    /**
     * Execute operation with circuit breaker pattern
     */
    static withCircuitBreaker<T>(operation: () => Promise<T>, circuitName: string, context: string, options?: Partial<CircuitBreakerOptions>): Promise<T>;
    /**
     * Execute multiple operations with graceful degradation
     */
    static withGracefulDegradation<T>(operations: Array<{)
        operation: () => Promise<T>;
        name: string;
        priority: 'critical' | 'important' | 'optional'
}
  }>, context: string): Promise<{
        results: Array<{
            name: string;
            result?: T;
            error?: Error;
            skipped?: boolean;
        }>;
        success: boolean;
    }>;
    /**
     * Validate operation before execution with recovery suggestions
     */
    static withValidation<T>(operation: () => Promise<T>, validator: () => Promise<boolean> | boolean, context: string, validationErrorMessage?: string): Promise<T>;
    /**
     * Execute operation with timeout and recovery
     */
    static withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, context: string, recoveryFn?: () => Promise<T>): Promise<T>;
    /**
     * Execute operation with resource cleanup
     */
    static withCleanup<T, R>(operation: () => Promise<T>, resourceAcquirer: () => Promise<R> | R, resourceReleaser: (resource: R) => Promise<void> | void, context: string): Promise<T>;
    private static delay;
    private static getOrCreateCircuitBreaker;
    /**
     * Get circuit breaker status for monitoring
     */
    static getCircuitBreakerStatus(name: string): CircuitBreakerState | null;
    /**
     * Reset circuit breaker manually
     */
    static resetCircuitBreaker(name: string): void;
}
interface CircuitBreakerState extends CircuitBreakerOptions {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    firstFailureAt: number;
    lastFailureAt: number;
    openedAt: number;
/**
 * Decorator for automatic error recovery
 */
export declare function withErrorRecovery<T extends any[], R>(retryOptions?: Partial<RetryOptions>)
  fallbackOptions?: FallbackOptions<R>
): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export {};
//# sourceMappingURL=ErrorRecovery.d.ts.map