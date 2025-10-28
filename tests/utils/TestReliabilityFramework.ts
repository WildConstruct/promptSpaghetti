/**
 * Test Reliability Framework - utilities for improving test stability.
 *
 * Provides retry helpers, timing utilities, flaky test detection, and
 * environment validation that we can lean on across suites.
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

const DEFAULT_RETRY_CONFIG: RetryConfig = {
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

const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  unit: 5000,
  integration: 30000,
  e2e: 60000,
  performance: 120000
};

const now = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
};

export class TestReliabilityFramework {
  private static instance: TestReliabilityFramework | null = null;

  private readonly testMetrics: Map<string, TestMetrics[]> = new Map();
  private readonly retryConfig: RetryConfig;
  private readonly timeoutConfig: TimeoutConfig;

  private constructor(
    retryConfig: Partial<RetryConfig> = {},
    timeoutConfig: Partial<TimeoutConfig> = {}
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.timeoutConfig = { ...DEFAULT_TIMEOUT_CONFIG, ...timeoutConfig };
  }

  static getInstance(): TestReliabilityFramework {
    if (!TestReliabilityFramework.instance) {
      TestReliabilityFramework.instance = new TestReliabilityFramework();
    }

    return TestReliabilityFramework.instance;
  }

  async executeWithRetry<T>(
    testFn: () => Promise<T>,
    testName: string,
    customConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config: RetryConfig = { ...this.retryConfig, ...customConfig };
    const metrics: TestMetrics = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      retryCount: 0,
      success: false,
      memoryUsage: undefined
    };

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
      try {
        if (attempt > 0) {
          metrics.retryCount = attempt;
          const delayMs = config.exponentialBackoff
            ? Math.min(config.baseDelayMs * Math.pow(2, attempt - 1), config.maxDelayMs)
            : config.baseDelayMs;
          await this.delay(delayMs);
        }

        const result = await testFn();
        metrics.success = true;
        this.recordMetrics(testName, metrics);
        return result;
      } catch (error) {
        lastError = error as Error;
        const isRetryable = this.isRetryableError(lastError, config);

        if (!isRetryable || attempt === config.maxRetries) {
          metrics.success = false;
          metrics.error = lastError.message;
          this.recordMetrics(testName, metrics);
          throw lastError;
        }
      }
    }

    throw lastError ?? new Error(`Test "${testName}" failed without throwing an error instance.`);
  }

  async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeoutMs = this.timeoutConfig.unit,
    intervalMs = 100
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch {
        // Continue polling until timeout.
      }

      await this.delay(intervalMs);
    }

    throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
  }

  async waitForStable<T>(
    getValue: () => T | Promise<T>,
    stableDurationMs = 1000,
    maxWaitMs = 10000
  ): Promise<T> {
    const start = Date.now();
    let lastValue: T | undefined;
    let lastChange = Date.now();

    while (Date.now() - start < maxWaitMs) {
      const currentValue = await getValue();
      if (lastValue !== currentValue) {
        lastValue = currentValue;
        lastChange = Date.now();
      }

      if (Date.now() - lastChange >= stableDurationMs) {
        return currentValue;
      }

      await this.delay(50);
    }

    throw new Error(`Timeout waiting for value to stabilize after ${maxWaitMs}ms`);
  }

  async isolateTest<T>(
    testFn: () => Promise<T>,
    testName: string,
    cleanup?: () => Promise<void>
  ): Promise<T> {
    const startMemory = this.getMemoryUsage();

    try {
      const globalRef = globalThis as typeof globalThis & { gc?: () => void };
      if (typeof globalRef.gc === 'function') {
        globalRef.gc();
      }

      const result = await testFn();

      if (cleanup) {
        await cleanup();
      }

      const endMemory = this.getMemoryUsage();
      this.recordMemoryUsage(testName, startMemory, endMemory);
      return result;
    } catch (error) {
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

  async measureExecution<T>(
    operation: () => Promise<T>,
    operationName: string,
    performanceBudget?: number
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = now();
    const startMemory = this.getMemoryUsage();

    const result = await operation();

    const endTime = now();
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
        `Performance budget exceeded for "${operationName}": ${duration.toFixed(2)}ms > ${performanceBudget}ms`
      );
    }

    return { result, metrics };
  }

  analyzeTestFlakiness(testName: string, threshold = 0.95): FlakyTestDetection {
    const metrics = this.testMetrics.get(testName) ?? [];

    if (metrics.length < 5) {
      return {
        testName,
        runCount: metrics.length,
        successCount: metrics.filter((entry) => entry.success).length,
        failureCount: metrics.filter((entry) => !entry.success).length,
        successRate: metrics.length === 0 ? 0 : metrics.filter((entry) => entry.success).length / metrics.length,
        isFlaky: false,
        commonFailures: []
      };
    }

    const successCount = metrics.filter((entry) => entry.success).length;
    const failureCount = metrics.length - successCount;
    const successRate = metrics.length > 0 ? successCount / metrics.length : 0;

    const failureMessages = metrics
      .filter((entry) => !entry.success && entry.error)
      .map((entry) => entry.error as string)
      .reduce<Record<string, number>>((accumulator, message) => {
        accumulator[message] = (accumulator[message] ?? 0) + 1;
        return accumulator;
      }, {});

    const commonFailures = Object.entries(failureMessages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([message]) => message);

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

    if (validation.memoryAvailable < 100 * 1024 * 1024) {
      validation.errors.push('Insufficient memory available for testing');
      validation.isValid = false;
    }

    if (validation.diskSpaceAvailable < 500 * 1024 * 1024) {
      validation.warnings.push('Low disk space available for tests');
    }

    if (!validation.networkConnectivity) {
      validation.errors.push('Network connectivity issues detected');
      validation.isValid = false;
    }

    return validation;
  }

  generateReliabilityReport(): TestReliabilityReport {
    const allMetrics = Array.from(this.testMetrics.entries());
    const totalTests = allMetrics.length;

    let totalRuns = 0;
    let totalSuccesses = 0;
    let totalRetries = 0;
    const flakyTests: FlakyTestDetection[] = [];

    for (const [testName, metrics] of allMetrics) {
      totalRuns += metrics.length;
      totalSuccesses += metrics.filter((entry) => entry.success).length;
      totalRetries += metrics.reduce((sum, entry) => sum + entry.retryCount, 0);

      const flakiness = this.analyzeTestFlakiness(testName);
      if (flakiness.isFlaky) {
        flakyTests.push(flakiness);
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

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private isRetryableError(error: Error, config: RetryConfig): boolean {
    const lowerMessage = error.message.toLowerCase();
    return config.retryConditions.some((condition) => lowerMessage.includes(condition.toLowerCase()));
  }

  private recordMetrics(testName: string, metrics: TestMetrics): void {
    const endTime = Date.now();
    const updatedMetrics: TestMetrics = {
      ...metrics,
      endTime,
      duration: endTime - metrics.startTime
    };

    const existing = this.testMetrics.get(testName) ?? [];
    existing.push(updatedMetrics);

    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }

    this.testMetrics.set(testName, existing);
  }

  private getMemoryUsage(): number {
    const processReference = globalThis.process as
      | { memoryUsage?: () => { heapUsed: number } }
      | undefined;

    if (processReference?.memoryUsage) {
      try {
        return processReference.memoryUsage().heapUsed;
      } catch {
        return 0;
      }
    }

    return 0;
  }

  private recordMemoryUsage(testName: string, startMemory: number, endMemory: number): void {
    const memoryDelta = endMemory - startMemory;
    if (memoryDelta > 10 * 1024 * 1024) {
      console.warn(
        `High memory usage detected in test "${testName}": ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  private async checkDiskSpace(): Promise<number> {
    // The real implementation would inspect the filesystem. We return a safe
    // default that callers can still validate against.
    return 1_000 * 1024 * 1024;
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    // In CI we do not perform outbound requests; assume connectivity is fine.
    return true;
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    // Placeholder until we have a real health-check hook.
    return true;
  }

  private async checkRequiredServices(): Promise<string[]> {
    // Extend when new required services are introduced.
    return [];
  }

  private generateRecommendations(flakyTests: FlakyTestDetection[], successRate: number): string[] {
    const recommendations: string[] = [];

    if (successRate < 0.95) {
      recommendations.push('Overall test success rate is below 95%. Review reliability strategies.');
    }

    if (flakyTests.length > 0) {
      recommendations.push(`${flakyTests.length} flaky tests detected. Prioritise their stabilisation.`);
      flakyTests.forEach((test) => {
        recommendations.push(
          `Test "${test.testName}": ${(test.successRate * 100).toFixed(
            1
          )}% success rate. Failures: ${test.commonFailures.join(', ')}`
        );
      });
    }

    if (recommendations.length === 0) {
      recommendations.push('Test suites look healthy. Keep monitoring reliability metrics.');
    }

    return recommendations;
  }
}

export const testReliability = TestReliabilityFramework.getInstance();

export const retry = {
  test: <T>(testFn: () => Promise<T>, testName: string) =>
    testReliability.executeWithRetry(testFn, testName),
  withConfig: <T>(testFn: () => Promise<T>, testName: string, config: Partial<RetryConfig>) =>
    testReliability.executeWithRetry(testFn, testName, config)
};
