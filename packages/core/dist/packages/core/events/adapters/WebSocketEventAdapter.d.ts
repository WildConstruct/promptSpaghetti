import { EnhancedCollaborationService } from '../../collaboration/EnhancedCollaborationService';
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
}
//# sourceMappingURL=WebSocketEventAdapter.d.ts.map