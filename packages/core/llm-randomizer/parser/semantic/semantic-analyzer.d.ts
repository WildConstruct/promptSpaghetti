import { GraphAST, NodeDefinitionAST, ParseError } from '../ast/ast-builder';
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
    currentPath: string[];
}
export interface SemanticAnalysisResult {
    graph: Graph | null;
    errors: SemanticError[];
    warnings: SemanticError[];
}
export declare class SemanticAnalyzer {
    private context;
    private errors;
    private warnings;
    constructor();
    analyze(ast: GraphAST): SemanticAnalysisResult;
    private reset;
    private buildContext;
    private addEdgeToContext;
    private validateSemantics;
    private validateVersion;
    private validateNode;
    private validateNodeProperties;
    private validateWeightedChoiceProperties;
    private validateConditionalProperties;
    private validateSequentialProperties;
    private validateMarkovProperties;
    private validateVariableProperties;
    private validateIncludeProperties;
    private validatePythonTransformProperties;
    private validateEdge;
    private validateGraphStructure;
    private detectCycles;
    private validateOutputNodes;
    private detectUnreachableNodes;
    private buildGraph;
    private buildNodeFromAST;
    private isValidNodeId;
    private hasBlockingErrors;
    private addError;
    private addWarning;
}
//# sourceMappingURL=semantic-analyzer.d.ts.map