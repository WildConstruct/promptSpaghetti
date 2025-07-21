/**
 * Device Verification Service
 * 
 * Comprehensive device verification process that coordinates device fingerprinting,
 * risk assessment, multi-factor authentication, and trusted device registration.
 * 
 * Features:
 * - Multi-step verification workflows
 * - Risk-based verification requirements
 * - Integration with MFA and trusted device systems
 * - Progressive trust building
 * - Device challenge mechanisms
 * - Automated verification flows
 * - Manual verification overrides
 * - Verification analytics and reporting
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import {
  DeviceFingerprintingService,
  DeviceFingerprint,
  LocationData,
  RiskLevel,
  FingerprintContext
} from './DeviceFingerprintingService';
import {
  TrustedDeviceManager,
  TrustStatus,
  TrustLevel,
  VerificationMethod,
  TrustedDevice,
  DeviceVerificationRequest
} from './TrustedDeviceManager';
import {
  VerificationCodeManager,
  CodeGenerationRequest,
  CodeValidationRequest,
  VerificationCodeType,
  DeliveryChannel
} from './VerificationCodeManager';
import {
  EmailDeliveryTracker,
  EmailType,
  EmailSendRequest
} from './services/EmailDeliveryTracker';

// Verification steps
export enum VerificationStep {
  FINGERPRINT_COLLECTION = 'fingerprint_collection',
  RISK_ASSESSMENT = 'risk_assessment',
  CHALLENGE_REQUIRED = 'challenge_required',
  EMAIL_VERIFICATION = 'email_verification',
  SMS_VERIFICATION = 'sms_verification',
  MFA_VERIFICATION = 'mfa_verification',
  MANUAL_REVIEW = 'manual_review',
  DEVICE_REGISTRATION = 'device_registration',
  VERIFICATION_COMPLETE = 'verification_complete',
  VERIFICATION_FAILED = 'verification_failed'
}

// Verification challenge types
export enum ChallengeType {
  EMAIL_CODE = 'email_code',
  SMS_CODE = 'sms_code',
  CAPTCHA = 'captcha',
  BEHAVIORAL = 'behavioral',
  BIOMETRIC = 'biometric',
  MANUAL_REVIEW = 'manual_review',
  PHONE_CALL = 'phone_call',
  SECURITY_QUESTIONS = 'security_questions'
}

// Verification outcomes
export enum VerificationOutcome {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
  REQUIRES_REVIEW = 'requires_review',
  EXPIRED = 'expired',
  ABANDONED = 'abandoned'
}

// Verification session data
export interface VerificationSession {
  id: string;
  userId: string;
  deviceFingerprint: DeviceFingerprint;
  location: LocationData;
  
  // Session state
  currentStep: VerificationStep;
  outcome: VerificationOutcome | null;
  riskScore: number;
  riskLevel: RiskLevel;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  
  // Verification data
  challenges: DeviceChallenge[];
  completedChallenges: string[];
  requiredChallenges: ChallengeType[];
  attempts: VerificationAttempt[];
  
  // Device data
  deviceName?: string;
  verificationMethod: VerificationMethod;
  requestedTrustLevel: TrustLevel;
  
  // Context
  ipAddress: string;
  userAgent: string;
  sessionContext: Record<string, any>;
  metadata: Record<string, any>;
  
  // Security flags
  flags: {
    suspiciousActivity: boolean;
    vpnDetected: boolean;
    proxyDetected: boolean;
    repeatedAttempts: boolean;
    deviceSpoofing: boolean;
    locationInconsistent: boolean;
    timeZoneManipulation: boolean;
  };
}

// Device challenge
export interface DeviceChallenge {
  id: string;
  type: ChallengeType;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  
  // Challenge data
  challengeData: {
    code?: string;
    question?: string;
    expectedResponse?: string;
    deliveryAddress?: string; // email or phone
    attempts: number;
    maxAttempts: number;
  };
  
  // Response data
  responseData?: {
    userResponse: string;
    timestamp: Date;
    metadata: Record<string, any>;
  };
  
  metadata: Record<string, any>;
}

// Verification attempt
export interface VerificationAttempt {
  id: string;
  timestamp: Date;
  step: VerificationStep;
  challengeId?: string;
  success: boolean;
  failureReason?: string;
  duration: number;
  metadata: Record<string, any>;
}

// Verification configuration
export interface VerificationConfig {
  sessionTimeoutMinutes: number;
  maxAttemptsPerChallenge: number;
  maxVerificationAttempts: number;
  
  // Risk thresholds
  riskThresholds: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    requireManualReview: number;
  };
  
  // Challenge requirements by risk level
  challengeRequirements: {
    [key in RiskLevel]: ChallengeType[];
  };
  
  // Feature flags
  enableBehavioralAnalysis: boolean;
  enableLocationValidation: boolean;
  enableDeviceSpoofDetection: boolean;
  enableAutomaticApproval: boolean;
  requireDoubleVerification: boolean;
}

// Verification request
export interface DeviceVerificationRequestData {
  userId: string;
  fingerprintContext: FingerprintContext;
  location?: LocationData;
  verificationMethod: VerificationMethod;
  requestedTrustLevel: TrustLevel;
  deviceName?: string;
  metadata?: Record<string, any>;
}

/**
 * Device Verification Service
 */
