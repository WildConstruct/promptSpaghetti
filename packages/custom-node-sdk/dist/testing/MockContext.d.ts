/**
 * @fileoverview MockContext - Provides mock execution contexts for testing custom nodes
 * Creates realistic test environments without requiring full PromptScape runtime
 */
import { AdvancedExecutionContext } from '@prompt-spaghetti/graph-core';
/**
 * Configuration for creating mock execution contexts
 */
export interface MockContextConfig {
    /** Seed for deterministic random generation */
    seed?: string;
    /** Initial variables */
    variables?: Record<string, any>;
    /** Node states for stateful testing */
    nodeStates?: Record<string, any>;
    /** Maximum evaluation depth */
    maxDepth?: number;
    /** Enable performance tracking */
    trackPerformance?: boolean;
}
/**
 * Creates mock execution contexts for testing custom nodes
 */
export declare class MockContextFactory {
    /**
     * Create a mock AdvancedExecutionContext for testing
     */
    static create(config?: MockContextConfig): AdvancedExecutionContext;
    /**
     * Create a minimal context with just the essentials
     */
    static createMinimal(variables?: Record<string, any>): AdvancedExecutionContext;
    /**
     * Create a context for testing stateful nodes
     */
    static createStateful(variables?: Record<string, any>, initialStates?: Record<string, any>): AdvancedExecutionContext;
    /**
     * Create a context with pre-loaded cache for testing performance scenarios
     */
    static createWithCache(variables?: Record<string, any>, cacheEntries?: Record<string, any>): AdvancedExecutionContext;
}
/**
 * Helper to create deterministic test scenarios
 */
export declare class TestScenarios {
    /**
     * Create a scenario for testing string processing nodes
     */
    static stringProcessing(input: string): AdvancedExecutionContext;
    /**
     * Create a scenario for testing numeric computation nodes
     */
    static numericComputation(numbers: number[]): AdvancedExecutionContext;
    /**
     * Create a scenario for testing conditional logic nodes
     */
    static conditionalLogic(condition: boolean, trueValue: any, falseValue: any): AdvancedExecutionContext;
    /**
     * Create a scenario for testing array processing nodes
     */
    static arrayProcessing(items: any[]): AdvancedExecutionContext;
    /**
     * Create a scenario for testing object manipulation nodes
     */
    static objectManipulation(object: Record<string, any>): AdvancedExecutionContext;
    /**
     * Create a scenario for testing error handling
     */
    static errorHandling(shouldError?: boolean): AdvancedExecutionContext;
}
//# sourceMappingURL=MockContext.d.ts.map