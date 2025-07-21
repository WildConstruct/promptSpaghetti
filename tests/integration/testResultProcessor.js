/**
 * Custom Test Result Processor for Epic 18 Error Scenarios
 * Processes Jest test results and integrates with error reporting framework
 */

const fs = require('fs');
const path = require('path');

/**
 * Process test results and generate enhanced reports
 * @param {Object} results - Jest test results
 * @returns {Object} - Processed results
 */
function processResults(results) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(process.cwd(), 'test-reports');
  
  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Process test suite results
  const processedResults = {
    metadata: {
      timestamp,
      testRunId: `run-${Date.now()}`,
      environment: process.env.NODE_ENV || 'test',
      jestVersion: results.jestVersion || 'unknown',
      totalTime: results.runTime
    },
    summary: {
      numTotalTests: results.numTotalTests,
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      numPendingTests: results.numPendingTests,
      numTodoTests: results.numTodoTests,
      testRunTime: results.runTime,
      success: results.success
    },
    coverage: extractCoverageData(results),
    testSuites: [],
    errorAnalysis: {
      totalErrors: 0,
      errorsByType: {},
      criticalErrors: [],
      performanceIssues: [],
      flaky_tests: []
    },
    recommendations: []
  };

  // Process individual test suites
  results.testResults.forEach(testResult => {
    const suiteResult = processTestSuite(testResult);
    processedResults.testSuites.push(suiteResult);
    
    // Aggregate error analysis
    aggregateErrorAnalysis(processedResults.errorAnalysis, suiteResult);
  });

  // Generate recommendations based on results
  generateRecommendations(processedResults);

  // Save processed results
  const resultFilePath = path.join(reportDir, `processed-results-${Date.now()}.json`);
  fs.writeFileSync(resultFilePath, JSON.stringify(processedResults, null, 2));
  
  // Generate summary report
  generateSummaryReport(processedResults, reportDir);
  
  // Generate error trend analysis
  generateErrorTrendAnalysis(processedResults, reportDir);

  console.log(`\n📊 Enhanced test results saved to: ${resultFilePath}`);
  
  return results; // Return original results for Jest
}

/**
 * Process individual test suite
 */
function processTestSuite(testResult) {
  const suiteResult = {
    name: testResult.testFilePath,
    status: testResult.numFailingTests === 0 ? 'passed' : 'failed',
    duration: testResult.perfStats.end - testResult.perfStats.start,
    tests: {
      total: testResult.testResults.length,
      passed: testResult.testResults.filter(t => t.status === 'passed').length,
      failed: testResult.testResults.filter(t => t.status === 'failed').length,
      skipped: testResult.testResults.filter(t => t.status === 'pending').length
    },
    errors: [],
    performance: {
      slowTests: [],
      memoryUsage: null,
      avgTestDuration: 0
    },
    coverage: null
  };

  // Process individual tests
  let totalDuration = 0;
  testResult.testResults.forEach(test => {
    totalDuration += test.duration || 0;
    
    // Identify slow tests (>5 seconds)
    if ((test.duration || 0) > 5000) {
      suiteResult.performance.slowTests.push({
        name: test.title,
        duration: test.duration,
        fullName: test.fullName
      });
    }
    
    // Process test failures
    if (test.status === 'failed') {
      test.failureMessages.forEach(failure => {
        suiteResult.errors.push({
          testName: test.title,
          message: failure,
          type: classifyError(failure),
          severity: determineSeverity(failure),
          stack: extractStack(failure)
        });
      });
    }
  });

  suiteResult.performance.avgTestDuration = totalDuration / testResult.testResults.length;

  return suiteResult;
}

/**
 * Extract coverage data from results
 */
function extractCoverageData(results) {
  if (!results.coverageMap) {
    return null;
  }

  const coverage = {
    summary: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    files: []
  };

  // This would process the coverage map if available
  // For now, return basic structure
  return coverage;
}

/**
 * Classify error type based on error message
 */
function classifyError(errorMessage) {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('timeout') || message.includes('etimedout')) {
    return 'timeout';
  }
  if (message.includes('connection') || message.includes('network')) {
    return 'network';
  }
  if (message.includes('validation') || message.includes('schema')) {
    return 'validation';
  }
  if (message.includes('auth') || message.includes('unauthorized')) {
    return 'authentication';
  }
  if (message.includes('memory') || message.includes('heap')) {
    return 'memory';
  }
  if (message.includes('async') || message.includes('promise')) {
    return 'async';
  }
  
  return 'unknown';
}

/**
 * Determine error severity
 */
