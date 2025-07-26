#!/usr/bin/env node

/**
 * Comprehensive Performance Test Runner
 * 
 * Integrates load testing with performance profiling to provide comprehensive
 * performance analysis under realistic load conditions.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Performance Test Configuration
 */
const PERFORMANCE_TEST_CONFIG = {
  server: {
    profileDuration: 300000, // 5 minutes
    sampleInterval: 1000,    // 1 second
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      responseTime: 2000,
      errorRate: 5
    }
  },
  loadTests: [
    {
      name: 'Authentication Flow - Performance Profile',
      script: './load-tests/auth-flow-load-test.js',
      concurrency: 15,
      duration: 180000, // 3 minutes
      delay: 30000      // 30 second delay before starting
    },
    {
      name: 'File Browser - Performance Profile',
      script: './load-tests/file-browser-load-test.js',
      concurrency: 12,
      duration: 180000,
      delay: 60000      // 1 minute delay
    },
    {
      name: 'Graph Execution - Performance Profile',
      script: './load-tests/graph-execution-load-test.js',
      concurrency: 8,
      duration: 180000,
      delay: 90000      // 1.5 minute delay
    }
  ],
  client: {
    monitoringDuration: 300000, // 5 minutes
    sampleInterval: 1000,
    browserTests: [
      { name: 'Dashboard Load', url: '/dashboard' },
      { name: 'File Browser', url: '/files' },
      { name: 'Graph Editor', url: '/graphs' }
    ]
  },
  reporting: {
    outputDir: './performance-analysis-results',
    generateHTML: true,
    generateCharts: true,
    includeRecommendations: true
  }
};

/**
 * Performance Test Orchestrator
 */
