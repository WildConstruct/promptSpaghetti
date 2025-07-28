/**
 * PromptScape Graph Mutations - Core Types
 * 
 * Comprehensive type definitions for the graph mutation operational model.
 * Supports node addition, edge deletion, parameter changes, undo/redo, and
 * collaborative editing scenarios.
 */
import { Node, Edge, XYPosition } from 'reactflow';

// =============================================================================
// BASE OPERATION TYPES
// =============================================================================
/**
 * All supported operation types in the PromptScape graph mutation system
 */
export enum OperationType {
  // Node Operations
  NODE_ADD = 'NODE_ADD',
  NODE_DELETE = 'NODE_DELETE',
  NODE_UPDATE = 'NODE_UPDATE',
  NODE_MOVE = 'NODE_MOVE',
  NODE_DUPLICATE = 'NODE_DUPLICATE',
  // Edge Operations
  EDGE_ADD = 'EDGE_ADD',
  EDGE_DELETE = 'EDGE_DELETE',
  EDGE_UPDATE = 'EDGE_UPDATE',
  // Parameter Operations
  PARAM_UPDATE = 'PARAM_UPDATE',
  PARAM_BATCH_UPDATE = 'PARAM_BATCH_UPDATE',
  // Variation Operations
  VARIATION_ADD = 'VARIATION_ADD',
  VARIATION_DELETE = 'VARIATION_DELETE',
  VARIATION_UPDATE = 'VARIATION_UPDATE',
  VARIATION_REORDER = 'VARIATION_REORDER',
  // Batch Operations
  BATCH_OPERATION = 'BATCH_OPERATION',
  // Graph Structure Operations
  GRAPH_CLEAR = 'GRAPH_CLEAR',
  GRAPH_IMPORT = 'GRAPH_IMPORT',
  GRAPH_MERGE = 'GRAPH_MERGE'
}
/**
 * Base interface for all graph mutation operations
 */
export interface GraphOperation {
  readonly id: string;
  readonly type: OperationType;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly metadata?: Record<string, unknown>;
}

// =============================================================================
// NODE OPERATIONS
// =============================================================================
/**
 * Node addition operation
 */
export interface NodeAddOperation extends GraphOperation {
  type: OperationType.NODE_ADD;
  payload: {,
    node: Node;
    position: XYPosition;
    sourceNodeId?: string; // For duplications or connections
    skipValidation?: boolean;
  };
}
/**
 * Node deletion operation
 */
export interface NodeDeleteOperation extends GraphOperation {
  type: OperationType.NODE_DELETE;
  payload: {,
    nodeId: string;
    preserveConnections?: boolean;
    snapshot: Node; // For undo capability
    connectedEdges?: Edge[]; // For restoration
  };
}
/**
 * Node parameter update operation
 */
export interface NodeUpdateOperation extends GraphOperation {
  type: OperationType.NODE_UPDATE;
  payload: {,
    nodeId: string;
    updates: Record<string, unknown>;
    previousValues: Record<string, unknown>; // For undo capability
    validationOverride?: boolean;
    merge?: boolean; // Deep merge vs shallow replace
  };
}
/**
 * Node move operation
 */
