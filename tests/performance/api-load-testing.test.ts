/**
 * API Load Testing Scenarios for Server Endpoints
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562178-E4CD83 - Implement performance tests
 *
 * Comprehensive load testing for all major API endpoints including
 * authentication, graph operations, analytics, and security features.
 */

import { LoadTestRunner, LoadTestConfig, VirtualUser } from '../../load-tests/LoadTestFramework';

interface APIEndpointTestResult {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  requestsPerSecond: number;
  totalRequests: number;
  errors: Array<{ message: string; count: number }>;
}

interface LoadTestScenario {
  name: string;
  endpoint: string;
  method: string;
  getData?: () => any;
  headers?: any;
  requiresAuth?: boolean;
  concurrency: number;
  duration: number;
  expectedPerformance: {
    maxResponseTime: number;
    minSuccessRate: number;
    minThroughput: number;
  };
}

class APILoadTester {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate and get JWT token for testing protected endpoints
   */
  async authenticate(): Promise<string | undefined> {
    // For testing purposes, we'll skip actual auth and use a mock token
    // In a real scenario, you'd authenticate with actual credentials
    this.authToken = 'Bearer mock-jwt-token-for-testing';
    return this.authToken;
  }

  /**
   * Generate sample graph data for testing
   */
  generateSampleGraph(complexity: 'simple' | 'medium' | 'complex' = 'simple'): any {
    const complexityConfig = {
      simple: { nodeCount: 3, variability: 2 },
      medium: { nodeCount: 10, variability: 5 },
      complex: { nodeCount: 25, variability: 10 },
    };

    const config = complexityConfig[complexity];
    const nodes = [];
    const edges = [];

    for (let i = 0; i < config.nodeCount; i++) {
      const nodeTypes = ['WeightedChoice', 'Concat', 'Output', 'SetVariable', 'GetVariable'];
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];

      const nodeData = this.getNodeData(nodeType, i);

      nodes.push({
        id: `node-${i}`,
        type: nodeType,
        data: nodeData,
        position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 },
      });

