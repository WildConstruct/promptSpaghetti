/**
 * Performance Optimization System
 * Epic 35.1.6 - Performance Optimization
 * 
 * Unified exports for all performance optimization components
 */

// Core performance management
export { default as AdvancedCacheManager } from './AdvancedCacheManager';
export type {
  CacheConfig,
  CacheItem,
  CacheMetrics,
  EvictionStrategy
} from './AdvancedCacheManager';

export { default as LoadBalancer } from './LoadBalancer';
export type {
  LoadBalancerConfig,
  ModelInstance,
  LoadBalancingRequest,
  LoadBalancingResult
} from './LoadBalancer';

export { default as PerformanceMonitor } from './PerformanceMonitor';
export type {
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceThreshold,
  MonitoringConfig,
  ModelPerformanceData,
  PerformanceReport
} from './PerformanceMonitor';

export { default as ResourceOptimizer } from './ResourceOptimizer';
export type {
  ResourceUsage,
  OptimizationStrategy,
  ResourceOptimizationConfig,
  ModelResourceProfile
} from './ResourceOptimizer';

// Eviction strategies
export {
  LRUEvictionStrategy,
  LFUEvictionStrategy,
  AdaptiveEvictionStrategy
} from './AdvancedCacheManager';

// Utility functions for performance optimization
export const createDefaultCacheConfig = (): CacheConfig => ({
  maxSize: 1000,
  maxMemoryMB: 500,
  defaultTTL: 3600000, // 1 hour
  evictionPolicy: 'ADAPTIVE',
  compressionEnabled: true,
  persistToDisk: false,
  metrics: {
    enabled: true,
    reportingInterval: 60000 // 1 minute
  }
});

export const createDefaultLoadBalancerConfig = (): LoadBalancerConfig => ({
  strategy: 'adaptive',
  healthCheckInterval: 30000, // 30 seconds
  failoverThreshold: 3,
  maxRetries: 3,
  timeoutMs: 30000,
  circuitBreakerEnabled: true,
  metricsCollection: true
});

export const createDefaultMonitoringConfig = (): MonitoringConfig => ({
  enabled: true,  
  collectionInterval: 10000, // 10 seconds
  retentionPeriod: 86400000, // 24 hours
  alerting: {
    enabled: true
  },
  thresholds: [],
  sampling: {
    enabled: true,
    rate: 0.1 // 10% sampling
  },
  storage: {
    type: 'memory'
  }
});

export const createDefaultResourceOptimizationConfig = (): ResourceOptimizationConfig => ({
  enabled: true,
  monitoringInterval: 15000, // 15 seconds
  optimizationThresholds: {
    memoryUsage: 0.8, // 80%
    cpuUsage: 80, // 80%
    diskUsage: 0.9, // 90%
    responseTime: 10000 // 10 seconds
  },
  strategies: {
    memoryOptimization: true,
    modelPooling: true,
    requestBatching: true,
    dynamicScaling: true,
    intelligentCaching: true,
    resourcePreemption: false
  },
  limits: {
    maxMemoryUsage: 2 * 1024 * 1024 * 1024, // 2GB
    maxConcurrentRequests: 100,
    maxModelInstances: 10,
    maxCacheSize: 500 * 1024 * 1024 // 500MB
  }
});

