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

export interface ParserError {
    type: 'lexer' | 'parser' | 'semantic';
    code: string;
    message: string;
    line?: number;
    column?: number;
    nodeId?: string;
    severity: 'error' | 'warning';
    suggestion?: string;

export interface ParserOptions {
    tolerateErrors?: boolean;
    maxErrors?: number;
    validateSchema?: boolean;
    includeAST?: boolean;
    performance?: boolean;

export declare class GraphParser {
    private options;
    constructor(options?: ParserOptions);
    /**
     * Parse serialized graph content into Graph object
     */
    parse(content: string): Promise<ParserResult>;
    /**
     * Parse multiple graphs in batch
     */
    parseBatch(contents: string[]): Promise<ParserResult[]>;
    /**
     * Validate content without full parsing (faster for validation-only use cases)
     */
    validate(content: string): Promise<{
        isValid: boolean;
        errors: ParserError[];
        warnings: ParserError[];
    }>;
    /**
     * Parse with performance profiling
     */
    parseWithProfiling(content: string): Promise<ParserResult & {
        profiling: {,
            lexerTime: number;
            astTime: number;
            semanticTime: number;
            totalTime: number;
        };
    }>;
    /**
     * Convert lexer errors to parser errors
     */
    private addLexerErrors;
    /**
     * Convert parse errors to parser errors
     */
    private addParseErrors;
    /**
     * Convert semantic errors to parser errors
     */
    private addSemanticErrors;
    /**
     * Convert semantic warnings to parser warnings
     */
    private addSemanticWarnings;
    /**
     * Check if parsing should stop due to errors
     */
    private shouldStopOnErrors;
    /**
     * Check if result has blocking errors
     */
    private hasBlockingErrors;
    /**
     * Finalize result with metadata
     */
    private finalizeResult;
    /**
     * Generate detailed error report
     */
    generateErrorReport(result: ParserResult): string;
/**
 * Convenience function for simple parsing
 */
export declare function parseGraph(content: string, options?: ParserOptions): Promise<ParserResult>;
/**
 * Convenience function for validation only
 */
export declare function validateGraph(content: string): Promise<boolean>;
//# sourceMappingURL=graph-parser.d.ts.map