export class DeviceVerificationService extends EventEmitter {
  private sessions: Map<string, VerificationSession> = new Map();
  private challenges: Map<string, DeviceChallenge> = new Map();
  
  constructor(
    private fingerprintService: DeviceFingerprintingService,
    private trustedDeviceManager: TrustedDeviceManager,
    private verificationCodeManager: VerificationCodeManager,
    private emailTracker: EmailDeliveryTracker,
    private config: VerificationConfig = {
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
  ) {
    super();
    this.startCleanupTimer();
  }

  /**
   * Start device verification process
   */
  public async startVerification(
    request: DeviceVerificationRequestData
  ): Promise<VerificationSession> {
    try {
      // Generate device fingerprint
      const fingerprint = await this.fingerprintService.generateFingerprint(
        request.fingerprintContext
      );

      // Get or create location data
      let location = request.location;
      if (!location && request.fingerprintContext.ipAddress) {
        // Try to get location from IP
        location = await this.getLocationFromIP(request.fingerprintContext.ipAddress);
      }

      // Assess risk
      const riskAssessment = location 
        ? this.fingerprintService.assessRisk(fingerprint, location)
        : {
          deviceId: fingerprint.id,
          overallRisk: RiskLevel.MEDIUM,
          riskScore: 50,
          factors: [],
          recommendations: [],
          timestamp: new Date()
        };

      // Create verification session
      const sessionId = this.generateSessionId();
      const session: VerificationSession = {
        id: sessionId,
        userId: request.userId,
        deviceFingerprint: fingerprint,
        location: location!,
        
        currentStep: VerificationStep.FINGERPRINT_COLLECTION,
        outcome: null,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.overallRisk,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.sessionTimeoutMinutes * 60 * 1000),
        
        challenges: [],
        completedChallenges: [],
        requiredChallenges: this.config.challengeRequirements[riskAssessment.overallRisk],
        attempts: [],
        
        deviceName: request.deviceName,
        verificationMethod: request.verificationMethod,
        requestedTrustLevel: request.requestedTrustLevel,
        
        ipAddress: request.fingerprintContext.ipAddress,
        userAgent: request.fingerprintContext.userAgent,
        sessionContext: {},
        metadata: request.metadata || {},
        
        flags: {
          suspiciousActivity: false,
          vpnDetected: location?.network.vpnDetected || false,
          proxyDetected: location?.network.proxyDetected || false,
          repeatedAttempts: false,
          deviceSpoofing: false,
          locationInconsistent: false,
          timeZoneManipulation: false
        }
      };

      this.sessions.set(sessionId, session);

      // Add initial attempt
      this.addAttempt(session, VerificationStep.FINGERPRINT_COLLECTION, true);

      // Progress to next step
      await this.progressSession(session);

      this.emit('verificationStarted', {
        sessionId,
        userId: request.userId,
        riskLevel: riskAssessment.overallRisk,
        riskScore: riskAssessment.riskScore,
        timestamp: new Date()
      });

      return session;
    } catch (error) {
      this.emit('verificationError', {
        userId: request.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Submit challenge response
   */
  public async submitChallengeResponse(
    sessionId: string,
    challengeId: string,
    response: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; session: VerificationSession; nextStep?: VerificationStep }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Verification session not found');
    }

    if (session.outcome !== null) {
      throw new Error('Verification session already completed');
    }

    if (new Date() > session.expiresAt) {
      session.outcome = VerificationOutcome.EXPIRED;
      throw new Error('Verification session expired');
    }

    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'pending') {
      throw new Error('Challenge already completed or expired');
    }

    // Update challenge attempts
    challenge.challengeData.attempts++;

    // Validate response
    const isValid = await this.validateChallengeResponse(challenge, response);

    if (isValid) {
      // Mark challenge as completed
      challenge.status = 'completed';
      challenge.completedAt = new Date();
      challenge.responseData = {
        userResponse: response,
        timestamp: new Date(),
        metadata
      };

      session.completedChallenges.push(challengeId);
      this.addAttempt(session, session.currentStep, true, challengeId);

      // Progress session
      await this.progressSession(session);

      this.emit('challengeCompleted', {
        sessionId,
        challengeId,
        challengeType: challenge.type,
        userId: session.userId,
        timestamp: new Date()
      });

      return {
        success: true,
        session,
        nextStep: session.currentStep
      };
    } else {
      // Challenge failed
      this.addAttempt(session, session.currentStep, false, challengeId, 'Invalid response');

      // Check if max attempts reached
      if (challenge.challengeData.attempts >= challenge.challengeData.maxAttempts) {
        challenge.status = 'failed';
        
        // Check if session should be failed
        const failedChallenges = session.challenges.filter(c => c.status === 'failed');
        if (failedChallenges.length >= this.config.maxVerificationAttempts) {
          session.outcome = VerificationOutcome.REJECTED;
          session.completedAt = new Date();
          
          this.emit('verificationFailed', {
            sessionId,
            userId: session.userId,
            reason: 'Too many failed attempts',
            timestamp: new Date()
          });
        }
      }

      this.emit('challengeFailed', {
        sessionId,
        challengeId,
        challengeType: challenge.type,
        userId: session.userId,
        attemptsRemaining: challenge.challengeData.maxAttempts - challenge.challengeData.attempts,
        timestamp: new Date()
      });

      return {
        success: false,
        session
      };
    }
  }

  /**
   * Get verification session
   */
  public getSession(sessionId: string): VerificationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get user's verification sessions
   */
  public getUserSessions(userId: string): VerificationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
  }

