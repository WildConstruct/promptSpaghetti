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
export type { EventFilter, EventHandler, EventSubscription, EventMiddleware, BaseEvent } from './EventSystem';
export type { EventableStore, StateChangeEvent, ZustandEventConfig } from './adapters/ZustandEventAdapter';
/**
 * Event System Configuration and Setup Utilities
 */
export declare const EventSystemConfigs: {
    production: {
        middleware: any[];
        eventBusOptions: {
            maxHistorySize: number;
            enableHistory: boolean;
        };
    };
    development: {
        middleware: any[];
        eventBusOptions: {
            maxHistorySize: number;
            enableHistory: boolean;
        };
    };
    testing: {
        middleware: any[];
        eventBusOptions: {
            maxHistorySize: number;
            enableHistory: boolean;
        };
    };
};
/**
 * Initialize event system with environment-specific configuration
 */
export declare const initializeEventSystem: (environment?: "production" | "development" | "testing") => any;
/**
 * Event system health check utility
 */
export declare const performEventSystemHealthCheck: () => {
    status: "healthy" | "degraded" | "unhealthy";
    stats: any;
    issues: string[];
};
/**
 * Event system metrics collection utility
 */
export declare const collectEventSystemMetrics: () => any;
/**
 * Predefined event system setups for common use cases
 */
export declare const EventSystemPresets: {
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
    performance: () => void;
};
declare const _default: {
    EventBus: any;
    globalEventBus: any;
    EventFactory: any;
    initializeEventSystem: (environment?: "production" | "development" | "testing") => any;
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
        performance: () => void;
    };
    performEventSystemHealthCheck: () => {
        status: "healthy" | "degraded" | "unhealthy";
        stats: any;
        issues: string[];
    };
    collectEventSystemMetrics: () => any;
};
export default _default;
//# sourceMappingURL=index.d.ts.map