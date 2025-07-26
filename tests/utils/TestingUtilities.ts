/**
 * Testing Utilities for Epic 18 Testing Infrastructure
 * Provides comprehensive utility functions for test environment management
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * Test Environment Manager
 * Manages isolated test environments and cleanup
 */
export class TestEnvironmentManager {
  private static environments: Map<string, any> = new Map();
  private static cleanup: Map<string, () => Promise<void>> = new Map();

  static async setupEnvironment(name: string, config: Record<string, any>): Promise<void> {
    this.environments.set(name, config);
    
    // Setup environment variables
    for (const [key, value] of Object.entries(config)) {
      process.env[key] = String(value);
    }
  }

  static async createEnvironment(name: string, config: Record<string, any>): Promise<any> {
    // Create comprehensive environment object with mocks and fixtures
    const environment = {
      name,
      config,
      fixtures: new Map(),
      mocks: new Map(),
      cleanup: async () => {
        await this.cleanupEnvironment(name);
      },
      createdAt: Date.now()
    };

    // Setup ReactFlow mocks if configured
    if (config.mockReactFlow) {
      environment.mocks.set('reactFlow', {
        useReactFlow: jest.fn(() => ({
          getNode: jest.fn<unknown[], unknown>(),
          getNodes: jest.fn(() => []),
          getEdges: jest.fn(() => []),
          setNodes: jest.fn<unknown[], unknown>(),
          setEdges: jest.fn<unknown[], unknown>()
        })),
        useNodesState: jest.fn(() => [[], jest.fn<unknown[], unknown>()]),
        useEdgesState: jest.fn(() => [[], jest.fn<unknown[], unknown>()])
      });
    }

    // Setup WebSocket mocks if configured
    if (config.mockWebSocket) {
      const WebSocketMock = jest.fn<unknown[], unknown>().mockImplementation(() => ({
        send: jest.fn<unknown[], unknown>(),
        close: jest.fn<unknown[], unknown>(),
        addEventListener: jest.fn<unknown[], unknown>(),
        removeEventListener: jest.fn<unknown[], unknown>()
      }));
      
      environment.mocks.set('WebSocket', WebSocketMock);
      Object.defineProperty(global, 'WebSocket', { value: WebSocketMock });
    }

    // Setup localStorage mocks if configured
    if (config.mockLocalStorage) {
      const localStorageMock = {
        getItem: jest.fn<unknown[], unknown>(),
        setItem: jest.fn<unknown[], unknown>(),
        removeItem: jest.fn<unknown[], unknown>(),
        clear: jest.fn<unknown[], unknown>()
      };
      environment.mocks.set('localStorage', localStorageMock);
      Object.defineProperty(global, 'localStorage', { value: localStorageMock });
    }

    this.environments.set(name, environment);
    return environment;
  }

  static getEnvironment(name: string): unknown {
    return this.environments.get(name);
  }

  static async cleanupEnvironment(name: string): Promise<void> {
    const cleanup = this.cleanup.get(name);
    if (cleanup) {
      await cleanup();
      this.cleanup.delete(name);
    }
    
    const config = this.environments.get(name);
    if (config) {
      // Cleanup environment variables
      for (const key of Object.keys(config)) {
        delete process.env[key];
      }
      this.environments.delete(name);
    }
  }

  static async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.cleanup.values()).map(fn => fn());
    await Promise.all(cleanupPromises);
    
    this.environments.clear();
    this.cleanup.clear();
  }

  static listEnvironments(): string[] {
    return Array.from(this.environments.keys());
  }

  static registerCleanup(name: string, cleanupFn: () => Promise<void>): void {
    this.cleanup.set(name, cleanupFn);
  }
}

/**
 * Test Data Generator Utilities
 * Provides deterministic test data generation
 */
export class TestDataUtils {
  private seed: string;
  private counter: number = 0;
  
  constructor(seed: string = 'test-seed-123') {
    this.seed = seed;
  }

  setSeed(seed: string): void {
    this.seed = seed;
  }

  generateId(prefix: string = 'test'): string {
    this.counter++;
    const hash = this.simpleHash(this.seed + this.counter);
    return `${prefix}-${hash}`;
  }

  generateEmail(domain: string = 'example.com'): string {
    const username = this.generateString(8);
    return `${username}@${domain}`;
  }

  generateString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const seedNum = this.simpleHash(this.seed);
    
    for (let i = 0; i < length; i++) {
      const index = (seedNum + i) % chars.length;
      result += chars[index];
    }
    
    return result;
  }

  generateNumber(min: number = 0, max: number = 100): number {
    const seedNum = this.simpleHash(this.seed);
    const normalized = seedNum / 1000000;
    return Math.floor(min + (normalized % (max - min + 1)));
  }

  generateBoolean(): boolean {
    return this.generateNumber(0, 1) === 1;
  }

  generateArray<T>(generator: () => T, count: number = 5): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      this.seed = this.seed + i; // Vary seed for each element
      result.push(generator());
    }
    return result;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Test File Management Utilities
 */
export class TestFileUtils {
  private static testDir = join(process.cwd(), 'test-temp');

