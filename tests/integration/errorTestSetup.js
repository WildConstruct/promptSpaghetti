/**
 * Error Test Setup for Epic 18 Integration Tests
 * Initializes error reporting and enhanced test feedback mechanisms
 */

const { EnhancedErrorReporter } = require('../utils/ErrorReportingFramework');
const path = require('path');
const fs = require('fs');

// Initialize global error reporter
const errorReporter = new EnhancedErrorReporter(
  path.join(process.cwd(), 'test-reports', 'errors')
);

// Make error reporter globally available
global.__errorReporter = errorReporter;
global.__testStartTime = Date.now();
global.__testMetrics = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  totalDuration: 0,
  errors: []
};

// Enhanced error handling
const originalConsoleError = console.error;
console.error = (...args) => {
  // Capture console errors for reporting
  if (global.__currentTestContext) {
    const error = new Error(args.join(' '));
    errorReporter.reportError(error, global.__currentTestContext, {
      tags: ['console-error'],
      actualBehavior: args.join(' ')
    });
  }
  return originalConsoleError.apply(console, args);
};

// Capture unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));

  if (global.__currentTestContext) {
    errorReporter.reportError(error, global.__currentTestContext, {
      tags: ['unhandled-rejection'],
      metadata: {
        promise: promise.toString(),
        reason: String(reason)
      }
    });
  }

  console.error('Unhandled Promise Rejection:', reason);
});

// Capture uncaught exceptions
process.on('uncaughtException', error => {
  if (global.__currentTestContext) {
    errorReporter.reportError(error, global.__currentTestContext, {
      tags: ['uncaught-exception'],
      severity: 'critical'
    });
  }

  console.error('Uncaught Exception:', error);
  // Don't exit in test environment - let Jest handle it
});

// Jest hooks for error tracking
beforeEach(function () {
  const testName = expect.getState().currentTestName;
  const testPath = expect.getState().testPath;

  global.__currentTestContext = {
    testSuite: path.basename(testPath, '.test.ts'),
    testCase: testName,
    timestamp: new Date().toISOString(),
    environment: 'integration-test',
    executionId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  };

  global.__testMetrics.totalTests++;
});

afterEach(function () {
  const testState = expect.getState();
  const testName = testState.currentTestName;
  const testPath = testState.testPath;

  // Record test completion
  if (global.__currentTestContext) {
    const testFeedback = {
      testId: global.__currentTestContext.executionId,
      status: 'passed', // Will be updated if test failed
      duration:
        Date.now() - new Date(global.__currentTestContext.timestamp).getTime(),
      assertions: {
        total: testState.assertionCalls || 0,
        passed: testState.assertionCalls || 0,
        failed: 0
      },
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      },
      performance: {
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage().user,
        networkRequests: 0
      },
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Update global metrics
    global.__testMetrics.passedTests++;
    global.__testMetrics.totalDuration += testFeedback.duration;

    errorReporter.reportTestResult(testFeedback);
  }

  global.__currentTestContext = null;
});

// Handle test failures
const originalIt = global.it;
global.it = function (name, fn, timeout) {
  const wrappedFn = async function (...args) {
    try {
      const result = await fn.apply(this, args);
      return result;
    } catch (error) {
      // Record test failure
      if (global.__currentTestContext) {
        global.__testMetrics.passedTests--;
        global.__testMetrics.failedTests++;

        errorReporter.reportError(error, global.__currentTestContext, {
          tags: ['test-failure'],
          reproducible: true,
          actualBehavior: error.message,
          expectedBehavior: 'Test should pass without errors'
        });
      }
      throw error;
    }
  };

  return originalIt.call(this, name, wrappedFn, timeout);
};

// Handle skipped tests
const originalItSkip = global.it.skip;
global.it.skip = function (name, fn) {
  global.__testMetrics.skippedTests++;
  return originalItSkip.call(this, name, fn);
};

// Performance monitoring utilities
global.measurePerformance = function (name, fn) {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  const result = fn();

  const endTime = process.hrtime.bigint();
  const endMemory = process.memoryUsage();

  const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

  console.log(
    `Performance [${name}]: ${duration.toFixed(2)}ms, Memory: ${memoryDelta} bytes`
  );

  return { result, duration, memoryDelta };
};

