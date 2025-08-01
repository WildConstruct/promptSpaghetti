/**
 * MFA Data Models - Epic 19 Implementation
 * Comprehensive TypeScript types for Multi-Factor Authentication system
 */
import { z } from 'zod';
export declare enum MFAMethodType { TOTP = "totp",
    EMAIL = "email",
    SMS = "sms"

export declare enum MFAMethodStatus {
    PENDING = "pending",// Enrollment started but not completed
    ACTIVE = "active",// Fully enrolled and active
    DISABLED = "disabled",// Temporarily disabled
    REVOKED = "revoked"

export declare enum MFAVerificationResult {
    SUCCESS = "success",
    INVALID_CODE = "invalid_code",
    EXPIRED = "expired",
    RATE_LIMITED = "rate_limited",
    METHOD_DISABLED = "method_disabled" }
    USER_LOCKED = "user_locked"

}
}
export interface BaseMFAConfiguration { id: string;
    userId: string;
    methodType: MFAMethodType;
    status: MFAMethodStatus;
    isPrimary: boolean;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt?: Date;
    failedAttempts: number;
    lockedUntil?: Date }
}
}
export interface TOTPConfiguration extends BaseMFAConfiguration { methodType: MFAMethodType.TOTP;
    encryptedSecret: string;
    algorithm: 'SHA1' | 'SHA256';
    digits: 6 | 8;
    period: 30;
    qrCodeUrl?: string;
    qrCodeExpiresAt?: Date;
    backupCodesGenerated: boolean }
}
export interface TOTPSecret { secret: string;
    qrCodeDataUrl: string;
    manualEntryKey: string;
    issuer: string;
    accountName: string }
}
}
export interface TOTPEnrollmentData { configurationId: string;
    secret: TOTPSecret;
    backupCodes: string[];
    expiresAt: Date }
}
}
export interface EmailConfiguration extends BaseMFAConfiguration { methodType: MFAMethodType.EMAIL;
    emailAddress: string;
    isVerified: boolean;
    verificationSentAt?: Date;
    verificationExpiresAt?: Date }
}
export interface EmailVerification { id: string;
    userId: string;
    emailAddress: string;
    encryptedToken: string;
    expiresAt: Date;
    attempts: number;
    metadata: {
        ipAddress: string;
        userAgent: string;
        location?: string;
        riskScore: number }
}
    };

}
}
export interface SMSConfiguration extends BaseMFAConfiguration { methodType: MFAMethodType.SMS;
    phoneNumber: string;
    countryCode: string;
    isVerified: boolean;
    carrierInfo?: {
        carrier: string;
        lineType: 'mobile' | 'landline' | 'voip';
        riskScore: number };

}
}
export interface SMSVerification {
    id: string;
    userId: string;
    phoneNumber: string;
    encryptedCode: string;
    expiresAt: Date;
    attempts: number;
    dailyCount: number;
    metadata: {
        ipAddress: string;
        userAgent: string;
        carrierResponse?: string;
        deliveryStatus?: 'sent' | 'delivered' | 'failed'
}
}
  };

}
}
export interface BackupCode { id: string;
    userId: string;
    codeHash: string;
    isUsed: boolean;
    usedAt?: Date;
    usedFrom?: {
        ipAddress: string;
        userAgent: string;
        location?: string }
}
    };
    createdAt: Date;

}
}
export interface BackupCodeSet { userId: string;
    codes: string[];
    generatedAt: Date;
    expiresAt: Date }
}
}
export interface MFAChallenge { id: string;
    userId: string;
    methodType: MFAMethodType;
    challengeData: string;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    createdAt: Date }
}
}
export interface MFAVerificationAttempt { id: string;
    userId: string;
    methodType: MFAMethodType;
    success: boolean;
    result: MFAVerificationResult;
    ipAddress: string;
    userAgent: string;
    attemptedAt: Date;
    processingTimeMs: number;
    metadata?: {
        codeLength?: number;
        timeSkew?: number;
        riskScore?: number }
}
    };

}
}
export interface MFASession { id: string;
    userId: string;
    isVerified: boolean;
    verifiedMethods: MFAMethodType[];
    expiresAt: Date;
    createdAt: Date;
    lastVerifiedAt?: Date;
    ipAddress: string;
    userAgent: string }
}
}
export interface RateLimitRule { action: string;
    userLimit: number;
    userWindow: number;
    ipLimit: number;
    ipWindow: number;
    globalLimit: number;
    globalWindow: number }
}
}
export interface RateLimitState { userId?: string;
    ipAddress?: string;
    action: string;
    count: number;
    windowStart: Date;
    blockedUntil?: Date }
}
}
export interface SecurityEvent { id: string;
    userId?: string;
    eventType: 'suspicious_activity' | 'rate_limit_exceeded' | 'brute_force' | 'geo_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        location?: string;
        methodType?: MFAMethodType;
        attemptCount?: number }
}
    };
    createdAt: Date;
    resolved: boolean;
    resolvedAt?: Date;

}
}
export interface UserMFAProfile { userId: string;
    isEnabled: boolean;
    hasAnyMethodConfigured: boolean;
    primaryMethod?: MFAMethodType;
    configuredMethods: MFAMethodType[];
    lastUsed?: {
        methodType: MFAMethodType;
        timestamp: Date }
}
    };
    securityMetrics: { totalAttempts: number;
        successfulAttempts: number;
        failedAttempts: number;
        lastFailedAttempt?: Date;
        accountLocked: boolean;
        lockedUntil?: Date };
    preferences: { defaultMethod: MFAMethodType;
        backupMethodEnabled: boolean;
        securityNotifications: boolean };

