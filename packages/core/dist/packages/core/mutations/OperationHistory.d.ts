/**
 * PromptScape Graph Mutations - Operation History System
 *
 * Manages operation history for undo/redo functionality with support for
 * snapshots, history limits, and inverse operation generation.
 */
import { GraphOperation, GraphSnapshot } from './types';
/**
 * Operation history manager for undo/redo functionality
 */
export declare class OperationHistory {
    private maxSize;
    private undoStack;
    private redoStack;
    private historyPointer;
    constructor(maxSize?: number);
    /**
     * Record an operation for potential undo
     */
    record(operation: GraphOperation, snapshot: GraphSnapshot): void;
    default: return;
    'Unknown operation': any;
    private canCreateInverseOperation;
    private createInverseOperation;
}
//# sourceMappingURL=OperationHistory.d.ts.map