  /**
   * Cancel verification session
   */
  public cancelSession(sessionId: string, reason: string = 'User cancelled'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.outcome = VerificationOutcome.ABANDONED;
    session.completedAt = new Date();

    this.emit('verificationCancelled', {
      sessionId,
      userId: session.userId,
      reason,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Admin override verification
   */
  public adminOverride(
    sessionId: string,
    approved: boolean,
    adminUserId: string,
    reason: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.outcome = approved ? VerificationOutcome.APPROVED : VerificationOutcome.REJECTED;
    session.completedAt = new Date();
    session.metadata.adminOverride = {
      adminUserId,
      reason,
      timestamp: new Date()
    };

    if (approved) {
      // Register trusted device
      this.registerTrustedDevice(session);
    }

    this.emit('adminOverride', {
      sessionId,
      userId: session.userId,
      adminUserId,
      approved,
      reason,
      timestamp: new Date()
    });

    return true;
  }

  // Private methods

  private async progressSession(session: VerificationSession): Promise<void> {
    session.updatedAt = new Date();

    switch (session.currentStep) {
    case VerificationStep.FINGERPRINT_COLLECTION:
      session.currentStep = VerificationStep.RISK_ASSESSMENT;
      await this.performRiskAssessment(session);
      break;

    case VerificationStep.RISK_ASSESSMENT:
      if (session.riskScore < this.config.riskThresholds.lowRisk && this.config.enableAutomaticApproval) {
        session.currentStep = VerificationStep.DEVICE_REGISTRATION;
        await this.completeVerification(session);
      } else {
        session.currentStep = VerificationStep.CHALLENGE_REQUIRED;
        await this.createRequiredChallenges(session);
      }
      break;

    case VerificationStep.CHALLENGE_REQUIRED:
      // Check if all required challenges are completed
      const requiredCompleted = session.requiredChallenges.every(challengeType =>
        session.challenges.some(c => c.type === challengeType && c.status === 'completed')
      );

      if (requiredCompleted) {
        if (session.riskScore >= this.config.riskThresholds.requireManualReview) {
          session.currentStep = VerificationStep.MANUAL_REVIEW;
          await this.requestManualReview(session);
        } else {
          session.currentStep = VerificationStep.DEVICE_REGISTRATION;
          await this.completeVerification(session);
        }
      }
      break;

    case VerificationStep.MANUAL_REVIEW:
      // Wait for admin action
      break;

    case VerificationStep.DEVICE_REGISTRATION:
      await this.registerTrustedDevice(session);
      session.currentStep = VerificationStep.VERIFICATION_COMPLETE;
      break;

    case VerificationStep.VERIFICATION_COMPLETE:
      // Verification is complete
      break;
    }
  }

  private async performRiskAssessment(session: VerificationSession): Promise<void> {
    // Perform additional security checks
    await this.checkForSuspiciousActivity(session);
    await this.validateLocation(session);
    await this.checkDeviceSpoofing(session);

    // Update risk score based on findings
    let additionalRisk = 0;
    
    if (session.flags.suspiciousActivity) additionalRisk += 20;
    if (session.flags.vpnDetected) additionalRisk += 10;
    if (session.flags.proxyDetected) additionalRisk += 15;
    if (session.flags.deviceSpoofing) additionalRisk += 25;
    if (session.flags.locationInconsistent) additionalRisk += 20;

    session.riskScore = Math.min(100, session.riskScore + additionalRisk);
    session.riskLevel = this.determineRiskLevel(session.riskScore);

    // Update required challenges based on new risk level
    session.requiredChallenges = this.config.challengeRequirements[session.riskLevel];

    await this.progressSession(session);
  }

  private async createRequiredChallenges(session: VerificationSession): Promise<void> {
    for (const challengeType of session.requiredChallenges) {
      if (!session.challenges.some(c => c.type === challengeType)) {
        const challenge = await this.createChallenge(session, challengeType);
        session.challenges.push(challenge);
        this.challenges.set(challenge.id, challenge);
      }
    }
  }

  private async createChallenge(
    session: VerificationSession,
    type: ChallengeType
  ): Promise<DeviceChallenge> {
    const challengeId = this.generateChallengeId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const challenge: DeviceChallenge = {
      id: challengeId,
      type,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      challengeData: {
        attempts: 0,
        maxAttempts: this.config.maxAttemptsPerChallenge
      },
      metadata: {}
    };

    switch (type) {
    case ChallengeType.EMAIL_CODE:
      await this.createEmailChallenge(challenge, session);
      break;
    case ChallengeType.SMS_CODE:
      await this.createSMSChallenge(challenge, session);
      break;
    case ChallengeType.CAPTCHA:
      await this.createCaptchaChallenge(challenge, session);
      break;
    case ChallengeType.MANUAL_REVIEW:
      await this.createManualReviewChallenge(challenge, session);
      break;
    }

    return challenge;
  }

  private async createEmailChallenge(
    challenge: DeviceChallenge,
    session: VerificationSession
  ): Promise<void> {
    // Generate verification code
    const codeRequest: CodeGenerationRequest = {
      userId: session.userId,
      type: VerificationCodeType.DEVICE_VERIFICATION,
      deliveryChannel: DeliveryChannel.EMAIL,
      deliveryAddress: `user-${session.userId}@example.com`,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expirationMinutes: 15,
      metadata: { purpose: 'device_verification' }
    };

    const codeResult = await this.verificationCodeManager.generateCode(codeRequest);
    if (!codeResult) {
      throw new Error('Failed to generate verification code');
    }

    challenge.challengeData.code = codeResult.code;
    challenge.challengeData.deliveryAddress = codeRequest.deliveryAddress;

    // Send email
    const emailRequest: EmailSendRequest = {
      type: EmailType.DEVICE_VERIFICATION,
      recipient: challenge.challengeData.deliveryAddress!,
      subject: 'Device Verification Code',
      content: {
        text: `Your device verification code is: ${codeResult.code}`,
        html: `<p>Your device verification code is: <strong>${codeResult.code}</strong></p>`
      },
      metadata: {
        userId: session.userId,
        sessionId: session.id
      }
    };

    await this.emailTracker.sendEmail(emailRequest);
  }

  private async createSMSChallenge(
    challenge: DeviceChallenge,
    session: VerificationSession
  ): Promise<void> {
    // Generate verification code
    const codeRequest: CodeGenerationRequest = {
      userId: session.userId,
      type: VerificationCodeType.DEVICE_VERIFICATION,
      deliveryChannel: DeliveryChannel.SMS,
      deliveryAddress: '+1234567890',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expirationMinutes: 15,
      metadata: { purpose: 'device_verification' }
    };

    const codeResult = await this.verificationCodeManager.generateCode(codeRequest);
    if (!codeResult) {
      throw new Error('Failed to generate verification code');
    }

    challenge.challengeData.code = codeResult.code;
    challenge.challengeData.deliveryAddress = codeRequest.deliveryAddress;

    // In a real implementation, would send SMS here
    challenge.metadata.smsDelivered = true;
  }

  private async createCaptchaChallenge(
    challenge: DeviceChallenge,
    session: VerificationSession
  ): Promise<void> {
    // Generate captcha challenge
    const captchaData = this.generateCaptcha();
    challenge.challengeData.question = captchaData.question;
    challenge.challengeData.expectedResponse = captchaData.answer;
    challenge.metadata.captchaImage = captchaData.imageData;
  }

  private async createManualReviewChallenge(
    challenge: DeviceChallenge,
    session: VerificationSession
  ): Promise<void> {
    challenge.challengeData.question = 'Manual review required';
    challenge.metadata.reviewReason = 'High risk score requires manual verification';
    
    // Notify administrators
    this.emit('manualReviewRequired', {
      sessionId: session.id,
      userId: session.userId,
      riskScore: session.riskScore,
      timestamp: new Date()
    });
  }

  private async validateChallengeResponse(
    challenge: DeviceChallenge,
    response: string
  ): Promise<boolean> {
    switch (challenge.type) {
    case ChallengeType.EMAIL_CODE:
    case ChallengeType.SMS_CODE:
      return challenge.challengeData.code === response;
      
    case ChallengeType.CAPTCHA:
      return challenge.challengeData.expectedResponse === response;
      
    case ChallengeType.MANUAL_REVIEW:
      // Manual review requires admin approval
      return false;
      
    default:
      return false;
    }
  }

  private async completeVerification(session: VerificationSession): Promise<void> {
    session.outcome = VerificationOutcome.APPROVED;
    session.completedAt = new Date();

    await this.registerTrustedDevice(session);

    this.emit('verificationCompleted', {
      sessionId: session.id,
      userId: session.userId,
      outcome: session.outcome,
      riskScore: session.riskScore,
      duration: session.completedAt.getTime() - session.createdAt.getTime(),
      timestamp: new Date()
    });
  }

  private async registerTrustedDevice(session: VerificationSession): Promise<void> {
    try {
      const deviceRequest: DeviceVerificationRequest = {
        userId: session.userId,
        deviceFingerprint: session.deviceFingerprint,
        location: session.location,
        verificationMethod: session.verificationMethod,
        metadata: {
          verificationSessionId: session.id,
          riskScore: session.riskScore,
          verificationTimestamp: new Date()
        }
      };

      const trustedDevice = await this.trustedDeviceManager.registerTrustedDevice(deviceRequest);
      
      // Auto-verify if verification was completed successfully
      if (session.outcome === VerificationOutcome.APPROVED && trustedDevice.verificationToken) {
        await this.trustedDeviceManager.verifyDevice(trustedDevice.verificationToken);
      }

      session.metadata.trustedDeviceId = trustedDevice.id;
    } catch (error) {
      this.emit('deviceRegistrationError', {
        sessionId: session.id,
        userId: session.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  private async requestManualReview(session: VerificationSession): Promise<void> {
    session.outcome = VerificationOutcome.REQUIRES_REVIEW;
    
    this.emit('manualReviewRequired', {
      sessionId: session.id,
      userId: session.userId,
      riskScore: session.riskScore,
      flags: session.flags,
      timestamp: new Date()
    });
  }

  private async checkForSuspiciousActivity(session: VerificationSession): Promise<void> {
    // Check for repeated verification attempts
    const recentSessions = this.getUserSessions(session.userId)
      .filter(s => s.createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

    if (recentSessions.length > 5) {
      session.flags.repeatedAttempts = true;
      session.flags.suspiciousActivity = true;
    }
  }

  private async validateLocation(session: VerificationSession): Promise<void> {
    if (!this.config.enableLocationValidation || !session.location) {
      return;
    }

    // Check for timezone manipulation
    const browserTimezone = session.deviceFingerprint.basic.timezone;
    const ipTimezone = session.location.network.timezone;
    
    if (browserTimezone !== ipTimezone) {
      session.flags.timeZoneManipulation = true;
    }
  }

  private async checkDeviceSpoofing(session: VerificationSession): Promise<void> {
    if (!this.config.enableDeviceSpoofDetection) {
      return;
    }

    // Check for inconsistent fingerprint data
    const fingerprint = session.deviceFingerprint;
    
    // Check for suspicious user agent patterns
    if (fingerprint.basic.userAgent.includes('HeadlessChrome') ||
        fingerprint.basic.userAgent.includes('PhantomJS')) {
      session.flags.deviceSpoofing = true;
    }
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= this.config.riskThresholds.requireManualReview) {
      return RiskLevel.CRITICAL;
    } else if (riskScore >= this.config.riskThresholds.highRisk) {
      return RiskLevel.HIGH;
    } else if (riskScore >= this.config.riskThresholds.mediumRisk) {
      return RiskLevel.MEDIUM;
    } else {
      return RiskLevel.LOW;
    }
  }

  private addAttempt(
    session: VerificationSession,
    step: VerificationStep,
    success: boolean,
    challengeId?: string,
    failureReason?: string
  ): void {
    const attempt: VerificationAttempt = {
      id: this.generateAttemptId(),
      timestamp: new Date(),
      step,
      challengeId,
      success,
      failureReason,
      duration: Date.now() - session.updatedAt.getTime(),
      metadata: {}
    };

    session.attempts.push(attempt);
  }

  private async getLocationFromIP(ipAddress: string): Promise<LocationData> {
    // Simplified location lookup - would use a real GeoIP service
    return {
      id: 'loc-ip-' + Date.now(),
      timestamp: new Date(),
      source: 'ip',
      accuracy: 5000,
      confidence: 80,
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5000
      },
      address: {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco'
      },
      network: {
        ipAddress,
        isp: 'Internet Provider',
        timezone: 'America/Los_Angeles',
        vpnDetected: false,
        proxyDetected: false,
        torDetected: false,
        hostingProvider: false,
        datacenter: false
      },
      metadata: {
        language: 'en',
        currency: 'USD',
        callingCode: '+1'
      }
    };
  }

  private generateCaptcha(): { question: string; answer: string; imageData: string } {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return {
      question: `What is ${a} + ${b}?`,
      answer: (a + b).toString(),
      imageData: 'data:image/png;base64,fake-captcha-data'
    };
  }

  private generateSessionId(): string {
    return `vs_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateChallengeId(): string {
    return `ch_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAttemptId(): string {
    return `att_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private startCleanupTimer(): void {
    // Clean up expired sessions every hour
    setInterval(() => {
      this.performCleanup();
    }, 60 * 60 * 1000);
  }

  private performCleanup(): void {
    const now = new Date();
    
    // Clean up expired sessions
    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt && !session.completedAt) {
        session.outcome = VerificationOutcome.EXPIRED;
        session.completedAt = now;
        
        this.emit('sessionExpired', {
          sessionId,
          userId: session.userId,
          timestamp: now
        });
      }
      
      // Remove old completed sessions (keep for 24 hours)
      if (session.completedAt && 
          now.getTime() - session.completedAt.getTime() > 24 * 60 * 60 * 1000) {
        this.sessions.delete(sessionId);
      }
    }
    
    // Clean up expired challenges
    for (const [challengeId, challenge] of this.challenges) {
      if (now > challenge.expiresAt && challenge.status === 'pending') {
        challenge.status = 'expired';
      }
      
      // Remove old challenges
      if (now.getTime() - challenge.createdAt.getTime() > 24 * 60 * 60 * 1000) {
        this.challenges.delete(challengeId);
      }
    }
  }
}

// Export default instance
export 
export default DeviceVerificationService;