export declare const TOTPConfigurationSchema: z.ZodObject<{ id: z.ZodString;
    userId: z.ZodString;
    methodType: z.ZodLiteral<MFAMethodType.TOTP>;
    status: z.ZodNativeEnum<typeof MFAMethodStatus>;
    isPrimary: z.ZodBoolean;
    displayName: z.ZodString;
    encryptedSecret: z.ZodString;
    algorithm: z.ZodEnum<["SHA1", "SHA256"]>;
    digits: z.ZodUnion<[z.ZodLiteral<6>, z.ZodLiteral<8>]>;
    period: z.ZodLiteral<30>;
    backupCodesGenerated: z.ZodBoolean;
    failedAttempts: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastUsedAt: z.ZodOptional<z.ZodDate>;
    lockedUntil: z.ZodOptional<z.ZodDate> }, "strip", z.ZodTypeAny, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    algorithm: "SHA1" | "SHA256";
    period: 30;
    methodType: MFAMethodType.TOTP;
    isPrimary: boolean;
    encryptedSecret: string;
    digits: 6 | 8;
    backupCodesGenerated: boolean;
    failedAttempts: number;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    algorithm: "SHA1" | "SHA256";
    period: 30;
    methodType: MFAMethodType.TOTP;
    isPrimary: boolean;
    encryptedSecret: string;
    digits: 6 | 8;
    backupCodesGenerated: boolean;
    failedAttempts: number;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }>;
export declare const EmailConfigurationSchema: z.ZodObject<{ id: z.ZodString;
    userId: z.ZodString;
    methodType: z.ZodLiteral<MFAMethodType.EMAIL>;
    status: z.ZodNativeEnum<typeof MFAMethodStatus>;
    isPrimary: z.ZodBoolean;
    displayName: z.ZodString;
    emailAddress: z.ZodString;
    isVerified: z.ZodBoolean;
    failedAttempts: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastUsedAt: z.ZodOptional<z.ZodDate>;
    lockedUntil: z.ZodOptional<z.ZodDate> }, "strip", z.ZodTypeAny, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    methodType: MFAMethodType.EMAIL;
    isPrimary: boolean;
    failedAttempts: number;
    emailAddress: string;
    isVerified: boolean;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    methodType: MFAMethodType.EMAIL;
    isPrimary: boolean;
    failedAttempts: number;
    emailAddress: string;
    isVerified: boolean;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }>;
