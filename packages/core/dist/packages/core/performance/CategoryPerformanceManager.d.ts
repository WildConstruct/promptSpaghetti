/**
 * Category Performance Manager
 * Epic 17 - Implement Category Performance (E17-1753114397436-B9E25A)
 *
 * Advanced performance optimization system categorized by node types and operation patterns
 */
import { EventEmitter } from 'events';
import { PerformanceMonitor } from '../monitoring';
export interface CategoryPerformanceConfig {
    enableCategoryOptimization: boolean;
    enableDynamicThresholds: boolean;
    enablePredictiveScaling: boolean;
    categories: Record<string, CategoryConfig>;
    globalSettings: {
        maxConcurrentOperations: number;
        memoryThreshold: number;
        cpuThreshold: number;
        responseTimeTarget: number;
    };
}
export interface CategoryConfig {
    name: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    optimizationStrategy: 'throughput' | 'latency' | 'memory' | 'balanced';
    resourceLimits: {
        maxMemoryMB: number;
        maxExecutionTimeMs: number;
        maxConcurrentNodes: number;
        queueLimit: number;
    };
    cacheStrategy: {
        enabled: boolean;
        ttlMs: number;
        maxSize: number;
        evictionPolicy: 'lru' | 'lfu' | 'ttl';
    };
    scalingRules: {
        scaleUpThreshold: number;
        scaleDownThreshold: number;
        cooldownMs: number;
        maxInstances: number;
    };
}
export interface CategoryMetrics {
    categoryName: string;
    totalNodes: number;
    activeNodes: number;
    queuedNodes: number;
    averageExecutionTime: number;
    p95ExecutionTime: number;
    throughput: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    cacheHitRate: number;
    optimizationLevel: number;
    bottlenecks: string;
    recommendations: string;
    lastUpdated: number;
}
export interface OptimizationAction {
    id: string;
    category: string;
    action: 'scale_up' | 'scale_down' | 'cache_optimize' | 'throttle' | 'priority_boost';
    reason: string;
    parameters: Record<string, any>;
    expectedImpact: {
        performanceGain: number;
        resourceCost: number;
        confidence: number;
    };
    timestamp: number;
    applied: boolean;
}
export declare class CategoryPerformanceManager extends EventEmitter {
    private config;
    private performanceMonitor;
    private categoryMetrics;
    private nodeQueues;
    private executionPools;
    private optimizationActions;
    private caches;
    private metricsUpdateInterval?;
    constructor(performanceMonitor: PerformanceMonitor, config?: Partial<CategoryPerformanceConfig>);
    /**
     * Initialize category performance management
     */
    private initialize;
}
//# sourceMappingURL=CategoryPerformanceManager.d.ts.map