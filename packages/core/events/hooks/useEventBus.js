/**
 * React hooks for Event Bus integration
 *
 * Provides React components with easy access to the centralized event system.
 * Handles subscription lifecycle, event publishing, and performance optimization.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { globalEventBus, EventPriority, EventFactory } from '../EventSystem.js';
/**
 * Hook for subscribing to events with automatic cleanup
 */
export function useEventSubscription(filter, handler, options) {
    const handlerRef = useRef(handler);
    const subscriptionIdRef = useRef(null);
    // Update handler reference
    handlerRef.current = handler;
    useEffect(() => {
        // Skip if disabled
        if (options?.enabled === false) {
            return;
        }
        // Create stable wrapper for handler
        const stableHandler = (event) => {
            handlerRef.current(event);
        };
        // Subscribe to events
        subscriptionIdRef.current = globalEventBus.subscribe(filter, stableHandler, {
            priority: options?.priority ?? EventPriority.MEDIUM,
            once: options?.once ?? false
        });
        // Cleanup on unmount or dependency change
        return () => {
            if (subscriptionIdRef.current) {
                globalEventBus.unsubscribe(subscriptionIdRef.current);
                subscriptionIdRef.current = null;
            }
        };
    }, [
        JSON.stringify(filter),
        options?.priority,
        options?.once,
        options?.enabled
    ]);
}
/**
 * Hook for publishing events
 */
export function useEventPublisher() {
    return useCallback(async (event) => {
        try {
            await globalEventBus.publish(event);
        }
        catch (error) {
            console.error('Failed to publish event:', error);
            throw error;
        }
    }, []);
}
/**
 * Hook for workflow events
 */
export function useWorkflowEvents(userId) {
    const publish = useEventPublisher();
    const publishTaskCreated = useCallback((taskId, data) => {
        const event = EventFactory.createWorkflowEvent('task_created', { taskId, data }, 'workflow-hook', userId);
        return publish(event);
    }, [publish, userId]);
    const publishTaskCompleted = useCallback((taskId, data) => {
        const event = EventFactory.createWorkflowEvent('task_completed', { taskId, data }, 'workflow-hook', userId);
        return publish(event);
    }, [publish, userId]);
    const publishTemplateUsed = useCallback((templateId, data) => {
        const event = EventFactory.createWorkflowEvent('template_used', { templateId, data }, 'workflow-hook', userId);
        return publish(event);
    }, [publish, userId]);
    return {
        publishTaskCreated,
        publishTaskCompleted,
        publishTemplateUsed
    };
}
/**
 * Hook for analytics events
 */
export function useAnalyticsEvents(userId) {
    const publish = useEventPublisher();
    const trackUserAction = useCallback((action, data) => {
        const event = EventFactory.createAnalyticsEvent('user_action', { action, data }, 'analytics-hook', userId);
        return publish(event);
    }, [publish, userId]);
    const trackFeatureUsage = useCallback((feature, duration, data) => {
        const event = EventFactory.createAnalyticsEvent('feature_used', { feature, duration, data }, 'analytics-hook', userId);
        return publish(event);
    }, [publish, userId]);
    const trackPerformance = useCallback((metric, value, data) => {
        const event = EventFactory.createAnalyticsEvent('performance_metric', { action: metric, value, data }, 'analytics-hook', userId);
        return publish(event);
    }, [publish, userId]);
    return {
        trackUserAction,
        trackFeatureUsage,
        trackPerformance
    };
}
/**
 * Hook for UI events
 */
export function useUIEvents(componentName, userId, sessionId) {
    const publish = useEventPublisher();
    const publishComponentMounted = useCallback((data) => {
        const event = EventFactory.createUIEvent('component_mounted', { component: componentName, data }, 'ui-hook', userId, sessionId);
        return publish(event);
    }, [publish, componentName, userId, sessionId]);
    const publishUserInteraction = useCallback((action, data) => {
        const event = EventFactory.createUIEvent('user_interaction', { component: componentName, action, data }, 'ui-hook', userId, sessionId);
        return publish(event);
    }, [publish, componentName, userId, sessionId]);
    const publishStateChange = useCallback((data) => {
        const event = EventFactory.createUIEvent('state_change', { component: componentName, data }, 'ui-hook', userId, sessionId);
        return publish(event);
    }, [publish, componentName, userId, sessionId]);
    // Auto-publish component mount/unmount
    useEffect(() => {
        publishComponentMounted();
        return () => {
            const event = EventFactory.createUIEvent('component_unmounted', { component: componentName }, 'ui-hook', userId, sessionId);
            publish(event);
        };
    }, []);
    return {
        publishUserInteraction,
        publishStateChange
    };
}
/**
 * Hook for event history and querying
 */
