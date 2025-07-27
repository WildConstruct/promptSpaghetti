/**
 * Preview State Store
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 *
 * Centralized state management for real-time preview functionality with
 * synchronization, caching, and performance optimizations.
 */
// Generate hash for graph objects for caching
const generateGraphHash = (graph) => {
    try {
        // Simple hash generation based on graph structure
        const graphString = JSON.stringify({
            nodes: graph.nodes?.map((n) => ({ id: n.id, type: n.type, data: n.data })) || [],
            edges: graph.edges?.map((e) => ({ id: e.id, source: e.source, target: e.target })) || []
        });
        return btoa(graphString).substring(0, 16);
    }
    catch {
        return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
// Default performance metrics
const defaultPerformanceMetrics = {
    totalExecutionTime: 0,
    averageExecutionTime: 0,
    cacheHitRate: 0,
    lastExecutionCount: 0
};
set({ lastUpdateTimestamp: Date.now() });
setAggregateError: (aggregateError) => set({ aggregateError }),
    setPerformanceStats;
(performanceStats) => set({ performanceStats }),
    // Real-time sync actions
    updateGraphHash;
(hash) => {
    const state = get();
    if (state.lastGraphHash !== hash) {
        set({
            lastGraphHash: hash,
            lastUpdateTimestamp: Date.now()
        });
    }
},
    enableRealTimeSync;
(enabled) => set({ isRealTimeEnabled: enabled }),
    setSyncInterval;
(interval) => set({ syncInterval: Math.max(100, interval) }),
    // Cache management
    getCachedResults;
(graphHash) => {
    const state = get();
    const cached = state.cache.get(graphHash);
    if (!cached)
        return null;
    // Check if cache is expired
    const isExpired = Date.now() - cached.timestamp > state.cacheExpirationMs;
    if (isExpired) {
        state.cache.delete(graphHash);
        return null;
    }
    // Update cache hit rate
    const currentMetrics = state.performanceMetrics;
    const totalRequests = currentMetrics.lastExecutionCount + 1;
    const cacheHits = Math.round(currentMetrics.cacheHitRate * currentMetrics.lastExecutionCount) + 1;
    set({
        performanceMetrics: {
            ...currentMetrics,
            cacheHitRate: cacheHits / totalRequests,
            lastExecutionCount: totalRequests
        }
    });
    return cached;
},
    setCachedResults;
(graphHash, results, stats) => {
    const state = get();
    const newCache = new Map(state.cache);
    // Add new cache entry
    newCache.set(graphHash, {
        graphHash,
        timestamp: Date.now(),
        results: [...results],
        performanceStats: stats ? { ...stats } : null
    });
    // Prune cache if needed
    if (newCache.size > state.maxCacheSize) {
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
    }
    set({ cache: newCache });
},
    clearCache;
() => set({ cache: new Map() }),
    pruneCacheByAge;
() => {
    const state = get();
    const newCache = new Map();
    const cutoffTime = Date.now() - state.cacheExpirationMs;
    for (const [key, value] of state.cache.entries()) {
        if (value.timestamp > cutoffTime) {
            newCache.set(key, value);
        }
    }
    set({ cache: newCache });
},
    pruneCacheBySize;
() => {
    const state = get();
    if (state.cache.size <= state.maxCacheSize)
        return;
    const entries = Array.from(state.cache.entries())
        .sort(([, a], [, b]) => b.timestamp - a.timestamp)
        .slice(0, state.maxCacheSize);
    set({ cache: new Map(entries) });
},
    // Result management
    lockResult;
(index, note) => {
    const state = get();
    const updatedResults = [...state.results];
    if (updatedResults[index]) {
        updatedResults[index] = {
            ...updatedResults[index],
            locked: true,
            lockedAt: Date.now(),
            lockedNote: note
        };
    }
    set({
        results: updatedResults,
        lockedResults: [...state.lockedResults, index]
    });
},
    unlockResult;
(index) => {
    const state = get();
    const updatedResults = [...state.results];
    if (updatedResults[index]) {
        updatedResults[index] = {
            ...updatedResults[index],
            locked: false,
            lockedAt: undefined,
            lockedNote: undefined
        };
    }
    set({
        results: updatedResults,
        lockedResults: state.lockedResults.filter(i => i !== index)
    });
},
    setRegeneratingResult;
(index, regenerating) => {
    const state = get();
    const updatedRegenerating = regenerating
        ? [...state.regeneratingResults, index]
        : state.regeneratingResults.filter(i => i !== index);
    set({ regeneratingResults: updatedRegenerating });
},
    // Performance monitoring
    updatePerformanceMetrics;
(newMetrics) => {
    const state = get();
    set({
        performanceMetrics: {
            ...state.performanceMetrics,
            ...newMetrics
        }
    });
},
    addPerformanceSnapshot;
() => {
    const state = get();
    const newHistory = [
        ...state.performanceHistory,
        {
            ...state.performanceMetrics,
            timestamp: Date.now()
        }
    ].slice(-state.maxHistoryLength);
    set({ performanceHistory: newHistory });
},
    getPerformanceInsights;
() => {
    const state = get();
    const history = state.performanceHistory;
    if (history.length < 2) {
        return {
            trend: 'stable',
            bottlenecks: [],
            recommendations: ['Need more data for analysis']
        };
    }
    const recent = history.slice(-5);
    const avgRecent = recent.reduce((sum, h) => sum + h.averageExecutionTime, 0) / recent.length;
    const avgOlder = history.slice(-10, -5).reduce((sum, h) => sum + h.averageExecutionTime, 0) / Math.max(1, history.length - 5);
    const trend = avgRecent > avgOlder * 1.1 ? 'degrading' :
        avgRecent < avgOlder * 0.9 ? 'improving' : 'stable';
    const bottlenecks = [];
    const recommendations = [];
    if (state.performanceMetrics.cacheHitRate < 0.3) {
        bottlenecks.push('Low cache hit rate');
        recommendations.push('Consider increasing cache size or adjusting refresh patterns');
    }
    if (state.performanceMetrics.averageExecutionTime > 1000) {
        bottlenecks.push('Slow execution time');
        recommendations.push('Optimize graph complexity or enable parallel processing');
    }
    if (state.performanceMetrics.networkLatency && state.performanceMetrics.networkLatency > 500) {
        bottlenecks.push('High network latency');
        recommendations.push('Consider local caching or server optimization');
    }
    return { trend, bottlenecks, recommendations };
},
    // Auto-refresh
    setAutoRefresh;
(enabled, interval) => {
    const updates = { autoRefreshEnabled: enabled };
    if (interval !== undefined) {
        updates.autoRefreshInterval = Math.max(1000, interval);
    }
    set(updates);
},
    shouldAutoRefresh;
(changeSignificance = 0) => {
    const state = get();
    if (!state.autoRefreshEnabled)
        return false;
    if (state.isLoading)
        return false;
    const timeSinceLastUpdate = Date.now() - state.lastUpdateTimestamp;
    const intervalPassed = timeSinceLastUpdate > state.autoRefreshInterval;
    const significantChange = changeSignificance > state.autoRefreshThreshold;
    return intervalPassed || significantChange;
},
    // Utility actions
    resetState;
() => {
    set({
        isLoading: false,
        error: null,
        results: [],
        aggregateError: null,
        performanceStats: null,
        lockedResults: [],
        regeneratingResults: [],
        lastUpdateTimestamp: 0,
        performanceMetrics: defaultPerformanceMetrics
    });
},
    getStateSnapshot;
() => {
    const state = get();
    return {
        results: state.results,
        lockedResults: state.lockedResults,
        performanceStats: state.performanceStats,
        lastGraphHash: state.lastGraphHash,
        lastUpdateTimestamp: state.lastUpdateTimestamp,
        performanceMetrics: state.performanceMetrics
    };
},
    restoreFromSnapshot;
(snapshot) => {
    set({
        results: snapshot.results || [],
        lockedResults: snapshot.lockedResults || [],
        performanceStats: snapshot.performanceStats || null,
        lastGraphHash: snapshot.lastGraphHash || null,
        lastUpdateTimestamp: snapshot.lastUpdateTimestamp || 0,
        performanceMetrics: snapshot.performanceMetrics || defaultPerformanceMetrics
    });
};
{
    name: 'preview-state-store',
        partialize;
    (state) => ({
        // Only persist essential state
        isRealTimeEnabled: state.isRealTimeEnabled,
        syncInterval: state.syncInterval,
        autoRefreshEnabled: state.autoRefreshEnabled,
        autoRefreshInterval: state.autoRefreshInterval,
        maxCacheSize: state.maxCacheSize,
        cacheExpirationMs: state.cacheExpirationMs
    });
}
;
// Utility hooks for common state selections
export export export 
// Performance monitoring hook
export const usePreviewPerformance = () => usePreviewStore(state => state.performanceMetrics);
