/**
 * Security Validation Framework
 * Provides secure validation utilities for user inputs
 *
 * Addresses DEBT-001, DEBT-002, DEBT-003 security vulnerabilities
 */
import { z } from 'zod';
export declare /**
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
 * Secure Zod validation schemas
 */
export declare     /**
     * Safe expression validation for conditionals
     */
    safeExpression: (maxLength?: number) => z.ZodEffects<z.ZodString, string, string>;
    /**
     * Safe property key validation
     */
    safePropertyKey: (maxLength?: number) => z.ZodEffects<z.ZodString, string, string>;
    /**
     * Variable name validation for SetVariable nodes
     * Enforces strict alphanumeric pattern with 64 character limit
     */
    variableName: () => z.ZodEffects<z.ZodString, string, string>;
    /**
     * Safe value validation for variables
     */
    safeValue: () => z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodNumber, number, number>, z.ZodBoolean, z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>, z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodNull, z.ZodUndefined]>;
    /**
     * Safe array validation
     */
    safeArray: <T>(itemSchema: z.ZodSchema<T>, maxLength?: number) => z.ZodArray<z.ZodType<T, z.ZodTypeDef, T>, "many">;
    /**
     * Safe object validation
     */
    safeObject: <T>(),
      valueSchema: z.ZodSchema<T>,
      maxKeys?: number
    ) => z.ZodEffects<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodType<T, z.ZodTypeDef, T>>, Record<string, T>, Record<string, T>>, Record<string, T>, Record<string, T>>;
};
/**
 * Security testing utilities
 */
export declare class SecurityTesting {
    /**
     * Common injection attack patterns for testing
     */
    static readonly INJECTION_PATTERNS: string[];
    /**
     * Test if validation properly blocks injection attempts
     */
    static testInjectionProtection(validator: (input: string) => boolean, testName?: string): {
        passed: number;
        failed: number;
        failedPatterns: string[];
    };
    /**
     * Run comprehensive security tests
     */
    static runSecurityTests(): boolean;
}
export default SecurityValidation;
//# sourceMappingURL=security.d.ts.map