# Node Lifecycle and State Management Design

**Part of**: E18-1753114562060-7E5DB8 - Design node architecture  
**Epic**: 18 - Technical Debt & Refactoring  
**Author**: Claude Code  
**Date**: 2025-07-22

## Overview

This document defines the comprehensive node lifecycle and state management system for the enhanced node architecture. It establishes clear state transitions, persistence strategies, and lifecycle hooks that support hot reloading, distributed execution, and collaborative editing while maintaining performance and reliability.

## Node Lifecycle States

### Primary Lifecycle States

```typescript
enum NodeLifecycleState {
  // Creation states
  INITIALIZING = 'initializing', // Node being created/configured
  READY = 'ready', // Node ready for execution

  // Execution states
  EXECUTING = 'executing', // Node currently executing
  COMPLETED = 'completed', // Execution completed successfully
  FAILED = 'failed', // Execution failed with error

  // Management states
  SUSPENDED = 'suspended', // Temporarily suspended (debugging/pausing)
  UPDATING = 'updating', // Node configuration being updated
  MIGRATING = 'migrating', // Node migrating to new version/location

  // Cleanup states
  DISPOSING = 'disposing', // Node being cleaned up
  DISPOSED = 'disposed', // Node fully disposed
}

interface NodeLifecycleTransition {
  from: NodeLifecycleState;
  to: NodeLifecycleState;
  trigger: LifecycleTrigger;
  conditions?: LifecycleCondition[];
  hooks?: LifecycleHook[];
}

enum LifecycleTrigger {
  // Creation triggers
  NODE_CREATED = 'node:created',
  CONFIGURATION_COMPLETE = 'config:complete',

  // Execution triggers
  EXECUTION_REQUESTED = 'execution:requested',
  EXECUTION_COMPLETE = 'execution:complete',
  EXECUTION_ERROR = 'execution:error',

  // Management triggers
  SUSPEND_REQUESTED = 'suspend:requested',
  RESUME_REQUESTED = 'resume:requested',
  UPDATE_REQUESTED = 'update:requested',
  MIGRATION_REQUESTED = 'migration:requested',

  // Cleanup triggers
  DISPOSE_REQUESTED = 'dispose:requested',
  CLEANUP_COMPLETE = 'cleanup:complete',
}
```

### State Transition Matrix

```typescript
const LIFECYCLE_TRANSITIONS: NodeLifecycleTransition[] = [
  // Creation flow
  {
    from: NodeLifecycleState.INITIALIZING,
    to: NodeLifecycleState.READY,
    trigger: LifecycleTrigger.CONFIGURATION_COMPLETE,
    hooks: ['onReady', 'onValidate'],
  },

  // Execution flow
  {
    from: NodeLifecycleState.READY,
    to: NodeLifecycleState.EXECUTING,
    trigger: LifecycleTrigger.EXECUTION_REQUESTED,
    conditions: ['hasValidInputs', 'hasExecutionContext'],
    hooks: ['onBeforeExecute', 'onExecutionStart'],
  },

  {
    from: NodeLifecycleState.EXECUTING,
    to: NodeLifecycleState.COMPLETED,
    trigger: LifecycleTrigger.EXECUTION_COMPLETE,
    hooks: ['onExecutionComplete', 'onAfterExecute'],
  },

  {
    from: NodeLifecycleState.EXECUTING,
    to: NodeLifecycleState.FAILED,
    trigger: LifecycleTrigger.EXECUTION_ERROR,
    hooks: ['onExecutionError', 'onErrorRecovery'],
  },

  // Recovery flows
  {
    from: NodeLifecycleState.FAILED,
    to: NodeLifecycleState.READY,
    trigger: LifecycleTrigger.RESUME_REQUESTED,
    conditions: ['errorResolved'],
    hooks: ['onErrorClear', 'onRecovery'],
  },

  // Update flows
  {
    from: NodeLifecycleState.READY,
    to: NodeLifecycleState.UPDATING,
    trigger: LifecycleTrigger.UPDATE_REQUESTED,
    hooks: ['onBeforeUpdate', 'onConfigurationChange'],
  },

  {
    from: NodeLifecycleState.UPDATING,
    to: NodeLifecycleState.READY,
    trigger: LifecycleTrigger.CONFIGURATION_COMPLETE,
    hooks: ['onAfterUpdate', 'onValidate'],
  },

  // Cleanup flows
  {
    from: NodeLifecycleState.READY,
    to: NodeLifecycleState.DISPOSING,
    trigger: LifecycleTrigger.DISPOSE_REQUESTED,
    hooks: ['onBeforeDispose', 'onCleanup'],
  },

  {
    from: NodeLifecycleState.DISPOSING,
    to: NodeLifecycleState.DISPOSED,
    trigger: LifecycleTrigger.CLEANUP_COMPLETE,
    hooks: ['onDisposed'],
  },
];
```

