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
export declare const EventSystemConfigs: {
    production: {
        middleware: any[];
    };
    createPerformanceMiddleware({}: {}): any;
    sampleRate: number;
    slowEventThreshold: number;
}, createLoggingMiddleware: any;
/**
 * Event system health check utility
 */
export declare const performEventSystemHealthCheck: () => {
    status: "healthy" | "degraded" | "unhealthy";
    stats: any;
    issues: string;
};
//# sourceMappingURL=index.d.ts.map