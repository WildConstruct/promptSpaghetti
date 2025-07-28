/**
 * Performance Monitor Tests
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 */
import { PerformanceMonitor } from '../PerformanceMonitor';
import { AdvancedExecutionContext } from '../../runtime/advanced';

// Mock performance.now for consistent testing
const originalPerformanceNow = performance.now;
let mockTime = 0;
beforeAll(() => {
  global.performance.now = jest.fn(() => mockTime);
});
afterAll(() => {
  global.performance.now = originalPerformanceNow;
});
const createMockContext = (overrides: Partial<AdvancedExecutionContext> = {}): AdvancedExecutionContext => ({)
  variables: new Map(),
  nodeStates: new Map(),
  evaluationDepth: 0,
  cache: new Map(),
  executionMeta: {,
  startTime: Date.now(),
  executionId: 'test-exec-123',
  nodeExecutionOrder: [],
  performanceMetrics: new Map(),
},
  prng: () => Math.random(),
  seed: 12345,
  ...overrides
});
describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  beforeEach(() => {
  mockTime = 0;
  monitor = new PerformanceMonitor({)
  enableMemoryTracking: true,
  enableContextTracking: true,
  enableAggregation: false, // Disable for faster testing,
  enableAlerting: true,
  slowExecutionThreshold: 100,
  memoryThreshold: 1024 * 1024, // 1MB,
  contextSizeThreshold: 100,
  maxMetricsHistory: 1000,
});
  });
  afterEach(() => {
    monitor.shutdown();
  });
  describe('Execution Tracking', () => {
    it('should start and end execution tracking', () => {
      const context = createMockContext();
      const trackingId = monitor.startExecution('test-node', 'TestType', context);
      expect(trackingId).toMatch(/test-node-test-exec-123-\d+/);
      // Simulate passage of time
      mockTime += 50;
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics).toBeDefined();
      expect(metrics!.nodeId).toBe('test-node');
      expect(metrics!.nodeType).toBe('TestType');
      expect(metrics!.duration).toBe(50);
      expect(metrics!.errors).toHaveLength(0);
    });
    it('should track execution with error', () => {
      const context = createMockContext();
      const error = new Error('Test execution error');
      const trackingId = monitor.startExecution('error-node', 'ErrorType', context);
      mockTime += 25;
      const metrics = monitor.endExecution(trackingId, context, null, error);
      expect(metrics).toBeDefined();
      expect(metrics!.errors).toContain('Test execution error');
      expect(metrics!.duration).toBe(25);
    });
    it('should handle unknown tracking IDs gracefully', () => {
      const context = createMockContext();
      const metrics = monitor.endExecution('unknown-tracking-id', context);
      expect(metrics).toBeNull();
    });
    it('should emit execution events', async () => {
      let eventsReceived = 0;
      const eventsPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Events timeout after 3s'));
        }, 3000);
        monitor.on('execution_started', (data) => {
          expect(data.nodeId).toBe('event-test');
          expect(data.nodeType).toBe('EventType');
          eventsReceived++;
        });
        monitor.on('execution_completed', (data) => {
          expect(data.metrics.nodeId).toBe('event-test');
          expect(data.success).toBe(true);
          eventsReceived++;
          if (eventsReceived === 2) {
            clearTimeout(timeout);
            resolve();
        });
      });
      const context = createMockContext();
      const trackingId = monitor.startExecution('event-test', 'EventType', context);
      mockTime += 30;
      monitor.endExecution(trackingId, context);
      await eventsPromise;
    });
  });
  describe('Context Analysis', () => {
    it('should analyze context size metrics', () => {
      const context = createMockContext();
      // Add some context data
      context.variables.set('var1', 'value1');
      context.variables.set('var2', 'value2');
      context.nodeStates.set('state1', { data: 'test' });
      context.cache.set('cache1', 'cached_value');
      context.evaluationDepth = 3;
      const trackingId = monitor.startExecution('context-test', 'ContextType', context);
      mockTime += 40;
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics!.contextSize).toEqual({)
  variableCount: 2,
  stateCount: 1,
  cacheSize: 1,
  evaluationDepth: 3,
});
    });
    it('should detect cache hits', () => {
      const context = createMockContext();
      context.cache.set('test-key', 'cached-data');
      const trackingId = monitor.startExecution('cache-test', 'CacheType', context);
      mockTime += 20;
      // Simulate result that might indicate cache usage
      const result = { fromCache: true, data: 'cached-data' };
      const metrics = monitor.endExecution(trackingId, context, result);
      expect(metrics!.cacheHit).toBe(true);
    });
    it('should detect cache misses', () => {
      const context = createMockContext(); // No cache data;
      const trackingId = monitor.startExecution('no-cache-test', 'NoCacheType', context);
      mockTime += 60;
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics!.cacheHit).toBe(false);
    });
  });
  describe('Performance Analysis', () => {
  it('should identify slow executions', () => {
  const context = createMockContext();
  const trackingId = monitor.startExecution('slow-node', 'SlowType', context);
  mockTime += 150; // Exceeds threshold of 100ms
  const metrics = monitor.endExecution(trackingId, context);
  expect(metrics!.warnings).toContainEqual()
  expect.stringContaining('Slow execution: 150.00ms'));
});
    it('should track context size warnings', () => {
      const context = createMockContext();
      // Add many variables to exceed threshold
      for (let i = 0; i < 120; i++) {
        context.variables.set(`var${i}`, `value${i}`);}
      const trackingId = monitor.startExecution('large-context', 'LargeType', context);
      mockTime += 50;
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics!.warnings).toContainEqual()
        expect.stringContaining('Large context size: 120 items')
      );
    });
    it('should track deep evaluation warnings', () => {
  const context = createMockContext({)
  evaluationDepth: 15 // Deep evaluation,
});
      const trackingId = monitor.startExecution('deep-node', 'DeepType', context);
      mockTime += 30;
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics!.warnings).toContainEqual()
        expect.stringContaining('Deep evaluation depth: 15 levels')
      );
    });
  });
  describe('Alerting System', () => {
    it('should create duration alerts for very slow executions', (done) => {
      monitor.on('alert_created', (alert) => {
        expect(alert.type).toBe('duration');
        expect(alert.severity).toBe('high');
        expect(alert.message).toContain('Very slow execution');
        done();
      });
      const context = createMockContext();
      const trackingId = monitor.startExecution('very-slow', 'SlowType', context);
      mockTime += 250; // Much slower than threshold * 2
      monitor.endExecution(trackingId, context);
    });
    it('should create error alerts', (done) => {
      monitor.on('alert_created', (alert) => {
        expect(alert.type).toBe('error_rate');
        expect(alert.severity).toBe('critical');
        expect(alert.message).toContain('Node execution error');
        done();
      });
      const context = createMockContext();
      const trackingId = monitor.startExecution('error-node', 'ErrorType', context);
      mockTime += 30;
      const error = new Error('Critical failure');
      monitor.endExecution(trackingId, context, null, error);
    });
    it('should manage alert lifecycle', () => {
      // Create an alert
      const context = createMockContext();
      const trackingId = monitor.startExecution('alert-test', 'AlertType', context);
      mockTime += 250;
      monitor.endExecution(trackingId, context);
      const activeAlerts = monitor.getAlerts(false);
      expect(activeAlerts.length).toBe(1);
      const alertId = activeAlerts[0].id;
      // Resolve the alert
      const resolved = monitor.resolveAlert(alertId);
      expect(resolved).toBe(true);
      const resolvedAlerts = monitor.getAlerts(true);
      expect(resolvedAlerts.length).toBe(1);
      expect(resolvedAlerts[0].resolved).toBe(true);
    });
    it('should limit maximum alerts', () => {
  const limitedMonitor = new PerformanceMonitor({)
  maxAlerts: 2,
  slowExecutionThreshold: 50,
});
      try {
        // Create multiple slow executions to trigger alerts
        for (let i = 0; i < 5; i++) {
          const context = createMockContext();
          const trackingId = limitedMonitor.startExecution(`node-${i}`, 'TestType', context);}
          mockTime += 150; // Slow execution
          limitedMonitor.endExecution(trackingId, context);
        const alerts = limitedMonitor.getAlerts(false);
        expect(alerts.length).toBeLessThanOrEqual(2);
      } finally {
        limitedMonitor.shutdown();
    });
  });
  describe('Metrics Retrieval', () => {
    it('should retrieve node-specific metrics', () => {
      const context = createMockContext();
      // Create multiple executions for the same node
      for (let i = 0; i < 3; i++) {
        const trackingId = monitor.startExecution('target-node', 'TargetType', context);
        mockTime += 30 + i * 10;
        monitor.endExecution(trackingId, context);
      // Create execution for different node
      const otherTrackingId = monitor.startExecution('other-node', 'OtherType', context);
      mockTime += 40;
      monitor.endExecution(otherTrackingId, context);
      const nodeMetrics = monitor.getNodeMetrics('target-node');
      expect(nodeMetrics).toHaveLength(3);
      expect(nodeMetrics.every(m => m.nodeId === 'target-node')).toBe(true);
    });
    it('should provide comprehensive statistics summary', () => {
      const context = createMockContext();
      // Create successful executions
      for (let i = 0; i < 5; i++) {
        const trackingId = monitor.startExecution(`node-${i}`, 'FastType', context);}
        mockTime += 20 + i;
        monitor.endExecution(trackingId, context);
      // Create slow execution
      const slowTrackingId = monitor.startExecution('slow-node', 'SlowType', context);
      mockTime += 150;
      monitor.endExecution(slowTrackingId, context);
      // Create error execution
      const errorTrackingId = monitor.startExecution('error-node', 'ErrorType', context);
      mockTime += 30;
      const error = new Error('Test error');
      monitor.endExecution(errorTrackingId, context, null, error);
      const summary = monitor.getStatisticsSummary();
      expect(summary.totalExecutions).toBe(7);
      expect(summary.activeExecutions).toBe(0);
      expect(summary.slowExecutions).toBe(1);
      expect(summary.errorRate).toBeCloseTo(14.28, 1); // 1 error out of 7 executions
      expect(summary.topPerformingTypes).toContain('FastType');
      expect(summary.underperformingTypes).toContain('SlowType');
    });
    it('should handle empty metrics gracefully', () => {
      const summary = monitor.getStatisticsSummary();
      expect(summary.totalExecutions).toBe(0);
      expect(summary.averageExecutionTime).toBe(0);
      expect(summary.slowExecutions).toBe(0);
      expect(summary.errorRate).toBe(0);
      expect(summary.topPerformingTypes).toHaveLength(0);
      expect(summary.underperformingTypes).toHaveLength(0);
    });
  });
  describe('Memory Management', () => {
  it('should enforce metrics history limits', () => {
  const limitedMonitor = new PerformanceMonitor({)
  maxMetricsHistory: 3,
});
      try {
        const context = createMockContext();
        // Create more executions than the limit
        for (let i = 0; i < 5; i++) {
          const trackingId = limitedMonitor.startExecution(`node-${i}`, 'TestType', context);}
          mockTime += 20;
          limitedMonitor.endExecution(trackingId, context);
        // Should only keep the last 3 metrics
        const allMetrics = limitedMonitor.getNodeMetrics('node-2'); // Should exist;
        expect(limitedMonitor.getNodeMetrics('node-0')).toHaveLength(0); // Should be cleaned up
        expect(limitedMonitor.getNodeMetrics('node-4')).toHaveLength(1); // Should exist
      } finally {
        limitedMonitor.shutdown();
    });
    it('should clear all data when requested', () => {
      const context = createMockContext();
      // Create some data
      const trackingId = monitor.startExecution('test-node', 'TestType', context);
      mockTime += 30;
      monitor.endExecution(trackingId, context);
      expect(monitor.getStatisticsSummary().totalExecutions).toBe(1);
      monitor.clear();
      expect(monitor.getStatisticsSummary().totalExecutions).toBe(0);
      expect(monitor.getAlerts(false)).toHaveLength(0);
    });
  });
  describe('Configuration', () => {
  it('should respect disabled features', () => {
  const disabledMonitor = new PerformanceMonitor({)
  enableMemoryTracking: false,
  enableContextTracking: false,
  enableAlerting: false,
});
      try {
        const context = createMockContext();
        context.variables.set('test', 'value');
        const trackingId = disabledMonitor.startExecution('test-node', 'TestType', context);
        mockTime += 200; // Would normally trigger alert
        const metrics = disabledMonitor.endExecution(trackingId, context);
        // Context tracking should be disabled
        expect(metrics!.contextSize.variableCount).toBe(0);
        // Alerting should be disabled
        expect(disabledMonitor.getAlerts(false)).toHaveLength(0);
      } finally {
        disabledMonitor.shutdown();
    });
    it('should handle custom thresholds', () => {
  const customMonitor = new PerformanceMonitor({)
  slowExecutionThreshold: 200,
  contextSizeThreshold: 5,
});
      try {
  const context = createMockContext();
  context.variables.set('v1', 'val1');
  context.variables.set('v2', 'val2');
  context.variables.set('v3', 'val3');
  context.variables.set('v4', 'val4');
  context.variables.set('v5', 'val5');
  context.variables.set('v6', 'val6'); // Exceeds threshold of 5
  const trackingId = customMonitor.startExecution('custom-test', 'CustomType', context);
  mockTime += 150; // Under custom slow threshold
  const metrics = customMonitor.endExecution(trackingId, context);
  // Should not warn about slow execution (under 200ms threshold)
  expect(metrics!.warnings.filter(w => w.includes('Slow execution'))).toHaveLength(0);
  // Should warn about context size (over 5 threshold)
  expect(metrics!.warnings).toContainEqual()
  expect.stringContaining('Large context size: 6 items'));
} finally {
        customMonitor.shutdown();
    });
  });
  describe('Event System', () => {
    it('should emit monitor lifecycle events', (done) => {
      let eventsReceived = 0;
      const testMonitor = new PerformanceMonitor();
      testMonitor.on('monitor_cleared', () => {
        eventsReceived++;
        if (eventsReceived === 2) done();
      });
      testMonitor.on('monitor_shutdown', () => {
        eventsReceived++;
        if (eventsReceived === 2) done();
      });
      // Use setTimeout to ensure events are processed in next tick
      setTimeout(() => {
        testMonitor.clear();
        testMonitor.shutdown();
      }, 0);
    });
    it('should emit alert resolution events', (done) => {
      monitor.on('alert_resolved', (alert) => {
        expect(alert.resolved).toBe(true);
        done();
      });
      // Create an alert
      const context = createMockContext();
      const trackingId = monitor.startExecution('alert-resolve-test', 'TestType', context);
      mockTime += 250;
      monitor.endExecution(trackingId, context);
      const alerts = monitor.getAlerts(false);
      monitor.resolveAlert(alerts[0].id);
    });
  });
  describe('Edge Cases', () => {
  it('should handle execution without execution metadata', () => {
  const contextWithoutMeta = {
  variables: new Map(),
  nodeStates: new Map(),
  evaluationDepth: 0,
  cache: new Map(),
  executionMeta: undefined, // Missing metadata,
  prng: () => Math.random(),
  seed: 12345,
} as any;
      const trackingId = monitor.startExecution('no-meta-node', 'NoMetaType', contextWithoutMeta);
      mockTime += 50;
      const metrics = monitor.endExecution(trackingId, contextWithoutMeta);
      expect(metrics).toBeDefined();
      expect(metrics!.nodeId).toBe('no-meta-node');
      expect(metrics!.executionId).toMatch(/^exec-/); // Generated ID
    });
    it('should handle concurrent executions', () => {
      const context = createMockContext();
      // Start multiple executions
      const tracking1 = monitor.startExecution('concurrent-1', 'ConcurrentType', context);
      const tracking2 = monitor.startExecution('concurrent-2', 'ConcurrentType', context);
      // End in different order
      mockTime += 30;
      const metrics2 = monitor.endExecution(tracking2, context);
      mockTime += 20;
      const metrics1 = monitor.endExecution(tracking1, context);
      expect(metrics1!.nodeId).toBe('concurrent-1');
      expect(metrics1!.duration).toBe(50); // Total time from start
      expect(metrics2!.nodeId).toBe('concurrent-2');
      expect(metrics2!.duration).toBe(30);
    });
    it('should handle zero-duration executions', () => {
      const context = createMockContext();
      const trackingId = monitor.startExecution('instant-node', 'InstantType', context);
      // Don't advance mockTime - zero duration
      const metrics = monitor.endExecution(trackingId, context);
      expect(metrics!.duration).toBe(0);
      expect(metrics!.warnings.filter(w => w.includes('Slow execution'))).toHaveLength(0);
    });
  });
});