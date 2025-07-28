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
}
//# sourceMappingURL=ExecutionCache.d.ts.map