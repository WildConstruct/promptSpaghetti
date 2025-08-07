/**
 * MFA Data Models - Epic 19 Implementation
 * Comprehensive TypeScript types for Multi-Factor Authentication system
 */
import { z } from 'zod';
// ========================================
// Core MFA Types
// ========================================
export var MFAMethodType;
(function (MFAMethodType) {
    MFAMethodType["TOTP"] = "totp";
    MFAMethodType["EMAIL"] = "email";
    MFAMethodType["SMS"] = "sms";
    MFAMethodType[MFAMethodType["export"] = void 0] = "export";
    MFAMethodType[MFAMethodType["enum"] = void 0] = "enum";
    MFAMethodType[MFAMethodType["MFAMethodStatus"] = void 0] = "MFAMethodStatus";
})(MFAMethodType || (MFAMethodType = {}));
{
    PENDING = 'pending', // Enrollment started but not completed
        ACTIVE = 'active', // Fully enrolled and active
        DISABLED = 'disabled', // Temporarily disabled
        REVOKED = 'revoked'; // Permanently removed
    export let MFAVerificationResult;
    (function (MFAVerificationResult) {
        MFAVerificationResult["SUCCESS"] = "success";
        MFAVerificationResult["INVALID_CODE"] = "invalid_code";
        MFAVerificationResult["EXPIRED"] = "expired";
        MFAVerificationResult["RATE_LIMITED"] = "rate_limited";
        MFAVerificationResult["METHOD_DISABLED"] = "method_disabled";
    })(MFAVerificationResult || (MFAVerificationResult = {}));
    USER_LOCKED = 'user_locked';
    ;
    ;
    createdAt: Date;
    ;
    createdAt: Date;
    resolved: boolean;
    resolvedAt ?  : Date;
    ;
    securityMetrics: {
        totalAttempts: number;
        successfulAttempts: number;
        failedAttempts: number;
        lastFailedAttempt ?  : Date;
        accountLocked: boolean;
        lockedUntil ?  : Date;
    }
    ;
    preferences: {
        defaultMethod: MFAMethodType;
        backupMethodEnabled: boolean;
        securityNotifications: boolean;
    }
    ;
    // ========================================
    // Zod Validation Schemas
    // ========================================
    export const TOTPConfigurationSchema = z.object({ id: z.string().uuid(),
        userId: z.string().uuid(),
        methodType: z.literal(MFAMethodType.TOTP),
        status: z.nativeEnum(MFAMethodStatus),
        isPrimary: z.boolean(),
        displayName: z.string().min(1).max(100),
        encryptedSecret: z.string().min(1),
        algorithm: z.enum(['SHA1', 'SHA256']),
        digits: z.union([z.literal(6), z.literal(8)]),
        period: z.literal(30),
        backupCodesGenerated: z.boolean(),
        failedAttempts: z.number().min(0).max(10),
        createdAt: z.date(),
        updatedAt: z.date(),
        lastUsedAt: z.date().optional(),
        lockedUntil: z.date().optional() });
}
;
export const EmailConfigurationSchema = z.object({ id: z.string().uuid(),
    userId: z.string().uuid(),
    methodType: z.literal(MFAMethodType.EMAIL),
    status: z.nativeEnum(MFAMethodStatus),
    isPrimary: z.boolean(),
    displayName: z.string().min(1).max(100),
    emailAddress: z.string().email(),
    isVerified: z.boolean(),
    failedAttempts: z.number().min(0).max(10),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastUsedAt: z.date().optional(),
    lockedUntil: z.date().optional() });
;
export const SMSConfigurationSchema = z.object({ id: z.string().uuid(),
    userId: z.string().uuid(),
    methodType: z.literal(MFAMethodType.SMS),
    status: z.nativeEnum(MFAMethodStatus),
    isPrimary: z.boolean(),
    displayName: z.string().min(1).max(100) }, phoneNumber, z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164 format
countryCode, z.string().length(2), isVerified, z.boolean(), failedAttempts, z.number().min(0).max(10), createdAt, z.date(), updatedAt, z.date(), lastUsedAt, z.date().optional(), lockedUntil, z.date().optional());
;
export const MFAVerificationAttemptSchema = z.object({ id: z.string().uuid(),
    userId: z.string().uuid(),
    methodType: z.nativeEnum(MFAMethodType),
    success: z.boolean(),
    result: z.nativeEnum(MFAVerificationResult),
    ipAddress: z.string().ip(),
    userAgent: z.string().min(1),
    attemptedAt: z.date(),
    processingTimeMs: z.number().min(0) });
;
// ========================================
// Type Guards
// ========================================
export function isTOTPConfiguration(config) {
    return config.methodType === MFAMethodType.TOTP;
    export function isEmailConfiguration(config) {
        return config.methodType === MFAMethodType.EMAIL;
        export function isSMSConfiguration(config) {
            return config.methodType === MFAMethodType.SMS;
            // ========================================
            // Database Migration Helpers
            // ========================================
            export const MFA_DATABASE_TABLES = {
                MFA_CONFIGURATIONS: 'mfa_configurations',
                MFA_BACKUP_CODES: 'mfa_backup_codes',
                MFA_VERIFICATION_ATTEMPTS: 'mfa_verification_attempts',
                MFA_SESSIONS: 'mfa_sessions',
                MFA_RATE_LIMITS: 'mfa_rate_limits',
                MFA_SECURITY_EVENTS: 'mfa_security_events'
            };
            as;
            const ;
            // ========================================
            // Constants
            // ========================================
            export const MFA_CONSTANTS = { TOTP: {
                    SECRET_LENGTH: 32, // Bytes,
                    QR_CODE_EXPIRY: 300, // 5 minutes,
                    BACKUP_CODE_COUNT: 10, // Number of backup codes,
                    MAX_CLOCK_SKEW: 90 // Seconds }
                },
                EMAIL: {
                    TOKEN_EXPIRY: 600, // 10 minutes,
                    MAX_DAILY_SENDS: 5, // Per user per day,
                    RATE_LIMIT_WINDOW: 3600 // 1 hour }
                },
                SMS: {
                    CODE_EXPIRY: 300, // 5 minutes,
                    MAX_DAILY_SENDS: 3, // Per user per day,
                    CODE_LENGTH: 6 // Digits }
                },
                SECURITY: {
                    MAX_FAILED_ATTEMPTS: 5, // Before account lock,
                    LOCKOUT_DURATION: 900, // 15 minutes,
                    SESSION_DURATION: 3600 // 1 hour }
                    , // 1 hour }
                    as, const: ,
                    export: , default: { MFAMethodType,
                        MFAMethodStatus,
                        MFAVerificationResult,
                        TOTPConfigurationSchema,
                        EmailConfigurationSchema,
                        SMSConfigurationSchema,
                        MFAVerificationAttemptSchema,
                        isTOTPConfiguration,
                        isEmailConfiguration,
                        isSMSConfiguration,
                        MFA_DATABASE_TABLES },
                    MFA_CONSTANTS
                } };
        }
    }
}
