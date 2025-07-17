import { RuntimeNode, ExecutionContext } from './index';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface AdvancedNodeConfig {
    deterministic: boolean;
    cacheable: boolean;
    stateful: boolean;
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
export interface AdvancedExecutionContext extends ExecutionContext {
    nodeStates: Map<string, any>;
    evaluationDepth: number;
    cache: Map<string, any>;
    executionMeta: {
        startTime: number;
        nodeExecutionOrder: string[];
        performanceMetrics: Map<string, number>;
    };
}
export declare abstract class AdvancedRuntimeNode<TOutput = unknown> extends RuntimeNode<TOutput> {
    protected config: AdvancedNodeConfig;
    constructor(id: string, config: AdvancedNodeConfig);
    abstract run(ctx: AdvancedExecutionContext): Promise<TOutput> | TOutput;
    abstract validate(): ValidationResult;
    abstract serialize(): AdvancedNodeData;
    protected getState(ctx: AdvancedExecutionContext): any;
    protected setState(ctx: AdvancedExecutionContext, state: any): void;
    protected createSeededRNG(seed: string | number, nodeSpecificSeed?: string): () => number;
    protected withCache<T>(ctx: AdvancedExecutionContext, key: string, computation: () => T): T;
    protected recordPerformanceMetric(ctx: AdvancedExecutionContext, metric: string, value: number): void;
    protected measureExecution<T>(ctx: AdvancedExecutionContext, operation: string, fn: () => T): T;
    getConfig(): AdvancedNodeConfig;
    isCompatibleWithBasicContext(): boolean;
}
export declare class AdvancedExecutionUtils {
    static enhanceContext(basicCtx: ExecutionContext): AdvancedExecutionContext;
    static clearExecutionState(ctx: AdvancedExecutionContext): void;
    static detectInfiniteLoop(ctx: AdvancedExecutionContext, nodeId: string): boolean;
    static getExecutionStats(ctx: AdvancedExecutionContext): {
        totalDuration: number;
        nodesExecuted: number;
        cacheHits: number;
        statefulness: number;
    };
}
export declare class ValidationHelpers {
    static createValidResult(): ValidationResult;
    static createInvalidResult(errors: string[], warnings?: string[]): ValidationResult;
    static validateRequired(value: any, fieldName: string): string[];
    static validateArray(value: any, fieldName: string, minLength?: number): string[];
    static validateNumericRange(value: any, fieldName: string, min?: number, max?: number): string[];
}
export declare abstract class AdvancedRuntimeNodeWithIO<TOutput = unknown> extends AdvancedRuntimeNode<TOutput> {
    protected ioHandler: any;
    constructor(id: string, config: AdvancedNodeConfig, ioSpec?: any);
    validate(): ValidationResult;
    protected validateNodeConfig(): ValidationResult;
}
export declare class SerializationHelpers {
    static createAdvancedNodeData(id: string, type: string, config: AdvancedNodeConfig, data: Record<string, any>): AdvancedNodeData;
    static validateSerializedData(data: AdvancedNodeData): ValidationResult;
}
//# sourceMappingURL=advanced.d.ts.map