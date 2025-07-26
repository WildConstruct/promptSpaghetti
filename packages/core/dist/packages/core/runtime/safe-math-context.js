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
import { securityAudit, SecuritySeverity, SecurityEventCategory } from './security-audit-logger';
/**
 * Safe Math functions whitelist
 * Only deterministic, side-effect-free functions are allowed
 */
export const SAFE_MATH_FUNCTIONS = [
    'min',
    'max',
    'floor',
    'ceil',
    'round',
    'abs',
    'sign',
    'trunc'
];
/**
 * Explicitly blocked Math functions for security
 */
export const BLOCKED_MATH_FUNCTIONS = [
    'random', // Non-deterministic
    'pow', // Can cause DoS with large exponents
    'exp', // Can cause overflow
    'sqrt', // Can be used for timing attacks
    'log', // Can be used for timing attacks
    'sin', // Trigonometric functions not needed
    'cos', // Trigonometric functions not needed
    'tan', // Trigonometric functions not needed
    'asin', // Inverse trig not needed
    'acos', // Inverse trig not needed
    'atan', // Inverse trig not needed
    'atan2', // Not needed for basic comparisons
    'sinh', // Hyperbolic functions not needed
    'cosh', // Hyperbolic functions not needed
    'tanh', // Hyperbolic functions not needed
    'asinh', // Hyperbolic functions not needed
    'acosh', // Hyperbolic functions not needed
    'atanh', // Hyperbolic functions not needed
    'cbrt', // Cube root not needed
    'clz32', // Bit operations not needed
    'expm1', // Advanced math not needed
    'fround', // Float rounding not needed
    'hypot', // Not needed for basic math
    'imul', // Integer multiplication not needed
    'log10', // Logarithms not needed
    'log1p', // Logarithms not needed
    'log2' // Logarithms not needed
];
/**
 * Numeric limits for safe evaluation
 */
export const NUMERIC_LIMITS = {
    MAX_SAFE_VALUE: Number.MAX_SAFE_INTEGER,
    MIN_SAFE_VALUE: Number.MIN_SAFE_INTEGER,
    MAX_ARRAY_LENGTH: 1000,
    MAX_DECIMAL_PLACES: 10
};
/**
 * Validates numeric input for safety
 */
function validateNumericInput(value, functionName) {
    // Type check
    if (typeof value !== 'number') {
        const error = `Math.${functionName} expects a number, got ${typeof value}`;
        securityAudit.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_VALIDATION_FAILED, error, { functionName, additionalData: { valueType: typeof value } }, true);
        throw new TypeError(error);
    }
    // NaN check
    if (isNaN(value)) {
        const error = `Math.${functionName} received NaN`;
        securityAudit.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_VALIDATION_FAILED, error, { functionName }, true);
        throw new Error(error);
    }
    // Infinity check
    if (!isFinite(value)) {
        const error = `Math.${functionName} received Infinity`;
        securityAudit.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_VALIDATION_FAILED, error, { functionName }, true);
        throw new Error(error);
    }
    // Range check
    if (value > NUMERIC_LIMITS.MAX_SAFE_VALUE || value < NUMERIC_LIMITS.MIN_SAFE_VALUE) {
        const error = `Math.${functionName} value out of safe range`;
        securityAudit.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.MATH_VALIDATION_FAILED, error, { functionName, additionalData: { value } }, true);
        throw new RangeError(error);
    }
    return value;
}
/**
 * Validates array of numeric inputs
 */
function validateNumericArray(values, functionName) {
    if (!Array.isArray(values)) {
        throw new TypeError(`Math.${functionName} expects arguments, got ${typeof values}`);
    }
    if (values.length === 0) {
        throw new Error(`Math.${functionName} requires at least one argument`);
    }
    if (values.length > NUMERIC_LIMITS.MAX_ARRAY_LENGTH) {
        throw new Error(`Math.${functionName} too many arguments (max ${NUMERIC_LIMITS.MAX_ARRAY_LENGTH})`);
    }
    return values.map(v => validateNumericInput(v, functionName));
}
/**
 * Safe implementation of Math.min
 */
function safeMin(...values) {
    const validated = validateNumericArray(values, 'min');
    return Math.min(...validated);
}
/**
 * Safe implementation of Math.max
 */
function safeMax(...values) {
    const validated = validateNumericArray(values, 'max');
    return Math.max(...validated);
}
/**
 * Safe implementation of Math.floor
 */
function safeFloor(value) {
    const validated = validateNumericInput(value, 'floor');
    return Math.floor(validated);
}
/**
 * Safe implementation of Math.ceil
 */
function safeCeil(value) {
    const validated = validateNumericInput(value, 'ceil');
    return Math.ceil(validated);
}
/**
 * Safe implementation of Math.round
 */
function safeRound(value) {
    const validated = validateNumericInput(value, 'round');
    return Math.round(validated);
}
/**
 * Safe implementation of Math.abs
 */
function safeAbs(value) {
    const validated = validateNumericInput(value, 'abs');
    return Math.abs(validated);
}
/**
 * Safe implementation of Math.sign
 */
function safeSign(value) {
    const validated = validateNumericInput(value, 'sign');
    return Math.sign(validated);
}
/**
 * Safe implementation of Math.trunc
 */
function safeTrunc(value) {
    const validated = validateNumericInput(value, 'trunc');
    return Math.trunc(validated);
}
/**
 * Creates a safe Math context object
 */
