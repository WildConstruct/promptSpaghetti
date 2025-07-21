#!/usr/bin/env node

/**
 * Test Automation Orchestrator
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562447-CB0C94 - Implement test infrastructure
 * 
 * Comprehensive test automation and orchestration system
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class TestAutomationOrchestrator {
  constructor(options = {}) {
    this.options = {
      parallel: options.parallel || false,
      coverage: options.coverage || true,
      timeout: options.timeout || 300000, // 5 minutes
      retries: options.retries || 1,
      failFast: options.failFast || false,
      outputDir: options.outputDir || './test-results',
      generateReports: options.generateReports || true,
      ...options
    };

    this.results = {
      suites: [],
      startTime: null,
      endTime: null,
      totalDuration: 0,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passRate: 0
      }
    };

    this.testSuites = [
      {
        name: 'Unit Tests',
        command: 'npm run test:unit',
        critical: true,
        timeout: 120000,
        description: 'Core unit tests for all components'
      },
      {
        name: 'Integration Tests', 
        command: 'npm run test:integration',
        critical: true,
        timeout: 180000,
        description: 'Integration tests for component interactions'
      },
      {
        name: 'Documentation Tests',
        command: 'npm run test:docs',
        critical: false,
        timeout: 60000,
        description: 'Documentation validation and example tests'
      },
      {
        name: 'Security Tests',
        command: 'npm run test:security',
        critical: true,
        timeout: 90000,
        description: 'Security validation and vulnerability tests'
      },
      {
        name: 'Performance Tests',
        command: 'npm run test:performance-only',
        critical: false,
        timeout: 240000,
        description: 'Performance benchmarks and scenarios'
      },
      {
        name: 'Cross-browser Tests',
        command: 'npm run test:cross-browser:desktop',
        critical: false,
        timeout: 300000,
        description: 'Cross-browser compatibility tests'
      },
      {
        name: 'Mobile Tests',
        command: 'npm run test:cross-browser:mobile',
        critical: false,
        timeout: 240000,
        description: 'Mobile device compatibility tests'
      }
    ];
  }

  /**
   * Run all test suites with comprehensive orchestration
   */
  async runAllTests() {
    console.log(chalk.blue.bold('🚀 Starting Test Automation Orchestrator\n'));
    
    this.results.startTime = Date.now();
    
    try {
      await this.setupTestEnvironment();
      
      if (this.options.parallel) {
        await this.runTestsInParallel();
      } else {
        await this.runTestsSequentially();
      }
      
      await this.generateReports();
      await this.cleanupTestEnvironment();
      
    } catch (error) {
      console.error(chalk.red('❌ Test orchestration failed:'), error.message);
      process.exit(1);
    } finally {
      this.results.endTime = Date.now();
      this.results.totalDuration = this.results.endTime - this.results.startTime;
      await this.printFinalSummary();
    }
  }

  /**
   * Run specific test suite by name
   */
  async runSpecificSuite(suiteName) {
    const suite = this.testSuites.find(s => 
      s.name.toLowerCase().includes(suiteName.toLowerCase())
    );
    
    if (!suite) {
      console.error(chalk.red(`❌ Test suite "${suiteName}" not found`));
      process.exit(1);
    }

    console.log(chalk.blue.bold(`🎯 Running specific test suite: ${suite.name}\n`));
    
    this.results.startTime = Date.now();
    await this.setupTestEnvironment();
    
    const result = await this.runSingleTestSuite(suite);
    this.results.suites.push(result);
    
    await this.generateReports();
    this.results.endTime = Date.now();
    this.results.totalDuration = this.results.endTime - this.results.startTime;
    
    await this.printFinalSummary();
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log(chalk.yellow('🔧 Setting up test environment...'));
    
    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    // Clean previous test results
    await this.executeCommand('rm -rf coverage/ playwright-report/ test-results/');
    
    // Setup test database if needed
    if (process.env.NODE_ENV !== 'ci') {
      try {
        await this.executeCommand('npm run test:setup', { timeout: 30000 });
      } catch (error) {
        console.warn(chalk.yellow('⚠️ Test setup script not found, continuing...'));
      }
    }

    console.log(chalk.green('✅ Test environment ready\n'));
  }

  /**
   * Run tests in parallel
   */
  async runTestsInParallel() {
    console.log(chalk.blue('🔀 Running tests in parallel...\n'));
    
    const promises = this.testSuites.map(async (suite) => {
      try {
        return await this.runSingleTestSuite(suite);
      } catch (error) {
        return {
          ...suite,
          status: 'failed',
          error: error.message,
          duration: 0,
          output: error.toString()
        };
      }
    });

    this.results.suites = await Promise.allSettled(promises);
    this.results.suites = this.results.suites.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );
  }

  /**
   * Run tests sequentially
   */
  async runTestsSequentially() {
    console.log(chalk.blue('➡️ Running tests sequentially...\n'));
    
    for (const suite of this.testSuites) {
      const result = await this.runSingleTestSuite(suite);
      this.results.suites.push(result);
      
      if (this.options.failFast && result.status === 'failed' && suite.critical) {
        console.log(chalk.red(`💥 Critical test suite failed: ${suite.name}`));
        console.log(chalk.red('🚨 Stopping execution due to fail-fast mode'));
        break;
      }
    }
  }

  /**
   * Run a single test suite
   */
  async runSingleTestSuite(suite) {
    const startTime = Date.now();
    console.log(chalk.cyan(`🧪 Running: ${suite.name}`));
    console.log(chalk.gray(`   Description: ${suite.description}`));
    console.log(chalk.gray(`   Command: ${suite.command}`));
    console.log(chalk.gray(`   Critical: ${suite.critical ? 'Yes' : 'No'}\n`));

    let attempt = 1;
    let lastError = null;

    while (attempt <= (this.options.retries + 1)) {
      try {
        const output = await this.executeCommand(suite.command, {
          timeout: suite.timeout || this.options.timeout
        });

        const duration = Date.now() - startTime;
        const result = {
          ...suite,
          status: 'passed',
          duration,
          output,
          attempts: attempt
        };

        console.log(chalk.green(`✅ ${suite.name} passed (${duration}ms)\n`));
        return result;

      } catch (error) {
        lastError = error;
        
        if (attempt <= this.options.retries) {
          console.log(chalk.yellow(`⚠️ ${suite.name} failed (attempt ${attempt}), retrying...\n`));
          attempt++;
          await this.sleep(2000); // Wait 2 seconds before retry
        } else {
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const result = {
      ...suite,
      status: 'failed',
      duration,
      error: lastError.message,
      output: lastError.stdout || lastError.stderr || lastError.toString(),
      attempts: attempt - 1
    };

    console.log(chalk.red(`❌ ${suite.name} failed after ${attempt - 1} attempts (${duration}ms)\n`));
    return result;
  }

  /**
   * Execute a command with promise
   */
  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || this.options.timeout;
      
      const child = exec(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data;
        if (options.verbose || process.env.VERBOSE) {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data;
        if (options.verbose || process.env.VERBOSE) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          const error = new Error(`Command failed with code ${code}: ${command}`);
          error.stdout = stdout;
          error.stderr = stderr;
          error.code = code;
          reject(error);
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Generate comprehensive test reports
   */
  async generateReports() {
    if (!this.options.generateReports) return;

    console.log(chalk.yellow('📊 Generating test reports...\n'));

    const reportData = {
      timestamp: new Date().toISOString(),
      totalDuration: this.results.totalDuration,
      suites: this.results.suites,
      summary: this.calculateSummary(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: !!process.env.CI,
        coverage: this.options.coverage
      }
    };

    // JSON Report
    const jsonReportPath = path.join(this.options.outputDir, 'test-automation-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));

    // HTML Report
    await this.generateHTMLReport(reportData);

    // JUnit XML Report (for CI systems)
    await this.generateJUnitReport(reportData);

    console.log(chalk.green(`✅ Reports generated in ${this.options.outputDir}/\n`));
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(reportData) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Automation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric.passed { border-left: 4px solid #4CAF50; }
        .metric.failed { border-left: 4px solid #f44336; }
        .suite { margin: 10px 0; padding: 15px; border-radius: 8px; }
        .suite.passed { background: #e8f5e8; }
        .suite.failed { background: #ffeaea; }
        .suite.skipped { background: #fff3cd; }
        .details { margin-top: 10px; font-family: monospace; font-size: 12px; }
        pre { white-space: pre-wrap; max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Automation Report</h1>
        <p><strong>Generated:</strong> ${reportData.timestamp}</p>
        <p><strong>Duration:</strong> ${(reportData.totalDuration / 1000).toFixed(2)}s</p>
        <p><strong>Environment:</strong> ${reportData.environment.platform} (Node ${reportData.environment.nodeVersion})</p>
    </div>

    <div class="summary">
        <div class="metric passed">
            <h3>✅ Passed</h3>
            <div style="font-size: 24px; font-weight: bold;">${reportData.summary.passed}</div>
        </div>
        <div class="metric failed">
            <h3>❌ Failed</h3>
            <div style="font-size: 24px; font-weight: bold;">${reportData.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>📊 Pass Rate</h3>
            <div style="font-size: 24px; font-weight: bold;">${reportData.summary.passRate}%</div>
        </div>
        <div class="metric">
            <h3>🕐 Total Duration</h3>
            <div style="font-size: 24px; font-weight: bold;">${(reportData.totalDuration / 1000).toFixed(1)}s</div>
        </div>
    </div>

    <h2>📋 Test Suites</h2>
    ${reportData.suites.map(suite => `
        <div class="suite ${suite.status}">
            <h3>${suite.status === 'passed' ? '✅' : '❌'} ${suite.name}</h3>
            <p><strong>Status:</strong> ${suite.status}</p>
            <p><strong>Duration:</strong> ${(suite.duration / 1000).toFixed(2)}s</p>
            <p><strong>Description:</strong> ${suite.description}</p>
            ${suite.attempts > 1 ? `<p><strong>Attempts:</strong> ${suite.attempts}</p>` : ''}
            ${suite.error ? `
                <div class="details">
                    <h4>❌ Error Details</h4>
                    <pre>${suite.error}</pre>
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    const htmlReportPath = path.join(this.options.outputDir, 'test-automation-report.html');
    fs.writeFileSync(htmlReportPath, html);
  }

  /**
   * Generate JUnit XML report
   */
  async generateJUnitReport(reportData) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Test Automation" tests="${reportData.summary.total}" failures="${reportData.summary.failed}" time="${(reportData.totalDuration / 1000).toFixed(2)}">
  ${reportData.suites.map(suite => `
    <testsuite name="${suite.name}" tests="1" failures="${suite.status === 'failed' ? 1 : 0}" time="${(suite.duration / 1000).toFixed(2)}">
      <testcase name="${suite.name}" classname="TestAutomation" time="${(suite.duration / 1000).toFixed(2)}">
        ${suite.status === 'failed' ? `<failure message="${suite.error || 'Test failed'}">${suite.output || ''}</failure>` : ''}
      </testcase>
    </testsuite>
  `).join('')}
</testsuites>`;

    const xmlReportPath = path.join(this.options.outputDir, 'junit-report.xml');
    fs.writeFileSync(xmlReportPath, xml);
  }

  /**
   * Calculate test summary
   */
  calculateSummary() {
    const summary = {
      total: this.results.suites.length,
      passed: this.results.suites.filter(s => s.status === 'passed').length,
      failed: this.results.suites.filter(s => s.status === 'failed').length,
      skipped: this.results.suites.filter(s => s.status === 'skipped').length
    };

    summary.passRate = summary.total > 0 ? 
      Math.round((summary.passed / summary.total) * 100) : 0;

    this.results.summary = summary;
    return summary;
  }

  /**
   * Print final summary
   */
  async printFinalSummary() {
    const summary = this.calculateSummary();
    
    console.log(chalk.blue.bold('\n📊 FINAL TEST RESULTS'));
    console.log(chalk.blue('=========================================='));
    
    console.log(`\n🕐 Total Duration: ${chalk.yellow((this.results.totalDuration / 1000).toFixed(2) + 's')}`);
    console.log(`📊 Total Suites: ${chalk.blue(summary.total)}`);
    console.log(`✅ Passed: ${chalk.green(summary.passed)}`);
    console.log(`❌ Failed: ${chalk.red(summary.failed)}`);
    console.log(`⏭️ Skipped: ${chalk.yellow(summary.skipped)}`);
    console.log(`📈 Pass Rate: ${chalk.cyan(summary.passRate + '%')}`);

    // Individual suite results
    console.log('\n📋 Suite Results:');
    this.results.suites.forEach(suite => {
      const status = suite.status === 'passed' ? 
        chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      const duration = chalk.gray(`(${(suite.duration / 1000).toFixed(2)}s)`);
      console.log(`   ${status} ${suite.name} ${duration}`);
    });

    // Critical failures
    const criticalFailures = this.results.suites.filter(s => 
      s.status === 'failed' && s.critical
    );

    if (criticalFailures.length > 0) {
      console.log(chalk.red.bold('\n🚨 CRITICAL FAILURES:'));
      criticalFailures.forEach(suite => {
        console.log(chalk.red(`   • ${suite.name}: ${suite.error || 'Unknown error'}`));
      });
    }

    // Success/failure determination
    if (criticalFailures.length > 0) {
      console.log(chalk.red.bold('\n💥 TEST SUITE FAILED - Critical tests failed'));
      process.exit(1);
    } else if (summary.failed > 0) {
      console.log(chalk.yellow.bold('\n⚠️ TEST SUITE COMPLETED WITH WARNINGS - Non-critical tests failed'));
      console.log(chalk.gray('   Non-critical test failures do not block deployment'));
      process.exit(0);
    } else {
      console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED SUCCESSFULLY!'));
      process.exit(0);
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment() {
    console.log(chalk.yellow('🧹 Cleaning up test environment...'));
    
    // Kill any remaining test processes
    try {
      await this.executeCommand('pkill -f "jest" || true');
      await this.executeCommand('pkill -f "playwright" || true');
    } catch (error) {
      // Ignore cleanup errors
    }

    console.log(chalk.green('✅ Test environment cleaned up\n'));
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  let options = {
    parallel: args.includes('--parallel'),
    coverage: !args.includes('--no-coverage'),
    failFast: args.includes('--fail-fast'),
    verbose: args.includes('--verbose') || process.env.VERBOSE,
    generateReports: !args.includes('--no-reports')
  };

  // Handle specific suite execution
  const suiteIndex = args.indexOf('--suite');
  const suite = suiteIndex !== -1 ? args[suiteIndex + 1] : null;

  // Handle timeout option
  const timeoutIndex = args.indexOf('--timeout');
  if (timeoutIndex !== -1) {
    options.timeout = parseInt(args[timeoutIndex + 1]) * 1000;
  }

  // Handle retries option
  const retriesIndex = args.indexOf('--retries');
  if (retriesIndex !== -1) {
    options.retries = parseInt(args[retriesIndex + 1]);
  }

  const orchestrator = new TestAutomationOrchestrator(options);

  if (suite) {
    orchestrator.runSpecificSuite(suite);
  } else {
    orchestrator.runAllTests();
  }
}

module.exports = TestAutomationOrchestrator;