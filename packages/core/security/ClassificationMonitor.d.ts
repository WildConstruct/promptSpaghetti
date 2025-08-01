/**
 * Classification Monitoring Service
 *
 * Real-time monitoring and analytics for data classification operations,
 * providing insights into classification patterns, performance metrics,
 * compliance violations, and security trends.
 *
 * Features:
 * - Real-time classification event monitoring
 * - Performance metrics tracking
 * - Compliance violation detection
 * - Anomaly detection for classification patterns
 * - Trend analysis and reporting
 * - Alert management for critical events
 * - Dashboard metrics aggregation
 * - Historical data analysis
 */
import { EventEmitter } from 'events';
import { ClassificationLevel,
  DataCategory,
  ComplianceFramework,
  ClassificationResult }
  DataElement
} from './DataClassifier';
export declare enum MonitoringEventType { CLASSIFICATION_PERFORMED = "classification_performed",
    RULE_TRIGGERED = "rule_triggered",
    COMPLIANCE_VIOLATION = "compliance_violation",
    PERFORMANCE_WARNING = "performance_warning",
    ANOMALY_DETECTED = "anomaly_detected",
    THRESHOLD_EXCEEDED = "threshold_exceeded",
    ERROR_OCCURRED = "error_occurred"

export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error" }
    CRITICAL = "critical"

}
}
export interface MonitoringEvent { id: string;
    type: MonitoringEventType;
    timestamp: Date;
    dataId: string;
    classification?: ClassificationResult;
    metadata: Record<string, any>;
    severity: AlertSeverity;
    source: string;
    userId?: string }
}
}
export interface ClassificationPerformanceMetrics { totalClassifications: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    queueDepth: number;
    lastUpdated: Date }
}
}
export interface ClassificationStatistics { byLevel: Record<ClassificationLevel, number>;
    byCategory: Record<DataCategory, number>;
    byComplianceFramework: Record<ComplianceFramework, number>;
    encryptionRequired: number;
    totalClassified: number;
    uniqueDataElements: number;
    timeRange: {
        start: Date;
        end: Date }
}
    };

}
}
export interface ComplianceMetrics { totalViolations: number;
    violationsByFramework: Record<ComplianceFramework, number>;
    violationTypes: Record<string, number>;
    complianceRate: number;
    criticalViolations: number;
    resolvedViolations: number;
    pendingRemediation: number }
}
}
export interface ClassificationAnomaly { id: string;
    type: 'volume' | 'pattern' | 'timing' | 'classification_change';
    description: string;
    detectedAt: Date;
    confidence: number;
    affectedDataIds: string[];
    expectedPattern: any;
    actualPattern: any;
    recommendation: string }
}
}
export interface AlertConfig { enabled: boolean;
    thresholds: {
        errorRate: number;
        responseTime: number;
        violationCount: number;
        anomalyConfidence: number }
}
    };
    channels: { email: boolean;
        webhook: boolean;
        syslog: boolean };
    recipients: string[];
    webhookUrl?: string;

}
}
export interface MonitorConfig { enableRealTimeMonitoring: boolean;
    enablePerformanceTracking: boolean;
    enableAnomalyDetection: boolean;
    enableComplianceMonitoring: boolean;
    retentionPeriodDays: number;
    aggregationIntervalMinutes: number;
    alertConfig: AlertConfig;
    dashboardRefreshIntervalSeconds: number;
/**
 * Classification Monitoring Service
 */
export declare class ClassificationMonitor extends EventEmitter {
    private config;
    private events;
    private performanceMetrics;
    private statistics;
    private complianceMetrics;
    private anomalies;
    private alertQueue;
    private metricsTimer?;
    private anomalyDetectionTimer?;
    private cleanupTimer?;
    private responseTimes;
    private classificationCounts;
    private errorCounts;
    constructor(config: MonitorConfig);
    /**
     * Record a classification event
     */
    recordClassification(dataElement: DataElement, result: ClassificationResult, responseTime: number): void;
    /**
     * Record a rule trigger event
     */
    recordRuleTrigger(ruleId: string, dataId: string, metadata: Record<string, any>): void;
    /**
     * Record a compliance violation
     */
    recordComplianceViolation();
      dataId: string;
      framework: ComplianceFramework;
      violation: string }
      severity?: AlertSeverity
    ): void;
    /**
     * Record a performance warning
     */
    recordPerformanceWarning(metric: string, value: number, threshold: number): void;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): ClassificationPerformanceMetrics;
    /**
     * Get classification statistics
     */
    getStatistics(timeRangeMinutes?: number): ClassificationStatistics;
    /**
     * Get compliance metrics
     */
    getComplianceMetrics(): ComplianceMetrics;
    /**
     * Get detected anomalies
     */
    getAnomalies(limit?: number): ClassificationAnomaly[];
    /**
     * Get recent events
     */
    getRecentEvents(limit?: number, types?: MonitoringEventType[]): MonitoringEvent[];
    /**
     * Get dashboard metrics
     */
    getDashboardMetrics(): {
        performance: ClassificationPerformanceMetrics;
        statistics: ClassificationStatistics;
        compliance: ComplianceMetrics;
        recentAnomalies: ClassificationAnomaly[];
        alerts: MonitoringEvent[];
        healthStatus: 'healthy' | 'warning' | 'critical'
}
}
  };
    /**
     * Export monitoring data
     */
    exportData(format?: 'json' | 'csv'): string;
    private initializeMetrics;
    private startMonitoring;
    private addEvent;
    private updatePerformanceMetrics;
    private updateStatistics;
    private updateComplianceMetrics;
    private checkForAnomalies;
    private checkComplianceViolations;
    private detectAnomaly;
    private triggerAlert;
    private sendWebhookAlert;
    private aggregateMetrics;
    private runAnomalyDetection;
    private calculateHealthStatus;
    private calculateStatistics;
    private convertToCSV;
    private cleanupOldData;
    private generateEventId;
    private generateAnomalyId;
    /**
     * Stop monitoring and cleanup
     */
    destroy(): void;

export default ClassificationMonitor;
//# sourceMappingURL=ClassificationMonitor.d.ts.map