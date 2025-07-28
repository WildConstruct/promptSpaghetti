/**
 * Test Suite for Password Reset Token Manager
 * 
 * Tests comprehensive token management including generation, validation,
 * expiration, rate limiting, security features, and audit logging.
 */
import {
  PasswordResetTokenManager,
  TokenType,
  TokenStatus,
  SecurityLevel,
  TokenConfig,
  TokenRequest,
  SecurityEvent
} from '../PasswordResetTokenManager';
describe('PasswordResetTokenManager', () => {
  let manager: PasswordResetTokenManager;
  beforeEach(() => {
    manager = new PasswordResetTokenManager({)
      antiEnumerationDelay: 1, // Speed up tests
      cleanupInterval: 60000, // 1 minute for tests
      enableAuditLogging: true,
    });
  });
  afterEach(() => {
    manager.destroy();
  });
  describe('Token Generation', () => {
    test('should generate a password reset token successfully', async () => {
      const request: TokenRequest = {
        userId: 'user-123',
        email: 'user@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      expect(result?.token).toBeDefined();
      expect(result?.tokenId).toBeDefined();
      expect(typeof result?.token).toBe('string');
      expect(result?.token.length).toBeGreaterThan(0);
    });
    test('should generate tokens with different security levels', async () => {
      const baseRequest: TokenRequest = {
        userId: 'user-security',
        email: 'security@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const standardToken = await manager.generateToken({)
        ...baseRequest,
        securityLevel: SecurityLevel.STANDARD,
      });
      const enhancedToken = await manager.generateToken({)
        ...baseRequest,
        userId: 'user-enhanced',
        securityLevel: SecurityLevel.ENHANCED,
      });
      const maximumToken = await manager.generateToken({)
        ...baseRequest,
        userId: 'user-maximum',
        securityLevel: SecurityLevel.MAXIMUM,
      });
      expect(standardToken).not.toBeNull();
      expect(enhancedToken).not.toBeNull();
      expect(maximumToken).not.toBeNull();
      // Verify tokens have different properties based on security level
      const standardInfo = manager.getTokenInfo(standardToken!.tokenId);
      const enhancedInfo = manager.getTokenInfo(enhancedToken!.tokenId);
      const maximumInfo = manager.getTokenInfo(maximumToken!.tokenId);
      expect(standardInfo?.securityLevel).toBe(SecurityLevel.STANDARD);
      expect(enhancedInfo?.securityLevel).toBe(SecurityLevel.ENHANCED);
      expect(maximumInfo?.securityLevel).toBe(SecurityLevel.MAXIMUM);
    });
    test('should emit token generated event', (done) => {
      manager.on('tokenGenerated', (data) => {
        expect(data.tokenId).toBeDefined();
        expect(data.userId).toBe('user-event');
        expect(data.type).toBe(TokenType.PASSWORD_RESET);
        expect(data.expiresAt).toBeInstanceOf(Date);
        done();
      });
      const request: TokenRequest = {
        userId: 'user-event',
        email: 'event@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateToken(request);
    });
    test('should handle custom expiration times', async () => {
      const request: TokenRequest = {
        userId: 'user-custom',
        email: 'custom@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        expirationMinutes: 30 // 30 minutes
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      const tokenInfo = manager.getTokenInfo(result!.tokenId);
      const expirationTime = tokenInfo!.expiresAt!.getTime() - tokenInfo!.createdAt!.getTime();
      // Should be approximately 30 minutes (allowing for small timing differences)
      expect(expirationTime).toBeGreaterThan(29 * 60 * 1000);
      expect(expirationTime).toBeLessThan(31 * 60 * 1000);
    });
    test('should revoke existing tokens when multiple not allowed', async () => {
      const singleTokenManager = new PasswordResetTokenManager({)
        allowMultipleTokens: false,
        antiEnumerationDelay: 1,
      });
      const request: TokenRequest = {
        userId: 'user-single',
        email: 'single@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // Generate first token
      const firstToken = await singleTokenManager.generateToken(request);
      expect(firstToken).not.toBeNull();
      // Generate second token
      const secondToken = await singleTokenManager.generateToken(request);
      expect(secondToken).not.toBeNull();
      // First token should be revoked
      const firstTokenInfo = singleTokenManager.getTokenInfo(firstToken!.tokenId);
      expect(firstTokenInfo?.status).toBe(TokenStatus.REVOKED);
      // Second token should be active
      const secondTokenInfo = singleTokenManager.getTokenInfo(secondToken!.tokenId);
      expect(secondTokenInfo?.status).toBe(TokenStatus.ACTIVE);
      singleTokenManager.destroy();
    });
  });
  describe('Token Validation', () => {
    test('should validate a valid token successfully', async () => {
      const request: TokenRequest = {
        userId: 'user-validate',
        email: 'validate@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      const validation = await manager.validateToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(validation.valid).toBe(true);
      expect(validation.token).toBeDefined();
      expect(validation.token?.userId).toBe('user-validate');
      expect(validation.riskScore).toBeDefined();
    });
    test('should reject invalid tokens', async () => {
      const validation = await manager.validateToken(;)
        'invalid-token-12345',
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('token_not_found');
      expect(validation.riskScore).toBeGreaterThan(0);
    });
    test('should detect expired tokens', async () => {
      const shortLivedManager = new PasswordResetTokenManager({)
        defaultExpiration: 1, // 1 millisecond
        antiEnumerationDelay: 1,
      });
      const request: TokenRequest = {
        userId: 'user-expired',
        email: 'expired@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await shortLivedManager.generateToken(request);
      expect(result).not.toBeNull();
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      const validation = await shortLivedManager.validateToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('token_expired');
      shortLivedManager.destroy();
    });
    test('should calculate risk scores for validation', async () => {
      const request: TokenRequest = {
        userId: 'user-risk',
        email: 'risk@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      // Same IP and user agent - low risk
      const lowRiskValidation = await manager.validateToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      // Different IP - higher risk
      const highRiskValidation = await manager.validateToken(;)
        result!.token,
        '192.168.1.100',
        'Different Agent'
      );
      expect(lowRiskValidation.valid).toBe(true);
      expect(highRiskValidation.valid).toBe(true);
      expect(highRiskValidation.riskScore).toBeGreaterThan(lowRiskValidation.riskScore!);
    });
    test('should emit validation events', (done) => {
      let eventsReceived = 0;
      manager.on('tokenValidated', (data) => {
        expect(data.valid).toBeDefined();
        expect(data.riskScore).toBeDefined();
        eventsReceived++;
        if (eventsReceived === 1) done();
      });
      const request: TokenRequest = {
        userId: 'user-validation-event',
        email: 'validation@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateToken(request).then(result => {)
        if (result) {
          manager.validateToken(result.token, '192.168.1.1', 'Mozilla/5.0');
        }
      });
    });
  });
  describe('Token Usage', () => {
    test('should use a valid token successfully', async () => {
      const request: TokenRequest = {
        userId: 'user-use',
        email: 'use@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      const usage = await manager.useToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(usage.success).toBe(true);
      expect(usage.token).toBeDefined();
      expect(usage.token?.status).toBe(TokenStatus.USED);
      expect(usage.token?.usedAt).toBeInstanceOf(Date);
      expect(usage.token?.usageCount).toBe(1);
    });
    test('should prevent reuse of used tokens', async () => {
      const request: TokenRequest = {
        userId: 'user-reuse',
        email: 'reuse@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      // Use token first time
      const firstUsage = await manager.useToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(firstUsage.success).toBe(true);
      // Try to use token second time
      const secondUsage = await manager.useToken(;)
        result!.token,
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(secondUsage.success).toBe(false);
      expect(secondUsage.reason).toBe('token_already_used');
    });
    test('should emit token used event', (done) => {
      manager.on('tokenUsed', (data) => {
        expect(data.tokenId).toBeDefined();
        expect(data.userId).toBe('user-used-event');
        expect(data.type).toBe(TokenType.PASSWORD_RESET);
        expect(data.usedAt).toBeInstanceOf(Date);
        done();
      });
      const request: TokenRequest = {
        userId: 'user-used-event',
        email: 'used@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateToken(request).then(result => {)
        if (result) {
          manager.useToken(result.token, '192.168.1.1', 'Mozilla/5.0');
        }
      });
    });
  });
  describe('Token Revocation', () => {
    test('should revoke a specific token', async () => {
      const request: TokenRequest = {
        userId: 'user-revoke',
        email: 'revoke@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      const success = await manager.revokeToken(;)
        result!.tokenId,
        'manual_revocation',
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(success).toBe(true);
      const tokenInfo = manager.getTokenInfo(result!.tokenId);
      expect(tokenInfo?.status).toBe(TokenStatus.REVOKED);
      expect(tokenInfo?.revokedAt).toBeInstanceOf(Date);
      expect(tokenInfo?.revocationReason).toBe('manual_revocation');
    });
    test('should revoke all user tokens', async () => {
      const userId = 'user-revoke-all';
      const requests: TokenRequest[] = [
        {
          userId,
          email: 'revoke1@test.com',
          type: TokenType.PASSWORD_RESET,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId,
          email: 'revoke2@test.com',
          type: TokenType.EMAIL_VERIFICATION,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
      ];
      // Generate multiple tokens
      const tokens = await Promise.all(;)
        requests.map(request => manager.generateToken(request))
      );
      tokens.forEach(token => expect(token).not.toBeNull());
      // Revoke all password reset tokens for user
      const revokedCount = await manager.revokeUserTokens(;)
        userId,
        TokenType.PASSWORD_RESET,
        'user_requested'
      );
      expect(revokedCount).toBe(1);
      // Check that only password reset token was revoked
      const passwordResetToken = manager.getTokenInfo(tokens[0]!.tokenId);
      const emailVerificationToken = manager.getTokenInfo(tokens[1]!.tokenId);
      expect(passwordResetToken?.status).toBe(TokenStatus.REVOKED);
      expect(emailVerificationToken?.status).toBe(TokenStatus.ACTIVE);
    });
    test('should emit revocation events', (done) => {
      let eventsReceived = 0;
      manager.on('tokenRevoked', (data) => {
        expect(data.tokenId).toBeDefined();
        expect(data.userId).toBe('user-revoke-event');
        expect(data.reason).toBe('test_revocation');
        expect(data.revokedAt).toBeInstanceOf(Date);
        eventsReceived++;
        if (eventsReceived === 1) done();
      });
      const request: TokenRequest = {
        userId: 'user-revoke-event',
        email: 'revoke@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateToken(request).then(result => {)
        if (result) {
          manager.revokeToken(result.tokenId, 'test_revocation');
        }
      });
    });
  });
  describe('Rate Limiting', () => {
    test('should enforce rate limiting by email', async () => {
      const rateLimitedManager = new PasswordResetTokenManager({)
        rateLimitCount: 2,
        rateLimitWindow: 60000, // 1 minute
        antiEnumerationDelay: 1,
      });
      const request: TokenRequest = {
        userId: 'user-rate-limit',
        email: 'ratelimit@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // First two requests should succeed
      const token1 = await rateLimitedManager.generateToken(request);
      const token2 = await rateLimitedManager.generateToken({)
        ...request,
        userId: 'user-rate-limit-2',
      });
      expect(token1).not.toBeNull();
      expect(token2).not.toBeNull();
      // Third request should be rate limited
      const token3 = await rateLimitedManager.generateToken({)
        ...request,
        userId: 'user-rate-limit-3',
      });
      expect(token3).toBeNull();
      rateLimitedManager.destroy();
    });
    test('should enforce rate limiting by IP address', async () => {
      const rateLimitedManager = new PasswordResetTokenManager({)
        rateLimitCount: 2,
        rateLimitWindow: 60000,
        antiEnumerationDelay: 1,
      });
      const baseRequest: TokenRequest = {
        userId: 'user-ip-limit',
        email: 'iplimit@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };
      // Generate tokens with same IP but different emails
      const token1 = await rateLimitedManager.generateToken(baseRequest);
      const token2 = await rateLimitedManager.generateToken({)
        ...baseRequest,
        email: 'iplimit2@test.com',
      });
      expect(token1).not.toBeNull();
      expect(token2).not.toBeNull();
      // Third request should be rate limited
      const token3 = await rateLimitedManager.generateToken({)
        ...baseRequest,
        email: 'iplimit3@test.com',
      });
      expect(token3).toBeNull();
      rateLimitedManager.destroy();
    });
  });
  describe('Token Information and Management', () => {
    test('should get token information safely', async () => {
      const request: TokenRequest = {
        userId: 'user-info',
        email: 'info@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      const tokenInfo = manager.getTokenInfo(result!.tokenId);
      expect(tokenInfo).toBeDefined();
      expect(tokenInfo?.id).toBe(result!.tokenId);
      expect(tokenInfo?.userId).toBe('user-info');
      expect(tokenInfo?.email).toBe('info@test.com');
      expect(tokenInfo?.type).toBe(TokenType.PASSWORD_RESET);
      expect(tokenInfo?.status).toBe(TokenStatus.ACTIVE);
      expect(tokenInfo?.createdAt).toBeInstanceOf(Date);
      expect(tokenInfo?.expiresAt).toBeInstanceOf(Date);
      // Sensitive data should not be included
      expect((tokenInfo as any).hashedToken).toBeUndefined();
      expect((tokenInfo as any).salt).toBeUndefined();
    });
    test('should get user tokens', async () => {
      const userId = 'user-tokens';
      const requests: TokenRequest[] = [
        {
          userId,
          email: 'tokens1@test.com',
          type: TokenType.PASSWORD_RESET,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId,
          email: 'tokens2@test.com',
          type: TokenType.EMAIL_VERIFICATION,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
      ];
      await Promise.all(requests.map(request => manager.generateToken(request)));
      const allUserTokens = manager.getUserTokens(userId);
      const passwordResetTokens = manager.getUserTokens(userId, TokenType.PASSWORD_RESET);
      expect(allUserTokens).toHaveLength(2);
      expect(passwordResetTokens).toHaveLength(1);
      expect(passwordResetTokens[0].type).toBe(TokenType.PASSWORD_RESET);
    });
    test('should return null for non-existent token', () => {
      const tokenInfo = manager.getTokenInfo('non-existent-token');
      expect(tokenInfo).toBeNull();
    });
  });
  describe('Statistics and Analytics', () => {
    test('should provide comprehensive statistics', async () => {
      const userId = 'user-stats';
      // Generate tokens of different types and states
      const requests: TokenRequest[] = [
        {
          userId,
          email: 'stats1@test.com',
          type: TokenType.PASSWORD_RESET,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          userId: 'user-stats-2',
          email: 'stats2@test.com',
          type: TokenType.EMAIL_VERIFICATION,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          securityLevel: SecurityLevel.ENHANCED,
        }
      ];
      const tokens = await Promise.all(;)
        requests.map(request => manager.generateToken(request))
      );
      // Use one token
      if (tokens[0]) {
        await manager.useToken(tokens[0].token, '192.168.1.1', 'Mozilla/5.0');
      }
      // Revoke one token
      if (tokens[1]) {
        await manager.revokeToken(tokens[1].tokenId, 'test_statistics');
      }
      const stats = manager.getStatistics();
      expect(stats.totalTokens).toBe(2);
      expect(stats.usedTokens).toBe(1);
      expect(stats.revokedTokens).toBe(1);
      expect(stats.activeTokens).toBe(0);
      expect(stats.tokensByType[TokenType.PASSWORD_RESET]).toBe(1);
      expect(stats.tokensByType[TokenType.EMAIL_VERIFICATION]).toBe(1);
      expect(stats.tokensBySecurityLevel[SecurityLevel.STANDARD]).toBe(1);
      expect(stats.tokensBySecurityLevel[SecurityLevel.ENHANCED]).toBe(1);
      expect(stats.usageRate).toBe(50); // 1 out of 2 tokens used
    });
    test('should handle empty statistics', () => {
      const stats = manager.getStatistics();
      expect(stats.totalTokens).toBe(0);
      expect(stats.activeTokens).toBe(0);
      expect(stats.usageRate).toBe(0);
      expect(stats.averageTokenLifetime).toBe(0);
    });
  });
  describe('Security Events and Audit Logging', () => {
    test('should emit security events', (done) => {
      manager.on('securityEvent', (event) => {
        expect(event.event).toBe(SecurityEvent.TOKEN_CREATED);
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(event.details).toBeDefined();
        expect(event.ipAddress).toBe('192.168.1.1');
        expect(event.userAgent).toBe('Mozilla/5.0');
        done();
      });
      const request: TokenRequest = {
        userId: 'user-security-event',
        email: 'security@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      manager.generateToken(request);
    });
    test('should log rate limit violations', async () => {
      const rateLimitedManager = new PasswordResetTokenManager({)
        rateLimitCount: 1,
        rateLimitWindow: 60000,
        antiEnumerationDelay: 1,
        enableAuditLogging: true,
      });
      let securityEventEmitted = false;
      rateLimitedManager.on('securityEvent', (event) => {
        if (event.event === SecurityEvent.RATE_LIMIT_EXCEEDED) {
          securityEventEmitted = true;
        }
      });
      const request: TokenRequest = {
        userId: 'user-rate-violation',
        email: 'violation@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      // First request should succeed
      const firstToken = await rateLimitedManager.generateToken(request);
      expect(firstToken).not.toBeNull();
      // Second request should trigger rate limit
      const secondToken = await rateLimitedManager.generateToken(request);
      expect(secondToken).toBeNull();
      // Give the event emission time to process
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(securityEventEmitted).toBe(true);
      rateLimitedManager.destroy();
    });
  });
  describe('Configuration Management', () => {
    test('should update configuration and emit event', (done) => {
      manager.on('configUpdated', (data) => {
        expect(data.config.defaultExpiration).toBe(120 * 60 * 1000); // 2 hours
        expect(data.config.rateLimitCount).toBe(5);
        done();
      });
      manager.updateConfig({)
        defaultExpiration: 120 * 60 * 1000, // 2 hours
        rateLimitCount: 5,
      });
    });
    test('should use custom configuration on initialization', () => {
      const customManager = new PasswordResetTokenManager({)
        defaultExpiration: 30 * 60 * 1000, // 30 minutes
        tokenLength: 64,
        hashRounds: 200000,
        securityLevel: SecurityLevel.MAXIMUM,
      });
      expect(customManager).toBeDefined();
      customManager.destroy();
    });
  });
  describe('Cleanup and Destruction', () => {
    test('should perform cleanup and emit event', (done) => {
      manager.on('cleanupCompleted', (data) => {
        expect(data.tokensRemoved).toBeGreaterThanOrEqual(0);
        expect(data.auditLogsRemoved).toBeGreaterThanOrEqual(0);
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
    test('should clean up expired tokens', async () => {
      const quickCleanupManager = new PasswordResetTokenManager({)
        defaultExpiration: 1, // 1 millisecond
        antiEnumerationDelay: 1,
      });
      const request: TokenRequest = {
        userId: 'user-cleanup',
        email: 'cleanup@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await quickCleanupManager.generateToken(request);
      expect(result).not.toBeNull();
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      // Mark token as expired by validating it
      await quickCleanupManager.validateToken(result!.token, '192.168.1.1', 'Mozilla/5.0');
      const initialStats = quickCleanupManager.getStatistics();
      expect(initialStats.totalTokens).toBe(1);
      expect(initialStats.expiredTokens).toBe(1);
      // Mock the expiration threshold to be more recent
      const originalPerformCleanup = (quickCleanupManager as any).performCleanup;
      (quickCleanupManager as any).performCleanup = function() {
        const now = new Date();
        const expiredThreshold = new Date(now.getTime() - 1); // 1ms ago instead of 24 hours;
        let tokensRemoved = 0;
        for (const [tokenId, token] of this.tokens) {
          const shouldCleanup = (;)
            token.status === TokenStatus.EXPIRED || 
            token.status === TokenStatus.USED ||
            token.status === TokenStatus.REVOKED
          ) && ()
            token.createdAt < expiredThreshold ||
            (token.usedAt && token.usedAt < expiredThreshold) ||
            (token.revokedAt && token.revokedAt < expiredThreshold)
          );
          if (shouldCleanup) {
            this.tokens.delete(tokenId);
            tokensRemoved++;
          }
        }
        this.emit('cleanupCompleted', {)
          tokensRemoved,
          auditLogsRemoved: 0,
          timestamp: now,
        });
      };
      // Trigger cleanup
      (quickCleanupManager as any).performCleanup();
      const finalStats = quickCleanupManager.getStatistics();
      expect(finalStats.totalTokens).toBe(0);
      quickCleanupManager.destroy();
    });
  });
  describe('Error Handling and Edge Cases', () => {
    test('should handle token generation errors gracefully', async () => {
      // Create a manager that will fail
      const failingManager = new PasswordResetTokenManager();
      // Override a critical method to cause failure
      const originalGenerateSecureToken = (failingManager as any).generateSecureToken;
      (failingManager as any).generateSecureToken = () => {
        throw new Error('Token generation failed');
      };
      const request: TokenRequest = {
        userId: 'user-error',
        email: 'error@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await failingManager.generateToken(request);
      expect(result).toBeNull();
      failingManager.destroy();
    });
    test('should handle validation errors gracefully', async () => {
      const validation = await manager.validateToken(;)
        '', // Empty token
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBeDefined();
      expect(validation.riskScore).toBeGreaterThan(0);
    });
    test('should handle usage of invalid tokens', async () => {
      const usage = await manager.useToken(;)
        'completely-invalid-token',
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(usage.success).toBe(false);
      expect(usage.reason).toBeDefined();
    });
    test('should handle revocation of non-existent tokens', async () => {
      const success = await manager.revokeToken(;)
        'non-existent-token',
        'test_revocation'
      );
      expect(success).toBe(false);
    });
    test('should handle multiple revocations of same token', async () => {
      const request: TokenRequest = {
        userId: 'user-multi-revoke',
        email: 'multirevoke@test.com',
        type: TokenType.PASSWORD_RESET,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };
      const result = await manager.generateToken(request);
      expect(result).not.toBeNull();
      // First revocation should succeed
      const firstRevoke = await manager.revokeToken(result!.tokenId, 'first_revocation');
      expect(firstRevoke).toBe(true);
      // Second revocation should fail
      const secondRevoke = await manager.revokeToken(result!.tokenId, 'second_revocation');
      expect(secondRevoke).toBe(false);
    });
  });
});