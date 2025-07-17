import { EventEmitter } from 'events';

export enum ReconnectionState {
  IDLE = 'idle',
  ATTEMPTING = 'attempting',
  BACKING_OFF = 'backing_off',
  FAILED = 'failed',
  SUCCEEDED = 'succeeded'
}

export interface ReconnectionAttempt {
  attemptNumber: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: Error;
  backoffDelay: number;
  connectionType: 'websocket' | 'http' | 'custom';
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

export class ReconnectionHandler extends EventEmitter {
  private state: ReconnectionState = ReconnectionState.IDLE;
  private config: ReconnectionConfig;
  private currentAttempt: number = 0;
  private attempts: ReconnectionAttempt[] = [];
  private stats: ReconnectionStats;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private resetTimer: NodeJS.Timeout | null = null;
  private circuitBreakerTimer: NodeJS.Timeout | null = null;
  private isCircuitBreakerOpen: boolean = false;
  private consecutiveFailures: number = 0;
  private lastAttemptTime: number = 0;
  private connectionFactory: (() => Promise<boolean>) | null = null;

  constructor(config: Partial<ReconnectionConfig> = {}) {
    super();
    
    this.config = {
      maxAttempts: 10,
      initialDelay: 1000,      // 1 second
      maxDelay: 30000,         // 30 seconds
      backoffFactor: 2.0,
      jitterFactor: 0.1,
      resetTimeoutMs: 300000,  // 5 minutes
      connectionTimeout: 10000, // 10 seconds
      enableJitter: true,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerResetTime: 60000, // 1 minute
      quickReconnectWindow: 5000,     // 5 seconds
      quickReconnectAttempts: 3,
      ...config
    };

    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      averageReconnectTime: 0,
      longestReconnectTime: 0,
      shortestReconnectTime: Infinity,
      currentStreak: 0,
      maxStreak: 0,
      lastSuccessTime: null,
      lastFailureTime: null,
      circuitBreakerTrips: 0
    };
  }

  /**
   * Set the connection factory function
   */
  setConnectionFactory(factory: () => Promise<boolean>): void {
    this.connectionFactory = factory;
  }

  /**
   * Start reconnection process
   */
  async startReconnection(): Promise<void> {
    if (this.state === ReconnectionState.ATTEMPTING || 
        this.state === ReconnectionState.BACKING_OFF) {
      console.log('Reconnection already in progress');
      return;
    }

    if (this.isCircuitBreakerOpen) {
      console.log('Circuit breaker is open, cannot start reconnection');
      this.emit('reconnection_blocked', { reason: 'circuit_breaker_open' });
      return;
    }

    console.log('Starting reconnection process');
    this.setState(ReconnectionState.ATTEMPTING);
    this.currentAttempt = 0;
    
    // Start reset timer
    this.startResetTimer();
    
    await this.attemptReconnection();
  }

  /**
   * Stop reconnection process
   */
  stopReconnection(): void {
    console.log('Stopping reconnection process');
    
    this.clearAllTimers();
    this.setState(ReconnectionState.IDLE);
    this.currentAttempt = 0;
    
    this.emit('reconnection_stopped');
  }

