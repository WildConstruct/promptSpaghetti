/**
 * Security Analytics Monitor
 * Epic 31 - Security Integration Framework
 *
 * Extends Epic 1 monitoring infrastructure to cover security analytics systems
 */
import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceAlert } from './PerformanceMonitor';
import { SecurityEvent } from '../security/AlertingSystem';

}
export interface SecurityAnalyticsMetrics {
    threatDetectionMetrics: {
        threatsDetected: number;
        falsePositives: number;
        truePositives: number;
        threatLevel: number;
        detectionAccuracy: number;
        timeToDetection: number;
}
    };
    complianceMetrics: {
        complianceViolations: number;
        auditTrailEntries: number;
        dataAccessEvents: number;
        policyEnforcements: number;
        complianceScore: number;
    };
    accessControlMetrics: {
        authenticationAttempts: number;
        failedAuthentications: number;
        privilegeEscalations: number;
        sessionAnomalies: number;
        accessViolations: number;
    };
    dataProtectionMetrics: {
        encryptionOperations: number;
        dataClassificationEvents: number;
        dataLeakageIncidents: number;
        backupIntegrityChecks: number;
        dataRetentionActions: number;
    };
    incidentResponseMetrics: {
        incidentCount: number;
        meanTimeToDetection: number;
        meanTimeToResponse: number;
        meanTimeToResolution: number;
        escalationRate: number;
    };

}
export interface SecuritySystemHealth {
    systemId: string;
    systemType: 'firewall' | 'ids' | 'siem' | 'auth' | 'compliance' | 'backup' | 'encryption';
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    lastHealthCheck: number;
    healthScore: number;
    responseTime: number;
    errorRate: number;
    uptime: number;
    threatDetectionCapability: number;
    logProcessingRate: number;
    alertProcessingDelay: number;
    ruleSyncStatus: 'synced' | 'syncing' | 'failed';
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    configurationVersion: string;
    lastConfigUpdate: number;
    pendingUpdates: number;

}
export interface SecurityAnalyticsAlert extends PerformanceAlert {
    securityCategory: 'threat_detection' | 'compliance' | 'access_control' | 'data_protection' | 'incident_response';
    affectedSystems: string[];
    threatLevel: number;
    complianceImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
    relatedEvents: string[];

}
export interface SecurityAnalyticsConfig {
    performanceConfig: {
        enableMemoryTracking: boolean;
        enableContextTracking: boolean;
        enableAggregation: boolean;
        enableAlerting: boolean;
        slowExecutionThreshold: number;
        memoryThreshold: number;
}
    };
    securityConfig: {
        enableThreatDetection: boolean;
        enableComplianceMonitoring: boolean;
        enableAccessControlTracking: boolean;
        enableDataProtectionMonitoring: boolean;
        enableIncidentResponseTracking: boolean;
        threatLevelThreshold: number;
        falsePositiveThreshold: number;
        complianceScoreThreshold: number;
        detectionTimeThreshold: number;
        responseTimeThreshold: number;
        healthCheckInterval: number;
        systemHealthThreshold: number;
        alertCorrelationWindow: number;
    };
    integrationConfig: {
        siemIntegration: boolean;
        complianceIntegration: boolean;
        auditIntegration: boolean;
        threatIntelIntegration: boolean;
    };
/**
 * Security Analytics Monitor extending Epic 1 Performance Monitor
 */
export declare class SecurityAnalyticsMonitor extends EventEmitter {
    private performanceMonitor;
    private config;
    private securityMetrics;
    private systemHealthMap;
    private securityAlerts;
    private threatCorrelation;
    private healthCheckInterval?;
    private metricsAggregationInterval?;
    private alertCorrelationInterval?;
    constructor(config?: Partial<SecurityAnalyticsConfig>);
    /**
     * Initialize security monitoring systems
     */
    private initialize;
    /**
     * Register a security system for monitoring
     */
    registerSecuritySystem(systemHealth: SecuritySystemHealth): void;
    /**
     * Record security event for analytics
     */
    recordSecurityEvent(systemId: string, event: SecurityEvent): void;
    /**
     * Update system health status
     */
    updateSystemHealth(systemId: string, healthUpdate: Partial<SecuritySystemHealth>): void;
    /**
     * Get security analytics metrics for a system
     */
    getSecurityMetrics(systemId: string): SecurityAnalyticsMetrics | null;
    /**
     * Get system health status
     */
    getSystemHealth(systemId: string): SecuritySystemHealth | null;
    /**
     * Get all security alerts
     */
    getSecurityAlerts(resolved?: boolean): SecurityAnalyticsAlert[];
    /**
     * Get comprehensive security dashboard data
     */
    getSecurityDashboardData(): {
        overallSecurityHealth: number;
        criticalAlerts: number;
        systemsStatus: {
            healthy: number;
            degraded: number;
            critical: number;
            offline: number;
        };
        threatLevel: number;
        complianceScore: number;
        incidentStats: {
            activeIncidents: number;
            meanDetectionTime: number;
            meanResponseTime: number;
        };
        topThreats: Array<{
            type: string;
            count: number;
        }>;
        systemPerformance: Array<{
            systemId: string;
            healthScore: number;
            responseTime: number;
            threatDetectionRate: number;
        }>;
    };
    /**
     * Generate security analytics report
     */
    generateSecurityReport(timeRange: {)
        start: number;
        end: number;
    }): {
        summary: {
            totalEvents: number;
            threatsDetected: number;
            complianceViolations: number;
            incidentsResolved: number;
            averageResponseTime: number;
        };
        trends: {
            threatTrend: 'increasing' | 'stable' | 'decreasing';
            complianceTrend: 'improving' | 'stable' | 'degrading';
            performanceTrend: 'improving' | 'stable' | 'degrading'
  };
        recommendations: string[];
    };
    /**
     * Get base performance monitor (Epic 1 integration)
     */
    getPerformanceMonitor(): PerformanceMonitor;
    /**
     * Shutdown the security analytics monitor
     */
    shutdown(): void;
    private setupEventForwarding;
    private createEmptySecurityMetrics;
    private updateThreatDetectionMetrics;
    private updateComplianceMetrics;
    private updateAccessControlMetrics;
    private updateDataProtectionMetrics;
    private updateIncidentResponseMetrics;
    private checkSecurityAlerts;
    private checkSystemHealthAlerts;
    private performHealthChecks;
    private aggregateSecurityMetrics;
    private correlateSecurityAlerts;
    private generateAlertId;

export default SecurityAnalyticsMonitor;
//# sourceMappingURL=SecurityAnalyticsMonitor.d.ts.map