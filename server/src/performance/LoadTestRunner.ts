import { EventEmitter } from 'events';
import { PerformanceTestSuite, TestScenario, TEST_SCENARIOS, PerformanceMetrics, SimulatedUser } from './PerformanceTestSuite';
import { MetricsCollector } from './MetricsCollector';
import { PerformanceDashboard } from './PerformanceDashboard';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Load test configuration
 */
}
export interface LoadTestConfig {
  name: string;
  description: string;
  scenarios: TestScenario[];
  serverUrl: string;
  warmupDuration: number;
  cooldownDuration: number;
  iterations: number;
  concurrentScenarios: boolean;
  outputDir: string;
  enableRealTimeMonitoring: boolean;
  generateReport: boolean;
}
}

/**
 * Load test result
 */
}
export interface LoadTestResult {
  config: LoadTestConfig;
  startTime: number;
  endTime: number;
  duration: number;
  scenarios: {
    [scenarioName: string]: {
      metrics: PerformanceMetrics[];
      statistics: any;
      success: boolean;
      errorCount: number;
}
    };
  };
  summary: {
    totalOperations: number;
    successRate: number;
    averageLatency: number;
    maxLatency: number;
    throughput: number;
    errors: string[];
  };
  systemImpact: {
    peakCpuUsage: number;
    peakMemoryUsage: number;
    averageNetworkThroughput: number;
  };
  recommendations: string[];
}

/**
 * Comprehensive load testing framework for collaborative editing
 */
export class LoadTestRunner extends EventEmitter {
  private testSuite: PerformanceTestSuite;
  private metricsCollector: MetricsCollector;
  private dashboard: PerformanceDashboard | null = null;
  private isRunning: boolean = false;
  private currentTest: LoadTestConfig | null = null;
  private results: LoadTestResult[] = [];

  constructor() {
    super();
    this.testSuite = new PerformanceTestSuite();
    this.metricsCollector = new MetricsCollector();
    this.setupEventListeners();
  }

  /**
   * Set up dashboard for real-time monitoring
   */
  setDashboard(dashboard: PerformanceDashboard): void {
    this.dashboard = dashboard;
  }

  /**
   * Run a complete load test
   */
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {

    if (this.isRunning) {
      throw new Error('Load test is already running');
    }

    this.isRunning = true;
    this.currentTest = config;

    console.log(`Starting load test: ${config.name}`);
    console.log(`Scenarios: ${config.scenarios.length}, Iterations: ${config.iterations}`);

    const startTime = Date.now();
    
    try {
      // Start metrics collection
      this.metricsCollector.startCollection();
      
      if (config.enableRealTimeMonitoring && this.dashboard) {
        this.dashboard.start();
      }

      // Run warmup
      await this.runWarmup(config);

      // Run test scenarios
      const scenarioResults = await this.runScenarios(config);

      // Run cooldown
      await this.runCooldown(config);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Generate comprehensive result
      const result = await this.generateLoadTestResult(
        config, 
        startTime, 
        endTime, 
        duration, 
        scenarioResults
      );

      this.results.push(result);

      // Generate report if requested
      if (config.generateReport) {
        await this.generateTestReport(result);
      }

      console.log(`Load test completed: ${config.name} (${duration}ms)`);
      this.emit('test_completed', result);

      return result;

    } catch (error) {
      console.error('Load test failed:', error);
      this.emit('test_failed', error);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
      this.metricsCollector.stopCollection();
      
      if (this.dashboard) {
        this.dashboard.stop();
      }
    }
  }

  /**
   * Run multiple load tests in sequence
   */
  async runTestSuite(configs: LoadTestConfig[]): Promise<LoadTestResult[]> {

    const results: LoadTestResult[] = [];

    for (const config of configs) {
      if (!this.isRunning) {
        break;
      }

      try {
        const result = await this.runLoadTest(config);
        results.push(result);
        
        // Wait between tests
        if (config !== configs[configs.length - 1]) {
          console.log('Waiting between tests...');
          await this.wait(30000); // 30 seconds between tests
        }
      } catch (error) {
        console.error(`Test suite failed at ${config.name}:`, error);
        break;
      }
    }

    // Generate suite summary
    await this.generateSuiteSummary(results);

    return results;
  }

