// Epic 12 - LLM Agent Randomizer System
// Story 12.3 - Parser Implementation
// AST construction from lexer tokens

import { Token, TokenType, LexerPosition } from '../lexer/graph-lexer';

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

export class ASTBuilder {
  private tokens: Token[];
  private current: number = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Build AST from token stream
   */
  build(): { ast: GraphAST | null; errors: ParseError[] } {
    this.current = 0;
    this.errors = [];

    try {
      const ast = this.parseGraph();
      return { ast, errors: this.errors };
    } catch (error) {
      this.addError(error instanceof Error ? error.message : 'Unknown parsing error', 'error');
      return { ast: null, errors: this.errors };
    }
  }

  /**
   * Parse complete graph structure
   */
  private parseGraph(): GraphAST {
    const start = this.currentToken();
    const graph: GraphAST = {
      type: 'Graph',
      position: start.position,
      nodes: [],
      edges: []
    };

    // Parse header section
    this.parseHeader(graph);

    // Parse sections
    while (!this.isAtEnd()) {
      const token = this.currentToken();
      
      if (token.type === TokenType.SECTION_DELIMITER) {
        this.parseSection(graph);
      } else if (token.type === TokenType.NEWLINE) {
        this.advance(); // Skip newlines between sections
      } else {
        this.addError(`Unexpected token: ${token.value}`, 'error');
        this.advance();
      }
    }

    return graph;
  }

