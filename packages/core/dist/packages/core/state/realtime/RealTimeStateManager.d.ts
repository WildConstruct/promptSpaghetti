/**
 * Real-Time State Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 *
 * WebSocket-based real-time state management with optimistic updates
 */
import { EventEmitter } from 'events';
import { StateChange } from '../containers/BaseStateContainer';
import { DomainStateContainer } from '../orchestration/StateOrchestrator';
import { OptimisticUpdate } from '../orchestration/StateSynchronizer';
export interface WebSocketConnection {
    socket: WebSocket;
    id: string;
    userId: string;
    domains: string[];
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
    filters: SubscriptionFilter[];
    callback: StateChangeCallback;
    options: SubscriptionOptions;
}
export interface SubscriptionFilter {
    type: 'path' | 'user' | 'change_type' | 'custom';
    value: string | string[] | ((change: StateChange<any>) => boolean);
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
}
export declare class ConnectionError extends Error {
    code?: string;
    constructor(message: string, code?: string);
}
export declare class OptimisticUpdateError extends Error {
    updateId: string;
    constructor(message: string, updateId: string);
}
export declare class RealTimeStateManager extends EventEmitter {
    private connection?;
    private synchronizer;
    private subscriptions;
    private optimisticUpdates;
    private messageQueue;
    private connectionState;
    private config;
    private pingTimer?;
    private reconnectTimer?;
    private batchTimer?;
    private domains;
    constructor(config?: Partial<RealtimeConfig>);
    connect(userId: string, sessionId?: string): Promise<void>;
    disconnect(): Promise<void>;
    private waitForConnection;
    private setupSocketEventHandlers;
    private handleWebSocketMessage;
    private handleWebSocketClose;
    private handleWebSocketError;
    private handleHandshakeAck;
    private handleStateChangeMessage;
    private handleOptimisticConfirm;
    private handleOptimisticReject;
    private handleSyncRequest;
    private handlePing;
    private handlePong;
    subscribeToStateChanges(domain: string, callback: StateChangeCallback, filters?: SubscriptionFilter[], options?: SubscriptionOptions): () => void;
    private notifySubscribers;
    private matchesFilters;
    optimisticUpdate(domain: string, mutation: StateMutation): Promise<string>;
    syncWithServer(mutation: StateMutation): Promise<void>;
    registerDomain(domain: DomainStateContainer): void;
    unregisterDomain(domainName: string): void;
    private sendMessage;
    private sendHandshake;
    private sendPing;
    private sendPong;
    private processQueuedMessages;
    private startHeartbeat;
    private stopHeartbeat;
    private scheduleReconnect;
    private setupSynchronizerEvents;
    isConnected(): boolean;
    getConnectionState(): Readonly<ConnectionState>;
    getLatency(): number;
    getPendingOptimisticUpdates(): OptimisticUpdate[];
    private generateConnectionId;
    private generateSessionId;
    private generateSubscriptionId;
    private generateUpdateId;
    private generateChangeId;
    destroy(): void;
}
export declare function useRealTimeState(): any;
export declare function useOptimisticMutation(domain: string): any;
export declare function useStateSubscription(domain: string, filters?: SubscriptionFilter[], options?: SubscriptionOptions): any;
export declare const globalRealTimeManager: RealTimeStateManager;
//# sourceMappingURL=RealTimeStateManager.d.ts.map