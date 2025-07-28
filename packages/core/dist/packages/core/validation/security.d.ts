export declare const VARIABLE_NAME_PATTERN: RegExp;
export declare const VARIABLE_NAME_MAX_LENGTH = 64;
/**
 * Security validation utilities
 */
export declare class SecurityValidation {
    /**
     * Validates that a string doesn't contain dangerous patterns
     */
    static validateSafeString(value: string): boolean;
    /**
     * Validates that an expression is safe to evaluate
     */
    static validateSafeExpression(expression: string): boolean;
    /**
     * Validates that a variable name is safe for SetVariable nodes
     * - Must be alphanumeric with underscore and dash only
     * - Must not exceed 64 characters
     * - Must not use reserved keywords or dangerous patterns
     */
    static validateVariableName(name: string): boolean;
    /**
     * Validates that a property key is safe for object access
     */
    static validateSafePropertyKey(key: string): boolean;
    /**
     * Validates that a value is safe for storage/processing
     */
    static validateSafeValue(value: any): boolean;
    /**
     * Sanitizes a string by removing dangerous content
     */
    static sanitizeString(value: string): string;
    /**
     * Creates a safe property accessor that validates keys
     */
    static safePropertyAccess(obj: any, key: string, fallback?: any): any;
}
/**
 * Security testing utilities
 */
export declare class SecurityTesting {
    /**
     * Common injection attack patterns for testing
     */
    static readonly INJECTION_PATTERNS: string[];
}
//# sourceMappingURL=security.d.ts.map