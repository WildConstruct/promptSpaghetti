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
import { GraphMutationEngine } from './GraphMutationEngine';
export { CollaborativeSync, SimpleWebSocketService, type WebSocketService } from './CollaborativeSync';
export declare export declare export declare export declare class MutationEngineError extends Error {
    operation?: any;
    validationErrors?: any[];
    constructor(message: string, operation?: any, validationErrors?: any[]);
}
export declare class ValidationError extends Error {
    field?: string;
    nodeId?: string;
    edgeId?: string;
    constructor(message: string, field?: string, nodeId?: string, edgeId?: string);
}
export declare class ConflictError extends Error {
    conflicts: any[];
    operation?: any;
    constructor(message: string, conflicts: any[], operation?: any);
}
export declare //# sourceMappingURL=index.d.ts.map