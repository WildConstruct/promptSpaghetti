// Script to run E2E test suite from command line
// QA tool for Epic 2 integration validation

import { E2ETestSuite } from '../__tests__/e2e/E2ETestSuite';

async function runE2ETests() {
  console.log('🧪 Starting Epic 2 E2E Integration Tests...\n');

  const suite = new E2ETestSuite();

  try {
    const results = await suite.runFullIntegration();

    console.log('📊 E2E Test Results:');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ${results.failed > 0 ? '❌' : ''}`);
    console.log(`Duration: ${results.duration}ms`);
    console.log(
      `Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`
    );

    if (results.testResults.length > 0) {
      console.log('\n📋 Test Details:');
      results.testResults.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.name} (${test.duration}ms)`);
        if (test.errors && test.errors.length > 0) {
          test.errors.forEach(error => console.log(`   ⚠️ ${error}`));
        }
      });
    }

    if (results.performanceReport) {
      console.log('\n⚡ Performance Report:');
      console.log(JSON.stringify(results.performanceReport, null, 2));
    }

    if (results.costReport) {
      console.log('\n💰 Cost Report:');
      console.log(JSON.stringify(results.costReport, null, 2));
    }

    // Exit with appropriate code
    const exitCode = results.failed > 0 ? 1 : 0;
    console.log(`\n🏁 E2E Tests ${exitCode === 0 ? 'PASSED' : 'FAILED'}`);
    process.exit(exitCode);
  } catch (error) {
    console.error('💥 E2E Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runE2ETests().catch(console.error);
}

export { runE2ETests };
