/**
 * State Synchronizer
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 *
 * Handles real-time state synchronization across clients
 */
import { EventEmitter } from 'events';
import { StateChange } from '../containers/BaseStateContainer';
export interface SyncMessage {
    id: string;
    type: SyncMessageType;
    domain: string;
    payload: any;
    timestamp: number;
    userId: string;
    sessionId: string;
    version: number;
    checksum?: string;
}
export type SyncMessageType = 'STATE_CHANGE' | 'BULK_CHANGE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE' | 'CONFLICT_RESOLUTION' | 'HEARTBEAT' | 'CLIENT_JOIN' | 'CLIENT_LEAVE' | 'FORCE_SYNC';
export interface SyncClient {
    id: string;
    userId: string;
    sessionId: string;
    domains: string;
    lastSeen: number;
    version: number;
    isActive: boolean;
    latency: number;
    metadata: {
        userAgent?: string;
        ip?: string;
        location?: string;
    };
}
export interface SyncState {
    version: number;
    clients: Map<string, SyncClient>;
    pendingChanges: Map<string, PendingChange>;
    conflictQueue: ConflictQueueItem;
    syncHistory: SyncHistoryEntry;
    lastFullSync: number;
}
export interface PendingChange {
    id: string;
    change: StateChange<any>;
    domain: string;
    clientId: string;
    timestamp: number;
    acknowledged: Set<string>;
    requiredAcks: number;
    timeout: number;
    retryCount: number;
}
export interface ConflictQueueItem {
    id: string;
    conflictId: string;
    localChange: StateChange<any>;
    remoteChange: StateChange<any>;
    domain: string;
    priority: number;
    timestamp: number;
}
export interface SyncHistoryEntry {
    timestamp: number;
    type: 'sync' | 'conflict' | 'error' | 'client_event';
    clientId?: string;
    domain?: string;
    message: string;
    metadata?: Record<string, any>;
}
export interface OptimisticUpdate {
    id: string;
    domain: string;
    change: StateChange<any>;
    rollbackFn: () => void;
    timestamp: number;
    confirmed: boolean;
    clientId: string;
}
export interface SyncConfiguration {
    batchInterval: number;
    maxBatchSize: number;
    conflictResolutionTimeout: number;
    heartbeatInterval: number;
    clientTimeout: number;
    maxRetries: number;
    enableOptimisticUpdates: boolean;
    enableConflictResolution: boolean;
    syncQuality: 'fast' | 'reliable' | 'eventual';
}
export declare class StateSynchronizer extends EventEmitter {
    private syncState;
    private domains;
    private optimisticUpdates;
    private batchQueue;
    private batchTimer?;
    private heartbeatTimer?;
    private cleanupTimer?;
    private config;
    private isServer;
    private clientId;
    constructor();
    config: Partial<SyncConfiguration>;
    isServer: boolean;
    clientId?: string;
    super(): any;
}
//# sourceMappingURL=StateSynchronizer.d.ts.map