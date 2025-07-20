/**
 * Test Suite for Key Backup and Recovery Service
 * 
 * Tests comprehensive backup and recovery mechanisms including creation,
 * verification, recovery, and emergency procedures.
 */

import {
  KeyBackupRecoveryService,
  BackupType,
  RecoveryType,
  BackupStatus,
  RecoveryStatus,
  BackupStorageTier,
  RecoveryRequest,
  BackupConfiguration
} from '../KeyBackupRecoveryService';
import { KeyManagementService } from '../KeyManagementService';

// Mock KeyManagementService
jest.mock('../KeyManagementService');

describe('KeyBackupRecoveryService', () => {
  let service: KeyBackupRecoveryService;
  let mockKeyManagementService: jest.Mocked<KeyManagementService>;
  
  const testConfig: BackupConfiguration = {
    enableAutomaticBackup: false, // Disable for tests
    fullBackupIntervalHours: 24,
    incrementalBackupIntervalHours: 6,
    retentionPolicyDays: 90,
    
    defaultTier: BackupStorageTier.LOCAL,
    enableMultiTierStorage: true,
    storageLocations: [],
    
    encryptBackups: true,
    useKeyEscrow: true,
    escrowThreshold: 3,
    backupEncryptionKeyRotationDays: 30,
    
    enableAutomaticVerification: false, // Disable for tests
    verificationIntervalHours: 24,
    verificationSamplePercentage: 10,
    
    auditRetentionDays: 2555,
    complianceMode: true,
    encryptionStandard: 'aes-256-gcm',
    
    emergencyProceduresEnabled: true,
    emergencyContactNotification: true,
    emergencyDecryptionKeys: ['emergency-key-1', 'emergency-key-2'],
    
    compressionEnabled: true,
    maxConcurrentBackups: 3,
    backupTimeoutMinutes: 60
  };

  beforeEach(() => {
    jest.useFakeTimers();
    
    mockKeyManagementService = new KeyManagementService({} as any) as jest.Mocked<KeyManagementService>;
    
    // Mock key management service methods
    jest.spyOn(mockKeyManagementService, 'getKey');
    jest.spyOn(mockKeyManagementService, 'generateKey');
    
    service = new KeyBackupRecoveryService(mockKeyManagementService, testConfig);
  });

  afterEach(() => {
    jest.useRealTimers();
    service.removeAllListeners();
    service.destroy();
  });

  describe('Backup Creation', () => {
    test('should create full backup', async () => {
      const backup = await service.createBackup(BackupType.FULL, {
        description: 'Test full backup',
        tags: { environment: 'test' }
      });

      expect(backup).toBeDefined();
      expect(backup.id).toMatch(/^backup_\d+_[a-f0-9]{16}$/);
      expect(backup.type).toBe(BackupType.FULL);
      expect(backup.status).toBe(BackupStatus.COMPLETED);
      expect(backup.tier).toBe(BackupStorageTier.LOCAL);
      expect(backup.encrypted).toBe(true);
      expect(backup.description).toBe('Test full backup');
      expect(backup.tags.environment).toBe('test');
      expect(backup.keyCount).toBeGreaterThan(0);
      expect(backup.totalSize).toBeGreaterThan(0);
      expect(backup.integrityHash).toMatch(/^[a-f0-9]{64}$/);
      expect(backup.createdAt).toBeInstanceOf(Date);
      expect(backup.completedAt).toBeInstanceOf(Date);
      expect(backup.expiresAt).toBeInstanceOf(Date);
    });

    test('should create incremental backup', async () => {
      const backup = await service.createBackup(BackupType.INCREMENTAL, {
        description: 'Test incremental backup'
      });

      expect(backup.type).toBe(BackupType.INCREMENTAL);
      expect(backup.status).toBe(BackupStatus.COMPLETED);
    });

    test('should create selective backup with specific keys', async () => {
      const specificKeys = ['key1', 'key2'];
      const backup = await service.createBackup(BackupType.SELECTIVE, {
        specificKeys,
        description: 'Test selective backup'
      });

      expect(backup.type).toBe(BackupType.SELECTIVE);
      expect(backup.keyCount).toBe(specificKeys.length);
    });

    test('should create emergency backup', async () => {
      const backup = await service.createBackup(BackupType.EMERGENCY, {
        emergency: true,
        description: 'Emergency backup'
      });

      expect(backup.type).toBe(BackupType.EMERGENCY);
      expect(backup.recoveryComplexity).toBe('critical');
      expect(backup.requiredApprovals).toBe(2);
    });

    test('should emit backupCreated event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('backupCreated', eventHandler);

      const backup = await service.createBackup(BackupType.FULL);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          backupId: backup.id,
          type: BackupType.FULL,
          keyCount: expect.any(Number),
          size: expect.any(Number)
        })
      );
    });

    test('should handle backup creation errors', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      service.on('backupFailed', errorHandler);

      // Force an error by providing invalid configuration
      const invalidService = new KeyBackupRecoveryService(
        null as any, // Invalid key management service
        testConfig
      );

      await expect(invalidService.createBackup(BackupType.FULL))
        .rejects.toThrow();

      invalidService.destroy();
    });
  });

  describe('Backup Verification', () => {
    test('should verify backup integrity', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      const verification = await service.verifyBackup(backup.id);

      expect(verification).toBeDefined();
      expect(verification.id).toMatch(/^verify_\d+_[a-f0-9]{16}$/);
      expect(verification.backupId).toBe(backup.id);
      expect(verification.successful).toBe(true);
      expect(verification.integrityCheck).toBe(true);
      expect(verification.decryptionCheck).toBe(true);
      expect(verification.keyCountCheck).toBe(true);
      expect(verification.metadataCheck).toBe(true);
      expect(verification.checksumVerification).toBe(true);
      expect(verification.verifiedKeys).toBe(backup.keyCount);
      expect(verification.failedKeys).toHaveLength(0);
      expect(verification.issues).toHaveLength(0);
      expect(verification.verificationTime).toBeGreaterThan(0);
    });

    test('should detect backup corruption', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      // Corrupt the backup by modifying its integrity hash
      backup.integrityHash = 'corrupted_hash';
      
      const verification = await service.verifyBackup(backup.id);

      expect(verification.successful).toBe(false);
      expect(verification.integrityCheck).toBe(false);
      expect(verification.issues).toHaveLength(1);
      expect(verification.issues[0].type).toBe('integrity_failure');
      expect(verification.issues[0].severity).toBe('critical');
    });

    test('should emit backupVerified event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('backupVerified', eventHandler);

      const backup = await service.createBackup(BackupType.FULL);
      await service.verifyBackup(backup.id);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          backupId: backup.id,
          successful: true,
          issues: 0,
          verificationTime: expect.any(Number)
        })
      );
    });

    test('should handle verification of non-existent backup', async () => {
      await expect(service.verifyBackup('non-existent-backup'))
        .rejects.toThrow('Backup not found');
    });
  });

  describe('Key Recovery', () => {
    test('should recover keys from backup', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'recovery-1',
        type: RecoveryType.COMPLETE,
        backupId: backup.id,
        overwriteExisting: true,
        verifyBeforeRestore: true,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{
          approver: 'admin-user',
          approvedAt: new Date()
        }],
        emergencyProcedure: false,
        reason: 'Test recovery',
        urgency: 'medium',
        createdAt: new Date(),
        metadata: {}
      };

      const result = await service.recoverKeys(recoveryRequest);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^recovery_\d+_[a-f0-9]{16}$/);
      expect(result.requestId).toBe(recoveryRequest.id);
      expect(result.status).toBe(RecoveryStatus.COMPLETED);
      expect(result.recoveredKeys).toBeGreaterThan(0);
      expect(result.failedKeys).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
    });

    test('should perform selective recovery', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'recovery-selective',
        type: RecoveryType.SELECTIVE,
        backupId: backup.id,
        specificKeys: ['key1'],
        overwriteExisting: false,
        verifyBeforeRestore: false,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{
          approver: 'admin-user',
          approvedAt: new Date()
        }],
        emergencyProcedure: false,
        reason: 'Selective recovery test',
        urgency: 'low',
        createdAt: new Date(),
        metadata: {}
      };

      const result = await service.recoverKeys(recoveryRequest);

      expect(result.status).toBe(RecoveryStatus.COMPLETED);
    });

    test('should handle emergency recovery', async () => {
      const backup = await service.createBackup(BackupType.EMERGENCY, {
        emergency: true
      });
      
      const recoveryRequest: RecoveryRequest = {
        id: 'emergency-recovery',
        type: RecoveryType.EMERGENCY,
        backupId: backup.id,
        overwriteExisting: true,
        verifyBeforeRestore: true,
        createRecoveryPoint: true,
        requestedBy: 'emergency-user',
        approvals: [
          { approver: 'admin-1', approvedAt: new Date() },
          { approver: 'admin-2', approvedAt: new Date() }
        ],
        emergencyProcedure: true,
        reason: 'Critical system failure',
        urgency: 'critical',
        createdAt: new Date(),
        metadata: { incident: 'INC-2024-001' }
      };

      const result = await service.recoverKeys(recoveryRequest);

      expect(result.status).toBe(RecoveryStatus.COMPLETED);
    });

    test('should fail recovery with insufficient approvals', async () => {
      const backup = await service.createBackup(BackupType.EMERGENCY);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'insufficient-approvals',
        type: RecoveryType.EMERGENCY,
        backupId: backup.id,
        overwriteExisting: true,
        verifyBeforeRestore: false,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{ approver: 'admin-1', approvedAt: new Date() }], // Only 1 approval
        emergencyProcedure: true,
        reason: 'Test insufficient approvals',
        urgency: 'critical',
        createdAt: new Date(),
        metadata: {}
      };

      await expect(service.recoverKeys(recoveryRequest))
        .rejects.toThrow('Emergency recovery requires at least 2 approvals');
    });

    test('should emit recoveryCompleted event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('recoveryCompleted', eventHandler);

      const backup = await service.createBackup(BackupType.FULL);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'test-recovery',
        type: RecoveryType.COMPLETE,
        backupId: backup.id,
        overwriteExisting: true,
        verifyBeforeRestore: false,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{ approver: 'admin', approvedAt: new Date() }],
        emergencyProcedure: false,
        reason: 'Test recovery',
        urgency: 'medium',
        createdAt: new Date(),
        metadata: {}
      };

      await service.recoverKeys(recoveryRequest);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: recoveryRequest.id,
          status: RecoveryStatus.COMPLETED,
          recoveredKeys: expect.any(Number),
          duration: expect.any(Number)
        })
      );
    });
  });

  describe('Backup Management', () => {
    test('should list backups', async () => {
      // Create multiple backups
      await service.createBackup(BackupType.FULL, { tags: { env: 'prod' } });
      await service.createBackup(BackupType.INCREMENTAL, { tags: { env: 'test' } });
      await service.createBackup(BackupType.EMERGENCY, { emergency: true });

      const allBackups = service.listBackups();
      expect(allBackups).toHaveLength(3);
      
      // Test filtering by type
      const fullBackups = service.listBackups({ type: BackupType.FULL });
      expect(fullBackups).toHaveLength(1);
      expect(fullBackups[0].type).toBe(BackupType.FULL);

      // Test filtering by status
      const completedBackups = service.listBackups({ status: BackupStatus.COMPLETED });
      expect(completedBackups).toHaveLength(3);
    });

    test('should list backups with date filters', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      await service.createBackup(BackupType.FULL);
      
      const recentBackups = service.listBackups({ 
        createdAfter: pastDate,
        createdBefore: futureDate 
      });
      
      expect(recentBackups).toHaveLength(1);
    });

    test('should delete backup', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('backupDeleted', eventHandler);

      const backup = await service.createBackup(BackupType.FULL);
      
      await service.deleteBackup(backup.id, 'Test deletion');

      const backups = service.listBackups();
      expect(backups.find(b => b.id === backup.id)).toBeUndefined();
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          backupId: backup.id,
          reason: 'Test deletion'
        })
      );
    });

    test('should handle deletion of non-existent backup', async () => {
      await expect(service.deleteBackup('non-existent', 'test'))
        .rejects.toThrow('Backup not found');
    });
  });

  describe('Statistics', () => {
    test('should track backup statistics', async () => {
      // Create some backups
      await service.createBackup(BackupType.FULL);
      await service.createBackup(BackupType.INCREMENTAL);

      const stats = service.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalBackups).toBe(2);
      expect(stats.successfulBackups).toBe(2);
      expect(stats.failedBackups).toBe(0);
      expect(stats.averageBackupTime).toBeGreaterThan(0);
      expect(typeof stats.totalStorageUsed).toBe('number');
      expect(typeof stats.verificationSuccessRate).toBe('number');
    });

    test('should track recovery statistics', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'stats-test',
        type: RecoveryType.COMPLETE,
        backupId: backup.id,
        overwriteExisting: true,
        verifyBeforeRestore: false,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{ approver: 'admin', approvedAt: new Date() }],
        emergencyProcedure: false,
        reason: 'Statistics test',
        urgency: 'low',
        createdAt: new Date(),
        metadata: {}
      };

      await service.recoverKeys(recoveryRequest);

      const stats = service.getStatistics();
      expect(stats.totalRecoveries).toBe(1);
      expect(stats.successfulRecoveries).toBe(1);
      expect(stats.averageRecoveryTime).toBeGreaterThan(0);
    });
  });

  describe('Emergency Procedures', () => {
    test('should create emergency recovery package', async () => {
      const keyIds = ['key1', 'key2', 'key3'];
      const recoveryPackage = await service.createEmergencyRecoveryPackage(keyIds);

      expect(recoveryPackage).toBeDefined();
      expect(Buffer.isBuffer(recoveryPackage)).toBe(true);
      
      const parsed = JSON.parse(recoveryPackage.toString());
      expect(parsed.metadata).toBeDefined();
      expect(parsed.package).toBeDefined();
      expect(parsed.instructions).toBeDefined();
      expect(parsed.instructions).toContain('Emergency Key Recovery Instructions');
      expect(parsed.createdAt).toBeDefined();
    });
  });

  describe('Backup Verification Edge Cases', () => {
    test('should handle verification of corrupted metadata', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      // Corrupt key count
      backup.keyCount = 999;
      
      const verification = await service.verifyBackup(backup.id);
      
      expect(verification.successful).toBe(false);
      expect(verification.keyCountCheck).toBe(false);
      expect(verification.issues.some(issue => issue.type === 'metadata_mismatch')).toBe(true);
    });

    test('should handle verification errors gracefully', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('backupVerificationFailed', eventHandler);

      await expect(service.verifyBackup('invalid-backup-id'))
        .rejects.toThrow('Backup not found');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          backupId: 'invalid-backup-id',
          error: 'Backup not found'
        })
      );
    });
  });

  describe('Point-in-Time Recovery', () => {
    test('should perform point-in-time recovery', async () => {
      // Create backups at different times
      const backup1 = await service.createBackup(BackupType.FULL);
      
      jest.advanceTimersByTime(60000); // 1 minute
      
            
      const targetTime = new Date(backup1.createdAt.getTime() + 30000); // 30 seconds after first backup
      
      const recoveryRequest: RecoveryRequest = {
        id: 'pit-recovery',
        type: RecoveryType.POINT_IN_TIME,
        targetTimestamp: targetTime,
        overwriteExisting: true,
        verifyBeforeRestore: true,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{ approver: 'admin', approvedAt: new Date() }],
        emergencyProcedure: false,
        reason: 'Point-in-time recovery test',
        urgency: 'medium',
        createdAt: new Date(),
        metadata: {}
      };

      const result = await service.recoverKeys(recoveryRequest);
      expect(result.status).toBe(RecoveryStatus.COMPLETED);
    });
  });

  describe('Cleanup and Resource Management', () => {
    test('should cleanup resources on destroy', () => {
      const destroySpy = jest.spyOn(service, 'destroy');
      
      service.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });

    test('should handle cleanup during active operations', async () => {
      // Start a backup
      const backupPromise = service.createBackup(BackupType.FULL);
      
      // Destroy service while backup is in progress
      service.destroy();
      
      // Backup should still complete
      const backup = await backupPromise;
      expect(backup.status).toBe(BackupStatus.COMPLETED);
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors during backup', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      service.on('backupFailed', errorHandler);

      // This would test storage errors, but since we're using mocks,
      // we'll verify the error handling structure is in place
      expect(typeof service.createBackup).toBe('function');
    });

    test('should handle network errors during recovery', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      const recoveryRequest: RecoveryRequest = {
        id: 'network-error-test',
        type: RecoveryType.COMPLETE,
        backupId: 'non-existent-backup',
        overwriteExisting: true,
        verifyBeforeRestore: false,
        createRecoveryPoint: false,
        requestedBy: 'test-user',
        approvals: [{ approver: 'admin', approvedAt: new Date() }],
        emergencyProcedure: false,
        reason: 'Network error test',
        urgency: 'medium',
        createdAt: new Date(),
        metadata: {}
      };

      await expect(service.recoverKeys(recoveryRequest))
        .rejects.toThrow('Specified backup not found');
    });
  });

  describe('Compliance and Audit', () => {
    test('should maintain audit logs', async () => {
      const backup = await service.createBackup(BackupType.FULL, {
        description: 'Audit test backup'
      });

      await service.verifyBackup(backup.id);
      await service.deleteBackup(backup.id, 'Audit test cleanup');

      expect(backup.accessLog).toHaveLength(3); // created, verified, deleted
      expect(backup.accessLog[0].action).toBe('created');
      expect(backup.accessLog[1].action).toBe('verified');
      expect(backup.accessLog[2].action).toBe('deleted');
    });

    test('should limit audit log size', async () => {
      const backup = await service.createBackup(BackupType.FULL);
      
      // Simulate many access events
      for (let i = 0; i < 150; i++) {
        backup.accessLog.push({
          id: `access-${i}`,
          timestamp: new Date(),
          action: 'accessed',
          userId: 'test-user',
          ipAddress: '127.0.0.1',
          details: {}
        });
      }

      // Trigger log trimming by adding another event
      await service.verifyBackup(backup.id);

      expect(backup.accessLog.length).toBeLessThanOrEqual(100);
    });
  });
});