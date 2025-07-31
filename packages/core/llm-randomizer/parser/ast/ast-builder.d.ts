import { Token, LexerPosition } from '../lexer/graph-lexer';

}
export interface ASTNode {
    type: string;
    position: LexerPosition;
    children?: ASTNode[];


}
export interface GraphAST extends ASTNode {
    type: 'Graph';
    version?: string;
    checksum?: string;
    metadata?: MetadataNode;
    nodes: NodeDefinitionAST[];
    edges: EdgeDefinitionAST[];

}
export interface MetadataNode extends ASTNode {
    type: 'Metadata';
    properties: Record<string, any>;

}
export interface NodeDefinitionAST extends ASTNode {
    type: 'NodeDefinition';
    id: string;
    nodeType: string;
    properties?: Record<string, any>;
    inputs?: string[];

}
export interface EdgeDefinitionAST extends ASTNode {
    type: 'EdgeDefinition';
    source: string;
    target: string;

}
export interface PropertyNode extends ASTNode {
    type: 'Property';
    key: string;
    value: any;

}
export interface ArrayNode extends ASTNode {
    type: 'Array';
    elements: any[];

}
export interface ParseError {
    message: string;
    position: LexerPosition;
    severity: 'error' | 'warning';
    suggestion?: string;

export declare class ASTBuilder {
    private tokens;
    private current;
    private errors;
    constructor(tokens: Token[]);
    /**
     * Build AST from token stream
     */
    build(): {
        ast: GraphAST | null;
        errors: ParseError[];
}
    };
    /**
     * Parse complete graph structure
     */
    private parseGraph;
    /**
     * Parse header section (version, checksum, metadata)
     */
    private parseHeader;
    /**
     * Parse header key-value pair
     */
    private parseHeaderValue;
    /**
     * Parse metadata section
     */
    private parseMetadata;
    /**
     * Parse section (NODES or EDGES)
     */
    private parseSection;
    /**
     * Parse nodes section
     */
    private parseNodesSection;
    /**
     * Parse individual node definition
     */
    private parseNodeDefinition;
    /**
     * Parse properties object
     */
    private parseProperties;
    /**
     * Parse edges section
     */
    private parseEdgesSection;
    /**
     * Parse individual edge definition
     */
    private parseEdgeDefinition;
    /**
     * Parse generic value (string, number, boolean, array, object)
     */
    private parseValue;
    /**
     * Parse array [item1, item2, ...]
     */
    private parseArray;
    /**
     * Parse object (nested properties)
     */
    private parseObject;
    /**
     * Extract section name from delimiter (e.g., "---NODES---" -> "NODES")
     */
    private extractSectionName;
    /**
     * Helper methods
     */
    private currentToken;
    private advance;
    private isAtEnd;
    private expect;
    private synchronize;
    private addError;

//# sourceMappingURL=ast-builder.d.ts.map