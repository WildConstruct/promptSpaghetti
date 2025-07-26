// API Payload Encryption Tests
// Comprehensive tests for end-to-end API payload encryption system

import { PayloadEncryptionService, PayloadEncryptionConfig, EncryptedPayload } from '../middleware/payload-encryption';
import { KeyManagementService } from '../services/KeyManagementService';
import * as crypto from 'crypto';

describe('PayloadEncryptionService', () => {
  let payloadEncryptionService: PayloadEncryptionService;
  let mockKeyManagementService: unknown;
  let testConfig: PayloadEncryptionConfig;

  const testData = {
    sensitive: 'password123',
    user: { id: 'user-123', email: 'test@example.com' },
    metadata: { timestamp: Date.now(), version: '1.0' }
  };

  beforeEach(() => {
    // Mock KeyManagementService
    mockKeyManagementService = {
      generateMasterKey: jest.fn<unknown[], unknown>(),
      getMasterKey: jest.fn<unknown[], unknown>(),
      getKeyMaterial: jest.fn<unknown[], unknown>(),
      rotateKey: jest.fn<unknown[], unknown>(),
      listKeys: jest.fn<unknown[], unknown>()
    };

    // Test configuration
    testConfig = {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90,
      maxPayloadSize: 1024 * 1024, // 1MB
      compressionEnabled: true,
      keyDerivationIterations: 100000,
      enableMetrics: true,
      auditAllOperations: true,
      requiredForEndpoints: ['/auth/login', '/auth/register'],
      optionalForEndpoints: ['/preview', '/api/corrections']
    };

    payloadEncryptionService = new PayloadEncryptionService(
      mockKeyManagementService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with existing encryption key', async () => {
      const existingKey = {
        keyId: 'payload-encryption-key-123',
        purpose: 'payload_encryption',
        isActive: true,
        isPrimary: true
      };

      mockKeyManagementService.listKeys.mockResolvedValue([existingKey] as unknown as unknown);

      await payloadEncryptionService.initialize();

      expect(mockKeyManagementService.listKeys).toHaveBeenCalledWith({
        purpose: 'payload_encryption',
        isActive: true,
        isPrimary: true,
        limit: 1
      });
    });

    it('should create new encryption key if none exists', async () => {
      const newKey = {
        keyId: 'new-payload-encryption-key',
        purpose: 'payload_encryption',
        algorithm: 'aes-256-gcm',
        keyLength: 256
      };

      mockKeyManagementService.listKeys.mockResolvedValue([] as unknown as unknown);
      mockKeyManagementService.generateMasterKey.mockResolvedValue(newKey as unknown as unknown);

      await payloadEncryptionService.initialize();

      expect(mockKeyManagementService.generateMasterKey).toHaveBeenCalledWith({
        purpose: 'payload_encryption',
        algorithm: 'aes-256-gcm',
        keyLength: 256,
        makePrimary: true,
        securityLevel: 'high',
        maxUsageCount: 1000000,
        complianceTags: {
          purpose: 'api_payload_encryption',
          classification: 'internal',
          gdpr: true,
          encryption: true
        }
      });
    });

    it('should skip initialization when disabled', async () => {
      const disabledConfig = { ...testConfig, enabled: false };
      const disabledService = new PayloadEncryptionService(
        mockKeyManagementService,
        disabledConfig
      );

      await disabledService.initialize();

      expect(mockKeyManagementService.listKeys).not.toHaveBeenCalled();
      expect(mockKeyManagementService.generateMasterKey).not.toHaveBeenCalled();
    });
  });

  describe('encryptPayload', () => {
    beforeEach(async () => {
      // Set up mock for existing key
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123',
        purpose: 'payload_encryption'
      }] as unknown as unknown);
      
      // Mock key material
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();
    });

    it('should encrypt payload successfully', async () => {
      const result = await payloadEncryptionService.encryptPayload(testData, '/auth/login');

      expect(result).toMatchObject({
        data: expect.any(String),
        iv: expect.any(String),
        authTag: expect.any(String),
        keyId: 'test-key-123',
        algorithm: 'aes-256-gcm',
        timestamp: expect.any(Number),
        compressed: expect.any(Boolean)
      });

      expect(mockKeyManagementService.getKeyMaterial).toHaveBeenCalledWith(
        'test-key-123',
        expect.objectContaining({
          userId: 'payload_encryption_service',
          operationType: 'encrypt',
          additionalContext: expect.objectContaining({
            endpoint: '/auth/login'
          })
        })
      );
    });

    it('should compress large payloads', async () => {
      const largeData = {
        content: 'x'.repeat(2000), // Large repeated content
        metadata: testData.metadata
      };

      const result = await payloadEncryptionService.encryptPayload(largeData, '/auth/login');

      expect(result.compressed).toBe(true);
    });

    it('should not compress small payloads', async () => {
      const smallData = { message: 'hello' };

      const result = await payloadEncryptionService.encryptPayload(smallData, '/auth/login');

      expect(result.compressed).toBe(false);
    });

    it('should reject oversized payloads', async () => {
      const oversizedData = {
        content: 'x'.repeat(testConfig.maxPayloadSize + 1)
      };

      await expect(
        payloadEncryptionService.encryptPayload(oversizedData, '/auth/login')
      ).rejects.toThrow('Payload size');
    });

    it('should throw error when disabled', async () => {
      const disabledConfig = { ...testConfig, enabled: false };
      const disabledService = new PayloadEncryptionService(
        mockKeyManagementService,
        disabledConfig
      );

      await expect(
        disabledService.encryptPayload(testData, '/auth/login')
      ).rejects.toThrow('Payload encryption is disabled');
    });

    it('should enforce endpoint encryption requirements', async () => {
      await expect(
        payloadEncryptionService.encryptPayload(testData, '/public/info')
      ).rejects.toThrow('Encryption not required for endpoint');
    });

    it('should update metrics on successful encryption', async () => {
      await payloadEncryptionService.encryptPayload(testData, '/auth/login');

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.totalEncryptions).toBe(1);
      expect(metrics.successfulOperations).toBe(1);
      expect(metrics.averageEncryptionTime).toBeGreaterThan(0);
    });

    it('should update metrics on failed encryption', async () => {
      mockKeyManagementService.getKeyMaterial.mockRejectedValue(new Error('Key not found'));

      await expect(
        payloadEncryptionService.encryptPayload(testData, '/auth/login')
      ).rejects.toThrow('Encryption failed');

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.totalEncryptions).toBe(1);
      expect(metrics.failedOperations).toBe(1);
    });
  });

  describe('decryptPayload', () => {
    let encryptedPayload: EncryptedPayload;

    beforeEach(async () => {
      // Set up mock for existing key
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123',
        purpose: 'payload_encryption'
      }] as unknown as unknown);
      
      // Mock key material
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();

      // Create an encrypted payload for testing
      encryptedPayload = await payloadEncryptionService.encryptPayload(testData, '/auth/login');
    });

    it('should decrypt payload successfully', async () => {
      const result = await payloadEncryptionService.decryptPayload(encryptedPayload);

      expect(result).toEqual(testData);
      expect(mockKeyManagementService.getKeyMaterial).toHaveBeenCalledWith(
        encryptedPayload.keyId,
        expect.objectContaining({
          userId: 'payload_encryption_service',
          operationType: 'decrypt',
          additionalContext: expect.objectContaining({
            algorithm: encryptedPayload.algorithm,
            timestamp: encryptedPayload.timestamp
          })
        })
      );
    });

    it('should reject expired payloads', async () => {
      const expiredPayload = {
        ...encryptedPayload,
        timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
      };

      await expect(
        payloadEncryptionService.decryptPayload(expiredPayload)
      ).rejects.toThrow('Encrypted payload has expired');
    });

    it('should reject invalid payload structure', async () => {
      const invalidPayload = {
        data: 'encrypted-data'
        // Missing required fields
      } as EncryptedPayload;

      await expect(
        payloadEncryptionService.decryptPayload(invalidPayload)
      ).rejects.toThrow('Invalid encrypted payload structure');
    });

    it('should reject unsupported algorithms', async () => {
      const invalidAlgorithmPayload = {
        ...encryptedPayload,
        algorithm: 'invalid-algorithm' as any
      };

      await expect(
        payloadEncryptionService.decryptPayload(invalidAlgorithmPayload)
      ).rejects.toThrow('Unsupported encryption algorithm');
    });

    it('should require auth tag for GCM mode', async () => {
      const noAuthTagPayload = {
        ...encryptedPayload,
        authTag: undefined
      };

      await expect(
        payloadEncryptionService.decryptPayload(noAuthTagPayload)
      ).rejects.toThrow('Authentication tag required for GCM mode');
    });

    it('should handle compressed payloads', async () => {
      const largeData = {
        content: 'x'.repeat(2000),
        metadata: testData.metadata
      };
      
      const compressedEncrypted = await payloadEncryptionService.encryptPayload(largeData, '/auth/login');
      const decrypted = await payloadEncryptionService.decryptPayload(compressedEncrypted);

      expect(decrypted).toEqual(largeData);
    });

    it('should throw error when disabled', async () => {
      const disabledConfig = { ...testConfig, enabled: false };
      const disabledService = new PayloadEncryptionService(
        mockKeyManagementService,
        disabledConfig
      );

      await expect(
        disabledService.decryptPayload(encryptedPayload)
      ).rejects.toThrow('Payload encryption is disabled');
    });

    it('should update metrics on successful decryption', async () => {
      await payloadEncryptionService.decryptPayload(encryptedPayload);

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.totalDecryptions).toBe(1);
      expect(metrics.successfulOperations).toBe(2); // 1 encrypt + 1 decrypt
      expect(metrics.averageDecryptionTime).toBeGreaterThan(0);
    });

    it('should update metrics on failed decryption', async () => {
      mockKeyManagementService.getKeyMaterial.mockRejectedValue(new Error('Key not found'));

      await expect(
        payloadEncryptionService.decryptPayload(encryptedPayload)
      ).rejects.toThrow('Decryption failed');

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.totalDecryptions).toBe(1);
      expect(metrics.failedOperations).toBe(1);
    });
  });

  describe('rotateEncryptionKey', () => {
    beforeEach(async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'current-key-123',
        purpose: 'payload_encryption'
      }] as unknown as unknown);
      
      await payloadEncryptionService.initialize();
    });

    it('should rotate encryption key successfully', async () => {
      const newKey = {
        keyId: 'new-key-456',
        purpose: 'payload_encryption'
      };

      mockKeyManagementService.rotateKey.mockResolvedValue(newKey as unknown as unknown);

      await payloadEncryptionService.rotateEncryptionKey();

      expect(mockKeyManagementService.rotateKey).toHaveBeenCalledWith(
        'current-key-123',
        expect.objectContaining({
          userId: 'payload_encryption_service',
          operationType: 'rotate',
          additionalContext: { reason: 'scheduled_rotation' }
        })
      );

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.keyRotations).toBe(1);
    });

    it('should handle rotation failure', async () => {
      mockKeyManagementService.rotateKey.mockRejectedValue(new Error('Rotation failed'));

      await expect(
        payloadEncryptionService.rotateEncryptionKey()
      ).rejects.toThrow('Rotation failed');
    });

    it('should fail when no current key exists', async () => {
      const serviceWithoutKey = new PayloadEncryptionService(
        mockKeyManagementService,
        testConfig
      );

      await expect(
        serviceWithoutKey.rotateEncryptionKey()
      ).rejects.toThrow('No current encryption key to rotate');
    });
  });

  describe('algorithm support', () => {
    const algorithms: Array<'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305'> = [
      'aes-256-gcm',
      'aes-256-cbc',
      'chacha20-poly1305'
    ];

    algorithms.forEach(algorithm => {
      it(`should support ${algorithm} algorithm`, async () => {
        const algorithmConfig = { ...testConfig, algorithm };
        const algorithmService = new PayloadEncryptionService(
          mockKeyManagementService,
          algorithmConfig
        );

        mockKeyManagementService.listKeys.mockResolvedValue([{
          keyId: 'test-key-123',
          purpose: 'payload_encryption'
        }] as unknown as unknown);
        
        const keyMaterial = crypto.randomBytes(32);
        mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
        
        await algorithmService.initialize();

        const encrypted = await algorithmService.encryptPayload(testData, '/auth/login');
        expect(encrypted.algorithm).toBe(algorithm);

        const decrypted = await algorithmService.decryptPayload(encrypted);
        expect(decrypted).toEqual(testData);
      });
    });
  });

  describe('performance and metrics', () => {
    beforeEach(async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123',
        purpose: 'payload_encryption'
      }] as unknown as unknown);
      
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();
    });

    it('should track compression ratio', async () => {
      const compressibleData = {
        content: 'repeat'.repeat(500), // Highly compressible
        metadata: testData.metadata
      };

      await payloadEncryptionService.encryptPayload(compressibleData, '/auth/login');

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.compressionRatio).toBeLessThan(1.0);
    });

    it('should track operation timing', async () => {
      const start = Date.now();
      await payloadEncryptionService.encryptPayload(testData, '/auth/login');
      const end = Date.now();

      const metrics = payloadEncryptionService.getMetrics();
      expect(metrics.averageEncryptionTime).toBeGreaterThan(0);
      expect(metrics.averageEncryptionTime).toBeLessThan(end - start + 100); // Allow some margin
    });

    it('should provide comprehensive metrics', async () => {
      // Perform multiple operations
      const encrypted = await payloadEncryptionService.encryptPayload(testData, '/auth/login');
      await payloadEncryptionService.decryptPayload(encrypted);
      await payloadEncryptionService.rotateEncryptionKey();

      const metrics = payloadEncryptionService.getMetrics();
      
      expect(metrics).toMatchObject({
        totalEncryptions: expect.any(Number),
        totalDecryptions: expect.any(Number),
        successfulOperations: expect.any(Number),
        failedOperations: expect.any(Number),
        averageEncryptionTime: expect.any(Number),
        averageDecryptionTime: expect.any(Number),
        keyRotations: expect.any(Number),
        compressionRatio: expect.any(Number)
      });

      expect(metrics.totalEncryptions).toBe(1);
      expect(metrics.totalDecryptions).toBe(1);
      expect(metrics.successfulOperations).toBe(2);
      expect(metrics.keyRotations).toBe(1);
    });
  });

  describe('security features', () => {
    beforeEach(async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123',
        purpose: 'payload_encryption'
      }] as unknown as unknown);
      
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();
    });

    it('should use unique IVs for each encryption', async () => {
      const encrypted1 = await payloadEncryptionService.encryptPayload(testData, '/auth/login');
      const encrypted2 = await payloadEncryptionService.encryptPayload(testData, '/auth/login');

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.data).not.toBe(encrypted2.data);
    });

    it('should include timestamp for replay protection', async () => {
      const beforeEncryption = Date.now();
      const encrypted = await payloadEncryptionService.encryptPayload(testData, '/auth/login');
      const afterEncryption = Date.now();

      expect(encrypted.timestamp).toBeGreaterThanOrEqual(beforeEncryption);
      expect(encrypted.timestamp).toBeLessThanOrEqual(afterEncryption);
    });

    it('should include authentication tag for GCM mode', async () => {
      const encrypted = await payloadEncryptionService.encryptPayload(testData, '/auth/login');

      expect(encrypted.authTag).toBeDefined();
      expect(encrypted.authTag).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 pattern
    });

    it('should prevent tampering detection', async () => {
      const encrypted = await payloadEncryptionService.encryptPayload(testData, '/auth/login');
      
      // Tamper with encrypted data
      const tamperedPayload = {
        ...encrypted,
        data: encrypted.data.slice(0, -10) + 'tampered123'
      };

      await expect(
        payloadEncryptionService.decryptPayload(tamperedPayload)
      ).rejects.toThrow();
    });

    it('should enforce key access controls', async () => {
      await payloadEncryptionService.encryptPayload(testData, '/auth/login');

      expect(mockKeyManagementService.getKeyMaterial).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'payload_encryption_service',
          operationType: 'encrypt'
        })
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined data', async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123'
      }] as unknown as unknown);
      
      await payloadEncryptionService.initialize();

      const encryptedNull = await payloadEncryptionService.encryptPayload(null, '/auth/login');
      const decryptedNull = await payloadEncryptionService.decryptPayload(encryptedNull);
      expect(decryptedNull).toBeNull();

      const encryptedUndefined = await payloadEncryptionService.encryptPayload(undefined, '/auth/login');
      const decryptedUndefined = await payloadEncryptionService.decryptPayload(encryptedUndefined);
      expect(decryptedUndefined).toBeUndefined();
    });

    it('should handle empty objects and arrays', async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123'
      }] as unknown as unknown);
      
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();

      const emptyObj = {};
      const encryptedObj = await payloadEncryptionService.encryptPayload(emptyObj, '/auth/login');
      const decryptedObj = await payloadEncryptionService.decryptPayload(encryptedObj);
      expect(decryptedObj).toEqual(emptyObj);

      const emptyArray: any[] = [];
      const encryptedArray = await payloadEncryptionService.encryptPayload(emptyArray, '/auth/login');
      const decryptedArray = await payloadEncryptionService.decryptPayload(encryptedArray);
      expect(decryptedArray).toEqual(emptyArray);
    });

    it('should handle complex nested objects', async () => {
      mockKeyManagementService.listKeys.mockResolvedValue([{
        keyId: 'test-key-123'
      }] as unknown as unknown);
      
      const keyMaterial = crypto.randomBytes(32);
      mockKeyManagementService.getKeyMaterial.mockResolvedValue(keyMaterial as unknown as unknown);
      
      await payloadEncryptionService.initialize();

      const complexData = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, { nested: 'value' }],
              boolean: true,
              null: null,
              number: 42.5
            }
          }
        }
      };

      const encrypted = await payloadEncryptionService.encryptPayload(complexData, '/auth/login');
      const decrypted = await payloadEncryptionService.decryptPayload(encrypted);
      expect(decrypted).toEqual(complexData);
    });

    it('should handle key management service failures gracefully', async () => {
      mockKeyManagementService.listKeys.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        payloadEncryptionService.initialize()
      ).rejects.toThrow('Database connection failed');
    });
  });
});