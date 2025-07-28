import { Graph } from '../../graphSchema';
export interface ParserResult {
    success: boolean;
    graph?: Graph;
    errors: ParserError;
    warnings: ParserError;
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
    if(error: any, suggestion: any): any;
    report: any;
}
/**
 * Convenience function for simple parsing
 */
export declare function parseGraph(content: string, options?: ParserOptions): Promise<ParserResult>;
//# sourceMappingURL=graph-parser.d.ts.map