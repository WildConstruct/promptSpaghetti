/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Session Timeout Controller
 *
 * Advanced session timeout management system providing fine-grained control
 * over session expiration, warnings, extensions, and automatic cleanup.
 *
 * Features:
 * - Configurable timeout policies per user/role/device
 * - Progressive timeout warnings
 * - Automatic session extension based on activity
 * - Grace periods for critical operations
 * - Idle detection and smart timeout adjustment
 * - Emergency timeout override
 * - Session timeout analytics and reporting
 */
import { EventEmitter } from 'events';
export declare enum TimeoutPolicy { STRICT = "strict",
    FLEXIBLE = "flexible",
    ADAPTIVE = "adaptive",
    PROGRESSIVE = "progressive"

export declare enum TimeoutReason {
    IDLE = "idle",
    ABSOLUTE = "absolute",
    SECURITY = "security",
    MANUAL = "manual",
    POLICY = "policy",
    EMERGENCY = "emergency"

export declare enum ActivityLevel {
    NONE = "none",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high" }
    CRITICAL = "critical"

}
}
export interface TimeoutConfiguration { sessionId: string;
    policy: TimeoutPolicy;
    idleTimeout: number;
    absoluteTimeout: number;
    warningThresholds: number[];
    gracePeriod: number;
    criticalOperationGrace: number;
    maxExtensions: number;
    extensionDuration: number;
    automaticExtension: boolean;
    adaptiveEnabled: boolean;
    activityThreshold: number;
    learningEnabled: boolean;
    maxAbsoluteTime: number;
    securityLevelOverride?: number;
    deviceTrustFactor: number;
    locationTrustFactor: number }
}
}
export interface ActivityData { timestamp: Date;
    type: 'mouse' | 'keyboard' | 'touch' | 'api' | 'navigation' | 'interaction';
    intensity: ActivityLevel;
    endpoint?: string;
    duration?: number;
    metadata?: Record<string, any> }
}
}
export interface SessionTimeoutState { sessionId: string;
    configuration: TimeoutConfiguration;
    isActive: boolean;
    lastActivity: Date;
    sessionStart: Date;
    currentTimeout: Date;
    warningsIssued: number[];
    extensionsUsed: number;
    gracePeriodActive: boolean;
    criticalOperationActive: boolean;
    remainingTime: number;
    nextWarning?: Date;
    adaptedTimeout?: number;
    recentActivities: ActivityData[];
    activityScore: number;
    activityPattern: {
        peakHours: number[];
        averageSessionLength: number;
        typicalActivityLevel: ActivityLevel }
}
    };
    status: 'active' | 'warning' | 'grace' | 'expired' | 'extended';
    timeoutReason?: TimeoutReason;

}
}
export interface TimeoutEvent { sessionId: string;
    eventType: 'warning' | 'timeout' | 'extension' | 'renewal';
    timestamp: Date;
    remainingTime: number;
    reason: TimeoutReason;
    userNotified: boolean;
    actionRequired: boolean;
    metadata?: Record<string, any>;
/**
 * Comprehensive session timeout management service
 */
export declare class SessionTimeoutController extends EventEmitter {
    private sessionStates;
    private timeoutTimers;
    private warningTimers;
    private activityBuffer;
    private cleanupTimer?;
    constructor();
    /**
     * Initialize timeout control for a session
     */
    initializeSession(sessionId: string, configuration: Partial<TimeoutConfiguration>): SessionTimeoutState;
    /**
     * Record user activity
     */
    recordActivity(sessionId: string, activity: Omit<ActivityData, 'timestamp'>): void;
    /**
     * Extend session timeout
     */
    extendSession(sessionId: string, reason?: 'manual' | 'activity' | 'critical' | 'grace'): boolean;
    /**
     * Start critical operation (extends grace period)
     */
    startCriticalOperation(sessionId: string, operationType: string): boolean;
    /**
     * End critical operation
     */
    endCriticalOperation(sessionId: string): void;
    /**
     * Get session timeout state
     */
    getSessionState(sessionId: string): SessionTimeoutState | null;
    /**
     * Get all active sessions
     */
    getActiveSessions(): SessionTimeoutState[];
    /**
     * Force timeout a session
     */
    forceTimeout(sessionId: string, reason?: TimeoutReason): boolean;
    /**
     * Suspend timeout for emergency situations
     */
    suspendTimeout(sessionId: string, duration: number): boolean;
    /**
     * Get timeout statistics
     */
    getTimeoutStatistics(): {
        totalSessions: number;
        activeSessions: number;
        timeoutEvents: number;
        averageSessionLength: number;
        extensionUsage: number;
        timeoutReasons: Record<TimeoutReason, number>;
        policyDistribution: Record<TimeoutPolicy, number> }
}
    };
    private shouldExtendSession;
    private calculateActivityScore;
    private scheduleTimeout;
    private scheduleTimeoutWarnings;
    private issueTimeoutWarning;
    private handleSessionTimeout;
    private activateGracePeriod;
    private resetTimeout;
    private calculateAdaptiveTimeout;
    private clearTimers;
    private startCleanupTimer;
    private cleanupExpiredSessions;
    /**
     * Destroy the timeout controller and clean up resources
     */
    destroy(): void;

export declare const sessionTimeoutController: SessionTimeoutController;
export default SessionTimeoutController;
//# sourceMappingURL=SessionTimeoutController.d.ts.map