## State Management Architecture

### Hierarchical State Structure

```typescript
interface NodeState {
  // Lifecycle state
  lifecycle: NodeLifecycleState;
  lastTransition: {
    timestamp: number;
    from: NodeLifecycleState;
    to: NodeLifecycleState;
    trigger: LifecycleTrigger;
  };

  // Configuration state
  configuration: {
    schema: string;
    version: string;
    data: Record<string, unknown>;
    validation: ValidationState;
    lastModified: number;
  };

  // Execution state
  execution: {
    status: ExecutionStatus;
    startTime?: number;
    endTime?: number;
    result?: unknown;
    error?: NodeExecutionError;
    context?: ExecutionContextSnapshot;
    metrics?: ExecutionMetrics;
  };

  // Performance state
  performance: {
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    memoryUsage?: MemoryUsage;
    lastProfileSnapshot?: PerformanceSnapshot;
  };

  // Collaboration state
  collaboration?: {
    lockedBy?: string;
    lockTimestamp?: number;
    conflictingOperations?: ConflictingOperation[];
    lastSync?: number;
  };

  // Extension state
  extensions: Map<string, ExtensionState>;

  // Debugging state
  debugging?: {
    breakpoints: BreakpointState[];
    watchExpressions: WatchExpression[];
    stepMode?: StepMode;
    callStack?: CallFrame[];
  };
}

interface ExecutionStatus {
  phase: ExecutionPhase;
  progress?: number; // 0-1 for long-running operations
  checkpoint?: ExecutionCheckpoint;
  dependencies: {
    waiting: string[];
    completed: string[];
    failed: string[];
  };
}

enum ExecutionPhase {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PREPROCESSING = 'preprocessing',
  EXECUTING = 'executing',
  POSTPROCESSING = 'postprocessing',
  COMPLETED = 'completed',
  ERROR = 'error',
}
```

### State Persistence Strategy

```typescript
interface StatePersistenceManager {
  // Persistence layers
  memory: MemoryStateStore;
  disk: DiskStateStore;
  remote: RemoteStateStore;

  // Persistence policies
  persistencePolicy: PersistencePolicy;

  // State operations
  saveState(nodeId: string, state: NodeState): Promise<void>;
  loadState(nodeId: string): Promise<NodeState>;
  deleteState(nodeId: string): Promise<void>;

  // Batch operations
  saveStateBatch(states: Map<string, NodeState>): Promise<void>;
  loadStateBatch(nodeIds: string[]): Promise<Map<string, NodeState>>;

  // State synchronization
  syncStates(nodeIds: string[]): Promise<SyncResult>;
  subscribeToStateChanges(nodeId: string, callback: StateChangeCallback): Subscription;
}

interface PersistencePolicy {
  // Memory persistence
  keepInMemory: {
    maxNodes: number;
    evictionStrategy: EvictionStrategy;
    ttl: number; // Time to live in memory
  };

  // Disk persistence
  diskPersistence: {
    enabled: boolean;
    debounceMs: number; // Debounce writes
    compression: boolean;
    encryption?: EncryptionOptions;
  };

  // Remote persistence
  remotePersistence: {
    enabled: boolean;
    syncInterval: number;
    conflictResolution: ConflictResolutionStrategy;
    offlineSupport: boolean;
  };

  // State lifecycle
  stateLifecycle: {
    autoCleanup: boolean;
    retentionPeriod: number; // Days to keep disposed node states
    archiveOldStates: boolean;
  };
}

enum EvictionStrategy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  TTL = 'ttl', // Time To Live
  SIZE_BASED = 'size', // Based on memory usage
  PRIORITY = 'priority', // Based on node priority
}
```

