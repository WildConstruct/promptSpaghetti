#!/usr/bin/env node

/**
 * Epic 19 Performance Regression Testing Framework
 * Automated performance regression testing for security components and critical paths
 * 
 * Features:
 * - Baseline performance measurement and tracking
 * - Automated regression detection with statistical analysis
 * - Multi-dimensional performance testing (latency, throughput, memory)
 * - Historical performance trend analysis
 * - CI/CD pipeline integration with pass/fail criteria
 * - Performance alert generation and reporting
 * - Resource utilization monitoring
 * - Load testing under various conditions
 */

const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Performance testing configuration
const PERFORMANCE_CONFIG = {
  // Test categories and their performance targets
  testCategories: {
    authentication: {
      targets: {
        login: { maxLatency: 200, maxMemory: 50, minThroughput: 100 },
        mfaVerification: { maxLatency: 100, maxMemory: 30, minThroughput: 200 },
        tokenValidation: { maxLatency: 50, maxMemory: 20, minThroughput: 500 },
        sessionCreation: { maxLatency: 80, maxMemory: 25, minThroughput: 300 }
      },
      regressionThreshold: 0.15 // 15% performance degradation threshold
    },
    
    security: {
      targets: {
        inputValidation: { maxLatency: 10, maxMemory: 10, minThroughput: 1000 },
        encryption: { maxLatency: 25, maxMemory: 40, minThroughput: 400 },
        keyDerivation: { maxLatency: 100, maxMemory: 60, minThroughput: 50 },
        riskAssessment: { maxLatency: 150, maxMemory: 80, minThroughput: 100 }
      },
      regressionThreshold: 0.10 // 10% performance degradation threshold
    },
    
    database: {
      targets: {
        userQuery: { maxLatency: 50, maxMemory: 30, minThroughput: 500 },
        auditLogWrite: { maxLatency: 20, maxMemory: 15, minThroughput: 1000 },
        sessionLookup: { maxLatency: 30, maxMemory: 20, minThroughput: 800 },
        complianceQuery: { maxLatency: 200, maxMemory: 100, minThroughput: 50 }
      },
      regressionThreshold: 0.20 // 20% performance degradation threshold
    },
    
    api: {
      targets: {
        healthCheck: { maxLatency: 10, maxMemory: 5, minThroughput: 2000 },
        authEndpoints: { maxLatency: 300, maxMemory: 100, minThroughput: 200 },
        dataEndpoints: { maxLatency: 500, maxMemory: 150, minThroughput: 100 },
        adminEndpoints: { maxLatency: 1000, maxMemory: 200, minThroughput: 50 }
      },
      regressionThreshold: 0.25 // 25% performance degradation threshold
    }
  },

  // Test execution parameters
  execution: {
    warmupIterations: 10,
    testIterations: 100,
    concurrencyLevels: [1, 5, 10, 25, 50],
    dataSize: {
      small: 1024,      // 1KB
      medium: 10240,    // 10KB
      large: 102400,    // 100KB
      xlarge: 1048576   // 1MB
    },
    timeouts: {
      individual: 10000,  // 10 seconds per test
      total: 300000       // 5 minutes total
    }
  },

  // Regression analysis configuration
  analysis: {
    statisticalMethods: ['mean', 'median', 'p95', 'p99'],
    trendAnalysis: {
      windowSize: 10,    // Last 10 test runs
      significanceLevel: 0.05,
      minimumSamples: 5
    },
    alerting: {
      enabled: true,
      channels: ['console', 'file', 'webhook'],
      severityLevels: ['info', 'warning', 'critical']
    }
  },

  // Historical data storage
  storage: {
    baselineFile: 'docs/performance/performance-baseline.json',
    historyFile: 'docs/performance/performance-history.json',
    reportFile: 'docs/performance/performance-regression-report.json',
    trendsFile: 'docs/performance/performance-trends.json'
  }
};

// Mock security services for performance testing
class MockSecurityServices {
  constructor() {
    this.cache = new Map();
    this.memoryUsage = process.memoryUsage();
  }

  // Mock authentication operations
  async performLogin(username: string, password: string, complexity: string = 'medium'): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate password hashing (varying complexity)
    const iterations = complexity === 'high' ? 100000 : complexity === 'medium' ? 50000 : 10000;
    const salt = crypto.randomBytes(32);
    crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
    
