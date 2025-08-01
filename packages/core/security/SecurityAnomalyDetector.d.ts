/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 31.4.1 - Security Anomaly Detection and Automated Alerting
 *
 * Implements advanced anomaly detection algorithms for security analytics
 * infrastructure monitoring and automated alerting capabilities.
 * Integrates with Epic 1 analytics and Epic 17 security systems.
 *
 * Task: E31-1753313263581-019263
 */
import { EventEmitter } from 'events';

}
}
export interface AnomalyDetectionConfig { enableRealTimeDetection: boolean;
    detectionSensitivity: number;
    alertThreshold: number;
    enableAdaptiveThresholds: boolean;
    baselineTrainingPeriod: number;
    anomalyRetentionDays: number;
    enableCorrelationAnalysis: boolean;
    autoResponseEnabled: boolean;
    escalationRules: EscalationRule[] }
}
}
export interface SecurityAnomaly { id: string;
    timestamp: Date;
    anomalyType: AnomalyType;
    severity: AnomalySeverity;
    confidence: number;
    description: string;
    affectedSystems: string[];
    affectedMetrics: string[];
    deviationMagnitude: number;
    baselineValue: number;
    observedValue: number;
    statisticalSignificance: number;
    correlatedAnomalies: string[];
    riskAssessment: AnomalyRiskAssessment;
    alertsTriggered: SecurityAlert[];
    isResolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionNotes?: string;

export declare enum AnomalyType {
    METRIC_THRESHOLD_BREACH = "metric_threshold_breach";
    STATISTICAL_OUTLIER = "statistical_outlier";
    PATTERN_DEVIATION = "pattern_deviation";
    CORRELATION_ANOMALY = "correlation_anomaly";
    TREND_ANOMALY = "trend_anomaly";
    SEASONALITY_DEVIATION = "seasonality_deviation";
    VOLUME_SPIKE = "volume_spike";
    FREQUENCY_ANOMALY = "frequency_anomaly";
    LATENCY_ANOMALY = "latency_anomaly";
    ERROR_RATE_SPIKE = "error_rate_spike";
    CAPACITY_ANOMALY = "capacity_anomaly";
    BEHAVIORAL_DRIFT = "behavioral_drift"

export declare enum AnomalySeverity {
    INFO = "info";
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface AnomalyRiskAssessment { businessImpact: number;
    securityImpact: number;
    operationalImpact: number;
    complianceRisk: number;
    cascadeRisk: number;
    mitigationUrgency: 'immediate' | 'high' | 'medium' | 'low';
    estimatedDowntime: number;
    affectedUserCount: number;
    dataExposureRisk: number }
}
}
export interface SecurityAlert { id: string;
    timestamp: Date;
    alertType: AlertType;
    severity: AnomalySeverity;
    title: string;
    description: string;
    sourceAnomaly: string;
    targetChannels: NotificationChannel[];
    escalationLevel: number;
    isEscalated: boolean;
    escalatedAt?: Date;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    suppressUntil?: Date;
    metadata: Record<string, unknown>;

export declare enum AlertType {
    THRESHOLD_BREACH = "threshold_breach";
    ANOMALY_DETECTED = "anomaly_detected";
    SYSTEM_FAILURE = "system_failure";
    SECURITY_INCIDENT = "security_incident";
    PERFORMANCE_DEGRADATION = "performance_degradation";
    COMPLIANCE_VIOLATION = "compliance_violation";
    CAPACITY_WARNING = "capacity_warning";
    ERROR_SPIKE = "error_spike";
    AVAILABILITY_ALERT = "availability_alert" }
    CORRELATION_ALERT = "correlation_alert"

}
}
}
export interface NotificationChannel { channelType: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
    target: string;
    enabled: boolean;
    severity: AnomalySeverity[];
    rateLimiting: RateLimitConfig;
    template?: string }
}
}
export interface RateLimitConfig { maxAlertsPerHour: number;
    maxAlertsPerDay: number;
    burstLimit: number;
    cooldownPeriod: number }
}
}
export interface EscalationRule { id: string;
    name: string;
    conditions: EscalationCondition[];
    timeoutMinutes: number;
    targetChannels: NotificationChannel[];
    autoEscalate: boolean;
    maxEscalationLevel: number }
}
}
export interface EscalationCondition { field: 'severity' | 'anomalyType' | 'businessImpact' | 'affectedSystems';
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
    value: unknown }
}
}
export interface MetricBaseline { metricName: string;
    systemName: string;
    mean: number;
    standardDeviation: number;
    median: number;
    percentile95: number;
    percentile99: number;
    minValue: number;
    maxValue: number;
    dataPoints: number;
    lastUpdated: Date;
    seasonalPatterns: SeasonalPattern[];
    trendCoefficient: number }
}
}
export interface SeasonalPattern { period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    pattern: number[];
    strength: number;
    phase: number }
}
}
export interface AnomalyDetectionModel { modelId: string;
    modelType: DetectionModelType;
    name: string;
    description: string;
    targetMetrics: string[];
    sensitivity: number;
    isActive: boolean;
    accuracy: number;
    falsePositiveRate: number;
    lastTrained: Date;
    trainingDataSize: number;
    parameters: Record<string, unknown>;

export declare enum DetectionModelType {
    STATISTICAL_THRESHOLD = "statistical_threshold";
    Z_SCORE = "z_score";
    ISOLATION_FOREST = "isolation_forest";
    LOCAL_OUTLIER_FACTOR = "local_outlier_factor";
    ONE_CLASS_SVM = "one_class_svm";
    AUTOENCODER = "autoencoder";
    LSTM_AUTOENCODER = "lstm_autoencoder" }
    CHANGEPOINT_DETECTION = "changepoint_detection"

}
}
}
export interface SecurityMetric {
    id: string;
    timestamp: Date;
    systemName: string;
    metricName: string;
    value: number;
    unit: string;
    tags: Record<string, string>;
    metadata: Record<string, unknown>;

export declare class SecurityAnomalyDetector extends EventEmitter {
    private config;
    private detectedAnomalies;
    private activeAlerts;
    private metricBaselines;
    private detectionModels;
    private metricHistory;
    private isProcessing;
    private processingInterval?;
    constructor(config?: Partial<AnomalyDetectionConfig>);
    /**
     * Process incoming security metric for anomaly detection
     */
    processMetric(metric: SecurityMetric): Promise<void>;
    /**
     * Detect anomalies for a specific metric
     */
    private detectAnomaliesForMetric;
    /**
     * Run specific detection model on metric
     */
    private runDetectionModel;
    private detectStatisticalThresholdAnomaly;
    private detectZScoreAnomaly;
    private detectChangepointAnomaly;
    private handleAnomaly;
    private performCorrelationAnalysis;
    private calculateCorrelationScore;
    private generateAlert;
    private sendNotifications;
    private sendNotification;
    private scheduleEscalation;
    private escalateAlert;
    private updateBaseline;
    private createNewBaseline;
    private updateSeasonalPatterns;
    private storeMetric;
    private getRecentMetricValues;
    private calculateMean;
    private calculateStandardDeviation;
    private calculateMedian;
    private calculatePercentile;
    private calculateHourlyPattern;
    private calculatePatternStrength;
    private createAnomaly;
    private calculateAnomalySeverity;
    private assessAnomalyRisk;
    private mapModelToAnomalyType;
    private mapAnomalyToAlertType;
    private escalateSeverity;
    private generateAlertTitle;
    private generateAlertDescription;
    private getTargetChannels;
    private isRateLimited;
    private evaluateEscalationConditions;
    private getSeverityLevel;
    private generateAnomalyId;
    private generateAlertId;
    private initializeDefaultModels;
    private startRealTimeProcessing;
    private performBatchProcessing;
    private cleanupOldAnomalies;
    getDetectedAnomalies(): SecurityAnomaly[];
    getActiveAnomalies(): SecurityAnomaly[];
    getActiveAlerts(): SecurityAlert[];
    getMetricBaselines(): MetricBaseline[];
    getDetectionModels(): AnomalyDetectionModel[];
    resolveAnomaly(anomalyId: string, resolvedBy: string, notes?: string): boolean;
    acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean;
    updateConfiguration(newConfig: Partial<AnomalyDetectionConfig>): void;
    addDetectionModel(model: AnomalyDetectionModel): void;
    removeDetectionModel(modelId: string): boolean;
    destroy(): void;

export default SecurityAnomalyDetector;
//# sourceMappingURL=SecurityAnomalyDetector.d.ts.map
}
}