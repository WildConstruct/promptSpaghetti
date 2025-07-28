/**
 * Epic 23: Graph Mutations - Core Types and Interfaces
 *
 * Defines the operational model for real-time collaborative graph editing
 * Integrates with existing WebSocket collaboration infrastructure
 */
import { z } from 'zod';
import { NodeTypeEnum, Node } from '../graphSchema';
/**
 * Base interface for all graph mutation operations
 */
export interface BaseMutationOperation {
    operationId: string;
    documentId: string;
    timestamp: number;
    userId: string;
    clientId?: string;
    operationVector?: VersionVector;
    dependencies?: string[];
}
/**
 * Version vector for operation ordering and conflict resolution
 */
export interface VersionVector {
    [clientId: string]: number;
}
/**
 * Operation priority for conflict resolution
 */
export declare enum OperationPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}
/**
 * Node Addition Operation
 */
export interface NodeAddOperation extends BaseMutationOperation {
    type: 'NODE_ADD';
    nodeId: string;
    nodeType: z.infer<typeof NodeTypeEnum>;
    position: {,
        x: number;
        y: number;
    };
    initialData?: Record<string, any>;
    parentId?: string;
    priority?: OperationPriority;
}
/**
 * Node Update Operation
 */
export interface NodeUpdateOperation extends BaseMutationOperation {
    type: 'NODE_UPDATE';
    nodeId: string;
    propertyPath: string[];
    oldValue: unknown;
    newValue: unknown;
    partialUpdate: boolean;
    validationSchema?: string;
    priority?: OperationPriority;
}
/**
 * Node Removal Operation
 */
export interface NodeRemoveOperation extends BaseMutationOperation {
    type: 'NODE_REMOVE';
    nodeId: string;
    cascadeDelete: boolean;
    preserveConnections: boolean;
    snapshotData?: Node;
    priority?: OperationPriority;
}
/**
 * Edge data structure
 */
export interface GraphEdge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourcePort?: string;
    targetPort?: string;
    type: 'data' | 'control' | 'conditional';
    metadata?: Record<string, any>;
}
/**
 * Edge Addition Operation
 */
export interface EdgeAddOperation extends BaseMutationOperation {
    type: 'EDGE_ADD';
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourcePort?: string;
    targetPort?: string;
    edgeType: 'data' | 'control' | 'conditional';
    metadata?: Record<string, any>;
    priority?: OperationPriority;
}
/**
 * Edge Update Operation
 */
export interface EdgeUpdateOperation extends BaseMutationOperation {
    type: 'EDGE_UPDATE';
    edgeId: string;
    property: 'source' | 'target' | 'sourcePort' | 'targetPort' | 'metadata' | 'type';
    oldValue: unknown;
    newValue: unknown;
    priority?: OperationPriority;
}
/**
 * Edge Removal Operation
 */
export interface EdgeRemoveOperation extends BaseMutationOperation {
    type: 'EDGE_REMOVE';
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    snapshotData?: GraphEdge;
    priority?: OperationPriority;
}
/**
 * Parameter Update Operation
 */
export interface ParameterUpdateOperation extends BaseMutationOperation {
    type: 'PARAMETER_UPDATE';
    nodeId: string;
    parameterKey: string;
    parameterPath?: string[];
    valueType: 'string' | 'number' | 'boolean' | 'object' | 'array';
    oldValue: unknown;
    newValue: unknown;
    validationSchema?: string;
    priority?: OperationPriority;
}
/**
 * Batch Operation for atomic multi-operation execution
 */
export interface BatchMutationOperation extends BaseMutationOperation {
    type: 'BATCH_MUTATION';
    batchId: string;
    operations: MutationOperation[];
    atomic: boolean;
    rollbackOnFailure: boolean;
    priority?: OperationPriority;
}
/**
 * All possible mutation operation types
 */
export type MutationOperation = NodeAddOperation | NodeUpdateOperation | NodeRemoveOperation | EdgeAddOperation | EdgeUpdateOperation | EdgeRemoveOperation | ParameterUpdateOperation | BatchMutationOperation;
/**
 * Node-specific operations
 */
export type NodeMutationOperation = NodeAddOperation | NodeUpdateOperation | NodeRemoveOperation;
/**
 * Edge-specific operations
 */
export type EdgeMutationOperation = EdgeAddOperation | EdgeUpdateOperation | EdgeRemoveOperation;
/**
 * Conflict types for different scenarios
 */
