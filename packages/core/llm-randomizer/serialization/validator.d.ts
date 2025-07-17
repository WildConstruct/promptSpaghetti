export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    type: 'syntax' | 'semantic' | 'schema';
    message: string;
    line?: number;
    column?: number;
    nodeId?: string;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    type: 'optimization' | 'compatibility' | 'best-practice';
    message: string;
    suggestion?: string;
    nodeId?: string;
}
export interface ParsedGraph {
    version: string;
    checksum?: string;
    metadata?: Record<string, any>;
    nodes: ParsedNode[];
    edges: ParsedEdge[];
}
export interface ParsedNode {
    id: string;
    type: string;
    props?: Record<string, any>;
    inputs?: string[];
}
export interface ParsedEdge {
    source: string;
    target: string;
}
export declare class FormatValidator {
    private static readonly SUPPORTED_VERSIONS;
    private static readonly REQUIRED_SECTIONS;
    private static readonly VALID_NODE_TYPES;
    static validate(content: string): ValidationResult;
    private static parseContent;
    private static parseValue;
    private static parseArrayValue;
    private static validateStructure;
    private static validateSemantics;
    private static detectCycles;
    private static validateNodeProperties;
    private static checkOptimizations;
    private static checkReachability;
}
export declare function validateFormat(content: string): ValidationResult;
export declare function isValidFormat(content: string): boolean;
//# sourceMappingURL=validator.d.ts.map