### State Change Management

```typescript
interface StateChangeManager {
  // Change tracking
  changes: StateChangeLog;
  subscribers: Map<string, StateSubscriber[]>;

  // Change operations
  applyChange(nodeId: string, change: StateChange): Promise<ChangeResult>;
  batchChanges(changes: StateChangeBatch): Promise<BatchChangeResult>;

  // Change propagation
  propagateChange(change: StateChange): Promise<void>;
  broadcastChange(change: StateChange, scope: BroadcastScope): Promise<void>;

  // Change validation
  validateChange(change: StateChange): ValidationResult;
  canApplyChange(nodeId: string, change: StateChange): boolean;

  // Change rollback
  rollbackChange(changeId: string): Promise<RollbackResult>;
  createCheckpoint(nodeIds: string[]): Promise<CheckpointId>;
  restoreCheckpoint(checkpointId: CheckpointId): Promise<RestoreResult>;
}

interface StateChange {
  id: string;
  nodeId: string;
  type: StateChangeType;
  path: string; // JSONPath to changed property
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
  authorId?: string;
  metadata?: ChangeMetadata;
}

enum StateChangeType {
  // Lifecycle changes
  LIFECYCLE_TRANSITION = 'lifecycle:transition',

  // Configuration changes
  CONFIG_UPDATE = 'config:update',
  CONFIG_VALIDATE = 'config:validate',

  // Execution changes
  EXECUTION_START = 'execution:start',
  EXECUTION_PROGRESS = 'execution:progress',
  EXECUTION_COMPLETE = 'execution:complete',
  EXECUTION_ERROR = 'execution:error',

  // Performance changes
  PERFORMANCE_UPDATE = 'performance:update',
  MEMORY_USAGE_CHANGE = 'memory:change',

  // Collaboration changes
  LOCK_ACQUIRED = 'collaboration:lock',
  LOCK_RELEASED = 'collaboration:unlock',
  CONFLICT_DETECTED = 'collaboration:conflict',

  // Extension changes
  EXTENSION_LOADED = 'extension:loaded',
  EXTENSION_UNLOADED = 'extension:unloaded',
  EXTENSION_STATE_CHANGE = 'extension:state',
}
```

## Lifecycle Hook System

### Hook Architecture

```typescript
interface LifecycleHookSystem {
  // Hook registration
  registerHook(nodeId: string, hook: LifecycleHook): HookRegistration;
  registerGlobalHook(hook: GlobalLifecycleHook): HookRegistration;

  // Hook execution
  executeHooks(nodeId: string, trigger: LifecycleTrigger, context: HookContext): Promise<HookResult[]>;

  // Hook management
  enableHook(registrationId: string): void;
  disableHook(registrationId: string): void;
  removeHook(registrationId: string): void;

  // Hook introspection
  getHooks(nodeId: string): LifecycleHook[];
  getGlobalHooks(): GlobalLifecycleHook[];
  getHookExecutionHistory(nodeId: string): HookExecutionRecord[];
}

interface LifecycleHook {
  id: string;
  name: string;
  triggers: LifecycleTrigger[];
  priority: number; // Lower numbers execute first
  enabled: boolean;

  // Hook execution
  execute(context: HookContext): Promise<HookResult>;

  // Hook conditions
  conditions?: HookCondition[];

  // Error handling
  onError?: (error: Error, context: HookContext) => Promise<ErrorHandlingResult>;

  // Hook metadata
  metadata?: HookMetadata;
}

interface HookContext {
  nodeId: string;
  trigger: LifecycleTrigger;
  currentState: NodeState;
  previousState?: NodeState;
  executionContext?: UnifiedExecutionContext;
  changeData?: StateChange;

  // Context helpers
  getNodeData<T>(): T;
  setState(updates: Partial<NodeState>): void;
  emit(event: string, data?: unknown): void;

  // Async helpers
  defer(callback: () => Promise<void>): void;
  schedule(callback: () => Promise<void>, delay: number): void;
}

enum HookResult {
  CONTINUE = 'continue', // Continue with transition
  ABORT = 'abort', // Abort the transition
  RETRY = 'retry', // Retry the transition
  DEFER = 'defer', // Defer transition (async)
}
```