export interface NodeMoveOperation extends GraphOperation {
  type: OperationType.NODE_MOVE;
  payload: {,
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
  payload: {,
    sourceNodeId: string;
    newNode: Node;
    offset: XYPosition;
    copyConnections?: boolean;
  };
}

// =============================================================================
// EDGE OPERATIONS
// =============================================================================
/**
 * Edge addition operation
 */
export interface EdgeAddOperation extends GraphOperation {
  type: OperationType.EDGE_ADD;
  payload: {,
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
  payload: {,
    edgeId: string;
    snapshot: Edge; // For undo capability
  };
}
/**
 * Edge update operation
 */
export interface EdgeUpdateOperation extends GraphOperation {
  type: OperationType.EDGE_UPDATE;
  payload: {,
    edgeId: string;
    updates: Partial<Edge>;
    previousValues: Partial<Edge>;
  };
}

// =============================================================================
// VARIATION OPERATIONS
// =============================================================================
/**
 * Add variation to node
 */
export interface VariationAddOperation extends GraphOperation {
  type: OperationType.VARIATION_ADD;
  payload: {,
    nodeId: string;
    variation: string;
    index?: number; // Insert at specific position
  };
}
/**
 * Delete variation from node
 */
export interface VariationDeleteOperation extends GraphOperation {
  type: OperationType.VARIATION_DELETE;
  payload: {,
    nodeId: string;
    index: number;
    snapshot: string; // For undo capability
  };
}
/**
 * Update existing variation
 */
export interface VariationUpdateOperation extends GraphOperation {
  type: OperationType.VARIATION_UPDATE;
  payload: {,
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
  payload: {,
    nodeId: string;
    fromIndex: number;
    toIndex: number;
    previousOrder: string[]; // For undo capability
  };
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================
/**
 * Batch operation for atomic multi-step changes
 */
export interface BatchOperation extends GraphOperation {
  type: OperationType.BATCH_OPERATION;
  payload: {,
    operations: GraphOperation[];
    atomicity: 'all_or_nothing' | 'best_effort';
    rollbackOnFailure: boolean;
    description?: string; // Human-readable description for undo
  };
}

// =============================================================================
// GRAPH STRUCTURE OPERATIONS
// =============================================================================
/**
 * Clear entire graph
 */
export interface GraphClearOperation extends GraphOperation {
  type: OperationType.GRAPH_CLEAR;
  payload: {,
    snapshot: {,
      nodes: Node[];
      edges: Edge[];
    };
    preserveHistory?: boolean;
  };
}
/**
 * Import graph data
 */
export interface GraphImportOperation extends GraphOperation {
  type: OperationType.GRAPH_IMPORT;
  payload: {,
    nodes: Node[];
    edges: Edge[];
    merge?: boolean; // Merge with existing vs replace
    conflict_resolution?: 'skip' | 'replace' | 'merge';
  };
}
/**
 * Merge graphs
 */
export interface GraphMergeOperation extends GraphOperation {
  type: OperationType.GRAPH_MERGE;
  payload: {,
    sourceNodes: Node[];
    sourceEdges: Edge[];
    strategy: 'append' | 'merge' | 'overlay';
    positionOffset?: XYPosition;
  };
}

// =============================================================================
// OPERATION RESULTS
// =============================================================================
/**
 * Result of executing a single operation
 */
export interface OperationResult {
  success: boolean;
  operation: GraphOperation;
  snapshot?: GraphSnapshot;
  error?: string;
  warnings?: string[];
  affectedNodeIds?: string[];
  affectedEdgeIds?: string[];
  executionTime?: number;
  validationErrors?: ValidationError[];
}
/**
 * Result of executing a batch operation
 */
export interface BatchOperationResult {
  success: boolean;
  batchId: string;
  results: OperationResult[];
  rollbackPerformed: boolean;
  error?: string;
  partialSuccess?: boolean;
  successCount?: number;
  failureCount?: number;
}
/**
 * Result of undo operation
 */
export interface UndoResult {
  success: boolean;
  operation?: GraphOperation;
  error?: string;
  description?: string;
}
/**
 * Result of redo operation
 */
export interface RedoResult {
  success: boolean;
  operation?: GraphOperation;
  error?: string;
  description?: string;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================
/**
 * Validation error severity levels
 */
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
/**
 * Complete validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info?: ValidationError[];
}

// =============================================================================
// GRAPH STATE TYPES
// =============================================================================
/**
 * Current state of the graph
 */
export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  metadata?: Record<string, unknown>;
  version?: number;
  lastModified?: Date;
}
/**
 * Snapshot of graph state at specific point in time
 */
export interface GraphSnapshot {
  id: string;
  state: GraphState;
  timestamp: Date;
  operationId: string;
  description?: string;
  checksum?: string; // For integrity verification
}
/**
 * History entry for undo/redo system
 */
export interface HistoryEntry {
  operation: GraphOperation;
  snapshot: GraphSnapshot;
  timestamp: Date;
  description?: string;
  canUndo?: boolean;
  canRedo?: boolean;
}

// =============================================================================
// CONFLICT RESOLUTION TYPES
// =============================================================================
/**
 * Conflict detection result
 */
export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: OperationConflict[];
  canAutoResolve: boolean;
  resolutionStrategy?: ConflictResolutionStrategy;
}
/**
 * Individual operation conflict
 */
export interface OperationConflict {
  localOperation: GraphOperation;
  remoteOperation: GraphOperation;
  conflictType: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedElements: string[]; // Node/Edge IDs
  resolutionOptions: ConflictResolutionOption[];
}
/**
 * Types of conflicts that can occur
 */
export enum ConflictType {
  CONCURRENT_EDIT = 'CONCURRENT_EDIT',        // Same element edited simultaneously
  DELETE_MODIFY = 'DELETE_MODIFY',            // One deletes, other modifies
  MOVE_MODIFY = 'MOVE_MODIFY',               // Position vs content conflicts
  STRUCTURAL_CONFLICT = 'STRUCTURAL_CONFLICT', // Graph structure conflicts
  VALIDATION_CONFLICT = 'VALIDATION_CONFLICT'  // Validation rule violations
}
/**
 * Strategies for resolving conflicts
 */
export enum ConflictResolutionStrategy {
  LAST_WRITER_WINS = 'LAST_WRITER_WINS',
  FIRST_WRITER_WINS = 'FIRST_WRITER_WINS',
  MERGE = 'MERGE',
  MANUAL = 'MANUAL',
  OPERATIONAL_TRANSFORM = 'OPERATIONAL_TRANSFORM'
}
/**
 * Resolution option for conflicts
 */
export interface ConflictResolutionOption {
  strategy: ConflictResolutionStrategy;
  description: string;
  automated: boolean;
  resultPreview?: string;
  confidence: number; // 0-1 confidence score
}

// =============================================================================
// COLLABORATIVE EDITING TYPES
// =============================================================================
/**
 * Message for collaborative editing synchronization
 */
export interface CollaborativeMessage {
  type: 'GRAPH_MUTATION' | 'CURSOR_UPDATE' | 'SELECTION_CHANGE' | 'PRESENCE_UPDATE';
  operation?: GraphOperation;
  timestamp: Date;
  userId: string;
  sessionId: string;
  data?: Record<string, unknown>;
}
/**
 * User presence information
 */
export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  cursor?: XYPosition;
  selection?: string[]; // Selected node/edge IDs
  color: string;
  lastActivity: Date;
  isActive: boolean;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================
/**
 * Validation configuration
 */
export interface ValidationConfig {
  strictMode: boolean;
  allowDangerousOperations: boolean;
  customValidators: ValidationFunction[];
  enableSchemaValidation: boolean;
  enableStructuralValidation: boolean;
  enableSemanticValidation: boolean;
}
/**
 * Custom validation function
 */
export type ValidationFunction = ()
  operation: GraphOperation,
  state: GraphState,
) => Promise<ValidationError[]> | ValidationError[];
/**
 * Conflict resolution configuration
 */
export interface ConflictResolutionConfig {
  strategy: ConflictResolutionStrategy;
  autoResolve: boolean;
  maxConflictAge: number; // milliseconds
  enableOperationalTransform: boolean;
  conflictDetectionSensitivity: 'low' | 'medium' | 'high';
}
/**
 * Complete mutation engine configuration
 */
export interface MutationEngineConfig {
  // History management
  historyLimit: number;
  enableUndo: boolean;
  enableRedo: boolean;
  // Validation settings
  validation: ValidationConfig;
  // Conflict resolution
  conflictResolution: ConflictResolutionConfig;
  // Batch operations
  batchAtomicity: 'all_or_nothing' | 'best_effort';
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
}

// =============================================================================
// UTILITY TYPES
// =============================================================================
/**
 * Union type of all possible operations
 */
export type AnyGraphOperation = 
  | NodeAddOperation
  | NodeDeleteOperation
  | NodeUpdateOperation
  | NodeMoveOperation
  | NodeDuplicateOperation
  | EdgeAddOperation
  | EdgeDeleteOperation
  | EdgeUpdateOperation
  | VariationAddOperation
  | VariationDeleteOperation
  | VariationUpdateOperation
  | VariationReorderOperation
  | BatchOperation
  | GraphClearOperation
  | GraphImportOperation
  | GraphMergeOperation;
/**
 * Type guard to check if operation is a node operation
 */
export function isNodeOperation(operation: GraphOperation): operation is 
  NodeAddOperation | NodeDeleteOperation | NodeUpdateOperation | NodeMoveOperation | NodeDuplicateOperation {
  return operation.type.startsWith('NODE_');
}
/**
 * Type guard to check if operation is an edge operation
 */
export function isEdgeOperation(operation: GraphOperation): operation is 
  EdgeAddOperation | EdgeDeleteOperation | EdgeUpdateOperation {
  return operation.type.startsWith('EDGE_');
}
/**
 * Type guard to check if operation is a variation operation
 */
export function isVariationOperation(operation: GraphOperation): operation is 
  VariationAddOperation | VariationDeleteOperation | VariationUpdateOperation | VariationReorderOperation {
  return operation.type.startsWith('VARIATION_');
}
/**
 * Type guard to check if operation is a batch operation
 */
export function isBatchOperation(operation: GraphOperation): operation is BatchOperation {
  return operation.type === OperationType.BATCH_OPERATION;
}
/**
 * Extract payload type from operation
 */
export type OperationPayload<T extends GraphOperation> = T['payload'];
/**
 * Create operation result type
 */
export type CreateOperationResult<T extends GraphOperation> = OperationResult & {
  operation: T;
};

// =============================================================================
// EVENTS
// =============================================================================
/**
 * Events emitted by the mutation engine
 */
export interface MutationEngineEvents {
  'operation_executed': {
    operation: GraphOperation;
    result: OperationResult;
    executionTime: number;
  };
  'operation_failed': {
    operation: GraphOperation;
    error: string;
    validationErrors?: ValidationError[];
  };
  'batch_executed': {
    batchId: string;
    results: OperationResult[];
    success: boolean;
  };
  'undo_executed': {
    operation: GraphOperation;
    success: boolean;
  };
  'redo_executed': {
    operation: GraphOperation;
    success: boolean;
  };
  'conflict_detected': {
    conflict: OperationConflict;
    resolutionStrategy: ConflictResolutionStrategy;
  };
  'conflict_resolved': {
    conflict: OperationConflict;
    resolution: GraphOperation;
    strategy: ConflictResolutionStrategy;
  };
  'snapshot_created': {
    snapshot: GraphSnapshot;
    reason: 'operation' | 'interval' | 'manual';
  };
  'validation_error': {
    operation: GraphOperation;
    errors: ValidationError[];
  };
  'state_changed': {
    previousState: GraphState;
    newState: GraphState;
    operation: GraphOperation;
  };
}
/**
 * Event listener type for mutation engine
 */
export type MutationEngineEventListener<K extends keyof MutationEngineEvents> = 
  (data: MutationEngineEvents[K]) => void | Promise<void>;