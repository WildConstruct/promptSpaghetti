/**
 * Epic 31.4.2 - Predictive Security Analytics for Threat Prevention
 *
 * Implements machine learning-based predictive analytics to identify
 * and prevent security threats before they occur. Integrates with
 * Epic 1 analytics infrastructure and Epic 17 security systems.
 *
 * Task: E31-1753313263589-B894E3
 */
import { EventEmitter } from 'events';

}
}
export interface SecurityEvent { id: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    sourceIP: string;
    userAgent?: string;
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    metadata: Record<string, unknown>;
    riskScore: number;
    geolocation?: GeolocationData;

export declare enum SecurityEventType {
    LOGIN_ATTEMPT = "login_attempt";
    LOGIN_SUCCESS = "login_success";
    LOGIN_FAILURE = "login_failure";
    PASSWORD_RESET = "password_reset";
    PERMISSION_CHANGE = "permission_change";
    API_ACCESS = "api_access";
    DATA_ACCESS = "data_access";
    SUSPICIOUS_ACTIVITY = "suspicious_activity";
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded";
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt";
    ACCOUNT_LOCKOUT = "account_lockout";
    PRIVILEGE_ESCALATION = "privilege_escalation"

export declare enum SecuritySeverity {
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface GeolocationData { country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isKnownLocation: boolean }
}
}
export interface ThreatPrediction { predictionId: string;
    timestamp: Date;
    threatType: ThreatType;
    confidence: number;
    riskScore: number;
    predictedTimeframe: number;
    affectedEntities: string[];
    recommendedActions: PreventiveAction[];
    modelVersion: string;
    features: Record<string, number>;

export declare enum ThreatType {
    BRUTE_FORCE_ATTACK = "brute_force_attack";
    ACCOUNT_TAKEOVER = "account_takeover";
    CREDENTIAL_STUFFING = "credential_stuffing";
    DISTRIBUTED_ATTACK = "distributed_attack";
    INSIDER_THREAT = "insider_threat";
    API_ABUSE = "api_abuse";
    DATA_EXFILTRATION = "data_exfiltration" }
    PRIVILEGE_ESCALATION_ATTEMPT = "privilege_escalation_attempt"

}
}
}
export interface PreventiveAction { actionType: ActionType;
    target: string;
    parameters: Record<string, unknown>;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    description: string;
    estimatedEffectiveness: number;

export declare enum ActionType {
    INCREASE_MONITORING = "increase_monitoring";
    RATE_LIMIT_ADJUSTMENT = "rate_limit_adjustment";
    TEMPORARY_BLOCK = "temporary_block";
    REQUIRE_MFA = "require_mfa";
    ALERT_ADMIN = "alert_admin";
    QUARANTINE_SESSION = "quarantine_session";
    REVOKE_PERMISSIONS = "revoke_permissions" }
    FORCE_PASSWORD_RESET = "force_password_reset"

}
}
}
export interface PredictionModel { modelId: string;
    name: string;
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    trainedAt: Date;
    lastUpdated: Date;
    isActive: boolean;
    threatTypes: ThreatType[];
    featureImportance: Record<string, number> }
}
}
export interface AnalyticsConfiguration {
    predictionThreshold: number;
    maxPredictionTimeframe: number;
    enableRealTimeAnalysis: boolean;
    modelUpdateInterval: number;
    retentionPeriod: number;
    alertingEnabled: boolean;
    autoResponseEnabled: boolean;

export declare class PredictiveSecurityAnalytics extends EventEmitter {
    private models;
    private eventHistory;
    private activePredictions;
    private config;
    private isAnalyzing;
    private analysisInterval?;
    constructor(config?: Partial<AnalyticsConfiguration>);
    /**
     * Process incoming security event and trigger predictive analysis
     */
    processSecurityEvent(event: SecurityEvent): Promise<void>;
    /**
     * Analyze single event for immediate threats
     */
    private analyzeEvent;
    /**
     * Generate batch predictions from event patterns
     */
    generatePredictions(events: SecurityEvent[]): Promise<ThreatPrediction[]>;
    /**
     * Run specific prediction model
     */
    private runModel;
    /**
     * Extract ML features from security events
     */
    private extractFeatures;
    /**
     * Predict brute force attacks using pattern analysis
     */
    private predictBruteForceAttacks;
    /**
     * Predict account takeover attempts
     */
    private predictAccountTakeovers;
    /**
     * Predict credential stuffing attacks
     */
    private predictCredentialStuffing;
    /**
     * Predict insider threats based on behavior patterns
     */
    private predictInsiderThreats;
    /**
     * Handle high-confidence threat predictions
     */
    private handleThreatPrediction;
    /**
     * Execute preventive actions for threat prediction
     */
    private executePreventiveActions;
    private initializeDefaultModels;
    private calculateTimeSpan;
    private countEventTypes;
    private countUniqueGeolocations;
    private calculateUnknownLocationRatio;
    private countUniqueValues;
    private calculateAverageRiskScore;
    private generatePredictionId;
    private extractAffectedEntities;
    private getBruteForcePreventiveActions;
    private getAccountTakeoverPreventiveActions;
    private getCredentialStuffingPreventiveActions;
    private getInsiderThreatPreventiveActions;
    private sendThreatAlert;
    private executeAction;
    private cleanupOldEvents;
    private startRealTimeAnalysis;
    getActivePredictions(): ThreatPrediction[];
    getModels(): PredictionModel[];
    updateConfiguration(newConfig: Partial<AnalyticsConfiguration>): void;
    analyzeHistoricalData(timeframeHours?: number): Promise<ThreatPrediction[]>;
    destroy(): void;

export declare class PredictiveAnalyticsFactory {
    private static instance;
    static getInstance(config?: Partial<AnalyticsConfiguration>): PredictiveSecurityAnalytics;
    static createCustomInstance(config: Partial<AnalyticsConfiguration>): PredictiveSecurityAnalytics;

export default PredictiveSecurityAnalytics;
//# sourceMappingURL=PredictiveSecurityAnalytics.d.ts.map
}
}