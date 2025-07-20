// Key Exchange Service Tests
// Comprehensive tests for secure ECDH key exchange protocol

import { KeyExchangeService, KeyExchangeConfig } from '../services/KeyExchangeService';
import * as crypto from 'crypto';

describe('KeyExchangeService', () => {
  let keyExchangeService: KeyExchangeService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let testConfig: KeyExchangeConfig;

  const testUserId = 'user-123';
  const testClientId = 'client-app-456';

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown)
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown)
    };

    // Test configuration
    testConfig = {
      algorithm: 'secp256r1',
      keyDerivationFunction: 'pbkdf2',
      iterations: 100000,
      defaultSecurityLevel: 'standard',
      sessionTimeout: 15,
      maxConcurrentSessions: 5,
      keyRotationInterval: 24,
      maxKeyUsage: 1000,
      enableKeyRevocation: true,
      auditAllOperations: true,
      enableSecurityAlerts: true,
      riskThreshold: 70
    };

    keyExchangeService = new KeyExchangeService(
      mockDb,
      mockRedis,
      mockAuditService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateKeyExchange', () => {
    it('should successfully initiate key exchange with standard security', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // Concurrent sessions check

      const result = await keyExchangeService.initiateKeyExchange(
        testUserId,
        testClientId,
        'standard',
        '192.168.1.100',
        'TestClient/1.0'
      );

      expect(result.sessionId).toBeDefined();
      expect(result.serverPublicKey).toContain('BEGIN PUBLIC KEY');
      expect(result.algorithm).toBe('secp256r1');
      expect(result.securityLevel).toBe('standard');
      expect(result.derivationParameters.kdf).toBe('pbkdf2');
      expect(result.derivationParameters.iterations).toBe(100000);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should use high security algorithm for high security level', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await keyExchangeService.initiateKeyExchange(
        testUserId,
        testClientId,
        'high'
      );

      expect(result.algorithm).toBe('secp384r1');
      expect(result.securityLevel).toBe('high');
      expect(result.derivationParameters.iterations).toBe(250000);
    });

    it('should use maximum security algorithm for maximum security level', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await keyExchangeService.initiateKeyExchange(
        testUserId,
        testClientId,
        'maximum'
      );

      expect(result.algorithm).toBe('secp521r1');
      expect(result.securityLevel).toBe('maximum');
      expect(result.derivationParameters.iterations).toBe(500000);
    });

    it('should store session in database with encrypted private key', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await keyExchangeService.initiateKeyExchange(testUserId, testClientId);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO key_exchange_sessions'),
        expect.arrayContaining([
          expect.any(String), // sessionId
          testUserId,
          testClientId,
          'initiated',
          expect.any(String), // encrypted private key
          expect.stringContaining('BEGIN PUBLIC KEY'),
          'secp256r1',
          'standard',
          undefined, // ip
          undefined, // user agent
          expect.any(Date), // expires_at
          'KeyExchangeService'
        ])
      );
    });

    it('should enforce concurrent session limits', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // At limit

      await expect(
        keyExchangeService.initiateKeyExchange(testUserId, testClientId)
      ).rejects.toThrow('Too many concurrent key exchange sessions');
    });

    it('should cache session data in Redis', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await keyExchangeService.initiateKeyExchange(testUserId, testClientId);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `session:${result.sessionId}`,
        900, // 15 minutes
        expect.stringContaining(testUserId)
      );
    });

    it('should log initiation event', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await keyExchangeService.initiateKeyExchange(testUserId, testClientId);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'key_exchange_session_initiated',
        details: expect.objectContaining({
          sessionId: result.sessionId,
          userId: testUserId,
          clientId: testClientId,
          algorithm: 'secp256r1',
          securityLevel: 'standard'
        }),
        severity: 'info'
      });
    });
  });

  describe('completeKeyExchange', () => {
    let testSessionId: string;
    let serverKeyPair: crypto.KeyPairSyncResult<string, string>;
    let clientKeyPair: crypto.KeyPairSyncResult<string, string>;

    beforeEach(() => {
      testSessionId = 'test-session-123';
      
      // Generate test key pairs
      serverKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      clientKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
    });

    it('should successfully complete key exchange', async () => {
      // Mock session lookup
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        userId: testUserId,
        algorithm: 'secp256r1',
        securityLevel: 'standard',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 900000) // 15 minutes from now
      }));

      // Mock session state check
      mockDb.query
        .mockResolvedValueOnce({ // getSession
          rows: [{
            id: 'session-db-id',
            session_id: testSessionId,
            user_id: testUserId,
            state: 'initiated',
            algorithm: 'secp256r1',
            security_level: 'standard',
            expires_at: new Date(Date.now() + 900000),
            server_public_key: serverKeyPair.publicKey
          }]
        })
        .mockResolvedValueOnce({ // getDecryptedPrivateKey
          rows: [{
            server_private_key: 'encrypted:private:key'
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // Update session

      // Mock key decryption (simplified)
      jest.spyOn(keyExchangeService as any, 'getDecryptedPrivateKey')
        .mockResolvedValue(serverKeyPair.privateKey as unknown);

      const requestedKeys = [
        { purpose: 'encryption' as const, keyLength: 32 },
        { purpose: 'authentication' as const, keyLength: 32 }
      ];

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        clientKeyPair.publicKey,
        requestedKeys
      );

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(testSessionId);
      expect(result.derivedKeys).toBeDefined();
      expect(result.derivedKeys!.encryption).toBeDefined();
      expect(result.derivedKeys!.authentication).toBeDefined();
    });

    it('should fail for non-existent session', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyExchangeService.completeKeyExchange(
        'non-existent-session',
        clientKeyPair.publicKey
      );

      expect(result.success).toBe(false);
      expect(result.securityWarnings).toContain('Session not found');
    });

    it('should fail for expired session', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          session_id: testSessionId,
          state: 'initiated',
          expires_at: new Date(Date.now() - 1000) // 1 second ago
        }]
      });

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        clientKeyPair.publicKey
      );

      expect(result.success).toBe(false);
      expect(result.securityWarnings).toContain('Session expired');
    });

    it('should fail for invalid session state', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          session_id: testSessionId,
          state: 'completed',
          expires_at: new Date(Date.now() + 900000)
        }]
      });

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        clientKeyPair.publicKey
      );

      expect(result.success).toBe(false);
      expect(result.securityWarnings).toContain('Invalid session state: completed');
    });

    it('should validate client public key format', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        userId: testUserId,
        algorithm: 'secp256r1',
        expiresAt: new Date(Date.now() + 900000)
      }));

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          session_id: testSessionId,
          state: 'initiated',
          algorithm: 'secp256r1',
          expires_at: new Date(Date.now() + 900000)
        }]
      });

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        'invalid-public-key-format'
      );

      expect(result.success).toBe(false);
      expect(result.securityWarnings?.[0]).toContain('Invalid public key');
    });

    it('should derive multiple keys with different purposes', async () => {
      // Setup successful key exchange mocks
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        userId: testUserId,
        algorithm: 'secp256r1',
        expiresAt: new Date(Date.now() + 900000)
      }));

      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            session_id: testSessionId,
            state: 'initiated',
            algorithm: 'secp256r1',
            expires_at: new Date(Date.now() + 900000)
          }]
        })
        .mockResolvedValueOnce({ rows: [{ server_private_key: 'encrypted' }] })
        .mockResolvedValueOnce({ rows: [] }) // Update session
        .mockResolvedValueOnce({ rows: [] }) // Insert encryption key
        .mockResolvedValueOnce({ rows: [] }) // Insert auth key
        .mockResolvedValueOnce({ rows: [] }); // Insert signing key

      jest.spyOn(keyExchangeService as any, 'getDecryptedPrivateKey')
        .mockResolvedValue(serverKeyPair.privateKey as unknown);

      const requestedKeys = [
        { purpose: 'encryption' as const, keyLength: 32, expiryHours: 24 },
        { purpose: 'authentication' as const, keyLength: 32, maxUsage: 1000 },
        { purpose: 'signing' as const, keyLength: 64 }
      ];

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        clientKeyPair.publicKey,
        requestedKeys
      );

      expect(result.success).toBe(true);
      expect(Object.keys(result.derivedKeys!)).toHaveLength(3);
      expect(result.derivedKeys!.encryption).toBeDefined();
      expect(result.derivedKeys!.authentication).toBeDefined();
      expect(result.derivedKeys!.signing).toBeDefined();
    });

    it('should generate security warnings for weak key configurations', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        userId: testUserId,
        algorithm: 'secp256r1',
        expiresAt: new Date(Date.now() + 900000)
      }));

      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            session_id: testSessionId,
            state: 'initiated',
            algorithm: 'secp256r1',
            expires_at: new Date(Date.now() + 900000)
          }]
        })
        .mockResolvedValueOnce({ rows: [{ server_private_key: 'encrypted' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      jest.spyOn(keyExchangeService as any, 'getDecryptedPrivateKey')
        .mockResolvedValue(serverKeyPair.privateKey as unknown);

      const requestedKeys = [
        { purpose: 'encryption' as const, keyLength: 16 } // Weak key length
      ];

      const result = await keyExchangeService.completeKeyExchange(
        testSessionId,
        clientKeyPair.publicKey,
        requestedKeys
      );

      expect(result.success).toBe(true);
      expect(result.securityWarnings).toBeDefined();
      expect(result.securityWarnings![0]).toContain('may be insufficient');
    });
  });

  describe('deriveKey', () => {
    it('should derive key with valid parameters', async () => {
      const sessionId = 'test-session';
      const sharedSecret = crypto.randomBytes(32);
      const salt = crypto.randomBytes(32);

      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Insert derived key

      const result = await keyExchangeService.deriveKey(
        sessionId,
        sharedSecret,
        salt,
        'encryption',
        32,
        24, // 24 hours
        1000 // max usage
      );

      expect(result.keyId).toBeDefined();
      expect(result.purpose).toBe('encryption');
      expect(result.keyLength).toBe(32);
      expect(result.derivedAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.maxUsageCount).toBe(1000);
    });

    it('should reject invalid key lengths', async () => {
      const sessionId = 'test-session';
      const sharedSecret = crypto.randomBytes(32);
      const salt = crypto.randomBytes(32);

      await expect(
        keyExchangeService.deriveKey(sessionId, sharedSecret, salt, 'encryption', 31) // Invalid length
      ).rejects.toThrow('Invalid key length: 31');
    });

    it('should cache derived key', async () => {
      const sessionId = 'test-session';
      const sharedSecret = crypto.randomBytes(32);
      const salt = crypto.randomBytes(32);

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await keyExchangeService.deriveKey(sessionId, sharedSecret, salt, 'encryption', 32);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringMatching(/^derived_key:/),
        3600,
        expect.any(String)
      );
    });

    it('should log key derivation event', async () => {
      const sessionId = 'test-session';
      const sharedSecret = crypto.randomBytes(32);
      const salt = crypto.randomBytes(32);

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await keyExchangeService.deriveKey(sessionId, sharedSecret, salt, 'authentication', 32);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_exchange_key_derived',
        details: expect.objectContaining({
          sessionId,
          purpose: 'authentication',
          keyLength: 32
        }),
        severity: 'info'
      });
    });
  });

  describe('getSessionStatus', () => {
    it('should return session details', async () => {
      const sessionData = {
        id: 'db-id',
        session_id: 'session-123',
        user_id: testUserId,
        client_id: testClientId,
        state: 'completed',
        server_public_key: 'server-pub-key',
        client_public_key: 'client-pub-key',
        algorithm: 'secp256r1',
        security_level: 'standard',
        created_at: new Date(),
        expires_at: new Date(),
        ip_address: '192.168.1.1',
        user_agent: 'TestClient'
      };

      mockDb.query.mockResolvedValueOnce({ rows: [sessionData] });

      const result = await keyExchangeService.getSessionStatus('session-123');

      expect(result).toEqual({
        id: sessionData.id,
        sessionId: sessionData.session_id,
        userId: sessionData.user_id,
        clientId: sessionData.client_id,
        state: sessionData.state,
        serverPublicKey: sessionData.server_public_key,
        clientPublicKey: sessionData.client_public_key,
        algorithm: sessionData.algorithm,
        securityLevel: sessionData.security_level,
        createdAt: sessionData.created_at,
        expiresAt: sessionData.expires_at,
        ipAddress: sessionData.ip_address,
        userAgent: sessionData.user_agent
      });
    });

    it('should return null for non-existent session', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyExchangeService.getSessionStatus('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('revokeDerivedKey', () => {
    it('should successfully revoke key', async () => {
      const keyId = 'test-key-123';
      const reason = 'Security concern';

      mockDb.query.mockResolvedValueOnce({
        rows: [{ session_id: 'session-123' }]
      });

      const result = await keyExchangeService.revokeDerivedKey(keyId, reason);

      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE derived_keys'),
        [reason, keyId]
      );
      expect(mockRedis.del).toHaveBeenCalledWith(`derived_key:${keyId}`);
    });

    it('should return false for non-existent key', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyExchangeService.revokeDerivedKey('non-existent', 'reason');

      expect(result).toBe(false);
    });

    it('should log revocation event', async () => {
      const keyId = 'test-key-123';
      const sessionId = 'session-123';

      mockDb.query.mockResolvedValueOnce({
        rows: [{ session_id: sessionId }]
      });

      await keyExchangeService.revokeDerivedKey(keyId, 'Security test');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'key_exchange_key_revoked',
        details: {
          sessionId,
          keyId,
          reason: 'Security test'
        },
        severity: 'info'
      });
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions for user', async () => {
      const sessions = [
        {
          id: '1',
          session_id: 'session-1',
          user_id: testUserId,
          state: 'completed',
          algorithm: 'secp256r1',
          security_level: 'standard',
          created_at: new Date(),
          expires_at: new Date()
        },
        {
          id: '2',
          session_id: 'session-2',
          user_id: testUserId,
          state: 'initiated',
          algorithm: 'secp384r1',
          security_level: 'high',
          created_at: new Date(),
          expires_at: new Date()
        }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: sessions });

      const result = await keyExchangeService.getActiveSessions(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].sessionId).toBe('session-1');
      expect(result[1].sessionId).toBe('session-2');
    });

    it('should handle empty results', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await keyExchangeService.getActiveSessions(testUserId);

      expect(result).toEqual([]);
    });
  });

  describe('security features', () => {
    it('should encrypt private keys before storage', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await keyExchangeService.initiateKeyExchange(testUserId, testClientId);

      const insertCall = mockDb.query.mock.calls.find(call => 
        call[0].includes('INSERT INTO key_exchange_sessions')
      );
      const encryptedKey = insertCall[1][4]; // server_private_key parameter

      expect(encryptedKey).toBeDefined();
      expect(encryptedKey).not.toContain('BEGIN PRIVATE KEY');
      expect(encryptedKey).toContain(':'); // Encrypted format with IV and auth tag
    });

    it('should validate algorithm consistency', async () => {
      const inconsistentPublicKey = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp384r1', // Different from session algorithm
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      }).publicKey;

      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        algorithm: 'secp256r1', // Session uses secp256r1
        expiresAt: new Date(Date.now() + 900000)
      }));

      mockDb.query.mockResolvedValueOnce({
        rows: [{
          session_id: 'test-session',
          state: 'initiated',
          algorithm: 'secp256r1',
          expires_at: new Date(Date.now() + 900000)
        }]
      });

      const result = await keyExchangeService.completeKeyExchange(
        'test-session',
        inconsistentPublicKey
      );

      expect(result.success).toBe(false);
      expect(result.securityWarnings?.[0]).toContain('Invalid public key');
    });

    it('should handle concurrent session limits properly', async () => {
      mockDb.query.mockResolvedValueOnce({ 
        rows: [{ count: testConfig.maxConcurrentSessions.toString() }] 
      });

      await expect(
        keyExchangeService.initiateKeyExchange(testUserId, testClientId)
      ).rejects.toThrow('Too many concurrent key exchange sessions');
    });

    it('should clear sensitive data after completion', async () => {
      const sessionId = 'test-session';
      
      // Mock successful completion
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        userId: testUserId,
        algorithm: 'secp256r1',
        expiresAt: new Date(Date.now() + 900000)
      }));

      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            session_id: sessionId,
            state: 'initiated',
            algorithm: 'secp256r1',
            expires_at: new Date(Date.now() + 900000)
          }]
        })
        .mockResolvedValueOnce({ rows: [{ server_private_key: 'encrypted' }] })
        .mockResolvedValueOnce({ rows: [] });

      const serverKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      const clientKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      jest.spyOn(keyExchangeService as any, 'getDecryptedPrivateKey')
        .mockResolvedValue(serverKeyPair.privateKey as unknown);

      const clearSensitiveDataSpy = jest.spyOn(keyExchangeService as any, 'clearSensitiveData');

      await keyExchangeService.completeKeyExchange(sessionId, clientKeyPair.publicKey);

      expect(clearSensitiveDataSpy).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        keyExchangeService.initiateKeyExchange(testUserId, testClientId)
      ).rejects.toThrow('Failed to initiate key exchange');
    });

    it('should handle Redis errors gracefully', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw even if Redis fails
      const result = await keyExchangeService.initiateKeyExchange(testUserId, testClientId);
      
      expect(result.sessionId).toBeDefined();
    });

    it('should handle audit service errors gracefully', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit service down'));

      // Should not throw even if audit fails
      const result = await keyExchangeService.initiateKeyExchange(testUserId, testClientId);
      
      expect(result.sessionId).toBeDefined();
    });
  });

  describe('cryptographic operations', () => {
    it('should generate valid ECDH key pairs', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await keyExchangeService.initiateKeyExchange(testUserId);

      expect(result.serverPublicKey).toContain('BEGIN PUBLIC KEY');
      expect(result.serverPublicKey).toContain('END PUBLIC KEY');

      // Verify the public key can be imported
      expect(() => {
        crypto.createPublicKey({
          key: result.serverPublicKey,
          format: 'pem',
          type: 'spki'
        });
      }).not.toThrow();
    });

    it('should produce deterministic shared secrets', async () => {
      // Generate consistent key pairs
      const serverKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      const clientKeyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256r1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Import keys
      const serverPrivateKey = crypto.createPrivateKey(serverKeyPair.privateKey);
      const clientPublicKey = crypto.createPublicKey(clientKeyPair.publicKey);
      const clientPrivateKey = crypto.createPrivateKey(clientKeyPair.privateKey);
      const serverPublicKey = crypto.createPublicKey(serverKeyPair.publicKey);

      // Derive shared secrets
      const sharedSecret1 = crypto.diffieHellman({
        privateKey: serverPrivateKey,
        publicKey: clientPublicKey
      });

      const sharedSecret2 = crypto.diffieHellman({
        privateKey: clientPrivateKey,
        publicKey: serverPublicKey
      });

      expect(sharedSecret1.equals(sharedSecret2)).toBe(true);
    });

    it('should derive different keys for different purposes', async () => {
      const sharedSecret = crypto.randomBytes(32);
      const salt = crypto.randomBytes(32);
      const sessionId = 'test-session';

      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // encryption key
        .mockResolvedValueOnce({ rows: [] }); // authentication key

      const encryptionKey = await keyExchangeService.deriveKey(
        sessionId, sharedSecret, salt, 'encryption', 32
      );

      const authKey = await keyExchangeService.deriveKey(
        sessionId, sharedSecret, salt, 'authentication', 32
      );

      expect(encryptionKey.keyId).not.toBe(authKey.keyId);
      expect(encryptionKey.purpose).toBe('encryption');
      expect(authKey.purpose).toBe('authentication');
    });
  });
});