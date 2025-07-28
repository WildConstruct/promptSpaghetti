import { ThreatType } from './PredictiveSecurityAnalytics';
import { AnomalySeverity } from './SecurityAnomalyDetector';
export interface CorrelationConfig {
    enableRealTimeCorrelation: boolean;
    correlationTimeWindow: number;
    similarityThreshold: number;
    enableAdvancedPatternRecognition: boolean;
    maxCorrelationDepth: number;
    enableCrossSystemCorrelation: boolean;
    retentionPeriodDays: number;
    enableMachineLearning: boolean;
    correlationRules: CorrelationRule;
}
export interface CorrelationRule {
    id: string;
    name: string;
    description: string;
    ruleType: CorrelationRuleType;
    enabled: boolean;
    priority: number;
    conditions: CorrelationCondition;
    actions: CorrelationAction;
    timeWindow: number;
    threshold: number;
    lastUpdated: Date;
    triggeredCount: number;
}
export declare enum CorrelationRuleType {
    TEMPORAL_SEQUENCE = "temporal_sequence",
    SPATIAL_CLUSTERING = "spatial_clustering",
    FREQUENCY_PATTERN = "frequency_pattern",
    ATTRIBUTE_SIMILARITY = "attribute_similarity",
    BEHAVIORAL_PATTERN = "behavioral_pattern",
    CAUSAL_RELATIONSHIP = "causal_relationship",
    ANOMALY_CLUSTERING = "anomaly_clustering",
    THREAT_CHAIN = "threat_chain",
    export,
    interface,
    CorrelationCondition
}
export declare enum CorrelationOperator {
    EQUALS = "equals",
    CONTAINS = "contains",
    MATCHES_REGEX = "matches_regex",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    IN_RANGE = "in_range",
    TIME_WITHIN = "time_within",
    GEO_WITHIN = "geo_within",
    SIMILAR_TO = "similar_to",
    PATTERN_MATCH = "pattern_match",
    export,
    interface,
    CorrelationAction
}
export declare enum CorrelationActionType {
    CREATE_INCIDENT = "create_incident",
    MERGE_EVENTS = "merge_events",
    ESCALATE_THREAT = "escalate_threat",
    TRIGGER_ALERT = "trigger_alert",
    UPDATE_RISK_SCORE = "update_risk_score",
    ADD_TO_WATCHLIST = "add_to_watchlist",
    TRIGGER_AUTOMATION = "trigger_automation",
    NOTIFY_STAKEHOLDERS = "notify_stakeholders",
    export,
    interface,
    CorrelatedEventGroup
}
export declare enum EventGroupType {
    ATTACK_CAMPAIGN = "attack_campaign",
    SECURITY_INCIDENT = "security_incident",
    ANOMALY_CLUSTER = "anomaly_cluster",
    THREAT_PATTERN = "threat_pattern",
    OPERATIONAL_ISSUE = "operational_issue",
    COMPLIANCE_VIOLATION = "compliance_violation",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    COORDINATED_ATTACK = "coordinated_attack",
    export,
    interface,
    CorrelationEvidence
}
export declare enum EvidenceType {
    TEMPORAL_PROXIMITY = "temporal_proximity",
    GEOGRAPHIC_PROXIMITY = "geographic_proximity",
    COMMON_ATTRIBUTES = "common_attributes",
    PATTERN_SIMILARITY = "pattern_similarity",
    CAUSAL_RELATIONSHIP = "causal_relationship",
    SHARED_INFRASTRUCTURE = "shared_infrastructure",
    BEHAVIORAL_CORRELATION = "behavioral_correlation",
    STATISTICAL_CORRELATION = "statistical_correlation",
    export,
    interface,
    EventTimeline
}
export interface ThreatIndicator {
    indicator: string;
    indicatorType: IndicatorType;
    confidence: number;
    severity: AnomalySeverity;
    firstSeen: Date;
    lastSeen: Date;
    frequency: number;
    associatedThreats: ThreatType;
}
export declare enum IndicatorType {
    IP_ADDRESS = "ip_address",
    DOMAIN_NAME = "domain_name",
    URL_PATTERN = "url_pattern",
    FILE_HASH = "file_hash",
    USER_AGENT = "user_agent",
    BEHAVIORAL_PATTERN = "behavioral_pattern",
    ATTACK_SIGNATURE = "attack_signature",
    GEOLOCATION = "geolocation",
    export,
    interface,
    GroupRecommendation
}
export declare enum RecommendationType {
    IMMEDIATE_ACTION = "immediate_action",
    INVESTIGATION = "investigation",
    PREVENTIVE_MEASURE = "preventive_measure",
    POLICY_UPDATE = "policy_update",
    MONITORING_ENHANCEMENT = "monitoring_enhancement",
    USER_TRAINING = "user_training",
    INFRASTRUCTURE_CHANGE = "infrastructure_change",
    SECURITY_TOOL_DEPLOYMENT = "security_tool_deployment",
    export,
    enum,
    GroupStatus
}
//# sourceMappingURL=SecurityEventCorrelationEngine.d.ts.map