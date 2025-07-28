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
        timestamps: Date;
        responseTime: number;
        throughput: number;
        blockRate: number;
        errorRate: number;
    };
    heatmapData: {
        endpoints: string;
        timeSlots: string;
        activityMatrix: number[];
        blockMatrix: number[];
    };
    geospatialData: {
        locations: Array<{}, latitude>;
        number: any;
        longitude: number;
        requestCount: number;
        blockCount: number;
        threatLevel: ThreatLevel;
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
    affectedEndpoints: string;
    recommendedActions: string;
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
        dimensions?: string;
        metrics?: string;
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
    constructor();
    rateLimitingService: RateLimitingService;
    throttlingEngine?: AdaptiveThrottlingRulesEngine;
    config?: Partial<RateLimitingMetricsConfig>;
    super(): any;
}
//# sourceMappingURL=RateLimitingPerformanceMetrics.d.ts.map