// Epic 12 - LLM Agent Randomizer System
// Story 12.3 - Parser Implementation
// Main parser interface that coordinates lexer, AST builder, and semantic analyzer
import { GraphLexer, LexerError } from './lexer/graph-lexer';
import { ASTBuilder, ParseError } from './ast/ast-builder';
import { SemanticAnalyzer, SemanticError } from './semantic/semantic-analyzer';
import { Graph } from '../../graphSchema';

export interface ParserResult {
  success: boolean;
  graph?: Graph;
  errors: ParserError[];
  warnings: ParserError[];
  metadata: {,
    parseTime: number;
    tokenCount: number;
    nodeCount: number;
    edgeCount: number;
  };
}

export interface ParserError {
  type: 'lexer' | 'parser' | 'semantic';
  code: string;
  message: string;
  line?: number;
  column?: number;
  nodeId?: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ParserOptions {
  tolerateErrors?: boolean;
  maxErrors?: number;
  validateSchema?: boolean;
  includeAST?: boolean;
  performance?: boolean;
}

export class GraphParser {
  private options: ParserOptions;
  constructor(options: ParserOptions = {}) {
    this.options = {
      tolerateErrors: false,
      maxErrors: 10,
      validateSchema: true,
      includeAST: false,
      performance: false,
      ...options
    };
  }
  /**
   * Parse serialized graph content into Graph object
   */
  async parse(content: string): Promise<ParserResult> {
    const startTime = Date.now();
    const result: ParserResult = {
      success: false,
      errors: [],
      warnings: [],
      metadata: {,
        parseTime: 0,
        tokenCount: 0,
        nodeCount: 0,
        edgeCount: 0,
      }
    };
    try {
      // Phase 1: Lexical Analysis
      const lexer = new GraphLexer(content);
      const { tokens, errors: lexerErrors } = lexer.tokenize();
      result.metadata.tokenCount = tokens.length;
      this.addLexerErrors(result, lexerErrors);
      if (this.shouldStopOnErrors(result)) {
        return this.finalizeResult(result, startTime);
      }
      // Phase 2: AST Construction
      const astBuilder = new ASTBuilder(tokens);
      const { ast, errors: parseErrors } = astBuilder.build();
      this.addParseErrors(result, parseErrors);
      if (!ast || this.shouldStopOnErrors(result)) {
        return this.finalizeResult(result, startTime);
      }
      result.metadata.nodeCount = ast.nodes.length;
      result.metadata.edgeCount = ast.edges.length;
      // Phase 3: Semantic Analysis
      const semanticAnalyzer = new SemanticAnalyzer();
      const { graph, errors: semanticErrors, warnings } = semanticAnalyzer.analyze(ast);
      this.addSemanticErrors(result, semanticErrors);
      this.addSemanticWarnings(result, warnings);
      if (graph && !this.hasBlockingErrors(result)) {
        result.success = true;
        result.graph = graph;
      }
      return this.finalizeResult(result, startTime);
    } catch (error) {
      result.errors.push({)
        type: 'parser',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        severity: 'error',
      });
      return this.finalizeResult(result, startTime);
    }
  }
  /**
   * Parse multiple graphs in batch
   */
  async parseBatch(contents: string[]): Promise<ParserResult[]> {
    const results = await Promise.all(;);
      contents.map(content => this.parse(content))
    );
    return results;
  }
  /**
   * Validate content without full parsing (faster for validation-only use cases)
   */
  async validate(content: string): Promise<{
    isValid: boolean;
    errors: ParserError[];
    warnings: ParserError[];
  }> {
    const result = await this.parse(content);
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: result.warnings,
    };
  }
  /**
   * Parse with performance profiling
   */
  async parseWithProfiling(content: string): Promise<ParserResult & {
    profiling: {,
      lexerTime: number;
      astTime: number;
      semanticTime: number;
      totalTime: number;
    };
  }> {
    const startTime = Date.now();
    let lexerTime = 0;
    let astTime = 0;
    let semanticTime = 0;
    // Lexical Analysis
    const lexerStart = Date.now();
    const lexer = new GraphLexer(content);
    const { tokens, errors: lexerErrors } = lexer.tokenize();
    lexerTime = Date.now() - lexerStart;
    // AST Construction
    const astStart = Date.now();
    const astBuilder = new ASTBuilder(tokens);
    const { ast, errors: parseErrors } = astBuilder.build();
    astTime = Date.now() - astStart;
    // Semantic Analysis
    const semanticStart = Date.now();
    let graph: Graph | undefined;
    let semanticErrors: SemanticError[] = [];
    let warnings: SemanticError[] = [];
    if (ast) {
      const semanticAnalyzer = new SemanticAnalyzer();
      const result = semanticAnalyzer.analyze(ast);
      graph = result.graph || undefined;
      semanticErrors = result.errors;
      warnings = result.warnings;
    }
    semanticTime = Date.now() - semanticStart;
    const totalTime = Date.now() - startTime;
    // Build result
    const result: ParserResult = {
      success: !!graph,
      graph,
      errors: [],
      warnings: [],
      metadata: {,
        parseTime: totalTime,
        tokenCount: tokens.length,
        nodeCount: ast?.nodes.length || 0,
        edgeCount: ast?.edges.length || 0,
      }
    };
    this.addLexerErrors(result, lexerErrors);
    this.addParseErrors(result, parseErrors);
    this.addSemanticErrors(result, semanticErrors);
    this.addSemanticWarnings(result, warnings);
    return {
      ...result,
      profiling: {,
        lexerTime,
        astTime,
        semanticTime,
        totalTime
      }
    };
  }
  /**
   * Convert lexer errors to parser errors
   */
  private addLexerErrors(result: ParserResult, errors: LexerError[]): void {
    for (const error of errors) {
      result.errors.push({)
        type: 'lexer',
        code: 'LEXER_ERROR',
        message: error.message,
        line: error.position.line,
        column: error.position.column,
        severity: 'error',
        suggestion: error.suggestion,
      });
    }
  }
  /**
   * Convert parse errors to parser errors
   */
  private addParseErrors(result: ParserResult, errors: ParseError[]): void {
    for (const error of errors) {
      result.errors.push({)
        type: 'parser',
        code: 'PARSE_ERROR',
        message: error.message,
        line: error.position.line,
        column: error.position.column,
        severity: error.severity,
        suggestion: error.suggestion,
      });
    }
  }
  /**
   * Convert semantic errors to parser errors
   */
  private addSemanticErrors(result: ParserResult, errors: SemanticError[]): void {
    for (const error of errors) {
      result.errors.push({)
        type: 'semantic',
        code: error.errorCode,
        message: error.message,
        nodeId: error.nodeId,
        severity: error.severity,
        suggestion: error.suggestion,
      });
    }
  }
  /**
   * Convert semantic warnings to parser warnings
   */
  private addSemanticWarnings(result: ParserResult, warnings: SemanticError[]): void {
    for (const warning of warnings) {
      result.warnings.push({)
        type: 'semantic',
        code: warning.errorCode,
        message: warning.message,
        nodeId: warning.nodeId,
        severity: warning.severity,
        suggestion: warning.suggestion,
      });
    }
  }
  /**
   * Check if parsing should stop due to errors
   */
  private shouldStopOnErrors(result: ParserResult): boolean {
    if (this.options.tolerateErrors) {
      return result.errors.length >= (this.options.maxErrors || 10);
    }
    return result.errors.filter(e => e.severity === 'error').length > 0;
  }
  /**
   * Check if result has blocking errors
   */
  private hasBlockingErrors(result: ParserResult): boolean {
    return result.errors.some(error => )
      error.severity === 'error' && 
      error.code !== 'UNKNOWN_NODE_TYPE'
    );
  }
  /**
   * Finalize result with metadata
   */
  private finalizeResult(result: ParserResult, startTime: number): ParserResult {
    result.metadata.parseTime = Date.now() - startTime;
    return result;
  }
  /**
   * Generate detailed error report
   */
  generateErrorReport(result: ParserResult): string {
    let report = '# Parser Error Report\n\n';
    if (result.success) {
      report += '✅ **Parsing Successful**\n';
      report += `- Nodes: ${result.metadata.nodeCount}\n`;}
      report += `- Edges: ${result.metadata.edgeCount}\n`;}
      report += `- Parse Time: ${result.metadata.parseTime}ms\n\n`;}
    } else {
      report += '❌ **Parsing Failed**\n\n';
    }
    if (result.errors.length > 0) {
      report += `## Errors (${result.errors.length})\n\n`;}
      result.errors.forEach((error, index) => {
        report += `### ${index + 1}. ${error.code}\n`;}
        report += `**Message**: ${error.message}\n`;}
        if (error.line) report += `**Location**: Line ${error.line}, Column ${error.column}\n`;}
        if (error.nodeId) report += `**Node**: ${error.nodeId}\n`;}
        if (error.suggestion) report += `**Suggestion**: ${error.suggestion}\n`;}
        report += '\n';
      });
    }
    if (result.warnings.length > 0) {
      report += `## Warnings (${result.warnings.length})\n\n`;}
      result.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.code}\n`;}
        report += `**Message**: ${warning.message}\n`;}
        if (warning.nodeId) report += `**Node**: ${warning.nodeId}\n`;}
        if (warning.suggestion) report += `**Suggestion**: ${warning.suggestion}\n`;}
        report += '\n';
      });
    }
    return report;
  }
}
/**
 * Convenience function for simple parsing
 */
export async function parseGraph(content: string, options?: ParserOptions): Promise<ParserResult> {
  const parser = new GraphParser(options);
  return parser.parse(content);
}
/**
 * Convenience function for validation only
 */
export async function validateGraph(content: string): Promise<boolean> {
  const parser = new GraphParser({ tolerateErrors: true });
  const result = await parser.validate(content);
  return result.isValid;
}