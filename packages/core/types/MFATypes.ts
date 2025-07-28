/**
 * MFA Data Models - Epic 19 Implementation
 * Comprehensive TypeScript types for Multi-Factor Authentication system
 */
import { z } from 'zod';

// ========================================
// Core MFA Types
// ========================================

export enum MFAMethodType {
  TOTP = 'totp',
  EMAIL = 'email',
  SMS = 'sms'
  export enum MFAMethodStatus {
  PENDING = 'pending',      // Enrollment started but not completed
  ACTIVE = 'active',        // Fully enrolled and active
  DISABLED = 'disabled',    // Temporarily disabled
  REVOKED = 'revoked'       // Permanently removed
  export enum MFAVerificationResult {
  SUCCESS = 'success',
  INVALID_CODE = 'invalid_code',
  EXPIRED = 'expired',
  RATE_LIMITED = 'rate_limited',
  METHOD_DISABLED = 'method_disabled',
  USER_LOCKED = 'user_locked'
  // ========================================
  // Base MFA Configuration
  // ========================================
  export interface BaseMFAConfiguration {
  id: string;,
  userId: string;
  methodType: MFAMethodType;,
  status: MFAMethodStatus;
  isPrimary: boolean;,
  displayName: string;
  createdAt: Date;,
  updatedAt: Date;
  lastUsedAt?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  // ========================================
  // TOTP Configuration
  // ========================================
}
export interface TOTPConfiguration extends BaseMFAConfiguration {
  methodType: MFAMethodType.TOTP;,
  encryptedSecret: string;       // AES-256 encrypted TOTP secret,
  algorithm: 'SHA1' | 'SHA256';  // HMAC algorithm,
  digits: 6 | 8;                 // Code length,
  period: 30;                    // Time step in seconds,
  qrCodeUrl?: string;            // Temporary QR code URL (enrollment only),
  qrCodeExpiresAt?: Date;        // QR code expiry (5 minutes),
  backupCodesGenerated: boolean; // Whether backup codes exist,
  export interface TOTPSecret {
  secret: string;          // Base32 encoded secret,
  qrCodeDataUrl: string;   // data: URL for QR code,
  manualEntryKey: string;  // Human-readable key for manual entry,
  issuer: string;          // "PromptScape",
  accountName: string;     // User identifier,
}
export interface TOTPEnrollmentData {
  configurationId: string;,
  secret: TOTPSecret;
  backupCodes: string;   // 10 recovery codes,
  expiresAt: Date;        // Enrollment must complete within 10 minutes,
  // ========================================
  // Email Configuration
  // ========================================
}
export interface EmailConfiguration extends BaseMFAConfiguration {
  methodType: MFAMethodType.EMAIL;,
  emailAddress: string;
  isVerified: boolean;
  verificationSentAt?: Date;
  verificationExpiresAt?: Date;
  export interface EmailVerification {
  id: string;,
  userId: string;
  emailAddress: string;,
  encryptedToken: string;     // AES-256 encrypted verification token,
  expiresAt: Date;           // 10 minute expiry,
  attempts: number;          // Failed verification attempts,
  metadata: {,
  ipAddress: string;,
  userAgent: string;
  location?: string;
  riskScore: number;       // 0-100 risk assessment,
};

// ========================================
// SMS Configuration
// ========================================
}
export interface SMSConfiguration extends BaseMFAConfiguration {
  methodType: MFAMethodType.SMS;,
  phoneNumber: string;       // E.164 format,
  countryCode: string;       // ISO country code,
  isVerified: boolean;
  carrierInfo?: {,
  carrier: string;,
  lineType: 'mobile' | 'landline' | 'voip';
  riskScore: number;       // 0-100 carrier risk assessment,
};

export interface SMSVerification {
  id: string;,
  userId: string;
  phoneNumber: string;,
  encryptedCode: string;     // AES-256 encrypted 6-digit code,
  expiresAt: Date;          // 5 minute expiry,
  attempts: number;         // Failed verification attempts,
  dailyCount: number;       // SMS sent today (rate limiting),
  metadata: {,
  ipAddress: string;,
  userAgent: string;
  carrierResponse?: string; // Gateway response,
  deliveryStatus?: 'sent' | 'delivered' | 'failed';
};

// ========================================
// Backup Codes
// ========================================
}
export interface BackupCode {
  id: string;,
  userId: string;
  codeHash: string;         // bcrypt hashed code,
  isUsed: boolean;
  usedAt?: Date;
  usedFrom?: {,
  ipAddress: string;,
  userAgent: string;
  location?: string;
};
  createdAt: Date;
}
export interface BackupCodeSet {
  userId: string;,
  codes: string;          // Plain text codes (only shown once),
  generatedAt: Date;,
  expiresAt: Date;          // Codes expire after 1 year,
  // ========================================
  // MFA Session & Verification
  // ========================================
}
export interface MFAChallenge {
  id: string;,
  userId: string;
  methodType: MFAMethodType;,
  challengeData: string;    // Method-specific challenge data,
  expiresAt: Date;,
  attempts: number;
  maxAttempts: number;,
  createdAt: Date;
}
export interface MFAVerificationAttempt {
  id: string;,
  userId: string;
  methodType: MFAMethodType;,
  success: boolean;
  result: MFAVerificationResult;,
  ipAddress: string;
  userAgent: string;,
  attemptedAt: Date;
  processingTimeMs: number;
  metadata?: {,
  codeLength?: number;
  timeSkew?: number;       // For TOTP,
  riskScore?: number;
};
}
export interface MFASession {
  id: string;,
  userId: string;
  isVerified: boolean;,
  verifiedMethods: MFAMethodType;
  expiresAt: Date;,
  createdAt: Date;
  lastVerifiedAt?: Date;
  ipAddress: string;,
  userAgent: string;
  // ========================================
  // Rate Limiting & Security
  // ========================================
}
export interface RateLimitRule {
  action: string;           // 'totp_verify', 'email_send', 'sms_send',
  userLimit: number;        // Per user limit,
  userWindow: number;       // Time window in seconds,
  ipLimit: number;          // Per IP limit,
  ipWindow: number;         // Time window in seconds,
  globalLimit: number;      // Global system limit,
  globalWindow: number;     // Time window in seconds,
}
export interface RateLimitState {
  userId?: string;
  ipAddress?: string;
  action: string;,
  count: number;
  windowStart: Date;
  blockedUntil?: Date;
}
export interface SecurityEvent {
  id: string;
  userId?: string;
  eventType: 'suspicious_activity' | 'rate_limit_exceeded' | 'brute_force' | 'geo_anomaly';,
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;,
  metadata: {,
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  methodType?: MFAMethodType;
  attemptCount?: number;
};
  createdAt: Date;,
  resolved: boolean;
  resolvedAt?: Date;

// ========================================
// User MFA Profile
// ========================================
}
export interface UserMFAProfile {
  userId: string;,
  isEnabled: boolean;
  hasAnyMethodConfigured: boolean;
  primaryMethod?: MFAMethodType;
  configuredMethods: MFAMethodType;
  lastUsed?: {,
  methodType: MFAMethodType;,
  timestamp: Date;
};
  securityMetrics: {,
  totalAttempts: number;
  successfulAttempts: number;,
  failedAttempts: number;
  lastFailedAttempt?: Date;
  accountLocked: boolean;
  lockedUntil?: Date;
};
  preferences: {,
  defaultMethod: MFAMethodType;
  backupMethodEnabled: boolean;,
  securityNotifications: boolean;
};

// ========================================
// Zod Validation Schemas
// ========================================
}
export const TOTPConfigurationSchema = z.object({)
  id: z.string().uuid(),
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
  lockedUntil: z.date().optional(),
});

export const EmailConfigurationSchema = z.object({)
  id: z.string().uuid(),
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
  lockedUntil: z.date().optional(),
});

export const SMSConfigurationSchema = z.object({)
  id: z.string().uuid(),
  userId: z.string().uuid(),
  methodType: z.literal(MFAMethodType.SMS),
  status: z.nativeEnum(MFAMethodStatus),
  isPrimary: z.boolean(),
  displayName: z.string().min(1).max(100),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164 format
  countryCode: z.string().length(2),
  isVerified: z.boolean(),
  failedAttempts: z.number().min(0).max(10),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastUsedAt: z.date().optional(),
  lockedUntil: z.date().optional();
  });

export const MFAVerificationAttemptSchema = z.object({)
  id: z.string().uuid(),
  userId: z.string().uuid(),
  methodType: z.nativeEnum(MFAMethodType),
  success: z.boolean(),
  result: z.nativeEnum(MFAVerificationResult),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  attemptedAt: z.date(),
  processingTimeMs: z.number().min(0),
});

// ========================================
// Type Guards
// ========================================

export function isTOTPConfiguration(config: BaseMFAConfiguration): config is TOTPConfiguration {
  return config.methodType === MFAMethodType.TOTP;
  export function isEmailConfiguration(config: BaseMFAConfiguration): config is EmailConfiguration {,
  return config.methodType === MFAMethodType.EMAIL;
  export function isSMSConfiguration(config: BaseMFAConfiguration): config is SMSConfiguration {,
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
  MFA_SECURITY_EVENTS: 'mfa_security_events',
} as const;

// ========================================
// API Request/Response Types
// ========================================

export interface MFAEnrollmentRequest {
  methodType: MFAMethodType;,
  displayName: string;
  emailAddress?: string;    // For email method,
  phoneNumber?: string;     // For SMS method,
}
export interface MFAEnrollmentResponse {
  configurationId: string;,
  methodType: MFAMethodType;
  enrollmentData?: TOTPEnrollmentData; // Only for TOTP,
  requiresVerification: boolean;,
  expiresAt: Date;
}
export interface MFAVerificationRequest {
  configurationId: string;,
  code: string;
  backupCode?: boolean;     // True if using backup code,
}
export interface MFAVerificationResponse {
  success: boolean;,
  result: MFAVerificationResult;
  remainingAttempts?: number;
  lockoutDuration?: number; // Seconds until unlock,
  nextMethodSuggested?: MFAMethodType;
}
export interface MFAListResponse {
  configurations: BaseMFAConfiguration;,
  profile: UserMFAProfile;
  availableBackupCodes: number;
  // ========================================
  // Constants
  // ========================================
}
export const MFA_CONSTANTS = {
  TOTP: {,
  SECRET_LENGTH: 32,        // Bytes,
  QR_CODE_EXPIRY: 300,     // 5 minutes,
  BACKUP_CODE_COUNT: 10,    // Number of backup codes,
  MAX_CLOCK_SKEW: 90      // Seconds,
},
  EMAIL: {,
  TOKEN_EXPIRY: 600,       // 10 minutes,
  MAX_DAILY_SENDS: 5,      // Per user per day,
  RATE_LIMIT_WINDOW: 3600 // 1 hour,
},
  SMS: {,
  CODE_EXPIRY: 300,        // 5 minutes,
  MAX_DAILY_SENDS: 3,      // Per user per day,
  CODE_LENGTH: 6          // Digits,
},
  SECURITY: {,
  MAX_FAILED_ATTEMPTS: 5,  // Before account lock,
  LOCKOUT_DURATION: 900,   // 15 minutes,
  SESSION_DURATION: 3600  // 1 hour,
} as const;

export default {
  MFAMethodType,
  MFAMethodStatus, 
  MFAVerificationResult,
  TOTPConfigurationSchema,
  EmailConfigurationSchema,
  SMSConfigurationSchema,
  MFAVerificationAttemptSchema,
  isTOTPConfiguration,
  isEmailConfiguration,
  isSMSConfiguration,
  MFA_DATABASE_TABLES,
  MFA_CONSTANTS
};