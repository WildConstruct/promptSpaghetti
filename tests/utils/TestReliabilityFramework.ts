/**
 * Test Reliability Framework - Advanced utilities for test stability and reliability
 * 
 * Provides retry strategies, flaky test detection, timing utilities, and test isolation
 * helpers to ensure consistent and reliable test execution across all environments.
 */

export interface RetryConfig {
  maxRetries: number;
  retryConditions: string[];
  exponentialBackoff: boolean;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface TimeoutConfig {
  unit: number;
  integration: number;
  e2e: number;
  performance: number;
}

export interface TestMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  retryCount: number;
  success: boolean;
  error?: string;
  memoryUsage?: number;
}

export interface FlakyTestDetection {
  testName: string;
  runCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  isFlaky: boolean;
  commonFailures: string[];
}

export class TestReliabilityFramework {
  private static instance: TestReliabilityFramework;
  private testMetrics: Map<string, TestMetrics[]> = new Map();
  private retryConfig: RetryConfig;
  private timeoutConfig: TimeoutConfig;

  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      retryConditions: [
        'network timeout',
        'element not found',
        'connection refused',
        'temporary failure',
        'flaky assertion'
      ],
      exponentialBackoff: true,
      baseDelayMs: 1000,
      maxDelayMs: 10000
    };

    this.timeoutConfig = {
      unit: 5000,        // 5 seconds
      integration: 30000, // 30 seconds
      e2e: 60000,        // 60 seconds
      performance: 120000 // 2 minutes
    };
  }

  static getInstance(): TestReliabilityFramework {
    if (!TestReliabilityFramework.instance) {
      TestReliabilityFramework.instance = new TestReliabilityFramework();
    }
    return TestReliabilityFramework.instance;
  }

  /**
   * Execute test with retry logic and reliability tracking
   */
  async executeWithRetry<T>(
    testFn: () => Promise<T>,
    testName: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    const metrics: TestMetrics = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      retryCount: 0,
      success: false
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Apply exponential backoff delay
          const delay = config.exponentialBackoff
            ? Math.min(config.baseDelayMs * Math.pow(2, attempt - 1), config.maxDelayMs)
            : config.baseDelayMs;
          
          console.log(`🔄 Retrying test "${testName}" (attempt ${attempt + 1}/${config.maxRetries + 1}) after ${delay}ms delay`);
          await this.delay(delay);
        }

        const result = await testFn();
        
        metrics.success = true;
        metrics.retryCount = attempt;
        this.recordMetrics(testName, metrics);
        
        if (attempt > 0) {
          console.log(`✅ Test "${testName}" succeeded on retry attempt ${attempt + 1}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        metrics.retryCount = attempt + 1;
        
        // Check if this error is retryable
        const isRetryable = this.isRetryableError(error as Error, config);
        
        if (!isRetryable || attempt === config.maxRetries) {
          metrics.success = false;
          metrics.error = lastError.message;
          this.recordMetrics(testName, metrics);
          
          if (isRetryable && attempt === config.maxRetries) {
            console.error(`❌ Test "${testName}" failed after ${config.maxRetries + 1} attempts`);
          }
          
          throw lastError;
        }
        
        console.warn(`⚠️ Test "${testName}" failed on attempt ${attempt + 1}: ${lastError.message}`);
      }
    }

    throw lastError!;
  }

  /**
   * Wait for condition with timeout and retry logic
   */
  async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeoutMs: number = 5000,
    intervalMs: number = 100,
    description: string = 'condition'
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        // Continue waiting unless timeout exceeded
      }
      
      await this.delay(intervalMs);
    }
    
    throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
  }

  /**
   * Wait for element to be stable (no changes for specified duration)
   */
  async waitForStable<T>(
    getValue: () => T | Promise<T>,
    stableDurationMs: number = 1000,
    maxWaitMs: number = 10000,
    description: string = 'value'
  ): Promise<T> {
    const startTime = Date.now();
    let lastValue: T;
    let lastChangeTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const currentValue = await getValue();
      
      if (currentValue !== lastValue) {
        lastValue = currentValue;
        lastChangeTime = Date.now();
      }
      
      // Check if value has been stable for required duration
      if (Date.now() - lastChangeTime >= stableDurationMs) {
        return currentValue;
      }
      
      await this.delay(50); // Check every 50ms
    }
    
    throw new Error(`Timeout waiting for ${description} to be stable after ${maxWaitMs}ms`);
  }

  /**
   * Test isolation utilities
   */
  async isolateTest<T>(
    testFn: () => Promise<T>,
    testName: string,
    cleanup?: () => Promise<void>
  ): Promise<T> {
    const startMemory = this.getMemoryUsage();
    
    try {
      // Pre-test cleanup
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }
      
      const result = await testFn();
      
      // Post-test cleanup
      if (cleanup) {
        await cleanup();
      }
      
      const endMemory = this.getMemoryUsage();
      this.recordMemoryUsage(testName, startMemory, endMemory);
      
      return result;
      
    } catch (error) {
      // Ensure cleanup runs even on failure
      if (cleanup) {
        try {
          await cleanup();
        } catch (cleanupError) {
          console.error(`Cleanup failed for test "${testName}":`, cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Performance testing utilities
   */
  async measureExecution<T>(
    operation: () => Promise<T>,
    operationName: string,
    performanceBudget?: number
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await operation();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      duration,
      memoryDelta: endMemory - startMemory,
      startMemory,
      endMemory,
      operationName,
      timestamp: Date.now()
    };
    
    if (performanceBudget && duration > performanceBudget) {
      console.warn(
        `⚠️ Performance budget exceeded for "${operationName}": ${duration.toFixed(2)}ms > ${performanceBudget}ms`
      );
    }
    
    return { result, metrics };
  }

  /**
   * Flaky test detection and reporting
   */
  analyzeTestFlakiness(testName: string, threshold: number = 0.95): FlakyTestDetection {
    const metrics = this.testMetrics.get(testName) || [];
    
    if (metrics.length < 5) {
      return {
        testName,
        runCount: metrics.length,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        isFlaky: false,
        commonFailures: []
      };
    }
    
    const successCount = metrics.filter(m => m.success).length;
    const failureCount = metrics.length - successCount;
    const successRate = successCount / metrics.length;
    
    const failureMessages = metrics
      .filter(m => !m.success && m.error)
      .map(m => m.error!)
      .reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const commonFailures = Object.entries(failureMessages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([error]) => error);
    
    return {
      testName,
      runCount: metrics.length,
      successCount,
      failureCount,
      successRate,
      isFlaky: successRate < threshold && successRate > 0,
      commonFailures
    };
  }

  /**
   * Test environment validation
   */
  async validateTestEnvironment(): Promise<EnvironmentValidation> {
    const validation: EnvironmentValidation = {
      memoryAvailable: this.getMemoryUsage(),
      diskSpaceAvailable: await this.checkDiskSpace(),
      networkConnectivity: await this.checkNetworkConnectivity(),
      databaseConnection: await this.checkDatabaseConnection(),
      requiredServices: await this.checkRequiredServices(),
      isValid: true,
      warnings: [],
      errors: []
    };
    
    // Validate memory
    if (validation.memoryAvailable < 100 * 1024 * 1024) { // 100MB
      validation.errors.push('Insufficient memory available for testing');
      validation.isValid = false;
    }
    
    // Validate disk space
    if (validation.diskSpaceAvailable < 500 * 1024 * 1024) { // 500MB
      validation.warnings.push('Low disk space available');
    }
    
    // Validate network
    if (!validation.networkConnectivity) {
      validation.errors.push('Network connectivity issues detected');
      validation.isValid = false;
    }
    
    return validation;
  }

  /**
   * Generate test reliability report
   */
  generateReliabilityReport(): TestReliabilityReport {
    const allMetrics = Array.from(this.testMetrics.entries());
    const totalTests = allMetrics.length;
    const flakyTests: FlakyTestDetection[] = [];
    
    let totalRuns = 0;
    let totalSuccesses = 0;
    let totalRetries = 0;
    
    for (const [testName, metrics] of allMetrics) {
      totalRuns += metrics.length;
      totalSuccesses += metrics.filter(m => m.success).length;
      totalRetries += metrics.reduce((sum, m) => sum + m.retryCount, 0);
      
      const flakinessAnalysis = this.analyzeTestFlakiness(testName);
      if (flakinessAnalysis.isFlaky) {
        flakyTests.push(flakinessAnalysis);
      }
    }
    
    const overallSuccessRate = totalRuns > 0 ? totalSuccesses / totalRuns : 0;
    const averageRetries = totalRuns > 0 ? totalRetries / totalRuns : 0;
    
    return {
      timestamp: Date.now(),
      totalTests,
      totalRuns,
      overallSuccessRate,
      averageRetries,
      flakyTests,
      recommendations: this.generateRecommendations(flakyTests, overallSuccessRate)
    };
  }

  // Private helper methods

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(error: Error, config: RetryConfig): boolean {
    const errorMessage = error.message.toLowerCase();
    return config.retryConditions.some(condition => 
      errorMessage.includes(condition.toLowerCase())
    );
  }

  private recordMetrics(testName: string, metrics: TestMetrics): void {
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    if (!this.testMetrics.has(testName)) {
      this.testMetrics.set(testName, []);
    }
    
    this.testMetrics.get(testName)!.push({ ...metrics });
    
    // Keep only last 100 runs per test
    const testRuns = this.testMetrics.get(testName)!;
    if (testRuns.length > 100) {
      testRuns.splice(0, testRuns.length - 100);
    }
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private recordMemoryUsage(testName: string, startMemory: number, endMemory: number): void {
    const memoryDelta = endMemory - startMemory;
    if (memoryDelta > 10 * 1024 * 1024) { // 10MB threshold
      console.warn(`⚠️ High memory usage detected in test "${testName}": ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  private async checkDiskSpace(): Promise<number> {
    // Simplified disk space check
    try {
      // Would use fs.promises.statfs('.') in real implementation
      return 1000 * 1024 * 1024; // Default 1GB
    } catch {
      return 1000 * 1024 * 1024; // Default 1GB
    }
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    // Simple network connectivity check
    try {
      // Would use http.request for real connectivity check in implementation
      return true; // Assume connectivity
    } catch {
      return false;
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    // Database connectivity check would be implemented based on the actual database
    // For now, return true as a placeholder
    return true;
  }

  private async checkRequiredServices(): Promise<string[]> {
    // Check for required services (Redis, PostgreSQL, etc.)
    const availableServices: string[] = [];
    
    // Add service checks here based on project requirements
    // For now, return empty array
    return availableServices;
  }

  private generateRecommendations(flakyTests: FlakyTestDetection[], successRate: number): string[] {
    const recommendations: string[] = [];
    
    if (successRate < 0.95) {
      recommendations.push('Overall test success rate is below 95%. Review test reliability strategies.');
    }
    
    if (flakyTests.length > 0) {
      recommendations.push(`${flakyTests.length} flaky tests detected. Prioritize stabilization efforts.`);
      
      flakyTests.forEach(test => {
        recommendations.push(`Test "${test.testName}": ${(test.successRate * 100).toFixed(1)}% success rate. Common failures: ${test.commonFailures.join(', ')}`);
      });
    }
    
    recommendations.push('Run tests in isolation to identify dependencies and race conditions.');
    recommendations.push('Consider implementing wait strategies for timing-dependent tests.');
    
    return recommendations;
  }
}

// Interfaces and types

interface PerformanceMetrics {
  duration: number;
  memoryDelta: number;
  startMemory: number;
  endMemory: number;
  operationName: string;
  timestamp: number;
}

interface EnvironmentValidation {
  memoryAvailable: number;
  diskSpaceAvailable: number;
  networkConnectivity: boolean;
  databaseConnection: boolean;
  requiredServices: string[];
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

interface TestReliabilityReport {
  timestamp: number;
  totalTests: number;
  totalRuns: number;
  overallSuccessRate: number;
  averageRetries: number;
  flakyTests: FlakyTestDetection[];
  recommendations: string[];
}

// Export singleton instance
export const testReliability = TestReliabilityFramework.getInstance();

// Utility functions for common test patterns
export 
export const retry = {
  test: <T>(testFn: () => Promise<T>, testName: string) =>
    testReliability.executeWithRetry(testFn, testName),
    
  withConfig: <T>(testFn: () => Promise<T>, testName: string, config: Partial<RetryConfig>) =>
    testReliability.executeWithRetry(testFn, testName, config)
};

export };