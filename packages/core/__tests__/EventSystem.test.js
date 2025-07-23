/**
 * Comprehensive test suite for the Event System
 *
 * Tests all core functionality including:
 * - Event bus operations (publish, subscribe, unsubscribe)
 * - Event filtering and routing
 * - Middleware processing
 * - Performance and reliability
 */
import { EventBus, EventCategory, EventPriority, EventFactory, globalEventBus } from '../events/EventSystem';
import { createValidationMiddleware, createRateLimitMiddleware, createDeduplicationMiddleware } from '../events/middleware/EventMiddleware';
// Helper function to create test events
const createTestEvent = (overrides) => ({
    type: 'test_event',
    timestamp: new Date(),
    id: crypto.randomUUID(),
    source: 'test-suite',
    ...overrides
});
describe('EventSystem', () => {
    let eventBus;
    beforeEach(() => {
        eventBus = new EventBus({ maxHistorySize: 100 });
    });
    afterEach(() => {
        eventBus.removeAllListeners();
        eventBus.clearHistory();
    });
    describe('EventBus Core Operations', () => {
        it('should publish and receive events', async () => {
            const mockHandler = jest.fn();
            const testEvent = createTestEvent({ type: 'test_publish' });
            eventBus.subscribe({ types: ['test_publish'] }, mockHandler);
            await eventBus.publish(testEvent);
            expect(mockHandler).toHaveBeenCalledWith(testEvent);
            expect(mockHandler).toHaveBeenCalledTimes(1);
        });
        it('should handle multiple subscribers for same event', async () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            const testEvent = createTestEvent({ type: 'multi_subscriber' });
            eventBus.subscribe({ types: ['multi_subscriber'] }, handler1);
            eventBus.subscribe({ types: ['multi_subscriber'] }, handler2);
            await eventBus.publish(testEvent);
            expect(handler1).toHaveBeenCalledWith(testEvent);
            expect(handler2).toHaveBeenCalledWith(testEvent);
        });
        it('should unsubscribe correctly', async () => {
            const mockHandler = jest.fn();
            const testEvent = createTestEvent({ type: 'test_unsubscribe' });
            const subscriptionId = eventBus.subscribe({ types: ['test_unsubscribe'] }, mockHandler);
            await eventBus.publish(testEvent);
            expect(mockHandler).toHaveBeenCalledTimes(1);
            const unsubscribed = eventBus.unsubscribe(subscriptionId);
            expect(unsubscribed).toBe(true);
            await eventBus.publish(testEvent);
            expect(mockHandler).toHaveBeenCalledTimes(1); // Should not increase
        });
        it('should handle one-time subscriptions', async () => {
            const mockHandler = jest.fn();
            const testEvent = createTestEvent({ type: 'test_once' });
            eventBus.subscribe({ types: ['test_once'] }, mockHandler, { once: true });
            await eventBus.publish(testEvent);
            await eventBus.publish(testEvent);
            expect(mockHandler).toHaveBeenCalledTimes(1);
        });
        it('should validate required event fields', async () => {
            const invalidEvent = { type: 'invalid' };
            await expect(eventBus.publish(invalidEvent))
                .rejects
                .toThrow('Event missing required fields');
        });
    });
    describe('Event Filtering', () => {
        it('should filter by event types', async () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            eventBus.subscribe({ types: ['type_a'] }, handler1);
            eventBus.subscribe({ types: ['type_b'] }, handler2);
            await eventBus.publish(createTestEvent({ type: 'type_a' }));
            await eventBus.publish(createTestEvent({ type: 'type_b' }));
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
        it('should filter by categories', async () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            eventBus.subscribe({ categories: [EventCategory.WORKFLOW] }, handler1);
            eventBus.subscribe({ categories: [EventCategory.ANALYTICS] }, handler2);
            await eventBus.publish(createTestEvent({
                metadata: { category: EventCategory.WORKFLOW }
            }));
            await eventBus.publish(createTestEvent({
                metadata: { category: EventCategory.ANALYTICS }
            }));
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
        it('should filter by user ID', async () => {
            const userHandler = jest.fn();
            const allHandler = jest.fn();
            eventBus.subscribe({ userIds: ['user123'] }, userHandler);
            eventBus.subscribe({}, allHandler);
            await eventBus.publish(createTestEvent({ userId: 'user123' }));
            await eventBus.publish(createTestEvent({ userId: 'user456' }));
            expect(userHandler).toHaveBeenCalledTimes(1);
            expect(allHandler).toHaveBeenCalledTimes(2);
        });
        it('should filter by time window', async () => {
            const handler = jest.fn();
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            eventBus.subscribe({
                timeWindow: {
                    start: oneHourAgo,
                    end: oneHourFromNow
                }
            }, handler);
            // Event within window
            await eventBus.publish(createTestEvent({ timestamp: now }));
            // Event outside window
            await eventBus.publish(createTestEvent({
                timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000)
            }));
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
    describe('Event Priority Handling', () => {
        it('should execute handlers in priority order', async () => {
            const executionOrder = [];
            const criticalHandler = jest.fn(() => executionOrder.push('critical'));
            const highHandler = jest.fn(() => executionOrder.push('high'));
            const mediumHandler = jest.fn(() => executionOrder.push('medium'));
            const lowHandler = jest.fn(() => executionOrder.push('low'));
            eventBus.subscribe({}, criticalHandler, { priority: EventPriority.CRITICAL });
            eventBus.subscribe({}, highHandler, { priority: EventPriority.HIGH });
            eventBus.subscribe({}, mediumHandler, { priority: EventPriority.MEDIUM });
            eventBus.subscribe({}, lowHandler, { priority: EventPriority.LOW });
            await eventBus.publish(createTestEvent());
            expect(executionOrder).toEqual(['critical', 'high', 'medium', 'low']);
        });
    });
    describe('Event History', () => {
        it('should maintain event history', async () => {
            const event1 = createTestEvent({ type: 'history_1' });
            const event2 = createTestEvent({ type: 'history_2' });
            await eventBus.publish(event1);
            await eventBus.publish(event2);
            const history = eventBus.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].type).toBe('history_1');
            expect(history[1].type).toBe('history_2');
        });
        it('should filter event history', async () => {
            await eventBus.publish(createTestEvent({ type: 'type_a' }));
            await eventBus.publish(createTestEvent({ type: 'type_b' }));
            await eventBus.publish(createTestEvent({ type: 'type_a' }));
            const filteredHistory = eventBus.getHistory({ types: ['type_a'] });
            expect(filteredHistory).toHaveLength(2);
            expect(filteredHistory.every(event => event.type === 'type_a')).toBe(true);
        });
        it('should limit event history size', async () => {
            const smallEventBus = new EventBus({ maxHistorySize: 2 });
            await smallEventBus.publish(createTestEvent({ type: 'event_1' }));
            await smallEventBus.publish(createTestEvent({ type: 'event_2' }));
            await smallEventBus.publish(createTestEvent({ type: 'event_3' }));
            const history = smallEventBus.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].type).toBe('event_2');
            expect(history[1].type).toBe('event_3');
        });
    });
    describe('Event Factory Functions', () => {
        it('should create workflow events correctly', () => {
            const workflowEvent = EventFactory.createWorkflowEvent('task_created', { taskId: 'task-123' }, 'test-factory', 'user-456');
            expect(workflowEvent.type).toBe('task_created');
            expect(workflowEvent.source).toBe('test-factory');
            expect(workflowEvent.userId).toBe('user-456');
            expect(workflowEvent.metadata?.category).toBe(EventCategory.WORKFLOW);
            expect(workflowEvent.metadata?.priority).toBe(EventPriority.HIGH);
        });
        it('should create analytics events correctly', () => {
            const analyticsEvent = EventFactory.createAnalyticsEvent('user_action', { action: 'click', feature: 'button' }, 'test-factory', 'user-789');
            expect(analyticsEvent.type).toBe('user_action');
            expect(analyticsEvent.metadata?.category).toBe(EventCategory.ANALYTICS);
            expect(analyticsEvent.metadata?.priority).toBe(EventPriority.MEDIUM);
        });
        it('should create security events with correct priority', () => {
            const criticalSecurityEvent = EventFactory.createSecurityEvent('auth_failure', { severity: 'critical' }, 'test-factory', 'user-000');
            expect(criticalSecurityEvent.metadata?.priority).toBe(EventPriority.CRITICAL);
            const lowSecurityEvent = EventFactory.createSecurityEvent('audit_log', { severity: 'low' }, 'test-factory');
            expect(lowSecurityEvent.metadata?.priority).toBe(EventPriority.HIGH);
        });
    });
    describe('Middleware Processing', () => {
        it('should process middleware in order', async () => {
            const executionOrder = [];
            const middleware1 = jest.fn((event, next) => {
                executionOrder.push('middleware1');
                next();
            });
            const middleware2 = jest.fn((event, next) => {
                executionOrder.push('middleware2');
                next();
            });
            eventBus.use(middleware1);
            eventBus.use(middleware2);
            await eventBus.publish(createTestEvent());
            expect(executionOrder).toEqual(['middleware1', 'middleware2']);
        });
        it('should handle middleware errors', async () => {
            const errorHandler = jest.fn();
            const successHandler = jest.fn();
            eventBus.on('handler_error', errorHandler);
            eventBus.subscribe({}, successHandler);
            eventBus.use((event, next) => {
                throw new Error('Middleware error');
            });
            await eventBus.publish(createTestEvent());
            expect(errorHandler).toHaveBeenCalled();
            expect(successHandler).not.toHaveBeenCalled();
        });
        it('should apply validation middleware', async () => {
            eventBus.use(createValidationMiddleware({ strictMode: true }));
            const invalidEvent = {
                type: '',
                timestamp: new Date(),
                id: crypto.randomUUID(),
                source: 'test'
            };
            await expect(eventBus.publish(invalidEvent))
                .rejects
                .toThrow('Event validation failed');
        });
        it('should apply rate limiting middleware', async () => {
            eventBus.use(createRateLimitMiddleware({
                maxEventsPerSecond: 1,
                strategy: 'error'
            }));
            const testEvent = createTestEvent();
            // First event should pass
            await expect(eventBus.publish(testEvent)).resolves.not.toThrow();
            // Second event should be rate limited
            await expect(eventBus.publish(testEvent))
                .rejects
                .toThrow('Rate limit exceeded');
        });
        it('should apply deduplication middleware', async () => {
            const handler = jest.fn();
            eventBus.use(createDeduplicationMiddleware({
                keyGenerator: (event) => event.type,
                windowMs: 1000,
                strategy: 'drop'
            }));
            eventBus.subscribe({}, handler);
            const testEvent = createTestEvent({ type: 'duplicate_test' });
            await eventBus.publish(testEvent);
            await eventBus.publish(testEvent); // Should be dropped
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
    describe('Error Handling', () => {
        it('should handle handler errors gracefully', async () => {
            const errorHandler = jest.fn();
            const workingHandler = jest.fn();
            eventBus.on('handler_error', errorHandler);
            eventBus.subscribe({}, () => {
                throw new Error('Handler error');
            });
            eventBus.subscribe({}, workingHandler);
            await eventBus.publish(createTestEvent());
            expect(errorHandler).toHaveBeenCalled();
            expect(workingHandler).toHaveBeenCalled();
        });
        it('should emit error events for handler failures', async () => {
            const errorEventHandler = jest.fn();
            eventBus.subscribe({ types: ['handler_error'] }, errorEventHandler);
            eventBus.subscribe({}, () => {
                throw new Error('Test handler error');
            });
            await eventBus.publish(createTestEvent());
            expect(errorEventHandler).toHaveBeenCalled();
            const errorEvent = errorEventHandler.mock.calls[0][0];
            expect(errorEvent.type).toBe('handler_error');
            expect(errorEvent.originalEvent).toBeDefined();
        });
    });
    describe('Performance', () => {
        it('should handle high event throughput', async () => {
            const handler = jest.fn();
            eventBus.subscribe({}, handler);
            const events = Array.from({ length: 1000 }, (_, i) => createTestEvent({ type: `performance_test_${i}` }));
            const start = Date.now();
            await Promise.all(events.map(event => eventBus.publish(event)));
            const duration = Date.now() - start;
            expect(handler).toHaveBeenCalledTimes(1000);
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });
        it('should track event statistics', () => {
            eventBus.subscribe({}, jest.fn());
            eventBus.use(() => { });
            const stats = eventBus.getStats();
            expect(stats).toMatchObject({
                subscriptions: expect.any(Number),
                middleware: expect.any(Number),
                historySize: expect.any(Number),
                eventTypes: expect.any(Array)
            });
        });
    });
    describe('Global Event Bus', () => {
        it('should provide global event bus instance', () => {
            expect(globalEventBus).toBeInstanceOf(EventBus);
        });
        it('should maintain state across imports', async () => {
            const handler = jest.fn();
            globalEventBus.subscribe({}, handler);
            await globalEventBus.publish(createTestEvent());
            expect(handler).toHaveBeenCalled();
        });
    });
});
describe('Event System Integration', () => {
    beforeEach(() => {
        globalEventBus.clearHistory();
    });
    afterEach(() => {
        // Clean up global event bus
        globalEventBus.removeAllListeners();
    });
    it('should integrate workflow and analytics events', async () => {
        const workflowHandler = jest.fn();
        const analyticsHandler = jest.fn();
        globalEventBus.subscribe({ categories: [EventCategory.WORKFLOW] }, workflowHandler);
        globalEventBus.subscribe({ categories: [EventCategory.ANALYTICS] }, analyticsHandler);
        // Publish workflow event that triggers analytics
        const taskCreatedEvent = EventFactory.createWorkflowEvent('task_created', { taskId: 'task-integration' }, 'integration-test');
        await globalEventBus.publish(taskCreatedEvent);
        // Simulate analytics event triggered by workflow
        const analyticsEvent = EventFactory.createAnalyticsEvent('user_action', { action: 'task_created', feature: 'task_management' }, 'integration-test');
        await globalEventBus.publish(analyticsEvent);
        expect(workflowHandler).toHaveBeenCalledWith(expect.objectContaining({ type: 'task_created' }));
        expect(analyticsHandler).toHaveBeenCalledWith(expect.objectContaining({ type: 'user_action' }));
    });
    it('should handle cross-system event dependencies', async () => {
        const executionOrder = [];
        // UI event handler that triggers workflow event
        globalEventBus.subscribe({ types: ['user_interaction'] }, async (event) => {
            executionOrder.push('ui_handler');
            const workflowEvent = EventFactory.createWorkflowEvent('task_started', { originalEvent: event.id }, 'ui-integration');
            await globalEventBus.publish(workflowEvent);
        });
        // Workflow event handler that triggers analytics
        globalEventBus.subscribe({ types: ['task_started'] }, async (event) => {
            executionOrder.push('workflow_handler');
            const analyticsEvent = EventFactory.createAnalyticsEvent('performance_metric', { action: 'task_started', value: 1 }, 'workflow-integration');
            await globalEventBus.publish(analyticsEvent);
        });
        // Analytics event handler
        globalEventBus.subscribe({ types: ['performance_metric'] }, () => {
            executionOrder.push('analytics_handler');
        });
        // Start the chain
        const uiEvent = EventFactory.createUIEvent('user_interaction', { component: 'task-form', action: 'submit' }, 'integration-test');
        await globalEventBus.publish(uiEvent);
        // Wait for async event chain to complete
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(executionOrder).toEqual([
            'ui_handler',
            'workflow_handler',
            'analytics_handler'
        ]);
    });
});
