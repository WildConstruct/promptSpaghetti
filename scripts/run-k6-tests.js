#!/usr/bin/env node

/**
 * Automated K6 Load Testing Script for Epic 18
 * CI/CD integration for performance load testing
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// K6 Test Configuration
const k6Config = {
  testDir: 'server/src/performance/k6-tests',
  outputDir: 'test-results/k6',
  defaultOptions: {
    vus: 10,           // Virtual users
    duration: '30s',   // Test duration
    iterations: null,  // Number of iterations (null = duration-based)
    rps: null         // Requests per second limit
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],        // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],           // Error rate under 10%
    http_reqs: ['rate>10'],                  // At least 10 requests per second
    vus: ['value<=50'],                      // Max 50 virtual users
    data_received: ['rate<100000']           // Data received rate
  },
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      description: 'Baseline performance test with minimal load'
    },
    load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      description: 'Normal load test simulating typical usage'
    },
    stress: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 50 },      // Ramp up
        { duration: '2m', target: 50 },      // Stay at 50 users
        { duration: '1m', target: 100 },     // Ramp up further
        { duration: '2m', target: 100 },     // Stay at 100 users
        { duration: '1m', target: 0 }        // Ramp down
      ],
      description: 'Stress test to find breaking point'
    },
    spike: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 10 },     // Normal load
        { duration: '1m', target: 200 },     // Spike
        { duration: '30s', target: 10 },     // Back to normal
      ],
      description: 'Spike test for sudden traffic increases'
    },
    breakpoint: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 100 },     // Start with 100 RPS
        { duration: '5m', target: 200 },     // Increase to 200 RPS
        { duration: '5m', target: 300 },     // Further increase
        { duration: '5m', target: 400 },     // Push harder
        { duration: '3m', target: 0 }        // Ramp down
      ],
      description: 'Find the breaking point by increasing request rate'
    }
  }
};

class K6TestRunner {
  constructor(options = {}) {
    this.options = {
      scenario: 'baseline',
      outputFormat: 'console',
      generateReport: true,
      exitOnFailure: true,
      serverUrl: 'http://localhost:8000',
      ...options
    };
    
    this.results = {
      passed: true,
      summary: {},
      details: [],
      timestamp: Date.now()
    };
  }

  /**
   * Check if K6 is installed
   */
  checkK6Installation() {
    try {
      execSync('k6 version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`${colors.red}Error: K6 is not installed or not in PATH${colors.reset}`);
      console.log(`${colors.yellow}Install K6: https://k6.io/docs/getting-started/installation/${colors.reset}`);
      return false;
    }
  }

  /**
   * Check if server is running
   */
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.options.serverUrl}/health`);
      if (response.ok) {
        console.log(`${colors.green}✅ Server is running at ${this.options.serverUrl}${colors.reset}`);
        return true;
      } else {
        console.error(`${colors.red}❌ Server health check failed: ${response.status}${colors.reset}`);
        return false;
      }
    } catch (error) {
      console.error(`${colors.red}❌ Cannot connect to server at ${this.options.serverUrl}${colors.reset}`);
      console.log(`${colors.yellow}Start the server with: pnpm dev:server${colors.reset}`);
      return false;
    }
  }

  /**
   * Find available K6 test files
   */
  findTestFiles() {
    const testDir = path.join(process.cwd(), k6Config.testDir);
    
    if (!fs.existsSync(testDir)) {
      console.error(`${colors.red}Error: K6 test directory not found: ${testDir}${colors.reset}`);
      return [];
    }

    const files = fs.readdirSync(testDir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(testDir, file));

    console.log(`${colors.cyan}Found ${files.length} K6 test files:${colors.reset}`);
    files.forEach(file => {
      console.log(`  📄 ${path.basename(file)}`);
    });

    return files;
  }

  /**
   * Generate K6 options for scenario
   */
  generateK6Options(scenario) {
    const scenarioConfig = k6Config.scenarios[scenario] || k6Config.scenarios.baseline;
    
    const options = {
      scenarios: {
        [scenario]: scenarioConfig
      },
      thresholds: k6Config.thresholds
    };

    return JSON.stringify(options, null, 2);
  }

  /**
   * Create temporary K6 config file
   */
  createK6Config(scenario) {
    const configContent = `
// Auto-generated K6 configuration for ${scenario} scenario
export let options = ${this.generateK6Options(scenario)};

// Environment variables
export const BASE_URL = __ENV.BASE_URL || '${this.options.serverUrl}';
export const SCENARIO = '${scenario}';

// Custom metrics
import { Counter, Rate, Trend } from 'k6/metrics';

