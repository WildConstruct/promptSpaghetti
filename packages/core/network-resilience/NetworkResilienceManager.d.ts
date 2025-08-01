import { EventEmitter } from 'events';
import { QueuedOperation, OfflineQueueConfig } from './OfflineOperationQueue';
import { ConnectionState, ConnectionQuality, ConnectionStateConfig } from './ConnectionStateManager';
import { ReconnectionState, ReconnectionConfig } from './ReconnectionHandler';
import { SyncDelta, RecoveryConfig } from './SynchronizationRecovery';

}
}
export interface NetworkResilienceConfig { enabled: boolean;
    offlineQueue: Partial<OfflineQueueConfig>;
    connectionState: Partial<ConnectionStateConfig>;
    reconnection: Partial<ReconnectionConfig>;
    recovery: Partial<RecoveryConfig>;
    notifications: {
        enabled: boolean;
        showOfflineIndicator: boolean;
        showConnectionQuality: boolean;
        notifyOnReconnect: boolean;
        notifyOnSyncComplete: boolean }
}
    };
    persistence: { enabled: boolean;
        storageKey: string;
        maxStorageSize: number };
    performance: { enableMetrics: boolean;
        metricsInterval: number;
        enableProfiling: boolean };

}
}
export interface ResilienceMetrics { uptime: number;
    totalDowntime: number;
    connectionAttempts: number;
    successfulReconnections: number;
    queuedOperations: number;
    syncedOperations: number;
    pendingOperations: number;
    averageReconnectTime: number;
    dataLoss: number;
    conflicts: number }
}
}
export interface NetworkStatus {
    isOnline: boolean;
    connectionState: ConnectionState;
    connectionQuality: ConnectionQuality;
    reconnectionState: ReconnectionState;
    queueSize: number;
    pendingSync: boolean;
    lastSync: number | null;
    metrics: ResilienceMetrics;

export declare class NetworkResilienceManager extends EventEmitter {
    private config;
    private offlineQueue;
    private connectionState;
    private reconnectionHandler;
    private syncRecovery;
    private isInitialized;
    private isEnabled;
    private documentId;
    private userId;
    private websocket;
    private metricsTimer;
    private persistenceTimer;
    private syncInProgress;
    private lastSyncTime;
    private metrics;
    constructor(config?: Partial<NetworkResilienceConfig>);
    /**
     * Initialize the network resilience system
     */
    initialize(documentId: string, userId: string): Promise<void>;
    /**
     * Connect to WebSocket server
     */
    connect(websocketUrl: string, authToken?: string): Promise<void>;
    /**
     * Disconnect from server
     */
    disconnect(reason?: string): void;
    /**
     * Queue operation for processing (offline or online)
     */
    queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): string;
    /**
     * Get current network status
     */
    getStatus(): NetworkStatus;
    /**
     * Force synchronization
     */
    forceSync(): Promise<SyncDelta | null>;
    /**
     * Get comprehensive metrics
     */
    getMetrics(): ResilienceMetrics;
    /**
     * Enable or disable network resilience
     */
    setEnabled(enabled: boolean): void;
    /**
     * Clear all queued operations
     */
    clearQueue(): void;
    /**
     * Export current state for debugging
     */
    exportState(): any;
    /**
     * Cleanup and shutdown
     */
    cleanup(): void;
    /**
     * Initialize sub-components
     */
    private initializeComponents;
    /**
     * Set up event handlers between components
     */
    private setupEventHandlers;
    /**
     * Establish WebSocket connection
     */
    private establishWebSocketConnection;
    /**
     * Handle incoming WebSocket messages
     */
    private handleWebSocketMessage;
    /**
     * Start reconnection process
     */
    private startReconnection;
    /**
     * Process queued operations
     */
    private processQueuedOperations;
    /**
     * Send operation to server
     */
    private sendOperationToServer;
    /**
     * Handle remote graph updates
     */
    private handleRemoteGraphUpdate;
    /**
     * Handle conflict detection
     */
    private handleConflictDetected;
    /**
     * Get current document state (stub)
     */
    private getCurrentDocumentState;
    /**
     * Get server document state (stub)
     */
    private getServerDocumentState;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Stop metrics collection
     */
    private stopMetricsCollection;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Start persistence
     */
    private startPersistence;
    /**
     * Stop persistence
     */
    private stopPersistence;
    /**
     * Save current state to storage
     */
    private saveState;
    /**
     * Load persisted state
     */
    private loadPersistedState;

//# sourceMappingURL=NetworkResilienceManager.d.ts.map
}
}