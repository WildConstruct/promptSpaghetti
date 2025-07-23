/**
 * Security Validation Framework
 * Provides secure validation utilities for user inputs
 *
 * Addresses DEBT-001, DEBT-002, DEBT-003 security vulnerabilities
 */
import { z } from 'zod';
// Alphanumeric validation pattern for variable names (includes underscore and dash)
export const VARIABLE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const VARIABLE_NAME_MAX_LENGTH = 64;
// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
    // JavaScript injection patterns
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /constructor/gi,
    /prototype/gi,
    /__proto__/gi,
    /\.__defineGetter__/gi,
    /\.__defineSetter__/gi,
    /\.__lookupGetter__/gi,
    /\.__lookupSetter__/gi,
    // Node.js specific patterns
    /require\s*\(/gi,
    /import\s*\(/gi,
    /process\./gi,
    /global\./gi,
    /Buffer\./gi,
    // ES6 and template literals
    /`.*\$\{.*\}/gi,
    /\$\{.*\}/gi,
    /`/gi,
    /new\s+Function/gi,
    /=>.*\{/gi,
    /\bwith\s*\(/gi,
    /\bBuffer\b/gi,
    // DOM manipulation (for browser safety)
    /document\./gi,
    /window\./gi,
    /location\./gi,
    /history\./gi,
    /navigator\./gi,
    // Filesystem and system access
    /fs\./gi,
    /path\./gi,
    /os\./gi,
    /child_process/gi,
    /cluster/gi,
    /crypto/gi,
    /http/gi,
    /https/gi,
    /net/gi,
    /url/gi,
    /util/gi,
    /vm/gi,
    /worker_threads/gi
];
// Safe expression patterns for conditionals
const SAFE_EXPRESSION_PATTERNS = [
    // Basic operators
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, // Simple variable names
    /^[a-zA-Z0-9_$\s\.\[\]]+$/, // Property access
    /^[a-zA-Z0-9_$\s\.\[\]===!==<>=+\-*\/&&\|\|!()]+$/ // Basic expressions
];
// Allowed operators and keywords in expressions
const ALLOWED_OPERATORS = [
    '===', '!==', '==', '!=', '<', '>', '<=', '>=',
    '+', '-', '*', '/', '%',
    '&&', '||', '!',
    '(', ')', '[', ']', '.',
    'true', 'false', 'null', 'undefined'
];
// Allowed functions in expressions
const ALLOWED_FUNCTIONS = [
    'startsWith', 'endsWith', 'includes', 'indexOf', 'lastIndexOf',
    'toLowerCase', 'toUpperCase', 'trim', 'replace',
    'substring', 'substr', 'slice', 'split', 'join',
    'length', 'toString', 'valueOf',
    'Math.abs', 'Math.max', 'Math.min', 'Math.floor', 'Math.ceil', 'Math.round',
    'parseFloat', 'parseInt', 'isNaN', 'isFinite',
    'Array.isArray', 'Object.keys', 'Object.values', 'Object.entries',
    'JSON.stringify', 'JSON.parse'
];
/**
 * Security validation utilities
 */
export class SecurityValidation {
    /**
     * Validates that a string doesn't contain dangerous patterns
     */
    static validateSafeString(value) {
        if (typeof value !== 'string')
            return false;
        // Check against dangerous patterns
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(value)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Validates that an expression is safe to evaluate
     */
    static validateSafeExpression(expression) {
        if (typeof expression !== 'string')
            return false;
        if (expression.length === 0)
            return true;
        if (expression.length > 500)
            return false; // Prevent DoS via long expressions
        // Check against dangerous patterns first
        if (!SecurityValidation.validateSafeString(expression)) {
            return false;
        }
        // Additional expression-specific validation
        const dangerousExpressionPatterns = [
            /function\s*\(/gi,
            /=\s*>/gi,
            /\bthis\b/gi,
            /\bself\b/gi,
            /\btop\b/gi,
            /\bparent\b/gi,
            /\bframes\b/gi,
            /\balert\b/gi,
            /\bconfirm\b/gi,
            /\bprompt\b/gi,
            /\bsetTimeout\b/gi,
            /\bsetInterval\b/gi,
            /\bsetImmediate\b/gi,
            /\brequestAnimationFrame\b/gi,
            /\bwebkitRequestAnimationFrame\b/gi,
            /\bmozRequestAnimationFrame\b/gi,
            /\bmsRequestAnimationFrame\b/gi,
            /\boRequestAnimationFrame\b/gi
        ];
        for (const pattern of dangerousExpressionPatterns) {
            if (pattern.test(expression)) {
                return false;
            }
        }
        // Check if expression contains only allowed patterns
        const basicSafePattern = /^[a-zA-Z0-9_$\s\.\[\]()===!==<>=+\-*\/&&\|\|!'"]+$/;
        if (!basicSafePattern.test(expression)) {
            return false;
        }
        return true;
    }
    /**
     * Validates that a variable name is safe for SetVariable nodes
     * - Must be alphanumeric with underscore and dash only
     * - Must not exceed 64 characters
     * - Must not use reserved keywords or dangerous patterns
     */
    static validateVariableName(name) {
        if (typeof name !== 'string')
            return false;
        if (name.length === 0)
            return false;
        if (name.length > VARIABLE_NAME_MAX_LENGTH)
            return false;
        // Check alphanumeric pattern first
        if (!VARIABLE_NAME_PATTERN.test(name)) {
            return false;
        }
        // Then check for dangerous patterns using the general property key validation
        return SecurityValidation.validateSafePropertyKey(name);
    }
    /**
     * Validates that a property key is safe for object access
     */
    static validateSafePropertyKey(key) {
        if (typeof key !== 'string')
            return false;
        if (key.length === 0)
            return false;
        if (key.length > VARIABLE_NAME_MAX_LENGTH)
            return false; // Limit to 64 chars as per security requirements
        // Dangerous property names
        const dangerousProperties = [
            '__proto__',
            'constructor',
            'prototype',
            '__defineGetter__',
            '__defineSetter__',
            '__lookupGetter__',
            '__lookupSetter__',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toLocaleString',
            'toString',
            'valueOf',
            'eval',
            'Function'
        ];
        if (dangerousProperties.includes(key)) {
            return false;
        }
        // Check for prototype pollution attempts
        if (key.includes('__proto__') || key.includes('constructor') || key.includes('prototype')) {
            return false;
        }
        // Only allow alphanumeric, underscore, and dash
        if (!VARIABLE_NAME_PATTERN.test(key)) {
            return false;
        }
        return true;
    }
    /**
     * Validates that a value is safe for storage/processing
     */
    static validateSafeValue(value) {
        if (value === null || value === undefined)
            return true;
        // Check primitive types
        if (typeof value === 'string') {
            return SecurityValidation.validateSafeString(value) && value.length <= 10000;
        }
        if (typeof value === 'number') {
            return isFinite(value) && !isNaN(value);
        }
        if (typeof value === 'boolean') {
            return true;
        }
        // Check arrays
        if (Array.isArray(value)) {
            if (value.length > 1000)
                return false; // Prevent DoS via large arrays
            return value.every(item => SecurityValidation.validateSafeValue(item));
        }
        // Check objects
        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length > 100)
                return false; // Prevent DoS via large objects
            // Validate all keys and values
            for (const key of keys) {
                if (!SecurityValidation.validateSafePropertyKey(key))
                    return false;
                if (!SecurityValidation.validateSafeValue(value[key]))
                    return false;
            }
            return true;
        }
        // Reject functions and other types
        return false;
    }
    /**
     * Sanitizes a string by removing dangerous content
     */
    static sanitizeString(value) {
        if (typeof value !== 'string')
            return '';
        // Remove dangerous patterns
        let sanitized = value;
        for (const pattern of DANGEROUS_PATTERNS) {
            sanitized = sanitized.replace(pattern, '');
        }
        // Trim and limit length
        sanitized = sanitized.trim();
        if (sanitized.length > 10000) {
            sanitized = sanitized.substring(0, 10000);
        }
        return sanitized;
    }
    /**
     * Creates a safe property accessor that validates keys
     */
    static safePropertyAccess(obj, key, fallback = null) {
        if (!obj || typeof obj !== 'object') {
            return fallback;
        }
        if (!SecurityValidation.validateSafePropertyKey(key)) {
            return fallback;
        }
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            return fallback;
        }
        return obj[key];
    }
}
/**
 * Secure Zod validation schemas
 */
export const SecureValidation = {
    /**
     * Safe string validation with pattern checking
     */
    safeString: (maxLength = 10000) => z.string()
        .max(maxLength, `String must be no longer than ${maxLength} characters`)
        .refine((val) => SecurityValidation.validateSafeString(val), { message: 'String contains dangerous patterns' }),
    /**
     * Safe expression validation for conditionals
     */
    safeExpression: (maxLength = 500) => z.string()
        .max(maxLength, `Expression must be no longer than ${maxLength} characters`)
        .refine((val) => SecurityValidation.validateSafeExpression(val), { message: 'Expression contains unsafe patterns' }),
    /**
     * Safe property key validation
     */
    safePropertyKey: (maxLength = 64) => z.string()
        .max(maxLength, `Property key must be no longer than ${maxLength} characters`)
        .refine((val) => SecurityValidation.validateSafePropertyKey(val), { message: 'Property key contains dangerous patterns' }),
    /**
     * Variable name validation for SetVariable nodes
     * Enforces strict alphanumeric pattern with 64 character limit
     */
    variableName: () => z.string()
        .min(1, 'Variable name cannot be empty')
        .max(VARIABLE_NAME_MAX_LENGTH, `Variable name must be no longer than ${VARIABLE_NAME_MAX_LENGTH} characters`)
        .regex(VARIABLE_NAME_PATTERN, 'Variable name must contain only letters, numbers, underscore, or dash')
        .refine((val) => SecurityValidation.validateVariableName(val), { message: 'Variable name contains reserved keywords or dangerous patterns' }),
    /**
     * Safe value validation for variables
     */
    safeValue: () => z.union([
        z.string().max(10000).refine((val) => SecurityValidation.validateSafeString(val), { message: 'String value contains dangerous patterns' }),
        z.number().finite().refine((val) => !isNaN(val), { message: 'Number value must be finite' }),
        z.boolean(),
        z.array(z.string().max(1000)).max(1000).refine((val) => val.every(item => SecurityValidation.validateSafeString(item)), { message: 'Array contains dangerous values' }),
        z.record(z.string().max(1000)).refine((val) => {
            const keys = Object.keys(val);
            if (keys.length > 100)
                return false;
            return keys.every(key => SecurityValidation.validateSafePropertyKey(key)) &&
                Object.values(val).every(value => SecurityValidation.validateSafeString(value));
        }, { message: 'Object contains dangerous keys or values' }),
        z.null(),
        z.undefined()
    ]),
    /**
     * Safe array validation
     */
    safeArray: (itemSchema, maxLength = 1000) => z.array(itemSchema)
        .max(maxLength, `Array must contain no more than ${maxLength} items`),
    /**
     * Safe object validation
     */
    safeObject: (valueSchema, maxKeys = 100) => z.record(valueSchema)
        .refine((val) => Object.keys(val).length <= maxKeys, { message: `Object must contain no more than ${maxKeys} properties` })
        .refine((val) => Object.keys(val).every(key => SecurityValidation.validateSafePropertyKey(key)), { message: 'Object contains dangerous property keys' })
};
/**
 * Security testing utilities
 */
export class SecurityTesting {
    /**
     * Test if validation properly blocks injection attempts
     */
    static testInjectionProtection(validator, testName = 'Unknown') {
        let passed = 0;
        let failed = 0;
        const failedPatterns = [];
        for (const pattern of this.INJECTION_PATTERNS) {
            const isBlocked = !validator(pattern);
            if (isBlocked) {
                passed++;
            }
            else {
                failed++;
                failedPatterns.push(pattern);
            }
        }
        console.log(`Security Test [${testName}]: ${passed} passed, ${failed} failed`);
        if (failed > 0) {
            console.warn('Failed patterns:', failedPatterns);
        }
        return { passed, failed, failedPatterns };
    }
    /**
     * Run comprehensive security tests
     */
    static runSecurityTests() {
        console.log('🔐 Running Security Validation Tests...');
        const stringTest = this.testInjectionProtection(SecurityValidation.validateSafeString, 'Safe String Validation');
        const expressionTest = this.testInjectionProtection(SecurityValidation.validateSafeExpression, 'Safe Expression Validation');
        const keyTest = this.testInjectionProtection(SecurityValidation.validateSafePropertyKey, 'Safe Property Key Validation');
        const totalPassed = stringTest.passed + expressionTest.passed + keyTest.passed;
        const totalFailed = stringTest.failed + expressionTest.failed + keyTest.failed;
        console.log(`🔐 Security Tests Complete: ${totalPassed} passed, ${totalFailed} failed`);
        return totalFailed === 0;
    }
}
/**
 * Common injection attack patterns for testing
 */
SecurityTesting.INJECTION_PATTERNS = [
    'eval("alert(1)")',
    'constructor.constructor("alert(1)")()',
    '__proto__.polluted = true',
    'prototype.polluted = true',
    'this.constructor.constructor("alert(1)")()',
    'Function("alert(1)")()',
    '(() => { alert(1); })()',
    '`${alert(1)}`',
    'document.cookie',
    'window.location',
    'require("fs")',
    'import("fs")',
    'process.exit()',
    'global.process',
    'Buffer.from("test")'
];
export default SecurityValidation;
