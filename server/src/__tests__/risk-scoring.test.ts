// Risk Scoring Algorithm Tests
// Comprehensive test coverage for login anomaly detection risk scoring

import { 
  RiskScoringService, 
  LoginAttempt, 
  UserProfile, 
  RiskFactors,
  RiskScore,
  RiskScoringConfig
 from '../services/RiskScoringService';

describe('RiskScoringService', () => {
  let riskScoring: RiskScoringService;
  let baseUserProfile: UserProfile;
  let baseLoginAttempt: LoginAttempt;
  let recentAttempts: LoginAttempt[];

  beforeEach(() => {
    riskScoring = new RiskScoringService();
    
    baseUserProfile = {
      userId: 'user123',
      typicalLocations: [
        { country: 'US', region: 'CA', frequency: 80 },
        { country: 'US', region: 'NY', frequency: 20 }
      ],
      typicalDevices: [
        { 
          fingerprint: 'device123', 
          lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          frequency: 90 

      ],
      typicalLoginTimes: [
        { hourOfDay: 9, dayOfWeek: 1, frequency: 50 }, // Monday 9 AM
        { hourOfDay: 14, dayOfWeek: 3, frequency: 30 }  // Wednesday 2 PM
      ],
      accountAge: 365, // 1 year
      mfaEnabled: true,
      riskLevel: 'low'
    };

    baseLoginAttempt = {
      userId: 'user123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        coordinates: { lat: 37.7749, lng: -122.4194 }

      timestamp: new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
      success: true,
      sessionId: 'session123',
      deviceFingerprint: 'device123',
      twoFactorUsed: true
    };

    recentAttempts = [];
  });

  describe('calculateRiskScore', () => {
    it('should return low risk for typical login pattern', async () => {
      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.severity).toBe('low');
      expect(result.overallScore).toBeLessThan(30);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.factors.newLocation).toBeLessThan(0.3);
      expect(result.factors.timeAnomaly).toBeLessThan(0.8);
      expect(result.factors.deviceAnomaly).toBeLessThan(0.3);
    });

    it('should return high risk for completely new location', async () => {
      const newLocationAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'CN',
          region: 'Beijing',
          city: 'Beijing',
          coordinates: { lat: 39.9042, lng: 116.4074 }

      };

      const result = await riskScoring.calculateRiskScore(
        newLocationAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.severity).toBeOneOf(['low', 'medium', 'high', 'critical']);
      expect(result.factors.newLocation).toBeGreaterThan(0.8);
      expect(result.recommendations).toContain('Verify login from new location with additional authentication');
    });

    it('should detect brute force patterns', async () => {
      // Create multiple failed attempts from same IP
      const failedAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 15; i++) {
        failedAttempts.push({
          ...baseLoginAttempt,
          success: false,
          timestamp: new Date(Date.now() - (15 - i) * 60 * 1000) // 15 minutes ago to now
        });


      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        failedAttempts
      );

      expect(result.factors.bruteForceIndicator).toBeGreaterThan(0.8);
      expect(result.recommendations).toContain('Consider blocking IP address due to brute force pattern');
      expect(result.severity).toBeOneOf(['low', 'medium', 'high', 'critical']);
    });

    it('should detect credential stuffing patterns', async () => {
      // Create attempts across multiple users from same IP
      const stuffingAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 25; i++) {
        stuffingAttempts.push({
          ...baseLoginAttempt,
          userId: `user${i}`,
          success: false,
          timestamp: new Date(Date.now() - (25 - i) * 30 * 1000) // 12.5 minutes ago to now
        });


      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        stuffingAttempts
      );

      expect(result.factors.credentialStuffing).toBeGreaterThan(0.8);
      expect(result.recommendations).toContain('Implement CAPTCHA or additional verification');
    });

    it('should detect velocity anomalies (impossible travel)', async () => {
      // Previous login from US West Coast
      const previousAttempt: LoginAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'US',
          region: 'CA',
          city: 'Los Angeles',
          coordinates: { lat: 34.0522, lng: -118.2437 }

        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      // Current login from Europe (impossible to travel in 30 minutes)
      const currentAttempt: LoginAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'GB',
          region: 'England',
          city: 'London',
          coordinates: { lat: 51.5074, lng: -0.1278 }

      };

      const result = await riskScoring.calculateRiskScore(
        currentAttempt,
        baseUserProfile,
        [previousAttempt]
      );

      expect(result.factors.velocityAnomaly).toBeGreaterThan(0.0001);
      expect(result.recommendations).toContain('Review for impossible travel patterns');
    });

    it('should detect time anomalies', async () => {
      const nighttimeAttempt = {
        ...baseLoginAttempt,
        timestamp: new Date('2024-01-15T03:00:00Z') // 3 AM, unusual time
      };

      const result = await riskScoring.calculateRiskScore(
        nighttimeAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.factors.timeAnomaly).toBeGreaterThan(0.5);
    });

    it('should detect new device usage', async () => {
      const newDeviceAttempt = {
        ...baseLoginAttempt,
        deviceFingerprint: 'unknown_device_456'
      };

      const result = await riskScoring.calculateRiskScore(
        newDeviceAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.factors.deviceAnomaly).toBeGreaterThan(0.5);
    });

    it('should detect MFA bypass attempts', async () => {
      const mfaBypassAttempt = {
        ...baseLoginAttempt,
        twoFactorUsed: false
      };

      const result = await riskScoring.calculateRiskScore(
        mfaBypassAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.factors.mfaBypass).toBeGreaterThan(0.7);
      expect(result.recommendations).toContain('Enforce multi-factor authentication');
    });

    it('should handle missing location data gracefully', async () => {
      const noLocationAttempt = {
        ...baseLoginAttempt,
        location: undefined
      };

      const result = await riskScoring.calculateRiskScore(
        noLocationAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.factors.newLocation).toBeGreaterThan(0);
      expect(result.factors.geographicDistance).toBeGreaterThan(0);
    });

    it('should calculate confidence based on available data', async () => {
      // Test with minimal data
      const minimalProfile: UserProfile = {
        ...baseUserProfile,
        typicalLocations: [],
        typicalDevices: [],
        accountAge: 1
      };

      const minimalAttempt = {
        userId: 'user123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
        success: true
      };

      const lowConfidenceResult = await riskScoring.calculateRiskScore(
        minimalAttempt,
        minimalProfile,
        []
      );

      expect(lowConfidenceResult.confidence).toBeLessThan(0.7);

      // Test with rich data
      const richConfidenceResult = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(richConfidenceResult.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('risk factor calculations', () => {
    it('should calculate location risk correctly', async () => {
      // Test known location
      const knownLocationResult = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        recentAttempts
      );
      expect(knownLocationResult.factors.newLocation).toBeLessThan(0.3);

      // Test same country, different region
      const sameCountryAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'US',
          region: 'TX',
          city: 'Austin',
          coordinates: { lat: 30.2672, lng: -97.7431 }

      };

      const sameCountryResult = await riskScoring.calculateRiskScore(
        sameCountryAttempt,
        baseUserProfile,
        recentAttempts
      );
      expect(sameCountryResult.factors.newLocation).toBeCloseTo(0.4, 1);

      // Test completely new country
      const newCountryAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'DE',
          region: 'Berlin',
          city: 'Berlin',
          coordinates: { lat: 52.5200, lng: 13.4050 }

      };

      const newCountryResult = await riskScoring.calculateRiskScore(
        newCountryAttempt,
        baseUserProfile,
        recentAttempts
      );
      expect(newCountryResult.factors.newLocation).toBeCloseTo(0.9, 1);
    });

    it('should calculate frequency anomaly correctly', async () => {
      // Create many recent attempts for same user
      const frequentAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 25; i++) {
        frequentAttempts.push({
          ...baseLoginAttempt,
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000) // Every hour for 25 hours
        });


      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        frequentAttempts
      );

      expect(result.factors.frequencyAnomaly).toBeGreaterThan(0.8);
    });

    it('should map account risk levels correctly', async () => {
      const highRiskProfile = {
        ...baseUserProfile,
        riskLevel: 'high' as const
      };

      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        highRiskProfile,
        recentAttempts
      );

      expect(result.factors.accountRiskLevel).toBeCloseTo(0.7, 1);
    });
  });

  describe('configuration and weighting', () => {
    it('should respect custom configuration', () => {
      const customConfig: Partial<RiskScoringConfig> = {
        weights: {
          location: 0.5,
          behavioral: 0.2,
          patterns: 0.2,
          contextual: 0.1

        thresholds: {
          low: 20,
          medium: 50,
          high: 80,
          critical: 95

      };

      const customRiskScoring = new RiskScoringService(customConfig);
      expect(customRiskScoring['config'].weights.location).toBe(0.5);
      expect(customRiskScoring['config'].thresholds.low).toBe(20);
    });

    it('should use default configuration when not provided', () => {
      const defaultRiskScoring = new RiskScoringService();
      expect(defaultRiskScoring['config'].weights.location).toBe(0.3);
      expect(defaultRiskScoring['config'].thresholds.medium).toBe(60);
    });
  });

  describe('scoring thresholds and severity', () => {
    it('should classify severity levels correctly', async () => {
      // Create a high-risk scenario
      const highRiskAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'CN',
          region: 'Beijing',
          city: 'Beijing',
          coordinates: { lat: 39.9042, lng: 116.4074 }

        deviceFingerprint: 'suspicious_device',
        twoFactorUsed: false,
        timestamp: new Date('2024-01-15T03:00:00Z') // 3 AM
      };

      // Add brute force attempts
      const maliciousAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 20; i++) {
        maliciousAttempts.push({
          ...highRiskAttempt,
          success: false,
          timestamp: new Date(Date.now() - (20 - i) * 60 * 1000)
        });


      const result = await riskScoring.calculateRiskScore(
        highRiskAttempt,
        baseUserProfile,
        maliciousAttempts
      );

      expect(result.overallScore).toBeGreaterThan(40);
      expect(result.severity).toBeOneOf(['medium', 'high', 'critical']);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
    });

    it('should provide appropriate explanations', async () => {
      const suspiciousAttempt = {
        ...baseLoginAttempt,
        location: {
          country: 'RU',
          region: 'Moscow',
          city: 'Moscow',
          coordinates: { lat: 55.7558, lng: 37.6176 }

        twoFactorUsed: false
      };

      const result = await riskScoring.calculateRiskScore(
        suspiciousAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.explanation).toContain('Risk score');
      expect(result.explanation).toContain('due to');
      expect(result.explanation.length).toBeGreaterThan(50);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty user profile gracefully', async () => {
      const emptyProfile: UserProfile = {
        userId: 'newuser',
        typicalLocations: [],
        typicalDevices: [],
        typicalLoginTimes: [],
        accountAge: 0,
        mfaEnabled: false,
        riskLevel: 'medium'
      };

      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        emptyProfile,
        recentAttempts
      );

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.severity).toBeDefined();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedAttempt = {
        ...baseLoginAttempt,
        location: {
          country: '',
          region: '',
          city: '',
          coordinates: undefined

      };

      const result = await riskScoring.calculateRiskScore(
        malformedAttempt,
        baseUserProfile,
        recentAttempts
      );

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.factors.geographicDistance).toBeGreaterThan(0);
    });

    it('should handle very old device last seen dates', async () => {
      const oldDeviceProfile = {
        ...baseUserProfile,
        typicalDevices: [
          {
            fingerprint: 'device123',
            lastSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            frequency: 50

        ]
      };

      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        oldDeviceProfile,
        recentAttempts
      );

      expect(result.factors.deviceAnomaly).toBeGreaterThan(0.3);
    });
  });

  describe('performance and limits', () => {
    it('should handle large numbers of recent attempts efficiently', async () => {
      // Create 1000 recent attempts
      const manyAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 1000; i++) {
        manyAttempts.push({
          ...baseLoginAttempt,
          timestamp: new Date(Date.now() - i * 60 * 1000) // Every minute
        });


      const startTime = Date.now();
      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        manyAttempts
      );
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(result.overallScore).toBeGreaterThan(0);
    });

    it('should normalize extreme values correctly', async () => {
      // Test with extreme brute force attempt count
      const extremeAttempts: LoginAttempt[] = [];
      for (let i = 0; i < 100; i++) {
        extremeAttempts.push({
          ...baseLoginAttempt,
          success: false,
          timestamp: new Date(Date.now() - (100 - i) * 60 * 1000)
        });


      const result = await riskScoring.calculateRiskScore(
        baseLoginAttempt,
        baseUserProfile,
        extremeAttempts
      );

      expect(result.factors.bruteForceIndicator).toBeLessThanOrEqual(1);
      expect(result.factors.bruteForceIndicator).toBeCloseTo(1, 1);
    });
  });
});

// Helper matcher for Jest
expect.extend({
  toBeOneOf(received: any, options: any[]) {
    const pass = options.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${options.join(', ')}`,
        pass: true
      };
 else {
      return {
        message: () => `expected ${received} to be one of ${options.join(', ')}`,
        pass: false
      };


});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(options: any[]): R;


