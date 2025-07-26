/**
 * Optimized Execution Cache System
 * Eliminates redundant node map rebuilding and provides persistent caching
 */
import { OptimizedGraphStorage } from './OptimizedGraphStorage';
/**
 * High-performance execution cache with intelligent invalidation
 */
export class ExecutionCache {
    static instance;
    // Graph state cache - persistent between executions
    graphStateCache = new Map();
    // Result cache with LRU eviction
    resultCache = new Map();
    resultCacheOrder = []; // LRU order
    // Performance tracking
    metrics = {
        totalExecutions: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageExecutionTime: 0,
        cacheSize: 0,
        memoryUsage: 0
    };
    // Configuration
    MAX_RESULT_CACHE_SIZE = 1000;
    MAX_CACHE_AGE = 30 * 60 * 1000; // 30 minutes
    MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB
    constructor() { }
    static getInstance() {
        if (!ExecutionCache.instance) {
            ExecutionCache.instance = new ExecutionCache();
        }
        return ExecutionCache.instance;
    }
    /**
     * Get optimized graph storage with persistent node map
     */
    async getOptimizedGraph(nodes, edges, graphId) {
        const startTime = performance.now();
        const currentHash = this.calculateGraphHash(nodes, edges);
        const cacheKey = graphId || currentHash;
        // Check if we have a cached state
        const cachedState = this.graphStateCache.get(cacheKey);
        if (cachedState && cachedState.lastGraphHash === currentHash) {
            // Cache hit - return cached storage
            const storage = new OptimizedGraphStorage(nodes, edges);
            this.metrics.cacheHits++;
            return {
                storage,
                isFromCache: true,
                nodeMap: cachedState.nodeMap
            };
        }
        // Cache miss - create new optimized storage
        const storage = new OptimizedGraphStorage(nodes, edges);
        const nodeMap = new Map();
        nodes.forEach(node => nodeMap.set(node.id, node));
        // Update cache
        this.graphStateCache.set(cacheKey, {
            nodeMap,
            runtimeNodes: new Map(),
            lastGraphHash: currentHash,
            lastUpdate: Date.now()
        });
        this.metrics.cacheMisses++;
        this.metrics.totalExecutions++;
        console.log(`Graph cache ${cachedState ? 'miss (updated)' : 'miss (new)'} - ${performance.now() - startTime}ms`);
        return {
            storage,
            isFromCache: false,
            nodeMap
        };
    }
    /**
     * Cache execution result with dependency tracking
     */
    async cacheExecutionResult(key, result, dependencies, executionTime, inputs, seed) {
        const cacheEntry = {
            result,
            timestamp: Date.now(),
            executionTime,
            dependencies: new Set(dependencies),
            inputs,
            seed,
            hitCount: 0
        };
        // Add to cache with LRU management
        this.addToResultCache(key, cacheEntry);
        this.updateMetrics();
    }
    /**
     * Get cached execution result if valid
     */
    async getCachedResult(key, currentInputs, currentSeed) {
        const cached = this.resultCache.get(key);
        if (!cached) {
            return null;
        }
        // Check if cache is too old
        const age = Date.now() - cached.timestamp;
        if (age > this.MAX_CACHE_AGE) {
            this.resultCache.delete(key);
            this.removeFromLRU(key);
            return null;
        }
        // Check if inputs match (for deterministic results)
        if (currentInputs && !this.inputsMatch(cached.inputs, currentInputs)) {
            return null;
        }
        // Check if seed matches
        if (currentSeed !== undefined && cached.seed !== currentSeed) {
            return null;
        }
        // Check if dependencies are still valid
        if (this.areDependenciesValid(cached.dependencies)) {
            // Cache hit!
            cached.hitCount++;
            this.updateLRU(key);
            this.metrics.cacheHits++;
            return {
                result: cached.result,
                fromCache: true,
                executionTime: cached.executionTime
            };
        }
        else {
            // Dependencies changed - invalidate
            this.invalidateResult(key);
            return null;
        }
    }
    /**
     * Invalidate cache entries based on changed nodes
     */
    invalidateByNodes(changedNodeIds) {
        const changedSet = new Set(changedNodeIds);
        const keysToInvalidate = [];
        for (const [key, cached] of this.resultCache) {
            // Check if any dependencies were changed
            for (const depId of cached.dependencies) {
                if (changedSet.has(depId)) {
                    keysToInvalidate.push(key);
                    break;
                }
            }
        }
        keysToInvalidate.forEach(key => this.invalidateResult(key));
        console.log(`Invalidated ${keysToInvalidate.length} cached results due to node changes`);
    }
    /**
     * Get cache performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Clear all caches
     */
    clearAll() {
        this.graphStateCache.clear();
        this.resultCache.clear();
        this.resultCacheOrder = [];
        this.metrics = {
            totalExecutions: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageExecutionTime: 0,
            cacheSize: 0,
            memoryUsage: 0
        };
    }
    /**
     * Memory-aware cache cleanup
     */
    cleanupIfNeeded() {
        const currentMemory = this.estimateMemoryUsage();
        if (currentMemory > this.MEMORY_THRESHOLD) {
            this.performCleanup();
        }
    }
    /**
     * Get cache size statistics
     */
    getSizeStats() {
        let oldestTimestamp = Date.now();
        for (const cached of this.resultCache.values()) {
            if (cached.timestamp < oldestTimestamp) {
                oldestTimestamp = cached.timestamp;
            }
        }
        return {
            graphCacheEntries: this.graphStateCache.size,
            resultCacheEntries: this.resultCache.size,
            estimatedMemoryMB: Math.round(this.estimateMemoryUsage() / 1024 / 1024),
            oldestEntry: oldestTimestamp < Date.now() ? oldestTimestamp : undefined
        };
    }
    // Private methods
    calculateGraphHash(nodes, edges) {
        // Fast hash calculation for graph structure
        const nodeHashes = nodes.map(n => `${n.id}:${n.type}:${JSON.stringify(n.data)}`);
        const edgeHashes = edges.map(e => `${e.id}:${e.source}:${e.target}`);
        const combined = nodeHashes.concat(edgeHashes).sort().join('|');
        // Simple hash function (could be improved with crypto.subtle for better distribution)
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    addToResultCache(key, entry) {
        // Remove if already exists
        if (this.resultCache.has(key)) {
            this.removeFromLRU(key);
        }
        // Add to cache and LRU order
        this.resultCache.set(key, entry);
        this.resultCacheOrder.unshift(key);
        // Evict if over limit
        while (this.resultCache.size > this.MAX_RESULT_CACHE_SIZE) {
            const oldestKey = this.resultCacheOrder.pop();
            if (oldestKey) {
                this.resultCache.delete(oldestKey);
            }
        }
    }
    updateLRU(key) {
        // Move to front of LRU order
        const index = this.resultCacheOrder.indexOf(key);
        if (index > 0) {
            this.resultCacheOrder.splice(index, 1);
            this.resultCacheOrder.unshift(key);
        }
    }
    removeFromLRU(key) {
        const index = this.resultCacheOrder.indexOf(key);
        if (index >= 0) {
            this.resultCacheOrder.splice(index, 1);
        }
    }
    inputsMatch(cached, current) {
        if (cached === current)
            return true;
        if (typeof cached !== typeof current)
            return false;
        if (typeof cached === 'object' && cached !== null && current !== null) {
            const cachedKeys = Object.keys(cached).sort();
            const currentKeys = Object.keys(current).sort();
            if (cachedKeys.length !== currentKeys.length)
                return false;
            if (cachedKeys.some((key, i) => key !== currentKeys[i]))
                return false;
            return cachedKeys.every(key => this.inputsMatch(cached[key], current[key]));
        }
        return false;
    }
    areDependenciesValid(dependencies) {
        // Check if any dependency nodes have been modified
        // This would need to integrate with the graph change tracking system
        // For now, assume valid (could be enhanced with version tracking)
        return true;
    }
    invalidateResult(key) {
        this.resultCache.delete(key);
        this.removeFromLRU(key);
    }
    updateMetrics() {
        this.metrics.cacheSize = this.resultCache.size;
        this.metrics.memoryUsage = this.estimateMemoryUsage();
        // Calculate hit rate
        const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
        if (totalRequests > 0) {
            // Update running average of execution time
            // This would be more accurate with actual timing data
        }
    }
    estimateMemoryUsage() {
        let size = 0;
        // Estimate graph state cache size
        for (const state of this.graphStateCache.values()) {
            size += state.nodeMap.size * 200; // Rough estimate per node
            size += state.runtimeNodes.size * 100; // Rough estimate per runtime node
        }
        // Estimate result cache size
        for (const cached of this.resultCache.values()) {
            size += JSON.stringify(cached.result).length * 2; // UTF-16
            size += cached.dependencies.size * 10; // Dependency IDs
            size += JSON.stringify(cached.inputs || {}).length * 2;
        }
        return size;
    }
    performCleanup() {
        const now = Date.now();
        const keysToRemove = [];
        // Remove old entries
        for (const [key, cached] of this.resultCache) {
            const age = now - cached.timestamp;
            if (age > this.MAX_CACHE_AGE || cached.hitCount === 0) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => this.invalidateResult(key));
        // Remove unused graph states
        const graphKeysToRemove = [];
        for (const [key, state] of this.graphStateCache) {
            const age = now - state.lastUpdate;
            if (age > this.MAX_CACHE_AGE * 2) { // Keep graph cache longer
                graphKeysToRemove.push(key);
            }
        }
        graphKeysToRemove.forEach(key => this.graphStateCache.delete(key));
        console.log(`Cache cleanup: removed ${keysToRemove.length} results, ${graphKeysToRemove.length} graph states`);
    }
}
