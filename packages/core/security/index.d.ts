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
export { default as SecurityCostOptimizer } from './SecurityCostOptimizer';
export type { CostCenter, CostAlert, AutoCostAction, CostMetrics, CostOptimizationRecommendation, CostBudget, CostReport, CostEvent } from './SecurityCostOptimizer';
export { default as SecurityDataArchiver } from './SecurityDataArchiver';
export type { DataPartitionConfig, RetentionPolicy, StorageTier, ArchivalJob, ArchivalExecution, DataRetrievalRequest, PartitionMetrics, ArchivalEvent } from './SecurityDataArchiver';
export { default as SecuritySystemHealthTracker } from './SecuritySystemHealthTracker';
export type { SecuritySystemNode, SuccessCriteria, MaintenanceWindow, HealthCheckResult, AvailabilityReport, SystemAlert, HealthTrackerConfig, EscalationRule } from './SecuritySystemHealthTracker';
export { default as SecurityQueryOptimizer } from './SecurityQueryOptimizer';
export type { QueryProfile, QueryExecution, CachingStrategy, ExecutionPlan, OptimizationRule, UserUsagePattern, SeasonalPattern, QueryCache, CacheEntry, PerformanceMetrics, QueryOptimizerConfig } from './SecurityQueryOptimizer';
export { default as SecurityOptimizationTools } from './SecurityOptimizationTools';
export type { OptimizationProfile, OptimizationGoal, PerformanceTarget, OptimizationConstraint, AnalysisScope, OptimizationTool, OptimizationJob, OptimizationRecommendation, PerformanceAnalysis, CostBenefitAnalysis, RiskAssessment, OptimizationResult, OptimizationEvent } from './SecurityOptimizationTools';
export { default as SecurityDataPipelineMonitor } from './SecurityDataPipelineMonitor';
export type { DataPipeline, DataSource, DataDestination, ProcessingStage, TransformationRule, ValidationRule, QualityThresholds, RetryPolicy, ErrorHandlingStrategy, PartitioningStrategy, PipelineExecution, StageExecution, ExecutionError, PipelineAlert, PipelineOptimizationRecommendation, DataLineageRecord } from './SecurityDataPipelineMonitor';
export { default as SecurityQueryPerformanceOptimizer } from './SecurityQueryPerformanceOptimizer';
export type { QueryPerformanceProfile, CacheStrategy, SeasonalUsagePattern, QueryOptimizationRule, QueryExecution, ExecutionPlan, ExecutionStep, IndexUsage, CacheInteraction, PerformanceAlert, CacheConfiguration, OptimizationReport, PerformanceMetrics } from './SecurityQueryPerformanceOptimizer';
export { default as SecurityInfrastructureMonitor } from './SecurityInfrastructureMonitor';
export type { InfrastructureComponent, HealthCheckConfig, CustomMetricConfig, AlertThreshold, NotificationChannel, EscalationPolicy, EscalationAction, SuppressionRule, MaintenanceWindow, InfrastructureMetrics, InfrastructureAlert, InfrastructureEvent, MonitoringReport } from './SecurityInfrastructureMonitor';
export { PredictiveSecurityAnalytics, PredictiveAnalyticsFactory, SecurityEvent as PredictiveSecurityEvent, ThreatPrediction, SecurityEventType as PredictiveEventType, ThreatType, ActionType } from './PredictiveSecurityAnalytics';
export { UserBehaviorAnalytics, UserBehaviorAnalyticsFactory, UserBehaviorEvent, BehaviorAnomaly, UserActionType, AnomalyType } from './UserBehaviorAnalytics';
export { MLSecurityAnalyticsFramework, SecurityIntelligence, SecurityAnalyticsConfig, SecurityMetrics as MLSecurityMetrics, Epic31SecurityAnalytics } from './MLSecurityAnalyticsFramework';
export { SecurityAnomalyDetector, SecurityAnomaly, SecurityAlert, AnomalyDetectionConfig, AnomalyType, AnomalySeverity, AlertType, NotificationChannel, EscalationRule, MetricBaseline, SecurityMetric, AnomalyDetectionModel, DetectionModelType } from './SecurityAnomalyDetector';
export { SecurityThreatForecasting, ThreatForecast, ForecastType, SeasonalFactor, TrendComponent, ForecastRiskMetrics, ForecastRecommendation, RecommendationType, ForecastingConfig, ThreatScenario, TimeSeriesData, ForecastAlgorithm, SeasonalPeriod, TrendType } from './SecurityThreatForecasting';
export { SecurityIntelligenceDashboard, SecurityDashboardConfig, SecurityPosture, ThreatLevel, PostureTrend, RiskFactor, RiskCategory, SecurityRecommendation, DashboardWidget, WidgetType, DashboardMetrics, ExecutiveReport, ReportType, ReportFrequency, DashboardAlertThresholds, ReportingSchedule } from './SecurityIntelligenceDashboard';
export { SecurityDataQualityMonitor, DataQualityConfig, QualityThresholds, ValidationRule, ValidationRuleType, ValidationSeverity, DataQualityReport, QualityDimensionScore, QualityDimension, DataQualityViolation, QualityProfile, QualityTrend, QualityRecommendation } from './SecurityDataQualityMonitor';
export { SecurityEventCorrelationEngine, SecurityEventCorrelationFactory, CorrelatedEventGroup, CorrelationRule, CorrelationRuleType, CorrelationCondition, CorrelationOperator, CorrelationAction, CorrelationActionType, EventGroupType, CorrelationEvidence, EvidenceType, ThreatIndicator, IndicatorType, GroupRecommendation, RecommendationType, GroupStatus, CorrelationAnalytics, CorrelationReport } from './SecurityEventCorrelationEngine';
export { SecurityIntelligenceDataPipeline, SecurityIntelligenceDataPipelineFactory, DataPipelineConfig, PipelineStage, StageType, DataSchema, SchemaField, FieldType, DataTransformation, TransformationType, ValidationRule, ValidationRuleType, ValidationSeverity, PipelineExecution, ExecutionStatus, StageExecution, ExecutionError, ErrorType, DataSource, SourceType, DataDestination, DestinationType, PipelineAlert, PipelineAlertType, PipelineMetrics, OutputFormat } from './SecurityIntelligenceDataPipeline';
export { default as RateLimiter } from './RateLimiter';
export { default as ComplianceMonitor } from '../services/ComplianceMonitor';
export { default as AdaptiveThrottlingRules } from './AdaptiveThrottlingRules';
export { default as ComplianceSecurityDashboard } from './dashboard/ComplianceSecurityDashboard';
export { default as SecurityDashboardWorkflow } from './dashboard/SecurityDashboardWorkflow';
export declare };
export declare export declare };
export declare };
export declare };
export declare };
export declare };
export declare export declare export declare         critical_count: number;
        resolved_count: number;
        avg_response_time: number;
    };
    top_threats: Array<{,
        type: string;
        count: number;
    }>;
    affected_systems: Array<{,
        system: string;
        incident_count: number;
    }>;
    recommendations: string[];
};
//# sourceMappingURL=index.d.ts.map