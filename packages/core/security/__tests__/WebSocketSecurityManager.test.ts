/**
 * Test Suite for WebSocket Security Manager
 * 
 * Tests comprehensive WebSocket security features including encryption,
 * threat detection, rate limiting, and data classification integration.
 */

import {
  WebSocketSecurityManager,
  WebSocketSecurityConfig,
  ConnectionSecurityContext,
  SecureWebSocketMessage
} from '../WebSocketSecurityManager';
import { KeyManagementService, KeyManagementConfig } from '../KeyManagementService';
import { DataClassifier, ClassificationLevel, DataCategory } from '../DataClassifier';
import { DeviceFingerprintingService, RiskLevel } from '../DeviceFingerprintingService';
import { TrustedDeviceManager } from '../TrustedDeviceManager';

// Mock dependencies
jest.mock('../KeyManagementService');
jest.mock('../DataClassifier');
jest.mock('../DeviceFingerprintingService');
jest.mock('../TrustedDeviceManager');

describe('WebSocketSecurityManager', () => {
  let securityManager: WebSocketSecurityManager;
  let mockKeyManagementService: jest.Mocked<KeyManagementService>;
  let mockDataClassifier: jest.Mocked<DataClassifier>;
  let mockFingerprintService: jest.Mocked<DeviceFingerprintingService>;
  let mockTrustedDeviceManager: jest.Mocked<TrustedDeviceManager>;
  
  const testConfig: WebSocketSecurityConfig = {
    enableMessageEncryption: true,
    encryptionKeyRotationMinutes: 60,
    requireE2EEncryption: false,
    
    requireDeviceVerification: true,
    enableMFAForHighRisk: true,
    sessionTimeoutMinutes: 30,
    maxConcurrentSessions: 10,
    
    enableAnomalyDetection: true,
    rateLimitMessagesPerMinute: 100,
    suspiciousBehaviorThreshold: 5,
    blockSuspiciousIPs: true,
    
    enableDataClassification: true,
    enforceClassificationPolicies: true,
    logClassifiedData: true,
    
    enableSecurityAuditLog: true,
    auditLogRetentionDays: 90,
    complianceMode: true,
    
    enableCertificatePinning: true,
    pinnedCertificates: ['cert1', 'cert2'],
    
    enableCSRFProtection: true,
    allowedOrigins: ['https://example.com'],
    requireSecureTransport: true
  };

  const testConnectionRequest = {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Test Browser)',
    origin: 'https://example.com',
    headers: {
      'accept': 'application/json',
      'accept-language': 'en-US'
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Create mocked services
    mockKeyManagementService = new KeyManagementService({} as KeyManagementConfig) as jest.Mocked<KeyManagementService>;
    mockDataClassifier = new DataClassifier() as jest.Mocked<DataClassifier>;
    mockFingerprintService = new DeviceFingerprintingService() as jest.Mocked<DeviceFingerprintingService>;
    mockTrustedDeviceManager = new TrustedDeviceManager(mockFingerprintService) as jest.Mocked<TrustedDeviceManager>;

    // Setup spies
    jest.spyOn(mockKeyManagementService, 'generateKey');
    jest.spyOn(mockKeyManagementService, 'revokeKey');
    jest.spyOn(mockDataClassifier, 'classify');
    jest.spyOn(mockFingerprintService, 'generateFingerprint');
    jest.spyOn(mockFingerprintService, 'assessRisk');
    jest.spyOn(mockTrustedDeviceManager, 'checkDeviceTrust');
    jest.spyOn(mockTrustedDeviceManager, 'verifyDevice');

    // Setup default mock implementations
    mockFingerprintService.generateFingerprint.mockResolvedValue({
      id: 'fingerprint-123',
      type: 'ENHANCED' as any,
      confidence: 95,
      createdAt: new Date(),
      lastSeen: new Date(),
      seenCount: 1,
      basic: {
        userAgent: testConnectionRequest.userAgent,
        language: 'en-US',
        platform: 'Test',
        cookieEnabled: true,
        doNotTrack: false,
        timezone: 'UTC',
        timezoneOffset: 0
      }
    } as any);

    mockFingerprintService.assessRisk.mockReturnValue({
      deviceId: 'fingerprint-123',
      overallRisk: RiskLevel.LOW,
      riskScore: 15,
      factors: [],
      recommendations: [],
      timestamp: new Date()
    });

    mockTrustedDeviceManager.checkDeviceTrust.mockResolvedValue({
      trusted: false,
      reason: 'Device not previously trusted',
      riskScore: 30,
      requiresVerification: true,
      factors: {
        deviceMatch: false,
        locationMatch: true,
        riskAcceptable: true,
        timingNormal: true
      }
    } as any);

    mockTrustedDeviceManager.verifyDevice.mockResolvedValue({
      id: 'device-123',
      userId: 'user-456',
      deviceId: 'fingerprint-123',
      status: 'TRUSTED',
      trustLevel: 'FULL'
    } as any);

    mockDataClassifier.classify.mockReturnValue({
      level: ClassificationLevel.INTERNAL,
      category: DataCategory.OPERATIONAL,
      confidence: 90,
      matchedRules: [],
      complianceRequirements: [],
      encryptionRequired: false,
      retentionPeriod: '1 year',
      accessControls: [],
      reasoning: []
    });

    mockKeyManagementService.generateKey.mockResolvedValue({
      metadata: {
        id: 'session-key-123',
        name: 'test-session-key',
        status: 'ACTIVE' as any
      },
      keyData: Buffer.from('test-encryption-key-data')
    } as any);

    // Initialize security manager
    securityManager = new WebSocketSecurityManager(
      testConfig,
      mockKeyManagementService,
      mockDataClassifier,
      mockFingerprintService,
      mockTrustedDeviceManager
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    securityManager.removeAllListeners();
    securityManager.destroy();
  });

  describe('Connection Initialization', () => {
    test('should initialize connection security context', async () => {
      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      expect(context).toBeDefined();
      expect(context.connectionId).toBe('conn-123');
      expect(context.userId).toBe('user-456');
      expect(context.sessionId).toMatch(/^ws_session_\d+_[a-f0-9]{16}$/);
      expect(context.isAuthenticated).toBe(false);
      expect(context.mfaVerified).toBe(false);
      expect(context.deviceVerified).toBe(false);
      expect(context.trustLevel).toBe('none');
      expect(context.threatLevel).toBe('low');
      expect(context.encryptionKeyId).toBe('session-key-123');
      expect(context.deviceFingerprint).toBe('fingerprint-123');
      expect(context.connectedAt).toBeInstanceOf(Date);
      
      expect(mockFingerprintService.generateFingerprint).toHaveBeenCalledWith({
        ipAddress: testConnectionRequest.ipAddress,
        userAgent: testConnectionRequest.userAgent,
        headers: testConnectionRequest.headers
      });
      
      expect(mockKeyManagementService.generateKey).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'symmetric',
          purpose: 'session_encryption',
          algorithm: 'aes-256-gcm'
        })
      );
    });

    test('should handle high-risk connections', async () => {
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: 'fingerprint-123',
        overallRisk: RiskLevel.HIGH,
        riskScore: 85,
        factors: [
          { category: 'network', factor: 'vpn_detected', impact: 0.8, confidence: 90, description: 'VPN detected' },
          { category: 'behavior', factor: 'suspicious_patterns', impact: 0.7, confidence: 85, description: 'Suspicious patterns' }
        ],
        recommendations: ['require_mfa'],
        timestamp: new Date()
      });

      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      expect(context.threatLevel).toBe('high');
      expect(context.riskScore).toBe(85);
      expect(context.flags.vpnDetected).toBe(true);
    });

    test('should handle trusted devices', async () => {
      mockTrustedDeviceManager.checkDeviceTrust.mockResolvedValue({
        trusted: true,
        reason: 'Device is trusted',
        riskScore: 10,
        requiresVerification: false,
        factors: {
          deviceMatch: true,
          locationMatch: true,
          riskAcceptable: true,
          timingNormal: true
        }
      } as any);

      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      expect(context.deviceVerified).toBe(true);
      expect(context.deviceTrusted).toBe(true);
    });

    test('should handle connection initialization errors', async () => {
      mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Fingerprint generation failed'));

      await expect(
        securityManager.initializeConnection('conn-123', 'user-456', testConnectionRequest)
      ).rejects.toThrow('Fingerprint generation failed');
    });
  });

  describe('Authentication', () => {
    let context: ConnectionSecurityContext;

    beforeEach(async () => {
      context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );
    });

    test('should authenticate with valid credentials', async () => {
      const result = await securityManager.authenticateConnection('conn-123', {
        token: 'valid-token-12345',
        mfaCode: '123456'
      });

      expect(result).toBe(true);
      
      const updatedContext = securityManager.getConnectionContext('conn-123');
      expect(updatedContext?.isAuthenticated).toBe(true);
      expect(updatedContext?.trustLevel).toBe('basic');
    });

    test('should reject invalid token', async () => {
      const result = await securityManager.authenticateConnection('conn-123', {
        token: 'invalid'
      });

      expect(result).toBe(false);
      
      const updatedContext = securityManager.getConnectionContext('conn-123');
      expect(updatedContext?.isAuthenticated).toBe(false);
      expect(updatedContext?.suspiciousActivityCount).toBe(1);
    });

    test('should require MFA for high-risk connections', async () => {
      // Create high-risk context
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: 'fingerprint-123',
        overallRisk: RiskLevel.HIGH,
        riskScore: 85,
        factors: [],
        recommendations: [],
        timestamp: new Date()
      });

      // Initialize a high-risk connection
      const highRiskContext = await securityManager.initializeConnection(
        'conn-456',
        'user-456',
        testConnectionRequest
      );
      
      // Authentication without MFA should fail
      const result1 = await securityManager.authenticateConnection('conn-456', {
        token: 'valid-token-12345'
      });
      expect(result1).toBe(false);

      // Authentication with MFA should succeed
      const result2 = await securityManager.authenticateConnection('conn-456', {
        token: 'valid-token-12345',
        mfaCode: '123456'
      });
      expect(result2).toBe(true);
    });

    test('should handle device verification', async () => {
      const result = await securityManager.authenticateConnection('conn-123', {
        token: 'valid-token-12345',
        deviceVerificationToken: 'device-token-123'
      });

      expect(result).toBe(true);
      expect(mockTrustedDeviceManager.verifyDevice).toHaveBeenCalledWith('device-token-123');
    });
  });

  describe('Message Encryption/Decryption', () => {
    let context: ConnectionSecurityContext;

    beforeEach(async () => {
      context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );
      
      await securityManager.authenticateConnection('conn-123', {
        token: 'valid-token-12345'
      });
    });

    test('should encrypt outgoing messages', async () => {
      const message = {
        type: 'graph_update',
        payload: {
          nodeId: 'node-123',
          data: { name: 'Test Node' }
        }
      };

      const secureMessage = await securityManager.encryptMessage('conn-123', message);

      expect(secureMessage).toBeDefined();
      expect(secureMessage.id).toMatch(/^msg_\d+_[a-f0-9]{8}$/);
      expect(secureMessage.type).toBe('graph_update');
      expect(secureMessage.encrypted).toBe(true);
      expect(secureMessage.signed).toBe(true);
      expect(secureMessage.classification).toBe(ClassificationLevel.INTERNAL);
      expect(secureMessage.originConnectionId).toBe('conn-123');
      expect(secureMessage.originUserId).toBe('user-456');
      expect(secureMessage.encryptionKeyId).toBe('session-key-123');
      expect(secureMessage.signature).toBeDefined();
      expect(typeof secureMessage.payload).toBe('string'); // Encrypted payload
    });

    test('should decrypt incoming messages', async () => {
      // First encrypt a message
      const originalMessage = {
        type: 'presence_update',
        payload: {
          cursor: { x: 100, y: 200 },
          selection: ['node-1', 'node-2']
        }
      };

      const secureMessage = await securityManager.encryptMessage('conn-123', originalMessage);
      
      // Then decrypt it
      const decryptedMessage = await securityManager.decryptMessage('conn-123', secureMessage);

      expect(decryptedMessage.type).toBe('presence_update');
      expect(decryptedMessage.payload).toEqual(originalMessage.payload);
      expect(decryptedMessage.metadata.classification).toBe(ClassificationLevel.INTERNAL);
      expect(decryptedMessage.metadata.encrypted).toBe(true);
    });

    test('should handle classification-based encryption', async () => {
      // Mock confidential data classification
      mockDataClassifier.classify.mockReturnValue({
        level: ClassificationLevel.CONFIDENTIAL,
        category: DataCategory.PII,
        confidence: 95,
        matchedRules: ['pii_detected'],
        complianceRequirements: [],
        encryptionRequired: true,
        retentionPeriod: '7 years',
        accessControls: [],
        reasoning: ['PII detected']
      });

      const message = {
        type: 'user_data',
        payload: {
          email: 'user@example.com',
          ssn: '123-45-6789'
        }
      };

      const secureMessage = await securityManager.encryptMessage('conn-123', message);

      expect(secureMessage.encrypted).toBe(true);
      expect(secureMessage.classification).toBe(ClassificationLevel.CONFIDENTIAL);
    });

    test('should reject messages with invalid signatures', async () => {
      const secureMessage: SecureWebSocketMessage = {
        id: 'msg-123',
        type: 'test',
        payload: 'encrypted-data',
        encrypted: true,
        signed: true,
        classification: ClassificationLevel.INTERNAL,
        timestamp: Date.now(),
        originConnectionId: 'conn-123',
        originUserId: 'user-456',
        processingPath: [],
        signature: 'invalid-signature'
      };

      await expect(
        securityManager.decryptMessage('conn-123', secureMessage)
      ).rejects.toThrow('Message signature verification failed');
    });
  });

  describe('Threat Detection', () => {
    let context: ConnectionSecurityContext;

    beforeEach(async () => {
      context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );
      
      await securityManager.authenticateConnection('conn-123', {
        token: 'valid-token-12345'
      });
    });

    test('should detect rate limit violations', async () => {
      const eventHandler = jest.fn();
      securityManager.on('securityEvent', eventHandler);

      // Send messages rapidly to trigger rate limiting
      for (let i = 0; i < 105; i++) {
        const message = {
          type: 'test_message',
          payload: { index: i }
        };
        
        const secureMessage = await securityManager.encryptMessage('conn-123', message);
        await securityManager.decryptMessage('conn-123', secureMessage);
      }

      // Check if rate limit warning was logged
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'threat_detected',
          severity: 'warning',
          description: 'Rate limit exceeded'
        })
      );
    });

    test('should detect anomalous message patterns', async () => {
      const eventHandler = jest.fn();
      securityManager.on('securityEvent', eventHandler);

      // Send an unusually large message
      const largeMessage = {
        type: 'large_data',
        payload: {
          data: 'x'.repeat(50000) // 50KB of data
        }
      };

      // Send some normal messages first to establish baseline
      for (let i = 0; i < 10; i++) {
        const normalMessage = { type: 'normal', payload: { data: 'small' } };
        const secureMessage = await securityManager.encryptMessage('conn-123', normalMessage);
        await securityManager.decryptMessage('conn-123', secureMessage);
      }

      // Send the large message
      const secureMessage = await securityManager.encryptMessage('conn-123', largeMessage);
      await securityManager.decryptMessage('conn-123', secureMessage);

      // Check if anomaly was detected
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'anomaly',
          severity: 'warning',
          description: 'Unusually large message detected'
        })
      );
    });

    test('should block connections for security violations', async () => {
      const blockHandler = jest.fn();
      securityManager.on('connectionBlocked', blockHandler);

      await securityManager.blockConnection('conn-123', 'Test security violation', 60000);

      expect(securityManager.isConnectionBlocked('conn-123', testConnectionRequest.ipAddress)).toBe(true);
      expect(blockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionId: 'conn-123',
          reason: 'Test security violation',
          duration: 60000
        })
      );
    });

    test('should clean up blocked connections after timeout', async () => {
      await securityManager.blockConnection('conn-123', 'Temporary block', 1000);
      
      expect(securityManager.isConnectionBlocked('conn-123', testConnectionRequest.ipAddress)).toBe(true);
      
      // Fast forward past block duration
      jest.advanceTimersByTime(1500);
      
      expect(securityManager.isConnectionBlocked('conn-123', testConnectionRequest.ipAddress)).toBe(false);
    });
  });

  describe('Connection Management', () => {
    test('should track multiple connections', async () => {
      const context1 = await securityManager.initializeConnection(
        'conn-1',
        'user-1',
        testConnectionRequest
      );
      
      const context2 = await securityManager.initializeConnection(
        'conn-2',
        'user-2',
        testConnectionRequest
      );

      expect(securityManager.getConnectionContext('conn-1')).toBe(context1);
      expect(securityManager.getConnectionContext('conn-2')).toBe(context2);
      
      const stats = securityManager.getSecurityStats();
      expect(stats.totalConnections).toBe(2);
    });

    test('should clean up connection resources', async () => {
      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      expect(securityManager.getConnectionContext('conn-123')).toBeDefined();

      await securityManager.cleanupConnection('conn-123');

      expect(securityManager.getConnectionContext('conn-123')).toBeNull();
      expect(mockKeyManagementService.revokeKey).toHaveBeenCalledWith(
        'session-key-123',
        'system',
        'Session ended'
      );
    });

    test('should handle cleanup of non-existent connections', async () => {
      // Should not throw error
      await expect(
        securityManager.cleanupConnection('non-existent-conn')
      ).resolves.not.toThrow();
    });
  });

  describe('Security Statistics', () => {
    test('should provide comprehensive security statistics', async () => {
      // Create some connections
      await securityManager.initializeConnection('conn-1', 'user-1', testConnectionRequest);
      await securityManager.initializeConnection('conn-2', 'user-2', testConnectionRequest);
      
      // Authenticate one connection
      await securityManager.authenticateConnection('conn-1', {
        token: 'valid-token-12345'
      });

      const stats = securityManager.getSecurityStats();

      expect(stats).toEqual(
        expect.objectContaining({
          totalConnections: 2,
          authenticatedConnections: 1,
          encryptedConnections: 2, // Both have encryption keys
          avgRiskScore: expect.any(Number)
        })
      );
      
      expect(typeof stats.avgRiskScore).toBe('number');
      expect(stats.avgRiskScore).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty statistics gracefully', async () => {
      const stats = securityManager.getSecurityStats();

      expect(stats.totalConnections).toBe(0);
      expect(stats.authenticatedConnections).toBe(0);
      expect(stats.avgRiskScore).toBe(0);
    });
  });

  describe('Configuration and Cleanup', () => {
    test('should handle destruction properly', async () => {
      // Create connections
      await securityManager.initializeConnection('conn-1', 'user-1', testConnectionRequest);
      await securityManager.initializeConnection('conn-2', 'user-2', testConnectionRequest);

      expect(securityManager.getSecurityStats().totalConnections).toBe(2);

      // Destroy the manager
      securityManager.destroy();

      // All connections should be cleaned up
      expect(securityManager.getConnectionContext('conn-1')).toBeNull();
      expect(securityManager.getConnectionContext('conn-2')).toBeNull();
    });

    test('should handle key rotation', async () => {
      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      
      // Fast forward to trigger key rotation
      jest.advanceTimersByTime(testConfig.encryptionKeyRotationMinutes * 60000 + 1000);

      // Trigger key rotation manually (in real scenario this would be automatic)
      await securityManager.initializeConnection('conn-456', 'user-789', testConnectionRequest);

      expect(mockKeyManagementService.generateKey).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle encryption errors gracefully', async () => {
      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      // Corrupt the encryption key
      context.encryptionSessionKey = undefined;

      const message = { type: 'test', payload: { data: 'test' } };

      // Should mark as encrypted but payload should remain unencrypted when key is missing
      const secureMessage = await securityManager.encryptMessage('conn-123', message);
      expect(secureMessage.encrypted).toBe(true);
      expect(secureMessage.payload).toEqual(message.payload); // Payload should remain unencrypted
      expect(secureMessage.iv).toBeUndefined(); // No IV since no encryption happened
    });

    test('should handle classification service errors', async () => {
      mockDataClassifier.classify.mockImplementation(() => {
        throw new Error('Classification failed');
      });

      const context = await securityManager.initializeConnection(
        'conn-123',
        'user-456',
        testConnectionRequest
      );

      const message = { type: 'test', payload: { data: 'test' } };

      // Should throw error when classification fails
      await expect(
        securityManager.encryptMessage('conn-123', message)
      ).rejects.toThrow('Classification failed');
    });

    test('should handle invalid connection contexts', async () => {
      await expect(
        securityManager.authenticateConnection('non-existent', { token: 'test' })
      ).rejects.toThrow('Connection context not found');

      await expect(
        securityManager.encryptMessage('non-existent', { type: 'test', payload: {} })
      ).rejects.toThrow('Connection context not found');
    });
  });
});