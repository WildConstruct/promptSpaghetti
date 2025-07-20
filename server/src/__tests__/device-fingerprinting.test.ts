// Device Fingerprinting Service Tests
// Comprehensive tests for advanced device identification and tracking

import { DeviceFingerprintingService, DeviceFingerprintConfig } from '../services/DeviceFingerprintingService';

describe('DeviceFingerprintingService', () => {
  let deviceService: DeviceFingerprintingService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let testConfig: DeviceFingerprintConfig;

  const testUserId = 'user-123';
  const testComponents = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    screenResolution: '1920x1080',
    timezone: 'America/Los_Angeles',
    language: 'en-US',
    platform: 'MacIntel',
    hardwareConcurrency: 8,
    deviceMemory: 16,
    colorDepth: 24,
    pixelRatio: 2,
    touchSupport: false,
    webGLVendor: 'Intel Inc.',
    webGLRenderer: 'Intel Iris Plus Graphics 655',
    fonts: ['Arial', 'Helvetica', 'Times New Roman'],
    plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer'],
    canvas: 'canvas-fingerprint-hash',
    audio: 'audio-fingerprint-hash'
  };

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
      enabled: true,
      components: {
        collectCanvas: true,
        collectAudio: true,
        collectWebGL: true,
        collectFonts: true,
        collectPlugins: true,
        collectWebRTC: false,
        collectHardware: true
      },
      trustScoring: {
        newDevicePenalty: 10,
        consistencyBonus: 5,
        anomalyPenalty: 15,
        verificationBonus: 20,
        ageBonus: 10
      },
      thresholds: {
        minimumTrustScore: 40,
        suspiciousActivityThreshold: 30,
        autoBlockThreshold: 20,
        fingerprintChangeThreshold: 90
      },
      cache: {
        deviceProfileTtl: 3600,
        fingerprintTtl: 7200,
        trustScoreTtl: 1800
      },
      privacy: {
        hashSensitiveData: true,
        excludeFields: ['webRTC'],
        anonymizeIPs: true
      }
    };

    deviceService = new DeviceFingerprintingService(
      mockDb,
      mockRedis,
      mockAuditService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize device fingerprinting tables', async () => {
      await deviceService.initialize();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS device_fingerprints')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS device_user_associations')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS device_trust_profiles')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS device_security_events')
      );
    });

    it('should create performance indexes', async () => {
      await deviceService.initialize();

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_device_user_device')
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_device_trust_fingerprint')
      );
    });
  });

  describe('fingerprint generation', () => {
    it('should generate consistent fingerprints for same components', async () => {
      const fingerprint1 = await deviceService.generateFingerprint(testComponents);
      const fingerprint2 = await deviceService.generateFingerprint(testComponents);

      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash
    });

    it('should generate different fingerprints for different components', async () => {
      const modifiedComponents = { ...testComponents, userAgent: 'Different User Agent' };
      
      const fingerprint1 = await deviceService.generateFingerprint(testComponents);
      const fingerprint2 = await deviceService.generateFingerprint(modifiedComponents);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should respect privacy settings', async () => {
      const componentsWithWebRTC = {
        ...testComponents,
        webRTC: { localIP: '192.168.1.1', publicIP: '1.2.3.4' }
      };

      const fingerprint = await deviceService.generateFingerprint(componentsWithWebRTC);
      
      // Should exclude webRTC based on privacy settings
      expect(fingerprint).toBeDefined();
      // Fingerprint should be same as without webRTC
      const fingerprintWithoutWebRTC = await deviceService.generateFingerprint(testComponents);
      expect(fingerprint).toBe(fingerprintWithoutWebRTC);
    });

    it('should throw error for missing required components', async () => {
      const incompleteComponents = {
        userAgent: 'Mozilla/5.0',
        // Missing timezone and language
      };

      await expect(deviceService.generateFingerprint(incompleteComponents))
        .rejects.toThrow('Missing required fingerprint components');
    });

    it('should respect component collection settings', async () => {
      const configWithoutCanvas = {
        ...testConfig,
        components: { ...testConfig.components, collectCanvas: false }
      };
      const serviceWithoutCanvas = new DeviceFingerprintingService(
        mockDb,
        mockRedis,
        mockAuditService,
        configWithoutCanvas
      );

      const fingerprint1 = await serviceWithoutCanvas.generateFingerprint(testComponents);
      const componentsWithoutCanvas = { ...testComponents };
      delete componentsWithoutCanvas.canvas;
      const fingerprint2 = await serviceWithoutCanvas.generateFingerprint(componentsWithoutCanvas);

      expect(fingerprint1).toBe(fingerprint2);
    });
  });

  describe('device recording', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should create new device record for first-time device', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [] }); // Device not found
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await deviceService.recordDeviceAccess(
        testFingerprint,
        testComponents,
        testUserId,
        { ipAddress: '1.2.3.4', location: { country: 'US', city: 'San Francisco' } }
      );

      // Should create device record
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_fingerprints'),
        expect.any(Array)
      );
      
      // Should create user association
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_user_associations'),
        [testFingerprint, testUserId]
      );

      // Should create trust profile
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_trust_profiles'),
        expect.any(Array)
      );

      // Should log new device event
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_security_events'),
        expect.arrayContaining([testFingerprint, 'new_device', 'low'])
      );
    });

    it('should update existing device record', async () => {
      const existingDevice = {
        id: 'device-123',
        fingerprint: testFingerprint,
        first_seen: new Date('2024-01-01'),
        last_seen: new Date('2024-01-15'),
        seen_count: 10,
        trust_score: 60
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [existingDevice] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ 
            rows: [{
              fingerprint: testFingerprint,
              trust_score: 60,
              verification_status: 'verified'
            }]
          });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      await deviceService.recordDeviceAccess(testFingerprint, testComponents, testUserId);

      // Should update device access
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE device_fingerprints'),
        expect.arrayContaining([testFingerprint])
      );

      // Should update user association
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_user_associations'),
        expect.arrayContaining([testFingerprint, testUserId])
      );
    });

    it('should cache device profile', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      await deviceService.recordDeviceAccess(testFingerprint, testComponents, testUserId);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `device_profile:${testFingerprint}`,
        testConfig.cache.deviceProfileTtl,
        expect.any(String)
      );
    });
  });

  describe('trust score calculation', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should calculate trust score for new device', async () => {
      const newDevice = {
        id: 'device-123',
        fingerprint: testFingerprint,
        first_seen: new Date(),
        last_seen: new Date(),
        seen_count: 1,
        trust_score: 50
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [newDevice] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ rows: [{ trust_score: 50 }] });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await deviceService.recordDeviceAccess(testFingerprint, testComponents, testUserId);

      // New device should have penalty applied
      expect(profile.trustScore).toBeLessThan(50);
    });

    it('should increase trust score for old consistent device', async () => {
      const oldDevice = {
        id: 'device-123',
        fingerprint: testFingerprint,
        first_seen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days old
        last_seen: new Date(),
        seen_count: 100,
        trust_score: 60
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [oldDevice] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ 
            rows: [{
              trust_score: 60,
              verification_status: 'verified'
            }]
          });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ 
            rows: [{ user_id: testUserId, is_trusted: true }]
          });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ 
            rows: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 10 }))
          });
        }
        if (query.includes('SELECT COUNT')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await deviceService.recordDeviceAccess(testFingerprint, testComponents, testUserId);

      // Old device with consistent access should have higher trust
      expect(profile.trustScore).toBeGreaterThan(60);
    });

    it('should decrease trust score for device with security events', async () => {
      const device = {
        id: 'device-123',
        fingerprint: testFingerprint,
        first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        last_seen: new Date(),
        seen_count: 50,
        trust_score: 70
      };

      const securityEvents = [
        {
          event_type: 'fingerprint_change',
          severity: 'medium',
          created_at: new Date(),
          resolved: false
        },
        {
          event_type: 'suspicious_activity',
          severity: 'high',
          created_at: new Date(),
          resolved: false
        }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [device] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ rows: [{ trust_score: 70 }] });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: securityEvents });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT COUNT')) {
          return Promise.resolve({ rows: [{ count: '2' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const profile = await deviceService.recordDeviceAccess(testFingerprint, testComponents, testUserId);

      // Device with unresolved security events should have lower trust
      expect(profile.trustScore).toBeLessThan(70);
    });
  });

  describe('device verification', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should verify valid device', async () => {
      const device = {
        fingerprint: testFingerprint,
        is_blocked: false,
        trust_score: 70
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [device] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ 
            rows: [{
              trust_score: 70,
              verification_status: 'verified'
            }]
          });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ 
            rows: [{ user_id: testUserId, is_trusted: true }]
          });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT COUNT')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const verification = await deviceService.verifyDevice(testFingerprint, undefined, testUserId);

      expect(verification.isValid).toBe(true);
      expect(verification.trustScore).toBe(70);
      expect(verification.requiresAdditionalVerification).toBe(false);
    });

    it('should reject blocked device', async () => {
      const blockedDevice = {
        fingerprint: testFingerprint,
        is_blocked: true,
        trust_score: 10
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [blockedDevice] });
        }
        return Promise.resolve({ rows: [] });
      });

      const verification = await deviceService.verifyDevice(testFingerprint);

      expect(verification.isValid).toBe(false);
      expect(verification.riskFactors).toContain('device_blocked');
      expect(verification.requiresAdditionalVerification).toBe(true);
    });

    it('should detect fingerprint changes', async () => {
      const device = {
        fingerprint: testFingerprint,
        is_blocked: false,
        trust_score: 60
      };

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [device] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ rows: [{ trust_score: 60 }] });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT COUNT')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const expectedFingerprint = 'different-fingerprint-hash';
      const verification = await deviceService.verifyDevice(
        testFingerprint, 
        expectedFingerprint, 
        testUserId
      );

      expect(verification.riskFactors).toContain('significant_fingerprint_change');
      
      // Should log security event
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_security_events'),
        expect.arrayContaining([testFingerprint, 'fingerprint_change', 'medium'])
      );
    });

    it('should detect new user-device pairing', async () => {
      const device = {
        fingerprint: testFingerprint,
        is_blocked: false,
        trust_score: 60
      };

      const otherUserId = 'other-user-456';

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [device] });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ rows: [{ trust_score: 60 }] });
        }
        if (query.includes('SELECT * FROM device_user_associations')) {
          return Promise.resolve({ 
            rows: [{ user_id: otherUserId, is_trusted: true }] // Different user
          });
        }
        if (query.includes('SELECT * FROM device_security_events')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT COUNT')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const verification = await deviceService.verifyDevice(testFingerprint, undefined, testUserId);

      expect(verification.riskFactors).toContain('new_user_device_pairing');
      
      // Should log security event
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_security_events'),
        expect.arrayContaining([testFingerprint, 'new_user_association', 'low'])
      );
    });
  });

  describe('device history', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should retrieve device history', async () => {
      const device = {
        fingerprint: testFingerprint,
        first_seen: new Date('2024-01-01'),
        last_seen: new Date(),
        seen_count: 50
      };

      const users = [
        {
          user_id: testUserId,
          email: 'test@example.com',
          display_name: 'Test User',
          first_associated: new Date('2024-01-01'),
          last_accessed: new Date(),
          access_count: 30,
          is_trusted: true
        }
      ];

      const securityEvents = [
        {
          event_type: 'new_device',
          severity: 'low',
          created_at: new Date('2024-01-01'),
          resolved: true
        }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT * FROM device_fingerprints')) {
          return Promise.resolve({ rows: [device] });
        }
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: users });
        }
        if (query.includes('SELECT * FROM device_trust_profiles')) {
          return Promise.resolve({ 
            rows: [{
              location_history: [
                { country: 'US', city: 'San Francisco', timestamp: new Date() }
              ]
            }]
          });
        }
        if (query.includes('device_security_events')) {
          return Promise.resolve({ rows: securityEvents });
        }
        return Promise.resolve({ rows: [] });
      });

      const history = await deviceService.getDeviceHistory(testFingerprint);

      expect(history.device).toEqual(device);
      expect(history.users).toEqual(users);
      expect(history.locations).toHaveLength(1);
      expect(history.securityEvents).toEqual(securityEvents);
    });

    it('should throw error for non-existent device', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      await expect(deviceService.getDeviceHistory('non-existent'))
        .rejects.toThrow('Device not found');
    });
  });

  describe('device trust management', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should mark device as trusted', async () => {
      await deviceService.markDeviceAsTrusted(testFingerprint, testUserId, testUserId);

      // Should update user association
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE device_user_associations'),
        [testFingerprint, testUserId]
      );

      // Should update verification status
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE device_trust_profiles'),
        [testFingerprint]
      );

      // Should log trust event
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_security_events'),
        expect.arrayContaining([testFingerprint, 'device_trusted', 'low'])
      );
    });

    it('should block device', async () => {
      const reason = 'Suspicious activity detected';
      const blockedBy = 'admin-123';

      await deviceService.blockDevice(testFingerprint, reason, blockedBy);

      // Should update device block status
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE device_fingerprints'),
        [testFingerprint]
      );

      // Should update trust profile
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE device_trust_profiles'),
        [testFingerprint]
      );

      // Should log block event
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO device_security_events'),
        expect.arrayContaining([testFingerprint, 'device_blocked', 'high'])
      );

      // Should clear cache
      expect(mockRedis.del).toHaveBeenCalledWith(`device_profile:${testFingerprint}`);
    });
  });

  describe('device statistics', () => {
    it('should generate device statistics', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_fingerprints')) {
          return Promise.resolve({
            rows: [{
              total_devices: '100',
              new_devices: '10',
              blocked_devices: '5',
              avg_trust_score: '65.5',
              suspicious_devices: '8'
            }]
          });
        }
        if (query.includes('device_security_events')) {
          return Promise.resolve({
            rows: [{
              total_events: '50',
              high_severity_events: '5',
              unresolved_events: '12'
            }]
          });
        }
        if (query.includes('device_user_associations')) {
          return Promise.resolve({
            rows: [{
              users_with_devices: '80',
              avg_devices_per_user: '1.25'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const stats = await deviceService.getDeviceStatistics('week');

      expect(stats.timeframe).toBe('week');
      expect(stats.devices).toBeDefined();
      expect(stats.devices.total_devices).toBe('100');
      expect(stats.securityEvents).toBeDefined();
      expect(stats.userMetrics).toBeDefined();
      expect(stats.generatedAt).toBeInstanceOf(Date);
    });

    it('should support different timeframes', async () => {
      mockDb.query.mockResolvedValue({ rows: [{}] } as unknown);

      await deviceService.getDeviceStatistics('day');
      await deviceService.getDeviceStatistics('week');
      await deviceService.getDeviceStatistics('month');

      expect(mockDb.query).toHaveBeenCalledTimes(9); // 3 queries per timeframe
    });
  });

  describe('behavior metrics', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should calculate behavior metrics', async () => {
      // Mock access patterns
      const accessPatterns = [
        { hour: 9, count: '20' },
        { hour: 10, count: '25' },
        { hour: 11, count: '22' },
        { hour: 14, count: '18' },
        { hour: 15, count: '20' }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('EXTRACT(HOUR')) {
          return Promise.resolve({ rows: accessPatterns });
        }
        if (query.includes('COUNT(*) as count')) {
          return Promise.resolve({ rows: [{ count: '2' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const metrics = await (deviceService as any).calculateBehaviorMetrics(testFingerprint);

      expect(metrics.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(metrics.consistencyScore).toBeLessThanOrEqual(100);
      expect(metrics.anomalyCount).toBe(2);
      expect(metrics.accessPatterns).toBeDefined();
      expect(Object.keys(metrics.accessPatterns)).toHaveLength(accessPatterns.length);
    });
  });

  describe('fingerprint similarity', () => {
    it('should calculate fingerprint similarity correctly', () => {
      const fp1 = 'abcdef123456';
      const fp2 = 'abcdef789012'; // 50% similar

      const similarity = (deviceService as any).calculateFingerprintSimilarity(fp1, fp2);

      expect(similarity).toBe(50);
    });

    it('should return 100% for identical fingerprints', () => {
      const fp = 'abcdef123456';

      const similarity = (deviceService as any).calculateFingerprintSimilarity(fp, fp);

      expect(similarity).toBe(100);
    });

    it('should handle different length fingerprints', () => {
      const fp1 = 'abc';
      const fp2 = 'abcdef';

      const similarity = (deviceService as any).calculateFingerprintSimilarity(fp1, fp2);

      expect(similarity).toBe(50); // 3 matches out of 6 max length
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(deviceService.recordDeviceAccess('test', testComponents))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      // Should not throw error, just log it
      await expect(deviceService.recordDeviceAccess('test', testComponents))
        .resolves.toBeDefined();
    });

    it('should handle unknown device in verification', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      const verification = await deviceService.verifyDevice('unknown-fingerprint');

      expect(verification.isValid).toBe(false);
      expect(verification.trustScore).toBe(0);
      expect(verification.riskFactors).toContain('unknown_device');
    });
  });

  describe('audit logging', () => {
    const testFingerprint = 'test-fingerprint-hash';

    it('should log security events to audit service', async () => {
      await (deviceService as any).logSecurityEvent(
        testFingerprint,
        'test_event',
        'medium',
        'Test description',
        { additional: 'data' }
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        action: 'device_test_event',
        details: {
          fingerprint: testFingerprint,
          severity: 'medium',
          description: 'Test description',
          additional: 'data'
        },
        severity: 'warning'
      });
    });

    it('should map severity levels correctly', async () => {
      await (deviceService as any).logSecurityEvent(testFingerprint, 'test', 'high', 'High severity');
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );

      await (deviceService as any).logSecurityEvent(testFingerprint, 'test', 'low', 'Low severity');
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info' })
      );
    });
  });
});