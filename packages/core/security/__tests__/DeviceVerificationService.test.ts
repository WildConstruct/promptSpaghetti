/**
 * Test Suite for Device Verification Service
 * 
 * Tests comprehensive device verification workflows including risk assessment,
 * challenge mechanisms, and trusted device registration.
 */

import {
  DeviceVerificationService,
  VerificationStep,
  ChallengeType,
  VerificationOutcome,
  DeviceVerificationRequestData,
  VerificationSession
} from '../DeviceVerificationService';
import {
  DeviceFingerprintingService,
  DeviceFingerprint,
  LocationData,
  RiskLevel,
  FingerprintType,
  FingerprintContext
} from '../DeviceFingerprintingService';
import { TrustedDeviceManager, VerificationMethod, TrustLevel } from '../TrustedDeviceManager';
import { VerificationCodeManager } from '../VerificationCodeManager';
import { EmailDeliveryTracker } from '../services/EmailDeliveryTracker';

// Mock dependencies
jest.mock('../DeviceFingerprintingService');
jest.mock('../TrustedDeviceManager');
jest.mock('../VerificationCodeManager');
jest.mock('../services/EmailDeliveryTracker');

describe('DeviceVerificationService', () => {
  let service: DeviceVerificationService;
  let mockFingerprintService: jest.Mocked<DeviceFingerprintingService>;
  let mockTrustedDeviceManager: jest.Mocked<TrustedDeviceManager>;
  let mockVerificationCodeManager: jest.Mocked<VerificationCodeManager>;
  let mockEmailTracker: jest.Mocked<EmailDeliveryTracker>;

  // Test data
  const testUserId = 'user-123';
  const testContext: FingerprintContext = {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    headers: {}
  };

  const testFingerprint: DeviceFingerprint = {
    id: 'fp-123',
    type: FingerprintType.ENHANCED,
    confidence: 95,
    createdAt: new Date(),
    lastSeen: new Date(),
    seenCount: 1,
    basic: {
      userAgent: testContext.userAgent,
      language: 'en-US',
      platform: 'MacOS',
      cookieEnabled: true,
      doNotTrack: false,
      timezone: 'America/Los_Angeles',
      timezoneOffset: -480
    },
    enhanced: {
      screen: { width: 1920, height: 1080, colorDepth: 24, pixelRatio: 2, orientation: 'landscape' },
      browser: { name: 'Chrome', version: '126', engine: 'Blink', engineVersion: '126' },
      plugins: [],
      fonts: [],
      webgl: { vendor: 'Intel', renderer: 'Intel Iris', version: 'WebGL 2.0', shadingLanguageVersion: 'WebGL GLSL ES 3.00', extensions: [], parameters: {} },
      canvas: { fingerprint: 'canvas-fp-123', geometry: 'geo-123', text: 'text-123' },
      audio: { fingerprint: 'audio-fp-123', sampleRate: 48000, channelCount: 2, contextState: 'running' }
    },
    comprehensive: {
      hardware: { cpuCores: 8, memory: 16, touchSupport: false, sensors: [], bluetooth: true, usb: true, webrtc: { supported: true, localCandidates: [], stunServers: [] } },
      network: { connectionType: 'wifi', downlink: 100, effectiveType: '4g', rtt: 50 },
      permissions: { camera: 'granted', microphone: 'granted', location: 'prompt', notifications: 'granted', persistentStorage: 'granted' },
      storage: { localStorage: true, sessionStorage: true, indexedDB: true, webSQL: false, quota: 1000000 },
      features: { webAssembly: true, serviceWorker: true, webWorker: true, webRTC: true, webGL: true, webGL2: true, webVR: false, webXR: false }
    }
  };

  const testLocation: LocationData = {
    id: 'loc-123',
    timestamp: new Date(),
    source: 'ip',
    accuracy: 5000,
    confidence: 85,
    coordinates: { latitude: 37.7749, longitude: -122.4194, accuracy: 5000 },
    address: { country: 'United States', countryCode: 'US', region: 'California', regionCode: 'CA', city: 'San Francisco', postalCode: '94102' },
    network: { ipAddress: '192.168.1.100', isp: 'Comcast', timezone: 'America/Los_Angeles', vpnDetected: false, proxyDetected: false, torDetected: false, hostingProvider: false, datacenter: false },
    metadata: { language: 'en', currency: 'USD', callingCode: '+1' }
  };

  beforeEach(() => {
    jest.useFakeTimers();

    // Create mocks
    mockFingerprintService = new DeviceFingerprintingService() as jest.Mocked<DeviceFingerprintingService>;
    mockTrustedDeviceManager = new TrustedDeviceManager(mockFingerprintService) as jest.Mocked<TrustedDeviceManager>;
    mockVerificationCodeManager = new VerificationCodeManager() as jest.Mocked<VerificationCodeManager>;
    mockEmailTracker = new EmailDeliveryTracker() as jest.Mocked<EmailDeliveryTracker>;

    // Setup spies
    jest.spyOn(mockFingerprintService, 'generateFingerprint');
    jest.spyOn(mockFingerprintService, 'assessRisk');
    jest.spyOn(mockTrustedDeviceManager, 'registerTrustedDevice');
    jest.spyOn(mockTrustedDeviceManager, 'verifyDevice');
    jest.spyOn(mockVerificationCodeManager, 'generateCode');
    jest.spyOn(mockEmailTracker, 'sendEmail');

    // Set default mock implementations
    mockFingerprintService.generateFingerprint.mockResolvedValue(testFingerprint as unknown);
    mockFingerprintService.assessRisk.mockReturnValue({
      deviceId: testFingerprint.id,
      overallRisk: RiskLevel.LOW,
      riskScore: 15,
      factors: [],
      recommendations: [],
      timestamp: new Date( as unknown)
    });

    mockVerificationCodeManager.generateCode.mockResolvedValue({
      code: '123456',
      codeId: 'code-123'
    } as unknown);

    mockTrustedDeviceManager.registerTrustedDevice.mockResolvedValue({
      id: 'device-123',
      userId: testUserId,
      deviceId: 'device-123',
      fingerprintId: testFingerprint.id,
      verificationToken: 'token-123'
    } as any as unknown);

    mockEmailTracker.sendEmail.mockResolvedValue('email-123' as unknown);

    service = new DeviceVerificationService(
      mockFingerprintService,
      mockTrustedDeviceManager,
      mockVerificationCodeManager,
      mockEmailTracker,
      {
        sessionTimeoutMinutes: 30,
        maxAttemptsPerChallenge: 3,
        maxVerificationAttempts: 5,
        riskThresholds: {
          lowRisk: 20,
          mediumRisk: 50,
          highRisk: 80,
          requireManualReview: 95
        },
        challengeRequirements: {
          [RiskLevel.LOW]: [ChallengeType.EMAIL_CODE],
          [RiskLevel.MEDIUM]: [ChallengeType.EMAIL_CODE, ChallengeType.SMS_CODE],
          [RiskLevel.HIGH]: [ChallengeType.EMAIL_CODE, ChallengeType.SMS_CODE, ChallengeType.CAPTCHA],
          [RiskLevel.CRITICAL]: [ChallengeType.EMAIL_CODE, ChallengeType.SMS_CODE, ChallengeType.MANUAL_REVIEW]
        },
        enableBehavioralAnalysis: true,
        enableLocationValidation: true,
        enableDeviceSpoofDetection: true,
        enableAutomaticApproval: false,
        requireDoubleVerification: false
      }
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    service.removeAllListeners();
  });

  describe('Verification Flow Start', () => {
    test('should start verification with low risk device', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL,
        deviceName: 'Test Device'
      };

      const session = await service.startVerification(request);

      expect(session).toBeDefined();
      expect(session.userId).toBe(testUserId);
      expect(session.deviceFingerprint.id).toBe(testFingerprint.id);
      expect(session.riskLevel).toBe(RiskLevel.LOW);
      expect(session.currentStep).toBe(VerificationStep.CHALLENGE_REQUIRED);
      expect(session.requiredChallenges).toEqual([ChallengeType.EMAIL_CODE]);
      expect(session.challenges).toHaveLength(1);
      expect(session.challenges[0].type).toBe(ChallengeType.EMAIL_CODE);
    });

    test('should start verification with high risk device', async () => {
      // Mock high risk assessment
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: testFingerprint.id,
        overallRisk: RiskLevel.HIGH,
        riskScore: 85,
        factors: [],
        recommendations: [],
        timestamp: new Date( as unknown)
      });

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);

      expect(session.riskLevel).toBe(RiskLevel.HIGH);
      expect(session.requiredChallenges).toEqual([
        ChallengeType.EMAIL_CODE,
        ChallengeType.SMS_CODE,
        ChallengeType.CAPTCHA
      ]);
      expect(session.challenges).toHaveLength(3);
    });

    test('should emit verificationStarted event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('verificationStarted', eventHandler);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      await service.startVerification(request);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          riskLevel: RiskLevel.LOW,
          riskScore: 15
        })
      );
    });

    test('should handle fingerprint service errors', async () => {
      mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Fingerprint error'));

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      await expect(service.startVerification(request)).rejects.toThrow('Fingerprint error');
    });
  });

  describe('Challenge Handling', () => {
    let session: VerificationSession;

    beforeEach(async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      session = await service.startVerification(request);
    });

    test('should submit valid email code challenge', async () => {
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      const result = await service.submitChallengeResponse(
        session.id,
        challenge.id,
        '123456'
      );

      expect(result.success).toBe(true);
      expect(result.session.completedChallenges).toContain(challenge.id);
      expect(result.session.currentStep).toBe(VerificationStep.DEVICE_REGISTRATION);
      expect(result.session.outcome).toBe(VerificationOutcome.APPROVED);
    });

    test('should reject invalid challenge response', async () => {
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      const result = await service.submitChallengeResponse(
        session.id,
        challenge.id,
        'wrong-code'
      );

      expect(result.success).toBe(false);
      expect(result.session.completedChallenges).not.toContain(challenge.id);
    });

    test('should fail challenge after max attempts', async () => {
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      // Submit wrong answers 3 times
      for (let i = 0; i < 3; i++) {
        await service.submitChallengeResponse(
          session.id,
          challenge.id,
          'wrong-code'
        );
      }

      const updatedChallenge = service.getSession(session.id)!.challenges
        .find(c => c.id === challenge.id)!;
      
      expect(updatedChallenge.status).toBe('failed');
    });

    test('should emit challengeCompleted event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('challengeCompleted', eventHandler);

      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          challengeId: challenge.id,
          challengeType: ChallengeType.EMAIL_CODE,
          userId: testUserId
        })
      );
    });

    test('should emit challengeFailed event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('challengeFailed', eventHandler);

      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, 'wrong-code');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          challengeId: challenge.id,
          challengeType: ChallengeType.EMAIL_CODE,
          userId: testUserId,
          attemptsRemaining: 2
        })
      );
    });

    test('should handle challenge not found', async () => {
      await expect(
        service.submitChallengeResponse(session.id, 'invalid-challenge-id', '123456')
      ).rejects.toThrow('Challenge not found');
    });

    test('should handle expired session', async () => {
      // Fast forward past session expiration
      jest.advanceTimersByTime(31 * 60 * 1000); // 31 minutes

      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await expect(
        service.submitChallengeResponse(session.id, challenge.id, '123456')
      ).rejects.toThrow('Verification session expired');
    });
  });

  describe('Session Management', () => {
    test('should get verification session', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const retrievedSession = service.getSession(session.id);

      expect(retrievedSession).toEqual(session);
    });

    test('should return null for non-existent session', () => {
      const session = service.getSession('non-existent-id');
      expect(session).toBeNull();
    });

    test('should get user sessions', async () => {
      const requests = Array.from({ length: 3 }, () => ({
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      }));

      const sessions = await Promise.all(
        requests.map(request => service.startVerification(request))
      );

      const userSessions = service.getUserSessions(testUserId);
      expect(userSessions).toHaveLength(3);
      expect(userSessions.map(s => s.id)).toEqual(sessions.map(s => s.id));
    });

    test('should cancel verification session', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const result = service.cancelSession(session.id, 'User cancelled');

      expect(result).toBe(true);
      expect(service.getSession(session.id)!.outcome).toBe(VerificationOutcome.ABANDONED);
    });

    test('should emit verificationCancelled event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('verificationCancelled', eventHandler);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      service.cancelSession(session.id, 'Test cancellation');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          userId: testUserId,
          reason: 'Test cancellation'
        })
      );
    });
  });

  describe('Admin Override', () => {
    test('should approve verification via admin override', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const result = service.adminOverride(session.id, true, 'admin-123', 'Manual approval');

      expect(result).toBe(true);
      expect(service.getSession(session.id)!.outcome).toBe(VerificationOutcome.APPROVED);
      expect(mockTrustedDeviceManager.registerTrustedDevice).toHaveBeenCalled();
    });

    test('should reject verification via admin override', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const result = service.adminOverride(session.id, false, 'admin-123', 'Security concern');

      expect(result).toBe(true);
      expect(service.getSession(session.id)!.outcome).toBe(VerificationOutcome.REJECTED);
    });

    test('should emit adminOverride event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('adminOverride', eventHandler);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      service.adminOverride(session.id, true, 'admin-123', 'Manual approval');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          userId: testUserId,
          adminUserId: 'admin-123',
          approved: true,
          reason: 'Manual approval'
        })
      );
    });
  });

  describe('Risk Assessment and Security Flags', () => {
    test('should detect VPN usage', async () => {
      const vpnLocation: LocationData = {
        ...testLocation,
        network: {
          ...testLocation.network,
          vpnDetected: true
        }
      };

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        location: vpnLocation,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);

      expect(session.flags.vpnDetected).toBe(true);
    });

    test('should detect repeated verification attempts', async () => {
      // Create multiple sessions for the same user
      const requests = Array.from({ length: 6 }, () => ({
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      }));

      const sessions = await Promise.all(
        requests.map(request => service.startVerification(request))
      );

      // The last session should detect repeated attempts
      expect(sessions[5].flags.repeatedAttempts).toBe(true);
      expect(sessions[5].flags.suspiciousActivity).toBe(true);
    });

    test('should detect device spoofing', async () => {
      const spoofedContext: FingerprintContext = {
        ...testContext,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.101 Safari/537.36'
      };

      const spoofedFingerprint: DeviceFingerprint = {
        ...testFingerprint,
        basic: {
          ...testFingerprint.basic,
          userAgent: spoofedContext.userAgent
        }
      };

      mockFingerprintService.generateFingerprint.mockResolvedValue(spoofedFingerprint as unknown);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: spoofedContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);

      expect(session.flags.deviceSpoofing).toBe(true);
    });
  });

  describe('Manual Review Process', () => {
    test('should require manual review for critical risk', async () => {
      // Mock critical risk assessment
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: testFingerprint.id,
        overallRisk: RiskLevel.CRITICAL,
        riskScore: 98,
        factors: [],
        recommendations: [],
        timestamp: new Date( as unknown)
      });

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);

      expect(session.riskLevel).toBe(RiskLevel.CRITICAL);
      expect(session.requiredChallenges).toContain(ChallengeType.MANUAL_REVIEW);
    });

    test('should emit manualReviewRequired event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('manualReviewRequired', eventHandler);

      // Mock critical risk assessment
      mockFingerprintService.assessRisk.mockReturnValue({
        deviceId: testFingerprint.id,
        overallRisk: RiskLevel.CRITICAL,
        riskScore: 98,
        factors: [],
        recommendations: [],
        timestamp: new Date( as unknown)
      });

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      await service.startVerification(request);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          riskScore: 98
        })
      );
    });
  });

  describe('Device Registration', () => {
    test('should register trusted device on successful verification', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        location: testLocation,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      expect(mockTrustedDeviceManager.registerTrustedDevice).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          deviceFingerprint: testFingerprint,
          location: testLocation,
          verificationMethod: VerificationMethod.EMAIL
        })
      );
    });

    test('should auto-verify registered device', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      expect(mockTrustedDeviceManager.verifyDevice).toHaveBeenCalledWith('token-123');
    });

    test('should emit verificationCompleted event', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('verificationCompleted', eventHandler);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          userId: testUserId,
          outcome: VerificationOutcome.APPROVED,
          riskScore: 15
        })
      );
    });
  });

  describe('Cleanup and Maintenance', () => {
    test('should clean up expired sessions', async () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      service.on('sessionExpired', eventHandler);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);

      // Fast forward past session expiration
      jest.advanceTimersByTime(31 * 60 * 1000); // 31 minutes

      // Trigger cleanup
      jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          userId: testUserId
        })
      );
    });

    test('should remove old completed sessions', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      // Complete verification
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      // Verify session exists
      expect(service.getSession(session.id)).toBeDefined();

      // Fast forward past cleanup time
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours

      // Session should be removed
      expect(service.getSession(session.id)).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle verification code generation failure', async () => {
      mockVerificationCodeManager.generateCode.mockResolvedValue(null as unknown);

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      await expect(service.startVerification(request)).rejects.toThrow('Failed to generate verification code');
    });

    test('should handle device registration errors', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      service.on('deviceRegistrationError', errorHandler);

      mockTrustedDeviceManager.registerTrustedDevice.mockRejectedValue(new Error('Registration failed'));

      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: session.id,
          userId: testUserId,
          error: 'Registration failed'
        })
      );
    });

    test('should handle session not found errors', async () => {
      await expect(
        service.submitChallengeResponse('invalid-session-id', 'challenge-id', 'response')
      ).rejects.toThrow('Verification session not found');
    });

    test('should handle completed session submission', async () => {
      const request: DeviceVerificationRequestData = {
        userId: testUserId,
        fingerprintContext: testContext,
        verificationMethod: VerificationMethod.EMAIL,
        requestedTrustLevel: TrustLevel.FULL
      };

      const session = await service.startVerification(request);
      const challenge = session.challenges.find(c => c.type === ChallengeType.EMAIL_CODE)!;
      
      // Complete verification
      await service.submitChallengeResponse(session.id, challenge.id, '123456');

      // Try to submit again
      await expect(
        service.submitChallengeResponse(session.id, challenge.id, '123456')
      ).rejects.toThrow('Verification session already completed');
    });
  });
});