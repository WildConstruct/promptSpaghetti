/**
 * Monitoring System
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 * Epic 31 - Security Integration Framework
 *
 * Comprehensive monitoring system for performance tracking, security analytics, and integrated monitoring
 */
// Core Epic 1 Performance Monitoring
export { PerformanceMonitor } from './PerformanceMonitor';
export { PerformanceAnalytics } from './PerformanceAnalytics';
// Security Analytics Monitoring (Epic 31)
export { default as SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
// Epic 1 & Epic 17 Security Integration
export { default as Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';
// Import Epic1Epic17SecurityIntegration for local use
import { Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';
// Import SecurityAnalyticsMonitor for local use
import { SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
// Utility functions for monitoring integration
export const createIntegratedMonitoringSystem = (epic1Monitor, epic17Monitor, // Epic17PerformanceMonitor from server
securityMonitor, alertingSystem // CrossSystemAlertingSystem
) => {
    const config = {
        epic1Integration: {
            enabled: true,
            performanceMonitoringInterval: 30000,
            nodeMetricsCollection: true,
            memoryTrackingEnabled: true
        },
        epic17Integration: {
            enabled: true,
            adminOperationTracking: true,
            integrationHealthMonitoring: true,
            complianceMonitoring: true,
            auditIntegration: true
        },
        securityIntegration: {
            enabled: true,
            threatDetectionEnabled: true,
            complianceMonitoring: true,
            incidentResponseIntegration: true,
            crossSystemCorrelation: true
        },
        correlationSettings: {
            correlationWindow: 300000, // 5 minutes
            confidenceThreshold: 0.7,
            enablePredictiveAnalysis: true,
            alertAggregationEnabled: true
        },
        dashboardSettings: {
            refreshInterval: 10000, // 10 seconds
            retentionPeriod: 86400000, // 24 hours
            enableRealTimeUpdates: true,
            maxHistoricalDataPoints: 1000
        }
    };
    return new Epic1Epic17SecurityIntegration(config, {
        epic1Monitor,
        epic17Monitor,
        securityMonitor,
        alertingSystem
    });
};
export const createSecurityAnalyticsMonitor = (config) => {
    const defaultConfig = {
        performanceConfig: {
            enableMemoryTracking: true,
            enableContextTracking: true,
            enableAggregation: true,
            enableAlerting: true,
            slowExecutionThreshold: 1000,
            memoryThreshold: 50 * 1024 * 1024
        },
        securityConfig: {
            enableThreatDetection: true,
            enableComplianceMonitoring: true,
            enableAccessControlTracking: true,
            enableDataProtectionMonitoring: true,
            enableIncidentResponseTracking: true,
            threatLevelThreshold: 7,
            falsePositiveThreshold: 0.1,
            complianceScoreThreshold: 85,
            detectionTimeThreshold: 30000,
            responseTimeThreshold: 300000,
            healthCheckInterval: 30000,
            systemHealthThreshold: 80,
            alertCorrelationWindow: 300000
        },
        integrationConfig: {
            siemIntegration: true,
            complianceIntegration: true,
            auditIntegration: true,
            threatIntelIntegration: false
        }
    };
    return new SecurityAnalyticsMonitor({ ...defaultConfig, ...config });
};
export const createDefaultSecuritySystemHealth = (systemId, systemType) => ({
    systemId,
    systemType,
    status: 'healthy',
    lastHealthCheck: Date.now(),
    healthScore: 95,
    responseTime: 150,
    errorRate: 0.01,
    uptime: 0.999,
    threatDetectionCapability: 85,
    logProcessingRate: 1000,
    alertProcessingDelay: 500,
    ruleSyncStatus: 'synced',
    cpuUsage: 25,
    memoryUsage: 40,
    diskUsage: 60,
    networkLatency: 50,
    configurationVersion: '1.0.0',
    lastConfigUpdate: Date.now() - 86400000, // 24 hours ago
    pendingUpdates: 0
});
// Helper function to register security systems with the monitor
export const registerSecuritySystems = (monitor, systems) => {
    systems.forEach(system => {
        const healthStatus = createDefaultSecuritySystemHealth(system.id, system.type);
        monitor.registerSecuritySystem(healthStatus);
    });
};
// Helper function to create integrated dashboard configuration
export const createIntegratedDashboardConfig = () => ({
    refreshInterval: 10000, // 10 seconds for real-time updates
    retentionPeriod: 86400000, // 24 hours of data retention
    enableRealTimeUpdates: true,
    maxHistoricalDataPoints: 1000
});
// Monitoring system health check utility
export const performMonitoringSystemHealthCheck = (integration) => {
    const dashboardData = integration.getIntegratedDashboardData();
    // Evaluate individual system health
    const epic1Health = dashboardData.performanceOverview.nodeExecutions.failed >
        dashboardData.performanceOverview.nodeExecutions.total * 0.1 ? 'unhealthy' : 'healthy';
    const epic17Health = dashboardData.adminOverview.complianceScore < 80 ? 'unhealthy' : 'healthy';
    const securityHealth = dashboardData.securityOverview.threatLevel > 7 ? 'unhealthy' :
        dashboardData.securityOverview.threatLevel > 4 ? 'degraded' : 'healthy';
    // Determine overall health
    const healthLevels = [epic1Health, epic17Health, securityHealth];
    const overallHealth = healthLevels.includes('unhealthy') ? 'unhealthy' :
        healthLevels.includes('degraded') ? 'degraded' : 'healthy';
    // Generate recommendations
    const recommendations = [];
    if (epic1Health !== 'healthy') {
        recommendations.push('Review Epic 1 performance metrics and optimize slow nodes');
    }
    if (epic17Health !== 'healthy') {
        recommendations.push('Address Epic 17 compliance issues and admin operation performance');
    }
    if (securityHealth !== 'healthy') {
        recommendations.push('Investigate security threats and strengthen security posture');
    }
    return {
        epic1Health,
        epic17Health,
        securityHealth,
        overallHealth,
        recommendations
    };
};
