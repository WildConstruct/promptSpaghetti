/**
 * Advanced Cache Manager for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Intelligent caching system with multiple eviction policies and performance optimization
 */

}
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
}
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
    selectItemsForEviction(items: CacheItem[], count: number): CacheItem[];
    calculatePriority(item: CacheItem): number;

export declare class LRUEvictionStrategy implements EvictionStrategy {
    name: string;
    shouldEvict(item: CacheItem, config: CacheConfig): boolean;
    selectItemsForEviction(items: CacheItem[], count: number): CacheItem[];
    calculatePriority(item: CacheItem): number;

export declare class LFUEvictionStrategy implements EvictionStrategy {
    name: string;
    shouldEvict(item: CacheItem, config: CacheConfig): boolean;
    selectItemsForEviction(items: CacheItem[], count: number): CacheItem[];
    calculatePriority(item: CacheItem): number;

export declare class AdaptiveEvictionStrategy implements EvictionStrategy {
    name: string;
    private performanceHistory;
    shouldEvict(item: CacheItem, config: CacheConfig): boolean;
    selectItemsForEviction(items: CacheItem[], count: number): CacheItem[];
    calculatePriority(item: CacheItem): number;
    private getItemPerformance;
    private calculateAgeThreshold;
    private calculateEvictionScore;
    recordPerformance(key: string, responseTime: number, success: boolean): void;

export declare class AdvancedCacheManager {
    private cache;
    private config;
    private evictionStrategy;
    private metrics;
    private metricsTimer?;
    private compressionWorker?;
    constructor(config: CacheConfig);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: {)
        ttl?: number;
        priority?: number;
        metadata?: Partial<CacheItem['metadata']>;
}
    }): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    getMetrics(): CacheMetrics;
    getSize(): number;
    getMemoryUsage(): number;
    optimize(): Promise<{
        itemsEvicted: number;
        memoryFreed: number;
        optimizationTime: number;
    }>;
    analyzeHitPatterns(): {
        topKeys: Array<{
            key: string;
            hitRate: number;
            accessCount: number;
        }>;
        lowPerformanceKeys: Array<{
            key: string;
            performance: number;
        }>;
        recommendations: string[];
    };
    private createEvictionStrategy;
    private ensureCapacity;
    private performEviction;
    private defragmentCache;
    private recomputePriorities;
    private calculateSize;
    private hashInput;
    private compress;
    private decompress;
    private initializeMetrics;
    private recordHit;
    private recordMiss;
    private updateHitRate;
    private updateMetrics;
    private startMetricsReporting;
    private reportMetrics;
    private initializeCompression;
    destroy(): void;

export default AdvancedCacheManager;
//# sourceMappingURL=AdvancedCacheManager.d.ts.map