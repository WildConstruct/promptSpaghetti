/**
 * Comprehensive Test Runner for Quality Improvements
 * 
 * Orchestrates all quality improvement tests and provides detailed reporting
 */
import { performanceMonitor } from '../performanceMonitor';
import { validateUrl, validateInput, generateCSRFToken, ClientRateLimiter } from '../securityUtils';
import { memoryUtils, WeakCache } from '../memoryOptimization';
}
interface TestResult {
  name: string;,
  category: 'security' | 'performance' | 'memory' | 'integration';
  passed: boolean;,
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}
interface TestSuiteResult {
  totalTests: number;,
  passedTests: number;
  failedTests: number;,
  totalDuration: number;
}
  categories: Record<string, { passed: number; failed: number; duration: number }>;
  results: TestResult;
  coverage?: {
  security: number;,
  performance: number;
  memory: number;,
  integration: number;
};
class QualityTestRunner {
  private results: TestResult = [];
  /**
  * Run all quality improvement tests
  */
  async runAllTests(): Promise<TestSuiteResult> {,
  console.log('🧪 Starting comprehensive quality improvement tests...');
  this.results = [];
  // Run test categories in parallel for efficiency
  const testPromises = [;
  this.runSecurityTests(),
  this.runPerformanceTests(),
  this.runMemoryTests(),
  this.runIntegrationTests()
  ];
  await Promise.all(testPromises);
  return this.generateReport();
  /**
  * Security utilities tests
  */
  private async runSecurityTests(): Promise<void> {,
  const tests = [;
  {
  name: 'URL Validation - Safe URLs',
  test: () => {,
  const safeUrls = [;
  '/dashboard',
  'https://example.com/api',
  '/api/users?id=123'
  ];
  return safeUrls.every(url => validateUrl(url) !== null);
}
      {
  name: 'URL Validation - Dangerous URLs',
  test: () => {,
  const dangerousUrls = [;
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)'];
  return dangerousUrls.every(url => validateUrl(url) === null);
}
      {
  name: 'Input Validation - XSS Prevention',
  test: () => {,
  const maliciousInputs = [;
  '<script>alert(1)</script>',
  'javascript:alert(1)',
  'onload=alert(1)',
  'eval(maliciousCode)'
  ];
  return maliciousInputs.every(input => {)
  const result = validateInput(input);
  return !result.isValid && result.errors.some(e => e.includes('dangerous'));
});
  }
      {
  name: 'CSRF Token Generation',
  test: () => {,
  const token1 = generateCSRFToken();
  const token2 = generateCSRFToken();
  return token1.length === 64 &&
  token2.length === 64 &&
  token1 !== token2 &&
  /^[a-f0-9]+$/.test(token1);
}
      {
        name: 'Rate Limiting Functionality',
        test: () => {,
          const limiter = new ClientRateLimiter(3, 1000);
          // Should allow 3 requests
          for (let i = 0; i < 3; i++) {
            if (!limiter.canMakeRequest('test-user')) return false;
          // 4th request should be blocked
          return !limiter.canMakeRequest('test-user');
    ];
    for (const { name, test } of tests) {
  await this.runTest(name, 'security', test);
  /**
  * Performance monitoring tests
  */
  private async runPerformanceTests(): Promise<void> {,
  const tests = [;
  {
  name: 'Performance Measurement',
  test: () => {,
  let executed = false;
  const result = performanceMonitor.measureExecution(;);
  'test-function',
  () => {
  executed = true;
  return 'success';
  );
  return executed && result === 'success';
}
      {
  name: 'Async Performance Measurement',
  test: async () => {,
  let executed = false;
  const result = await performanceMonitor.measureExecution(;);
  'test-async-function',
  async () => {
  executed = true;
  await new Promise(resolve => setTimeout(resolve, 10));
  return 'async-success';
  );
  return executed && result === 'async-success';
}
      {
        name: 'API Call Tracking',
        test: async () => {,
          const mockApiCall = () => Promise.resolve({ data: 'test' });
          const result = await performanceMonitor.trackApiCall(;);
            '/api/test',
            'GET',
            mockApiCall
          );
          return result.data === 'test';
  }
      {
  name: 'Performance Statistics',
  test: () => {,
  // Add some test metrics
  performanceMonitor.addMetric({)
  name: 'test-metric',
  duration: 100,
  type: 'custom',
});
          const stats = performanceMonitor.getStats();
          return stats.total > 0 && 
                 typeof stats.averages === 'object' &&
                 Array.isArray(stats.slowest);
    ];
    for (const { name, test } of tests) {
      await this.runTest(name, 'performance', test);
  /**
   * Memory optimization tests
   */
  private async runMemoryTests(): Promise<void> {

    const tests = [;
      {
        name: 'WeakCache Functionality',
        test: () => {,
          const cache = new WeakCache<object, string>();
          const key = { id: 'test' };
          cache.set(key, 'test-value');
          return cache.get(key) === 'test-value' &&
                 cache.has(key) === true;
  }
      {
        name: 'Deep Equality Check',
        test: () => {,
          const obj1 = { a: 1, b: { c: 2 } };
          const obj2 = { a: 1, b: { c: 2 } };
          const obj3 = { a: 1, b: { c: 3 } };
          return memoryUtils.deepEqual(obj1, obj2) &&
                 !memoryUtils.deepEqual(obj1, obj3);
  }
      {
        name: 'Shallow Equality Check',
        test: () => {,
          const obj1 = { a: 1, b: 2 };
          const obj2 = { a: 1, b: 2 };
          const obj3 = { a: 1, b: 3 };
          return memoryUtils.shallowEqual(obj1, obj2) &&
                 !memoryUtils.shallowEqual(obj1, obj3);
  }
      {
        name: 'Stable Reference Creation',
        test: () => {,
          const cache = new WeakCache<object, object>();
          const obj1 = { a: 1, b: 2 };
          const obj2 = { a: 1, b: 2 };
          const ref1 = memoryUtils.createStableRef(obj1, cache);
          const ref2 = memoryUtils.createStableRef(obj2, cache);
          return ref1 === obj1 && ref2 === ref1; // Should return cached reference
    ];
    for (const { name, test } of tests) {
      await this.runTest(name, 'memory', test);
  /**
   * Integration tests
   */
  private async runIntegrationTests(): Promise<void> {

    const tests = [;
      {
        name: 'Security + Performance Integration',
        test: () => {,
          // Test that security validation doesn't impact performance significantly
          const startTime = performance.now();
          for (let i = 0; i < 100; i++) {
            validateInput(`test-input-${i}`);}
            validateUrl(`/test-url-${i}`);}
          const duration = performance.now() - startTime;
          return duration < 100; // Should complete in under 100ms
  }
      {
        name: 'Memory + Performance Integration',
        test: () => {,
          const cache = new WeakCache<object, object>();
          // Create many objects and cache them
          const objects = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
          const startTime = performance.now();
          objects.forEach(obj => {)
  memoryUtils.createStableRef(obj, cache);
          });
          const duration = performance.now() - startTime;
          return duration < 50; // Should be fast due to caching
  }
      {
  name: 'Cross-Utility Error Handling',
  test: () => {,
  // Test that utilities handle edge cases gracefully
  try {
  validateInput(null as any);
  validateUrl(undefined as any);
  memoryUtils.deepEqual(null, undefined);
  return true;
} catch (error) {
            return false; // Should not throw
  }
      {
        name: 'Resource Cleanup Integration',
        test: () => {,
          // Test that all utilities properly clean up resources
          const limiter = new ClientRateLimiter(10, 1000);
          limiter.reset(); // Should not throw
          performanceMonitor.flush(); // Should not throw
          return true;
    ];
    for (const { name, test } of tests) {
      await this.runTest(name, 'integration', test);
  /**
   * Run individual test with error handling and timing
   */
  private async runTest()
    name: string, 
    category: TestResult['category'], 
    testFn: () => boolean | Promise<boolean>): Promise<void> {,
    const startTime = performance.now();
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      this.results.push({)
  name,
        category,
        passed: result,
        duration,
        details: { executionTime: duration }
      });
      console.log(`${result ? '✅' : '❌'} ${name} (${duration.toFixed(2)}ms)`);}
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({)
  name,
        category,
        passed: false,
        duration,
        error: errorMessage,
        details: { executionTime: duration, errorType: typeof error }
      });
      console.log(`❌ ${name} - Error: ${errorMessage} (${duration.toFixed(2)}ms)`);}
  /**
   * Generate comprehensive test report
   */
  private generateReport(): TestSuiteResult {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    // Calculate category statistics
    const categories: Record<string, { passed: number; failed: number; duration: number }> = {};
    this.results.forEach(result => {)
  if (!categories[result.category]) {
        categories[result.category] = { passed: 0, failed: 0, duration: 0 };
      if (result.passed) {
        categories[result.category].passed++;
      } else {
        categories[result.category].failed++;
      categories[result.category].duration += result.duration;
    });
    // Calculate coverage percentages
    const coverage = {
  security: this.calculateCoverage('security'),
  performance: this.calculateCoverage('performance'),
  memory: this.calculateCoverage('memory'),
  integration: this.calculateCoverage('integration'),
};
    const report: TestSuiteResult = {
  totalTests,
  passedTests,
  failedTests,
  totalDuration,
  categories,
  results: this.results,
  coverage
};
    this.printReport(report);
    return report;
  /**
   * Calculate test coverage for a category
   */
  private calculateCoverage(category: string): number {
    const categoryTests = this.results.filter(r => r.category === category);
    if (categoryTests.length === 0) return 0;
    const passed = categoryTests.filter(r => r.passed).length;
    return Math.round((passed / categoryTests.length) * 100);
  /**
   * Print formatted test report
   */
  private printReport(report: TestSuiteResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 QUALITY IMPROVEMENT TEST REPORT');
    console.log('='.repeat(60));
    console.log(`\n📊 Overall Results:`);
    console.log(`   Total Tests: ${report.totalTests}`);}
    console.log(`   Passed: ${report.passedTests} (${Math.round((report.passedTests / report.totalTests) * 100)}%)`);}
    console.log(`   Failed: ${report.failedTests}`);}
    console.log(`   Duration: ${report.totalDuration.toFixed(2)}ms`);}
    console.log(`\n📈 Coverage by Category:`);
    Object.entries(report.coverage!).forEach(([category, percentage]) => {
      const emoji = percentage >= 90 ? '🟢' : percentage >= 75 ? '🟡' : '🔴';
      console.log(`   ${emoji} ${category.padEnd(12)}: ${percentage}%`);}
    });
    console.log(`\n🏷️ Category Breakdown:`);
    Object.entries(report.categories).forEach(([category, stats]) => {
      const successRate = Math.round((stats.passed / (stats.passed + stats.failed)) * 100);
      console.log(`   ${category.padEnd(12)}: ${stats.passed}/${stats.passed + stats.failed} (${successRate}%) - ${stats.duration.toFixed(2)}ms`);}
    });
    if (report.failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      report.results
        .filter(r => !r.passed)
        .forEach(result => {)
  console.log(`   - ${result.name}: ${result.error || 'Test assertion failed'}`);}
        });
    console.log('\n' + '='.repeat(60));
    // Performance recommendations
    if (report.totalDuration > 1000) {
      console.log('⚠️  Performance Warning: Tests took longer than 1 second');
    if (report.coverage!.security < 90) {
      console.log('🔒 Security: Consider adding more security tests');
    if (report.coverage!.performance < 90) {
      console.log('⚡ Performance: Consider adding more performance tests');

// Export singleton instance
export const qualityTestRunner = new QualityTestRunner();

// Export for use in CI/CD
export async function runQualityTests(): Promise<TestSuiteResult> {

  return qualityTestRunner.runAllTests();

// CLI-friendly test runner
export async function runTestsWithExitCode(): Promise<void> {

  const report = await runQualityTests();
  if (report.failedTests > 0) {
    console.error(`\n❌ ${report.failedTests} tests failed`);}
    process.exit(1);
  } else {
    console.log(`\n✅ All ${report.totalTests} tests passed!`);}
    process.exit(0);

// Performance baseline for CI
export function checkPerformanceBaseline(report: TestSuiteResult): boolean {
  const maxAllowedDuration = 2000; // 2 seconds;
  const minCoverage = 85; // 85%;
  const avgCoverage = Object.values(report.coverage!).reduce((sum, val) => sum + val, 0) / Object.keys(report.coverage!).length;
  return report.totalDuration <= maxAllowedDuration && 
         avgCoverage >= minCoverage &&
         report.failedTests === 0;