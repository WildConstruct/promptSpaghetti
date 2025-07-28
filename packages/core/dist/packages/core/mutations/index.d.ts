/**
 * PromptScape Graph Mutations - Main Export Index
 *
 * Centralized exports for the graph mutation operational model system.
 * Provides all types, classes, and utilities needed for graph mutations.
 */
export * from './types';
export { GraphMutationEngine } from './GraphMutationEngine';
export { GraphValidator } from './GraphValidator';
export { ConflictResolver } from './ConflictResolver';
export { OperationHistory } from './OperationHistory';
export { CollaborativeSync, SimpleWebSocketService, type WebSocketService } from './CollaborativeSync';
export declare const createOperationId: () => string;
export declare const calculateChecksum: (state: {
    nodes: any;
    edges: any;
}) => string;
//# sourceMappingURL=index.d.ts.map