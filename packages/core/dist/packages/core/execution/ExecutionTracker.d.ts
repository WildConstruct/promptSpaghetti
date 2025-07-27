/**
 * Execution Path Tracker
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 *
 * Tracks the execution path of graph processing for visualization
 */
import { ExecutionTracker, ExecutionPath, NodeExecutionStep, RandomChoiceInfo, ExecutionPathColor } from '../types/ExecutionPath.js';
export declare class GraphExecutionTracker implements ExecutionTracker {
    private static instance;
    private activeExecutions;
    private executionCounter;
    static getInstance(): GraphExecutionTracker;
    /**
     * Start tracking a new execution
     */
    startTracking(seed: number): string;
    /**
     * Record a node execution step
     */
    recordNodeExecution(executionId: string, step: NodeExecutionStep): void;
    /**
     * Record a random choice made during execution
     */
    recordRandomChoice(executionId: string, choice: RandomChoiceInfo): void;
    /**
     * Finish tracking and return complete execution path
     */
    finishTracking(executionId: string, output: string): ExecutionPath;
    /**
     * Get current execution path (for debugging)
     */
    getExecutionPath(executionId: string): ExecutionPath | null;
    /**
     * Clear tracking data
     */
    clearTracker(executionId: string): void;
    /**
     * Clear all tracking data (cleanup)
     */
    clearAllTrackers(): void;
    /**
     * Get statistics about active executions
     */
    getTrackingStats(): {
        activeExecutions: number;
        totalExecutionsTracked: number;
    };
}
/**
 * Utility functions for execution path analysis
 */
export declare class ExecutionPathAnalyzer {
    /**
     * Calculate execution path variance across multiple results
     */
    static calculatePathVariance(paths: ExecutionPath[]): number;
    /**
     * Find common execution patterns
     */
    static findCommonPatterns(paths: ExecutionPath[]): {
        commonNodes: string[];
        divergencePoints: string[];
        sharedSequences: string[][];
    };
    /**
     * Assign colors to execution paths
     */
    static assignPathColors(paths: ExecutionPath[]): Map<string, ExecutionPathColor>;
    /**
     * Generate debugging information for an execution path
     */
    static generateDebugInfo(path: ExecutionPath): {
        performanceBreakdown: Record<string, number>;
        bottleneckNodes: string[];
        randomizationSummary: string;
    };
}
export default GraphExecutionTracker;
//# sourceMappingURL=ExecutionTracker.d.ts.map