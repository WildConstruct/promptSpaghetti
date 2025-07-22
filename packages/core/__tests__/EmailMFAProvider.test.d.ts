/**
 * Email MFA Provider Tests
 * Task: T-1752989143997-938 - Implement email-based verification
 * Comprehensive test suite for EmailMFAProvider
 */
import { EmailConfiguration, EmailVerification } from '../types/MFATypes';
declare class MockEmailService {
    sentEmails: Array<{
        to: string;
        template: any;
        variables: Record<string, string>;
        result: any;
    }>;
    sendEmail(to: string, template: any, variables: Record<string, string>): Promise<{
        messageId: `${string}-${string}-${string}-${string}-${string}`;
        status: "sent";
        timestamp: Date;
    }>;
    validateEmailAddress(email: string): Promise<boolean>;
    checkEmailReputation(email: string): Promise<{
        valid: boolean;
        risk: number;
    }>;
    reset(): void;
}
declare class MockStorage {
    private configurations;
    private verifications;
    private rateLimits;
    private attempts;
    private events;
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
    logVerificationAttempt(attempt: any): Promise<void>;
    logSecurityEvent(event: any): Promise<void>;
    reset(): void;
    getAttempts(): any[];
    getEvents(): any[];
}
declare const _default: {
    MockEmailService: typeof MockEmailService;
    MockStorage: typeof MockStorage;
};
export default _default;
//# sourceMappingURL=EmailMFAProvider.test.d.ts.map