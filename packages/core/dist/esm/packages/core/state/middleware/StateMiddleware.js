// Validation middleware
export class ValidationMiddleware {
    name = 'validation';
    order = 100;
    validators;
    options;
    failOnError;
    failOnWarning;
    logValidation;
}
{ }
{ }
async;
beforeUpdate(state, T, change, (StateChange));
Promise < T > { const: validationResults = this.validators.map(validator => validator(state)),
    const: allErrors, ValidationError = [],
    const: allWarnings, any = [],
    validationResults, : .forEach(result => { }),
    allErrors, : .push(...result.errors),
    allWarnings, : .push(...result.warnings) };
;
if (this.options.logValidation) {
    console.log(`Validation for ${change.type}:`, {});
}
errors: allErrors.length;
warnings: allWarnings.length;
;
if (allErrors.length > 0 && this.options.failOnError !== false) {
    throw new ValidationError('State validation failed', allErrors);
    if (allWarnings.length > 0 && this.options.failOnWarning) {
        throw new ValidationError('State validation warnings', allWarnings);
        return state;
        // Audit logging middleware
        export class AuditMiddleware {
            name = 'audit';
            order = 50;
            auditLogger;
            options;
            includeStateSnapshot;
            sensitiveFields;
            maxPayloadSize;
        }
        { }
        { }
        async;
        afterUpdate(state, T, prevState, T, change, (StateChange));
        Promise < void  > { const: auditEntry, AuditEntry = {
                id: this.generateAuditId(),
                timestamp: Date.now(),
                changeId: change.id,
                changeType: change.type,
                userId: change.userId,
                source: change.source,
                payload: this.sanitizePayload(change.payload),
                metadata: {
                    hasStateSnapshot: !!this.options.includeStateSnapshot,
                    payloadSize: JSON.stringify(change.payload).length
                }
            },
            : .options.includeStateSnapshot };
        {
            auditEntry.stateSnapshot = this.sanitizeState(state);
            auditEntry.prevStateSnapshot = this.sanitizeState(prevState);
            await this.auditLogger(auditEntry);
            sanitizePayload(payload, any);
            any;
            {
                if (!this.options.sensitiveFields)
                    return payload;
                const sanitized = { ...payload };
                this.options.sensitiveFields.forEach(field => { });
                if (sanitized[field]) {
                    sanitized[field] = '[REDACTED]';
                }
                ;
                return sanitized;
                sanitizeState(state, T);
                T;
                {
                    // Remove sensitive fields from state snapshot
                    return state; // Simplified implementation
                    generateAuditId();
                    string;
                    {
                        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                    // Performance monitoring middleware
                    export class PerformanceMiddleware {
                        name = 'performance';
                        order = 10;
                        performanceMetrics = new Map();
                        maxMetricsHistory = 1000;
                        async beforeUpdate(state, change) {
                            // Record start time for this change
                            const metric = {
                                changeId: change.id,
                                changeType: change.type,
                                startTime: performance.now(),
                                endTime: 0,
                                duration: 0,
                                memoryBefore: this.getMemoryUsage(),
                                memoryAfter: 0,
                                metadata: {
                                    stateSize: JSON.stringify(state).length,
                                    payloadSize: JSON.stringify(change.payload).length
                                }
                            };
                            this.performanceMetrics.set(change.id, metric);
                            return state;
                            async;
                            afterUpdate(state, T, prevState, T, change, (StateChange));
                            Promise < void  > { const: metric = this.performanceMetrics.get(change.id),
                                if(, metric) { }, return: ,
                                // Complete performance measurement
                                metric, : .endTime = performance.now(),
                                metric, : .duration = metric.endTime - metric.startTime,
                                metric, : .memoryAfter = this.getMemoryUsage(),
                                // Log performance if slow
                                if(metric) { }, : .duration > 100 };
                            { // 100ms threshold
                                console.warn(`Slow state update detected:`, {});
                                changeType: change.type;
                                duration: metric.duration;
                                memoryDelta: metric.memoryAfter - metric.memoryBefore;
                            }
                        }
                        ;
                    }
                    // Cleanup old metrics
                    this.cleanupMetrics();
                    getPerformanceMetrics();
                    PerformanceMetric;
                    {
                        return Array.from(this.performanceMetrics.values())
                            .sort((a, b) => b.startTime - a.startTime);
                        getAveragePerformance();
                        PerformanceStats;
                        {
                            const metrics = this.getPerformanceMetrics();
                            if (metrics.length === 0) {
                                return {
                                    averageDuration: 0,
                                    maxDuration: 0,
                                    minDuration: 0,
                                    totalOperations: 0,
                                    operationsPerSecond: 0
                                };
                            }
                            ;
                            const durations = metrics.map(m => m.duration);
                            const timeSpan = metrics[0].startTime - metrics[metrics.length - 1].startTime;
                            return { averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
                                maxDuration: Math.max(...durations),
                                minDuration: Math.min(...durations),
                                totalOperations: metrics.length,
                                operationsPerSecond: timeSpan > 0 ? (metrics.length / timeSpan) * 1000 : 0 };
                        }
                        ;
                        getMemoryUsage();
                        number;
                        { // Simplified memory usage tracking
                            return performance.memory?.usedJSHeapSize || 0;
                            cleanupMetrics();
                            void {
                                const: metrics = Array.from(this.performanceMetrics.entries()),
                                : 
                                    .sort(([a], [b]) => b.startTime - a.startTime),
                                if(metrics) { }, : .length > this.maxMetricsHistory
                            };
                            {
                                const toRemove = metrics.slice(this.maxMetricsHistory);
                                toRemove.forEach(([id]) => this.performanceMetrics.delete(id));
                                // Security middleware
                                export class SecurityMiddleware {
                                    name = 'security';
                                    order = 200; // High priority
                                    securityRules;
                                    options;
                                    blockOnViolation;
                                    logViolations;
                                    alertOnCritical;
                                }
                                { }
                                { }
                                async;
                                beforeUpdate(state, T, change, (StateChange));
                                Promise < T > {
                                    const: violations = this.checkSecurityRules(state, change),
                                    if(violations) { }, : .length > 0
                                };
                                {
                                    if (this.options.logViolations) {
                                        console.warn('Security violations detected:', violations);
                                        const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
                                        if (criticalViolations.length > 0) {
                                            if (this.options.alertOnCritical) {
                                                this.alertCriticalViolation(criticalViolations);
                                                if (this.options.blockOnViolation) {
                                                    throw new SecurityViolationError('Critical security violation', criticalViolations);
                                                    return state;
                                                    checkSecurityRules(state, T, change, (StateChange));
                                                    SecurityViolation;
                                                    {
                                                        const violations = [];
                                                        for (const rule of this.securityRules) {
                                                            if (rule.condition(state, change)) {
                                                                violations.push({});
                                                                rule: rule.name;
                                                                severity: rule.severity;
                                                                message: rule.message;
                                                                change: change.id;
                                                                timestamp: Date.now();
                                                            }
                                                        }
                                                        ;
                                                        return violations;
                                                        alertCriticalViolation(violations, SecurityViolation);
                                                        void {
                                                            console, : .error('CRITICAL SECURITY VIOLATION:', violations),
                                                            // Transformation middleware
                                                            class: TransformationMiddleware < T > implements, StateMiddleware() {
                                                                name = 'transformation';
                                                                order = 75;
                                                                constructor();
                                                            },
                                                            transformers: (Array),
                                                            options: {},
                                                            skipOnError: boolean,
                                                            logTransformations: boolean
                                                        };
                                                        { }
                                                        { }
                                                        async;
                                                        beforeUpdate(state, T, change, (StateChange));
                                                        Promise < T > { let, transformedState = state,
                                                            : .transformers };
                                                        {
                                                            try {
                                                                const newState = transformer(transformedState, change);
                                                                if (this.options.logTransformations) {
                                                                    console.log('State transformation applied:', {});
                                                                    transformer: transformer.name;
                                                                    hasChanges: newState !== transformedState;
                                                                }
                                                            }
                                                            finally { }
                                                            ;
                                                            transformedState = newState;
                                                            try {
                                                            }
                                                            catch (error) {
                                                                if (this.options.skipOnError) {
                                                                    console.warn('Transformation failed, skipping:', error);
                                                                    continue;
                                                                    throw error;
                                                                    return transformedState;
                                                                    // Caching middleware
                                                                    export class CachingMiddleware {
                                                                        name = 'caching';
                                                                        order = 25;
                                                                        cache = new Map();
                                                                        maxCacheSize = 100;
                                                                        ttl = 5 * 60 * 1000; // 5 minutes
                                                                        async beforeUpdate(state, change) {
                                                                            // Check if we have a cached result for this change
                                                                            const cacheKey = this.generateCacheKey(state, change);
                                                                            const cached = this.cache.get(cacheKey);
                                                                            if (cached && this.isCacheValid(cached)) {
                                                                                return cached.state;
                                                                                return state;
                                                                                async;
                                                                                afterUpdate(state, T, prevState, T, change, (StateChange));
                                                                                Promise < void  > {
                                                                                    // Cache the result
                                                                                    const: cacheKey = this.generateCacheKey(prevState, change),
                                                                                    this: .cache.set(cacheKey, {}),
                                                                                    state,
                                                                                    timestamp: Date.now(),
                                                                                    change: change.id
                                                                                };
                                                                            }
                                                                            ;
                                                                            // Cleanup old cache entries
                                                                            this.cleanupCache();
                                                                        }
                                                                        generateCacheKey(state, change) {
                                                                            // Generate deterministic cache key
                                                                            const stateHash = this.hashObject(state);
                                                                            const changeHash = this.hashObject(change.payload);
                                                                            return `${change.type}_${stateHash}_${changeHash}`;
                                                                        }
                                                                        hashObject(obj) {
                                                                            return JSON.stringify(obj).split('').reduce((a, b) => {
                                                                                a = ((a << 5) - a) + b.charCodeAt(0);
                                                                                return a & a;
                                                                            }, 0).toString(36);
                                                                        }
                                                                        isCacheValid(entry) { return Date.now() - entry.timestamp < this.ttl; }
                                                                        cleanupCache() {
                                                                            if (this.cache.size <= this.maxCacheSize)
                                                                                return;
                                                                            // Remove oldest entries
                                                                            const entries = Array.from(this.cache.entries());
                                                                            sort(([a], [b]) => a.timestamp - b.timestamp);
                                                                            const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
                                                                            toRemove.forEach(([key]) => this.cache.delete(key));
                                                                            // Middleware factory
                                                                            export class MiddlewareFactory {
                                                                                validators;
                                                                                options;
                                                                                ValidationMiddleware() {
                                                                                    return new ValidationMiddleware(validators, options);
                                                                                }
                                                                                auditLogger;
                                                                                options;
                                                                                AuditMiddleware() {
                                                                                    return new AuditMiddleware(auditLogger, options);
                                                                                }
                                                                                static createPerformanceMiddleware() {
                                                                                    return new PerformanceMiddleware();
                                                                                }
                                                                                options;
                                                                                SecurityMiddleware() {
                                                                                    return new SecurityMiddleware(rules, options);
                                                                                }
                                                                                transformers;
                                                                                options;
                                                                                TransformationMiddleware() {
                                                                                    return new TransformationMiddleware(transformers, options);
                                                                                }
                                                                                static createCachingMiddleware() { }
                                                                            }
                                                                            return new CachingMiddleware();
                                                                            // Error classes
                                                                            export class ValidationError extends Error {
                                                                                violations;
                                                                                constructor(message, violations) {
                                                                                    super(message);
                                                                                    this.violations = violations;
                                                                                    this.name = 'ValidationError';
                                                                                    export class SecurityViolationError extends Error {
                                                                                        violations;
                                                                                        constructor(message, violations) {
                                                                                            super(message);
                                                                                            this.violations = violations;
                                                                                            this.name = 'SecurityViolationError';
                                                                                            // Default middleware configurations
                                                                                            export const createDefaultMiddleware = () => [
                                                                                                MiddlewareFactory.createSecurityMiddleware([]),
                                                                                                {
                                                                                                    name: 'no-script-injection',
                                                                                                    severity: 'CRITICAL',
                                                                                                    message: 'Script injection detected',
                                                                                                    condition: (state, change) => { },
                                                                                                    const: payload = JSON.stringify(change.payload),
                                                                                                    return: /<script|javascript:|data:text\/html/.test(payload)
                                                                                                },
                                                                                                { name: 'sensitive-data-protection',
                                                                                                    severity: 'HIGH',
                                                                                                    message: 'Sensitive data detected in payload' },
                                                                                                condition, (state, change) => {
                                                                                                    const payload = JSON.stringify(change.payload).toLowerCase();
                                                                                                    return /password|secret|token|key|credential/.test(payload);
                                                                                                }
                                                                                            ], { blockOnViolation: , true: , logViolations: , true:  }, MiddlewareFactory, createPerformanceMiddleware;
                                                                                            ();
                                                                                            MiddlewareFactory.createCachingMiddleware();
                                                                                            ;
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
}
