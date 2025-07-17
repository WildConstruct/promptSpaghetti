import { Token, LexerPosition } from '../lexer/graph-lexer';
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
}
export declare class ASTBuilder {
    private tokens;
    private current;
    private errors;
    constructor(tokens: Token[]);
    build(): {
        ast: GraphAST | null;
        errors: ParseError[];
    };
    private parseGraph;
    private parseHeader;
    private parseHeaderValue;
    private parseMetadata;
    private parseSection;
    private parseNodesSection;
    private parseNodeDefinition;
    private parseProperties;
    private parseEdgesSection;
    private parseEdgeDefinition;
    private parseValue;
    private parseArray;
    private parseObject;
    private extractSectionName;
    private currentToken;
    private advance;
    private isAtEnd;
    private expect;
    private synchronize;
    private addError;
}
//# sourceMappingURL=ast-builder.d.ts.map