/**
 * Global Test Setup for Epic 18 Testing Infrastructure
 * Initializes custom matchers and global test utilities
 */

import { registerCustomMatchers } from './CustomMatchers';
import { TestEnvironmentManager } from './TestingUtilities';

// Register custom Jest matchers
registerCustomMatchers();

// Global setup for all tests
beforeEach(() => {
  // Clear any existing test environments
  TestEnvironmentManager.cleanupAll();
});

// Global cleanup after all tests
afterAll(() => {
  TestEnvironmentManager.cleanupAll();
});

// Increase timeout for async tests
jest.setTimeout(15000);

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Suppress console.log in tests unless explicitly needed
    log: jest.fn<unknown[], unknown>(),
    debug: jest.fn<unknown[], unknown>(),
    info: jest.fn<unknown[], unknown>(),
    warn: jest.fn<unknown[], unknown>(),
    error: jest.fn<unknown[], unknown>()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global test utilities available in all tests
(global as Record<string, unknown>).testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  createMockGraph: (overrides = {}) => ({
    nodes: [],
    edges: [],
    ...overrides
  }),
  
  waitFor: (condition: () => boolean, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

export {};