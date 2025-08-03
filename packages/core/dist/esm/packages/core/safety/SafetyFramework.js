/**
 * Epic 1 Safety Framework
 * Provides risk mitigation and safety controls for brownfield rebuild
 */
import { z } from 'zod';
/**
 * Core safety framework for Epic 1 rebuild
 */
export class SafetyFramework {
    static instance;
    rollbackPoints = new Map();
    healthChecks = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new SafetyFramework();
        }
        return this.instance;
    }
    /**
     * Register a health check
     */
    registerHealthCheck(name, check) {
        this.healthChecks.set(name, check);
    }
    /**
     * Run all health checks
     */
    async runHealthChecks() {
        const results = {};
        for (const [name, check] of this.healthChecks) {
            try {
                results[name] = await check();
            }
            catch (error) {
                results[name] = {
                    passed: false,
                    warnings: [],
                    errors: [`Health check failed: ${error.message}`],
                };
            }
        }
        return results;
    }
    /**
     * Create a rollback point
     */
    createRollbackPoint(id, description, data) {
        const point = {
            id,
            timestamp: new Date(),
            description,
            data,
            canRollback: true,
        };
        this.rollbackPoints.set(id, point);
        return point;
    }
    /**
     * Execute rollback to a specific point
     */
    async rollback(pointId) {
        const point = this.rollbackPoints.get(pointId);
        if (!point) {
            return {
                passed: false,
                warnings: [],
                errors: [`Rollback point ${pointId} not found`],
            };
        }
        if (!point.canRollback) {
            return {
                passed: false,
                warnings: [],
                errors: [`Rollback point ${pointId} is no longer valid`],
            };
        }
        // Implementation would restore system state from point.data
        // This is a placeholder for the actual rollback logic
        return {
            passed: true,
            warnings: [],
            errors: [],
            metadata: {
                rolledBackTo: pointId,
                timestamp: point.timestamp,
            },
        };
    }
}
/**
 * Feature flag management for safe feature rollout
 */
export class FeatureFlags {
    static instance;
    flags = new Map();
    rolloutPercentages = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new FeatureFlags();
        }
        return this.instance;
    }
    /**
     * Check if a feature is enabled
     */
    isEnabled(flagKey, userId) {
        const baseEnabled = this.flags.get(flagKey) ?? false;
        if (!baseEnabled) {
            return false;
        }
        // Check rollout percentage if set
        const rolloutPercentage = this.rolloutPercentages.get(flagKey);
        if (rolloutPercentage !== undefined && userId) {
            // Simple hash-based rollout
            const hash = this.hashUserId(userId);
            return (hash % 100) < rolloutPercentage;
        }
        return baseEnabled;
    }
    /**
     * Set a feature flag
     */
    setFlag(flagKey, enabled, rolloutPercentage) {
        this.flags.set(flagKey, enabled);
        if (rolloutPercentage !== undefined) {
            this.rolloutPercentages.set(flagKey, rolloutPercentage);
        }
    }
    /**
     * Get all feature flags
     */
    getAllFlags() {
        const result = {};
        for (const [key, enabled] of this.flags) {
            result[key] = {
                enabled,
                rolloutPercentage: this.rolloutPercentages.get(key),
            };
        }
        return result;
    }
    hashUserId(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}
/**
 * Performance monitoring for detecting degradation
 */
export class PerformanceMonitor {
    static instance;
    metrics = new Map();
    thresholds = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new PerformanceMonitor();
        }
        return this.instance;
    }
    /**
     * Record a metric
     */
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        const values = this.metrics.get(name);
        values.push(value);
        // Keep only last 100 values
        if (values.length > 100) {
            values.shift();
        }
    }
    /**
     * Set a performance threshold
     */
    setThreshold(name, threshold) {
        this.thresholds.set(name, threshold);
    }
    /**
     * Check if performance is within thresholds
     */
    checkPerformance() {
        const warnings = [];
        const errors = [];
        for (const [name, threshold] of this.thresholds) {
            const values = this.metrics.get(name);
            if (!values || values.length === 0) {
                continue;
            }
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            if (average > threshold) {
                errors.push(`${name} average (${average.toFixed(2)}) exceeds threshold (${threshold})`);
            }
            else if (max > threshold * 1.5) {
                warnings.push(`${name} max value (${max.toFixed(2)}) is high`);
            }
        }
        return {
            passed: errors.length === 0,
            warnings,
            errors,
        };
    }
}
/**
 * Data validation for preventing corruption
 */
export const DataValidation = {
    /**
     * Validate graph data structure
     */
    validateGraph: z.object({
        nodes: z.array(z.object({
            id: z.string(),
            type: z.string(),
            data: z.record(z.any()),
            position: z.object({
                x: z.number(),
                y: z.number(),
            }),
        })),
        edges: z.array(z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().optional(),
            targetHandle: z.string().optional(),
        })),
    }),
    /**
     * Validate user data
     */
    validateUserData: z.object({
        id: z.string(),
        email: z.string().email(),
        createdAt: z.string().datetime(),
        preferences: z.record(z.any()).optional(),
    }),
    /**
     * Validate API requests
     */
    validateApiRequest: z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        path: z.string(),
        headers: z.record(z.string()),
        body: z.any().optional(),
    }),
};
/**
 * Error recovery mechanisms
 */
export class ErrorRecovery {
    static instance;
    errorCounts = new Map();
    circuitBreakers = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new ErrorRecovery();
        }
        return this.instance;
    }
    /**
     * Record an error
     */
    recordError(category) {
        const count = (this.errorCounts.get(category) || 0) + 1;
        this.errorCounts.set(category, count);
        // Trip circuit breaker if too many errors
        if (count > 10) {
            this.circuitBreakers.set(category, true);
        }
    }
    /**
     * Check if circuit breaker is tripped
     */
    isCircuitBreakerTripped(category) {
        return this.circuitBreakers.get(category) || false;
    }
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(category) {
        this.circuitBreakers.set(category, false);
        this.errorCounts.set(category, 0);
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {};
        for (const [category, count] of this.errorCounts) {
            stats[category] = {
                count,
                circuitBreakerTripped: this.circuitBreakers.get(category) || false,
            };
        }
        return stats;
    }
}
// Export singleton instances
export const safety = SafetyFramework.getInstance();
export const featureFlags = FeatureFlags.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorRecovery = ErrorRecovery.getInstance();
