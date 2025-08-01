/**
 * Event System Main Export
 *
 * Centralized export for all event system components, utilities, and integrations.
 * This provides a single import point for the entire event system functionality.
 */
export { EventBus, globalEventBus, BaseEvent, EventPriority, EventCategory, EventFactory, EventFilter, EventHandler, EventSubscription, EventMiddleware, LoggingMiddleware, ValidationMiddleware, RateLimitMiddleware, WorkflowEventSchema, AnalyticsEventSchema, SecurityEventSchema, SystemEventSchema, UIEventSchema } from './EventSystem';
export { WebSocketEventAdapter, webSocketEventAdapter, WebSocketEventUtils } from './adapters/WebSocketEventAdapter';
export { ZustandEventAdapter, createZustandEventAdapter, createEventAwareStore, ZustandEventUtils, GraphStoreEventAdapter, CollaborativeGraphStoreEventAdapter, UISettingsStoreEventAdapter, EventableStore, StateChangeEvent } from './adapters/ZustandEventAdapter';
export { useEventSubscription, useEventPublisher, useWorkflowEvents, useAnalyticsEvents, useUIEvents, useEventHistory, useEventStats, useDebouncedEventPublisher, useBatchedEventPublisher, useConditionalEventSubscription, useEventState, useEventPerformanceMonitor } from './hooks/useEventBus';
export { createLoggingMiddleware, createValidationMiddleware, createRateLimitMiddleware, createTransformMiddleware, createSecurityMiddleware, createPerformanceMiddleware, createDeduplicationMiddleware, createCircuitBreakerMiddleware, ProductionMiddleware, DevelopmentMiddleware, TestingMiddleware } from './middleware/EventMiddleware';
export type { EventableStore, StateChangeEvent, ZustandEventConfig } from './adapters/ZustandEventAdapter';
/**
 * Event System Configuration and Setup Utilities
 */
export declare /**
 * Event system health check utility
 */
export declare const performEventSystemHealthCheck: () => { status: "healthy" | "degraded" | "unhealthy";
    stats: {
        subscriptions: number;
        middleware: number;
        historySize: number;
        eventTypes: string[] };
    issues: string[];
};
/**
 * Event system metrics collection utility
 */
export declare const collectEventSystemMetrics: () => { metrics: {
        avgEventsPerMinute: number;
        topEventTypes: [string, number][];
        eventsByCategory: Record<string, number>;
        eventsByPriority: Record<string, number> };
    subscriptions: number;
    middleware: number;
    historySize: number;
    eventTypes: string[];
};
/**
 * Predefined event system setups for common use cases
 */
export declare const EventSystemPresets: { /**
     * Minimal setup for simple applications
     */
    minimal: () => void;
    /**
     * Analytics-focused setup
     */
    analytics: () => void;
    /**
     * High-security setup
     */
    security: () => void;
    /**
     * High-performance setup
     */
    performance: () => void };
declare const _default: { EventBus: any;
    globalEventBus: import("./EventSystem").EventBus;
    EventFactory: any;
    initializeEventSystem: (environment?: "production" | "development" | "testing") => import("./EventSystem").EventBus;
    EventSystemPresets: {
        /**
         * Minimal setup for simple applications
         */
        minimal: () => void;
        /**
         * Analytics-focused setup
         */
        analytics: () => void;
        /**
         * High-security setup
         */
        security: () => void;
        /**
         * High-performance setup
         */
        performance: () => void };
    performEventSystemHealthCheck: () => { 
        status: "healthy" | "degraded" | "unhealthy";
        stats: {
            subscriptions: number;
            middleware: number;
            historySize: number;
            eventTypes: string[] };
        issues: string[];
    };
    collectEventSystemMetrics: () => { 
        metrics: {
            avgEventsPerMinute: number;
            topEventTypes: [string, number][];
            eventsByCategory: Record<string, number>;
            eventsByPriority: Record<string, number> };
        subscriptions: number;
        middleware: number;
        historySize: number;
        eventTypes: string[];
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map