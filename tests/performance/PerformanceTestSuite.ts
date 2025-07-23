/**
 * Integrated Performance Test Suite
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562342-A89910 - Add performance testing
 *
 * Comprehensive performance testing integration that ties together:
 * - performance-test-runner.js orchestration
 * - load-tests/scenarios/ load testing framework
 * - tests/infrastructure/performance-scenarios.ts scenarios
 * - tests/scenarios/PerformanceScenarios.ts user workflows
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { TestScenarioFramework } from '../scenarios/TestScenarioFramework';
import { PerformanceScenarios as UserPerformanceScenarios } from '../scenarios/PerformanceScenarios';
import { PerformanceScenarios as InfraPerformanceScenarios } from '../infrastructure/performance-scenarios';

export interface PerformanceTestConfig {
  baseUrl?: string;
  concurrency?: number;
  duration?: number;
  rampUpTime?: number;
  outputDir?: string;
  generateReports?: boolean;
  includeLoadTests?: boolean;
  includeScenarios?: boolean;
  includeUserWorkflows?: boolean;
  thresholds?: PerformanceThresholds;
}

export interface PerformanceThresholds {
  maxResponseTime?: number;
  minThroughput?: number;
  maxErrorRate?: number;
  maxMemoryUsage?: number;
  maxCpuUsage?: number;
}

export interface PerformanceTestResult {
  testSuite: string;
  timestamp: string;
  duration: number;
  passed: boolean;
  results: {
    loadTests?: unknown;
    infrastructureScenarios?: unknown;
    userWorkflows?: unknown;
    orchestration?: unknown;
  };
  thresholdViolations: string[];
  recommendations: string[];
}

export class PerformanceTestSuite {
  private config: PerformanceTestConfig;
  private outputDir: string;
  private testStartTime: Date;
  private runningProcesses: ChildProcess[] = [];

  constructor(config: PerformanceTestConfig = {}) {
    this.config = {
      baseUrl: 'http://localhost:8000',
      concurrency: 10,
      duration: 60000, // 1 minute
      rampUpTime: 10000, // 10 seconds
      outputDir: './performance-test-results',
      generateReports: true,
      includeLoadTests: true,
      includeScenarios: true,
      includeUserWorkflows: true,
      thresholds: {
        maxResponseTime: 2000,
        minThroughput: 10,
        maxErrorRate: 0.05,
        maxMemoryUsage: 512,
        maxCpuUsage: 80
      },
      ...config
    };

    this.outputDir = this.config.outputDir!;
    this.testStartTime = new Date();
  }

  /**
   * Execute comprehensive performance test suite
   */
  async executeFullSuite(): Promise<PerformanceTestResult> {
    console.log('🚀 Starting Comprehensive Performance Test Suite');
    console.log('=' .repeat(80));
    console.log(`Base URL: ${this.config.baseUrl}`);
    console.log(`Concurrency: ${this.config.concurrency}`);
    console.log(`Duration: ${this.config.duration! / 1000}s`);
    console.log(`Output: ${this.outputDir}`);
    console.log('');

    await this.setupOutputDirectory();

    const result: PerformanceTestResult = {
      testSuite: 'comprehensive',
      timestamp: this.testStartTime.toISOString(),
      duration: 0,
      passed: true,
      results: {},
      thresholdViolations: [],
      recommendations: []
    };

    try {
      // 1. Execute Load Testing Scenarios
      if (this.config.includeLoadTests) {
        console.log('📊 Executing Load Testing Scenarios...');
        result.results.loadTests = await this.executeLoadTests();
      }

      // 2. Execute Infrastructure Performance Scenarios
      if (this.config.includeScenarios) {
        console.log('🏗️ Executing Infrastructure Performance Scenarios...');
        result.results.infrastructureScenarios = await this.executeInfrastructureScenarios();
      }

      // 3. Execute User Workflow Performance Testing
      if (this.config.includeUserWorkflows) {
        console.log('👤 Executing User Workflow Performance Testing...');
        result.results.userWorkflows = await this.executeUserWorkflows();
      }

      // 4. Execute Main Performance Test Runner
      console.log('🎯 Executing Main Performance Test Runner...');
      result.results.orchestration = await this.executeMainPerformanceRunner();

      // 5. Analyze Results and Generate Reports
      console.log('📈 Analyzing Results and Generating Reports...');
      await this.analyzeResults(result);
      
      if (this.config.generateReports) {
        await this.generateReports(result);
      }

      result.duration = Date.now() - this.testStartTime.getTime();
      result.passed = result.thresholdViolations.length === 0;

      this.displaySummary(result);
      return result;

    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
      result.passed = false;
      result.duration = Date.now() - this.testStartTime.getTime();
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Execute load testing scenarios
   */
  private async executeLoadTests(): Promise<any> {
    try {
      // Execute baseline load test
      const baselineResult = await this.runLoadTestScenario('baseline_light');
      
      // Execute stress test if baseline passes
      let stressResult = null;
      if (baselineResult.success) {
        stressResult = await this.runLoadTestScenario('stress_medium');
      }

      return {
        baseline: baselineResult,
        stress: stressResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Load tests failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Execute infrastructure performance scenarios
   */
  private async executeInfrastructureScenarios(): Promise<any> {
    try {
      const infraScenarios = new InfraPerformanceScenarios();
      
      // Execute key infrastructure scenarios
      const scenarios = [
        'graph-execution-small',
        'graph-execution-large',
        'api-performance-baseline',
        'memory-usage-monitoring'
      ];

      const results = [];
      for (const scenarioId of scenarios) {
        try {
          console.log(`  - Executing ${scenarioId}...`);
          const result = await infraScenarios.executeScenario(scenarioId);
          results.push({ scenarioId, success: true, result });
        } catch (error) {
          console.warn(`  ⚠️ Scenario ${scenarioId} failed:`, error.message);
          results.push({ scenarioId, success: false, error: error.message });
        }
      }

      return {
        scenarios: results,
        summary: {
          total: scenarios.length,
          passed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Infrastructure scenarios failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Execute user workflow performance testing
   */
  private async executeUserWorkflows(): Promise<any> {
    try {
      const framework = new TestScenarioFramework();
      
      // Execute performance-focused user workflows
      const workflows = [
        UserPerformanceScenarios.getGraphExecutionPerformanceScenario(),
        UserPerformanceScenarios.getUIResponsivenessScenario(),
        UserPerformanceScenarios.getMemoryPerformanceScenario()
      ];

      const results = [];
      for (const workflow of workflows) {
        try {
          console.log(`  - Executing ${workflow.name}...`);
          const result = await framework.executeScenario(workflow.id);
          results.push({ workflow: workflow.name, success: true, result });
        } catch (error) {
          console.warn(`  ⚠️ Workflow ${workflow.name} failed:`, error.message);
          results.push({ workflow: workflow.name, success: false, error: error.message });
        }
      }

      return {
        workflows: results,
        summary: {
          total: workflows.length,
          passed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ User workflows failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Execute main performance test runner
   */
  private async executeMainPerformanceRunner(): Promise<any> {
    return new Promise((resolve, reject) => {
      const runnerPath = path.join(process.cwd(), 'performance-test-runner.js');
      
      const args = [
        '--concurrency', this.config.concurrency!.toString(),
        '--duration', (this.config.duration! / 1000).toString(),
        '--output', this.outputDir,
        '--format', 'json'
      ];

      const process = spawn('node', [runnerPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      this.runningProcesses.push(process);

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (this.config.generateReports) {
          console.log(data.toString().trim());
        }
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
        console.error(data.toString().trim());
      });

      process.on('close', (code) => {
        this.runningProcesses = this.runningProcesses.filter(p => p !== process);
        
        if (code === 0) {
          try {
            // Try to parse JSON results
            const results = stdout.includes('{') ? JSON.parse(stdout.split('\n').find(line => line.includes('{')) || '{}') : {};
            resolve({
              success: true,
              exitCode: code,
              results,
              stdout: stdout.trim(),
              stderr: stderr.trim()
            });
          } catch (parseError) {
            resolve({
              success: true,
              exitCode: code,
              results: {},
              stdout: stdout.trim(),
              stderr: stderr.trim(),
              parseError: parseError.message
            });
          }
        } else {
          reject(new Error(`Performance runner failed with exit code ${code}\nStderr: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        this.runningProcesses = this.runningProcesses.filter(p => p !== process);
        reject(error);
      });
    });
  }

  /**
   * Run individual load test scenario
   */
  private async runLoadTestScenario(scenarioName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const scenarioRunnerPath = path.join(process.cwd(), 'load-tests', 'scenarios', 'run-load-scenarios.js');
      
      const args = [
        '--scenario', scenarioName,
        '--base-url', this.config.baseUrl!,
        '--output', path.join(this.outputDir, 'load-tests')
      ];

      const process = spawn('node', [scenarioRunnerPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.runningProcesses.push(process);

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        this.runningProcesses = this.runningProcesses.filter(p => p !== process);
        
        resolve({
          scenario: scenarioName,
          success: code === 0,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      process.on('error', (error) => {
        this.runningProcesses = this.runningProcesses.filter(p => p !== process);
        resolve({
          scenario: scenarioName,
          success: false,
          error: error.message
        });
      });
    });
  }

  /**
   * Analyze results against thresholds
   */
  private async analyzeResults(result: PerformanceTestResult): Promise<void> {
    const thresholds = this.config.thresholds!;
    
    // Analyze orchestration results
    if (result.results.orchestration?.results) {
      const metrics = result.results.orchestration.results;
      
      if (metrics.averageResponseTime > thresholds.maxResponseTime!) {
        result.thresholdViolations.push(
          `Response time exceeded threshold: ${metrics.averageResponseTime}ms > ${thresholds.maxResponseTime}ms`
        );
      }
      
      if (metrics.requestsPerSecond < thresholds.minThroughput!) {
        result.thresholdViolations.push(
          `Throughput below threshold: ${metrics.requestsPerSecond} < ${thresholds.minThroughput}`
        );
      }
      
      if (metrics.errorRate > thresholds.maxErrorRate!) {
        result.thresholdViolations.push(
          `Error rate exceeded threshold: ${metrics.errorRate} > ${thresholds.maxErrorRate}`
        );
      }
    }

    // Generate recommendations
    if (result.thresholdViolations.length > 0) {
      result.recommendations.push(
        'Performance issues detected. Consider:',
        '- Optimizing database queries',
        '- Implementing caching strategies',
        '- Scaling infrastructure resources',
        '- Reviewing algorithmic complexity'
      );
    } else {
      result.recommendations.push(
        'Performance tests passed!',
        'System is performing within acceptable thresholds.'
      );
    }
  }

  /**
   * Generate comprehensive reports
   */
  private async generateReports(result: PerformanceTestResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Generate JSON report
    const jsonReport = path.join(this.outputDir, `performance-suite-${timestamp}.json`);
    await fs.writeFile(jsonReport, JSON.stringify(result, null, 2));
    
    // Generate HTML report
    const htmlReport = path.join(this.outputDir, `performance-suite-${timestamp}.html`);
    await fs.writeFile(htmlReport, this.generateHTMLReport(result));
    
    // Generate text summary
    const textReport = path.join(this.outputDir, `performance-suite-summary-${timestamp}.txt`);
    await fs.writeFile(textReport, this.generateTextSummary(result));
    
    console.log('📄 Reports generated:');
    console.log(`  - JSON: ${jsonReport}`);
    console.log(`  - HTML: ${htmlReport}`);
    console.log(`  - Summary: ${textReport}`);
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(result: PerformanceTestResult): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Suite Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
        .violation { background: #ffebee; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .recommendation { background: #e3f2fd; padding: 10px; margin: 5px 0; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Test Suite Report</h1>
        <p><strong>Timestamp:</strong> ${result.timestamp}</p>
        <p><strong>Duration:</strong> ${Math.ceil(result.duration / 1000)}s</p>
        <p><strong>Status:</strong> <span class="${result.passed ? 'passed' : 'failed'}">${result.passed ? 'PASSED' : 'FAILED'}</span></p>
    </div>
    
    ${result.thresholdViolations.length > 0 ? `
    <div class="section">
        <h2>Threshold Violations</h2>
        ${result.thresholdViolations.map(v => `<div class="violation">${v}</div>`).join('')}
    </div>` : ''}
    
    <div class="section">
        <h2>Recommendations</h2>
        ${result.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
    </div>
    
    <div class="section">
        <h2>Test Results Summary</h2>
        <pre>${JSON.stringify(result.results, null, 2)}</pre>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text summary
   */
  private generateTextSummary(result: PerformanceTestResult): string {
    let summary = 'PERFORMANCE TEST SUITE SUMMARY\n';
    summary += '================================\n\n';
    summary += `Test Suite: ${result.testSuite}\n`;
    summary += `Timestamp: ${result.timestamp}\n`;
    summary += `Duration: ${Math.ceil(result.duration / 1000)}s\n`;
    summary += `Status: ${result.passed ? 'PASSED' : 'FAILED'}\n\n`;
    
    if (result.thresholdViolations.length > 0) {
      summary += `THRESHOLD VIOLATIONS (${result.thresholdViolations.length})\n`;
      summary += `${'='.repeat(30)}\n`;
      result.thresholdViolations.forEach(violation => {
        summary += `- ${violation}\n`;
      });
      summary += '\n';
    }
    
    summary += 'RECOMMENDATIONS\n';
    summary += '===============\n';
    result.recommendations.forEach(rec => {
      summary += `- ${rec}\n`;
    });
    
    return summary;
  }

  /**
   * Setup output directory
   */
  private async setupOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'load-tests'), { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'scenarios'), { recursive: true });
    } catch (error) {
      console.warn('Warning: Failed to create output directories:', error);
    }
  }

  /**
   * Display test summary
   */
  private displaySummary(result: PerformanceTestResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('🏁 PERFORMANCE TEST SUITE SUMMARY');
    console.log('=' .repeat(80));
    console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${Math.ceil(result.duration / 1000)}s`);
    
    if (result.thresholdViolations.length > 0) {
      console.log(`\n⚠️ Threshold Violations (${result.thresholdViolations.length}):`);
      result.thresholdViolations.forEach(violation => {
        console.log(`  - ${violation}`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
    
    console.log('\n📊 Test Components:');
    if (result.results.loadTests) console.log('  ✓ Load Testing Scenarios');
    if (result.results.infrastructureScenarios) console.log('  ✓ Infrastructure Performance Scenarios');
    if (result.results.userWorkflows) console.log('  ✓ User Workflow Performance Testing');
    if (result.results.orchestration) console.log('  ✓ Main Performance Test Runner');
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    // Terminate any running processes
    for (const process of this.runningProcesses) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    }
    this.runningProcesses = [];
  }
}

// CLI Interface
if (require.main === module) {
  const config: PerformanceTestConfig = {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    concurrency: parseInt(process.env.PERF_CONCURRENCY || '10'),
    duration: parseInt(process.env.PERF_DURATION || '60000'),
    outputDir: process.env.PERF_OUTPUT_DIR || './performance-test-results'
  };
  
  const suite = new PerformanceTestSuite(config);
  
  suite.executeFullSuite()
    .then(result => {
      console.log('\n✅ Performance test suite completed');
      process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Performance test suite failed:', error);
      process.exit(1);
    });
}

export { PerformanceTestSuite };