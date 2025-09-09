/**
 * Setup Custom Jest Matchers
 * Automatically imports and registers all custom matchers for tests
 */

import { registerCustomMatchers } from './CustomMatchers';
import { TestEnvironmentManager } from './TestingUtilities';

// Register custom Jest matchers
registerCustomMatchers();

// Setup global test environment
beforeAll(async () => {
  // Initialize test environment if not already done
  await TestEnvironmentManager.setupEnvironment('default', {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error'
  });
});

// Cleanup after all tests
afterAll(async () => {
  await TestEnvironmentManager.cleanupAll();
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds

// Suppress console.error in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning') ||
      process.env.SHOW_TEST_ERRORS === 'true'
    ) {
      originalError(...args);
    }
  };
});

afterAll(() => {
  console.error = originalError;
});
