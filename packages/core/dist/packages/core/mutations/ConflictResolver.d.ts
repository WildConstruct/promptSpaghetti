/**
 * PromptScape Graph Mutations - Conflict Resolution System
 *
 * Handles detection and resolution of conflicts in collaborative editing scenarios.
 * Supports operational transformation, last-writer-wins, and manual resolution strategies.
 */
import { EventEmitter } from 'events';
import { GraphOperation, ConflictResolutionConfig, GraphState } from './types';
/**
 * Handles collaborative editing conflicts and synchronization
 */
export declare class ConflictResolver extends EventEmitter {
    private config;
    private recentOperations;
    private readonly maxOperationAge;
    constructor(config: ConflictResolutionConfig);
    private detectConflict;
    remoteOp: GraphOperation;
    state: GraphState;
    Promise<OperationConflict>(): any;
}
//# sourceMappingURL=ConflictResolver.d.ts.map