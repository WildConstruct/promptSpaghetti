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

export declare class FormatValidator {
    private static readonly SUPPORTED_VERSIONS;
    private static readonly REQUIRED_SECTIONS;
    private static readonly VALID_NODE_TYPES;
    /**
     * Validate serialized graph format
     */
    static validate(content: string): ValidationResult;
    /**
     * Parse the serialized content into structured data
     */
    private static parseContent;
    /**
     * Parse a value from YAML-like format
     */
    private static parseValue;
    /**
     * Parse array value from string representation
     */
    private static parseArrayValue;
    /**
     * Validate overall structure and format
     */
    private static validateStructure;
    /**
     * Validate semantic correctness
     */
    private static validateSemantics;
    /**
     * Detect cycles in the graph
     */
    private static detectCycles;
    /**
     * Validate node-specific properties
     */
    private static validateNodeProperties;
    /**
     * Check for optimization opportunities
     */
    private static checkOptimizations;
    /**
     * Check for unreachable nodes
     */
    private static checkReachability;

/**
 * Utility function for easy validation
 */
export declare function validateFormat(content: string): ValidationResult;
/**
 * Check if content is valid (no errors)
 */
export declare function isValidFormat(content: string): boolean;
//# sourceMappingURL=validator.d.ts.map
}