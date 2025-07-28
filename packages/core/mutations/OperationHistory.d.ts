/**
 * PromptScape Graph Mutations - Operation History System
 *
 * Manages operation history for undo/redo functionality with support for
 * snapshots, history limits, and inverse operation generation.
 */
import { GraphOperation, HistoryEntry, GraphSnapshot, UndoResult, RedoResult } from './types';
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
    /**
     * Undo the last operation
     */
    undo(engine: any): Promise<UndoResult>;
    /**
     * Redo the last undone operation
     */
    redo(engine: any): Promise<RedoResult>;
    /**
     * Check if undo is available
     */
    canUndo(): boolean;
    /**
     * Check if redo is available
     */
    canRedo(): boolean;
    /**
     * Get complete operation history
     */
    getHistory(): HistoryEntry[];
    /**
     * Get the last history entry
     */
    getLastEntry(): HistoryEntry | null;
    /**
     * Clear all history
     */
    clear(): void;
    /**
     * Get history summary for UI display
     */
    getHistorySummary(): {
        undoCount: number;
        redoCount: number;
        currentIndex: number;
    };
    /**
     * Get description of what would be undone
     */
    getUndoDescription(): string | null;
    /**
     * Get description of what would be redone
     */
    getRedoDescription(): string | null;
    private generateDescription;
    private canCreateInverseOperation;
    private createInverseOperation;
    private createNodeDeleteInverse;
    private createNodeAddInverse;
    private createNodeUpdateInverse;
    private createNodeMoveInverse;
    private createEdgeDeleteInverse;
    private createEdgeAddInverse;
    private createVariationDeleteInverse;
    private createVariationAddInverse;
    private createVariationUpdateInverse;
    private createVariationReorderInverse;
    private updateRedoFlags;

//# sourceMappingURL=OperationHistory.d.ts.map