/**
 * Epic 23: Mutation Coordinator
 *
 * Coordinates graph mutations with operational transform and conflict resolution
 * Handles concurrent operations and maintains data consistency
 */
import { 
  MutationOperation,
  BatchMutationOperation,
  ResolutionStrategy,
  ConflictOperation,
  ConflictResolution,
  OperationPriority
} from './GraphMutations';
import { GraphCRDT } from './GraphCRDT';
/**
 * Result of operational transformation
 */

}
export interface TransformResult {
    op1: MutationOperation | null;
    op2: MutationOperation | null;
    conflict?: ConflictOperation;
    requiresResolution: boolean;


/**
 * Batch operation result
 */

}
export interface BatchResult {
    success: boolean;
    appliedOperations: MutationOperation[];
    failedOperations: MutationOperation[];
    conflicts: ConflictOperation[];
    rollbackRequired: boolean;


/**
 * Operation queue item
 */

}
export interface QueuedOperation {
    operation: MutationOperation;
    priority: OperationPriority;
    dependencies: string[];
    retryCount: number;
    maxRetries: number;
    timestamp: number;


/**
 * Coordinates graph mutations with conflict resolution and operational transform
 */
export declare class MutationCoordinator {
    private graphCRDT;
    private documentId;
    private clientId;
    private userId;
    private operationQueue;
    private pendingOperations;
    private conflictOperations;
    private conflictResolutionStrategy;
    private maxOperationHistory;
    private operationTimeout;
    private onOperationApplied?;
    private onConflictDetected?;
    private onConflictResolved?;
    private onBatchCompleted?;
    constructor(graphCRDT: GraphCRDT, documentId: string, clientId: string, userId: string, options?: {)
        conflictResolutionStrategy?: ResolutionStrategy;
        maxOperationHistory?: number;
        operationTimeout?: number;
}
    });
    /**
     * Apply a single mutation operation
     */
    applyOperation(operation: MutationOperation): Promise<boolean>;
    /**
     * Apply a batch of operations atomically
     */
    applyBatchOperation(batchOperation: BatchMutationOperation): Promise<BatchResult>;
    /**
     * Transform two concurrent operations
     */
    transformOperations(op1: MutationOperation, op2: MutationOperation): TransformResult;
    /**
     * Resolve a conflict with specified strategy
     */
    resolveConflict(conflictId: string, strategy: ResolutionStrategy, resolutionData?: any): Promise<boolean>;
    /**
     * Transform concurrent node addition operations
     */
    private transformNodeAdd;
    /**
     * Transform concurrent node update operations
     */
    private transformNodeUpdate;
    /**
     * Transform update vs delete operations
     */
    private transformUpdateDelete;
    /**
     * Transform concurrent edge addition operations
     */
    private transformEdgeAdd;
    /**
     * Transform concurrent parameter updates
     */
    private transformParameterUpdate;
    /**
     * Handle generic conflict between operations
     */
    private handleGenericConflict;
    /**
     * Execute a single operation on the CRDT
     */
    private executeOperation;
    /**
     * Detect conflicts with pending operations
     */
    private detectConflicts;
    /**
     * Handle detected conflicts
     */
    private handleConflicts;
    /**
     * Apply automatic conflict resolution
     */
    private applyAutomaticResolution;
    /**
     * Apply conflict resolution
     */
    private applyConflictResolution;
    /**
     * Check if property paths conflict (overlap)
     */
    private propertyPathsConflict;
    /**
     * Check if conflict requires user input
     */
    private requiresUserInput;
    /**
     * Suggest resolution strategy
     */
    private suggestResolution;
    /**
     * Get resolution options for conflict UI
     */
    private getResolutionOptions;
    /**
     * Attempt automatic merge of conflicting values
     */
    private attemptAutoMerge;
    /**
     * Validate batch operations for conflicts
     */
    private validateBatchOperations;
    /**
     * Rollback applied operations
     */
    private rollbackOperations;
    /**
     * Create inverse operation for rollback
     */
    private createInverseOperation;
    /**
     * Setup periodic cleanup of old operations and conflicts
     */
    private setupPeriodicCleanup;
    /**
     * Get pending operations
     */
    getPendingOperations(): MutationOperation[];
    /**
     * Get active conflicts
     */
    getActiveConflicts(): ConflictOperation[];
    /**
     * Set event handlers
     */
    setEventHandlers(handlers: {)
        onOperationApplied?: (operation: MutationOperation) => void;
        onConflictDetected?: (conflict: ConflictOperation) => void;
        onConflictResolved?: (resolution: ConflictResolution) => void;
        onBatchCompleted?: (result: BatchResult) => void;
    }): void;
    /**
     * Set conflict resolution strategy
     */
    setConflictResolutionStrategy(strategy: ResolutionStrategy): void;
    /**
     * Get current configuration
     */
    getConfiguration(): {
        conflictResolutionStrategy: ResolutionStrategy;
        maxOperationHistory: number;
        operationTimeout: number;
    };

export default MutationCoordinator;
//# sourceMappingURL=MutationCoordinator.d.ts.map