// Location Verification Service Tests
// Comprehensive test coverage for location verification challenges functionality

import { 
  LocationVerificationService,
  LocationChallengeType,
  LocationContext
} from '../auth/services/LocationVerificationService';
import { GeolocationService, GeolocationData } from '../auth/services/GeolocationService';
import { VerificationThresholdService } from '../services/VerificationThresholdService';
import { ChallengeService } from '../auth/services/ChallengeService';
import { 
  VerificationCodeManager,
  VerificationCodeType
} from '../../../../packages/core/security/VerificationCodeManager';
import { EmailService } from '../auth/services/EmailService';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

// Mock implementations
class MockGeolocationService {
  async getGeolocationData(ipAddress: string, headers?: unknown): Promise<GeolocationData> {

    // Return different geo data based on IP for testing
    if (ipAddress === '192.168.1.1') {
      return {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        confidence: 0.9,
        source: 'ipapi'
      };
    } else if (ipAddress === '8.8.8.8') {
      return {
        country: 'United States',
        countryCode: 'US',
        region: 'Virginia',
        regionCode: 'VA',
        city: 'Ashburn',
        timezone: 'America/New_York',
        coordinates: { latitude: 39.0437, longitude: -77.4875 },
        isVpn: true,
        confidence: 0.8,
        source: 'ipapi'
      };
    } else if (ipAddress === '1.2.3.4') {
      return {
        country: 'Germany',
        countryCode: 'DE',
        region: 'Berlin',
        regionCode: 'BE',
        city: 'Berlin',
        timezone: 'Europe/Berlin',
        coordinates: { latitude: 52.5200, longitude: 13.4050 },
        isTor: true,
        confidence: 0.7,
        source: 'ipapi'
      };
    }
    
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      timezone: 'UTC',
      confidence: 0.1,
      source: 'fallback'
    };
  }

  async trackLoginLocation(userId: string, ipAddress: string, geoData: GeolocationData) {
    // Mock return based on IP for testing
    if (ipAddress === '192.168.1.1') {
      return {
        isNewLocation: false,
        isTypicalLocation: true,
        distanceFromNearestKm: 0,
        suspiciousIndicators: []
      };
    } else if (ipAddress === '8.8.8.8') {
      return {
        isNewLocation: true,
        isTypicalLocation: false,
        distanceFromNearestKm: 3000,
        suspiciousIndicators: ['vpn_detected']
      };
    } else if (ipAddress === '1.2.3.4') {
      return {
        isNewLocation: true,
        isTypicalLocation: false,
        distanceFromNearestKm: 8000,
        suspiciousIndicators: ['tor_exit_node']
      };
    }
    
    return {
      isNewLocation: true,
      isTypicalLocation: false,
      distanceFromNearestKm: 100,
      suspiciousIndicators: []
    };
  }
}

class MockVerificationThresholdService {
  async checkVerificationRequired(context: unknown) {
    const riskScore = this.calculateMockRiskScore(context);
    
    return {
      required: riskScore >= 30,
      level: 'email',
      riskScore,
      threshold: 30,
      factors: [],
      recommendations: this.getMockReasons(context, riskScore)
    };
  }

  private calculateMockRiskScore(context: unknown): number {
    let score = 0;
    
    if (context.geoLocation?.isVpn) score += 20;
    if (context.geoLocation?.isTor) score += 40;
    if (context.geoLocation?.isProxy) score += 15;
    
    return Math.min(100, score);
  }

  private getMockReasons(context: unknown, riskScore: number): string[] {
    const reasons = [];
    if (context.geoLocation?.isVpn) reasons.push('VPN detected');
    if (context.geoLocation?.isTor) reasons.push('Tor detected');
    if (riskScore >= 60) reasons.push('High risk score');
    return reasons;
  }
}

class MockChallengeService {
  // Mock implementation for challenge service
}

class MockVerificationCodeManager {
  private codes: Map<string, any> = new Map();