  /**
   * Force immediate reconnection attempt
   */
  async forceReconnection(): Promise<boolean> {
    console.log('Forcing immediate reconnection');
    
    this.stopReconnection();
    this.isCircuitBreakerOpen = false; // Bypass circuit breaker
    
    if (!this.connectionFactory) {
      throw new Error('No connection factory set');
    }

    const startTime = Date.now();
    
    try {
      const success = await this.executeConnectionAttempt();
      const duration = Date.now() - startTime;
      
      if (success) {
        this.handleReconnectionSuccess(duration);
        return true;
      } else {
        this.handleReconnectionFailure(new Error('Forced reconnection failed'), duration);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.handleReconnectionFailure(error as Error, duration);
      return false;
    }
  }

  /**
   * Get current reconnection state
   */
  getState(): ReconnectionState {
    return this.state;
  }

  /**
   * Get reconnection statistics
   */
  getStats(): ReconnectionStats {
    return { ...this.stats };
  }

  /**
   * Get recent attempts
   */
  getRecentAttempts(limit: number = 10): ReconnectionAttempt[] {
    return this.attempts.slice(-limit);
  }

  /**
   * Check if currently reconnecting
   */
  isReconnecting(): boolean {
    return this.state === ReconnectionState.ATTEMPTING || 
           this.state === ReconnectionState.BACKING_OFF;
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitBreakerActive(): boolean {
    return this.isCircuitBreakerOpen;
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker(): void {
    if (this.isCircuitBreakerOpen) {
      console.log('Manually resetting circuit breaker');
      this.isCircuitBreakerOpen = false;
      this.consecutiveFailures = 0;
      
      if (this.circuitBreakerTimer) {
        clearTimeout(this.circuitBreakerTimer);
        this.circuitBreakerTimer = null;
      }
      
      this.emit('circuit_breaker_reset', { manual: true });
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      averageReconnectTime: 0,
      longestReconnectTime: 0,
      shortestReconnectTime: Infinity,
      currentStreak: 0,
      maxStreak: 0,
      lastSuccessTime: null,
      lastFailureTime: null,
      circuitBreakerTrips: 0
    };
    
    this.attempts = [];
    this.emit('stats_reset');
  }

  /**
   * Cleanup and stop all operations
   */
  cleanup(): void {
    this.stopReconnection();
    this.removeAllListeners();
  }

  /**
   * Attempt reconnection with backoff
   */
  private async attemptReconnection(): Promise<void> {
    if (this.currentAttempt >= this.config.maxAttempts) {
      console.log(`Max reconnection attempts (${this.config.maxAttempts}) reached`);
      this.setState(ReconnectionState.FAILED);
      this.handleMaxAttemptsReached();
      return;
    }

    this.currentAttempt++;
    this.setState(ReconnectionState.ATTEMPTING);
    
    console.log(`Reconnection attempt ${this.currentAttempt}/${this.config.maxAttempts}`);
    
    const attempt: ReconnectionAttempt = {
      attemptNumber: this.currentAttempt,
      startTime: Date.now(),
      success: false,
      backoffDelay: this.calculateBackoffDelay(),
      connectionType: 'websocket' // Default, can be customized
    };

    try {
      if (!this.connectionFactory) {
        throw new Error('No connection factory set');
      }

      const success = await this.executeConnectionAttempt();
      const duration = Date.now() - attempt.startTime;
      
      attempt.endTime = Date.now();
      attempt.duration = duration;
      attempt.success = success;
      
      this.attempts.push(attempt);

      if (success) {
        this.handleReconnectionSuccess(duration);
      } else {
        this.handleReconnectionFailure(new Error('Connection attempt failed'), duration);
        await this.scheduleNextAttempt(attempt.backoffDelay);
      }

    } catch (error) {
      const duration = Date.now() - attempt.startTime;
      
      attempt.endTime = Date.now();
      attempt.duration = duration;
      attempt.error = error as Error;
      
      this.attempts.push(attempt);
      
      this.handleReconnectionFailure(error as Error, duration);
      await this.scheduleNextAttempt(attempt.backoffDelay);
    }
  }

  /**
   * Execute connection attempt with timeout
   */
  private async executeConnectionAttempt(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection attempt timed out'));
      }, this.config.connectionTimeout);

      this.connectionFactory!()
        .then((success) => {
          clearTimeout(timeout);
          resolve(success);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Schedule next reconnection attempt
   */
  private async scheduleNextAttempt(delay: number): Promise<void> {
    this.setState(ReconnectionState.BACKING_OFF);
    
    console.log(`Scheduling next attempt in ${delay}ms`);
    
    this.emit('reconnection_scheduled', {
      attemptNumber: this.currentAttempt + 1,
      delay,
      maxAttempts: this.config.maxAttempts
    });

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnection();
    }, delay);
  }

  /**
   * Handle successful reconnection
   */
  private handleReconnectionSuccess(duration: number): void {
    console.log(`Reconnection succeeded in ${duration}ms after ${this.currentAttempt} attempts`);
    
    this.setState(ReconnectionState.SUCCEEDED);
    this.updateSuccessStats(duration);
    this.consecutiveFailures = 0;
    this.currentAttempt = 0;
    
    // Close circuit breaker if it was open
    if (this.isCircuitBreakerOpen) {
      this.isCircuitBreakerOpen = false;
      this.emit('circuit_breaker_closed');
    }
    
    this.clearAllTimers();
    
    this.emit('reconnection_success', {
      attempts: this.currentAttempt,
      duration,
      stats: this.getStats()
    });
    
    this.setState(ReconnectionState.IDLE);
  }

  /**
   * Handle failed reconnection attempt
   */
  private handleReconnectionFailure(error: Error, duration: number): void {
    console.log(`Reconnection attempt ${this.currentAttempt} failed:`, error.message);
    
    this.updateFailureStats(duration);
    this.consecutiveFailures++;
    
    // Check circuit breaker
    if (this.config.enableCircuitBreaker && 
        this.consecutiveFailures >= this.config.circuitBreakerThreshold &&
        !this.isCircuitBreakerOpen) {
      this.tripCircuitBreaker();
    }
    
    this.emit('reconnection_attempt_failed', {
      attemptNumber: this.currentAttempt,
      error,
      duration,
      consecutiveFailures: this.consecutiveFailures
    });
  }

  /**
   * Handle max attempts reached
   */
  private handleMaxAttemptsReached(): void {
    this.updateFailureStats(0);
    
    if (this.config.enableCircuitBreaker) {
      this.tripCircuitBreaker();
    }
    
    this.emit('reconnection_failed', {
      totalAttempts: this.currentAttempt,
      stats: this.getStats(),
      lastError: this.attempts[this.attempts.length - 1]?.error
    });
    
    this.clearAllTimers();
  }

  /**
   * Trip circuit breaker
   */
  private tripCircuitBreaker(): void {
    console.log('Circuit breaker tripped due to consecutive failures');
    
    this.isCircuitBreakerOpen = true;
    this.stats.circuitBreakerTrips++;
    
    this.emit('circuit_breaker_tripped', {
      consecutiveFailures: this.consecutiveFailures,
      resetTime: this.config.circuitBreakerResetTime
    });
    
    // Schedule circuit breaker reset
    this.circuitBreakerTimer = setTimeout(() => {
      console.log('Circuit breaker automatically reset');
      this.isCircuitBreakerOpen = false;
      this.consecutiveFailures = 0;
      this.emit('circuit_breaker_reset', { manual: false });
    }, this.config.circuitBreakerResetTime);
  }

  /**
   * Calculate backoff delay with jitter
   */
  private calculateBackoffDelay(): number {
    const now = Date.now();
    
    // Quick reconnect for rapid failures
    if (this.currentAttempt <= this.config.quickReconnectAttempts &&
        (now - this.lastAttemptTime) < this.config.quickReconnectWindow) {
      return this.config.initialDelay;
    }
    
    let delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, this.currentAttempt - 1);
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.config.enableJitter) {
      const jitter = delay * this.config.jitterFactor * (Math.random() - 0.5);
      delay += jitter;
    }
    
    this.lastAttemptTime = now;
    return Math.max(delay, 0);
  }

