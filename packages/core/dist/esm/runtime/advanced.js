// packages/core/runtime/advanced.ts
// Advanced runtime node base classes and enhanced execution context for Epic 7
import { RuntimeNode } from './types';
import seedrandom from 'seedrandom';
/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
export class AdvancedRuntimeNode extends RuntimeNode {
    config;
    constructor(id, config) {
        super(id);
        this.config = config;
    }
    /**
     * Get the current state for this node from the execution context
     */
    getState(ctx) {
        return ctx.nodeStates.get(this.id);
    }
    /**
     * Set the current state for this node in the execution context
     */
    setState(ctx, state) {
        ctx.nodeStates.set(this.id, state);
    }
    /**
     * Create a seeded random number generator for this node
     * Uses node ID and execution context for deterministic behavior
     */
    createSeededRNG(seed, nodeSpecificSeed) {
        const combinedSeed = nodeSpecificSeed
            ? `${seed}-${this.id}-${nodeSpecificSeed}`
            : `${seed}-${this.id}`;
        return seedrandom(combinedSeed);
    }
    /**
     * Check if a result is cached and return it, or cache a new result
     */
    withCache(ctx, key, computation) {
        if (!this.config.cacheable) {
            return computation();
        }
        const cacheKey = `${this.id}-${key}`;
        if (ctx.cache.has(cacheKey)) {
            return ctx.cache.get(cacheKey);
        }
        const result = computation();
        ctx.cache.set(cacheKey, result);
        return result;
    }
    /**
     * Track performance metrics for this node
     */
    startPerformanceTracking(ctx) {
        if (ctx.performanceMetrics) {
            ctx.performanceMetrics.set(this.id, { startTime: Date.now() });
        }
    }
    /**
     * Complete performance tracking for this node
     */
    endPerformanceTracking(ctx) {
        if (ctx.performanceMetrics) {
            const metrics = ctx.performanceMetrics.get(this.id);
            if (metrics) {
                metrics.endTime = Date.now();
            }
        }
    }
    /**
     * Get execution time for this node (in milliseconds)
     */
    getExecutionTime(ctx) {
        if (!ctx.performanceMetrics)
            return null;
        const metrics = ctx.performanceMetrics.get(this.id);
        if (!metrics || !metrics.endTime)
            return null;
        return metrics.endTime - metrics.startTime;
    }
    /**
     * Check if execution depth exceeds maximum (cycle detection)
     */
    checkExecutionDepth(ctx, maxDepth = 100) {
        if (ctx.evaluationDepth > maxDepth) {
            throw new Error(`Maximum execution depth (${maxDepth}) exceeded - possible cycle detected`);
        }
    }
}
/**
 * Helper utilities for validation
 */
export class ValidationHelpers {
    /**
     * Validate that a value is within a numeric range
     */
    static validateRange(value, min, max, fieldName) {
        const errors = [];
        const warnings = [];
        if (value < min) {
            errors.push(`${fieldName} must be at least ${min} (got ${value})`);
        }
        if (value > max) {
            errors.push(`${fieldName} must be at most ${max} (got ${value})`);
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate that a string matches a pattern
     */
    static validatePattern(value, pattern, fieldName) {
        const errors = [];
        const warnings = [];
        if (!pattern.test(value)) {
            errors.push(`${fieldName} does not match required pattern ${pattern}`);
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate that required fields are present
     */
    static validateRequired(data, requiredFields) {
        const errors = [];
        const warnings = [];
        for (const field of requiredFields) {
            if (!(field in data) ||
                data[field] === null ||
                data[field] === undefined) {
                errors.push(`Required field '${field}' is missing`);
            }
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    /**
     * Combine multiple validation results
     */
    static combineResults(...results) {
        const errors = [];
        const warnings = [];
        for (const result of results) {
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }
        return { valid: errors.length === 0, errors, warnings };
    }
}
/**
 * Helper utilities for serialization
 */
export class SerializationHelpers {
    /**
     * Safely serialize a value for storage
     */
    static serialize(value) {
        return JSON.stringify(value, (key, val) => {
            // Handle special types
            if (val instanceof Map) {
                return { __type: 'Map', entries: Array.from(val.entries()) };
            }
            if (val instanceof Set) {
                return { __type: 'Set', values: Array.from(val.values()) };
            }
            if (val instanceof Date) {
                return { __type: 'Date', value: val.toISOString() };
            }
            if (val instanceof RegExp) {
                return { __type: 'RegExp', source: val.source, flags: val.flags };
            }
            return val;
        });
    }
    /**
     * Deserialize a value from storage
     */
    static deserialize(serialized) {
        return JSON.parse(serialized, (key, val) => {
            if (val && typeof val === 'object' && '__type' in val) {
                switch (val.__type) {
                    case 'Map':
                        return new Map(val.entries);
                    case 'Set':
                        return new Set(val.values);
                    case 'Date':
                        return new Date(val.value);
                    case 'RegExp':
                        return new RegExp(val.source, val.flags);
                }
            }
            return val;
        });
    }
    /**
     * Create a deep clone of a value
     */
    static deepClone(value) {
        return this.deserialize(this.serialize(value));
    }
}