  /**
   * Run stress test with gradually increasing load
   */
  async runStressTest(baseConfig: LoadTestConfig, maxUsers: number, stepSize: number = 5): Promise<LoadTestResult[]> {

    const results: LoadTestResult[] = [];
    let currentUsers = baseConfig.scenarios[0].userCount;

    console.log(`Starting stress test from ${currentUsers} to ${maxUsers} users`);

    while (currentUsers <= maxUsers && this.isRunning) {
      // Create modified config for current user count
      const stressConfig: LoadTestConfig = {
        ...baseConfig,
        name: `${baseConfig.name}_stress_${currentUsers}users`,
        scenarios: baseConfig.scenarios.map(scenario => ({
          ...scenario,
          userCount: currentUsers,
          duration: Math.min(scenario.duration, 120000) // Cap duration for stress test
        }))
      };

      try {
        const result = await this.runLoadTest(stressConfig);
        results.push(result);

        // Check if system is under stress
        if (result.summary.successRate < 95 || result.summary.averageLatency > 2000) {
          console.log(`Stress threshold reached at ${currentUsers} users`);
          break;
        }

        currentUsers += stepSize;
        
        // Brief pause between stress levels
        await this.wait(10000);
        
      } catch (error) {
        console.error(`Stress test failed at ${currentUsers} users:`, error);
        break;
      }
    }

    // Generate stress test analysis
    await this.generateStressTestAnalysis(results);

    return results;
  }

  /**
   * Run endurance test with sustained load
   */
  async runEnduranceTest(config: LoadTestConfig, duration: number): Promise<LoadTestResult> {

    console.log(`Starting endurance test for ${duration}ms`);

    const enduranceConfig: LoadTestConfig = {
      ...config,
      name: `${config.name}_endurance`,
      scenarios: config.scenarios.map(scenario => ({
        ...scenario,
        duration,
        operationRate: scenario.operationRate * 0.7 // Reduce intensity for endurance
      })),
      iterations: 1 // Single long iteration
    };

    return await this.runLoadTest(enduranceConfig);
  }

  /**
   * Create predefined collaborative editing test scenarios
   */
  static createCollaborativeEditingTests(serverUrl: string): LoadTestConfig[] {
    return [
      {
        name: 'basic_collaboration',
        description: 'Basic collaborative editing with light load',
        scenarios: [TEST_SCENARIOS[0]], // light_editing
        serverUrl,
        warmupDuration: 10000,
        cooldownDuration: 5000,
        iterations: 1,
        concurrentScenarios: false,
        outputDir: './load-test-results',
        enableRealTimeMonitoring: true,
        generateReport: true
  }
      {
        name: 'medium_collaboration',
        description: 'Medium intensity collaborative editing',
        scenarios: [TEST_SCENARIOS[1]], // medium_collaboration
        serverUrl,
        warmupDuration: 15000,
        cooldownDuration: 10000,
        iterations: 1,
        concurrentScenarios: false,
        outputDir: './load-test-results',
        enableRealTimeMonitoring: true,
        generateReport: true
  }
      {
        name: 'heavy_collaboration',
        description: 'Heavy collaborative editing with many users',
        scenarios: [TEST_SCENARIOS[2]], // heavy_editing
        serverUrl,
        warmupDuration: 20000,
        cooldownDuration: 15000,
        iterations: 1,
        concurrentScenarios: false,
        outputDir: './load-test-results',
        enableRealTimeMonitoring: true,
        generateReport: true
  }
      {
        name: 'conflict_resolution_test',
        description: 'Test conflict resolution under load',
        scenarios: [TEST_SCENARIOS[4]], // conflict_heavy
        serverUrl,
        warmupDuration: 15000,
        cooldownDuration: 10000,
        iterations: 3,
        concurrentScenarios: false,
        outputDir: './load-test-results',
        enableRealTimeMonitoring: true,
        generateReport: true
  }
      {
        name: 'mixed_workload',
        description: 'Mixed workload with multiple scenarios',
        scenarios: [TEST_SCENARIOS[0], TEST_SCENARIOS[1], TEST_SCENARIOS[2]],
        serverUrl,
        warmupDuration: 30000,
        cooldownDuration: 20000,
        iterations: 1,
        concurrentScenarios: true,
        outputDir: './load-test-results',
        enableRealTimeMonitoring: true,
        generateReport: true
      }
    ];
  }

