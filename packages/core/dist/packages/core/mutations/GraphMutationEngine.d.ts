/**
 * PromptScape Graph Mutations - Core Engine
 *
 * Main execution engine for graph mutation operations with validation,
 * conflict resolution, and history tracking capabilities.
 */
import { EventEmitter } from 'events';
import { GraphState } from './types';
/**
 * Core engine for executing graph mutations with full validation,
 * conflict resolution, and history tracking
 */
export declare class GraphMutationEngine extends EventEmitter {
    private history;
    private validator;
    private conflictResolver;
    private currentState;
    private isExecuting;
    private operationQueue;
    constructor();
    private config;
    initialState?: GraphState;
    super(): any;
}
//# sourceMappingURL=GraphMutationEngine.d.ts.map