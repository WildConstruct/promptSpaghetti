/**
 * Graph execution engine
 * Extracted and refactored from server/src/engine.ts for cross-platform use
 */
import { GraphDocument, ExecutionResult } from './types';
import { ValidationResult } from './validation';
export * from './runtime';
export declare class GraphEngine {
    private validator;
    /**
     * Execute a graph and return outputs from all Output nodes
     */
    execute(graph: GraphDocument, seed?: number | string): Promise<ExecutionResult>;
    /**
     * Validate a graph structure
     */
    validate(graph: GraphDocument): ValidationResult;
    /**
     * Check if graph is valid (returns boolean for convenience)
     */
    isValid(graph: GraphDocument): boolean;
    /**
     * Serialize graph to binary format for CRDT storage
     */
    serialize(graph: GraphDocument): Uint8Array;
    /**
     * Deserialize binary data to graph document
     */
    deserialize(data: Uint8Array): GraphDocument;
    /**
     * Create a new empty graph document
     */
    createEmptyGraph(id?: string): GraphDocument;
    /**
     * Clone a graph document
     */
    cloneGraph(graph: GraphDocument): GraphDocument;
    private executeNodes;
    private executeNodeWithDeps;
    private executeNode;
    private createRuntimeNode;
    private seededRandom;
    private generateExecutionId;
    private generateGraphId;
}
//# sourceMappingURL=engine.d.ts.map