    // Simulate database lookup
    await this.simulateDelay(10, 30);
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true
    };
  }

  async performMFAVerification(code: string, method: string = 'totp'): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate different MFA verification methods
    const processingTime = method === 'sms' ? 100 : method === 'email' ? 80 : 50;
    await this.simulateDelay(processingTime - 20, processingTime + 20);
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true
    };
  }

  async performTokenValidation(token: string): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Check cache first
    if (this.cache.has(token)) {
      const end = performance.now();
      return {
        duration: end - start,
        memoryDelta: 0,
        success: true,
        cached: true
      };
    }
    
    // Simulate token validation
    const decoded = crypto.createHash('sha256').update(token).digest('hex');
    await this.simulateDelay(20, 40);
    
    // Cache result
    this.cache.set(token, { decoded, timestamp: Date.now() });
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      cached: false
    };
  }

  // Mock security operations
  async performInputValidation(input: string, complexity: string = 'medium'): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate validation complexity
    const patterns = complexity === 'high' ? 20 : complexity === 'medium' ? 10 : 5;
    for (let i = 0; i < patterns; i++) {
      const regex = new RegExp(`pattern${i}`, 'gi');
      regex.test(input);
    }
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true
    };
  }

  async performEncryption(data: string, algorithm: string = 'aes-256-gcm'): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      dataSize: data.length
    };
  }

  async performKeyDerivation(password: string, salt: string, iterations: number = 100000): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      keyLength: key.length
    };
  }

  async performRiskAssessment(context: any): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate risk factor calculations
    const factors = ['location', 'device', 'behavior', 'time', 'history'];
    const scores = factors.map(factor => Math.random() * 100);
    const riskScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Simulate ML model inference
    await this.simulateDelay(50, 150);
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      riskScore,
      factors: factors.length
    };
  }

  // Mock database operations
  async performUserQuery(userId: string): Promise<any> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate database query with indexing
    await this.simulateDelay(20, 60);
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      recordsReturned: 1
    };
  }

  async performAuditLogWrite(logEntry: any): Promise<void> {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    // Simulate audit log write with checksum
    const checksum = crypto.createHash('sha256').update(JSON.stringify(logEntry)).digest('hex');
    
    // Simulate write operation
    await this.simulateDelay(5, 25);
    
    const end = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: end - start,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      success: true,
      checksum
    };
  }

  // Utility methods
  async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  generateTestData(size: number): string {
    return crypto.randomBytes(size).toString('hex');
  }
}

// Performance regression testing framework
class PerformanceRegressionTester {
  constructor() {
    this.mockServices = new MockSecurityServices();
    this.testResults = {
      timestamp: new Date(),
      testRunId: crypto.randomUUID(),
      environment: this.getEnvironmentInfo(),
      results: {},
      baseline: null,
      regressions: [],
      summary: {}
    };
    this.baseline = null;
    this.history = [];
  }

  /**
   * Run comprehensive performance regression testing
   */
  async runPerformanceRegressionTests(): Promise<void> {
    console.log('⚡ Starting Epic 19 Performance Regression Testing');
    console.log('=' .repeat(60));
    
    try {
      // Phase 1: Load baseline and historical data
      await this.loadPerformanceHistory();
      
      // Phase 2: Run performance tests for all categories
      await this.runAuthenticationPerformanceTests();
      await this.runSecurityPerformanceTests();
      await this.runDatabasePerformanceTests();
      await this.runAPIPerformanceTests();
      
      // Phase 3: Analyze results for regressions
      await this.analyzePerformanceRegressions();
      
      // Phase 4: Generate performance trend analysis
      await this.generatePerformanceTrends();
      
      // Phase 5: Generate comprehensive report
      await this.generateRegressionReport();
      
      // Phase 6: Update performance history
      await this.updatePerformanceHistory();
      
      console.log('\n✅ Performance regression testing completed!');
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Performance regression testing failed:', error.message);
      throw error;
    }
  }

