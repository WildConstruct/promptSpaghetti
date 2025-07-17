"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTBuilder = void 0;
const graph_lexer_1 = require("../lexer/graph-lexer");
class ASTBuilder {
    constructor(tokens) {
        this.current = 0;
        this.errors = [];
        this.tokens = tokens;
    }
    build() {
        this.current = 0;
        this.errors = [];
        try {
            const ast = this.parseGraph();
            return { ast, errors: this.errors };
        }
        catch (error) {
            this.addError(error instanceof Error ? error.message : 'Unknown parsing error', 'error');
            return { ast: null, errors: this.errors };
        }
    }
    parseGraph() {
        const start = this.currentToken();
        const graph = {
            type: 'Graph',
            position: start.position,
            nodes: [],
            edges: []
        };
        this.parseHeader(graph);
        while (!this.isAtEnd()) {
            const token = this.currentToken();
            if (token.type === graph_lexer_1.TokenType.SECTION_DELIMITER) {
                this.parseSection(graph);
            }
            else if (token.type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
            }
            else {
                this.addError(`Unexpected token: ${token.value}`, 'error');
                this.advance();
            }
        }
        return graph;
    }
    parseHeader(graph) {
        while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.SECTION_DELIMITER) {
            const token = this.currentToken();
            if (token.type === graph_lexer_1.TokenType.VERSION ||
                (token.type === graph_lexer_1.TokenType.KEY && token.value === 'version')) {
                graph.version = this.parseHeaderValue();
            }
            else if (token.type === graph_lexer_1.TokenType.CHECKSUM ||
                (token.type === graph_lexer_1.TokenType.KEY && token.value === 'checksum')) {
                graph.checksum = this.parseHeaderValue();
            }
            else if (token.type === graph_lexer_1.TokenType.METADATA ||
                (token.type === graph_lexer_1.TokenType.KEY && token.value === 'metadata')) {
                graph.metadata = this.parseMetadata();
            }
            else if (token.type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
            }
            else {
                this.advance();
            }
        }
    }
    parseHeaderValue() {
        this.advance();
        this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after header key');
        const valueToken = this.advance();
        if (valueToken.type === graph_lexer_1.TokenType.STRING || valueToken.type === graph_lexer_1.TokenType.VALUE ||
            valueToken.type === graph_lexer_1.TokenType.NUMBER) {
            return valueToken.value;
        }
        this.addError('Expected value after colon', 'error');
        return '';
    }
    parseMetadata() {
        const start = this.currentToken();
        this.advance();
        this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after metadata');
        const metadata = {
            type: 'Metadata',
            position: start.position,
            properties: {}
        };
        if (this.currentToken().type === graph_lexer_1.TokenType.INDENT) {
            this.advance();
            while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.DEDENT &&
                this.currentToken().type !== graph_lexer_1.TokenType.SECTION_DELIMITER) {
                if (this.currentToken().type === graph_lexer_1.TokenType.KEY) {
                    const key = this.advance().value;
                    this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after metadata key');
                    const value = this.parseValue();
                    metadata.properties[key] = value;
                }
                else if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                    this.advance();
                }
                else {
                    this.advance();
                }
            }
            if (this.currentToken().type === graph_lexer_1.TokenType.DEDENT) {
                this.advance();
            }
        }
        return metadata;
    }
    parseSection(graph) {
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
                return;
            default:
                this.addError(`Unknown section: ${sectionName}`, 'error', 'Use NODES, EDGES, or END');
        }
    }
    parseNodesSection(graph) {
        while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.SECTION_DELIMITER) {
            if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
                continue;
            }
            const node = this.parseNodeDefinition();
            if (node) {
                graph.nodes.push(node);
            }
        }
    }
    parseNodeDefinition() {
        const token = this.currentToken();
        if (token.type !== graph_lexer_1.TokenType.KEY) {
            this.addError('Expected node ID', 'error');
            this.synchronize();
            return null;
        }
        const nodeId = this.advance().value;
        this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after node ID');
        const node = {
            type: 'NodeDefinition',
            id: nodeId,
            nodeType: '',
            position: token.position
        };
        if (this.currentToken().type === graph_lexer_1.TokenType.INDENT) {
            this.advance();
            while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.DEDENT &&
                this.currentToken().type !== graph_lexer_1.TokenType.KEY) {
                if (this.currentToken().type === graph_lexer_1.TokenType.KEY) {
                    const key = this.advance().value;
                    this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after property key');
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
                            this.parseValue();
                    }
                }
                else if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                    this.advance();
                }
                else {
                    this.advance();
                }
            }
            if (this.currentToken().type === graph_lexer_1.TokenType.DEDENT) {
                this.advance();
            }
        }
        return node;
    }
    parseProperties() {
        const properties = {};
        if (this.currentToken().type === graph_lexer_1.TokenType.INDENT) {
            this.advance();
            while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.DEDENT) {
                if (this.currentToken().type === graph_lexer_1.TokenType.KEY) {
                    const key = this.advance().value;
                    this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after property key');
                    properties[key] = this.parseValue();
                }
                else if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                    this.advance();
                }
                else {
                    this.advance();
                }
            }
            if (this.currentToken().type === graph_lexer_1.TokenType.DEDENT) {
                this.advance();
            }
        }
        return properties;
    }
    parseEdgesSection(graph) {
        while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.SECTION_DELIMITER) {
            if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
                continue;
            }
            const edge = this.parseEdgeDefinition();
            if (edge) {
                graph.edges.push(edge);
            }
        }
    }
    parseEdgeDefinition() {
        const start = this.currentToken();
        if (start.type !== graph_lexer_1.TokenType.KEY && start.type !== graph_lexer_1.TokenType.VALUE) {
            this.addError('Expected source node ID', 'error');
            this.synchronize();
            return null;
        }
        const source = this.advance().value;
        if (this.currentToken().type !== graph_lexer_1.TokenType.EDGE_ARROW) {
            this.addError('Expected -> after source node', 'error', 'Use -> to connect nodes');
            return null;
        }
        this.advance();
        const targetToken = this.currentToken();
        if (targetToken.type !== graph_lexer_1.TokenType.KEY && targetToken.type !== graph_lexer_1.TokenType.VALUE) {
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
    parseValue() {
        const token = this.currentToken();
        switch (token.type) {
            case graph_lexer_1.TokenType.STRING:
            case graph_lexer_1.TokenType.VALUE:
                this.advance();
                return token.value;
            case graph_lexer_1.TokenType.NUMBER:
                this.advance();
                return parseFloat(token.value);
            case graph_lexer_1.TokenType.BOOLEAN:
                this.advance();
                return token.value.toLowerCase() === 'true';
            case graph_lexer_1.TokenType.NULL:
                this.advance();
                return null;
            case graph_lexer_1.TokenType.ARRAY_START:
                return this.parseArray();
            case graph_lexer_1.TokenType.INDENT:
                return this.parseObject();
            default:
                this.addError(`Unexpected token in value: ${token.value}`, 'error');
                this.advance();
                return null;
        }
    }
    parseArray() {
        const elements = [];
        this.expect(graph_lexer_1.TokenType.ARRAY_START, 'Expected [');
        while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.ARRAY_END) {
            if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
                continue;
            }
            elements.push(this.parseValue());
            if (this.currentToken().type === graph_lexer_1.TokenType.VALUE && this.currentToken().value === ',') {
                this.advance();
            }
        }
        this.expect(graph_lexer_1.TokenType.ARRAY_END, 'Expected ]');
        return elements;
    }
    parseObject() {
        const obj = {};
        this.expect(graph_lexer_1.TokenType.INDENT, 'Expected indentation');
        while (!this.isAtEnd() && this.currentToken().type !== graph_lexer_1.TokenType.DEDENT) {
            if (this.currentToken().type === graph_lexer_1.TokenType.KEY) {
                const key = this.advance().value;
                this.expect(graph_lexer_1.TokenType.COLON, 'Expected colon after key');
                obj[key] = this.parseValue();
            }
            else if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE) {
                this.advance();
            }
            else {
                this.advance();
            }
        }
        if (this.currentToken().type === graph_lexer_1.TokenType.DEDENT) {
            this.advance();
        }
        return obj;
    }
    extractSectionName(delimiter) {
        const match = delimiter.match(/---(\w+)---/);
        return match ? match[1] : '';
    }
    currentToken() {
        if (this.isAtEnd()) {
            return this.tokens[this.tokens.length - 1] || {
                type: graph_lexer_1.TokenType.EOF,
                value: '',
                position: { line: 1, column: 1, offset: 0 }
            };
        }
        return this.tokens[this.current];
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.tokens[this.current - 1];
    }
    isAtEnd() {
        return this.current >= this.tokens.length || this.currentToken().type === graph_lexer_1.TokenType.EOF;
    }
    expect(type, message) {
        if (this.currentToken().type === type) {
            this.advance();
            return true;
        }
        this.addError(message, 'error');
        return false;
    }
    synchronize() {
        while (!this.isAtEnd()) {
            if (this.currentToken().type === graph_lexer_1.TokenType.NEWLINE ||
                this.currentToken().type === graph_lexer_1.TokenType.SECTION_DELIMITER) {
                break;
            }
            this.advance();
        }
    }
    addError(message, severity, suggestion) {
        this.errors.push({
            message,
            position: this.currentToken().position,
            severity,
            suggestion
        });
    }
}
exports.ASTBuilder = ASTBuilder;
//# sourceMappingURL=ast-builder.js.map