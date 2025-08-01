/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 31.4.2 - User Behavior Modeling and Anomaly Detection
 *
 * Implements advanced user behavior analytics to detect anomalous patterns
 * and potential security threats through machine learning algorithms.
 * Integrates with Epic 1 analytics infrastructure and Epic 17 user management.
 *
 * Task: E31-1753313263588-A09495
 */
import { EventEmitter } from 'events';

}
}
export interface UserBehaviorEvent { id: string;
    userId: string;
    sessionId: string;
    timestamp: Date;
    actionType: UserActionType;
    resource: string;
    metadata: Record<string, unknown>;
    sourceIP: string;
    userAgent: string;
    geolocation?: GeolocationData;
    success: boolean;
    duration?: number;
    dataVolumeBytes?: number;

export declare enum UserActionType {
    LOGIN = "login";
    LOGOUT = "logout";
    FILE_ACCESS = "file_access";
    FILE_DOWNLOAD = "file_download";
    FILE_UPLOAD = "file_upload";
    API_CALL = "api_call";
    PERMISSION_REQUEST = "permission_request";
    CONFIGURATION_CHANGE = "configuration_change";
    DATA_EXPORT = "data_export";
    ADMIN_ACTION = "admin_action";
    SEARCH_QUERY = "search_query" }
    NAVIGATION = "navigation"

}
}
}
export interface GeolocationData { country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string }
}
}
export interface UserBehaviorProfile { userId: string;
    createdAt: Date;
    lastUpdated: Date;
    totalEvents: number;
    typicalLoginTimes: number[];
    typicalDaysOfWeek: number[];
    averageSessionDuration: number;
    typicalLoginFrequency: number;
    commonLocations: GeolocationData[];
    travelPatterns: TravelPattern[];
    suspiciousLocationThreshold: number;
    commonResources: ResourceAccess[];
    typicalActionDistribution: Record<UserActionType, number>;
    peakActivityHours: number[];
    failureRate: number;
    riskyBehaviorScore: number;
    privilegedAccessFrequency: number;
    commonUserAgents: string[];
    typicalDeviceCount: number;
    ipAddressStability: number;
    baselineRiskScore: number;
    anomalyThreshold: number;
    adaptationRate: number }
}
}
export interface TravelPattern { fromLocation: GeolocationData;
    toLocation: GeolocationData;
    frequency: number;
    typicalDuration: number;
    lastOccurrence: Date }
}
}
export interface ResourceAccess { resource: string;
    accessCount: number;
    averageAccessTime: number;
    typicalAccessPattern: number[];
    lastAccessed: Date;
    riskScore: number }
}
}
export interface BehaviorAnomaly { id: string;
    userId: string;
    detectedAt: Date;
    anomalyType: AnomalyType;
    severity: AnomalySeverity;
    confidence: number;
    description: string;
    triggeringEvents: UserBehaviorEvent[];
    deviationScore: number;
    baselineValue: number;
    observedValue: number;
    riskAssessment: RiskAssessment;
    recommendedActions: string[];
    isResolved: boolean;
    resolvedAt?: Date;
    falsePositive?: boolean;

export declare enum AnomalyType {
    UNUSUAL_LOGIN_TIME = "unusual_login_time";
    UNUSUAL_LOCATION = "unusual_location";
    EXCESSIVE_ACCESS_VOLUME = "excessive_access_volume";
    UNUSUAL_RESOURCE_ACCESS = "unusual_resource_access";
    RAPID_PERMISSION_ESCALATION = "rapid_permission_escalation";
    SUSPICIOUS_DATA_EXPORT = "suspicious_data_export";
    ABNORMAL_SESSION_DURATION = "abnormal_session_duration";
    UNUSUAL_DEVICE_USAGE = "unusual_device_usage";
    ATYPICAL_NAVIGATION_PATTERN = "atypical_navigation_pattern";
    BULK_DATA_ACCESS = "bulk_data_access";
    OFF_HOURS_ACTIVITY = "off_hours_activity";
    IMPOSSIBLE_TRAVEL = "impossible_travel"

export declare enum AnomalySeverity {
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface RiskAssessment { overallRisk: number;
    businessImpact: number;
    probabilityOfThreat: number;
    potentialDamage: string[];
    mitigationUrgency: 'low' | 'medium' | 'high' | 'immediate' }
}
}
export interface BehaviorAnalyticsConfig {
    profileUpdateInterval: number;
    anomalyDetectionSensitivity: number;
    baselineTrainingPeriod: number;
    maxProfileAge: number;
    enableRealTimeDetection: boolean;
    enableGeolocationTracking: boolean;
    minEventsForProfile: number;
    adaptiveThresholding: boolean;

export declare class UserBehaviorAnalytics extends EventEmitter {
    private userProfiles;
    private recentEvents;
    private detectedAnomalies;
    private config;
    private analysisInterval?;
    private isAnalyzing;
    constructor(config?: Partial<BehaviorAnalyticsConfig>);
    /**
     * Process incoming user behavior event
     */
    processUserEvent(event: UserBehaviorEvent): Promise<void>;
    /**
     * Update user behavioral profile based on new event
     */
    private updateUserProfile;
    private createNewProfile;
    private updateTemporalPatterns;
    private updateGeographicPatterns;
    private updateAccessPatterns;
    private updateSecurityPatterns;
    private updateDevicePatterns;
    /**
     * Detect behavioral anomalies in user event
     */
    private detectAnomalies;
    private detectTemporalAnomalies;
    private detectGeographicAnomalies;
    private detectAccessAnomalies;
    private detectVolumeAnomalies;
    private detectDeviceAnomalies;
    private handleAnomaly;
    private createAnomaly;
    private updateArrayPattern;
    private updateTravelPatterns;
    private calculateDistance;
    private toRadians;
    private calculateResourceRiskScore;
    private isPrivilegedAction;
    private isHighRiskResource;
    private getRecentEvents;
    private updateRiskScores;
    private assessRisk;
    private getPotentialDamage;
    private getRecommendedActions;
    private generateAnomalyId;
    private cleanupOldEvents;
    private startRealTimeAnalysis;
    private performBatchAnalysis;
    private adjustAnomalyThresholds;
    getUserProfile(userId: string): UserBehaviorProfile | undefined;
    getUserAnomalies(userId: string): BehaviorAnomaly[];
    getAllAnomalies(): BehaviorAnomaly[];
    getActiveAnomalies(): BehaviorAnomaly[];
    resolveAnomaly(anomalyId: string, falsePositive?: boolean): boolean;
    updateConfig(newConfig: Partial<BehaviorAnalyticsConfig>): void;
    getAnalyticsStats(): Record<string, unknown>;
    destroy(): void;

export declare class UserBehaviorAnalyticsFactory {
    private static instance;
    static getInstance(config?: Partial<BehaviorAnalyticsConfig>): UserBehaviorAnalytics;

export default UserBehaviorAnalytics;
//# sourceMappingURL=UserBehaviorAnalytics.d.ts.map
}
}