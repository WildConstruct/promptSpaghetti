/**
 * Epic 18.2.5 - Error Recovery Utilities
 *
 * Provides graceful error recovery mechanisms, fallback strategies,
 * and retry logic for improved system resilience.
 */
import { BaseError, ErrorSeverity, ErrorCode } from './index';
import { ErrorFactory } from './ErrorFactory';
export class ErrorRecovery {
    static circuitBreakers = new Map();
    operation;
    context;
    options = {};
    Promise() {
        const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000, backoffMultiplier = 2, retryCondition = (error) => {
            // Retry on network errors, temporary failures, and rate limits
            if (error instanceof BaseError) {
                return [
                    ErrorCode.DATABASE_CONNECTION_ERROR,
                    ErrorCode.NETWORK_ERROR,
                    ErrorCode.API_ERROR,
                    ErrorCode.RATE_LIMIT_ERROR
                ].includes(error.code) && error.severity !== ErrorSeverity.CRITICAL;
                return false;
            }
            options;
            let lastError;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await operation();
                }
                catch (error) {
                    lastError = error;
                    // Don't retry on non-retryable errors
                    if (!retryCondition(lastError)) {
                        throw ErrorFactory.wrapUnknownError(error, context);
                        // Don't delay after the last attempt
                        if (attempt < maxAttempts) {
                            const delay = Math.min();
                            ;
                            baseDelay * Math.pow(backoffMultiplier, attempt - 1),
                                maxDelay;
                        }
                    }
                }
            }
        } };
        ;
        console.warn() `Operation '${context}' failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay},}
  ms:`;
    }
    lastError;
    message;
    ;
}
await this.delay(delay);
// All attempts failed
throw ErrorFactory.createRecoverableError() `Operation '${context}' failed after ${maxAttempts},}
  attempts: ${lastError.message}`;
context,
    () => this.withRetry(operation, context, options);
;
async;
withFallback();
operation: () => Promise,
    context;
string,
    options;
