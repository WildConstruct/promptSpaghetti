import { RuntimeNode, ExecutionContext } from './types';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface AdvancedNodeConfig {
    /** Whether this node uses deterministic (seeded) random behavior */
    deterministic: boolean;
    /** Whether results can be cached for performance optimization */
    cacheable: boolean;
    /** Whether this node maintains state between executions */
    stateful: boolean;
    /** Optional performance hints */
    performanceHints?: {
        expectedExecutionTime?: 'fast' | 'medium' | 'slow';
        memoryUsage?: 'low' | 'medium' | 'high';
    };
}
export interface AdvancedNodeData {
    id: string;
    type: string;
    config: AdvancedNodeConfig;
    data: Record<string, any>;
    metadata?: {
        version: string;
        created: string;
        lastModified?: string;
    };
}
/**
 * Enhanced execution context for advanced nodes with state management and caching
 */
export interface AdvancedExecutionContext extends ExecutionContext {
    /** State storage for stateful nodes (nodeId -> state) */
    nodeStates: Map<string, any>;
    /** Current evaluation depth (for cycle detection) */
    evaluationDepth: number;
    /** Performance cache for expensive operations (key -> result) */
    cache: Map<string, any>;
    /** Execution metadata and debugging info */
    executionMeta: {
        startTime: number;
        nodeExecutionOrder: string[];
        performanceMetrics: Map<string, number>;
    };
    /** Optional inputs for nodes */
    inputs?: Record<string, any>;
    /** Optional outputs storage */
    outputs?: Record<string, any>;
}
/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
export declare abstract class AdvancedRuntimeNode<TOutput = unknown> extends RuntimeNode<TOutput> {
    protected config: AdvancedNodeConfig;
    constructor(id: string, config: AdvancedNodeConfig);
    /**
     * Enhanced run method with advanced execution context
     * Maintains backward compatibility with basic ExecutionContext
     */
    abstract run(ctx: AdvancedExecutionContext): Promise<TOutput> | TOutput;
    /**
     * Validate the node's configuration and state
     * Called before execution to ensure node is properly configured
     */
    abstract validate(): ValidationResult;
    /**
     * Serialize the node's complete state for persistence/export
     * Includes configuration, data, and any persistent state
     */
    abstract serialize(): AdvancedNodeData;
    /**
     * Get the current state for this node from the execution context
     */
    protected getState(ctx: AdvancedExecutionContext): any;
    /**
     * Set the current state for this node in the execution context
     */
    protected setState(ctx: AdvancedExecutionContext, state: any): void;
    /**
     * Create a seeded random number generator for this node
     * Uses node ID and execution context for deterministic behavior
     */
    protected createSeededRNG(seed: string | number, nodeSpecificSeed?: string): () => number;
    /**
     * Check if a result is cached and return it, or cache a new result
     */
    protected withCache<T>(ctx: AdvancedExecutionContext, key: string, computation: () => T): T;
    /**
     * Record performance metrics for this node execution
     */
    protected recordPerformanceMetric(ctx: AdvancedExecutionContext, metric: string, value: number): void;
    /**
     * Measure execution time of a function and record it
     */
    protected measureExecution<T>(ctx: AdvancedExecutionContext, operation: string, fn: () => T): T;
    /**
     * Get configuration for this node
     */
    getConfig(): AdvancedNodeConfig;
    /**
     * Check if this node is compatible with basic execution context
     * Advanced nodes should gracefully degrade when possible
     */
    isCompatibleWithBasicContext(): boolean;
}
/**
 * Utility functions for working with advanced execution contexts
 */
export declare class AdvancedExecutionUtils {
    /**
     * Create an enhanced execution context from a basic one
     */
    static enhanceContext(basicCtx: ExecutionContext): AdvancedExecutionContext;
    /**
     * Clear stateful data from context (for cleanup between executions)
     */
    static clearExecutionState(ctx: AdvancedExecutionContext): void;
    /**
     * Check for potential infinite loops in stateful node execution
     */
    static detectInfiniteLoop(ctx: AdvancedExecutionContext, nodeId: string): boolean;
    /**
     * Get execution statistics from the context
     */
    static getExecutionStats(ctx: AdvancedExecutionContext): {
        totalDuration: number;
        nodesExecuted: number;
        cacheHits: number;
        statefulness: number;
    };
}
/**
 * Standard validation helpers for advanced nodes
 */
export declare class ValidationHelpers {
    static createValidResult(): ValidationResult;
    static createInvalidResult(errors: string[], warnings?: string[]): ValidationResult;
    static validateRequired(value: any, fieldName: string): string[];
    static validateArray(value: any, fieldName: string, minLength?: number): string[];
    static validateNumericRange(value: any, fieldName: string, min?: number, max?: number): string[];
}
/**
 * Enhanced AdvancedRuntimeNode with I/O system integration
 */
export declare abstract class AdvancedRuntimeNodeWithIO<TOutput = unknown> extends AdvancedRuntimeNode<TOutput> {
    protected ioHandler: any;
    constructor(id: string, config: AdvancedNodeConfig, ioSpec?: any);
    /**
     * Validate node configuration including I/O specification
     */
    validate(): ValidationResult;
    /**
     * Base node configuration validation
     */
    protected validateNodeConfig(): ValidationResult;
}
/**
 * Standard node data serialization helpers
 */
export declare class SerializationHelpers {
    static createAdvancedNodeData(id: string, type: string, config: AdvancedNodeConfig, data: Record<string, any>): AdvancedNodeData;
    static validateSerializedData(data: AdvancedNodeData): ValidationResult;
}
//# sourceMappingURL=advanced.d.ts.map