export function useEventHistory(filter, limit) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const refreshHistory = useCallback(() => {
        setLoading(true);
        try {
            const events = globalEventBus.getHistory(filter, limit);
            setHistory(events);
        }
        catch (error) {
            console.error('Failed to get event history:', error);
        }
        finally {
            setLoading(false);
        }
    }, [filter, limit]);
    // Auto-refresh on filter change
    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);
    // Subscribe to new events to auto-update history
    useEventSubscription(filter || {}, () => {
        refreshHistory();
    }, { priority: EventPriority.LOW });
    return {
        history,
        loading,
        refreshHistory
    };
}
/**
 * Hook for event statistics and monitoring
 */
export function useEventStats() {
    const [stats, setStats] = useState(globalEventBus.getStats());
    const refreshStats = useCallback(() => {
        setStats(globalEventBus.getStats());
    }, []);
    // Auto-refresh stats periodically
    useEffect(() => {
        const interval = setInterval(refreshStats, 5000); // Every 5 seconds
        return () => clearInterval(interval);
    }, [refreshStats]);
    return {
        ...stats,
        refreshStats
    };
}
/**
 * Hook for debounced event publishing
 */
export function useDebouncedEventPublisher(delay = 300) {
    const timeoutRef = useRef(null);
    const publish = useEventPublisher();
    const debouncedPublish = useCallback((event) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            publish(event);
        }, delay);
    }, [publish, delay]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return debouncedPublish;
}
/**
 * Hook for batched event publishing
 */
export function useBatchedEventPublisher(batchSize = 10, flushInterval = 1000) {
    const batchRef = useRef([]);
    const timeoutRef = useRef(null);
    const publish = useEventPublisher();
    const flushBatch = useCallback(async () => {
        if (batchRef.current.length === 0)
            return;
        const batch = [...batchRef.current];
        batchRef.current = [];
        // Publish all events in batch
        try {
            await Promise.all(batch.map(event => publish(event)));
        }
        catch (error) {
            console.error('Failed to publish event batch:', error);
        }
    }, [publish]);
    const addToBatch = useCallback((event) => {
        batchRef.current.push(event);
        // Flush if batch is full
        if (batchRef.current.length >= batchSize) {
            flushBatch();
            return;
        }
        // Set timer to flush batch
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(flushBatch, flushInterval);
    }, [batchSize, flushInterval, flushBatch]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Flush remaining events
            flushBatch();
        };
    }, [flushBatch]);
    return {
        addToBatch,
        flushBatch
    };
}
/**
 * Hook for conditional event subscriptions
 */
export function useConditionalEventSubscription(condition, filter, handler, options) {
    const [enabled, setEnabled] = useState(condition());
    const checkInterval = options?.checkInterval ?? 1000;
    // Periodically check condition
    useEffect(() => {
        const interval = setInterval(() => {
            setEnabled(condition());
        }, checkInterval);
        return () => clearInterval(interval);
    }, [condition, checkInterval]);
    // Subscribe when enabled
    useEventSubscription(filter, handler, {
        priority: options?.priority,
        enabled
    });
    return enabled;
}
/**
 * Hook for event-driven state updates
 */
export function useEventState(initialState, filter, updateFn) {
    const [state, setState] = useState(initialState);
    useEventSubscription(filter, (event) => {
        setState(currentState => updateFn(currentState, event));
    }, { priority: EventPriority.HIGH });
    return [state, setState];
}
/**
 * Performance monitoring hook for events
 */
export function useEventPerformanceMonitor() {
    const [metrics, setMetrics] = useState({
        totalEvents: 0,
        eventsPerSecond: 0,
        avgProcessingTime: 0,
        errorRate: 0
    });
    useEffect(() => {
        let eventCount = 0;
        let errorCount = 0;
        let totalProcessingTime = 0;
        const startTime = Date.now();
        // Subscribe to all events
        const subscriptionId = globalEventBus.subscribe({}, (event) => {
            eventCount++;
            const processingTime = Date.now() - event.timestamp.getTime();
            totalProcessingTime += processingTime;
            // Update metrics
            const elapsed = Date.now() - startTime;
            setMetrics({
                totalEvents: eventCount,
                eventsPerSecond: (eventCount / elapsed) * 1000,
                avgProcessingTime: totalProcessingTime / eventCount,
                errorRate: errorCount / eventCount
            });
        }, { priority: EventPriority.LOW });
        // Subscribe to error events
        const errorSubscriptionId = globalEventBus.subscribe({ types: ['handler_error', 'system_error'] }, () => {
            errorCount++;
        }, { priority: EventPriority.LOW });
        return () => {
            globalEventBus.unsubscribe(subscriptionId);
            globalEventBus.unsubscribe(errorSubscriptionId);
        };
    }, []);
    return metrics;
}
