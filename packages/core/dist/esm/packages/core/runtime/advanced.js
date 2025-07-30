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
        /**
         * Enhanced run method with advanced execution context
         * Maintains backward compatibility with basic ExecutionContext
         */
        abstract;
        run(ctx, AdvancedExecutionContext);
        (Promise) | TOutput;
        /**
         * Validate the node's configuration and state
         * Called before execution to ensure node is properly configured
         */
        abstract;
        validate();
        ValidationResult;
        /**
         * Serialize the node's complete state for persistence/export
         * Includes configuration, data, and any persistent state
         */
        abstract;
        serialize();
        AdvancedNodeData;
        /**
         * Get the current state for this node from the execution context
         */
    }
    /**
     * Get the current state for this node from the execution context
     */
    getState(ctx) {
        return ctx.nodeStates.get(this.id);
        /**
         * Set the current state for this node in the execution context
         */
    }
    /**
     * Set the current state for this node in the execution context
     */
    setState(ctx, state) {
        ctx.nodeStates.set(this.id, state);
        /**
         * Create a seeded random number generator for this node
         * Uses node ID and execution context for deterministic behavior
         */
    }
    /**
     * Create a seeded random number generator for this node
     * Uses node ID and execution context for deterministic behavior
     */
    createSeededRNG(seed, nodeSpecificSeed) {
        const combinedSeed = nodeSpecificSeed;
        `${seed}-${this.id}-${nodeSpecificSeed}`;
    }
}
`${seed}-${this.id}`;
return seedrandom(combinedSeed);
withCache();
ctx: AdvancedExecutionContext,
    key;
string,
    computation;
