/**
 * PromptScape Graph Mutations - Main Export Index
 *
 * Centralized exports for the graph mutation operational model system.
 * Provides all types, classes, and utilities needed for graph mutations.
 */
// Core Types and Interfaces
export * from './types';
// Core Engine and Components
export { GraphMutationEngine } from './GraphMutationEngine';
export { GraphValidator } from './GraphValidator';
export { ConflictResolver } from './ConflictResolver';
export { OperationHistory } from './OperationHistory';
export { CollaborativeSync, SimpleWebSocketService } from './CollaborativeSync';
// Default Configuration
export const defaultMutationEngineConfig = {
    // History management
    historyLimit: 100,
    enableUndo: true,
    enableRedo: true,
    // Validation settings
    validation: {
        strictMode: true,
        allowDangerousOperations: false,
        customValidators: [],
        enableSchemaValidation: true,
        enableStructuralValidation: true,
        enableSemanticValidation: false
    },
    // Conflict resolution
    conflictResolution: {
        strategy: 'OPERATIONAL_TRANSFORM',
        autoResolve: true,
        maxConflictAge: 5000,
        enableOperationalTransform: true,
        conflictDetectionSensitivity: 'medium'
    },
    // Batch operations
    batchAtomicity: 'all_or_nothing',
    maxBatchSize: 50,
    // Performance settings
    enableSnapshots: true,
    snapshotInterval: 10,
    enableCompression: false,
    // Collaborative features
    enableCollaboration: false,
    syncDelay: 100,
    maxCollaborators: 10,
    // Debug and monitoring
    enableLogging: false,
    enableMetrics: false,
    logLevel: 'info'
};
// Utility Functions
export const createOperationId = () => {
    return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
export const createSnapshot = (nodes, edges) => {
    return {
        id: createOperationId(),
        state: { nodes: [...nodes], edges: [...edges] },
        timestamp: new Date(),
        operationId: '',
        checksum: calculateChecksum({ nodes, edges })
    };
};
export const calculateChecksum = (state) => {
    const stateString = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
        const char = stateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
};
// Factory Functions for Common Operations
export const createNodeAddOperation = (node, position, userId) => {
    return {
        id: createOperationId(),
        type: 'NODE_ADD',
        timestamp: new Date(),
        userId,
        payload: {
            node,
            position
        }
    };
};
export const createNodeUpdateOperation = (nodeId, updates, previousValues, userId) => {
    return {
        id: createOperationId(),
        type: 'NODE_UPDATE',
        timestamp: new Date(),
        userId,
        payload: {
            nodeId,
            updates,
            previousValues
        }
    };
};
export const createEdgeAddOperation = (edge, userId) => {
    return {
        id: createOperationId(),
        type: 'EDGE_ADD',
        timestamp: new Date(),
        userId,
        payload: {
            edge
        }
    };
};
// Validation Helpers
export const validateOperationStructure = (operation) => {
    return !!(operation &&
        typeof operation === 'object' &&
        operation.id &&
        operation.type &&
        operation.timestamp &&
        operation.payload);
};
export const isValidTimestamp = (timestamp) => {
    return timestamp instanceof Date && !isNaN(timestamp.getTime());
};
// Error Types for Better Error Handling
export class MutationEngineError extends Error {
    operation;
    validationErrors;
    constructor(message, operation, validationErrors) {
        super(message);
        this.operation = operation;
        this.validationErrors = validationErrors;
        this.name = 'MutationEngineError';
    }
}
export class ValidationError extends Error {
    field;
    nodeId;
    edgeId;
    constructor(message, field, nodeId, edgeId) {
        super(message);
        this.field = field;
        this.nodeId = nodeId;
        this.edgeId = edgeId;
        this.name = 'ValidationError';
    }
}
export class ConflictError extends Error {
    conflicts;
    operation;
    constructor(message, conflicts, operation) {
        super(message);
        this.conflicts = conflicts;
        this.operation = operation;
        this.name = 'ConflictError';
    }
}
// Integration Helpers for Existing Codebase
export const createMutationEngineForStore = (store, config) => {
    const finalConfig = { ...defaultMutationEngineConfig, ...config };
    const engine = new GraphMutationEngine(finalConfig);
    // Setup state synchronization
    engine.on('state_changed', (data) => {
        // Update the store with the new state
        if (store.setState) {
            store.setState({
                nodes: data.newState.nodes,
                edges: data.newState.edges
            });
        }
    });
    return engine;
};
