/**
 * Global Jest Setup
 *
 * Runs once before all test suites.
 * Sets up global test environment and infrastructure.
 */

module.exports = async function globalSetup() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.SKIP_ENV_VALIDATION = 'true';

  // Initialize any global test state
  console.log('🔧 Setting up global test environment...');

  // You can add global setup logic here if needed
  // For example, starting external services, setting up test databases, etc.
};
