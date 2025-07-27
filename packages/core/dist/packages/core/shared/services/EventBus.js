/**
 * Domain Event Bus
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Event-driven communication system for cross-domain messaging
 */
export class EventBus {
    events = {};
    maxListeners = 100;
    /**
     * Subscribe to an event
     */
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        if (this.events[event].length >= this.maxListeners) {
            console.warn(`EventBus: Maximum listeners (${this.maxListeners}) reached for event "${event}"`);
        }
        this.events[event].push(callback);
        // Return unsubscribe function
        return () => {
            this.unsubscribe(event, callback);
        };
    }
    /**
     * Unsubscribe from an event
     */
    unsubscribe(event, callback) {
        if (!this.events[event])
            return;
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
        // Clean up empty event arrays
        if (this.events[event].length === 0) {
            delete this.events[event];
        }
    }
    /**
     * Emit an event to all subscribers
     */
    emit(event, ...args) {
        if (!this.events[event])
            return;
        // Create a copy to avoid issues if callbacks modify the array
        const callbacks = [...this.events[event]];
        callbacks.forEach(callback => {
            try {
                callback(...args);
            }
            catch (error) {
                console.error(`EventBus: Error in event callback for "${event}":`, error);
            }
        });
    }
    /**
     * Subscribe to an event that will only fire once
     */
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.unsubscribe(event, onceCallback);
        };
        return this.subscribe(event, onceCallback);
    }
    /**
     * Get all active event names
     */
    getEvents() {
        return Object.keys(this.events);
    }
    /**
     * Get number of listeners for an event
     */
    getListenerCount(event) {
        return this.events[event]?.length ?? 0;
    }
    /**
     * Remove all listeners for a specific event
     */
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        }
        else {
            this.events = {};
        }
    }
    /**
     * Set maximum number of listeners per event
     */
    setMaxListeners(max) {
        this.maxListeners = max;
    }
}
// Global event bus instance
export const globalEventBus = new EventBus();
// Domain event constants
export const DOMAIN_EVENTS = {
    // Graph Editor Events
    GRAPH_MODIFIED: 'graph:modified',
    NODE_SELECTED: 'graph:node:selected',
    NODE_ADDED: 'graph:node:added',
    NODE_REMOVED: 'graph:node:removed',
    GRAPH_VALIDATED: 'graph:validated',
    EXECUTION_STARTED: 'graph:execution:started',
    EXECUTION_COMPLETED: 'graph:execution:completed',
    // Admin Dashboard Events
    DASHBOARD_LOADED: 'admin:dashboard:loaded',
    USER_UPDATED: 'admin:user:updated',
    SECURITY_ALERT: 'admin:security:alert',
    API_KEY_CREATED: 'admin:api:key:created',
    PERMISSION_CHANGED: 'admin:permission:changed',
    // Security Events
    ACCESS_GRANTED: 'security:access:granted',
    ACCESS_DENIED: 'security:access:denied',
    VIOLATION_DETECTED: 'security:violation:detected',
    AUDIT_LOG_CREATED: 'security:audit:created',
    // Runtime Events
    NODE_PROCESSED: 'runtime:node:processed',
    EXECUTION_ERROR: 'runtime:execution:error',
    VALIDATION_ERROR: 'runtime:validation:error',
    // System Events
    CONFIG_UPDATED: 'system:config:updated',
    ERROR_OCCURRED: 'system:error:occurred',
    PERFORMANCE_WARNING: 'system:performance:warning',
    // UI Events
    THEME_CHANGED: 'ui:theme:changed',
    LAYOUT_CHANGED: 'ui:layout:changed',
    MODAL_OPENED: 'ui:modal:opened',
    MODAL_CLOSED: 'ui:modal:closed'
};
// React hook for using the event bus
import { useEffect, useRef } from 'react';
export const useEventBus = () => {
    const eventBusRef = useRef(globalEventBus);
    const subscribe = (event, callback) => {
        return eventBusRef.current.subscribe(event, callback);
    };
    const emit = (event, ...args) => {
        eventBusRef.current.emit(event, ...args);
    };
    const once = (event, callback) => {
        return eventBusRef.current.once(event, callback);
    };
    return {
        subscribe,
        emit,
        once,
        eventBus: eventBusRef.current
    };
};
// React hook for subscribing to specific events
export const useEventSubscription = (event, callback, deps = []) => {
    const { subscribe } = useEventBus();
    useEffect(() => {
        const events = Array.isArray(event) ? event : [event];
        const unsubscribeFunctions = events.map(e => subscribe(e, callback));
        return () => {
            unsubscribeFunctions.forEach(unsub => unsub());
        };
    }, [event, callback, subscribe, ...deps]);
};
