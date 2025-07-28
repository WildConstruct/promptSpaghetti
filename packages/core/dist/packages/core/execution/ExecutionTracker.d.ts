/**
 * Execution Path Tracker
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 *
 * Tracks the execution path of graph processing for visualization
 */
import { ExecutionTracker } from '../types/ExecutionPath.js';
export declare class GraphExecutionTracker implements ExecutionTracker {
    private static instance;
    private activeExecutions;
    private executionCounter;
    static getInstance(): GraphExecutionTracker;
}
//# sourceMappingURL=ExecutionTracker.d.ts.map