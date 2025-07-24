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
export declare const createDefaultCacheConfig: () => CacheConfig;
export declare const createDefaultLoadBalancerConfig: () => LoadBalancerConfig;
export declare const createDefaultMonitoringConfig: () => MonitoringConfig;
export declare const createDefaultResourceOptimizationConfig: () => ResourceOptimizationConfig;
export declare const analyzePerformanceMetrics: (metrics: PerformanceMetrics[]) => {
    averageResponseTime: number;
    successRateAverage: number;
    costTrend: "increasing" | "decreasing" | "stable";
    recommendations: string[];
};
export declare const calculateResourceEfficiency: (usage: ResourceUsage, performance: PerformanceMetrics) => number;
export declare const generateOptimizationReport: (cacheMetrics: CacheMetrics, performanceMetrics: PerformanceMetrics[], resourceUsage: ResourceUsage) => {
    overallScore: number;
    categories: {
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