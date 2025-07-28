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
}
export declare class ErrorRecovery {
    private static circuitBreakers;
    /**
     * Execute operation with retry logic and exponential backoff
     */
    static withRetry<T>(): any;
    operation: () => Promise<T>;
    context: string;
    options: Partial<RetryOptions>;
    Promise<T>(): void;
    lastError: any;
    message: any;
}
//# sourceMappingURL=ErrorRecovery.d.ts.map