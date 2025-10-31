import { performanceMonitor } from '../performanceMonitor';
import {
  validateUrl,
  validateInput,
  generateCSRFToken,
  ClientRateLimiter
} from '../securityUtils';
import { memoryUtils } from '../memoryOptimization';

export interface TestResult {
  name: string;
  category: 'security' | 'performance' | 'memory';
  passed: boolean;
  duration: number;
  error?: string;
}

export interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  results: TestResult[];
}

type TestDefinition = {
  name: string;
  category: TestResult['category'];
  handler: () => boolean | Promise<boolean>;
};

class QualityTestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestSuiteResult> {
    this.results = [];
    const tests: TestDefinition[] = [
      {
        name: 'Security: validateUrl rejects javascript scheme',
        category: 'security',
        handler: () => validateUrl('javascript:alert(1)') === null
      },
      {
        name: 'Security: validates safe input',
        category: 'security',
        handler: () => validateInput('safe-value').isValid
      },
      {
        name: 'Security: rate limiter allows only limited calls',
        category: 'security',
        handler: () => {
          const limiter = new ClientRateLimiter(1, 1000);
          return limiter.canMakeRequest('user') && !limiter.canMakeRequest('user');
        }
      },
      {
        name: 'Performance: monitor can record metric',
        category: 'performance',
        handler: () => {
          performanceMonitor.measureExecution('sample', () => 42);
          return performanceMonitor.getMetrics().length > 0;
        }
      },
      {
        name: 'Memory: utils format bytes',
        category: 'memory',
        handler: () => memoryUtils.formatBytes(1024).includes('KB')
      },
      {
        name: 'Security: CSRF token round trip',
        category: 'security',
        handler: () => {
          const token = generateCSRFToken();
          return token.length === 64;
        }
      }
    ];

    // Run sequentially to keep implementation simple
    for (const test of tests) {
      await this.runTest(test);
    }

    return this.generateReport();
  }

  private async runTest(test: TestDefinition): Promise<void> {
    const start = performance.now?.() ?? Date.now();
    try {
      const passed = await test.handler();
      const duration = (performance.now?.() ?? Date.now()) - start;
      this.results.push({
        name: test.name,
        category: test.category,
        passed,
        duration
      });
    } catch (error) {
      const duration = (performance.now?.() ?? Date.now()) - start;
      this.results.push({
        name: test.name,
        category: test.category,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private generateReport(): TestSuiteResult {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);

    return {
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      results: [...this.results]
    };
  }
}

export const qualityTestRunner = new QualityTestRunner();

export async function runQualityTests(): Promise<TestSuiteResult> {
  return qualityTestRunner.runAllTests();
}

export async function runTestsWithExitCode(): Promise<void> {
  const report = await runQualityTests();
  if (report.failedTests > 0) {
    console.error(`Quality checks failed (${report.failedTests} tests)`);
    process.exit(1);
  } else {
    console.log(`Quality checks passed (${report.totalTests} tests)`);
  }
}

export function checkPerformanceBaseline(report: TestSuiteResult): boolean {
  return report.failedTests === 0 && report.totalDuration < 1500;
}

