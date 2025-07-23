/**
 * Epic 23: Graph Mutations - Core Types and Interfaces
 *
 * Defines the operational model for real-time collaborative graph editing
 * Integrates with existing WebSocket collaboration infrastructure
 */
import { z } from 'zod';
import { NodeTypeEnum } from '../graphSchema';
/**
 * Operation priority for conflict resolution
 */
export var OperationPriority;
(function (OperationPriority) {
    OperationPriority[OperationPriority["LOW"] = 1] = "LOW";
    OperationPriority[OperationPriority["MEDIUM"] = 2] = "MEDIUM";
    OperationPriority[OperationPriority["HIGH"] = 3] = "HIGH";
    OperationPriority[OperationPriority["CRITICAL"] = 4] = "CRITICAL";
})(OperationPriority || (OperationPriority = {}));
// =============================================================================
// Conflict Resolution
// =============================================================================
/**
 * Conflict types for different scenarios
 */
export var ConflictType;
(function (ConflictType) {
    ConflictType["NODE_CREATION"] = "node_creation";
    ConflictType["NODE_DELETION"] = "node_deletion";
    ConflictType["NODE_PROPERTIES"] = "node_properties";
    ConflictType["NODE_POSITION"] = "node_position";
    ConflictType["EDGE_CREATION"] = "edge_creation";
    ConflictType["EDGE_DELETION"] = "edge_deletion";
    ConflictType["EDGE_PROPERTIES"] = "edge_properties";
    ConflictType["PARAMETER_UPDATE"] = "parameter_update";
    ConflictType["CIRCULAR_DEPENDENCY"] = "circular_dependency";
    ConflictType["VALIDATION_ERROR"] = "validation_error";
})(ConflictType || (ConflictType = {}));
/**
 * Conflict resolution strategies
 */
export var ResolutionStrategy;
(function (ResolutionStrategy) {
    ResolutionStrategy["ACCEPT_LOCAL"] = "accept_local";
    ResolutionStrategy["ACCEPT_REMOTE"] = "accept_remote";
    ResolutionStrategy["LAST_WRITER_WINS"] = "last_writer_wins";
    ResolutionStrategy["FIRST_WRITER_WINS"] = "first_writer_wins";
    ResolutionStrategy["MERGE_CHANGES"] = "merge_changes";
    ResolutionStrategy["MANUAL_RESOLUTION"] = "manual_resolution";
    ResolutionStrategy["ROLLBACK_OPERATION"] = "rollback_operation";
    ResolutionStrategy["AUTO_MERGE"] = "auto_merge";
})(ResolutionStrategy || (ResolutionStrategy = {}));
// =============================================================================
// Validation Schemas (Zod)
// =============================================================================
/**
 * Version vector validation schema
 */
export const VersionVectorSchema = z.record(z.string(), z.number().min(0));
/**
 * Position validation schema
 */
export const PositionSchema = z.object({
    x: z.number(),
    y: z.number()
});
/**
 * Node add operation validation schema
 */
export const NodeAddOperationSchema = z.object({
    type: z.literal('NODE_ADD'),
    operationId: z.string().min(1),
    documentId: z.string().min(1),
    nodeId: z.string().min(1),
    nodeType: NodeTypeEnum,
    position: PositionSchema,
    initialData: z.record(z.any()).optional(),
    parentId: z.string().optional(),
    timestamp: z.number().positive(),
    userId: z.string().min(1),
    clientId: z.string().optional(),
    operationVector: VersionVectorSchema.optional(),
    dependencies: z.array(z.string()).optional(),
    priority: z.nativeEnum(OperationPriority).optional()
});
/**
 * Node update operation validation schema
 */
export const NodeUpdateOperationSchema = z.object({
    type: z.literal('NODE_UPDATE'),
    operationId: z.string().min(1),
    documentId: z.string().min(1),
    nodeId: z.string().min(1),
    propertyPath: z.array(z.string()),
    oldValue: z.any(),
    newValue: z.any(),
    partialUpdate: z.boolean(),
    validationSchema: z.string().optional(),
    timestamp: z.number().positive(),
    userId: z.string().min(1),
    clientId: z.string().optional(),
    operationVector: VersionVectorSchema.optional(),
    dependencies: z.array(z.string()).optional(),
    priority: z.nativeEnum(OperationPriority).optional()
});
/**
 * Edge add operation validation schema
 */
export const EdgeAddOperationSchema = z.object({
    type: z.literal('EDGE_ADD'),
    operationId: z.string().min(1),
    documentId: z.string().min(1),
    edgeId: z.string().min(1),
    sourceNodeId: z.string().min(1),
    targetNodeId: z.string().min(1),
    sourcePort: z.string().optional(),
    targetPort: z.string().optional(),
    edgeType: z.enum(['data', 'control', 'conditional']),
    metadata: z.record(z.any()).optional(),
    timestamp: z.number().positive(),
    userId: z.string().min(1),
    clientId: z.string().optional(),
    operationVector: VersionVectorSchema.optional(),
    dependencies: z.array(z.string()).optional(),
    priority: z.nativeEnum(OperationPriority).optional()
});
/**
 * All mutation operation schemas union
 */
