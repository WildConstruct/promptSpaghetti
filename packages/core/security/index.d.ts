/**
 * Security Integration Framework
 * Epic 31 - Security Integration Framework
 *
 * Unified exports for security monitoring, alerting, and dashboard components
 */
export { default as CrossSystemAlertingSystem } from './AlertingSystem';
export type { SecurityEvent, AlertRule, NotificationAction, EscalationAction, AutomationAction, AlertingConfig, AlertMetrics } from './AlertingSystem';
export { default as UnifiedMonitoringDashboard } from './UnifiedMonitoringDashboard';
export { default as SecurityIncidentResponseService } from './SecurityIncidentResponseService';
export type { SecurityIncident, IncidentTimelineEntry, IncidentAction, Evidence, Communication, IncidentResponseProcedure, IncidentResponsePhase, ResponseStep, AutomatedResponseAction, CommunicationTemplate, TroubleshootingWorkflow, DiagnosticStep, DecisionNode, Solution, IncidentResponseConfig } from './SecurityIncidentResponseService';
export { default as SecurityDataIntegrityMonitor } from './SecurityDataIntegrityMonitor';
export type { DataIntegrityCheck, AutoRemediationAction, IntegrityCheckResult, IntegrityFinding, RemediationResult, DataIntegrityMetrics, DataIntegrityConfig } from './SecurityDataIntegrityMonitor';
export { default as SecurityReliabilityEngineer } from './SecurityReliabilityEngineer';
export type { ServiceLevelObjective, BurnRateAlert, SLOPerformanceRecord, ReliabilityIncident, IncidentAction, ImprovementItem, ReliabilityMetrics, PostmortemTemplate, ReliabilityReport, ReliabilityEvent } from './SecurityReliabilityEngineer';
export { default as SecurityCapacityManager } from './SecurityCapacityManager';
export type { CapacityPlan, ResourceRequirements, GrowthProjection, SeasonalFactor, PerformanceTargets, AvailabilityRequirements, ScalingPolicy, MetricTrigger, TimeTrigger, EventTrigger, ScalingAction, NotificationAction, CustomMetricTarget, InstanceTypeConfig, CapacityMetrics, ScalingEvent, CapacityForecast, CapacityRecommendation } from './SecurityCapacityManager';
export { default as SecurityFailoverManager } from './SecurityFailoverManager';
export type { SecuritySystemNode, FailoverPolicy, FailoverEvent, RedundancyGroup, LoadBalancingStrategy, HealthCheckConfig, FailoverMetrics } from './SecurityFailoverManager';
export { default as SecurityDisasterRecoveryManager } from './SecurityDisasterRecoveryManager';
export type { DisasterRecoveryPlan, RecoveryStrategy, BackupJob, BackupExecution, DisasterRecoveryEvent, TestResult, NotificationTreeNode, EscalationProcedure, StakeholderGroup, ExternalDependency } from './SecurityDisasterRecoveryManager';
export { default as RateLimiter } from './RateLimiter';
export { default as ComplianceMonitor } from '../services/ComplianceMonitor';
export { default as AdaptiveThrottlingRules } from './AdaptiveThrottlingRules';
export { default as ComplianceSecurityDashboard } from './dashboard/ComplianceSecurityDashboard';
export { default as SecurityDashboardWorkflow } from './dashboard/SecurityDashboardWorkflow';
export declare const createDefaultAlertingConfig: () => AlertingConfig;
export declare const createSecurityEvent: (type: SecurityEvent["type"], severity: SecurityEvent["severity"], title: string, description: string, source: string, details?: Partial<SecurityEvent["details"]>) => SecurityEvent;
export declare const createEmailNotificationAction: (email: string, priority?: NotificationAction["priority"]) => NotificationAction;
export declare const createSlackNotificationAction: (channel: string, priority?: NotificationAction["priority"]) => NotificationAction;
export declare const createWebhookNotificationAction: (url: string, priority?: NotificationAction["priority"]) => NotificationAction;
export declare const createBasicAlertRule: (name: string, eventTypes: SecurityEvent["type"][], severityThreshold: SecurityEvent["severity"], notifications: NotificationAction[]) => Omit<AlertRule, "id" | "created_at" | "last_modified">;
export declare const createCriticalSecurityAlertRule: (notifications: NotificationAction[]) => Omit<AlertRule, "id" | "created_at" | "last_modified">;
export declare const createPerformanceAlertRule: (notifications: NotificationAction[]) => Omit<AlertRule, "id" | "created_at" | "last_modified">;
export declare const mapThreatLevelToSeverity: (threatLevel: number) => SecurityEvent["severity"];
export declare const calculateRiskScore: (event: SecurityEvent, historicalData?: SecurityEvent[]) => number;
export declare const generateSecurityReport: (events: SecurityEvent[], timeRange: {
    start: number;
    end: number;
}) => {
    summary: {
        total_events: number;
        critical_count: number;
        resolved_count: number;
        avg_response_time: number;
    };
    top_threats: Array<{
        type: SecurityEvent["type"];
        count: number;
    }>;
    affected_systems: Array<{
        system: string;
        incident_count: number;
    }>;
    recommendations: string[];
};
//# sourceMappingURL=index.d.ts.map