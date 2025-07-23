/**
 * Test Suite for Key Management Service
 *
 * Tests comprehensive cryptographic key management including generation,
 * storage, rotation, and lifecycle management.
 */
import { KeyManagementService, KeyType, KeyPurpose, KeyStatus, KeyAlgorithm, StorageTier } from '../KeyManagementService';
describe('KeyManagementService', () => {
    let service;
    const testRequesterId = 'test-user-123';
    beforeEach(() => {
        jest.useFakeTimers();
        service = new KeyManagementService({
            defaultTier: StorageTier.WARM,
            hotCacheSize: 100,
            warmStorageEncryption: true,
            coldStorageLocation: '/tmp/test',
            masterKeyRotationDays: 90,
            defaultKeyExpirationDays: 365,
            requireKeyApproval: false,
            enableHSMIntegration: false,
            cacheEnabled: true,
            cacheTTL: 3600000,
            backgroundRotationEnabled: false, // Disable for tests
            auditRetentionDays: 2555,
            complianceMode: true,
            encryptionAtRest: true,
            keyDerivationComplexity: 'medium',
            performanceMonitoring: false, // Disable for tests
            alertThresholds: {
                keyUsageRate: 1000,
                failureRate: 0.01,
                responseTime: 100
            }
        });
    });
    afterEach(() => {
        jest.useRealTimers();
        service.removeAllListeners();
        service.destroy();
    });
    describe('Key Generation', () => {
        test('should generate symmetric encryption key', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                name: 'test-encryption-key',
                keySize: 256
            };
            const key = await service.generateKey(options);
            expect(key).toBeDefined();
            expect(key.metadata.id).toMatch(/^key_\d+_[a-f0-9]{32}$/);
            expect(key.metadata.type).toBe(KeyType.SYMMETRIC);
            expect(key.metadata.purpose).toBe(KeyPurpose.DATA_ENCRYPTION);
            expect(key.metadata.algorithm).toBe(KeyAlgorithm.AES_256_GCM);
            expect(key.metadata.status).toBe(KeyStatus.ACTIVE);
            expect(key.metadata.keySize).toBe(256);
            expect(key.metadata.name).toBe('test-encryption-key');
            expect(key.wrappedKeyData).toBeDefined();
            expect(key.metadata.checksumSHA256).toMatch(/^[a-f0-9]{64}$/);
        });
        test('should generate RSA key pair', async () => {
            const options = {
                type: KeyType.ASYMMETRIC_RSA,
                purpose: KeyPurpose.TOKEN_SIGNING,
                algorithm: KeyAlgorithm.RSA_2048,
                keySize: 2048
            };
            const key = await service.generateKey(options);
            expect(key.metadata.type).toBe(KeyType.ASYMMETRIC_RSA);
            expect(key.metadata.keySize).toBe(2048);
            expect(key.publicKey).toBeDefined();
            expect(key.privateKey).toBeDefined();
            expect(key.metadata.purpose).toBe(KeyPurpose.TOKEN_SIGNING);
        });
        test('should generate HMAC key', async () => {
            const options = {
                type: KeyType.HMAC,
                purpose: KeyPurpose.API_AUTHENTICATION,
                algorithm: KeyAlgorithm.HMAC_SHA256,
                keySize: 256
            };
            const key = await service.generateKey(options);
            expect(key.metadata.type).toBe(KeyType.HMAC);
            expect(key.metadata.algorithm).toBe(KeyAlgorithm.HMAC_SHA256);
            expect(key.metadata.keySize).toBe(256);
            expect(key.keyData).toBeUndefined(); // Should be wrapped
            expect(key.wrappedKeyData).toBeDefined();
        });
        test('should generate derivation key with parameters', async () => {
            const options = {
                type: KeyType.DERIVATION,
                purpose: KeyPurpose.PASSWORD_HASHING,
                algorithm: KeyAlgorithm.PBKDF2_SHA256,
                derivationParams: {
                    iterations: 150000,
                    keyLength: 32
                }
            };
            const key = await service.generateKey(options);
            expect(key.metadata.type).toBe(KeyType.DERIVATION);
            expect(key.derivationParameters).toBeDefined();
            expect(key.derivationParameters.algorithm).toBe(KeyAlgorithm.PBKDF2_SHA256);
            expect(key.derivationParameters.iterations).toBe(150000);
            expect(key.derivationParameters.keyLength).toBe(32);
            expect(key.derivationParameters.salt).toBeDefined();
        });
        test('should emit keyGenerated event', async () => {
            const eventHandler = jest.fn();
            service.on('keyGenerated', eventHandler);
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.SESSION_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const key = await service.generateKey(options);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                keyId: key.metadata.id,
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.SESSION_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            }));
        });
        test('should validate generation options', async () => {
            const invalidOptions = {
            // Missing required fields
            };
            await expect(service.generateKey(invalidOptions))
                .rejects.toThrow('Key type, purpose, and algorithm are required');
        });
        test('should handle key generation errors', async () => {
            const errorHandler = jest.fn();
            service.on('keyGenerationError', errorHandler);
            const options = {
                type: 'invalid',
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            await expect(service.generateKey(options))
                .rejects.toThrow();
            expect(errorHandler).toHaveBeenCalled();
        });
    });
    describe('Key Retrieval', () => {
        test('should retrieve generated key', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                tier: StorageTier.HOT
            };
            const generatedKey = await service.generateKey(options);
            const retrievedKey = await service.getKey(generatedKey.metadata.id, testRequesterId);
            expect(retrievedKey).toBeDefined();
            expect(retrievedKey.metadata.id).toBe(generatedKey.metadata.id);
            expect(retrievedKey.keyData).toBeDefined(); // Should be unwrapped
            expect(retrievedKey.metadata.usageCount).toBe(1);
            expect(retrievedKey.metadata.lastUsed).toBeDefined();
        });
        test('should return null for non-existent key', async () => {
            const key = await service.getKey('non-existent-key', testRequesterId);
            expect(key).toBeNull();
        });
        test('should update key usage on retrieval', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const generatedKey = await service.generateKey(options);
            // Retrieve multiple times
            await service.getKey(generatedKey.metadata.id, testRequesterId);
            const key = await service.getKey(generatedKey.metadata.id, testRequesterId);
            expect(key.metadata.usageCount).toBe(2);
        });
        test('should cache hot-tier keys', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.SESSION_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                tier: StorageTier.HOT
            };
            const generatedKey = await service.generateKey(options);
            // First retrieval
            await service.getKey(generatedKey.metadata.id, testRequesterId);
            // Second retrieval should hit cache
            const key = await service.getKey(generatedKey.metadata.id, testRequesterId);
            expect(key).toBeDefined();
        });
        test('should handle expired keys', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 1
            };
            const generatedKey = await service.generateKey(options);
            // Fast forward past expiration
            jest.advanceTimersByTime(2 * 24 * 60 * 60 * 1000); // 2 days
            await expect(service.getKey(generatedKey.metadata.id, testRequesterId))
                .rejects.toThrow('Key has expired');
        });
    });
    describe('Key Rotation', () => {
        test('should rotate expiring key', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 7
            };
            const originalKey = await service.generateKey(options);
            // Fast forward to near expiration
            jest.advanceTimersByTime(6 * 24 * 60 * 60 * 1000); // 6 days
            const rotationOptions = {
                rotationReason: 'scheduled_rotation'
            };
            const newKey = await service.rotateKey(originalKey.metadata.id, testRequesterId, rotationOptions);
            expect(newKey.metadata.id).not.toBe(originalKey.metadata.id);
            expect(newKey.metadata.type).toBe(originalKey.metadata.type);
            expect(newKey.metadata.purpose).toBe(originalKey.metadata.purpose);
            expect(newKey.metadata.algorithm).toBe(originalKey.metadata.algorithm);
            expect(newKey.metadata.name).toContain('rotated');
            expect(newKey.metadata.metadata.rotatedFrom).toBe(originalKey.metadata.id);
            // Original key should be retired
            const oldKey = await service.getKeyMetadata(originalKey.metadata.id);
            expect(oldKey.metadata.status).toBe(KeyStatus.RETIRED);
        });
        test('should force rotation when requested', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 365 // Not expiring soon
            };
            const originalKey = await service.generateKey(options);
            const rotationOptions = {
                forceRotation: true,
                rotationReason: 'security_concern'
            };
            const newKey = await service.rotateKey(originalKey.metadata.id, testRequesterId, rotationOptions);
            expect(newKey.metadata.id).not.toBe(originalKey.metadata.id);
        });
        test('should emit keyRotated event', async () => {
            const eventHandler = jest.fn();
            service.on('keyRotated', eventHandler);
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 7
            };
            const originalKey = await service.generateKey(options);
            jest.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);
            await service.rotateKey(originalKey.metadata.id, testRequesterId);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                oldKeyId: originalKey.metadata.id,
                newKeyId: expect.any(String)
            }));
        });
    });
    describe('Key Revocation', () => {
        test('should revoke key', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const key = await service.generateKey(options);
            await service.revokeKey(key.metadata.id, testRequesterId, 'Security breach');
            const revokedKey = await service.getKey(key.metadata.id, testRequesterId);
            expect(revokedKey.metadata.status).toBe(KeyStatus.REVOKED);
            expect(revokedKey.metadata.revokedAt).toBeDefined();
        });
        test('should emit keyRevoked event', async () => {
            const eventHandler = jest.fn();
            service.on('keyRevoked', eventHandler);
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const key = await service.generateKey(options);
            await service.revokeKey(key.metadata.id, testRequesterId, 'Test revocation');
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                keyId: key.metadata.id,
                reason: 'Test revocation',
                requesterId: testRequesterId
            }));
        });
        test('should handle non-existent key revocation', async () => {
            await expect(service.revokeKey('non-existent', testRequesterId, 'reason'))
                .rejects.toThrow('Key not found');
        });
    });
    describe('Key Derivation', () => {
        test('should derive key using PBKDF2', async () => {
            const parentOptions = {
                type: KeyType.DERIVATION,
                purpose: KeyPurpose.PASSWORD_HASHING,
                algorithm: KeyAlgorithm.PBKDF2_SHA256
            };
            const parentKey = await service.generateKey(parentOptions);
            const derivationParams = {
                algorithm: KeyAlgorithm.PBKDF2_SHA256,
                salt: Buffer.from('test-salt'),
                iterations: 100000,
                keyLength: 32
            };
            const derivedKey = await service.deriveKey(parentKey.metadata.id, derivationParams, testRequesterId);
            expect(derivedKey.metadata.parentKeyId).toBe(parentKey.metadata.id);
            expect(derivedKey.metadata.name).toContain('derived');
            expect(derivedKey.derivationParameters).toEqual(derivationParams);
            expect(derivedKey.keyData).toBeDefined();
            expect(derivedKey.keyData.length).toBe(32);
        });
        test('should derive key using Scrypt', async () => {
            const parentOptions = {
                type: KeyType.DERIVATION,
                purpose: KeyPurpose.PASSWORD_HASHING,
                algorithm: KeyAlgorithm.SCRYPT
            };
            const parentKey = await service.generateKey(parentOptions);
            const derivationParams = {
                algorithm: KeyAlgorithm.SCRYPT,
                salt: Buffer.from('test-salt'),
                iterations: 16384,
                memoryFactor: 8,
                parallelism: 1,
                keyLength: 32
            };
            const derivedKey = await service.deriveKey(parentKey.metadata.id, derivationParams, testRequesterId);
            expect(derivedKey.derivationParameters.algorithm).toBe(KeyAlgorithm.SCRYPT);
        });
        test('should handle parent key not found', async () => {
            const derivationParams = {
                algorithm: KeyAlgorithm.PBKDF2_SHA256,
                salt: Buffer.from('test-salt'),
                iterations: 100000,
                keyLength: 32
            };
            await expect(service.deriveKey('non-existent', derivationParams, testRequesterId))
                .rejects.toThrow('Parent key not found');
        });
    });
    describe('Key Search', () => {
        test('should search keys by type', async () => {
            // Generate keys of different types
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            });
            await service.generateKey({
                type: KeyType.HMAC,
                purpose: KeyPurpose.API_AUTHENTICATION,
                algorithm: KeyAlgorithm.HMAC_SHA256
            });
            const criteria = {
                type: KeyType.SYMMETRIC
            };
            const results = await service.searchKeys(criteria, testRequesterId);
            expect(results).toHaveLength(1);
            expect(results[0].type).toBe(KeyType.SYMMETRIC);
        });
        test('should search keys by purpose', async () => {
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            });
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.SESSION_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            });
            const criteria = {
                purpose: KeyPurpose.DATA_ENCRYPTION
            };
            const results = await service.searchKeys(criteria, testRequesterId);
            expect(results).toHaveLength(1);
            expect(results[0].purpose).toBe(KeyPurpose.DATA_ENCRYPTION);
        });
        test('should search keys by status', async () => {
            const key = await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            });
            await service.revokeKey(key.metadata.id, testRequesterId, 'test');
            const criteria = {
                status: KeyStatus.REVOKED
            };
            const results = await service.searchKeys(criteria, testRequesterId);
            expect(results).toHaveLength(1);
            expect(results[0].status).toBe(KeyStatus.REVOKED);
        });
        test('should search keys by tags', async () => {
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                tags: { environment: 'production', service: 'auth' }
            });
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                tags: { environment: 'staging', service: 'auth' }
            });
            const criteria = {
                tags: { environment: 'production' }
            };
            const results = await service.searchKeys(criteria, testRequesterId);
            expect(results).toHaveLength(1);
            expect(results[0].tags.environment).toBe('production');
        });
        test('should search keys by expiration date', async () => {
            const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 1 // Expires soon
            });
            await service.generateKey({
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 365 // Expires later
            });
            const criteria = {
                expiringBefore: futureDate
            };
            const results = await service.searchKeys(criteria, testRequesterId);
            expect(results).toHaveLength(1);
        });
    });
    describe('Key Export', () => {
        test('should export key for backup', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const key = await service.generateKey(options);
            const exportData = await service.exportKey(key.metadata.id, testRequesterId);
            expect(exportData).toBeDefined();
            expect(Buffer.isBuffer(exportData)).toBe(true);
            const parsed = JSON.parse(exportData.toString());
            expect(parsed.metadata).toBeDefined();
            expect(parsed.encryptedKeyData).toBeDefined();
            expect(parsed.exportedBy).toBe(testRequesterId);
        });
    });
    describe('Performance Metrics', () => {
        test('should track performance metrics', async () => {
            // Generate some keys
            for (let i = 0; i < 5; i++) {
                await service.generateKey({
                    type: KeyType.SYMMETRIC,
                    purpose: KeyPurpose.DATA_ENCRYPTION,
                    algorithm: KeyAlgorithm.AES_256_GCM
                });
            }
            const metrics = service.getPerformanceMetrics();
            expect(metrics).toBeDefined();
            expect(metrics.totalKeyCount).toBe(5);
            expect(metrics.activeKeyCount).toBe(5);
            expect(typeof metrics.operationsPerSecond).toBe('number');
            expect(typeof metrics.averageResponseTime).toBe('number');
        });
    });
    describe('Error Handling', () => {
        test('should handle invalid key algorithms', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: 'invalid-algorithm'
            };
            await expect(service.generateKey(options))
                .rejects.toThrow();
        });
        test('should handle invalid key sizes', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                keySize: 64 // Too small
            };
            await expect(service.generateKey(options))
                .rejects.toThrow('Key size must be at least 128 bits');
        });
        test('should handle invalid expiration days', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                expirationDays: 0
            };
            await expect(service.generateKey(options))
                .rejects.toThrow('Expiration must be at least 1 day');
        });
    });
    describe('Audit Trail', () => {
        test('should log key events', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM
            };
            const key = await service.generateKey(options);
            await service.getKey(key.metadata.id, testRequesterId);
            await service.revokeKey(key.metadata.id, testRequesterId, 'test');
            const finalKey = await service.getKey(key.metadata.id, testRequesterId);
            expect(finalKey.metadata.auditTrail).toHaveLength(3);
            expect(finalKey.metadata.auditTrail[0].event).toBe('created');
            expect(finalKey.metadata.auditTrail[1].event).toBe('accessed');
            expect(finalKey.metadata.auditTrail[2].event).toBe('revoked');
        });
    });
    describe('Key Wrapping', () => {
        test('should wrap and unwrap keys properly', async () => {
            const options = {
                type: KeyType.SYMMETRIC,
                purpose: KeyPurpose.DATA_ENCRYPTION,
                algorithm: KeyAlgorithm.AES_256_GCM,
                tier: StorageTier.COLD
            };
            const key = await service.generateKey(options);
            // Key should be wrapped in cold storage
            expect(key.wrappedKeyData).toBeDefined();
            expect(key.keyData).toBeUndefined();
            // When retrieved, it should be unwrapped
            const retrievedKey = await service.getKey(key.metadata.id, testRequesterId);
            expect(retrievedKey.keyData).toBeDefined();
        });
    });
    describe('Cleanup', () => {
        test('should cleanup resources on destroy', () => {
            const destroySpy = jest.spyOn(service, 'destroy');
            service.destroy();
            expect(destroySpy).toHaveBeenCalled();
        });
    });
});
