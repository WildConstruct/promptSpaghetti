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
//# sourceMappingURL=safe-math-context.d.ts.map