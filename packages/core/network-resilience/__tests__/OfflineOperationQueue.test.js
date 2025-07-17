import { OfflineOperationQueue } from '../OfflineOperationQueue';
// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;
describe('OfflineOperationQueue', () => {
    let queue;
    beforeEach(() => {
        queue = new OfflineOperationQueue({
            maxQueueSize: 10,
            maxRetries: 3,
            retryBackoffMs: 100,
            maxBackoffMs: 1000,
            operationTtlMs: 5000,
            persistToLocalStorage: false
        });
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
    });
    afterEach(() => {
        queue.cleanup();
    });
    describe('Basic Queue Operations', () => {
        test('should enqueue operation successfully', () => {
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test', data: { title: 'Test' } },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(operationId).toBeDefined();
            expect(queue.size()).toBe(1);
            expect(queue.isEmpty()).toBe(false);
        });
        test('should dequeue operations in priority order', () => {
            // Add operations with different priorities
            const lowId = queue.enqueue({
                type: 'presence_update',
                payload: { cursor: { x: 0, y: 0 } },
                priority: 'low',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const highId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const mediumId = queue.enqueue({
                type: 'selection_update',
                payload: { nodeIds: ['test'] },
                priority: 'medium',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const batch = queue.dequeue(3);
            expect(batch).toHaveLength(3);
            expect(batch[0].priority).toBe('high');
            expect(batch[1].priority).toBe('medium');
            expect(batch[2].priority).toBe('low');
        });
        test('should handle operation success', () => {
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const batch = queue.dequeue(1);
            expect(batch).toHaveLength(1);
            queue.markSuccess(operationId);
            expect(queue.size()).toBe(0);
        });
        test('should handle operation failure with retry', (done) => {
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const batch = queue.dequeue(1);
            expect(batch).toHaveLength(1);
            // Listen for retry event
            queue.on('operation_retry', (operation, backoffTime) => {
                expect(operation.id).toBe(operationId);
                expect(operation.retryCount).toBe(1);
                expect(backoffTime).toBeGreaterThan(0);
                done();
            });
            queue.markFailure(operationId, new Error('Test error'));
            expect(queue.size()).toBe(0); // Operation is in retry queue
        });
        test('should fail operation permanently after max retries', () => {
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 2
            });
            let batch = queue.dequeue(1);
            expect(batch).toHaveLength(1);
            // First failure
            queue.markFailure(operationId, new Error('Test error'));
            // Wait for retry and fail again
            setTimeout(() => {
                batch = queue.dequeue(1);
                if (batch.length > 0) {
                    queue.markFailure(operationId, new Error('Test error'));
                    setTimeout(() => {
                        batch = queue.dequeue(1);
                        if (batch.length > 0) {
                            queue.markFailure(operationId, new Error('Test error'));
                            const failedOps = queue.getFailedOperations();
                            expect(failedOps).toHaveLength(1);
                            expect(failedOps[0].id).toBe(operationId);
                        }
                    }, 150);
                }
            }, 150);
        });
    });
    describe('Queue Management', () => {
        test('should enforce max queue size', () => {
            // Fill queue to max
            for (let i = 0; i < 10; i++) {
                queue.enqueue({
                    type: 'graph_update',
                    payload: { nodeId: `test${i}` },
                    priority: 'medium',
                    documentId: 'doc1',
                    userId: 'user1',
                    requiresOrder: false,
                    maxRetries: 3
                });
            }
            expect(queue.size()).toBe(10);
            // Add one more to trigger eviction
            const evictionPromise = new Promise((resolve) => {
                queue.on('operation_evicted', () => resolve());
            });
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'overflow' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(queue.size()).toBe(10);
            return evictionPromise;
        });
        test('should clear operations for specific document', () => {
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test1' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test2' },
                priority: 'high',
                documentId: 'doc2',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(queue.size()).toBe(2);
            const cleared = queue.clearDocument('doc1');
            expect(cleared).toBe(1);
            expect(queue.size()).toBe(1);
            const remaining = queue.getOperationsForDocument('doc2');
            expect(remaining).toHaveLength(1);
        });
        test('should clear entire queue', () => {
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test1' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test2' },
                priority: 'high',
                documentId: 'doc2',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(queue.size()).toBe(2);
            queue.clear();
            expect(queue.size()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
        });
        test('should retry failed operations', () => {
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 1
            });
            const batch = queue.dequeue(1);
            queue.markFailure(operationId, new Error('Test error'));
            // Simulate permanent failure
            setTimeout(() => {
                const batch2 = queue.dequeue(1);
                if (batch2.length > 0) {
                    queue.markFailure(operationId, new Error('Test error'));
                    expect(queue.getFailedOperations()).toHaveLength(1);
                    const retried = queue.retryFailedOperations();
                    expect(retried).toBe(1);
                    expect(queue.size()).toBe(1);
                }
            }, 150);
        });
    });
    describe('Metrics and Statistics', () => {
        test('should track queue metrics', () => {
            const metrics = queue.getMetrics();
            expect(metrics.totalOperations).toBe(0);
            expect(metrics.pendingOperations).toBe(0);
            expect(metrics.queueSizeByPriority.high).toBe(0);
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const updatedMetrics = queue.getMetrics();
            expect(updatedMetrics.totalOperations).toBe(1);
            expect(updatedMetrics.pendingOperations).toBe(1);
            expect(updatedMetrics.queueSizeByPriority.high).toBe(1);
        });
        test('should calculate oldest operation age', () => {
            const start = Date.now();
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const metrics = queue.getMetrics();
            expect(metrics.oldestOperationAge).toBeGreaterThanOrEqual(0);
            expect(metrics.oldestOperationAge).toBeLessThan(100); // Should be very recent
        });
    });
    describe('Persistence', () => {
        test('should persist to localStorage when enabled', () => {
            const persistentQueue = new OfflineOperationQueue({
                persistToLocalStorage: true,
                storageKey: 'test-queue'
            });
            persistentQueue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(localStorageMock.setItem).toHaveBeenCalled();
            persistentQueue.cleanup();
        });
        test('should restore from localStorage', () => {
            const mockData = {
                queue: [{
                        id: 'test-id',
                        type: 'graph_update',
                        payload: { nodeId: 'test' },
                        timestamp: Date.now(),
                        retryCount: 0,
                        priority: 'high',
                        documentId: 'doc1',
                        userId: 'user1',
                        requiresOrder: false,
                        maxRetries: 3,
                        expiresAt: Date.now() + 10000
                    }],
                failedOperations: [],
                timestamp: Date.now()
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
            const restoredQueue = new OfflineOperationQueue({
                persistToLocalStorage: true,
                storageKey: 'test-queue'
            });
            expect(restoredQueue.size()).toBe(1);
            restoredQueue.cleanup();
        });
    });
    describe('Error Handling', () => {
        test('should handle expired operations', (done) => {
            const queue = new OfflineOperationQueue({
                operationTtlMs: 100, // Very short TTL
                persistToLocalStorage: false
            });
            queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            expect(queue.size()).toBe(1);
            // Wait for expiration
            setTimeout(() => {
                const batch = queue.dequeue(1);
                expect(batch).toHaveLength(0); // Expired operation should be filtered out
                done();
            }, 150);
        });
        test('should emit appropriate events', () => {
            const events = [];
            queue.on('operation_queued', () => events.push('queued'));
            queue.on('operation_success', () => events.push('success'));
            queue.on('operation_failed', () => events.push('failed'));
            queue.on('operation_retry', () => events.push('retry'));
            const operationId = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 1
            });
            expect(events).toContain('queued');
            const batch = queue.dequeue(1);
            queue.markSuccess(operationId);
            expect(events).toContain('success');
        });
    });
    describe('Dependencies', () => {
        test('should respect operation dependencies', () => {
            const dependency = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'dep' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3
            });
            const dependent = queue.enqueue({
                type: 'graph_update',
                payload: { nodeId: 'test' },
                priority: 'high',
                documentId: 'doc1',
                userId: 'user1',
                requiresOrder: false,
                maxRetries: 3,
                dependencies: [dependency]
            });
            expect(queue.size()).toBe(2);
            // First dequeue should return dependency first
            let batch = queue.dequeue(2);
            expect(batch).toHaveLength(1);
            expect(batch[0].id).toBe(dependency);
            // Mark dependency as complete
            queue.markSuccess(dependency);
            // Now dependent should be available
            batch = queue.dequeue(1);
            expect(batch).toHaveLength(1);
            expect(batch[0].id).toBe(dependent);
        });
    });
});
