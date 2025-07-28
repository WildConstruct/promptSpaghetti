/**
 * Optimized Execution Cache System
 * Eliminates redundant node map rebuilding and provides persistent caching
 */
import { Node, Edge } from 'reactflow';
import { OptimizedGraphStorage } from './OptimizedGraphStorage';
/**
 * Cache performance metrics
 */
interface CacheMetrics {
    totalExecutions: number;
    cacheHits: number;
    cacheMisses: number;
    averageExecutionTime: number;
    cacheSize: number;
    memoryUsage: number;
}
/**
 * High-performance execution cache with intelligent invalidation
 */
export declare class ExecutionCache {
    private static instance;
    private graphStateCache;
    private resultCache;
    private resultCacheOrder;
    private metrics;
    private readonly MAX_RESULT_CACHE_SIZE;
    private readonly MAX_CACHE_AGE;
    private readonly MEMORY_THRESHOLD;
    private constructor();
    static getInstance(): ExecutionCache;
    /**
     * Get optimized graph storage with persistent node map
     */
    getOptimizedGraph(nodes: Node[], edges: Edge[], graphId?: string): Promise<{
        storage: OptimizedGraphStorage;
        isFromCache: boolean;
        nodeMap: Map<string, Node>;
    }>;
    /**
     * Cache execution result with dependency tracking
     */
    cacheExecutionResult()
      key: string,
      result: any,
      dependencies: string[],
      executionTime: number,
      inputs?: any,
      seed?: string | number
    ): Promise<void>;
    /**
     * Get cached execution result if valid
     */
    getCachedResult(key: string, currentInputs?: any, currentSeed?: string | number): Promise<{
        result: any;
        fromCache: boolean;
        executionTime: number;
    } | null>;
    /**
     * Invalidate cache entries based on changed nodes
     */
    invalidateByNodes(changedNodeIds: string[]): void;
    /**
     * Get cache performance metrics
     */
    getMetrics(): CacheMetrics;
    /**
     * Clear all caches
     */
    clearAll(): void;
    /**
     * Memory-aware cache cleanup
     */
    cleanupIfNeeded(): void;
    /**
     * Get cache size statistics
     */
    getSizeStats(): {
        graphCacheEntries: number;
        resultCacheEntries: number;
        estimatedMemoryMB: number;
        oldestEntry?: number;
    };
    private calculateGraphHash;
    private addToResultCache;
    private updateLRU;
    private removeFromLRU;
    private inputsMatch;
    private areDependenciesValid;
    private invalidateResult;
    private updateMetrics;
    private estimateMemoryUsage;
    private performCleanup;
}
export {};
//# sourceMappingURL=ExecutionCache.d.ts.map