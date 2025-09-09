#!/usr/bin/env node

/**
 * Load Test Reporting and Metrics System
 *
 * Comprehensive reporting system for load test results including:
 * - Aggregated metrics across all test runs
 * - Performance trend analysis
 * - HTML and PDF report generation
 * - Comparison between test runs
 * - Performance threshold alerts
 * - Real-time dashboard data
 *
 * Task: T-1752989144295-507 - Implement automated load test scripts for key user flows
 */

const fs = require('fs').promises;
const path = require('path');
const { createWriteStream } = require('fs');

/**
 * Load Test Report Generator
 */
class LoadTestReporter {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './load-test-reports',
      includeCharts: options.includeCharts !== false,
      generatePDF: options.generatePDF || false,
      thresholds: {
        responseTime: options.responseTime || 2000, // ms
        successRate: options.successRate || 95, // %
        requestsPerSecond: options.requestsPerSecond || 10,
        errorRate: options.errorRate || 5 // %
      }
    };
  }

  /**
   * Generate comprehensive report from test results
   */
  async generateReport(testResults, reportName = 'load-test-report') {
    try {
      // Ensure output directory exists
      await this.ensureOutputDir();

      // Process and aggregate results
      const aggregatedData = this.aggregateResults(testResults);

      // Generate different report formats
      const reports = {
        json: await this.generateJSONReport(aggregatedData, reportName),
        html: await this.generateHTMLReport(aggregatedData, reportName),
        csv: await this.generateCSVReport(aggregatedData, reportName),
        summary: await this.generateSummaryReport(aggregatedData, reportName)
      };

      // Generate PDF if requested
      if (this.options.generatePDF) {
        reports.pdf = await this.generatePDFReport(aggregatedData, reportName);
      }

      // Generate performance alerts
      const alerts = this.generatePerformanceAlerts(aggregatedData);
      if (alerts.length > 0) {
        await this.saveAlerts(alerts, reportName);
      }

      console.log(
        `📊 Load test reports generated in: ${this.options.outputDir}`
      );
      console.log(`📄 Available formats: ${Object.keys(reports).join(', ')}`);

      if (alerts.length > 0) {
        console.log(`🚨 ${alerts.length} performance alerts generated`);
      }

      return {
        reports,
        alerts,
        aggregatedData
      };
    } catch (error) {
      console.error('❌ Failed to generate load test report:', error);
      throw error;
    }
  }

  /**
   * Aggregate results from multiple test runs
   */
  aggregateResults(testResults) {
    if (!Array.isArray(testResults) || testResults.length === 0) {
      throw new Error('No test results provided for aggregation');
    }

    const aggregated = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTestRuns: testResults.length,
        testPeriod: this.calculateTestPeriod(testResults)
      },
      summary: {
        totalRequests: 0,
        totalSuccessfulRequests: 0,
        totalFailedRequests: 0,
        overallSuccessRate: 0,
        averageResponseTime: 0,
        medianResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Number.MAX_VALUE,
        totalDuration: 0,
        requestsPerSecond: 0,
        concurrentUsers: 0
      },
      testBreakdown: [],
      performanceMetrics: {
        responseTimeDistribution: {},
        errorDistribution: {},
        throughputOverTime: [],
        userLoadPattern: []
      },
      alerts: [],
      recommendations: []
    };

    let totalResponseTime = 0;
    let allResponseTimes = [];
    let totalDuration = 0;
    let maxConcurrency = 0;

    // Process each test result
    testResults.forEach(testResult => {
      const { testName, results, filename } = testResult;

      if (!results || !results.global) {
        console.warn(`⚠️  Invalid test result for ${testName}, skipping`);
        return;
      }

      const global = results.global;

      // Update summary metrics
      aggregated.summary.totalRequests += global.totalRequests || 0;
      aggregated.summary.totalSuccessfulRequests +=
        global.successfulRequests || 0;
      aggregated.summary.totalFailedRequests += global.failedRequests || 0;

      totalResponseTime +=
        (global.averageResponseTime || 0) * (global.totalRequests || 0);
      allResponseTimes.push(...(global.responseTimes || []));

      aggregated.summary.maxResponseTime = Math.max(
        aggregated.summary.maxResponseTime,
        global.maxResponseTime || 0
      );

      aggregated.summary.minResponseTime = Math.min(
        aggregated.summary.minResponseTime,
        global.minResponseTime || Number.MAX_VALUE
      );

      totalDuration += global.duration || 0;
      maxConcurrency = Math.max(maxConcurrency, global.concurrency || 0);

      // Add test breakdown
      aggregated.testBreakdown.push({
        testName,
        filename,
        metrics: {
          totalRequests: global.totalRequests || 0,
          successRate: global.successRate || 0,
          averageResponseTime: global.averageResponseTime || 0,
          requestsPerSecond: global.requestsPerSecond || 0,
          duration: global.duration || 0,
          concurrency: global.concurrency || 0,
          errors: global.errors || []
        },
        alerts: this.generateTestAlerts(global, testName)
      });

      // Update performance distributions
      this.updatePerformanceDistributions(
        aggregated.performanceMetrics,
        results
      );
    });

    // Calculate final summary metrics
    if (aggregated.summary.totalRequests > 0) {
      aggregated.summary.overallSuccessRate =
        (aggregated.summary.totalSuccessfulRequests /
          aggregated.summary.totalRequests) *
        100;

      aggregated.summary.averageResponseTime =
        totalResponseTime / aggregated.summary.totalRequests;
    }

    if (allResponseTimes.length > 0) {
      allResponseTimes.sort((a, b) => a - b);
      const medianIndex = Math.floor(allResponseTimes.length / 2);
      aggregated.summary.medianResponseTime = allResponseTimes[medianIndex];
    }

    aggregated.summary.totalDuration = totalDuration;
    aggregated.summary.concurrentUsers = maxConcurrency;

    if (totalDuration > 0) {
      aggregated.summary.requestsPerSecond =
        aggregated.summary.totalRequests / (totalDuration / 1000);
    }

    // Generate recommendations
    aggregated.recommendations = this.generateRecommendations(aggregated);

    return aggregated;
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(aggregatedData, reportName) {
    const filename = `${reportName}-${Date.now()}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(aggregatedData, null, 2));

    return { filename, filepath };
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(aggregatedData, reportName) {
    const filename = `${reportName}-${Date.now()}.html`;
    const filepath = path.join(this.options.outputDir, filename);

    const htmlContent = this.generateHTMLContent(aggregatedData);
    await fs.writeFile(filepath, htmlContent);

    return { filename, filepath };
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(aggregatedData, reportName) {
    const filename = `${reportName}-${Date.now()}.csv`;
    const filepath = path.join(this.options.outputDir, filename);

    const csvContent = this.generateCSVContent(aggregatedData);
    await fs.writeFile(filepath, csvContent);

    return { filename, filepath };
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(aggregatedData, reportName) {
    const filename = `${reportName}-summary-${Date.now()}.txt`;
    const filepath = path.join(this.options.outputDir, filename);

    const summaryContent = this.generateSummaryContent(aggregatedData);
    await fs.writeFile(filepath, summaryContent);

    return { filename, filepath };
  }

  /**
   * Generate HTML content for the report
   */
  generateHTMLContent(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - ${data.metadata.generatedAt}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e1e5e9;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .header .meta {
            color: #7f8c8d;
            font-size: 14px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-card.success {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }
        .metric-card.warning {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        }
        .metric-card.error {
            background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .metric-card .value {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #2c3e50;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-bottom: 20px;
        }
        .test-breakdown {
            overflow-x: auto;
        }
        .test-breakdown table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .test-breakdown th,
        .test-breakdown td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .test-breakdown th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .alert {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 5px solid;
        }
        .alert.error {
            background-color: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .alert.warning {
            background-color: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .alert.info {
            background-color: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        .recommendations {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #28a745;
        }
        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Load Test Report</h1>
            <div class="meta">
                Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}<br>
                Test Period: ${data.metadata.testPeriod}<br>
                Total Test Runs: ${data.metadata.totalTestRuns}
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card ${data.summary.overallSuccessRate >= 95 ? 'success' : data.summary.overallSuccessRate >= 85 ? 'warning' : 'error'}">
                <h3>Overall Success Rate</h3>
                <div class="value">${data.summary.overallSuccessRate.toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <h3>Total Requests</h3>
                <div class="value">${data.summary.totalRequests.toLocaleString()}</div>
            </div>
            <div class="metric-card ${data.summary.averageResponseTime <= 1000 ? 'success' : data.summary.averageResponseTime <= 2000 ? 'warning' : 'error'}">
                <h3>Avg Response Time</h3>
                <div class="value">${data.summary.averageResponseTime.toFixed(0)}ms</div>
            </div>
            <div class="metric-card">
                <h3>Requests/Second</h3>
                <div class="value">${data.summary.requestsPerSecond.toFixed(1)}</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Test Breakdown</h2>
            <div class="test-breakdown">
                <table>
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Requests</th>
                            <th>Success Rate</th>
                            <th>Avg Response (ms)</th>
                            <th>RPS</th>
                            <th>Duration (s)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.testBreakdown
                          .map(
                            test => `
                        <tr>
                            <td><strong>${test.testName}</strong></td>
                            <td>${test.metrics.totalRequests}</td>
                            <td>${test.metrics.successRate.toFixed(1)}%</td>
                            <td>${test.metrics.averageResponseTime.toFixed(0)}</td>
                            <td>${test.metrics.requestsPerSecond.toFixed(1)}</td>
                            <td>${(test.metrics.duration / 1000).toFixed(1)}</td>
                            <td>
                                ${
                                  test.metrics.successRate >= 95
                                    ? '<span style="color: #28a745;">✅ Passed</span>'
                                    : '<span style="color: #dc3545;">❌ Failed</span>'
                                }
                            </td>
                        </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
        </div>

        ${
          data.recommendations.length > 0
            ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                <h4>Performance Optimization Suggestions:</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
        `
            : ''
        }

        <div class="section">
            <h2>📈 Performance Summary</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Min Response Time</h3>
                    <div class="value">${data.summary.minResponseTime}ms</div>
                </div>
                <div class="metric-card">
                    <h3>Max Response Time</h3>
                    <div class="value">${data.summary.maxResponseTime}ms</div>
                </div>
                <div class="metric-card">
                    <h3>Median Response Time</h3>
                    <div class="value">${data.summary.medianResponseTime.toFixed(0)}ms</div>
                </div>
                <div class="metric-card">
                    <h3>Max Concurrent Users</h3>
                    <div class="value">${data.summary.concurrentUsers}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate CSV content
   */
  generateCSVContent(data) {
    let csv =
      'Test Name,Total Requests,Success Rate (%),Avg Response Time (ms),Requests/Second,Duration (s),Errors\n';

    data.testBreakdown.forEach(test => {
      csv += `"${test.testName}",${test.metrics.totalRequests},${test.metrics.successRate.toFixed(1)},${test.metrics.averageResponseTime.toFixed(0)},${test.metrics.requestsPerSecond.toFixed(1)},${(test.metrics.duration / 1000).toFixed(1)},"${test.metrics.errors.length}"\n`;
    });

    return csv;
  }

  /**
   * Generate summary content
   */
  generateSummaryContent(data) {
    return `
LOAD TEST REPORT SUMMARY
========================
Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}
Total Test Runs: ${data.metadata.totalTestRuns}
Test Period: ${data.metadata.testPeriod}

OVERALL METRICS
===============
Total Requests: ${data.summary.totalRequests.toLocaleString()}
Success Rate: ${data.summary.overallSuccessRate.toFixed(2)}%
Average Response Time: ${data.summary.averageResponseTime.toFixed(0)}ms
Median Response Time: ${data.summary.medianResponseTime.toFixed(0)}ms
Requests/Second: ${data.summary.requestsPerSecond.toFixed(2)}
Max Concurrent Users: ${data.summary.concurrentUsers}

PERFORMANCE THRESHOLDS
======================
${data.summary.overallSuccessRate >= this.options.thresholds.successRate ? '✅' : '❌'} Success Rate: ${data.summary.overallSuccessRate.toFixed(1)}% (threshold: ${this.options.thresholds.successRate}%)
${data.summary.averageResponseTime <= this.options.thresholds.responseTime ? '✅' : '❌'} Response Time: ${data.summary.averageResponseTime.toFixed(0)}ms (threshold: ${this.options.thresholds.responseTime}ms)
${data.summary.requestsPerSecond >= this.options.thresholds.requestsPerSecond ? '✅' : '❌'} Throughput: ${data.summary.requestsPerSecond.toFixed(2)} RPS (threshold: ${this.options.thresholds.requestsPerSecond} RPS)

TEST BREAKDOWN
==============
${data.testBreakdown
  .map(
    test =>
      `${test.testName}:
  - Requests: ${test.metrics.totalRequests}
  - Success Rate: ${test.metrics.successRate.toFixed(1)}%
  - Avg Response: ${test.metrics.averageResponseTime.toFixed(0)}ms
  - RPS: ${test.metrics.requestsPerSecond.toFixed(1)}
  - Status: ${test.metrics.successRate >= 95 ? 'PASSED' : 'FAILED'}
`
  )
  .join('\n')}

${
  data.recommendations.length > 0
    ? `
RECOMMENDATIONS
===============
${data.recommendations.map(rec => `- ${rec}`).join('\n')}
`
    : ''
}
`;
  }

  /**
   * Generate performance alerts
   */
  generatePerformanceAlerts(data) {
    const alerts = [];

    // Check overall success rate
    if (data.summary.overallSuccessRate < this.options.thresholds.successRate) {
      alerts.push({
        type: 'error',
        title: 'Low Success Rate',
        message: `Overall success rate of ${data.summary.overallSuccessRate.toFixed(1)}% is below threshold of ${this.options.thresholds.successRate}%`,
        recommendation: 'Investigate error patterns and optimize error handling'
      });
    }

    // Check response time
    if (
      data.summary.averageResponseTime > this.options.thresholds.responseTime
    ) {
      alerts.push({
        type: 'warning',
        title: 'High Response Time',
        message: `Average response time of ${data.summary.averageResponseTime.toFixed(0)}ms exceeds threshold of ${this.options.thresholds.responseTime}ms`,
        recommendation:
          'Optimize database queries, implement caching, or scale infrastructure'
      });
    }

    // Check throughput
    if (
      data.summary.requestsPerSecond < this.options.thresholds.requestsPerSecond
    ) {
      alerts.push({
        type: 'warning',
        title: 'Low Throughput',
        message: `Throughput of ${data.summary.requestsPerSecond.toFixed(2)} RPS is below threshold of ${this.options.thresholds.requestsPerSecond} RPS`,
        recommendation:
          'Scale application instances or optimize request processing'
      });
    }

    return alerts;
  }

  /**
   * Generate test-specific alerts
   */
  generateTestAlerts(testResults, testName) {
    const alerts = [];

    if (testResults.successRate < 90) {
      alerts.push(
        `High failure rate in ${testName}: ${testResults.successRate.toFixed(1)}%`
      );
    }

    if (testResults.averageResponseTime > 3000) {
      alerts.push(
        `Slow response time in ${testName}: ${testResults.averageResponseTime.toFixed(0)}ms`
      );
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];

    if (data.summary.averageResponseTime > 2000) {
      recommendations.push(
        'Consider implementing response caching for frequently accessed endpoints'
      );
      recommendations.push(
        'Review database query performance and add appropriate indexes'
      );
    }

    if (data.summary.overallSuccessRate < 95) {
      recommendations.push(
        'Implement better error handling and retry mechanisms'
      );
      recommendations.push(
        'Add more comprehensive input validation to prevent errors'
      );
    }

    if (data.summary.requestsPerSecond < 50) {
      recommendations.push('Consider horizontal scaling with load balancing');
      recommendations.push(
        'Optimize application code for better CPU utilization'
      );
    }

    const errorTests = data.testBreakdown.filter(
      test => test.metrics.successRate < 90
    );
    if (errorTests.length > 0) {
      recommendations.push(
        `Focus optimization efforts on: ${errorTests.map(t => t.testName).join(', ')}`
      );
    }

    return recommendations;
  }

  /**
   * Calculate test period from results
   */
  calculateTestPeriod(testResults) {
    if (testResults.length === 0) return 'N/A';

    const timestamps = testResults
      .map(result => new Date(result.timestamp || Date.now()))
      .sort();

    const start = timestamps[0];
    const end = timestamps[timestamps.length - 1];

    if (start.getTime() === end.getTime()) {
      return start.toLocaleString();
    }

    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  }

  /**
   * Update performance distributions
   */
  updatePerformanceDistributions(metrics, results) {
    // This would implement histogram calculations for response times
    // and error distribution analysis - simplified for this implementation
    if (results.global && results.global.responseTimes) {
      results.global.responseTimes.forEach(time => {
        const bucket = Math.floor(time / 100) * 100;
        metrics.responseTimeDistribution[bucket] =
          (metrics.responseTimeDistribution[bucket] || 0) + 1;
      });
    }
  }

  /**
   * Save alerts to file
   */
  async saveAlerts(alerts, reportName) {
    const filename = `${reportName}-alerts-${Date.now()}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeFile(
      filepath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          alerts
        },
        null,
        2
      )
    );

    return { filename, filepath };
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.access(this.options.outputDir);
    } catch (error) {
      await fs.mkdir(this.options.outputDir, { recursive: true });
    }
  }
}