### Built-in Lifecycle Hooks

```typescript
class CoreLifecycleHooks {
  // Validation hooks
  static configurationValidationHook: LifecycleHook = {
    id: 'core:validation',
    name: 'Configuration Validation',
    triggers: [LifecycleTrigger.CONFIGURATION_COMPLETE],
    priority: 1,
    enabled: true,

    async execute(context: HookContext): Promise<HookResult> {
      const validation = await this.validateNodeConfiguration(context.nodeId);
      if (!validation.isValid) {
        context.setState({
          configuration: {
            ...context.currentState.configuration,
            validation,
          },
        });
        return HookResult.ABORT;
      }
      return HookResult.CONTINUE;
    },
  };

  // Performance monitoring hooks
  static performanceTrackingHook: LifecycleHook = {
    id: 'core:performance',
    name: 'Performance Tracking',
    triggers: [LifecycleTrigger.EXECUTION_REQUESTED, LifecycleTrigger.EXECUTION_COMPLETE],
    priority: 10,
    enabled: true,

    async execute(context: HookContext): Promise<HookResult> {
      if (context.trigger === LifecycleTrigger.EXECUTION_REQUESTED) {
        return this.startPerformanceTracking(context);
      } else {
        return this.endPerformanceTracking(context);
      }
    },
  };

  // Cache management hooks
  static cacheManagementHook: LifecycleHook = {
    id: 'core:cache',
    name: 'Cache Management',
    triggers: [LifecycleTrigger.EXECUTION_COMPLETE, LifecycleTrigger.DISPOSE_REQUESTED],
    priority: 5,
    enabled: true,

    async execute(context: HookContext): Promise<HookResult> {
      const cacheManager = context.executionContext?.getFeature('cache');
      if (!cacheManager) return HookResult.CONTINUE;

      if (context.trigger === LifecycleTrigger.EXECUTION_COMPLETE) {
        await this.updateCache(context, cacheManager);
      } else if (context.trigger === LifecycleTrigger.DISPOSE_REQUESTED) {
        await this.invalidateCache(context, cacheManager);
      }

      return HookResult.CONTINUE;
    },
  };
}
```

## State Synchronization and Collaboration

### Operational Transformation for State Changes

```typescript
interface StateOperationalTransform {
  // Transform operations for concurrent state changes
  transform(operation: StateOperation, concurrent: StateOperation[]): TransformedStateOperation;

  // Merge compatible operations
  merge(operations: StateOperation[]): MergedStateOperation;

  // Conflict detection and resolution
  detectConflicts(operations: StateOperation[]): ConflictAnalysis;
  resolveConflicts(conflicts: StateConflict[], strategy: ConflictResolutionStrategy): ResolvedStateOperation[];
}

interface StateOperation {
  id: string;
  nodeId: string;
  type: StateOperationType;
  path: string; // JSONPath
  value: unknown;
  timestamp: number;
  authorId: string;
  dependencies: string[]; // IDs of operations this depends on

  // Operation metadata
  metadata: {
    causedBy?: LifecycleTrigger;
    validationRequired?: boolean;
    broadcastScope?: BroadcastScope;
  };
}

enum StateOperationType {
  SET = 'set', // Set a value
  MERGE = 'merge', // Merge object/array
  DELETE = 'delete', // Delete a property
  APPEND = 'append', // Append to array
  PREPEND = 'prepend', // Prepend to array
  MOVE = 'move', // Move array element
  PATCH = 'patch', // JSON Patch operation
}

class CollaborativeStateManager {
  private operationLog: OperationLog = new OperationLog();
  private conflictResolver: ConflictResolver = new ConflictResolver();

  async applyStateOperation(operation: StateOperation): Promise<OperationResult> {
    // Check for conflicts with concurrent operations
    const concurrentOps = this.operationLog.getConcurrentOperations(operation);

    if (concurrentOps.length > 0) {
      // Apply operational transformation
      const transformed = this.transform(operation, concurrentOps);
      return this.executeTransformedOperation(transformed);
    } else {
      // Direct application
      return this.executeOperation(operation);
    }
  }

  private async executeOperation(operation: StateOperation): Promise<OperationResult> {
    const node = await this.getNode(operation.nodeId);
    const currentState = node.getState();

    // Validate operation
    const validation = await this.validateOperation(operation, currentState);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Apply operation
    const newState = this.applyOperationToState(operation, currentState);

    // Update node state
    await node.setState(newState);

    // Log operation
    this.operationLog.append(operation);

    // Broadcast to collaborators
    await this.broadcastOperation(operation);

    return { success: true, newState };
  }
}
```

