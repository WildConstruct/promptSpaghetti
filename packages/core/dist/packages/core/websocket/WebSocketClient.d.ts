import { EventEmitter } from 'events';
import { GraphUpdatePayload, PresenceUpdatePayload } from '../../../server/src/websocket/types';
export interface WebSocketClientConfig {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
    connectionTimeout: number;
    enableOfflineQueue: boolean;
    authToken?: string;
}
export interface ConnectionState {
    status: 'disconnected' | 'connecting' | 'connected' | 'authenticating' | 'authenticated' | 'error';
    lastConnected?: number;
    reconnectAttempts: number;
    error?: string;
}
export declare class WebSocketClient extends EventEmitter {
    private ws;
    private config;
    private state;
    private messageQueue;
    private heartbeatInterval;
    private reconnectTimeout;
    private connectionTimeout;
    private documentId;
    private userId;
    constructor(config: WebSocketClientConfig);
    /**
     * Connect to WebSocket server
     */
    connect(documentId: string, userId?: string): Promise<void>;
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void;
    /**
     * Send graph update
     */
    sendGraphUpdate(update: GraphUpdatePayload): boolean;
    /**
     * Send presence update
     */
    sendPresenceUpdate(presence: PresenceUpdatePayload): boolean;
    /**
     * Send cursor position update
     */
    sendCursorUpdate(x: number, y: number, nodeId?: string, viewportBounds?: any): boolean;
    /**
     * Send selection update
     */
    sendSelectionUpdate(nodeIds: string[], edgeIds?: string[], selectionBox?: any): boolean;
    /**
     * Send activity update
     */
    sendActivityUpdate(currentTool?: string, isTyping?: boolean, focusedNodeId?: string): boolean;
    /**
     * Request presence data
     */
    requestPresenceData(): boolean;
    /**
     * Send authentication request
     */
    sendAuthRequest(token: string): boolean;
    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState;
    /**
     * Check if connected and authenticated
     */
    isConnected(): boolean;
    /**
     * Check if currently connecting
     */
    isConnecting(): boolean;
    /**
     * Get queued messages count
     */
    getQueuedMessagesCount(): number;
    /**
     * Clear message queue
     */
    clearMessageQueue(): void;
    /**
     * Establish WebSocket connection
     */
    private establishConnection;
    /**
     * Handle incoming message
     */
    private handleMessage;
    /**
     * Handle connection confirmation message
     */
    private handleConnectMessage;
    /**
     * Handle authentication response
     */
    private handleAuthResponse;
    /**
     * Handle disconnection
     */
    private handleDisconnection;
    /**
     * Handle connection error
     */
    private handleConnectionError;
    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect;
    /**
     * Send message to server
     */
    private sendMessage;
    /**
     * Process queued messages
     */
    private processMessageQueue;
    /**
     * Start heartbeat ping
     */
    private startHeartbeat;
    /**
     * Clear all timeouts and intervals
     */
    private clearTimeouts;
}
//# sourceMappingURL=WebSocketClient.d.ts.map