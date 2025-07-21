/**
 * Global Teardown for Jest Test Environment
 * Runs after all test suites complete
 */

module.exports = async () => {
  // Restore console if it was modified
  if (global.testConsole) {
    console.log = global.testConsole.log;
    console.info = global.testConsole.info;
    console.debug = global.testConsole.debug;
    console.warn = global.testConsole.warn;
    console.error = global.testConsole.error;
  }
  
  // Clean up any global resources
  if (global.gc) {
    global.gc();
  }
  
  console.log('🧹 Epic 18 testing environment cleaned up');
};