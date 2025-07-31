#!/usr/bin/env node

/**
 * Comprehensive Load Test Runner
 *
 * Orchestrates all load tests for the PromptScape application:
 * - Authentication flow load tests
 * - File browser operation load tests
 * - Graph execution load tests
 * - Generates comprehensive reports
 * - Monitors system health during tests
 * - Provides real-time progress updates
 *
 * Task: T-1752989144295-507 - Implement automated load test scripts for key user flows
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { LoadTestReporter } = require('./load-test-reporter');

/**
 * Comprehensive Load Test Orchestrator
 */
class LoadTestOrchestrator {
  constructor(options = {}) {
    this.options = {
      baseUrl: options.baseUrl || process.env.API_BASE_URL || 'http://localhost:8000',
      parallel: options.parallel || false,
      skipAuthentication: options.skipAuthentication || false,
      skipFileBrowser: options.skipFileBrowser || false,
      skipGraphExecution: options.skipGraphExecution || false,
      generateReport: options.generateReport !== false,
      reportFormat: options.reportFormat || 'all', // 'html', 'pdf', 'json', 'all'
      healthCheckInterval: options.healthCheckInterval || 30000, // 30 seconds
      maxRetries: options.maxRetries || 2,
      outputDir: options.outputDir || './load-test-results',
    };

    this.testResults = [];
    this.systemHealthData = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Run all load tests in sequence or parallel
   */
  async runAllLoadTests() {
    console.log('🚀 Starting Comprehensive Load Test Suite');
    console.log('=========================================\n');

    this.startTime = new Date();

    try {
      // Ensure output directory exists
      await this.ensureOutputDir();

      // Pre-test health check
      await this.performHealthCheck('pre-test');

      // Start system monitoring
      const monitoringInterval = this.startSystemMonitoring();

      // Define test suites
      const testSuites = [
        {
          name: 'Authentication Flow Tests',
          script: './auth-flow-load-test.js',
          skip: this.options.skipAuthentication,
          estimatedDuration: 300, // 5 minutes
        },
        {
          name: 'File Browser Operation Tests',
          script: './file-browser-load-test.js',
          skip: this.options.skipFileBrowser,
          estimatedDuration: 420, // 7 minutes
        },
        {
          name: 'Graph Execution Tests',
          script: './graph-execution-load-test.js',
          skip: this.options.skipGraphExecution,
          estimatedDuration: 600, // 10 minutes
        },
      ];

      // Calculate total estimated time
      const totalEstimatedTime = testSuites
        .filter(suite => !suite.skip)
        .reduce((total, suite) => total + suite.estimatedDuration, 0);

      console.log(`⏱️  Estimated total test time: ${Math.ceil(totalEstimatedTime / 60)} minutes\n`);

      // Run tests
      if (this.options.parallel) {
        await this.runTestsInParallel(testSuites);
      } else {
        await this.runTestsInSequence(testSuites);
      }

      // Stop system monitoring
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }

      // Post-test health check
      await this.performHealthCheck('post-test');

      this.endTime = new Date();

      // Generate comprehensive report
      if (this.options.generateReport) {
        await this.generateComprehensiveReport();
      }

      // Print final summary
      this.printFinalSummary();

      console.log('\n✅ All load tests completed successfully!');

      return {
        success: true,
        testResults: this.testResults,
        systemHealth: this.systemHealthData,
        duration: this.endTime - this.startTime,
      };
    } catch (error) {
      console.error('\n❌ Load test suite failed:', error.message);

      this.endTime = new Date();

      // Generate partial report if any tests completed
      if (this.testResults.length > 0 && this.options.generateReport) {
        try {
          await this.generateComprehensiveReport();
        } catch (reportError) {
          console.error('⚠️  Failed to generate error report:', reportError.message);
        }
      }

      return {
        success: false,
        error: error.message,
        testResults: this.testResults,
        systemHealth: this.systemHealthData,
        duration: this.endTime - this.startTime,
      };
    }
  }

  /**
   * Run test suites in sequence
   */
  async runTestsInSequence(testSuites) {
    console.log('📋 Running tests in sequence...\n');

    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];

      if (suite.skip) {
        console.log(`⏭️  Skipping ${suite.name}`);
        continue;
      }

      console.log(`\n🎯 Running ${suite.name} (${i + 1}/${testSuites.length})`);
      console.log('─'.repeat(60));

      await this.runTestSuite(suite);

