/**
 * Epic 23: Graph Mutations - Core Types and Interfaces
 * 
 * Defines the operational model for real-time collaborative graph editing
 * Integrates with existing WebSocket collaboration infrastructure
 */
import { z } from 'zod';
import { NodeTypeEnum, Node } from '../graphSchema';

// =============================================================================
// Core Mutation Operation Types
// =============================================================================
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
  dependencies?: string;
  /**
  * Version vector for operation ordering and conflict resolution
  */




export interface VersionVector {
  [clientId: string]: number;
  /**
  * Operation priority for conflict resolution
  */


export enum OperationPriority { LOW = 1,
  MEDIUM = 2, 
  HIGH = 3 }
  CRITICAL = 4

// =============================================================================
// Node Operations
// =============================================================================
/**
 * Node Addition Operation
 */


export interface NodeAddOperation extends BaseMutationOperation { type: 'NODE_ADD';,
  nodeId: string;
  nodeType: z.infer<typeof NodeTypeEnum> }
  position: { x: number; y: number };
  initialData?: Record<string, unknown>;
  parentId?: string;
  priority?: OperationPriority;
/**
 * Node Update Operation
 */


export interface NodeUpdateOperation extends BaseMutationOperation { type: 'NODE_UPDATE'
  nodeId: string;
  propertyPath: string;
  oldValue: unknown;
  newValue: unknown;
  partialUpdate: boolean;
  validationSchema?: string;
  priority?: OperationPriority;
  /**
  * Node Removal Operation
  */
  export interface NodeRemoveOperation extends BaseMutationOperation {
  type: 'NODE_REMOVE' }
  nodeId: string;
  cascadeDelete: boolean;
  preserveConnections: boolean;
  snapshotData?: Node;
  priority?: OperationPriority;
  // =============================================================================
  // Edge Operations
  // =============================================================================
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
  metadata?: Record<string, unknown>;
  /**
  * Edge Addition Operation
  */




export interface EdgeAddOperation extends BaseMutationOperation { type: 'EDGE_ADD'
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
  edgeType: 'data' | 'control' | 'conditional';
  metadata?: Record<string, unknown>;
  priority?: OperationPriority;
  /**
  * Edge Update Operation
  */
  export interface EdgeUpdateOperation extends BaseMutationOperation {
  type: 'EDGE_UPDATE'
  edgeId: string;
  property: 'source' | 'target' | 'sourcePort' | 'targetPort' | 'metadata' | 'type'
  oldValue: unknown;
  newValue: unknown;
  priority?: OperationPriority;
  /**
  * Edge Removal Operation
  */
  export interface EdgeRemoveOperation extends BaseMutationOperation {
  type: 'EDGE_REMOVE'
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  snapshotData?: GraphEdge;
  priority?: OperationPriority;
  // =============================================================================
  // Parameter Operations
  // =============================================================================
  /**
  * Parameter Update Operation
  */
  export interface ParameterUpdateOperation extends BaseMutationOperation {
  type: 'PARAMETER_UPDATE'
  nodeId: string;
  parameterKey: string;
  parameterPath?: string;
  valueType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  oldValue: unknown;
  newValue: unknown;
  validationSchema?: string;
  priority?: OperationPriority;
  // =============================================================================
  // Batch Operations
  // =============================================================================
  /**
  * Batch Operation for atomic multi-operation execution
  */
  export interface BatchMutationOperation extends BaseMutationOperation {
  type: 'BATCH_MUTATION'
  batchId: string;
  operations: MutationOperation;
  atomic: boolean;
  rollbackOnFailure: boolean;
  priority?: OperationPriority;
  // =============================================================================
  // Union Types
  // =============================================================================
  /**
  * All possible mutation operation types
  */
  export type MutationOperation =
  | NodeAddOperation
  | NodeUpdateOperation
  | NodeRemoveOperation
  | EdgeAddOperation
  | EdgeUpdateOperation
  | EdgeRemoveOperation
  | ParameterUpdateOperation
  | BatchMutationOperation;
  /**
  * Node-specific operations
  */
  export type NodeMutationOperation =
  | NodeAddOperation
  | NodeUpdateOperation
  | NodeRemoveOperation;
  /**
  * Edge-specific operations
  */
  export type EdgeMutationOperation =
  | EdgeAddOperation
  | EdgeUpdateOperation
  | EdgeRemoveOperation;
  // =============================================================================
  // Conflict Resolution
  // =============================================================================
  /**
  * Conflict types for different scenarios
  */
  export enum ConflictType {
  NODE_CREATION = 'node_creation'
  NODE_DELETION = 'node_deletion'
  NODE_PROPERTIES = 'node_properties'
  NODE_POSITION = 'node_position'
  EDGE_CREATION = 'edge_creation'
  EDGE_DELETION = 'edge_deletion'
  EDGE_PROPERTIES = 'edge_properties'
  PARAMETER_UPDATE = 'parameter_update'
  CIRCULAR_DEPENDENCY = 'circular_dependency'
  VALIDATION_ERROR = 'validation_error'
  /**
  * Conflict resolution strategies
  */
  export enum ResolutionStrategy {
  ACCEPT_LOCAL = 'accept_local'
  ACCEPT_REMOTE = 'accept_remote'
  LAST_WRITER_WINS = 'last_writer_wins'
  FIRST_WRITER_WINS = 'first_writer_wins'
  MERGE_CHANGES = 'merge_changes'
  MANUAL_RESOLUTION = 'manual_resolution'
  ROLLBACK_OPERATION = 'rollback_operation' }
  AUTO_MERGE = 'auto_merge'
  /**
  * Conflict resolution data
  */
  export interface ConflictResolution {
  conflictId: string;
  conflictType: ConflictType;
  strategy: ResolutionStrategy;
  affectedOperations: string;
  affectedElements: string;
  resolutionData?: Record<string, unknown>;
  resolvedBy: string;
  timestamp: number;
  automatic: boolean;
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
  options: ResolutionOption;
  /**
  * Resolution option for conflict UI
  */




export interface ResolutionOption {
  strategy: ResolutionStrategy;
  label: string;
  description: string;
  preview?: Record<string, unknown>;
  recommended: boolean;
  // =============================================================================
  // WebSocket Message Types
  // =============================================================================
  /**
  * Graph mutation message for WebSocket transport
  */




export interface GraphMutationMessage { type: 'GRAPH_MUTATION' }
  operationId: string;
  documentId: string;
  operation: MutationOperation;
  userId: string;
  timestamp: number;
  operationVector: VersionVector;
  dependencies?: string;
  requiresAck: boolean;
  /**
  * Batch mutation message
  */




export interface BatchMutationMessage { type: 'BATCH_MUTATION' }
  batchId: string;
  documentId: string;
  operations: MutationOperation;
  atomic: boolean;
  userId: string;
  timestamp: number;
  /**
  * Conflict detected message
  */




export interface ConflictDetectedMessage { type: 'CONFLICT_DETECTED' }
  conflictId: string;
  documentId: string;
  conflictType: ConflictType;
  conflictOperation: ConflictOperation;
  affectedOperations: string;
  affectedElements: string;
  resolutionRequired: boolean;
  suggestedResolution?: ResolutionStrategy;
  timeout?: number;
  /**
  * Conflict resolved message
  */




export interface ConflictResolvedMessage { type: 'CONFLICT_RESOLVED' }
  conflictId: string;
  documentId: string;
  resolution: ConflictResolution;
  resultingOperations: MutationOperation;
  timestamp: number;
  /**
  * Delta synchronization message
  */




export interface DeltaSyncMessage { type: 'DELTA_SYNC' }
  documentId: string;
  fromVersion: number;
  toVersion: number;
  operations: MutationOperation;
  checksum: string;
  userId: string;
  /**
  * State verification message
  */




export interface StateVerificationMessage { type: 'STATE_VERIFICATION' }
  documentId: string;
  nodeCount: number;
  edgeCount: number;
  nodeChecksum: string;
  edgeChecksum: string;
  operationCount: number;
  lastOperationId: string;
  requiredResync: boolean;
  /**
  * Operation acknowledgment message
  */




export interface OperationAckMessage { type: 'OPERATION_ACK' }
  operationId: string;
  documentId: string;
  success: boolean;
  error?: string;
  resultingVersion: number;
  timestamp: number;
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
export const PositionSchema = z.object({ x: z.number()
  y: z.number() }
});
/**
 * Node add operation validation schema
 */
export const NodeAddOperationSchema = z.object({ type: z.literal('NODE_ADD')
  operationId: z.string().min(1)
  documentId: z.string().min(1)
  nodeId: z.string().min(1)
  nodeType: NodeTypeEnum
  position: PositionSchema
  initialData: z.record(z.unknown()).optional()
  parentId: z.string().optional()
  timestamp: z.number().positive()
  userId: z.string().min(1)
  clientId: z.string().optional()
  operationVector: VersionVectorSchema.optional()
  dependencies: z.array(z.string()).optional()
  priority: z.nativeEnum(OperationPriority).optional() }
});
/**
 * Node update operation validation schema
 */
export const NodeUpdateOperationSchema = z.object({ type: z.literal('NODE_UPDATE')
  operationId: z.string().min(1)
  documentId: z.string().min(1)
  nodeId: z.string().min(1)
  propertyPath: z.array(z.string())
  oldValue: z.unknown()
  newValue: z.unknown()
  partialUpdate: z.boolean()
  validationSchema: z.string().optional()
  timestamp: z.number().positive()
  userId: z.string().min(1)
  clientId: z.string().optional()
  operationVector: VersionVectorSchema.optional()
  dependencies: z.array(z.string()).optional()
  priority: z.nativeEnum(OperationPriority).optional() }
});
/**
 * Edge add operation validation schema
 */
export const EdgeAddOperationSchema = z.object({ type: z.literal('EDGE_ADD')
  operationId: z.string().min(1)
  documentId: z.string().min(1)
  edgeId: z.string().min(1)
  sourceNodeId: z.string().min(1)
  targetNodeId: z.string().min(1)
  sourcePort: z.string().optional()
  targetPort: z.string().optional()
  edgeType: z.enum(['data', 'control', 'conditional'])
  metadata: z.record(z.unknown()).optional()
  timestamp: z.number().positive()
  userId: z.string().min(1)
  clientId: z.string().optional()
  operationVector: VersionVectorSchema.optional()
  dependencies: z.array(z.string()).optional()
  priority: z.nativeEnum(OperationPriority).optional() }
});
/**
 * All mutation operation schemas union
 */
export const MutationOperationSchema = z.discriminatedUnion('type', [)
  NodeAddOperationSchema
  NodeUpdateOperationSchema
  // Additional schemas would be added here for other operation types
]);

// =============================================================================
// Utility Functions
// =============================================================================
/**
 * Generate a unique operation ID
 */
export function generateOperationId(userId: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `op_${userId}_${ts}_${random}`;}
/**
 * Generate a unique node ID
 */
export function generateNodeId(prefix: string = 'node'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;}
/**
 * Generate a unique edge ID
 */
export function generateEdgeId(sourceId: string, targetId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `edge_${sourceId}_${targetId}_${timestamp}_${random}`;}
/**
 * Check if an operation affects a specific node
 */
export function operationAffectsNode(operation: MutationOperation, nodeId: string): boolean { switch (operation.type) {
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
  /**
  * Check if an operation affects a specific edge
  */
  export function operationAffectsEdge(operation: MutationOperation, edgeId: string): boolean {
  switch (operation.type) {
  case 'EDGE_ADD':
  case 'EDGE_UPDATE':
  case 'EDGE_REMOVE':
  return operation.edgeId === edgeId;
  case 'BATCH_MUTATION':
  return operation.operations.some(op => operationAffectsEdge(op, edgeId));
  default:
  return false;
  /**
  * Compare operation timestamps for ordering
  */
  export function compareOperations(op1: MutationOperation, op2: MutationOperation): number {
  if (op1.timestamp !== op2.timestamp) {
  return op1.timestamp - op2.timestamp;
  // Tie-breaker using operation ID
  return op1.operationId.localeCompare(op2.operationId);
  /**
  * Check if two operations conflict
  */
  export function operationsConflict(op1: MutationOperation, op2: MutationOperation): boolean {
  // Same operation - no conflict
  if (op1.operationId === op2.operationId) {
  return false;
  // Check for node conflicts
  if ((op1.type.startsWith('NODE_') || op1.type === 'PARAMETER_UPDATE') &&
  (op2.type.startsWith('NODE_') || op2.type === 'PARAMETER_UPDATE')) {
  const nodeId1 = 'nodeId' in op1 ? op1.nodeId : '';
  const nodeId2 = 'nodeId' in op2 ? op2.nodeId : '';
  return nodeId1 === nodeId2 && nodeId1 !== '';
  // Check for edge conflicts
  if (op1.type.startsWith('EDGE_') && op2.type.startsWith('EDGE_')) {
  const edgeId1 = 'edgeId' in op1 ? op1.edgeId : '';
  const edgeId2 = 'edgeId' in op2 ? op2.edgeId : '';
  return edgeId1 === edgeId2 && edgeId1 !== '';
  return false;
  /**
  * Extract all node IDs affected by an operation
  */
  export function getAffectedNodeIds(operation: MutationOperation): string {
  const nodeIds: string = [];
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
  case 'BATCH_MUTATION': }
  operation.operations.forEach(op => { )
  nodeIds.push(...getAffectedNodeIds(op)) });
    break;
  return Array.from(new Set(nodeIds));
/**
 * Extract all edge IDs affected by an operation
 */
export function getAffectedEdgeIds(operation: MutationOperation): string { const edgeIds: string = [];
  switch (operation.type) {
  case 'EDGE_ADD':
  case 'EDGE_UPDATE':
  case 'EDGE_REMOVE':
  edgeIds.push(operation.edgeId);
  break;
  case 'BATCH_MUTATION': }
  operation.operations.forEach(op => { )
  edgeIds.push(...getAffectedEdgeIds(op)) });
    break;
  return Array.from(new Set(edgeIds));

export default { // Types
  ConflictType
  ResolutionStrategy
  OperationPriority
  // Schemas
  NodeAddOperationSchema
  NodeUpdateOperationSchema
  EdgeAddOperationSchema
  MutationOperationSchema
  VersionVectorSchema
  PositionSchema
  // Utilities
  generateOperationId
  generateNodeId
  generateEdgeId
  operationAffectsNode
  operationAffectsEdge
  compareOperations
  operationsConflict
  getAffectedNodeIds }
  getAffectedEdgeIds
};