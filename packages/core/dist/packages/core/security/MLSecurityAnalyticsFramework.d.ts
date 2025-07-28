import { SecurityEvent, ThreatPrediction } from './PredictiveSecurityAnalytics';
import { UserBehaviorEvent, BehaviorAnomaly } from './UserBehaviorAnalytics';
export interface SecurityAnalyticsConfig {
    enablePredictiveAnalytics: boolean;
    enableBehaviorAnalytics: boolean;
    enableCrossCorrelation: boolean;
    alertThreshold: number;
    autoResponseEnabled: boolean;
    epic1Integration: Epic1IntegrationConfig;
    epic17Integration: Epic17IntegrationConfig;
    mlModelConfig: MLModelConfig;
}
export interface Epic1IntegrationConfig {
    enabled: boolean;
    analyticsEndpoint: string;
    metricsCollectionInterval: number;
    enableDataStreaming: boolean;
    dataRetentionDays: number;
}
export interface Epic17IntegrationConfig {
    enabled: boolean;
    securityApiEndpoint: string;
    enableRealTimeAlerts: boolean;
    autoExecuteResponses: boolean;
    auditLoggingEnabled: boolean;
}
export interface MLModelConfig {
    modelUpdateFrequency: number;
    enableOnlineLearning: boolean;
    featureEngineeringEnabled: boolean;
    enableEnsembleModels: boolean;
    crossValidationEnabled: boolean;
}
export interface SecurityIntelligence {
    id: string;
    timestamp: Date;
    type: SecurityIntelligenceType;
    severity: SecuritySeverity;
    confidence: number;
    sources: SecurityIntelligenceSource;
    correlatedEvents: (SecurityEvent | UserBehaviorEvent)[];
    predictions: ThreatPrediction;
    anomalies: BehaviorAnomaly;
    riskScore: number;
    businessImpact: number;
    recommendedActions: SecurityAction;
    autoResolved: boolean;
    resolutionTime?: Date;
}
export declare enum SecurityIntelligenceType {
    CORRELATED_THREAT = "correlated_threat",
    BEHAVIORAL_ANOMALY = "behavioral_anomaly",
    PREDICTIVE_ALERT = "predictive_alert",
    COMPOUND_RISK = "compound_risk",
    ESCALATED_INCIDENT = "escalated_incident",
    export,
    enum,
    SecuritySeverity
}
//# sourceMappingURL=MLSecurityAnalyticsFramework.d.ts.map