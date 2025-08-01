/**
 * Trusted Device Manager Service
 *
 * Manages trusted devices for users, allowing them to bypass MFA on recognized devices.
 * Integrates with DeviceFingerprintingService for device identification and risk assessment.
 *
 * Features:
 * - Register and manage trusted devices
 * - Automatic device expiration and renewal
 * - Risk-based trust decisions
 * - Device verification workflows
 * - Trust revocation capabilities
 * - Device history and audit trails
 * - Geolocation-based validation
 * - Anomaly detection for device changes
 */
import { EventEmitter } from 'events';
import { DeviceFingerprintingService,
  DeviceFingerprint,
  LocationData,
  RiskLevel }
  FingerprintContext
} from './DeviceFingerprintingService';
export declare enum TrustStatus { TRUSTED = "trusted",
    PENDING = "pending",
    EXPIRED = "expired",
    REVOKED = "revoked",
    SUSPICIOUS = "suspicious"

export declare enum VerificationMethod {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    MFA = "mfa" }
    ADMIN = "admin"

export declare enum TrustLevel {
    FULL = "full",// Complete trust, bypass all MFA
    PARTIAL = "partial",// Bypass some MFA, still require for sensitive operations
    LIMITED = "limited",// Only remember device, still require MFA
    NONE = "none"

}
}
export interface TrustedDevice { id: string;
    userId: string;
    deviceId: string;
    fingerprintId: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet' | 'other';
    browser: string;
    platform: string;
    trustStatus: TrustStatus;
    trustLevel: TrustLevel;
    trustScore: number;
    verificationMethod: VerificationMethod;
    verifiedAt: Date;
    verificationToken?: string;
    createdAt: Date;
    lastUsed: Date;
    lastVerified: Date;
    expiresAt: Date;
    revokedAt?: Date;
    primaryLocation?: LocationData;
    lastLocation?: LocationData;
    riskLevel: RiskLevel;
    riskFactors: string[];
    loginCount: number;
    failedAttempts: number;
    suspiciousActivities: number;
    settings: {
        requireLocationCheck: boolean;
        allowRoaming: boolean;
        maxLocationRadius: number;
        notifyOnNewLogin: boolean;
        autoRenew: boolean;
        requirePeriodicVerification: boolean;
        verificationIntervalDays: number }
}
    };
    metadata: Record<string, any>;

}
}
export interface DeviceVerificationRequest { userId: string;
    deviceFingerprint: DeviceFingerprint;
    location: LocationData;
    verificationMethod: VerificationMethod;
    challenge?: string;
    metadata?: Record<string, any> }
}
}
export interface TrustDecision { trusted: boolean;
    device?: TrustedDevice;
    reason: string;
    riskScore: number;
    requiresVerification: boolean;
    verificationMethods?: VerificationMethod[];
    factors: {
        deviceMatch: boolean;
        locationMatch: boolean;
        riskAcceptable: boolean;
        notExpired: boolean;
        notRevoked: boolean;
        recentlyVerified: boolean }
}
    };

}
}
export interface TrustedDeviceConfig { maxDevicesPerUser: number;
    defaultTrustDurationDays: number;
    defaultVerificationIntervalDays: number;
    maxLocationRadiusKm: number;
    requireLocationCheck: boolean;
    allowRoaming: boolean;
    autoExpireInactiveDays: number;
    riskThreshold: {
        full: number;
        partial: number;
        deny: number }
}
    };
    verificationMethods: VerificationMethod[];
    enableAnomalyDetection: boolean;
    enableAutoRenewal: boolean;
/**
 * Trusted Device Manager Service
 */
export declare class TrustedDeviceManager extends EventEmitter {
    private fingerprintService;
    private config;
    private trustedDevices;
    private deviceLookup;
    private verificationTokens;
    constructor(fingerprintService: DeviceFingerprintingService, config?: TrustedDeviceConfig);
    /**
     * Check if a device is trusted for a user
     */
    checkDeviceTrust(userId: string, context: FingerprintContext, location?: LocationData): Promise<TrustDecision>;
    /**
     * Register a new trusted device
     */
    registerTrustedDevice(request: DeviceVerificationRequest): Promise<TrustedDevice>;
    /**
     * Verify a pending device
     */
    verifyDevice(verificationToken: string): Promise<TrustedDevice>;
    /**
     * Revoke device trust
     */
    revokeDevice(deviceId: string, reason: string): Promise<void>;
    /**
     * Get user's trusted devices
     */
    getUserDevices(userId: string): TrustedDevice[];
    /**
     * Update device settings
     */
    updateDeviceSettings(deviceId: string, settings: Partial<TrustedDevice['settings']>): TrustedDevice;
    /**
     * Rename a trusted device
     */
    renameDevice(deviceId: string, newName: string): TrustedDevice;
    private findMatchingDevice;
    private evaluateTrustFactors;
    private makeTrustDecision;
    private calculateFingerprintSimilarity;
    private calculateDistance;
    private isLocationTrusted;
    private isRecentlyVerified;
    private generateDeviceId;
    private generateVerificationToken;
    private generateDeviceName;
    private detectDeviceType;
    private startMaintenanceTimer;
    private performMaintenance;
    private shouldAutoRenew;

export default TrustedDeviceManager;
//# sourceMappingURL=TrustedDeviceManager.d.ts.map