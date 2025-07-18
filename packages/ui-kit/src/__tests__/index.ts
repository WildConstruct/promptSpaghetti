/**
 * Test suite exports for UI Kit
 */

// Test framework and utilities
export * from './setup/test-framework';

// Import all test suites to ensure they run
import './responsive/responsive-components.test';
import './touch/touch-interactions.test';
import './platform/platform-adaptations.test';
import './visual/visual-regression.test';
import './performance/performance-benchmarks.test';

/**
 * Test suite configuration
 */
export const testConfig = {
  // Visual regression service configuration
  visualRegression: {
    service: process.env.VISUAL_REGRESSION_SERVICE || 'percy',
    projectId: process.env.VISUAL_REGRESSION_PROJECT_ID,
    token: process.env.VISUAL_REGRESSION_TOKEN,
    branch: process.env.CI_BRANCH || 'main'
  },
  
  // Performance thresholds
  performance: {
    renderBudget: 16, // ms for 60fps
    interactionBudget: 100, // ms for touch response
    bundleSizeBudget: 100, // KB for UI kit
    memorySizeBudget: 10 // MB for runtime memory
  },
  
  // Coverage requirements
  coverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  },
  
  // Platform test matrix
  platforms: [
    { name: 'iOS Safari', os: 'iOS', browser: 'Safari' },
    { name: 'Android Chrome', os: 'Android', browser: 'Chrome' },
    { name: 'Desktop Chrome', os: 'Windows', browser: 'Chrome' },
    { name: 'Desktop Safari', os: 'macOS', browser: 'Safari' },
    { name: 'Desktop Firefox', os: 'Windows', browser: 'Firefox' }
  ],
  
  // Viewport test matrix
  viewports: [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'Desktop 4K', width: 3840, height: 2160 }
  ]
};

/**
 * Run all test suites
 */
export async function runAllTests() {
  console.log('Running UI Kit test suite...');
  console.log(`- Responsive Components: ${testConfig.viewports.length} viewports`);
  console.log(`- Touch Interactions: ${testConfig.platforms.filter(p => p.os !== 'Windows').length} touch platforms`);
  console.log(`- Platform Adaptations: ${testConfig.platforms.length} platforms`);
  console.log('- Visual Regression: Enabled');
  console.log('- Performance Benchmarks: Enabled');
}

/**
 * Generate test report
 */
export function generateTestReport(results: any) {
  return {
    summary: {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      pending: results.numPendingTests,
      duration: results.testResults.reduce((sum: number, r: any) => sum + r.perfStats.runtime, 0)
    },
    coverage: {
      statements: results.coverageMap?.getCoverageSummary().statements.pct || 0,
      branches: results.coverageMap?.getCoverageSummary().branches.pct || 0,
      functions: results.coverageMap?.getCoverageSummary().functions.pct || 0,
      lines: results.coverageMap?.getCoverageSummary().lines.pct || 0
    },
    performance: {
      slowestTests: results.testResults
        .flatMap((r: any) => r.testResults)
        .sort((a: any, b: any) => b.duration - a.duration)
        .slice(0, 10)
        .map((t: any) => ({ title: t.title, duration: t.duration }))
    }
  };
}