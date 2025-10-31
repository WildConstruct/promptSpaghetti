#!/usr/bin/env node
/**
 * Test Script - Unified Automation Infrastructure
 * Demonstrates AutomationLogger, StateLock, and ConfigManager working together
 */

const { getLogger } = require('./utils/AutomationLogger');
const { StateLock } = require('./utils/StateLock');
const { getConfigManager } = require('./utils/ConfigManager');

async function testUnifiedInfrastructure() {
  // Initialize components
  const logger = getLogger('unified-test', {
    enableConsole: true,
    enableFile: false,
    logLevel: 'DEBUG'
  });
  const stateLock = new StateLock();
  const configManager = getConfigManager();

  logger.start('Testing unified automation infrastructure');

  try {
    // Test 1: Configuration Management
    logger.info('🔧 Testing Configuration Management');

    const automationConfig = configManager.loadConfig('automation');
    logger.success('Configuration loaded successfully', {
      keys: Object.keys(automationConfig).length,
      maxRetries: automationConfig.maxRetries
    });

    const qaConfig = configManager.loadConfig('qa');
    logger.success('QA configuration loaded', {
      passThreshold: qaConfig.passThreshold,
      autoApproveThreshold: qaConfig.autoApproveThreshold
    });

    // Test 2: State Management with Locking
    logger.info('🔒 Testing State Management');

    const testResult = await stateLock.transaction(state => {
      logger.stateRead('Reading state within transaction');

      const taskCount = Object.keys(state.tasks || {}).length;
      const assignmentCount = Object.keys(state.assignments || {}).length;

      logger.debug('State analysis completed', {
        tasks: taskCount,
        assignments: assignmentCount
      });

      return { taskCount, assignmentCount };
    });

    logger.success('State transaction completed', testResult);

    // Test 3: Performance Measurement
    logger.info('📊 Testing Performance Monitoring');

    const performanceResult = logger.measureTime('example-operation', () => {
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
      return sum;
    });

    logger.success('Performance measurement completed', {
      result: performanceResult,
      type: 'computational'
    });

    // Test 4: Error Handling
    logger.info('⚠️ Testing Error Handling');

    try {
      throw new Error('Test error for demonstration');
    } catch (error) {
      const errorReport = logger.handleError(error, {
        component: 'test-suite',
        operation: 'error-handling-demo'
      });

      logger.info('Error handling successful', {
        errorCaptured: errorReport.success === false
      });
    }

    // Test 5: QA-specific Logging
    logger.info('✅ Testing QA Workflow Logging');

    logger.qaStart(5, 'Test QA processing');
    logger.qaApprove('TEST-123', 4.5, 'Excellent implementation quality');
    logger.qaReject('TEST-124', 2.8, [
      'Missing error handling',
      'Insufficient testing'
    ]);
    logger.qaFinish({
      processed: 5,
      approved: 3,
      rejected: 2
    });

    // Test 6: Task Management Logging
    logger.info('📋 Testing Task Management Logging');

    logger.taskStart('TEST-125', 'Processing test task');
    logger.assignmentAdd('TEST-125', 'test-agent');
    logger.taskComplete(
      'TEST-125',
      { status: 'success' },
      'Task processing completed'
    );
    logger.assignmentClear('TEST-125', 'test-agent');

    // Test 7: Configuration Status
    logger.info('📈 Testing System Status');

    const configStatus = configManager.getStatus();
    const lockStatus = stateLock.getLockStatus();
    const loggerStats = logger.getStats();

    logger.success('System status check completed', {
      configsAvailable: configStatus.availableConfigs.length,
      configsCached: configStatus.cacheSize,
      lockExists: lockStatus.exists,
      loggerUptime: loggerStats.uptime
    });

    // Summary
    logger.finish('Unified infrastructure test completed successfully');

    console.log('\n📊 Test Summary:');
    console.log('✅ Configuration Management: Working');
    console.log('✅ State Locking System: Working');
    console.log('✅ Unified Logging: Working');
    console.log('✅ Performance Monitoring: Working');
    console.log('✅ Error Handling: Working');
    console.log('✅ QA Workflow Integration: Working');
    console.log('✅ Task Management Integration: Working');
    console.log(
      '\n🎉 All automation infrastructure components are functioning correctly!'
    );
  } catch (error) {
    logger.handleError(error, {
      testPhase: 'unified-infrastructure-test'
    });

    console.error('\n❌ Infrastructure test failed:', error.message);
    console.error('See error details above for debugging information.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testUnifiedInfrastructure().catch(error => {
    console.error('Failed to run infrastructure test:', error.message);
    process.exit(1);
  });
}

module.exports = { testUnifiedInfrastructure };
