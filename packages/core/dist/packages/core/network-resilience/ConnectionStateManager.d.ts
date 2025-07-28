import { EventEmitter } from 'events';
export declare enum ConnectionState {
    CONNECTED = "connected",
    CONNECTING = "connecting",
    DISCONNECTED = "disconnected",
    RECONNECTING = "reconnecting",
    FAILED = "failed",
    OFFLINE = "offline",
    export,
    enum,
    ConnectionQuality
}
export interface ConnectionStateConfig {
    pingInterval: number;
    qualityCheckInterval: number;
    latencyThreshold: {
        excellent: number;
        good: number;
        fair: number;
    };
    packetLossThreshold: {
        excellent: number;
        good: number;
        fair: number;
    };
    maxHistorySize: number;
    offlineDetectionTimeout: number;
    onlineCheckUrl: string;
    enableNetworkInfoAPI: boolean;
    enablePerformanceMonitoring: boolean;
}
export declare class ConnectionStateManager extends EventEmitter {
    private state;
    private quality;
    private config;
    private stateData;
    private pingTimer;
    private qualityTimer;
    private offlineTimer;
    private performanceObserver;
    private networkChangeHandler;
    constructor(config?: Partial<ConnectionStateConfig>);
    /**
     * Add state to history
     */
    private addToStateHistory;
    /**
    * Update total downtime
    */
    private updateDowntime;
    /**
    * Calculate state frequency
    */
    private calculateStateFrequency;
    /**
     * Calculate connection reliability
     */
    private calculateReliability;
    /**
     * Stop all timers
     */
    private stopAllTimers;
}
//# sourceMappingURL=ConnectionStateManager.d.ts.map