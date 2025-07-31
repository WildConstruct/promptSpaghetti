# PromptScape Graph Mutations Operational Model

## Executive Summary

This document defines the operational model for PromptScape graph mutations, providing a comprehensive framework for handling node addition, edge deletion, parameter changes, and other graph modifications. The model addresses current limitations in the codebase while preserving existing architectural strengths.

## Current State Analysis

### Existing Strengths

- ✅ **Immutable Updates**: All mutations preserve immutability using spread operators
- ✅ **Type Safety**: TypeScript + Zod schema validation ensures type correctness
- ✅ **Centralized State**: Zustand store provides single source of truth
- ✅ **Modular Validation**: Separate validation logic with comprehensive error reporting
- ✅ **Dual State Sync**: Both global (Zustand) and local (React) state management

### Current Limitations

- ❌ **No Operation History**: Every mutation is immediately permanent
- ❌ **No Command Pattern**: Direct state mutations without abstraction
- ❌ **No Batch Operations**: Multiple related changes aren't grouped
- ❌ **No Conflict Resolution**: No handling for concurrent modifications
- ❌ **Limited Validation**: Only basic connection validation exists

## Operational Model Architecture

### 1. Mutation Operation Types

```typescript
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

/**
 * All supported operation types
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
  GRAPH_MERGE = 'GRAPH_MERGE',
}
```

### 2. Specific Operation Interfaces

```typescript
/**
 * Node addition operation
 */
export interface NodeAddOperation extends GraphOperation {
  type: OperationType.NODE_ADD;
  payload: {
    node: Node;
    position: XYPosition;
    sourceNodeId?: string; // For duplications or connections
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
    snapshot: Node; // For undo capability
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
    previousValues: Record<string, unknown>; // For undo capability
    validationOverride?: boolean;
  };
}

/**
 * Edge operations
 */
export interface EdgeAddOperation extends GraphOperation {
  type: OperationType.EDGE_ADD;
  payload: {
    edge: Edge;
    skipValidation?: boolean;
  };
}

export interface EdgeDeleteOperation extends GraphOperation {
  type: OperationType.EDGE_DELETE;
  payload: {
    edgeId: string;
    snapshot: Edge; // For undo capability
  };
}

/**
 * Batch operation for atomic multi-step changes
 */
export interface BatchOperation extends GraphOperation {
  type: OperationType.BATCH_OPERATION;
  payload: {
    operations: GraphOperation[];
    atomicity: 'all_or_nothing' | 'best_effort';
    rollbackOnFailure: boolean;
  };
}
```

### 3. Operation Execution Engine

```typescript
/**
 * Core engine for executing graph mutations
 */
export class GraphMutationEngine {
  private history: OperationHistory;
  private validator: GraphValidator;
  private conflictResolver: ConflictResolver;
  private eventEmitter: EventEmitter;

  constructor(
    private store: GraphStore,
    private config: MutationEngineConfig
  ) {
    this.history = new OperationHistory(config.historyLimit);
    this.validator = new GraphValidator(config.validation);
    this.conflictResolver = new ConflictResolver(config.conflictResolution);
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Execute a single operation with full validation and history tracking
   */
  async execute(operation: GraphOperation): Promise<OperationResult> {
    const startTime = Date.now();

    try {
      // Pre-execution validation
      const validationResult = await this.validator.validate(operation, this.store.getState());
      if (!validationResult.valid) {
        return this.createFailureResult(operation, validationResult.errors);
      }

      // Check for conflicts (collaborative editing)
      const conflictResult = await this.conflictResolver.checkConflicts(operation);
      if (conflictResult.hasConflicts) {
        return await this.handleConflicts(operation, conflictResult);
      }

      // Execute the operation
      const executionResult = await this.executeOperation(operation);
      if (!executionResult.success) {
        return executionResult;
      }

      // Post-execution validation
      const postValidation = await this.validator.validateState(this.store.getState());
      if (!postValidation.valid) {
        // Rollback on post-validation failure
        await this.rollback(operation);
        return this.createFailureResult(operation, postValidation.errors);
      }

      // Record in history for undo/redo
      this.history.record(operation, executionResult.snapshot);

      // Emit events for collaborative synchronization
      this.eventEmitter.emit('operation_executed', {
        operation,
        result: executionResult,
        executionTime: Date.now() - startTime,
      });

      return executionResult;
    } catch (error) {
      return this.createErrorResult(operation, error);
    }
  }

  /**
   * Execute multiple operations as a batch
   */
  async executeBatch(operations: GraphOperation[]): Promise<BatchOperationResult> {
    const batchId = generateId();
    const results: OperationResult[] = [];
    const snapshots: GraphSnapshot[] = [];

    // Create savepoint
    const initialSnapshot = this.store.createSnapshot();

    try {
      for (const operation of operations) {
        const result = await this.execute(operation);
        results.push(result);

        if (!result.success) {
          // Handle batch failure based on atomicity setting
          if (this.config.batchAtomicity === 'all_or_nothing') {
            await this.restoreSnapshot(initialSnapshot);
            return {
              success: false,
              batchId,
              results,
              rollbackPerformed: true,
              error: `Batch operation failed at step ${results.length}: ${result.error}`,
            };
          }
        }
      }

      return {
        success: true,
        batchId,
        results,
        rollbackPerformed: false,
      };
    } catch (error) {
      await this.restoreSnapshot(initialSnapshot);
      return {
        success: false,
        batchId,
        results,
        rollbackPerformed: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

### 4. Undo/Redo System

```typescript
/**
 * Operation history manager for undo/redo functionality
 */
