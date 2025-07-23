#!/usr/bin/env node

/**
 * Integrated Performance Test Runner
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562342-A89910 - Add performance testing
 *
 * Orchestrates comprehensive performance testing using the integrated framework
 * 
 * Usage:
 *   node scripts/run-performance-tests-integrated.js
 *   node scripts/run-performance-tests-integrated.js --quick
 *   node scripts/run-performance-tests-integrated.js --report reports/performance.json
 *   node scripts/run-performance-tests-integrated.js --health-check-only
 */

const { PerformanceTestIntegration } = require('../tests/performance/PerformanceTestIntegration');
const { mkdirSync, existsSync } = require('fs');
const { join } = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isQuick = args.includes('--quick');
const healthCheckOnly = args.includes('--health-check-only');
const reportIndex = args.findIndex(arg => arg === '--report');
const reportPath = reportIndex !== -1 && args[reportIndex + 1] ? args[reportIndex + 1] : null;

async function main() {
  console.log('🚀 Integrated Performance Test Runner');
  console.log('=====================================');
  console.log('');

  try {
    // Create performance test integration instance
    const config = {
      enableExecutionBenchmarks: !healthCheckOnly,
      enableLoadTesting: !isQuick && !healthCheckOnly,
      enableSystemMonitoring: true,
      enableDataLifecycleTesting: !healthCheckOnly,
      reportOutputPath: reportPath,
      alertThresholds: {
        maxExecutionTime: isQuick ? 2000 : 1000, // More lenient for quick tests
        maxMemoryUsage: 512, // 512MB
        minThroughput: isQuick ? 50 : 100, // Lower threshold for quick tests
        maxErrorRate: 0.05 // 5%
      }
    };

    const integration = new PerformanceTestIntegration(config);

    if (healthCheckOnly) {
      console.log('🔍 Running performance health check...');
      const healthCheck = await integration.quickHealthCheck();
      
      console.log('');
      console.log('Health Check Results:');
      console.log(`Status: ${getStatusIcon(healthCheck.status)} ${healthCheck.status}`);
      console.log(`Memory Usage: ${healthCheck.metrics.memoryUsageMB?.toFixed(2) || 'N/A'} MB`);
      console.log(`CPU User Time: ${healthCheck.metrics.cpuUserMs?.toFixed(2) || 'N/A'} ms`);
      console.log(`CPU System Time: ${healthCheck.metrics.cpuSystemMs?.toFixed(2) || 'N/A'} ms`);
      
      if (healthCheck.issues.length > 0) {
        console.log('');
        console.log('Issues Found:');
        for (const issue of healthCheck.issues) {
          console.log(`  ⚠️  ${issue}`);
        }
      }
      
      return;
    }

    console.log(`Mode: ${isQuick ? 'Quick Test' : 'Comprehensive Test'}`);
    console.log('Configuration:');
    console.log(`  Execution Benchmarks: ${config.enableExecutionBenchmarks ? '✅' : '❌'}`);
    console.log(`  Load Testing: ${config.enableLoadTesting ? '✅' : '❌'}`);
    console.log(`  System Monitoring: ${config.enableSystemMonitoring ? '✅' : '❌'}`);
    console.log(`  Data Lifecycle Testing: ${config.enableDataLifecycleTesting ? '✅' : '❌'}`);
    if (reportPath) {
      console.log(`  Report Output: ${reportPath}`);
    }
    console.log('');

    console.log('⏳ Running comprehensive performance test suite...');
    console.log('This may take several minutes depending on configuration.');
    console.log('');

    const startTime = Date.now();
    const report = await integration.executeComprehensivePerformanceTest();
    const duration = Date.now() - startTime;

    console.log('');
    console.log('📊 Performance Test Results');
    console.log('===========================');
    console.log('');
    
    // Overall results
    console.log(`Overall Performance Score: ${getScoreIcon(report.overallScore)} ${report.overallScore}/100`);
    console.log(`Test Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Generated: ${report.timestamp.toISOString()}`);
    console.log('');

    // Execution benchmarks
    if (config.enableExecutionBenchmarks) {
      console.log('🔄 Execution Benchmarks:');
      console.log(`  Status: ${report.executionBenchmarks.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Benchmarks Run: ${report.executionBenchmarks.results.length}`);
      
      for (const result of report.executionBenchmarks.results) {
        const passed = result.summary.passed ? '✅' : '❌';
        console.log(`    ${passed} ${result.config.name}: ${result.summary.averageExecutionTime.toFixed(2)}ms avg, ${result.summary.throughput.toFixed(1)} ops/sec`);
      }
      console.log('');
    }

    // Load testing
    if (config.enableLoadTesting) {
      console.log('🔥 Load Testing:');
      console.log(`  Scenarios Executed: ${report.loadTestResults.scenariosExecuted}`);
      console.log(`  Total Requests: ${report.loadTestResults.totalRequests}`);
      console.log(`  Average Response Time: ${report.loadTestResults.averageResponseTime}ms`);
      console.log(`  Error Rate: ${(report.loadTestResults.errorRate * 100).toFixed(2)}%`);
      console.log('');
    }

    // System performance
    if (config.enableSystemMonitoring) {
      console.log('💻 System Performance:');
      console.log(`  Memory Usage: ${report.systemPerformance.memoryUsage.toFixed(2)} MB`);
      console.log(`  CPU Usage: ${report.systemPerformance.cpuUsage.toFixed(2)} ms`);
      console.log(`  Disk I/O: ${report.systemPerformance.diskIO.toFixed(2)} ops`);
      console.log(`  Network I/O: ${report.systemPerformance.networkIO.toFixed(2)} ops`);
      console.log('');
    }

    // Data lifecycle performance
    if (config.enableDataLifecycleTesting) {
      console.log('📊 Data Lifecycle Performance:');
      console.log(`  Records Processed: ${report.dataLifecyclePerformance.recordsProcessed}`);
      console.log(`  Average Processing Time: ${report.dataLifecyclePerformance.averageProcessingTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${report.dataLifecyclePerformance.throughput.toFixed(2)} ops/sec`);
      console.log(`  Error Rate: ${(report.dataLifecyclePerformance.errorRate * 100).toFixed(2)}%`);
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (report.recommendations.length === 0) {
      console.log('  ✅ No specific recommendations - performance is within acceptable thresholds');
    } else {
      for (const recommendation of report.recommendations) {
        console.log(`  📝 ${recommendation}`);
      }
    }
    console.log('');

    // Success/failure summary
    if (report.overallScore >= 80) {
      console.log('🎉 Performance test completed successfully!');
      console.log('   All critical performance metrics are within acceptable thresholds.');
    } else if (report.overallScore >= 60) {
      console.log('⚠️  Performance test completed with warnings.');
      console.log('   Some performance metrics need attention.');
    } else {
      console.log('❌ Performance test failed.');
      console.log('   Critical performance issues detected that require immediate attention.');
      process.exit(1);
    }

    if (reportPath) {
      console.log('');
      console.log(`📄 Detailed report saved to: ${reportPath}`);
      console.log(`📄 Summary report saved to: ${reportPath.replace('.json', '-summary.txt')}`);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Performance test failed with error:');
    console.error(error.message);
    console.error('');
    console.error('Common solutions:');
    console.error('  - Ensure all dependencies are installed: pnpm install');
    console.error('  - Check that the server is not running: pkill -f "node.*server"');
    console.error('  - Verify memory availability: at least 2GB RAM recommended');
    console.error('  - Run with --quick flag for faster execution');
    console.error('');
    process.exit(1);
  }
}

function getStatusIcon(status) {
  switch (status) {
  case 'HEALTHY': return '✅';
  case 'WARNING': return '⚠️';
  case 'CRITICAL': return '❌';
  default: return '❓';
  }
}

function getScoreIcon(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

// Handle CLI usage
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };