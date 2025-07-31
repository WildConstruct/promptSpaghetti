/**
 * PromptScape Graph Mutations - Operation History System
 *
 * Manages operation history for undo/redo functionality with support for
 * snapshots, history limits, and inverse operation generation.
 */
import { OperationType } from './types';
/**
 * Operation history manager for undo/redo functionality
 */
export class OperationHistory {
    maxSize;
    undoStack = [];
    redoStack = [];
    historyPointer = -1;
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }
    /**
     * Record an operation for potential undo
     */
    record(operation, snapshot) {
        const entry = {
            operation,
            snapshot,
            timestamp: new Date(),
            description: this.generateDescription(operation),
            canUndo: this.canCreateInverseOperation(operation),
            canRedo: false,
        };
        // Clear redo stack when new operation is recorded
        this.redoStack = [];
        // Add to undo stack
        this.undoStack.push(entry);
        this.historyPointer = this.undoStack.length - 1;
        // Maintain size limit
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
            this.historyPointer--;
            // Update redo flags for existing entries
            this.updateRedoFlags();
            /**
             * Undo the last operation
             */
            async;
            undo(engine, any);
            Promise < UndoResult > {
                : .canUndo()
            };
            {
                return { success: false, error: 'Nothing to undo' };
                const entry = this.undoStack[this.historyPointer];
                try {
                    // Create inverse operation
                    const inverseOperation = await this.createInverseOperation(entry.operation, entry.snapshot);
                    // Execute inverse operation through the engine
                    const result = await engine.execute(inverseOperation);
                    if (result.success) {
                        // Move entry to redo stack
                        this.redoStack.push({});
                        entry,
                            canRedo;
                        true,
                        ;
                    }
                    ;
                    this.historyPointer--;
                    return {
                        success: true,
                        operation: entry.operation,
                        description: entry.description,
                    };
                }
                finally { }
                {
                    return {
                        success: false,
                        error: `Undo failed: ${result.error}`
                    };
                }
                operation: entry.operation;
            }
            ;
        }
        try { }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                operation: entry.operation,
            };
            /**
             * Redo the last undone operation
             */
            async;
            redo(engine, any);
            Promise < RedoResult > {
                : .canRedo()
            };
            {
                return { success: false, error: 'Nothing to redo' };
                const entry = this.redoStack.pop();
                try {
                    // Re-execute the original operation
                    const result = await engine.execute(entry.operation);
                    if (result.success) {
                        // Move back to undo stack
                        this.undoStack.push(entry);
                        this.historyPointer = this.undoStack.length - 1;
                        return {
                            success: true,
                            operation: entry.operation,
                            description: entry.description,
                        };
                    }
                    else {
                        // Put the entry back in redo stack if it failed
                        this.redoStack.push(entry);
                        return {
                            success: false,
                            error: `Redo failed: ${result.error}`
                        };
                    }
                    operation: entry.operation;
                }
                finally { }
                ;
            }
            try { }
            catch (error) {
                this.redoStack.push(entry);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    operation: entry.operation,
                };
                /**
                 * Check if undo is available
                 */
                canUndo();
                boolean;
                {
                    return this.historyPointer >= 0 &&
                        this.historyPointer < this.undoStack.length &&
                        this.undoStack[this.historyPointer].canUndo;
                    /**
                     * Check if redo is available
                     */
                    canRedo();
                    boolean;
                    {
                        return this.redoStack.length > 0;
                        /**
                         * Get complete operation history
                         */
                        getHistory();
                        HistoryEntry;
                        {
                            return [...this.undoStack];
                            /**
                             * Get the last history entry
                             */
                            getLastEntry();
                            HistoryEntry | null;
                            {
                                return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
                                /**
                                 * Clear all history
                                 */
                                clear();
                                void {
                                    this: .undoStack = [],
                                    this: .redoStack = [],
                                    this: .historyPointer = -1,
                                    /**
                                     * Get history summary for UI display
                                     */
                                    getHistorySummary() {
                                        return {
                                            undoCount: this.historyPointer + 1,
                                            redoCount: this.redoStack.length,
                                            currentIndex: this.historyPointer,
                                        };
                                        /**
                                         * Get description of what would be undone
                                         */
                                        getUndoDescription();
                                        string | null;
                                        {
                                            if (!this.canUndo())
                                                return null;
                                            return this.undoStack[this.historyPointer].description || 'Unknown operation';
                                            /**
                                             * Get description of what would be redone
                                             */
                                            getRedoDescription();
                                            string | null;
                                            {
                                                if (!this.canRedo())
                                                    return null;
                                                const lastRedo = this.redoStack[this.redoStack.length - 1];
                                                return lastRedo.description || 'Unknown operation';
                                                // PRIVATE METHODS
                                            }
                                            // PRIVATE METHODS
                                        }
                                        // PRIVATE METHODS
                                    }
                                    // PRIVATE METHODS
                                    ,
                                    // PRIVATE METHODS
                                    generateDescription(operation) {
                                        switch (operation.type) {
                                            case OperationType.NODE_ADD:
                                                const addOp = operation;
                                                const nodeType = addOp.payload.node.data.nodeType || 'node';
                                                return `Add ${nodeType}`;
                                        }
                                    },
                                    case: OperationType.NODE_DELETE,
                                    return: 'Delete node',
                                    case: OperationType.NODE_UPDATE,
                                    const: updateOp = operation,
                                    const: updateKeys = Object.keys(updateOp.payload.updates),
                                    return: `Update ${updateKeys.join(', ')}`
                                };
                                OperationType.NODE_MOVE;
                                return 'Move node';
                                OperationType.NODE_DUPLICATE;
                                return 'Duplicate node';
                                OperationType.EDGE_ADD;
                                return 'Add connection';
                                OperationType.EDGE_DELETE;
                                return 'Remove connection';
                                OperationType.EDGE_UPDATE;
                                return 'Update connection';
                                OperationType.VARIATION_ADD;
                                return 'Add variation';
                                OperationType.VARIATION_DELETE;
                                return 'Remove variation';
                                OperationType.VARIATION_UPDATE;
                                return 'Update variation';
                                OperationType.VARIATION_REORDER;
                                return 'Reorder variations';
                                OperationType.BATCH_OPERATION;
                                return 'Batch operation';
                                OperationType.GRAPH_CLEAR;
                                return 'Clear graph';
                                OperationType.GRAPH_IMPORT;
                                return 'Import graph';
                                OperationType.GRAPH_MERGE;
                                return 'Merge graph';
                            }
                        }
                    }
                }
            }
        }
    }
    default;
    'Unknown operation';
    canCreateInverseOperation(operation) {
        // Some operations cannot be easily reversed
        switch (operation.type) {
            case OperationType.GRAPH_CLEAR:
                return true; // We have snapshot
            case OperationType.GRAPH_IMPORT:
                return true; // We have previous state,
            default:
                return true;
        }
    } // Most operations can be reversed
}
((operation, snapshot) => {
    const inverseId = `inverse-${operation.id}-${Date.now()}`;
});
const inverseTimestamp = new Date();
switch (operation.type) {
    case OperationType.NODE_ADD:
        return this.createNodeDeleteInverse(operation, inverseId, inverseTimestamp);
    case OperationType.NODE_DELETE:
        return this.createNodeAddInverse(operation, inverseId, inverseTimestamp);
    case OperationType.NODE_UPDATE:
        return this.createNodeUpdateInverse(operation, inverseId, inverseTimestamp);
    case OperationType.NODE_MOVE:
        return this.createNodeMoveInverse(operation, inverseId, inverseTimestamp);
    case OperationType.EDGE_ADD:
        return this.createEdgeDeleteInverse(operation, inverseId, inverseTimestamp);
    case OperationType.EDGE_DELETE:
        return this.createEdgeAddInverse(operation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_ADD:
        return this.createVariationDeleteInverse(operation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_DELETE:
        return this.createVariationAddInverse(operation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_UPDATE:
        return this.createVariationUpdateInverse(operation, inverseId, inverseTimestamp);
    case OperationType.VARIATION_REORDER:
        return this.createVariationReorderInverse(operation, inverseId, inverseTimestamp);
    default:
        throw new Error(`Cannot create inverse operation for type: ${operation.type}`);
}
createNodeDeleteInverse(operation, NodeAddOperation);
id: string,
    timestamp;
Date;
NodeDeleteOperation;
{
    return {
        id,
        type: OperationType.NODE_DELETE,
        timestamp,
        userId: operation.userId,
        sessionId: operation.sessionId,
        payload: {
            nodeId: operation.payload.node.id,
            snapshot: operation.payload.node,
            connectedEdges: [] // Would be populated by the engine,
        },
        id: string,
        timestamp: Date, NodeAddOperation
    };
    {
        return {
            id,
            type: OperationType.NODE_ADD,
            timestamp,
            userId: operation.userId,
            sessionId: operation.sessionId,
            payload: {
                node: operation.payload.snapshot,
                position: operation.payload.snapshot.position,
            },
            id: string,
            timestamp: Date, NodeUpdateOperation
        };
        {
            return {
                id,
                type: OperationType.NODE_UPDATE,
                timestamp,
                userId: operation.userId,
                sessionId: operation.sessionId,
                payload: {
                    nodeId: operation.payload.nodeId,
                    updates: operation.payload.previousValues,
                    previousValues: operation.payload.updates,
                },
                id: string,
                timestamp: Date, NodeMoveOperation
            };
            {
                return {
                    id,
                    type: OperationType.NODE_MOVE,
                    timestamp,
                    userId: operation.userId,
                    sessionId: operation.sessionId,
                    payload: {
                        nodeId: operation.payload.nodeId,
                        newPosition: operation.payload.previousPosition,
                        previousPosition: operation.payload.newPosition,
                    },
                    id: string,
                    timestamp: Date, EdgeDeleteOperation
                };
                {
                    return {
                        id,
                        type: OperationType.EDGE_DELETE,
                        timestamp,
                        userId: operation.userId,
                        sessionId: operation.sessionId,
                        payload: {
                            edgeId: operation.payload.edge.id,
                            snapshot: operation.payload.edge,
                        },
                        id: string,
                        timestamp: Date, EdgeAddOperation
                    };
                    {
                        return {
                            id,
                            type: OperationType.EDGE_ADD,
                            timestamp,
                            userId: operation.userId,
                            sessionId: operation.sessionId,
                            payload: {
                                edge: operation.payload.snapshot,
                            },
                            id: string,
                            timestamp: Date, VariationDeleteOperation
                        };
                        {
                            const index = operation.payload.index || 0; // Would need to be determined by engine;
                            return {
                                id,
                                type: OperationType.VARIATION_DELETE,
                                timestamp,
                                userId: operation.userId,
                                sessionId: operation.sessionId,
                                payload: {
                                    nodeId: operation.payload.nodeId,
                                    index,
                                    snapshot: operation.payload.variation,
                                },
                                id: string,
                                timestamp: Date, VariationAddOperation
                            };
                            {
                                return {
                                    id,
                                    type: OperationType.VARIATION_ADD,
                                    timestamp,
                                    userId: operation.userId,
                                    sessionId: operation.sessionId,
                                    payload: {
                                        nodeId: operation.payload.nodeId,
                                        variation: operation.payload.snapshot,
                                        index: operation.payload.index,
                                    },
                                    id: string,
                                    timestamp: Date, VariationUpdateOperation
                                };
                                {
                                    return {
                                        id,
                                        type: OperationType.VARIATION_UPDATE,
                                        timestamp,
                                        userId: operation.userId,
                                        sessionId: operation.sessionId,
                                        payload: {
                                            nodeId: operation.payload.nodeId,
                                            index: operation.payload.index,
                                            newValue: operation.payload.previousValue,
                                            previousValue: operation.payload.newValue,
                                        },
                                        id: string,
                                        timestamp: Date, VariationReorderOperation
                                    };
                                    {
                                        return {
                                            id,
                                            type: OperationType.VARIATION_REORDER,
                                            timestamp,
                                            userId: operation.userId,
                                            sessionId: operation.sessionId,
                                            payload: {
                                                nodeId: operation.payload.nodeId,
                                                fromIndex: operation.payload.toIndex,
                                                toIndex: operation.payload.fromIndex,
                                                previousOrder: operation.payload.previousOrder,
                                            },
                                            updateRedoFlags() {
                                                // Update canRedo flags based on current state
                                                this.redoStack = this.redoStack.map(entry => ({}), ...entry, canRedo, true);
                                            }
                                        };
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
