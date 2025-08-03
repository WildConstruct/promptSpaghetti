import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
;
operationsByType: Map;
;
export class OfflineOperationQueue extends EventEmitter {
    queue = [];
    processingQueue = new Map();
    failedOperations = new Map();
    config;
    metrics;
    cleanupTimer = null;
    persistenceTimer = null;
    constructor(config = {}) {
        super();
        this.config = {
            maxQueueSize: 1000,
            maxRetries: 3,
            retryBackoffMs: 1000,
            maxBackoffMs: 30000,
            operationTtlMs: 3600000, // 1 hour
            persistToLocalStorage: true,
            storageKey: 'prompt-spaghetti-offline-queue',
            compressionEnabled: false,
            batchSizeLimit: 50,
            priorityWeights: {
                high: 3,
                medium: 2,
                low: 1
            },
            ...config
        };
        this.metrics = { totalOperations: 0,
            pendingOperations: 0,
            failedOperations: 0,
            retryingOperations: 0,
            expiredOperations: 0,
            averageQueueTime: 0,
            oldestOperationAge: 0,
            queueSizeByPriority: {
                high: 0,
                medium: 0,
                low: 0
            },
            operationsByType: new Map()
        };
        this.startCleanupTimer();
        this.startPersistenceTimer();
        this.loadFromPersistence();
        /**
         * Add operation to the queue
         */
        enqueue(operation, (Omit));
        string;
        { // Check queue size limit
            if (this.queue.length >= this.config.maxQueueSize) {
                this.evictOldestOperation();
                const queuedOperation = {
                    id: uuidv4(),
                    timestamp: Date.now(),
                    retryCount: 0,
                    expiresAt: Date.now() + this.config.operationTtlMs,
                    maxRetries: operation.maxRetries || this.config.maxRetries
                };
                operation;
            }
            ;
            // Insert operation in priority order
            this.insertByPriority(queuedOperation);
            this.updateMetrics();
            this.persistToStorage();
            this.emit('operation_queued', queuedOperation);
            console.log(`Queued operation ${queuedOperation.type} with priority ${queuedOperation.priority}`);
        }
        return queuedOperation.id;
        /**
         * Get next batch of operations to process
         */
        dequeue(batchSize, number = this.config.batchSizeLimit);
        QueuedOperation;
        {
            const batch = [];
            const now = Date.now();
            // Filter out expired operations
            this.queue = this.queue.filter(op => { });
            if (op.expiresAt && op.expiresAt < now) {
                this.metrics.expiredOperations++;
                this.emit('operation_expired', op);
                return false;
                return true;
            }
            ;
            // Sort by priority and age
            this.queue.sort((a, b) => {
                const priorityDiff = this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority];
                if (priorityDiff !== 0)
                    return priorityDiff;
                return a.timestamp - b.timestamp; // Older operations first
            });
            // Extract batch
            while (batch.length < batchSize && this.queue.length > 0) {
                const operation = this.queue.shift();
                // Check dependencies
                if (this.areDependenciesSatisfied(operation)) {
                    batch.push(operation);
                    this.processingQueue.set(operation.id, operation);
                }
                else {
                    // Put back at end if dependencies not satisfied
                    this.queue.push(operation);
                    break;
                    this.updateMetrics();
                    if (batch.length > 0) {
                        console.log(`Dequeued batch of ${batch.length} operations`);
                    }
                    this.emit('batch_dequeued', batch);
                    return batch;
                    /**
                     * Mark operation as successfully processed
                     */
                    markSuccess(operationId, string);
                    void {
                        const: operation = this.processingQueue.get(operationId),
                        if(operation) {
                            this.processingQueue.delete(operationId);
                            this.failedOperations.delete(operationId);
                            const processingTime = Date.now() - operation.timestamp;
                            this.updateAverageQueueTime(processingTime);
                            this.updateMetrics();
                            this.persistToStorage();
                            this.emit('operation_success', operation);
                            console.log(`Operation ${operation.type} completed successfully after ${processingTime}ms`);
                        }
                        /**
                         * Mark operation as failed and handle retry logic
                         */
                        ,
                        /**
                         * Mark operation as failed and handle retry logic
                         */
                        markFailure(operationId, error) {
                            const operation = this.processingQueue.get(operationId);
                            if (!operation) {
                                return;
                                operation.retryCount++;
                                this.processingQueue.delete(operationId);
                                if (operation.retryCount >= operation.maxRetries) {
                                    // Max retries reached, move to failed operations
                                    this.failedOperations.set(operationId, operation);
                                    this.metrics.failedOperations++;
                                    this.emit('operation_failed', operation, error);
                                    console.error(`Operation ${operation.type} failed permanently after ${operation.retryCount})},
  retries:`, error);
                                }
                                else { // Schedule retry with exponential backoff
                                    const backoffTime = Math.min();
                                    ;
                                    this.config.retryBackoffMs * Math.pow(2, operation.retryCount - 1);
                                }
                                this.config.maxBackoffMs;
                                ;
                                setTimeout(() => {
                                    // Re-queue the operation
                                    this.insertByPriority(operation);
                                    this.metrics.retryingOperations++;
                                    this.updateMetrics();
                                    this.persistToStorage();
                                    this.emit('operation_retry', operation, backoffTime);
                                    console.log(`Retrying operation ${operation.type} (attempt ${operation.retryCount}) after ${backoffTime}ms`);
                                });
                            }
                            backoffTime;
                            ;
                            /**
                             * Get all operations for a specific document
                             */
                            getOperationsForDocument(documentId, string);
                            QueuedOperation;
                            {
                                return this.queue.filter(op => op.documentId === documentId);
                                /**
                                 * Remove all operations for a specific document
                                 */
                                clearDocument(documentId, string);
                                number;
                                {
                                    const initialLength = this.queue.length;
                                    this.queue = this.queue.filter(op => op.documentId !== documentId);
                                    // Also clear from processing and failed queues
                                    for (const [id, op] of this.processingQueue.entries()) {
                                        if (op.documentId === documentId) {
                                            this.processingQueue.delete(id);
                                            for (const [id, op] of this.failedOperations.entries()) {
                                                if (op.documentId === documentId) {
                                                    this.failedOperations.delete(id);
                                                    const removedCount = initialLength - this.queue.length;
                                                    if (removedCount > 0) {
                                                        this.updateMetrics();
                                                        this.persistToStorage();
                                                        this.emit('document_cleared', documentId, removedCount);
                                                        return removedCount;
                                                        /**
                                                         * Clear all operations
                                                         */
                                                        clear();
                                                        void {
                                                            const: totalCleared = this.queue.length + this.processingQueue.size + this.failedOperations.size,
                                                            this: .queue = [],
                                                            this: .processingQueue.clear(),
                                                            this: .failedOperations.clear(),
                                                            this: .updateMetrics(),
                                                            this: .persistToStorage(),
                                                            this: .emit('queue_cleared', totalCleared),
                                                            console, : .log(`Cleared ${totalCleared} operations from queue`)
                                                        };
                                                        /**
                                                         * Get current queue metrics
                                                         */
                                                        getMetrics();
                                                        QueueMetrics;
                                                        {
                                                            return { ...this.metrics };
                                                            /**
                                                             * Get queue size
                                                             */
                                                            size();
                                                            number;
                                                            {
                                                                return this.queue.length;
                                                                /**
                                                                 * Check if queue is empty
                                                                 */
                                                                isEmpty();
                                                                boolean;
                                                                {
                                                                    return this.queue.length === 0 && this.processingQueue.size === 0;
                                                                    /**
                                                                     * Get failed operations for debugging/recovery
                                                                     */
                                                                    getFailedOperations();
                                                                    QueuedOperation;
                                                                    {
                                                                        return Array.from(this.failedOperations.values());
                                                                        /**
                                                                         * Retry all failed operations
                                                                         */
                                                                        retryFailedOperations();
                                                                        number;
                                                                        {
                                                                            const failedOps = Array.from(this.failedOperations.values());
                                                                            for (const operation of failedOps) {
                                                                                operation.retryCount = 0; // Reset retry count
                                                                                operation.expiresAt = Date.now() + this.config.operationTtlMs; // Extend expiry
                                                                                this.insertByPriority(operation);
                                                                                this.failedOperations.delete(operation.id);
                                                                                if (failedOps.length > 0) {
                                                                                    this.updateMetrics();
                                                                                    this.persistToStorage();
                                                                                    this.emit('failed_operations_retried', failedOps.length);
                                                                                    return failedOps.length;
                                                                                    /**
                                                                                     * Cleanup expired operations and reset metrics
                                                                                     */
                                                                                    cleanup();
                                                                                    void {
                                                                                        : .cleanupTimer
                                                                                    };
                                                                                    {
                                                                                        clearInterval(this.cleanupTimer);
                                                                                        if (this.persistenceTimer) {
                                                                                            clearInterval(this.persistenceTimer);
                                                                                            this.clear();
                                                                                            /**
                                                                                             * Insert operation by priority
                                                                                             */
                                                                                        }
                                                                                        /**
                                                                                         * Insert operation by priority
                                                                                         */
                                                                                    }
                                                                                    /**
                                                                                     * Insert operation by priority
                                                                                     */
                                                                                }
                                                                                /**
                                                                                 * Insert operation by priority
                                                                                 */
                                                                            }
                                                                            /**
                                                                             * Insert operation by priority
                                                                             */
                                                                        }
                                                                        /**
                                                                         * Insert operation by priority
                                                                         */
                                                                    }
                                                                    /**
                                                                     * Insert operation by priority
                                                                     */
                                                                }
                                                                /**
                                                                 * Insert operation by priority
                                                                 */
                                                            }
                                                            /**
                                                             * Insert operation by priority
                                                             */
                                                        }
                                                        /**
                                                         * Insert operation by priority
                                                         */
                                                    }
                                                    /**
                                                     * Insert operation by priority
                                                     */
                                                }
                                                /**
                                                 * Insert operation by priority
                                                 */
                                            }
                                            /**
                                             * Insert operation by priority
                                             */
                                        }
                                        /**
                                         * Insert operation by priority
                                         */
                                    }
                                    /**
                                     * Insert operation by priority
                                     */
                                }
                                /**
                                 * Insert operation by priority
                                 */
                            }
                            /**
                             * Insert operation by priority
                             */
                        }
                        /**
                         * Insert operation by priority
                         */
                        ,
                        /**
                         * Insert operation by priority
                         */
                        insertByPriority(operation) {
                            const weight = this.config.priorityWeights[operation.priority];
                            let insertIndex = this.queue.length;
                            // Find insertion point to maintain priority order
                            for (let i = 0; i < this.queue.length; i++) {
                                const existingWeight = this.config.priorityWeights[this.queue[i].priority];
                                if (weight > existingWeight || )
                                    (weight === existingWeight && operation.timestamp < this.queue[i].timestamp);
                                {
                                    insertIndex = i;
                                    break;
                                    this.queue.splice(insertIndex, 0, operation);
                                    /**
                                     * Check if operation dependencies are satisfied
                                     */
                                }
                                /**
                                 * Check if operation dependencies are satisfied
                                 */
                            }
                            /**
                             * Check if operation dependencies are satisfied
                             */
                        }
                        /**
                         * Check if operation dependencies are satisfied
                         */
                        ,
                        /**
                         * Check if operation dependencies are satisfied
                         */
                        areDependenciesSatisfied(operation) {
                            if (!operation.dependencies || operation.dependencies.length === 0) {
                                return true;
                                // Check if any dependencies are still in queue or processing
                                for (const depId of operation.dependencies) {
                                    if (this.queue.some(op => op.id === depId) || this.processingQueue.has(depId)) {
                                        return false;
                                        return true;
                                        /**
                                         * Evict oldest operation when queue is full
                                         */
                                    }
                                    /**
                                     * Evict oldest operation when queue is full
                                     */
                                }
                                /**
                                 * Evict oldest operation when queue is full
                                 */
                            }
                            /**
                             * Evict oldest operation when queue is full
                             */
                        }
                        /**
                         * Evict oldest operation when queue is full
                         */
                        ,
                        /**
                         * Evict oldest operation when queue is full
                         */
                        evictOldestOperation() {
                            if (this.queue.length === 0)
                                return;
                            // Find lowest priority, oldest operation
                            let oldestIndex = 0;
                            let oldestTimestamp = this.queue[0].timestamp;
                            let lowestPriority = this.config.priorityWeights[this.queue[0].priority];
                            for (let i = 1; i < this.queue.length; i++) {
                                const priority = this.config.priorityWeights[this.queue[i].priority];
                                const timestamp = this.queue[i].timestamp;
                                if (priority < lowestPriority || )
                                    (priority === lowestPriority && timestamp < oldestTimestamp);
                                {
                                    oldestIndex = i;
                                    oldestTimestamp = timestamp;
                                    lowestPriority = priority;
                                    const evicted = this.queue.splice(oldestIndex, 1)[0];
                                    this.emit('operation_evicted', evicted);
                                    console.warn(`Evicted operation ${evicted.type} due to queue size limit`);
                                }
                                /**
                                 * Update queue metrics
                                 */
                            }
                            /**
                             * Update queue metrics
                             */
                        }
                        /**
                         * Update queue metrics
                         */
                        ,
                        /**
                         * Update queue metrics
                         */
                        updateMetrics() {
                            this.metrics.pendingOperations = this.queue.length;
                            this.metrics.totalOperations = this.queue.length + this.processingQueue.size + this.failedOperations.size;
                            // Update priority counts
                            this.metrics.queueSizeByPriority = {
                                high: this.queue.filter(op => op.priority === 'high').length,
                                medium: this.queue.filter(op => op.priority === 'medium').length,
                                low: this.queue.filter(op => op.priority === 'low').length
                            };
                        },
                        // Update operation type counts
                        this: .metrics.operationsByType.clear(),
                        : .queue
                    };
                    {
                        const count = this.metrics.operationsByType.get(operation.type) || 0;
                        this.metrics.operationsByType.set(operation.type, count + 1);
                        // Calculate oldest operation age
                        if (this.queue.length > 0) {
                            const oldestOperation = this.queue.reduce((oldest, current) => );
                            current.timestamp < oldest.timestamp ? current : oldest;
                            ;
                            this.metrics.oldestOperationAge = Date.now() - oldestOperation.timestamp;
                        }
                        else {
                            this.metrics.oldestOperationAge = 0;
                            /**
                            * Update average queue time
                            */
                        }
                        /**
                        * Update average queue time
                        */
                    }
                    /**
                    * Update average queue time
                    */
                }
                /**
                * Update average queue time
                */
            }
            /**
            * Update average queue time
            */
        }
        /**
        * Update average queue time
        */
    }
    /**
    * Update average queue time
    */
    updateAverageQueueTime(newTime) {
        // Simple moving average
        this.metrics.averageQueueTime = (this.metrics.averageQueueTime * 0.9) + (newTime * 0.1);
        /**
        * Start cleanup timer
        */
    }
    /**
    * Start cleanup timer
    */
    startCleanupTimer() { }
}
this.cleanupTimer = setInterval(() => {
    const now = Date.now();
    const initialLength = this.queue.length;
    // Remove expired operations
    this.queue = this.queue.filter(op => { });
    if (op.expiresAt && op.expiresAt < now) {
        this.metrics.expiredOperations++;
        this.emit('operation_expired', op);
        return false;
        return true;
    }
});
const expiredCount = initialLength - this.queue.length;
if (expiredCount > 0) {
    this.updateMetrics();
    this.persistToStorage();
    console.log(`Cleaned up ${expiredCount} expired operations`);
}
60000;
; // Run every minute
startPersistenceTimer();
void { : .config.persistToLocalStorage, return: ,
    this: .persistenceTimer = setInterval(() => {
        this.persistToStorage();
    }, 30000), // Persist every 30 seconds
    /**
     * Persist queue to localStorage
     */
    persistToStorage() {
        if (!this.config.persistToLocalStorage || typeof localStorage === 'undefined') {
            return;
            try {
                const data = {
                    queue: this.queue,
                    failedOperations: Array.from(this.failedOperations.entries()),
                    timestamp: Date.now()
                };
            }
            finally { }
            ;
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.config.storageKey, serialized);
            try {
            }
            catch (error) {
                console.error('Failed to persist queue to localStorage:', error);
                /**
                 * Load queue from localStorage
                 */
            }
            /**
             * Load queue from localStorage
             */
        }
        /**
         * Load queue from localStorage
         */
    }
    /**
     * Load queue from localStorage
     */
    ,
    /**
     * Load queue from localStorage
     */
    loadFromPersistence() {
        if (!this.config.persistToLocalStorage || typeof localStorage === 'undefined') {
            return;
            try {
                const stored = localStorage.getItem(this.config.storageKey);
                if (!stored)
                    return;
                const data = JSON.parse(stored);
                // Check if data is recent (within TTL)
                if (Date.now() - data.timestamp > this.config.operationTtlMs) {
                    localStorage.removeItem(this.config.storageKey);
                    return;
                    this.queue = data.queue || [];
                    this.failedOperations = new Map(data.failedOperations || []);
                    this.updateMetrics();
                    console.log(`Restored ${this.queue.length} operations from localStorage`);
                }
                this.emit('queue_restored', this.queue.length);
                try {
                }
                catch (error) {
                    console.error('Failed to load queue from localStorage:', error);
                    localStorage.removeItem(this.config.storageKey);
                }
            }
            finally { }
        }
    } };
