/**
 * PromptScape Graph Mutations - Core Types
 *
 * Comprehensive type definitions for the graph mutation operational model.
 * Supports node addition, edge deletion, parameter changes, undo/redo, and
 * collaborative editing scenarios.
 */
import { Node, Edge, XYPosition } from 'reactflow';
/**
 * All supported operation types in the PromptScape graph mutation system
 */
export declare enum OperationType {
    NODE_ADD = "NODE_ADD",
    NODE_DELETE = "NODE_DELETE",
    NODE_UPDATE = "NODE_UPDATE",
    NODE_MOVE = "NODE_MOVE",
    NODE_DUPLICATE = "NODE_DUPLICATE",
    EDGE_ADD = "EDGE_ADD",
    EDGE_DELETE = "EDGE_DELETE",
    EDGE_UPDATE = "EDGE_UPDATE",
    PARAM_UPDATE = "PARAM_UPDATE",
    PARAM_BATCH_UPDATE = "PARAM_BATCH_UPDATE",
    VARIATION_ADD = "VARIATION_ADD",
    VARIATION_DELETE = "VARIATION_DELETE",
    VARIATION_UPDATE = "VARIATION_UPDATE",
    VARIATION_REORDER = "VARIATION_REORDER",
    BATCH_OPERATION = "BATCH_OPERATION",
    GRAPH_CLEAR = "GRAPH_CLEAR",
    GRAPH_IMPORT = "GRAPH_IMPORT",
    GRAPH_MERGE = "GRAPH_MERGE"
    /**
    * Base interface for all graph mutation operations
    */
    ,
    /**
    * Base interface for all graph mutation operations
    */
    export,
    interface,
    GraphOperation
}
export interface NodeAddOperation extends GraphOperation {
    type: OperationType.NODE_ADD;
    payload: {
        node: Node;
        position: XYPosition;
        sourceNodeId?: string;
        skipValidation?: boolean;
    };
}
/**
 * Node deletion operation
 */
export interface NodeDeleteOperation extends GraphOperation {
    type: OperationType.NODE_DELETE;
    payload: {
        nodeId: string;
        preserveConnections?: boolean;
        snapshot: Node;
        connectedEdges?: Edge;
    };
}
/**
 * Node parameter update operation
 */
export interface NodeUpdateOperation extends GraphOperation {
    type: OperationType.NODE_UPDATE;
    payload: {
        nodeId: string;
        updates: Record<string, unknown>;
        previousValues: Record<string, unknown>;
        validationOverride?: boolean;
        merge?: boolean;
    };
}
/**
 * Node move operation
 */
export interface NodeMoveOperation extends GraphOperation {
    type: OperationType.NODE_MOVE;
    payload: {
        nodeId: string;
        newPosition: XYPosition;
        previousPosition: XYPosition;
    };
}
/**
 * Node duplication operation
 */
export interface NodeDuplicateOperation extends GraphOperation {
    type: OperationType.NODE_DUPLICATE;
    payload: {
        sourceNodeId: string;
        newNode: Node;
        offset: XYPosition;
        copyConnections?: boolean;
    };
}
/**
 * Edge addition operation
 */
export interface EdgeAddOperation extends GraphOperation {
    type: OperationType.EDGE_ADD;
    payload: {
        edge: Edge;
        skipValidation?: boolean;
        replaceExisting?: boolean;
    };
}
/**
 * Edge deletion operation
 */
export interface EdgeDeleteOperation extends GraphOperation {
    type: OperationType.EDGE_DELETE;
    payload: {
        edgeId: string;
        snapshot: Edge;
    };
}
/**
 * Edge update operation
 */
export interface EdgeUpdateOperation extends GraphOperation {
    type: OperationType.EDGE_UPDATE;
    payload: {
        edgeId: string;
        updates: Partial<Edge>;
        previousValues: Partial<Edge>;
    };
}
/**
 * Add variation to node
 */
export interface VariationAddOperation extends GraphOperation {
    type: OperationType.VARIATION_ADD;
    payload: {
        nodeId: string;
        variation: string;
        index?: number;
    };
}
/**
 * Delete variation from node
 */
export interface VariationDeleteOperation extends GraphOperation {
    type: OperationType.VARIATION_DELETE;
    payload: {
        nodeId: string;
        index: number;
        snapshot: string;
    };
}
/**
 * Update existing variation
 */
export interface VariationUpdateOperation extends GraphOperation {
    type: OperationType.VARIATION_UPDATE;
    payload: {
        nodeId: string;
        index: number;
        newValue: string;
        previousValue: string;
    };
}
/**
 * Reorder variations within node
 */
