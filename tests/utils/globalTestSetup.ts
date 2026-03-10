/**
 * Global Test Setup for Epic 18 Testing Infrastructure
 * Initializes custom matchers and global test utilities
 */

import './sharedTestSetup';
import { TestEnvironmentManager } from './TestingUtilities';

// Global setup for all tests
beforeEach(() => {
  // Clear any existing test environments
  TestEnvironmentManager.cleanupAll();
});

// Global cleanup after all tests
afterAll(() => {
  TestEnvironmentManager.cleanupAll();
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
