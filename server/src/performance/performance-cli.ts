#!/usr/bin/env node

/**
 * Performance Testing CLI Tool
 *
 * Command-line interface for running performance tests and monitoring
 * collaborative editing system performance.
 */

import { Command } from 'commander';
import { PerformanceSystem, LoadTestRunner, TEST_SCENARIOS } from './index';
import { promises as fs } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('performance-cli')
  .description('Performance testing and optimization tool for collaborative editing')
  .version('1.0.0');

program
  .command('test')
  .description('Run performance tests')
  .option('-u, --url <url>', 'WebSocket server URL', 'ws://localhost:8000')
  .option('-s, --scenario <scenario>', 'Test scenario name')
  .option('-o, --output <dir>', 'Output directory', './performance-results')
  .option('--stress', 'Run stress test with increasing load')
  .option('--endurance <duration>', 'Run endurance test (duration in minutes)')
  .option('--users <count>', 'Number of simulated users', '5')
  .option('--duration <ms>', 'Test duration in milliseconds', '60000')
  .action(async options => {
    try {
      console.log('🚀 Starting performance tests...');
      console.log(`Server URL: ${options.url}`);
      console.log(`Output directory: ${options.output}`);

      const loadTestRunner = new LoadTestRunner();

      if (options.stress) {
        console.log('Running stress test...');
        const baseConfig = LoadTestRunner.createCollaborativeEditingTests(options.url)[0];
        const results = await loadTestRunner.runStressTest(baseConfig, 50, 5);
        console.log(`✅ Stress test completed. Max users: ${findMaxUsers(results)}`);
      } else if (options.endurance) {
        const duration = parseInt(options.endurance) * 60 * 1000; // Convert minutes to ms
        console.log(`Running endurance test for ${options.endurance} minutes...`);
        const baseConfig = LoadTestRunner.createCollaborativeEditingTests(options.url)[0];
        const result = await loadTestRunner.runEnduranceTest(baseConfig, duration);
        console.log(`✅ Endurance test completed. Success rate: ${result.summary.successRate.toFixed(1)}%`);
      } else if (options.scenario) {
        const scenario = TEST_SCENARIOS.find(s => s.name === options.scenario);
        if (!scenario) {
          console.error(`❌ Scenario '${options.scenario}' not found`);
          console.log('Available scenarios:', TEST_SCENARIOS.map(s => s.name).join(', '));
          process.exit(1);
        }

        // Customize scenario with CLI options
        const customScenario = {
          ...scenario,
          userCount: parseInt(options.users),
          duration: parseInt(options.duration),
        };

        console.log(`Running scenario: ${customScenario.name}`);
        const testSuite = new (await import('./PerformanceTestSuite')).PerformanceTestSuite();
        const metrics = await testSuite.runScenario(customScenario, options.url);
        const report = testSuite.generateReport(metrics);

        console.log(
          `✅ Test completed. Operations: ${metrics.length}, Success rate: ${report?.statistics?.operationSuccessRate?.mean || 0}%`
        );
      } else {
        console.log('Running standard test suite...');
        const configs = LoadTestRunner.createCollaborativeEditingTests(options.url);
        const results = await loadTestRunner.runTestSuite(configs);

        console.log('✅ Test suite completed:');
        results.forEach(result => {
          console.log(
            `  ${result.config.name}: ${result.summary.successRate.toFixed(1)}% success, ${result.summary.averageLatency.toFixed(0)}ms avg latency`
          );
        });
      }
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      process.exit(1);
    }
  });

program
  .command('monitor')
  .description('Start performance monitoring dashboard')
  .option('-p, --port <port>', 'Dashboard port', '3001')
  .option('--metrics-only', 'Only collect metrics without dashboard')
  .action(async options => {
    try {
      console.log('📊 Starting performance monitoring...');

      const system = new PerformanceSystem();
      system.start();

      if (!options.metricsOnly) {
        console.log(`🌐 Dashboard available at http://localhost:${options.port}`);
        console.log('📈 Real-time metrics collection started');
        console.log('Press Ctrl+C to stop monitoring');

        // Keep process alive
        process.on('SIGINT', () => {
          console.log('\n🛑 Stopping performance monitoring...');
          system.stop();
          process.exit(0);
        });

        // Prevent process from exiting
        setInterval(() => {}, 1000);
      } else {
        console.log('📈 Metrics collection started (no dashboard)');
        console.log('Press Ctrl+C to stop');

        process.on('SIGINT', () => {
          console.log('\n🛑 Stopping metrics collection...');
          system.stop();
          process.exit(0);
        });

        setInterval(() => {}, 1000);
      }
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      process.exit(1);
    }
  });

