/**
 * React hooks for Event Bus integration
 *
 * Provides React components with easy access to the centralized event system.
 * Handles subscription lifecycle, event publishing, and performance optimization.
 */
import { BaseEvent, EventFilter, EventHandler, EventPriority } from '../EventSystem';
/**
 * Hook for subscribing to events with automatic cleanup
 */
export declare function useEventSubscription<T extends BaseEvent = BaseEvent>(filter: EventFilter, handler: EventHandler<T>, options?: {
    priority?: EventPriority;
    once?: boolean;
    enabled?: boolean;
}): void;
/**
 * Hook for publishing events
 */
export declare function useEventPublisher(): (event: BaseEvent) => Promise<void>;
/**
 * Hook for workflow events
 */
export declare function useWorkflowEvents(userId?: string): {
    publishTaskCreated: (taskId: string, data?: any) => Promise<void>;
    publishTaskCompleted: (taskId: string, data?: any) => Promise<void>;
    publishTemplateUsed: (templateId: string, data?: any) => Promise<void>;
};
/**
 * Hook for analytics events
 */
export declare function useAnalyticsEvents(userId?: string): {
    trackUserAction: (action: string, data?: any) => Promise<void>;
    trackFeatureUsage: (feature: string, duration?: number, data?: any) => Promise<void>;
    trackPerformance: (metric: string, value: number, data?: any) => Promise<void>;
};
/**
 * Hook for UI events
 */
export declare function useUIEvents(componentName: string, userId?: string, sessionId?: string): {
    publishUserInteraction: (action: string, data?: any) => Promise<void>;
    publishStateChange: (data?: any) => Promise<void>;
};
/**
 * Hook for event history and querying
 */
export declare function useEventHistory(filter?: EventFilter, limit?: number): {
    history: BaseEvent[];
    loading: boolean;
    refreshHistory: () => void;
};
/**
 * Hook for event statistics and monitoring
 */
export declare function useEventStats(): {
    refreshStats: () => void;
    subscriptions: number;
    middleware: number;
    historySize: number;
    eventTypes: string[];
};
/**
 * Hook for debounced event publishing
 */
export declare function useDebouncedEventPublisher(delay?: number): (event: BaseEvent) => void;
/**
 * Hook for batched event publishing
 */
export declare function useBatchedEventPublisher(batchSize?: number, flushInterval?: number): {
    addToBatch: (event: BaseEvent) => void;
    flushBatch: () => Promise<void>;
};
/**
 * Hook for conditional event subscriptions
 */
export declare function useConditionalEventSubscription<T extends BaseEvent = BaseEvent>(condition: () => boolean, filter: EventFilter, handler: EventHandler<T>, options?: {
    priority?: EventPriority;
    checkInterval?: number;
}): boolean;
/**
 * Hook for event-driven state updates
 */
export declare function useEventState<T>(
  initialState: T,
  filter: EventFilter,
  updateFn: (currentState: T,
  event: BaseEvent
) => T): [T, React.Dispatch<React.SetStateAction<T>>];
/**
 * Performance monitoring hook for events
 */
export declare function useEventPerformanceMonitor(): {
    totalEvents: number;
    eventsPerSecond: number;
    avgProcessingTime: number;
    errorRate: number;
};
//# sourceMappingURL=useEventBus.d.ts.map