## Memory Management and Performance

### Memory-Aware State Management

```typescript
interface MemoryAwareStateManager {
  // Memory tracking
  memoryUsage: MemoryUsageTracker;
  memoryLimits: MemoryLimits;

  // Memory optimization
  optimizeMemoryUsage(): Promise<MemoryOptimizationResult>;
  cleanupUnusedStates(): Promise<CleanupResult>;
  compactStateStorage(): Promise<CompactionResult>;

  // Memory pressure handling
  handleMemoryPressure(level: MemoryPressureLevel): Promise<PressureHandlingResult>;

  // Memory monitoring
  getMemoryMetrics(): MemoryMetrics;
  setMemoryThresholds(thresholds: MemoryThresholds): void;
}

interface MemoryThresholds {
  warning: number; // Memory usage percentage to start warnings
  critical: number; // Memory usage percentage to trigger cleanup
  emergency: number; // Memory usage percentage to force emergency cleanup
}

enum MemoryPressureLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

class MemoryOptimizedStateStore {
  private stateCache = new Map<string, CachedNodeState>();
  private compressionEngine: CompressionEngine;
  private evictionPolicy: EvictionPolicy;

  async setState(nodeId: string, state: NodeState): Promise<void> {
    // Check memory pressure
    if (this.isMemoryPressureHigh()) {
      await this.performEmergencyCleanup();
    }

    // Compress state if needed
    const compressedState = await this.compressStateIfNeeded(state);

    // Cache with eviction tracking
    this.stateCache.set(nodeId, {
      state: compressedState,
      lastAccess: Date.now(),
      accessCount: 1,
      memorySize: this.calculateStateSize(compressedState),
    });

    // Trigger eviction if over limits
    if (this.shouldEvictStates()) {
      await this.evictLeastImportantStates();
    }
  }

  private async performEmergencyCleanup(): Promise<void> {
    // 1. Clear performance metrics history
    this.clearPerformanceHistory();

    // 2. Compress all cached states
    await this.compressAllStates();

    // 3. Evict non-essential states
    await this.evictNonEssentialStates();

    // 4. Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
}
```

## Implementation Examples

### Complete Node with Lifecycle Management

