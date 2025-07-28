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
    operation?: any | undefined;
    validationErrors?: any[] | undefined;
    constructor(message: string, operation?: any | undefined, validationErrors?: any[] | undefined);

export declare class ValidationError extends Error {
    field?: string | undefined;
    nodeId?: string | undefined;
    edgeId?: string | undefined;
    constructor(message: string, field?: string | undefined, nodeId?: string | undefined, edgeId?: string | undefined);

export declare class ConflictError extends Error {
    conflicts: any[];
    operation?: any | undefined;
    constructor(message: string, conflicts: any[], operation?: any | undefined);

export declare //# sourceMappingURL=index.d.ts.map