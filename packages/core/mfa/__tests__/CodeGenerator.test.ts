/**
 * Comprehensive tests for SecureCodeGenerator and VerificationCodeFactory
 */

import crypto from 'crypto';
import { 
  SecureCodeGenerator, 
  VerificationCodeFactory,
  CodeUtils,
  VerificationCodeData,
  ValidationResult
} from '../CodeGenerator';

describe('SecureCodeGenerator', () => {
  let generator: SecureCodeGenerator;
  
  beforeEach(() => {
    generator = new SecureCodeGenerator();
  });
  
  describe('Code Generation', () => {
    test('should generate numeric codes of correct length', () => {
      const code = generator.generateCode({ length: 6, format: 'numeric' });
      
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });
    
    test('should generate alphanumeric codes without ambiguous characters', () => {
      const code = generator.generateCode({ 
        length: 8, 
        format: 'alphanumeric',
        excludeAmbiguous: true 
      });
      
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
      expect(code.length).toBe(8);
      
      // Should not contain ambiguous characters
      expect(code).not.toMatch(/[0O1IL]/);
    });
    
    test('should generate alphabetic codes', () => {
      const code = generator.generateCode({ 
        length: 4, 
        format: 'alphabetic' 
      });
      
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
      expect(code.length).toBe(4);
    });
    
    test('should use custom alphabet', () => {
      const customAlphabet = 'ABCD1234';
      const code = generator.generateCode({
        length: 6,
        format: 'numeric', // This should be ignored when customAlphabet is provided
        customAlphabet
      });
      
      expect(code.length).toBe(6);
      for (const char of code) {
        expect(customAlphabet).toContain(char);
      }
    });
    
    test('should generate unique codes', () => {
      const codes = new Set();
      
      // Generate 1000 codes - should all be unique with high probability
      for (let i = 0; i < 1000; i++) {
        const code = generator.generateCode({ length: 8, format: 'alphanumeric' });
        codes.add(code);
      }
      
      // With 8 alphanumeric characters, collision probability is very low
      expect(codes.size).toBeGreaterThan(990);
    });
    
    test('should validate generation options', () => {
      expect(() => {
        generator.generateCode({ length: 2 }); // Too short
      }).toThrow('Code length must be between');
      
      expect(() => {
        generator.generateCode({ length: 15 }); // Too long
      }).toThrow('Code length must be between');
      
      expect(() => {
        generator.generateCode({ customAlphabet: 'A' }); // Too few characters
      }).toThrow('Custom alphabet must contain at least 2 characters');
    });
    
    test('should emit generation events', (done) => {
      generator.on('codeGenerated', (event) => {
        expect(event).toHaveProperty('length', 6);
        expect(event).toHaveProperty('format', 'numeric');
        expect(event).toHaveProperty('timestamp');
        expect(event.timestamp).toBeInstanceOf(Date);
        done();
      });
      
      generator.generateCode({ length: 6, format: 'numeric' });
    });
  });
  
  describe('Recovery Code Generation', () => {
    test('should generate recovery codes with correct format', () => {
      const codes = generator.generateRecoveryCodes(5);
      
      expect(codes).toHaveLength(5);
      
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
        expect(code.length).toBe(14); // 12 chars + 2 hyphens
        expect(code).not.toMatch(/[0O1IL]/); // No ambiguous characters
      });
    });
    
    test('should generate unique recovery codes', () => {
      const codes = generator.generateRecoveryCodes(10);
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(10);
    });
    
    test('should emit recovery code generation events', (done) => {
      generator.on('recoveryCodesGenerated', (event) => {
        expect(event).toHaveProperty('count', 10);
        expect(event).toHaveProperty('timestamp');
        done();
      });
      
      generator.generateRecoveryCodes(10);
    });
  });
  
  describe('Verification Code Creation', () => {
    test('should create verification code with all required properties', async () => {
      const code = '123456';
      const userId = 'user123';
      const purpose = 'email_verification';
      
      const verificationCode = await generator.createVerificationCode(
        code, 
        userId, 
        purpose
      );
      
      expect(verificationCode).toHaveProperty('id');
      expect(verificationCode).toHaveProperty('codeHash');
      expect(verificationCode).toHaveProperty('salt');
      expect(verificationCode).toHaveProperty('algorithm', 'sha256');
      expect(verificationCode.userId).toBe(userId);
      expect(verificationCode.purpose).toBe(purpose);
      expect(verificationCode.used).toBe(false);
      expect(verificationCode.attempts).toBe(0);
      expect(verificationCode.maxAttempts).toBe(5);
      expect(verificationCode.expiresAt).toBeInstanceOf(Date);
      expect(verificationCode.createdAt).toBeInstanceOf(Date);
    });
    
    test('should create unique IDs and salts', async () => {
      const code = '123456';
      const code1 = await generator.createVerificationCode(code, 'user1', 'test');
      const code2 = await generator.createVerificationCode(code, 'user2', 'test');
      
      expect(code1.id).not.toBe(code2.id);
      expect(code1.salt).not.toBe(code2.salt);
      expect(code1.codeHash).not.toBe(code2.codeHash); // Different due to different salts
    });
    
    test('should respect custom expiration and max attempts', async () => {
      const verificationCode = await generator.createVerificationCode(
        '123456',
        'user123',
        'test',
        {
          expirationMinutes: 30,
          maxAttempts: 3,
          metadata: { custom: 'data' }
        }
      );
      
      const expectedExpiry = new Date(Date.now() + 30 * 60 * 1000);
      const actualExpiry = verificationCode.expiresAt.getTime();
      
      expect(Math.abs(actualExpiry - expectedExpiry.getTime())).toBeLessThan(1000);
      expect(verificationCode.maxAttempts).toBe(3);
      expect(verificationCode.metadata).toEqual({ custom: 'data' });
    });
  });
  
  describe('Code Validation', () => {
    let verificationCode: VerificationCodeData;
    const testCode = '123456';
    
    beforeEach(async () => {
      verificationCode = await generator.createVerificationCode(
        testCode,
        'user123',
        'test'
      );
    });
    
    test('should validate correct code', async () => {
      const result = await generator.validateCode(testCode, verificationCode);
      
      expect(result.valid).toBe(true);
      expect(result.code?.used).toBe(true);
      expect(result.code?.attempts).toBe(1);
      expect(result.attemptsRemaining).toBe(4);
    });
    
    test('should reject incorrect code', async () => {
      const result = await generator.validateCode('wrong', verificationCode);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('invalid');
      expect(result.code?.used).toBe(false);
      expect(result.code?.attempts).toBe(1);
      expect(result.attemptsRemaining).toBe(4);
    });
    
    test('should reject used code', async () => {
      // First validation - should succeed
      await generator.validateCode(testCode, verificationCode);
      
      // Update the code to reflect it's been used
      const usedCode = { ...verificationCode, used: true, attempts: 1 };
      
      // Second validation - should fail
      const result = await generator.validateCode(testCode, usedCode);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('used');
    });
    
    test('should reject expired code', async () => {
      const expiredCode = {
        ...verificationCode,
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      };
      
      const result = await generator.validateCode(testCode, expiredCode);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('expired');
    });
    
    test('should enforce rate limiting', async () => {
      const codeWithLowLimit = {
        ...verificationCode,
        maxAttempts: 2,
        attempts: 2
      };
      
      const result = await generator.validateCode(testCode, codeWithLowLimit);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('rate_limited');
    });
    
    test('should track attempts correctly', async () => {
      let currentCode = { ...verificationCode };
      
      // First wrong attempt
      let result = await generator.validateCode('wrong1', currentCode);
      expect(result.code?.attempts).toBe(1);
      expect(result.attemptsRemaining).toBe(4);
      
      // Second wrong attempt
      currentCode = { ...currentCode, attempts: 1 };
      result = await generator.validateCode('wrong2', currentCode);
      expect(result.code?.attempts).toBe(2);
      expect(result.attemptsRemaining).toBe(3);
      
      // Correct attempt
      currentCode = { ...currentCode, attempts: 2 };
      result = await generator.validateCode(testCode, currentCode);
      expect(result.valid).toBe(true);
      expect(result.code?.attempts).toBe(3);
      expect(result.code?.used).toBe(true);
    });
    
    test('should perform constant-time validation', async () => {
      const times: number[] = [];
      
      // Test validation times for correct and incorrect codes
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await generator.validateCode(i % 2 === 0 ? testCode : 'wrong', {
          ...verificationCode,
          id: `test-${i}` // Different ID to avoid used code issue
        });
        times.push(Date.now() - start);
      }
      
      // All validation times should be close to each other (within reasonable variance)
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxDeviation = Math.max(...times.map(t => Math.abs(t - avgTime)));
      
      // Should not deviate more than 50ms from average (allowing for system variance)
      expect(maxDeviation).toBeLessThan(50);
    });
  });
  
  describe('Code Format Validation', () => {
    test('should validate numeric codes', () => {
      expect(generator.validateCodeFormat('123456', 'numeric')).toEqual({ valid: true });
      expect(generator.validateCodeFormat('12 34 56', 'numeric')).toEqual({ valid: true });
      expect(generator.validateCodeFormat('123-456', 'numeric')).toEqual({ valid: true });
      
      expect(generator.validateCodeFormat('123abc', 'numeric')).toEqual({
        valid: false,
        reason: 'Invalid character \'A\' in code'
      });
    });
    
    test('should validate alphanumeric codes', () => {
      expect(generator.validateCodeFormat('ABC123', 'alphanumeric')).toEqual({ valid: true });
      expect(generator.validateCodeFormat('AB-C1-23', 'alphanumeric')).toEqual({ valid: true });
      
      expect(generator.validateCodeFormat('ABC0123', 'alphanumeric')).toEqual({
        valid: false,
        reason: 'Invalid character \'0\' in code'
      });
    });
    
    test('should validate length constraints', () => {
      expect(generator.validateCodeFormat('12', 'numeric')).toEqual({
        valid: false,
        reason: 'Code length must be between 4 and 12 characters'
      });
      
      expect(generator.validateCodeFormat('1234567890123', 'numeric')).toEqual({
        valid: false,
        reason: 'Code length must be between 4 and 12 characters'
      });
    });
    
    test('should handle invalid input', () => {
      expect(generator.validateCodeFormat('', 'numeric')).toEqual({
        valid: false,
        reason: 'Code must be a non-empty string'
      });
      
      expect(generator.validateCodeFormat(null as any, 'numeric')).toEqual({
        valid: false,
        reason: 'Code must be a non-empty string'
      });
    });
  });
});

