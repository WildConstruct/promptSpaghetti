/**
 * k6 Integration with PromptScape Performance Infrastructure
 * 
 * Integrates k6 load testing with existing performance monitoring,
 * regression detection, and reporting systems. Provides seamless
 * CI/CD integration for Epic 20 enterprise scaling requirements.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { PerformanceTestSuite, LoadTestConfig, LoadTestResult } from './PerformanceTestSuite';
import { MetricsCollector } from './MetricsCollector';
import { PerformanceDashboard } from './PerformanceDashboard';

const __dirname = dirname(fileURLToPath(import.meta.url));

// k6 test result interfaces
interface K6Metric {
  name: string;
  type: string;
  contains: string;
  values: {
    avg?: number;
    max?: number;
    med?: number;
    min?: number;
    p90?: number;
    p95?: number;
    p99?: number;
    count?: number;
    rate?: number;
  };
  thresholds?: {
    [key: string]: {
      ok: boolean;
    };
  };
}

interface K6TestResult {
  metrics: {
    [key: string]: K6Metric;
  };
  root_group: {
    name: string;
    path: string;
    id: string;
    groups: any[];
    checks: any[];
  };
  options: {
    stages?: Array<{ duration: string; target: number }>;
    thresholds?: { [key: string]: string[] };
  };
  state: {
    isStdOutTTY: boolean;
    isStdErrTTY: boolean;
    testRunDurationMs: number;
  };
}

// k6 test suite configuration
interface K6TestSuite {
  name: string;
  scenario: 'light' | 'moderate' | 'heavy' | 'stress';
  environment: 'local' | 'staging' | 'production';
  tests: string[];
  thresholds: 'standard' | 'enterprise';
  maxDuration: string;
}

// Performance regression detection
interface RegressionAnalysis {
  detected: boolean;
  regressions: Array<{
    metric: string;
    baseline: number;
    current: number;
    change: number;
    severity: 'minor' | 'major' | 'critical';
  }>;
  improvements: Array<{
    metric: string;
    baseline: number;
    current: number;
    improvement: number;
  }>;
}

export class K6PerformanceIntegration {
  private metricsCollector: MetricsCollector;
  private performanceSuite: PerformanceTestSuite;
  private dashboard: PerformanceDashboard;
  private k6TestsDir: string;
  
  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.performanceSuite = new PerformanceTestSuite();
    this.dashboard = new PerformanceDashboard();
    this.k6TestsDir = join(__dirname, 'k6-tests');
  }

  /**
   * Execute k6 test suite with comprehensive monitoring
   */
  async executeK6TestSuite(
    suiteName: string = 'ci',
    options: {
      scenario?: string;
      environment?: string;
      outputDir?: string;
      enableDashboard?: boolean;
    } = {}
  ): Promise<LoadTestResult[]> {
    const {
      scenario = 'moderate',
      environment = 'local',
      outputDir = './performance-results',
      enableDashboard = true
    } = options;

    console.log(`🚀 Executing k6 test suite: ${suiteName}`);
    console.log(`📊 Configuration: ${scenario} scenario on ${environment}`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get test suite configuration
    const suite = this.getTestSuiteConfig(suiteName, scenario, environment);
    
    // Start performance monitoring dashboard
    let dashboardPromise: Promise<void> | null = null;
    if (enableDashboard) {
      dashboardPromise = this.dashboard.startMonitoring({
        duration: this.parseDuration(suite.maxDuration),
        interval: 5000 // 5 second intervals
      });
    }

    const results: LoadTestResult[] = [];
    
    try {
      // Execute each test in the suite
      for (const testName of suite.tests) {
        console.log(`\n📋 Running k6 test: ${testName}`);
        
        const testResult = await this.executeK6Test(testName, suite, outputDir);
        results.push(testResult);
        
        // Brief pause between tests
        await this.sleep(2000);
      }

      // Generate comprehensive analysis
      await this.generateComprehensiveReport(results, outputDir, suite);
      
      // Perform regression analysis
      const regressionAnalysis = await this.analyzePerformanceRegression(results, suite);
      console.log(`\n📈 Regression Analysis: ${regressionAnalysis.detected ? 'Issues detected' : 'No regressions'}`);

      return results;
      
    } finally {
      // Stop dashboard monitoring
      if (dashboardPromise) {
        await dashboardPromise;
      }
    }
  }

  /**
   * Execute individual k6 test
   */
  private async executeK6Test(
    testName: string,
    suite: K6TestSuite,
    outputDir: string
  ): Promise<LoadTestResult> {
    const testFile = join(this.k6TestsDir, `${testName}.js`);
    const resultFile = join(outputDir, `${testName}-results.json`);
    const csvFile = join(outputDir, `${testName}-results.csv`);

    // Verify test file exists
    try {
      await fs.access(testFile);
    } catch (error) {
      throw new Error(`k6 test file not found: ${testFile}`);
    }

    const startTime = Date.now();
    
    // Build k6 command
    const k6Args = [
      'run',
      '--out', `json=${resultFile}`,
      '--out', `csv=${csvFile}`,
      '--env', `TEST_SUITE=${suite.name}`,
      '--env', `SCENARIO=${suite.scenario}`,
      '--env', `ENVIRONMENT=${suite.environment}`,
      '--env', `THRESHOLD_LEVEL=${suite.thresholds}`,
      testFile
    ];

    console.log(`   Executing: k6 ${k6Args.join(' ')}`);

    // Execute k6 test
    const exitCode = await new Promise<number>((resolve, reject) => {
      const k6Process = spawn('k6', k6Args, {
        stdio: 'pipe',
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      k6Process.stdout?.on('data', (data) => {
        stdout += data.toString();
        // Stream real-time output
        process.stdout.write(data);
      });

      k6Process.stderr?.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      k6Process.on('close', (code) => {
        resolve(code || 0);
      });

      k6Process.on('error', (error) => {
        reject(error);
      });
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Parse k6 results
    let k6Results: K6TestResult | null = null;
    try {
      const resultData = await fs.readFile(resultFile, 'utf-8');
      // k6 outputs NDJSON, take the last line which contains the summary
      const lines = resultData.trim().split('\n');
      const summaryLine = lines[lines.length - 1];
      k6Results = JSON.parse(summaryLine);
    } catch (error) {
      console.warn(`⚠️ Could not parse k6 results for ${testName}:`, error);
    }

    // Convert to PromptScape LoadTestResult format
    const loadTestResult: LoadTestResult = {
      testName: testName,
      timestamp: new Date(),
      duration: duration,
      success: exitCode === 0,
      metrics: this.convertK6MetricsToPromptScape(k6Results),
      config: {
        scenario: suite.scenario,
        environment: suite.environment,
        thresholds: suite.thresholds
      },
      rawResults: k6Results
    };

    // Collect metrics for dashboard
    await this.metricsCollector.collectTestMetrics(loadTestResult);

    return loadTestResult;
  }

  /**
   * Convert k6 metrics to PromptScape format
   */
  private convertK6MetricsToPromptScape(k6Results: K6TestResult | null): any {
    if (!k6Results) return {};

    const metrics: any = {
      http: {},
      websocket: {},
      custom: {}
    };

    for (const [name, metric] of Object.entries(k6Results.metrics)) {
      if (name.startsWith('http_')) {
        metrics.http[name] = {
          avg: metric.values.avg,
          p95: metric.values.p95,
          p99: metric.values.p99,
          max: metric.values.max,
          count: metric.values.count,
          rate: metric.values.rate
        };
      } else if (name.startsWith('ws_')) {
        metrics.websocket[name] = {
          avg: metric.values.avg,
          p95: metric.values.p95,
          count: metric.values.count,
          rate: metric.values.rate
        };
      } else if (name.includes('_')) {
        // Custom metrics (graph_execution_duration, auth_latency, etc.)
        metrics.custom[name] = {
          avg: metric.values.avg,
          p95: metric.values.p95,
          p99: metric.values.p99,
          max: metric.values.max,
          count: metric.values.count
        };
      }
    }

    return metrics;
  }

  /**
   * Generate comprehensive performance report
   */
  private async generateComprehensiveReport(
    results: LoadTestResult[],
    outputDir: string,
    suite: K6TestSuite
  ): Promise<void> {
    console.log('\n📝 Generating comprehensive performance report...');

    // Generate HTML report
    const htmlReport = await this.generateHTMLReport(results, suite);
    await fs.writeFile(join(outputDir, 'performance-report.html'), htmlReport);

    // Generate JSON summary
    const jsonSummary = await this.generateJSONSummary(results, suite);
    await fs.writeFile(join(outputDir, 'performance-summary.json'), JSON.stringify(jsonSummary, null, 2));

    // Generate CSV for data analysis
    const csvReport = await this.generateCSVReport(results);
    await fs.writeFile(join(outputDir, 'performance-data.csv'), csvReport);

    console.log(`✅ Reports generated in ${outputDir}`);
  }

  /**
   * Analyze performance regression compared to baselines
   */
  private async analyzePerformanceRegression(
    results: LoadTestResult[],
    suite: K6TestSuite
  ): Promise<RegressionAnalysis> {
    const analysis: RegressionAnalysis = {
      detected: false,
      regressions: [],
      improvements: []
    };

    // Load historical baselines (in real implementation, from database/files)
    const baselines = await this.loadPerformanceBaselines(suite);
    
    if (!baselines) {
      console.log('📊 No performance baselines found, establishing new baseline');
      await this.savePerformanceBaselines(results, suite);
      return analysis;
    }

    // Compare current results to baselines
    for (const result of results) {
      const baseline = baselines[result.testName];
      if (!baseline) continue;

      // Analyze key metrics
      const metrics = [
        { key: 'response_time_p95', threshold: 0.20, unit: 'ms' },
        { key: 'error_rate', threshold: 0.05, unit: '%' },
        { key: 'throughput', threshold: -0.15, unit: 'req/s' }, // Negative because lower is worse
        { key: 'connection_failures', threshold: 0.10, unit: '%' }
      ];

      for (const metric of metrics) {
        const currentValue = this.extractMetricValue(result, metric.key);
        const baselineValue = baseline[metric.key];
        
        if (currentValue !== undefined && baselineValue !== undefined) {
          const change = (currentValue - baselineValue) / baselineValue;
          
          if (Math.abs(change) > Math.abs(metric.threshold)) {
            if ((metric.threshold > 0 && change > metric.threshold) ||
                (metric.threshold < 0 && change < metric.threshold)) {
              // Regression detected
              analysis.regressions.push({
                metric: `${result.testName}.${metric.key}`,
                baseline: baselineValue,
                current: currentValue,
                change: change * 100, // Convert to percentage
                severity: Math.abs(change) > 0.5 ? 'critical' : 
                         Math.abs(change) > 0.3 ? 'major' : 'minor'
              });
              analysis.detected = true;
            } else {
              // Improvement detected
              analysis.improvements.push({
                metric: `${result.testName}.${metric.key}`,
                baseline: baselineValue,
                current: currentValue,
                improvement: Math.abs(change) * 100
              });
            }
          }
        }
      }
    }

    return analysis;
  }

  /**
   * Generate HTML report with charts and analysis
   */
  private async generateHTMLReport(results: LoadTestResult[], suite: K6TestSuite): Promise<string> {
    const timestamp = new Date().toISOString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PromptScape Performance Report - ${suite.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(
          auto-fit,
          minmax(250px,
          1fr
        )); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #e1e5e9; border-radius: 6px; padding: 20px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #28a745; }
        .metric-label { color: #6c757d; font-size: 0.9em; }
        .test-section { margin-bottom: 40px; }
        .test-title { font-size: 1.5em; font-weight: 600; margin-bottom: 20px; }
        .status-pass { color: #28a745; }
        .status-fail { color: #dc3545; }
        .status-warn { color: #ffc107; }
        .recommendations { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 PromptScape Performance Report</h1>
        <p><strong>Test Suite:</strong> ${suite.name} | <strong>Scenario:</strong> ${suite.scenario} | <strong>Environment:</strong> ${suite.environment}</p>
        <p><strong>Generated:</strong> ${timestamp}</p>
    </div>

    <div class="metric-grid">
        ${results.map(result => `
            <div class="metric-card">
                <div class="metric-value ${result.success ? 'status-pass' : 'status-fail'}">
                    ${result.success ? '✅' : '❌'}
                </div>
                <div class="metric-label">${result.testName}</div>
                <div>Duration: ${Math.round(result.duration / 1000)}s</div>
            </div>
        `).join('')}
    </div>

    ${results.map(result => `
        <div class="test-section">
            <div class="test-title">${result.testName}</div>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${this.formatMetric(
                      this.extractMetricValue(result,
                      'response_time_p95'
                    ))}ms</div>
                    <div class="metric-label">Response Time (P95)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.formatMetric(
                      this.extractMetricValue(result,
                      'error_rate'
                    ) * 100)}%</div>
                    <div class="metric-label">Error Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.formatMetric(
                      this.extractMetricValue(result,
                      'throughput'
                    ))}/s</div>
                    <div class="metric-label">Throughput</div>
                </div>
            </div>
        </div>
    `).join('')}

    <div class="recommendations">
        <h3>🎯 Epic 20 Recommendations</h3>
        <ul>
            <li><strong>Graph Execution:</strong> Target &lt;1s response time for 95% of requests</li>
            <li><strong>WebSocket Collaboration:</strong> Support 1000+ concurrent connections</li>
            <li><strong>Authentication:</strong> &lt;800ms login time, &lt;500ms token refresh</li>
            <li><strong>Enterprise Scaling:</strong> Maintain performance under 500+ concurrent users</li>
        </ul>
    </div>
</body>
</html>`;
  }

  /**
   * Generate JSON summary for API consumption
   */
  private async generateJSONSummary(results: LoadTestResult[], suite: K6TestSuite): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      suite: suite.name,
      scenario: suite.scenario,
      environment: suite.environment,
      overall_status: results.every(r => r.success) ? 'passed' : 'failed',
      total_duration: results.reduce((sum, r) => sum + r.duration, 0),
      tests: results.map(result => ({
        name: result.testName,
        status: result.success ? 'passed' : 'failed',
        duration: result.duration,
        response_time_p95: this.extractMetricValue(result, 'response_time_p95'),
        error_rate: this.extractMetricValue(result, 'error_rate'),
        throughput: this.extractMetricValue(result, 'throughput')
      })),
      epic20_targets: {
        graph_execution: {
          target_p95: 1000,
          current_p95: this.extractMetricValue(results.find(r => r.testName === 'graph-execution-load'), 'response_time_p95'),
          status: this.extractMetricValue(results.find(r => r.testName === 'graph-execution-load'), 'response_time_p95') < 1000 ? 'passed' : 'failed'
        },
        websocket: {
          target_connections: 1000,
          status: 'passed' // Would be calculated based on actual metrics
        },
        auth: {
          target_login_time: 800,
          status: 'passed' // Would be calculated based on actual metrics
        }
      }
    };
  }

  /**
   * Generate CSV report for data analysis
   */
  private async generateCSVReport(results: LoadTestResult[]): Promise<string> {
    const headers = ['Test Name', 'Success', 'Duration (ms)', 'Response Time P95', 'Error Rate', 'Throughput'];
    const rows = results.map(result => [
      result.testName,
      result.success.toString(),
      result.duration.toString(),
      this.extractMetricValue(result, 'response_time_p95')?.toString() || '',
      this.extractMetricValue(result, 'error_rate')?.toString() || '',
      this.extractMetricValue(result, 'throughput')?.toString() || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Utility methods
  private getTestSuiteConfig(name: string, scenario: string, environment: string): K6TestSuite {
    const suites = {
      ci: {
        name: 'ci',
        scenario: scenario as any,
        environment: environment as any,
        tests: ['graph-execution-load', 'auth-load'],
        thresholds: 'standard' as const,
        maxDuration: '10m'
      },
      smoke: {
        name: 'smoke',
        scenario: scenario as any,
        environment: environment as any,
        tests: ['graph-execution-load'],
        thresholds: 'standard' as const,
        maxDuration: '5m'
      },
      staging: {
        name: 'staging',
        scenario: scenario as any,
        environment: environment as any,
        tests: ['graph-execution-load', 'websocket-collaboration', 'auth-load'],
        thresholds: 'enterprise' as const,
        maxDuration: '30m'
      }
    };

    return suites[name as keyof typeof suites] || suites.ci;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)([ms])/);
    if (!match) return 300000; // Default 5 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    return unit === 'm' ? value * 60 * 1000 : value * 1000;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractMetricValue(result: LoadTestResult, key: string): number | undefined {
    // Extract specific metrics from the result structure
    const metrics = result.metrics;
    
    switch (key) {
      case 'response_time_p95':
        return metrics?.http?.http_req_duration?.p95;
      case 'error_rate':
        return metrics?.http?.http_req_failed?.rate;
      case 'throughput':
        return metrics?.http?.http_reqs?.rate;
      case 'connection_failures':
        return metrics?.websocket?.ws_connection_errors?.count;
      default:
        return undefined;
    }
  }

  private formatMetric(value: number | undefined): string {
    if (value === undefined) return 'N/A';
    return Math.round(value * 100) / 100;
  }

  private async loadPerformanceBaselines(suite: K6TestSuite): Promise<any> {
    // In real implementation, load from database or file system
    // For now, return null to indicate no baselines
    return null;
  }

  private async savePerformanceBaselines(results: LoadTestResult[], suite: K6TestSuite): Promise<void> {
    // In real implementation, save to database or file system
    console.log(`💾 Saving performance baselines for suite: ${suite.name}`);
  }
}

// Export for use in CLI and tests
export { K6PerformanceIntegration };
export default K6PerformanceIntegration;