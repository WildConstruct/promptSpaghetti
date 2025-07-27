/**
 * Rate Limiting Performance Metrics Visualization System
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * This module provides comprehensive performance metrics visualization for the
 * rate limiting system, including real-time monitoring, historical analysis,
 * and interactive dashboards for security teams.
 */
import { EventEmitter } from 'events';
import { RateLimitingService, ThreatLevel } from './RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from './AdaptiveThrottlingRules';
export interface RateLimitingMetricsConfig {
    enableRealTimeMetrics: boolean;
    metricsRetentionPeriod: number;
    performanceThresholds: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        blockRate: number;
    };
    visualizationOptions: {
        enableCharts: boolean;
        enableHeatmaps: boolean;
        enableTimeseries: boolean;
        enableGeospatialMaps: boolean;
        refreshInterval: number;
    };
    alerting: {
        enableAlerts: boolean;
        alertThresholds: {
            highResponseTime: number;
            lowThroughput: number;
            highErrorRate: number;
            highBlockRate: number;
        };
    };
}
export interface PerformanceMetrics {
    timestamp: Date;
    responseTime: {
        average: number;
        p50: number;
        p95: number;
        p99: number;
        max: number;
    };
    throughput: {
        requestsPerSecond: number;
        allowedPerSecond: number;
        blockedPerSecond: number;
        throttledPerSecond: number;
    };
    errorRates: {
        totalRequests: number;
        blockedRequests: number;
        errorRequests: number;
        blockRate: number;
        errorRate: number;
    };
    resourceUtilization: {
        memoryUsage: number;
        cpuUsage: number;
        cacheHitRate: number;
        activeConnections: number;
    };
    threatMetrics: {
        threatDistribution: Record<ThreatLevel, number>;
        suspiciousActivities: number;
        blockedThreats: number;
        adaptiveAdjustments: number;
    };
}
export interface MetricsVisualizationData {
    timeSeriesData: {
        timestamps: Date[];
        responseTime: number[];
        throughput: number[];
        blockRate: number[];
        errorRate: number[];
    };
    heatmapData: {
        endpoints: string[];
        timeSlots: string[];
        activityMatrix: number[][];
        blockMatrix: number[][];
    };
    geospatialData: {
        locations: Array<{
            latitude: number;
            longitude: number;
            requestCount: number;
            blockCount: number;
            threatLevel: ThreatLevel;
        }>;
    };
    distributionData: {
        endpointDistribution: Record<string, number>;
        threatLevelDistribution: Record<ThreatLevel, number>;
        responseTimeDistribution: Array<{
            range: string;
            count: number;
        }>;
        userAgentDistribution: Record<string, number>;
    };
}
export interface AlertCondition {
    alertId: string;
    timestamp: Date;
    alertType: 'performance' | 'security' | 'capacity' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    condition: string;
    currentValue: number;
    threshold: number;
    affectedEndpoints: string[];
    recommendedActions: string[];
    metadata: Record<string, unknown>;
}
export interface DashboardWidget {
    widgetId: string;
    widgetType: 'chart' | 'gauge' | 'table' | 'heatmap' | 'map' | 'counter';
    title: string;
    description: string;
    dataSource: string;
    refreshInterval: number;
    config: {
        chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
        timeRange?: string;
        aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
        filters?: Record<string, unknown>;
        dimensions?: string[];
        metrics?: string[];
    };
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export declare class RateLimitingPerformanceMetrics extends EventEmitter {
    private rateLimitingService;
    private throttlingEngine?;
    private config;
    private metricsHistory;
    private currentMetrics;
    private activeAlerts;
    private dashboardWidgets;
    private metricsCollectionTimer?;
    private startTime;
    constructor(rateLimitingService: RateLimitingService, throttlingEngine?: AdaptiveThrottlingRulesEngine, config?: Partial<RateLimitingMetricsConfig>);
    /**
     * Start real-time metrics collection
     */
    startMetricsCollection(): void;
    /**
     * Stop metrics collection
     */
    stopMetricsCollection(): void;
    /**
     * Collect current performance metrics
     */
    private collectCurrentMetrics;
    /**
     * Calculate response time metrics
     */
    private calculateResponseTimes;
    /**
     * Calculate throughput metrics
     */
    private calculateThroughputMetrics;
    /**
     * Calculate error and block rate metrics
     */
    private calculateErrorMetrics;
    /**
     * Get resource utilization metrics
     */
    private getResourceUtilization;
    /**
     * Calculate threat-related metrics
     */
    private calculateThreatMetrics;
    /**
     * Generate time series data for charts
     */
    generateTimeSeriesData(timeRange?: string): MetricsVisualizationData['timeSeriesData'];
    /**
     * Generate heatmap data for endpoint activity
     */
    generateHeatmapData(): MetricsVisualizationData['heatmapData'];
    /**
     * Generate geospatial data for request origins
     */
    generateGeospatialData(): MetricsVisualizationData['geospatialData'];
    /**
     * Generate distribution data for various metrics
     */
    generateDistributionData(): MetricsVisualizationData['distributionData'];
    /**
     * Get complete visualization data
     */
    getVisualizationData(timeRange?: string): MetricsVisualizationData;
    /**
     * Initialize default dashboard widgets
     */
    private initializeDefaultWidgets;
    /**
     * Add or update a dashboard widget
     */
    addWidget(widget: DashboardWidget): void;
    /**
     * Remove a dashboard widget
     */
    removeWidget(widgetId: string): boolean;
    /**
     * Get all dashboard widgets
     */
    getWidgets(): DashboardWidget[];
    /**
     * Get widget data for rendering
     */
    getWidgetData(widgetId: string): any;
    /**
     * Check for alert conditions
     */
    private checkAlertConditions;
    /**
     * Create and manage alerts
     */
    private createAlert;
    /**
     * Get all active alerts
     */
    getActiveAlerts(): AlertCondition[];
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Create empty metrics object
     */
    private createEmptyMetrics;
    /**
     * Clean up old metrics data
     */
    private cleanupOldMetrics;
    /**
     * Set up event listeners for rate limiting service
     */
    private setupEventListeners;
    /**
     * Get comprehensive system status
     */
    getSystemStatus(): {
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        metrics: PerformanceMetrics;
        alerts: AlertCondition[];
        systemInfo: {
            version: string;
            environment: string;
            configuredEndpoints: number;
            metricsCollected: number;
        };
    };
    /**
     * Export metrics data for external analysis
     */
    exportMetrics(format?: 'json' | 'csv'): string;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default RateLimitingPerformanceMetrics;
//# sourceMappingURL=RateLimitingPerformanceMetrics.d.ts.map