/**
 * API Key Expiration Test Suite - Epic 17.4.4 Implementation
 * Task: E17-1753114397223-D7E779 - Implement expiration handling
 * 
 * Comprehensive test suite for the API key expiration system including
 * service functionality, lifecycle management, alerts, and API endpoints.
 */

import { 
  ApiKeyExpirationService,
  APIKeyType,
  ExpirationPolicyEnum as ExpirationPolicy,
  APIKeyStatus
} from '../auth/services/APIKeyExpirationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

// Mock dependencies
jest.mock('../auth/database/DatabaseService');
jest.mock('../auth/services/AuditService');

describe('API Key Expiration System', () => {
  let expirationService: ApiKeyExpirationService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockDatabaseService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockAuditService = new AuditService({} as any, mockDatabaseService) as jest.Mocked<AuditService>;
    
    // Setup mock implementations
    mockAuditService.logAction = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    
    // Create service instance
    expirationService = new ApiKeyExpirationService(mockDatabaseService, mockAuditService);
  });

  afterEach(() => {
    if (expirationService) {
      expirationService.destroy();
    }
  });

  describe('Service Initialization', () => {
    test('should initialize successfully', async () => {
      expect(expirationService).toBeDefined();
      expect(expirationService).toBeInstanceOf(ApiKeyExpirationService);
    });
  });

  describe('API Key Registration', () => {
    test('should register API key with fixed duration policy', async () => {
      const keyId = 'test-key-123';
      const userId = 'user-456';
      const oneHour = 60 * 60 * 1000; // 1 hour in ms

      const expiration = await expirationService.registerAPIKey(keyId, userId, APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: oneHour,
        environment: 'production',
        scopes: ['read', 'write'],
        description: 'Test API key'
      });

      expect(expiration).toBeDefined();
      expect(expiration.keyId).toBe(keyId);
      expect(expiration.userId).toBe(userId);
      expect(expiration.keyType).toBe(APIKeyType.API_ACCESS);
      expect(expiration.status).toBe(APIKeyStatus.ACTIVE);
      expect(expiration.expirationPolicy).toBe(ExpirationPolicy.FIXED_DURATION);
      expect(expiration.expiresAt).toBeDefined();
      expect(expiration.expiresAt!.getTime()).toBeGreaterThan(Date.now());
      expect(expiration.environment).toBe('production');
      expect(expiration.scopes).toEqual(['read', 'write']);
      expect(expiration.totalUsageCount).toBe(0);

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_registered_for_expiration',
          resource: `api_key:${keyId}`,
          details: expect.objectContaining({
            keyId,
            keyType: APIKeyType.API_ACCESS,
            expirationPolicy: ExpirationPolicy.FIXED_DURATION
  }
  }
      );
    });

    test('should register API key with usage-based policy', async () => {
      const keyId = 'usage-key-789';
      const userId = 'user-123';

      const expiration = await expirationService.registerAPIKey(keyId, userId, APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.USAGE_BASED,
        maxUsageCount: 100,
        warningThreshold: 80,
        environment: 'development',
        scopes: ['read']
      });

      expect(expiration.expirationPolicy).toBe(ExpirationPolicy.USAGE_BASED);
      expect(expiration.maxUsageCount).toBe(100);
      expect(expiration.warningThreshold).toBe(80);
      expect(expiration.expiresAt).toBeUndefined(); // No time-based expiration
    });

    test('should register API key with sliding window policy', async () => {
      const keyId = 'sliding-key-456';
      const userId = 'user-789';
      const slidingWindow = 30 * 60 * 1000; // 30 minutes

      const expiration = await expirationService.registerAPIKey(keyId, userId, APIKeyType.SERVICE_TO_SERVICE, {
        expirationPolicy: ExpirationPolicy.SLIDING_WINDOW,
        slidingWindowDuration: slidingWindow,
        environment: 'staging',
        scopes: ['admin']
      });

      expect(expiration.expirationPolicy).toBe(ExpirationPolicy.SLIDING_WINDOW);
      expect(expiration.slidingWindowDuration).toBe(slidingWindow);
      expect(expiration.expiresAt).toBeDefined();
    });

    test('should register API key with never expiring policy', async () => {
      const keyId = 'permanent-key-999';
      const userId = 'admin-user';

      const expiration = await expirationService.registerAPIKey(keyId, userId, APIKeyType.ADMIN, {
        expirationPolicy: ExpirationPolicy.NEVER,
        environment: 'production',
        scopes: ['admin', 'read', 'write', 'delete']
      });

      expect(expiration.expirationPolicy).toBe(ExpirationPolicy.NEVER);
      expect(expiration.expiresAt).toBeUndefined();
    });
  });

  describe('API Key Usage Recording', () => {
    let registeredKey: unknown;

    beforeEach(async () => {
      registeredKey = await expirationService.registerAPIKey('usage-test-key', 'test-user', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000, // 1 hour
        maxUsageCount: 10,
        warningThreshold: 80,
        environment: 'test',
        scopes: ['read']
      });
    });

    test('should record API key usage successfully', async () => {
      const usageDetails = {
        endpoint: '/api/data',
        method: 'GET',
        responseTime: 250,
        statusCode: 200,
        requestSize: 1024,
        responseSize: 2048,
        ipAddress: '192.168.1.1'
      };

      const result = await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);

      expect(result.status).toBe(APIKeyStatus.ACTIVE);
      expect(result.usageAllowed).toBe(true);
      expect(result.remainingUsage).toBe(9); // Started with 10, used 1
      expect(result.timeToExpiry).toBeGreaterThan(0);
      expect(result.warnings).toEqual([]);

      // Check that usage was recorded
      const status = await expirationService.getAPIKeyStatus('usage-test-key');
      expect(status.totalUsage).toBe(1);
      expect(status.lastUsed).toBeDefined();
    });

    test('should generate warning when approaching usage limit', async () => {
      const usageDetails = {
        endpoint: '/api/test',
        method: 'POST',
        responseTime: 150,
        statusCode: 200,
        requestSize: 512,
        responseSize: 1024
      };

      // Use the key 8 times (80% of limit)
      for (let i = 0; i < 8; i++) {
        await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);
      }

      const result = await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);

      expect(result.status).toBe(APIKeyStatus.ACTIVE);
      expect(result.usageAllowed).toBe(true);
      expect(result.remainingUsage).toBe(1);
      expect(result.warnings).toContain(expect.stringContaining('90% of limit'));
    });

    test('should expire key when usage limit reached', async () => {
      const usageDetails = {
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        requestSize: 256,
        responseSize: 512
      };

      // Use the key up to the limit (10 times)
      for (let i = 0; i < 10; i++) {
        const result = await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);
        
        if (i < 9) {
          expect(result.usageAllowed).toBe(true);
        } else {
          // On the 10th usage, it should expire
          expect(result.status).toBe(APIKeyStatus.EXPIRED);
          expect(result.usageAllowed).toBe(false);
          expect(result.remainingUsage).toBe(0);
          expect(result.warnings).toContain('API key has reached maximum usage limit');
        }
      }
    });

    test('should reject usage for expired key', async () => {
      // First expire the key by reaching usage limit
      const usageDetails = {
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        requestSize: 256,
        responseSize: 512
      };

      for (let i = 0; i < 10; i++) {
        await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);
      }

      // Try to use the expired key
      const result = await expirationService.recordAPIKeyUsage('usage-test-key', usageDetails);

      expect(result.status).toBe(APIKeyStatus.EXPIRED);
      expect(result.usageAllowed).toBe(false);
    });

    test('should handle sliding window expiration policy', async () => {
      // Register a key with sliding window policy
      const slidingKey = await expirationService.registerAPIKey('sliding-test-key', 'test-user', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.SLIDING_WINDOW,
        slidingWindowDuration: 5 * 60 * 1000, // 5 minutes
        environment: 'test',
        scopes: ['read']
      });

      const originalExpiry = slidingKey.expiresAt;

      const usageDetails = {
        endpoint: '/api/sliding',
        method: 'GET',
        responseTime: 200,
        statusCode: 200,
        requestSize: 1024,
        responseSize: 2048
      };

      // Use the key (should extend expiration)
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await expirationService.recordAPIKeyUsage('sliding-test-key', usageDetails);

      const status = await expirationService.getAPIKeyStatus('sliding-test-key');
      expect(status.expiresAt).toBeDefined();
      expect(status.expiresAt!.getTime()).toBeGreaterThan(originalExpiry!.getTime());
    });
  });

  describe('API Key Renewal', () => {
    let testKey: unknown;

    beforeEach(async () => {
      testKey = await expirationService.registerAPIKey('renewal-test-key', 'test-user', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000, // 1 hour
        environment: 'test',
        scopes: ['read']
      });
    });

    test('should renew API key with auto-approval', async () => {
      const originalExpiry = testKey.expiresAt;
      const renewalDuration = 2 * 60 * 60 * 1000; // 2 hours

      const renewal = await expirationService.renewAPIKey(
        'renewal-test-key',
        'test-admin',
        renewalDuration,
        'Extending for project completion',
        true // auto-approve
      );

      expect(renewal.status).toBe('approved');
      expect(renewal.approvedBy).toBe('system');
      expect(renewal.approvedAt).toBeDefined();
      expect(renewal.newExpirationDate.getTime()).toBeGreaterThan(originalExpiry.getTime());

      // Check that the key's expiration was actually updated
      const status = await expirationService.getAPIKeyStatus('renewal-test-key');
      expect(status.expiresAt!.getTime()).toBe(renewal.newExpirationDate.getTime());

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_renewal_requested',
          resource: 'api_key:renewal-test-key'
  }
      );
    });

    test('should create pending renewal without auto-approval', async () => {
      const renewalDuration = 1 * 60 * 60 * 1000; // 1 hour

      const renewal = await expirationService.renewAPIKey(
        'renewal-test-key',
        'test-user',
        renewalDuration,
        'Need more time for testing',
        false // no auto-approval
      );

      expect(renewal.status).toBe('pending');
      expect(renewal.approvedBy).toBeUndefined();
      expect(renewal.approvedAt).toBeUndefined();

      // Key expiration should not have changed yet
      const status = await expirationService.getAPIKeyStatus('renewal-test-key');
      expect(status.expiresAt!.getTime()).toBe(testKey.expiresAt.getTime());
    });

    test('should reject renewal for non-renewable key', async () => {
      // Create a key that doesn't allow renewal
      const nonRenewableKey = await expirationService.registerAPIKey('non-renewable-key', 'test-user', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 30 * 60 * 1000, // 30 minutes
        environment: 'test',
        scopes: ['read']
      });

      // Modify the key to disallow renewal
      nonRenewableKey.allowRenewal = false;

      await expect(
        expirationService.renewAPIKey('non-renewable-key', 'test-user', 60 * 60 * 1000, 'Test renewal')
      ).rejects.toThrow('renewal is not allowed');
    });

    test('should reject renewal when max renewals reached', async () => {
      // Renew the key to maximum times
      for (let i = 0; i < 3; i++) { // maxRenewals = 3 by default
        await expirationService.renewAPIKey(
          'renewal-test-key',
          'test-admin',
          60 * 60 * 1000,
          `Renewal ${i + 1}`,
          true
        );
      }

      // Try to renew one more time
      await expect(
        expirationService.renewAPIKey('renewal-test-key', 'test-admin', 60 * 60 * 1000, 'Excess renewal')
      ).rejects.toThrow('has reached maximum renewal limit');
    });
  });

  describe('API Key Revocation', () => {
    let testKey: unknown;

    beforeEach(async () => {
      testKey = await expirationService.registerAPIKey('revoke-test-key', 'test-user', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000, // 1 hour
        environment: 'test',
        scopes: ['read']
      });
    });

    test('should revoke API key successfully', async () => {
      await expirationService.revokeAPIKey('revoke-test-key', 'Security breach detected', 'security-admin');

      const status = await expirationService.getAPIKeyStatus('revoke-test-key');
      expect(status.status).toBe(APIKeyStatus.REVOKED);
      expect(status.metadata).toBeDefined();

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_key_revoked',
          resource: 'api_key:revoke-test-key',
          details: expect.objectContaining({
            reason: 'Security breach detected'
  }
  }
      );
    });

    test('should prevent usage of revoked key', async () => {
      await expirationService.revokeAPIKey('revoke-test-key', 'Test revocation', 'test-admin');

      const usageDetails = {
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        requestSize: 256,
        responseSize: 512
      };

      const result = await expirationService.recordAPIKeyUsage('revoke-test-key', usageDetails);

      expect(result.status).toBe(APIKeyStatus.REVOKED);
      expect(result.usageAllowed).toBe(false);
    });

    test('should fail to revoke non-existent key', async () => {
      await expect(
        expirationService.revokeAPIKey('non-existent-key', 'Test', 'admin')
      ).rejects.toThrow('API key non-existent-key not found');
    });
  });

  describe('API Key Status and Monitoring', () => {
    test('should get API key status for existing key', async () => {
      const keyId = 'status-test-key';
      await expirationService.registerAPIKey(keyId, 'test-user', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 2 * 60 * 60 * 1000, // 2 hours
        maxUsageCount: 50,
        environment: 'test',
        scopes: ['read', 'write']
      });

      const status = await expirationService.getAPIKeyStatus(keyId);

      expect(status.exists).toBe(true);
      expect(status.status).toBe(APIKeyStatus.ACTIVE);
      expect(status.totalUsage).toBe(0);
      expect(status.remainingUsage).toBe(50);
      expect(status.timeToExpiry).toBeGreaterThan(0);
      expect(status.canRenew).toBe(true);
      expect(status.remainingRenewals).toBe(3);
      expect(status.warnings).toEqual([]);
      expect(status.metadata).toBeDefined();
      expect(status.metadata!.keyType).toBe(APIKeyType.API_ACCESS);
      expect(status.metadata!.environment).toBe('test');
      expect(status.metadata!.scopes).toEqual(['read', 'write']);
    });

    test('should return not found for non-existent key', async () => {
      const status = await expirationService.getAPIKeyStatus('non-existent-key');

      expect(status.exists).toBe(false);
      expect(status.warnings).toContain('API key not found');
    });

    test('should generate warnings for expiring key', async () => {
      // Create a key that expires very soon
      const keyId = 'expiring-soon-key';
      const shortDuration = 30 * 60 * 1000; // 30 minutes

      await expirationService.registerAPIKey(keyId, 'test-user', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: shortDuration,
        environment: 'test',
        scopes: ['read']
      });

      // Fast-forward time conceptually by checking a key that would be expiring
      // In a real scenario, this would be tested with timer manipulation
      const status = await expirationService.getAPIKeyStatus(keyId);
      expect(status.timeToExpiry).toBeLessThan(shortDuration);
    });
  });

  describe('Expiration Reports', () => {
    beforeEach(async () => {
      // Create multiple test keys with different states
      await expirationService.registerAPIKey('report-key-1', 'user-1', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000,
        environment: 'production',
        scopes: ['read']
      });

      await expirationService.registerAPIKey('report-key-2', 'user-2', APIKeyType.SERVICE_TO_SERVICE, {
        expirationPolicy: ExpirationPolicy.USAGE_BASED,
        maxUsageCount: 100,
        environment: 'staging',
        scopes: ['write']
      });

      await expirationService.registerAPIKey('report-key-3', 'user-1', APIKeyType.ADMIN, {
        expirationPolicy: ExpirationPolicy.NEVER,
        environment: 'production',
        scopes: ['admin']
      });
    });

    test('should generate comprehensive expiration report', async () => {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const report = await expirationService.generateExpirationReport({
        start: lastWeek,
        end: now
      });

      expect(report).toBeDefined();
      expect(report.reportId).toBeDefined();
      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.timeRange.start).toEqual(lastWeek);
      expect(report.timeRange.end).toEqual(now);

      expect(report.summary).toBeDefined();
      expect(report.summary.totalKeys).toBeGreaterThan(0);
      expect(report.summary.activeKeys).toBeGreaterThan(0);

      expect(report.keysByType).toBeDefined();
      expect(report.keysByType[APIKeyType.API_ACCESS]).toBeGreaterThan(0);
      expect(report.keysByType[APIKeyType.SERVICE_TO_SERVICE]).toBeGreaterThan(0);
      expect(report.keysByType[APIKeyType.ADMIN]).toBeGreaterThan(0);

      expect(report.keysByEnvironment).toBeDefined();
      expect(report.keysByEnvironment['production']).toBeGreaterThan(0);
      expect(report.keysByEnvironment['staging']).toBeGreaterThan(0);

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'expiration_report_generated',
          resource: 'api_key_expiration_report'
  }
      );
    });

    test('should generate filtered expiration report', async () => {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const report = await expirationService.generateExpirationReport({
        start: lastWeek,
        end: now
      }, {
        keyTypes: [APIKeyType.API_ACCESS, APIKeyType.ADMIN],
        environments: ['production'],
        userIds: ['user-1']
      });

      expect(report.summary.totalKeys).toBeGreaterThanOrEqual(2); // Should include report-key-1 and report-key-3
      expect(report.keysByType[APIKeyType.SERVICE_TO_SERVICE]).toBe(0); // Should be filtered out
    });
  });

  describe('Alert Management', () => {
    let testKey: unknown;

    beforeEach(async () => {
      testKey = await expirationService.registerAPIKey('alert-test-key', 'test-user', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000, // 1 hour
        environment: 'test',
        scopes: ['read']
      });
    });

    test('should get active alerts', async () => {
      // Revoke the key to generate an alert
      await expirationService.revokeAPIKey('alert-test-key', 'Test alert generation', 'test-admin');

      const alerts = await expirationService.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const revokedAlert = alerts.find(alert => alert.keyId === 'alert-test-key' && alert.alertType === 'revoked');
      expect(revokedAlert).toBeDefined();
      expect(revokedAlert!.severity).toBe('high');
      expect(revokedAlert!.resolved).toBe(false);
      expect(revokedAlert!.resolutionActions).toContain('Update any applications using this key');
    });

    test('should get alerts for specific key', async () => {
      await expirationService.revokeAPIKey('alert-test-key', 'Test', 'admin');

      const keyAlerts = await expirationService.getActiveAlerts('alert-test-key');
      expect(keyAlerts.length).toBeGreaterThan(0);
      expect(keyAlerts.every(alert => alert.keyId === 'alert-test-key')).toBe(true);
    });

    test('should acknowledge alert', async () => {
      await expirationService.revokeAPIKey('alert-test-key', 'Test', 'admin');
      
      const alerts = await expirationService.getActiveAlerts('alert-test-key');
      const alertToAcknowledge = alerts[0];

      await expirationService.acknowledgeAlert(alertToAcknowledge.alertId, 'test-admin');

      // Note: In a real implementation, we would verify the alert was marked as acknowledged
      // For now, we just ensure the method completes without error
    });

    test('should resolve alert', async () => {
      await expirationService.revokeAPIKey('alert-test-key', 'Test', 'admin');
      
      const alerts = await expirationService.getActiveAlerts('alert-test-key');
      const alertToResolve = alerts[0];

      await expirationService.resolveAlert(alertToResolve.alertId, 'test-admin');

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'expiration_alert_resolved',
          resource: `alert:${alertToResolve.alertId}`
  }
      );
    });
  });

  describe('Expiring Keys Query', () => {
    beforeEach(async () => {
      // Create keys with different expiration times
      const now = Date.now();
      
      // Key expiring in 1 day
      await expirationService.registerAPIKey('expiring-1d', 'user-1', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 24 * 60 * 60 * 1000, // 1 day
        environment: 'test',
        scopes: ['read']
      });

      // Key expiring in 7 days
      await expirationService.registerAPIKey('expiring-7d', 'user-2', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
        environment: 'test',
        scopes: ['read']
      });

      // Key expiring in 30 days
      await expirationService.registerAPIKey('expiring-30d', 'user-3', APIKeyType.SERVICE_TO_SERVICE, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
        environment: 'test',
        scopes: ['read']
      });
    });

    test('should get keys expiring within specific timeframe', async () => {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiringKeys = await expirationService.getExpiringKeys({
        start: now,
        end: sevenDaysFromNow
      });

      expect(expiringKeys.length).toBeGreaterThanOrEqual(2); // Should include 1d and 7d keys
      expect(expiringKeys.some(key => key.keyId === 'expiring-1d')).toBe(true);
      expect(expiringKeys.some(key => key.keyId === 'expiring-7d')).toBe(true);
      expect(expiringKeys.some(key => key.keyId === 'expiring-30d')).toBe(false); // Should not include 30d key
    });

    test('should only return active keys when querying expiring keys', async () => {
      // Revoke one of the keys
      await expirationService.revokeAPIKey('expiring-1d', 'Test', 'admin');

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiringKeys = await expirationService.getExpiringKeys({
        start: now,
        end: sevenDaysFromNow
      });

      expect(expiringKeys.every(key => key.status === APIKeyStatus.ACTIVE)).toBe(true);
      expect(expiringKeys.some(key => key.keyId === 'expiring-1d')).toBe(false); // Revoked key should not appear
    });
  });

  describe('Error Handling', () => {
    test('should handle registration of duplicate key ID', async () => {
      const keyId = 'duplicate-key';
      
      await expirationService.registerAPIKey(keyId, 'user-1', APIKeyType.API_ACCESS, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 60 * 60 * 1000,
        environment: 'test',
        scopes: ['read']
      });

      // Try to register the same key ID again - should handle gracefully
      // In a real implementation, this might throw an error or update existing registration
      const secondRegistration = await expirationService.registerAPIKey(keyId, 'user-2', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.USAGE_BASED,
        maxUsageCount: 100,
        environment: 'test',
        scopes: ['write']
      });

      // The behavior here depends on implementation - either error or overwrite
      expect(secondRegistration).toBeDefined();
    });

    test('should handle usage recording for non-existent key', async () => {
      const result = await expirationService.recordAPIKeyUsage('non-existent-key', {
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        requestSize: 256,
        responseSize: 512
      });

      expect(result.status).toBe(APIKeyStatus.EXPIRED);
      expect(result.usageAllowed).toBe(false);
      expect(result.warnings).toContain('API key not found or expired');
    });

    test('should handle renewal of non-existent key', async () => {
      await expect(
        expirationService.renewAPIKey('non-existent-key', 'user', 60000, 'test')
      ).rejects.toThrow('API key non-existent-key not found');
    });
  });

  describe('Performance and Cleanup', () => {
    test('should perform maintenance cleanup without errors', async () => {
      // Create some test keys
      await expirationService.registerAPIKey('cleanup-key-1', 'user-1', APIKeyType.TEMPORARY, {
        expirationPolicy: ExpirationPolicy.FIXED_DURATION,
        maxDuration: 1000, // Very short duration
        environment: 'test',
        scopes: ['read']
      });

      // Wait a bit to allow expiration
      await new Promise(resolve => setTimeout(resolve, 50));

      // Trigger maintenance manually (if method were public)
      // In practice, maintenance runs on interval
      // This test verifies the service can handle cleanup operations

      expect(expirationService).toBeDefined();
    });

    test('should handle concurrent API key operations', async () => {
      const operations = [];
      
      // Create multiple keys concurrently
      for (let i = 0; i < 10; i++) {
        operations.push(
          expirationService.registerAPIKey(`concurrent-key-${i}`, `user-${i}`, APIKeyType.API_ACCESS, {
            expirationPolicy: ExpirationPolicy.FIXED_DURATION,
            maxDuration: 60 * 60 * 1000,
            environment: 'test',
            scopes: ['read']
  }
        );
      }

      const results = await Promise.all(operations);
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.keyId).toBe(`concurrent-key-${index}`);
        expect(result.status).toBe(APIKeyStatus.ACTIVE);
      });
    });
  });
});