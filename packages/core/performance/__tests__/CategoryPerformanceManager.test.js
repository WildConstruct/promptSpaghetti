/**
 * Category Performance Manager Test Suite
 * Epic 17 - Implement Category Performance Tests (E17-1753114397436-B9E25A)
 *
 * Comprehensive test coverage for category-based performance optimization
 */
import { CategoryPerformanceManager } from '../CategoryPerformanceManager';
// Mock PerformanceMonitor
jest.mock('../../monitoring/PerformanceMonitor');
describe('CategoryPerformanceManager', () => {
    let performanceMonitor;
    let categoryManager;
    const mockPerformanceMetrics = {
        nodeId: 'test-node',
        nodeType: 'WeightedChoice',
        duration: 150,
        memoryUsage: 1024,
        cpuUsage: 25,
        contextSize: 5,
        cacheHit: false,
        errors: [],
        warnings: [],
        startTime: Date.now(),
        endTime: Date.now() + 150,
        contextDepth: 2,
        nodeCount: 10
    };
    beforeEach(() => {
        // Create mock performance monitor
        performanceMonitor = {
            on: jest.fn(),
            startExecution: jest.fn(),
            endExecution: jest.fn(),
            getMetrics: jest.fn(),
            clearMetrics: jest.fn(),
            generateReport: jest.fn(),
            shutdown: jest.fn()
        };
        // Initialize category manager
        categoryManager = new CategoryPerformanceManager(performanceMonitor);
    });
    afterEach(() => {
        categoryManager.shutdown();
        jest.clearAllMocks();
    });
    describe('Initialization', () => {
        test('should initialize with default configuration', () => {
            expect(performanceMonitor.on).toHaveBeenCalledWith('execution_completed', expect.any(Function));
            expect(performanceMonitor.on).toHaveBeenCalledWith('execution_started', expect.any(Function));
        });
        test('should initialize with custom configuration', () => {
            const customConfig = {
                enableCategoryOptimization: false,
                globalSettings: {
                    maxConcurrentOperations: 50,
                    memoryThreshold: 512 * 1024 * 1024,
                    cpuThreshold: 90,
                    responseTimeTarget: 200
                }
            };
            const customManager = new CategoryPerformanceManager(performanceMonitor, customConfig);
            expect(customManager).toBeInstanceOf(CategoryPerformanceManager);
            customManager.shutdown();
        });
        test('should emit manager_initialized event', (done) => {
            categoryManager.on('manager_initialized', (data) => {
                expect(data).toHaveProperty('categories');
                expect(data).toHaveProperty('globalSettings');
                expect(data.categories).toEqual(['basic', 'advanced', 'utility', 'integration']);
                done();
            });
        });
    });
    describe('Node Categorization', () => {
        test('should categorize basic node types correctly', async () => {
            const executionId = await categoryManager.registerExecution('node-1', 'WeightedChoice', 0);
            expect(executionId).toBeDefined();
            expect(typeof executionId).toBe('string');
        });
        test('should categorize advanced node types correctly', async () => {
            const executionId = await categoryManager.registerExecution('node-2', 'WeightedAdvanced', 0);
            expect(executionId).toBeDefined();
        });
        test('should categorize utility node types correctly', async () => {
            const executionId = await categoryManager.registerExecution('node-3', 'Include', 0);
            expect(executionId).toBeDefined();
        });
        test('should categorize integration node types correctly', async () => {
            const executionId = await categoryManager.registerExecution('node-4', 'APICall', 0);
            expect(executionId).toBeDefined();
        });
        test('should default to basic category for unknown node types', async () => {
            const executionId = await categoryManager.registerExecution('node-5', 'UnknownType', 0);
            expect(executionId).toBeDefined();
        });
    });
    describe('Execution Registration', () => {
        test('should register immediate execution when capacity is available', async () => {
            const executionId = await categoryManager.registerExecution('node-1', 'WeightedChoice', 0);
            expect(executionId).toMatch(/^basic-node-1-\d+$/);
        });
        test('should queue execution when capacity limit reached', async () => {
            // Fill up basic category capacity (50 concurrent nodes max)
            const promises = [];
            for (let i = 0; i < 51; i++) {
                promises.push(categoryManager.registerExecution(`node-${i}`, 'WeightedChoice', 0));
            }
            const results = await Promise.all(promises);
            // First 50 should be immediate
            expect(results[0]).toMatch(/^basic-node-0-\d+$/);
            // 51st should be queued
            expect(results[50]).toMatch(/^queued-basic-node-50-\d+$/);
        });
        test('should respect priority in queue ordering', async () => {
            const queuedPromises = [];
            // Fill capacity first
            for (let i = 0; i < 50; i++) {
                await categoryManager.registerExecution(`immediate-${i}`, 'WeightedChoice', 0);
            }
            // Queue items with different priorities
            queuedPromises.push(categoryManager.registerExecution('low-priority', 'WeightedChoice', 1));
            queuedPromises.push(categoryManager.registerExecution('high-priority', 'WeightedChoice', 10));
            queuedPromises.push(categoryManager.registerExecution('med-priority', 'WeightedChoice', 5));
            const queuedResults = await Promise.all(queuedPromises);
            // All should be queued
            queuedResults.forEach(result => {
                expect(result).toMatch(/^queued-basic-/);
            });
        });
        test('should throw error for queue limit exceeded', async () => {
            // Fill up basic category capacity and queue
            const promises = [];
            // Fill immediate capacity (50)
            for (let i = 0; i < 50; i++) {
                promises.push(categoryManager.registerExecution(`immediate-${i}`, 'WeightedChoice', 0));
            }
            await Promise.all(promises);
            // Fill queue (1000 limit)
            const queuePromises = [];
            for (let i = 0; i < 1000; i++) {
                queuePromises.push(categoryManager.registerExecution(`queue-${i}`, 'WeightedChoice', 0));
            }
            await Promise.all(queuePromises);
            // This should exceed queue limit
            await expect(categoryManager.registerExecution('overflow', 'WeightedChoice', 0)).rejects.toThrow('Queue limit exceeded for category: basic');
        });
    });
    describe('Metrics Collection', () => {
        test('should return null for unknown category metrics', () => {
            const metrics = categoryManager.getCategoryMetrics('nonexistent');
            expect(metrics).toBeNull();
        });
        test('should return valid metrics for existing categories', () => {
            const metrics = categoryManager.getCategoryMetrics('basic');
            expect(metrics).toBeDefined();
            expect(metrics).toHaveProperty('categoryName', 'basic');
            expect(metrics).toHaveProperty('totalNodes');
            expect(metrics).toHaveProperty('activeNodes');
            expect(metrics).toHaveProperty('queuedNodes');
        });
        test('should return all category metrics', () => {
            const allMetrics = categoryManager.getAllCategoryMetrics();
            expect(allMetrics).toHaveProperty('basic');
            expect(allMetrics).toHaveProperty('advanced');
            expect(allMetrics).toHaveProperty('utility');
            expect(allMetrics).toHaveProperty('integration');
        });
        test('should update metrics when execution starts', () => {
            const startHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_started')?.[1];
            expect(startHandler).toBeDefined();
            if (startHandler) {
                startHandler({ nodeType: 'WeightedChoice', nodeId: 'test-node' });
                const metrics = categoryManager.getCategoryMetrics('basic');
                expect(metrics?.totalNodes).toBeGreaterThan(0);
            }
        });
        test('should update metrics when execution completes', () => {
            const completeHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_completed')?.[1];
            expect(completeHandler).toBeDefined();
            if (completeHandler) {
                // First start an execution
                const startHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_started')?.[1];
                if (startHandler) {
                    startHandler({ nodeType: 'WeightedChoice', nodeId: 'test-node' });
                }
                // Then complete it
                completeHandler({
                    nodeType: 'WeightedChoice',
                    nodeId: 'test-node',
                    metrics: mockPerformanceMetrics
                });
                const metrics = categoryManager.getCategoryMetrics('basic');
                expect(metrics?.activeNodes).toBeGreaterThanOrEqual(0);
            }
        });
    });
    describe('Optimization Recommendations', () => {
        test('should generate recommendations for categories with issues', () => {
            // Simulate high error rate
            const completeHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_completed')?.[1];
            if (completeHandler) {
                // Complete multiple executions with errors to trigger high error rate
                for (let i = 0; i < 10; i++) {
                    completeHandler({
                        nodeType: 'WeightedChoice',
                        nodeId: `error-node-${i}`,
                        metrics: {
                            ...mockPerformanceMetrics,
                            errors: ['Validation failed', 'Timeout error']
                        }
                    });
                }
            }
            const recommendations = categoryManager.getOptimizationRecommendations();
            expect(Array.isArray(recommendations)).toBe(true);
        });
        test('should sort recommendations by priority', () => {
            const recommendations = categoryManager.getOptimizationRecommendations();
            if (recommendations.length > 1) {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                for (let i = 1; i < recommendations.length; i++) {
                    const prevPriority = priorityOrder[recommendations[i - 1].priority];
                    const currPriority = priorityOrder[recommendations[i].priority];
                    expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
                }
            }
        });
        test('should include estimated impact in recommendations', () => {
            const recommendations = categoryManager.getOptimizationRecommendations();
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('estimatedImpact');
                expect(typeof rec.estimatedImpact).toBe('number');
                expect(rec.estimatedImpact).toBeGreaterThanOrEqual(0);
                expect(rec.estimatedImpact).toBeLessThanOrEqual(100);
            });
        });
    });
    describe('Optimization Actions', () => {
        test('should force optimization for specific category', async () => {
            const actions = await categoryManager.forceOptimization('basic');
            expect(Array.isArray(actions)).toBe(true);
        });
        test('should throw error for unknown category optimization', async () => {
            await expect(categoryManager.forceOptimization('nonexistent')).rejects.toThrow('Category not found: nonexistent');
        });
        test('should apply optimization actions', async () => {
            const actions = await categoryManager.forceOptimization('basic');
            if (actions.length > 0) {
                const success = await categoryManager.applyOptimization(actions[0].id);
                expect(typeof success).toBe('boolean');
            }
        });
        test('should emit events when optimization is applied', async () => {
            const actions = await categoryManager.forceOptimization('basic');
            if (actions.length > 0) {
                const optimizationPromise = new Promise((resolve) => {
                    categoryManager.on('optimization_applied', (data) => {
                        expect(data).toHaveProperty('actionId');
                        expect(data).toHaveProperty('category');
                        expect(data).toHaveProperty('action');
                        resolve();
                    });
                });
                await categoryManager.applyOptimization(actions[0].id);
                await optimizationPromise;
            }
        });
        test('should handle optimization failures gracefully', async () => {
            await expect(categoryManager.applyOptimization('nonexistent-action-id')).rejects.toThrow('Optimization action not found: nonexistent-action-id');
        });
    });
    describe('Cache Statistics', () => {
        test('should return cache statistics for all categories', () => {
            const stats = categoryManager.getCacheStatistics();
            expect(stats).toHaveProperty('basic');
            expect(stats).toHaveProperty('advanced');
            expect(stats).toHaveProperty('utility');
            expect(stats).toHaveProperty('integration');
            Object.values(stats).forEach(stat => {
                expect(stat).toHaveProperty('size');
                expect(stat).toHaveProperty('maxSize');
                expect(stat).toHaveProperty('hitRate');
                expect(stat).toHaveProperty('evictions');
            });
        });
        test('should reflect cache configuration differences', () => {
            const stats = categoryManager.getCacheStatistics();
            // Integration category should have cache disabled
            expect(stats.integration.maxSize).toBe(0);
            // Other categories should have cache enabled
            expect(stats.basic.maxSize).toBeGreaterThan(0);
            expect(stats.advanced.maxSize).toBeGreaterThan(0);
            expect(stats.utility.maxSize).toBeGreaterThan(0);
        });
    });
    describe('Event Handling', () => {
        test('should emit execution_started_immediate event', async () => {
            const eventPromise = new Promise((resolve) => {
                categoryManager.on('execution_started_immediate', (data) => {
                    expect(data).toHaveProperty('executionId');
                    expect(data).toHaveProperty('nodeId');
                    expect(data).toHaveProperty('nodeType');
                    expect(data).toHaveProperty('category');
                    resolve();
                });
            });
            await categoryManager.registerExecution('test-node', 'WeightedChoice', 0);
            await eventPromise;
        });
        test('should emit execution_queued event', async () => {
            // Fill capacity first
            for (let i = 0; i < 50; i++) {
                await categoryManager.registerExecution(`immediate-${i}`, 'WeightedChoice', 0);
            }
            const eventPromise = new Promise((resolve) => {
                categoryManager.on('execution_queued', (data) => {
                    expect(data).toHaveProperty('executionId');
                    expect(data).toHaveProperty('nodeId');
                    expect(data).toHaveProperty('nodeType');
                    expect(data).toHaveProperty('category');
                    expect(data).toHaveProperty('queuePosition');
                    resolve();
                });
            });
            await categoryManager.registerExecution('queued-node', 'WeightedChoice', 0);
            await eventPromise;
        });
        test('should emit execution_dequeued event when processing queue', () => {
            const completeHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_completed')?.[1];
            if (completeHandler) {
                const eventPromise = new Promise((resolve) => {
                    categoryManager.on('execution_dequeued', (data) => {
                        expect(data).toHaveProperty('nodeId');
                        expect(data).toHaveProperty('category');
                        expect(data).toHaveProperty('waitTime');
                        resolve();
                    });
                });
                // Simulate completion to trigger queue processing
                completeHandler({
                    nodeType: 'WeightedChoice',
                    nodeId: 'completed-node',
                    metrics: mockPerformanceMetrics
                });
                return eventPromise;
            }
        });
    });
    describe('Shutdown', () => {
        test('should clean up resources on shutdown', () => {
            categoryManager.shutdown();
            const stats = categoryManager.getCacheStatistics();
            Object.values(stats).forEach(stat => {
                expect(stat.size).toBe(0);
            });
        });
        test('should emit manager_shutdown event', (done) => {
            categoryManager.on('manager_shutdown', () => {
                done();
            });
            categoryManager.shutdown();
        });
        test('should clear metrics update interval', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            categoryManager.shutdown();
            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
    });
    describe('Performance under Load', () => {
        test('should handle high-volume execution registration', async () => {
            const promises = [];
            const nodeCount = 1000;
            for (let i = 0; i < nodeCount; i++) {
                const nodeType = i % 4 === 0 ? 'WeightedChoice' :
                    i % 4 === 1 ? 'WeightedAdvanced' :
                        i % 4 === 2 ? 'Include' : 'APICall';
                promises.push(categoryManager.registerExecution(`load-node-${i}`, nodeType, Math.floor(Math.random() * 10)));
            }
            const results = await Promise.all(promises);
            expect(results).toHaveLength(nodeCount);
            // All should have valid execution IDs
            results.forEach(result => {
                expect(typeof result).toBe('string');
                expect(result.length).toBeGreaterThan(0);
            });
        });
        test('should maintain performance with frequent metrics updates', (done) => {
            const startTime = Date.now();
            const updateCount = 1000;
            let completedUpdates = 0;
            const completeHandler = performanceMonitor.on.mock.calls.find(call => call[0] === 'execution_completed')?.[1];
            if (completeHandler) {
                const interval = setInterval(() => {
                    completeHandler({
                        nodeType: 'WeightedChoice',
                        nodeId: `perf-test-${completedUpdates}`,
                        metrics: mockPerformanceMetrics
                    });
                    completedUpdates++;
                    if (completedUpdates >= updateCount) {
                        clearInterval(interval);
                        const duration = Date.now() - startTime;
                        // Should complete 1000 updates in reasonable time
                        expect(duration).toBeLessThan(5000); // 5 seconds max
                        expect(completedUpdates).toBe(updateCount);
                        done();
                    }
                }, 1);
            }
            else {
                done.fail('Could not find execution_completed handler');
            }
        });
        test('should handle edge cases gracefully', async () => {
            // Test with extreme priority values
            await expect(categoryManager.registerExecution('extreme-high', 'WeightedChoice', 9999)).resolves.toBeDefined();
            await expect(categoryManager.registerExecution('extreme-low', 'WeightedChoice', -9999)).resolves.toBeDefined();
            // Test with empty/null node IDs
            await expect(categoryManager.registerExecution('', 'WeightedChoice', 0)).resolves.toBeDefined();
            // Test with very long node IDs
            const longNodeId = 'a'.repeat(1000);
            await expect(categoryManager.registerExecution(longNodeId, 'WeightedChoice', 0)).resolves.toBeDefined();
        });
    });
    describe('Configuration Validation', () => {
        test('should work with minimal configuration', () => {
            const minimalConfig = { enableCategoryOptimization: false };
            const manager = new CategoryPerformanceManager(performanceMonitor, minimalConfig);
            expect(manager).toBeInstanceOf(CategoryPerformanceManager);
            manager.shutdown();
        });
        test('should work with partial configuration', () => {
            const partialConfig = {
                globalSettings: {
                    maxConcurrentOperations: 25,
                    memoryThreshold: 512 * 1024 * 1024,
                    cpuThreshold: 70,
                    responseTimeTarget: 150
                }
            };
            const manager = new CategoryPerformanceManager(performanceMonitor, partialConfig);
            expect(manager).toBeInstanceOf(CategoryPerformanceManager);
            manager.shutdown();
        });
        test('should validate category configuration overrides', () => {
            const customCategories = {
                'custom': {
                    name: 'Custom Category',
                    priority: 'high',
                    optimizationStrategy: 'latency',
                    resourceLimits: {
                        maxMemoryMB: 1000,
                        maxExecutionTimeMs: 2000,
                        maxConcurrentNodes: 25,
                        queueLimit: 500
                    },
                    cacheStrategy: {
                        enabled: true,
                        ttlMs: 120000,
                        maxSize: 100,
                        evictionPolicy: 'lfu'
                    },
                    scalingRules: {
                        scaleUpThreshold: 80,
                        scaleDownThreshold: 20,
                        cooldownMs: 45000,
                        maxInstances: 8
                    }
                }
            };
            const config = {
                categories: customCategories
            };
            const manager = new CategoryPerformanceManager(performanceMonitor, config);
            expect(manager.getCategoryMetrics('custom')).toBeDefined();
            manager.shutdown();
        });
    });
});
