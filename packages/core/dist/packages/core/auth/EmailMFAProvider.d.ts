/**
 * Email-based MFA Provider Implementation
 * Task: T-1752989143997-938 - Implement email-based verification
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { 
  EmailConfiguration,
  EmailVerification,
  MFAVerificationRequest,
  MFAVerificationResponse,
  MFAEnrollmentRequest,
  MFAEnrollmentResponse
} from '../types/MFATypes';
interface EmailMFAConfig {
    encryption: {
        algorithm: 'aes-256-gcm';
        keyDerivation: 'pbkdf2';
        iterations: number;
    };
    templates: {
        verificationCode: string;
        enrollmentCode: string;
    };
    rateLimit: {
        maxDailyEmails: number;
        cooldownMinutes: number;
    };
}
interface EmailTemplate {
    subject: string;
    htmlTemplate: string;
    textTemplate: string;
    variables: string[];
}
interface EmailSendResult {
    messageId: string;
    status: 'sent' | 'failed';
    error?: string;
    timestamp: Date;
}
interface RiskAssessmentContext {
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceFingerprint?: string;
    previousAttempts: number;
}
interface EmailService {
    sendEmail(to: string, template: EmailTemplate, variables: Record<string, string>): Promise<EmailSendResult>;
    validateEmailAddress(email: string): Promise<boolean>;
    checkEmailReputation(email: string): Promise<{
        valid: boolean;
        risk: number;
    }>;
}
interface EmailMFAStorage {
    saveConfiguration(config: EmailConfiguration): Promise<void>;
    getConfiguration(userId: string): Promise<EmailConfiguration | null>;
    getConfigurationById(configId: string): Promise<EmailConfiguration | null>;
    updateConfiguration(configId: string, updates: Partial<EmailConfiguration>): Promise<void>;
    deleteConfiguration(configId: string): Promise<void>;
    saveVerification(verification: EmailVerification): Promise<void>;
    getVerification(verificationId: string): Promise<EmailVerification | null>;
    getActiveVerifications(userId: string): Promise<EmailVerification[]>;
    deleteVerification(verificationId: string): Promise<void>;
    getRateLimitState(userId: string, action: string): Promise<{
        count: number;
        windowStart: Date;
    } | null>;
    updateRateLimitState(userId: string, action: string, count: number): Promise<void>;
    logVerificationAttempt(attempt: unknown): Promise<void>;
    logSecurityEvent(event: unknown): Promise<void>;
}
export declare class EmailMFAProvider {
    private config;
    private emailService;
    private storage;
    private encryptionKey;
    constructor(config: EmailMFAConfig, emailService: EmailService, storage: EmailMFAStorage, encryptionKey: string);
    enrollMethod(userId: string, request: MFAEnrollmentRequest): Promise<MFAEnrollmentResponse>;
    completeEnrollment(userId: string, verificationId: string, code: string): Promise<void>;
    initiateVerification(userId: string, configurationId: string, context: RiskAssessmentContext): Promise<string>;
    verifyCode(request: MFAVerificationRequest, context: RiskAssessmentContext): Promise<MFAVerificationResponse>;
    private sendEnrollmentVerification;
    private sendVerificationEmail;
    private generateVerificationCode;
    private encryptToken;
    private decryptToken;
    private constantTimeCompare;
    private assessRisk;
    private checkRateLimit;
    private updateRateLimit;
    private checkRateLimitForVerification;
    private cleanupExpiredVerifications;
    private isExpired;
    private logVerificationAttempt;
    updateEmailAddress(userId: string, configurationId: string, newEmailAddress: string): Promise<void>;
    disableMethod(userId: string, configurationId: string): Promise<void>;
    revokeMethod(userId: string, configurationId: string): Promise<void>;
}
export default EmailMFAProvider;
//# sourceMappingURL=EmailMFAProvider.d.ts.map