// Network request monitoring
global.networkMonitor = {
  requests: [],

  record: function (url, method, duration, status) {
    this.requests.push({
      url,
      method,
      duration,
      status,
      timestamp: new Date().toISOString()
    });
  },

  getRequests: function () {
    return [...this.requests];
  },

  clear: function () {
    this.requests = [];
  },

  getTotalDuration: function () {
    return this.requests.reduce((total, req) => total + req.duration, 0);
  }
};

// Memory leak detection
global.detectMemoryLeaks = function (threshold = 50 * 1024 * 1024) {
  // 50MB default
  const usage = process.memoryUsage();

  if (usage.heapUsed > threshold) {
    const warning = `Potential memory leak detected: ${Math.round(usage.heapUsed / 1024 / 1024)}MB heap used`;

    if (global.__currentTestContext) {
      errorReporter.reportError(
        new Error(warning),
        global.__currentTestContext,
        {
          tags: ['memory-leak', 'performance'],
          severity: 'medium',
          metadata: {
            memoryUsage: usage,
            threshold
          }
        }
      );
    }

    console.warn(warning);
    return true;
  }

  return false;
};

// Resource cleanup utilities
global.cleanupResources = function () {
  // Clear network monitor
  global.networkMonitor.clear();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  // Clear any timers
  const timerId = setTimeout(() => {}, 0);
  for (let i = 0; i < timerId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
};

// Test environment validation
global.validateTestEnvironment = function () {
  const requiredEnvVars = ['NODE_ENV'];
  const missing = requiredEnvVars.filter(env => !process.env[env]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Ensure test isolation
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Warning: Not running in test environment');
  }

  return true;
};

// Error scenario helpers
global.simulateError = function (type, message = 'Simulated error') {
  const errorTypes = {
    network: () => {
      const error = new Error(message);
      error.code = 'ECONNREFUSED';
      return error;
    },
    timeout: () => {
      const error = new Error('Request timeout');
      error.code = 'ETIMEDOUT';
      return error;
    },
    validation: () => {
      const error = new Error('Validation failed: ' + message);
      error.name = 'ValidationError';
      return error;
    },
    auth: () => {
      const error = new Error('Authentication failed');
      error.status = 401;
      return error;
    },
    server: () => {
      const error = new Error('Internal server error');
      error.status = 500;
      return error;
    }
  };

  const errorFactory = errorTypes[type];
  if (!errorFactory) {
    throw new Error(`Unknown error type: ${type}`);
  }

  return errorFactory();
};

// Retry utilities for flaky tests
global.retry = async function (fn, attempts = 3, delay = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;

      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Cleanup on test completion
afterAll(async () => {
  console.log('\n=== Integration Test Summary ===');
  console.log(`Total Tests: ${global.__testMetrics.totalTests}`);
  console.log(`Passed: ${global.__testMetrics.passedTests}`);
  console.log(`Failed: ${global.__testMetrics.failedTests}`);
  console.log(`Skipped: ${global.__testMetrics.skippedTests}`);
  console.log(
    `Total Duration: ${(global.__testMetrics.totalDuration / 1000).toFixed(2)}s`
  );

  // Generate error analytics
  const analytics = errorReporter.generateAnalytics();
  console.log('\nError Analytics:');
  console.log(`- Total Errors: ${analytics.totalErrors}`);
  console.log(
    `- Error Rate: ${((analytics.totalErrors / global.__testMetrics.totalTests) * 100).toFixed(2)}%`
  );

  if (analytics.totalErrors > 0) {
    console.log(
      '- Top Error Types:',
      Object.entries(analytics.errorsByType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => `${type}(${count})`)
        .join(', ')
    );
  }

  // Export final report
  const reportPath = errorReporter.exportReports('json');
  console.log(`\nDetailed error report saved: ${reportPath}`);

  // Cleanup
  global.cleanupResources();

  console.log('=================================\n');
});
