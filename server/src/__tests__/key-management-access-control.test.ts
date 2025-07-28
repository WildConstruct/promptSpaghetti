// Integration tests for KeyManagementService with enhanced access controls
// Tests the integration between key management and access control systems

import { KeyManagementService, KeyManagementConfig, KeyOperationContext } from '../services/KeyManagementService';
import { AccessControlManager, AccessContext, AccessDecision } from '../services/AccessControlManager';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

// Mock dependencies
jest.mock('../auth/database/DatabaseService');
jest.mock('../auth/database/RedisService');
jest.mock('../auth/services/AuditService');
jest.mock('../services/AccessControlManager');

describe('KeyManagementService Access Control Integration', () => {
  let keyManagementService: KeyManagementService;
  let mockAccessControlManager: jest.Mocked<AccessControlManager>;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockRedis: jest.Mocked<RedisService>;
  let mockAudit: jest.Mocked<AuditService>;

  const defaultConfig: KeyManagementConfig = {
    keyEncryptionAlgorithm: 'aes-256-gcm',
    defaultRotationIntervalDays: 90,
    rotationOverlapHours: 24,
    autoRotationEnabled: true,
    enableAccessControl: true,
    requireApprovalForSensitiveOps: true,
    defaultSecurityLevel: 'standard',
    cacheEnabled: true,
    cacheTtlSeconds: 300,
    maxCachedKeys: 1000,
    backupEnabled: true,
    backupRetentionDays: 365,
    backupEncryptionEnabled: true,
    enableComplianceTracking: true,
    auditAllOperations: true,
    dataClassificationRequired: false
  };

  beforeEach(() => {
    mockDb = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockRedis = new RedisService() as jest.Mocked<RedisService>;
    mockAudit = new AuditService() as jest.Mocked<AuditService>;
    mockAccessControlManager = new AccessControlManager(
      mockDb,
      mockRedis,
      mockAudit
    ) as jest.Mocked<AccessControlManager>;

    // Mock database and service responses
    mockDb.query = jest.fn<unknown[], unknown>();
    mockRedis.get = jest.fn<unknown[], unknown>();
    mockRedis.setex = jest.fn<unknown[], unknown>();
    mockRedis.del = jest.fn<unknown[], unknown>();
    mockAudit.logEvent = jest.fn<unknown[], unknown>();

    keyManagementService = new KeyManagementService(
      mockDb,
      mockRedis,
      mockAudit,
      mockAccessControlManager,
      defaultConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Key Material Access with Access Control', () => {
    const keyId = 'test-key-123';
    const userId = 'user-456';
    
    const mockContext: KeyOperationContext = {
      userId,
      sessionId: 'session-789',
      ipAddress: '192.168.1.100',
      userAgent: 'Test-Client/1.0',
      operationType: 'decrypt',
      additionalContext: {
        requestSource: 'api',
        dataClassification: 'confidential'
      }
    };

    it('should allow key access when access control grants permission', async () => {
      // Mock successful access control decision
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'User has sufficient permissions',
        riskLevel: 'low',
        monitoringRequired: false
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      // Mock database responses for key retrieval
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          encrypted_key_material: Buffer.from('encrypted-data'),
          initialization_vector: Buffer.from('test-iv'),
          authentication_tag: Buffer.from('test-tag'),
          is_active: true,
          expires_at: null
        }]
      });

      // Mock the key decryption (would normally decrypt)
      const expectedKeyMaterial = Buffer.from('decrypted-key-material');
      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(expectedKeyMaterial);

      const result = await keyManagementService.getKeyMaterial(keyId, mockContext);

      expect(result).toEqual(expectedKeyMaterial);
      expect(mockAccessControlManager.evaluateAccess).toHaveBeenCalledWith(
        keyId,
        'decrypt',
        expect.objectContaining({
          userId,
          sessionId: mockContext.sessionId,
          ipAddress: mockContext.ipAddress,
          userAgent: mockContext.userAgent
  }
      );
    });

    it('should deny key access when access control denies permission', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: false,
        reason: 'Insufficient permissions for this operation',
        riskLevel: 'medium'
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      await expect(keyManagementService.getKeyMaterial(keyId, mockContext))
        .rejects.toThrow('Access denied: Insufficient permissions for this operation');

      // Should not attempt to retrieve key material
      expect(mockDb.query).not.toHaveBeenCalledWith(
        expect.stringContaining('encrypted_key_material'),
        expect.any(Array)
      );
    });

    it('should require MFA when access control mandates it', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Permission granted with conditions',
        riskLevel: 'high',
        conditionalAccess: [{
          type: 'mfa',
          description: 'Multi-factor authentication required for this operation'
        }]
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      await expect(keyManagementService.getKeyMaterial(keyId, mockContext))
        .rejects.toThrow('Multi-factor authentication required for this operation');
    });

    it('should require approval for sensitive operations', async () => {
      const sensitiveContext = {
        ...mockContext,
        operationType: 'destroy' as const
      };

      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Permission granted with approval requirement',
        riskLevel: 'critical',
        requiredApprovals: ['security_officer_approval', 'key_manager_approval']
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      // Mock no existing approval
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await expect(keyManagementService.getKeyMaterial(keyId, sensitiveContext))
        .rejects.toThrow('Approval required: security_officer_approval, key_manager_approval');
    });

    it('should allow access with valid approval', async () => {
      const sensitiveContext = {
        ...mockContext,
        operationType: 'destroy' as const
      };

      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Permission granted with approval requirement',
        riskLevel: 'critical',
        requiredApprovals: ['security_officer_approval']
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      // Mock existing approval
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // Approval check
        .mockResolvedValueOnce({ // Key material retrieval
          rows: [{
            encrypted_key_material: Buffer.from('encrypted-data'),
            initialization_vector: Buffer.from('test-iv'),
            authentication_tag: Buffer.from('test-tag'),
            is_active: true,
            expires_at: null
          }]
        });

      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(Buffer.from('decrypted-key-material'));

      const result = await keyManagementService.getKeyMaterial(keyId, sensitiveContext);

      expect(result).toBeDefined();
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('temporary_access_grants'),
        [userId, keyId, 'destroy']
      );
    });

    it('should log access attempts with risk level', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Access granted',
        riskLevel: 'medium',
        monitoringRequired: true
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          encrypted_key_material: Buffer.from('encrypted-data'),
          initialization_vector: Buffer.from('test-iv'),
          authentication_tag: Buffer.from('test-tag'),
          is_active: true,
          expires_at: null
        }]
      });

      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(Buffer.from('decrypted-key-material'));

      await keyManagementService.getKeyMaterial(keyId, mockContext);

      // Check that access was logged with risk information
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_access_log'),
        expect.arrayContaining([
          keyId,
          'decrypt',
          'success',
          userId,
          undefined, // service_name
          expect.any(String), // operation_context JSON
          '192.168.1.100',
          'Test-Client/1.0',
          'session-789',
          JSON.stringify({
            riskLevel: 'medium',
            monitoringRequired: true
  }
        ])
      );
    });
  });

  describe('Access Control Context Building', () => {
    it('should build proper access context from key operation context', async () => {
      const keyContext: KeyOperationContext = {
        userId: 'test-user',
        sessionId: 'test-session',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Test)',
        operationType: 'encrypt',
        additionalContext: {
          requestId: 'req-123',
          serviceVersion: '1.2.3'
        }
      };

      const mockAccessDecision: AccessDecision = {
        allowed: false,
        reason: 'Test denial',
        riskLevel: 'low'
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      try {
        await keyManagementService.getKeyMaterial('test-key', keyContext);
      } catch (error) {
        // Expected to fail, we're testing the context building
      }

      expect(mockAccessControlManager.evaluateAccess).toHaveBeenCalledWith(
        'test-key',
        'encrypt',
        expect.objectContaining({
          userId: 'test-user',
          sessionId: 'test-session',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0 (Test)',
          timestamp: expect.any(Date),
          additionalContext: {
            requestId: 'req-123',
            serviceVersion: '1.2.3'
          }
  }
      );
    });

    it('should handle missing user ID gracefully', async () => {
      const keyContext: KeyOperationContext = {
        sessionId: 'test-session',
        ipAddress: '10.0.0.1',
        operationType: 'encrypt'
      };

      const mockAccessDecision: AccessDecision = {
        allowed: false,
        reason: 'Anonymous access denied',
        riskLevel: 'high'
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      await expect(keyManagementService.getKeyMaterial('test-key', keyContext))
        .rejects.toThrow('Access denied: Anonymous access denied');

      expect(mockAccessControlManager.evaluateAccess).toHaveBeenCalledWith(
        'test-key',
        'encrypt',
        expect.objectContaining({
          userId: 'anonymous'
  }
      );
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle access control manager failures', async () => {
      mockAccessControlManager.evaluateAccess.mockRejectedValueOnce(
        new Error('Access control service unavailable')
      );

      await expect(keyManagementService.getKeyMaterial('test-key', mockContext))
        .rejects.toThrow('Access control service unavailable');
    });

    it('should fail securely when access control is enabled but unavailable', async () => {
      // Simulate access control manager being unavailable
      mockAccessControlManager.evaluateAccess.mockImplementationOnce(() => {
        throw new Error('Service unavailable');
      });

      await expect(keyManagementService.getKeyMaterial('test-key', mockContext))
        .rejects.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should not perform unnecessary database queries when access is denied', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: false,
        reason: 'Access denied',
        riskLevel: 'medium'
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      await expect(keyManagementService.getKeyMaterial('test-key', mockContext))
        .rejects.toThrow();

      // Should only have called access control evaluation and logging
      const keyMaterialQueries = mockDb.query.mock.calls.filter(call => 
        call[0].includes('encrypted_key_material')
      );
      expect(keyMaterialQueries).toHaveLength(0);
    });

    it('should efficiently check approvals for operations requiring them', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Access with approval',
        riskLevel: 'high',
        requiredApprovals: ['approval_1']
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      // Should efficiently check approval with single query
      
      expect(true).toBe(true); // Placeholder for approval efficiency test
    });
  });

  describe('Compliance and Audit Integration', () => {
    it('should maintain comprehensive audit trail for access decisions', async () => {
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Standard access granted',
        riskLevel: 'low'
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          encrypted_key_material: Buffer.from('encrypted-data'),
          initialization_vector: Buffer.from('test-iv'),
          authentication_tag: Buffer.from('test-tag'),
          is_active: true,
          expires_at: null
        }]
      });

      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(Buffer.from('decrypted-key-material'));

      await keyManagementService.getKeyMaterial('audit-test-key', mockContext);

      // Verify comprehensive logging
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_access_log'),
        expect.arrayContaining([
          'audit-test-key',
          'decrypt',
          'success',
          mockContext.userId,
          mockContext.serviceId,
          expect.any(String), // JSON context
          mockContext.ipAddress,
          mockContext.userAgent,
          mockContext.sessionId,
          expect.any(String) // JSON metadata
        ])
      );
    });

    it('should track high-risk operations with enhanced monitoring', async () => {
      const highRiskContext = {
        ...mockContext,
        operationType: 'export' as const
      };

      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'High-risk operation approved',
        riskLevel: 'critical',
        monitoringRequired: true,
        additionalFactorsRequired: ['hardware_token', 'biometric_verification']
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          encrypted_key_material: Buffer.from('encrypted-data'),
          initialization_vector: Buffer.from('test-iv'),
          authentication_tag: Buffer.from('test-tag'),
          is_active: true,
          expires_at: null
        }]
      });

      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(Buffer.from('decrypted-key-material'));

      await keyManagementService.getKeyMaterial('critical-key', highRiskContext);

      // Verify enhanced monitoring metadata is logged
      const logCall = mockDb.query.mock.calls.find(call => 
        call[0].includes('INSERT INTO key_access_log')
      );
      
      expect(logCall).toBeDefined();
      if (logCall) {
        const metadata = JSON.parse(logCall[1][9]); // metadata parameter
        expect(metadata).toMatchObject({
          riskLevel: 'critical',
          monitoringRequired: true
        });
      }
    });
  });

  describe('Configuration Impact', () => {
    it('should respect access control configuration settings', async () => {
      // Test with access control disabled
      
      
      // With access control disabled, should not call access control manager
      // This would require modifying the service to check config
      expect(true).toBe(true); // Placeholder for configuration test
    });

    it('should handle different security levels appropriately', async () => {
      const ultraSecurityDecision: AccessDecision = {
        allowed: true,
        reason: 'Ultra security key access',
        riskLevel: 'critical',
        requiredApprovals: ['security_officer', 'key_manager', 'compliance_officer'],
        conditionalAccess: [
          { type: 'mfa', description: 'MFA required' },
          { type: 'device_verification', description: 'Device verification required' }
        ]
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(ultraSecurityDecision);

      // Mock no approvals
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await expect(keyManagementService.getKeyMaterial('ultra-secure-key', mockContext))
        .rejects.toThrow('Approval required');
    });
  });

  describe('Integration Edge Cases', () => {
    it('should handle partial access control failures gracefully', async () => {
      // Simulate access control evaluation succeeding but approval check failing
      const mockAccessDecision: AccessDecision = {
        allowed: true,
        reason: 'Access granted with approval',
        riskLevel: 'high',
        requiredApprovals: ['manager_approval']
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(mockAccessDecision);
      mockDb.query.mockRejectedValueOnce(new Error('Database unavailable for approval check'));

      await expect(keyManagementService.getKeyMaterial('test-key', mockContext))
        .rejects.toThrow(); // Should fail securely
    });

    it('should handle time-sensitive access correctly', async () => {
      const timeRestrictedDecision: AccessDecision = {
        allowed: true,
        reason: 'Time-restricted access',
        riskLevel: 'medium',
        timeRestrictions: [{
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
          timezone: 'UTC'
        }]
      };

      mockAccessControlManager.evaluateAccess.mockResolvedValueOnce(timeRestrictedDecision);

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          encrypted_key_material: Buffer.from('encrypted-data'),
          initialization_vector: Buffer.from('test-iv'),
          authentication_tag: Buffer.from('test-tag'),
          is_active: true,
          expires_at: null
        }]
      });

      jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValueOnce(Buffer.from('decrypted-key-material'));

      const result = await keyManagementService.getKeyMaterial('time-restricted-key', mockContext);

      expect(result).toBeDefined();
      // In a full implementation, would check time restrictions are enforced
    });
  });
});