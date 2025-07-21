/**
 * Global Jest Teardown
 *
 * Runs once after all test suites.
 * Cleans up global test resources and infrastructure.
 */

module.exports = async function globalTeardown() {
  console.log('🧹 Cleaning up global test environment...');

  // Cleanup any global resources here
  // For example, stopping external services, cleaning up test databases, etc.
};
