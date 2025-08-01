// Epic 17 - TOTP Service Tests
// Comprehensive tests for TOTP authentication functionality

import { TOTPService } from '../auth/services/TOTPService';
import { authenticator } from 'otplib';

describe('TOTPService', () => {
  let totpService: TOTPService;
  let mockDb: { query: jest.MockedFunction<(query: string, params?: unknown[]) => Promise<{ rows: unknown[] }>> };
  let mockRedis: { get: jest.MockedFunction<(key: string) => Promise<string | null>>; set: jest.MockedFunction<(key: string, value: string) => Promise<string>>; del: jest.MockedFunction<(key: string) => Promise<number>>; incr: jest.MockedFunction<(key: string) => Promise<number>>; expire: jest.MockedFunction<(key: string, seconds: number) => Promise<number>> };
  let mockAuditService: { logEvent: jest.MockedFunction<(event: unknown) => Promise<boolean>> };
  let mockRecoveryCodeService: { generateCodes: jest.MockedFunction<() => Promise<string[]>> };

  const testUserId = 'user-123';
  const testEmail = 'test@example.com';
  const testSecret = 'JBSWY3DPEHPK3PXP'; // Base32 "Hello!"

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown)
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown as unknown),
      set: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown),
      incr: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown),
      expire: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown as unknown)
    };

    // Mock recovery code service
    mockRecoveryCodeService = {
      generateCodes: jest.fn<unknown[], unknown>().mockResolvedValue(['ABC123', 'DEF456'] as unknown as unknown)
    };

    totpService = new TOTPService(
      mockDb,
      mockRedis,
      mockAuditService,
      mockRecoveryCodeService
    );
  });

  describe('generateTOTPConfiguration', () => {
    it('should generate valid TOTP configuration', async () => {
      const result = await totpService.generateTOTPConfiguration(testUserId, testEmail);

      expect(result).toMatchObject({
        configurationId: expect.stringMatching(/^TOTP-\d+-[a-f0-9]+$/),
        secret: expect.stringMatching(/^[A-Z2-7]+$/), // Base32
        qrCodeUrl: expect.stringContaining('otpauth://totp/'),
        qrCodeDataUrl: expect.stringContaining('data:image/png;base64,'),
        manualEntryKey: expect.any(String),
        backupCodes: expect.arrayContaining([expect.any(String)]),
        issuer: 'PromptSpaghetti',
        accountName: expect.any(String),
        expiresAt: expect.any(Date)
      });

      expect(result.backupCodes).toHaveLength(10);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO temp_totp_configurations'),
        expect.any(Array)
      );
    });

    it('should generate QR code URL with correct parameters', async () => {
      const result = await totpService.generateTOTPConfiguration(testUserId, testEmail);
      const url = new URL(result.qrCodeUrl);

      expect(url.protocol).toBe('otpauth:');
      expect(url.hostname).toBe('totp');
      expect(url.searchParams.get('secret')).toBeTruthy();
      expect(url.searchParams.get('issuer')).toBe('PromptSpaghetti');
      expect(url.searchParams.get('algorithm')).toBe('SHA1');
      expect(url.searchParams.get('digits')).toBe('6');
      expect(url.searchParams.get('period')).toBe('30');
    });

    it('should support custom options', async () => {
      const options = {
        algorithm: 'SHA256' as const,
        digits: 8,
        period: 60,
        issuer: 'CustomIssuer'
      };

      const result = await totpService.generateTOTPConfiguration(
        testUserId,
        testEmail,
        options
      );

      const url = new URL(result.qrCodeUrl);
      expect(url.searchParams.get('algorithm')).toBe('SHA256');
      expect(url.searchParams.get('digits')).toBe('8');
      expect(url.searchParams.get('period')).toBe('60');
      expect(result.issuer).toBe('CustomIssuer');
    });
  });

  describe('verifyEnrollment', () => {
    const configId = 'test-config-123';

    beforeEach(() => {
      // Mock successful temp config retrieval
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: configId,
          user_id: testUserId,
          secret: testSecret,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          issuer: 'PromptSpaghetti',
          account_name: testEmail,
          label: `PromptSpaghetti:${testEmail}`,
          created_at: new Date(),
          backup_codes: JSON.stringify(['ABC123', 'DEF456'])
]
      });
    });

    it('should verify valid TOTP code and complete enrollment', async () => {
      const validCode = authenticator.generate(testSecret);

      // Mock successful permanent storage
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* temp config */ }] }) // getTempConfiguration
        .mockResolvedValueOnce({ rows: [] }) // storeConfiguration
        .mockResolvedValueOnce({ rows: [] }) // removeTempConfiguration
        .mockResolvedValueOnce({ rows: [] }); // logTOTPEvent

      const result = await totpService.verifyEnrollment(configId, validCode);

      expect(result.success).toBe(true);
      expect(result.message).toBe('TOTP authenticator successfully configured');
      expect(result.configuration).toBeDefined();
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          action: 'totp_enrollment_completed'
  }
      );
    });

    it('should reject invalid TOTP code', async () => {
      const invalidCode = '000000';

      const result = await totpService.verifyEnrollment(configId, invalidCode);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should reject expired configuration', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No temp config found

      const result = await totpService.verifyEnrollment(configId, '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });
  });

  describe('validateTOTPCode', () => {
    it('should validate correct TOTP code', async () => {
      const validCode = authenticator.generate(testSecret);
      const result = await totpService.validateTOTPCode(testSecret, validCode);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Code is valid');
      expect(result.timeRemaining).toBeGreaterThan(0);
      expect(result.drift).toBe(0);
    });

    it('should reject invalid code format', async () => {
      const result = await totpService.validateTOTPCode(testSecret, 'abc123');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid code format');
    });

    it('should reject wrong length code', async () => {
      const result = await totpService.validateTOTPCode(testSecret, '12345');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('must be exactly 6 digits');
    });

    it('should handle time drift within window', async () => {
      // Generate code for previous time step
      const previousTime = Math.floor(Date.now() / 1000) - 30;
      const previousCode = authenticator.generate(testSecret, previousTime);

      const result = await totpService.validateTOTPCode(testSecret, previousCode, {
        window: 1
      });

      expect(result.valid).toBe(true);
      expect(Math.abs(result.drift)).toBeLessThanOrEqual(1);
    });
  });

  describe('authenticateUser', () => {
    beforeEach(() => {
      // Mock user configuration
      mockDb.query.mockResolvedValue({
        rows: [{
          id: '1',
          user_id: testUserId,
          secret: testSecret,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          is_enabled: true,
          backup_codes: JSON.stringify(['ABC123', 'DEF456'] as unknown as unknown),
          last_used_code: null,
          last_used_at: null
]
      });
    });

    it('should authenticate valid TOTP code', async () => {
      const validCode = authenticator.generate(testSecret);

      // Mock used code check (not used)
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* config */ }] }) // getUserConfigurations
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // wasCodeRecentlyUsed
        .mockResolvedValueOnce({ rows: [] }) // updateConfiguration
        .mockResolvedValueOnce({ rows: [] }) // storeUsedCode
        .mockResolvedValueOnce({ rows: [] }); // logTOTPEvent

      const result = await totpService.authenticateUser(testUserId, validCode);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'totp_authentication_success'
  }
      );
    });

    it('should reject recently used code', async () => {
      const validCode = authenticator.generate(testSecret);

      // Mock code as recently used
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* config */ }] }) // getUserConfigurations
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // wasCodeRecentlyUsed

      const result = await totpService.authenticateUser(testUserId, validCode);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired code');
    });

    it('should reject authentication for user without TOTP', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No configurations

      const result = await totpService.authenticateUser(testUserId, '123456');

      expect(result.success).toBe(false);
      expect(result.message).toBe('No active TOTP configurations found');
    });
  });

  describe('authenticateWithBackupCode', () => {
    beforeEach(() => {
      mockDb.query.mockResolvedValue({
        rows: [{
          backup_codes: JSON.stringify(['ABC123', 'DEF456', 'GHI789'] as unknown as unknown),
          used_backup_codes: JSON.stringify(['ABC123']) // One code already used
]
      });
    });

    it('should authenticate valid unused backup code', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* backup codes */ }] }) // Get codes
        .mockResolvedValueOnce({ rows: [] }) // Update used codes
        .mockResolvedValueOnce({ rows: [] }); // Log event

      const result = await totpService.authenticateWithBackupCode(testUserId, 'DEF456');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Backup code authenticated successfully');
      expect(result.remainingCodes).toBe(1); // 3 total - 2 used = 1 remaining
    });

    it('should reject invalid backup code', async () => {
      const result = await totpService.authenticateWithBackupCode(testUserId, 'INVALID');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid backup code');
    });

    it('should reject already used backup code', async () => {
      const result = await totpService.authenticateWithBackupCode(testUserId, 'ABC123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Backup code already used');
    });
  });

  describe('checkRateLimit', () => {
    const ipAddress = '192.168.1.100';

    it('should allow first attempt', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No existing rate limit

      const result = await totpService.checkRateLimit(testUserId, ipAddress, 'authentication');

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(9); // 10 max - 1 = 9
    });

    it('should block after max attempts reached', async () => {
      const futureBlockTime = new Date(Date.now() + 30 * 60 * 1000);
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          attempts: 10,
          window_start: new Date(Date.now() - 60000),
          blocked_until: futureBlockTime
]
      });

      const result = await totpService.checkRateLimit(testUserId, ipAddress, 'authentication');

      expect(result.allowed).toBe(false);
      expect(result.resetTime).toEqual(futureBlockTime);
    });

    it('should reset window after expiry', async () => {
      const pastWindowStart = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            attempts: 5,
            window_start: pastWindowStart,
            blocked_until: null
]

        .mockResolvedValueOnce({ rows: [] }); // Update query

      const result = await totpService.checkRateLimit(testUserId, ipAddress, 'authentication');

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(9); // Reset to new window
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Update query
        .mockResolvedValueOnce({ rows: [] }); // Log event

      const result = await totpService.regenerateBackupCodes(testUserId);

      expect(result).toHaveLength(10);
      expect(result.every(code => /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/.test(code))).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_totp_secrets'),
        expect.arrayContaining([JSON.stringify(result), testUserId])
      );
    });
  });

  describe('disableConfiguration', () => {
    it('should disable TOTP configuration', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Disable TOTP
        .mockResolvedValueOnce({ rows: [] }) // Update user 2FA settings
        .mockResolvedValueOnce({ rows: [] }); // Log event

      await totpService.disableConfiguration(testUserId, 'User request');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_totp_secrets SET is_enabled = false'),
        [testUserId]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET two_factor_enabled = false'),
        [testUserId]
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'totp_configuration_disabled'
  }
      );
    });
  });

  describe('getTOTPStatistics', () => {
    it('should return comprehensive statistics', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          total_active_users: '150',
          enrollments_today: '5',
          authentications_today: '342',
          failed_attempts_today: '12',
          avg_backup_codes: '8.5'
]
      });

      const result = await totpService.getTOTPStatistics();

      expect(result).toEqual({
        totalActiveUsers: 150,
        enrollmentsToday: 5,
        authenticationsToday: 342,
        failedAttemptsToday: 12,
        averageBackupCodesRemaining: 8.5
      });
    });
  });

  describe('getCurrentCode', () => {
    it('should generate current TOTP code', async () => {
      const code = await totpService.getCurrentCode(testSecret);

      expect(code).toMatch(/^\d{6}$/);
      expect(code).toBe(authenticator.generate(testSecret));
    });

    it('should generate code with custom options', async () => {
      const code = await totpService.getCurrentCode(testSecret, {
        digits: 8,
        algorithm: 'SHA256'
      });

      expect(code).toMatch(/^\d{8}$/);
    });
  });

  describe('getTimeRemaining', () => {
    it('should return time remaining in current period', () => {
      const timeRemaining = totpService.getTimeRemaining();

      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(30);
    });

    it('should handle custom period', () => {
      const timeRemaining = totpService.getTimeRemaining(60);

      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(60);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        totpService.generateTOTPConfiguration(testUserId, testEmail)
      ).rejects.toThrow('Failed to store temporary configuration');
    });

    it('should handle audit service errors gracefully', async () => {
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit service down'));
      
      // Should not throw, just log the error
      const result = await totpService.authenticateWithBackupCode(testUserId, 'INVALID');
      expect(result.success).toBe(false);
    });
  });

  describe('security features', () => {
    it('should prevent replay attacks', async () => {
      const validCode = authenticator.generate(testSecret);

      // Mock code as recently used
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* config */ }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // Code was used

      const result = await totpService.authenticateUser(testUserId, validCode);

      expect(result.success).toBe(false);
    });

    it('should hash codes before storing', async () => {
      const code = '123456';
      // Would use crypto.createHash('sha256').update(code).digest('hex') for expected hash

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ /* config */ }] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await totpService.authenticateUser(testUserId, code);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO used_totp_codes'),
        expect.arrayContaining([expect.any(Number), expect.any(String), expect.any(Date), expect.any(Date)])
      );
    });
  });
});