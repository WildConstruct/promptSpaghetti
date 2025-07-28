/**
 * Domain Event Bus
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Event-driven communication system for cross-domain messaging
 */
type EventCallback = (...args: any) => void;
export declare class EventBus {
    private events;
    private maxListeners;
    /**
     * Subscribe to an event
     */
    subscribe(event: string, callback: EventCallback): () => void;
}
export {};
//# sourceMappingURL=EventBus.d.ts.map