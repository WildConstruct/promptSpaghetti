/**
 * Performance Optimization System
 * Epic 35.1.6 - Performance Optimization
 *
 * Unified exports for all performance optimization components
 */
export { default as AdvancedCacheManager } from './AdvancedCacheManager';
export type { CacheConfig, CacheItem, CacheMetrics, EvictionStrategy } from './AdvancedCacheManager';
export { default as LoadBalancer } from './LoadBalancer';
export type { LoadBalancerConfig, ModelInstance, LoadBalancingRequest, LoadBalancingResult } from './LoadBalancer';
export { default as PerformanceMonitor } from './PerformanceMonitor';
export type { PerformanceMetrics, PerformanceAlert, PerformanceThreshold, MonitoringConfig, ModelPerformanceData, PerformanceReport } from './PerformanceMonitor';
export { default as ResourceOptimizer } from './ResourceOptimizer';
export type { ResourceUsage, OptimizationStrategy, ResourceOptimizationConfig, ModelResourceProfile } from './ResourceOptimizer';
export { LRUEvictionStrategy, LFUEvictionStrategy, AdaptiveEvictionStrategy } from './AdvancedCacheManager';
interface CacheConfig {
    maxSize: number;
    maxMemoryMB: number;
    defaultTTL: number;
    evictionPolicy: string;
    compressionEnabled: boolean;
    persistToDisk: boolean;
    metrics: {
        enabled: boolean;
        reportingInterval?: number;
    };
}
interface LoadBalancerConfig {
    maxRetries: number;
    strategy: string;
    healthCheckInterval?: number;
    failoverThreshold?: number;
    timeoutMs?: number;
    maxConcurrentRequests?: number;
    enableFailover?: boolean;
}
interface MonitoringConfig {
    enabled: boolean;
    interval: number;
    collectionInterval?: number;
    retentionPeriod?: number;
    alerting?: boolean;
}
interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    averageResponseTime?: number;
    successRate?: number;
    totalCost?: number;
}
interface CacheMetrics {
    hitRate: number;
    size: number;
    memoryUsage?: number;
}
interface ResourceUsage {
    memory: number;
    cpu: number;
    disk: number;
    network: number;
}
interface ResourceOptimizationConfig {
    enabled: boolean;
    monitoringInterval: number;
    optimizationThresholds: {
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        responseTime: number;
    };
    strategies: {
        memoryOptimization: boolean;
        cpuOptimization: boolean;
        cacheOptimization: boolean;
        modelCompression: boolean;
        modelPooling?: boolean;
        requestBatching?: boolean;
    };
}
export declare export declare export declare export declare export declare     successRateAverage: number;
    costTrend: "increasing" | "decreasing" | "stable";
    recommendations: string[];
};
export declare export declare     categories: {
        caching: {
            score: number;
            recommendations: string[];
        };
        performance: {
            score: number;
            recommendations: string[];
        };
        resources: {
            score: number;
            recommendations: string[];
        };
    };
    priorityActions: string[];
};
//# sourceMappingURL=index.d.ts.map