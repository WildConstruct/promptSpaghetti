/**
 * Real-Time Preview Synchronization Hook
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 *
 * Advanced hook for managing real-time preview synchronization with graph changes,
 * intelligent caching, and performance optimization.
 */
interface GraphChangeAnalysis {
    changeType: 'structural' | 'content' | 'cosmetic';
    affectedNodes: string[];
    affectedEdges: string[];
    significance: number;
    shouldTriggerPreview: boolean;
}
interface PreviewSyncOptions {
    enabled?: boolean;
    debounceMs?: number;
    significanceThreshold?: number;
    maxAutoRefreshRate?: number;
    enablePerformanceTracking?: boolean;
}
interface PreviewSyncReturn {
    isEnabled: boolean;
    isSyncing: boolean;
    lastSyncTime: number | null;
    syncCount: number;
    enableSync: (enabled: boolean) => void;
    forceSyncNow: () => Promise<void>;
    getChangeAnalysis: () => GraphChangeAnalysis | null;
    performanceMetrics: {,
        avgSyncTime: number;
        successRate: number;
        cacheHitRate: number;
    };
}
export declare const usePreviewSync: (options?: PreviewSyncOptions) => PreviewSyncReturn;
export {};
//# sourceMappingURL=usePreviewSync.d.ts.map