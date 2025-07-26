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
import { Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';
import { SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
export type { IntegratedSecurityMetrics, IntegratedAlertRule, IntegratedDashboardData, IntegrationConfig } from './Epic1Epic17SecurityIntegration';
export declare export declare export declare export declare export declare export declare     epic17Health: "healthy" | "degraded" | "unhealthy";
    securityHealth: "healthy" | "degraded" | "unhealthy";
    overallHealth: "healthy" | "degraded" | "unhealthy";
    recommendations: string[];
};
//# sourceMappingURL=index.d.ts.map