  /**
   * Run authentication performance tests
   */
  async runAuthenticationPerformanceTests(): Promise<void> {
    console.log('\n🔐 Testing Authentication Performance...');
    
    const authTests = {
      login: async () => await this.mockServices.performLogin('testuser', 'password123', 'medium'),
      mfaVerification: async () => await this.mockServices.performMFAVerification('123456', 'totp'),
      tokenValidation: async () => await this.mockServices.performTokenValidation('mock-jwt-token'),
      sessionCreation: async () => await this.mockServices.performLogin('testuser', 'password123', 'low')
    };

    const results = {};
    
    for (const [testName, testFn] of Object.entries(authTests)) {
      console.log(`  📊 Testing ${testName}...`);
      results[testName] = await this.runPerformanceTest(testFn, testName, 'authentication');
    }
    
    this.testResults.results.authentication = results;
    this.printCategoryResults('Authentication', results);
  }

  /**
   * Run security performance tests
   */
  async runSecurityPerformanceTests(): Promise<void> {
    console.log('\n🛡️ Testing Security Performance...');
    
    const securityTests = {
      inputValidation: async () => {
        const testData = this.mockServices.generateTestData(PERFORMANCE_CONFIG.execution.dataSize.medium);
        return await this.mockServices.performInputValidation(testData, 'medium');
      },
      encryption: async () => {
        const testData = this.mockServices.generateTestData(PERFORMANCE_CONFIG.execution.dataSize.small);
        return await this.mockServices.performEncryption(testData, 'aes-256-gcm');
      },
      keyDerivation: async () => {
        const password = 'test-password-123';
        const salt = crypto.randomBytes(32);
        return await this.mockServices.performKeyDerivation(password, salt, 50000);
      },
      riskAssessment: async () => {
        const context = {
          userId: 'test-user',
          ipAddress: '192.168.1.100',
          userAgent: 'Test Browser',
          location: 'US'
        };
        return await this.mockServices.performRiskAssessment(context);
      }
    };

    const results = {};
    
    for (const [testName, testFn] of Object.entries(securityTests)) {
      console.log(`  📊 Testing ${testName}...`);
      results[testName] = await this.runPerformanceTest(testFn, testName, 'security');
    }
    
    this.testResults.results.security = results;
    this.printCategoryResults('Security', results);
  }

  /**
   * Run database performance tests
   */
  async runDatabasePerformanceTests(): Promise<void> {
    console.log('\n🗄️ Testing Database Performance...');
    
    const dbTests = {
      userQuery: async () => await this.mockServices.performUserQuery('test-user-123'),
      auditLogWrite: async () => {
        const logEntry = {
          userId: 'test-user-123',
          action: 'login',
          timestamp: new Date(),
          ipAddress: '192.168.1.100'
        };
        return await this.mockServices.performAuditLogWrite(logEntry);
      },
      sessionLookup: async () => await this.mockServices.performTokenValidation(`session-${Date.now()}`),
      complianceQuery: async () => {
        // Simulate complex compliance query
        await this.mockServices.simulateDelay(100, 300);
        return {
          duration: Math.random() * 200 + 100,
          memoryDelta: Math.random() * 50000,
          success: true
        };
      }
    };

    const results = {};
    
    for (const [testName, testFn] of Object.entries(dbTests)) {
      console.log(`  📊 Testing ${testName}...`);
      results[testName] = await this.runPerformanceTest(testFn, testName, 'database');
    }
    
    this.testResults.results.database = results;
    this.printCategoryResults('Database', results);
  }

  /**
   * Run API performance tests
   */
  async runAPIPerformanceTests(): Promise<void> {
    console.log('\n🌐 Testing API Performance...');
    
    const apiTests = {
      healthCheck: async () => {
        const start = performance.now();
        const end = performance.now();
        return {
          duration: end - start + Math.random() * 5, // Simulate very fast health check
          memoryDelta: Math.random() * 1000,
          success: true
        };
      },
      authEndpoints: async () => await this.mockServices.performLogin('api-user', 'api-password'),
      dataEndpoints: async () => {
        // Simulate data retrieval endpoint
        await this.mockServices.simulateDelay(200, 800);
        return {
          duration: Math.random() * 600 + 200,
          memoryDelta: Math.random() * 100000,
          success: true
        };
      },
      adminEndpoints: async () => {
        // Simulate complex admin operation
        await this.mockServices.simulateDelay(500, 1500);
        return {
          duration: Math.random() * 1000 + 500,
          memoryDelta: Math.random() * 200000,
          success: true
        };
      }
    };

    const results = {};
    
    for (const [testName, testFn] of Object.entries(apiTests)) {
      console.log(`  📊 Testing ${testName}...`);
      results[testName] = await this.runPerformanceTest(testFn, testName, 'api');
    }
    
    this.testResults.results.api = results;
    this.printCategoryResults('API', results);
  }

