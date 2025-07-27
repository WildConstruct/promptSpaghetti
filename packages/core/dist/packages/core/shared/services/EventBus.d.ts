/**
 * Domain Event Bus
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Event-driven communication system for cross-domain messaging
 */
type EventCallback = (...args: any[]) => void;
export declare class EventBus {
    private events;
    private maxListeners;
    /**
     * Subscribe to an event
     */
    subscribe(event: string, callback: EventCallback): () => void;
    /**
     * Unsubscribe from an event
     */
    unsubscribe(event: string, callback: EventCallback): void;
    /**
     * Emit an event to all subscribers
     */
    emit(event: string, ...args: any[]): void;
    /**
     * Subscribe to an event that will only fire once
     */
    once(event: string, callback: EventCallback): () => void;
    /**
     * Get all active event names
     */
    getEvents(): string[];
    /**
     * Get number of listeners for an event
     */
    getListenerCount(event: string): number;
    /**
     * Remove all listeners for a specific event
     */
    removeAllListeners(event?: string): void;
    /**
     * Set maximum number of listeners per event
     */
    setMaxListeners(max: number): void;
}
export declare const globalEventBus: EventBus;
export declare const DOMAIN_EVENTS: {
    readonly GRAPH_MODIFIED: "graph:modified";
    readonly NODE_SELECTED: "graph:node:selected";
    readonly NODE_ADDED: "graph:node:added";
    readonly NODE_REMOVED: "graph:node:removed";
    readonly GRAPH_VALIDATED: "graph:validated";
    readonly EXECUTION_STARTED: "graph:execution:started";
    readonly EXECUTION_COMPLETED: "graph:execution:completed";
    readonly DASHBOARD_LOADED: "admin:dashboard:loaded";
    readonly USER_UPDATED: "admin:user:updated";
    readonly SECURITY_ALERT: "admin:security:alert";
    readonly API_KEY_CREATED: "admin:api:key:created";
    readonly PERMISSION_CHANGED: "admin:permission:changed";
    readonly ACCESS_GRANTED: "security:access:granted";
    readonly ACCESS_DENIED: "security:access:denied";
    readonly VIOLATION_DETECTED: "security:violation:detected";
    readonly AUDIT_LOG_CREATED: "security:audit:created";
    readonly NODE_PROCESSED: "runtime:node:processed";
    readonly EXECUTION_ERROR: "runtime:execution:error";
    readonly VALIDATION_ERROR: "runtime:validation:error";
    readonly CONFIG_UPDATED: "system:config:updated";
    readonly ERROR_OCCURRED: "system:error:occurred";
    readonly PERFORMANCE_WARNING: "system:performance:warning";
    readonly THEME_CHANGED: "ui:theme:changed";
    readonly LAYOUT_CHANGED: "ui:layout:changed";
    readonly MODAL_OPENED: "ui:modal:opened";
    readonly MODAL_CLOSED: "ui:modal:closed";
};
export type DomainEventType = typeof DOMAIN_EVENTS[keyof typeof DOMAIN_EVENTS];
export declare const useEventBus: () => {
    subscribe: (event: string, callback: EventCallback) => () => void;
    emit: (event: string, ...args: any[]) => void;
    once: (event: string, callback: EventCallback) => () => void;
    eventBus: EventBus;
};
export declare const useEventSubscription: (event: string | string[], callback: EventCallback, deps?: any[]) => void;
export {};
//# sourceMappingURL=EventBus.d.ts.map