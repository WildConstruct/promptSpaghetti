/**
 * PromptScape Graph Mutations - Core Types
 *
 * Comprehensive type definitions for the graph mutation operational model.
 * Supports node addition, edge deletion, parameter changes, undo/redo, and
 * collaborative editing scenarios.
 */
// =============================================================================
// BASE OPERATION TYPES
// =============================================================================
/**
 * All supported operation types in the PromptScape graph mutation system
 */
export var OperationType;
(function (OperationType) {
    // Node Operations
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
    OperationType["GRAPH_MERGE"] = "GRAPH_MERGE";
})(OperationType || (OperationType = {}));
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
})(ConflictType || (ConflictType = {}));
/**
 * Strategies for resolving conflicts
 */
export var ConflictResolutionStrategy;
(function (ConflictResolutionStrategy) {
    ConflictResolutionStrategy["LAST_WRITER_WINS"] = "LAST_WRITER_WINS";
    ConflictResolutionStrategy["FIRST_WRITER_WINS"] = "FIRST_WRITER_WINS";
    ConflictResolutionStrategy["MERGE"] = "MERGE";
    ConflictResolutionStrategy["MANUAL"] = "MANUAL";
    ConflictResolutionStrategy["OPERATIONAL_TRANSFORM"] = "OPERATIONAL_TRANSFORM";
})(ConflictResolutionStrategy || (ConflictResolutionStrategy = {}));
/**
 * Type guard to check if operation is a node operation
 */
export function isNodeOperation(operation) {
    return operation.type.startsWith('NODE_');
}
/**
 * Type guard to check if operation is an edge operation
 */
export function isEdgeOperation(operation) {
    return operation.type.startsWith('EDGE_');
}
/**
 * Type guard to check if operation is a variation operation
 */
export function isVariationOperation(operation) {
    return operation.type.startsWith('VARIATION_');
}
/**
 * Type guard to check if operation is a batch operation
 */
export function isBatchOperation(operation) {
    return operation.type === OperationType.BATCH_OPERATION;
}