/**
 * Main load test reporting function
 */
async function generateLoadTestReport(testResultsPattern, options = {}) {
  try {
    const reporter = new LoadTestReporter(options);

    // Load test results from files
    const testResults = await loadTestResultFiles(testResultsPattern);

    if (testResults.length === 0) {
      console.log('⚠️  No test results found');
      return;
    }

    console.log(
      `📊 Generating report for ${testResults.length} test result(s)`
    );

    // Generate comprehensive report
    const reportData = await reporter.generateReport(
      testResults,
      'comprehensive-load-test-report'
    );

    // Print summary to console
    console.log('\n📈 LOAD TEST SUMMARY');
    console.log('===================');
    console.log(
      `Total Requests: ${reportData.aggregatedData.summary.totalRequests.toLocaleString()}`
    );
    console.log(
      `Success Rate: ${reportData.aggregatedData.summary.overallSuccessRate.toFixed(2)}%`
    );
    console.log(
      `Average Response Time: ${reportData.aggregatedData.summary.averageResponseTime.toFixed(0)}ms`
    );
    console.log(
      `Requests/Second: ${reportData.aggregatedData.summary.requestsPerSecond.toFixed(2)}`
    );

    if (reportData.alerts.length > 0) {
      console.log('\n🚨 PERFORMANCE ALERTS:');
      reportData.alerts.forEach(alert => {
        console.log(`  ${alert.type.toUpperCase()}: ${alert.message}`);
      });
    }

    return reportData;
  } catch (error) {
    console.error('❌ Failed to generate load test report:', error);
    throw error;
  }
}

/**
 * Load test result files based on pattern
 */
async function loadTestResultFiles(pattern) {
  const testResults = [];

  try {
    const files = await fs.readdir('./');
    const resultFiles = files.filter(
      file =>
        file.includes('load-test') &&
        file.endsWith('.json') &&
        !file.includes('report')
    );

    for (const file of resultFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const data = JSON.parse(content);
        testResults.push({
          testName: data.testName || file.replace('.json', ''),
          results: data,
          filename: file,
          timestamp: data.timestamp || Date.now()
        });
      } catch (error) {
        console.warn(`⚠️  Failed to load result file ${file}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Failed to load test result files:', error);
  }

  return testResults;
}

// Export classes and functions
module.exports = {
  LoadTestReporter,
  generateLoadTestReport,
  loadTestResultFiles
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const pattern = args[0] || '*load-test*.json';

  generateLoadTestReport(pattern, {
    generatePDF: args.includes('--pdf'),
    includeCharts: !args.includes('--no-charts')
  }).catch(console.error);
}
