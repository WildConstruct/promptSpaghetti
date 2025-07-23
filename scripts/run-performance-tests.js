#!/usr/bin/env node

/**
 * Performance Tests Runner Script
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562342-A89910 - Add performance testing
 *
 * Orchestrates comprehensive performance testing including:
 * - Integrated performance test suite
 * - Load testing scenarios
 * - Infrastructure performance scenarios
 * - User workflow performance testing
 * - Performance test runner integration
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class PerformanceTestRunner {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    this.outputDir = './performance-test-results';
    this.verbose = false;
  }

  /**
   * Parse command line arguments
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      suite: 'comprehensive',
      baseUrl: this.baseUrl,
      concurrency: 10,
      duration: 60,
      output: this.outputDir,
      verbose: false,
      help: false,
      quick: false,
      stress: false,
      reports: true
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
      case '--suite':
      case '-s':
        options.suite = args[++i];
        break;
      case '--base-url':
      case '--url':
        options.baseUrl = args[++i];
        break;
      case '--concurrency':
      case '-c':
        options.concurrency = parseInt(args[++i]);
        break;
      case '--duration':
      case '-d':
        options.duration = parseInt(args[++i]);
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--quick':
      case '-q':
        options.quick = true;
        options.duration = 30;
        options.concurrency = 5;
        break;
      case '--stress':
        options.stress = true;
        options.duration = 300;
        options.concurrency = 50;
        break;
      case '--no-reports':
        options.reports = false;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`);
        }
      }
    }

    return options;
  }

  /**
   * Display help information
   */
  displayHelp() {
    console.log(`
🚀 Performance Tests Runner
${'='.repeat(50)}

Usage: node run-performance-tests.js [options]

Test Suite Options:
  -s, --suite TYPE           Test suite type: comprehensive, quick, load-only, scenarios-only
  -q, --quick               Quick test (30s, 5 users)
      --stress              Stress test (5min, 50 users)

Configuration Options:
      --base-url URL        Set API base URL (default: http://localhost:8000)
  -c, --concurrency N       Concurrent users (default: 10)
  -d, --duration N          Test duration in seconds (default: 60)
  -o, --output DIR          Output directory (default: ./performance-test-results)

Execution Options:
  -v, --verbose            Enable verbose logging
      --no-reports         Skip report generation
  -h, --help               Display this help message

Examples:
  # Run comprehensive performance test suite
  node run-performance-tests.js
  
  # Quick performance check
  node run-performance-tests.js --quick
  
  # Stress testing
  node run-performance-tests.js --stress
  
  # Custom configuration
  node run-performance-tests.js --concurrency 20 --duration 120
  
  # Load testing only
  node run-performance-tests.js --suite load-only

Environment Variables:
  API_BASE_URL             Sets the base URL for API calls
  PERF_CONCURRENCY         Sets default concurrency
  PERF_DURATION            Sets default duration (seconds)
  PERF_OUTPUT_DIR          Sets default output directory
`);
  }

  /**
   * Run integrated performance test suite
   */
  async runIntegratedSuite(options) {
    console.log('🎯 Running Integrated Performance Test Suite');
    console.log('=' .repeat(60));
    
    return this.runTypeScriptScript(
      'tests/performance/PerformanceTestSuite.ts',
      [],
      {
        API_BASE_URL: options.baseUrl,
        PERF_CONCURRENCY: options.concurrency.toString(),
        PERF_DURATION: (options.duration * 1000).toString(),
        PERF_OUTPUT_DIR: options.output
      }
    );
  }

  /**
   * Run load testing scenarios
   */
  async runLoadTests(options) {
    console.log('📊 Running Load Testing Scenarios');
    console.log('=' .repeat(60));
    
    const scenarios = options.stress ? ['stress_heavy'] : ['baseline_light', 'baseline_medium'];
    const results = [];
    
    for (const scenario of scenarios) {
      console.log(`\n🔄 Executing load test scenario: ${scenario}`);
      
      try {
        const result = await this.runNodeScript(
          'load-tests/scenarios/run-load-scenarios.js',
          [
            '--scenario', scenario,
            '--base-url', options.baseUrl,
            '--output', path.join(options.output, 'load-tests')
          ]
        );
        
        results.push({ scenario, success: result.success, result });
      } catch (error) {
        console.error(`❌ Load test scenario ${scenario} failed:`, error.message);
        results.push({ scenario, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Run main performance test runner
   */
  async runMainPerformanceRunner(options) {
    console.log('🎯 Running Main Performance Test Runner');
    console.log('=' .repeat(60));
    
    return this.runNodeScript(
      'performance-test-runner.js',
      [
        '--concurrency', options.concurrency.toString(),
        '--duration', options.duration.toString(),
        '--output', options.output,
        '--format', 'json'
      ]
    );
  }

  /**
   * Run TypeScript script using ts-node
   */
  async runTypeScriptScript(scriptPath, args = [], env = {}) {
    return new Promise((resolve, reject) => {
      const fullEnv = { ...process.env, ...env };
      
      const child = spawn('npx', ['ts-node', scriptPath, ...args], {
        stdio: this.verbose ? 'inherit' : 'pipe',
        env: fullEnv
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            exitCode: code,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        } else {
          reject(new Error(`Script failed with exit code ${code}\nStderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Run Node.js script
   */
  async runNodeScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath, ...args], {
        stdio: this.verbose ? 'inherit' : 'pipe'
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Setup output directory
   */
  async setupOutputDirectory(outputDir) {
    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.mkdir(path.join(outputDir, 'load-tests'), { recursive: true });
      await fs.mkdir(path.join(outputDir, 'scenarios'), { recursive: true });
      await fs.mkdir(path.join(outputDir, 'reports'), { recursive: true });
    } catch (error) {
      console.warn('Warning: Failed to create output directories:', error.message);
    }
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(results, options) {
    if (!options.reports) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(options.output, 'reports', `performance-summary-${timestamp}.json`);
    
    const summary = {
      timestamp: new Date().toISOString(),
      configuration: {
        baseUrl: options.baseUrl,
        concurrency: options.concurrency,
        duration: options.duration,
        suite: options.suite
      },
      results,
      summary: {
        totalTests: Object.keys(results).length,
        successful: Object.values(results).filter(r => r && r.success !== false).length,
        failed: Object.values(results).filter(r => r && r.success === false).length
      }
    };
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(summary, null, 2));
      console.log(`📄 Summary report generated: ${reportPath}`);
    } catch (error) {
      console.warn('Warning: Failed to generate summary report:', error.message);
    }
  }

  /**
   * Main execution method
   */
  async run() {
    const options = this.parseArgs();
    
    if (options.help) {
      this.displayHelp();
      return process.exit(0);
    }
    
    this.verbose = options.verbose;
    
    console.log('🚀 Performance Tests Runner');
    console.log('=' .repeat(50));
    console.log(`Suite: ${options.suite}`);
    console.log(`Base URL: ${options.baseUrl}`);
    console.log(`Concurrency: ${options.concurrency}`);
    console.log(`Duration: ${options.duration}s`);
    console.log(`Output: ${options.output}`);
    console.log('');
    
    await this.setupOutputDirectory(options.output);
    
    const results = {};
    let overallSuccess = true;
    
    try {
      switch (options.suite) {
      case 'comprehensive':
        // Run all test types
        console.log('🎯 Running Comprehensive Performance Test Suite\n');
          
        results.integrated = await this.runIntegratedSuite(options);
        if (!results.integrated.success) overallSuccess = false;
          
        results.loadTests = await this.runLoadTests(options);
        if (results.loadTests.some(r => !r.success)) overallSuccess = false;
          
        results.mainRunner = await this.runMainPerformanceRunner(options);
        if (!results.mainRunner.success) overallSuccess = false;
          
        break;
          
      case 'quick':
        console.log('⚡ Running Quick Performance Check\n');
        results.mainRunner = await this.runMainPerformanceRunner(options);
        overallSuccess = results.mainRunner.success;
        break;
          
      case 'load-only':
        console.log('📊 Running Load Tests Only\n');
        results.loadTests = await this.runLoadTests(options);
        overallSuccess = !results.loadTests.some(r => !r.success);
        break;
          
      case 'scenarios-only':
        console.log('🎭 Running Scenarios Only\n');
        results.integrated = await this.runIntegratedSuite(options);
        overallSuccess = results.integrated.success;
        break;
          
      default:
        throw new Error(`Unknown test suite: ${options.suite}`);
      }
      
      await this.generateSummaryReport(results, options);
      
      console.log('\n' + '='.repeat(50));
      console.log('🏁 PERFORMANCE TESTS SUMMARY');
      console.log('=' .repeat(50));
      console.log(`Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Suite: ${options.suite}`);
      
      if (results.integrated) {
        console.log(`Integrated Suite: ${results.integrated.success ? '✅' : '❌'}`);
      }
      
      if (results.loadTests) {
        const passedLoad = results.loadTests.filter(r => r.success).length;
        const totalLoad = results.loadTests.length;
        console.log(`Load Tests: ${passedLoad}/${totalLoad} passed`);
      }
      
      if (results.mainRunner) {
        console.log(`Main Runner: ${results.mainRunner.success ? '✅' : '❌'}`);
      }
      
      console.log(`\n📊 Results saved to: ${options.output}`);
      console.log('=' .repeat(50));
      
      process.exit(overallSuccess ? 0 : 1);
      
    } catch (error) {
      console.error('\n❌ Performance tests failed:', error.message);
      
      if (options.verbose) {
        console.error('\nFull error details:');
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.run().catch(console.error);
}

module.exports = { PerformanceTestRunner };