"use strict";
/**
 * Security validation utilities for graph schemas
 * Provides Zod schema validators for secure input validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityValidation = void 0;
const zod_1 = require("zod");
class SecurityValidation {
    /**
     * Validates variable names to prevent prototype pollution and injection attacks
     * - Only alphanumeric characters and underscores allowed
     * - Cannot start with number
     * - Maximum 64 characters
     * - Blacklists dangerous property names
     */
    static variableName() {
        return zod_1.z.string().refine((name) => {
            // Basic format validation
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
                return false;
            }
            // Length limit
            if (name.length > 64) {
                return false;
            }
            // Dangerous property names
            const dangerous = [
                '__proto__', 'constructor', 'prototype',
                'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
                'toLocaleString', 'toString', 'valueOf'
            ];
            return !dangerous.includes(name.toLowerCase()) &&
                !name.includes('__proto__') &&
                !name.includes('constructor');
        }, {
            message: 'Variable name must be alphanumeric with underscores, max 64 chars, and not use dangerous property names'
        });
    }
    /**
     * Validates static variableName (for direct use)
     */
    static validateVariableName(name) {
        try {
            SecurityValidation.variableName().parse(name);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validates property keys for safe object access
     */
    static safePropertyKey() {
        return zod_1.z.string().refine((key) => {
            // Similar to variable name but allows dots for nested access
            if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(key)) {
                return false;
            }
            if (key.length > 128) {
                return false;
            }
            // Prevent dangerous property access
            return !key.includes('__proto__') &&
                !key.includes('constructor') &&
                !key.includes('prototype');
        }, {
            message: 'Property key must be safe and not access dangerous properties'
        });
    }
    /**
     * Validates safe string values (prevents script injection)
     */
    static safeString() {
        return zod_1.z.string().refine((str) => {
            // Prevent common script injection patterns
            const dangerousPatterns = [
                /<script/i,
                /javascript:/i,
                /vbscript:/i,
                /on\w+\s*=/i, // event handlers
                /eval\s*\(/i,
                /Function\s*\(/i,
                /setTimeout\s*\(/i,
                /setInterval\s*\(/i
            ];
            return !dangerousPatterns.some(pattern => pattern.test(str));
        }, {
            message: 'String contains potentially dangerous content'
        });
    }
    /**
     * Validates safe expressions for conditional nodes
     */
    static safeExpression() {
        return zod_1.z.string().refine((expr) => {
            // Basic length limit
            if (expr.length > 1000) {
                return false;
            }
            // Dangerous patterns in expressions
            const dangerousPatterns = [
                /eval\s*\(/i,
                /Function\s*\(/i,
                /constructor/i,
                /__proto__/i,
                /prototype/i,
                /import\s*\(/i,
                /require\s*\(/i,
                /process\s*\./i,
                /global\s*\./i,
                /window\s*\./i,
                /document\s*\./i,
                /console\s*\./i,
                /setTimeout/i,
                /setInterval/i,
                /fetch\s*\(/i,
                /XMLHttpRequest/i
            ];
            return !dangerousPatterns.some(pattern => pattern.test(expr));
        }, {
            message: 'Expression contains potentially dangerous code patterns'
        });
    }
    /**
     * Validates safe values (prevents object pollution)
     */
    static safeValue() {
        return zod_1.z.union([
            zod_1.z.string(),
            zod_1.z.number(),
            zod_1.z.boolean(),
            zod_1.z.null(),
            zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])),
            zod_1.z.record(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]))
        ]).refine((value) => {
            // Additional safety check for objects/arrays
            if (typeof value === 'object' && value !== null) {
                const jsonStr = JSON.stringify(value);
                // Check for dangerous property names in serialized form
                return !jsonStr.includes('__proto__') &&
                    !jsonStr.includes('constructor') &&
                    !jsonStr.includes('prototype');
            }
            return true;
        }, {
            message: 'Value contains dangerous property references'
        });
    }
    /**
     * Validates content length limits
     */
    static limitedString(maxLength = 10000) {
        return zod_1.z.string().max(maxLength, `String must be less than ${maxLength} characters`);
    }
    /**
     * Validates positive numbers
     */
    static positiveNumber() {
        return zod_1.z.number().positive('Number must be positive');
    }
    /**
     * Validates number within range
     */
    static rangeNumber(min, max) {
        return zod_1.z.number().min(min).max(max);
    }
}
exports.SecurityValidation = SecurityValidation;
