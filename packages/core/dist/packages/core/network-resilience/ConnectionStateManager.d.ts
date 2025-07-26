import { EventEmitter } from 'events';
export declare enum ConnectionState {
    CONNECTED = "connected",
    CONNECTING = "connecting",
    DISCONNECTED = "disconnected",
    RECONNECTING = "reconnecting",
    FAILED = "failed",
    OFFLINE = "offline"
}
export declare enum ConnectionQuality {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    UNKNOWN = "unknown"
}
export interface ConnectionMetrics {
    latency: number;
    packetLoss: number;
    bandwidth: number;
    jitter: number;
    lastMeasurement: number;
    measurementCount: number;
}
export interface NetworkInfo {
    type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
    downlink: number;
    rtt: number;
    saveData: boolean;
}
export interface ConnectionStateData {
    state: ConnectionState;
    quality: ConnectionQuality;
    isOnline: boolean;
    lastConnected: number | null;
    disconnectedAt: number | null;
    reconnectAttempts: number;
    totalDowntime: number;
    metrics: ConnectionMetrics;
    networkInfo: NetworkInfo | null;
    stateHistory: Array<{
        state: ConnectionState;
        timestamp: number;
        reason?: string;
    }>;
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
     * Get current connection state
     */
    getState(): ConnectionState;
    /**
     * Get current connection quality
     */
    getQuality(): ConnectionQuality;
    /**
     * Get complete state data
     */
    getStateData(): ConnectionStateData;
    /**
     * Check if currently online
     */
    isOnline(): boolean;
    /**
     * Check if connection is stable
     */
    isStable(): boolean;
    /**
     * Update connection state
     */
    setState(newState: ConnectionState, reason?: string): void;
    /**
     * Update connection quality based on metrics
     */
    updateQuality(metrics?: Partial<ConnectionMetrics>): void;
    /**
     * Update connection metrics
     */
    updateMetrics(metrics: Partial<ConnectionMetrics>): void;
    /**
     * Perform connection test
     */
    testConnection(): Promise<ConnectionMetrics>;
    /**
     * Get connection statistics
     */
    getStatistics(): {
        currentState: ConnectionState;
        currentQuality: ConnectionQuality;
        uptime: number;
        totalDowntime: number;
        reconnectAttempts: number;
        averageLatency: number;
        packetLossRate: number;
        measurementCount: number;
        stateFrequency: Record<ConnectionState, number>;
        reliability: number;
        lastMeasurement: number;
    };
    /**
     * Reset connection state and metrics
     */
    reset(): void;
    /**
     * Cleanup and stop monitoring
     */
    cleanup(): void;
    /**
     * Initialize network monitoring
     */
    private initializeNetworkMonitoring;
    /**
     * Initialize performance monitoring
     */
    private initializePerformanceMonitoring;
    /**
     * Start ping monitoring
     */
    private startPingMonitoring;
    /**
     * Stop ping monitoring
     */
    private stopPingMonitoring;
    /**
     * Start quality monitoring
     */
    private startQualityMonitoring;
    /**
     * Handle ping failure
     */
    private handlePingFailure;
    /**
     * Calculate connection quality based on metrics
     */
    private calculateQuality;
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