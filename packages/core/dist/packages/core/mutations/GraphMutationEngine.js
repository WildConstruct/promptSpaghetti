/**
 * PromptScape Graph Mutations - Core Engine
 *
 * Main execution engine for graph mutation operations with validation,
 * conflict resolution, and history tracking capabilities.
 */
import { EventEmitter } from 'events';
import { GraphOperation, OperationType, AnyGraphOperation } from './types';
import { GraphValidator } from './GraphValidator';
import { ConflictResolver } from './ConflictResolver';
import { OperationHistory } from './OperationHistory';
/**
 * Core engine for executing graph mutations with full validation,
 * conflict resolution, and history tracking
 */
export class GraphMutationEngine extends EventEmitter {
    history;
    validator;
    conflictResolver;
    currentState;
    isExecuting = false;
    operationQueue = [];
    config;
    initialState;
}
this.history = new OperationHistory(config.historyLimit);
this.validator = new GraphValidator(config.validation);
this.conflictResolver = new ConflictResolver(config.conflictResolution);
this.currentState = initialState || { nodes: [], edges: [] };
// Setup event forwarding from components
this.setupEventForwarding();
/**
 * Get current graph state
 */
getState();
GraphState;
{
    return { ...this.currentState };
    /**
     * Update current state (used by external store)
     */
    updateState(state, GraphState);
    void {
        this: .currentState = { ...state },
        /**
         * Execute a single operation with full validation and history tracking
         */
        async execute(operation) {
            const startTime = Date.now();
            try {
                // Queue operation if engine is busy
                if (this.isExecuting) {
                    this.operationQueue.push(operation);
                    return this.createPendingResult(operation);
                    this.isExecuting = true;
                    // Pre-execution validation
                    const validationResult = await this.validator.validate(operation, this.currentState);
                    if (!validationResult.valid) {
                        this.emit('validation_error', { operation, errors: validationResult.errors });
                        return this.createFailureResult(operation, validationResult.errors.map(e => e.message));
                        // Check for conflicts (collaborative editing)
                        if (this.config.enableCollaboration) {
                            const conflictResult = await this.conflictResolver.checkConflicts(operation, this.currentState);
                            if (conflictResult.hasConflicts) {
                                this.emit('conflict_detected', {});
                                conflict: conflictResult.conflicts[0],
                                    resolutionStrategy;
                                conflictResult.resolutionStrategy || this.config.conflictResolution.strategy,
                                ;
                            }
                            ;
                            if (this.config.conflictResolution.autoResolve) {
                                const resolvedOperation = await this.handleConflicts(operation, conflictResult);
                                return await this.executeOperation(resolvedOperation);
                            }
                            else {
                                return this.createConflictResult(operation, conflictResult);
                                // Execute the operation
                                const executionResult = await this.executeOperation(operation);
                                // Post-execution validation
                                if (this.config.validation.enableStructuralValidation) {
                                    const postValidation = await this.validator.validateState(this.currentState);
                                    if (!postValidation.valid) {
                                        // Rollback on post-validation failure
                                        await this.rollbackOperation(operation);
                                        this.emit('operation_failed', {});
                                        operation,
                                            error;
                                        'Post-validation failed',
                                            validationErrors;
                                        postValidation.errors,
                                        ;
                                    }
                                    ;
                                    return this.createFailureResult(operation, postValidation.errors.map(e => e.message));
                                    // Record in history for undo/redo
                                    if (this.config.enableUndo && executionResult.success) {
                                        this.history.record(operation, executionResult.snapshot);
                                        // Create snapshot if configured
                                        if (this.config.enableSnapshots && executionResult.success) {
                                            const snapshot = this.createSnapshot(operation);
                                            this.emit('snapshot_created', {});
                                            snapshot,
                                                reason;
                                            'operation',
                                            ;
                                        }
                                        ;
                                        // Emit success event
                                        const executionTime = Date.now() - startTime;
                                        this.emit('operation_executed', {});
                                        operation,
                                            result;
                                        executionResult,
                                            executionTime;
                                    }
                                    ;
                                    return executionResult;
                                }
                                try { }
                                catch (error) {
                                    const errorMessage = error instanceof Error ? error.message : String(error);
                                    this.emit('operation_failed', { operation, error: errorMessage });
                                    return this.createErrorResult(operation, errorMessage);
                                }
                                finally {
                                    this.isExecuting = false;
                                    // Process queued operations
                                    if (this.operationQueue.length > 0) {
                                        const nextOperation = this.operationQueue.shift();
                                        setImmediate(() => this.execute(nextOperation));
                                        /**
                                         * Execute multiple operations as a batch
                                         */
                                        async;
                                        executeBatch(operations, AnyGraphOperation);
                                        Promise < BatchOperationResult > {
                                            const: batchId = this.generateId(),
                                            const: results, OperationResult = [],
                                            // Validate batch size
                                            if(operations) { }, : .length > this.config.maxBatchSize
                                        };
                                        {
                                            return {
                                                success: false,
                                                batchId,
                                                results: [],
                                                rollbackPerformed: false,
                                                error: `Batch size ${operations.length} exceeds maximum ${this.config.maxBatchSize}`
                                            };
                                        }
                                        ;
                                        // Create savepoint
                                        const initialSnapshot = this.createSnapshot();
                                        try {
                                            for (let i = 0; i < operations.length; i++) {
                                                const operation = operations[i];
                                                const result = await this.execute(operation);
                                                results.push(result);
                                                if (!result.success) {
                                                    // Handle batch failure based on atomicity setting
                                                    if (this.config.batchAtomicity === 'all_or_nothing') {
                                                        await this.restoreSnapshot(initialSnapshot);
                                                        this.emit('batch_executed', {});
                                                        batchId,
                                                            results,
                                                            success;
                                                        false,
                                                        ;
                                                    }
                                                    ;
                                                    return {
                                                        success: false,
                                                        batchId,
                                                        results,
                                                        rollbackPerformed: true,
                                                        error: `Batch operation failed at step ${i + 1}: ${result.error}`
                                                    };
                                                }
                                                successCount: i,
                                                    failureCount;
                                                operations.length - i;
                                            }
                                            ;
                                            const successCount = results.filter(r => r.success).length;
                                            const failureCount = results.length - successCount;
                                            this.emit('batch_executed', {});
                                            batchId,
                                                results,
                                                success;
                                            failureCount === 0,
                                            ;
                                        }
                                        finally { }
                                        ;
                                        return {
                                            success: failureCount === 0,
                                            batchId,
                                            results,
                                            rollbackPerformed: false,
                                            partialSuccess: successCount > 0 && failureCount > 0,
                                            successCount,
                                            failureCount
                                        };
                                    }
                                    try { }
                                    catch (error) {
                                        await this.restoreSnapshot(initialSnapshot);
                                        const errorMessage = error instanceof Error ? error.message : String(error);
                                        return {
                                            success: false,
                                            batchId,
                                            results,
                                            rollbackPerformed: true,
                                            error: errorMessage,
                                        };
                                        /**
                                         * Undo the last operation
                                         */
                                        async;
                                        undo();
                                        Promise < UndoResult > {
                                            : .config.enableUndo
                                        };
                                        {
                                            return { success: false, error: 'Undo is disabled' };
                                            const result = await this.history.undo(this);
                                            if (result.success) {
                                                this.emit('undo_executed', {});
                                                operation: result.operation,
                                                    success;
                                                true,
                                                ;
                                            }
                                            ;
                                            return result;
                                            /**
                                             * Redo the last undone operation
                                             */
                                            async;
                                            redo();
                                            Promise < RedoResult > {
                                                : .config.enableRedo
                                            };
                                            {
                                                return { success: false, error: 'Redo is disabled' };
                                                const result = await this.history.redo(this);
                                                if (result.success) {
                                                    this.emit('redo_executed', {});
                                                    operation: result.operation,
                                                        success;
                                                    true,
                                                    ;
                                                }
                                                ;
                                                return result;
                                                /**
                                                 * Check if undo is available
                                                 */
                                                canUndo();
                                                boolean;
                                                {
                                                    return this.config.enableUndo && this.history.canUndo();
                                                    /**
                                                     * Check if redo is available
                                                     */
                                                    canRedo();
                                                    boolean;
                                                    {
                                                        return this.config.enableRedo && this.history.canRedo();
                                                        /**
                                                         * Get operation history
                                                         */
                                                        getHistory();
                                                        HistoryEntry;
                                                        {
                                                            return this.history.getHistory();
                                                            /**
                                                             * Clear operation history
                                                             */
                                                            clearHistory();
                                                            void {
                                                                this: .history.clear(),
                                                                /**
                                                                 * Create a snapshot of current state
                                                                 */
                                                                createSnapshot(operation) {
                                                                    return {
                                                                        id: this.generateId(),
                                                                        state: { ...this.currentState },
                                                                        timestamp: new Date(),
                                                                        operationId: operation?.id || '',
                                                                        checksum: this.calculateChecksum(this.currentState)
                                                                    };
                                                                    /**
                                                                     * Restore state from snapshot
                                                                     */
                                                                    async;
                                                                    restoreSnapshot(snapshot, GraphSnapshot);
                                                                    Promise < void  > {
                                                                        // Verify checksum
                                                                        const: expectedChecksum = this.calculateChecksum(snapshot.state),
                                                                        if(snapshot) { }, : .checksum && snapshot.checksum !== expectedChecksum
                                                                    };
                                                                    {
                                                                        throw new Error('Snapshot integrity check failed');
                                                                        this.currentState = { ...snapshot.state };
                                                                        this.emit('state_changed', {});
                                                                        previousState: this.currentState,
                                                                            newState;
                                                                        snapshot.state,
                                                                            operation;
                                                                        {
                                                                            id: 'restore', type;
                                                                            OperationType.GRAPH_IMPORT;
                                                                        }
                                                                        as;
                                                                        any;
                                                                    }
                                                                    ;
                                                                    // PRIVATE METHODS
                                                                }
                                                                // PRIVATE METHODS
                                                                ,
                                                                // PRIVATE METHODS
                                                                async executeOperation(operation) {
                                                                    const snapshot = this.createSnapshot(operation);
                                                                    const previousState = { ...this.currentState };
                                                                    try {
                                                                        switch (operation.type) {
                                                                            case OperationType.NODE_ADD:
                                                                                await this.executeNodeAdd(operation);
                                                                                break;
                                                                            case OperationType.NODE_DELETE:
                                                                                await this.executeNodeDelete(operation);
                                                                                break;
                                                                            case OperationType.NODE_UPDATE:
                                                                                await this.executeNodeUpdate(operation);
                                                                                break;
                                                                            case OperationType.EDGE_ADD:
                                                                                await this.executeEdgeAdd(operation);
                                                                                break;
                                                                            case OperationType.EDGE_DELETE:
                                                                                await this.executeEdgeDelete(operation);
                                                                                break;
                                                                            case OperationType.BATCH_OPERATION:
                                                                                return await this.executeBatch(operation.payload.operations);
                                                                            default:
                                                                                throw new Error(`Unsupported operation type: ${operation.type}`);
                                                                        }
                                                                        // Emit state change event
                                                                        this.emit('state_changed', {});
                                                                        previousState,
                                                                            newState;
                                                                        this.currentState,
                                                                            operation;
                                                                    }
                                                                    finally { }
                                                                    ;
                                                                    return {
                                                                        success: true,
                                                                        operation,
                                                                        snapshot,
                                                                        executionTime: Date.now() - operation.timestamp.getTime(),
                                                                    };
                                                                }, catch(error) {
                                                                    // Restore previous state on error
                                                                    this.currentState = previousState;
                                                                    throw error;
                                                                },
                                                                async executeNodeAdd(operation) {
                                                                    const { node } = operation.payload;
                                                                    this.currentState.nodes = [...this.currentState.nodes, node];
                                                                },
                                                                async executeNodeDelete(operation) {
                                                                    const { nodeId } = operation.payload;
                                                                    this.currentState.nodes = this.currentState.nodes.filter(n => n.id !== nodeId);
                                                                    // Remove connected edges
                                                                    this.currentState.edges = this.currentState.edges.filter();
                                                                    e => e.source !== nodeId && e.target !== nodeId;
                                                                    ;
                                                                },
                                                                async executeNodeUpdate(operation) {
                                                                    const { nodeId, updates } = operation.payload;
                                                                    this.currentState.nodes = this.currentState.nodes.map(node => );
                                                                    node.id === nodeId
                                                                        ? { ...node, data: { ...node.data, ...updates } }
                                                                        : node;
                                                                    ;
                                                                },
                                                                async executeEdgeAdd(operation) {
                                                                    const { edge } = operation.payload;
                                                                    this.currentState.edges = [...this.currentState.edges, edge];
                                                                },
                                                                async executeEdgeDelete(operation) {
                                                                    const { edgeId } = operation.payload;
                                                                    this.currentState.edges = this.currentState.edges.filter(e => e.id !== edgeId);
                                                                }
                                                            }();
                                                            operation: GraphOperation,
                                                                conflictResult;
                                                            ConflictResult,
                                                            ;
                                                            Promise < GraphOperation > {
                                                                : .config.conflictResolution.strategy
                                                            };
                                                            {
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            finally {
            }
        },
        case: 'LAST_WRITER_WINS',
        return: operation, // Keep original operation
        case: 'FIRST_WRITER_WINS',
        throw: new Error('Operation conflicts with existing changes'),
        case: 'OPERATIONAL_TRANSFORM',
        return: await this.conflictResolver.resolve(operation, conflictResult),
        default: ,
        throw: new Error('Manual conflict resolution required'),
        async rollbackOperation(operation) {
            // Implementation would depend on operation type
            // For now, we restore from the last snapshot
            const lastEntry = this.history.getLastEntry();
            if (lastEntry) {
                await this.restoreSnapshot(lastEntry.snapshot);
            }
        }
    }();
    operation: GraphOperation,
        errors;
    string;
    OperationResult;
    {
        return {
            success: false,
            operation,
            error: errors.join(', '),
            validationErrors: errors.map(error => ({}), type, 'VALIDATION_ERROR', message, error, severity, 'error')
        };
    }
    ;
    createErrorResult(operation, GraphOperation, error, string);
    OperationResult;
    {
        return {
            success: false,
            operation,
            error
        };
        createPendingResult(operation, GraphOperation);
        OperationResult;
        {
            return {
                success: false,
                operation,
                error: 'Operation queued for execution',
            };
            createConflictResult((), operation, GraphOperation, conflictResult, ConflictResult);
            OperationResult;
            {
                return {
                    success: false,
                    operation,
                    error: 'Operation conflicts detected',
                    warnings: conflictResult.conflicts.map(c => c.conflictType),
                };
                setupEventForwarding();
                void {
                    // Forward events from child components
                    this: .validator.on('validation_error', (data) => {
                        this.emit('validation_error', data);
                    }),
                    this: .conflictResolver.on('conflict_resolved', (data) => {
                        this.emit('conflict_resolved', data);
                    }),
                    generateId() {
                        return `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    },
                    calculateChecksum(state) {
                        // Simple checksum calculation
                        const stateString = JSON.stringify(state);
                        let hash = 0;
                        for (let i = 0; i < stateString.length; i++) {
                            const char = stateString.charCodeAt(i);
                            hash = ((hash << 5) - hash) + char;
                            hash = hash & hash; // Convert to 32-bit integer
                            return hash.toString(16);
                        }
                    }
                };
            }
        }
    }
}
