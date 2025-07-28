import { EventEmitter } from 'events';
export interface QueuedOperation {
    id: string;
    type: 'graph_update' | 'presence_update' | 'cursor_update' | 'selection_update' | 'activity_update';
    payload: any;
    timestamp: number;
    retryCount: number;
    priority: 'high' | 'medium' | 'low';
    documentId: string;
    userId: string;
    requiresOrder: boolean;
    dependencies?: string;
    maxRetries: number;
    expiresAt?: number;
}
export interface QueueMetrics {
    totalOperations: number;
    pendingOperations: number;
    failedOperations: number;
    retryingOperations: number;
    expiredOperations: number;
    averageQueueTime: number;
    oldestOperationAge: number;
    queueSizeByPriority: {
        high: number;
        medium: number;
        low: number;
    };
    operationsByType: Map<string, number>;
}
export interface OfflineQueueConfig {
    maxQueueSize: number;
    maxRetries: number;
    retryBackoffMs: number;
    maxBackoffMs: number;
    operationTtlMs: number;
    persistToLocalStorage: boolean;
    storageKey: string;
    compressionEnabled: boolean;
    batchSizeLimit: number;
    priorityWeights: {
        high: number;
        medium: number;
        low: number;
    };
}
export declare class OfflineOperationQueue extends EventEmitter {
    private queue;
    private processingQueue;
    private failedOperations;
    private config;
    private metrics;
    private cleanupTimer;
    private persistenceTimer;
    constructor(config?: Partial<OfflineQueueConfig>);
}
//# sourceMappingURL=OfflineOperationQueue.d.ts.map