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
    CRITICAL = "critical",
    export,
    enum,
    SessionState
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
    securityFlags: {
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
    securityIssues: Array<{}, type>;
}
export interface ActivityPattern {
    userId: string;
    deviceId: string;
    pattern: {
        typicalHours: number;
        typicalDays: number;
        commonLocations: string;
        usualEndpoints: string;
        averageSessionDuration: number;
    };
    lastUpdated: Date;
    confidence: number;
}
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
    createSession(): any;
    userId: string;
    context: SessionContext;
    securityLevel: SessionSecurityLevel;
    mfaVerified: boolean;
    Promise(): void;
}
//# sourceMappingURL=SecureSessionManager.d.ts.map