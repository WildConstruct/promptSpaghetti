/**
 * Test Suite for Verification Code Manager
 * 
 * Tests comprehensive verification code management including generation, validation,
 * expiry, retry logic, rate limiting, and security features.
 */
import {
  VerificationCodeManager,
  VerificationCodeType,
  CodeFormat,
  CodeStatus,
  DeliveryChannel,
  VerificationCodeConfig,
  CodeGenerationRequest,
  CodeValidationRequest,
  SecurityEvent
} from '../VerificationCodeManager';
describe('VerificationCodeManager', () => {
  let manager: VerificationCodeManager;
  beforeEach(() => {
    manager = new VerificationCodeManager({)
      antiEnumerationDelay: 1, // Speed up tests
      cleanupInterval: 60000, // 1 minute for tests
      enableSecurityLogging: true,
    });
  });
  afterEach(() => {
    manager.destroy();
  });
  describe('Code Generation', () => {
    test('should generate verification codes successfully', async () => {
      const request: CodeGenerationRequest = {
        userId: 'user-123',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'user@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(request);
      expect(result).not.toBeNull();
      expect(result?.code).toBeDefined();
      expect(result?.codeId).toBeDefined();
      expect(typeof result?.code).toBe('string');
      expect(result?.code.length).toBe(6); // NUMERIC_6 format
    });
    test('should generate codes with different formats', async () => {
      const customManager = new VerificationCodeManager({)
        antiEnumerationDelay: 1,
        codeFormats: {,
          [VerificationCodeType.EMAIL_VERIFICATION]: CodeFormat.NUMERIC_4,
          [VerificationCodeType.SMS_VERIFICATION]: CodeFormat.ALPHANUMERIC_6,
          [VerificationCodeType.TOTP_BACKUP]: CodeFormat.NUMERIC_8,
          [VerificationCodeType.PASSWORD_RESET]: CodeFormat.ALPHANUMERIC_8,
          [VerificationCodeType.ACCOUNT_RECOVERY]: CodeFormat.UUID,
          [VerificationCodeType.DEVICE_VERIFICATION]: CodeFormat.NUMERIC_6,
          [VerificationCodeType.LOGIN_CONFIRMATION]: CodeFormat.NUMERIC_4,
          [VerificationCodeType.TRANSACTION_APPROVAL]: CodeFormat.NUMERIC_6
        }
      });
      const requests: Array<{ type: VerificationCodeType; expectedLength: number }> = [
        { type: VerificationCodeType.EMAIL_VERIFICATION, expectedLength: 4 },
        { type: VerificationCodeType.SMS_VERIFICATION, expectedLength: 6 },
        { type: VerificationCodeType.TOTP_BACKUP, expectedLength: 8 },
        { type: VerificationCodeType.ACCOUNT_RECOVERY, expectedLength: 36 } // UUID length
      ];
      for (const { type, expectedLength } of requests) {
        const request: CodeGenerationRequest = {
          userId: `user-${type}`,}
          type,
          deliveryChannel: DeliveryChannel.EMAIL,
          deliveryAddress: 'test@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        };
        const result = await customManager.generateCode(request);
        expect(result).not.toBeNull();
        expect(result?.code.length).toBe(expectedLength);
      }
      customManager.destroy();
    });
    test('should emit code generated event', (done) => {
      manager.on('codeGenerated', (data) => {
        expect(data.codeId).toBeDefined();
        expect(data.userId).toBe('user-event');
        expect(data.type).toBe(VerificationCodeType.SMS_VERIFICATION);
        expect(data.deliveryChannel).toBe(DeliveryChannel.SMS);
        expect(data.expiresAt).toBeInstanceOf(Date);
        done();
      });
      const request: CodeGenerationRequest = {
        userId: 'user-event',
        type: VerificationCodeType.SMS_VERIFICATION,
        deliveryChannel: DeliveryChannel.SMS,
        deliveryAddress: '+1234567890',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateCode(request);
    });
    test('should revoke existing codes when generating new ones', async () => {
      const request: CodeGenerationRequest = {
        userId: 'user-revoke',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'revoke@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // Generate first code
      const firstCode = await manager.generateCode(request);
      expect(firstCode).not.toBeNull();
      // Generate second code
      const secondCode = await manager.generateCode(request);
      expect(secondCode).not.toBeNull();
      // First code should be revoked
      const firstCodeInfo = manager.getCodeInfo(firstCode!.codeId);
      expect(firstCodeInfo?.status).toBe(CodeStatus.REVOKED);
      // Second code should be active
      const secondCodeInfo = manager.getCodeInfo(secondCode!.codeId);
      expect(secondCodeInfo?.status).toBe(CodeStatus.ACTIVE);
    });
    test('should handle custom expiration times', async () => {
      const request: CodeGenerationRequest = {
        userId: 'user-custom-expiry',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'custom@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        expirationMinutes: 15 // 15 minutes,
      };
      const result = await manager.generateCode(request);
      expect(result).not.toBeNull();
      const codeInfo = manager.getCodeInfo(result!.codeId);
      const expirationTime = codeInfo!.expiresAt!.getTime() - codeInfo!.createdAt!.getTime();
      // Should be approximately 15 minutes (allowing for small timing differences)
      expect(expirationTime).toBeGreaterThan(14 * 60 * 1000);
      expect(expirationTime).toBeLessThan(16 * 60 * 1000);
    });
  });
  describe('Code Validation', () => {
    test('should validate correct codes successfully', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-validate',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'validate@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const valRequest: CodeValidationRequest = {
        userId: 'user-validate',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const validation = await manager.validateCode(valRequest);
      expect(validation.valid).toBe(true);
      expect(validation.codeData).toBeDefined();
      expect(validation.codeData?.userId).toBe('user-validate');
      expect(validation.attemptsRemaining).toBeDefined();
      expect(validation.riskScore).toBeDefined();
    });
    test('should reject invalid codes', async () => {
      const valRequest: CodeValidationRequest = {
        userId: 'user-invalid',
        code: '999999',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const validation = await manager.validateCode(valRequest);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('invalid_code');
      expect(validation.riskScore).toBeGreaterThan(0);
    });
    test('should detect expired codes', async () => {
      const shortLivedManager = new VerificationCodeManager({)
        antiEnumerationDelay: 1,
        expirationTimes: {,
          [VerificationCodeType.EMAIL_VERIFICATION]: 1, // 1 millisecond
          [VerificationCodeType.SMS_VERIFICATION]: 1,
          [VerificationCodeType.TOTP_BACKUP]: 1,
          [VerificationCodeType.PASSWORD_RESET]: 1,
          [VerificationCodeType.ACCOUNT_RECOVERY]: 1,
          [VerificationCodeType.DEVICE_VERIFICATION]: 1,
          [VerificationCodeType.LOGIN_CONFIRMATION]: 1,
          [VerificationCodeType.TRANSACTION_APPROVAL]: 1
        }
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-expired',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'expired@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await shortLivedManager.generateCode(genRequest);
      expect(result).not.toBeNull();
      // Wait for code to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      const valRequest: CodeValidationRequest = {
        userId: 'user-expired',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const validation = await shortLivedManager.validateCode(valRequest);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('code_expired');
      shortLivedManager.destroy();
    });
    test('should track retry attempts and enforce limits', async () => {
      const limitedManager = new VerificationCodeManager({)
        antiEnumerationDelay: 1,
        retryLimits: {,
          [VerificationCodeType.EMAIL_VERIFICATION]: 3,
          [VerificationCodeType.SMS_VERIFICATION]: 3,
          [VerificationCodeType.TOTP_BACKUP]: 3,
          [VerificationCodeType.PASSWORD_RESET]: 3,
          [VerificationCodeType.ACCOUNT_RECOVERY]: 3,
          [VerificationCodeType.DEVICE_VERIFICATION]: 3,
          [VerificationCodeType.LOGIN_CONFIRMATION]: 3,
          [VerificationCodeType.TRANSACTION_APPROVAL]: 3
        }
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-retry',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'retry@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        maxAttempts: 3,
      };
      const result = await limitedManager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const valRequest: CodeValidationRequest = {
        userId: 'user-retry',
        code: 'wrong-code',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // First invalid attempt
      const validation1 = await limitedManager.validateCode(valRequest);
      expect(validation1.valid).toBe(false);
      expect(validation1.reason).toBe('invalid_code');
      // Second invalid attempt  
      const validation2 = await limitedManager.validateCode(valRequest);
      expect(validation2.valid).toBe(false);
      expect(validation2.reason).toBe('invalid_code');
      // Third invalid attempt should be rate limited (3 attempts reached)
      const validation3 = await limitedManager.validateCode(valRequest);
      expect(validation3.valid).toBe(false);
      expect(validation3.reason).toBe('too_many_attempts');
      limitedManager.destroy();
    });
    test('should calculate risk scores for security monitoring', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-risk',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'risk@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      // Same IP and user agent - low risk
      const lowRiskRequest: CodeValidationRequest = {
        userId: 'user-risk',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const lowRiskValidation = await manager.validateCode(lowRiskRequest);
      // Different IP and user agent - higher risk
      const highRiskRequest: CodeValidationRequest = {
        userId: 'user-risk',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.100',
        userAgent: 'Different Agent',
      };
      const highRiskValidation = await manager.validateCode(highRiskRequest);
      expect(lowRiskValidation.valid).toBe(true);
      expect(highRiskValidation.valid).toBe(true);
      expect(highRiskValidation.riskScore).toBeGreaterThan(lowRiskValidation.riskScore!);
      expect(highRiskValidation.securityWarnings).toBeDefined();
      expect(highRiskValidation.securityWarnings).toContain('ip_address_mismatch');
      expect(highRiskValidation.securityWarnings).toContain('user_agent_mismatch');
    });
  });
  describe('Code Usage', () => {
    test('should use valid codes successfully', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-use',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'use@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const useRequest: CodeValidationRequest = {
        userId: 'user-use',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const usage = await manager.useCode(useRequest);
      expect(usage.success).toBe(true);
      expect(usage.codeData).toBeDefined();
      expect(usage.codeData?.status).toBe(CodeStatus.USED);
      expect(usage.codeData?.usedAt).toBeInstanceOf(Date);
    });
    test('should prevent reuse of used codes', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-reuse',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'reuse@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const useRequest: CodeValidationRequest = {
        userId: 'user-reuse',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // Use code first time
      const firstUsage = await manager.useCode(useRequest);
      expect(firstUsage.success).toBe(true);
      // Try to use code second time
      const secondUsage = await manager.useCode(useRequest);
      expect(secondUsage.success).toBe(false);
    });
    test('should emit code used event', (done) => {
      manager.on('codeUsed', (data) => {
        expect(data.codeId).toBeDefined();
        expect(data.userId).toBe('user-used-event');
        expect(data.type).toBe(VerificationCodeType.EMAIL_VERIFICATION);
        expect(data.usedAt).toBeInstanceOf(Date);
        done();
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-used-event',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'used@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateCode(genRequest).then(result => {)
        if (result) {
          const useRequest: CodeValidationRequest = {
            userId: 'user-used-event',
            code: result.code,
            type: VerificationCodeType.EMAIL_VERIFICATION,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          };
          manager.useCode(useRequest);
        }
      });
    });
  });
  describe('Code Revocation', () => {
    test('should revoke specific codes', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-revoke-specific',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'revoke@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const success = await manager.revokeCode(result!.codeId, 'manual_revocation');
      expect(success).toBe(true);
      const codeInfo = manager.getCodeInfo(result!.codeId);
      expect(codeInfo?.status).toBe(CodeStatus.REVOKED);
      expect(codeInfo?.revokedAt).toBeInstanceOf(Date);
    });
    test('should revoke all user codes of specific type', async () => {
      const userId = 'user-revoke-all';
      const requests: CodeGenerationRequest[] = [
        {
          userId,
          type: VerificationCodeType.EMAIL_VERIFICATION,
          deliveryChannel: DeliveryChannel.EMAIL,
          deliveryAddress: 'revoke1@test.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId,
          type: VerificationCodeType.SMS_VERIFICATION,
          deliveryChannel: DeliveryChannel.SMS,
          deliveryAddress: '+1234567890',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
      ];
      const results = await Promise.all(;);
        requests.map(request => manager.generateCode(request))
      );
      results.forEach(result => expect(result).not.toBeNull());
      // Revoke all email verification codes
      const revokedCount = await manager.revokeUserCodes(;);
        userId,
        VerificationCodeType.EMAIL_VERIFICATION,
        'user_requested'
      );
      expect(revokedCount).toBe(1);
      // Check that only email verification code was revoked
      const emailCode = manager.getCodeInfo(results[0]!.codeId);
      const smsCode = manager.getCodeInfo(results[1]!.codeId);
      expect(emailCode?.status).toBe(CodeStatus.REVOKED);
      expect(smsCode?.status).toBe(CodeStatus.ACTIVE);
    });
    test('should emit code revoked event', (done) => {
      manager.on('codeRevoked', (data) => {
        expect(data.codeId).toBeDefined();
        expect(data.userId).toBe('user-revoke-event');
        expect(data.type).toBe(VerificationCodeType.EMAIL_VERIFICATION);
        expect(data.reason).toBe('test_revocation');
        expect(data.revokedAt).toBeInstanceOf(Date);
        done();
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-revoke-event',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'revoke@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateCode(genRequest).then(result => {)
        if (result) {
          manager.revokeCode(result.codeId, 'test_revocation');
        }
      });
    });
  });
  describe('Rate Limiting', () => {
    test('should enforce rate limiting by user', async () => {
      const rateLimitedManager = new VerificationCodeManager({)
        rateLimitCount: 2,
        rateLimitWindow: 60000, // 1 minute
        antiEnumerationDelay: 1,
      });
      const baseRequest: CodeGenerationRequest = {
        userId: 'user-rate-limit',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'ratelimit@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // First two requests should succeed
      const code1 = await rateLimitedManager.generateCode(baseRequest);
      const code2 = await rateLimitedManager.generateCode(baseRequest);
      expect(code1).not.toBeNull();
      expect(code2).not.toBeNull();
      // Third request should be rate limited
      const code3 = await rateLimitedManager.generateCode(baseRequest);
      expect(code3).toBeNull();
      rateLimitedManager.destroy();
    });
    test('should enforce rate limiting by delivery address', async () => {
      const rateLimitedManager = new VerificationCodeManager({)
        rateLimitCount: 2,
        rateLimitWindow: 60000,
        antiEnumerationDelay: 1,
      });
      const baseRequest: CodeGenerationRequest = {
        userId: 'user-delivery-limit',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'shared@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // Generate codes with same delivery address but different users
      const code1 = await rateLimitedManager.generateCode(baseRequest);
      const code2 = await rateLimitedManager.generateCode({)
        ...baseRequest,
        userId: 'user-delivery-limit-2',
      });
      expect(code1).not.toBeNull();
      expect(code2).not.toBeNull();
      // Third request should be rate limited
      const code3 = await rateLimitedManager.generateCode({)
        ...baseRequest,
        userId: 'user-delivery-limit-3',
      });
      expect(code3).toBeNull();
      rateLimitedManager.destroy();
    });
    test('should enforce rate limiting by IP address', async () => {
      const rateLimitedManager = new VerificationCodeManager({)
        rateLimitCount: 2,
        rateLimitWindow: 60000,
        antiEnumerationDelay: 1,
      });
      const baseRequest: CodeGenerationRequest = {
        userId: 'user-ip-limit',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'iplimit@test.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };
      // Generate codes with same IP but different users and emails
      const code1 = await rateLimitedManager.generateCode(baseRequest);
      const code2 = await rateLimitedManager.generateCode({)
        ...baseRequest,
        userId: 'user-ip-limit-2',
        deliveryAddress: 'iplimit2@test.com',
      });
      expect(code1).not.toBeNull();
      expect(code2).not.toBeNull();
      // Third request should be rate limited
      const code3 = await rateLimitedManager.generateCode({)
        ...baseRequest,
        userId: 'user-ip-limit-3',
        deliveryAddress: 'iplimit3@test.com',
      });
      expect(code3).toBeNull();
      rateLimitedManager.destroy();
    });
  });
  describe('Code Information and Management', () => {
    test('should get code information safely', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-info',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'info@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      const codeInfo = manager.getCodeInfo(result!.codeId);
      expect(codeInfo).toBeDefined();
      expect(codeInfo?.id).toBe(result!.codeId);
      expect(codeInfo?.userId).toBe('user-info');
      expect(codeInfo?.type).toBe(VerificationCodeType.EMAIL_VERIFICATION);
      expect(codeInfo?.status).toBe(CodeStatus.ACTIVE);
      expect(codeInfo?.deliveryChannel).toBe(DeliveryChannel.EMAIL);
      expect(codeInfo?.deliveryAddress).toBe('info@test.com');
      expect(codeInfo?.createdAt).toBeInstanceOf(Date);
      expect(codeInfo?.expiresAt).toBeInstanceOf(Date);
      // Sensitive data should not be included
      expect((codeInfo as any).hashedCode).toBeUndefined();
      expect((codeInfo as any).salt).toBeUndefined();
    });
    test('should get user active codes', async () => {
      const userId = 'user-active-codes';
      const requests: CodeGenerationRequest[] = [
        {
          userId,
          type: VerificationCodeType.EMAIL_VERIFICATION,
          deliveryChannel: DeliveryChannel.EMAIL,
          deliveryAddress: 'active1@test.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId,
          type: VerificationCodeType.SMS_VERIFICATION,
          deliveryChannel: DeliveryChannel.SMS,
          deliveryAddress: '+1234567890',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
      ];
      await Promise.all(requests.map(request => manager.generateCode(request)));
      const allUserCodes = manager.getUserActiveCodes(userId);
      const emailCodes = manager.getUserActiveCodes(userId, VerificationCodeType.EMAIL_VERIFICATION);
      expect(allUserCodes).toHaveLength(2);
      expect(emailCodes).toHaveLength(1);
      expect(emailCodes[0].type).toBe(VerificationCodeType.EMAIL_VERIFICATION);
    });
    test('should return null for non-existent code', () => {
      const codeInfo = manager.getCodeInfo('non-existent-code');
      expect(codeInfo).toBeNull();
    });
  });
  describe('Statistics and Analytics', () => {
    test('should provide comprehensive statistics', async () => {
      const userId = 'user-stats';
      // Generate codes of different types
      const requests: CodeGenerationRequest[] = [
        {
          userId,
          type: VerificationCodeType.EMAIL_VERIFICATION,
          deliveryChannel: DeliveryChannel.EMAIL,
          deliveryAddress: 'stats1@test.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId: 'user-stats-2',
          type: VerificationCodeType.SMS_VERIFICATION,
          deliveryChannel: DeliveryChannel.SMS,
          deliveryAddress: '+1234567890',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
      ];
      const results = await Promise.all(;);
        requests.map(request => manager.generateCode(request))
      );
      // Use one code
      if (results[0]) {
        const useRequest: CodeValidationRequest = {
          userId,
          code: results[0].code,
          type: VerificationCodeType.EMAIL_VERIFICATION,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        };
        await manager.useCode(useRequest);
      }
      // Revoke one code
      if (results[1]) {
        await manager.revokeCode(results[1].codeId, 'test_statistics');
      }
      const stats = manager.getStatistics();
      expect(stats.totalCodes).toBe(2);
      expect(stats.usedCodes).toBe(1);
      expect(stats.revokedCodes).toBe(1);
      expect(stats.activeCodes).toBe(0);
      expect(stats.codesByType[VerificationCodeType.EMAIL_VERIFICATION]).toBe(1);
      expect(stats.codesByType[VerificationCodeType.SMS_VERIFICATION]).toBe(1);
      expect(stats.codesByChannel[DeliveryChannel.EMAIL]).toBe(1);
      expect(stats.codesByChannel[DeliveryChannel.SMS]).toBe(1);
      expect(stats.successRate).toBe(50); // 1 out of 2 codes used
    });
    test('should handle empty statistics', () => {
      const stats = manager.getStatistics();
      expect(stats.totalCodes).toBe(0);
      expect(stats.activeCodes).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageAttempts).toBe(0);
      expect(stats.averageCodeLifetime).toBe(0);
    });
  });
  describe('Security Events and Logging', () => {
    test('should emit security events', (done) => {
      manager.on('securityEvent', (event) => {
        expect(event.event).toBe(SecurityEvent.CODE_GENERATED);
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(event.details).toBeDefined();
        expect(event.ipAddress).toBe('192.168.1.1');
        expect(event.userAgent).toBe('Mozilla/5.0');
        done();
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-security-event',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'security@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateCode(genRequest);
    });
    test('should log invalid code attempts', async () => {
      let securityEventEmitted = false;
      manager.on('securityEvent', (event) => {
        if (event.event === SecurityEvent.INVALID_CODE_ATTEMPT) {
          securityEventEmitted = true;
        }
      });
      const valRequest: CodeValidationRequest = {
        userId: 'user-invalid-attempt',
        code: '999999',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      await manager.validateCode(valRequest);
      // Give the event emission time to process
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(securityEventEmitted).toBe(true);
    });
  });
  describe('Configuration Management', () => {
    test('should update configuration and emit event', (done) => {
      manager.on('configUpdated', (data) => {
        expect(data.config.defaultExpiration).toBe(5 * 60 * 1000); // 5 minutes
        expect(data.config.retryLimit).toBe(5);
        done();
      });
      manager.updateConfig({)
        defaultExpiration: 5 * 60 * 1000, // 5 minutes
        retryLimit: 5,
      });
    });
    test('should use custom configuration on initialization', () => {
      const customManager = new VerificationCodeManager({)
        defaultExpiration: 20 * 60 * 1000, // 20 minutes
        retryLimit: 10,
        rateLimitCount: 15,
        antiEnumerationDelay: 500,
      });
      expect(customManager).toBeDefined();
      customManager.destroy();
    });
  });
  describe('Cleanup and Destruction', () => {
    test('should perform cleanup and emit event', (done) => {
      manager.on('cleanupCompleted', (data) => {
        expect(data.codesRemoved).toBeGreaterThanOrEqual(0);
        expect(data.timestamp).toBeInstanceOf(Date);
        done();
      });
      // Trigger cleanup manually
      (manager as any).performCleanup();
    });
    test('should destroy manager and clean up resources', (done) => {
      manager.on('destroyed', () => {
        done();
      });
      manager.destroy();
    });
    test('should clean up expired codes', async () => {
      const quickCleanupManager = new VerificationCodeManager({)
        antiEnumerationDelay: 1,
        expirationTimes: {,
          [VerificationCodeType.EMAIL_VERIFICATION]: 1, // 1 millisecond
          [VerificationCodeType.SMS_VERIFICATION]: 1,
          [VerificationCodeType.TOTP_BACKUP]: 1,
          [VerificationCodeType.PASSWORD_RESET]: 1,
          [VerificationCodeType.ACCOUNT_RECOVERY]: 1,
          [VerificationCodeType.DEVICE_VERIFICATION]: 1,
          [VerificationCodeType.LOGIN_CONFIRMATION]: 1,
          [VerificationCodeType.TRANSACTION_APPROVAL]: 1
        }
      });
      const genRequest: CodeGenerationRequest = {
        userId: 'user-cleanup',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'cleanup@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await quickCleanupManager.generateCode(genRequest);
      expect(result).not.toBeNull();
      // Wait for code to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      // Mark code as expired by validating it
      const valRequest: CodeValidationRequest = {
        userId: 'user-cleanup',
        code: result!.code,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      await quickCleanupManager.validateCode(valRequest);
      const initialStats = quickCleanupManager.getStatistics();
      expect(initialStats.totalCodes).toBe(1);
      expect(initialStats.expiredCodes).toBe(1);
      // Mock cleanup to use shorter threshold
      (quickCleanupManager as any).performCleanup = function() {
        const now = new Date();
        const cleanupThreshold = new Date(now.getTime() - 1); // 1ms ago instead of 24 hours;
        let codesRemoved = 0;
        for (const [codeId, code] of this.codes) {
          const shouldCleanup = (;);
            code.status === CodeStatus.EXPIRED || 
            code.status === CodeStatus.USED ||
            code.status === CodeStatus.REVOKED
          ) && code.createdAt < cleanupThreshold;
          if (shouldCleanup) {
            this.codes.delete(codeId);
            codesRemoved++;
          }
        }
        this.emit('cleanupCompleted', {)
          codesRemoved,
          timestamp: now,
        });
      };
      // Trigger cleanup
      (quickCleanupManager as any).performCleanup();
      const finalStats = quickCleanupManager.getStatistics();
      expect(finalStats.totalCodes).toBe(0);
      quickCleanupManager.destroy();
    });
  });
  describe('Error Handling and Edge Cases', () => {
    test('should handle code generation errors gracefully', async () => {
      // Create a manager that will fail
      const failingManager = new VerificationCodeManager();
      // Override a critical method to cause failure
      (failingManager as any).generateCodeByFormat = () => {
        throw new Error('Code generation failed');
      };
      const genRequest: CodeGenerationRequest = {
        userId: 'user-error',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'error@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await failingManager.generateCode(genRequest);
      expect(result).toBeNull();
      failingManager.destroy();
    });
    test('should handle validation errors gracefully', async () => {
      const valRequest: CodeValidationRequest = {
        userId: 'user-error',
        code: '',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const validation = await manager.validateCode(valRequest);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBeDefined();
      expect(validation.riskScore).toBeGreaterThan(0);
    });
    test('should handle revocation of non-existent codes', async () => {
      const success = await manager.revokeCode('non-existent-code', 'test_revocation');
      expect(success).toBe(false);
    });
    test('should handle multiple revocations of same code', async () => {
      const genRequest: CodeGenerationRequest = {
        userId: 'user-multi-revoke',
        type: VerificationCodeType.EMAIL_VERIFICATION,
        deliveryChannel: DeliveryChannel.EMAIL,
        deliveryAddress: 'multirevoke@test.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateCode(genRequest);
      expect(result).not.toBeNull();
      // First revocation should succeed
      const firstRevoke = await manager.revokeCode(result!.codeId, 'first_revocation');
      expect(firstRevoke).toBe(true);
      // Second revocation should fail
      const secondRevoke = await manager.revokeCode(result!.codeId, 'second_revocation');
      expect(secondRevoke).toBe(false);
    });
  });
});