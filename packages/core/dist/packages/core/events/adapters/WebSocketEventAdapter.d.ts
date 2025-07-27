/**
 * WebSocket Event Adapter
 *
 * Bridges the existing WebSocket collaboration system with the new centralized event bus.
 * Converts WebSocket messages to standard events and vice versa.
 */
import { WSMessageType } from '../../collaboration/types';
import { CollaborationEventType, EnhancedCollaborationService } from '../../collaboration/EnhancedCollaborationService';
/**
 * WebSocket Event Adapter Class
 */
export declare class WebSocketEventAdapter {
    private collaborationService?;
    private subscribedEventTypes;
    constructor(collaborationService?: EnhancedCollaborationService);
    /**
     * Set up bidirectional event bridging between WebSocket and Event Bus
     */
    private setupEventBridging;
    /**
     * Convert WebSocket messages to Event Bus events
     */
    private bridgeWebSocketToEventBus;
    /**
     * Convert Event Bus events to WebSocket messages
     */
    private bridgeEventBusToWebSocket;
    /**
     * Convert WebSocket message to Event Bus event
     */
    private convertWSMessageToEvent;
    /**
     * Convert Event Bus event to WebSocket message
     */
    private convertEventToWSMessage;
    /**
     * Publish collaboration event through both systems
     */
    publishCollaborationEvent(type: CollaborationEventType, data: any, userId?: string, sessionId?: string): void;
    /**
     * Get adapter statistics
     */
    getStats(): {
        subscribedEventTypes: number;
        hasCollaborationService: boolean;
        eventBusStats: any;
    };
    /**
     * Clean up adapter resources
     */
    cleanup(): void;
}
export declare const webSocketAdapter: WebSocketEventAdapter;
export declare const webSocketUtils: {
    /**
     * Get WebSocket message type for event type
     */
    getWebSocketType: (eventType: string) => WSMessageType | null;
    /**
     * Get event type for WebSocket message type
     */
    getEventType: (wsType: WSMessageType) => string;
};
//# sourceMappingURL=WebSocketEventAdapter.d.ts.map