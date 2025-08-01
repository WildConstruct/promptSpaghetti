/**
 * Verification Code Manager
 *
 * Comprehensive system for managing verification codes with expiry, retry logic,
 * rate limiting, and security features. Handles MFA codes, email verification,
 * SMS verification, and other time-sensitive verification scenarios.
 *
 * Features:
 * - Multiple verification code types and formats
 * - Configurable expiry times and retry limits
 * - Rate limiting and abuse prevention
 * - Secure code generation and validation
 * - Audit logging and security monitoring
 * - Automatic cleanup and code lifecycle management
 * - Support for different delivery channels
 * - Anti-brute force protection
 */
import { EventEmitter } from 'events';
export declare enum VerificationCodeType { EMAIL_VERIFICATION = "email_verification",
    SMS_VERIFICATION = "sms_verification",
    TOTP_BACKUP = "totp_backup",
    PASSWORD_RESET = "password_reset",
    ACCOUNT_RECOVERY = "account_recovery",
    DEVICE_VERIFICATION = "device_verification",
    LOGIN_CONFIRMATION = "login_confirmation",
    TRANSACTION_APPROVAL = "transaction_approval"

export declare enum CodeFormat {
    NUMERIC_4 = "numeric_4",// 1234
    NUMERIC_6 = "numeric_6",// 123456
    NUMERIC_8 = "numeric_8",// 12345678
    ALPHANUMERIC_6 = "alpha_6",// A1B2C3
    ALPHANUMERIC_8 = "alpha_8",// A1B2C3D4
    UUID = "uuid"

export declare enum CodeStatus {
    ACTIVE = "active",
    USED = "used",
    EXPIRED = "expired",
    REVOKED = "revoked",
    RATE_LIMITED = "rate_limited"

export declare enum DeliveryChannel {
    EMAIL = "email",
    SMS = "sms",
    VOICE = "voice",
    PUSH = "push" }
    IN_APP = "in_app"

}
}
export interface VerificationCodeConfig { defaultExpiration: number;
    maxExpiration: number;
    retryLimit: number;
    rateLimitWindow: number;
    rateLimitCount: number;
    cleanupInterval: number;
    codeFormats: {
        [key in VerificationCodeType]: CodeFormat }
}
    };
    expirationTimes: { [key in VerificationCodeType]: number };
    retryLimits: { [key in VerificationCodeType]: number };
    enableSecurityLogging: boolean;
    antiEnumerationDelay: number;
    requireSecureDelivery: boolean;

}
}
export interface VerificationCode { id: string;
    userId: string;
    type: VerificationCodeType;
    format: CodeFormat;
    hashedCode: string;
    salt: string;
    status: CodeStatus;
    createdAt: Date;
    expiresAt: Date;
    usedAt?: Date;
    revokedAt?: Date;
    attempts: number;
    maxAttempts: number;
    deliveryChannel: DeliveryChannel;
    deliveryAddress: string;
    ipAddress: string;
    userAgent: string;
    metadata: {
        purpose?: string;
        requestSource?: string;
        deviceFingerprint?: string;
        locationData?: any;
        deliveryAttempts?: number;
        deliveryStatus?: string;
        revocationReason?: string;
        additionalContext?: Record<string, any> }
}
    };
    securityFlags: { highRisk: boolean;
        multipleAttempts: boolean;
        suspiciousActivity: boolean;
        deviceMismatch: boolean };

}
}
export interface CodeGenerationRequest { userId: string;
    type: VerificationCodeType;
    deliveryChannel: DeliveryChannel;
    deliveryAddress: string;
    ipAddress: string;
    userAgent: string;
    expirationMinutes?: number;
    maxAttempts?: number;
    metadata?: Record<string, any> }
}
}
export interface CodeValidationRequest { userId: string;
    code: string;
    type: VerificationCodeType;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string }
}
}
export interface ValidationResult { valid: boolean;
    codeData?: VerificationCode;
    reason?: string;
    attemptsRemaining?: number;
    securityWarnings?: string[];
    riskScore?: number }
}
}
export interface RateLimitData { count: number;
    resetTime: number;
    lastRequest: Date;
    violations: number;

export declare enum SecurityEvent {
    CODE_GENERATED = "code_generated";
    CODE_VALIDATED = "code_validated";
    CODE_USED = "code_used";
    CODE_EXPIRED = "code_expired";
    CODE_REVOKED = "code_revoked";
    INVALID_CODE_ATTEMPT = "invalid_code_attempt";
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded";
    SUSPICIOUS_ACTIVITY = "suspicious_activity";
    BRUTE_FORCE_DETECTED = "brute_force_detected" }
    CODE_CLEANUP = "code_cleanup"

}
}
}
export interface CodeStatistics { totalCodes: number;
    activeCodes: number;
    usedCodes: number;
    expiredCodes: number;
    revokedCodes: number;
    codesByType: Record<VerificationCodeType, number>;
    codesByChannel: Record<DeliveryChannel, number>;
    successRate: number;
    averageAttempts: number;
    securityViolations: number;
    rateLimitViolations: number;
    averageCodeLifetime: number;
/**
 * Comprehensive verification code management service
 */
export declare class VerificationCodeManager extends EventEmitter {
    private codes;
    private rateLimits;
    private config;
    private cleanupTimer?;
    constructor(config?: Partial<VerificationCodeConfig>);
    /**
     * Generate a new verification code
     */
    generateCode(request: CodeGenerationRequest): Promise<{
        code: string;
        codeId: string }
}
    } | null>;
    /**
     * Validate a verification code
     */
    validateCode(request: CodeValidationRequest): Promise<ValidationResult>;
    /**
     * Use a verification code (marks it as used)
     */
    useCode(request: CodeValidationRequest): Promise<{ success: boolean;
        codeData?: VerificationCode;
        reason?: string }>;
    /**
     * Revoke a specific verification code
     */
    revokeCode(codeId: string, reason: string): Promise<boolean>;
    /**
     * Revoke all codes for a user of a specific type
     */
    revokeUserCodes(userId: string, type?: VerificationCodeType, reason?: string): Promise<number>;
    /**
     * Get verification code information (without sensitive data)
     */
    getCodeInfo(codeId: string): Partial<VerificationCode> | null;
    /**
     * Get active codes for a user
     */
    getUserActiveCodes(userId: string, type?: VerificationCodeType): VerificationCode[];
    /**
     * Get comprehensive statistics
     */
    getStatistics(): CodeStatistics;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<VerificationCodeConfig>): void;
    private mergeConfig;
    private generateCodeByFormat;
    private generateNumericCode;
    private generateAlphanumericCode;
    private generateUUID;
    private generateSalt;
    private generateCodeId;
    private hashCode;
    private calculateExpiration;
    private validateFoundCode;
    private isRateLimited;
    private updateRateLimit;
    private antiEnumerationDelay;
    private logSecurityEvent;
    private startCleanupTimer;
    private performCleanup;
    /**
     * Destroy the verification code manager and clean up resources
     */
    destroy(): void;

export default VerificationCodeManager;
//# sourceMappingURL=VerificationCodeManager.d.ts.map