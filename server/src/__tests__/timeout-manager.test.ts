/**
 * Comprehensive Tests for TimeoutManager Service
 */

import { TimeoutManager, getTimeoutManager, initializeTimeoutManager } from '../services/TimeoutManager';
import { createTimeoutMonitoringService } from '../services/timeout-monitoring';

describe('TimeoutManager', () => {
  let timeoutManager: TimeoutManager;

  beforeEach(() => {
    timeoutManager = new TimeoutManager();
  });

  afterEach(() => {
    timeoutManager.reset();
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = timeoutManager.getConfig();

      expect(config.database.connect).toBe(10000);
      expect(config.database.query).toBe(30000);
      expect(config.redis.connect).toBe(5000);
      expect(config.auth.login).toBe(10000);
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        database: { query: 15000 },
        redis: { operation: 8000 },
      };

      const customManager = new TimeoutManager(customConfig);
      const config = customManager.getConfig();

      expect(config.database.query).toBe(15000);
      expect(config.redis.operation).toBe(8000);
      expect(config.database.connect).toBe(10000); // Should keep default
    });

    it('should update configuration', () => {
      const updates = {
        database: { query: 20000 },
        auth: { login: 8000 },
      };

      timeoutManager.updateConfig(updates);
      const config = timeoutManager.getConfig();

      expect(config.database.query).toBe(20000);
      expect(config.auth.login).toBe(8000);
    });
  });

  describe('Timeout Execution', () => {
    it('should execute operation successfully within timeout', async () => {
      const operation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown as unknown);

      const result = await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.timedOut).toBe(false);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should timeout operation that takes too long', async () => {
      // Create manager with very short timeout
      const shortTimeoutManager = new TimeoutManager({
        database: { query: 100 },
      });

      const operation = jest
        .fn<unknown[], unknown>()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('late'), 200)));

      const result = await shortTimeoutManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
      expect(result.error?.message).toContain('timed out');
    });

    it('should retry failed operations', async () => {
      const operation = jest
        .fn<unknown[], unknown>()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success' as unknown as unknown);

      const result = await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect maximum retry attempts', async () => {
      const operation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Always fails'));

      const result = await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(4); // 1 initial + 3 retries
      expect(operation).toHaveBeenCalledTimes(4);
    });
  });

  describe('Circuit Breaker', () => {
    let circuitBreakerManager: TimeoutManager;

    beforeEach(() => {
      circuitBreakerManager = new TimeoutManager(
        {},
        {},
        { failureThreshold: 2, resetTimeout: 100 } // Reduced from 1000ms
      );
    });

    it('should open circuit breaker after threshold failures', async () => {
      const operation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Failure'));

      // First failure
      await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');
      // Second failure - should open circuit breaker
      await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');

      // Third attempt should be blocked by circuit breaker
      const result = await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(false);
      expect(result.circuitBreakerOpen).toBe(true);
      expect(result.attempts).toBe(0);
    });

    it('should reset circuit breaker after timeout', async () => {
      const operation = jest
        .fn<unknown[], unknown>()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success' as unknown as unknown);

      // Trigger circuit breaker
      await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');
      await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');

      // Wait for reset timeout (optimized for speed)
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should be able to execute again
      const result = await circuitBreakerManager.executeWithTimeout(operation, 'database', 'query');

      expect(result.success).toBe(true);
      expect(result.circuitBreakerOpen).toBe(false);
    });
  });

  describe('Fallback Operations', () => {
    it('should execute fallback when primary fails', async () => {
      const primaryOperation = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Primary failed'));
      const fallbackOperation = jest
        .fn<unknown[], unknown>()
        .mockResolvedValue('fallback success' as unknown as unknown);

      const result = await timeoutManager.executeWithFallback(primaryOperation, fallbackOperation, 'database', 'query');

      expect(result.success).toBe(true);
      expect(result.data).toBe('fallback success');
      expect(primaryOperation).toHaveBeenCalled();
      expect(fallbackOperation).toHaveBeenCalled();
    });

    it('should use primary result when it succeeds', async () => {
      const primaryOperation = jest.fn<unknown[], unknown>().mockResolvedValue('primary success' as unknown as unknown);
      const fallbackOperation = jest
        .fn<unknown[], unknown>()
        .mockResolvedValue('fallback success' as unknown as unknown);

      const result = await timeoutManager.executeWithFallback(primaryOperation, fallbackOperation, 'database', 'query');

      expect(result.success).toBe(true);
      expect(result.data).toBe('primary success');
      expect(primaryOperation).toHaveBeenCalled();
      expect(fallbackOperation).not.toHaveBeenCalled();
    });
  });

  describe('Operation Management', () => {
    it('should track active operations', async () => {
      const slowOperation = () => new Promise(resolve => setTimeout(() => resolve('done'), 100));

      const promise = timeoutManager.executeWithTimeout(slowOperation, 'database', 'query', 'test-operation');

      // Check that operation is tracked
      const healthBefore = timeoutManager.getHealthStatus();
      expect(healthBefore.activeOperations).toBe(1);

      await promise;

      // Check that operation is cleaned up
      const healthAfter = timeoutManager.getHealthStatus();
      expect(healthAfter.activeOperations).toBe(0);
    });

    it('should cancel active operation', async () => {
      const slowOperation = () =>
        new Promise(
          resolve => setTimeout(() => resolve('done'), 10) // Reduced from 1000ms to 10ms
        );

      const promise = timeoutManager.executeWithTimeout(slowOperation, 'database', 'query', 'test-operation');

      // Cancel the operation
      const cancelled = timeoutManager.cancelOperation('test-operation');
      expect(cancelled).toBe(true);

      // Operation should fail
      const result = await promise;
      expect(result.success).toBe(false);
    });

    it('should cancel all operations', async () => {
      const slowOperation = () =>
        new Promise(
          resolve => setTimeout(() => resolve('done'), 10) // Reduced from 1000ms to 10ms
        );

      // Start multiple operations
      const promises = [
        timeoutManager.executeWithTimeout(slowOperation, 'database', 'query', 'op1'),
        timeoutManager.executeWithTimeout(slowOperation, 'database', 'query', 'op2'),
        timeoutManager.executeWithTimeout(slowOperation, 'database', 'query', 'op3'),
      ];

      // Cancel all operations
      const cancelledCount = timeoutManager.cancelAllOperations();
      expect(cancelledCount).toBe(3);

      // All operations should fail
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics for operations', async () => {
      const operation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown as unknown);

      await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      const metrics = timeoutManager.getMetrics('database.query');
      expect(metrics).toBeDefined();
      expect(metrics!.totalOperations).toBe(1);
      expect(metrics!.timeouts).toBe(0);
    });

    it('should track timeout metrics', async () => {
      const shortTimeoutManager = new TimeoutManager({
        database: { query: 50 },
      });

      const slowOperation = () => new Promise(resolve => setTimeout(() => resolve('done'), 100));

      await shortTimeoutManager.executeWithTimeout(slowOperation, 'database', 'query');

      const metrics = shortTimeoutManager.getMetrics('database.query');
      expect(metrics!.timeouts).toBe(1);
      expect(metrics!.lastTimeout).toBeDefined();
    });

    it('should provide health status', () => {
      const health = timeoutManager.getHealthStatus();

      expect(health).toHaveProperty('activeOperations');
      expect(health).toHaveProperty('openCircuitBreakers');
      expect(health).toHaveProperty('totalTimeouts');
      expect(health).toHaveProperty('operationTypes');
      expect(Array.isArray(health.operationTypes)).toBe(true);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for getTimeoutManager', () => {
      const instance1 = getTimeoutManager();
      const instance2 = getTimeoutManager();

      expect(instance1).toBe(instance2);
    });

    it('should create new instance with initializeTimeoutManager', () => {
      const customConfig = { database: { query: 25000 } };
      const newInstance = initializeTimeoutManager(customConfig);

      expect(newInstance).toBeDefined();
      expect(newInstance.getConfig().database.query).toBe(25000);
    });
  });
});

