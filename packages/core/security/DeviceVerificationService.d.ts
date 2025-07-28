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
import { 
  DeviceFingerprintingService,
  DeviceFingerprint,
  LocationData,
  RiskLevel,
  FingerprintContext
} from './DeviceFingerprintingService';
import { TrustedDeviceManager, TrustLevel, VerificationMethod } from './TrustedDeviceManager';
import { VerificationCodeManager } from './VerificationCodeManager';
import { EmailDeliveryTracker } from './services/EmailDeliveryTracker';
export declare enum VerificationStep {
    FINGERPRINT_COLLECTION = "fingerprint_collection",
    RISK_ASSESSMENT = "risk_assessment",
    CHALLENGE_REQUIRED = "challenge_required",
    EMAIL_VERIFICATION = "email_verification",
    SMS_VERIFICATION = "sms_verification",
    MFA_VERIFICATION = "mfa_verification",
    MANUAL_REVIEW = "manual_review",
    DEVICE_REGISTRATION = "device_registration",
    VERIFICATION_COMPLETE = "verification_complete",
    VERIFICATION_FAILED = "verification_failed"
}
export declare enum ChallengeType {
    EMAIL_CODE = "email_code",
    SMS_CODE = "sms_code",
    CAPTCHA = "captcha",
    BEHAVIORAL = "behavioral",
    BIOMETRIC = "biometric",
    MANUAL_REVIEW = "manual_review",
    PHONE_CALL = "phone_call",
    SECURITY_QUESTIONS = "security_questions"
}
export declare enum VerificationOutcome {
    APPROVED = "approved",
    REJECTED = "rejected",
    PENDING = "pending",
    REQUIRES_REVIEW = "requires_review",
    EXPIRED = "expired",
    ABANDONED = "abandoned"
}
export interface VerificationSession {
    id: string;
    userId: string;
    deviceFingerprint: DeviceFingerprint;
    location: LocationData;
    currentStep: VerificationStep;
    outcome: VerificationOutcome | null;
    riskScore: number;
    riskLevel: RiskLevel;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    completedAt?: Date;
    challenges: DeviceChallenge[];
    completedChallenges: string[];
    requiredChallenges: ChallengeType[];
    attempts: VerificationAttempt[];
    deviceName?: string;
    verificationMethod: VerificationMethod;
    requestedTrustLevel: TrustLevel;
    ipAddress: string;
    userAgent: string;
    sessionContext: Record<string, any>;
    metadata: Record<string, any>;
    flags: {,
        suspiciousActivity: boolean;
        vpnDetected: boolean;
        proxyDetected: boolean;
        repeatedAttempts: boolean;
        deviceSpoofing: boolean;
        locationInconsistent: boolean;
        timeZoneManipulation: boolean;
    };
}
export interface DeviceChallenge {
    id: string;
    type: ChallengeType;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    createdAt: Date;
    expiresAt: Date;
    completedAt?: Date;
    challengeData: {,
        code?: string;
        question?: string;
        expectedResponse?: string;
        deliveryAddress?: string;
        attempts: number;
        maxAttempts: number;
    };
    responseData?: {
        userResponse: string;
        timestamp: Date;
        metadata: Record<string, any>;
    };
    metadata: Record<string, any>;
}
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
export interface VerificationConfig {
    sessionTimeoutMinutes: number;
    maxAttemptsPerChallenge: number;
    maxVerificationAttempts: number;
    riskThresholds: {,
        lowRisk: number;
        mediumRisk: number;
        highRisk: number;
        requireManualReview: number;
    };
    challengeRequirements: {,
        [key in RiskLevel]: ChallengeType[];
    };
    enableBehavioralAnalysis: boolean;
    enableLocationValidation: boolean;
    enableDeviceSpoofDetection: boolean;
    enableAutomaticApproval: boolean;
    requireDoubleVerification: boolean;
}
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
export declare class DeviceVerificationService extends EventEmitter {
    private fingerprintService;
    private trustedDeviceManager;
    private verificationCodeManager;
    private emailTracker;
    private config;
    private sessions;
    private challenges;
    constructor()
      fingerprintService: DeviceFingerprintingService,
      trustedDeviceManager: TrustedDeviceManager,
      verificationCodeManager: VerificationCodeManager,
      emailTracker: EmailDeliveryTracker,
      config?: VerificationConfig
    );
    /**
     * Start device verification process
     */
    startVerification(request: DeviceVerificationRequestData): Promise<VerificationSession>;
    /**
     * Submit challenge response
     */
    submitChallengeResponse()
      sessionId: string,
      challengeId: string,
      response: string,
      metadata?: Record<string,
      any>
    ): Promise<{
        success: boolean;
        session: VerificationSession;
        nextStep?: VerificationStep;
    }>;
    /**
     * Get verification session
     */
    getSession(sessionId: string): VerificationSession | null;
    /**
     * Get user's verification sessions
     */
    getUserSessions(userId: string): VerificationSession[];
    /**
     * Cancel verification session
     */
    cancelSession(sessionId: string, reason?: string): boolean;
    /**
     * Admin override verification
     */
    adminOverride(sessionId: string, approved: boolean, adminUserId: string, reason: string): boolean;
    private progressSession;
    private performRiskAssessment;
    private createRequiredChallenges;
    private createChallenge;
    private createEmailChallenge;
    private createSMSChallenge;
    private createCaptchaChallenge;
    private createManualReviewChallenge;
    private validateChallengeResponse;
    private completeVerification;
    private registerTrustedDevice;
    private requestManualReview;
    private checkForSuspiciousActivity;
    private validateLocation;
    private checkDeviceSpoofing;
    private determineRiskLevel;
    private addAttempt;
    private getLocationFromIP;
    private generateCaptcha;
    private generateSessionId;
    private generateChallengeId;
    private generateAttemptId;
    private startCleanupTimer;
    private performCleanup;
}
export default DeviceVerificationService;
//# sourceMappingURL=DeviceVerificationService.d.ts.map