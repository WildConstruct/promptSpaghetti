import { StateChange } from '../containers/BaseStateContainer';
export interface WebSocketConnection {
    socket: WebSocket;
    id: string;
    userId: string;
    domains: string;
    isReady: boolean;
    lastPing: number;
    latency: number;
    reconnectAttempts: number;
    metadata: ConnectionMetadata;
}
export interface ConnectionMetadata {
    userAgent: string;
    ip?: string;
    location?: string;
    sessionId: string;
    connectTime: number;
}
export interface StateSubscription {
    id: string;
    domain: string;
    filters: SubscriptionFilter;
    callback: StateChangeCallback;
    options: SubscriptionOptions;
}
export interface SubscriptionFilter {
    type: 'path' | 'user' | 'change_type' | 'custom';
    value: string | string | ((change: StateChange<any>) => boolean);
    operator?: 'equals' | 'contains' | 'matches' | 'in';
}
export interface SubscriptionOptions {
    includeOptimistic?: boolean;
    batchUpdates?: boolean;
    throttleMs?: number;
    priority?: 'low' | 'normal' | 'high';
}
export type StateChangeCallback = (change: StateChange<any>, metadata: ChangeMetadata) => void;
export interface ChangeMetadata {
    source: 'local' | 'remote' | 'server';
    optimistic: boolean;
    clientId: string;
    latency?: number;
    timestamp: number;
}
export interface StateMutation {
    domain: string;
    operation: MutationOperation;
    path?: string;
    value?: any;
    metadata?: Record<string, any>;
}
export type MutationOperation = 'create' | 'update' | 'delete' | 'replace' | 'merge';
export interface RealtimeConfig {
    wsUrl: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    pingInterval: number;
    pongTimeout: number;
    batchInterval: number;
    maxBatchSize: number;
    enableOptimistic: boolean;
    enableCompression: boolean;
    enableHeartbeat: boolean;
    debugMode: boolean;
}
export interface ConnectionState {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
    error?: Error;
    lastConnected?: number;
    reconnectAttempts: number;
    latency: number;
    messagesSent: number;
    messagesReceived: number;
    bytesTransferred: number;
}
export declare class StateConflictError extends Error {
    cause?: Error;
    constructor(message: string, cause?: Error);
    private stopHeartbeat;
    private scheduleReconnect;
    private setupSynchronizerEvents;
}
//# sourceMappingURL=RealTimeStateManager.d.ts.map