/**
 * Tests for Testing Utilities
 * Validates the testing utilities created for Epic 18
 */

import React from 'react';
import {
  TestEnvironmentManager,
  TestDataUtils,
  TestAssertionHelpers,
  MockFactory,
  PerformanceTestUtils
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

      const env = await TestEnvironmentManager.createEnvironment(
        'test-env',
        config
      );

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
      const env = await TestEnvironmentManager.createEnvironment(
        'react-flow-env',
        {
          mockReactFlow: true
        }
      );

      const reactFlowMock = env.mocks.get('reactFlow');
      expect(reactFlowMock).toBeDefined();
      expect(typeof reactFlowMock.useReactFlow).toBe('function');
      expect(typeof reactFlowMock.useNodesState).toBe('function');
      expect(typeof reactFlowMock.useEdgesState).toBe('function');
    });

    test('should setup WebSocket mocks when configured', async () => {
      const env = await TestEnvironmentManager.createEnvironment(
        'websocket-env',
        {
          mockWebSocket: true
        }
      );

      expect((global as any).WebSocket).toBeDefined();
      expect(env.mocks.get('WebSocket')).toBeDefined();
    });

    test('should setup localStorage mocks when configured', async () => {
      const env = await TestEnvironmentManager.createEnvironment(
        'storage-env',
        {
          mockLocalStorage: true
        }
      );

      const mockStorage = env.mocks.get('localStorage');
      expect(mockStorage).toBeDefined();
      expect(typeof mockStorage.getItem).toBe('function');
      expect(typeof mockStorage.setItem).toBe('function');
    });

    test('should cleanup environments properly', async () => {
      const env = await TestEnvironmentManager.createEnvironment(
        'cleanup-test',
        {
          mockLocalStorage: true
        }
      );

      expect(
        TestEnvironmentManager.getEnvironment('cleanup-test')
      ).toBeDefined();

      await TestEnvironmentManager.cleanupEnvironment('cleanup-test');

      expect(
        TestEnvironmentManager.getEnvironment('cleanup-test')
      ).toBeUndefined();
    });
  });

  describe('TestDataUtils', () => {
    test('should generate deterministic data with seed', () => {
      const dataUtils = new TestDataUtils('test-123');

      const id1 = dataUtils.generateId('test');
      const id2 = dataUtils.generateId('test');

      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
      expect(id1).not.toBe(id2); // Should be different due to timestamp
    });

    test('should generate consistent email addresses', () => {
      const dataUtils = new TestDataUtils('test-email');

      const email = dataUtils.generateEmail();

      expect(email).toMatch(/^[a-z0-9]+@example\.com$/);
      expect(email.length).toBeGreaterThan(10);
    });
  });

  describe('TestAssertionHelpers', () => {
    test('should wait for condition with success', async () => {
      let conditionMet = false;

      setTimeout(() => {
        conditionMet = true;
      }, 100);

      await TestAssertionHelpers.waitForCondition(() => conditionMet, 1000, 50);
    });

    test('should timeout when condition is not met', async () => {
      await expect(
        TestAssertionHelpers.waitForCondition(() => false, 100, 25)
      ).rejects.toThrow('Condition not met within 100ms');
    });

    test('should handle delays correctly', async () => {
      const start = Date.now();
      await TestAssertionHelpers.delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95); // Allow for slight timing variations
    });

    test('should test deep equality', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const obj3 = { a: 1, b: { c: 3 } };

      expect(() =>
        TestAssertionHelpers.expectDeepEqual(obj1, obj2)
      ).not.toThrow();
      expect(() => TestAssertionHelpers.expectDeepEqual(obj1, obj3)).toThrow();
    });

    test('should test approximate equality', () => {
      expect(() =>
        TestAssertionHelpers.expectApproximately(10, 10.1, 0.2)
      ).not.toThrow();
      expect(() =>
        TestAssertionHelpers.expectApproximately(10, 11, 0.5)
      ).toThrow();
    });

    test('should handle expectToThrowAsync', async () => {
      const throwingFunction = async () => {
        throw new Error('Test error message');
      };

      await TestAssertionHelpers.expectToThrowAsync(
        throwingFunction,
        'Test error message'
      );
    });
  });

  describe('MockFactory', () => {
    test('should create mock user with defaults', () => {
      const user = MockFactory.createMockUser();

      expect(user.id).toBe('mock-user-id');
      expect(user.email).toBe('mock@example.com');
      expect(user.name).toBe('Mock User');
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
    });

    test('should create mock user with overrides', () => {
      const overrides = {
        name: 'Custom User',
        role: 'admin',
        isActive: false
      };

      const user = MockFactory.createMockUser(overrides);

      expect(user.name).toBe('Custom User');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(false);
      expect(user.email).toBe('mock@example.com'); // Should keep default
    });

    test('should create mock graph with default structure', () => {
      const graph = MockFactory.createMockGraph();

      expect(graph.id).toBe('mock-graph-id');
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.name).toBe('Mock Graph');
      expect(graph.description).toBe('A mock graph for testing');
      expect(graph.createdAt).toBeDefined();
    });

    test('should create mock API response', () => {
      const data = { message: 'success', count: 5 };
      const response = MockFactory.createMockAPIResponse(data, 201);

      expect(response.data).toEqual(data);
      expect(response.status).toBe(201);
      expect(response.ok).toBe(true);
      expect(response.headers).toEqual({});
      expect(response.statusText).toBe('Error');
    });

    test('should create mock nodes and edges', () => {
      const node = MockFactory.createMockNode('WeightedChoice');
      const edge = MockFactory.createMockEdge('node1', 'node2');

      expect(node.type).toBe('WeightedChoice');
      expect(node.id).toMatch(/^mock-node-\d+$/);
      expect(node.position).toEqual({ x: 0, y: 0 });

      expect(edge.id).toBe('edge-node1-node2');
      expect(edge.source).toBe('node1');
      expect(edge.target).toBe('node2');
      expect(edge.type).toBe('default');
    });
  });

  describe('PerformanceTestUtils', () => {
    test('should measure execution time', async () => {
      const testFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const measurement = await PerformanceTestUtils.measureExecution(
        testFunction,
        'testFunction'
      );

      expect(measurement.result).toBe('result');
      expect(measurement.executionTime).toBeGreaterThan(50); // 50ms minimum
      expect(measurement.memoryUsage).toBeDefined();
      expect(measurement.memoryUsage.baseline).toBeGreaterThan(0);
      expect(measurement.memoryUsage.peak).toBeGreaterThan(0);
    });

    test('should generate load test configuration', () => {
      const loadTest = PerformanceTestUtils.generateLoadTest(5, 20);

      expect(loadTest.concurrency).toBe(5);
      expect(loadTest.iterations).toBe(20);
      expect(loadTest.totalOperations).toBe(100); // 5 * 20
    });
  });
});
