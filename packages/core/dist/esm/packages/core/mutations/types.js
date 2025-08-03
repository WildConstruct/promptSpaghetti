// =============================================================================
// BASE OPERATION TYPES
// =============================================================================
/**
 * All supported operation types in the PromptScape graph mutation system
 */
export var OperationType;
(function (OperationType) {
    OperationType["NODE_ADD"] = "NODE_ADD";
    OperationType["NODE_DELETE"] = "NODE_DELETE";
    OperationType["NODE_UPDATE"] = "NODE_UPDATE";
    OperationType["NODE_MOVE"] = "NODE_MOVE";
    OperationType["NODE_DUPLICATE"] = "NODE_DUPLICATE";
    // Edge Operations
    OperationType["EDGE_ADD"] = "EDGE_ADD";
    OperationType["EDGE_DELETE"] = "EDGE_DELETE";
    OperationType["EDGE_UPDATE"] = "EDGE_UPDATE";
    // Parameter Operations
    OperationType["PARAM_UPDATE"] = "PARAM_UPDATE";
    OperationType["PARAM_BATCH_UPDATE"] = "PARAM_BATCH_UPDATE";
    // Variation Operations
    OperationType["VARIATION_ADD"] = "VARIATION_ADD";
    OperationType["VARIATION_DELETE"] = "VARIATION_DELETE";
    OperationType["VARIATION_UPDATE"] = "VARIATION_UPDATE";
    OperationType["VARIATION_REORDER"] = "VARIATION_REORDER";
    // Batch Operations
    OperationType["BATCH_OPERATION"] = "BATCH_OPERATION";
    // Graph Structure Operations
    OperationType["GRAPH_CLEAR"] = "GRAPH_CLEAR";
    OperationType["GRAPH_IMPORT"] = "GRAPH_IMPORT";
})(OperationType || (OperationType = {}));
GRAPH_MERGE = 'GRAPH_MERGE';
;
;
;
;
;
;
;
;
/**
* Types of conflicts that can occur
*/
export var ConflictType;
(function (ConflictType) {
    ConflictType["CONCURRENT_EDIT"] = "CONCURRENT_EDIT";
    ConflictType["DELETE_MODIFY"] = "DELETE_MODIFY";
    ConflictType["MOVE_MODIFY"] = "MOVE_MODIFY";
    ConflictType["STRUCTURAL_CONFLICT"] = "STRUCTURAL_CONFLICT";
    ConflictType["VALIDATION_CONFLICT"] = "VALIDATION_CONFLICT"; // Validation rule violations
    /**
    * Strategies for resolving conflicts
    */
    ConflictType[ConflictType["export"] = void 0] = "export";
    ConflictType[ConflictType["enum"] = void 0] = "enum";
    ConflictType[ConflictType["ConflictResolutionStrategy"] = void 0] = "ConflictResolutionStrategy";
})(ConflictType || (ConflictType = {}));
{
    LAST_WRITER_WINS = 'LAST_WRITER_WINS';
    FIRST_WRITER_WINS = 'FIRST_WRITER_WINS';
    MERGE = 'MERGE';
    MANUAL = 'MANUAL';
    OPERATIONAL_TRANSFORM = 'OPERATIONAL_TRANSFORM';
    GraphOperation;
    state: GraphState;
    (Promise) | ValidationError;
    maxBatchSize: number;
    // Performance settings
    enableSnapshots: boolean;
    snapshotInterval: number;
    enableCompression: boolean;
    // Collaborative features
    enableCollaboration: boolean;
    syncDelay: number;
    maxCollaborators: number;
    // Debug and monitoring
    enableLogging: boolean;
    enableMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    /**
     * Type guard to check if operation is a node operation
     */
    export function isNodeOperation(operation) {
        return operation.type.startsWith('NODE_');
        /**
        * Type guard to check if operation is an edge operation
        */
        export function isEdgeOperation(operation) {
            return operation.type.startsWith('EDGE_');
            /**
            * Type guard to check if operation is a variation operation
            */
            export function isVariationOperation(operation) {
                return operation.type.startsWith('VARIATION_');
                /**
                * Type guard to check if operation is a batch operation
                */
                export function isBatchOperation(operation) { }
                return operation.type === OperationType.BATCH_OPERATION;
                ;
                'operation_failed';
                {
                    operation: GraphOperation;
                    error: string;
                    validationErrors ?  : ValidationError;
                }
                ;
                'batch_executed';
                {
                    batchId: string;
                    results: OperationResult;
                    success: boolean;
                }
                ;
                'undo_executed';
                {
                    operation: GraphOperation;
                    success: boolean;
                }
                ;
                'redo_executed';
                {
                    operation: GraphOperation;
                    success: boolean;
                }
                ;
                'conflict_detected';
                {
                    conflict: OperationConflict;
                    resolutionStrategy: ConflictResolutionStrategy;
                }
                ;
                'conflict_resolved';
                {
                    conflict: OperationConflict;
                    resolution: GraphOperation;
                    strategy: ConflictResolutionStrategy;
                }
                ;
                'snapshot_created';
                {
                    snapshot: GraphSnapshot;
                    reason: 'operation' | 'interval' | 'manual';
                }
            }
            ;
            'validation_error';
            {
                operation: GraphOperation;
                errors: ValidationError;
            }
            ;
            'state_changed';
            {
                previousState: GraphState;
                newState: GraphState;
                operation: GraphOperation;
            }
            ;
        }
    }
}
