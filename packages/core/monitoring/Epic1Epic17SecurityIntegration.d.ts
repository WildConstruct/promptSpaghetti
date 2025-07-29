/**
 * Epic 1 & Epic 17 Security Analytics Integration
 * Epic 31 - Security Integration Framework
 *
 * Integrates security analytics monitoring with existing Epic 1 and Epic 17 infrastructure
 */
import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceMetrics, AggregatedMetrics } from './PerformanceMonitor';
import { Epic17PerformanceMonitor, AdminPerformanceMetric, AdminOperation, SystemIntegration, ComplianceLevel } from '../../server/src/monitoring/Epic17PerformanceMonitor';
import { SecurityAnalyticsMonitor, SecurityAnalyticsMetrics, SecuritySystemHealth } from './SecurityAnalyticsMonitor';
import { SecurityEvent, CrossSystemAlertingSystem } from '../security/AlertingSystem';

export interface IntegratedSecurityMetrics {
    performanceMetrics: {
        nodeExecutionMetrics: PerformanceMetrics[];
        aggregatedNodeMetrics: Map<string, AggregatedMetrics>;
        systemPerformance: {
            totalExecutions: number;
            averageExecutionTime: number;
            errorRate: number;
            memoryUsage: number;
        };
    };
    adminMetrics: {
        adminOperationMetrics: AdminPerformanceMetric[];
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
            adminOperations: AdminOperation[];
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
        notifications: Array<{,
            type: 'email' | 'slack' | 'webhook' | 'admin_dashboard' | 'security_dashboard';
            target: string;
            priority: 'low' | 'normal' | 'high' | 'critical'
  }>;
        automaticMitigation?: {
            scaleResources: boolean;
            isolateComponents: boolean;
            escalateToAdmin: boolean;
            triggerIncidentResponse: boolean;
        };
        complianceActions?: {
            createAuditEntry: boolean;
            notifyComplianceTeam: boolean;
            lockAffectedResources: boolean;
        };
    };
    metadata: {
        createdBy: string;
        createdAt: number;
        lastModified: number;
        category: 'performance' | 'security' | 'compliance' | 'operational';
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
  };

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
        topPerformingNodes: Array<{,
            nodeType: string;
            avgTime: number;
        }>;
        bottomPerformingNodes: Array<{,
            nodeType: string;
            avgTime: number;
        }>;
        memoryTrend: Array<{,
            timestamp: number;
            usage: number;
        }>;
    };
    adminOverview: {
        activeAdminSessions: number;
        recentOperations: Array<{,
            operation: AdminOperation;
            timestamp: number;
            duration: number;
            success: boolean;
            adminUser: string;
        }>;
        integrationStatus: Array<{,
            integration: SystemIntegration;
            status: 'healthy' | 'degraded' | 'unhealthy';
            responseTime: number;
        }>;
        complianceScore: number;
    };
    securityOverview: {
        threatLevel: number;
        activeSecurityAlerts: number;
        securitySystemsHealth: Array<{,
            systemId: string;
            healthScore: number;
            status: 'healthy' | 'degraded' | 'critical' | 'offline'
  }>;
        recentSecurityEvents: Array<{,
            type: SecurityEvent['type'];
            severity: SecurityEvent['severity'];
            timestamp: number;
            source: string;
        }>;
    };
    crossSystemInsights: {
        correlatedEvents: Array<{,
            type: 'performance_security' | 'admin_security' | 'performance_admin';
            description: string;
            confidence: number;
            timestamp: number;
            affectedSystems: string[];
        }>;
        recommendations: Array<{,
            category: 'performance' | 'security' | 'admin' | 'compliance';
            priority: 'low' | 'medium' | 'high' | 'critical';
            title: string;
            description: string;
            estimatedImpact: string;
        }>;
        riskAssessment: {
            overallRisk: 'low' | 'medium' | 'high' | 'critical';
            riskFactors: Array<{,
                factor: string;
                impact: number;
                likelihood: number;
                mitigation: string;
            }>;
        };
    };

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
/**
 * Integrated monitoring system combining Epic 1, Epic 17, and Security Analytics
 */
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
    constructor(config: IntegrationConfig, monitors: {)
        epic1Monitor: PerformanceMonitor;
        epic17Monitor: Epic17PerformanceMonitor;
        securityMonitor: SecurityAnalyticsMonitor;
        alertingSystem: CrossSystemAlertingSystem;
    });
    /**
     * Initialize the integrated monitoring system
     */
    initialize(): Promise<void>;
    /**
     * Get integrated dashboard data
     */
    getIntegratedDashboardData(): IntegratedDashboardData;
    /**
     * Record integrated security event spanning multiple systems
     */
    recordIntegratedSecurityEvent(event: SecurityEvent, context: {)
        performanceImpact?: {
            nodeId?: string;
            executionTime?: number;
            memoryUsage?: number;
        };
        adminContext?: {
            adminOperation?: AdminOperation;
            adminUserId?: string;
            complianceImpact?: ComplianceLevel;
        };
    }): void;
    /**
     * Create integrated alert rule spanning multiple systems
     */
    createIntegratedAlertRule(rule: Omit<IntegratedAlertRule, 'ruleId' | 'metadata'>): string;
    /**
     * Generate comprehensive integrated report
     */
    generateIntegratedReport(timeRange: {)
        start: number;
        end: number;
    }): Promise<{
        summary: {
            reportId: string;
            generatedAt: number;
            timeRange: {
                start: number;
                end: number;
            };
            overallHealthScore: number;
            systemsAnalyzed: number;
            criticalIssuesFound: number;
        };
        performanceAnalysis: {
            totalExecutions: number;
            averagePerformance: number;
            performanceTrend: 'improving' | 'stable' | 'degrading';
            topBottlenecks: string[];
        };
        adminAnalysis: {
            adminOperationsCount: number;
            complianceScore: number;
            integrationHealthScore: number;
            criticalAdminAlerts: number;
        };
        securityAnalysis: {
            threatsDetected: number;
            securityScore: number;
            vulnerabilitiesFound: number;
            incidentResponseTime: number;
        };
        correlationAnalysis: {
            correlatedEvents: number;
            riskFactors: Array<{,
                factor: string;
                severity: number;
            }>;
            predictiveInsights: string[];
        };
        recommendations: Array<{,
            category: string;
            priority: 'low' | 'medium' | 'high' | 'critical';
            recommendation: string;
            estimatedEffort: string;
            expectedBenefit: string;
        }>;
    }>;
    /**
     * Shutdown the integrated monitoring system
     */
    shutdown(): void;
    private initializeIntegratedMetrics;
    private setupEventListeners;
    private startIntegratedMonitoring;
    private setupEpic1Integration;
    private setupEpic17Integration;
    private setupSecurityIntegration;
    private setupDefaultAlertRules;
    private handleEpic1Event;
    private handleEpic1Alert;
    private handleEpic17Event;
    private handleSecurityEvent;
    private handleSecurityAlert;
    private collectIntegratedMetrics;
    private performCorrelationAnalysis;
    private updateDashboardData;
    private checkIntegratedAlertRules;
    private evaluateIntegratedRule;
    private triggerIntegratedAlert;
    private calculateIntegratedHealthScore;
    private getOperationalSystemsCount;
    private getTotalSystemsCount;
    private getCriticalAlertsCount;
    private getActiveIncidentsCount;
    private getMemoryTrend;
    private getRecentAdminOperations;
    private getRecentSecurityEvents;
    private generateIntegratedRecommendations;
    private performRiskAssessment;
    private collectEpic1Data;
    private collectEpic17Data;
    private collectSecurityData;
    private performIntegratedAnalysis;

export default Epic1Epic17SecurityIntegration;
//# sourceMappingURL=Epic1Epic17SecurityIntegration.d.ts.map