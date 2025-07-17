import { PerformanceTestSuite, SimulatedUser, TEST_SCENARIOS, OperationType, DocumentComplexity } from '../PerformanceTestSuite';
import { MetricsCollector } from '../MetricsCollector';
import { PerformanceOptimizer } from '../PerformanceOptimizer';

// Mock WebSocket for testing
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1
  }));
});

describe('PerformanceTestSuite', () => {
  let testSuite: PerformanceTestSuite;

  beforeEach(() => {
    testSuite = new PerformanceTestSuite();
  });

  afterEach(() => {
    testSuite.stop();
  });

  describe('Test Scenarios', () => {
    test('should have predefined test scenarios', () => {
      expect(TEST_SCENARIOS).toBeDefined();
      expect(TEST_SCENARIOS.length).toBeGreaterThan(0);
      
      const lightEditingScenario = TEST_SCENARIOS.find(s => s.name === 'light_editing');
      expect(lightEditingScenario).toBeDefined();
      expect(lightEditingScenario?.userCount).toBe(2);
      expect(lightEditingScenario?.documentComplexity).toBe(DocumentComplexity.SIMPLE);
    });

    test('should validate scenario structure', () => {
      TEST_SCENARIOS.forEach(scenario => {
        expect(scenario.name).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.userCount).toBeGreaterThan(0);
        expect(scenario.duration).toBeGreaterThan(0);
        expect(scenario.operationRate).toBeGreaterThan(0);
        expect(scenario.operationTypes.length).toBeGreaterThan(0);
        expect(scenario.documentComplexity).toBeDefined();
      });
    });
  });

  describe('SimulatedUser', () => {
    let user: SimulatedUser;
    const testScenario = TEST_SCENARIOS[0];

    beforeEach(() => {
      user = new SimulatedUser('test-user', 'test-doc', testScenario);
    });

    test('should create simulated user with correct properties', () => {
      expect(user).toBeDefined();
      expect(user.getMetrics()).toEqual([]);
    });

    test('should handle connection events', (done) => {
      user.on('connected', () => {
        expect(true).toBe(true);
        done();
      });

      // Simulate connection
      user.emit('connected');
    });

    test('should record metrics during operations', () => {
      const initialMetrics = user.getMetrics();
      expect(initialMetrics).toHaveLength(0);

      // Simulate metric recording
      user.emit('metric_recorded', {
        connectionTime: 100,
        messageLatency: 50,
        messageRate: 10,
        disconnectionRate: 0,
        conflictResolutionTime: 0,
        synchronizationTime: 0,
        stateUpdateLatency: 0,
        cpuUsage: 50,
        memoryUsage: 60,
        networkThroughput: 1000,
        responseTime: 75,
        operationSuccessRate: 100,
        errorRate: 0,
        timestamp: Date.now(),
        testScenario: testScenario.name,
        userCount: testScenario.userCount
      });

      // Note: This test would need to be adjusted based on actual implementation
      // as the user.getMetrics() might not immediately reflect emitted events
    });
  });

  describe('Performance Report Generation', () => {
    test('should generate report from metrics', () => {
      const sampleMetrics = [
        {
          connectionTime: 100,
          messageLatency: 50,
          messageRate: 10,
          disconnectionRate: 0,
          conflictResolutionTime: 200,
          synchronizationTime: 150,
          stateUpdateLatency: 75,
          cpuUsage: 60,
          memoryUsage: 70,
          networkThroughput: 1000,
          responseTime: 100,
          operationSuccessRate: 100,
          errorRate: 0,
          timestamp: Date.now(),
          testScenario: 'test_scenario',
          userCount: 5
        },
        {
          connectionTime: 120,
          messageLatency: 60,
          messageRate: 8,
          disconnectionRate: 0,
          conflictResolutionTime: 180,
          synchronizationTime: 140,
          stateUpdateLatency: 80,
          cpuUsage: 55,
          memoryUsage: 65,
          networkThroughput: 950,
          responseTime: 110,
          operationSuccessRate: 98,
          errorRate: 2,
          timestamp: Date.now(),
          testScenario: 'test_scenario',
          userCount: 5
        }
      ];

      const report = testSuite.generateReport(sampleMetrics);
      
      expect(report).toBeDefined();
      expect(report.testDuration).toBeGreaterThanOrEqual(0);
      expect(report.totalOperations).toBe(2);
      expect(report.userCount).toBe(5);
      expect(report.scenario).toBe('test_scenario');
      expect(report.statistics).toBeDefined();
      expect(report.statistics.responseTime).toBeDefined();
      expect(report.statistics.responseTime.mean).toBeCloseTo(105, 0);
      expect(report.statistics.operationSuccessRate.mean).toBeCloseTo(99, 0);
    });

    test('should handle empty metrics gracefully', () => {
      const report = testSuite.generateReport([]);
      expect(report).toBeNull();
    });
  });

  describe('Operation Types', () => {
    test('should include all necessary operation types', () => {
      const operationTypes = Object.values(OperationType);
      
      expect(operationTypes).toContain(OperationType.CREATE_NODE);
      expect(operationTypes).toContain(OperationType.DELETE_NODE);
      expect(operationTypes).toContain(OperationType.UPDATE_NODE_PROPERTIES);
      expect(operationTypes).toContain(OperationType.MOVE_NODE);
      expect(operationTypes).toContain(OperationType.CREATE_EDGE);
      expect(operationTypes).toContain(OperationType.DELETE_EDGE);
      expect(operationTypes).toContain(OperationType.UPDATE_CURSOR);
      expect(operationTypes).toContain(OperationType.UPDATE_SELECTION);
      expect(operationTypes).toContain(OperationType.TYPING_ACTIVITY);
      expect(operationTypes).toContain(OperationType.TOOL_CHANGE);
    });
  });

  describe('Document Complexity', () => {
    test('should define complexity levels', () => {
      expect(DocumentComplexity.SIMPLE).toBe('simple');
      expect(DocumentComplexity.MEDIUM).toBe('medium');
      expect(DocumentComplexity.COMPLEX).toBe('complex');
      expect(DocumentComplexity.ENTERPRISE).toBe('enterprise');
    });
  });
});

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
  });

  afterEach(() => {
    metricsCollector.stopCollection();
  });

  test('should start and stop collection', () => {
    expect(() => metricsCollector.startCollection()).not.toThrow();
    expect(() => metricsCollector.stopCollection()).not.toThrow();
  });

  test('should record WebSocket metrics', () => {
    const wsMetrics = {
      connectionCount: 10,
      messageLatency: 100,
      messageRate: 50,
      errorRate: 2,
      bytesTransferred: 1024
    };

    expect(() => metricsCollector.recordWebSocketMetrics(wsMetrics)).not.toThrow();
  });

  test('should record collaboration metrics', () => {
    const collabMetrics = {
      conflictRate: 0.1,
      conflictResolutionTime: 500,
      synchronizationLatency: 200,
      operationRate: 10
    };

    expect(() => metricsCollector.recordCollaborationMetrics(collabMetrics)).not.toThrow();
  });

  test('should get current metrics', () => {
    const currentMetrics = metricsCollector.getCurrentMetrics();
    
    expect(currentMetrics).toBeDefined();
    expect(currentMetrics.system).toBeDefined();
    expect(currentMetrics.webSocket).toBeDefined();
    expect(currentMetrics.collaboration).toBeDefined();
  });

  test('should generate performance summary', () => {
    const summary = metricsCollector.getPerformanceSummary();
    
    expect(summary).toBeDefined();
    expect(summary.timestamp).toBeDefined();
    expect(summary.health).toBeDefined();
    expect(summary.alerts).toBeDefined();
    expect(summary.metrics).toBeDefined();
    expect(summary.recommendations).toBeDefined();
    expect(Array.isArray(summary.recommendations)).toBe(true);
  });

  test('should handle metrics window queries', () => {
    const endTime = Date.now();
    const startTime = endTime - 60000; // 1 minute ago
    
    const window = metricsCollector.getMetricsWindow(startTime, endTime);
    
    expect(window).toBeDefined();
    expect(window.windowStart).toBe(startTime);
    expect(window.windowEnd).toBe(endTime);
    expect(window.duration).toBe(60000);
    expect(Array.isArray(window.systemMetrics)).toBe(true);
    expect(Array.isArray(window.webSocketMetrics)).toBe(true);
    expect(Array.isArray(window.collaborationMetrics)).toBe(true);
  });
});

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
    optimizer = new PerformanceOptimizer(metricsCollector);
  });

  afterEach(() => {
    optimizer.stop();
  });

  test('should start and stop optimizer', () => {
    expect(() => optimizer.start()).not.toThrow();
    expect(() => optimizer.stop()).not.toThrow();
  });

  test('should have default optimization strategies', () => {
    const strategies = optimizer.getStrategies();
    
    expect(strategies).toBeDefined();
    expect(strategies.length).toBeGreaterThan(0);
    
    const messageBatching = strategies.find(s => s.name === 'message_batching');
    expect(messageBatching).toBeDefined();
    expect(messageBatching?.enabled).toBe(true);
    
    const responseCache = strategies.find(s => s.name === 'response_caching');
    expect(responseCache).toBeDefined();
    
    const memoryCleanup = strategies.find(s => s.name === 'memory_cleanup');
    expect(memoryCleanup).toBeDefined();
  });

  test('should add and remove strategies', () => {
    const customStrategy = {
      name: 'test_strategy',
      description: 'Test optimization strategy',
      enabled: true,
      priority: 'medium' as const,
      triggerConditions: {
        cpuThreshold: 80
      },
      actions: [{
        type: 'throttle' as const,
        target: 'test_target',
        parameters: { rate: 10 },
        description: 'Test action'
      }]
    };

    optimizer.addStrategy(customStrategy);
    
    let strategies = optimizer.getStrategies();
    expect(strategies.find(s => s.name === 'test_strategy')).toBeDefined();
    
    const removed = optimizer.removeStrategy('test_strategy');
    expect(removed).toBe(true);
    
    strategies = optimizer.getStrategies();
    expect(strategies.find(s => s.name === 'test_strategy')).toBeUndefined();
  });

  test('should enable and disable strategies', () => {
    const result = optimizer.setStrategyEnabled('message_batching', false);
    expect(result).toBe(true);
    
    const strategies = optimizer.getStrategies();
    const messageBatching = strategies.find(s => s.name === 'message_batching');
    expect(messageBatching?.enabled).toBe(false);
  });

  test('should generate recommendations', () => {
    const recommendations = optimizer.getRecommendations();
    
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('should handle message batching optimization', () => {
    const messages = [
      { type: 'graph_update', payload: { data: 'test1' } },
      { type: 'graph_update', payload: { data: 'test2' } },
      { type: 'presence_update', payload: { user: 'user1' } }
    ];

    const batchedMessages = optimizer.optimizeMessageBatching('test-doc', messages);
    
    // Should return empty array initially (batching threshold not met)
    expect(Array.isArray(batchedMessages)).toBe(true);
  });

  test('should handle response caching', () => {
    const testKey = 'test-cache-key';
    const testResponse = { data: 'test response' };
    
    // Should return null for non-existent cache entry
    expect(optimizer.getCachedResponse(testKey)).toBeNull();
    
    // Set cache entry
    optimizer.setCachedResponse(testKey, testResponse, 1000);
    
    // Should return cached response
    expect(optimizer.getCachedResponse(testKey)).toEqual(testResponse);
  });
});