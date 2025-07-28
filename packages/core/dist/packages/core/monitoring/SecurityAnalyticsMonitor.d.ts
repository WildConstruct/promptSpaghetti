/**
 * Security Analytics Monitor
 * Epic 31 - Security Integration Framework
 *
 * Extends Epic 1 monitoring infrastructure to cover security analytics systems
 */
import { EventEmitter } from 'events';
import { PerformanceAlert } from './PerformanceMonitor';
export interface SecurityAnalyticsMetrics {
    threatDetectionMetrics: {
        threatsDetected: number;
        falsePositives: number;
        truePositives: number;
        threatLevel: number;
        detectionAccuracy: number;
        timeToDetection: number;
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
    affectedSystems: string;
    threatLevel: number;
    complianceImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string;
    relatedEvents: string;
}
export interface SecurityAnalyticsConfig {
    performanceConfig: {
        enableMemoryTracking: boolean;
        enableContextTracking: boolean;
        enableAggregation: boolean;
        enableAlerting: boolean;
        slowExecutionThreshold: number;
        memoryThreshold: number;
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
}
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
    private setupEventForwarding;
    private createEmptySecurityMetrics;
    details: {
        complianceScore: metrics.complianceMetrics.complianceScore;
        systemId: any;
    };
    resolved: false;
    affectedSystems: [systemId];
    threatLevel: 5;
    complianceImpact: 'critical';
    recommendedActions: ['Review compliance policies', 'Audit recent changes', 'Train staff'];
    relatedEvents: [event.id];
}
export default SecurityAnalyticsMonitor;
//# sourceMappingURL=SecurityAnalyticsMonitor.d.ts.map