/**
 * Monitoring System
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 * Epic 31 - Security Integration Framework
 *
 * Comprehensive monitoring system for performance tracking, security analytics, and integrated monitoring
 */
export { PerformanceMonitor } from './PerformanceMonitor';
export { PerformanceAnalytics } from './PerformanceAnalytics';
export type { PerformanceMetrics, AggregatedMetrics, PerformanceAlert, PerformanceMonitorConfig } from './PerformanceMonitor';
export type { PerformanceReport, PerformanceBenchmark, PerformanceInsight } from './PerformanceAnalytics';
export { default as SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
export type { SecurityAnalyticsMetrics, SecuritySystemHealth, SecurityAnalyticsAlert, SecurityAnalyticsConfig } from './SecurityAnalyticsMonitor';
export { default as Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';
export type { IntegratedSecurityMetrics, IntegratedAlertRule, IntegratedDashboardData, IntegrationConfig } from './Epic1Epic17SecurityIntegration';
export declare const createIntegratedMonitoringSystem: (epic1Monitor: PerformanceMonitor, epic17Monitor: any, // Epic17PerformanceMonitor from server
securityMonitor: SecurityAnalyticsMonitor, alertingSystem: any) => Epic1Epic17SecurityIntegration;
export declare const createSecurityAnalyticsMonitor: (config?: Partial<SecurityAnalyticsConfig>) => SecurityAnalyticsMonitor;
export declare const createDefaultSecuritySystemHealth: (systemId: string, systemType: SecuritySystemHealth["systemType"]) => SecuritySystemHealth;
export declare const registerSecuritySystems: (monitor: SecurityAnalyticsMonitor, systems: Array<{
    id: string;
    type: SecuritySystemHealth["systemType"];
}>) => void;
export declare const createIntegratedDashboardConfig: () => IntegrationConfig["dashboardSettings"];
export declare const performMonitoringSystemHealthCheck: (integration: Epic1Epic17SecurityIntegration) => {
    epic1Health: "healthy" | "degraded" | "unhealthy";
    epic17Health: "healthy" | "degraded" | "unhealthy";
    securityHealth: "healthy" | "degraded" | "unhealthy";
    overallHealth: "healthy" | "degraded" | "unhealthy";
    recommendations: string[];
};
//# sourceMappingURL=index.d.ts.map