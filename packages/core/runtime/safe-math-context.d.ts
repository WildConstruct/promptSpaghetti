/**
 * Safe Math Context for Expression Evaluation
 *
 * This module provides a restricted Math object that only exposes
 * safe mathematical functions for use in conditional expressions.
 *
 * Security Features:
 * - Limited subset of Math functions (no random, no crypto)
 * - Input validation for all functions
 * - Range checking to prevent numeric overflow
 * - NaN and Infinity handling
 * - No access to Math constructor or prototype
 *
 * Addresses P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002)
 */
/**
 * Safe Math functions whitelist
 * Only deterministic, side-effect-free functions are allowed
 */
export declare const SAFE_MATH_FUNCTIONS: readonly ["min", "max", "floor", "ceil", "round", "abs", "sign", "trunc"];
/**
 * Explicitly blocked Math functions for security
 */
export declare const BLOCKED_MATH_FUNCTIONS: readonly ["random", "pow", "exp", "sqrt", "log", "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "sinh", "cosh", "tanh", "asinh", "acosh", "atanh", "cbrt", "clz32", "expm1", "fround", "hypot", "imul", "log10", "log1p", "log2"];
/**
 * Type for safe Math function names
 */
export type SafeMathFunction = typeof SAFE_MATH_FUNCTIONS[number];
/**
 * Type for blocked Math function names
 */
export type BlockedMathFunction = typeof BLOCKED_MATH_FUNCTIONS[number];
/**
 * Numeric limits for safe evaluation
 */
export declare const NUMERIC_LIMITS: {
    readonly MAX_SAFE_VALUE: number;
    readonly MIN_SAFE_VALUE: number;
    readonly MAX_ARRAY_LENGTH: 1000;
    readonly MAX_DECIMAL_PLACES: 10;
};
/**
 * Creates a safe Math context object
 */
export declare function createSafeMathContext(): Record<string, any>;
/**
 * Validates that a Math function call is safe
 */
export declare function validateMathFunctionCall(functionName: string): boolean;
/**
 * Security audit for Math function usage
 */
export interface MathFunctionAudit {
    functionName: string;
    allowed: boolean;
    reason: string;
    timestamp: number;
    context?: string;
}
/**
 * Math function security auditor
 */
export declare class MathFunctionAuditor {
    private static auditLog;
    private static readonly MAX_AUDIT_ENTRIES;
    static logAttempt(functionName: string, allowed: boolean, reason: string, context?: string): void;
    static getAuditLog(): MathFunctionAudit[];
    static clearAuditLog(): void;
    static getBlockedAttempts(): MathFunctionAudit[];
    static getSummary(): Record<string, number>;
}
/**
 * Enhanced safe Math context with auditing
 */
export declare function createAuditedSafeMathContext(contextName?: string): Record<string, any>;
/**
 * Utility to check if a value is within safe numeric range
 */
export declare function isInSafeRange(value: number): boolean;
/**
 * Utility to safely coerce a value to number
 */
export declare function safeNumberCoercion(value: Error): number;
export default createSafeMathContext;
//# sourceMappingURL=safe-math-context.d.ts.map