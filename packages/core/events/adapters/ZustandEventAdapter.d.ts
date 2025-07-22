/**
 * Zustand Event Adapter
 *
 * Bridges Zustand state management with the centralized event bus.
 * Converts state changes to events and allows event-driven state updates.
 */
import { StateCreator } from 'zustand';
import { BaseEvent, EventCategory, EventPriority } from '../EventSystem';
/**
 * Zustand middleware that publishes state changes as events
 */
export interface EventableStore {
    _eventAdapter?: ZustandEventAdapter;
}
/**
 * Event metadata for state changes
 */
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
    enabledPaths?: string[];
    ignoredPaths?: string[];
    debounceMs?: number;
    priority?: EventPriority;
    category?: EventCategory;
}
/**
 * Zustand Event Adapter Class
 */
export declare class ZustandEventAdapter {
    private config;
    private subscriptions;
    private debounceTimers;
    constructor(config: ZustandEventConfig);
    /**
     * Create Zustand middleware that publishes state changes as events
     */
    middleware: <T extends object>(stateCreator: StateCreator<T & EventableStore, [], [], T & EventableStore>) => StateCreator<T & EventableStore, [], [], T & EventableStore>;
    /**
     * Set up selective subscriptions using zustand's subscribeWithSelector
     */
    private setupSubscriptions;
    /**
     * Publish state change events for all changed paths
     */
    private publishStateChangeEvents;
    /**
     * Publish state change event for a specific path
     */
    private publishPathChangeEvent;
    /**
     * Publish the actual state change event
     */
    private publishStateEvent;
    /**
     * Publish event through global event bus
     */
    private publishEvent;
    /**
     * Get all paths that changed between two state objects
     */
    private getChangedPaths;
    /**
     * Get nested value from object using dot notation path
     */
    private getNestedValue;
    /**
     * Subscribe to state changes from the event bus
     */
    subscribeToStateEvents(storeName: string, handler: (event: StateChangeEvent) => void): string;
    /**
     * Trigger state updates from events
     */
    handleEventBasedStateUpdate(store: any, event: BaseEvent, updateFn: (currentState: any, event: BaseEvent) => any): void;
    /**
     * Clean up adapter resources
     */
    cleanup(): void;
    /**
     * Get adapter statistics
     */
    getStats(): {
        storeName: string;
        subscriptions: number;
        activeDebounces: number;
        config: ZustandEventConfig;
    };
}
/**
 * Utility functions for Zustand-Event integration
 */
export declare const ZustandEventUtils: {
    /**
     * Extract event adapter from a Zustand store
     */
    getEventAdapter: (store: any) => ZustandEventAdapter | null;
    /**
     * Check if a store has event integration
     */
    hasEventIntegration: (store: any) => boolean;
    /**
     * Create event-driven state updater
     */
    createEventUpdater: <T>(store: {
        getState: () => T;
        setState: (partial: Partial<T>) => void;
    }, eventTypes: string[]) => any;
};
//# sourceMappingURL=ZustandEventAdapter.d.ts.map