export declare enum ConflictType {
    NODE_CREATION = "node_creation",
    NODE_DELETION = "node_deletion",
    NODE_PROPERTIES = "node_properties",
    NODE_POSITION = "node_position",
    EDGE_CREATION = "edge_creation",
    EDGE_DELETION = "edge_deletion",
    EDGE_PROPERTIES = "edge_properties",
    PARAMETER_UPDATE = "parameter_update",
    CIRCULAR_DEPENDENCY = "circular_dependency",
    VALIDATION_ERROR = "validation_error"
}
/**
 * Conflict resolution strategies
 */
export declare enum ResolutionStrategy {
    ACCEPT_LOCAL = "accept_local",
    ACCEPT_REMOTE = "accept_remote",
    LAST_WRITER_WINS = "last_writer_wins",
    FIRST_WRITER_WINS = "first_writer_wins",
    MERGE_CHANGES = "merge_changes",
    MANUAL_RESOLUTION = "manual_resolution",
    ROLLBACK_OPERATION = "rollback_operation",
    AUTO_MERGE = "auto_merge"
}
/**
 * Conflict resolution data
 */
export interface ConflictResolution {
    conflictId: string;
    conflictType: ConflictType;
    strategy: ResolutionStrategy;
    affectedOperations: string[];
    affectedElements: string[];
    resolutionData?: Record<string, unknown>;
    resolvedBy: string;
    timestamp: number;
    automatic: boolean;
}
/**
 * Conflict operation for manual resolution UI
 */
export interface ConflictOperation {
    id: string;
    type: ConflictType;
    nodeId?: string;
    edgeId?: string;
    property?: string;
    localValue: unknown;
    remoteValue: unknown;
    baseValue?: unknown;
    userId: string;
    timestamp: number;
    documentId: string;
    requiresUserInput: boolean;
    suggestedResolution?: ResolutionStrategy;
    options: ResolutionOption[];
}
/**
 * Resolution option for conflict UI
 */
export interface ResolutionOption {
    strategy: ResolutionStrategy;
    label: string;
    description: string;
    preview?: Record<string, unknown>;
    recommended: boolean;
}
/**
 * Graph mutation message for WebSocket transport
 */
export interface GraphMutationMessage {
    type: 'GRAPH_MUTATION';
    operationId: string;
    documentId: string;
    operation: MutationOperation;
    userId: string;
    timestamp: number;
    operationVector: VersionVector;
    dependencies?: string[];
    requiresAck: boolean;
}
/**
 * Batch mutation message
 */
export interface BatchMutationMessage {
    type: 'BATCH_MUTATION';
    batchId: string;
    documentId: string;
    operations: MutationOperation[];
    atomic: boolean;
    userId: string;
    timestamp: number;
}
/**
 * Conflict detected message
 */
export interface ConflictDetectedMessage {
    type: 'CONFLICT_DETECTED';
    conflictId: string;
    documentId: string;
    conflictType: ConflictType;
    conflictOperation: ConflictOperation;
    affectedOperations: string[];
    affectedElements: string[];
    resolutionRequired: boolean;
    suggestedResolution?: ResolutionStrategy;
    timeout?: number;
}
/**
 * Conflict resolved message
 */
export interface ConflictResolvedMessage {
    type: 'CONFLICT_RESOLVED';
    conflictId: string;
    documentId: string;
    resolution: ConflictResolution;
    resultingOperations: MutationOperation[];
    timestamp: number;
}
/**
 * Delta synchronization message
 */
export interface DeltaSyncMessage {
    type: 'DELTA_SYNC';
    documentId: string;
    fromVersion: number;
    toVersion: number;
    operations: MutationOperation[];
    checksum: string;
    userId: string;
}
/**
 * State verification message
 */
export interface StateVerificationMessage {
    type: 'STATE_VERIFICATION';
    documentId: string;
    nodeCount: number;
    edgeCount: number;
    nodeChecksum: string;
    edgeChecksum: string;
    operationCount: number;
    lastOperationId: string;
    requiredResync: boolean;
}
/**
 * Operation acknowledgment message
 */
export interface OperationAckMessage {
    type: 'OPERATION_ACK';
    operationId: string;
    documentId: string;
    success: boolean;
    error?: string;
    resultingVersion: number;
    timestamp: number;
}
/**
 * Version vector validation schema
 */
export declare const VersionVectorSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
/**
 * Position validation schema
 */
export declare const PositionSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
/**
 * Node add operation validation schema
 */
export declare const NodeAddOperationSchema: z.ZodObject<{
    type: z.ZodLiteral<"NODE_ADD">;
    operationId: z.ZodString;
    documentId: z.ZodString;
    nodeId: z.ZodString;
    nodeType: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
    position: z.ZodObject<{,
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    initialData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    parentId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    userId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
}, "strip", z.ZodTypeAny, {
    type: "NODE_ADD";
    position: {,
        x: number;
        y: number;
    };
    timestamp: number;
    nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    priority?: OperationPriority | undefined;
    parentId?: string | undefined;
    dependencies?: string[] | undefined;
    initialData?: Record<string, unknown> | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}, {
    type: "NODE_ADD";
    position: {,
        x: number;
        y: number;
    };
    timestamp: number;
    nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    priority?: OperationPriority | undefined;
    parentId?: string | undefined;
    dependencies?: string[] | undefined;
    initialData?: Record<string, unknown> | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}>;
/**
 * Node update operation validation schema
 */
export declare const NodeUpdateOperationSchema: z.ZodObject<{
    type: z.ZodLiteral<"NODE_UPDATE">;
    operationId: z.ZodString;
    documentId: z.ZodString;
    nodeId: z.ZodString;
    propertyPath: z.ZodArray<z.ZodString, "many">;
    oldValue: z.ZodUnknown;
    newValue: z.ZodUnknown;
    partialUpdate: z.ZodBoolean;
    validationSchema: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    userId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
}, "strip", z.ZodTypeAny, {
    type: "NODE_UPDATE";
    timestamp: number;
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    propertyPath: string[];
    partialUpdate: boolean;
    priority?: OperationPriority | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
    oldValue?: unknown;
    newValue?: unknown;
    validationSchema?: string | undefined;
}, {
    type: "NODE_UPDATE";
    timestamp: number;
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    propertyPath: string[];
    partialUpdate: boolean;
    priority?: OperationPriority | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
    oldValue?: unknown;
    newValue?: unknown;
    validationSchema?: string | undefined;
}>;
/**
 * Edge add operation validation schema
 */
export declare const EdgeAddOperationSchema: z.ZodObject<{
    type: z.ZodLiteral<"EDGE_ADD">;
    operationId: z.ZodString;
    documentId: z.ZodString;
    edgeId: z.ZodString;
    sourceNodeId: z.ZodString;
    targetNodeId: z.ZodString;
    sourcePort: z.ZodOptional<z.ZodString>;
    targetPort: z.ZodOptional<z.ZodString>;
    edgeType: z.ZodEnum<["data", "control", "conditional"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodNumber;
    userId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
}, "strip", z.ZodTypeAny, {
    type: "EDGE_ADD";
    timestamp: number;
    userId: string;
    edgeId: string;
    documentId: string;
    operationId: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: "data" | "conditional" | "control";
    priority?: OperationPriority | undefined;
    metadata?: Record<string, unknown> | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    sourcePort?: string | undefined;
    targetPort?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}, {
    type: "EDGE_ADD";
    timestamp: number;
    userId: string;
    edgeId: string;
    documentId: string;
    operationId: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: "data" | "conditional" | "control";
    priority?: OperationPriority | undefined;
    metadata?: Record<string, unknown> | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    sourcePort?: string | undefined;
    targetPort?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}>;
/**
 * All mutation operation schemas union
 */
export declare const MutationOperationSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"NODE_ADD">;
    operationId: z.ZodString;
    documentId: z.ZodString;
    nodeId: z.ZodString;
    nodeType: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
    position: z.ZodObject<{,
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    initialData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    parentId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    userId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
}, "strip", z.ZodTypeAny, {
    type: "NODE_ADD";
    position: {,
        x: number;
        y: number;
    };
    timestamp: number;
    nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    priority?: OperationPriority | undefined;
    parentId?: string | undefined;
    dependencies?: string[] | undefined;
    initialData?: Record<string, unknown> | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}, {
    type: "NODE_ADD";
    position: {,
        x: number;
        y: number;
    };
    timestamp: number;
    nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    priority?: OperationPriority | undefined;
    parentId?: string | undefined;
    dependencies?: string[] | undefined;
    initialData?: Record<string, unknown> | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"NODE_UPDATE">;
    operationId: z.ZodString;
    documentId: z.ZodString;
    nodeId: z.ZodString;
    propertyPath: z.ZodArray<z.ZodString, "many">;
    oldValue: z.ZodUnknown;
    newValue: z.ZodUnknown;
    partialUpdate: z.ZodBoolean;
    validationSchema: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    userId: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
}, "strip", z.ZodTypeAny, {
    type: "NODE_UPDATE";
    timestamp: number;
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    propertyPath: string[];
    partialUpdate: boolean;
    priority?: OperationPriority | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
    oldValue?: unknown;
    newValue?: unknown;
    validationSchema?: string | undefined;
}, {
    type: "NODE_UPDATE";
    timestamp: number;
    userId: string;
    nodeId: string;
    documentId: string;
    operationId: string;
    propertyPath: string[];
    partialUpdate: boolean;
    priority?: OperationPriority | undefined;
    dependencies?: string[] | undefined;
    clientId?: string | undefined;
    operationVector?: Record<string, number> | undefined;
    oldValue?: unknown;
    newValue?: unknown;
    validationSchema?: string | undefined;
}>]>;
/**
 * Generate a unique operation ID
 */
export declare function generateOperationId(userId: string, timestamp?: number): string;
/**
 * Generate a unique node ID
 */
export declare function generateNodeId(prefix?: string): string;
/**
 * Generate a unique edge ID
 */
export declare function generateEdgeId(sourceId: string, targetId: string): string;
/**
 * Check if an operation affects a specific node
 */
export declare function operationAffectsNode(operation: MutationOperation, nodeId: string): boolean;
/**
 * Check if an operation affects a specific edge
 */
export declare function operationAffectsEdge(operation: MutationOperation, edgeId: string): boolean;
/**
 * Compare operation timestamps for ordering
 */
export declare function compareOperations(op1: MutationOperation, op2: MutationOperation): number;
/**
 * Check if two operations conflict
 */
export declare function operationsConflict(op1: MutationOperation, op2: MutationOperation): boolean;
/**
 * Extract all node IDs affected by an operation
 */
export declare function getAffectedNodeIds(operation: MutationOperation): string[];
/**
 * Extract all edge IDs affected by an operation
 */
export declare function getAffectedEdgeIds(operation: MutationOperation): string[];
declare const _default: {
    ConflictType: typeof ConflictType;
    ResolutionStrategy: typeof ResolutionStrategy;
    OperationPriority: typeof OperationPriority;
    NodeAddOperationSchema: z.ZodObject<{,
        type: z.ZodLiteral<"NODE_ADD">;
        operationId: z.ZodString;
        documentId: z.ZodString;
        nodeId: z.ZodString;
        nodeType: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
        position: z.ZodObject<{,
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        initialData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        parentId: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        userId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
    }, "strip", z.ZodTypeAny, {
        type: "NODE_ADD";
        position: {,
            x: number;
            y: number;
        };
        timestamp: number;
        nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        priority?: OperationPriority | undefined;
        parentId?: string | undefined;
        dependencies?: string[] | undefined;
        initialData?: Record<string, unknown> | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }, {
        type: "NODE_ADD";
        position: {,
            x: number;
            y: number;
        };
        timestamp: number;
        nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        priority?: OperationPriority | undefined;
        parentId?: string | undefined;
        dependencies?: string[] | undefined;
        initialData?: Record<string, unknown> | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }>;
    NodeUpdateOperationSchema: z.ZodObject<{,
        type: z.ZodLiteral<"NODE_UPDATE">;
        operationId: z.ZodString;
        documentId: z.ZodString;
        nodeId: z.ZodString;
        propertyPath: z.ZodArray<z.ZodString, "many">;
        oldValue: z.ZodUnknown;
        newValue: z.ZodUnknown;
        partialUpdate: z.ZodBoolean;
        validationSchema: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        userId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
    }, "strip", z.ZodTypeAny, {
        type: "NODE_UPDATE";
        timestamp: number;
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        propertyPath: string[];
        partialUpdate: boolean;
        priority?: OperationPriority | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
        oldValue?: unknown;
        newValue?: unknown;
        validationSchema?: string | undefined;
    }, {
        type: "NODE_UPDATE";
        timestamp: number;
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        propertyPath: string[];
        partialUpdate: boolean;
        priority?: OperationPriority | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
        oldValue?: unknown;
        newValue?: unknown;
        validationSchema?: string | undefined;
    }>;
    EdgeAddOperationSchema: z.ZodObject<{,
        type: z.ZodLiteral<"EDGE_ADD">;
        operationId: z.ZodString;
        documentId: z.ZodString;
        edgeId: z.ZodString;
        sourceNodeId: z.ZodString;
        targetNodeId: z.ZodString;
        sourcePort: z.ZodOptional<z.ZodString>;
        targetPort: z.ZodOptional<z.ZodString>;
        edgeType: z.ZodEnum<["data", "control", "conditional"]>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        timestamp: z.ZodNumber;
        userId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
    }, "strip", z.ZodTypeAny, {
        type: "EDGE_ADD";
        timestamp: number;
        userId: string;
        edgeId: string;
        documentId: string;
        operationId: string;
        sourceNodeId: string;
        targetNodeId: string;
        edgeType: "data" | "conditional" | "control";
        priority?: OperationPriority | undefined;
        metadata?: Record<string, unknown> | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        sourcePort?: string | undefined;
        targetPort?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }, {
        type: "EDGE_ADD";
        timestamp: number;
        userId: string;
        edgeId: string;
        documentId: string;
        operationId: string;
        sourceNodeId: string;
        targetNodeId: string;
        edgeType: "data" | "conditional" | "control";
        priority?: OperationPriority | undefined;
        metadata?: Record<string, unknown> | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        sourcePort?: string | undefined;
        targetPort?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }>;
    MutationOperationSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"NODE_ADD">;
        operationId: z.ZodString;
        documentId: z.ZodString;
        nodeId: z.ZodString;
        nodeType: z.ZodEnum<["WeightedChoice", "Concat", "Output", "Include", "SetVariable", "GetVariable", "WeightedAdvanced", "Conditional", "Sequential", "Markov", "PythonTransform"]>;
        position: z.ZodObject<{,
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        initialData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        parentId: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        userId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
    }, "strip", z.ZodTypeAny, {
        type: "NODE_ADD";
        position: {,
            x: number;
            y: number;
        };
        timestamp: number;
        nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        priority?: OperationPriority | undefined;
        parentId?: string | undefined;
        dependencies?: string[] | undefined;
        initialData?: Record<string, unknown> | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }, {
        type: "NODE_ADD";
        position: {,
            x: number;
            y: number;
        };
        timestamp: number;
        nodeType: "WeightedChoice" | "Concat" | "Output" | "Include" | "SetVariable" | "GetVariable" | "WeightedAdvanced" | "Conditional" | "Sequential" | "Markov" | "PythonTransform";
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        priority?: OperationPriority | undefined;
        parentId?: string | undefined;
        dependencies?: string[] | undefined;
        initialData?: Record<string, unknown> | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"NODE_UPDATE">;
        operationId: z.ZodString;
        documentId: z.ZodString;
        nodeId: z.ZodString;
        propertyPath: z.ZodArray<z.ZodString, "many">;
        oldValue: z.ZodUnknown;
        newValue: z.ZodUnknown;
        partialUpdate: z.ZodBoolean;
        validationSchema: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodNumber;
        userId: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        operationVector: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priority: z.ZodOptional<z.ZodNativeEnum<typeof OperationPriority>>;
    }, "strip", z.ZodTypeAny, {
        type: "NODE_UPDATE";
        timestamp: number;
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        propertyPath: string[];
        partialUpdate: boolean;
        priority?: OperationPriority | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
        oldValue?: unknown;
        newValue?: unknown;
        validationSchema?: string | undefined;
    }, {
        type: "NODE_UPDATE";
        timestamp: number;
        userId: string;
        nodeId: string;
        documentId: string;
        operationId: string;
        propertyPath: string[];
        partialUpdate: boolean;
        priority?: OperationPriority | undefined;
        dependencies?: string[] | undefined;
        clientId?: string | undefined;
        operationVector?: Record<string, number> | undefined;
        oldValue?: unknown;
        newValue?: unknown;
        validationSchema?: string | undefined;
    }>]>;
    VersionVectorSchema: z.ZodRecord<z.ZodString, z.ZodNumber>;
    PositionSchema: z.ZodObject<{,
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    generateOperationId: typeof generateOperationId;
    generateNodeId: typeof generateNodeId;
    generateEdgeId: typeof generateEdgeId;
    operationAffectsNode: typeof operationAffectsNode;
    operationAffectsEdge: typeof operationAffectsEdge;
    compareOperations: typeof compareOperations;
    operationsConflict: typeof operationsConflict;
    getAffectedNodeIds: typeof getAffectedNodeIds;
    getAffectedEdgeIds: typeof getAffectedEdgeIds;
};
export default _default;
//# sourceMappingURL=GraphMutations.d.ts.map