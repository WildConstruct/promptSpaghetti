/**
 * MFA Types for Frontend - Epic 19 Implementation
 * Client-side TypeScript types for Multi-Factor Authentication
 */

// Re-export core types from the main package
export enum MFAMethodType {
  TOTP = 'totp',
  EMAIL = 'email',
  SMS = 'sms'
}

export enum MFAMethodStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISABLED = 'disabled',
  REVOKED = 'revoked'
}

export enum MFAVerificationResult {
  SUCCESS = 'success',
  INVALID_CODE = 'invalid_code',
  EXPIRED = 'expired',
  RATE_LIMITED = 'rate_limited',
  METHOD_DISABLED = 'method_disabled',
  USER_LOCKED = 'user_locked'
}

// Frontend-specific interfaces
export interface BaseMFAConfiguration {
  id: string;
  userId: string;
  methodType: MFAMethodType;
  status: MFAMethodStatus;
  isPrimary: boolean;
  displayName: string;
  createdAt: string; // ISO string for frontend
  updatedAt: string;
  lastUsedAt?: string;
  failedAttempts: number;
  lockedUntil?: string;
}

export interface TOTPSecret {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  issuer: string;
  accountName: string;
}

export interface TOTPEnrollmentData {
  configurationId: string;
  secret: TOTPSecret;
  backupCodes: string[];
  expiresAt: string; // ISO string
}

export interface MFAEnrollmentRequest {
  methodType: MFAMethodType;
  displayName: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface MFAEnrollmentResponse {
  configurationId: string;
  methodType: MFAMethodType;
  enrollmentData?: TOTPEnrollmentData;
  requiresVerification: boolean;
  expiresAt: string;
}

export interface MFAVerificationRequest {
  configurationId: string;
  code: string;
  backupCode?: boolean;
}

export interface MFAVerificationResponse {
  success: boolean;
  result: MFAVerificationResult;
  remainingAttempts?: number;
  lockoutDuration?: number;
  nextMethodSuggested?: MFAMethodType;
}

export interface UserMFAProfile {
  userId: string;
  isEnabled: boolean;
  hasAnyMethodConfigured: boolean;
  primaryMethod?: MFAMethodType;
  configuredMethods: MFAMethodType[];
  lastUsed?: {
    methodType: MFAMethodType;
    timestamp: string;
  };
  securityMetrics: {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    lastFailedAttempt?: string;
    accountLocked: boolean;
    lockedUntil?: string;
  };
  preferences: {
    defaultMethod: MFAMethodType;
    backupMethodEnabled: boolean;
    securityNotifications: boolean;
  };
}

export interface MFAListResponse {
  configurations: BaseMFAConfiguration[];
  profile: UserMFAProfile;
  availableBackupCodes: number;
}