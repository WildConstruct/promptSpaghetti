/**
 * WebSocket Streaming System - Story 1.5 Task 4
 *
 * Implements real-time WebSocket streaming for analytics dashboard
 * with secure event broadcasting and connection management.
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
import { UnifiedEventBus } from './UnifiedEventBus';
import { AnalyticsAuthorizationService } from './AnalyticsAuthorization';
export declare enum WSMessageType {
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe",
    EVENT = "event",
    HEARTBEAT = "heartbeat",
    ERROR = "error",
    AUTH = "auth",
    CONFIG = "config",
    METRICS = "metrics",
    export,
    const,
    WSMessageSchema,
    type,
    z,
    nativeEnum
}
export type WSMessage = z.infer<typeof WSMessageSchema>;
export declare const SubscriptionConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SubscriptionConfig = z.infer<typeof SubscriptionConfigSchema>;
interface WSServerConfig {
    port: number;
    heartbeatInterval: number;
    connectionTimeout: number;
    maxConnections: number;
    maxSubscriptionsPerClient: number;
    requireAuthentication: boolean;
    enableCompression: boolean;
    enableCors: boolean;
    corsOrigins: string;
}
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
    eventBus: UnifiedEventBus;
    authService: AnalyticsAuthorizationService;
    config: Partial<WSServerConfig>;
    super(): any;
}
export {};
//# sourceMappingURL=WebSocketStreaming.d.ts.map