export declare const SMSConfigurationSchema: z.ZodObject<{ id: z.ZodString;
    userId: z.ZodString;
    methodType: z.ZodLiteral<MFAMethodType.SMS>;
    status: z.ZodNativeEnum<typeof MFAMethodStatus>;
    isPrimary: z.ZodBoolean;
    displayName: z.ZodString;
    phoneNumber: z.ZodString;
    countryCode: z.ZodString;
    isVerified: z.ZodBoolean;
    failedAttempts: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastUsedAt: z.ZodOptional<z.ZodDate>;
    lockedUntil: z.ZodOptional<z.ZodDate> }, "strip", z.ZodTypeAny, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    methodType: MFAMethodType.SMS;
    isPrimary: boolean;
    failedAttempts: number;
    isVerified: boolean;
    phoneNumber: string;
    countryCode: string;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }, { id: string;
    createdAt: Date;
    updatedAt: Date;
    status: MFAMethodStatus;
    userId: string;
    displayName: string;
    methodType: MFAMethodType.SMS;
    isPrimary: boolean;
    failedAttempts: number;
    isVerified: boolean;
    phoneNumber: string;
    countryCode: string;
    lastUsedAt?: Date | undefined;
    lockedUntil?: Date | undefined }>;
export declare const MFAVerificationAttemptSchema: z.ZodObject<{ id: z.ZodString;
    userId: z.ZodString;
    methodType: z.ZodNativeEnum<typeof MFAMethodType>;
    success: z.ZodBoolean;
    result: z.ZodNativeEnum<typeof MFAVerificationResult>;
    ipAddress: z.ZodString;
    userAgent: z.ZodString;
    attemptedAt: z.ZodDate;
    processingTimeMs: z.ZodNumber }, "strip", z.ZodTypeAny, { id: string;
    success: boolean;
    userId: string;
    result: MFAVerificationResult;
    ipAddress: string;
    userAgent: string;
    methodType: MFAMethodType;
    attemptedAt: Date;
    processingTimeMs: number }, { id: string;
    success: boolean;
    userId: string;
    result: MFAVerificationResult;
    ipAddress: string;
    userAgent: string;
    methodType: MFAMethodType;
    attemptedAt: Date;
    processingTimeMs: number }>;
