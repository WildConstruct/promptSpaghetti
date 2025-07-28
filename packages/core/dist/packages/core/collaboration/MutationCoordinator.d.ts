/**
 * Epic 23: Mutation Coordinator
 *
 * Coordinates graph mutations with operational transform and conflict resolution
 * Handles concurrent operations and maintains data consistency
 */
import { MutationOperation, ResolutionStrategy, ConflictOperation, OperationPriority } from './GraphMutations';
import { GraphCRDT } from './GraphCRDT';
/**
 * Result of operational transformation
 */
export interface TransformResult {
    op1: MutationOperation | null;
    op2: MutationOperation | null;
    conflict?: ConflictOperation;
    requiresResolution: boolean;
}
export interface BatchResult {
    success: boolean;
    appliedOperations: MutationOperation;
    failedOperations: MutationOperation;
    conflicts: ConflictOperation;
    rollbackRequired: boolean;
}
export interface QueuedOperation {
    operation: MutationOperation;
    priority: OperationPriority;
    dependencies: string;
    retryCount: number;
    maxRetries: number;
    timestamp: number;
}
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
    constructor();
    graphCRDT: GraphCRDT;
    documentId: string;
    clientId: string;
    userId: string;
    options?: {
        conflictResolutionStrategy?: ResolutionStrategy;
        maxOperationHistory?: number;
        operationTimeout?: number;
    };
}
//# sourceMappingURL=MutationCoordinator.d.ts.map