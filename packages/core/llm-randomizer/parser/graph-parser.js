"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphParser = void 0;
exports.parseGraph = parseGraph;
exports.validateGraph = validateGraph;
const graph_lexer_1 = require("./lexer/graph-lexer");
const ast_builder_1 = require("./ast/ast-builder");
const semantic_analyzer_1 = require("./semantic/semantic-analyzer");
class GraphParser {
    constructor(options = {}) {
        this.options = {
            tolerateErrors: false,
            maxErrors: 10,
            validateSchema: true,
            includeAST: false,
            performance: false,
            ...options
        };
    }
    async parse(content) {
        const startTime = Date.now();
        const result = {
            success: false,
            errors: [],
            warnings: [],
            metadata: {
                parseTime: 0,
                tokenCount: 0,
                nodeCount: 0,
                edgeCount: 0
            }
        };
        try {
            const lexer = new graph_lexer_1.GraphLexer(content);
            const { tokens, errors: lexerErrors } = lexer.tokenize();
            result.metadata.tokenCount = tokens.length;
            this.addLexerErrors(result, lexerErrors);
            if (this.shouldStopOnErrors(result)) {
                return this.finalizeResult(result, startTime);
            }
            const astBuilder = new ast_builder_1.ASTBuilder(tokens);
            const { ast, errors: parseErrors } = astBuilder.build();
            this.addParseErrors(result, parseErrors);
            if (!ast || this.shouldStopOnErrors(result)) {
                return this.finalizeResult(result, startTime);
            }
            result.metadata.nodeCount = ast.nodes.length;
            result.metadata.edgeCount = ast.edges.length;
            const semanticAnalyzer = new semantic_analyzer_1.SemanticAnalyzer();
            const { graph, errors: semanticErrors, warnings } = semanticAnalyzer.analyze(ast);
            this.addSemanticErrors(result, semanticErrors);
            this.addSemanticWarnings(result, warnings);
            if (graph && !this.hasBlockingErrors(result)) {
                result.success = true;
                result.graph = graph;
            }
            return this.finalizeResult(result, startTime);
        }
        catch (error) {
            result.errors.push({
                type: 'parser',
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Unknown parsing error',
                severity: 'error'
            });
            return this.finalizeResult(result, startTime);
        }
    }
    async parseBatch(contents) {
        const results = await Promise.all(contents.map(content => this.parse(content)));
        return results;
    }
    async validate(content) {
        const result = await this.parse(content);
        return {
            isValid: result.success,
            errors: result.errors,
            warnings: result.warnings
        };
    }
    async parseWithProfiling(content) {
        const startTime = Date.now();
        let lexerTime = 0;
        let astTime = 0;
        let semanticTime = 0;
        const lexerStart = Date.now();
        const lexer = new graph_lexer_1.GraphLexer(content);
        const { tokens, errors: lexerErrors } = lexer.tokenize();
        lexerTime = Date.now() - lexerStart;
        const astStart = Date.now();
        const astBuilder = new ast_builder_1.ASTBuilder(tokens);
        const { ast, errors: parseErrors } = astBuilder.build();
        astTime = Date.now() - astStart;
        const semanticStart = Date.now();
        let graph;
        let semanticErrors = [];
        let warnings = [];
        if (ast) {
            const semanticAnalyzer = new semantic_analyzer_1.SemanticAnalyzer();
            const result = semanticAnalyzer.analyze(ast);
            graph = result.graph || undefined;
            semanticErrors = result.errors;
            warnings = result.warnings;
        }
        const semanticTime = Date.now() - semanticStart;
        const totalTime = Date.now() - startTime;
        const result = {
            success: !!graph,
            graph,
            errors: [],
            warnings: [],
            metadata: {
                parseTime: totalTime,
                tokenCount: tokens.length,
                nodeCount: ast?.nodes.length || 0,
                edgeCount: ast?.edges.length || 0
            }
        };
        this.addLexerErrors(result, lexerErrors);
        this.addParseErrors(result, parseErrors);
        this.addSemanticErrors(result, semanticErrors);
        this.addSemanticWarnings(result, warnings);
        return {
            ...result,
            profiling: {
                lexerTime,
                astTime,
                semanticTime,
                totalTime
            }
        };
    }
    addLexerErrors(result, errors) {
        for (const error of errors) {
            result.errors.push({
                type: 'lexer',
                code: 'LEXER_ERROR',
                message: error.message,
                line: error.position.line,
                column: error.position.column,
                severity: 'error',
                suggestion: error.suggestion
            });
        }
    }
    addParseErrors(result, errors) {
        for (const error of errors) {
            result.errors.push({
                type: 'parser',
                code: 'PARSE_ERROR',
                message: error.message,
                line: error.position.line,
                column: error.position.column,
                severity: error.severity,
                suggestion: error.suggestion
            });
        }
    }
    addSemanticErrors(result, errors) {
        for (const error of errors) {
            result.errors.push({
                type: 'semantic',
                code: error.errorCode,
                message: error.message,
                nodeId: error.nodeId,
                severity: error.severity,
                suggestion: error.suggestion
            });
        }
    }
    addSemanticWarnings(result, warnings) {
        for (const warning of warnings) {
            result.warnings.push({
                type: 'semantic',
                code: warning.errorCode,
                message: warning.message,
                nodeId: warning.nodeId,
                severity: warning.severity,
                suggestion: warning.suggestion
            });
        }
    }
    shouldStopOnErrors(result) {
        if (this.options.tolerateErrors) {
            return result.errors.length >= (this.options.maxErrors || 10);
        }
        return result.errors.filter(e => e.severity === 'error').length > 0;
    }
    hasBlockingErrors(result) {
        return result.errors.some(error => error.severity === 'error' &&
            error.code !== 'UNKNOWN_NODE_TYPE');
    }
    finalizeResult(result, startTime) {
        result.metadata.parseTime = Date.now() - startTime;
        return result;
    }
    generateErrorReport(result) {
        let report = `# Parser Error Report\n\n`;
        if (result.success) {
            report += `✅ **Parsing Successful**\n`;
            report += `- Nodes: ${result.metadata.nodeCount}\n`;
            report += `- Edges: ${result.metadata.edgeCount}\n`;
            report += `- Parse Time: ${result.metadata.parseTime}ms\n\n`;
        }
        else {
            report += `❌ **Parsing Failed**\n\n`;
        }
        if (result.errors.length > 0) {
            report += `## Errors (${result.errors.length})\n\n`;
            result.errors.forEach((error, index) => {
                report += `### ${index + 1}. ${error.code}\n`;
                report += `**Message**: ${error.message}\n`;
                if (error.line)
                    report += `**Location**: Line ${error.line}, Column ${error.column}\n`;
                if (error.nodeId)
                    report += `**Node**: ${error.nodeId}\n`;
                if (error.suggestion)
                    report += `**Suggestion**: ${error.suggestion}\n`;
                report += '\n';
            });
        }
        if (result.warnings.length > 0) {
            report += `## Warnings (${result.warnings.length})\n\n`;
            result.warnings.forEach((warning, index) => {
                report += `### ${index + 1}. ${warning.code}\n`;
                report += `**Message**: ${warning.message}\n`;
                if (warning.nodeId)
                    report += `**Node**: ${warning.nodeId}\n`;
                if (warning.suggestion)
                    report += `**Suggestion**: ${warning.suggestion}\n`;
                report += '\n';
            });
        }
        return report;
    }
}
exports.GraphParser = GraphParser;
async function parseGraph(content, options) {
    const parser = new GraphParser(options);
    return parser.parse(content);
}
async function validateGraph(content) {
    const parser = new GraphParser({ tolerateErrors: true });
    const result = await parser.validate(content);
    return result.isValid;
}
//# sourceMappingURL=graph-parser.js.map