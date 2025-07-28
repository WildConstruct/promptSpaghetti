/**
 * Epic 1 & Epic 17 Security Analytics Integration
 * Epic 31 - Security Integration Framework
 *
 * Integrates security analytics monitoring with existing Epic 1 and Epic 17 infrastructure
 */
import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceMetrics, AggregatedMetrics } from './PerformanceMonitor';
import { Epic17PerformanceMonitor, AdminPerformanceMetric, AdminOperation, SystemIntegration } from '../../server/src/monitoring/Epic17PerformanceMonitor';
import { SecurityAnalyticsMonitor, SecurityAnalyticsMetrics, SecuritySystemHealth } from './SecurityAnalyticsMonitor';
import { SecurityEvent, CrossSystemAlertingSystem } from '../security/AlertingSystem';
export interface IntegratedSecurityMetrics {
    performanceMetrics: {
        nodeExecutionMetrics: PerformanceMetrics;
        aggregatedNodeMetrics: Map<string, AggregatedMetrics>;
        systemPerformance: {
            totalExecutions: number;
            averageExecutionTime: number;
            errorRate: number;
            memoryUsage: number;
        };
    };
    adminMetrics: {
        adminOperationMetrics: AdminPerformanceMetric;
        integrationHealth: Map<SystemIntegration, any>;
        complianceMetrics: {
            auditTrailCompleteness: number;
            policyEnforcementRate: number;
            accessControlCompliance: number;
        };
    };
    securityMetrics: {
        systemHealth: Map<string, SecuritySystemHealth>;
        securityAnalytics: Map<string, SecurityAnalyticsMetrics>;
        threatLandscape: {
            overallThreatLevel: number;
            activeThreats: number;
            mitigatedThreats: number;
            falsePositiveRate: number;
        };
    };
    correlations: {
        performanceSecurityCorrelation: number;
        adminOperationRisk: number;
        systemHealthTrend: 'improving' | 'stable' | 'degrading';
        integratedHealthScore: number;
    };
}
export interface IntegratedAlertRule {
    ruleId: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: {
        performanceConditions?: {
            slowExecutionThreshold: number;
            errorRateThreshold: number;
            memoryThreshold: number;
        };
        adminConditions?: {
            adminOperations: AdminOperation;
            complianceThreshold: number;
            integrationHealthThreshold: number;
        };
        securityConditions?: {
            threatLevelThreshold: number;
            securityEventTypes: SecurityEvent['type'][];
            falsePositiveThreshold: number;
        };
        correlationConditions?: {
            performanceSecurityCorrelation: number;
            healthScoreThreshold: number;
            multiSystemEventWindow: number;
        };
    };
    actions: {
        notifications: Array<{}, type>;
    };
}
export interface IntegratedDashboardData {
    realTimeStatus: {
        timestamp: number;
        overallHealthScore: number;
        systemsOperational: number;
        systemsTotal: number;
        criticalAlertsCount: number;
        activeIncidentsCount: number;
    };
    performanceOverview: {
        nodeExecutions: {
            total: number;
            successful: number;
            failed: number;
            averageTime: number;
        };
        topPerformingNodes: Array<{
            nodeType: string;
            avgTime: number;
        }>;
        bottomPerformingNodes: Array<{
            nodeType: string;
            avgTime: number;
        }>;
        memoryTrend: Array<{
            timestamp: number;
            usage: number;
        }>;
    };
    adminOverview: {
        activeAdminSessions: number;
        recentOperations: Array<{}, operation>;
        AdminOperation: any;
        timestamp: number;
        duration: number;
        success: boolean;
        adminUser: string;
    };
}
export interface IntegrationConfig {
    epic1Integration: {
        enabled: boolean;
        performanceMonitoringInterval: number;
        nodeMetricsCollection: boolean;
        memoryTrackingEnabled: boolean;
    };
    epic17Integration: {
        enabled: boolean;
        adminOperationTracking: boolean;
        integrationHealthMonitoring: boolean;
        complianceMonitoring: boolean;
        auditIntegration: boolean;
    };
    securityIntegration: {
        enabled: boolean;
        threatDetectionEnabled: boolean;
        complianceMonitoring: boolean;
        incidentResponseIntegration: boolean;
        crossSystemCorrelation: boolean;
    };
    correlationSettings: {
        correlationWindow: number;
        confidenceThreshold: number;
        enablePredictiveAnalysis: boolean;
        alertAggregationEnabled: boolean;
    };
    dashboardSettings: {
        refreshInterval: number;
        retentionPeriod: number;
        enableRealTimeUpdates: boolean;
        maxHistoricalDataPoints: number;
    };
}
export declare class Epic1Epic17SecurityIntegration extends EventEmitter {
    private config;
    private epic1Monitor;
    private epic17Monitor;
    private securityMonitor;
    private alertingSystem;
    private integratedMetrics;
    private alertRules;
    private correlationEngine;
    private metricsCollectionInterval?;
    private correlationAnalysisInterval?;
    private dashboardUpdateInterval?;
    constructor();
    config: IntegrationConfig;
    monitors: {
        epic1Monitor: PerformanceMonitor;
        epic17Monitor: Epic17PerformanceMonitor;
        securityMonitor: SecurityAnalyticsMonitor;
        alertingSystem: CrossSystemAlertingSystem;
        super(): any;
    };
}
//# sourceMappingURL=Epic1Epic17SecurityIntegration.d.ts.map