export interface VariationReorderOperation extends GraphOperation {
    type: OperationType.VARIATION_REORDER;
    payload: {
        nodeId: string;
        fromIndex: number;
        toIndex: number;
        previousOrder: string;
    };
}
/**
 * Batch operation for atomic multi-step changes
 */
export interface BatchOperation extends GraphOperation {
    type: OperationType.BATCH_OPERATION;
    payload: {
        operations: GraphOperation;
        atomicity: 'all_or_nothing' | 'best_effort';
        rollbackOnFailure: boolean;
        description?: string;
    };
}
/**
 * Clear entire graph
 */
export interface GraphClearOperation extends GraphOperation {
    type: OperationType.GRAPH_CLEAR;
    payload: {
        snapshot: {
            nodes: Node;
            edges: Edge;
        };
        preserveHistory?: boolean;
    };
}
/**
 * Import graph data
 */
export interface GraphImportOperation extends GraphOperation {
    type: OperationType.GRAPH_IMPORT;
    payload: {
        nodes: Node;
        edges: Edge;
        merge?: boolean;
        conflict_resolution?: 'skip' | 'replace' | 'merge';
    };
}
/**
 * Merge graphs
 */
export interface GraphMergeOperation extends GraphOperation {
    type: OperationType.GRAPH_MERGE;
    payload: {
        sourceNodes: Node;
        sourceEdges: Edge;
        strategy: 'append' | 'merge' | 'overlay';
        positionOffset?: XYPosition;
    };
}
/**
 * Result of executing a single operation
 */
export interface OperationResult {
    success: boolean;
    operation: GraphOperation;
    snapshot?: GraphSnapshot;
    error?: string;
    warnings?: string;
    affectedNodeIds?: string;
    affectedEdgeIds?: string;
    executionTime?: number;
    validationErrors?: ValidationError;
}
export interface BatchOperationResult {
    success: boolean;
    batchId: string;
    results: OperationResult;
    rollbackPerformed: boolean;
    error?: string;
    partialSuccess?: boolean;
    successCount?: number;
    failureCount?: number;
}
export interface UndoResult {
    success: boolean;
    operation?: GraphOperation;
    error?: string;
    description?: string;
}
export interface RedoResult {
    success: boolean;
    operation?: GraphOperation;
    error?: string;
    description?: string;
}
export type ValidationSeverity = 'error' | 'warning' | 'info';
/**
 * Individual validation error
 */
export interface ValidationError {
    type: string;
    message: string;
    severity: ValidationSeverity;
    field?: string;
    nodeId?: string;
    edgeId?: string;
    context?: Record<string, unknown>;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError;
    warnings: ValidationError;
    info?: ValidationError;
}
export interface GraphState {
    nodes: Node;
    edges: Edge;
    metadata?: Record<string, unknown>;
    version?: number;
    lastModified?: Date;
}
export interface GraphSnapshot {
    id: string;
    state: GraphState;
    timestamp: Date;
    operationId: string;
    description?: string;
    checksum?: string;
}
export interface HistoryEntry {
    operation: GraphOperation;
    snapshot: GraphSnapshot;
    timestamp: Date;
    description?: string;
    canUndo?: boolean;
    canRedo?: boolean;
}
export interface ConflictResult {
    hasConflicts: boolean;
    conflicts: OperationConflict;
    canAutoResolve: boolean;
    resolutionStrategy?: ConflictResolutionStrategy;
}
export interface OperationConflict {
    localOperation: GraphOperation;
    remoteOperation: GraphOperation;
    conflictType: ConflictType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedElements: string;
    resolutionOptions: ConflictResolutionOption;
}
export declare enum ConflictType {
    CONCURRENT_EDIT = "CONCURRENT_EDIT",// Same element edited simultaneously
    DELETE_MODIFY = "DELETE_MODIFY",// One deletes, other modifies
    MOVE_MODIFY = "MOVE_MODIFY",// Position vs content conflicts
    STRUCTURAL_CONFLICT = "STRUCTURAL_CONFLICT",// Graph structure conflicts
    VALIDATION_CONFLICT = "VALIDATION_CONFLICT"
    /**
    * Strategies for resolving conflicts
    */
    ,// Validation rule violations
    /**
    * Strategies for resolving conflicts
    */
    export,
    enum,
    ConflictResolutionStrategy
}
//# sourceMappingURL=types.d.ts.map