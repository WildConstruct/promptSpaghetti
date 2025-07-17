import { Graph } from '../../graphSchema';
export interface ParserResult {
    success: boolean;
    graph?: Graph;
    errors: ParserError[];
    warnings: ParserError[];
    metadata: {
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
export declare class GraphParser {
    private options;
    constructor(options?: ParserOptions);
    parse(content: string): Promise<ParserResult>;
    parseBatch(contents: string[]): Promise<ParserResult[]>;
    validate(content: string): Promise<{
        isValid: boolean;
        errors: ParserError[];
        warnings: ParserError[];
    }>;
    parseWithProfiling(content: string): Promise<ParserResult & {
        profiling: {
            lexerTime: number;
            astTime: number;
            semanticTime: number;
            totalTime: number;
        };
    }>;
    private addLexerErrors;
    private addParseErrors;
    private addSemanticErrors;
    private addSemanticWarnings;
    private shouldStopOnErrors;
    private hasBlockingErrors;
    private finalizeResult;
    generateErrorReport(result: ParserResult): string;
}
export declare function parseGraph(content: string, options?: ParserOptions): Promise<ParserResult>;
export declare function validateGraph(content: string): Promise<boolean>;
//# sourceMappingURL=graph-parser.d.ts.map