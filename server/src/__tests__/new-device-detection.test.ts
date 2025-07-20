// New Device Detection Service Tests
// Comprehensive tests for intelligent new device detection and management

import { NewDeviceDetectionService, NewDevicePolicy } from '../services/NewDeviceDetectionService';
import { DeviceFingerprintingService } from '../services/DeviceFingerprintingService';

describe('NewDeviceDetectionService', () => {
  let detectionService: NewDeviceDetectionService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let mockDeviceService: unknown;
  let mockVerificationService: unknown;
  let mockEmailService: unknown;
  let testPolicy: NewDevicePolicy;

  const testUserId = 'user-123';
  const testFingerprint = 'test-fingerprint-hash';
  const testContext = {
    userId: testUserId,
    deviceFingerprint: testFingerprint,
    ipAddress: '1.2.3.4',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: {
      country: 'United States',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    },
    metadata: {
      loginTime: new Date(),
      sessionId: 'session-123',
      authMethod: 'password'
    }
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

    // Mock device fingerprinting service
    mockDeviceService = {
      calculateFingerprintSimilarity: jest.fn<unknown[], unknown>().mockReturnValue(50 as unknown),
      markDeviceAsTrusted: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown),
      blockDevice: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown)
    };

    // Mock verification service
    mockVerificationService = {
      assessVerificationRequirement: jest.fn<unknown[], unknown>().mockResolvedValue({
        required: false,
        level: 'none'
      } as unknown)
    };

    // Mock email service
    mockEmailService = {
      sendEmail: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown)
    };

    // Test policy configuration
    testPolicy = {
      enabled: true,
      detection: {
        fingerprintSimilarityThreshold: 70,
        considerLocationChange: true,
        considerUserAgentChange: true,
        maxSimilarDevices: 5
      },
      riskAssessment: {
        newDeviceBaseRisk: 50,
        trustedUserDiscount: 20,
        suspiciousPatternMultiplier: 1.5,
        recentBreachMultiplier: 2.0
      },
      verification: {
        lowRiskMethods: ['email_code'],
        mediumRiskMethods: ['email_code', 'sms_code'],
        highRiskMethods: ['email_code', 'sms_code', 'totp'],
        criticalRiskMethods: ['email_code', 'totp', 'security_questions'],
        gracePeriodHours: 24,
        maxAttempts: 3,
        lockoutDurationMinutes: 30
      },
      notifications: {
        notifyOnNewDevice: true,
        notifyOnSimilarDevice: false,
        notifyOnHighRisk: true,
        includeDeviceDetails: true,
        includeLocationDetails: true
      },
      autoApproval: {
        enabled: true,
        requireLowRisk: true,
        requireTrustedNetwork: false,
        requireBusinessHours: true,
        maxAutoApprovalsPerDay: 5
      },
      cache: {
        detectionResultTtl: 3600,
        deviceListTtl: 1800,
        riskAssessmentTtl: 900
      }
    };

    detectionService = new NewDeviceDetectionService(
      mockDb,
      mockRedis,
      mockAuditService,
      mockDeviceService,
      testPolicy,
      mockVerificationService,
      mockEmailService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('detectNewDevice', () => {
    it('should detect completely new device', async () => {
      // Mock no existing devices
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.isNewDevice).toBe(true);
      expect(result.trustScore).toBeLessThan(50);
      expect(result.requiresVerification).toBe(true);
      expect(result.verificationMethods.length).toBeGreaterThan(0);
    });

    it('should recognize known device', async () => {
      // Mock existing trusted device
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({
            rows: [{
              id: 'device-123',
              fingerprint: testFingerprint,
              trust_score: 80,
              last_seen: new Date(),
              components: { userAgent: testContext.userAgent },
              is_trusted: true,
              is_primary: true,
              last_accessed: new Date(),
              verification_status: 'verified'
            }]
          });
        }
        if (query.includes('COUNT')) {
          return Promise.resolve({ rows: [{ device_count: '1' }] });
        }
        if (query.includes('EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [{ hour: new Date().getHours(), count: '10' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.isNewDevice).toBe(false);
      expect(result.requiresVerification).toBe(false);
      expect(result.trustScore).toBeGreaterThan(50);
    });

    it('should detect similar devices', async () => {
      // Mock existing devices with similar fingerprints
      const similarDevices = [
        {
          id: 'device-1',
          fingerprint: 'similar-fingerprint-1',
          trust_score: 70,
          last_seen: new Date(),
          is_trusted: true
        },
        {
          id: 'device-2',
          fingerprint: 'similar-fingerprint-2',
          trust_score: 60,
          last_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          is_trusted: false
        }
      ];

      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: similarDevices });
        }
        return Promise.resolve({ rows: [] });
      });

      // Mock similarity scores
      mockDeviceService.calculateFingerprintSimilarity
        .mockReturnValueOnce(85) // First device is 85% similar
        .mockReturnValueOnce(75); // Second device is 75% similar

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.isNewDevice).toBe(true);
      expect(result.similarDevices).toBeDefined();
      expect(result.similarDevices!.length).toBe(2);
      expect(result.similarDevices![0].similarity).toBe(85);
    });

    it('should use cached results when available', async () => {
      const cachedResult = {
        isNewDevice: false,
        trustScore: 75,
        riskLevel: 'low',
        requiresVerification: false,
        verificationMethods: []
      };

      mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedResult));

      const result = await detectionService.detectNewDevice(testContext);

      expect(result).toEqual(cachedResult);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('should detect suspicious changes in known device', async () => {
      // Mock device with location change
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({
            rows: [{
              id: 'device-123',
              fingerprint: testFingerprint,
              trust_score: 70,
              last_seen: new Date(),
              components: {
                userAgent: testContext.userAgent,
                location: { country: 'Canada', city: 'Toronto' } // Different location
              },
              is_trusted: true,
              last_accessed: new Date()
            }]
          });
        }
        if (query.includes('security_events')) {
          return Promise.resolve({
            rows: [{ event_type: 'suspicious_login', severity: 'medium' }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.isNewDevice).toBe(true);
      expect(result.riskLevel).not.toBe('low');
    });
  });

  describe('risk assessment', () => {
    it('should calculate high risk for completely new device', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: [] }); // No devices
        }
        if (query.includes('users u')) {
          return Promise.resolve({
            rows: [{
              device_count: '0',
              avg_trust_score: null,
              account_age: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
              high_severity_events: '0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    it('should calculate low risk for trusted user with similar device', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({
            rows: [{
              fingerprint: 'existing-device',
              trust_score: 85,
              is_trusted: true
            }]
          });
        }
        if (query.includes('users u')) {
          return Promise.resolve({
            rows: [{
              device_count: '3',
              avg_trust_score: '80',
              account_age: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // Over 1 year
              high_severity_events: '0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      mockDeviceService.calculateFingerprintSimilarity.mockReturnValue(85 as unknown);

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.riskLevel).toBe('low');
    });

    it('should increase risk for suspicious patterns', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('COUNT(DISTINCT device_fingerprint)')) {
          return Promise.resolve({ rows: [{ device_count: '5' }] }); // Many devices in 1 hour
        }
        if (query.includes('EXTRACT(HOUR')) {
          return Promise.resolve({ rows: [] }); // No common access hours
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(result.riskLevel).not.toBe('low');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should increase risk for recent breaches', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('security_events') && query.includes('breach_count')) {
          return Promise.resolve({ rows: [{ breach_count: '2' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    it('should assess location risk correctly', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('user_location_history')) {
          return Promise.resolve({
            rows: [
              { country: 'Canada' },
              { country: 'Mexico' }
              // United States not in history
            ]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      // Risk should be higher due to new country
      expect(result.riskLevel).not.toBe('low');
    });
  });

  describe('verification requirements', () => {
    it('should require appropriate verification methods based on risk', async () => {
      // Test each risk level
      const riskLevels = ['low', 'medium', 'high', 'critical'];
      
      for (const level of riskLevels) {
        const methods = (detectionService as any).getVerificationMethods(level);
        expect(methods).toEqual((testPolicy.verification as any)[`${level}RiskMethods`]);
      }
    });

    it('should not require verification for auto-approved devices', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('device_user_associations')) {
          return Promise.resolve({
            rows: [{
              fingerprint: 'similar-device',
              trust_score: 75,
              is_trusted: true
            }]
          });
        }
        if (query.includes('users u')) {
          return Promise.resolve({
            rows: [{
              device_count: '2',
              avg_trust_score: '75',
              account_age: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              high_severity_events: '0'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      mockDeviceService.calculateFingerprintSimilarity.mockReturnValue(80 as unknown);

      // Set time to business hours
      const businessHourContext = {
        ...testContext,
        metadata: {
          ...testContext.metadata,
          loginTime: new Date('2024-01-15T10:00:00') // Monday 10 AM
        }
      };

      const result = await detectionService.detectNewDevice(businessHourContext);

      expect(result.requiresVerification).toBe(false);
    });

    it('should require verification outside business hours', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      // Set time to late night
      const lateNightContext = {
        ...testContext,
        metadata: {
          ...testContext.metadata,
          loginTime: new Date('2024-01-15T02:00:00') // 2 AM
        }
      };

      const result = await detectionService.detectNewDevice(lateNightContext);

      expect(result.requiresVerification).toBe(true);
    });
  });

  describe('notifications', () => {
    beforeEach(() => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT email')) {
          return Promise.resolve({
            rows: [{ email: 'user@example.com', display_name: 'Test User' }]
          });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should send notification for new device', async () => {
      const result = await detectionService.detectNewDevice(testContext);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: expect.stringContaining('New Device'),
        text: expect.stringContaining('new device'),
        priority: 'normal'
      });
    });

    it('should send urgent notification for high risk', async () => {
      // Mock high risk scenario
      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT email')) {
          return Promise.resolve({
            rows: [{ email: 'user@example.com', display_name: 'Test User' }]
          });
        }
        if (query.includes('security_events') && query.includes('breach_count')) {
          return Promise.resolve({ rows: [{ breach_count: '3' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await detectionService.detectNewDevice(testContext);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: expect.stringContaining('URGENT'),
        text: expect.any(String),
        priority: 'high'
      });
    });

    it('should include device details when configured', async () => {
      await detectionService.detectNewDevice(testContext);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: expect.any(String),
        subject: expect.any(String),
        text: expect.stringContaining('Browser/App:'),
        priority: expect.any(String)
      });
    });

    it('should include location details when configured', async () => {
      await detectionService.detectNewDevice(testContext);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: expect.any(String),
        subject: expect.any(String),
        text: expect.stringContaining('San Francisco'),
        priority: expect.any(String)
      });
    });

    it('should not send notification when disabled', async () => {
      const noNotifyPolicy = {
        ...testPolicy,
        notifications: {
          ...testPolicy.notifications,
          notifyOnNewDevice: false
        }
      };

      const serviceNoNotify = new NewDeviceDetectionService(
        mockDb,
        mockRedis,
        mockAuditService,
        mockDeviceService,
        noNotifyPolicy,
        mockVerificationService,
        mockEmailService
      );

      await serviceNoNotify.detectNewDevice(testContext);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('device approval/rejection', () => {
    it('should approve device successfully', async () => {
      const success = await detectionService.approveDevice(
        testUserId,
        testFingerprint,
        'email_verification'
      );

      expect(success).toBe(true);
      expect(mockDeviceService.markDeviceAsTrusted).toHaveBeenCalledWith(
        testFingerprint,
        testUserId,
        testUserId
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'device_approved',
        details: {
          deviceFingerprint: testFingerprint,
          approvalMethod: 'email_verification'
        },
        severity: 'info'
      });
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should reject device successfully', async () => {
      const reason = 'User reported as suspicious';
      const success = await detectionService.rejectDevice(
        testUserId,
        testFingerprint,
        reason
      );

      expect(success).toBe(true);
      expect(mockDeviceService.blockDevice).toHaveBeenCalledWith(
        testFingerprint,
        reason,
        testUserId
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'device_rejected',
        details: {
          deviceFingerprint: testFingerprint,
          reason
        },
        severity: 'warning'
      });
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should emit events on approval/rejection', async () => {
      const approvalListener = jest.fn<unknown[], unknown>();
      const rejectionListener = jest.fn<unknown[], unknown>();

      detectionService.on('device_approved', approvalListener);
      detectionService.on('device_rejected', rejectionListener);

      await detectionService.approveDevice(testUserId, testFingerprint, 'method');
      await detectionService.rejectDevice(testUserId, testFingerprint, 'reason');

      expect(approvalListener).toHaveBeenCalledWith({
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        approvalMethod: 'method'
      });

      expect(rejectionListener).toHaveBeenCalledWith({
        userId: testUserId,
        deviceFingerprint: testFingerprint,
        reason: 'reason'
      });
    });
  });

  describe('device verification status', () => {
    it('should return verified status for trusted device', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          is_trusted: true,
          verification_status: 'verified',
          trust_score: 85
        }]
      } as unknown);

      const status = await detectionService.getDeviceVerificationStatus(
        testUserId,
        testFingerprint
      );

      expect(status.verified).toBe(true);
      expect(status.verificationRequired).toBe(false);
    });

    it('should return unverified status for new device', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      const status = await detectionService.getDeviceVerificationStatus(
        testUserId,
        testFingerprint
      );

      expect(status.verified).toBe(false);
      expect(status.verificationRequired).toBe(true);
      expect(status.verificationMethods).toBeDefined();
      expect(status.attemptsRemaining).toBe(testPolicy.verification.maxAttempts);
    });

    it('should require verification for low trust device', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          is_trusted: false,
          verification_status: 'unverified',
          trust_score: 25
        }]
      } as unknown);

      const status = await detectionService.getDeviceVerificationStatus(
        testUserId,
        testFingerprint
      );

      expect(status.verified).toBe(false);
      expect(status.verificationRequired).toBe(true);
    });
  });

  describe('recent devices', () => {
    it('should retrieve recent new devices', async () => {
      const recentDevices = [
        {
          fingerprint: 'device-1',
          detected_at: new Date('2024-01-10'),
          risk_level: 'medium',
          location: { country: 'US', city: 'NYC' },
          approved: true
        },
        {
          fingerprint: 'device-2',
          detected_at: new Date('2024-01-05'),
          risk_level: 'high',
          location: { country: 'UK', city: 'London' },
          approved: false
        }
      ];

      mockDb.query.mockResolvedValue({ rows: recentDevices } as unknown);

      const devices = await detectionService.getRecentNewDevices(testUserId, 30);

      expect(devices).toHaveLength(2);
      expect(devices[0].fingerprint).toBe('device-1');
      expect(devices[0].approved).toBe(true);
      expect(devices[1].riskLevel).toBe('high');
    });

    it('should handle empty device list', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      const devices = await detectionService.getRecentNewDevices(testUserId);

      expect(devices).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(detectionService.detectNewDevice(testContext))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));
      
      // Should continue without cache
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      const result = await detectionService.detectNewDevice(testContext);
      
      expect(result).toBeDefined();
      expect(result.isNewDevice).toBe(true);
    });

    it('should handle email service errors gracefully', async () => {
      mockEmailService.sendEmail.mockRejectedValue(new Error('Email service down'));
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      // Should not throw, just log error
      await expect(detectionService.detectNewDevice(testContext))
        .resolves.toBeDefined();
    });
  });

  describe('event emission', () => {
    it('should emit new_device_detected event', async () => {
      const listener = jest.fn<unknown[], unknown>();
      detectionService.on('new_device_detected', listener);

      mockDb.query.mockResolvedValue({ rows: [] } as unknown);
      const result = await detectionService.detectNewDevice(testContext);

      expect(listener).toHaveBeenCalledWith(testContext, result);
    });
  });

  describe('audit logging', () => {
    it('should log all detection events', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as unknown);

      await detectionService.detectNewDevice(testContext);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'new_device_detected',
        details: expect.objectContaining({
          deviceFingerprint: testFingerprint,
          isNewDevice: true,
          trustScore: expect.any(Number),
          riskLevel: expect.any(String)
        }),
        severity: expect.any(String),
        ipAddress: testContext.ipAddress,
        userAgent: testContext.userAgent
      });
    });

    it('should log notification events', async () => {
      mockDb.query.mockImplementation((query) => {
        if (query.includes('SELECT email')) {
          return Promise.resolve({
            rows: [{ email: 'user@example.com', display_name: 'Test User' }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      await detectionService.detectNewDevice(testContext);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'new_device_notification_sent',
        details: expect.objectContaining({
          deviceFingerprint: testFingerprint,
          notificationType: 'email'
        }),
        severity: 'info'
      });
    });
  });
});