export const MutationOperationSchema = z.discriminatedUnion('type', [
    NodeAddOperationSchema,
    NodeUpdateOperationSchema
    // Additional schemas would be added here for other operation types
]);
// =============================================================================
// Utility Functions
// =============================================================================
/**
 * Generate a unique operation ID
 */
export function generateOperationId(userId, timestamp) {
    const ts = timestamp || Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `op_${userId}_${ts}_${random}`;
}
/**
 * Generate a unique node ID
 */
export function generateNodeId(prefix = 'node') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
}
/**
 * Generate a unique edge ID
 */
export function generateEdgeId(sourceId, targetId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `edge_${sourceId}_${targetId}_${timestamp}_${random}`;
}
/**
 * Check if an operation affects a specific node
 */
export function operationAffectsNode(operation, nodeId) {
    switch (operation.type) {
        case 'NODE_ADD':
        case 'NODE_UPDATE':
        case 'NODE_REMOVE':
        case 'PARAMETER_UPDATE':
            return operation.nodeId === nodeId;
        case 'EDGE_ADD':
        case 'EDGE_UPDATE':
        case 'EDGE_REMOVE':
            return operation.sourceNodeId === nodeId || operation.targetNodeId === nodeId;
        case 'BATCH_MUTATION':
            return operation.operations.some(op => operationAffectsNode(op, nodeId));
        default:
            return false;
    }
}
/**
 * Check if an operation affects a specific edge
 */
export function operationAffectsEdge(operation, edgeId) {
    switch (operation.type) {
        case 'EDGE_ADD':
        case 'EDGE_UPDATE':
        case 'EDGE_REMOVE':
            return operation.edgeId === edgeId;
        case 'BATCH_MUTATION':
            return operation.operations.some(op => operationAffectsEdge(op, edgeId));
        default:
            return false;
    }
}
/**
 * Compare operation timestamps for ordering
 */
export function compareOperations(op1, op2) {
    if (op1.timestamp !== op2.timestamp) {
        return op1.timestamp - op2.timestamp;
    }
    // Tie-breaker using operation ID
    return op1.operationId.localeCompare(op2.operationId);
}
/**
 * Check if two operations conflict
 */
export function operationsConflict(op1, op2) {
    // Same operation - no conflict
    if (op1.operationId === op2.operationId) {
        return false;
    }
    // Check for node conflicts
    if ((op1.type.startsWith('NODE_') || op1.type === 'PARAMETER_UPDATE') &&
        (op2.type.startsWith('NODE_') || op2.type === 'PARAMETER_UPDATE')) {
        const nodeId1 = 'nodeId' in op1 ? op1.nodeId : '';
        const nodeId2 = 'nodeId' in op2 ? op2.nodeId : '';
        return nodeId1 === nodeId2 && nodeId1 !== '';
    }
    // Check for edge conflicts
    if (op1.type.startsWith('EDGE_') && op2.type.startsWith('EDGE_')) {
        const edgeId1 = 'edgeId' in op1 ? op1.edgeId : '';
        const edgeId2 = 'edgeId' in op2 ? op2.edgeId : '';
        return edgeId1 === edgeId2 && edgeId1 !== '';
    }
    return false;
}
/**
 * Extract all node IDs affected by an operation
 */
export function getAffectedNodeIds(operation) {
    const nodeIds = [];
    switch (operation.type) {
        case 'NODE_ADD':
        case 'NODE_UPDATE':
        case 'NODE_REMOVE':
        case 'PARAMETER_UPDATE':
            nodeIds.push(operation.nodeId);
            break;
        case 'EDGE_ADD':
        case 'EDGE_UPDATE':
        case 'EDGE_REMOVE':
            nodeIds.push(operation.sourceNodeId, operation.targetNodeId);
            break;
        case 'BATCH_MUTATION':
            operation.operations.forEach(op => {
                nodeIds.push(...getAffectedNodeIds(op));
            });
            break;
    }
    return Array.from(new Set(nodeIds));
}
/**
 * Extract all edge IDs affected by an operation
 */
export function getAffectedEdgeIds(operation) {
    const edgeIds = [];
    switch (operation.type) {
        case 'EDGE_ADD':
        case 'EDGE_UPDATE':
        case 'EDGE_REMOVE':
            edgeIds.push(operation.edgeId);
            break;
        case 'BATCH_MUTATION':
            operation.operations.forEach(op => {
                edgeIds.push(...getAffectedEdgeIds(op));
            });
            break;
    }
    return Array.from(new Set(edgeIds));
}
export default {
    // Types
    ConflictType,
    ResolutionStrategy,
    OperationPriority,
    // Schemas
    NodeAddOperationSchema,
    NodeUpdateOperationSchema,
    EdgeAddOperationSchema,
    MutationOperationSchema,
    VersionVectorSchema,
    PositionSchema,
    // Utilities
    generateOperationId,
    generateNodeId,
    generateEdgeId,
    operationAffectsNode,
    operationAffectsEdge,
    compareOperations,
    operationsConflict,
    getAffectedNodeIds,
    getAffectedEdgeIds
};
