# Epic 23: Graph Mutations Operational Model

## Overview

This document defines the operational model for PromptScape graph mutations, enabling real-time collaborative editing of graph structures. The design integrates with existing Epic 23 collaboration infrastructure and provides conflict-free, deterministic graph operations.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Mutation Operations](#core-mutation-operations)
- [CRDT Framework Integration](#crdt-framework-integration)
- [Conflict Resolution Strategies](#conflict-resolution-strategies)
- [WebSocket Protocol Extensions](#websocket-protocol-extensions)
- [Operational Transform Patterns](#operational-transform-patterns)
- [Performance & Scalability](#performance--scalability)
- [Implementation Plan](#implementation-plan)

---

## Architecture Overview

### Design Principles

1. **Conflict-Free Operations**: All mutations use CRDT principles for automatic conflict resolution
2. **Deterministic Execution**: Operations are ordered and reproducible across all clients
3. **Incremental Synchronization**: Only deltas are transmitted for optimal performance
4. **Transaction Atomicity**: Complex operations are wrapped in atomic transactions
5. **Rollback Capability**: All operations can be undone/redone with full state restoration

### System Components

```
┌─────────────────────────────────────────────────────┐
│                Graph Mutation Engine                │
├─────────────────┬─────────────────┬─────────────────┤
│  Mutation       │  Operation      │  Conflict       │
│  Coordinator    │  Transform      │  Resolver       │
├─────────────────┼─────────────────┼─────────────────┤
│  CRDT State     │  Version        │  Rollback       │
│  Manager        │  Control        │  Manager        │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## Core Mutation Operations

### Node Operations

#### Node Addition (`NODE_ADD`)

```typescript
interface NodeAddOperation {
  type: 'NODE_ADD';
  operationId: string;
  nodeId: string;
  nodeType: NodeTypeEnum;
  position: { x: number; y: number };
  initialData?: Record<string, any>;
  parentId?: string; // For hierarchical operations
  timestamp: number;
  userId: string;
  documentId: string;
}
```

**Operation Logic:**

- Generate unique node ID using timestamp + user ID hash
- Validate node type and initial data against schema
- Insert node into CRDT Y.Map with atomic transaction
- Broadcast operation to all connected clients
- Update document version and checksum

#### Node Update (`NODE_UPDATE`)

```typescript
interface NodeUpdateOperation {
  type: 'NODE_UPDATE';
  operationId: string;
  nodeId: string;
  propertyPath: string[]; // e.g., ['choices', 0, 'weight']
  oldValue: any;
  newValue: any;
  partialUpdate: boolean;
  timestamp: number;
  userId: string;
  documentId: string;
}
```

**Property Update Patterns:**

- **Simple Properties**: Direct value replacement
- **Array Operations**: Index-based updates with conflict resolution
- **Object Properties**: Deep merge with conflict detection
- **Complex Data**: JSON patch operations for large structures

#### Node Deletion (`NODE_REMOVE`)

```typescript
interface NodeRemoveOperation {
  type: 'NODE_REMOVE';
  operationId: string;
  nodeId: string;
  cascadeDelete: boolean; // Remove connected edges
  preserveConnections: boolean; // Reconnect dangling edges
  timestamp: number;
  userId: string;
  documentId: string;
  snapshotData?: Node; // For rollback capability
}
```

### Edge Operations

#### Edge Addition (`EDGE_ADD`)

```typescript
interface EdgeAddOperation {
  type: 'EDGE_ADD';
  operationId: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string; // For multi-port connections
  targetPort?: string;
  edgeType: 'data' | 'control' | 'conditional';
  metadata?: Record<string, any>;
  timestamp: number;
  userId: string;
  documentId: string;
}
```

**Edge Validation Rules:**

- Prevent self-loops (configurable)
- Validate port compatibility
- Check for circular dependencies
- Enforce connection cardinality limits

#### Edge Update (`EDGE_UPDATE`)

```typescript
interface EdgeUpdateOperation {
  type: 'EDGE_UPDATE';
  operationId: string;
  edgeId: string;
  property: 'source' | 'target' | 'metadata' | 'type';
  oldValue: any;
  newValue: any;
  timestamp: number;
  userId: string;
  documentId: string;
}
```

#### Edge Deletion (`EDGE_REMOVE`)

```typescript
interface EdgeRemoveOperation {
  type: 'EDGE_REMOVE';
  operationId: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  timestamp: number;
  userId: string;
  documentId: string;
  snapshotData?: Edge; // For rollback capability
}
```

### Parameter Change Operations

#### Granular Parameter Updates

```typescript
interface ParameterUpdateOperation {
  type: 'PARAMETER_UPDATE';
  operationId: string;
  nodeId: string;
  parameterKey: string;
  parameterPath?: string[]; // For nested parameters
  valueType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  oldValue: any;
  newValue: any;
  validationSchema?: string; // Zod schema reference
  timestamp: number;
  userId: string;
  documentId: string;
}
```

**Parameter Update Strategies:**

- **Atomic Updates**: Simple value changes
- **Incremental Updates**: Array/object modifications
- **Batch Updates**: Multiple parameters in single transaction
- **Schema Validation**: Real-time parameter validation

---

## CRDT Framework Integration

### Framework Selection: Yjs

**Rationale:**

- **Mature CRDT Implementation**: Proven conflict resolution algorithms
- **Rich Data Types**: Y.Map, Y.Array, Y.Text for different graph elements
- **Performance**: Optimized for real-time collaboration
- **Ecosystem**: Excellent TypeScript support and documentation
- **Integration**: Already used in existing collaboration infrastructure

### CRDT Data Structure Design

```typescript
class GraphCRDT {
  private ydoc: Y.Doc;
  private nodes: Y.Map<GraphNodeCRDT>;
  private edges: Y.Map<GraphEdgeCRDT>;
  private metadata: Y.Map<any>;
  private operations: Y.Array<OperationRecord>;

  constructor(documentId: string, clientId: string) {
    this.ydoc = new Y.Doc();
    this.nodes = this.ydoc.getMap('nodes');
    this.edges = this.ydoc.getMap('edges');
    this.metadata = this.ydoc.getMap('metadata');
    this.operations = this.ydoc.getArray('operations');

    // Setup event listeners for change detection
    this.setupChangeHandlers();
  }
}
```

### Node CRDT Structure

```typescript
interface GraphNodeCRDT {
  id: string;
  type: string;
  position: Y.Map<number>; // { x: number, y: number }
  data: Y.Map<any>; // Node-specific properties
  inputs: Y.Array<string>; // Connected node IDs
  metadata: Y.Map<any>; // User, timestamps, etc.
  version: number;
  lastModified: string;
  modifiedBy: string;
}
```

### Edge CRDT Structure

```typescript
interface GraphEdgeCRDT {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourcePort?: string;
  targetPort?: string;
  type: string;
  metadata: Y.Map<any>;
  version: number;
  lastModified: string;
  modifiedBy: string;
}
```

---

## Conflict Resolution Strategies

### Automatic Resolution (CRDT-Based)

#### Node Conflicts

1. **Concurrent Creation**: Last-writer-wins with timestamp tiebreaker
2. **Property Updates**: Per-property CRDT resolution
3. **Position Updates**: Vector-based interpolation for simultaneous moves
4. **Deletion vs Update**: Deletion takes precedence (tombstone approach)

#### Edge Conflicts

1. **Connection Racing**: First successful connection wins
2. **Port Conflicts**: Validation prevents invalid multi-connections
3. **Circular Dependencies**: Prevention algorithm blocks invalid edges

#### Parameter Conflicts

1. **Simple Values**: Last-writer-wins with user priority consideration
2. **Array Operations**: Index-based CRDT with positional integrity
3. **Object Updates**: Property-level merge with conflict markers

### Manual Resolution (Fallback)

```typescript
interface ConflictResolutionUI {
  conflictId: string;
  type: ConflictType;
  affectedElements: string[]; // Node/edge IDs
  options: ResolutionOption[];
  suggestedResolution?: string;
  requiresUserInput: boolean;
}

enum ResolutionStrategy {
  ACCEPT_LOCAL = 'accept_local',
  ACCEPT_REMOTE = 'accept_remote',
  MERGE_CHANGES = 'merge_changes',
  CUSTOM_RESOLUTION = 'custom_resolution',
  ROLLBACK_OPERATION = 'rollback_operation'
}
```

---

## WebSocket Protocol Extensions

### Graph Mutation Messages

#### Operation Broadcast

```typescript
interface GraphMutationMessage {
  type: 'GRAPH_MUTATION';
  operationId: string;
  documentId: string;
  operation: MutationOperation;
  userId: string;
  timestamp: number;
  operationVector: VersionVector; // For ordering
  dependencies?: string[]; // Operation dependencies
}
```

#### Conflict Notification

```typescript
interface ConflictNotificationMessage {
  type: 'CONFLICT_DETECTED';
  conflictId: string;
  documentId: string;
  conflictType: ConflictType;
  affectedOperations: string[];
  affectedElements: string[];
  resolutionRequired: boolean;
  suggestedResolution?: ResolutionStrategy;
  timeout?: number; // Auto-resolution timeout
}
```

#### Batch Operations

```typescript
interface BatchMutationMessage {
  type: 'BATCH_MUTATION';
  batchId: string;
  documentId: string;
  operations: MutationOperation[];
  atomic: boolean; // All-or-nothing execution
  userId: string;
  timestamp: number;
}
```

### Real-time Synchronization

#### Delta Sync Protocol

```typescript
interface DeltaSyncMessage {
  type: 'DELTA_SYNC';
  documentId: string;
  fromVersion: number;
  toVersion: number;
  operations: MutationOperation[];
  checksum: string;
  userId: string;
}
```

#### State Verification

```typescript
interface StateVerificationMessage {
  type: 'STATE_VERIFICATION';
  documentId: string;
  nodeChecksum: string;
  edgeChecksum: string;
  operationCount: number;
  lastOperationId: string;
  requiredResync: boolean;
}
```

---

## Operational Transform Patterns

### Node Operation Transforms

#### Concurrent Node Creation

```typescript
function transformNodeAdd(
  op1: NodeAddOperation,
  op2: NodeAddOperation
): [NodeAddOperation, NodeAddOperation] {
  if (op1.nodeId === op2.nodeId) {
    // ID conflict - assign new ID to later operation
    const laterOp = op1.timestamp > op2.timestamp ? op1 : op2;
    return [
      op1.timestamp <= op2.timestamp
        ? op1
        : { ...op1, nodeId: generateUniqueId() },
      op2.timestamp <= op1.timestamp
        ? op2
        : { ...op2, nodeId: generateUniqueId() }
    ];
  }
  return [op1, op2]; // No conflict
}
```

#### Update vs Delete Resolution

```typescript
function transformUpdateDelete(update: NodeUpdateOperation, delete: NodeRemoveOperation): [NodeUpdateOperation | null, NodeRemoveOperation] {
  if (update.nodeId === delete.nodeId) {
    // Delete wins - nullify update operation
    return [null, delete];
  }
  return [update, delete]; // No conflict
}
```

### Edge Operation Transforms

#### Connection Racing

```typescript
function transformEdgeAdd(
  op1: EdgeAddOperation,
  op2: EdgeAddOperation
): [EdgeAddOperation, EdgeAddOperation] {
  if (
    op1.sourceNodeId === op2.sourceNodeId &&
    op1.targetNodeId === op2.targetNodeId &&
    op1.sourcePort === op2.sourcePort &&
    op1.targetPort === op2.targetPort
  ) {
    // Same connection attempt - first wins
    return op1.timestamp <= op2.timestamp ? [op1, null] : [null, op2];
  }
  return [op1, op2]; // Different connections
}
```

### Parameter Update Transforms

#### Concurrent Parameter Updates

```typescript
function transformParameterUpdate(
  op1: ParameterUpdateOperation,
  op2: ParameterUpdateOperation
): [ParameterUpdateOperation, ParameterUpdateOperation] {
  if (op1.nodeId === op2.nodeId && op1.parameterKey === op2.parameterKey) {
    if (arraysEqual(op1.parameterPath, op2.parameterPath)) {
      // Same parameter - resolve with strategy
      return resolveParameterConflict(op1, op2);
    }
  }
  return [op1, op2]; // Different parameters
}
```

---

## Performance & Scalability

### Operation Batching

```typescript
class MutationBatcher {
  private batch: MutationOperation[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 16; // ~60fps

  addOperation(operation: MutationOperation): void {
    this.batch.push(operation);

    if (this.batch.length >= this.BATCH_SIZE) {
      this.flushBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), this.BATCH_DELAY);
    }
  }

  private flushBatch(): void {
    if (this.batch.length > 0) {
      this.sendBatchMutation(this.batch);
      this.batch = [];
    }
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}
```

### Memory Management

```typescript
class OperationHistory {
  private operations: Map<string, MutationOperation> = new Map();
  private readonly MAX_HISTORY = 1000;
  private readonly CLEANUP_THRESHOLD = 1200;

  addOperation(operation: MutationOperation): void {
    this.operations.set(operation.operationId, operation);

    if (this.operations.size > this.CLEANUP_THRESHOLD) {
      this.cleanupOldOperations();
    }
  }

  private cleanupOldOperations(): void {
    const sortedOps = Array.from(this.operations.entries()).sort(
      ([, a], [, b]) => b.timestamp - a.timestamp
    );

    // Keep only the most recent operations
    this.operations = new Map(sortedOps.slice(0, this.MAX_HISTORY));
  }
}
```

### Network Optimization

#### Operation Compression

```typescript
interface CompressedOperation {
  type: string;
  id: string;
  payload: ArrayBuffer; // Compressed using LZ4 or similar
  checksum: string;
}
```

#### Differential Updates

```typescript
interface DifferentialUpdate {
  baseVersion: number;
  operations: MutationOperation[];
  compressedDiff?: ArrayBuffer;
  estimatedSize: number;
}
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (2 hours)

- [ ] Define TypeScript interfaces for all operation types
- [ ] Implement basic CRDT wrapper for Y.js integration
- [ ] Create operation validation and serialization logic
- [ ] Setup WebSocket message handlers for mutations

### Phase 2: Node Operations (2 hours)

- [ ] Implement NODE_ADD, NODE_UPDATE, NODE_REMOVE operations
- [ ] Add node-specific conflict resolution logic
- [ ] Create operation transform functions for node conflicts
- [ ] Add comprehensive testing for node operations

### Phase 3: Edge Operations (1.5 hours)

- [ ] Implement EDGE_ADD, EDGE_UPDATE, EDGE_REMOVE operations
- [ ] Add edge validation and circular dependency detection
- [ ] Create edge-specific conflict resolution strategies
- [ ] Integrate with node operation dependencies

### Phase 4: Advanced Features (0.5 hours)

- [ ] Implement batch operation support
- [ ] Add operation rollback and undo/redo functionality
- [ ] Create performance monitoring and optimization
- [ ] Integration testing with existing collaboration infrastructure

---

## Success Criteria

### Functional Requirements

- ✅ All core graph operations (node/edge/parameter mutations) implemented
- ✅ CRDT-based automatic conflict resolution working
- ✅ Real-time synchronization across multiple clients
- ✅ Operation rollback and undo/redo functionality

### Performance Requirements

- ✅ Real-time latency ≤ 150ms P95 (Epic 23 criteria)
- ✅ Support for 50+ concurrent users per workspace
- ✅ Conflict resolution correctness ≥ 99% in automated tests
- ✅ Memory usage optimized with operation history cleanup

### Integration Requirements

- ✅ Seamless integration with existing WebSocket collaboration infrastructure
- ✅ Analytics telemetry for all mutation operations
- ✅ Authentication and authorization for operation access
- ✅ Version control integrity with checksum validation

---

## Conclusion

This operational model provides a comprehensive foundation for real-time collaborative graph editing in PromptScape. By leveraging CRDT principles with Y.js, implementing robust conflict resolution strategies, and optimizing for performance, the system will enable seamless multi-user graph collaboration while maintaining data integrity and system reliability.

The design integrates naturally with existing Epic 23 collaboration infrastructure and provides the operational foundation for advanced features like shared workspaces, approval workflows, and collaborative analytics.