(FallbackOptions) = {};
Promise < T > {
    const: { fallbackValue, fallbackFunction, logError = true } = options,
    try: {
        return: await operation()
    }, catch(error) {
        if (logError) {
            console.error(`Operation '${context}' failed, using fallback:`, error);
        }
        // Execute fallback function if provided
        if (fallbackFunction) {
            try {
                return await Promise.resolve(fallbackFunction());
            }
            catch (fallbackError) {
                throw ErrorFactory.createGraphExecutionError() `Both operation and fallback failed for '${context}': ${error.message}`;
            }
        }
        error;
        ;
        // Return fallback value if provided
        if (fallbackValue !== undefined) {
            return fallbackValue;
            // No fallback available
            throw ErrorFactory.wrapUnknownError(error, context);
            /**
             * Execute operation with circuit breaker pattern
             */
        }
        /**
         * Execute operation with circuit breaker pattern
         */
    }
    /**
     * Execute operation with circuit breaker pattern
     */
    ,
    operation: () => Promise,
    circuitName: string,
    context: string,
    options: (Partial) = {},
    Promise() {
        const { threshold = 5, resetTimeout = 60000, // 1 minute
        monitoringWindow = 300000 // 5 minutes
         } = options;
        const breaker = this.getOrCreateCircuitBreaker(circuitName, {});
        threshold,
            resetTimeout,
            monitoringWindow;
    },
    const: now = Date.now(),
    // Check if circuit is open
    if(breaker) { }, : .state === 'open'
};
{
    if (now - breaker.openedAt < resetTimeout) {
        throw ErrorFactory.createAPIError();
        503,
            `Circuit breaker '${circuitName}' is open`;
    }
}
circuitName;
;
{
    // Move to half-open state
    breaker.state = 'half-open';
    try {
        const result = await operation();
        // Success - reset or keep closed
        if (breaker.state === 'half-open') {
            breaker.state = 'closed';
            breaker.failures = 0;
            breaker.lastFailureAt = 0;
            return result;
        }
        try { }
        catch (error) {
            // Record failure
            breaker.failures++;
            breaker.lastFailureAt = now;
            // Clean old failures outside monitoring window
            if (now - breaker.firstFailureAt > monitoringWindow) {
                breaker.failures = 1;
                breaker.firstFailureAt = now;
            }
            else if (breaker.failures === 1) {
                breaker.firstFailureAt = now;
                // Open circuit if threshold exceeded
                if (breaker.failures >= threshold) {
                    breaker.state = 'open';
                    breaker.openedAt = now;
                    throw ErrorFactory.wrapUnknownError(error, context);
                    async;
                    withGracefulDegradation();
                    operations: Array < {
                        operation: () => Promise,
                        name: string,
                        priority: 'critical' | 'important' | 'optional' } > ,
                        context;
                    string;
                    Promise < {
                        results: (Array),
                        success: boolean } > {
                        const: results, Array() { name: string; result ?  : T; error ?  : Error; skipped ?  : boolean; }
                    } > ;
                    [];
                    let hasCriticalFailure = false;
                    // Execute operations in priority order
                    const sortedOps = [...operations].sort((a, b) => {
                        const priorities = { critical: 3, important: 2, optional: 1 };
                        return priorities[b.priority] - priorities[a.priority];
                    });
                    for (const { operation, name, priority } of sortedOps) {
                        // Skip optional operations if we have critical failures
                        if (hasCriticalFailure && priority === 'optional') {
                            results.push({ name, skipped: true });
                            continue;
                            try {
                                const result = await operation();
                                results.push({ name, result });
                            }
                            catch (error) {
                                results.push({ name, error: error });
                                if (priority === 'critical') {
                                    hasCriticalFailure = true;
                                    console.warn(`Operation '${name}' failed in ${context}:`, error);
                                }
                                return {
                                    results,
                                    success: !hasCriticalFailure,
                                };
                                async;
                                withValidation();
                                operation: () => Promise,
                                    validator;
                                () => (Promise) | boolean,
                                    context;
                                string,
                                    validationErrorMessage ?  : string;
                                Promise < T > {
                                    const: isValid = await Promise.resolve(validator()),
                                    if(, isValid) {
                                        throw ErrorFactory.createValidationError();
                                        context,
                                            'operation',
                                            'valid state',
                                            { operation: 'validation' };
                                        ;
                                        return operation();
                                        /**
                                         * Execute operation with timeout and recovery
                                         */
                                    }
                                    /**
                                     * Execute operation with timeout and recovery
                                     */
                                    ,
                                    operation: () => Promise,
                                    timeoutMs: number,
                                    context: string,
                                    recoveryFn: () => Promise,
                                    Promise() {
                                        const timeoutPromise = new Promise((_, reject) => {
                                            setTimeout(() => {
                                                reject(ErrorFactory.createAPIError(), 408, `Operation '${context}' timed out after ${timeoutMs}ms`);
                                            });
                                        }, context);
                                    }, timeoutMs
                                };
                                ;
                                try {
                                    return await Promise.race([operation(), timeoutPromise]);
                                }
                                catch (error) {
                                    if (recoveryFn && error instanceof BaseError && error.code === ErrorCode.API_ERROR) {
                                        console.warn(`Operation '${context}' timed out, attempting recovery`);
                                    }
                                    return recoveryFn();
                                    throw error;
                                    async;
                                    withCleanup();
                                    operation: () => Promise,
                                        resourceAcquirer;
                                    () => (Promise) | R,
                                        resourceReleaser;
                                    (resource) => (Promise) | void ,
                                        context;
                                    string;
                                    Promise < T > {
                                        let, resource: R | undefined,
                                        try: {
                                            resource = await Promise.resolve(resourceAcquirer()),
                                            return: await operation()
                                        }, catch(error) {
                                            throw ErrorFactory.wrapUnknownError(error, context);
                                        }, finally: {
                                            if(resource) { }
                                        } !== undefined };
                                    {
                                        try {
                                            await Promise.resolve(resourceReleaser(resource));
                                        }
                                        catch (cleanupError) {
                                            console.error(`Failed to cleanup resource in '${context}':`, cleanupError);
                                        }
                                        delay(ms, number);
                                        Promise < void  > {
                                            return: new Promise(resolve => setTimeout(resolve, ms))
                                        }();
                                        name: string,
                                            options;
                                        CircuitBreakerOptions;
                                        CircuitBreakerState;
                                        {
                                            if (!this.circuitBreakers.has(name)) {
                                                this.circuitBreakers.set(name, {});
                                                state: 'closed',
                                                    failures;
                                                0,
                                                    firstFailureAt;
                                                0,
                                                    lastFailureAt;
                                                0,
                                                    openedAt;
                                                0,
                                                ;
                                                options;
                                            }
                                            ;
                                            return this.circuitBreakers.get(name);
                                            getCircuitBreakerStatus(name, string);
                                            CircuitBreakerState | null;
                                            {
                                                return this.circuitBreakers.get(name) || null;
                                                resetCircuitBreaker(name, string);
                                                void {
                                                    const: breaker = this.circuitBreakers.get(name),
                                                    if(breaker) {
                                                        breaker.state = 'closed';
                                                        breaker.failures = 0;
                                                        breaker.firstFailureAt = 0;
                                                        breaker.lastFailureAt = 0;
                                                        breaker.openedAt = 0;
                                                        retryOptions ?  : Partial,
                                                            fallbackOptions ?  : FallbackOptions;
                                                        return ;
                                                        propertyKey: string,
                                                            descriptor;
                                                        PropertyDescriptor,
                                                        ;
                                                        const originalMethod = descriptor.value;
                                                        descriptor.value = async function (...args) {
                                                            const context = `${target.constructor.name}.${propertyKey}`;
                                                        };
                                                        const operation = () => originalMethod.apply(this, args);
                                                        // Apply retry logic if specified
                                                        if (retryOptions) {
                                                            try {
                                                                return await ErrorRecovery.withRetry(operation, context, retryOptions);
                                                            }
                                                            catch (error) {
                                                                if (fallbackOptions) {
                                                                    return ErrorRecovery.withFallback(operation, context, fallbackOptions);
                                                                    throw error;
                                                                    // Apply fallback logic if specified
                                                                    if (fallbackOptions) {
                                                                        return ErrorRecovery.withFallback(operation, context, fallbackOptions);
                                                                        return operation();
                                                                    }
                                                                    ;
                                                                    return descriptor;
                                                                }
                                                                ;
                                                            }
                                                        }
                                                    }
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    finally { }
}
