// Verification Threshold Service Tests
// Comprehensive tests for risk assessment and verification logic

import { VerificationThresholdService, VerificationContext, ThresholdConfig } from '../services/VerificationThresholdService';

describe('VerificationThresholdService', () => {
  let thresholdService: VerificationThresholdService;
  let mockDb: any;
  let mockRedis: any;
  let mockAuditService: any;
  let testConfig: Partial<ThresholdConfig>;

  const testUserId = 'user-123';
  const testContext: VerificationContext = {
    userId: testUserId,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceFingerprint: 'device-123',
    sessionId: 'session-456',
    requestedAction: 'password_change',
    geoLocation: {
      country: 'US',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles'
  }
    timestamp: new Date('2024-01-15T14:30:00Z')
  };

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn().mockResolvedValue(true)
    };

    // Test configuration with lower thresholds for easier testing
    testConfig = {
      lowRisk: 25,
      mediumRisk: 50,
      highRisk: 75,
      criticalRisk: 90,
      weights: {
        deviceTrust: 30,
        locationRisk: 25,
        behaviorAnomalies: 20,
        timeFactors: 15,
        securityEvents: 10
  }
      actionThresholds: {
        'password_change': { baseThreshold: 40, riskMultiplier: 1.5 },
        'admin_action': { baseThreshold: 60, riskMultiplier: 1.2 }
      }
    };

    thresholdService = new VerificationThresholdService(
      mockDb,
      mockRedis,
      mockAuditService,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('device trust assessment', () => {
    it('should assign high risk to unknown devices', async () => {
      // Mock no device history
      mockDb.query.mockResolvedValueOnce({
        rows: [{ login_count: '0', successful_logins: '0' }]
      });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const deviceFactor = requirement.factors.find(f => f.factor === 'device_trust');
      expect(deviceFactor).toBeDefined();
      expect(deviceFactor!.score).toBeGreaterThan(60);
      expect(deviceFactor!.description).toContain('Unknown device');
    });

    it('should assign low risk to trusted devices', async () => {
      // Mock established device history with high success rate
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          login_count: '20',
          successful_logins: '19',
          first_seen: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          last_seen: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }]
      });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const deviceFactor = requirement.factors.find(f => f.factor === 'device_trust');
      expect(deviceFactor).toBeDefined();
      expect(deviceFactor!.score).toBeLessThan(30);
      expect(deviceFactor!.description).toContain('Device trust');
    });

    it('should handle missing device fingerprint', async () => {
      const contextWithoutDevice = { ...testContext, deviceFingerprint: undefined };

      const requirement = await thresholdService.assessVerificationRequirement(contextWithoutDevice);

      const deviceFactor = requirement.factors.find(f => f.factor === 'device_trust');
      expect(deviceFactor).toBeDefined();
      expect(deviceFactor!.score).toBe(60);
      expect(deviceFactor!.description).toContain('No device fingerprint');
    });
  });

  describe('location risk assessment', () => {
    it('should assign low risk to known locations', async () => {
      // Mock known location with multiple visits
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          country: 'US',
          city: 'San Francisco',
          access_count: '15',
          last_access: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }]
      });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const locationFactor = requirement.factors.find(f => f.factor === 'location_risk');
      expect(locationFactor).toBeDefined();
      expect(locationFactor!.score).toBeLessThan(30);
      expect(locationFactor!.description).toContain('Known location');
    });

    it('should assign medium risk to new cities in known countries', async () => {
      // Mock known country but different city
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          country: 'US',
          city: 'New York',
          access_count: '5',
          last_access: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }]
      });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const locationFactor = requirement.factors.find(f => f.factor === 'location_risk');
      expect(locationFactor).toBeDefined();
      expect(locationFactor!.score).toBe(45);
      expect(locationFactor!.description).toContain('New city in known country');
    });

    it('should assign high risk to new countries', async () => {
      // Mock no location history
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const locationFactor = requirement.factors.find(f => f.factor === 'location_risk');
      expect(locationFactor).toBeDefined();
      expect(locationFactor!.score).toBe(75);
      expect(locationFactor!.description).toContain('New country');
    });

    it('should handle missing location information', async () => {
      const contextWithoutLocation = { 
        ...testContext, 
        geoLocation: undefined, 
        ipAddress: undefined 
      };

      const requirement = await thresholdService.assessVerificationRequirement(contextWithoutLocation);

      const locationFactor = requirement.factors.find(f => f.factor === 'location_risk');
      expect(locationFactor).toBeDefined();
      expect(locationFactor!.score).toBe(40);
      expect(locationFactor!.description).toContain('Location information unavailable');
    });
  });

  describe('behavior anomaly assessment', () => {
    it('should detect rapid successive actions', async () => {
      // Mock high activity in short time
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // recent activity query
        .mockResolvedValueOnce({ rows: [{ rapid_count: '15' }] }) // rapid actions
        .mockResolvedValueOnce({ rows: [] }); // typical hours

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const behaviorFactor = requirement.factors.find(f => f.factor === 'behavior_anomalies');
      expect(behaviorFactor).toBeDefined();
      expect(behaviorFactor!.score).toBeGreaterThan(40);
      expect(behaviorFactor!.description).toContain('15 actions in last 10 minutes');
    });

    it('should detect off-pattern timing', async () => {
      // Mock user typically active 9-17 (business hours)
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // recent activity
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] }) // normal action count
        .mockResolvedValueOnce({ 
          rows: [
            { hour: '9', frequency: '10' },
            { hour: '14', frequency: '8' },
            { hour: '16', frequency: '6' }
          ]
        }); // typical hours (user active 9-16)

      // Test with late night access
      const lateNightContext = {
        ...testContext,
        timestamp: new Date('2024-01-15T23:30:00Z') // 11:30 PM
      };

      const requirement = await thresholdService.assessVerificationRequirement(lateNightContext);

      const behaviorFactor = requirement.factors.find(f => f.factor === 'behavior_anomalies');
      expect(behaviorFactor).toBeDefined();
      expect(behaviorFactor!.score).toBeGreaterThan(30);
      expect(behaviorFactor!.description).toContain('unusual time of access');
    });

    it('should assign low risk for normal behavior', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '3' }] })
        .mockResolvedValueOnce({ 
          rows: [{ hour: '14', frequency: '10' }] // Current hour is 14
        });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const behaviorFactor = requirement.factors.find(f => f.factor === 'behavior_anomalies');
      expect(behaviorFactor).toBeDefined();
      expect(behaviorFactor!.score).toBe(20); // Base score
      expect(behaviorFactor!.description).toContain('Normal behavior patterns');
    });
  });

  describe('time factors assessment', () => {
    it('should assign risk for off-hours access', async () => {
      const offHoursContext = {
        ...testContext,
        timestamp: new Date('2024-01-15T02:30:00Z') // 2:30 AM
      };

      const requirement = await thresholdService.assessVerificationRequirement(offHoursContext);

      const timeFactor = requirement.factors.find(f => f.factor === 'time_factors');
      expect(timeFactor).toBeDefined();
      expect(timeFactor!.score).toBeGreaterThan(40); // Off-hours + very early morning
      expect(timeFactor!.description).toContain('off-hours access');
      expect(timeFactor!.description).toContain('very early morning');
    });

    it('should assign risk for weekend access', async () => {
      const weekendContext = {
        ...testContext,
        timestamp: new Date('2024-01-13T14:30:00Z') // Saturday
      };

      const requirement = await thresholdService.assessVerificationRequirement(weekendContext);

      const timeFactor = requirement.factors.find(f => f.factor === 'time_factors');
      expect(timeFactor).toBeDefined();
      expect(timeFactor!.score).toBe(15); // Weekend access only
      expect(timeFactor!.description).toContain('weekend access');
    });

    it('should assign no time risk for normal hours', async () => {
      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const timeFactor = requirement.factors.find(f => f.factor === 'time_factors');
      expect(timeFactor).toBeDefined();
      expect(timeFactor!.score).toBe(0);
      expect(timeFactor!.description).toContain('Normal access hours');
    });
  });

  describe('security events assessment', () => {
    it('should assign high risk for recent security events', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          { action: 'login_failed', event_count: '5', last_occurrence: new Date() },
          { action: 'suspicious_activity', event_count: '1', last_occurrence: new Date() }
        ]
      });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const securityFactor = requirement.factors.find(f => f.factor === 'security_events');
      expect(securityFactor).toBeDefined();
      expect(securityFactor!.score).toBeGreaterThan(60);
      expect(securityFactor!.description).toContain('5 failed logins');
      expect(securityFactor!.description).toContain('suspicious activity detected');
    });

    it('should assign low risk with no recent security events', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      const securityFactor = requirement.factors.find(f => f.factor === 'security_events');
      expect(securityFactor).toBeDefined();
      expect(securityFactor!.score).toBe(0);
      expect(securityFactor!.description).toContain('No recent security events');
    });
  });

  describe('risk score calculation and verification levels', () => {
    it('should calculate weighted risk score correctly', async () => {
      // Mock all factors with known scores
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '0' }] }) // device: 80 score
        .mockResolvedValueOnce({ rows: [] }) // location: 75 score  
        .mockResolvedValueOnce({ rows: [] }) // behavior recent activity
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] }) // behavior rapid
        .mockResolvedValueOnce({ rows: [] }) // behavior typical hours
        .mockResolvedValueOnce({ rows: [] }); // security events: 0 score

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      // Expected calculation with test config weights:
      // Device (30%): 80 * 0.30 = 24
      // Location (25%): 75 * 0.25 = 18.75
      // Behavior (20%): 20 * 0.20 = 4
      // Time (15%): 0 * 0.15 = 0
      // Security (10%): 0 * 0.10 = 0
      // Total: 46.75

      expect(requirement.riskScore).toBeCloseTo(46.75, 1);
    });

    it('should require no verification for low risk', async () => {
      // Mock all low risk factors
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            login_count: '20', 
            successful_logins: '19',
            first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }] 
        }) // device: low risk
        .mockResolvedValueOnce({ 
          rows: [{ 
            country: 'US', 
            city: 'San Francisco', 
            access_count: '15',
            last_access: new Date()
          }] 
        }) // location: low risk
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] })
        .mockResolvedValueOnce({ rows: [{ hour: '14', frequency: '10' }] })
        .mockResolvedValueOnce({ rows: [] }); // security: low risk

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      expect(requirement.required).toBe(false);
      expect(requirement.level).toBe('none');
      expect(requirement.riskScore).toBeLessThan(25);
    });

    it('should require TOTP for high risk', async () => {
      // Mock high risk factors
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '0' }] }) // new device
        .mockResolvedValueOnce({ rows: [] }) // new location
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '15' }] }) // rapid actions
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ 
          rows: [{ 
            action: 'suspicious_activity', 
            event_count: '1',
            last_occurrence: new Date()
          }] 
        }); // security events

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      expect(requirement.required).toBe(true);
      expect(requirement.level).toBe('totp');
      expect(requirement.riskScore).toBeGreaterThan(60);
    });
  });

  describe('action-specific thresholds', () => {
    it('should apply action-specific threshold for password changes', async () => {
      const config = thresholdService.getThresholdConfig();
      expect(config.actionThresholds['password_change']).toBeDefined();
      expect(config.actionThresholds['password_change'].baseThreshold).toBe(40);
    });

    it('should use default threshold for unknown actions', async () => {
      const unknownActionContext = {
        ...testContext,
        requestedAction: 'unknown_action'
      };

      // Mock medium risk scenario
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '5' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '3' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const requirement = await thresholdService.assessVerificationRequirement(unknownActionContext);

      expect(requirement.threshold).toBeGreaterThanOrEqual(25);
    });
  });

  describe('bypass options', () => {
    it('should allow bypass for recent successful verification', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        level: 'totp',
        completedAt: new Date().toISOString()
      }));

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      expect(requirement.bypass?.available).toBe(true);
      expect(requirement.bypass?.reason).toContain('Recent successful verification');
    });

    it('should allow admin bypass for moderate risk', async () => {
      mockRedis.get.mockResolvedValueOnce(null); // No recent verification
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '10' }] }) // medium device trust
        .mockResolvedValueOnce({ rows: [] }) // medium location risk
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '3' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ roles: ['admin', 'user'] }] }); // admin user

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      if (requirement.riskScore < 75) { // High risk threshold
        expect(requirement.bypass?.available).toBe(true);
        expect(requirement.bypass?.reason).toContain('Admin user');
      }
    });

    it('should not allow bypass for high risk scenarios', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '0' }] }) // high risk
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ roles: ['user'] }] });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      expect(requirement.bypass?.available).toBe(false);
    });
  });

  describe('verification completion tracking', () => {
    it('should record successful verification with grace period', async () => {
      await thresholdService.recordVerificationCompletion(testUserId, 'totp', true, 'authenticator_app');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `verification_bypass:${testUserId}`,
        1800, // 30 minutes for TOTP
        expect.stringContaining('totp')
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          action: 'additional_verification_completed',
          details: expect.objectContaining({
            level: 'totp',
            method: 'authenticator_app',
            success: true,
            gracePeriodSeconds: 1800
  }
  }
      );
    });

    it('should record failed verification without grace period', async () => {
      await thresholdService.recordVerificationCompletion(testUserId, 'email', false);

      expect(mockRedis.setex).not.toHaveBeenCalled();
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            success: false,
            gracePeriodSeconds: 0
  }
  }
      );
    });
  });

  describe('configuration management', () => {
    it('should update threshold configuration', async () => {
      const updates = {
        lowRisk: 20,
        mediumRisk: 45,
        weights: { deviceTrust: 35, locationRisk: 30 }
      };

      const updatedConfig = await thresholdService.updateThresholdConfig(updates);

      expect(updatedConfig.lowRisk).toBe(20);
      expect(updatedConfig.mediumRisk).toBe(45);
      expect(updatedConfig.weights.deviceTrust).toBe(35);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'verification_threshold_config_updated'
  }
      );
    });

    it('should return current configuration', () => {
      const config = thresholdService.getThresholdConfig();
      
      expect(config).toMatchObject(testConfig);
      expect(config.lowRisk).toBe(25);
      expect(config.weights.deviceTrust).toBe(30);
    });
  });

  describe('statistics and reporting', () => {
    it('should generate verification statistics', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          total_assessments: '100',
          verifications_required: '25',
          email_verifications: '15',
          totp_verifications: '8',
          admin_approvals: '2',
          avg_risk_score: '42.5',
          max_risk_score: '89.3'
        }]
      });

      const stats = await thresholdService.getVerificationStatistics('week');

      expect(stats).toMatchObject({
        total_assessments: '100',
        verifications_required: '25',
        avg_risk_score: '42.5'
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      // Should return conservative fallback
      expect(requirement.required).toBe(true);
      expect(requirement.level).toBe('totp');
      expect(requirement.riskScore).toBe(75);
      expect(requirement.factors[0].factor).toBe('assessment_error');
    });

    it('should log assessment attempts', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '5' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await thresholdService.assessVerificationRequirement(testContext);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          action: 'verification_threshold_assessment',
          details: expect.objectContaining({
            riskScore: expect.any(Number),
            threshold: expect.any(Number),
            verificationRequired: expect.any(Boolean)
  }
  }
      );
    });
  });

  describe('recommendations generation', () => {
    it('should generate relevant recommendations for high-risk factors', async () => {
      // Mock high device risk
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '0' }] }) // 80 score
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '2' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      expect(requirement.recommendations).toContain(
        'Consider adding this device to trusted devices after verification'
      );
    });

    it('should provide general recommendations for high overall risk', async () => {
      // Mock very high risk scenario
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ login_count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ rapid_count: '20' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{
            action: 'suspicious_activity',
            event_count: '1',
            last_occurrence: new Date()
          }]
        });

      const requirement = await thresholdService.assessVerificationRequirement(testContext);

      if (requirement.riskScore > 80) {
        expect(requirement.recommendations).toContain(
          'High risk detected - consider temporary account restrictions'
        );
      }
    });
  });
});