/**
 * Password Complexity Validator Tests
 * Task: T-1752989143997-524 - Implement configurable password complexity rules
 * Comprehensive test suite for PasswordComplexityValidator
 */
import { PasswordComplexityValidator, PasswordRules } from '../auth/PasswordComplexityValidator';
describe('PasswordComplexityValidator', () => {
    let validator;
    beforeEach(() => {
        validator = new PasswordComplexityValidator();
    });
    describe('Configuration Management', () => {
        test('should initialize with default balanced configuration', () => {
            const config = validator.getConfig();
            expect(config.enabled).toBe(true);
            expect(config.mode).toBe('balanced');
            expect(config.minimumScore).toBe(70);
            expect(config.rules.length).toBeGreaterThan(0);
        });
        test('should allow custom configuration', () => {
            const customConfig = {
                mode: 'strict',
                minimumScore: 80,
                allowOverrides: {
                    enabled: true,
                    roles: ['admin'],
                    requireJustification: false
                }
            };
            const customValidator = new PasswordComplexityValidator(customConfig);
            const config = customValidator.getConfig();
            expect(config.mode).toBe('strict');
            expect(config.minimumScore).toBe(80);
            expect(config.allowOverrides?.enabled).toBe(true);
        });
        test('should validate configuration', () => {
            const validation = validator.validateConfig();
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
        test('should detect configuration errors', () => {
            validator.updateConfig({
                minimumScore: 150 // Invalid score > 100
            });
            const validation = validator.validateConfig();
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
    });
    describe('Basic Password Validation', () => {
        test('should validate strong password', async () => {
            const result = await validator.validatePassword('MyStr0ng!Pass');
            expect(result.valid).toBe(true);
            expect(result.score).toBeGreaterThan(70);
            expect(result.strength).toMatch(/good|strong|very-strong/);
            expect(result.errors).toHaveLength(0);
        });
        test('should reject weak password', async () => {
            const result = await validator.validatePassword('weak');
            expect(result.valid).toBe(false);
            expect(result.score).toBeLessThan(70);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        test('should provide helpful suggestions', async () => {
            const result = await validator.validatePassword('short');
            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.suggestions.some(s => s.includes('characters'))).toBe(true);
        });
        test('should return validation when disabled', async () => {
            validator.updateConfig({ enabled: false });
            const result = await validator.validatePassword('weak');
            expect(result.valid).toBe(true);
            expect(result.score).toBe(100);
        });
    });
    describe('Individual Rule Testing', () => {
        test('should validate minimum length rule', () => {
            const rule = PasswordRules.minLength(8);
            const shortResult = rule.validate('short');
            expect(shortResult.passed).toBe(false);
            expect(shortResult.score).toBe(0);
            expect(shortResult.message).toContain('too short');
            const longResult = rule.validate('longenough');
            expect(longResult.passed).toBe(true);
            expect(longResult.score).toBeGreaterThan(0);
        });
        test('should validate maximum length rule', () => {
            const rule = PasswordRules.maxLength(128);
            const normalResult = rule.validate('normal-length-password');
            expect(normalResult.passed).toBe(true);
            expect(normalResult.score).toBe(10);
            const longPassword = 'a'.repeat(200);
            const longResult = rule.validate(longPassword);
            expect(longResult.passed).toBe(false);
            expect(longResult.score).toBe(0);
        });
        test('should validate uppercase requirement', () => {
            const rule = PasswordRules.requireUppercase(1);
            const noUpperResult = rule.validate('lowercase');
            expect(noUpperResult.passed).toBe(false);
            const hasUpperResult = rule.validate('HasUpper');
            expect(hasUpperResult.passed).toBe(true);
        });
        test('should validate lowercase requirement', () => {
            const rule = PasswordRules.requireLowercase(1);
            const noLowerResult = rule.validate('UPPERCASE');
            expect(noLowerResult.passed).toBe(false);
            const hasLowerResult = rule.validate('hasLower');
            expect(hasLowerResult.passed).toBe(true);
        });
        test('should validate digit requirement', () => {
            const rule = PasswordRules.requireDigits(1);
            const noDigitsResult = rule.validate('NoDigits');
            expect(noDigitsResult.passed).toBe(false);
            const hasDigitsResult = rule.validate('Has1Digit');
            expect(hasDigitsResult.passed).toBe(true);
        });
        test('should validate special character requirement', () => {
            const rule = PasswordRules.requireSpecialChars(1);
            const noSpecialResult = rule.validate('NoSpecial');
            expect(noSpecialResult.passed).toBe(false);
            const hasSpecialResult = rule.validate('Has!Special');
            expect(hasSpecialResult.passed).toBe(true);
        });
        test('should validate consecutive identical characters', () => {
            const rule = PasswordRules.noConsecutiveIdentical(2);
            const consecutiveResult = rule.validate('aaa');
            expect(consecutiveResult.passed).toBe(false);
            const noConsecutiveResult = rule.validate('abc');
            expect(noConsecutiveResult.passed).toBe(true);
        });
        test('should validate common sequences', () => {
            const rule = PasswordRules.noCommonSequences();
            const sequenceResult = rule.validate('password123');
            expect(sequenceResult.passed).toBe(false);
            const qwertyResult = rule.validate('qwerty123');
            expect(qwertyResult.passed).toBe(false);
            const randomResult = rule.validate('x9k2m8n1');
            expect(randomResult.passed).toBe(true);
        });
        test('should validate personal information', () => {
            const rule = PasswordRules.noPersonalInfo();
            const context = {
                username: 'johndoe',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            };
            const personalResult = rule.validate('johndoe123', context);
            expect(personalResult.passed).toBe(false);
            const firstNameResult = rule.validate('john123', context);
            expect(firstNameResult.passed).toBe(false);
            const unrelatedResult = rule.validate('MyStr0ng!Pass', context);
            expect(unrelatedResult.passed).toBe(true);
        });
        test('should validate password history', () => {
            const rule = PasswordRules.notInHistory(5);
            const context = {
                previousPasswords: ['OldPass1!', 'OldPass2!', 'OldPass3!']
            };
            const reusedResult = rule.validate('OldPass1!', context);
            expect(reusedResult.passed).toBe(false);
            const newResult = rule.validate('NewPass1!', context);
            expect(newResult.passed).toBe(true);
        });
        test('should validate minimum entropy', () => {
            const rule = PasswordRules.minimumEntropy(40);
            const lowEntropyResult = rule.validate('aaaaaaaa');
            expect(lowEntropyResult.passed).toBe(false);
            const highEntropyResult = rule.validate('Tr7$mK9#nQ2@');
            expect(highEntropyResult.passed).toBe(true);
        });
    });
    describe('Entropy Calculation', () => {
        test('should calculate entropy correctly', () => {
            const lowEntropy = PasswordComplexityValidator.calculateEntropy('aaaa');
            expect(lowEntropy).toBeLessThan(20);
            const mediumEntropy = PasswordComplexityValidator.calculateEntropy('Password123');
            expect(mediumEntropy).toBeGreaterThan(30);
            expect(mediumEntropy).toBeLessThan(70);
            const highEntropy = PasswordComplexityValidator.calculateEntropy('Tr7$mK9#nQ2@');
            expect(highEntropy).toBeGreaterThan(60);
        });
        test('should consider different character types', () => {
            const lowerOnly = PasswordComplexityValidator.calculateEntropy('abcdef');
            const mixed = PasswordComplexityValidator.calculateEntropy('AbCd1!');
            expect(mixed).toBeGreaterThan(lowerOnly);
        });
    });
    describe('Rule Management', () => {
        test('should add custom rule', () => {
            const customRule = {
                id: 'custom-rule',
                name: 'Custom Rule',
                description: 'Custom validation rule',
                enabled: true,
                required: false,
                weight: 5,
                category: 'pattern',
                severity: 'warning',
                validate: (password) => ({
                    passed: password.includes('custom'),
                    score: password.includes('custom') ? 10 : 0,
                    message: 'Custom rule result'
                })
            };
            validator.addRule(customRule);
            const retrievedRule = validator.getRule('custom-rule');
            expect(retrievedRule).toBeDefined();
            expect(retrievedRule?.name).toBe('Custom Rule');
        });
        test('should remove rule', () => {
            const initialRuleCount = validator.getConfig().rules.length;
            const success = validator.removeRule('min-length');
            expect(success).toBe(true);
            const finalRuleCount = validator.getConfig().rules.length;
            expect(finalRuleCount).toBe(initialRuleCount - 1);
        });
        test('should toggle rule enabled state', () => {
            const rule = validator.getRule('min-length');
            const initialState = rule?.enabled;
            const success = validator.toggleRule('min-length', !initialState);
            expect(success).toBe(true);
            const updatedRule = validator.getRule('min-length');
            expect(updatedRule?.enabled).toBe(!initialState);
        });
        test('should get rules by category', () => {
            const lengthRules = validator.getRulesByCategory('length');
            const characterRules = validator.getRulesByCategory('character');
            expect(lengthRules.length).toBeGreaterThan(0);
            expect(characterRules.length).toBeGreaterThan(0);
            lengthRules.forEach(rule => {
                expect(rule.category).toBe('length');
            });
        });
    });
    describe('Different Configuration Modes', () => {
        test('should handle strict mode', () => {
            const strictValidator = new PasswordComplexityValidator({ mode: 'strict' });
            const config = strictValidator.getConfig();
            expect(config.mode).toBe('strict');
            expect(config.rules.length).toBeGreaterThan(8); // More rules in strict mode
            // Strict mode should have higher requirements
            const minLengthRule = config.rules.find(r => r.id === 'min-length');
            expect(minLengthRule).toBeDefined();
        });
        test('should handle lenient mode', () => {
            const lenientValidator = new PasswordComplexityValidator({ mode: 'lenient' });
            const config = lenientValidator.getConfig();
            expect(config.mode).toBe('lenient');
            expect(config.rules.length).toBeLessThan(10); // Fewer rules in lenient mode
        });
        test('should handle custom mode', () => {
            const customValidator = new PasswordComplexityValidator({ mode: 'custom' });
            const config = customValidator.getConfig();
            expect(config.mode).toBe('custom');
            expect(config.rules.length).toBe(0); // No default rules in custom mode
        });
    });
    describe('Context-Aware Validation', () => {
        test('should use context for personal information check', async () => {
            const context = {
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                organizationName: 'TestCorp'
            };
            const personalPassword = await validator.validatePassword('testuser123', context);
            expect(personalPassword.valid).toBe(false);
            expect(personalPassword.errors.some(e => e.includes('personal'))).toBe(true);
            const safePassword = await validator.validatePassword('MyS3cur3!Pass', context);
            expect(safePassword.valid).toBe(true);
        });
        test('should check password history', async () => {
            const context = {
                previousPasswords: ['OldPass1!', 'OldPass2!', 'OldPass3!']
            };
            const reusedPassword = await validator.validatePassword('OldPass1!', context);
            expect(reusedPassword.valid).toBe(false);
            expect(reusedPassword.errors.some(e => e.includes('history'))).toBe(true);
        });
    });
    describe('Performance and Edge Cases', () => {
        test('should handle very long passwords', async () => {
            const longPassword = 'A1!' + 'a'.repeat(1000);
            const result = await validator.validatePassword(longPassword);
            // Should handle gracefully (might fail max length rule)
            expect(result).toBeDefined();
            expect(result.ruleResults.length).toBeGreaterThan(0);
        });
        test('should handle empty password', async () => {
            const result = await validator.validatePassword('');
            expect(result.valid).toBe(false);
            expect(result.score).toBeLessThan(10);
        });
        test('should handle special characters correctly', async () => {
            const specialPassword = 'Pāss₩örđ123!@#';
            const result = await validator.validatePassword(specialPassword);
            expect(result).toBeDefined();
            expect(result.ruleResults.length).toBeGreaterThan(0);
        });
        test('should handle multiple validation calls efficiently', async () => {
            const passwords = [
                'weak',
                'Medium123',
                'StrongP@ssw0rd!',
                'VeryStr0ng!P@ssw0rd123'
            ];
            const startTime = Date.now();
            const results = await Promise.all(passwords.map(pwd => validator.validatePassword(pwd)));
            const endTime = Date.now();
            const duration = endTime - startTime;
            expect(results).toHaveLength(4);
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.score).toBeGreaterThanOrEqual(0);
                expect(result.score).toBeLessThanOrEqual(100);
            });
        });
        test('should handle rule validation errors gracefully', async () => {
            // Add a rule that throws an error
            const faultyRule = {
                id: 'faulty-rule',
                name: 'Faulty Rule',
                description: 'Rule that throws an error',
                enabled: true,
                required: false,
                weight: 5,
                category: 'pattern',
                severity: 'error',
                validate: () => {
                    throw new Error('Validation error');
                }
            };
            validator.addRule(faultyRule);
            const result = await validator.validatePassword('TestPass123!');
            // Should handle error gracefully and still return results
            expect(result).toBeDefined();
            expect(result.ruleResults.length).toBeGreaterThan(0);
            // Find the faulty rule result
            const faultyResult = result.ruleResults.find(r => r.message.includes('Rule validation failed'));
            expect(faultyResult).toBeDefined();
            expect(faultyResult?.passed).toBe(false);
        });
    });
    describe('Real-World Password Scenarios', () => {
        const testCases = [
            {
                password: 'password',
                expectedValid: false,
                description: 'common weak password'
            },
            {
                password: 'Password123',
                expectedValid: false,
                description: 'predictable pattern'
            },
            {
                password: 'MyS3cur3!P@ssw0rd',
                expectedValid: true,
                description: 'strong mixed password'
            },
            {
                password: 'Tr7$mK9#nQ2@pL8&',
                expectedValid: true,
                description: 'very strong random password'
            },
            {
                password: '123456789',
                expectedValid: false,
                description: 'numeric sequence'
            },
            {
                password: 'qwertyuiop',
                expectedValid: false,
                description: 'keyboard pattern'
            }
        ];
        testCases.forEach(({ password, expectedValid, description }) => {
            test(`should correctly validate ${description}`, async () => {
                const result = await validator.validatePassword(password);
                expect(result.valid).toBe(expectedValid);
                if (expectedValid) {
                    expect(result.score).toBeGreaterThan(70);
                    expect(result.errors).toHaveLength(0);
                }
                else {
                    expect(result.score).toBeLessThan(70);
                }
            });
        });
    });
    describe('Internationalization Support', () => {
        test('should handle non-ASCII characters', async () => {
            const unicodePassword = 'Mŷ§ëčūrē!Pā§§₩ōrđ123';
            const result = await validator.validatePassword(unicodePassword);
            expect(result).toBeDefined();
            expect(result.entropy).toBeGreaterThan(0);
        });
        test('should handle different scripts', async () => {
            const mixedScriptPassword = 'Secure密码123!';
            const result = await validator.validatePassword(mixedScriptPassword);
            expect(result).toBeDefined();
            expect(result.ruleResults.length).toBeGreaterThan(0);
        });
    });
});