```typescript
class LifecycleAwareNode extends OptimizedRuntimeNode<string> {
  private state: NodeState;
  private stateManager: StateManager;
  private hookSystem: LifecycleHookSystem;

  constructor(id: string, initialConfig: NodeConfiguration) {
    super(id);

    this.state = this.createInitialState(initialConfig);
    this.stateManager = new StateManager(id);
    this.hookSystem = new LifecycleHookSystem();

    // Register core hooks
    this.registerCoreHooks();

    // Initialize state
    this.initializeState();
  }

  async executeCore(context: UnifiedExecutionContext): Promise<string> {
    // Transition to executing state
    await this.transitionState(NodeLifecycleState.EXECUTING, LifecycleTrigger.EXECUTION_REQUESTED);

    try {
      // Execute with performance tracking
      const result = await this.performExecution(context);

      // Transition to completed state
      await this.transitionState(NodeLifecycleState.COMPLETED, LifecycleTrigger.EXECUTION_COMPLETE);

      return result;
    } catch (error) {
      // Transition to failed state
      await this.transitionState(NodeLifecycleState.FAILED, LifecycleTrigger.EXECUTION_ERROR);

      throw error;
    }
  }

  private async transitionState(newState: NodeLifecycleState, trigger: LifecycleTrigger): Promise<void> {
    const previousState = this.state.lifecycle;

    // Validate transition
    if (!this.canTransition(previousState, newState, trigger)) {
      throw new InvalidStateTransitionError(previousState, newState, trigger);
    }

    // Execute pre-transition hooks
    const hookResults = await this.hookSystem.executeHooks(this.id, trigger, {
      nodeId: this.id,
      trigger,
      currentState: this.state,
      previousState: { ...this.state, lifecycle: previousState },
    });

    // Check if any hook aborted the transition
    if (hookResults.some(result => result === HookResult.ABORT)) {
      throw new StateTransitionAbortedError(trigger, hookResults);
    }

    // Perform state transition
    this.state.lifecycle = newState;
    this.state.lastTransition = {
      timestamp: Date.now(),
      from: previousState,
      to: newState,
      trigger,
    };

    // Persist state
    await this.stateManager.saveState(this.id, this.state);

    // Broadcast state change
    await this.broadcastStateChange({
      id: generateId(),
      nodeId: this.id,
      type: StateChangeType.LIFECYCLE_TRANSITION,
      path: 'lifecycle',
      oldValue: previousState,
      newValue: newState,
      timestamp: Date.now(),
    });
  }
}
```

## Testing and Validation

### State Management Testing Framework

```typescript
describe('Node Lifecycle Management', () => {
  let node: LifecycleAwareNode;
  let stateManager: MockStateManager;
  let hookSystem: MockHookSystem;

  beforeEach(() => {
    stateManager = new MockStateManager();
    hookSystem = new MockHookSystem();
    node = new LifecycleAwareNode('test-node', {
      schema: 'WeightedChoice',
      data: { choices: ['a', 'b', 'c'] },
    });
  });

  describe('State Transitions', () => {
    it('should transition from READY to EXECUTING on execution request', async () => {
      // Given
      node.setState({ lifecycle: NodeLifecycleState.READY });

      // When
      await node.execute(createMockContext());

      // Then
      expect(node.getState().lifecycle).toBe(NodeLifecycleState.COMPLETED);
      expect(stateManager.saveState).toHaveBeenCalledTimes(2); // EXECUTING + COMPLETED
    });

    it('should execute lifecycle hooks in correct order', async () => {
      // Given
      const hookExecutionOrder: string[] = [];
      hookSystem.onHookExecuted = hookId => hookExecutionOrder.push(hookId);

      // When
      await node.execute(createMockContext());

      // Then
      expect(hookExecutionOrder).toEqual([
        'core:performance:start',
        'core:validation',
        'user:custom:before',
        'core:performance:end',
        'user:custom:after',
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should transition to FAILED state on execution error', async () => {
      // Given
      node.setState({ lifecycle: NodeLifecycleState.READY });
      jest.spyOn(node, 'performExecution').mockRejectedValue(new Error('Test error'));

      // When & Then
      await expect(node.execute(createMockContext())).rejects.toThrow('Test error');
      expect(node.getState().lifecycle).toBe(NodeLifecycleState.FAILED);
    });
  });
});
```

## Conclusion

This node lifecycle and state management design provides a comprehensive foundation for reliable, scalable, and collaborative node execution. The system supports:

- **Complete Lifecycle Management**: Clear state transitions with validation and rollback
- **Performance Optimization**: Memory-aware state management with compression and eviction
- **Collaboration Support**: Operational transformation for concurrent state changes
- **Extensibility**: Hook system for custom lifecycle behavior
- **Reliability**: Comprehensive error handling and recovery mechanisms

The design maintains backward compatibility while providing modern capabilities for distributed execution, real-time collaboration, and advanced debugging. The implementation roadmap ensures gradual adoption with minimal disruption to existing functionality.