describe('VerificationCodeFactory', () => {
  let factory: VerificationCodeFactory;
  
  beforeEach(() => {
    factory = new VerificationCodeFactory();
  });
  
  describe('Email Verification Codes', () => {
    test('should create email verification code', async () => {
      const { code, data } = await factory.createEmailVerificationCode(
        'user123',
        'test@example.com'
      );
      
      expect(code).toMatch(/^\d{6}$/);
      expect(data.purpose).toBe('email_verification');
      expect(data.userId).toBe('user123');
      expect(data.metadata?.email).toBe('test@example.com');
      expect(data.maxAttempts).toBe(5);
      
      // Should expire in 15 minutes
      const expectedExpiry = new Date(Date.now() + 15 * 60 * 1000);
      const actualExpiry = data.expiresAt.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry.getTime())).toBeLessThan(5000);
    });
  });
  
  describe('SMS Verification Codes', () => {
    test('should create SMS verification code', async () => {
      const { code, data } = await factory.createSMSVerificationCode(
        'user123',
        '+1234567890'
      );
      
      expect(code).toMatch(/^\d{6}$/);
      expect(data.purpose).toBe('sms_verification');
      expect(data.userId).toBe('user123');
      expect(data.metadata?.phoneNumber).toBe('+1234567890');
      expect(data.maxAttempts).toBe(3);
      
      // Should expire in 5 minutes
      const expectedExpiry = new Date(Date.now() + 5 * 60 * 1000);
      const actualExpiry = data.expiresAt.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });
  
  describe('Password Reset Codes', () => {
    test('should create password reset code', async () => {
      const { code, data } = await factory.createPasswordResetCode(
        'user123',
        'test@example.com'
      );
      
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
      expect(data.purpose).toBe('password_reset');
      expect(data.userId).toBe('user123');
      expect(data.metadata?.email).toBe('test@example.com');
      expect(data.maxAttempts).toBe(3);
      
      // Should expire in 30 minutes
      const expectedExpiry = new Date(Date.now() + 30 * 60 * 1000);
      const actualExpiry = data.expiresAt.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });
  
  describe('TOTP Backup Codes', () => {
    test('should create TOTP backup codes', async () => {
      const { codes, data } = await factory.createTOTPBackupCodes('user123');
      
      expect(codes).toHaveLength(10);
      expect(data).toHaveLength(10);
      
      codes.forEach((code, index) => {
        expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
        expect(data[index].purpose).toBe('totp_backup');
        expect(data[index].userId).toBe('user123');
        expect(data[index].maxAttempts).toBe(1);
        expect(data[index].metadata?.type).toBe('backup_code');
      });
      
      // Should expire in 1 year
      const expectedExpiry = new Date(Date.now() + 525600 * 60 * 1000);
      const actualExpiry = data[0].expiresAt.getTime();
      expect(Math.abs(actualExpiry - expectedExpiry.getTime())).toBeLessThan(60000);
    });
  });
});

describe('CodeUtils', () => {
  describe('formatCodeForDisplay', () => {
    test('should format codes with default separator', () => {
      expect(CodeUtils.formatCodeForDisplay('12345678')).toBe('1234-5678');
      expect(CodeUtils.formatCodeForDisplay('123456789012')).toBe('1234-5678-9012');
    });
    
    test('should format codes with custom separator', () => {
      expect(CodeUtils.formatCodeForDisplay('12345678', ' ', 4)).toBe('1234 5678');
      expect(CodeUtils.formatCodeForDisplay('123456', '_', 2)).toBe('12_34_56');
    });
  });
  
  describe('cleanUserInput', () => {
    test('should clean and normalize user input', () => {
      expect(CodeUtils.cleanUserInput('123 456')).toBe('123456');
      expect(CodeUtils.cleanUserInput('123-456')).toBe('123456');
      expect(CodeUtils.cleanUserInput('abc def')).toBe('ABCDEF');
      expect(CodeUtils.cleanUserInput('  a-b c  ')).toBe('ABC');
    });
  });
  
  describe('generateSecureToken', () => {
    test('should generate secure tokens', () => {
      const token1 = CodeUtils.generateSecureToken();
      const token2 = CodeUtils.generateSecureToken();
      
      expect(token1).toHaveLength(43); // Base64url encoded 32 bytes ≈ 43 chars
      expect(token2).toHaveLength(43);
      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^[A-Za-z0-9_-]+$/);
    });
    
    test('should generate tokens of custom length', () => {
      const token = CodeUtils.generateSecureToken(16);
      expect(token).toHaveLength(22); // Base64url encoded 16 bytes ≈ 22 chars
    });
  });
  
  describe('calculateEntropy', () => {
    test('should calculate entropy correctly', () => {
      expect(CodeUtils.calculateEntropy(10, 6)).toBeCloseTo(19.93, 2); // ~20 bits
      expect(CodeUtils.calculateEntropy(36, 8)).toBeCloseTo(41.36, 2); // ~41 bits
      expect(CodeUtils.calculateEntropy(62, 12)).toBeCloseTo(71.49, 2); // ~71 bits
    });
  });
});

describe('Security Properties', () => {
  let generator: SecureCodeGenerator;
  
  beforeEach(() => {
    generator = new SecureCodeGenerator();
  });
  
  test('should use cryptographically secure random generation', () => {
    // Mock crypto.randomBytes to ensure it's being called
    const originalRandomBytes = crypto.randomBytes;
    const mockRandomBytes = jest.fn().mockImplementation(originalRandomBytes);
    crypto.randomBytes = mockRandomBytes;
    
    generator.generateCode({ length: 6, format: 'numeric' });
    
    expect(mockRandomBytes).toHaveBeenCalled();
    
    // Restore original function
    crypto.randomBytes = originalRandomBytes;
  });
  
  test('should use timing-safe comparison for validation', async () => {
    // Mock crypto.timingSafeEqual to ensure it's being called
    const originalTimingSafeEqual = crypto.timingSafeEqual;
    const mockTimingSafeEqual = jest.fn().mockImplementation(originalTimingSafeEqual);
    crypto.timingSafeEqual = mockTimingSafeEqual;
    
    const verificationCode = await generator.createVerificationCode(
      '123456',
      'user123',
      'test'
    );
    
    await generator.validateCode('123456', verificationCode);
    
    expect(mockTimingSafeEqual).toHaveBeenCalled();
    
    // Restore original function
    crypto.timingSafeEqual = originalTimingSafeEqual;
  });
  
  test('should have sufficient entropy for generated codes', () => {
    const numericEntropy = CodeUtils.calculateEntropy(10, 6); // 6-digit numeric
    const alphanumericEntropy = CodeUtils.calculateEntropy(29, 8); // 8-char alphanumeric (excluding ambiguous)
    
    expect(numericEntropy).toBeGreaterThan(19); // > 19 bits (adequate for temporary codes)
    expect(alphanumericEntropy).toBeGreaterThan(40); // > 40 bits (good for longer-lived codes)
  });
  
  test('should properly salt hashes', async () => {
    const code = '123456';
    const code1 = await generator.createVerificationCode(code, 'user1', 'test');
    const code2 = await generator.createVerificationCode(code, 'user2', 'test');
    
    // Same input code should produce different hashes due to different salts
    expect(code1.codeHash).not.toBe(code2.codeHash);
    expect(code1.salt).not.toBe(code2.salt);
  });
});