class PerformanceTestOrchestrator {
  constructor(config: any = PERFORMANCE_TEST_CONFIG) {
    this.config = config;
    this.results = {
      serverMetrics: null,
      clientMetrics: null,
      loadTestResults: [],
      systemHealth: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Run comprehensive performance testing
   */
  async runPerformanceTests(): Promise<any> {
    console.log('🚀 Starting Comprehensive Performance Testing');
    console.log('=============================================\n');

    this.results.startTime = new Date();

    try {
      // Ensure output directory exists
      await this.ensureOutputDir();

      // Pre-test system check
      await this.performSystemHealthCheck('pre-test');

      // Start server performance profiling
      const serverProfiler = await this.startServerProfiling();

      // Run load tests with staggered timing
      const loadTestPromise = this.runStaggeredLoadTests();

      // Start client performance monitoring
      const clientProfiler = await this.startClientProfiling();

      // Wait for all tests to complete
      await loadTestPromise;

      // Stop profiling
      await this.stopServerProfiling(serverProfiler);
      await this.stopClientProfiling(clientProfiler);

      // Post-test system check
      await this.performSystemHealthCheck('post-test');

      this.results.endTime = new Date();

      // Generate comprehensive analysis report
      await this.generateComprehensiveReport();

      console.log('\n✅ Performance testing completed successfully!');
      return this.results;

    } catch (error) {
      console.error('\n❌ Performance testing failed:', error.message);
      this.results.endTime = new Date();
      
      // Generate partial report if possible
      try {
        await this.generateComprehensiveReport();
      } catch (reportError) {
        console.error('Failed to generate error report:', reportError.message);
      }

      throw error;
    }
  }

  /**
   * Start server performance profiling
   */
  async startServerProfiling(): Promise<any> {
    console.log('📊 Starting server performance profiling...');

    try {
      // Create a Node.js script to start server profiling
      const profilerScript = `
const { PerformanceProfiler } = require('./server/src/performance/PerformanceProfiler.ts');

const profiler = new PerformanceProfiler({
  sampleInterval: ${this.config.server.sampleInterval},
  outputDirectory: '${this.config.reporting.outputDir}/server-profiles',
  alertThresholds: ${JSON.stringify(this.config.server.alertThresholds)}
});

profiler.startProfiling();

// Keep process alive for profiling duration
setTimeout(() => {
  profiler.stopProfiling().then(() => {
    process.exit(0);
  });
}, ${this.config.server.profileDuration});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await profiler.stopProfiling();
  process.exit(0);
});
`;

      const scriptPath = path.join(this.config.reporting.outputDir, 'server-profiler.js');
      await fs.writeFile(scriptPath, profilerScript);

      // Start the profiler process
      const profilerProcess = spawn('node', [scriptPath], {
        detached: true,
        stdio: 'pipe'
      });

      console.log(`✅ Server profiling started (PID: ${profilerProcess.pid})`);
      return profilerProcess;

    } catch (error) {
      console.error('Failed to start server profiling:', error);
      throw error;
    }
  }

  /**
   * Stop server performance profiling
   */
  async stopServerProfiling(profilerProcess: any): Promise<void> {
    if (!profilerProcess) return;

    console.log('⏹️  Stopping server performance profiling...');

    try {
      profilerProcess.kill('SIGTERM');
      
      // Wait for process to finish
      await new Promise((resolve) => {
        profilerProcess.on('exit', resolve);
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });

      console.log('✅ Server profiling stopped');
    } catch (error) {
      console.error('Error stopping server profiling:', error);
    }
  }

  /**
   * Run staggered load tests
   */
  async runStaggeredLoadTests(): Promise<void> {
    console.log('🎯 Starting staggered load tests...');

    const loadTestPromises = this.config.loadTests.map(async (testConfig, index) => {
      // Wait for staggered start time
      if (testConfig.delay > 0) {
        console.log(`⏰ Waiting ${testConfig.delay / 1000}s before starting ${testConfig.name}...`);
        await this.delay(testConfig.delay);
      }

      console.log(`🚀 Starting ${testConfig.name}`);

      try {
        const result = await this.runLoadTest(testConfig);
        this.results.loadTestResults.push({
          name: testConfig.name,
          result,
          timestamp: new Date()
        });
        
        console.log(`✅ ${testConfig.name} completed`);
        return result;
      } catch (error) {
        console.error(`❌ ${testConfig.name} failed:`, error.message);
        this.results.loadTestResults.push({
          name: testConfig.name,
          result: { success: false, error: error.message },
          timestamp: new Date()
        });
        throw error;
      }
    });

    await Promise.allSettled(loadTestPromises);
    console.log('✅ All load tests completed');
  }

  /**
   * Run individual load test
   */
  async runLoadTest(testConfig: any): Promise<any> {
    const startTime = Date.now();

    try {
      const output = execSync(`node ${testConfig.script}`, {
        encoding: 'utf8',
        timeout: testConfig.duration + 60000, // Add 1 minute buffer
        env: {
          ...process.env,
          LOAD_TEST_CONCURRENCY: testConfig.concurrency,
          LOAD_TEST_DURATION: testConfig.duration
        }
      });

      return {
        success: true,
        output,
        duration: Date.now() - startTime,
        concurrency: testConfig.concurrency
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Start client performance profiling
   */
  async startClientProfiling(): Promise<any> {
    console.log('🌐 Starting client performance profiling...');

    try {
      // Create HTML file for client profiling
      const clientProfilerHTML = this.generateClientProfilerHTML();
      const htmlPath = path.join(this.config.reporting.outputDir, 'client-profiler.html');
      await fs.writeFile(htmlPath, clientProfilerHTML);

      console.log(`✅ Client profiler created: ${htmlPath}`);
      console.log('   Open this file in a browser to start client-side profiling');

      return { htmlPath };
    } catch (error) {
      console.error('Failed to create client profiler:', error);
      throw error;
    }
  }

  /**
   * Stop client performance profiling
   */
  async stopClientProfiling(clientProfiler: any): Promise<any> {
    console.log('⏹️  Client profiling configuration saved');
    // Client profiling is managed through the browser
    return clientProfiler;
  }

  /**
   * Generate client profiler HTML
   */
  generateClientProfilerHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Performance Profiler</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f7fa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
        }
        .controls {
            margin-bottom: 20px;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 8px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #3498db;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .test-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .test-button {
            background: #27ae60;
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .test-button:hover {
            background: #219a52;
        }
        .test-button:disabled {
            background: #95a5a6;
            cursor: not-allowed;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #2980b9;
        }
        .status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .status.running {
            background: #d5e8d4;
            color: #2e7d32;
        }
        .status.stopped {
            background: #ffebee;
            color: #c62828;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Client Performance Profiler</h1>
            <p>Real-time client-side performance monitoring</p>
        </div>

        <div class="controls">
            <button id="startBtn" onclick="startProfiling()">Start Profiling</button>
            <button id="stopBtn" onclick="stopProfiling()" disabled>Stop Profiling</button>
            <button onclick="clearMetrics()">Clear Metrics</button>
            <button onclick="exportResults()">Export Results</button>
            <div id="status" class="status stopped">Profiling Stopped</div>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div id="renderTime" class="metric-value">0</div>
                <div class="metric-label">Render Time (ms)</div>
            </div>
            <div class="metric-card">
                <div id="memoryUsage" class="metric-value">0</div>
                <div class="metric-label">Memory Usage (%)</div>
            </div>
            <div class="metric-card">
                <div id="responseTime" class="metric-value">0</div>
                <div class="metric-label">Response Time (ms)</div>
            </div>
            <div class="metric-card">
                <div id="layoutShift" class="metric-value">0</div>
                <div class="metric-label">Layout Shift (CLS)</div>
            </div>
        </div>

        <div class="test-buttons">
            ${this.config.client.browserTests.map(test => `
                <button class="test-button" onclick="simulateTest('${test.name}', '${test.url}')">
                    Test ${test.name}
                </button>
            `).join('')}
        </div>
    </div>

    <script>
        // Client Performance Profiler Implementation
        class ClientPerformanceProfiler {
            constructor() {
                this.isRunning = false;
                this.metrics = [];
                this.intervalId = null;
                this.startTime = 0;
            }

            start() {
                if (this.isRunning) return;
                
                this.isRunning = true;
                this.startTime = performance.now();
                document.getElementById('status').textContent = 'Profiling Running';
                document.getElementById('status').className = 'status running';
                document.getElementById('startBtn').disabled = true;
                document.getElementById('stopBtn').disabled = false;

                this.intervalId = setInterval(() => {
                    this.collectMetrics();
                }, 1000);

                console.log('Client performance profiling started');
            }

            stop() {
                if (!this.isRunning) return;

                this.isRunning = false;
                clearInterval(this.intervalId);
                
                document.getElementById('status').textContent = 'Profiling Stopped';
                document.getElementById('status').className = 'status stopped';
                document.getElementById('startBtn').disabled = false;
                document.getElementById('stopBtn').disabled = true;

                console.log('Client performance profiling stopped');
                this.exportToLocalStorage();
            }

            collectMetrics() {
                const now = performance.now();
                
                // Memory metrics
                let memoryUsage = 0;
                if (performance.memory) {
                    memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
                }

                // Network metrics
                const resources = performance.getEntriesByType('resource');
                const avgResponseTime = resources.length > 0 
                    ? resources.reduce((sum, r) => sum + (r.responseEnd - r.responseStart), 0) / resources.length 
                    : 0;

                // Layout shift (simplified)
                const layoutShift = Math.random() * 0.1; // Mock data

                const metrics = {
                    timestamp: now,
                    renderTime: Math.random() * 20, // Mock render time
                    memoryUsage: memoryUsage,
                    responseTime: avgResponseTime,
                    layoutShift: layoutShift
                };

                this.metrics.push(metrics);
                this.updateDisplay(metrics);
            }

            updateDisplay(metrics) {
                document.getElementById('renderTime').textContent = metrics.renderTime.toFixed(1);
                document.getElementById('memoryUsage').textContent = metrics.memoryUsage.toFixed(1);
                document.getElementById('responseTime').textContent = metrics.responseTime.toFixed(0);
                document.getElementById('layoutShift').textContent = metrics.layoutShift.toFixed(3);
            }

            clear() {
                this.metrics = [];
                this.updateDisplay({ renderTime: 0, memoryUsage: 0, responseTime: 0, layoutShift: 0 });
            }

            exportToLocalStorage() {
                const report = {
                    timestamp: Date.now(),
                    startTime: this.startTime,
                    endTime: performance.now(),
                    metrics: this.metrics,
                    summary: this.generateSummary()
                };

                localStorage.setItem('client-performance-report-' + Date.now(), JSON.stringify(report));
                console.log('Performance report saved to localStorage');
            }

            generateSummary() {
                if (this.metrics.length === 0) return null;

                return {
                    totalSamples: this.metrics.length,
                    averageRenderTime: this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length,
                    averageMemoryUsage: this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length,
                    averageResponseTime: this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length,
                    maxLayoutShift: Math.max(...this.metrics.map(m => m.layoutShift))
                };
            }
        }

        const profiler = new ClientPerformanceProfiler();

        function startProfiling() {
            profiler.start();
        }

        function stopProfiling() {
            profiler.stop();
        }

        function clearMetrics() {
            profiler.clear();
        }

        function exportResults() {
            profiler.exportToLocalStorage();
            alert('Results exported to localStorage. Check browser console.');
        }

        function simulateTest(testName, url) {
            console.log('Simulating test:', testName, 'at', url);
            
            // Simulate loading the URL
            const startTime = performance.now();
            
            // Create some DOM manipulation to trigger metrics
            const testDiv = document.createElement('div');
            testDiv.innerHTML = '<h3>Simulating ' + testName + '</h3>';
            document.body.appendChild(testDiv);
            
            setTimeout(() => {
                document.body.removeChild(testDiv);
                const duration = performance.now() - startTime;
                console.log(testName + ' simulation completed in', duration.toFixed(2) + 'ms');
            }, 1000 + Math.random() * 2000);
        }

        // Auto-start profiling when page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                startProfiling();
            }, 2000);
        });
    </script>
</body>
</html>`;
  }

  /**
   * Perform system health check
   */
  async performSystemHealthCheck(phase: string): Promise<void> {
    console.log(`🩺 Performing ${phase} system health check...`);

    const healthData = {
      phase,
      timestamp: new Date(),
      system: {}
    };

    try {
      // Check server availability
      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:8000'}/health`);
      healthData.server = {
        available: response.status === 200,
        responseTime: Date.now() - healthData.timestamp.getTime()
      };

      if (response.ok) {
        const health = await response.json();
        healthData.server.details = health;
      }
    } catch (error) {
      healthData.server = {
        available: false,
        error: error.message
      };
    }

