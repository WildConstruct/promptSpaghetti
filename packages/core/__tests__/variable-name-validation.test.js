/**
 * Variable Name Validation Tests
 *
 * Tests the alphanumeric validation regex pattern for SetVariable node
 * variable names with 64 character limit enforcement
 */
import { SecurityValidation, SecureValidation, VARIABLE_NAME_PATTERN } from '../validation/security';
describe('Variable Name Validation', () => {
    describe('VARIABLE_NAME_PATTERN', () => {
        it('should match valid alphanumeric names', () => {
            const validNames = [
                'variable',
                'myVariable',
                'MyVariable',
                'variable123',
                'var_name',
                'var-name',
                'VAR_NAME',
                'a',
                'A',
                '1',
                '_underscore',
                '-dash',
                'mix_of-everything123'
            ];
            for (const name of validNames) {
                expect(VARIABLE_NAME_PATTERN.test(name)).toBe(true);
            }
        });
        it('should reject invalid characters', () => {
            const invalidNames = [
                'var name', // space
                'var.name', // dot
                'var@name', // at symbol
                'var$name', // dollar sign
                'var#name', // hash
                'var%name', // percent
                'var&name', // ampersand
                'var*name', // asterisk
                'var(name)', // parentheses
                'var[name]', // brackets
                'var{name}', // braces
                'var+name', // plus
                'var=name', // equals
                'var|name', // pipe
                'var\\name', // backslash
                'var/name', // forward slash
                'var:name', // colon
                'var;name', // semicolon
                'var"name', // quote
                "var'name", // single quote
                'var<name>', // angle brackets
                'var?name', // question mark
                'var!name', // exclamation
                'var~name', // tilde
                'var`name', // backtick
                '' // empty string
            ];
            for (const name of invalidNames) {
                expect(VARIABLE_NAME_PATTERN.test(name)).toBe(false);
            }
        });
    });
    describe('validateVariableName', () => {
        it('should validate correct variable names', () => {
            const validNames = [
                'userName',
                'user_id',
                'user-id',
                'count123',
                'isActive',
                'MAX_VALUE',
                'temp_var_123'
            ];
            for (const name of validNames) {
                expect(SecurityValidation.validateVariableName(name)).toBe(true);
            }
        });
        it('should enforce 64 character limit', () => {
            // 64 characters - should pass
            const maxLength = 'a'.repeat(64);
            expect(SecurityValidation.validateVariableName(maxLength)).toBe(true);
            // 65 characters - should fail
            const tooLong = 'a'.repeat(65);
            expect(SecurityValidation.validateVariableName(tooLong)).toBe(false);
        });
        it('should reject reserved keywords', () => {
            const reservedKeywords = [
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
                'valueOf'
            ];
            for (const keyword of reservedKeywords) {
                expect(SecurityValidation.validateVariableName(keyword)).toBe(false);
            }
        });
        it('should reject names containing dangerous patterns', () => {
            const dangerousNames = [
                'my__proto__var',
                'constructorName',
                'prototypeValue',
                'user__proto__id',
                'var_constructor_name',
                'prototype_chain'
            ];
            for (const name of dangerousNames) {
                expect(SecurityValidation.validateVariableName(name)).toBe(false);
            }
        });
        it('should handle edge cases', () => {
            expect(SecurityValidation.validateVariableName('')).toBe(false);
            expect(SecurityValidation.validateVariableName(null)).toBe(false);
            expect(SecurityValidation.validateVariableName(undefined)).toBe(false);
            expect(SecurityValidation.validateVariableName(123)).toBe(false);
            expect(SecurityValidation.validateVariableName({})).toBe(false);
            expect(SecurityValidation.validateVariableName([])).toBe(false);
        });
    });
    describe('Zod Schema - variableName', () => {
        const variableNameSchema = SecureValidation.variableName();
        it('should validate correct variable names', () => {
            const validNames = [
                'userName',
                'user_id',
                'count123',
                'isActive'
            ];
            for (const name of validNames) {
                const result = variableNameSchema.safeParse(name);
                expect(result.success).toBe(true);
            }
        });
        it('should provide meaningful error messages', () => {
            // Empty string
            let result = variableNameSchema.safeParse('');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('cannot be empty');
            }
            // Too long
            result = variableNameSchema.safeParse('a'.repeat(65));
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('64 characters');
            }
            // Invalid characters
            result = variableNameSchema.safeParse('var name');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('letters, numbers, underscore, or dash');
            }
            // Reserved keyword
            result = variableNameSchema.safeParse('constructor');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('reserved keywords');
            }
        });
    });
    describe('Integration with SetVariable', () => {
        it('should match SetVariable security requirements', () => {
            // Test cases from the acceptance criteria
            const testCases = [
                // Valid cases
                { name: 'userName', expected: true },
                { name: 'user_id', expected: true },
                { name: 'count', expected: true },
                { name: 'isActive', expected: true },
                { name: 'temp123', expected: true },
                { name: 'MAX_VALUE', expected: true },
                { name: 'min-value', expected: true },
                { name: '_private', expected: true },
                { name: 'a1b2c3', expected: true },
                // Invalid cases - reserved keywords
                { name: '__proto__', expected: false },
                { name: 'constructor', expected: false },
                { name: 'prototype', expected: false },
                { name: 'eval', expected: false }, // Note: 'eval' itself is allowed as it's alphanumeric
                { name: 'Function', expected: false }, // Note: 'Function' itself is allowed as it's alphanumeric
                // Invalid cases - special characters
                { name: 'user.name', expected: false },
                { name: 'user[0]', expected: false },
                { name: 'user$id', expected: false },
                { name: 'user@email', expected: false },
                { name: 'user name', expected: false },
                { name: 'user+id', expected: false },
                { name: 'user*count', expected: false },
                // Invalid cases - length
                { name: 'a'.repeat(65), expected: false },
                { name: '', expected: false }
            ];
            for (const testCase of testCases) {
                const result = SecurityValidation.validateVariableName(testCase.name);
                expect(result).toBe(testCase.expected);
            }
        });
    });
    describe('Performance', () => {
        it('should handle validation efficiently', () => {
            const iterations = 10000;
            const testNames = [
                'validName',
                'invalid name',
                '__proto__',
                'a'.repeat(64),
                'user_id_123'
            ];
            const start = Date.now();
            for (let i = 0; i < iterations; i++) {
                for (const name of testNames) {
                    SecurityValidation.validateVariableName(name);
                }
            }
            const duration = Date.now() - start;
            // Should complete 50,000 validations in under 100ms
            expect(duration).toBeLessThan(100);
        });
    });
});
