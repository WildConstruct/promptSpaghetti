/**
 * Tests for Testing Utilities
 * Validates the testing utilities created for Epic 18
 */

import React from 'react';
import {
  TestEnvironmentManager,
  ComponentTestingUtils,
  AsyncTestingUtils,
  MockDataUtils,
  PerformanceTestingUtils
} from '../TestingUtilities';

describe('Testing Utilities', () => {
  describe('TestEnvironmentManager', () => {
    afterEach(async () => {
      await TestEnvironmentManager.cleanupAll();
    });

    test('should create and manage test environments', async () => {
      const config = {
        seed: 'test-seed-123',
        mockReactFlow: true,
        mockWebSocket: false,
        mockLocalStorage: true
      };

      const env = await TestEnvironmentManager.createEnvironment('test-env', config);

      expect(env.name).toBe('test-env');
      expect(env.config).toEqual(config);
      expect(env.fixtures).toBeDefined();
      expect(env.mocks).toBeDefined();
      expect(env.cleanup).toBeDefined();
      expect(env.createdAt).toBeGreaterThan(0);

      // Should be able to retrieve the environment
      const retrievedEnv = TestEnvironmentManager.getEnvironment('test-env');
      expect(retrievedEnv).toBe(env);
    });

    test('should setup ReactFlow mocks when configured', async () => {
      const env = await TestEnvironmentManager.createEnvironment('react-flow-env', {
        mockReactFlow: true
      });

      const reactFlowMock = env.mocks.get('reactFlow');
      expect(reactFlowMock).toBeDefined();
      expect(reactFlowMock.useReactFlow).toBeInstanceOf(Function);
      expect(reactFlowMock.useNodesState).toBeInstanceOf(Function);
      expect(reactFlowMock.useEdgesState).toBeInstanceOf(Function);
    });

    test('should setup WebSocket mocks when configured', async () => {
      const env = await TestEnvironmentManager.createEnvironment('websocket-env', {
        mockWebSocket: true
      });

      expect((global as any).WebSocket).toBeDefined();
      expect(env.mocks.get('WebSocket')).toBeDefined();
    });

    test('should setup localStorage mocks when configured', async () => {
      const env = await TestEnvironmentManager.createEnvironment('storage-env', {
        mockLocalStorage: true
      });

      const mockStorage = env.mocks.get('localStorage');
      expect(mockStorage).toBeDefined();
      expect(mockStorage.getItem).toBeInstanceOf(Function);
      expect(mockStorage.setItem).toBeInstanceOf(Function);
    });

    test('should cleanup environments properly', async () => {
      const env = await TestEnvironmentManager.createEnvironment('cleanup-test', {
        mockLocalStorage: true
      });

      expect(TestEnvironmentManager.getEnvironment('cleanup-test')).toBeDefined();

      await TestEnvironmentManager.cleanupEnvironment('cleanup-test');

      expect(TestEnvironmentManager.getEnvironment('cleanup-test')).toBeUndefined();
    });
  });

  describe('ComponentTestingUtils', () => {
    test('should get viewport dimensions correctly', () => {
      const mobileResult = ComponentTestingUtils.testResponsive(
        React.createElement('div', null, 'Test'),
        ['mobile']
      );

      expect(mobileResult).toHaveLength(1);
      expect(mobileResult[0].viewport).toBe('mobile');
      expect(mobileResult[0].dimensions.width).toBe(375);
      expect(mobileResult[0].dimensions.height).toBe(667);
    });

    test('should test component performance', async () => {
      const TestComponent = () => React.createElement('div', null, 'Performance Test');
      
      const result = await ComponentTestingUtils.testPerformance(
        React.createElement(TestComponent),
        { iterations: 3, measureRender: true }
      );

      expect(result.iterations).toBe(3);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageRenderTime).toBeGreaterThan(0);
      expect(result.minRenderTime).toBeGreaterThanOrEqual(0);
      expect(result.maxRenderTime).toBeGreaterThanOrEqual(result.minRenderTime);
    });
  });

  describe('AsyncTestingUtils', () => {
    test('should wait for condition with success', async () => {
      let conditionMet = false;
      
      setTimeout(() => {
        conditionMet = true;
      }, 100);

      const result = await AsyncTestingUtils.waitForCondition(
        () => conditionMet,
        { timeout: 1000, interval: 50 }
      );

      expect(result).toBe(true);
    });

    test('should timeout when condition is not met', async () => {
      await expect(
        AsyncTestingUtils.waitForCondition(
          () => false,
          { timeout: 100, interval: 25 }
        )
      ).rejects.toThrow('Condition not met within 100ms');
    });

    test('should wait for element to appear', async () => {
      let element: HTMLElement | null = null;
      
      setTimeout(() => {
        element = document.createElement('div');
      }, 50);

      const result = await AsyncTestingUtils.waitForElement(
        () => element,
        { timeout: 1000 }
      );

      expect(result).toBe(element);
    });

    test('should handle delays correctly', async () => {
      const start = Date.now();
      await AsyncTestingUtils.delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95); // Allow for slight timing variations
    });

    test('should handle timeout scenarios', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 1000));

      await expect(
        AsyncTestingUtils.withTimeout(slowPromise, 100, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message');
    });
  });

  describe('MockDataUtils', () => {
    test('should create mock user with defaults', () => {
      const user = MockDataUtils.createMockUser();

      expect(user.id).toMatch(/^user-\d+-[a-z0-9]+$/);
      expect(user.email).toBe('test.user@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
      expect(user.preferences).toEqual({
        theme: 'light',
        notifications: true
      });
    });

    test('should create mock user with overrides', () => {
      const overrides = {
        name: 'Custom User',
        role: 'admin',
        isActive: false
      };

      const user = MockDataUtils.createMockUser(overrides);

      expect(user.name).toBe('Custom User');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(false);
      expect(user.email).toBe('test.user@example.com'); // Should keep default
    });

    test('should create mock graph with default structure', () => {
      const graph = MockDataUtils.createMockGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      expect(graph.nodes[0].id).toBe('node-1');
      expect(graph.nodes[0].type).toBe('WeightedChoice');
      expect(graph.nodes[1].type).toBe('Output');
      expect(graph.edges[0].source).toBe('node-1');
      expect(graph.edges[0].target).toBe('node-2');
    });

    test('should create mock API response', () => {
      const data = { message: 'success', count: 5 };
      const response = MockDataUtils.createMockApiResponse(data, {
        status: 201,
        delay: 100
      });

      expect(response.data).toEqual(data);
      expect(response.status).toBe(201);
      expect(response.delay).toBe(100);
      expect(response.headers['content-type']).toBe('application/json');
    });

    test('should create batch of mock data', () => {
      const batch = MockDataUtils.createBatch(
        (index) => ({ id: index, name: `Item ${index}` }),
        5
      );

      expect(batch).toHaveLength(5);
      expect(batch[0]).toEqual({ id: 0, name: 'Item 0' });
      expect(batch[4]).toEqual({ id: 4, name: 'Item 4' });
    });
  });

  describe('PerformanceTestingUtils', () => {
    test('should measure execution time', async () => {
      const testFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const measurement = await PerformanceTestingUtils.measureExecution(
        testFunction,
        3
      );

      expect(measurement.result).toBe('result');
      expect(measurement.iterations).toBe(3);
      expect(measurement.measurements).toHaveLength(3);
      expect(measurement.totalTime).toBeGreaterThan(150); // 3 * 50ms minimum
      expect(measurement.averageTime).toBeGreaterThan(50);
      expect(measurement.minTime).toBeGreaterThan(0);
      expect(measurement.maxTime).toBeGreaterThanOrEqual(measurement.minTime);
    });

    test('should create and use performance benchmark', async () => {
      const benchmark = PerformanceTestingUtils.createBenchmark('test-bench');

      expect(benchmark.name).toBe('test-bench');

      // Test a quick operation
      const timer1 = benchmark.start('operation1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const duration1 = timer1.end();

      // Test another operation
      const timer2 = benchmark.start('operation2');
      await new Promise(resolve => setTimeout(resolve, 20));
      const duration2 = timer2.end();

      const results = benchmark.getResults();

      expect(results.operation1).toBeDefined();
      expect(results.operation1.count).toBe(1);
      expect(results.operation1.total).toBeCloseTo(duration1, 1);
      expect(results.operation1.average).toBeCloseTo(duration1, 1);

      expect(results.operation2).toBeDefined();
      expect(results.operation2.count).toBe(1);
      expect(results.operation2.total).toBeCloseTo(duration2, 1);
    });

    test('should measure memory usage', async () => {
      const testFunction = () => {
        // Create some objects to use memory
        const largeArray = new Array(1000).fill('test');
        return largeArray.length;
      };

      const measurement = await PerformanceTestingUtils.measureMemoryUsage(testFunction);

      expect(measurement.result).toBe(1000);
      expect(measurement.memoryBefore).toBeGreaterThanOrEqual(0);
      expect(measurement.memoryAfter).toBeGreaterThanOrEqual(0);
      expect(measurement.memoryDelta).toBeDefined();
    });
  });
});