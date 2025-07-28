import { NodeDefinitionAST, ParseError } from '../ast/ast-builder';
import { Graph } from '../../../graphSchema';
export interface SemanticError extends ParseError {
    nodeId?: string;
    errorCode: string;
}
export interface ValidationContext {
    nodeIds: Set<string>;
    nodeMap: Map<string, NodeDefinitionAST>;
    edgeMap: Map<string, Set<string>>;
    reverseEdgeMap: Map<string, Set<string>>;
    visitedNodes: Set<string>;
    currentPath: string;
}
export interface SemanticAnalysisResult {
    graph: Graph | null;
    errors: SemanticError;
    warnings: SemanticError;
}
export declare class SemanticAnalyzer {
    private context;
    private errors;
    private warnings;
    constructor();
    /**
     * Reset analyzer state
     */
    private reset;
    /**
     * Build analysis context from AST
     */
    private buildContext;
    /**
     * Add edge to context maps
     */
    private addEdgeToContext;
    /**
     * Validate semantic correctness
     */
    private validateSemantics;
    /**
     * Validate format version
     */
    private validateVersion;
    /**
     * Validate individual node
     */
    private validateNode;
    /**
     * Validate node-specific properties
     */
    private validateNodeProperties;
    /**
     * Validate WeightedChoice properties
     */
    private validateWeightedChoiceProperties;
    /**
     * Validate Conditional properties
     */
    private validateConditionalProperties;
    /**
     * Validate Sequential properties
     */
    private validateSequentialProperties;
    /**
     * Validate Markov properties
     */
    private validateMarkovProperties;
    /**
     * Validate Variable properties
     */
    private validateVariableProperties;
    /**
     * Validate Include properties
     */
    private validateIncludeProperties;
    /**
     * Validate PythonTransform properties
     */
    private validatePythonTransformProperties;
    /**
     * Validate edge reference
     */
    private validateEdge;
    /**
     * Validate overall graph structure
     */
    private validateGraphStructure;
    /**
     * Detect cycles in the graph using DFS
     */
    private detectCycles;
    /**
    * Validate presence of output nodes
    */
    private validateOutputNodes;
    /**
    * Detect unreachable nodes
    */
    private detectUnreachableNodes;
    /**
     * Build Graph object from validated AST
     */
    private buildGraph;
    /**
     * Build Node object from AST node
     */
    private buildNodeFromAST;
    /**
     * Helper methods
     */
    private isValidNodeId;
    private hasBlockingErrors;
    private addError;
    private addWarning;
}
//# sourceMappingURL=semantic-analyzer.d.ts.map