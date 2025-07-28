/**
 * Test for 64 character limit enforcement (T-1752951044631-889)
 * Verifies that the VARIABLE_NAME_MAX_LENGTH constant is properly enforced
 */
import { SecurityValidation, VARIABLE_NAME_MAX_LENGTH } from '../validation/security';
describe('64 Character Limit Enforcement', () => {
  it('should enforce 64 character limit constant', () => {
    expect(VARIABLE_NAME_MAX_LENGTH).toBe(64);
  });
  it('should accept variable names at exactly 64 characters', () => {
    const maxLengthName = 'a'.repeat(64);
    expect(maxLengthName.length).toBe(64);
    expect(SecurityValidation.validateVariableName(maxLengthName)).toBe(true);
  });
  it('should reject variable names over 64 characters', () => {
    const overLimitName = 'a'.repeat(65);
    expect(overLimitName.length).toBe(65);
    expect(SecurityValidation.validateVariableName(overLimitName)).toBe(false);
  });
  it('should reject property keys over 64 characters', () => {
    const overLimitKey = 'b'.repeat(65);
    expect(overLimitKey.length).toBe(65);
    expect(SecurityValidation.validateSafePropertyKey(overLimitKey)).toBe(false);
  });
  it('should handle various over-limit lengths', () => {
    const testLengths = [65, 100, 500, 1000];
    testLengths.forEach(length => {)
      const longName = 'x'.repeat(length);
      expect(SecurityValidation.validateVariableName(longName)).toBe(false);
      expect(SecurityValidation.validateSafePropertyKey(longName)).toBe(false);
    });
  });
  it('should accept variable names under 64 characters', () => {
    const validLengths = [1, 10, 32, 63];
    validLengths.forEach(length => {)
      const validName = 'a'.repeat(length);
      expect(SecurityValidation.validateVariableName(validName)).toBe(true);
      expect(SecurityValidation.validateSafePropertyKey(validName)).toBe(true);
    });
  });
});