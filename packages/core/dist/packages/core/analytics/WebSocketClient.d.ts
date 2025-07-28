/**
 * WebSocket message types
 */
export declare enum WebSocketMessageType {
    ANALYTICS_UPDATE = "analytics_update",
    COST_ALERT = "cost_alert",
    BUDGET_ALERT = "budget_alert",
    PERFORMANCE_METRIC = "performance_metric",
    USER_ACTIVITY = "user_activity",
    SYSTEM_STATUS = "system_status",
    RECOMMENDATION = "recommendation",
    ERROR = "error",
    HEARTBEAT = "heartbeat",
    SUBSCRIPTION = "subscription",
    UNSUBSCRIPTION = "unsubscription"
    /**
    * WebSocket message structure
    */
    ,
    /**
    * WebSocket message structure
    */
    export,
    interface,
    WebSocketMessage
}
export interface SubscriptionConfig {
    topic: string;
    filters?: {
        userId?: number;
        organizationId?: number;
        eventTypes?: string;
        minSeverity?: 'info' | 'warning' | 'critical';
    };
    throttle?: number;
}
export interface WebSocketClientConfig {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
    subscriptionTimeout: number;
    enableLogging: boolean;
    apiKey?: string;
    userId?: number;
    organizationId?: number;
}
export declare enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    FAILED = "failed"
    /**
     * Real-time WebSocket client for analytics updates
     */
    ,
    /**
     * Real-time WebSocket client for analytics updates
     */
    export,
    class,
    WebSocketClient,
    extends,
    EventEmitter
}
//# sourceMappingURL=WebSocketClient.d.ts.map