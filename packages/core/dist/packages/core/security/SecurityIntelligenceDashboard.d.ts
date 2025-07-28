export interface SecurityDashboardConfig {
    refreshInterval: number;
    enableRealTimeUpdates: boolean;
    retentionPeriodDays: number;
    enableExecutiveReports: boolean;
    enableThreatIntelligence: boolean;
    enableComplianceReporting: boolean;
    alertThresholds: DashboardAlertThresholds;
    reportingSchedules: ReportingSchedule;
}
export interface DashboardAlertThresholds {
    criticalThreatCount: number;
    anomalyVolumeThreshold: number;
    responseTimeThresholdMs: number;
    systemHealthThreshold: number;
    complianceScoreThreshold: number;
}
export interface ReportingSchedule {
    reportType: ReportType;
    frequency: ReportFrequency;
    recipients: string;
    nextExecution: Date;
    enabled: boolean;
}
export declare enum ReportType {
    EXECUTIVE_SUMMARY = "executive_summary",
    THREAT_INTELLIGENCE = "threat_intelligence",
    SECURITY_POSTURE = "security_posture",
    COMPLIANCE_STATUS = "compliance_status",
    INCIDENT_ANALYSIS = "incident_analysis",
    TREND_ANALYSIS = "trend_analysis",
    OPERATIONAL_METRICS = "operational_metrics",
    export,
    enum,
    ReportFrequency
}
//# sourceMappingURL=SecurityIntelligenceDashboard.d.ts.map