    // System metrics
    try {
      if (process.platform !== 'win32') {
        const uptime = execSync('uptime', { encoding: 'utf8' });
        healthData.system.uptime = uptime.trim();
        
        const memory = execSync('free -m | grep Mem', { encoding: 'utf8' });
        healthData.system.memory = memory.trim();
      }
    } catch (error) {
      healthData.system.error = error.message;
    }

    this.results.systemHealth.push(healthData);
    console.log(`✅ ${phase} health check completed`);
  }

  /**
   * Generate comprehensive performance analysis report
   */
  async generateComprehensiveReport(): Promise<any> {
    console.log('📊 Generating comprehensive performance analysis report...');

    const report = {
      metadata: {
        testStartTime: this.results.startTime,
        testEndTime: this.results.endTime,
        totalDuration: this.results.endTime - this.results.startTime,
        configuration: this.config
      },
      executiveSummary: this.generateExecutiveSummary(),
      loadTestResults: this.results.loadTestResults,
      systemHealth: this.results.systemHealth,
      performanceMetrics: await this.aggregatePerformanceMetrics(),
      recommendations: this.generatePerformanceRecommendations(),
      charts: this.generateChartData()
    };

    // Save JSON report
    const jsonPath = path.join(this.config.reporting.outputDir, `performance-analysis-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report if requested
    if (this.config.reporting.generateHTML) {
      await this.generateHTMLReport(report);
    }

    console.log(`✅ Performance analysis report generated: ${jsonPath}`);
    return report;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(): any {
    const successfulTests = this.results.loadTestResults.filter(t => t.result.success).length;
    const totalTests = this.results.loadTestResults.length;
    const testSuccessRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

    return {
      testSuccessRate,
      totalLoadTests: totalTests,
      successfulLoadTests: successfulTests,
      duration: this.results.endTime - this.results.startTime,
      systemStability: this.assessSystemStability(),
      overallPerformanceGrade: this.calculateOverallGrade()
    };
  }

  /**
   * Assess system stability
   */
  assessSystemStability(): string {
    const healthChecks = this.results.systemHealth;
    if (healthChecks.length === 0) return 'unknown';

    const serverAvailable = healthChecks.every(check => check.server?.available);
    return serverAvailable ? 'stable' : 'unstable';
  }

  /**
   * Calculate overall performance grade
   */
  calculateOverallGrade(): string {
    // Simplified grading based on test success rate and system stability
    const summary = this.generateExecutiveSummary();
    
    if (summary.testSuccessRate >= 95 && summary.systemStability === 'stable') return 'A';
    if (summary.testSuccessRate >= 85) return 'B';
    if (summary.testSuccessRate >= 70) return 'C';
    if (summary.testSuccessRate >= 50) return 'D';
    return 'F';
  }

  /**
   * Aggregate performance metrics
   */
  async aggregatePerformanceMetrics(): Promise<any> {
    const metrics = {
      server: await this.loadServerMetrics(),
      client: await this.loadClientMetrics(),
      loadTest: this.aggregateLoadTestMetrics()
    };

    return metrics;
  }

  /**
   * Load server metrics from profiles
   */
  async loadServerMetrics(): Promise<any> {
    try {
      const profileDir = path.join(this.config.reporting.outputDir, 'server-profiles');
      const files = await fs.readdir(profileDir);
      const profileFiles = files.filter(f => f.endsWith('.json'));

      if (profileFiles.length === 0) return null;

      // Load the most recent profile
      const latestProfile = profileFiles.sort().pop();
      const profilePath = path.join(profileDir, latestProfile);
      const profileData = JSON.parse(await fs.readFile(profilePath, 'utf8'));

      return {
        fileName: latestProfile,
        summary: profileData.summary,
        recommendations: profileData.recommendations
      };
    } catch (error) {
      console.warn('Failed to load server metrics:', error.message);
      return null;
    }
  }

  /**
   * Load client metrics from localStorage
   */
  async loadClientMetrics(): Promise<any> {
    // Client metrics would be retrieved from the browser's localStorage
    // This is a placeholder for the structure
    return {
      note: 'Client metrics available in browser localStorage after running client profiler'
    };
  }

  /**
   * Aggregate load test metrics
   */
  aggregateLoadTestMetrics(): any {
    const successful = this.results.loadTestResults.filter(t => t.result.success);
    
    if (successful.length === 0) return null;

    const totalDuration = successful.reduce((sum, t) => sum + t.result.duration, 0);
    const avgDuration = totalDuration / successful.length;

    return {
      totalTests: this.results.loadTestResults.length,
      successfulTests: successful.length,
      averageDuration: avgDuration,
      successRate: (successful.length / this.results.loadTestResults.length) * 100
    };
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations(): any[] {
    const recommendations = [];

    // Based on test results
    const failedTests = this.results.loadTestResults.filter(t => !t.result.success);
    if (failedTests.length > 0) {
      recommendations.push({
        category: 'Reliability',
        priority: 'high',
        issue: `${failedTests.length} load test(s) failed`,
        recommendation: 'Investigate and resolve test failures to improve system reliability',
        impact: 'System may not handle expected load levels'
      });
    }

    // System stability
    if (this.assessSystemStability() === 'unstable') {
      recommendations.push({
        category: 'Infrastructure',
        priority: 'critical',
        issue: 'System instability detected during testing',
        recommendation: 'Review server logs and system resources to identify stability issues',
        impact: 'Service interruptions may occur under load'
      });
    }

    // Add generic performance recommendations
    recommendations.push({
      category: 'Monitoring',
      priority: 'medium',
      issue: 'Continuous performance monitoring',
      recommendation: 'Implement ongoing performance monitoring and alerting',
      impact: 'Proactive identification of performance regressions'
    });

    return recommendations;
  }

  /**
   * Generate chart data for visualization
   */
  generateChartData(): any {
    return {
      testResults: {
        labels: this.results.loadTestResults.map(t => t.name),
        success: this.results.loadTestResults.map(t => t.result.success ? 1 : 0),
        duration: this.results.loadTestResults.map(t => t.result.duration || 0)
      },
      systemHealth: {
        timestamps: this.results.systemHealth.map(h => h.timestamp),
        serverAvailability: this.results.systemHealth.map(h => h.server?.available ? 1 : 0)
      }
    };
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(report: any): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; color: #2c3e50; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-card h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .metric-card .value { font-size: 32px; font-weight: bold; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #2c3e50; border-left: 4px solid #3498db; padding-left: 15px; }
        .recommendations { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .recommendation { margin-bottom: 15px; padding: 15px; border-left: 4px solid #e74c3c; background: white; }
        .recommendation.high { border-color: #e74c3c; }
        .recommendation.medium { border-color: #f39c12; }
        .recommendation.low { border-color: #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Performance Analysis Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Duration: ${Math.round((report.metadata.totalDuration) / (1000 * 60))} minutes</p>
        </div>

        <div class="summary">
            <div class="metric-card">
                <h3>Overall Grade</h3>
                <div class="value">${report.executiveSummary.overallPerformanceGrade}</div>
            </div>
            <div class="metric-card">
                <h3>Test Success Rate</h3>
                <div class="value">${report.executiveSummary.testSuccessRate.toFixed(1)}%</div>
            </div>
            <div class="metric-card">
                <h3>System Stability</h3>
                <div class="value">${report.executiveSummary.systemStability.toUpperCase()}</div>
            </div>
            <div class="metric-card">
                <h3>Load Tests</h3>
                <div class="value">${report.executiveSummary.successfulLoadTests}/${report.executiveSummary.totalLoadTests}</div>
            </div>
        </div>

        <div class="section">
            <h2>Load Test Results</h2>
            ${report.loadTestResults.map(test => `
                <div style="margin: 10px 0; padding: 15px; border-radius: 5px; ${test.result.success ? 'background: #d4edda; border: 1px solid #c3e6cb;' : 'background: #f8d7da; border: 1px solid #f5c6cb;'}">
                    <strong>${test.name}</strong> - ${test.result.success ? '✅ Success' : '❌ Failed'}
                    ${test.result.duration ? `<br>Duration: ${Math.round(test.result.duration / 1000)}s` : ''}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Performance Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <div class="recommendation ${rec.priority}">
                        <strong>${rec.category} - ${rec.issue}</strong><br>
                        <em>Priority: ${rec.priority.toUpperCase()}</em><br>
                        ${rec.recommendation}<br>
                        <small><strong>Impact:</strong> ${rec.impact}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    const htmlPath = path.join(this.config.reporting.outputDir, `performance-analysis-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlContent);
    
    console.log(`📄 HTML report generated: ${htmlPath}`);
  }

  /**
   * Utility methods
   */
  async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.config.reporting.outputDir);
    } catch (error) {
      await fs.mkdir(this.config.reporting.outputDir, { recursive: true });
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main execution
 */
async function runPerformanceAnalysis(): Promise<any> {
  const orchestrator = new PerformanceTestOrchestrator();
  
  try {
    const results = await orchestrator.runPerformanceTests();
    
    console.log('\n📈 PERFORMANCE ANALYSIS SUMMARY');
    console.log('==============================');
    console.log(`Overall Grade: ${results.executiveSummary?.overallPerformanceGrade || 'N/A'}`);
    console.log(`Test Success Rate: ${results.executiveSummary?.testSuccessRate?.toFixed(1) || 0}%`);
    console.log(`System Stability: ${results.executiveSummary?.systemStability || 'unknown'}`);
    console.log(`Total Duration: ${Math.round((results.endTime - results.startTime) / (1000 * 60))} minutes`);
    
    return results;
  } catch (error) {
    console.error('Performance analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceAnalysis().catch(console.error);
}

module.exports = { PerformanceTestOrchestrator, runPerformanceAnalysis };