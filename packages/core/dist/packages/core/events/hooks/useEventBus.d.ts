import { BaseEvent, EventFilter } from '../EventSystem';
/**
 * Hook for subscribing to events with automatic cleanup
 */
export declare function useEventSubscription<T extends BaseEvent = BaseEvent>(filter: EventFilter): any;
/**
 * Hook for UI events
 */
export declare function useUIEvents(componentName: string, userId?: string, sessionId?: string): any;
/**
 * Hook for event history and querying
 */
export declare function useEventHistory(filter?: EventFilter, limit?: number): {
    history: BaseEvent;
    loading: boolean;
    refreshHistory: () => void;
};
//# sourceMappingURL=useEventBus.d.ts.map