// Performance analysis utilities
export const analyzePerformanceMetrics = (metrics: PerformanceMetrics[]): {
  averageResponseTime: number;
  successRateAverage: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
} => {
  if (metrics.length === 0) {
    return {
      averageResponseTime: 0,
      successRateAverage: 0,
      costTrend: 'stable',
      recommendations: []
    };
  }

  const averageResponseTime = metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length;
  const successRateAverage = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  
  // Determine cost trend
  let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (metrics.length >= 2) {
    const recentCosts = metrics.slice(-5).map(m => m.totalCost);
    const earlyAvg = recentCosts.slice(0, Math.floor(recentCosts.length / 2)).reduce((sum, c) => sum + c, 0) / Math.floor(recentCosts.length / 2);
    const lateAvg = recentCosts.slice(Math.floor(recentCosts.length / 2)).reduce((sum, c) => sum + c, 0) / Math.ceil(recentCosts.length / 2);
    
    if (lateAvg > earlyAvg * 1.1) costTrend = 'increasing';
    else if (lateAvg < earlyAvg * 0.9) costTrend = 'decreasing';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageResponseTime > 5000) {
    recommendations.push('Consider implementing caching to reduce response times');
  }
  
  if (successRateAverage < 0.95) {
    recommendations.push('Investigate error patterns and implement retry mechanisms');
  }
  
  if (costTrend === 'increasing') {
    recommendations.push('Monitor cost increases and optimize model usage');
  }
  
  const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;
  if (avgErrorRate > 0.05) {
    recommendations.push('High error rate detected - review model health and configuration');
  }

  return {
    averageResponseTime,
    successRateAverage,
    costTrend,
    recommendations
  };
};

export const calculateResourceEfficiency = (usage: ResourceUsage, performance: PerformanceMetrics): number => {
  // Calculate efficiency score based on resource usage vs performance
  const memoryEfficiency = 1 - usage.memory.percentage;
  const cpuEfficiency = 1 - (usage.cpu.usage / 100);
  const performanceScore = performance.successRate * (1 / Math.max(performance.averageResponseTime / 1000, 0.1));
  
  return (memoryEfficiency * 0.3) + (cpuEfficiency * 0.3) + (performanceScore * 0.4);
};

export const generateOptimizationReport = (
  cacheMetrics: CacheMetrics,
  performanceMetrics: PerformanceMetrics[],
  resourceUsage: ResourceUsage
): {
  overallScore: number;
  categories: {
    caching: { score: number; recommendations: string[] };
    performance: { score: number; recommendations: string[] };
    resources: { score: number; recommendations: string[] };
  };
  priorityActions: string[];
} => {
  // Cache analysis
  const cacheScore = cacheMetrics.hitRate * 100;
  const cacheRecommendations: string[] = [];
  
  if (cacheMetrics.hitRate < 0.6) {
    cacheRecommendations.push('Low cache hit rate - consider increasing cache size or TTL');
  }
  if (cacheMetrics.memoryUsage / (1024 * 1024) > 400) {
    cacheRecommendations.push('High cache memory usage - consider compression or eviction optimization');
  }

  // Performance analysis
  const perfAnalysis = analyzePerformanceMetrics(performanceMetrics);
  const performanceScore = perfAnalysis.successRateAverage * 100;
  
  // Resource analysis
  const resourceScore = calculateResourceEfficiency(resourceUsage, performanceMetrics[performanceMetrics.length - 1] || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    diskIOUsage: 0,
    tokensProcessed: 0,
    tokensPerSecond: 0,
    costPerRequest: 0,
    totalCost: 0,
    successRate: 0,
    errorRate: 0,
    timeoutRate: 0,
    retryRate: 0,
    timestamp: Date.now(),
    windowStart: Date.now(),
    windowEnd: Date.now()
  }) * 100;
  
  const overallScore = (cacheScore + performanceScore + resourceScore) / 3;
  
  // Priority actions
  const priorityActions: string[] = [];
  if (cacheScore < 50) priorityActions.push('Optimize caching strategy');
  if (performanceScore < 80) priorityActions.push('Address performance issues');
  if (resourceScore < 60) priorityActions.push('Optimize resource usage');
  
  return {
    overallScore,
    categories: {
      caching: { score: cacheScore, recommendations: cacheRecommendations },
      performance: { score: performanceScore, recommendations: perfAnalysis.recommendations },
      resources: { score: resourceScore, recommendations: ['Monitor resource utilization trends'] }
    },
    priorityActions
  };
};