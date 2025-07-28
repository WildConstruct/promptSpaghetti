/**
 * Enhanced safe expression evaluator with AST node filtering
 */
export declare class SafeExpressionEvaluator {
    private static astFilter;
    /**
     * Evaluate an expression safely with a given context and enhanced security filtering
     */
    static evaluate(expression: string, context: Record<string, any>): unknown;
    /**
     * Parse expression using acorn with security validation
     */
    private static parseExpressionWithAcorn;
    /**
     * Validate AST nodes against security whitelist
     */
    private static validateASTSecurity;
    private static evaluateAST;
    private static isSafeFunction;
    /**
     * Create a safe evaluation context with restricted Math functions
     */
    static createSafeContext(variables?: Record<string, any>): Record<string, any>;
    /**
     * Get Math function audit log
     */
    static getMathAuditLog(): unknown[];
    /**
     * Clear Math function audit log
     */
    static clearMathAuditLog(): void;

//# sourceMappingURL=expression-evaluator.d.ts.map