export function createSafeMathContext() {
    // Create object without prototype to prevent prototype pollution
    const safeMath = Object.create(null);
    // Add safe functions
    safeMath.min = safeMin;
    safeMath.max = safeMax;
    safeMath.floor = safeFloor;
    safeMath.ceil = safeCeil;
    safeMath.round = safeRound;
    safeMath.abs = safeAbs;
    safeMath.sign = safeSign;
    safeMath.trunc = safeTrunc;
    // Add safe constants (read-only)
    Object.defineProperty(safeMath, 'PI', {
        value: Math.PI,
        writable: false,
        enumerable: true,
        configurable: false
    });
    Object.defineProperty(safeMath, 'E', {
        value: Math.E,
        writable: false,
        enumerable: true,
        configurable: false
    });
    // Seal the object to prevent modifications
    Object.seal(safeMath);
    return safeMath;
}
/**
 * Validates that a Math function call is safe
 */
export function validateMathFunctionCall(functionName) {
    // Check if it's explicitly allowed
    if (SAFE_MATH_FUNCTIONS.includes(functionName)) {
        return true;
    }
    // Check if it's explicitly blocked
    if (BLOCKED_MATH_FUNCTIONS.includes(functionName)) {
        return false;
    }
    // Unknown functions are blocked by default
    return false;
}
/**
 * Math function security auditor
 */
export class MathFunctionAuditor {
    static auditLog = [];
    static MAX_AUDIT_ENTRIES = 1000;
    static logAttempt(functionName, allowed, reason, context) {
        const audit = {
            functionName,
            allowed,
            reason,
            timestamp: Date.now(),
            context
        };
        this.auditLog.push(audit);
        // Prevent memory leaks
        if (this.auditLog.length > this.MAX_AUDIT_ENTRIES) {
            this.auditLog = this.auditLog.slice(-this.MAX_AUDIT_ENTRIES);
        }
        // Log to centralized security audit
        if (allowed) {
            securityAudit.logEvent(SecuritySeverity.INFO, SecurityEventCategory.MATH_FUNCTION_ALLOWED, `Math.${functionName} accessed`, { functionName, additionalData: { context } }, false);
        }
        else {
            securityAudit.logMathFunctionBlocked(functionName, reason, {
                additionalData: { context }
            });
        }
    }
    static getAuditLog() {
        return [...this.auditLog];
    }
    static clearAuditLog() {
        this.auditLog = [];
    }
    static getBlockedAttempts() {
        return this.auditLog.filter(entry => !entry.allowed);
    }
    static getSummary() {
        const summary = {};
        for (const entry of this.auditLog) {
            const key = `${entry.functionName}:${entry.allowed ? 'allowed' : 'blocked'}`;
            summary[key] = (summary[key] || 0) + 1;
        }
        return summary;
    }
}
/**
 * Enhanced safe Math context with auditing
 */
export function createAuditedSafeMathContext(contextName = 'default') {
    const safeMath = createSafeMathContext();
    // Create a proxy to intercept all property access
    return new Proxy(safeMath, {
        get(target, prop, receiver) {
            const propName = String(prop);
            // Check if it's a function access
            if (propName in target) {
                MathFunctionAuditor.logAttempt(propName, true, 'Safe function accessed', contextName);
                return Reflect.get(target, prop, receiver);
            }
            // Check if it's a blocked function
            if (BLOCKED_MATH_FUNCTIONS.includes(propName)) {
                MathFunctionAuditor.logAttempt(propName, false, 'Blocked function access attempted', contextName);
                throw new Error(`Math.${propName} is not allowed for security reasons`);
            }
            // Unknown property access
            MathFunctionAuditor.logAttempt(propName, false, 'Unknown Math property accessed', contextName);
            throw new Error(`Math.${propName} is not available`);
        },
        set(target, prop, value) {
            const propName = String(prop);
            MathFunctionAuditor.logAttempt(propName, false, 'Attempt to modify Math object', contextName);
            throw new Error('Cannot modify Math object');
        },
        deleteProperty(target, prop) {
            const propName = String(prop);
            MathFunctionAuditor.logAttempt(propName, false, 'Attempt to delete Math property', contextName);
            throw new Error('Cannot delete Math properties');
        }
    });
}
/**
 * Utility to check if a value is within safe numeric range
 */
export function isInSafeRange(value) {
    return (typeof value === 'number' &&
        !isNaN(value) &&
        isFinite(value) &&
        value >= NUMERIC_LIMITS.MIN_SAFE_VALUE &&
        value <= NUMERIC_LIMITS.MAX_SAFE_VALUE);
}
/**
 * Utility to safely coerce a value to number
 */
export function safeNumberCoercion(value) {
    // Strict number check
    if (typeof value === 'number') {
        return validateNumericInput(value, 'coercion');
    }
    // Boolean to number
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    // String to number (strict parsing)
    if (typeof value === 'string') {
        const trimmed = value.trim();
        // Empty string is not a valid number
        if (trimmed === '') {
            throw new Error('Cannot convert empty string to number');
        }
        // Use Number() for strict parsing
        const parsed = Number(trimmed);
        // Check if parsing succeeded
        if (isNaN(parsed)) {
            throw new Error(`Cannot convert "${value}" to number`);
        }
        return validateNumericInput(parsed, 'coercion');
    }
    // All other types are rejected
    throw new TypeError(`Cannot convert ${typeof value} to number`);
}
export default createSafeMathContext;
