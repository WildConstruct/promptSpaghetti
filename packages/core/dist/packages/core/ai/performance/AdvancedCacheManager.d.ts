/**
 * Advanced Cache Manager for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Intelligent caching system with multiple eviction policies and performance optimization
 */
export interface CacheConfig {
    maxSize: number;
    maxMemoryMB: number;
    defaultTTL: number;
    evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'ADAPTIVE' | 'HYBRID';
    compressionEnabled: boolean;
    persistToDisk: boolean;
    diskCachePath?: string;
    metrics: {
        enabled: boolean;
        reportingInterval: number;
    };
}
export interface CacheItem<T = any> {
    key: string;
    value: T;
    size: number;
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    ttl: number;
    priority: number;
    compressed: boolean;
    metadata: {
        modelType: string;
        inputHash: string;
        responseTime: number;
        cost: number;
    };
}
export interface CacheMetrics {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    memoryUsage: number;
    diskUsage: number;
    averageResponseTime: number;
    totalRequests: number;
    cacheSize: number;
    compressionRatio: number;
    costSavings: number;
}
export interface EvictionStrategy {
    name: string;
    shouldEvict(item: CacheItem, config: CacheConfig): boolean;
    selectItemsForEviction(items: CacheItem, count: number): CacheItem;
    calculatePriority(item: CacheItem): number;
}
export declare class LRUEvictionStrategy implements EvictionStrategy {
    name: string;
    shouldEvict(item: CacheItem, config: CacheConfig): boolean;
}
//# sourceMappingURL=AdvancedCacheManager.d.ts.map