  /**
   * Stop running load test
   */
  stop(): void {
    this.isRunning = false;
    this.testSuite.stop();
    this.emit('test_stopped');
  }

  /**
   * Get test results
   */
  getResults(): LoadTestResult[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Run warmup phase
   */
  private async runWarmup(config: LoadTestConfig): Promise<void> {

    if (config.warmupDuration <= 0) {
      return;
    }

    console.log(`Running warmup for ${config.warmupDuration}ms`);
    
    // Create lightweight warmup scenario
    const warmupScenario: TestScenario = {
      name: 'warmup',
      description: 'Warmup scenario',
      userCount: Math.min(2, config.scenarios[0].userCount),
      duration: config.warmupDuration,
      operationRate: 0.5,
      operationTypes: config.scenarios[0].operationTypes.slice(0, 3),
      documentComplexity: config.scenarios[0].documentComplexity
    };

    await this.testSuite.runScenario(warmupScenario, config.serverUrl);
    console.log('Warmup completed');
  }

  /**
   * Run test scenarios
   */
  private async runScenarios(config: LoadTestConfig): Promise<{[scenarioName: string]: PerformanceMetrics[]}> {

    const results: {[scenarioName: string]: PerformanceMetrics[]} = {};

    for (let iteration = 0; iteration < config.iterations; iteration++) {
      console.log(`Running iteration ${iteration + 1}/${config.iterations}`);

      if (config.concurrentScenarios) {
        // Run scenarios concurrently
        const promises = config.scenarios.map(scenario =>
          this.testSuite.runScenario(scenario, config.serverUrl)
        );
        
        const scenarioResults = await Promise.all(promises);
        
        config.scenarios.forEach((scenario, index) => {
          if (!results[scenario.name]) {
            results[scenario.name] = [];
          }
          results[scenario.name].push(...scenarioResults[index]);
        });
        
      } else {
        // Run scenarios sequentially
        for (const scenario of config.scenarios) {
          const scenarioMetrics = await this.testSuite.runScenario(scenario, config.serverUrl);
          
          if (!results[scenario.name]) {
            results[scenario.name] = [];
          }
          results[scenario.name].push(...scenarioMetrics);
          
          // Brief pause between scenarios
          if (scenario !== config.scenarios[config.scenarios.length - 1]) {
            await this.wait(5000);
          }
        }
      }
    }

    return results;
  }

  /**
   * Run cooldown phase
   */
  private async runCooldown(config: LoadTestConfig): Promise<void> {

    if (config.cooldownDuration <= 0) {
      return;
    }

    console.log(`Running cooldown for ${config.cooldownDuration}ms`);
    await this.wait(config.cooldownDuration);
    console.log('Cooldown completed');
  }

  /**
   * Generate comprehensive load test result
   */
  private async generateLoadTestResult(
    config: LoadTestConfig,
    startTime: number,
    endTime: number,
    duration: number,
    scenarioResults: {[scenarioName: string]: PerformanceMetrics[]}
  ): Promise<LoadTestResult> {

    const scenarios: any = {};
    let totalOperations = 0;
    let totalErrors = 0;
    const allLatencies: number[] = [];
    const errors: string[] = [];

    // Process scenario results
    for (const [scenarioName, metrics] of Object.entries(scenarioResults)) {
      const statistics = this.testSuite.generateReport(metrics);
      const errorCount = metrics.filter(m => m.errorRate > 0).length;
      
      scenarios[scenarioName] = {
        metrics,
        statistics,
        success: statistics?.statistics?.operationSuccessRate?.mean >= 95,
        errorCount
      };
      
      totalOperations += metrics.length;
      totalErrors += errorCount;
      allLatencies.push(...metrics.map(m => m.responseTime));
    }

    // Calculate summary statistics
    const successRate = totalOperations > 0 ? ((totalOperations - totalErrors) / totalOperations) * 100 : 0;
    const averageLatency = allLatencies.length > 0 ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length : 0;
    const maxLatency = allLatencies.length > 0 ? Math.max(...allLatencies) : 0;
    const throughput = duration > 0 ? (totalOperations / duration) * 1000 : 0; // operations per second

    // Get system impact metrics
    const systemMetrics = this.metricsCollector.getMetricsWindow(startTime, endTime);
    const systemImpact = {
      peakCpuUsage: systemMetrics.systemMetrics.length > 0 ? 
        Math.max(...systemMetrics.systemMetrics.map(m => m.cpuUsage)) : 0,
      peakMemoryUsage: systemMetrics.systemMetrics.length > 0 ? 
        Math.max(...systemMetrics.systemMetrics.map(m => m.memoryUsage.percentage)) : 0,
      averageNetworkThroughput: 0 // Would calculate from network metrics
    };

    // Generate recommendations
    const recommendations = this.generateLoadTestRecommendations(
      scenarios, 
      { successRate, averageLatency, maxLatency, throughput },
      systemImpact
    );

    return {
      config,
      startTime,
      endTime,
      duration,
      scenarios,
      summary: {
        totalOperations,
        successRate,
        averageLatency,
        maxLatency,
        throughput,
        errors
  }
      systemImpact,
      recommendations
    };
  }

  /**
   * Generate load test recommendations
   */
  private generateLoadTestRecommendations(
    scenarios: any, 
    summary: any, 
    systemImpact: any
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (summary.successRate < 95) {
      recommendations.push(`Success rate is low (${summary.successRate.toFixed(1)}%). Investigate error sources.`);
    }

    if (summary.averageLatency > 1000) {
      recommendations.push(`Average latency is high (${summary.averageLatency.toFixed(0)}ms). Optimize response times.`);
    }

    if (summary.maxLatency > 5000) {
      recommendations.push(`Maximum latency is concerning (${summary.maxLatency.toFixed(0)}ms). Check for bottlenecks.`);
    }

    // System recommendations
    if (systemImpact.peakCpuUsage > 80) {
      recommendations.push(`Peak CPU usage was ${systemImpact.peakCpuUsage.toFixed(1)}%. Consider horizontal scaling.`);
    }

    if (systemImpact.peakMemoryUsage > 85) {
      recommendations.push(`Peak memory usage was ${systemImpact.peakMemoryUsage.toFixed(1)}%. Monitor for memory leaks.`);
    }

    // Throughput recommendations
    if (summary.throughput < 10) {
      recommendations.push(`Throughput is low (${summary.throughput.toFixed(1)} ops/sec). Optimize processing pipeline.`);
    }

    // Scenario-specific recommendations
    for (const [scenarioName, result] of Object.entries(scenarios) as [string, any][]) {
      if (!result.success) {
        recommendations.push(`Scenario '${scenarioName}' failed. Review scenario-specific issues.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Load test completed successfully. System performance is acceptable.');
    }

    return recommendations;
  }

  /**
   * Generate detailed test report
   */
  private async generateTestReport(result: LoadTestResult): Promise<void> {

    const reportDir = result.config.outputDir;
    const timestamp = new Date(result.startTime).toISOString().replace(/[:.]/g, '-');
    const reportPath = join(reportDir, `load-test-report-${timestamp}.html`);

    // Ensure output directory exists
    await fs.mkdir(reportDir, { recursive: true });

    const html = this.generateReportHTML(result);
    await fs.writeFile(reportPath, html);

    // Also save raw data as JSON
    const dataPath = join(reportDir, `load-test-data-${timestamp}.json`);
    await fs.writeFile(dataPath, JSON.stringify(result, null, 2));

    console.log(`Test report generated: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  private generateReportHTML(result: LoadTestResult): string {
    const duration = (result.duration / 1000).toFixed(1);
    const startTime = new Date(result.startTime).toLocaleString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - ${result.config.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: 600; color: #333; margin-bottom: 10px; }
        .subtitle { font-size: 16px; color: #666; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff; }
        .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: 600; color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .scenario-grid { display: grid; gap: 20px; }
        .scenario-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #ddd; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff; }
        .recommendation-item { margin-bottom: 10px; padding-left: 20px; position: relative; }
        .recommendation-item:before { content: "•"; position: absolute; left: 0; color: #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">${result.config.name}</div>
            <div class="subtitle">${result.config.description}</div>
            <div style="margin-top: 10px; color: #888;">
                Started: ${startTime} | Duration: ${duration}s | Server: ${result.config.serverUrl}
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-label">Total Operations</div>
                <div class="summary-value">${result.summary.totalOperations.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Success Rate</div>
                <div class="summary-value">${result.summary.successRate.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Average Latency</div>
                <div class="summary-value">${result.summary.averageLatency.toFixed(0)}ms</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Throughput</div>
                <div class="summary-value">${result.summary.throughput.toFixed(1)} ops/s</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">System Impact</div>
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-label">Peak CPU Usage</div>
                    <div class="summary-value">${result.systemImpact.peakCpuUsage.toFixed(1)}%</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Peak Memory Usage</div>
                    <div class="summary-value">${result.systemImpact.peakMemoryUsage.toFixed(1)}%</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Scenario Results</div>
            <div class="scenario-grid">
                ${Object.entries(result.scenarios).map(([name, scenario]: [string, any]) => `
                    <div class="scenario-card ${scenario.success ? 'success' : 'error'}">
                        <h3>${name}</h3>
                        <p>Operations: ${scenario.metrics.length} | Success: ${scenario.success ? 'Yes' : 'No'} | Errors: ${scenario.errorCount}</p>
                        ${scenario.statistics ? `
                            <div style="margin-top: 10px; font-size: 14px;">
                                <div>Avg Response Time: ${scenario.statistics.statistics?.responseTime?.mean?.toFixed(0) || 'N/A'}ms</div>
                                <div>95th Percentile: ${scenario.statistics.statistics?.responseTime?.p95?.toFixed(0) || 'N/A'}ms</div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Recommendations</div>
            <div class="recommendations">
                ${result.recommendations.map(rec => `
                    <div class="recommendation-item">${rec}</div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate test suite summary
   */
  private async generateSuiteSummary(results: LoadTestResult[]): Promise<void> {

    if (results.length === 0) return;

    const outputDir = results[0].config.outputDir;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryPath = join(outputDir, `test-suite-summary-${timestamp}.json`);

    const summary = {
      timestamp: Date.now(),
      totalTests: results.length,
      successfulTests: results.filter(r => r.summary.successRate >= 95).length,
      averageSuccessRate: results.reduce((acc, r) => acc + r.summary.successRate, 0) / results.length,
      averageLatency: results.reduce((acc, r) => acc + r.summary.averageLatency, 0) / results.length,
      totalOperations: results.reduce((acc, r) => acc + r.summary.totalOperations, 0),
      results
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`Test suite summary generated: ${summaryPath}`);
  }

  /**
   * Generate stress test analysis
   */
  private async generateStressTestAnalysis(results: LoadTestResult[]): Promise<void> {

    if (results.length === 0) return;

    const outputDir = results[0].config.outputDir;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const analysisPath = join(outputDir, `stress-test-analysis-${timestamp}.json`);

    const analysis = {
      timestamp: Date.now(),
      maxUsersSuccessful: this.findMaxSuccessfulUsers(results),
      performanceDegradation: this.calculatePerformanceDegradation(results),
      scalabilityMetrics: this.calculateScalabilityMetrics(results),
      recommendations: this.generateStressTestRecommendations(results),
      results
    };

    await fs.writeFile(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`Stress test analysis generated: ${analysisPath}`);
  }

  /**
   * Find maximum users that maintained acceptable performance
   */
  private findMaxSuccessfulUsers(results: LoadTestResult[]): number {
    for (let i = results.length - 1; i >= 0; i--) {
      const result = results[i];
      if (result.summary.successRate >= 95 && result.summary.averageLatency <= 2000) {
        return this.extractUserCount(result.config.name);
      }
    }
    return 0;
  }

  /**
   * Calculate performance degradation across user levels
   */
  private calculatePerformanceDegradation(results: LoadTestResult[]): any {
    if (results.length < 2) return null;

    const baseline = results[0];
    const final = results[results.length - 1];

    return {
      successRateChange: final.summary.successRate - baseline.summary.successRate,
      latencyIncrease: final.summary.averageLatency - baseline.summary.averageLatency,
      throughputChange: final.summary.throughput - baseline.summary.throughput
    };
  }

  /**
   * Calculate scalability metrics
   */
  private calculateScalabilityMetrics(results: LoadTestResult[]): any {
    const userCounts = results.map(r => this.extractUserCount(r.config.name));
    const throughputs = results.map(r => r.summary.throughput);

    return {
      linearScaling: this.calculateLinearScalingRatio(userCounts, throughputs),
      saturationPoint: this.findSaturationPoint(userCounts, throughputs),
      efficiencyLoss: this.calculateEfficiencyLoss(userCounts, throughputs)
    };
  }

  /**
   * Generate stress test recommendations
   */
  private generateStressTestRecommendations(results: LoadTestResult[]): string[] {
    const recommendations: string[] = [];
    const maxUsers = this.findMaxSuccessfulUsers(results);

    if (maxUsers > 0) {
      recommendations.push(`System can handle up to ${maxUsers} concurrent users with acceptable performance.`);
    } else {
      recommendations.push('System showed performance degradation even at low user counts. Immediate optimization needed.');
    }

    const degradation = this.calculatePerformanceDegradation(results);
    if (degradation && degradation.latencyIncrease > 1000) {
      recommendations.push('Significant latency increase under load. Optimize response time bottlenecks.');
    }

    return recommendations;
  }

  /**
   * Extract user count from config name
   */
  private extractUserCount(configName: string): number {
    const match = configName.match(/(\d+)users/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Calculate linear scaling ratio
   */
  private calculateLinearScalingRatio(userCounts: number[], throughputs: number[]): number {
    // Simplified linear scaling calculation
    if (userCounts.length < 2) return 1;
    
    const userIncrease = userCounts[userCounts.length - 1] / userCounts[0];
    const throughputIncrease = throughputs[throughputs.length - 1] / throughputs[0];
    
    return throughputIncrease / userIncrease;
  }

  /**
   * Find saturation point
   */
  private findSaturationPoint(userCounts: number[], throughputs: number[]): number | null {
    for (let i = 1; i < throughputs.length; i++) {
      if (throughputs[i] < throughputs[i - 1] * 0.95) {
        return userCounts[i];
      }
    }
    return null;
  }

  /**
   * Calculate efficiency loss
   */
  private calculateEfficiencyLoss(userCounts: number[], throughputs: number[]): number {
    if (userCounts.length < 2) return 0;
    
    const initialEfficiency = throughputs[0] / userCounts[0];
    const finalEfficiency = throughputs[throughputs.length - 1] / userCounts[userCounts.length - 1];
    
    return ((initialEfficiency - finalEfficiency) / initialEfficiency) * 100;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.testSuite.on('scenario_started', (scenario) => {
      this.emit('scenario_started', scenario);
    });

    this.testSuite.on('scenario_completed', (scenario, metrics) => {
      this.emit('scenario_completed', scenario, metrics);
    });

    this.metricsCollector.on('alert_created', (alert) => {
      this.emit('performance_alert', alert);
    });
  }

  /**
   * Utility function to wait for a specified duration
   */
  private wait(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));
  }
}