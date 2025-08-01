/**
 * Session Priority Manager
 *
 * Comprehensive session priority and eviction management system for handling
 * session conflicts, priority-based session allocation, and intelligent eviction
 * policies when session limits are reached.
 *
 * Features:
 * - Priority-based session ranking and allocation
 * - Intelligent eviction policies (LRU, LFU, Priority-based, Hybrid)
 * - Session conflict detection and resolution
 * - Real-time session monitoring and metrics
 * - Customizable priority factors and weights
 * - Emergency session override capabilities
 * - Session lifecycle management
 */
import { EventEmitter } from 'events';
export declare enum SessionPriority {
    CRITICAL = "critical",// System admin, emergency access
    HIGH = "high",// Important business operations
    MEDIUM = "medium",// Regular user operations
    LOW = "low",// Background, non-critical operations
    MINIMAL = "minimal"

export declare enum EvictionPolicy {
    LRU = "lru",// Least Recently Used
    LFU = "lfu",// Least Frequently Used
    PRIORITY_BASED = "priority",// Based on session priority
    HYBRID = "hybrid",// Combination of factors
    FIFO = "fifo",// First In, First Out
    ACTIVITY_BASED = "activity"

export declare enum ConflictResolution {
    REJECT_NEW = "reject_new",// Reject new session
    EVICT_OLDEST = "evict_oldest",// Remove oldest session
    EVICT_LOWEST_PRIORITY = "evict_lowest",// Remove lowest priority
    PROMPT_USER = "prompt_user",// Ask user to choose
    MERGE_SESSIONS = "merge_sessions"

}
}
export interface SessionPriorityConfig { maxSessionsPerUser: number;
    maxSessionsPerDevice: number;
    maxTotalSessions: number;
    evictionPolicy: EvictionPolicy;
    conflictResolution: ConflictResolution;
    priorityWeights: {
        userRole: number;
        deviceTrust: number;
        location: number;
        timeOfDay: number;
        sessionAge: number;
        activityLevel: number;
        securityLevel: number }
}
    };
    emergencyOverride: boolean;
    gracePeriodMinutes: number;

}
}
export interface PriorityFactors { userRole: 'admin' | 'moderator' | 'user' | 'guest';
    deviceTrustLevel: number;
    locationFamiliarity: number;
    timeOfDayScore: number;
    sessionDuration: number;
    activityLevel: number;
    securityRequirement: number;
    businessCriticality: number }
}
}
export interface PrioritySessionData { sessionId: string;
    userId: string;
    deviceId: string;
    priority: SessionPriority;
    score: number;
    createdAt: Date;
    lastActivity: Date;
    accessCount: number;
    factors: PriorityFactors;
    conflicts: string[];
    evictionProtection: boolean;
    emergencySession: boolean;
    gracePeriodEnd?: Date }
}
}
export interface EvictionDecision { sessionId: string;
    reason: string;
    evictionPolicy: EvictionPolicy;
    confidence: number;
    alternativeSessions: string[];
    gracePeriodOffered: boolean;
    userNotificationRequired: boolean }
}
}
export interface SessionConflict { id: string;
    type: 'user_limit' | 'device_limit' | 'total_limit' | 'resource_contention';
    affectedSessions: string[];
    newSessionRequest: {
        userId: string;
        deviceId: string;
        priority: SessionPriority;
        factors: PriorityFactors }
}
    };
    resolutionOptions: ConflictResolution[];
    recommendedResolution: ConflictResolution;
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoResolvable: boolean;
    timeoutMinutes: number;

}
}
export interface PriorityMetrics { totalSessions: number;
    sessionsByPriority: Record<SessionPriority, number>;
    evictionRate: number;
    conflictRate: number;
    averageSessionScore: number;
    utilizationPercentage: number;
    topEvictionReasons: Array<{
        reason: string;
        count: number }
}
    }>;
    emergencyOverrides: number;
    gracePeriodUsage: number;
/**
 * Comprehensive session priority and eviction management service
 */
export declare class SessionPriorityManager extends EventEmitter { private sessions;
    private userSessions;
    private deviceSessions;
    private conflicts;
    private evictionHistory;
    private config;
    private monitoringTimer?;
    constructor(config?: Partial<SessionPriorityConfig>);
    /**
     * Register a new session with priority management
     */
    registerSession();
      sessionId: string
      userId: string
      deviceId: string
      priority: SessionPriority
      factors: PriorityFactors }
    ): { allowed: boolean;
        conflicts?: SessionConflict[];
        evicted?: string[] };
    /**
     * Update session activity and recalculate priority
     */
    updateSessionActivity(sessionId: string, activityLevel: number, newFactors?: Partial<PriorityFactors>): void;
    /**
     * Detect conflicts for a new session request
     */
    detectConflicts(userId: string, deviceId: string, priority: SessionPriority): SessionConflict[];
    /**
     * Resolve a session conflict
     */
    resolveConflict(conflict: SessionConflict): { resolved: boolean;
        evicted?: string[];
        gracePeriod?: number };
    /**
     * Force evict a session with specified reason
     */
    evictSession(sessionId: string, reason: string, gracePeriodMinutes?: number): boolean;
    /**
     * Create emergency override session
     */
    createEmergencySession(sessionId: string, userId: string, deviceId: string, factors: PriorityFactors): { created: boolean;
        evicted?: string[] };
    /**
     * Get session priority ranking
     */
    getSessionRanking(): PrioritySessionData[];
    /**
     * Get priority metrics and statistics
     */
    getMetrics(): PriorityMetrics;
    /**
     * Get sessions for a specific user
     */
    getUserSessions(userId: string): PrioritySessionData[];
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SessionPriorityConfig>): void;
    private mergeConfig;
    private calculatePriorityScore;
    private getRoleScore;
    private getAgeScore;
    private getPriorityWeight;
    private createConflict;
    private canAutoResolve;
    private applyEvictionPolicy;
    private calculateHybridScore;
    private evictOldestSession;
    private evictLowestPrioritySession;
    private offerUserChoice;
    private updateUserSessions;
    private updateDeviceSessions;
    private removeSession;
    private startMonitoring;
    private performMaintenanceTasks;
    /**
     * Destroy the priority manager and clean up resources
     */
    destroy(): void;

export declare const sessionPriorityManager: SessionPriorityManager;
export default SessionPriorityManager;
//# sourceMappingURL=SessionPriorityManager.d.ts.map