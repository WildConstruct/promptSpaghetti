/**
 * Epic 31.4.2 - ML Security Analytics Framework
 *
 * Unified framework that orchestrates predictive security analytics
 * and user behavior modeling. Integrates with Epic 1 analytics
 * infrastructure and Epic 17 security systems.
 *
 * Integration layer for E31-1753313263589-B894E3 and E31-1753313263588-A09495
 */
import { EventEmitter } from 'events';
import { SecurityEvent, ThreatPrediction } from './PredictiveSecurityAnalytics';
import { UserBehaviorEvent, BehaviorAnomaly } from './UserBehaviorAnalytics';

}
}
export interface SecurityAnalyticsConfig { enablePredictiveAnalytics: boolean;
    enableBehaviorAnalytics: boolean;
    enableCrossCorrelation: boolean;
    alertThreshold: number;
    autoResponseEnabled: boolean;
    epic1Integration: Epic1IntegrationConfig;
    epic17Integration: Epic17IntegrationConfig;
    mlModelConfig: MLModelConfig }
}
}
export interface Epic1IntegrationConfig { enabled: boolean;
    analyticsEndpoint: string;
    metricsCollectionInterval: number;
    enableDataStreaming: boolean;
    dataRetentionDays: number }
}
}
export interface Epic17IntegrationConfig { enabled: boolean;
    securityApiEndpoint: string;
    enableRealTimeAlerts: boolean;
    autoExecuteResponses: boolean;
    auditLoggingEnabled: boolean }
}
}
export interface MLModelConfig { modelUpdateFrequency: number;
    enableOnlineLearning: boolean;
    featureEngineeringEnabled: boolean;
    enableEnsembleModels: boolean;
    crossValidationEnabled: boolean }
}
}
export interface SecurityIntelligence { id: string;
    timestamp: Date;
    type: SecurityIntelligenceType;
    severity: SecuritySeverity;
    confidence: number;
    sources: SecurityIntelligenceSource[];
    correlatedEvents: (SecurityEvent | UserBehaviorEvent)[];
    predictions: ThreatPrediction[];
    anomalies: BehaviorAnomaly[];
    riskScore: number;
    businessImpact: number;
    recommendedActions: SecurityAction[];
    autoResolved: boolean;
    resolutionTime?: Date;

export declare enum SecurityIntelligenceType {
    CORRELATED_THREAT = "correlated_threat";
    BEHAVIORAL_ANOMALY = "behavioral_anomaly";
    PREDICTIVE_ALERT = "predictive_alert";
    COMPOUND_RISK = "compound_risk";
    ESCALATED_INCIDENT = "escalated_incident"

export declare enum SecuritySeverity {
    INFO = "info";
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface SecurityIntelligenceSource { sourceType: 'predictive' | 'behavioral' | 'external';
    sourceId: string;
    weight: number;
    confidence: number }
}
}
export interface SecurityAction { actionId: string;
    actionType: SecurityActionType;
    target: string;
    parameters: Record<string, unknown>;
    priority: number;
    estimatedEffectiveness: number;
    requiresApproval: boolean;
    executedAt?: Date;
    executionResult?: string;

export declare enum SecurityActionType {
    ALERT_SECURITY_TEAM = "alert_security_team";
    INCREASE_MONITORING = "increase_monitoring";
    RATE_LIMIT_USER = "rate_limit_user";
    REQUIRE_AUTHENTICATION = "require_authentication";
    TEMPORARY_ACCOUNT_LOCK = "temporary_account_lock";
    REVOKE_SESSION = "revoke_session";
    ESCALATE_TO_ADMIN = "escalate_to_admin";
    QUARANTINE_RESOURCE = "quarantine_resource";
    UPDATE_SECURITY_POLICY = "update_security_policy" }
    TRIGGER_INCIDENT_RESPONSE = "trigger_incident_response"

}
}
}
export interface SecurityMetrics { totalEvents: number;
    threatsDetected: number;
    anomaliesDetected: number;
    accuracyRate: number;
    falsePositiveRate: number;
    responseTime: number;
    systemHealth: number;
    modelPerformance: ModelPerformanceMetrics }
}
}
export interface ModelPerformanceMetrics {
    predictiveAccuracy: number;
    behavioralAccuracy: number;
    crossCorrelationEffectiveness: number;
    trainingDataQuality: number;
    featureImportance: Record<string, number>;

export declare class MLSecurityAnalyticsFramework extends EventEmitter {
    private predictiveAnalytics;
    private behaviorAnalytics;
    private config;
    private intelligenceStore;
    private correlationEngine;
    private epic1Connector;
    private epic17Connector;
    private processingQueue;
    private isProcessing;
    constructor(config?: Partial<SecurityAnalyticsConfig>);
    private initializeComponents;
    private setupEventHandlers;
    /**
     * Process security event through both analytics engines
     */
    processSecurityEvent(event: SecurityEvent): Promise<void>;
    /**
     * Process user behavior event
     */
    processUserBehaviorEvent(event: UserBehaviorEvent): Promise<void>;
    private handleThreatPrediction;
    private handleBehaviorAnomaly;
    private createThreatIntelligence;
    private createAnomalyIntelligence;
    private processIntelligence;
    private startProcessingLoop;
    private processSecurityIntelligence;
    private triggerAlert;
    private executeAutomatedResponses;
    private convertToBehaviorEvent;
    private convertToSecurityEvent;
    private mapSecurityEventToUserAction;
    private mapUserActionToSecurityEvent;
    private mapConfidenceToSeverity;
    private mapAnomalySeverityToSecuritySeverity;
    private escalateSeverity;
    private convertPreventiveActions;
    private convertStringActions;
    private generateIntelligenceId;
    private generateAlertId;
    private generateActionId;
    private generateAlertMessage;
    private getAlertRecipients;
    private executeSecurityAction;
    private updateMetrics;
    getSecurityIntelligence(): SecurityIntelligence[];
    getActiveThreats(): SecurityIntelligence[];
    getSecurityMetrics(): Promise<SecurityMetrics>;
    updateConfiguration(newConfig: Partial<SecurityAnalyticsConfig>): void;
    destroy(): void;

export declare class Epic31SecurityAnalytics {
    private static instance;
    /**
     * Get singleton instance configured for Epic 1 and Epic 17 integration
     */
    static getInstance(): MLSecurityAnalyticsFramework;
    /**
     * Initialize Epic 31 security analytics with custom configuration
     */
    static initialize(config: Partial<SecurityAnalyticsConfig>): MLSecurityAnalyticsFramework;

export default MLSecurityAnalyticsFramework;
//# sourceMappingURL=MLSecurityAnalyticsFramework.d.ts.map
}
}