/**
 * PromptScape Graph Mutations - Conflict Resolution System
 *
 * Handles detection and resolution of conflicts in collaborative editing scenarios.
 * Supports operational transformation, last-writer-wins, and manual resolution strategies.
 */
import { EventEmitter } from 'events';
import { 
  GraphOperation,
  ConflictResult,
  ConflictResolutionConfig,
  ConflictResolutionOption,
  GraphState
} from './types';
/**
 * Handles collaborative editing conflicts and synchronization
 */
export declare class ConflictResolver extends EventEmitter {
    private config;
    private recentOperations;
    private readonly maxOperationAge;
    constructor(config: ConflictResolutionConfig);
    /**
     * Record an operation for conflict detection
     */
    recordOperation(operation: GraphOperation): void;
    /**
     * Check for conflicts with recent operations
     */
    checkConflicts(operation: GraphOperation, currentState: GraphState): Promise<ConflictResult>;
    /**
     * Resolve conflicts using the configured strategy
     */
    resolve(operation: GraphOperation, conflictResult: ConflictResult): Promise<GraphOperation>;
    /**
     * Get available resolution options for conflicts
     */
    getResolutionOptions(conflictResult: ConflictResult): ConflictResolutionOption[];
    private detectConflict;
    private getConflictType;
    private operationsAffectSameElement;
    private getAffectedNodeId;
    private getAffectedEdgeId;
    private isDeleteOperation;
    private isModifyOperation;
    private hasStructuralConflict;
    private getAffectedElements;
    private getConflictSeverity;
    private getConflictResolutionOptions;
    private canAutoResolveConflict;
    private resolveLastWriterWins;
    private resolveOperationalTransform;
    private resolveMerge;
    private transformOperation;
    private mergeNodeUpdates;
    private emitConflictResolved;
    private cleanupOldOperations;
    private generateId;
}
//# sourceMappingURL=ConflictResolver.d.ts.map