() => T;
T;
{
    if (!this.config.cacheable) {
        return computation();
        const cacheKey = `${this.id}-${key}`;
    }
    if (ctx.cache.has(cacheKey)) {
        return ctx.cache.get(cacheKey);
        const result = computation();
        ctx.cache.set(cacheKey, result);
        return result;
        recordPerformanceMetric(ctx, AdvancedExecutionContext, metric, string, value, number);
        void {
            const: key = `${this.id}-${metric}`
        };
        ctx.executionMeta.performanceMetrics.set(key, value);
        measureExecution();
        ctx: AdvancedExecutionContext,
            operation;
        string,
            fn;
        () => T;
        T;
        {
            const start = performance.now();
            const result = fn();
            const duration = performance.now() - start;
            this.recordPerformanceMetric(ctx, `${operation}_duration_ms`, duration);
        }
        return result;
        /**
         * Get configuration for this node
         */
        getConfig();
        AdvancedNodeConfig;
        {
            return { ...this.config };
            /**
             * Check if this node is compatible with basic execution context
             * Advanced nodes should gracefully degrade when possible
             */
            isCompatibleWithBasicContext();
            boolean;
            {
                return !this.config.stateful;
                /**
                * Concrete implementation of AdvancedExecutionContext for tests and direct instantiation
                */
                export class AdvancedExecutionContextImpl {
                    variables;
                    seed;
                    nodeStates;
                    evaluationDepth;
                    cache;
                    prng;
                    executionMeta;
                    inputs;
                    outputs;
                    constructor(seed, variables = {}) {
                        this.variables = { ...variables };
                        this.seed = seed;
                        this.nodeStates = new Map();
                        this.evaluationDepth = 0;
                        this.cache = new Map();
                        this.prng = seedrandom(String(seed));
                        this.executionMeta = {
                            startTime: performance.now(),
                            executionId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        };
                    }
                    nodeExecutionOrder;
                    performanceMetrics;
                    ;
                }
                ;
                this.inputs = {};
                this.outputs = {};
                // Export the implementation class 
                // Note: Interface AdvancedExecutionContext is already exported above
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
                            prng: seedrandom(String(basicCtx.seed)),
                            executionMeta: {
                                startTime: performance.now(),
                                executionId: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                            }
                        },
                            nodeExecutionOrder;
                        [],
                            performanceMetrics;
                        new Map();
                    }
                    ;
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
                        /**
                        * Check for potential infinite loops in stateful node execution
                        */
                    }
                    /**
                    * Check for potential infinite loops in stateful node execution
                    */
                    static detectInfiniteLoop(ctx, nodeId) {
                        const MAX_DEPTH = 1000; // Configurable limit;
                        return ctx.evaluationDepth > MAX_DEPTH;
                        /**
                        * Get execution statistics from the context
                        */
                    }
                    totalDuration = performance.now() - ctx.executionMeta.startTime;
                    nodesExecuted = ctx.executionMeta.nodeExecutionOrder.length;
                    cacheHits = ctx.cache.size;
                    statefulness = ctx.nodeStates.size;
                }
                return {
                    totalDuration,
                    nodesExecuted,
                    cacheHits,
                    statefulness
                };
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
                            ? [`${fieldName} is required`] : ;
                    }
                    static validateArray(value, fieldName, minLength = 0) {
                        const errors = [];
                        if (!Array.isArray(value)) {
                            errors.push(`${fieldName} must be an array`);
                        }
                    }
                    if(value, length, , minLength) {
                        errors.push(`${fieldName} must have at least ${minLength} items`);
                    }
                }
                return errors;
                validateNumericRange(value, unknown);
                fieldName: string,
                    min ?  : number,
                    max ?  : number;
                string;
                {
                    const errors = [];
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors.push(`${fieldName} must be a valid number`);
                    }
                }
                {
                    if (min !== undefined && value < min) {
                        errors.push(`${fieldName} must be at least ${min}`);
                    }
                    if (max !== undefined && value > max) {
                        errors.push(`${fieldName} must be at most ${max}`);
                    }
                    return errors;
                    /**
                     * Enhanced AdvancedRuntimeNode with I/O system integration
                     */
                    export class AdvancedRuntimeNodeWithIO extends AdvancedRuntimeNode {
                        ioHandler; // Will be imported from io-system
                        constructor(id, config, ioSpec) {
                            super(id, config);
                            if (ioSpec && typeof ioSpec === 'object' && ioSpec !== null && 'inputs' in ioSpec && 'outputs' in ioSpec) {
                                // Dynamic import to avoid circular dependency
                                import('./io-system').then(({ AdvancedIOHandler }) => {
                                    // Use type assertion since we already validated the structure
                                    this.ioHandler = new AdvancedIOHandler(ioSpec);
                                });
                                /**
                                 * Validate node configuration including I/O specification
                                 */
                                validate();
                                ValidationResult;
                                {
                                    const baseValidation = this.validateNodeConfig();
                                    if (!this.ioHandler) {
                                        return baseValidation;
                                        // Additional I/O validation would go here
                                        return baseValidation;
                                        /**
                                        * Base node configuration validation
                                        */
                                    }
                                    /**
                                    * Base node configuration validation
                                    */
                                }
                                /**
                                * Base node configuration validation
                                */
                            }
                            /**
                            * Base node configuration validation
                            */
                        }
                        /**
                        * Base node configuration validation
                        */
                        validateNodeConfig() {
                            // Override in subclasses for node-specific validation
                            return ValidationHelpers.createValidResult();
                            /**
                            * Standard node data serialization helpers
                            */
                            export class SerializationHelpers {
                                type;
                                config;
                                data;
                                AdvancedNodeData;
                            }
                            {
                                return {
                                    id,
                                    type,
                                    config,
                                    data,
                                    metadata: {
                                        version: '1.0.0',
                                        created: new Date().toISOString(),
                                    },
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
                                                if (typeof data.config.cacheable !== 'boolean') {
                                                    errors.push('Config.cacheable must be a boolean');
                                                    if (typeof data.config.stateful !== 'boolean') {
                                                        errors.push('Config.stateful must be a boolean');
                                                        return errors.length > 0
                                                            ? ValidationHelpers.createInvalidResult(errors)
                                                            : ValidationHelpers.createValidResult();
                                                    }
                                                }
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
