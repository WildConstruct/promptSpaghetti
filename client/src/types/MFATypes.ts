/**
 * MFA Types for Frontend - Epic 19 Implementation
 * Client-side TypeScript types for Multi-Factor Authentication
 */

// Re-export core types from the main package
export type MFAMethodType = 
  | 'totp'
  | 'email'
  | 'sms';

// Legacy enum values for backwards compatibility
export const MFAMethodType = {
  TOTP: 'totp' as const,
  EMAIL: 'email' as const,
  SMS: 'sms' as const,
} as const;

export type MFAMethodStatus = 
  | 'pending'
  | 'active'
  | 'disabled'
  | 'revoked';

// Legacy enum values for backwards compatibility
export const MFAMethodStatus = {
  PENDING: 'pending' as const,
  ACTIVE: 'active' as const,
  DISABLED: 'disabled' as const,
  REVOKED: 'revoked' as const,
} as const;

export type MFAVerificationResult = 
  | 'success'
  | 'invalid_code'
  | 'expired'
  | 'rate_limited'
  | 'method_disabled'
  | 'user_locked';

// Legacy enum values for backwards compatibility
export const MFAVerificationResult = {
  SUCCESS: 'success' as const,
  INVALID_CODE: 'invalid_code' as const,
  EXPIRED: 'expired' as const,
  RATE_LIMITED: 'rate_limited' as const,
  METHOD_DISABLED: 'method_disabled' as const,
  USER_LOCKED: 'user_locked' as const,
} as const;

// Frontend-specific interfaces

}
export interface BaseMFAConfiguration {
  id: string;,
  userId: string;
  methodType: MFAMethodType;,
  status: MFAMethodStatus;
  isPrimary: boolean;,
  displayName: string;
  createdAt: string; // ISO string for frontend,
  updatedAt: string;
  lastUsedAt?: string;
  failedAttempts: number;
  lockedUntil?: string;
}
}
}
export interface TOTPSecret {
  secret: string;,
  qrCodeDataUrl: string;
  manualEntryKey: string;,
  issuer: string;
  accountName: string;
}
}
}
export interface TOTPEnrollmentData {
  configurationId: string;,
  secret: TOTPSecret;
  backupCodes: string;,
  expiresAt: string; // ISO string,
}
}
}
export interface MFAEnrollmentRequest {
  methodType: MFAMethodType;,
  displayName: string;
  emailAddress?: string;
  phoneNumber?: string;
}
}
}
export interface MFAEnrollmentResponse {
  configurationId: string;,
  methodType: MFAMethodType;
  enrollmentData?: TOTPEnrollmentData;
  requiresVerification: boolean;,
  expiresAt: string;
}
}
}
export interface MFAVerificationRequest {
  configurationId: string;,
  code: string;
  backupCode?: boolean;
}
}
}
export interface MFAVerificationResponse {
  success: boolean;,
  result: MFAVerificationResult;
  remainingAttempts?: number;
  lockoutDuration?: number;
  nextMethodSuggested?: MFAMethodType;
}
}
}
export interface UserMFAProfile {
  userId: string;,
  isEnabled: boolean;
  hasAnyMethodConfigured: boolean;
  primaryMethod?: MFAMethodType;
  configuredMethods: MFAMethodType;
  lastUsed?: {
  methodType: MFAMethodType;,
  timestamp: string;
}
};
  securityMetrics: {
  totalAttempts: number;
  successfulAttempts: number;,
  failedAttempts: number;
  lastFailedAttempt?: string;
  accountLocked: boolean;
  lockedUntil?: string;
};
  preferences: {
  defaultMethod: MFAMethodType;
  backupMethodEnabled: boolean;,
  securityNotifications: boolean;
};
}
}
export interface MFAListResponse {
  configurations: BaseMFAConfiguration;,
  profile: UserMFAProfile;
  availableBackupCodes: number;
}
}