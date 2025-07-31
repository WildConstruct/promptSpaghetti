/**
 * Circuit Breaker Service for External Service Resilience
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { CircuitBreakerError } from '../types/errors';

export enum CircuitState {
  CLOSED = 'closed',      // Normal operation
  OPEN = 'open',          // Failing, blocking requests
  HALF_OPEN = 'half-open' // Testing if service has recovered
}

}
}
export interface CircuitBreakerOptions {
  failureThreshold: number;        // Number of failures before opening circuit
  successThreshold: number;        // Number of successes to close from half-open
  timeout: number;                 // Timeout in ms before trying half-open
  resetTimeout: number;           // Time to wait before attempting recovery
  monitoringPeriod: number;       // Window for failure counting (ms)
  name: string;                   // Circuit breaker name for identification
}
}
}

}
}
export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  requests: number;
  failureRate: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  stateChangedTime: number;
  nextRetryTime?: number;
}
}
}

class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private requests: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private stateChangedTime: number = Date.now();
  private nextRetryTime?: number;
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    super();
    this.options = options;
  }

  private resetCounts(): void {
    this.failures = 0;
    this.successes = 0;
    this.requests = 0;
  }

  private shouldAttemptReset(): boolean {
    return (
      this.state === CircuitState.OPEN &&
      Date.now() - this.stateChangedTime >= this.options.resetTimeout
    );
  }

  private setState(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;
    this.stateChangedTime = Date.now();

    if (newState === CircuitState.OPEN) {
      this.nextRetryTime = Date.now() + this.options.resetTimeout;
    } else {
      this.nextRetryTime = undefined;
    }

    logger.info(`Circuit breaker '${this.options.name}' state changed`, {
      previousState,
      newState,
      failures: this.failures,
      successes: this.successes,
      timestamp: new Date().toISOString()
    });

    this.emit('stateChanged', {
      name: this.options.name,
      previousState,
      newState,
      timestamp: Date.now()
    });
  }

  private cleanOldMetrics(): void {
    const now = Date.now();
    const cutoff = now - this.options.monitoringPeriod;

    // In a production implementation, you'd maintain a time-windowed collection
    // For this implementation, we'll reset counts if they're too old
    if (this.lastFailureTime && this.lastFailureTime < cutoff) {
      this.resetCounts();
    }
  }

  public getMetrics(): CircuitBreakerMetrics {
    const totalRequests = this.requests || 1; // Avoid division by zero
    const failureRate = (this.failures / totalRequests) * 100;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      failureRate: Math.round(failureRate * 100) / 100, // Round to 2 decimal places
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedTime: this.stateChangedTime,
      nextRetryTime: this.nextRetryTime
    };
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {

    this.cleanOldMetrics();
    this.requests++;

    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.setState(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerError(this.options.name, 'open');
      }
    }

    try {
      // Execute the operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after ${this.options.timeout}ms`));
          }, this.options.timeout);
  }
      ]);

      // Success case
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.options.successThreshold) {
        this.setState(CircuitState.CLOSED);
        this.resetCounts();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN) {
      if (this.failures >= this.options.failureThreshold) {
        this.setState(CircuitState.OPEN);
      }
    }
  }

  public forceOpen(): void {
    this.setState(CircuitState.OPEN);
  }

  public forceClosed(): void {
    this.setState(CircuitState.CLOSED);
    this.resetCounts();
  }

  public forceHalfOpen(): void {
    this.setState(CircuitState.HALF_OPEN);
  }
}

export class CircuitBreakerService {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private static instance: CircuitBreakerService;

  static getInstance(): CircuitBreakerService {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  public createCircuitBreaker(options: CircuitBreakerOptions): CircuitBreaker {
    const circuitBreaker = new CircuitBreaker(options);
    this.circuitBreakers.set(options.name, circuitBreaker);

    // Log circuit breaker events
    circuitBreaker.on('stateChanged', (event) => {
      logger.warn('Circuit breaker state changed', event);
    });

    return circuitBreaker;
  }

  public getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  public getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    this.circuitBreakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });
    return metrics;
  }

  public async executeWithBreaker<T>(
    breakerName: string,
    operation: () => Promise<T>,
    options?: Partial<CircuitBreakerOptions>
  ): Promise<T> {

    let breaker = this.getCircuitBreaker(breakerName);

    if (!breaker) {
      // Create default circuit breaker if it doesn't exist
      const defaultOptions: CircuitBreakerOptions = {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 5000,
        resetTimeout: 30000,
        monitoringPeriod: 60000,
        name: breakerName,
        ...options
      };
      breaker = this.createCircuitBreaker(defaultOptions);
    }

    return breaker.execute(operation);
  }

  // Predefined circuit breakers for common services
  public getDatabaseCircuitBreaker(): CircuitBreaker {
    const name = 'database';
    let breaker = this.getCircuitBreaker(name);

    if (!breaker) {
      breaker = this.createCircuitBreaker({
        name,
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 10000, // 10s for database operations
        resetTimeout: 30000, // 30s before retry
        monitoringPeriod: 300000 // 5min window
      });
    }

    return breaker;
  }

  public getRedisCircuitBreaker(): CircuitBreaker {
    const name = 'redis';
    let breaker = this.getCircuitBreaker(name);

    if (!breaker) {
      breaker = this.createCircuitBreaker({
        name,
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 2000, // 2s for cache operations
        resetTimeout: 15000, // 15s before retry
        monitoringPeriod: 120000 // 2min window
      });
    }

    return breaker;
  }

  public getExternalAPICircuitBreaker(serviceName: string): CircuitBreaker {
    const name = `external-api-${serviceName}`;
    let breaker = this.getCircuitBreaker(name);

    if (!breaker) {
      breaker = this.createCircuitBreaker({
        name,
        failureThreshold: 4,
        successThreshold: 2,
        timeout: 5000, // 5s for external API calls
        resetTimeout: 60000, // 1min before retry
        monitoringPeriod: 600000 // 10min window
      });
    }

    return breaker;
  }

  public getFileSystemCircuitBreaker(): CircuitBreaker {
    const name = 'filesystem';
    let breaker = this.getCircuitBreaker(name);

    if (!breaker) {
      breaker = this.createCircuitBreaker({
        name,
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000, // 5s for file operations
        resetTimeout: 20000, // 20s before retry
        monitoringPeriod: 180000 // 3min window
      });
    }

    return breaker;
  }
}

// Export singleton instance
export const circuitBreakerService = CircuitBreakerService.getInstance();

// Helper function for database operations
export async function withDatabaseCircuitBreaker<T>(
  operation: () => Promise<T>
): Promise<T> {

  return circuitBreakerService.getDatabaseCircuitBreaker().execute(operation);
}

// Helper function for Redis operations
export async function withRedisCircuitBreaker<T>(
  operation: () => Promise<T>
): Promise<T> {

  return circuitBreakerService.getRedisCircuitBreaker().execute(operation);
}

// Helper function for external API calls
export async function withExternalAPICircuitBreaker<T>(
  serviceName: string,
  operation: () => Promise<T>
): Promise<T> {

  return circuitBreakerService.getExternalAPICircuitBreaker(serviceName).execute(operation);
}

// Helper function for file system operations
export async function withFileSystemCircuitBreaker<T>(
  operation: () => Promise<T>
): Promise<T> {

  return circuitBreakerService.getFileSystemCircuitBreaker().execute(operation);
}

export default CircuitBreakerService;