  /**
   * Update success statistics
   */
  private updateSuccessStats(duration: number): void {
    this.stats.totalAttempts++;
    this.stats.successfulAttempts++;
    this.stats.currentStreak++;
    this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
    this.stats.lastSuccessTime = Date.now();
    
    // Update reconnect time stats
    if (this.stats.shortestReconnectTime === Infinity) {
      this.stats.shortestReconnectTime = duration;
    } else {
      this.stats.shortestReconnectTime = Math.min(this.stats.shortestReconnectTime, duration);
    }
    
    this.stats.longestReconnectTime = Math.max(this.stats.longestReconnectTime, duration);
    
    // Update average (exponential moving average)
    if (this.stats.averageReconnectTime === 0) {
      this.stats.averageReconnectTime = duration;
    } else {
      this.stats.averageReconnectTime = (this.stats.averageReconnectTime * 0.8) + (duration * 0.2);
    }
  }

  /**
   * Update failure statistics
   */
  private updateFailureStats(duration: number): void {
    this.stats.totalAttempts++;
    this.stats.failedAttempts++;
    this.stats.currentStreak = 0;
    this.stats.lastFailureTime = Date.now();
  }

  /**
   * Set reconnection state
   */
  private setState(newState: ReconnectionState): void {
    if (this.state === newState) return;
    
    const previousState = this.state;
    this.state = newState;
    
    this.emit('state_changed', {
      previousState,
      newState,
      timestamp: Date.now()
    });
  }

  /**
   * Start reset timer
   */
  private startResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    
    this.resetTimer = setTimeout(() => {
      console.log('Reconnection reset timeout reached');
      this.stopReconnection();
      this.emit('reconnection_timeout');
    }, this.config.resetTimeoutMs);
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}