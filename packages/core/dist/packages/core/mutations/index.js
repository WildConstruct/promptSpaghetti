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
// Import GraphMutationEngine for local use
import { GraphMutationEngine } from './GraphMutationEngine';
export { CollaborativeSync, SimpleWebSocketService } from './CollaborativeSync';
// Default Configuration
export 
// Utility Functions
export const createOperationId = () => {
    return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
position: {
    x: number;
    y: number;
}
userId ?  : string;
any => {
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
// Validation Helpers
// (Validation helper functions would be exported here)
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
export const engine = new GraphMutationEngine(finalConfig);
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
;