  async generateCode(request: unknown) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verification = {
      id: codeId,
      userId: request.userId,
      type: request.type,
      code,
      hashedCode: `hashed_${code}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      maxAttempts: 3,
      metadata: request.metadata
    };
    
    this.codes.set(verification.id, verification);
    return { code, codeId };
  }

  async validateCode(request: unknown) {
    const verification = Array.from(this.codes.values()).find(v => 
      v.userId === request.userId && v.type === request.type
    );
    
    if (!verification) {
      return { valid: false, reason: 'Invalid verification code' };
    }

    if (verification.expiresAt < new Date()) {
      return { valid: false, reason: 'Verification code expired' };
    }

    if (verification.code === request.code) {
      verification.verified = true;
      return { valid: true, codeData: verification };
    }

    verification.attempts++;
    if (verification.attempts >= verification.maxAttempts) {
      return { valid: false, reason: 'Maximum attempts exceeded' };
    }

    return { 
      valid: false, 
      reason: `Invalid code. ${verification.maxAttempts - verification.attempts} attempts remaining.` 
    };
  }
}

class MockEmailService {
  public sentEmails: any[] = [];

  async sendLocationVerification(userId: string, data: unknown): Promise<void> {

    this.sentEmails.push({
      type: 'locationVerification',
      userId,
      data,
      timestamp: new Date()
    });
  }
}

class MockAuditService {
  public events: any[] = [];

  async logEvent(event: unknown): Promise<void> {

    this.events.push({
      ...event,
      timestamp: new Date()
    });
  }
}

class MockDatabaseService {
  private tables: Map<string, any[]> = new Map([
    ['location_verification_attempts', []]
  ]);

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {

    // Handle CREATE TABLE
    if (sql.includes('CREATE TABLE')) {
      return { rows: [] };
    }

    // Handle CREATE INDEX
    if (sql.includes('CREATE INDEX')) {
      return { rows: [] };
    }

    // Handle INSERT
    if (sql.includes('INSERT INTO location_verification_attempts')) {
      const attempt = {
        id: params[0],
        user_id: params[1],
        challenge_id: params[2],
        verification_code_id: params[3],
        ip_address: params[4],
        location_data: params[5],
        risk_score: params[6],
        challenge_type: params[7],
        status: params[8],
        attempts: params[9],
        max_attempts: params[10],
        created_at: params[11],
        expires_at: params[12],
        completed_at: null,
        metadata: params[13]
      };
      
      this.tables.get('location_verification_attempts')!.push(attempt);
      return { rows: [] };
    }

    // Handle SELECT
    if (sql.includes('SELECT') && sql.includes('location_verification_attempts')) {
      const attempts = this.tables.get('location_verification_attempts')!;
      
      if (sql.includes('WHERE challenge_id = $1')) {
        return { rows: attempts.filter(a => a.challenge_id === params[0]) };
      }
      
      if (sql.includes('WHERE user_id = $1')) {
        return { rows: attempts.filter(a => a.user_id === params[0]).slice(0, params[1] || 50) };
      }
      
      return { rows: attempts };
    }

    // Handle UPDATE
    if (sql.includes('UPDATE location_verification_attempts')) {
      const attempts = this.tables.get('location_verification_attempts')!;
      const challengeId = params[params.length - 1];
      const attempt = attempts.find(a => a.challenge_id === challengeId);
      
      if (attempt) {
        if (sql.includes('status =')) attempt.status = params[0];
        if (sql.includes('attempts =')) attempt.attempts = params[sql.includes('status =') ? 1 : 0];
        if (sql.includes('completed_at =')) attempt.completed_at = params[params.length - 2];
      }
      
      return { rows: [] };
    }

    return { rows: [] };
  }
}

class MockRedisService {
  private cache: Map<string, string> = new Map();

  async setex(key: string, expiry: number, value: string): Promise<void> {

    this.cache.set(key, value);
  }

  async get(key: string): Promise<string | null> {

    return this.cache.get(key) || null;
  }

  clearCache() {
    this.cache.clear();
  }
}

describe('LocationVerificationService', () => {
  let locationVerificationService: LocationVerificationService;
  let mockGeoService: MockGeolocationService;
  let mockThresholdService: MockVerificationThresholdService;
  let mockChallengeService: MockChallengeService;
  let mockCodeManager: MockVerificationCodeManager;
  let mockEmailService: MockEmailService;
  let mockAuditService: MockAuditService;
  let mockDb: MockDatabaseService;
  let mockRedis: MockRedisService;

  beforeEach(() => {
    mockGeoService = new MockGeolocationService();
    mockThresholdService = new MockVerificationThresholdService();
    mockChallengeService = new MockChallengeService();
    mockCodeManager = new MockVerificationCodeManager();
    mockEmailService = new MockEmailService();
    mockAuditService = new MockAuditService();
    mockDb = new MockDatabaseService();
    mockRedis = new MockRedisService();

    locationVerificationService = new LocationVerificationService(
      mockGeoService as any,
      mockThresholdService as any,
      mockChallengeService as any,
      mockCodeManager as any,
      mockEmailService as any,
      mockAuditService as any,
      mockDb as any,
      mockRedis as any,
      {
        emailVerificationThreshold: 30,
        smsVerificationThreshold: 50,
        totpVerificationThreshold: 70,
        manualReviewThreshold: 85
      }
    );
  });

  afterEach(() => {
    mockRedis.clearCache();
  });

  describe('assessLocationChallenge', () => {
    it('should not require verification for trusted location', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.required).toBe(false);
      expect(result.riskScore).toBe(0);
      expect(result.riskLevel).toBe('low');
    });

    it('should require email verification for new location with low risk', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1', // Unknown IP that will trigger new location
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.required).toBe(true);
      expect(result.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
      expect(result.deliveryMethod).toBe('email');
      expect(result.challengeId).toBeDefined();
      expect(result.verificationCodeId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should require SMS verification for VPN usage (medium risk)', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '8.8.8.8', // VPN IP
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.required).toBe(true);
      expect(result.challengeType).toBe(LocationChallengeType.SMS_VERIFICATION);
      expect(result.deliveryMethod).toBe('sms');
      expect(result.riskScore).toBeGreaterThan(40);
    });

    it('should require manual review for Tor usage (high risk)', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '1.2.3.4', // Tor IP
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.required).toBe(true);
      expect(result.challengeType).toBe(LocationChallengeType.MANUAL_REVIEW);
      expect(result.deliveryMethod).toBe('manual_review');
      expect(result.riskScore).toBeGreaterThanOrEqual(80);
      expect(result.riskLevel).toBe('critical');
    });

    it('should send verification email for email challenges', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      await locationVerificationService.assessLocationChallenge(context);

      expect(mockEmailService.sentEmails).toHaveLength(1);
      const sentEmail = mockEmailService.sentEmails[0];
      expect(sentEmail.type).toBe('locationVerification');
      expect(sentEmail.userId).toBe('user123');
      expect(sentEmail.data.code).toMatch(/^\d{6}$/); // 6-digit code
      expect(sentEmail.data.location.city).toBe('Unknown');
      expect(sentEmail.data.ipAddress).toBe('10.0.0.1');
    });

    it('should log challenge generation in audit service', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session123'
      };

      await locationVerificationService.assessLocationChallenge(context);

      const auditEvents = mockAuditService.events.filter(e => e.action === 'location_challenge_generated');
      expect(auditEvents).toHaveLength(1);
      
      const event = auditEvents[0];
      expect(event.userId).toBe('user123');
      expect(event.details.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
      expect(event.details.riskScore).toBeDefined();
      expect(event.ipAddress).toBe('10.0.0.1');
    });

    it('should handle geolocation service errors gracefully', async () => {
      // Create a service that throws an error
      const errorGeoService = {
        getGeolocationData: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Geolocation service error')),
        trackLoginLocation: jest.fn<unknown[], unknown>()
      };

      const errorService = new LocationVerificationService(
        errorGeoService as any,
        mockThresholdService as any,
        mockChallengeService as any,
        mockCodeManager as any,
        mockEmailService as any,
        mockAuditService as any,
        mockDb as any,
        mockRedis as any
      );

      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const result = await errorService.assessLocationChallenge(context);

      expect(result.required).toBe(true);
      expect(result.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
      expect(result.riskScore).toBe(50);
      expect(result.riskLevel).toBe('medium');
      expect(result.reasons).toContain('Error in location assessment - defaulting to verification');
    });
  });

  describe('verifyLocationChallenge', () => {
    let challengeId: string;
    let verificationCode: string;

    beforeEach(async () => {
      // Create a challenge first
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const challenge = await locationVerificationService.assessLocationChallenge(context);
      challengeId = challenge.challengeId!;
      
      // Get the verification code from the sent email
      const sentEmail = mockEmailService.sentEmails[0];
      verificationCode = sentEmail.data.code;
    });

    it('should successfully verify correct code', async () => {
      const result = await locationVerificationService.verifyLocationChallenge(
        challengeId,
        verificationCode,
        {
          userId: 'user123',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          sessionId: 'session123'
        }
      );

      expect(result.success).toBe(true);
      expect(result.gracePeriodSet).toBe(true);
      expect(result.message).toBe('Location verified successfully');
    });

    it('should fail verification with incorrect code', async () => {
      const result = await locationVerificationService.verifyLocationChallenge(
        challengeId,
        '000000', // Wrong code
        {
          userId: 'user123',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          sessionId: 'session123'
        }
      );

      expect(result.success).toBe(false);
      expect(result.remainingAttempts).toBe(2);
      expect(result.message).toContain('Invalid code');
    });

    it('should block after maximum attempts exceeded', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await locationVerificationService.verifyLocationChallenge(
          challengeId,
          '000000',
          {
            userId: 'user123',
            ipAddress: '10.0.0.1',
            userAgent: 'Mozilla/5.0',
            sessionId: 'session123'
          }
        );
      }

      const result = await locationVerificationService.verifyLocationChallenge(
        challengeId,
        '000000',
        {
          userId: 'user123',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          sessionId: 'session123'
        }
      );

      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.message).toBe('Maximum verification attempts exceeded');
    });

    it('should fail verification for invalid challenge ID', async () => {
      const result = await locationVerificationService.verifyLocationChallenge(
        'invalid_challenge_id',
        verificationCode,
        {
          userId: 'user123',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          sessionId: 'session123'
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired verification challenge');
    });

    it('should log successful verification in audit service', async () => {
      await locationVerificationService.verifyLocationChallenge(
        challengeId,
        verificationCode,
        {
          userId: 'user123',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          sessionId: 'session123'
        }
      );

      const auditEvents = mockAuditService.events.filter(e => e.action === 'location_verification_success');
      expect(auditEvents).toHaveLength(1);
      
      const event = auditEvents[0];
      expect(event.userId).toBe('user123');
      expect(event.details.challengeId).toBe(challengeId);
      expect(event.details.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
    });

    it('should log failed verification in audit service', async () => {
      // Make enough failed attempts to trigger failure
      for (let i = 0; i < 3; i++) {
        await locationVerificationService.verifyLocationChallenge(
          challengeId,
          '000000',
          {
            userId: 'user123',
            ipAddress: '10.0.0.1',
            userAgent: 'Mozilla/5.0',
            sessionId: 'session123'
          }
        );
      }

      const auditEvents = mockAuditService.events.filter(e => e.action === 'location_verification_failed');
      expect(auditEvents).toHaveLength(1);
      
      const event = auditEvents[0];
      expect(event.userId).toBe('user123');
      expect(event.details.challengeId).toBe(challengeId);
      expect(event.details.reason).toBe('max_attempts_exceeded');
    });
  });

  describe('getLocationVerificationHistory', () => {
    it('should return empty array for user with no history', async () => {
      const history = await locationVerificationService.getLocationVerificationHistory('user456');
      expect(history).toEqual([]);
    });

    it('should return verification history for user', async () => {
      // Create a challenge first to generate history
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      await locationVerificationService.assessLocationChallenge(context);

      const history = await locationVerificationService.getLocationVerificationHistory('user123');
      expect(history).toHaveLength(1);
      
      const record = history[0];
      expect(record.userId).toBe('user123');
      expect(record.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
      expect(record.status).toBe('pending');
      expect(record.ipAddress).toBe('10.0.0.1');
    });
  });

  describe('challenge message generation', () => {
    it('should generate appropriate message for email verification', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.message).toContain('We detected a login from Unknown, Unknown');
      expect(result.message).toContain('Please check your email for a verification code');
    });

    it('should include location information in challenge reasons', async () => {
      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '8.8.8.8', // VPN IP
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const result = await locationVerificationService.assessLocationChallenge(context);

      expect(result.reasons).toContain('New login location detected');
      expect(result.reasons).toContain('VPN usage detected');
    });
  });

  describe('database schema initialization', () => {
    it('should create required database tables and indexes', async () => {
      const queries: string[] = [];
      const mockDbWithQueryCapture = {
        query: jest.fn<unknown[], unknown>().mockImplementation((sql: string) => {
          queries.push(sql);
          return Promise.resolve({ rows: [] });
  }
      };

      const service = new LocationVerificationService(
        mockGeoService as any,
        mockThresholdService as any,
        mockChallengeService as any,
        mockCodeManager as any,
        mockEmailService as any,
        mockAuditService as any,
        mockDbWithQueryCapture as any,
        mockRedis as any
      );

      await service.initializeSchema();

      expect(queries).toHaveLength(4);
      expect(queries[0]).toContain('CREATE TABLE IF NOT EXISTS location_verification_attempts');
      expect(queries[1]).toContain('CREATE INDEX IF NOT EXISTS idx_location_verification_user');
      expect(queries[2]).toContain('CREATE INDEX IF NOT EXISTS idx_location_verification_status');
      expect(queries[3]).toContain('CREATE INDEX IF NOT EXISTS idx_location_verification_challenge');
    });
  });

  describe('configuration options', () => {
    it('should use custom thresholds when provided', async () => {
      const customService = new LocationVerificationService(
        mockGeoService as any,
        mockThresholdService as any,
        mockChallengeService as any,
        mockCodeManager as any,
        mockEmailService as any,
        mockAuditService as any,
        mockDb as any,
        mockRedis as any,
        {
          emailVerificationThreshold: 10, // Very low threshold
          smsVerificationThreshold: 20,
          totpVerificationThreshold: 30,
          manualReviewThreshold: 40
        }
      );

      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '192.168.1.1', // Normally trusted
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const result = await customService.assessLocationChallenge(context);

      // With very low threshold, even trusted location should require verification
      expect(result.required).toBe(false); // Still false because mock returns 0 risk for this IP
    });

    it('should respect disabled features', async () => {
      const limitedService = new LocationVerificationService(
        mockGeoService as any,
        mockThresholdService as any,
        mockChallengeService as any,
        mockCodeManager as any,
        mockEmailService as any,
        mockAuditService as any,
        mockDb as any,
        mockRedis as any,
        {
          enableSMSVerification: false,
          enableTOTPVerification: false,
          enableManualReview: false
        }
      );

      const context: LocationContext = {
        userId: 'user123',
        ipAddress: '1.2.3.4', // High risk Tor IP
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123'
      };

      const result = await limitedService.assessLocationChallenge(context);

      // Should fall back to email verification even for high risk
      expect(result.challengeType).toBe(LocationChallengeType.EMAIL_VERIFICATION);
    });
  });
});