describe('TimeoutMonitoringService', () => {
  let timeoutManager: TimeoutManager;
  let monitoringService: ReturnType<typeof createTimeoutMonitoringService>;

  beforeEach(() => {
    timeoutManager = new TimeoutManager();
    monitoringService = createTimeoutMonitoringService(timeoutManager);
  });

  afterEach(() => {
    timeoutManager.reset();
  });

  describe('Event Handling', () => {
    it('should handle timeout events', async () => {
      // Trigger a timeout
      const shortTimeoutManager = new TimeoutManager({ database: { query: 50 } });
      const shortMonitoring = createTimeoutMonitoringService(shortTimeoutManager);

      const timeoutPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout event not received within 3s'));
        }, 3000);

        shortMonitoring.on('timeout_recorded', event => {
          expect(event.metricKey).toBeDefined();
          clearTimeout(timeout);
          resolve();
        });
      });

      const slowOperation = () => new Promise(resolve => setTimeout(() => resolve('done'), 100));

      try {
        await shortTimeoutManager.executeWithTimeout(slowOperation, 'database', 'query');
      } catch (error) {
        // Expected timeout error
      }

      await timeoutPromise;
    });

    it('should handle circuit breaker events', async () => {
      const circuitBreakerManager = new TimeoutManager({}, {}, { failureThreshold: 1 });
      const circuitMonitoring = createTimeoutMonitoringService(circuitBreakerManager);

      const circuitBreakerPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Circuit breaker event not received within 3s'));
        }, 3000);

        circuitMonitoring.on('circuit_breaker_opened', event => {
          expect(event.metricKey).toBeDefined();
          clearTimeout(timeout);
          resolve();
        });
      });

      const failingOperation = () => Promise.reject(new Error('Failure'));

      try {
        await circuitBreakerManager.executeWithTimeout(failingOperation, 'database', 'query');
      } catch (error) {
        // Expected to fail
      }

      await circuitBreakerPromise;
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance metrics', async () => {
      const operation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown as unknown);

      await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      const metrics = monitoringService.getPerformanceMetrics('database.query');
      expect(metrics).toBeDefined();
      expect(metrics!.operation).toBe('database.query');
      expect(metrics!.totalRequests).toBe(1);
      expect(metrics!.successRate).toBe(1);
    });

    it('should get all performance metrics', async () => {
      const operation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown as unknown);

      await timeoutManager.executeWithTimeout(operation, 'database', 'query');
      await timeoutManager.executeWithTimeout(operation, 'redis', 'operation');

      const allMetrics = monitoringService.getAllPerformanceMetrics();
      expect(allMetrics).toHaveLength(2);
      expect(allMetrics.map(m => m.operation)).toContain('database.query');
      expect(allMetrics.map(m => m.operation)).toContain('redis.operation');
    });
  });

  describe('Alert Management', () => {
    it('should create alerts for excessive timeouts', async () => {
      const alertConfig = { timeoutThreshold: 1 };
      const alertMonitoring = createTimeoutMonitoringService(timeoutManager, alertConfig);

      alertMonitoring.on('alert_created', alert => {
        expect(alert.type).toBe('timeout');
        expect(alert.severity).toBeDefined();
      });

      // Create a timeout to trigger alert
      const shortTimeoutManager = new TimeoutManager({ database: { query: 50 } });
      const shortMonitoring = createTimeoutMonitoringService(shortTimeoutManager, alertConfig);

      let alertCreated = false;
      shortMonitoring.on('alert_created', () => {
        alertCreated = true;
      });

      const slowOperation = () => new Promise(resolve => setTimeout(() => resolve('done'), 100));

      await shortTimeoutManager.executeWithTimeout(slowOperation, 'database', 'query');

      // Small delay to allow event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(alertCreated).toBe(true);
    });

    it('should resolve alerts manually', () => {
      const alert = {
        id: 'test-alert',
        type: 'timeout' as const,
        severity: 'medium' as const,
        operation: 'test.operation',
        message: 'Test alert',
        timestamp: new Date(),
        resolved: false,
        metrics: {},
      };

      // Manually add alert to test resolution
      (monitoringService as any).activeAlerts.set(alert.id, alert);

      const resolved = monitoringService.resolveAlert(alert.id);
      expect(resolved).toBe(true);

      const alerts = monitoringService.getActiveAlerts();
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Dashboard Data', () => {
    it('should provide dashboard data', async () => {
      const operation = jest.fn<unknown[], unknown>().mockResolvedValue('success' as unknown as unknown);
      await timeoutManager.executeWithTimeout(operation, 'database', 'query');

      const dashboard = monitoringService.getDashboardData();

      expect(dashboard).toHaveProperty('overview');
      expect(dashboard).toHaveProperty('performanceMetrics');
      expect(dashboard).toHaveProperty('recentAlerts');
      expect(dashboard).toHaveProperty('circuitBreakerStates');
      expect(dashboard).toHaveProperty('healthStatus');

      expect(dashboard.overview.totalOperations).toBeGreaterThan(0);
    });
  });

  describe('Alert Channels', () => {
    it('should add and remove alert channels', () => {
      const slackChannel = {
        type: 'slack' as const,
        config: { webhookUrl: 'https://hooks.slack.com/test' },
      };

      monitoringService.addAlertChannel(slackChannel);

      // Verify channel was added (internal state)
      expect((monitoringService as any).alertChannels).toHaveLength(1);

      monitoringService.removeAlertChannel('slack');

      // Verify channel was removed
      expect((monitoringService as any).alertChannels).toHaveLength(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should update alert configuration', () => {
      const updates = {
        timeoutThreshold: 10,
        circuitBreakerThreshold: 3,
        errorRateThreshold: 0.15,
      };

      monitoringService.updateAlertConfig(updates);

      // Verify configuration was updated
      const config = (monitoringService as any).alertConfig;
      expect(config.timeoutThreshold).toBe(10);
      expect(config.circuitBreakerThreshold).toBe(3);
      expect(config.errorRateThreshold).toBe(0.15);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old alerts and data', () => {
      // Add some test data
      const oldAlert = {
        id: 'old-alert',
        type: 'timeout' as const,
        severity: 'low' as const,
        operation: 'test.operation',
        message: 'Old alert',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        resolved: false,
        metrics: {},
      };

      (monitoringService as any).activeAlerts.set(oldAlert.id, oldAlert);

      // Cleanup with 24 hour max age
      monitoringService.cleanup(24 * 60 * 60 * 1000);

      // Old alert should be removed
      const alerts = monitoringService.getAllAlerts();
      expect(alerts).toHaveLength(0);
    });
  });
});

// Integration tests would go here to test with actual services
describe('Integration Tests', () => {
  // These would test with actual database, Redis, etc.
  // For now, we'll skip them in the unit test suite
  it.skip('should integrate with actual database operations', () => {
    // Integration test implementation
  });

  it.skip('should integrate with actual Redis operations', () => {
    // Integration test implementation
  });

  it.skip('should integrate with Fastify middleware', () => {
    // Integration test implementation
  });
});
