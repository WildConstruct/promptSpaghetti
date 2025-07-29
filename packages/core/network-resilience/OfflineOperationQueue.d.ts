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
    dependencies?: string[];
    maxRetries: number;
    expiresAt?: number;

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

export declare class OfflineOperationQueue extends EventEmitter {
    private queue;
    private processingQueue;
    private failedOperations;
    private config;
    private metrics;
    private cleanupTimer;
    private persistenceTimer;
    constructor(config?: Partial<OfflineQueueConfig>);
    /**
     * Add operation to the queue
     */
    enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): string;
    /**
     * Get next batch of operations to process
     */
    dequeue(batchSize?: number): QueuedOperation[];
    /**
     * Mark operation as successfully processed
     */
    markSuccess(operationId: string): void;
    /**
     * Mark operation as failed and handle retry logic
     */
    markFailure(operationId: string, error: Error): void;
    /**
     * Get all operations for a specific document
     */
    getOperationsForDocument(documentId: string): QueuedOperation[];
    /**
     * Remove all operations for a specific document
     */
    clearDocument(documentId: string): number;
    /**
     * Clear all operations
     */
    clear(): void;
    /**
     * Get current queue metrics
     */
    getMetrics(): QueueMetrics;
    /**
     * Get queue size
     */
    size(): number;
    /**
     * Check if queue is empty
     */
    isEmpty(): boolean;
    /**
     * Get failed operations for debugging/recovery
     */
    getFailedOperations(): QueuedOperation[];
    /**
     * Retry all failed operations
     */
    retryFailedOperations(): number;
    /**
     * Cleanup expired operations and reset metrics
     */
    cleanup(): void;
    /**
     * Insert operation by priority
     */
    private insertByPriority;
    /**
     * Check if operation dependencies are satisfied
     */
    private areDependenciesSatisfied;
    /**
     * Evict oldest operation when queue is full
     */
    private evictOldestOperation;
    /**
     * Update queue metrics
     */
    private updateMetrics;
    /**
     * Update average queue time
     */
    private updateAverageQueueTime;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Start persistence timer
     */
    private startPersistenceTimer;
    /**
     * Persist queue to localStorage
     */
    private persistToStorage;
    /**
     * Load queue from localStorage
     */
    private loadFromPersistence;

//# sourceMappingURL=OfflineOperationQueue.d.ts.map