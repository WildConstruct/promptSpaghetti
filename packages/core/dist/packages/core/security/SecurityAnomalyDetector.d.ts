export interface AnomalyDetectionConfig {
    enableRealTimeDetection: boolean;
    detectionSensitivity: number;
    alertThreshold: number;
    enableAdaptiveThresholds: boolean;
    baselineTrainingPeriod: number;
    anomalyRetentionDays: number;
    enableCorrelationAnalysis: boolean;
    autoResponseEnabled: boolean;
    escalationRules: EscalationRule;
}
export interface SecurityAnomaly {
    id: string;
    timestamp: Date;
    anomalyType: AnomalyType;
    severity: AnomalySeverity;
    confidence: number;
    description: string;
    affectedSystems: string;
    affectedMetrics: string;
    deviationMagnitude: number;
    baselineValue: number;
    observedValue: number;
    statisticalSignificance: number;
    correlatedAnomalies: string;
    riskAssessment: AnomalyRiskAssessment;
    alertsTriggered: SecurityAlert;
    isResolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionNotes?: string;
}
export declare enum AnomalyType {
    METRIC_THRESHOLD_BREACH = "metric_threshold_breach",
    STATISTICAL_OUTLIER = "statistical_outlier",
    PATTERN_DEVIATION = "pattern_deviation",
    CORRELATION_ANOMALY = "correlation_anomaly",
    TREND_ANOMALY = "trend_anomaly",
    SEASONALITY_DEVIATION = "seasonality_deviation",
    VOLUME_SPIKE = "volume_spike",
    FREQUENCY_ANOMALY = "frequency_anomaly",
    LATENCY_ANOMALY = "latency_anomaly",
    ERROR_RATE_SPIKE = "error_rate_spike",
    CAPACITY_ANOMALY = "capacity_anomaly",
    BEHAVIORAL_DRIFT = "behavioral_drift",
    export,
    enum,
    AnomalySeverity
}
//# sourceMappingURL=SecurityAnomalyDetector.d.ts.map