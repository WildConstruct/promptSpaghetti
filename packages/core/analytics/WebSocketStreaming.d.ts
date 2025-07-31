/**
 * WebSocket Streaming System - Story 1.5 Task 4
 *
 * Implements real-time WebSocket streaming for analytics dashboard
 * with secure event broadcasting and connection management.
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
import { UnifiedEventBus, UnifiedAnalyticsEvent } from './UnifiedEventBus';
import { AnalyticsAuthorizationService, AuthContext } from './AnalyticsAuthorization';
export declare enum WSMessageType {
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe",
    EVENT = "event",
    HEARTBEAT = "heartbeat",
    ERROR = "error",
    AUTH = "auth",
    CONFIG = "config",
    METRICS = "metrics"

export declare const WSMessageSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof WSMessageType>;
    id: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodUnknown>;
    timestamp: z.ZodNumber;
    clientId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: WSMessageType;
    timestamp: number;
    id?: string | undefined;
    payload?: unknown;
    clientId?: string | undefined;
}, {
    type: WSMessageType;
    timestamp: number;
    id?: string | undefined;
    payload?: unknown;
    clientId?: string | undefined;
}>;
export type WSMessage = z.infer<typeof WSMessageSchema>;
export declare const SubscriptionConfigSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    filter: z.ZodOptional<z.ZodObject<{,
        types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        severities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        userId: z.ZodOptional<z.ZodString>;
        organizationId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string | undefined;
        categories?: string[] | undefined;
        organizationId?: string | undefined;
        types?: string[] | undefined;
        severities?: string[] | undefined;
        sources?: string[] | undefined;
    }, {
        userId?: string | undefined;
        categories?: string[] | undefined;
        organizationId?: string | undefined;
        types?: string[] | undefined;
        severities?: string[] | undefined;
        sources?: string[] | undefined;
    }>>;
    batchSize: z.ZodDefault<z.ZodNumber>;
    batchTimeoutMs: z.ZodDefault<z.ZodNumber>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    maxQueueSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    includeMetadata: boolean;
    batchSize: number;
    subscriptionId: string;
    batchTimeoutMs: number;
    maxQueueSize: number;
    filter?: {
        userId?: string | undefined;
        categories?: string[] | undefined;
        organizationId?: string | undefined;
        types?: string[] | undefined;
        severities?: string[] | undefined;
        sources?: string[] | undefined;
    } | undefined;
}, {
    subscriptionId: string;
    filter?: {
        userId?: string | undefined;
        categories?: string[] | undefined;
        organizationId?: string | undefined;
        types?: string[] | undefined;
        severities?: string[] | undefined;
        sources?: string[] | undefined;
    } | undefined;
    includeMetadata?: boolean | undefined;
    batchSize?: number | undefined;
    batchTimeoutMs?: number | undefined;
    maxQueueSize?: number | undefined;
}>;
export type SubscriptionConfig = z.infer<typeof SubscriptionConfigSchema>;
}
interface ClientConnection {
    id: string;
    ws: WebSocket | any;
    authContext?: AuthContext;
    subscriptions: Map<string, SubscriptionConfig>;
    isAuthenticated: boolean;
    lastHeartbeat: number;
    eventQueue: UnifiedAnalyticsEvent[];
    connected: boolean;
    ipAddress?: string;
    userAgent?: string;
}
interface ConnectionStats {
    totalConnections: number;
    activeConnections: number;
    authenticatedConnections: number;
    totalSubscriptions: number;
    messagesPerSecond: number;
    bytesPerSecond: number;
    errorRate: number;
}
interface WSServerConfig {
    port: number;
    heartbeatInterval: number;
    connectionTimeout: number;
    maxConnections: number;
    maxSubscriptionsPerClient: number;
    requireAuthentication: boolean;
    enableCompression: boolean;
    enableCors: boolean;
    corsOrigins: string[];
/**
 * WebSocket Streaming Server
 *
 * Manages real-time WebSocket connections for analytics dashboard streaming
 */
export declare class WebSocketStreamingServer extends EventEmitter {
    private eventBus;
    private authService;
    private server;
    private clients;
    private config;
    private stats;
    private heartbeatTimer;
    private metricsTimer;
    constructor();
      eventBus: UnifiedEventBus,
      authService: AnalyticsAuthorizationService,
      config?: Partial<WSServerConfig>
    );
    /**
     * Start WebSocket server
     */
    start(): Promise<void>;
    /**
     * Stop WebSocket server
     */
    stop(): Promise<void>;
    /**
     * Handle new client connection
     */
    handleConnection(ws: any, request: any): Promise<void>;
    /**
     * Handle client message
     */
    private handleMessage;
    /**
     * Handle client authentication
     */
    private handleAuthentication;
    /**
     * Handle subscription request
     */
    private handleSubscription;
    /**
     * Handle unsubscription request
     */
    private handleUnsubscription;
    /**
     * Handle heartbeat
     */
    private handleHeartbeat;
    /**
     * Handle configuration request
     */
    private handleConfigRequest;
    /**
     * Handle client disconnection
     */
    private handleDisconnection;
    /**
     * Handle client error
     */
    private handleError;
    /**
     * Setup event bus subscription for broadcasting
     */
    private setupEventBusSubscription;
    /**
     * Broadcast event to matching subscribers
     */
    private broadcastEvent;
    /**
     * Send event to specific client
     */
    private sendEventToClient;
    /**
     * Flush client event queue
     */
    private flushClientQueue;
    /**
     * Check if event matches subscription filter
     */
    private eventMatchesFilter;
    /**
     * Send heartbeats to all clients
     */
    private sendHeartbeats;
    /**
     * Update connection statistics
     */
    private updateMetrics;
    /**
     * Send message to client
     */
    private sendMessage;
    /**
     * Send error message to client
     */
    private sendError;
    /**
     * Disconnect client
     */
    private disconnectClient;
    /**
     * Generate unique client ID
     */
    private generateClientId;
    /**
     * Public API Methods
     */
    /**
     * Get connection statistics
     */
    getStats(): ConnectionStats;
    /**
     * Get connected clients
     */
    getClients(): Array<{
        id: string;
        isAuthenticated: boolean;
        subscriptions: number;
        lastHeartbeat: number;
        ipAddress?: string;
}
    }>;
    /**
     * Broadcast custom message to all clients
     */
    broadcastMessage(message: WSMessage, filter?: (client: ClientConnection) => boolean): Promise<void>;
    /**
     * Get client by ID
     */
    getClient(clientId: string): ClientConnection | null;
    /**
     * Force disconnect client
     */
    forceDisconnect(clientId: string, reason?: string): Promise<boolean>;
/**
 * WebSocket Client for testing and integration
 */
export declare class WebSocketAnalyticsClient extends EventEmitter {
    private ws;
    private url;
    private authToken?;
    private subscriptions;
    private reconnectInterval;
    private heartbeatTimer;
    private connected;
    constructor(url: string, authToken?: string);
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from server
     */
    disconnect(): void;
    /**
     * Authenticate with server
     */
    authenticate(token: string): void;
    /**
     * Subscribe to events
     */
    subscribe(config: SubscriptionConfig): void;
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Send message to server
     */
    private send;
    /**
     * Handle incoming message
     */
    private handleMessage;
    /**
     * Start heartbeat
     */
    private startHeartbeat;
    /**
     * Stop heartbeat
     */
    private stopHeartbeat;
    /**
     * Get connection status
     */
    isConnected(): boolean;

export default WebSocketStreamingServer;
//# sourceMappingURL=WebSocketStreaming.d.ts.map