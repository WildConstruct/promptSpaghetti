import { EventEmitter } from 'events';
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
    * Handle connection error
    */
    private handleConnectionError;
    /**
    * Schedule reconnection attempt
    */
    private scheduleReconnect;
}
//# sourceMappingURL=WebSocketClient.d.ts.map