      // Pause between test suites
      if (i < testSuites.length - 1) {
        console.log('\n⏸️  Pausing 30 seconds between test suites...');
        await this.delay(30000);
      }
    }
  }

  /**
   * Run test suites in parallel
   */
  async runTestsInParallel(testSuites) {
    console.log('🔀 Running tests in parallel...\n');

    const activeTestSuites = testSuites.filter(suite => !suite.skip);

    const testPromises = activeTestSuites.map(suite => this.runTestSuite(suite));

    try {
      await Promise.all(testPromises);
    } catch (error) {
      console.error('❌ One or more parallel tests failed:', error.message);
      throw error;
    }
  }

  /**
   * Run individual test suite
   */
  async runTestSuite(suite) {
    let attempts = 0;
    let lastError = null;

    while (attempts < this.options.maxRetries) {
      attempts++;

      try {
        console.log(`\n🏃 Running ${suite.name} (attempt ${attempts}/${this.options.maxRetries})`);

        const startTime = Date.now();

        // Execute the test script
        const result = await this.executeTestScript(suite.script);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Store results
        this.testResults.push({
          suiteName: suite.name,
          script: suite.script,
          result,
          duration,
          timestamp: new Date().toISOString(),
          attempt: attempts,
        });

        console.log(`✅ ${suite.name} completed in ${Math.ceil(duration / 1000)}s`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`❌ ${suite.name} failed (attempt ${attempts}):`, error.message);

        if (attempts < this.options.maxRetries) {
          console.log('🔄 Retrying in 10 seconds...');
          await this.delay(10000);
        }
      }
    }

    // All retry attempts failed
    throw new Error(`${suite.name} failed after ${this.options.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Execute test script
   */
  async executeTestScript(scriptPath) {
    try {
      // Make the script executable
      await fs.chmod(scriptPath, '755');

      // Execute the script
      const output = execSync(`node ${scriptPath}`, {
        cwd: __dirname,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30 * 60 * 1000, // 30 minute timeout
        env: {
          ...process.env,
          API_BASE_URL: this.options.baseUrl,
        },
      });

      return {
        success: true,
        output: output,
        exitCode: 0,
      };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.message,
        stderr: error.stderr,
        exitCode: error.status || 1,
        error: error.message,
      };
    }
  }

  /**
   * Perform system health check
   */
  async performHealthCheck(phase) {
    console.log(`🩺 Performing ${phase} health check...`);

    const healthData = {
      phase,
      timestamp: new Date().toISOString(),
      checks: {},
    };

    try {
      // API availability check
      const response = await fetch(`${this.options.baseUrl}/health`);
      healthData.checks.apiAvailable = response.status === 200;
      healthData.checks.apiResponseTime = Date.now() - healthData.startTime;

      if (healthData.checks.apiAvailable) {
        const health = await response.json();
        healthData.checks.databaseConnected = health.database === 'connected';
        healthData.checks.serverLoad = health.load || 'unknown';
        healthData.checks.memoryUsage = health.memory || 'unknown';
      }
    } catch (error) {
      console.warn(`⚠️  Health check failed: ${error.message}`);
      healthData.checks.apiAvailable = false;
      healthData.checks.error = error.message;
    }

    this.systemHealthData.push(healthData);

    if (healthData.checks.apiAvailable) {
      console.log(`✅ ${phase} health check passed`);
    } else {
      console.log(`⚠️  ${phase} health check failed - proceeding with caution`);
    }
  }

  /**
   * Start system monitoring
   */
  startSystemMonitoring() {
    console.log('📊 Starting system monitoring...');

    return setInterval(async () => {
      await this.performHealthCheck('monitoring');
    }, this.options.healthCheckInterval);
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport() {
    console.log('\n📊 Generating comprehensive load test report...');

    try {
      const reporter = new LoadTestReporter({
        outputDir: this.options.outputDir,
        generatePDF: this.options.reportFormat === 'pdf' || this.options.reportFormat === 'all',
        includeCharts: true,
      });

      // Collect all test result files
      const testResultFiles = await this.collectTestResultFiles();

      if (testResultFiles.length === 0) {
        console.warn('⚠️  No test result files found for reporting');
        return;
      }

      // Generate the report
      const reportData = await reporter.generateReport(testResultFiles, 'comprehensive-load-test');

      // Add system health data to the report
      await this.saveSystemHealthReport();

      console.log(`✅ Comprehensive report generated in: ${this.options.outputDir}`);
      console.log(`📄 Available formats: ${Object.keys(reportData.reports).join(', ')}`);

      if (reportData.alerts.length > 0) {
        console.log(`🚨 ${reportData.alerts.length} performance alerts detected`);

        reportData.alerts.forEach(alert => {
          console.log(`   ${alert.type.toUpperCase()}: ${alert.message}`);
        });
      }

      return reportData;
    } catch (error) {
      console.error('❌ Failed to generate comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Collect test result files
   */
  async collectTestResultFiles() {
    const resultFiles = [];

    try {
      const files = await fs.readdir('./');
      const loadTestFiles = files.filter(
        file => file.includes('load-test') && file.endsWith('.json') && !file.includes('report')
      );

      for (const file of loadTestFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const data = JSON.parse(content);

          resultFiles.push({
            testName: this.extractTestName(file),
            results: data,
            filename: file,
            timestamp: data.timestamp || Date.now(),
          });
        } catch (error) {
          console.warn(`⚠️  Failed to load result file ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️  Failed to collect test result files:', error.message);
    }

    return resultFiles;
  }

  /**
   * Extract test name from filename
   */
  extractTestName(filename) {
    return filename
      .replace('-load-test', '')
      .replace('.json', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Save system health report
   */
  async saveSystemHealthReport() {
    const healthReport = {
      generatedAt: new Date().toISOString(),
      testPeriod: {
        start: this.startTime,
        end: this.endTime,
        duration: this.endTime - this.startTime,
      },
      healthChecks: this.systemHealthData,
      summary: this.generateHealthSummary(),
    };

    const filename = `system-health-report-${Date.now()}.json`;
    const filepath = path.join(this.options.outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(healthReport, null, 2));

    console.log(`💊 System health report saved: ${filename}`);
  }

  /**
   * Generate health summary
   */
  generateHealthSummary() {
    const totalChecks = this.systemHealthData.length;
    const successfulChecks = this.systemHealthData.filter(check => check.checks.apiAvailable).length;

    return {
      totalHealthChecks: totalChecks,
      successfulHealthChecks: successfulChecks,
      healthSuccessRate: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
      averageResponseTime: this.calculateAverageResponseTime(),
      systemStability: successfulChecks === totalChecks ? 'stable' : 'unstable',
    };
  }

  /**
   * Calculate average response time from health checks
   */
  calculateAverageResponseTime() {
    const responseTimes = this.systemHealthData
      .filter(check => check.checks.apiResponseTime)
      .map(check => check.checks.apiResponseTime);

    if (responseTimes.length === 0) return 0;

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  /**
   * Print final summary
   */
  printFinalSummary() {
    const duration = this.endTime - this.startTime;
    const durationMinutes = Math.ceil(duration / (1000 * 60));

    console.log('\n📈 FINAL LOAD TEST SUMMARY');
    console.log('==========================');
    console.log(`🕐 Total Duration: ${durationMinutes} minutes`);
    console.log(`🧪 Test Suites Run: ${this.testResults.length}`);
    console.log(`✅ Successful Tests: ${this.testResults.filter(r => r.result.success).length}`);
    console.log(`❌ Failed Tests: ${this.testResults.filter(r => !r.result.success).length}`);
    console.log(`🩺 Health Checks: ${this.systemHealthData.length}`);
    console.log(`📊 Reports Generated: ${this.options.generateReport ? 'Yes' : 'No'}`);

    const healthSummary = this.generateHealthSummary();
    console.log(`💊 System Stability: ${healthSummary.systemStability.toUpperCase()}`);
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

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main function for running comprehensive load tests
 */
async function runComprehensiveLoadTests(options = {}) {
  const orchestrator = new LoadTestOrchestrator(options);
  return await orchestrator.runAllLoadTests();
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    if (arg === '--parallel') options.parallel = true;
    if (arg === '--skip-auth') options.skipAuthentication = true;
    if (arg === '--skip-files') options.skipFileBrowser = true;
    if (arg === '--skip-graphs') options.skipGraphExecution = true;
    if (arg === '--no-report') options.generateReport = false;
    if (arg.startsWith('--base-url=')) options.baseUrl = arg.split('=')[1];
    if (arg.startsWith('--output=')) options.outputDir = arg.split('=')[1];
    if (arg.startsWith('--format=')) options.reportFormat = arg.split('=')[1];
  });

  return options;
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log(`
📚 Load Test Suite Usage
========================

node run-all-load-tests.js [options]

Options:
  --parallel              Run test suites in parallel (default: sequential)
  --skip-auth             Skip authentication flow tests
  --skip-files            Skip file browser operation tests  
  --skip-graphs           Skip graph execution tests
  --no-report             Skip generating comprehensive report
  --base-url=URL          Set API base URL (default: http://localhost:8000)
  --output=DIR            Set output directory (default: ./load-test-results)
  --format=FORMAT         Report format: html, pdf, json, all (default: all)
  --help                  Display this help message

Examples:
  node run-all-load-tests.js
  node run-all-load-tests.js --parallel --base-url=https://api.example.com
  node run-all-load-tests.js --skip-auth --format=html
  node run-all-load-tests.js --parallel --no-report

Environment Variables:
  API_BASE_URL           Sets the base URL for API calls
  NODE_ENV              Set to 'test' for test configuration
`);
}

// Export for programmatic usage
module.exports = {
  LoadTestOrchestrator,
  runComprehensiveLoadTests,
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    displayUsage();
    process.exit(0);
  }

  const options = parseArgs();

  runComprehensiveLoadTests(options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Load test orchestrator failed:', error);
      process.exit(1);
    });
}
