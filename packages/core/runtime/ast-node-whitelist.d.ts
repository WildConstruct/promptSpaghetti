import * as acorn from 'acorn';
/**
 * Safety levels for AST nodes
 */
export declare enum NodeSafetyLevel {
    SAFE = "SAFE",
    RESTRICTED = "RESTRICTED",
    DANGEROUS = "DANGEROUS"
}
/**
 * Interface for blocked node information
 */
export interface BlockedNodeInfo {
    nodeType: string;
    safetyLevel: NodeSafetyLevel;
    reason: string;
    position?: acorn.Position;
}
/**
 * Filter result interface
 */
export interface FilterResult {
    allowed: boolean;
    blockedNodes: BlockedNodeInfo[];
}
/**
 * AST node whitelist filter configuration
 */
export interface ASTNodeWhitelistConfig {
    allowedNodeTypes: Set<string>;
    restrictedNodeTypes: Set<string>;
    dangerousNodeTypes: Set<string>;
    maxDepth?: number;
    maxNodes?: number;
}
/**
 * AST node whitelist filter for security validation
 */
export declare class ASTNodeWhitelistFilter {
    private config;
    private nodeCount;
    private currentDepth;
    constructor(config: ASTNodeWhitelistConfig);
    /**
     * Filter an AST and return validation result
     */
    filterAST(ast: acorn.Node): FilterResult;
    /**
     * Recursively validate AST nodes
     */
    private validateNode;
    /**
     * Validate specific node types with custom rules
     */
    private validateSpecificNodeType;
    /**
     * Validate identifier nodes for dangerous names
     */
    private validateIdentifier;
    /**
     * Validate member expression for dangerous property access
     */
    private validateMemberExpression;
    /**
     * Validate call expressions
     */
    private validateCallExpression;
    /**
     * Validate literal values
     */
    private validateLiteral;
    /**
     * Recursively validate child nodes
     */
    private validateChildNodes;
}
/**
 * Create a filter configuration specifically for Conditional nodes
 */
export declare function createConditionalNodeFilter(): ASTNodeWhitelistFilter;
/**
 * Create a more permissive filter for general expression evaluation
 */
export declare function createGeneralExpressionFilter(): ASTNodeWhitelistFilter;
//# sourceMappingURL=ast-node-whitelist.d.ts.map