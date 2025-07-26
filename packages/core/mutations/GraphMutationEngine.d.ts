/**
 * PromptScape Graph Mutations - Core Engine
 *
 * Main execution engine for graph mutation operations with validation,
 * conflict resolution, and history tracking capabilities.
 */
import { EventEmitter } from 'events';
import { 
  GraphOperation,
  OperationResult,
  BatchOperationResult,
  UndoResult,
  RedoResult,
  MutationEngineConfig,
  GraphState,
  GraphSnapshot,
  HistoryEntry,
  AnyGraphOperation
} from './types';
/**
 * Core engine for executing graph mutations with full validation,
 * conflict resolution, and history tracking
 */
export declare class GraphMutationEngine extends EventEmitter {
    private config;
    private history;
    private validator;
    private conflictResolver;
    private currentState;
    private isExecuting;
    private operationQueue;
    constructor(config: MutationEngineConfig, initialState?: GraphState);
    /**
     * Get current graph state
     */
    getState(): GraphState;
    /**
     * Update current state (used by external store)
     */
    updateState(state: GraphState): void;
    /**
     * Execute a single operation with full validation and history tracking
     */
    execute(operation: AnyGraphOperation): Promise<OperationResult>;
    /**
     * Execute multiple operations as a batch
     */
    executeBatch(operations: AnyGraphOperation[]): Promise<BatchOperationResult>;
    /**
     * Undo the last operation
     */
    undo(): Promise<UndoResult>;
    /**
     * Redo the last undone operation
     */
    redo(): Promise<RedoResult>;
    /**
     * Check if undo is available
     */
    canUndo(): boolean;
    /**
     * Check if redo is available
     */
    canRedo(): boolean;
    /**
     * Get operation history
     */
    getHistory(): HistoryEntry[];
    /**
     * Clear operation history
     */
    clearHistory(): void;
    /**
     * Create a snapshot of current state
     */
    createSnapshot(operation?: GraphOperation): GraphSnapshot;
    /**
     * Restore state from snapshot
     */
    restoreSnapshot(snapshot: GraphSnapshot): Promise<void>;
    private executeOperation;
    private executeNodeAdd;
    private executeNodeDelete;
    private executeNodeUpdate;
    private executeEdgeAdd;
    private executeEdgeDelete;
    private handleConflicts;
    private rollbackOperation;
    private createFailureResult;
    private createErrorResult;
    private createPendingResult;
    private createConflictResult;
    private setupEventForwarding;
    private generateId;
    private calculateChecksum;
}
//# sourceMappingURL=GraphMutationEngine.d.ts.map