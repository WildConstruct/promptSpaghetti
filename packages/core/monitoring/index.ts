/**
 * Monitoring System
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 * Epic 31 - Security Integration Framework
 * 
 * Comprehensive monitoring system for performance tracking, security analytics, and integrated monitoring
 */

// Core Epic 1 Performance Monitoring
export { 
  PerformanceMonitor 
} from './PerformanceMonitor';

export { 
  PerformanceAnalytics 
} from './PerformanceAnalytics';

export type {
  PerformanceMetrics,
  AggregatedMetrics,
  PerformanceAlert,
  PerformanceMonitorConfig
} from './PerformanceMonitor';

export type {
  PerformanceReport,
  PerformanceBenchmark,
  PerformanceInsight
} from './PerformanceAnalytics';

// Security Analytics Monitoring (Epic 31)
export { default as SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
export type {
  SecurityAnalyticsMetrics,
  SecuritySystemHealth,
  SecurityAnalyticsAlert,
  SecurityAnalyticsConfig
} from './SecurityAnalyticsMonitor';

// Epic 1 & Epic 17 Security Integration
export { default as Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';

// Import Epic1Epic17SecurityIntegration for local use
import { Epic1Epic17SecurityIntegration } from './Epic1Epic17SecurityIntegration';

// Import SecurityAnalyticsMonitor for local use
import { SecurityAnalyticsMonitor } from './SecurityAnalyticsMonitor';
export type {
  IntegratedSecurityMetrics,
  IntegratedAlertRule,
  IntegratedDashboardData,
  IntegrationConfig
} from './Epic1Epic17SecurityIntegration';

// Utility functions for monitoring integration
export   
  return new Epic1Epic17SecurityIntegration(config, {
    epic1Monitor,
    epic17Monitor,
    securityMonitor,
    alertingSystem
  });
};

export   
  return new SecurityAnalyticsMonitor({ ...defaultConfig, ...config });
};

export const createDefaultSecuritySystemHealth = (
  systemId: string,
  systemType: SecuritySystemHealth['systemType']
): SecuritySystemHealth => ({
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
export   systems: Array<{ id: string; type: SecuritySystemHealth['systemType'] }>
): void => {
  systems.forEach(system => {
    const healthStatus = createDefaultSecuritySystemHealth(system.id, system.type);
    monitor.registerSecuritySystem(healthStatus);
  });
};

// Helper function to create integrated dashboard configuration
export 
// Monitoring system health check utility
export   epic17Health: 'healthy' | 'degraded' | 'unhealthy';
  securityHealth: 'healthy' | 'degraded' | 'unhealthy';
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  recommendations: string[];
} => {
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
  const recommendations: string[] = [];
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