  static setupTestDirectory(): string {
    if (!existsSync(this.testDir)) {
      mkdirSync(this.testDir, { recursive: true });
    }
    return this.testDir;
  }

  static cleanupTestDirectory(): void {
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
  }

  static createTestFile(filename: string, content: string): string {
    this.setupTestDirectory();
    const filepath = join(this.testDir, filename);
    writeFileSync(filepath, content, 'utf8');
    return filepath;
  }

  static readTestFile(filename: string): string {
    const filepath = join(this.testDir, filename);
    if (!existsSync(filepath)) {
      throw new Error(`Test file not found: ${filepath}`);
    }
    return readFileSync(filepath, 'utf8');
  }

  static deleteTestFile(filename: string): void {
    const filepath = join(this.testDir, filename);
    if (existsSync(filepath)) {
      rmSync(filepath);
    }
  }
}

/**
 * Test Assertion Helpers
 */
export class TestAssertionHelpers {
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await Promise.resolve(condition());
      if (result) {
        return;
      }
      await this.delay(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async expectToThrowAsync(
    fn: () => Promise<any>,
    expectedError?: string | RegExp
  ): Promise<void> {
    let thrown = false;
    try {
      await fn();
    } catch (error) {
      thrown = true;
      if (expectedError) {
        const message = error instanceof Error ? error.message : String(error);
        if (typeof expectedError === 'string') {
          expect(message).toContain(expectedError);
        } else {
          expect(message).toMatch(expectedError);
        }
      }
    }
    
    if (!thrown) {
      throw new Error('Expected function to throw, but it did not');
    }
  }

  static expectDeepEqual(actual: unknown, expected: unknown): void {
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
  }

  static expectApproximately(actual: number, expected: number, tolerance: number = 0.01): void {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  }
}

/**
 * Mock Factory for creating test mocks
 */
export class MockFactory {
  static createMockUser(overrides: Record<string, unknown> = {}): unknown {
    return {
      id: 'mock-user-id',
      email: 'mock@example.com',
      name: 'Mock User',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMockGraph(overrides: Record<string, unknown> = {}): unknown {
    return {
      id: 'mock-graph-id',
      nodes: [],
      edges: [],
      name: 'Mock Graph',
      description: 'A mock graph for testing',
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createMockNode(type: string = 'test', overrides: Record<string, unknown> = {}): unknown {
    return {
      id: `mock-node-${Date.now()}`,
      type,
      data: {},
      position: { x: 0, y: 0 },
      ...overrides
    };
  }

  static createMockEdge(source: string = 'node1', target: string = 'node2'): unknown {
    return {
      id: `edge-${source}-${target}`,
      source,
      target,
      type: 'default'
    };
  }

  static createMockAPIResponse(data: unknown = {}, status: number = 200): unknown {
    return {
      status,
      ok: status >= 200 && status < 300,
      data,
      headers: {},
      statusText: status === 200 ? 'OK' : 'Error'
    };
  }
}

/**
 * Performance Testing Utilities
 */
export class PerformanceTestUtils {
  static async measureExecution<T>(
    fn: () => Promise<T> | T,
    name: string = 'function'
  ): Promise<{ result: T; executionTime: number; memoryUsage: unknown }> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    const result = await Promise.resolve(fn());
    
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    const memoryUsage = {
      baseline: startMemory.heapUsed,
      peak: endMemory.heapUsed,
      average: (startMemory.heapUsed + endMemory.heapUsed) / 2,
      gcCount: 0, // Would need more sophisticated tracking
      gcTime: 0
    };
    
    return { result, executionTime, memoryUsage };
  }

  static generateLoadTest(
    concurrency: number = 10,
    iterations: number = 100
  ): { concurrency: number; iterations: number; totalOperations: number } {
    return {
      concurrency,
      iterations,
      totalOperations: concurrency * iterations
    };
  }
}

/**
 * Global test utilities available in all tests
 */
export const testUtils = {
  createMockUser: MockFactory.createMockUser,
  createMockGraph: MockFactory.createMockGraph,
  createMockNode: MockFactory.createMockNode,
  createMockEdge: MockFactory.createMockEdge,
  waitFor: TestAssertionHelpers.waitForCondition,
  delay: TestAssertionHelpers.delay,
  expectToThrowAsync: TestAssertionHelpers.expectToThrowAsync,
  expectDeepEqual: TestAssertionHelpers.expectDeepEqual,
  expectApproximately: TestAssertionHelpers.expectApproximately,
  measureExecution: PerformanceTestUtils.measureExecution,
  generateLoadTest: PerformanceTestUtils.generateLoadTest
};

// Export AsyncTestingUtils as an alias for TestAssertionHelpers to maintain compatibility
export const AsyncTestingUtils = TestAssertionHelpers;

// Make utilities available globally
declare global {
  var testUtils: typeof testUtils;
}

if (typeof global !== 'undefined') {
  global.testUtils = testUtils;
}

export default {
  TestEnvironmentManager,
  TestDataUtils,
  TestFileUtils,
  TestAssertionHelpers,
  MockFactory,
  PerformanceTestUtils,
  testUtils
};