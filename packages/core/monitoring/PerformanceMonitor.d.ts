/**
 * Performance Monitor
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 *
 * Comprehensive performance monitoring system for node execution tracking and optimization
 */
import { EventEmitter } from 'events';
import { AdvancedExecutionContext } from '../runtime/advanced';

}
export interface PerformanceMetrics {
    nodeId: string;
    nodeType: string;
    executionId: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage: {
        before: number;
        after: number;
        peak: number;
        delta: number;
}
    };
    contextSize: {
        variableCount: number;
        stateCount: number;
        cacheSize: number;
        evaluationDepth: number;
    };
    cacheHit: boolean;
    errors: string[];
    warnings: string[];
    customMetrics: Map<string, number | string | boolean>;

}
export interface AggregatedMetrics {
    nodeType: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    medianDuration: number;
    p95Duration: number;
    p99Duration: number;
    averageMemoryDelta: number;
    peakMemoryUsage: number;
    averageContextSize: number;
    cacheHitRate: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
    lastUpdated: number;
    optimizationRecommendations: string[];

}
export interface PerformanceAlert {
    id: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'duration' | 'memory' | 'error_rate' | 'context_size' | 'custom';
    nodeType?: string;
    nodeId?: string;
    message: string;
    details: Record<string, any>;
    resolved: boolean;

}
export interface PerformanceMonitorConfig {
    enableMemoryTracking: boolean;
    enableContextTracking: boolean;
    enableAggregation: boolean;
    enableAlerting: boolean;
    slowExecutionThreshold: number;
    memoryThreshold: number;
    contextSizeThreshold: number;
    errorRateThreshold: number;
    maxMetricsHistory: number;
    aggregationInterval: number;
    retentionPeriod: number;
    alertCooldown: number;
    maxAlerts: number;
/**
 * Comprehensive performance monitoring system
 */
export declare class PerformanceMonitor extends EventEmitter {
    private config;
    private metrics;
    private aggregatedMetrics;
    private activeExecutions;
    private alerts;
    private aggregationInterval?;
    private cleanupInterval?;
    constructor(config?: Partial<PerformanceMonitorConfig>);
    /**
     * Start monitoring a node execution
     */
    startExecution(nodeId: string, nodeType: string, context: AdvancedExecutionContext): string;
    /**
     * End monitoring a node execution
     */
    endExecution();
      trackingId: string,
      context: AdvancedExecutionContext,
      result?: any,
      error?: Error
    ): PerformanceMetrics | null;
    /**
     * Get metrics for a specific node
     */
    getNodeMetrics(nodeId: string): PerformanceMetrics[];
    /**
     * Get aggregated metrics for a node type
     */
    getAggregatedMetrics(nodeType: string): AggregatedMetrics | null;
    /**
     * Get all active alerts
     */
    getAlerts(resolved?: boolean): PerformanceAlert[];
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string): boolean;
    /**
     * Get performance statistics summary
     */
    getStatisticsSummary(): {
        totalExecutions: number;
        activeExecutions: number;
        averageExecutionTime: number;
        slowExecutions: number;
        errorRate: number;
        memoryPressure: number;
        activeAlerts: number;
        topPerformingTypes: string[];
        underperformingTypes: string[];
}
    };
    /**
     * Clear all metrics and reset the monitor
     */
    clear(): void;
    /**
     * Shutdown the performance monitor
     */
    shutdown(): void;
    private initialize;
    private getMemoryUsage;
    private analyzeContextSize;
    private determineCacheHit;
    private analyzePerformance;
    private storeMetrics;
    private checkAlerts;
    private updateAggregatedMetrics;
    private calculateAggregation;
    private cleanup;
    private generateExecutionId;
    private generateAlertId;

export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map