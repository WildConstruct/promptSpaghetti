/**
 * AI Model Manager - Intelligent Loading and Caching System
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Advanced model lifecycle management with lazy loading, caching, and resource optimization
 */
import { BaseAIModel } from './BaseAIModel';
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'hybrid';
    enablePersistence?: boolean;
    persistencePath?: string;
}
export interface LoadBalancingConfig {
    strategy: 'round-robin' | 'least-connections' | 'response-time' | 'cost-aware' | 'capability-based';
    healthCheckInterval: number;
    maxConcurrentRequests: number;
    enableFailover: boolean;
    failoverThreshold: number;
}
export interface ModelPool {
    id: string;
    models: BaseAIModel;
    loadBalancer: LoadBalancer;
    healthMonitor: HealthMonitor;
    currentLoad: number;
    lastUsed: Date;
}
export interface ModelPerformanceMetrics {
    modelId: string;
    averageLatency: number;
    throughput: number;
    errorRate: number;
    concurrentRequests: number;
    totalRequests: number;
    costPerRequest: number;
    lastUpdated: Date;
}
export interface WarmupStrategy {
    enabled: boolean;
    concurrency: number;
    sampleRequests: unknown;
    timeout: number;
}
export declare class ModelCache {
    private cache;
    private config;
    private evictionTimer?;
    constructor(config: CacheConfig);
    private _evictModel;
    private _findLRUVictim;
    private _findLFUVictim;
    private _findTTLVictim;
    private _findHybridVictim;
    private _startEvictionTimer;
    private _cleanupExpiredEntries;
}
//# sourceMappingURL=ModelManager.d.ts.map