program
  .command('optimize')
  .description('Run performance optimization')
  .option('--strategy <strategy>', 'Specific optimization strategy to run')
  .option('--auto', 'Enable automatic optimization')
  .action(async options => {
    try {
      console.log('⚡ Starting performance optimization...');

      const { PerformanceOptimizer, MetricsCollector } = await import('./index');
      const metricsCollector = new MetricsCollector();
      const optimizer = new PerformanceOptimizer(metricsCollector);

      metricsCollector.startCollection();

      if (options.strategy) {
        console.log(`Running optimization strategy: ${options.strategy}`);
        const result = await optimizer.executeStrategy(options.strategy);
        console.log(`✅ Optimization completed. Success: ${result.success}`);

        if (result.success) {
          console.log('Improvements:');
          if (result.metricsImprovement.cpuReduction) {
            console.log(`  CPU: -${result.metricsImprovement.cpuReduction.toFixed(1)}%`);
          }
          if (result.metricsImprovement.memoryReduction) {
            console.log(`  Memory: -${result.metricsImprovement.memoryReduction.toFixed(1)}%`);
          }
          if (result.metricsImprovement.latencyReduction) {
            console.log(`  Latency: -${result.metricsImprovement.latencyReduction.toFixed(0)}ms`);
          }
        }
      } else if (options.auto) {
        console.log('Starting automatic optimization...');
        optimizer.start();

        console.log('🤖 Automatic optimization enabled');
        console.log('Press Ctrl+C to stop');

        process.on('SIGINT', () => {
          console.log('\n🛑 Stopping optimization...');
          optimizer.stop();
          metricsCollector.stopCollection();
          process.exit(0);
        });

        setInterval(() => {}, 1000);
      } else {
        const recommendations = optimizer.getRecommendations();
        console.log('💡 Performance recommendations:');
        recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate performance report')
  .option('-f, --format <format>', 'Report format (html, json, csv)', 'html')
  .option('-o, --output <file>', 'Output file path')
  .option('--period <hours>', 'Report period in hours', '24')
  .action(async options => {
    try {
      console.log('📋 Generating performance report...');

      const { MetricsCollector } = await import('./index');
      const metricsCollector = new MetricsCollector();

      const endTime = Date.now();
      const startTime = endTime - parseInt(options.period) * 60 * 60 * 1000;

      const aggregatedMetrics = metricsCollector.getAggregatedMetrics(startTime, endTime);

      let outputPath = options.output;
      if (!outputPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        outputPath = `performance-report-${timestamp}.${options.format}`;
      }

      if (options.format === 'html') {
        const html = generateHTMLReport(aggregatedMetrics);
        await fs.writeFile(outputPath, html);
      } else if (options.format === 'json') {
        await fs.writeFile(outputPath, JSON.stringify(aggregatedMetrics, null, 2));
      } else if (options.format === 'csv') {
        const csv = generateCSVReport(aggregatedMetrics);
        await fs.writeFile(outputPath, csv);
      }

      console.log(`✅ Report generated: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      process.exit(1);
    }
  });

program
  .command('scenarios')
  .description('List available test scenarios')
  .action(() => {
    console.log('📋 Available test scenarios:');
    TEST_SCENARIOS.forEach(scenario => {
      console.log(`\n🎯 ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);
      console.log(`   Users: ${scenario.userCount}`);
      console.log(`   Duration: ${scenario.duration / 1000}s`);
      console.log(`   Operation rate: ${scenario.operationRate} ops/sec/user`);
      console.log(`   Complexity: ${scenario.documentComplexity}`);
    });
  });

program
  .command('health')
  .description('Check system health')
  .option('-u, --url <url>', 'WebSocket server URL', 'ws://localhost:8000')
  .action(async options => {
    try {
      console.log('🏥 Checking system health...');

      // Quick health check with minimal load
      const { PerformanceTestSuite } = await import('./PerformanceTestSuite');
      const testSuite = new PerformanceTestSuite();

      const healthScenario = {
        name: 'health_check',
        description: 'Quick system health check',
        userCount: 1,
        duration: 10000,
        operationRate: 0.5,
        operationTypes: ['update_cursor', 'update_selection'] as any[],
        documentComplexity: 'simple' as any,
      };

      const metrics = await testSuite.runScenario(healthScenario, options.url);

      if (metrics.length > 0) {
        const avgLatency = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length;
        const successRate = (metrics.filter(m => m.errorRate === 0).length / metrics.length) * 100;

        console.log('✅ System health check completed:');
        console.log(`   Connection: ${successRate === 100 ? '🟢 Healthy' : '🟡 Issues detected'}`);
        console.log(`   Average latency: ${avgLatency.toFixed(0)}ms`);
        console.log(`   Success rate: ${successRate.toFixed(1)}%`);

        if (successRate < 100) {
          console.log('⚠️  Performance issues detected. Consider running optimization.');
        }
      } else {
        console.log('❌ Unable to connect to server or collect metrics');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    }
  });

// Helper functions
function findMaxUsers(results: any[]): number {
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].summary.successRate >= 95) {
      const match = results[i].config.name.match(/(\d+)users/);
      return match ? parseInt(match[1]) : 0;
    }
  }
  return 0;
}

function generateHTMLReport(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 4px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-label { font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <h1>Performance Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Period: ${data.period ? `${Math.round(data.period.duration / 3600000)} hours` : 'N/A'}</p>
    </div>
    <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
}

function generateCSVReport(data: any): string {
  const lines = ['Timestamp,Metric,Value'];

  // This is a simplified CSV generation - would be more sophisticated in real implementation
  if (data.system) {
    lines.push(`${Date.now()},CPU Mean,${data.system.cpu?.mean || 0}`);
    lines.push(`${Date.now()},Memory Mean,${data.system.memory?.mean || 0}`);
  }

  return lines.join('\n');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Parse command line arguments
if (require.main === module) {
  program.parse();
}
