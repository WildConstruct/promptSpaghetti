/**
 * Preview State Store
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 *
 * Centralized state management for real-time preview functionality with
 * synchronization, caching, and performance optimizations.
 */
export interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
    usedNodeIds?: string[];
    usedEdgeIds?: string[];
    executionTimeMs?: number;
    executionPath?: any;
    weightChoices?: Array<{
        nodeId: string;
        selectedOption: any;
        availableOptions: any[];
        weights?: number[];
        selectionProbability?: number;
    }>;
    locked?: boolean;
    lockedAt?: number;
    lockedNote?: string;
    debugInfo?: {
        nodeExecutionOrder: string[];
        randomChoices: any[];
        performanceBreakdown: any;
        memoryUsage?: any;
    };
}
export interface PreviewCache {
    graphHash: string;
    timestamp: number;
    results: PreviewResult[];
    performanceStats: {
        totalTime: number;
        averageTime: number;
    } | null;
}
export interface PreviewPerformanceMetrics {
    totalExecutionTime: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    lastExecutionCount: number;
    peakMemoryUsage?: number;
    networkLatency?: number;
}
export interface PreviewStateStore {
    isLoading: boolean;
    error: string | null;
    results: PreviewResult[];
    aggregateError: string | null;
    performanceStats: {
        totalTime: number;
        averageTime: number;
    } | null;
    lastGraphHash: string | null;
    lastUpdateTimestamp: number;
    isRealTimeEnabled: boolean;
    syncInterval: number;
    cache: Map<string, PreviewCache>;
    maxCacheSize: number;
    cacheExpirationMs: number;
    lockedResults: number[];
    regeneratingResults: number[];
    performanceMetrics: PreviewPerformanceMetrics;
    performanceHistory: PreviewPerformanceMetrics[];
    maxHistoryLength: number;
    autoRefreshEnabled: boolean;
    autoRefreshInterval: number;
    autoRefreshThreshold: number;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setResults: (results: PreviewResult[]) => void;
    setAggregateError: (error: string | null) => void;
    setPerformanceStats: (stats: {
        totalTime: number;
        averageTime: number;
    } | null) => void;
    updateGraphHash: (hash: string) => void;
    enableRealTimeSync: (enabled: boolean) => void;
    setSyncInterval: (interval: number) => void;
    getCachedResults: (graphHash: string) => PreviewCache | null;
    setCachedResults: (graphHash: string, results: PreviewResult[], stats: any) => void;
    clearCache: () => void;
    pruneCacheByAge: () => void;
    pruneCacheBySize: () => void;
    lockResult: (index: number, note?: string) => void;
    unlockResult: (index: number) => void;
    setRegeneratingResult: (index: number, regenerating: boolean) => void;
    updatePerformanceMetrics: (metrics: Partial<PreviewPerformanceMetrics>) => void;
    addPerformanceSnapshot: () => void;
    getPerformanceInsights: () => {
        trend: 'improving' | 'degrading' | 'stable';
        bottlenecks: string[];
        recommendations: string[];
    };
    setAutoRefresh: (enabled: boolean, interval?: number) => void;
    shouldAutoRefresh: (changeSignificance?: number) => boolean;
    resetState: () => void;
    getStateSnapshot: () => any;
    restoreFromSnapshot: (snapshot: any) => void;
}
export declare }, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: PreviewStateStore, previousSelectedState: PreviewStateStore) => void): () => void;
        <U>(selector: (state: PreviewStateStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare export declare export declare export declare     averageTime: number;
} | null;
export declare     getCached: (graphHash: string) => PreviewCache | null;
    setCached: (graphHash: string, results: PreviewResult[], stats: any) => void;
    clearCache: () => void;
};
export declare     history: PreviewPerformanceMetrics[];
    insights: {
        trend: "improving" | "degrading" | "stable";
        bottlenecks: string[];
        recommendations: string[];
    };
    updateMetrics: (metrics: Partial<PreviewPerformanceMetrics>) => void;
    addSnapshot: () => void;
};
//# sourceMappingURL=previewStateStore.d.ts.map