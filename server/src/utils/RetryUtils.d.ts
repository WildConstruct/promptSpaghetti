/**
 * Retry Mechanism Utility - Epic 17
 * Task: E17-1753114396828-35CAE6 - Implement retry mechanism
 *
 * Provides configurable retry logic with exponential backoff, jitter, and
 * comprehensive error handling for robust system operations.
 */
export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    jitter?: boolean;
    retryableErrors?: Array<string | number | RegExp>;
    onAttempt?: (attempt: number, error: Error) => void;
    onSuccess?: (attempt: number, result: any) => void;
    onFailure?: (attempts: number, finalError: Error) => void;
}
export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: Error;
    attempts: number;
    totalTime: number;
    retryHistory: RetryAttempt[];
}
export interface RetryAttempt {
    attempt: number;
    startTime: number;
    duration: number;
    success: boolean;
    error?: Error;
    delay?: number;
}
export declare class RetryError extends Error {
    readonly attempts: number;
    readonly originalError: Error;
    readonly retryHistory: RetryAttempt[];
    constructor(message: string, attempts: number, originalError: Error, retryHistory: RetryAttempt[]);
}
export declare class RetryUtils {
    private static readonly DEFAULT_OPTIONS;
    /**
     * Execute a function with retry logic
     */
    static execute<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    /**
     * Execute a function with retry logic and return detailed result
     */
    static executeWithResult<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<RetryResult<T>>;
    /**
     * Create a retryable version of an async function
     */
    static retryable<TArgs extends any[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, options?: RetryOptions): (...args: TArgs) => Promise<TReturn>;
    /**
     * Retry with exponential backoff specifically for database operations
     */
    static executeDatabase<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
    /**
     * Retry with exponential backoff specifically for HTTP operations
     */
    static executeHttp<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
    /**
     * Retry with circuit breaker pattern
     */
    static executeWithCircuitBreaker<T>(operation: () => Promise<T>, circuitBreakerKey: string, options?: RetryOptions): Promise<T>;
    /**
     * Calculate delay with exponential backoff and jitter
     */
    private static calculateDelay;
    /**
     * Check if an error is retryable
     */
    private static isRetryableError;
    /**
     * Sleep for specified milliseconds
     */
    private static sleep;
    /**
     * Circuit breaker state management
     */
    private static circuitStates;
    private static getCircuitState;
}
/**
 * Retry decorators for class methods
 */
export declare function retryable(options?: RetryOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function retryableDatabase(options?: Partial<RetryOptions>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function retryableHttp(options?: Partial<RetryOptions>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Utility functions for common patterns
 */
export declare class RetryPatterns {
    /**
     * Retry pattern for file operations
     */
    static fileOperation<T>(operation: () => Promise<T>): Promise<T>;
    /**
     * Retry pattern for external API calls
     */
    static apiCall<T>(operation: () => Promise<T>, serviceName?: string): Promise<T>;
    /**
     * Retry pattern for log analysis operations
     */
    static logAnalysis<T>(operation: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=RetryUtils.d.ts.map