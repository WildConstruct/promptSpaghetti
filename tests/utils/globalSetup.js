/**
 * Global Setup for Jest Test Environment
 * Runs before all test suites
 */

module.exports = async () => {
  // Setup global test environment
  console.log('🚀 Setting up Epic 18 testing environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST_ENVIRONMENT = 'node';

  // Disable console output in tests unless explicitly enabled
  if (!process.env.JEST_VERBOSE) {
    const originalConsole = console;
    global.testConsole = originalConsole;

    console.log = () => undefined;
    console.info = () => undefined;
    console.debug = () => undefined;
    console.warn = () => undefined;
    console.error = () => undefined;
  }

  console.log('✅ Epic 18 testing environment ready');
};
