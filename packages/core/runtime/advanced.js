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
     * Record performance metrics for this node execution
     */
    recordPerformanceMetric(ctx, metric, value) {
        const key = `${this.id}-${metric}`;
        ctx.executionMeta.performanceMetrics.set(key, value);
    }
    /**
     * Measure execution time of a function and record it
     */
    measureExecution(ctx, operation, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        this.recordPerformanceMetric(ctx, `${operation}_duration_ms`, duration);
        return result;
    }
    /**
     * Get configuration for this node
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Check if this node is compatible with basic execution context
     * Advanced nodes should gracefully degrade when possible
     */
    isCompatibleWithBasicContext() {
        return !this.config.stateful;
    }
}
/**
 * Concrete implementation of AdvancedExecutionContext for tests and direct instantiation
 */
export class AdvancedExecutionContextImpl {
    variables;
    seed;
    nodeStates;
    evaluationDepth;
    cache;
    executionMeta;
    inputs;
    outputs;
    constructor(seed, variables = {}) {
        this.variables = { ...variables };
        this.seed = seed;
        this.nodeStates = new Map();
        this.evaluationDepth = 0;
        this.cache = new Map();
        this.executionMeta = {
            startTime: performance.now(),
            nodeExecutionOrder: [],
            performanceMetrics: new Map()
        };
        this.inputs = {};
        this.outputs = {};
    }
}
// Export the implementation class
export { AdvancedExecutionContextImpl as AdvancedExecutionContext };
/**
 * Utility functions for working with advanced execution contexts
 */
export class AdvancedExecutionUtils {
    /**
     * Create an enhanced execution context from a basic one
     */
    static enhanceContext(basicCtx) {
        return {
            ...basicCtx,
            nodeStates: new Map(),
            evaluationDepth: 0,
            cache: new Map(),
            executionMeta: {
                startTime: performance.now(),
                executionId: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                nodeExecutionOrder: [],
                performanceMetrics: new Map()
            }
        };
    }
    /**
     * Clear stateful data from context (for cleanup between executions)
     */
    static clearExecutionState(ctx) {
        ctx.nodeStates.clear();
        ctx.cache.clear();
        ctx.evaluationDepth = 0;
        ctx.executionMeta.nodeExecutionOrder.length = 0;
        ctx.executionMeta.performanceMetrics.clear();
        ctx.executionMeta.startTime = performance.now();
    }
    /**
     * Check for potential infinite loops in stateful node execution
     */
    static detectInfiniteLoop(ctx, nodeId) {
        const MAX_DEPTH = 1000; // Configurable limit
        return ctx.evaluationDepth > MAX_DEPTH;
    }
    /**
     * Get execution statistics from the context
     */
    static getExecutionStats(ctx) {
        const totalDuration = performance.now() - ctx.executionMeta.startTime;
        const nodesExecuted = ctx.executionMeta.nodeExecutionOrder.length;
        const cacheHits = ctx.cache.size;
        const statefulness = ctx.nodeStates.size;
        return {
            totalDuration,
            nodesExecuted,
            cacheHits,
            statefulness
        };
    }
}
/**
 * Standard validation helpers for advanced nodes
 */
export class ValidationHelpers {
    static createValidResult() {
        return { valid: true, errors: [], warnings: [] };
    }
    static createInvalidResult(errors, warnings = []) {
        return { valid: false, errors, warnings };
    }
    static validateRequired(value, fieldName) {
        return value === undefined || value === null || value === ''
            ? [`${fieldName} is required`]
            : [];
    }
    static validateArray(value, fieldName, minLength = 0) {
        const errors = [];
        if (!Array.isArray(value)) {
            errors.push(`${fieldName} must be an array`);
        }
        else if (value.length < minLength) {
            errors.push(`${fieldName} must have at least ${minLength} items`);
        }
        return errors;
    }
    static validateNumericRange(value, fieldName, min, max) {
        const errors = [];
        if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${fieldName} must be a valid number`);
        }
        else {
            if (min !== undefined && value < min) {
                errors.push(`${fieldName} must be at least ${min}`);
            }
            if (max !== undefined && value > max) {
                errors.push(`${fieldName} must be at most ${max}`);
            }
        }
        return errors;
    }
}
/**
 * Enhanced AdvancedRuntimeNode with I/O system integration
 */
export class AdvancedRuntimeNodeWithIO extends AdvancedRuntimeNode {
    ioHandler; // Will be imported from io-system
    constructor(id, config, ioSpec) {
        super(id, config);
        if (ioSpec) {
            // Dynamic import to avoid circular dependency
            import('./io-system').then(({ AdvancedIOHandler }) => {
                this.ioHandler = new AdvancedIOHandler(ioSpec);
            });
        }
    }
    /**
     * Validate node configuration including I/O specification
     */
    validate() {
        const baseValidation = this.validateNodeConfig();
        if (!this.ioHandler) {
            return baseValidation;
        }
        // Additional I/O validation would go here
        return baseValidation;
    }
    /**
     * Base node configuration validation
     */
    validateNodeConfig() {
        // Override in subclasses for node-specific validation
        return ValidationHelpers.createValidResult();
    }
}
/**
 * Standard node data serialization helpers
 */
export class SerializationHelpers {
    static createAdvancedNodeData(id, type, config, data) {
        return {
            id,
            type,
            config,
            data,
            metadata: {
                version: '1.0.0',
                created: new Date().toISOString()
            }
        };
    }
    static validateSerializedData(data) {
        const errors = [];
        if (!data.id)
            errors.push('Node ID is required');
        if (!data.type)
            errors.push('Node type is required');
        if (!data.config)
            errors.push('Node config is required');
        if (!data.data)
            errors.push('Node data is required');
        if (data.config) {
            if (typeof data.config.deterministic !== 'boolean') {
                errors.push('Config.deterministic must be a boolean');
            }
            if (typeof data.config.cacheable !== 'boolean') {
                errors.push('Config.cacheable must be a boolean');
            }
            if (typeof data.config.stateful !== 'boolean') {
                errors.push('Config.stateful must be a boolean');
            }
        }
        return errors.length > 0
            ? ValidationHelpers.createInvalidResult(errors)
            : ValidationHelpers.createValidResult();
    }
}
