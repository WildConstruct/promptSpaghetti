/**
 * Secure Session Manager
 *
 * Comprehensive session management system providing secure session handling
 * with proper encryption, rotation, and security controls for MFA systems.
 *
 * Features:
 * - Encrypted session tokens with secure random generation
 * - Automatic session rotation and expiry management
 * - Session hijacking detection and prevention
 * - Multi-device session management
 * - Secure session storage with Redis backend
 * - Session activity tracking and anomaly detection
 * - CSRF protection and secure cookie handling
 * - Emergency session termination capabilities
 */
import { EventEmitter } from 'events';
export declare enum SessionSecurityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum SessionState {
    ACTIVE = "active",
    EXPIRED = "expired",
    REVOKED = "revoked",
    SUSPENDED = "suspended",
    LOCKED = "locked"
}
export declare enum SessionTerminationReason {
    MANUAL_LOGOUT = "manual_logout",
    TIMEOUT = "timeout",
    SECURITY_VIOLATION = "security_violation",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    ADMIN_TERMINATION = "admin_termination",
    DEVICE_LOST = "device_lost",
    PASSWORD_CHANGE = "password_change",
    MFA_CHANGE = "mfa_change"
}
export interface SessionConfiguration {
    maxAge: number;
    rotationInterval: number;
    securityLevel: SessionSecurityLevel;
    allowMultipleDevices: boolean;
    maxConcurrentSessions: number;
    requireReauthentication: boolean;
    reauthenticationInterval: number;
    enableActivityTracking: boolean;
    enableAnomalyDetection: boolean;
    encryptionSettings: {,
        algorithm: string;
        keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
        iterations: number;
        saltLength: number;
    };
}
export interface SecureSession {
    id: string;
    userId: string;
    deviceId: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    state: SessionState;
    securityLevel: SessionSecurityLevel;
    ipAddress: string;
    userAgent: string;
    fingerprint: string;
    encryptedToken: string;
    tokenHash: string;
    refreshToken?: string;
    csrfToken: string;
    mfaVerified: boolean;
    mfaExpiresAt?: Date;
    metadata: {,
        deviceInfo: {,
            type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
            os: string;
            browser: string;
            version: string;
        };
        location: {,
            country?: string;
            region?: string;
            city?: string;
            coordinates?: {
                lat: number;
                lon: number;
            };
        };
        security: {,
            isVpn: boolean;
            isProxy: boolean;
            riskScore: number;
            trustLevel: 'low' | 'medium' | 'high';
        };
    };
    activities: Array<{,
        timestamp: Date;
        action: string;
        endpoint: string;
        riskScore: number;
        anomalyDetected: boolean;
    }>;
    rotationHistory: Array<{,
        timestamp: Date;
        oldTokenHash: string;
        newTokenHash: string;
        reason: string;
    }>;
}
export interface SessionContext {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    requestHeaders: Record<string, string>;
    geolocation?: {
        country: string;
        region: string;
        city: string;
    };
    securityFlags: {,
        isSuspiciousLocation: boolean;
        isNewDevice: boolean;
        hasVpn: boolean;
        hasProxy: boolean;
    };
}
export interface SessionValidationResult {
    isValid: boolean;
    session?: SecureSession;
    requiresRotation: boolean;
    requiresReauthentication: boolean;
    securityIssues: Array<{,
        type: 'warning' | 'critical';
        description: string;
        recommendation: string;
    }>;
    anomalies: Array<{,
        type: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
        confidence: number;
    }>;
}
export interface ActivityPattern {
    userId: string;
    deviceId: string;
    pattern: {,
        typicalHours: number[];
        typicalDays: number[];
        commonLocations: string[];
        usualEndpoints: string[];
        averageSessionDuration: number;
    };
    lastUpdated: Date;
    confidence: number;
}
/**
 * Comprehensive secure session management service
 */
export declare class SecureSessionManager extends EventEmitter {
    private sessions;
    private userSessions;
    private deviceSessions;
    private activityPatterns;
    private sessionConfigs;
    private encryptionKey;
    private rotationTimer?;
    constructor(masterKey?: Buffer);
    /**
     * Create a new secure session
     */
    createSession();
      userId: string,
      context: SessionContext,
      securityLevel?: SessionSecurityLevel,
      mfaVerified?: boolean
    ): Promise<{
        session: SecureSession;
        token: string;
    }>;
    /**
     * Validate and refresh session
     */
    validateSession(sessionId: string, token: string, context: SessionContext): Promise<SessionValidationResult>;
    /**
     * Rotate session token
     */
    rotateSession(sessionId: string): Promise<string | null>;
    /**
     * Terminate session
     */
    terminateSession(sessionId: string, reason: SessionTerminationReason, terminatedBy?: string): Promise<boolean>;
    /**
     * Terminate all sessions for a user
     */
    terminateAllUserSessions();
      userId: string,
      reason: SessionTerminationReason,
      excludeSessionId?: string
    ): Promise<number>;
    /**
     * Get session information
     */
    getSession(sessionId: string): SecureSession | null;
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): SecureSession[];
    /**
     * Get session statistics
     */
    getSessionStatistics(): {
        total: number;
        active: number;
        expired: number;
        revoked: number;
        bySecurityLevel: Record<SessionSecurityLevel, number>;
        byDevice: Record<string, number>;
        averageSessionDuration: number;
    };
    private generateSecureToken;
    private generateCSRFToken;
    private generateDeviceId;
    private encryptToken;
    private hashToken;
    private parseDeviceInfo;
    private calculateRiskScore;
    private calculateTrustLevel;
    private validateSessionContext;
    private recordActivity;
    private updateActivityPattern;
    private enforceConcurrentSessionLimits;
    private initializeSessionConfigurations;
    private startSessionRotation;
    private performAutomaticRotation;
    private startAnomalyDetection;
    private detectAnomalies;
    /**
     * Clean up expired sessions
     */
    cleanup(): void;
    /**
     * Destroy the session manager and clean up resources
     */
    destroy(): void;
}
export declare const secureSessionManager: SecureSessionManager;
export default SecureSessionManager;
//# sourceMappingURL=SecureSessionManager.d.ts.map