  /**
   * Parse header section (version, checksum, metadata)
   */
  private parseHeader(graph: GraphAST): void {
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SECTION_DELIMITER) {
      const token = this.currentToken();

      if (token.type === TokenType.VERSION || 
          (token.type === TokenType.KEY && token.value === 'version')) {
        graph.version = this.parseHeaderValue();
      } else if (token.type === TokenType.CHECKSUM || 
                 (token.type === TokenType.KEY && token.value === 'checksum')) {
        graph.checksum = this.parseHeaderValue();
      } else if (token.type === TokenType.METADATA || 
                 (token.type === TokenType.KEY && token.value === 'metadata')) {
        graph.metadata = this.parseMetadata();
      } else if (token.type === TokenType.NEWLINE) {
        this.advance();
      } else {
        this.advance(); // Skip unexpected tokens in header
      }
    }
  }

  /**
   * Parse header key-value pair
   */
  private parseHeaderValue(): string {
    this.advance(); // Skip key
    this.expect(TokenType.COLON, 'Expected colon after header key');
    
    const valueToken = this.advance();
    if (valueToken.type === TokenType.STRING || valueToken.type === TokenType.VALUE || 
        valueToken.type === TokenType.NUMBER) {
      return valueToken.value;
    }
    
    this.addError('Expected value after colon', 'error');
    return '';
  }

  /**
   * Parse metadata section
   */
  private parseMetadata(): MetadataNode {
    const start = this.currentToken();
    this.advance(); // Skip 'metadata'
    this.expect(TokenType.COLON, 'Expected colon after metadata');
    
    const metadata: MetadataNode = {
      type: 'Metadata',
      position: start.position,
      properties: {}
    };

    // Parse metadata properties
    if (this.currentToken().type === TokenType.INDENT) {
      this.advance(); // Skip indent
      
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.DEDENT && 
             this.currentToken().type !== TokenType.SECTION_DELIMITER) {
        
        if (this.currentToken().type === TokenType.KEY) {
          const key = this.advance().value;
          this.expect(TokenType.COLON, 'Expected colon after metadata key');
          const value = this.parseValue();
          metadata.properties[key] = value;
        } else if (this.currentToken().type === TokenType.NEWLINE) {
          this.advance();
        } else {
          this.advance(); // Skip unexpected tokens
        }
      }
      
      if (this.currentToken().type === TokenType.DEDENT) {
        this.advance();
      }
    }

    return metadata;
  }

  /**
   * Parse section (NODES or EDGES)
   */
  private parseSection(graph: GraphAST): void {
    const delimiter = this.advance();
    const sectionName = this.extractSectionName(delimiter.value);

    switch (sectionName) {
      case 'NODES':
        this.parseNodesSection(graph);
        break;
      case 'EDGES':
        this.parseEdgesSection(graph);
        break;
      case 'END':
        // End of graph
        return;
      default:
        this.addError(`Unknown section: ${sectionName}`, 'error', 'Use NODES, EDGES, or END');
    }
  }

  /**
   * Parse nodes section
   */
  private parseNodesSection(graph: GraphAST): void {
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SECTION_DELIMITER) {
      if (this.currentToken().type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }

      const node = this.parseNodeDefinition();
      if (node) {
        graph.nodes.push(node);
      }
    }
  }

  /**
   * Parse individual node definition
   */
  private parseNodeDefinition(): NodeDefinitionAST | null {
    const token = this.currentToken();
    
    if (token.type !== TokenType.KEY) {
      this.addError('Expected node ID', 'error');
      this.synchronize();
      return null;
    }

    const nodeId = this.advance().value;
    this.expect(TokenType.COLON, 'Expected colon after node ID');

    const node: NodeDefinitionAST = {
      type: 'NodeDefinition',
      id: nodeId,
      nodeType: '',
      position: token.position
    };

    // Parse node properties
    if (this.currentToken().type === TokenType.INDENT) {
      this.advance(); // Skip indent
      
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.DEDENT && 
             this.currentToken().type !== TokenType.KEY) {
        
        if (this.currentToken().type === TokenType.KEY) {
          const key = this.advance().value;
          this.expect(TokenType.COLON, 'Expected colon after property key');

          switch (key) {
            case 'type':
              node.nodeType = this.parseValue();
              break;
            case 'props':
              node.properties = this.parseProperties();
              break;
            case 'inputs':
              node.inputs = this.parseArray();
              break;
            default:
              this.addError(`Unknown node property: ${key}`, 'warning', 'Use type, props, or inputs');
              this.parseValue(); // Skip unknown property
          }
        } else if (this.currentToken().type === TokenType.NEWLINE) {
          this.advance();
        } else {
          this.advance(); // Skip unexpected tokens
        }
      }
      
      if (this.currentToken().type === TokenType.DEDENT) {
        this.advance();
      }
    }

    return node;
  }

  /**
   * Parse properties object
   */
  private parseProperties(): Record<string, any> {
    const properties: Record<string, any> = {};

    if (this.currentToken().type === TokenType.INDENT) {
      this.advance(); // Skip indent
      
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.DEDENT) {
        if (this.currentToken().type === TokenType.KEY) {
          const key = this.advance().value;
          this.expect(TokenType.COLON, 'Expected colon after property key');
          properties[key] = this.parseValue();
        } else if (this.currentToken().type === TokenType.NEWLINE) {
          this.advance();
        } else {
          this.advance(); // Skip unexpected tokens
        }
      }
      
      if (this.currentToken().type === TokenType.DEDENT) {
        this.advance();
      }
    }

    return properties;
  }

  /**
   * Parse edges section
   */
  private parseEdgesSection(graph: GraphAST): void {
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SECTION_DELIMITER) {
      if (this.currentToken().type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }

      const edge = this.parseEdgeDefinition();
      if (edge) {
        graph.edges.push(edge);
      }
    }
  }

  /**
   * Parse individual edge definition
   */
  private parseEdgeDefinition(): EdgeDefinitionAST | null {
    const start = this.currentToken();
    
    if (start.type !== TokenType.KEY && start.type !== TokenType.VALUE) {
      this.addError('Expected source node ID', 'error');
      this.synchronize();
      return null;
    }

    const source = this.advance().value;
    
    if (this.currentToken().type !== TokenType.EDGE_ARROW) {
      this.addError('Expected -> after source node', 'error', 'Use -> to connect nodes');
      return null;
    }
    
    this.advance(); // Skip arrow
    
    const targetToken = this.currentToken();
    if (targetToken.type !== TokenType.KEY && targetToken.type !== TokenType.VALUE) {
      this.addError('Expected target node ID after ->', 'error');
      return null;
    }
    
    const target = this.advance().value;

    return {
      type: 'EdgeDefinition',
      source,
      target,
      position: start.position
    };
  }

  /**
   * Parse generic value (string, number, boolean, array, object)
   */
  private parseValue(): any {
    const token = this.currentToken();

    switch (token.type) {
      case TokenType.STRING:
      case TokenType.VALUE:
        this.advance();
        return token.value;

      case TokenType.NUMBER:
        this.advance();
        return parseFloat(token.value);

      case TokenType.BOOLEAN:
        this.advance();
        return token.value.toLowerCase() === 'true';

      case TokenType.NULL:
        this.advance();
        return null;

      case TokenType.ARRAY_START:
        return this.parseArray();

      case TokenType.INDENT:
        return this.parseObject();

      default:
        this.addError(`Unexpected token in value: ${token.value}`, 'error');
        this.advance();
        return null;
    }
  }

  /**
   * Parse array [item1, item2, ...]
   */
  private parseArray(): any[] {
    const elements: any[] = [];
    
    this.expect(TokenType.ARRAY_START, 'Expected [');
    
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.ARRAY_END) {
      if (this.currentToken().type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }
      
      elements.push(this.parseValue());
      
      // Skip commas if present
      if (this.currentToken().type === TokenType.VALUE && this.currentToken().value === ',') {
        this.advance();
      }
    }
    
    this.expect(TokenType.ARRAY_END, 'Expected ]');
    return elements;
  }

  /**
   * Parse object (nested properties)
   */
  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    
    this.expect(TokenType.INDENT, 'Expected indentation');
    
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.DEDENT) {
      if (this.currentToken().type === TokenType.KEY) {
        const key = this.advance().value;
        this.expect(TokenType.COLON, 'Expected colon after key');
        obj[key] = this.parseValue();
      } else if (this.currentToken().type === TokenType.NEWLINE) {
        this.advance();
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }
    
    if (this.currentToken().type === TokenType.DEDENT) {
      this.advance();
    }
    
    return obj;
  }

  /**
   * Extract section name from delimiter (e.g., "---NODES---" -> "NODES")
   */
  private extractSectionName(delimiter: string): string {
    const match = delimiter.match(/---(\w+)---/);
    return match ? match[1] : '';
  }

  /**
   * Helper methods
   */
  private currentToken(): Token {
    if (this.isAtEnd()) {
      return this.tokens[this.tokens.length - 1] || { 
        type: TokenType.EOF, 
        value: '', 
        position: { line: 1, column: 1, offset: 0 } 
      };
    }
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.currentToken().type === TokenType.EOF;
  }

  private expect(type: TokenType, message: string): boolean {
    if (this.currentToken().type === type) {
      this.advance();
      return true;
    }
    
    this.addError(message, 'error');
    return false;
  }

  private synchronize(): void {
    // Skip to next synchronization point (newline or section delimiter)
    while (!this.isAtEnd()) {
      if (this.currentToken().type === TokenType.NEWLINE || 
          this.currentToken().type === TokenType.SECTION_DELIMITER) {
        break;
      }
      this.advance();
    }
  }

  private addError(message: string, severity: 'error' | 'warning', suggestion?: string): void {
    this.errors.push({
      message,
      position: this.currentToken().position,
      severity,
      suggestion
    });
  }
}