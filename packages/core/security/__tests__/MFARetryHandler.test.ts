/**
 * Test Suite for MFA Retry Handler
 * 
 * Tests comprehensive retry and timeout handling for MFA operations
 * including exponential backoff, circuit breaker patterns, and metrics.
 */
import {
  MFARetryHandler,
  MFAOperation,
  RetryStrategy,
  FailureType,
  CircuitBreakerStateEnum
} from '../services/MFARetryHandler';
describe('MFARetryHandler', () => {
  let retryHandler: MFARetryHandler;
  beforeEach(() => {
  jest.useFakeTimers();
  retryHandler = new MFARetryHandler({)
  enableMetrics: true,
  enableLogging: true,
});
  });
  afterEach(() => {
    jest.useRealTimers();
    retryHandler.removeAllListeners();
  });
  describe('Basic Operation Execution', () => {
    test('should execute successful operation without retries', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const result = await retryHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation,
        { userId: 'test-user' }
      );
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toHaveLength(1);
      expect(result.attempts[0].success).toBe(true);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
    test('should handle operation failure with retries', async () => {
      const mockOperation = jest;
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const resultPromise = retryHandler.executeWithRetry(;);
        MFAOperation.SMS_SEND,
        mockOperation,
        { userId: 'test-user' }
      );
      // Use runAllTimersAsync to handle nested async timers properly
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toHaveLength(3);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
    test('should fail after max retry attempts', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Network error'));
      const resultPromise = retryHandler.executeWithRetry(;);
        MFAOperation.EMAIL_SEND,
        mockOperation,
        { userId: 'test-user' }
      );
      // Use runAllTimersAsync to handle retry delays
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.attempts).toHaveLength(3); // Default max attempts
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });
  describe('Retry Strategies', () => {
  test('should use exponential backoff strategy', async () => {
  const customHandler = new MFARetryHandler({)
  operationConfigs: {
  [MFAOperation.TOTP_VERIFICATION]: {
  maxAttempts: 3,
  strategy: RetryStrategy.EXPONENTIAL,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterMs: 0,
  timeoutMs: 10000,
  retryableErrors: [FailureType.NETWORK_ERROR],
} as any
      });
      const mockOperation = jest;
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const resultPromise = customHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation
      );
      // Use runAllTimersAsync to handle all nested timers properly
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(true);
      expect(result.attempts).toHaveLength(3);
      // Verify exponential backoff delays
      expect(result.attempts[1].delayMs).toBe(100);
      expect(result.attempts[2].delayMs).toBe(200);
      customHandler.removeAllListeners();
    });
    test('should use linear backoff strategy', async () => {
  const customHandler = new MFARetryHandler({)
  operationConfigs: {
  [MFAOperation.SMS_SEND]: {
  maxAttempts: 3,
  strategy: RetryStrategy.LINEAR,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterMs: 0,
  timeoutMs: 10000,
  retryableErrors: [FailureType.NETWORK_ERROR],
} as any
      });
      const mockOperation = jest;
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const resultPromise = customHandler.executeWithRetry(;);
        MFAOperation.SMS_SEND,
        mockOperation
      );
      // Use runAllTimersAsync to handle all nested timers properly
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(true);
      expect(result.attempts).toHaveLength(3);
      // Verify linear backoff delays
      expect(result.attempts[1].delayMs).toBe(100);
      expect(result.attempts[2].delayMs).toBe(200);
      customHandler.removeAllListeners();
    });
  });
  describe('Error Classification', () => {
    test('should not retry non-retryable errors', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Invalid code'));
      const result = await retryHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation,
        { userId: 'test-user' }
      );
      expect(result.success).toBe(false);
      expect(result.attempts).toHaveLength(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
    test('should retry retryable errors', async () => {
      const mockOperation = jest;
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const resultPromise = retryHandler.executeWithRetry(;);
        MFAOperation.SMS_SEND,
        mockOperation,
        { userId: 'test-user' }
      );
      // Use runAllTimersAsync to handle nested async timers properly
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(true);
      expect(result.attempts).toHaveLength(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });
  describe('Circuit Breaker', () => {
  test('should open circuit breaker after failure threshold', async () => {
  const customHandler = new MFARetryHandler({)
  circuitBreaker: {
  failureThreshold: 2,
  resetTimeoutMs: 60000,
  monitoringWindowMs: 300000,
  halfOpenMaxAttempts: 1,
});
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Service unavailable'));
      // First operation - should fail and increment failure count
      const firstResult = customHandler.executeWithRetry(MFAOperation.EMAIL_SEND, mockOperation);
      await jest.runAllTimersAsync();
      await firstResult;
      // Second operation - should fail and open circuit breaker
      const secondResult = customHandler.executeWithRetry(MFAOperation.EMAIL_SEND, mockOperation);
      await jest.runAllTimersAsync();
      await secondResult;
      // Third operation - should be blocked by circuit breaker
      const thirdResult = customHandler.executeWithRetry(MFAOperation.EMAIL_SEND, mockOperation);
      await jest.runAllTimersAsync();
      const result = await thirdResult;
      expect(result.circuitBreakerTriggered).toBe(true);
      expect(result.success).toBe(false);
      customHandler.removeAllListeners();
    });
    test('should allow operation when circuit breaker can attempt', () => {
      expect(retryHandler.canAttemptOperation(MFAOperation.TOTP_VERIFICATION)).toBe(true);
    });
    test('should reset circuit breaker manually', () => {
      // This test verifies the reset functionality exists
      retryHandler.resetCircuitBreaker(MFAOperation.TOTP_VERIFICATION);
      expect(retryHandler.canAttemptOperation(MFAOperation.TOTP_VERIFICATION)).toBe(true);
    });
  });
  describe('Timeout Handling', () => {
  test('should timeout long-running operations', async () => {
  const customHandler = new MFARetryHandler({)
  operationConfigs: {
  [MFAOperation.EMAIL_SEND]: {
  maxAttempts: 1,
  strategy: RetryStrategy.FIXED,
  baseDelayMs: 100,
  maxDelayMs: 1000,
  backoffMultiplier: 1,
  jitterMs: 0,
  timeoutMs: 100, // Very short timeout,
  retryableErrors: [FailureType.TIMEOUT],
} as any
      });
      const mockOperation = jest.fn<unknown, unknown>().mockImplementation(() => ;
        new Promise(resolve => setTimeout(resolve, 200)) // Takes longer than timeout
      );
      const resultPromise = customHandler.executeWithRetry(;);
        MFAOperation.EMAIL_SEND,
        mockOperation
      );
      // Use runAllTimersAsync to handle both timeout and operation timers
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timeout');
      expect(result.attempts[0].timeoutReached).toBe(true);
      customHandler.removeAllListeners();
    });
  });
  describe('Metrics Collection', () => {
    test('should collect and provide metrics', async () => {
      const mockOperation = jest;
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      const resultPromise = retryHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation,
        { userId: 'test-user' }
      );
      // Use runAllTimersAsync to handle nested async timers properly
      await jest.runAllTimersAsync();
      await resultPromise;
      const metrics = retryHandler.getMetrics();
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.successfulOperations).toBe(1);
      expect(metrics.failedOperations).toBe(0);
      expect(metrics.totalRetries).toBe(1);
      expect(metrics.operationMetrics[MFAOperation.TOTP_VERIFICATION].count).toBe(1);
      expect(metrics.operationMetrics[MFAOperation.TOTP_VERIFICATION].successRate).toBe(1);
    });
    test('should track failed operations in metrics', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Persistent error'));
      await retryHandler.executeWithRetry()
        MFAOperation.SMS_SEND,
        mockOperation,
        { userId: 'test-user' }
      );
      const metrics = retryHandler.getMetrics();
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.successfulOperations).toBe(0);
      expect(metrics.failedOperations).toBe(1);
      expect(metrics.operationMetrics[MFAOperation.SMS_SEND].successRate).toBe(0);
    });
  });
  describe('Active Operations Tracking', () => {
    test('should track active operations', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockImplementation(;);
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      const operationPromise = retryHandler.executeWithRetry(;);
        MFAOperation.DEVICE_REGISTRATION,
        mockOperation,
        { userId: 'test-user' }
      );
      const activeOperations = retryHandler.getActiveOperations();
      expect(activeOperations).toHaveLength(1);
      expect(activeOperations[0].operation).toBe(MFAOperation.DEVICE_REGISTRATION);
      expect(activeOperations[0].userId).toBe('test-user');
      jest.advanceTimersByTime(100);
      await operationPromise;
      const activeOperationsAfter = retryHandler.getActiveOperations();
      expect(activeOperationsAfter).toHaveLength(0);
    });
  });
  describe('Event Emission', () => {
    test('should emit operation success events', async () => {
      const successHandler = jest.fn<unknown, unknown>();
      retryHandler.on('operationSuccess', successHandler);
      const mockOperation = jest.fn<unknown, unknown>().mockResolvedValue('success' as unknown as unknown as unknown as unknown);
      await retryHandler.executeWithRetry()
        MFAOperation.BACKUP_CODE_VERIFICATION,
        mockOperation,
        { userId: 'test-user' }
      );
      expect(successHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
  operation: MFAOperation.BACKUP_CODE_VERIFICATION,
  context: expect.objectContaining({,)
  userId: 'test-user',
}
  }
      );
    });
    test('should emit operation failure events', async () => {
      const failureHandler = jest.fn<unknown, unknown>();
      retryHandler.on('operationFailure', failureHandler);
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Test error'));
      await retryHandler.executeWithRetry()
        MFAOperation.METHOD_SETUP,
        mockOperation,
        { userId: 'test-user' }
      );
      expect(failureHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
  operation: MFAOperation.METHOD_SETUP,
  error: expect.any(Error),
}
      );
    });
    test('should emit circuit breaker events', async () => {
  const circuitBreakerHandler = jest.fn<unknown, unknown>();
  retryHandler.on('circuitBreakerOpened', circuitBreakerHandler);
  const customHandler = new MFARetryHandler({)
  circuitBreaker: {
  failureThreshold: 1,
  resetTimeoutMs: 60000,
  monitoringWindowMs: 300000,
  halfOpenMaxAttempts: 1,
});
      customHandler.on('circuitBreakerOpened', circuitBreakerHandler);
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Service unavailable'));
      // Should trigger circuit breaker after first failure
      await customHandler.executeWithRetry(MFAOperation.EMAIL_VERIFICATION, mockOperation);
      expect(circuitBreakerHandler).toHaveBeenCalled();
      customHandler.removeAllListeners();
    });
  });
  describe('Configuration', () => {
  test('should update configuration dynamically', () => {
  const configHandler = jest.fn<unknown, unknown>();
  retryHandler.on('configUpdated', configHandler);
  retryHandler.updateConfig({)
  globalTimeoutMs: 30000,
  enableMetrics: false,
});
      expect(configHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
  config: expect.objectContaining({,)
  globalTimeoutMs: 30000,
  enableMetrics: false,
}
  }
      );
    });
    test('should use custom retry configuration', async () => {
  const customHandler = new MFARetryHandler({)
  operationConfigs: {
  [MFAOperation.TOTP_VERIFICATION]: {
  maxAttempts: 1,
  strategy: RetryStrategy.FIXED,
  baseDelayMs: 0,
  maxDelayMs: 0,
  backoffMultiplier: 1,
  jitterMs: 0,
  timeoutMs: 5000,
  retryableErrors: [],
} as any
      });
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue(new Error('Any error'));
      const result = await customHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation
      );
      expect(result.attempts).toHaveLength(1); // No retries due to empty retryableErrors
      expect(mockOperation).toHaveBeenCalledTimes(1);
      customHandler.removeAllListeners();
    });
  });
  describe('Edge Cases', () => {
    test('should handle immediate success', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockResolvedValue('immediate success' as unknown as unknown as unknown as unknown);
      const result = await retryHandler.executeWithRetry(;);
        MFAOperation.TOTP_VERIFICATION,
        mockOperation
      );
      expect(result.success).toBe(true);
      expect(result.attempts).toHaveLength(1);
      expect(result.attempts[0].delayMs).toBe(0); // No delay for first attempt
    });
    test('should handle operation that throws non-Error objects', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockRejectedValue('string error');
      const result = await retryHandler.executeWithRetry(;);
        MFAOperation.EMAIL_SEND,
        mockOperation
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('string error');
    });
    test('should handle operation with undefined result', async () => {
      const mockOperation = jest.fn<unknown, unknown>().mockResolvedValue(undefined as unknown as unknown as unknown as unknown);
      const result = await retryHandler.executeWithRetry(;);
        MFAOperation.METHOD_DISABLE,
        mockOperation
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });
});