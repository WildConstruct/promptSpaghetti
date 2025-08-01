/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import { EventEmitter } from 'events';
/**
 * WebSocket message types
 */
export declare enum WebSocketMessageType { ANALYTICS_UPDATE = "analytics_update",
    COST_ALERT = "cost_alert",
    BUDGET_ALERT = "budget_alert",
    PERFORMANCE_METRIC = "performance_metric",
    USER_ACTIVITY = "user_activity",
    SYSTEM_STATUS = "system_status",
    RECOMMENDATION = "recommendation",
    ERROR = "error",
    HEARTBEAT = "heartbeat",
    SUBSCRIPTION = "subscription" }
    UNSUBSCRIPTION = "unsubscription"

/**
 * WebSocket message structure
 */

}
}
export interface WebSocketMessage {
    type: WebSocketMessageType;
    data: any;
    timestamp: number;
    id?: string;


/**
 * Subscription configuration
 */

}
}
}
export interface SubscriptionConfig {
    topic: string;
    filters?: {
        userId?: number;
        organizationId?: number;
        eventTypes?: string[];
        minSeverity?: 'info' | 'warning' | 'critical'
}
}
  };
    throttle?: number;

/**
 * WebSocket client configuration
 */

}
}
export interface WebSocketClientConfig { url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
    subscriptionTimeout: number;
    enableLogging: boolean;
    apiKey?: string;
    userId?: number;
    organizationId?: number;


/**
 * WebSocket connection state
 */
export declare enum ConnectionState {
    DISCONNECTED = "disconnected";
    CONNECTING = "connecting";
    CONNECTED = "connected";
    RECONNECTING = "reconnecting" }
    FAILED = "failed"

/**
 * Real-time WebSocket client for analytics updates
 */
export declare class WebSocketClient extends EventEmitter {
    private config;
    private socket;
    private connectionState;
    private reconnectAttempts;
    private heartbeatTimer;
    private reconnectTimer;
    private subscriptions;
    private messageQueue;
    private lastMessageId;
    constructor(config?: Partial<WebSocketClientConfig>);
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void;
    /**
     * Subscribe to a topic
     */
    subscribe(topic: string, config?: Partial<SubscriptionConfig>): Promise<void>;
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic: string): void;
    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState;
    /**
     * Get active subscriptions
     */
    getSubscriptions(): string[];
    /**
     * Send a message to the server
     */
    private sendMessage;
    /**
     * Handle connection open
     */
    private handleConnectionOpen;
    /**
     * Handle connection close
     */
    private handleConnectionClose;
    /**
     * Handle connection error
     */
    private handleConnectionError;
    /**
     * Handle incoming message
     */
    private handleMessage;
    /**
     * Attempt to reconnect
     */
    private attemptReconnect;
    /**
     * Start heartbeat
     */
    private startHeartbeat;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Log message (if logging is enabled)
     */
    private log;

/**
 * Analytics WebSocket client with predefined subscriptions
 */
export declare class AnalyticsWebSocketClient extends WebSocketClient {
    constructor(config?: Partial<WebSocketClientConfig>);
    /**
     * Subscribe to analytics dashboard updates
     */
    subscribeToDashboard(): Promise<void>;
    /**
     * Subscribe to cost alerts
     */
    subscribeToCostAlerts(): Promise<void>;
    /**
     * Subscribe to recommendations
     */
    subscribeToRecommendations(): Promise<void>;
    /**
     * Subscribe to user activity
     */
    subscribeToUserActivity(): Promise<void>;
    /**
     * Setup analytics-specific event listeners
     */
    private setupAnalyticsListeners;

/**
 * Create analytics WebSocket client instance
 */
export declare //# sourceMappingURL=WebSocketClient.d.ts.map
}
}