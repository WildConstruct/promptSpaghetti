// Key Management Service Tests
// Comprehensive tests for cryptographic key lifecycle management

import { 
  KeyManagementService,
  KeyManagementConfig,
  KeyGenerationRequest,
  KeyOperationContext
} from '../services/KeyManagementService';
import * as crypto from 'crypto';

describe('KeyManagementService', () => {
  let keyManagementService: KeyManagementService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let testConfig: KeyManagementConfig;

  const testUserId = 'user-123';

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown as unknown as unknown as unknown as unknown as unknown)
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown as unknown as unknown as unknown as unknown as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown as unknown as unknown as unknown as unknown as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown as unknown as unknown as unknown as unknown as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown as unknown as unknown as unknown as unknown as unknown)
    };

    // Test configuration
    testConfig = {
      keyEncryptionAlgorithm: 'aes-256-gcm',
      defaultRotationIntervalDays: 90,
      rotationOverlapHours: 24,
      autoRotationEnabled: true,
      enableAccessControl: true,
      requireApprovalForSensitiveOps: true,
      defaultSecurityLevel: 'standard',
      cacheEnabled: true,
      cacheTtlSeconds: 3600,
      maxCachedKeys: 1000,
      backupEnabled: true,
      backupRetentionDays: 365,
      backupEncryptionEnabled: true,
      enableComplianceTracking: true,
      auditAllOperations: true,
      dataClassificationRequired: false
    };

    keyManagementService = new KeyManagementService(
      mockDb,
      mockRedis,
      mockAuditService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMasterKey', () => {
    it('should generate master key for data encryption', async () => {
      const request: KeyGenerationRequest = {
        purpose: 'data_encryption',
        securityLevel: 'standard',
        makePrimary: true
      };

      const result = await keyManagementService.generateMasterKey(request);

      expect(result.keyId).toBeDefined();
      expect(result.keyId).toContain('data_encryption');
      expect(result.purpose).toBe('data_encryption');
      expect(result.algorithm).toBe('aes-256-gcm');
      expect(result.keyLength).toBe(256);
      expect(result.isActive).toBe(true);
      expect(result.isPrimary).toBe(true);
      expect(result.securityLevel).toBe('standard');
      expect(result.usageCount).toBe(0);
    });

    it('should generate key with custom parameters', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const request: KeyGenerationRequest = {
        purpose: 'token_signing',
        algorithm: 'hmac-sha256',
        keyLength: 512,
        securityLevel: 'high',
        expiresAt,
        maxUsageCount: 10000,
        complianceTags: { pci: true, classification: 'sensitive' }
      };

      const result = await keyManagementService.generateMasterKey(request);

      expect(result.algorithm).toBe('hmac-sha256');
      expect(result.keyLength).toBe(512);
      expect(result.securityLevel).toBe('high');
      expect(result.expiresAt).toEqual(expiresAt);
      expect(result.maxUsageCount).toBe(10000);
      expect(result.complianceTags).toEqual({ pci: true, classification: 'sensitive' });
    });

    it('should store encrypted key material in database', async () => {
      const request: KeyGenerationRequest = {
        purpose: 'session_encryption'
      };

      await keyManagementService.generateMasterKey(request);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO master_keys'),
        expect.arrayContaining([
          expect.stringContaining('session_encryption'), // keyId
          'session_encryption', // purpose
          'aes-256-gcm', // algorithm
          expect.any(Buffer), // encrypted_key_material
          'aes-256-gcm', // key_encryption_algorithm
          expect.any(Buffer), // initialization_vector
          expect.any(Buffer), // authentication_tag
          256, // key_length
          true, // is_active
          false, // is_primary
          undefined, // expires_at
          undefined, // max_usage_count
          'standard', // security_level
          null, // access_control_list
          null, // compliance_tags
          'KeyManagementService', // created_by
          false // approval_required
        ])
      );
    });

    it('should deactivate other primary keys when makePrimary is true', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // deactivate other primary keys
        .mockResolvedValueOnce({ rows: [] }) // insert new key
        .mockResolvedValueOnce({ rows: [] }); // backup

      const request: KeyGenerationRequest = {
        purpose: 'data_encryption',
        makePrimary: true
      };

      await keyManagementService.generateMasterKey(request);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE master_keys'),
        ['data_encryption']
      );
    });

    it('should create backup when backup is enabled', async () => {
      const request: KeyGenerationRequest = {
        purpose: 'api_signing'
      };

      // Mock backup creation
      const createBackupSpy = jest.spyOn(keyManagementService, 'createKeyBackup')
        .mockResolvedValue({
          backupId: 'backup-123',
          keyId: 'test-key',
          backupType: 'full',
          createdAt: new Date( as unknown as unknown),
          verified: false
        });

      await keyManagementService.generateMasterKey(request);

      expect(createBackupSpy).toHaveBeenCalledWith(
        expect.stringContaining('api_signing'),
        'full'
      );
    });

    it('should validate key generation request', async () => {
      const invalidRequest = {
        purpose: 'invalid_purpose' as any
      };

      await expect(
        keyManagementService.generateMasterKey(invalidRequest)
      ).rejects.toThrow('Invalid key purpose');
    });

    it('should validate key length', async () => {
      const invalidRequest: KeyGenerationRequest = {
        purpose: 'data_encryption',
        keyLength: 100 // Invalid length
      };

      await expect(
        keyManagementService.generateMasterKey(invalidRequest)
      ).rejects.toThrow('Invalid key length');
    });
  });

  describe('getMasterKey', () => {
    it('should retrieve key from cache if available', async () => {
      const cachedKey = {
        keyId: 'test-key-123',
        purpose: 'data_encryption',
        algorithm: 'aes-256-gcm',
        keyLength: 256,
        isActive: true
      };

      mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedKey));

      const result = await keyManagementService.getMasterKey('test-key-123');

      expect(result).toEqual(cachedKey);
      expect(mockDb.query).not.toHaveBeenCalled();
      expect(mockRedis.get).toHaveBeenCalledWith('master_key:test-key-123');
    });

    it('should retrieve key from database if not cached', async () => {
      const dbKey = {
        key_id: 'test-key-123',
        purpose: 'token_signing',
        algorithm: 'hmac-sha256',
        key_length: 256,
        key_version: 1,
        is_active: true,
        is_primary: false,
        created_at: new Date(),
        usage_count: '42',
        security_level: 'high'
      };

      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({ rows: [dbKey] });

      const result = await keyManagementService.getMasterKey('test-key-123');

      expect(result?.keyId).toBe('test-key-123');
      expect(result?.purpose).toBe('token_signing');
      expect(result?.usageCount).toBe(42);
      expect(result?.securityLevel).toBe('high');
    });

    it('should cache retrieved key', async () => {
      const dbKey = {
        key_id: 'test-key-123',
        purpose: 'data_encryption',
        algorithm: 'aes-256-gcm',
        key_length: 256,
        key_version: 1,
        is_active: true,
        is_primary: true,
        created_at: new Date(),
        usage_count: '0',
        security_level: 'standard'
      };

      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({ rows: [dbKey] });

      await keyManagementService.getMasterKey('test-key-123');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'master_key:test-key-123',
        3600,
        expect.stringContaining('test-key-123')
      );
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyManagementService.getMasterKey('non-existent');

      expect(result).toBeNull();
    });

    it('should log key access when context provided', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'view_metadata',
        ipAddress: '192.168.1.1'
      };

      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ keyId: 'test-key' }));

      await keyManagementService.getMasterKey('test-key', context);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_access_log'),
        expect.arrayContaining(['test-key', 'view_metadata', 'success'])
      );
    });
  });

  describe('getKeyMaterial', () => {
    it('should decrypt and return key material for authorized access', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'encrypt'
      };

      // Mock access validation
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] }) // validate access
        .mockResolvedValueOnce({ // get encrypted key material
          rows: [{
            encrypted_key_material: Buffer.from('encrypted'),
            initialization_vector: Buffer.from('iv'),
            authentication_tag: Buffer.from('tag'),
            is_active: true,
            expires_at: null
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // log access

      // Mock decryption
      const mockDecrypt = jest.spyOn(keyManagementService as any, 'decryptKeyMaterial')
        .mockReturnValue(Buffer.from('decrypted-key-material' as unknown as unknown as unknown as unknown as unknown as unknown));

      const result = await keyManagementService.getKeyMaterial('test-key', context);

      expect(result).toEqual(Buffer.from('decrypted-key-material'));
      expect(mockDecrypt).toHaveBeenCalled();
    });

    it('should deny access for unauthorized users', async () => {
      const context: KeyOperationContext = {
        userId: 'unauthorized-user',
        operationType: 'decrypt'
      };

      // Mock access validation failure
      mockDb.query.mockResolvedValueOnce({ rows: [{ access_allowed: false }] });

      await expect(
        keyManagementService.getKeyMaterial('test-key', context)
      ).rejects.toThrow('Access denied');
    });

    it('should reject access to inactive keys', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'encrypt'
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] })
        .mockResolvedValueOnce({
          rows: [{
            encrypted_key_material: Buffer.from('encrypted'),
            is_active: false, // Inactive key
            expires_at: null
          }]
        });

      await expect(
        keyManagementService.getKeyMaterial('test-key', context)
      ).rejects.toThrow('Key is not active');
    });

    it('should reject access to expired keys', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'encrypt'
      };

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] })
        .mockResolvedValueOnce({
          rows: [{
            encrypted_key_material: Buffer.from('encrypted'),
            is_active: true,
            expires_at: pastDate // Expired
          }]
        });

      await expect(
        keyManagementService.getKeyMaterial('test-key', context)
      ).rejects.toThrow('Key has expired');
    });
  });

  describe('rotateKey', () => {
    it('should rotate key and generate new one', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'rotate'
      };

      const currentKey = {
        keyId: 'old-key-123',
        purpose: 'data_encryption' as const,
        algorithm: 'aes-256-gcm',
        keyLength: 256,
        securityLevel: 'standard',
        isPrimary: true,
        isActive: true,
        keyVersion: 1,
        usageCount: 100,
        createdAt: new Date()
      };

      // Mock getMasterKey
      jest.spyOn(keyManagementService, 'getMasterKey')
        .mockResolvedValue(currentKey as unknown as unknown as unknown as unknown as unknown as unknown);

      // Mock access validation
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] }) // validate access
        .mockResolvedValueOnce({ rows: [] }) // deactivate other primary keys
        .mockResolvedValueOnce({ rows: [] }) // insert new key
        .mockResolvedValueOnce({ rows: [] }) // backup new key
        .mockResolvedValueOnce({ rows: [] }); // update old key

      const newKey = await keyManagementService.rotateKey('old-key-123', context);

      expect(newKey.purpose).toBe('data_encryption');
      expect(newKey.algorithm).toBe('aes-256-gcm');
      expect(newKey.keyLength).toBe(256);
      expect(newKey.isPrimary).toBe(true);
      expect(newKey.keyId).not.toBe('old-key-123');

      // Check that old key was marked as rotated
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE master_keys'),
        expect.arrayContaining(['old-key-123'])
      );
    });

    it('should deny rotation for unauthorized users', async () => {
      const context: KeyOperationContext = {
        userId: 'unauthorized-user',
        operationType: 'rotate'
      };

      jest.spyOn(keyManagementService, 'getMasterKey')
        .mockResolvedValue({
          keyId: 'test-key',
          purpose: 'data_encryption',
          algorithm: 'aes-256-gcm',
          keyLength: 256,
          keyVersion: 1,
          isActive: true,
          isPrimary: true,
          createdAt: new Date( as unknown as unknown),
          usageCount: 0,
          securityLevel: 'standard'
        });

      // Mock access validation failure
      mockDb.query.mockResolvedValueOnce({ rows: [{ access_allowed: false }] });

      await expect(
        keyManagementService.rotateKey('test-key', context)
      ).rejects.toThrow('Access denied for key rotation');
    });

    it('should handle non-existent key', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'rotate'
      };

      jest.spyOn(keyManagementService, 'getMasterKey')
        .mockResolvedValue(null as unknown as unknown as unknown as unknown as unknown as unknown);

      await expect(
        keyManagementService.rotateKey('non-existent', context)
      ).rejects.toThrow('Key not found');
    });
  });

  describe('destroyKey', () => {
    it('should destroy key with proper authorization', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'destroy'
      };

      // Mock access validation
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] }) // validate access
        .mockResolvedValueOnce({ rows: [] }) // backup
        .mockResolvedValueOnce({ rows: [] }); // mark as destroyed

      // Mock backup creation
      jest.spyOn(keyManagementService, 'createKeyBackup')
        .mockResolvedValue({
          backupId: 'backup-123',
          keyId: 'test-key',
          backupType: 'full',
          createdAt: new Date( as unknown as unknown),
          verified: false
        });

      const result = await keyManagementService.destroyKey(
        'test-key',
        context,
        'Security incident'
      );

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE master_keys'),
        expect.arrayContaining(['test-key'])
      );
    });

    it('should deny destruction for unauthorized users', async () => {
      const context: KeyOperationContext = {
        userId: 'unauthorized-user',
        operationType: 'destroy'
      };

      // Mock access validation failure
      mockDb.query.mockResolvedValueOnce({ rows: [{ access_allowed: false }] });

      await expect(
        keyManagementService.destroyKey('test-key', context, 'reason')
      ).rejects.toThrow('Access denied for key destruction');
    });

    it('should create backup before destruction', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'destroy'
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ access_allowed: true }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const createBackupSpy = jest.spyOn(keyManagementService, 'createKeyBackup')
        .mockResolvedValue({
          backupId: 'backup-123',
          keyId: 'test-key',
          backupType: 'full',
          createdAt: new Date( as unknown as unknown),
          verified: false
        });

      await keyManagementService.destroyKey('test-key', context, 'Migration');

      expect(createBackupSpy).toHaveBeenCalledWith('test-key', 'full');
    });
  });

  describe('createKeyBackup', () => {
    it('should create full backup with encrypted data', async () => {
      const keyData = {
        key_id: 'test-key',
        purpose: 'data_encryption',
        encrypted_key_material: Buffer.from('encrypted')
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [keyData] }) // get key data
        .mockResolvedValueOnce({ rows: [] }); // insert backup

      // Mock backup encryption
      const mockEncrypt = jest.spyOn(keyManagementService as any, 'encryptBackupData')
        .mockReturnValue({
          encryptedData: Buffer.from('encrypted-backup' as unknown as unknown as unknown as unknown as unknown as unknown),
          iv: Buffer.from('iv')
        });

      const backup = await keyManagementService.createKeyBackup('test-key', 'full');

      expect(backup.keyId).toBe('test-key');
      expect(backup.backupType).toBe('full');
      expect(backup.backupId).toContain('backup_');
      expect(mockEncrypt).toHaveBeenCalled();
    });

    it('should create metadata-only backup', async () => {
      const keyMetadata = {
        key_id: 'test-key',
        purpose: 'token_signing',
        algorithm: 'hmac-sha256',
        key_length: 256
      };

      mockDb.query
        .mockResolvedValueOnce({ rows: [keyMetadata] })
        .mockResolvedValueOnce({ rows: [] });

      jest.spyOn(keyManagementService as any, 'encryptBackupData')
        .mockReturnValue({
          encryptedData: Buffer.from('encrypted-metadata' as unknown as unknown as unknown as unknown as unknown as unknown),
          iv: Buffer.from('iv')
        });

      const backup = await keyManagementService.createKeyBackup('test-key', 'metadata_only');

      expect(backup.backupType).toBe('metadata_only');
    });

    it('should calculate backup checksum', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ key_id: 'test' }] })
        .mockResolvedValueOnce({ rows: [] });

      jest.spyOn(keyManagementService as any, 'encryptBackupData')
        .mockReturnValue({
          encryptedData: Buffer.from('encrypted' as unknown as unknown as unknown as unknown as unknown as unknown),
          iv: Buffer.from('iv')
        });

      await keyManagementService.createKeyBackup('test-key', 'full');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_backups'),
        expect.arrayContaining([
          'test-key',
          expect.stringContaining('backup_'),
          expect.any(Buffer),
          expect.any(String), // checksum
          'full'
        ])
      );
    });
  });

  describe('checkRotationRequirements', () => {
    it('should identify keys needing rotation', async () => {
      const rotationNeeded = [
        { key_id: 'key1', reason: 'Rotation interval exceeded' },
        { key_id: 'key2', reason: 'Usage count limit reached' }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: rotationNeeded });

      const result = await keyManagementService.checkRotationRequirements();

      expect(result).toHaveLength(2);
      expect(result[0].keyId).toBe('key1');
      expect(result[0].reason).toBe('Rotation interval exceeded');
      expect(result[1].keyId).toBe('key2');
      expect(result[1].reason).toBe('Usage count limit reached');
    });

    it('should return empty array when no rotation needed', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyManagementService.checkRotationRequirements();

      expect(result).toEqual([]);
    });
  });

  describe('listKeys', () => {
    it('should list keys with filtering', async () => {
      const keys = [
        {
          key_id: 'key1',
          purpose: 'data_encryption',
          algorithm: 'aes-256-gcm',
          key_length: 256,
          is_active: true,
          created_at: new Date()
        },
        {
          key_id: 'key2',
          purpose: 'token_signing',
          algorithm: 'hmac-sha256',
          key_length: 256,
          is_active: true,
          created_at: new Date()
        }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: keys });

      const result = await keyManagementService.listKeys({
        purpose: 'data_encryption',
        isActive: true,
        limit: 10
      });

      expect(result).toHaveLength(2);
      expect(result[0].keyId).toBe('key1');
      expect(result[1].keyId).toBe('key2');
    });

    it('should handle pagination', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await keyManagementService.listKeys({
        limit: 25,
        offset: 50
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1 OFFSET $2'),
        expect.arrayContaining([25, 50])
      );
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        keyManagementService.generateMasterKey({
          purpose: 'data_encryption'
        })
      ).rejects.toThrow('Failed to generate master key');
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));
      mockDb.query.mockResolvedValueOnce({ rows: [{ key_id: 'test' }] });

      // Should not throw even if Redis fails
      const result = await keyManagementService.getMasterKey('test-key');
      expect(result).toBeDefined();
    });

    it('should handle audit service errors gracefully', async () => {
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit service down'));

      // Should not throw even if audit fails
      const result = await keyManagementService.generateMasterKey({
        purpose: 'session_encryption'
      });
      expect(result).toBeDefined();
    });
  });

  describe('security features', () => {
    it('should encrypt key material before storage', async () => {
      const mockEncrypt = jest.spyOn(keyManagementService as any, 'encryptKeyMaterial')
        .mockReturnValue({
          encryptedData: Buffer.from('encrypted' as unknown as unknown as unknown as unknown as unknown as unknown),
          iv: Buffer.from('iv'),
          authTag: Buffer.from('tag')
        });

      await keyManagementService.generateMasterKey({
        purpose: 'data_encryption'
      });

      expect(mockEncrypt).toHaveBeenCalledWith(
        expect.any(Buffer), // key material
        expect.stringContaining('data_encryption') // key ID
      );
    });

    it('should validate access control', async () => {
      const context: KeyOperationContext = {
        userId: testUserId,
        operationType: 'encrypt'
      };

      mockDb.query.mockResolvedValueOnce({ rows: [{ access_allowed: true }] });

      const validateSpy = jest.spyOn(keyManagementService as any, 'validateKeyAccess');

      await keyManagementService.getKeyMaterial('test-key', context);

      expect(validateSpy).toHaveBeenCalledWith('test-key', context);
    });

    it('should log all key operations', async () => {
      await keyManagementService.generateMasterKey({
        purpose: 'audit_signing'
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_management_generate',
        details: expect.objectContaining({
          purpose: 'audit_signing',
          operation: 'generate'
        }),
        severity: 'info'
      });
    });

    it('should prevent unauthorized key destruction', async () => {
      const context: KeyOperationContext = {
        userId: 'attacker',
        operationType: 'destroy'
      };

      mockDb.query.mockResolvedValueOnce({ rows: [{ access_allowed: false }] });

      await expect(
        keyManagementService.destroyKey('critical-key', context, 'malicious')
      ).rejects.toThrow('Access denied');
    });

    it('should enforce single primary key per purpose', async () => {
      await keyManagementService.generateMasterKey({
        purpose: 'data_encryption',
        makePrimary: true
      });

      // Should call deactivate other primary keys
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE master_keys'),
        expect.arrayContaining(['data_encryption'])
      );
    });
  });
});