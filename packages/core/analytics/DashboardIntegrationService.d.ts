/**
 * Dashboard Integration Service - Story 1.5 Task 4
 *
 * Service layer for integrating the real-time dashboard with existing
 * analytics routes and consolidating dashboard functionality.
 */
import { UnifiedEventBus, UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
import { AnalyticsAuthorizationService, AuthContext } from './AnalyticsAuthorization';
import { WebSocketStreamingServer } from './WebSocketStreaming';
import { AnalyticsAdapterManager } from './AnalyticsEventAdapters';
interface DashboardIntegrationConfig {
    enableLegacySupport: boolean;
    migrationMode: 'gradual' | 'immediate' | 'parallel';
    cacheEnabled: boolean;
    cacheTTL: number;
    webhookEndpoints: string[];
    alertingEnabled: boolean;
}
interface LegacyAnalyticsSystem {
    name: string;
    routePath: string;
    dataFormat: 'dao' | 'rest' | 'event';
    migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
    lastSync: number;
    eventCount: number;
    healthStatus: 'healthy' | 'degraded' | 'failing';
}
interface WidgetPerformanceMetrics {
    widgetId: string;
    widgetType: string;
    averageLoadTime: number;
    errorRate: number;
    cacheHitRate: number;
    queryCount: number;
    lastUpdate: number;
}
interface IntegrationStatus {
    totalSystems: number;
    integratedSystems: number;
    migrationProgress: number;
    activeConnections: number;
    eventThroughput: number;
    systemHealth: number;
    lastHealthCheck: number;
}
/**
 * Dashboard Integration Service
 *
 * Manages the integration between the unified dashboard and existing analytics systems
 */
export declare class DashboardIntegrationService {
    private eventBus;
    private eventRepository;
    private authService;
    private wsServer;
    private adapters;
    private config;
    private legacySystems;
    private performanceMetrics;
    private integrationCache;
    constructor();
      eventBus: UnifiedEventBus,
      eventRepository: EventRepository,
      authService: AnalyticsAuthorizationService,
      wsServer: WebSocketStreamingServer,
      adapters: AnalyticsAdapterManager,
      config?: Partial<DashboardIntegrationConfig>
    );
    /**
     * Initialize legacy analytics systems mapping
     */
    private initializeLegacySystems;
    /**
     * Setup performance monitoring for dashboard widgets
     */
    private setupPerformanceMonitoring;
    /**
     * Get consolidated dashboard data from all integrated systems
     */
    getConsolidatedDashboardData(filter: EventFilter, authContext: AuthContext, cacheKey?: string): Promise<{
        metrics: unknown;
        events: UnifiedAnalyticsEvent[];
        timeSeriesData: unknown[];
        integrationStatus: IntegrationStatus;
    }>;
    /**
     * Calculate consolidated metrics from all systems
     */
    private calculateConsolidatedMetrics;
    /**
     * Calculate business metrics from consolidated data
     */
    private calculateBusinessMetrics;
    /**
     * Get integration status for all systems
     */
    getIntegrationStatus(): Promise<IntegrationStatus>;
    /**
     * Get widget-specific performance data
     */
    getWidgetPerformanceData();
      widgetId: string,
      widgetType: string,
      filter: EventFilter,
      authContext: AuthContext,
    ): Promise<any>;
    /**
     * Get performance widget data from performance monitoring system
     */
    private getPerformanceWidgetData;
    /**
     * Get integration widget data from all integrated systems
     */
    private getIntegrationWidgetData;
    /**
     * Get business widget data from revenue and user analytics
     */
    private getBusinessWidgetData;
    /**
     * Get security widget data from security monitoring systems
     */
    private getSecurityWidgetData;
    /**
     * Get standard widget data using event repository
     */
    private getStandardWidgetData;
    /**
     * Migrate legacy analytics route to unified dashboard
     */
    migrateLegacyRoute(systemName: string, routePath: string): Promise<boolean>;
    /**
     * Simulate migration process (placeholder)
     */
    private simulateMigration;
    /**
     * Health check for all integrated systems
     */
    performHealthCheck(): Promise<void>;
    /**
     * Check individual system health
     */
    private checkSystemHealth;
    /**
     * Helper Methods
     */
    private getCachedData;
    private setCachedData;
    private cleanupCache;
    private updateWidgetPerformance;
    private updatePerformanceMetrics;
    private calculateSystemHealthPenalty;
    private getLegacySystemsStatus;
    private getAggregatedPerformanceMetrics;
    /**
     * Public API Methods
     */
    /**
     * Get integration status summary
     */
    getIntegrationSummary(): {
        legacySystems: LegacyAnalyticsSystem[];
        performanceMetrics: WidgetPerformanceMetrics[];
        integrationStatus: unknown;
    };
    /**
     * Force refresh of system health checks
     */
    refreshSystemHealth(): Promise<void>;
    /**
     * Clear integration cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        totalEntries: number;
        hitRate: number;
        memoryUsage: number;
    };
}
export default DashboardIntegrationService;
//# sourceMappingURL=DashboardIntegrationService.d.ts.map