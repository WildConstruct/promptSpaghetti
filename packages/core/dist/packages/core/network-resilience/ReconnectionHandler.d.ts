import { EventEmitter } from 'events';
export declare enum ReconnectionState {
    IDLE = "idle",
    ATTEMPTING = "attempting",
    BACKING_OFF = "backing_off",
    FAILED = "failed",
    SUCCEEDED = "succeeded",
    export,
    interface,
    ReconnectionAttempt
}
export interface ReconnectionConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
    jitterFactor: number;
    resetTimeoutMs: number;
    connectionTimeout: number;
    enableJitter: boolean;
    enableCircuitBreaker: boolean;
    circuitBreakerThreshold: number;
    circuitBreakerResetTime: number;
    quickReconnectWindow: number;
    quickReconnectAttempts: number;
}
export interface ReconnectionStats {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    averageReconnectTime: number;
    longestReconnectTime: number;
    shortestReconnectTime: number;
    currentStreak: number;
    maxStreak: number;
    lastSuccessTime: number | null;
    lastFailureTime: number | null;
    circuitBreakerTrips: number;
}
export declare class ReconnectionHandler extends EventEmitter {
    private state;
    private config;
    private currentAttempt;
    private attempts;
    private stats;
    private reconnectTimer;
    private resetTimer;
    private circuitBreakerTimer;
    private isCircuitBreakerOpen;
    private consecutiveFailures;
    private lastAttemptTime;
    private connectionFactory;
    constructor(config?: Partial<ReconnectionConfig>);
    /**
     * Handle failed reconnection attempt
     */
    private handleReconnectionFailure;
}
//# sourceMappingURL=ReconnectionHandler.d.ts.map