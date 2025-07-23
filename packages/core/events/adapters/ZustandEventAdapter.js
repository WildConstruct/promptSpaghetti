/**
 * Zustand Event Adapter
 *
 * Bridges Zustand state management with the centralized event bus.
 * Converts state changes to events and allows event-driven state updates.
 */
import { globalEventBus, EventCategory, EventPriority } from '../EventSystem';
/**
 * Zustand Event Adapter Class
 */
export class ZustandEventAdapter {
    config;
    subscriptions = new Set();
    debounceTimers = new Map();
    constructor(config) {
        this.config = {
            debounceMs: 100,
            priority: EventPriority.MEDIUM,
            category: EventCategory.UI,
            ...config
        };
    }
    /**
     * Create Zustand middleware that publishes state changes as events
     */
    middleware = (stateCreator) => {
        return (set, get, api) => {
            const store = stateCreator((partial, replace) => {
                // Capture previous state
                const previousState = get();
                // Apply state change
                set(partial, replace);
                // Get new state
                const currentState = get();
                // Publish state change events
                this.publishStateChangeEvents(previousState, currentState);
            }, get, api);
            // Attach adapter to store for external access
            store._eventAdapter = this;
            // Set up subscriptions for specific paths
            this.setupSubscriptions(api);
            // Publish store initialization event
            this.publishEvent({
                type: 'store_initialized',
                timestamp: new Date(),
                id: crypto.randomUUID(),
                source: 'zustand-adapter',
                metadata: {
                    storeName: this.config.storeName,
                    path: '',
                    previousValue: null,
                    currentValue: get(),
                    category: this.config.category,
                    priority: this.config.priority
                }
            });
            return store;
        };
    };
    /**
     * Set up selective subscriptions using zustand's subscribeWithSelector
     */
    setupSubscriptions(api) {
        if (!this.config.enabledPaths) {
            return; // Use default state change detection
        }
        // Subscribe to specific paths
        this.config.enabledPaths.forEach(path => {
            const unsubscribe = api.subscribe((state) => this.getNestedValue(state, path), (currentValue, previousValue) => {
                this.publishPathChangeEvent(path, previousValue, currentValue);
            });
            this.subscriptions.add(unsubscribe);
        });
    }
    /**
     * Publish state change events for all changed paths
     */
    publishStateChangeEvents(previousState, currentState) {
        const changedPaths = this.getChangedPaths(previousState, currentState);
        changedPaths.forEach(path => {
            // Skip if path is ignored
            if (this.config.ignoredPaths?.includes(path)) {
                return;
            }
            // Skip if only specific paths are enabled and this isn't one
            if (this.config.enabledPaths && !this.config.enabledPaths.includes(path)) {
                return;
            }
            const previousValue = this.getNestedValue(previousState, path);
            const currentValue = this.getNestedValue(currentState, path);
            this.publishPathChangeEvent(path, previousValue, currentValue);
        });
    }
    /**
     * Publish state change event for a specific path
     */
    publishPathChangeEvent(path, previousValue, currentValue) {
        const eventId = `${this.config.storeName}-${path}`;
        // Debounce rapid changes if configured
        if (this.config.debounceMs && this.config.debounceMs > 0) {
            const existingTimer = this.debounceTimers.get(eventId);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            const timer = setTimeout(() => {
                this.publishStateEvent(path, previousValue, currentValue);
                this.debounceTimers.delete(eventId);
            }, this.config.debounceMs);
            this.debounceTimers.set(eventId, timer);
        }
        else {
            this.publishStateEvent(path, previousValue, currentValue);
        }
    }
    /**
     * Publish the actual state change event
     */
    publishStateEvent(path, previousValue, currentValue) {
        const event = {
            type: 'state_changed',
            timestamp: new Date(),
            id: crypto.randomUUID(),
            source: 'zustand-adapter',
            metadata: {
                storeName: this.config.storeName,
                path,
                previousValue,
                currentValue,
                category: this.config.category,
                priority: this.config.priority
            }
        };
        this.publishEvent(event);
    }
    /**
     * Publish event through global event bus
     */
    publishEvent(event) {
        globalEventBus.publish(event).catch(error => {
            console.error(`Failed to publish Zustand event for store ${this.config.storeName}:`, error);
        });
    }
    /**
     * Get all paths that changed between two state objects
     */
    getChangedPaths(previous, current, basePath = '') {
        const changes = [];
        // Handle primitive values
        if (previous !== current) {
            if (typeof previous !== 'object' || typeof current !== 'object') {
                changes.push(basePath || 'root');
                return changes;
            }
        }
        // Handle objects/arrays
        const allKeys = new Set([
            ...Object.keys(previous || {}),
            ...Object.keys(current || {})
        ]);
        for (const key of allKeys) {
            const currentPath = basePath ? `${basePath}.${key}` : key;
            const prevValue = previous?.[key];
            const currValue = current?.[key];
            if (prevValue !== currValue) {
                if (typeof prevValue === 'object' && typeof currValue === 'object') {
                    // Recursive check for nested objects
                    changes.push(...this.getChangedPaths(prevValue, currValue, currentPath));
                }
                else {
                    changes.push(currentPath);
                }
            }
        }
        return changes;
    }
    /**
     * Get nested value from object using dot notation path
     */
    getNestedValue(obj, path) {
        if (!path)
            return obj;
        return path.split('.').reduce((current, key) => {
            return current?.[key];
        }, obj);
    }
    /**
     * Subscribe to state changes from the event bus
     */
    subscribeToStateEvents(storeName, handler) {
        return globalEventBus.subscribe({
            types: ['state_changed'],
            sources: ['zustand-adapter']
        }, (event) => {
            const stateEvent = event;
            if (stateEvent.metadata.storeName === storeName) {
                handler(stateEvent);
            }
        }, { priority: EventPriority.HIGH });
    }
    /**
     * Trigger state updates from events
     */
    handleEventBasedStateUpdate(store, event, updateFn) {
        if (typeof store.setState === 'function') {
            const currentState = store.getState();
            const updates = updateFn(currentState, event);
            if (updates) {
                store.setState(updates);
            }
        }
    }
    /**
     * Clean up adapter resources
     */
    cleanup() {
        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        // Unsubscribe from all subscriptions
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions.clear();
    }
    /**
     * Get adapter statistics
     */
    getStats() {
        return {
            storeName: this.config.storeName,
            subscriptions: this.subscriptions.size,
            activeDebounces: this.debounceTimers.size,
            config: this.config
        };
    }
}
return adapter.middleware;
;
return adapter.middleware(stateCreator);
;
/**
 * Utility functions for Zustand-Event integration
 */
export const ZustandEventUtils = {
    /**
     * Extract event adapter from a Zustand store
     */
    getEventAdapter: (store) => {
        const state = store.getState();
        return state._eventAdapter || null;
    },
    /**
     * Check if a store has event integration
     */
    hasEventIntegration: (store) => {
        return !!ZustandEventUtils.getEventAdapter(store);
    },
    /**
     * Create event-driven state updater
     */
    createEventUpdater: (store, eventTypes) => {
        return globalEventBus.subscribe({ types: eventTypes }, (event) => {
            // Custom logic to update state based on event
            const currentState = store.getState();
            // Example: Update last event info
            if ('lastEvent' in currentState) {
                store.setState({
                    lastEvent: {
                        type: event.type,
                        timestamp: event.timestamp,
                        source: event.source
                    }
                });
            }
        }, { priority: EventPriority.HIGH });
    }
};
;
