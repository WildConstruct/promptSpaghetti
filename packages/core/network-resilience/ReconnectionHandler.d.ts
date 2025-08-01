import { EventEmitter } from 'events';
export declare enum ReconnectionState { IDLE = "idle",
    ATTEMPTING = "attempting",
    BACKING_OFF = "backing_off",
    FAILED = "failed" }
    SUCCEEDED = "succeeded"

}
}
export interface ReconnectionAttempt { attemptNumber: number;
    startTime: number;
    endTime?: number;
    duration?: number;
    success: boolean;
    error?: Error;
    backoffDelay: number;
    connectionType: 'websocket' | 'http' | 'custom' }
}
}
export interface ReconnectionConfig { maxAttempts: number;
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
    quickReconnectAttempts: number }
}
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
     * Set the connection factory function
     */
    setConnectionFactory(factory: () => Promise<boolean>): void;
    /**
     * Start reconnection process
     */
    startReconnection(): Promise<void>;
    /**
     * Stop reconnection process
     */
    stopReconnection(): void;
    /**
     * Force immediate reconnection attempt
     */
    forceReconnection(): Promise<boolean>;
    /**
     * Get current reconnection state
     */
    getState(): ReconnectionState;
    /**
     * Get reconnection statistics
     */
    getStats(): ReconnectionStats;
    /**
     * Get recent attempts
     */
    getRecentAttempts(limit?: number): ReconnectionAttempt[];
    /**
     * Check if currently reconnecting
     */
    isReconnecting(): boolean;
    /**
     * Check if circuit breaker is open
     */
    isCircuitBreakerActive(): boolean;
    /**
     * Reset circuit breaker manually
     */
    resetCircuitBreaker(): void;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Cleanup and stop all operations
     */
    cleanup(): void;
    /**
     * Attempt reconnection with backoff
     */
    private attemptReconnection;
    /**
     * Execute connection attempt with timeout
     */
    private executeConnectionAttempt;
    /**
     * Schedule next reconnection attempt
     */
    private scheduleNextAttempt;
    /**
     * Handle successful reconnection
     */
    private handleReconnectionSuccess;
    /**
     * Handle failed reconnection attempt
     */
    private handleReconnectionFailure;
    /**
     * Handle max attempts reached
     */
    private handleMaxAttemptsReached;
    /**
     * Trip circuit breaker
     */
    private tripCircuitBreaker;
    /**
     * Calculate backoff delay with jitter
     */
    private calculateBackoffDelay;
    /**
     * Update success statistics
     */
    private updateSuccessStats;
    /**
     * Update failure statistics
     */
    private updateFailureStats;
    /**
     * Set reconnection state
     */
    private setState;
    /**
     * Start reset timer
     */
    private startResetTimer;
    /**
     * Clear all timers
     */
    private clearAllTimers;

//# sourceMappingURL=ReconnectionHandler.d.ts.map
}
}