/**
 * MFA Management Hook
 *
 * Custom React hook for managing multi-factor authentication state and operations.
 * Provides a clean API for components to interact with MFA services and state.
 *
 * Features:
 * - MFA method management (enable/disable/configure)
 * - Backup codes generation and management
 * - Trusted device management
 * - Security event tracking
 * - Real-time status updates
 * - Error handling and loading states
 */

}
export interface MFAMethod {
    id: string;
    type: 'totp' | 'sms' | 'email' | 'backup_codes';
    name: string;
    enabled: boolean;
    primary: boolean;
    configuredAt: Date;
    lastUsed?: Date;
    configuration?: {
        phoneNumber?: string;
        email?: string;
        appName?: string;
        secretKey?: string;
}
    };

}
export interface BackupCode {
    id: string;
    code: string;
    used: boolean;
    usedAt?: Date;

}
export interface TrustedDevice {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    location: string;
    addedAt: Date;
    lastAccess: Date;
    current: boolean;

}
export interface SecurityEvent {
    id: string;
    type: 'login' | 'mfa_enabled' | 'mfa_disabled' | 'device_added' | 'device_removed' | 'backup_used';
    description: string;
    timestamp: Date;
    ipAddress: string;
    location: string;
    riskLevel: 'low' | 'medium' | 'high';

}
export interface MFASettings {
    requireMFA: boolean;
    allowBackupCodes: boolean;
    trustedDeviceExpiry: number;
    maxTrustedDevices: number;
    sessionTimeout: number;
    emailNotifications: boolean;
    smsNotifications: boolean;

}
export interface MFAStatus {
    enabled: boolean;
    methodsConfigured: number;
    primaryMethod?: string;
    backupCodesRemaining: number;
    trustedDevicesCount: number;
    lastSecurityEvent?: SecurityEvent;

}
export interface UseMFAManagementOptions {
    userId: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
    onStatusChange?: (status: MFAStatus) => void;
    onSecurityEvent?: (event: SecurityEvent) => void;
    onError?: (error: Error) => void;
    enableRetryHandling?: boolean;
    maxRetryAttempts?: number;
    retryTimeoutMs?: number;

}
export interface UseMFAManagementReturn {
    mfaMethods: MFAMethod[];
    backupCodes: BackupCode[];
    trustedDevices: TrustedDevice[];
    securityEvents: SecurityEvent[];
    settings: MFASettings;
    status: MFAStatus;
    loading: boolean;
    error: Error | null;
    retryCount: number;
    isRetrying: boolean;
    lastRetryError: Error | null;
    operationTimeout: boolean;
    enableMethod: (methodId: string) => Promise<void>;
    disableMethod: (methodId: string) => Promise<void>;
    setupTOTP: (userId: string) => Promise<{,
        secret: string;
        qrCode: string;
}
    }>;
    setupSMS: (phoneNumber: string) => Promise<void>;
    setupEmail: (email: string) => Promise<void>;
    removeMethod: (methodId: string) => Promise<void>;
    setPrimaryMethod: (methodId: string) => Promise<void>;
    generateBackupCodes: () => Promise<BackupCode[]>;
    downloadBackupCodes: () => void;
    markBackupCodeUsed: (codeId: string) => Promise<void>;
    addTrustedDevice: (device: Omit<TrustedDevice, 'id' | 'addedAt'>) => Promise<void>;
    removeTrustedDevice: (deviceId: string) => Promise<void>;
    refreshDeviceAccess: (deviceId: string) => Promise<void>;
    updateSettings: (newSettings: Partial<MFASettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
    getSecurityEvents: (limit?: number, offset?: number) => Promise<SecurityEvent[]>;
    clearSecurityEvents: () => Promise<void>;
    validateMFACode: (code: string, methodType: string) => Promise<boolean>;
    testNotifications: () => Promise<void>;
    exportSecurityData: () => Promise<Blob>;
    refresh: () => Promise<void>;

export declare const useMFAManagement: (options: UseMFAManagementOptions) => UseMFAManagementReturn;
export default useMFAManagement;
//# sourceMappingURL=useMFAManagement.d.ts.map