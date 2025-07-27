/**
 * Security Integration Framework
 * Epic 31 - Security Integration Framework
 *
 * Unified exports for security monitoring, alerting, and dashboard components
 */
// Core security components
export { default as CrossSystemAlertingSystem } from './AlertingSystem';
export { default as UnifiedMonitoringDashboard } from './UnifiedMonitoringDashboard';
// Epic 31 Security Integration Framework - New Components
export { default as SecurityIncidentResponseService } from './SecurityIncidentResponseService';
export { default as SecurityDataIntegrityMonitor } from './SecurityDataIntegrityMonitor';
export { default as SecurityReliabilityEngineer } from './SecurityReliabilityEngineer';
export { default as SecurityCapacityManager } from './SecurityCapacityManager';
export { default as SecurityFailoverManager } from './SecurityFailoverManager';
export { default as SecurityDisasterRecoveryManager } from './SecurityDisasterRecoveryManager';
export { default as SecurityCostOptimizer } from './SecurityCostOptimizer';
export { default as SecurityDataArchiver } from './SecurityDataArchiver';
export { default as SecuritySystemHealthTracker } from './SecuritySystemHealthTracker';
export { default as SecurityQueryOptimizer } from './SecurityQueryOptimizer';
export { default as SecurityOptimizationTools } from './SecurityOptimizationTools';
export { default as SecurityDataPipelineMonitor } from './SecurityDataPipelineMonitor';
export { default as SecurityQueryPerformanceOptimizer } from './SecurityQueryPerformanceOptimizer';
export { default as SecurityInfrastructureMonitor } from './SecurityInfrastructureMonitor';
// Epic 31 - ML Security Analytics Components (NEW)
export { PredictiveSecurityAnalytics, PredictiveAnalyticsFactory, SecurityEventType as PredictiveEventType, ThreatType, ActionType } from './PredictiveSecurityAnalytics';
export { UserBehaviorAnalytics, UserBehaviorAnalyticsFactory, UserActionType, AnomalyType } from './UserBehaviorAnalytics';
export { MLSecurityAnalyticsFramework, Epic31SecurityAnalytics } from './MLSecurityAnalyticsFramework';
// Epic 31.4.1 & 31.4.2 - Advanced Security Analytics Components (NEW)
export { SecurityAnomalyDetector, AnomalyType, AnomalySeverity, AlertType, DetectionModelType } from './SecurityAnomalyDetector';
export { SecurityThreatForecasting, ForecastType, RecommendationType, ForecastAlgorithm, SeasonalPeriod, TrendType } from './SecurityThreatForecasting';
// Epic 31.4.1 - Security Intelligence Dashboard and Data Analysis Components (NEW)
export { SecurityIntelligenceDashboard, ThreatLevel, RiskCategory, WidgetType, ReportType, ReportFrequency } from './SecurityIntelligenceDashboard';
export { SecurityDataQualityMonitor, ValidationRuleType, ValidationSeverity, QualityDimension } from './SecurityDataQualityMonitor';
// Epic 31.4.1 - Security Event Correlation and Data Pipeline Components (NEW)
export { SecurityEventCorrelationEngine, SecurityEventCorrelationFactory, CorrelationRuleType, CorrelationOperator, CorrelationActionType, EventGroupType, EvidenceType, IndicatorType, RecommendationType, GroupStatus } from './SecurityEventCorrelationEngine';
export { SecurityIntelligenceDataPipeline, SecurityIntelligenceDataPipelineFactory, StageType, FieldType, TransformationType, ValidationRuleType, ValidationSeverity, ExecutionStatus, ErrorType, SourceType, DestinationType, PipelineAlertType, OutputFormat } from './SecurityIntelligenceDataPipeline';
// Re-export existing security components for convenience
export { default as RateLimiter } from './RateLimiter';
export { default as ComplianceMonitor } from '../services/ComplianceMonitor';
export { default as AdaptiveThrottlingRules } from './AdaptiveThrottlingRules';
export { default as ComplianceSecurityDashboard } from './dashboard/ComplianceSecurityDashboard';
export { default as SecurityDashboardWorkflow } from './dashboard/SecurityDashboardWorkflow';
if (threatLevel >= 3)
    return 'medium';
return 'low';
;
export 
// Base severity score
const severityScores = { low: 1, medium: 3, high: 6, critical: 10 };
score += severityScores[event.severity] || 1;
// Impact multipliers
if (event.details?.affected_users && event.details.affected_users.length > 0) {
    score *= 1 + (event.details.affected_users.length / 100);
}
if (event.details?.affected_systems && event.details.affected_systems.length > 1) {
    score *= 1.5;
}
// Historical pattern analysis
if (historicalData) {
    const recentSimilarEvents = historicalData.filter(e => e.type === event.type &&
        e.source === event.source &&
        Date.now() - e.timestamp < 86400000 // Last 24 hours
    );
    if (recentSimilarEvents.length > 3) {
        score *= 2; // Pattern indicates potential attack
    }
}
return Math.min(score, 100); // Cap at 100
;
timeRange: {
    start: number;
    end: number;
}
{
    summary: {
        total_events: number;
        critical_count: number;
        resolved_count: number;
        avg_response_time: number;
    }
    ;
    top_threats: Array;
    affected_systems: Array;
    recommendations: string[];
}
{
    const filteredEvents = events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
    const criticalEvents = filteredEvents.filter(e => e.severity === 'critical');
    const resolvedEvents = filteredEvents.filter(e => e.status === 'resolved');
    const responseTimesMs = resolvedEvents
        .filter(e => e.resolution)
        .map(e => (e.resolution.resolved_at - e.timestamp));
    const avgResponseTime = responseTimesMs.length > 0
        ? responseTimesMs.reduce((sum, time) => sum + time, 0) / responseTimesMs.length
        : 0;
    // Count by type
    const typeCounts = {};
    filteredEvents.forEach(e => {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    const topThreats = Object.entries(typeCounts)
        .map(([type, count]) => ({ type: type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    // Count by affected systems
    const systemCounts = {};
    filteredEvents.forEach(e => {
        e.details.affected_systems.forEach(system => {
            systemCounts[system] = (systemCounts[system] || 0) + 1;
        });
    });
    const affectedSystems = Object.entries(systemCounts)
        .map(([system, incident_count]) => ({ system, incident_count }))
        .sort((a, b) => b.incident_count - a.incident_count);
    // Generate recommendations
    const recommendations = [];
    if (criticalEvents.length > filteredEvents.length * 0.1) {
        recommendations.push('High number of critical events detected - review security posture');
    }
    if (avgResponseTime > 3600000) { // 1 hour
        recommendations.push('Average response time exceeds 1 hour - improve incident response procedures');
    }
    if (topThreats.length > 0 && topThreats[0].count > filteredEvents.length * 0.3) {
        recommendations.push(`${topThreats[0].type} events are dominant - focus prevention efforts here`);
    }
    const unresolvedCount = filteredEvents.filter(e => e.status !== 'resolved').length;
    if (unresolvedCount > filteredEvents.length * 0.2) {
        recommendations.push('High number of unresolved events - ensure adequate staffing');
    }
    return {
        summary: {
            total_events: filteredEvents.length,
            critical_count: criticalEvents.length,
            resolved_count: resolvedEvents.length,
            avg_response_time: avgResponseTime
        },
        top_threats: topThreats,
        affected_systems: affectedSystems,
        recommendations
    };
}
;