export class OperationHistory {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  constructor(private maxSize: number = 100) {}

  /**
   * Record an operation for potential undo
   */
  record(operation: GraphOperation, snapshot: GraphSnapshot): void {
    const entry: HistoryEntry = {
      operation,
      snapshot,
      timestamp: new Date(),
    };

    this.undoStack.push(entry);
    this.redoStack = []; // Clear redo stack when new operation is recorded

    // Maintain size limit
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo the last operation
   */
  async undo(engine: GraphMutationEngine): Promise<UndoResult> {
    const entry = this.undoStack.pop();
    if (!entry) {
      return { success: false, error: 'Nothing to undo' };
    }

    try {
      // Create inverse operation
      const inverseOperation = this.createInverseOperation(entry.operation, entry.snapshot);

      // Execute inverse operation
      const result = await engine.execute(inverseOperation);
      if (result.success) {
        this.redoStack.push(entry);
      }

      return {
        success: result.success,
        operation: entry.operation,
        error: result.error,
      };
    } catch (error) {
      // Restore the entry if undo failed
      this.undoStack.push(entry);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Redo the last undone operation
   */
  async redo(engine: GraphMutationEngine): Promise<RedoResult> {
    const entry = this.redoStack.pop();
    if (!entry) {
      return { success: false, error: 'Nothing to redo' };
    }

    try {
      const result = await engine.execute(entry.operation);
      if (result.success) {
        this.undoStack.push(entry);
      }

      return {
        success: result.success,
        operation: entry.operation,
        error: result.error,
      };
    } catch (error) {
      this.redoStack.push(entry);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

### 5. Validation System

```typescript
/**
 * Comprehensive graph validation system
 */
export class GraphValidator {
  constructor(private config: ValidationConfig) {}

  /**
   * Validate operation before execution
   */
  async validate(operation: GraphOperation, currentState: GraphState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    switch (operation.type) {
      case OperationType.NODE_ADD:
        errors.push(...(await this.validateNodeAdd(operation as NodeAddOperation, currentState)));
        break;

      case OperationType.NODE_DELETE:
        errors.push(...(await this.validateNodeDelete(operation as NodeDeleteOperation, currentState)));
        break;

      case OperationType.EDGE_ADD:
        errors.push(...(await this.validateEdgeAdd(operation as EdgeAddOperation, currentState)));
        break;

      case OperationType.PARAM_UPDATE:
        errors.push(...(await this.validateParamUpdate(operation as NodeUpdateOperation, currentState)));
        break;

      // ... other operation types
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate node addition
   */
  private async validateNodeAdd(operation: NodeAddOperation, state: GraphState): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const { node, position } = operation.payload;

    // Check for duplicate IDs
    if (state.nodes.some(n => n.id === node.id)) {
      errors.push({
        type: 'DUPLICATE_NODE_ID',
        message: `Node with ID ${node.id} already exists`,
        severity: 'error',
      });
    }

    // Validate node schema
    const nodeSchema = nodeSchemas[node.data.nodeType];
    if (!nodeSchema) {
      errors.push({
        type: 'INVALID_NODE_TYPE',
        message: `Unknown node type: ${node.data.nodeType}`,
        severity: 'error',
      });
    } else {
      try {
        nodeSchema.parse(node.data);
      } catch (schemaError) {
        errors.push({
          type: 'SCHEMA_VALIDATION_FAILED',
          message: `Node data validation failed: ${schemaError}`,
          severity: 'error',
        });
      }
    }

    // Validate position
    if (!this.isValidPosition(position)) {
      errors.push({
        type: 'INVALID_POSITION',
        message: 'Node position is invalid',
        severity: 'warning',
      });
    }

    return errors;
  }

  /**
   * Validate edge addition
   */
  private async validateEdgeAdd(operation: EdgeAddOperation, state: GraphState): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const { edge } = operation.payload;

    // Check for self-loops
    if (edge.source === edge.target) {
      errors.push({
        type: 'SELF_LOOP_DETECTED',
        message: 'Self-loops are not allowed',
        severity: 'error',
      });
    }

    // Check for duplicate edges
    const isDuplicate = state.edges.some(
      e =>
        e.source === edge.source &&
        e.target === edge.target &&
        e.sourceHandle === edge.sourceHandle &&
        e.targetHandle === edge.targetHandle
    );

    if (isDuplicate) {
      errors.push({
        type: 'DUPLICATE_EDGE',
        message: 'Edge already exists between these nodes',
        severity: 'error',
      });
    }

    // Validate source and target nodes exist
    const sourceExists = state.nodes.some(n => n.id === edge.source);
    const targetExists = state.nodes.some(n => n.id === edge.target);

    if (!sourceExists) {
      errors.push({
        type: 'SOURCE_NODE_NOT_FOUND',
        message: `Source node ${edge.source} does not exist`,
        severity: 'error',
      });
    }

    if (!targetExists) {
      errors.push({
        type: 'TARGET_NODE_NOT_FOUND',
        message: `Target node ${edge.target} does not exist`,
        severity: 'error',
      });
    }

    return errors;
  }
}
```

### 6. Collaborative Mutation Synchronization

```typescript
/**
 * Handles collaborative editing conflicts and synchronization
 */
export class CollaborativeMutationSync {
  constructor(
    private webSocketService: WebSocketService,
    private conflictResolver: ConflictResolver
  ) {}

  /**
   * Broadcast mutation to other collaborators
   */
  async broadcastMutation(operation: GraphOperation): Promise<void> {
    const message: CollaborativeMessage = {
      type: 'GRAPH_MUTATION',
      operation,
      timestamp: new Date(),
      userId: operation.userId,
      sessionId: operation.sessionId,
    };

    await this.webSocketService.broadcast(message);
  }

  /**
   * Handle incoming mutation from collaborator
   */
  async handleRemoteMutation(message: CollaborativeMessage): Promise<void> {
    const { operation } = message;

    // Check for conflicts with local operations
    const conflictResult = await this.conflictResolver.checkConflicts(operation);

    if (conflictResult.hasConflicts) {
      // Resolve conflicts using operational transformation
      const resolvedOperation = await this.conflictResolver.resolve(operation, conflictResult);
      await this.applyRemoteMutation(resolvedOperation);
    } else {
      await this.applyRemoteMutation(operation);
    }
  }

  /**
   * Transform local operation against remote operations
   */
  async transformOperation(localOp: GraphOperation, remoteOps: GraphOperation[]): Promise<GraphOperation> {
    let transformedOp = localOp;

    for (const remoteOp of remoteOps) {
      transformedOp = await this.operationalTransform(transformedOp, remoteOp);
    }

    return transformedOp;
  }
}
```

### 7. Configuration and Integration

```typescript
/**
 * Configuration for the mutation engine
 */
export interface MutationEngineConfig {
  // History management
  historyLimit: number;

  // Validation settings
  validation: {
    strictMode: boolean;
    allowDangerousOperations: boolean;
    customValidators: ValidationFunction[];
  };

  // Conflict resolution
  conflictResolution: {
    strategy: 'last_writer_wins' | 'operational_transform' | 'manual';
    autoResolve: boolean;
    maxConflictAge: number;
  };

  // Batch operations
  batchAtomicity: 'all_or_nothing' | 'best_effort';

  // Performance settings
  enableSnapshots: boolean;
  snapshotInterval: number;

  // Collaborative features
  enableCollaboration: boolean;
  syncDelay: number;
}

/**
 * Default configuration
 */
export const defaultMutationConfig: MutationEngineConfig = {
  historyLimit: 100,
  validation: {
    strictMode: true,
    allowDangerousOperations: false,
    customValidators: [],
  },
  conflictResolution: {
    strategy: 'operational_transform',
    autoResolve: true,
    maxConflictAge: 5000,
  },
  batchAtomicity: 'all_or_nothing',
  enableSnapshots: true,
  snapshotInterval: 10,
  enableCollaboration: true,
  syncDelay: 100,
};
```

## Integration with Existing Codebase

### 1. GraphStore Enhancement

The existing Zustand store will be enhanced to work with the mutation engine:

```typescript
// Enhanced GraphStore with mutation engine integration
export const useGraphStore = create<GraphState & GraphActions>((set, get) => ({
  // Existing state...
  nodes: [],
  edges: [],

  // Enhanced actions using mutation engine
  mutationEngine: new GraphMutationEngine(/* config */),

  // Wrapped existing actions
  addNode: async (node: Node) => {
    const operation: NodeAddOperation = {
      id: generateId(),
      type: OperationType.NODE_ADD,
      timestamp: new Date(),
      payload: { node, position: node.position },
    };

    const result = await get().mutationEngine.execute(operation);
    if (result.success) {
      set(state => ({ nodes: [...state.nodes, node] }));
    }
    return result;
  },

  updateNode: async (nodeId: string, updates: Record<string, unknown>) => {
    const currentNode = get().nodes.find(n => n.id === nodeId);
    if (!currentNode) return { success: false, error: 'Node not found' };

    const operation: NodeUpdateOperation = {
      id: generateId(),
      type: OperationType.NODE_UPDATE,
      timestamp: new Date(),
      payload: {
        nodeId,
        updates,
        previousValues: currentNode.data,
      },
    };

    const result = await get().mutationEngine.execute(operation);
    if (result.success) {
      set(state => ({
        nodes: state.nodes.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n)),
      }));
    }
    return result;
  },

  // New undo/redo actions
  undo: async () => {
    return await get().mutationEngine.history.undo(get().mutationEngine);
  },

  redo: async () => {
    return await get().mutationEngine.history.redo(get().mutationEngine);
  },
}));
```

### 2. GraphEditor Component Updates

The main GraphEditor component will be updated to use the new mutation system:

```typescript
// Enhanced GraphEditor with mutation support
export function GraphEditor() {
  const { nodes, edges, addNode, updateNode, deleteNode, undo, redo, mutationEngine } = useGraphStore();

  // Enhanced drop handler with validation
  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      const nodeType = event.dataTransfer.getData('application/node-type');
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const schema = nodeSchemas[nodeType];
      const params = schema.parse({});
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: 'default',
        position,
        data: { ...params, nodeType },
      };

      const result = await addNode(newNode);
      if (!result.success) {
        toast.error(`Failed to add node: ${result.error}`);
      }
    },
    [addNode]
  );

  // Keyboard shortcuts for undo/redo
  const handleKeyboardShortcuts = useCallback(
    async (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          await undo();
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault();
          await redo();
        }
      }
    },
    [undo, redo]
  );

  // ... rest of component
}
```

## Performance Considerations

### 1. Optimization Strategies

- **Snapshot Management**: Periodic snapshots reduce undo/redo computation time
- **Operation Batching**: Group related operations to minimize state updates
- **Lazy Validation**: Defer expensive validation until necessary
- **Incremental Updates**: Only recompute affected parts of the graph
- **Memory Management**: Automatic cleanup of old history entries

### 2. Scalability Features

- **Pagination**: Large operation histories can be paginated
- **Compression**: Historical snapshots can be compressed
- **Background Processing**: Heavy validation can be moved to web workers
- **Debouncing**: Rapid parameter changes can be debounced

## Security Considerations

### 1. Operation Validation

- **Schema Enforcement**: All operations must conform to defined schemas
- **Permission Checking**: User permissions validated before execution
- **Sanitization**: User input sanitized to prevent XSS/injection attacks
- **Rate Limiting**: Operations rate-limited to prevent abuse

### 2. Collaborative Security

- **Authentication**: All collaborative operations require valid authentication
- **Authorization**: Fine-grained permissions for different operation types
- **Audit Trail**: Complete audit log of all mutations for security review
- **Conflict Resolution**: Secure handling of merge conflicts

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1)

1. Implement base operation interfaces and types
2. Create GraphMutationEngine with basic execution
3. Add simple validation system
4. Update GraphStore to use mutation engine

### Phase 2: History System (Week 2)

1. Implement OperationHistory class
2. Add undo/redo functionality
3. Create snapshot management system
4. Update UI with undo/redo controls

### Phase 3: Advanced Features (Week 3)

1. Add batch operation support
2. Implement collaborative synchronization
3. Create conflict resolution system
4. Add comprehensive validation rules

### Phase 4: Polish & Optimization (Week 4)

1. Performance optimization
2. Error handling improvements
3. Documentation and examples
4. Testing and bug fixes

## Success Metrics

### 1. Functionality Metrics

- ✅ All existing mutations work through new system
- ✅ Undo/redo functionality available for all operations
- ✅ Batch operations reduce UI flickering
- ✅ Collaborative editing conflicts resolved automatically

### 2. Performance Metrics

- ✅ Operation execution time < 10ms for simple operations
- ✅ Undo/redo response time < 50ms
- ✅ Memory usage increase < 20% for history tracking
- ✅ UI responsiveness maintained during complex operations

### 3. Quality Metrics

- ✅ 100% test coverage for mutation engine
- ✅ Zero data loss during normal operations
- ✅ Graceful error handling for all edge cases
- ✅ Comprehensive documentation and examples

This operational model provides a robust foundation for graph mutations while maintaining backward compatibility and enabling future collaborative features.
