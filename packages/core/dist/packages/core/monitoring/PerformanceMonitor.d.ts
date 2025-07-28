/**
 * Performance Monitor
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 *
 * Comprehensive performance monitoring system for node execution tracking and optimization
 */
import { EventEmitter } from 'events';
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
    };
    contextSize: {
        variableCount: number;
        stateCount: number;
        cacheSize: number;
        evaluationDepth: number;
    };
    cacheHit: boolean;
    errors: string;
    warnings: string;
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
    optimizationRecommendations: string;
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
}
export declare class PerformanceMonitor extends EventEmitter {
    private config;
    private metrics;
    private aggregatedMetrics;
    private activeExecutions;
    number: any;
    initialMemory: number;
    nodeId: string;
    nodeType: string;
    executionId: string;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map