export const errorCount = new Counter('custom_errors');
export const successRate = new Rate('custom_success_rate');
export const responseTime = new Trend('custom_response_time');

// Setup function (runs once)
export function setup() {
  console.log('🚀 Starting K6 ${scenario} test');
  console.log('Server URL:', BASE_URL);
  console.log('Scenario:', SCENARIO);
  
  // Health check
  const response = http.get(BASE_URL + '/health');
  if (response.status !== 200) {
    throw new Error('Server health check failed');
  }
  
  return { startTime: Date.now() };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  const duration = Date.now() - data.startTime;
  console.log('✅ K6 test completed in', duration + 'ms');
}
`;

    const configPath = path.join(process.cwd(), 'k6-config.js');
    fs.writeFileSync(configPath, configContent);
    return configPath;
  }

  /**
   * Run K6 test
   */
  async runTest(testFile, scenario = 'baseline') {
    console.log(`${colors.blue}${colors.bright}🚀 Running K6 Test${colors.reset}`);
    console.log(`${colors.cyan}Test File: ${path.basename(testFile)}${colors.reset}`);
    console.log(`${colors.cyan}Scenario: ${scenario}${colors.reset}\n`);

    // Create output directory
    const outputDir = path.join(process.cwd(), k6Config.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `k6-${scenario}-${Date.now()}.json`);
    const configFile = this.createK6Config(scenario);

    try {
      // Build K6 command
      const k6Args = [
        'run',
        '--config', configFile,
        '--out', `json=${outputFile}`,
        '--env', `BASE_URL=${this.options.serverUrl}`,
        '--env', `SCENARIO=${scenario}`,
        testFile
      ];

      console.log(`${colors.cyan}Executing: k6 ${k6Args.join(' ')}${colors.reset}\n`);

      // Run K6 test
      const result = await this.executeK6(k6Args);
      
      // Parse results
      if (fs.existsSync(outputFile)) {
        this.results.details = this.parseK6Results(outputFile);
      }

      // Clean up
      if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile);
      }

      return result;

    } catch (error) {
      console.error(`${colors.red}K6 test failed: ${error.message}${colors.reset}`);
      this.results.passed = false;
      return false;
    }
  }

  /**
   * Execute K6 command
   */
  executeK6(args) {
    return new Promise((resolve, reject) => {
      const k6Process = spawn('k6', args, {
        stdio: 'inherit',
        env: { ...process.env }
      });

      k6Process.on('close', (code) => {
        if (code === 0) {
          console.log(`${colors.green}✅ K6 test completed successfully${colors.reset}`);
          resolve(true);
        } else {
          console.error(`${colors.red}❌ K6 test failed with exit code ${code}${colors.reset}`);
          this.results.passed = false;
          resolve(false);
        }
      });

      k6Process.on('error', (error) => {
        console.error(`${colors.red}Failed to start K6: ${error.message}${colors.reset}`);
        reject(error);
      });
    });
  }

  /**
   * Parse K6 JSON results
   */
  parseK6Results(outputFile) {
    try {
      const content = fs.readFileSync(outputFile, 'utf8');
      const lines = content.trim().split('\n');
      const results = lines.map(line => JSON.parse(line));
      
      // Extract summary metrics
      const summary = this.extractSummaryMetrics(results);
      this.results.summary = summary;
      
      return results;
    } catch (error) {
      console.warn(`Warning: Failed to parse K6 results: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract summary metrics from K6 results
   */
  extractSummaryMetrics(results) {
    const metrics = results.filter(r => r.type === 'Point');
    const summary = {
      totalRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      requestRate: 0
    };

    if (metrics.length === 0) return summary;

    // Calculate basic metrics
    const httpReqDurations = metrics
      .filter(m => m.metric === 'http_req_duration')
      .map(m => m.data.value)
      .sort((a, b) => a - b);

    const httpReqFailed = metrics
      .filter(m => m.metric === 'http_req_failed')
      .reduce((sum, m) => sum + m.data.value, 0);

    const httpReqs = metrics
      .filter(m => m.metric === 'http_reqs')
      .length;

    summary.totalRequests = httpReqs;
    summary.failedRequests = httpReqFailed;
    summary.avgResponseTime = httpReqDurations.length > 0 
      ? httpReqDurations.reduce((sum, val) => sum + val, 0) / httpReqDurations.length 
      : 0;
    summary.p95ResponseTime = httpReqDurations.length > 0 
      ? httpReqDurations[Math.floor(httpReqDurations.length * 0.95)] 
      : 0;

    return summary;
  }

  /**
   * Generate test report
   */
  generateReport() {
    if (!this.options.generateReport) return;

    console.log(`${colors.bright}📊 K6 Test Report${colors.reset}`);
    console.log(`${colors.bright}=================${colors.reset}\n`);

    // Overall status
    const statusColor = this.results.passed ? colors.green : colors.red;
    const statusText = this.results.passed ? 'PASSED' : 'FAILED';
    console.log(`Status: ${statusColor}${statusText}${colors.reset}\n`);

    // Summary metrics
    if (this.results.summary && Object.keys(this.results.summary).length > 0) {
      console.log(`${colors.bright}Summary:${colors.reset}`);
      console.log(`  Total Requests: ${this.results.summary.totalRequests}`);
      console.log(`  Failed Requests: ${this.results.summary.failedRequests}`);
      console.log(`  Avg Response Time: ${Math.round(this.results.summary.avgResponseTime)}ms`);
      console.log(`  P95 Response Time: ${Math.round(this.results.summary.p95ResponseTime)}ms`);
      console.log();
    }

    // Performance thresholds check
    const summary = this.results.summary;
    if (summary) {
      console.log(`${colors.bright}Threshold Checks:${colors.reset}`);
      console.log(`  ${summary.p95ResponseTime <= 500 ? '✅' : '❌'} P95 Response Time: ${Math.round(summary.p95ResponseTime)}ms (threshold: 500ms)`);
      console.log(`  ${(summary.failedRequests / summary.totalRequests) <= 0.1 ? '✅' : '❌'} Error Rate: ${((summary.failedRequests / summary.totalRequests) * 100).toFixed(2)}% (threshold: 10%)`);
      console.log();
    }

    console.log(`${colors.bright}=================${colors.reset}\n`);
  }

  /**
   * Run all scenarios
   */
  async runAllScenarios(testFile) {
    const scenarios = Object.keys(k6Config.scenarios);
    const results = {};

    for (const scenario of scenarios) {
      console.log(`${colors.magenta}📋 Running scenario: ${scenario}${colors.reset}`);
      const success = await this.runTest(testFile, scenario);
      results[scenario] = { success, summary: this.results.summary };
      
      if (!success && this.options.exitOnFailure) {
        console.error(`${colors.red}Stopping due to failure in ${scenario} scenario${colors.reset}`);
        break;
      }

      // Wait between scenarios
      if (scenario !== scenarios[scenarios.length - 1]) {
        console.log(`${colors.yellow}Waiting 10 seconds before next scenario...${colors.reset}\n`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    return results;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  let scenario = 'baseline';
  let testFile = null;
  let runAll = false;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scenario':
        scenario = args[++i];
        break;
      case '--test':
        testFile = args[++i];
        break;
      case '--server':
        options.serverUrl = args[++i];
        break;
      case '--all':
        runAll = true;
        break;
      case '--json':
        options.outputFormat = 'json';
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--no-exit':
        options.exitOnFailure = false;
        break;
      case '--help':
        console.log(`
K6 Load Testing Runner for Epic 18

Usage: node run-k6-tests.js [options]

Options:
  --scenario <name>    Run specific scenario (${Object.keys(k6Config.scenarios).join(', ')})
  --test <file>        Run specific test file
  --server <url>       Server URL (default: http://localhost:8000)
  --all                Run all scenarios
  --json               Output results in JSON format
  --no-report          Skip report generation
  --no-exit            Don't exit with error code on failure
  --help               Show this help message

Examples:
  node run-k6-tests.js --scenario load
  node run-k6-tests.js --test api-test.js --scenario stress
  node run-k6-tests.js --all --server http://localhost:3000
        `);
        process.exit(0);
        break;
    }
  }

  const runner = new K6TestRunner(options);

  // Check K6 installation
  if (!runner.checkK6Installation()) {
    process.exit(1);
  }

  // Check server health
  if (!(await runner.checkServerHealth())) {
    process.exit(1);
  }

  // Find test files
  const testFiles = runner.findTestFiles();
  if (testFiles.length === 0) {
    console.error(`${colors.red}No K6 test files found${colors.reset}`);
    process.exit(1);
  }

  // Determine which test to run
  const targetTest = testFile ? 
    testFiles.find(f => f.includes(testFile)) || testFiles[0] :
    testFiles[0];

  console.log(`${colors.cyan}Using test file: ${path.basename(targetTest)}${colors.reset}\n`);

  try {
    let success;
    if (runAll) {
      const results = await runner.runAllScenarios(targetTest);
      success = Object.values(results).every(r => r.success);
    } else {
      success = await runner.runTest(targetTest, scenario);
    }

    runner.generateReport();

    if (!success && options.exitOnFailure !== false) {
      process.exit(1);
    }

    console.log(`${colors.green}K6 testing completed successfully!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}K6 testing failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = K6TestRunner;