function determineSeverity(errorMessage) {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('critical') || message.includes('fatal') || message.includes('security')) {
    return 'critical';
  }
  if (message.includes('error') && (message.includes('server') || message.includes('system'))) {
    return 'high';
  }
  if (message.includes('timeout') || message.includes('connection')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Extract stack trace from error message
 */
function extractStack(errorMessage) {
  const lines = errorMessage.split('\n');
  const stackStart = lines.findIndex(line => line.trim().startsWith('at '));
  
  if (stackStart !== -1) {
    return lines.slice(stackStart, stackStart + 5).join('\n'); // First 5 stack lines
  }
  
  return null;
}

/**
 * Aggregate error analysis across test suites
 */
function aggregateErrorAnalysis(errorAnalysis, suiteResult) {
  suiteResult.errors.forEach(error => {
    errorAnalysis.totalErrors++;
    
    // Count by type
    errorAnalysis.errorsByType[error.type] = (errorAnalysis.errorsByType[error.type] || 0) + 1;
    
    // Track critical errors
    if (error.severity === 'critical') {
      errorAnalysis.criticalErrors.push({
        suite: suiteResult.name,
        test: error.testName,
        message: error.message
      });
    }
  });
  
  // Track performance issues
  suiteResult.performance.slowTests.forEach(slowTest => {
    errorAnalysis.performanceIssues.push({
      suite: suiteResult.name,
      test: slowTest.name,
      duration: slowTest.duration
    });
  });
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(results) {
  const recommendations = results.recommendations;
  
  // High failure rate recommendation
  const failureRate = results.summary.numFailedTests / results.summary.numTotalTests;
  if (failureRate > 0.1) { // >10% failure rate
    recommendations.push({
      type: 'stability',
      priority: 'high',
      title: 'High Test Failure Rate Detected',
      description: `${(failureRate * 100).toFixed(1)}% of tests are failing. Consider reviewing test stability and fixing fundamental issues.`,
      action: 'Review and fix failing tests, check for environmental issues'
    });
  }
  
  // Performance recommendations
  const slowTests = results.testSuites.reduce((acc, suite) => 
    acc + suite.performance.slowTests.length, 0);
  
  if (slowTests > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Slow Test Detection',
      description: `${slowTests} tests are running slower than 5 seconds. Consider optimizing these tests.`,
      action: 'Review slow tests and optimize by reducing setup time, using mocks, or splitting large tests'
    });
  }
  
  // Error pattern recommendations
  const topErrorType = Object.entries(results.errorAnalysis.errorsByType)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topErrorType && topErrorType[1] > 5) {
    const [type, count] = topErrorType;
    recommendations.push({
      type: 'error-pattern',
      priority: 'high',
      title: `Frequent ${type.charAt(0).toUpperCase() + type.slice(1)} Errors`,
      description: `${count} tests failed due to ${type} errors. This suggests a systemic issue.`,
      action: `Focus on fixing ${type} related issues. Consider improving error handling and resilience.`
    });
  }
  
  // Critical error recommendations
  if (results.errorAnalysis.criticalErrors.length > 0) {
    recommendations.push({
      type: 'critical',
      priority: 'critical',
      title: 'Critical Errors Detected',
      description: `${results.errorAnalysis.criticalErrors.length} critical errors found. These need immediate attention.`,
      action: 'Address critical errors immediately as they may indicate security or data integrity issues.'
    });
  }
}

/**
 * Generate summary report
 */
function generateSummaryReport(results, reportDir) {
  const summary = `
# Epic 18 Error Scenario Test Report

**Generated**: ${results.metadata.timestamp}
**Test Run ID**: ${results.metadata.testRunId}
**Environment**: ${results.metadata.environment}
**Total Runtime**: ${(results.summary.testRunTime / 1000).toFixed(2)}s

## Test Summary
- **Total Tests**: ${results.summary.numTotalTests}
- **Passed**: ${results.summary.numPassedTests} (${((results.summary.numPassedTests / results.summary.numTotalTests) * 100).toFixed(1)}%)
- **Failed**: ${results.summary.numFailedTests} (${((results.summary.numFailedTests / results.summary.numTotalTests) * 100).toFixed(1)}%)
- **Skipped**: ${results.summary.numPendingTests}
- **Overall Status**: ${results.summary.success ? '✅ PASSED' : '❌ FAILED'}

## Error Analysis
- **Total Errors**: ${results.errorAnalysis.totalErrors}
- **Critical Errors**: ${results.errorAnalysis.criticalErrors.length}
- **Performance Issues**: ${results.errorAnalysis.performanceIssues.length}

### Error Distribution
${Object.entries(results.errorAnalysis.errorsByType)
  .sort(([,a], [,b]) => b - a)
  .map(([type, count]) => `- **${type}**: ${count}`)
  .join('\n')}

## Recommendations
${results.recommendations.map(rec => `
### ${rec.title} (${rec.priority.toUpperCase()})
${rec.description}

**Action**: ${rec.action}
`).join('\n')}

## Test Suite Details
${results.testSuites.map(suite => `
### ${path.basename(suite.name)}
- **Status**: ${suite.status}
- **Duration**: ${(suite.duration / 1000).toFixed(2)}s
- **Tests**: ${suite.tests.passed}/${suite.tests.total} passed
- **Errors**: ${suite.errors.length}
- **Slow Tests**: ${suite.performance.slowTests.length}
`).join('\n')}
`;

  fs.writeFileSync(path.join(reportDir, 'test-summary.md'), summary);
}

/**
 * Generate error trend analysis
 */
function generateErrorTrendAnalysis(results, reportDir) {
  // This would typically compare with historical data
  // For now, create a simple trend report
  
  const trendData = {
    timestamp: results.metadata.timestamp,
    runId: results.metadata.testRunId,
    metrics: {
      totalTests: results.summary.numTotalTests,
      failureRate: results.summary.numFailedTests / results.summary.numTotalTests,
      avgTestDuration: results.summary.testRunTime / results.summary.numTotalTests,
      errorCount: results.errorAnalysis.totalErrors,
      criticalErrors: results.errorAnalysis.criticalErrors.length
    },
    errorTypes: results.errorAnalysis.errorsByType
  };
  
  // Append to trend history
  const trendFile = path.join(reportDir, 'error-trends.jsonl');
  const trendLine = JSON.stringify(trendData) + '\n';
  
  fs.appendFileSync(trendFile, trendLine);
  
  console.log(`📈 Error trend data appended to: ${trendFile}`);
}

module.exports = processResults;