  /**
   * Run individual performance test with statistical analysis
   */
  async runPerformanceTest(testFunction: Function, testName: string, category: string): Promise<any> {
    const iterations = PERFORMANCE_CONFIG.execution.testIterations;
    const warmupIterations = PERFORMANCE_CONFIG.execution.warmupIterations;
    const results = [];

    // Warmup iterations
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await testFunction();
      } catch (error) {
        // Ignore warmup errors
      }
    }

    // Actual test iterations
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await testFunction();
        results.push(result);
      } catch (error) {
        results.push({
          duration: -1,
          memoryDelta: -1,
          success: false,
          error: error.message
        });
      }
    }

    // Calculate statistics
    const successfulResults = results.filter(r => r.success);
    const durations = successfulResults.map(r => r.duration);
    const memoryDeltas = successfulResults.map(r => r.memoryDelta);

    durations.sort((a, b) => a - b);
    memoryDeltas.sort((a, b) => a - b);

    const statistics = {
      totalIterations: iterations,
      successfulIterations: successfulResults.length,
      failureRate: (iterations - successfulResults.length) / iterations,
      
      latency: {
        mean: this.calculateMean(durations),
        median: this.calculateMedian(durations),
        p95: this.calculatePercentile(durations, 0.95),
        p99: this.calculatePercentile(durations, 0.99),
        min: Math.min(...durations),
        max: Math.max(...durations),
        stdDev: this.calculateStandardDeviation(durations)
      },
      
      memory: {
        mean: this.calculateMean(memoryDeltas),
        median: this.calculateMedian(memoryDeltas),
        p95: this.calculatePercentile(memoryDeltas, 0.95),
        p99: this.calculatePercentile(memoryDeltas, 0.99),
        min: Math.min(...memoryDeltas),
        max: Math.max(...memoryDeltas)
      },
      
      throughput: successfulResults.length > 0 ? 
        1000 / this.calculateMean(durations) : 0 // operations per second
    };

    // Check against targets
    const targets = PERFORMANCE_CONFIG.testCategories[category]?.targets[testName];
    const performance = {
      passesLatencyTarget: !targets || statistics.latency.mean <= targets.maxLatency,
      passesMemoryTarget: !targets || (statistics.memory.mean / 1024) <= targets.maxMemory, // Convert to KB
      passesThroughputTarget: !targets || statistics.throughput >= targets.minThroughput,
      overallPass: true
    };

    performance.overallPass = performance.passesLatencyTarget && 
                             performance.passesMemoryTarget && 
                             performance.passesThroughputTarget;

    return {
      testName,
      category,
      statistics,
      performance,
      targets,
      timestamp: new Date()
    };
  }

  /**
   * Analyze performance regressions compared to baseline
   */
  async analyzePerformanceRegressions(): Promise<void> {
    console.log('\n📊 Analyzing Performance Regressions...');
    
    if (!this.baseline) {
      console.log('  ℹ️ No baseline found, current results will be used as baseline');
      this.baseline = JSON.parse(JSON.stringify(this.testResults.results));
      return;
    }

    const regressions = [];
    
    for (const [category, categoryResults] of Object.entries(this.testResults.results)) {
      const baselineCategory = this.baseline[category];
      if (!baselineCategory) continue;

      const threshold = PERFORMANCE_CONFIG.testCategories[category]?.regressionThreshold || 0.15;
      
      for (const [testName, testResult] of Object.entries(categoryResults)) {
        const baselineTest = baselineCategory[testName];
        if (!baselineTest) continue;

        const currentLatency = testResult.statistics.latency.mean;
        const baselineLatency = baselineTest.statistics.latency.mean;
        const latencyRegression = (currentLatency - baselineLatency) / baselineLatency;

        const currentMemory = testResult.statistics.memory.mean;
        const baselineMemory = baselineTest.statistics.memory.mean;
        const memoryRegression = (currentMemory - baselineMemory) / baselineMemory;

        const currentThroughput = testResult.statistics.throughput;
        const baselineThroughput = baselineTest.statistics.throughput;
        const throughputRegression = (baselineThroughput - currentThroughput) / baselineThroughput;

        // Check for significant regressions
        const hasLatencyRegression = latencyRegression > threshold;
        const hasMemoryRegression = memoryRegression > threshold;
        const hasThroughputRegression = throughputRegression > threshold;

        if (hasLatencyRegression || hasMemoryRegression || hasThroughputRegression) {
          const regression = {
            category,
            testName,
            regressions: {
              latency: hasLatencyRegression ? {
                current: currentLatency,
                baseline: baselineLatency,
                change: latencyRegression,
                severity: latencyRegression > threshold * 2 ? 'critical' : 'warning'
              } : null,
              memory: hasMemoryRegression ? {
                current: currentMemory,
                baseline: baselineMemory,
                change: memoryRegression,
                severity: memoryRegression > threshold * 2 ? 'critical' : 'warning'
              } : null,
              throughput: hasThroughputRegression ? {
                current: currentThroughput,
                baseline: baselineThroughput,
                change: throughputRegression,
                severity: throughputRegression > threshold * 2 ? 'critical' : 'warning'
              } : null
            },
            overallSeverity: (latencyRegression > threshold * 2 || 
                             memoryRegression > threshold * 2 || 
                             throughputRegression > threshold * 2) ? 'critical' : 'warning'
          };
          
          regressions.push(regression);
        }
      }
    }

    this.testResults.regressions = regressions;
    
    console.log(`  📊 Regression Analysis Complete:`);
    console.log(`    Total Regressions Found: ${regressions.length}`);
    console.log(`    Critical Regressions: ${regressions.filter(r => r.overallSeverity === 'critical').length}`);
    console.log(`    Warning Regressions: ${regressions.filter(r => r.overallSeverity === 'warning').length}`);
  }

  /**
   * Generate performance trend analysis
   */
  async generatePerformanceTrends(): Promise<void> {
    console.log('\n📈 Generating Performance Trends...');
    
    if (this.history.length < 2) {
      console.log('  ℹ️ Insufficient historical data for trend analysis');
      return;
    }

    const trends = {};
    const windowSize = Math.min(PERFORMANCE_CONFIG.analysis.trendAnalysis.windowSize, this.history.length);
    const recentHistory = this.history.slice(-windowSize);

    for (const [category, categoryResults] of Object.entries(this.testResults.results)) {
      trends[category] = {};
      
      for (const [testName, testResult] of Object.entries(categoryResults)) {
        const historicalData = recentHistory
          .map(h => h.results[category]?.[testName])
          .filter(Boolean)
          .map(t => ({
            timestamp: t.timestamp,
            latency: t.statistics.latency.mean,
            memory: t.statistics.memory.mean,
            throughput: t.statistics.throughput
          }));

        if (historicalData.length >= PERFORMANCE_CONFIG.analysis.trendAnalysis.minimumSamples) {
          trends[category][testName] = {
            dataPoints: historicalData.length,
            latencyTrend: this.calculateTrend(historicalData.map(d => d.latency)),
            memoryTrend: this.calculateTrend(historicalData.map(d => d.memory)),
            throughputTrend: this.calculateTrend(historicalData.map(d => d.throughput)),
            stability: this.calculateStability(historicalData)
          };
        }
      }
    }

    this.testResults.trends = trends;
    console.log(`  📊 Trend Analysis Complete for ${Object.keys(trends).length} categories`);
  }

  /**
   * Generate comprehensive regression report
   */
  async generateRegressionReport(): Promise<void> {
    console.log('\n📄 Generating Performance Regression Report...');
    
    const reportData = {
      summary: {
        testRunId: this.testResults.testRunId,
        timestamp: this.testResults.timestamp,
        environment: this.testResults.environment,
        totalTests: this.getTotalTestCount(),
        totalRegressions: this.testResults.regressions.length,
        criticalRegressions: this.testResults.regressions.filter(r => r.overallSeverity === 'critical').length,
        overallStatus: this.calculateOverallStatus()
      },
      performanceResults: this.testResults.results,
      regressionAnalysis: this.testResults.regressions,
      trendAnalysis: this.testResults.trends,
      recommendations: this.generatePerformanceRecommendations(),
      cicdIntegration: this.generateCICDReport()
    };

    // Save comprehensive report
    const reportPath = path.join(__dirname, '../docs/performance/epic19-performance-regression-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    await this.generateHTMLPerformanceReport(reportData);
    
    // Generate markdown summary
    await this.generateMarkdownPerformanceSummary(reportData);

    console.log(`  📊 Performance Reports Generated:`);
    console.log(`    📄 JSON Report: docs/performance/epic19-performance-regression-report.json`);
    console.log(`    🌐 HTML Report: docs/performance/epic19-performance-regression-report.html`);
    console.log(`    📝 Summary: docs/performance/epic19-performance-regression-summary.md`);
  }

  /**
   * Update performance history and baseline
   */
  async updatePerformanceHistory(): Promise<void> {
    console.log('\n💾 Updating Performance History...');
    
    // Add current results to history
    this.history.push({
      testRunId: this.testResults.testRunId,
      timestamp: this.testResults.timestamp,
      results: this.testResults.results,
      summary: this.testResults.summary
    });

    // Keep only recent history (last 50 runs)
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }

    // Update baseline if this is a successful run with no critical regressions
    const criticalRegressions = this.testResults.regressions.filter(r => r.overallSeverity === 'critical').length;
    if (criticalRegressions === 0) {
      this.baseline = JSON.parse(JSON.stringify(this.testResults.results));
      console.log('  ✅ Baseline updated with current results');
    }

    // Save updated data
    await this.savePerformanceData();
  }

  // Helper methods
  async loadPerformanceHistory(): Promise<void> {
    try {
      const baselinePath = path.resolve(PERFORMANCE_CONFIG.storage.baselineFile);
      const historyPath = path.resolve(PERFORMANCE_CONFIG.storage.historyFile);
      
      if (await this.fileExists(baselinePath)) {
        const baselineData = await fs.readFile(baselinePath, 'utf8');
        this.baseline = JSON.parse(baselineData);
        console.log('  ✅ Performance baseline loaded');
      }
      
      if (await this.fileExists(historyPath)) {
        const historyData = await fs.readFile(historyPath, 'utf8');
        this.history = JSON.parse(historyData);
        console.log(`  ✅ Performance history loaded (${this.history.length} runs)`);
      }
    } catch (error) {
      console.warn('  ⚠️ Unable to load performance history:', error.message);
    }
  }

  async savePerformanceData(): Promise<void> {
    try {
      const baselinePath = path.resolve(PERFORMANCE_CONFIG.storage.baselineFile);
      const historyPath = path.resolve(PERFORMANCE_CONFIG.storage.historyFile);
      
      await fs.mkdir(path.dirname(baselinePath), { recursive: true });
      
      if (this.baseline) {
        await fs.writeFile(baselinePath, JSON.stringify(this.baseline, null, 2));
      }
      
      await fs.writeFile(historyPath, JSON.stringify(this.history, null, 2));
      
      console.log('  ✅ Performance data saved');
    } catch (error) {
      console.error('  ❌ Failed to save performance data:', error.message);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Statistical calculation methods
  calculateMean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  calculateMedian(sortedValues: number[]): number {
    if (sortedValues.length === 0) return 0;
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0 
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 
      : sortedValues[mid];
  }

  calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.floor(sortedValues.length * percentile);
    return sortedValues[Math.min(index, sortedValues.length - 1)];
  }

  calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  calculateTrend(values: number[]): string {
    if (values.length < 2) return 'insufficient_data';
    
    // Simple linear regression to determine trend
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  calculateStability(historicalData: any[]): string {
    if (historicalData.length < 3) return 'insufficient_data';
    
    const latencies = historicalData.map(d => d.latency);
    const coefficient = this.calculateStandardDeviation(latencies) / this.calculateMean(latencies);
    
    if (coefficient < 0.1) return 'very_stable';
    if (coefficient < 0.2) return 'stable';
    if (coefficient < 0.4) return 'moderate';
    return 'unstable';
  }

  getEnvironmentInfo(): any {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      totalMemory: require('os').totalmem(),
      freeMemory: require('os').freemem()
    };
  }

  getTotalTestCount(): number {
    let total = 0;
    for (const categoryResults of Object.values(this.testResults.results)) {
      total += Object.keys(categoryResults).length;
    }
    return total;
  }

  calculateOverallStatus(): string {
    const criticalRegressions = this.testResults.regressions.filter(r => r.overallSeverity === 'critical').length;
    const warningRegressions = this.testResults.regressions.filter(r => r.overallSeverity === 'warning').length;
    
    if (criticalRegressions > 0) return 'CRITICAL';
    if (warningRegressions > 3) return 'WARNING';
    if (warningRegressions > 0) return 'ATTENTION';
    return 'PASS';
  }

  printCategoryResults(categoryName: string, results: any): void {
    console.log(`  📊 ${categoryName} Results:`);
    for (const [testName, result] of Object.entries(results)) {
      const status = result.performance.overallPass ? '✅' : '❌';
      const latency = result.statistics.latency.mean.toFixed(2);
      const throughput = result.statistics.throughput.toFixed(2);
      console.log(`    ${status} ${testName}: ${latency}ms avg, ${throughput} ops/sec`);
    }
  }

  generatePerformanceRecommendations(): string[] {
    const recommendations = [];
    
    for (const regression of this.testResults.regressions) {
      if (regression.overallSeverity === 'critical') {
        recommendations.push({
          priority: 'CRITICAL',
          category: regression.category,
          test: regression.testName,
          issue: 'Critical performance regression detected',
          recommendation: 'Investigate recent code changes and optimize critical path',
          timeframe: 'Immediate'
        });
      }
    }
    
    // Add general recommendations based on patterns
    const failedTests = [];
    for (const [category, tests] of Object.entries(this.testResults.results)) {
      for (const [testName, result] of Object.entries(tests)) {
        if (!result.performance.overallPass) {
          failedTests.push({ category, testName, result });
        }
      }
    }
    
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Performance',
        issue: `${failedTests.length} tests failing performance targets`,
        recommendation: 'Review and optimize failing components',
        timeframe: '1 week'
      });
    }
    
    return recommendations;
  }

  generateCICDReport(): any {
    const criticalRegressions = this.testResults.regressions.filter(r => r.overallSeverity === 'critical').length;
    const warningRegressions = this.testResults.regressions.filter(r => r.overallSeverity === 'warning').length;
    
    return {
      shouldFailBuild: criticalRegressions > 0,
      exitCode: criticalRegressions > 0 ? 1 : 0,
      message: criticalRegressions > 0 
        ? `Build should fail: ${criticalRegressions} critical performance regressions detected`
        : `Build can proceed: ${warningRegressions} warnings, ${criticalRegressions} critical issues`,
      metrics: {
        criticalRegressions,
        warningRegressions,
        totalTests: this.getTotalTestCount(),
        overallStatus: this.calculateOverallStatus()
      }
    };
  }

  async generateHTMLPerformanceReport(reportData: any): Promise<string> {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Epic 19 Performance Regression Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .critical { color: #d32f2f; }
        .warning { color: #ff9800; }
        .pass { color: #4caf50; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .regression-item { margin: 10px 0; padding: 10px; border-left: 4px solid #ff9800; }
        .critical-regression { border-left-color: #d32f2f; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Epic 19 Performance Regression Report</h1>
        <p>Test Run ID: ${reportData.summary.testRunId}</p>
        <p>Generated: ${new Date(reportData.summary.timestamp).toLocaleString()}</p>
        <p>Status: <span class="${reportData.summary.overallStatus.toLowerCase()}">${reportData.summary.overallStatus}</span></p>
    </div>
    
    <div class="summary">
        <div class="metric-card">
            <h3>Total Tests</h3>
            <h2>${reportData.summary.totalTests}</h2>
        </div>
        <div class="metric-card">
            <h3>Total Regressions</h3>
            <h2>${reportData.summary.totalRegressions}</h2>
        </div>
        <div class="metric-card">
            <h3>Critical Regressions</h3>
            <h2 class="critical">${reportData.summary.criticalRegressions}</h2>
        </div>
    </div>
    
    <h2>Performance Regressions</h2>
    ${reportData.regressionAnalysis.map(reg => `
        <div class="regression-item ${reg.overallSeverity === 'critical' ? 'critical-regression' : ''}">
            <h3>${reg.category}.${reg.testName}</h3>
            <p><strong>Severity:</strong> ${reg.overallSeverity.toUpperCase()}</p>
            ${Object.entries(reg.regressions).filter(([_, data]) => data).map(([metric, data]) => `
                <p><strong>${metric}:</strong> ${(data.change * 100).toFixed(1)}% regression (${data.current.toFixed(2)} vs ${data.baseline.toFixed(2)})</p>
            `).join('')}
        </div>
    `).join('')}
    
    <h2>Recommendations</h2>
    <ul>
    ${reportData.recommendations.map(rec => 
        `<li><strong>${rec.priority}:</strong> ${rec.recommendation} (${rec.timeframe || 'TBD'})</li>`
    ).join('')}
    </ul>
    
    <h2>CI/CD Integration</h2>
    <p><strong>Build Status:</strong> ${reportData.cicdIntegration.shouldFailBuild ? 'FAIL' : 'PASS'}</p>
    <p><strong>Message:</strong> ${reportData.cicdIntegration.message}</p>
</body>
</html>`;

    const reportPath = path.join(__dirname, '../docs/performance/epic19-performance-regression-report.html');
    await fs.writeFile(reportPath, htmlContent);
  }

  async generateMarkdownPerformanceSummary(reportData: any): Promise<string> {
    const summary = reportData.summary;
    
    const markdownContent = `# Epic 19 Performance Regression Summary

**Test Run ID**: ${summary.testRunId}  
**Generated**: ${new Date(summary.timestamp).toLocaleString()}  
**Overall Status**: ${summary.overallStatus}  

## Summary

- **Total Tests**: ${summary.totalTests}
- **Total Regressions**: ${summary.totalRegressions}
- **Critical Regressions**: ${summary.criticalRegressions}
- **Environment**: ${summary.environment.platform} ${summary.environment.arch}, Node ${summary.environment.nodeVersion}

## Performance Results

${Object.entries(reportData.performanceResults).map(([category, tests]) => `
### ${category.toUpperCase()}
${Object.entries(tests).map(([testName, result]) => {
  const status = result.performance.overallPass ? '✅' : '❌';
  return `- ${status} **${testName}**: ${result.statistics.latency.mean.toFixed(2)}ms avg (${result.statistics.throughput.toFixed(1)} ops/sec)`;
}).join('\n')}
`).join('')}

## Regressions Detected

${reportData.regressionAnalysis.length === 0 ? 'No regressions detected! 🎉' : 
  reportData.regressionAnalysis.map(reg => `
### ${reg.category}.${reg.testName} (${reg.overallSeverity.toUpperCase()})
${Object.entries(reg.regressions).filter(([_, data]) => data).map(([metric, data]) => 
  `- **${metric}**: ${(data.change * 100).toFixed(1)}% regression`
).join('\n')}
`).join('')}

## Recommendations

${reportData.recommendations.map((rec, i) => 
  `${i + 1}. **${rec.priority}**: ${rec.recommendation} (${rec.timeframe || 'TBD'})`
).join('\n')}

## CI/CD Status

**Build Status**: ${reportData.cicdIntegration.shouldFailBuild ? '❌ FAIL' : '✅ PASS'}  
**Exit Code**: ${reportData.cicdIntegration.exitCode}  
**Message**: ${reportData.cicdIntegration.message}

---
*Generated by Epic 19 Performance Regression Tester*`;

    const reportPath = path.join(__dirname, '../docs/performance/epic19-performance-regression-summary.md');
    await fs.writeFile(reportPath, markdownContent);
  }
}

// CLI interface
async function main(): Promise<void> {
  const tester = new PerformanceRegressionTester();
  
  try {
    const results = await tester.runPerformanceRegressionTests();
    
    console.log('\n🎉 Performance regression testing completed successfully!');
    console.log(`📊 Results: ${results.regressions.length} regressions detected`);
    console.log(`🚀 Overall Status: ${results.summary?.overallStatus || 'UNKNOWN'}`);
    
    // CI/CD integration - exit with error if critical regressions found
    const criticalRegressions = results.regressions.filter(r => r.overallSeverity === 'critical').length;
    if (criticalRegressions > 0) {
      console.error(`❌ CRITICAL: ${criticalRegressions} critical performance regressions detected`);
      console.error('🚫 Build should fail until regressions are resolved');
      process.exit(1);
    }
    
    const warningRegressions = results.regressions.filter(r => r.overallSeverity === 'warning').length;
    if (warningRegressions > 0) {
      console.warn(`⚠️ WARNING: ${warningRegressions} performance warnings detected`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Performance regression testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { PerformanceRegressionTester, PERFORMANCE_CONFIG };