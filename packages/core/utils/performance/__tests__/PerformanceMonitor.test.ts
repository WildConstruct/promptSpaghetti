/**
 * Comprehensive Test Suite for PerformanceMonitor
 * Target Coverage: 80%+
 */

import { PerformanceMonitor } from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    dateNowSpy = jest.spyOn(Date, 'now');
    dateNowSpy.mockReturnValue(1000);
  });

  afterEach(() => {
    monitor.stop();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  describe('start', () => {
    it('should start monitoring and initialize metrics', () => {
      monitor.start();
      expect(monitor.getMetrics()).toBeDefined();
      expect(monitor.getMetrics().operations).toEqual([]);
    });

    it('should reset metrics when starting', () => {
      monitor.start();
      monitor.recordOperation('test-op', 100);
      expect(monitor.getMetrics().operations).toHaveLength(1);

      monitor.start();
      expect(monitor.getMetrics().operations).toEqual([]);
    });
  });

  describe('stop', () => {
    it('should stop monitoring and clear metrics', () => {
      monitor.start();
      monitor.recordOperation('test-op', 100);
      monitor.stop();

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toEqual([]);
    });
  });

  describe('recordOperation', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should record an operation with duration', () => {
      dateNowSpy.mockReturnValue(2000);
      monitor.recordOperation('database-query', 150);

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toHaveLength(1);
      expect(metrics.operations[0]).toEqual({
        name: 'database-query',
        duration: 150,
        timestamp: 2000,
        metadata: undefined
      });
    });

    it('should record operation with metadata', () => {
      const metadata = { query: 'SELECT * FROM users', rows: 100 };
      monitor.recordOperation('database-query', 200, metadata);

      const metrics = monitor.getMetrics();
      expect(metrics.operations[0].metadata).toEqual(metadata);
    });

    it('should track multiple operations', () => {
      monitor.recordOperation('op1', 100);
      monitor.recordOperation('op2', 200);
      monitor.recordOperation('op3', 150);

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toHaveLength(3);
      expect(metrics.averageDuration).toBe(150);
    });

    it('should not record when monitoring is stopped', () => {
      monitor.stop();
      monitor.recordOperation('test-op', 100);

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toEqual([]);
    });
  });

  describe('startOperation', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should start timing an operation', () => {
      dateNowSpy.mockReturnValue(1000);
      const endOp = monitor.startOperation('api-call');

      dateNowSpy.mockReturnValue(1250);
      endOp();

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toHaveLength(1);
      expect(metrics.operations[0].duration).toBe(250);
    });

    it('should handle operation with metadata', () => {
      const endOp = monitor.startOperation('api-call');
      dateNowSpy.mockReturnValue(1500);

      const metadata = { endpoint: '/api/users', method: 'GET' };
      endOp(metadata);

      const metrics = monitor.getMetrics();
      expect(metrics.operations[0].metadata).toEqual(metadata);
    });

    it('should handle nested operations', () => {
      dateNowSpy.mockReturnValue(1000);
      const endOp1 = monitor.startOperation('outer');

      dateNowSpy.mockReturnValue(1100);
      const endOp2 = monitor.startOperation('inner');

      dateNowSpy.mockReturnValue(1200);
      endOp2();

      dateNowSpy.mockReturnValue(1300);
      endOp1();

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toHaveLength(2);
      expect(metrics.operations[0].name).toBe('inner');
      expect(metrics.operations[0].duration).toBe(100);
      expect(metrics.operations[1].name).toBe('outer');
      expect(metrics.operations[1].duration).toBe(300);
    });
  });

  describe('trackMemory', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should track memory usage', () => {
      const mockMemory = {
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        external: 10 * 1024 * 1024, // 10MB
        rss: 150 * 1024 * 1024 // 150MB
      };

      jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemory as any);

      monitor.trackMemory('checkpoint-1');

      const metrics = monitor.getMetrics();
      expect(metrics.memorySnapshots).toHaveLength(1);
      expect(metrics.memorySnapshots[0]).toEqual({
        label: 'checkpoint-1',
        heapUsed: 50,
        heapTotal: 100,
        external: 10,
        rss: 150,
        timestamp: expect.any(Number)
      });
    });

    it('should detect memory leaks', () => {
      const mockMemory1 = {
        heapUsed: 50 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 150 * 1024 * 1024
      };
      const mockMemory2 = {
        heapUsed: 200 * 1024 * 1024,
        heapTotal: 250 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 300 * 1024 * 1024
      };

      const memoryUsageSpy = jest.spyOn(process, 'memoryUsage');
      memoryUsageSpy.mockReturnValueOnce(mockMemory1 as any);
      memoryUsageSpy.mockReturnValueOnce(mockMemory2 as any);

      monitor.trackMemory('before');
      monitor.trackMemory('after');

      const metrics = monitor.getMetrics();
      expect(metrics.memoryLeakDetected).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Potential memory leak detected')
      );
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should return comprehensive metrics', () => {
      monitor.recordOperation('op1', 100);
      monitor.recordOperation('op2', 200);
      monitor.recordOperation('op1', 150);

      const metrics = monitor.getMetrics();

      expect(metrics).toEqual({
        operations: expect.any(Array),
        totalOperations: 3,
        averageDuration: 150,
        minDuration: 100,
        maxDuration: 200,
        operationsByType: {
          op1: 2,
          op2: 1
        },
        memorySnapshots: [],
        memoryLeakDetected: false,
        startTime: expect.any(Number),
        elapsedTime: expect.any(Number)
      });
    });

    it('should calculate percentiles', () => {
      // Add 100 operations with varying durations
      for (let i = 1; i <= 100; i++) {
        monitor.recordOperation('test', i * 10);
      }

      const metrics = monitor.getMetrics();
      expect(metrics.percentiles).toBeDefined();
      expect(metrics.percentiles?.p50).toBe(500);
      expect(metrics.percentiles?.p95).toBe(950);
      expect(metrics.percentiles?.p99).toBe(990);
    });

    it('should handle empty metrics gracefully', () => {
      const metrics = monitor.getMetrics();

      expect(metrics.totalOperations).toBe(0);
      expect(metrics.averageDuration).toBe(0);
      expect(metrics.minDuration).toBe(0);
      expect(metrics.maxDuration).toBe(0);
    });
  });

  describe('logSummary', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should log performance summary', () => {
      monitor.recordOperation('api-call', 100);
      monitor.recordOperation('database-query', 200);
      monitor.recordOperation('cache-lookup', 50);

      monitor.logSummary();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance Summary')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total Operations: 3')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Average Duration: 116.67ms')
      );
    });

    it('should log slowest operations', () => {
      monitor.recordOperation('slow-op', 1000);
      monitor.recordOperation('fast-op', 10);
      monitor.recordOperation('medium-op', 100);

      monitor.logSummary();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slowest Operations:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('slow-op: 1000ms')
      );
    });

    it('should log memory information if available', () => {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 50 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 150 * 1024 * 1024
      } as any);

      monitor.trackMemory('test');
      monitor.logSummary();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Memory Usage:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Peak Heap: 50.00 MB')
      );
    });
  });

  describe('reset', () => {
    it('should reset all metrics', () => {
      monitor.start();
      monitor.recordOperation('test', 100);
      monitor.trackMemory('checkpoint');

      monitor.reset();

      const metrics = monitor.getMetrics();
      expect(metrics.operations).toEqual([]);
      expect(metrics.memorySnapshots).toEqual([]);
      expect(metrics.totalOperations).toBe(0);
    });
  });

  describe('exportMetrics', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should export metrics as JSON string', () => {
      monitor.recordOperation('test', 100);

      const exported = monitor.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed.operations).toHaveLength(1);
      expect(parsed.operations[0].name).toBe('test');
    });

    it('should include all metric fields in export', () => {
      monitor.recordOperation('op1', 100);
      monitor.recordOperation('op2', 200);

      const exported = monitor.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('totalOperations', 2);
      expect(parsed).toHaveProperty('averageDuration', 150);
      expect(parsed).toHaveProperty('operationsByType');
      expect(parsed).toHaveProperty('startTime');
      expect(parsed).toHaveProperty('elapsedTime');
    });
  });

  describe('enableAutoLogging', () => {
    beforeEach(() => {
      monitor.start();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should automatically log summary at intervals', () => {
      monitor.enableAutoLogging(1000); // Every second

      monitor.recordOperation('test', 100);

      jest.advanceTimersByTime(1000);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance Summary')
      );

      monitor.recordOperation('test2', 200);

      jest.advanceTimersByTime(1000);
      expect(consoleLogSpy).toHaveBeenCalledTimes(6); // Multiple log calls per summary
    });

    it('should stop auto-logging when monitoring stops', () => {
      monitor.enableAutoLogging(1000);

      monitor.stop();

      jest.advanceTimersByTime(2000);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('threshold monitoring', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should warn when operation exceeds threshold', () => {
      monitor.setThreshold('slow-operation', 100);

      monitor.recordOperation('slow-operation', 150);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Operation "slow-operation" exceeded threshold')
      );
    });

    it('should not warn when operation is within threshold', () => {
      monitor.setThreshold('fast-operation', 100);

      monitor.recordOperation('fast-operation', 50);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('performance budgets', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should track performance budget', () => {
      monitor.setBudget('page-load', 1000);

      monitor.recordOperation('page-load', 800);

      const metrics = monitor.getMetrics();
      expect(metrics.budgets).toEqual({
        'page-load': {
          budget: 1000,
          used: 800,
          remaining: 200,
          percentUsed: 80
        }
      });
    });

    it('should warn when budget is exceeded', () => {
      monitor.setBudget('api-calls', 500);

      monitor.recordOperation('api-calls', 600);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance budget exceeded for "api-calls"')
      );
    });
  });
});
