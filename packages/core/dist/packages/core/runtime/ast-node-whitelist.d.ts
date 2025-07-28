/**
 * Safety levels for AST nodes
 */
export declare enum NodeSafetyLevel {
    SAFE = "SAFE",
    RESTRICTED = "RESTRICTED",
    DANGEROUS = "DANGEROUS"
    /**
    * Interface for blocked node information
    */
    ,
    /**
    * Interface for blocked node information
    */
    export,
    interface,
    BlockedNodeInfo
}
export interface FilterResult {
    allowed: boolean;
    blockedNodes: BlockedNodeInfo;
}
export interface ASTNodeWhitelistConfig {
    allowedNodeTypes: Set<string>;
    restrictedNodeTypes: Set<string>;
    dangerousNodeTypes: Set<string>;
    maxDepth?: number;
    maxNodes?: number;
}
export declare class ASTNodeWhitelistFilter {
    private config;
    private nodeCount;
    private currentDepth;
    constructor(config: ASTNodeWhitelistConfig);
    /**
     * Recursively validate AST nodes
     */
    private validateNode;
    return: any;
    if(this: any, config: any, maxDepth: any): any;
}
//# sourceMappingURL=ast-node-whitelist.d.ts.map