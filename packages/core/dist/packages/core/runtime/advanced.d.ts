import { RuntimeNode, ExecutionContext } from './types';
export interface ValidationResult {
    valid: boolean;
    errors: string;
    warnings: string;
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
    data: Record<string, unknown>;
    metadata?: {
        version: string;
        created: string;
        lastModified?: string;
    };
}
export interface AdvancedExecutionContext extends ExecutionContext {
    /** State storage for stateful nodes (nodeId -> state) */
    nodeStates: Map<string, unknown>;
    /** Current evaluation depth (for cycle detection) */
    evaluationDepth: number;
    /** Performance cache for expensive operations (key -> result) */
    cache: Map<string, unknown>;
    /** Pseudorandom number generator function for deterministic execution */
    prng: () => number;
    /** Execution metadata and debugging info */
    executionMeta: {
        startTime: number;
        executionId: string;
        nodeExecutionOrder: string;
        performanceMetrics: Map<string, number>;
    };
    /** Optional inputs for nodes */
    inputs?: Record<string, unknown>;
    /** Optional outputs storage */
    outputs?: Record<string, unknown>;
}
/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
export declare abstract class AdvancedRuntimeNode<TOutput = unknown> extends RuntimeNode<TOutput> {
    protected config: AdvancedNodeConfig;
    constructor(id: string, config: AdvancedNodeConfig);
    /**
     * Get the current state for this node from the execution context
     */
    protected getState(ctx: AdvancedExecutionContext): unknown;
    /**
     * Set the current state for this node in the execution context
     */
    protected setState(ctx: AdvancedExecutionContext, state: unknown): void;
    /**
     * Create a seeded random number generator for this node
     * Uses node ID and execution context for deterministic behavior
     */
    protected createSeededRNG(seed: string | number, nodeSpecificSeed?: string): () => number;
}
//# sourceMappingURL=advanced.d.ts.map