      // Create edges between nodes
      if (i > 0 && Math.random() > 0.3) {
        edges.push({
          id: `edge-${i}`,
          source: `node-${Math.floor(Math.random() * i)}`,
          target: `node-${i}`,
          sourceHandle: 'output',
          targetHandle: 'input',
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Get appropriate node data based on type
   */
  private getNodeData(nodeType: string, index: number): any {
    switch (nodeType) {
      case 'WeightedChoice':
        return {
          choices: [`Option ${index}A`, `Option ${index}B`, `Option ${index}C`],
          weights: [0.4, 0.4, 0.2],
        };
      case 'Concat':
        return { separator: ' | ' };
      case 'Output':
        return { template: `Output ${index}: {{value}}` };
      case 'SetVariable':
        return { variableName: `var${index}`, value: `value${index}` };
      case 'GetVariable':
        return { variableName: `var${Math.max(0, index - 1)}` };
      default:
        return {};
    }
  }

  /**
   * Test graph preview endpoint
   */
  async testPreviewEndpoint(user: VirtualUser): Promise<void> {
    const testDuration = 30000; // 30 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        const graph = this.generateSampleGraph('simple');
        const requestData = {
          graph,
          runs: Math.floor(Math.random() * 5) + 1,
          seedStart: Math.floor(Math.random() * 1000) + 1,
        };

        await user.executeRequest('POST', '/preview', requestData, {
          'Content-Type': 'application/json',
          'x-session-id': `session-${user.id}`,
          'x-user-id': user.id.toString(),
        });

        await user.thinkTime();
      } catch (error) {
        // Error is already recorded by executeRequest
        console.log(`Preview test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Test export endpoint
   */
  async testExportEndpoint(user: VirtualUser): Promise<void> {
    const testDuration = 20000; // 20 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        const graph = this.generateSampleGraph('medium');
        const requestData = {
          graph,
          options: {
            name: `TestGraph-${user.id}-${Date.now()}`,
            version: '1.0.0',
            author: `LoadTester-${user.id}`,
          },
        };

        await user.executeRequest('POST', '/export', requestData, {
          'Content-Type': 'application/json',
        });

        await user.thinkTime();
      } catch (error) {
        console.log(`Export test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Test health check endpoints
   */
  async testHealthEndpoints(user: VirtualUser): Promise<void> {
    const testDuration = 15000; // 15 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        // Test main health endpoint
        await user.executeRequest('GET', '/health');

        // Test WebSocket status
        await user.executeRequest('GET', '/ws/status');

        // Test root endpoint
        await user.executeRequest('GET', '/');

        await user.thinkTime();
      } catch (error) {
        console.log(`Health test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Test analytics endpoints
   */
  async testAnalyticsEndpoints(user: VirtualUser): Promise<void> {
    const testDuration = 25000; // 25 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        // Test various analytics endpoints
        const endpoints = [
          '/api/analytics/events',
          '/api/analytics/metrics',
          '/api/analytics/dashboard',
          '/api/randomizer/stats',
        ];

        for (const endpoint of endpoints) {
          try {
            await user.executeRequest('GET', endpoint);
          } catch (error) {
            // Some endpoints might not be available without proper setup
            console.log(`Analytics endpoint ${endpoint} error:`, error.message);
          }
        }

        await user.thinkTime();
      } catch (error) {
        console.log(`Analytics test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Test file browser and workspace endpoints
   */
  async testWorkspaceEndpoints(user: VirtualUser): Promise<void> {
    const testDuration = 20000; // 20 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        // Test workspace listing
        await user.executeRequest('GET', '/api/workspaces');

        // Test project endpoints
        await user.executeRequest('GET', '/api/projects');

        // Test workflow endpoints
        await user.executeRequest('GET', '/api/workflow/status');

        await user.thinkTime();
      } catch (error) {
        console.log(`Workspace test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Test security endpoints
   */
  async testSecurityEndpoints(user: VirtualUser): Promise<void> {
    const testDuration = 15000; // 15 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        // Test security audit endpoints
        await user.executeRequest('GET', '/api/audit/status');

        // Test anomaly detection status
        await user.executeRequest('GET', '/api/security/anomaly-detection/status');

        await user.thinkTime();
      } catch (error) {
        console.log(`Security test error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Mixed realistic user scenario
   */
  async testRealisticUserScenario(user: VirtualUser): Promise<void> {
    const testDuration = 45000; // 45 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < testDuration && user.isRunning) {
      try {
        // Simulate realistic user workflow

        // 1. Check system health (user loading the app)
        await user.executeRequest('GET', '/health');
        await user.thinkTime();

        // 2. Browse workspaces (user looking for projects)
        await user.executeRequest('GET', '/api/workspaces');
        await user.thinkTime();

        // 3. Create/test graph (main workflow)
        const graph = this.generateSampleGraph(['simple', 'medium', 'complex'][Math.floor(Math.random() * 3)] as any);
        const previewData = {
          graph,
          runs: Math.floor(Math.random() * 3) + 2,
          seedStart: Math.floor(Math.random() * 100) + 1,
        };

        await user.executeRequest('POST', '/preview', previewData, {
          'Content-Type': 'application/json',
          'x-session-id': `session-${user.id}`,
          'x-user-id': user.id.toString(),
        });
        await user.thinkTime();

        // 4. Export if satisfied (30% chance)
        if (Math.random() > 0.7) {
          const exportData = {
            graph,
            options: {
              name: `UserGraph-${user.id}-${Date.now()}`,
              version: '1.0.0',
              author: `User-${user.id}`,
            },
          };

          await user.executeRequest('POST', '/export', exportData, {
            'Content-Type': 'application/json',
          });
          await user.thinkTime();
        }

        // 5. Check analytics occasionally (20% chance)
        if (Math.random() > 0.8) {
          await user.executeRequest('GET', '/api/analytics/metrics');
          await user.thinkTime();
        }
      } catch (error) {
        console.log(`Realistic scenario error for user ${user.id}:`, error.message);
      }
    }
  }

  /**
   * Run comprehensive load test suite for API endpoints
   */
  async runAPILoadTestSuite(): Promise<APIEndpointTestResult[]> {
    console.log('🚀 Starting Comprehensive API Load Test Suite');
    console.log('='.repeat(70));

    const results: APIEndpointTestResult[] = [];

    // Test scenarios configuration
    const scenarios = [
      {
        name: 'Preview Endpoint Load Test',
        runner: this.testPreviewEndpoint.bind(this),
        concurrency: 15,
        duration: 45000,
        expectedPerformance: { maxResponseTime: 2000, minSuccessRate: 95, minThroughput: 10 },
      },
      {
        name: 'Export Endpoint Load Test',
        runner: this.testExportEndpoint.bind(this),
        concurrency: 8,
        duration: 30000,
        expectedPerformance: { maxResponseTime: 3000, minSuccessRate: 98, minThroughput: 5 },
      },
      {
        name: 'Health Endpoints Load Test',
        runner: this.testHealthEndpoints.bind(this),
        concurrency: 20,
        duration: 25000,
        expectedPerformance: { maxResponseTime: 500, minSuccessRate: 99, minThroughput: 50 },
      },
      {
        name: 'Analytics Endpoints Load Test',
        runner: this.testAnalyticsEndpoints.bind(this),
        concurrency: 10,
        duration: 30000,
        expectedPerformance: { maxResponseTime: 1500, minSuccessRate: 90, minThroughput: 8 },
      },
      {
        name: 'Workspace Endpoints Load Test',
        runner: this.testWorkspaceEndpoints.bind(this),
        concurrency: 12,
        duration: 25000,
        expectedPerformance: { maxResponseTime: 1000, minSuccessRate: 95, minThroughput: 15 },
      },
      {
        name: 'Security Endpoints Load Test',
        runner: this.testSecurityEndpoints.bind(this),
        concurrency: 6,
        duration: 20000,
        expectedPerformance: { maxResponseTime: 800, minSuccessRate: 90, minThroughput: 10 },
      },
      {
        name: 'Realistic User Scenario',
        runner: this.testRealisticUserScenario.bind(this),
        concurrency: 10,
        duration: 60000,
        expectedPerformance: { maxResponseTime: 2500, minSuccessRate: 93, minThroughput: 5 },
      },
    ];

    for (const scenario of scenarios) {
      console.log(`\\n🔄 Running ${scenario.name}...`);

      const config = new LoadTestConfig({
        baseUrl: this.baseUrl,
        concurrency: scenario.concurrency,
        duration: scenario.duration,
        rampUpTime: Math.min(scenario.duration / 4, 10000), // Max 10s ramp-up
        timeout: 15000,
        thinkTime: { min: 100, max: 1000 },
        reportInterval: 5000,
      });

      const runner = new LoadTestRunner(config);

      try {
        const testResults = await runner.runLoadTest(scenario.runner, scenario.name);
        const globalStats = testResults.global;

        // Calculate error summary
        const errorCounts = {};
        globalStats.errors.forEach(error => {
          const key = error.errorMessage || `HTTP ${error.statusCode}`;
          errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        const errorSummary = Object.entries(errorCounts).map(([message, count]) => ({
          message,
          count: count as number,
        }));

        const endpointResult: APIEndpointTestResult = {
          endpoint: scenario.name,
          method: 'MIXED',
          averageResponseTime: globalStats.averageResponseTime,
          p95ResponseTime: globalStats.p95,
          p99ResponseTime: globalStats.p99,
          successRate: globalStats.successRate,
          requestsPerSecond: globalStats.requestsPerSecond,
          totalRequests: globalStats.totalRequests,
          errors: errorSummary,
        };

        results.push(endpointResult);

        // Check if performance expectations are met
        const passed =
          globalStats.averageResponseTime <= scenario.expectedPerformance.maxResponseTime &&
          globalStats.successRate >= scenario.expectedPerformance.minSuccessRate &&
          globalStats.requestsPerSecond >= scenario.expectedPerformance.minThroughput;

        console.log(
          `${passed ? '✅' : '❌'} ${scenario.name}: ${globalStats.requestsPerSecond.toFixed(1)} RPS, ${globalStats.successRate.toFixed(1)}% success, ${globalStats.averageResponseTime.toFixed(0)}ms avg`
        );

        // Export results for this scenario
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        runner.exportResults(
          testResults,
          `api-load-test-${scenario.name.toLowerCase().replace(/\\s+/g, '-')}-${timestamp}.json`
        );
      } catch (error) {
        console.error(`❌ ${scenario.name} failed:`, error.message);

        // Add failed test result
        results.push({
          endpoint: scenario.name,
          method: 'MIXED',
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          successRate: 0,
          requestsPerSecond: 0,
          totalRequests: 0,
          errors: [{ message: error.message, count: 1 }],
        });
      }
    }

    return results;
  }

  /**
   * Generate comprehensive report
   */
  generateLoadTestReport(results: APIEndpointTestResult[]): string {
    let report = '\\n📊 API LOAD TESTING COMPREHENSIVE REPORT\\n';
    report += '='.repeat(80) + '\\n\\n';

    const overallPassed = results.every(r => r.successRate >= 90 && r.requestsPerSecond > 0);
    report += `Overall Status: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\\n\\n`;

    // Individual endpoint results
    for (const result of results) {
      const passed = result.successRate >= 90 && result.requestsPerSecond > 0;
      report += `${passed ? '✅' : '❌'} ${result.endpoint}\\n`;
      report += `   Requests/sec: ${result.requestsPerSecond.toFixed(2)}\\n`;
      report += `   Success Rate: ${result.successRate.toFixed(1)}%\\n`;
      report += `   Avg Response: ${result.averageResponseTime.toFixed(0)}ms\\n`;
      report += `   P95 Response: ${result.p95ResponseTime.toFixed(0)}ms\\n`;
      report += `   P99 Response: ${result.p99ResponseTime.toFixed(0)}ms\\n`;
      report += `   Total Requests: ${result.totalRequests}\\n`;

      if (result.errors.length > 0) {
        report += '   Top Errors:\\n';
        result.errors.slice(0, 3).forEach(error => {
          report += `     - ${error.message}: ${error.count} occurrences\\n`;
        });
      }
      report += '\\n';
    }

    // Performance summary
    const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
    const avgThroughput = results.reduce((sum, r) => sum + r.requestsPerSecond, 0);
    const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length;

    report += 'Performance Summary:\\n';
    report += `   Total API Requests: ${totalRequests}\\n`;
    report += `   Combined Throughput: ${avgThroughput.toFixed(1)} RPS\\n`;
    report += `   Average Success Rate: ${avgSuccessRate.toFixed(1)}%\\n`;
    report += `   Average Response Time: ${avgResponseTime.toFixed(0)}ms\\n`;
    report += `   Test Scenarios: ${results.length}\\n`;
    report += `   Passed Scenarios: ${results.filter(r => r.successRate >= 90).length}\\n`;

    return report;
  }
}

// Jest test suite
describe('API Load Testing Suite', () => {
  let apiTester: APILoadTester;

  beforeAll(async () => {
    apiTester = new APILoadTester(process.env.API_BASE_URL || 'http://localhost:8000');
    await apiTester.authenticate();
  });

  test('Preview endpoint load test', async () => {
    const config = new LoadTestConfig({
      baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
      concurrency: 8,
      duration: 20000,
      rampUpTime: 5000,
      timeout: 10000,
    });

    const runner = new LoadTestRunner(config);
    const results = await runner.runLoadTest(apiTester.testPreviewEndpoint.bind(apiTester), 'Preview Load Test');

    expect(results.global.successRate).toBeGreaterThan(85);
    expect(results.global.requestsPerSecond).toBeGreaterThan(2);
    expect(results.global.averageResponseTime).toBeLessThan(3000);

    console.log(
      `Preview load test: ${results.global.requestsPerSecond.toFixed(1)} RPS, ${results.global.successRate.toFixed(1)}% success`
    );
  }, 45000);

  test('Export endpoint load test', async () => {
    const config = new LoadTestConfig({
      baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
      concurrency: 5,
      duration: 15000,
      rampUpTime: 3000,
      timeout: 10000,
    });

    const runner = new LoadTestRunner(config);
    const results = await runner.runLoadTest(apiTester.testExportEndpoint.bind(apiTester), 'Export Load Test');

    expect(results.global.successRate).toBeGreaterThan(90);
    expect(results.global.requestsPerSecond).toBeGreaterThan(1);
    expect(results.global.averageResponseTime).toBeLessThan(4000);

    console.log(
      `Export load test: ${results.global.requestsPerSecond.toFixed(1)} RPS, ${results.global.successRate.toFixed(1)}% success`
    );
  }, 30000);

  test('Health endpoints load test', async () => {
    const config = new LoadTestConfig({
      baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
      concurrency: 15,
      duration: 10000,
      rampUpTime: 2000,
      timeout: 5000,
    });

    const runner = new LoadTestRunner(config);
    const results = await runner.runLoadTest(apiTester.testHealthEndpoints.bind(apiTester), 'Health Load Test');

    expect(results.global.successRate).toBeGreaterThan(95);
    expect(results.global.requestsPerSecond).toBeGreaterThan(10);
    expect(results.global.averageResponseTime).toBeLessThan(1000);

    console.log(
      `Health load test: ${results.global.requestsPerSecond.toFixed(1)} RPS, ${results.global.successRate.toFixed(1)}% success`
    );
  }, 20000);

  test('Realistic user scenario load test', async () => {
    const config = new LoadTestConfig({
      baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
      concurrency: 6,
      duration: 30000,
      rampUpTime: 8000,
      timeout: 12000,
    });

    const runner = new LoadTestRunner(config);
    const results = await runner.runLoadTest(
      apiTester.testRealisticUserScenario.bind(apiTester),
      'Realistic User Scenario'
    );

    expect(results.global.successRate).toBeGreaterThan(80);
    expect(results.global.requestsPerSecond).toBeGreaterThan(1);
    expect(results.global.averageResponseTime).toBeLessThan(3500);

    console.log(
      `Realistic scenario: ${results.global.requestsPerSecond.toFixed(1)} RPS, ${results.global.successRate.toFixed(1)}% success`
    );
  }, 50000);

  test('Complete API load testing suite', async () => {
    const results = await apiTester.runAPILoadTestSuite();
    const report = apiTester.generateLoadTestReport(results);

    console.log(report);

    // Validate overall performance
    const overallPassed = results.every(r => r.successRate >= 80 && r.requestsPerSecond > 0);
    expect(overallPassed).toBe(true);

    // Validate individual critical endpoints
    const previewResult = results.find(r => r.endpoint.includes('Preview'));
    if (previewResult) {
      expect(previewResult.successRate).toBeGreaterThan(85);
      expect(previewResult.averageResponseTime).toBeLessThan(3000);
    }

    const healthResult = results.find(r => r.endpoint.includes('Health'));
    if (healthResult) {
      expect(healthResult.successRate).toBeGreaterThan(95);
      expect(healthResult.averageResponseTime).toBeLessThan(1000);
    }

    // Generate performance metrics for CI/CD
    const metricsData = {
      timestamp: new Date().toISOString(),
      overallPassed,
      totalEndpoints: results.length,
      averageThroughput: results.reduce((sum, r) => sum + r.requestsPerSecond, 0),
      averageSuccessRate: results.reduce((sum, r) => sum + r.successRate, 0) / results.length,
      averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
      endpointResults: results.map(r => ({
        endpoint: r.endpoint,
        successRate: r.successRate,
        throughput: r.requestsPerSecond,
        avgResponseTime: r.averageResponseTime,
      })),
    };

    expect(metricsData.averageSuccessRate).toBeGreaterThan(85);
    expect(metricsData.averageThroughput).toBeGreaterThan(5);
  }, 300000); // 5 minutes timeout for full suite
});

export { APILoadTester, APIEndpointTestResult, LoadTestScenario };
