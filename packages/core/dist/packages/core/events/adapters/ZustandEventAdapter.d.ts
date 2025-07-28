import { BaseEvent, EventCategory, EventPriority } from '../EventSystem';
/**
 * Zustand middleware that publishes state changes as events
 */
export interface EventableStore {
    _eventAdapter?: ZustandEventAdapter;
}
export interface StateChangeEvent extends BaseEvent {
    type: 'state_changed' | 'store_initialized' | 'store_reset';
    metadata: {
        storeName: string;
        path: string;
        previousValue: unknown;
        currentValue: unknown;
        category: EventCategory;
        priority: EventPriority;
    };
}
/**
 * Configuration for Zustand event integration
 */
export interface ZustandEventConfig {
    storeName: string;
    enabledPaths?: string;
    ignoredPaths?: string;
    debounceMs?: number;
    priority?: EventPriority;
    category?: EventCategory;
}
export declare class ZustandEventAdapter {
    private config;
    private subscriptions;
    private debounceTimers;
    constructor(config: ZustandEventConfig);
    /**
     * Create Zustand middleware that publishes state changes as events
     */
    middleware: T extends object ? any : any;
    StateCreator<T>(): any;
}
//# sourceMappingURL=ZustandEventAdapter.d.ts.map