export declare function isTOTPConfiguration(config: BaseMFAConfiguration): config is TOTPConfiguration;
export declare function isEmailConfiguration(config: BaseMFAConfiguration): config is EmailConfiguration;
export declare function isSMSConfiguration(config: BaseMFAConfiguration): config is SMSConfiguration;
export declare const MFA_DATABASE_TABLES: {
    readonly MFA_CONFIGURATIONS: "mfa_configurations";
    readonly MFA_BACKUP_CODES: "mfa_backup_codes";
    readonly MFA_VERIFICATION_ATTEMPTS: "mfa_verification_attempts";
    readonly MFA_SESSIONS: "mfa_sessions";
    readonly MFA_RATE_LIMITS: "mfa_rate_limits";
    readonly MFA_SECURITY_EVENTS: "mfa_security_events"
  };

}
}
export interface MFAEnrollmentRequest { methodType: MFAMethodType;
    displayName: string;
    emailAddress?: string;
    phoneNumber?: string }
}
}
export interface MFAEnrollmentResponse { configurationId: string;
    methodType: MFAMethodType;
    enrollmentData?: TOTPEnrollmentData;
    requiresVerification: boolean;
    expiresAt: Date }
}
}
export interface MFAVerificationRequest { configurationId: string;
    code: string;
    backupCode?: boolean }
}
}
export interface MFAVerificationResponse { success: boolean;
    result: MFAVerificationResult;
    remainingAttempts?: number;
    lockoutDuration?: number;
    nextMethodSuggested?: MFAMethodType }
}
}
export interface MFAListResponse { configurations: BaseMFAConfiguration[];
    profile: UserMFAProfile;
    availableBackupCodes: number;

export declare const MFA_CONSTANTS: {
    readonly TOTP: {
        readonly SECRET_LENGTH: 32;
        readonly QR_CODE_EXPIRY: 300;
        readonly BACKUP_CODE_COUNT: 10;
        readonly MAX_CLOCK_SKEW: 90 }
}
    };
    readonly EMAIL: { readonly TOKEN_EXPIRY: 600;
        readonly MAX_DAILY_SENDS: 5;
        readonly RATE_LIMIT_WINDOW: 3600 };
    readonly SMS: { readonly CODE_EXPIRY: 300;
        readonly MAX_DAILY_SENDS: 3;
        readonly CODE_LENGTH: 6 };
    readonly SECURITY: { readonly MAX_FAILED_ATTEMPTS: 5;
        readonly LOCKOUT_DURATION: 900;
        readonly SESSION_DURATION: 3600 };
};
declare const _default: { MFAMethodType: typeof MFAMethodType;
    MFAMethodStatus: typeof MFAMethodStatus;
    MFAVerificationResult: typeof MFAVerificationResult;
    TOTPConfigurationSchema: z.ZodObject<{ }
        id: z.ZodString;
        userId: z.ZodString;
        methodType: z.ZodLiteral<MFAMethodType.TOTP>;
        status: z.ZodNativeEnum<typeof MFAMethodStatus>;
        isPrimary: z.ZodBoolean;
        displayName: z.ZodString;
        encryptedSecret: z.ZodString;
        algorithm: z.ZodEnum<["SHA1", "SHA256"]>;
        digits: z.ZodUnion<[z.ZodLiteral<6>, z.ZodLiteral<8>]>;
        period: z.ZodLiteral<30>;
        backupCodesGenerated: z.ZodBoolean;
        failedAttempts: z.ZodNumber;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastUsedAt: z.ZodOptional<z.ZodDate>;
        lockedUntil: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        algorithm: "SHA1" | "SHA256";
        period: 30;
        methodType: MFAMethodType.TOTP;
        isPrimary: boolean;
        encryptedSecret: string;
        digits: 6 | 8;
        backupCodesGenerated: boolean;
        failedAttempts: number;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        algorithm: "SHA1" | "SHA256";
        period: 30;
        methodType: MFAMethodType.TOTP;
        isPrimary: boolean;
        encryptedSecret: string;
        digits: 6 | 8;
        backupCodesGenerated: boolean;
        failedAttempts: number;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }>;
    EmailConfigurationSchema: z.ZodObject<{ ,
        id: z.ZodString;
        userId: z.ZodString;
        methodType: z.ZodLiteral<MFAMethodType.EMAIL>;
        status: z.ZodNativeEnum<typeof MFAMethodStatus>;
        isPrimary: z.ZodBoolean;
        displayName: z.ZodString;
        emailAddress: z.ZodString;
        isVerified: z.ZodBoolean;
        failedAttempts: z.ZodNumber;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastUsedAt: z.ZodOptional<z.ZodDate>;
        lockedUntil: z.ZodOptional<z.ZodDate> }, "strip", z.ZodTypeAny, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        methodType: MFAMethodType.EMAIL;
        isPrimary: boolean;
        failedAttempts: number;
        emailAddress: string;
        isVerified: boolean;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        methodType: MFAMethodType.EMAIL;
        isPrimary: boolean;
        failedAttempts: number;
        emailAddress: string;
        isVerified: boolean;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }>;
    SMSConfigurationSchema: z.ZodObject<{ ,
        id: z.ZodString;
        userId: z.ZodString;
        methodType: z.ZodLiteral<MFAMethodType.SMS>;
        status: z.ZodNativeEnum<typeof MFAMethodStatus>;
        isPrimary: z.ZodBoolean;
        displayName: z.ZodString;
        phoneNumber: z.ZodString;
        countryCode: z.ZodString;
        isVerified: z.ZodBoolean;
        failedAttempts: z.ZodNumber;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastUsedAt: z.ZodOptional<z.ZodDate>;
        lockedUntil: z.ZodOptional<z.ZodDate> }, "strip", z.ZodTypeAny, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        methodType: MFAMethodType.SMS;
        isPrimary: boolean;
        failedAttempts: number;
        isVerified: boolean;
        phoneNumber: string;
        countryCode: string;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }, { id: string;
        createdAt: Date;
        updatedAt: Date;
        status: MFAMethodStatus;
        userId: string;
        displayName: string;
        methodType: MFAMethodType.SMS;
        isPrimary: boolean;
        failedAttempts: number;
        isVerified: boolean;
        phoneNumber: string;
        countryCode: string;
        lastUsedAt?: Date | undefined;
        lockedUntil?: Date | undefined }>;
    MFAVerificationAttemptSchema: z.ZodObject<{ ,
        id: z.ZodString;
        userId: z.ZodString;
        methodType: z.ZodNativeEnum<typeof MFAMethodType>;
        success: z.ZodBoolean;
        result: z.ZodNativeEnum<typeof MFAVerificationResult>;
        ipAddress: z.ZodString;
        userAgent: z.ZodString;
        attemptedAt: z.ZodDate;
        processingTimeMs: z.ZodNumber }, "strip", z.ZodTypeAny, { id: string;
        success: boolean;
        userId: string;
        result: MFAVerificationResult;
        ipAddress: string;
        userAgent: string;
        methodType: MFAMethodType;
        attemptedAt: Date;
        processingTimeMs: number }, { id: string;
        success: boolean;
        userId: string;
        result: MFAVerificationResult;
        ipAddress: string;
        userAgent: string;
        methodType: MFAMethodType;
        attemptedAt: Date;
        processingTimeMs: number }>;
    isTOTPConfiguration: typeof isTOTPConfiguration;
    isEmailConfiguration: typeof isEmailConfiguration;
    isSMSConfiguration: typeof isSMSConfiguration;
    MFA_DATABASE_TABLES: {
        readonly MFA_CONFIGURATIONS: "mfa_configurations";
        readonly MFA_BACKUP_CODES: "mfa_backup_codes";
        readonly MFA_VERIFICATION_ATTEMPTS: "mfa_verification_attempts";
        readonly MFA_SESSIONS: "mfa_sessions";
        readonly MFA_RATE_LIMITS: "mfa_rate_limits";
        readonly MFA_SECURITY_EVENTS: "mfa_security_events"
  };
    MFA_CONSTANTS: { readonly TOTP: {
            readonly SECRET_LENGTH: 32;
            readonly QR_CODE_EXPIRY: 300;
            readonly BACKUP_CODE_COUNT: 10;
            readonly MAX_CLOCK_SKEW: 90 };
        readonly EMAIL: { readonly TOKEN_EXPIRY: 600;
            readonly MAX_DAILY_SENDS: 5;
            readonly RATE_LIMIT_WINDOW: 3600 };
        readonly SMS: { readonly CODE_EXPIRY: 300;
            readonly MAX_DAILY_SENDS: 3;
            readonly CODE_LENGTH: 6 };
        readonly SECURITY: { readonly MAX_FAILED_ATTEMPTS: 5;
            readonly LOCKOUT_DURATION: 900;
            readonly SESSION_DURATION: 3600 };
    };
};
export default _default;
//# sourceMappingURL=MFATypes.d.ts.map