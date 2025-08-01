#!/usr/bin/env node

/**
 * Rule Testing CLI - Command line interface for the Rule Testing Environment
 * 
 * Usage:
 * npm run rule-test setup --config test-config.json
 * npm run rule-test run --framework GDPR
 * npm run rule-test benchmark --rules 1000
 * npm run rule-test teardown
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import RuleTestingEnvironment, { TestEnvironmentConfig, ComplianceFramework } from '../services/RuleTestingEnvironment';

const program = new Command();

// Default configuration
const defaultConfig: TestEnvironmentConfig = {
  name: 'Default Rule Testing Environment',
  description: 'Comprehensive security and compliance rule testing environment',
  frameworks: ['GDPR', 'CCPA', 'HIPAA'] as ComplianceFramework[],
  testTypes: ['UNIT', 'INTEGRATION', 'FUNCTIONAL', 'PERFORMANCE'] as any[],
  performance: {
    maxExecutionTime: 30000,
    maxRuleCount: 1000,
    maxConcurrency: 10

  data: {
    generateSyntheticData: true,
    datasetSize: 'medium',
    includeEdgeCases: true

  reporting: {
    enableRealTimeReporting: true,
    generateDetailedReports: true,
    exportResults: true

};

let testEnvironment: RuleTestingEnvironment | null = null;

program
  .name('rule-testing-cli')
  .description('CLI for Security & Compliance Rule Testing Environment')
  .version('1.0.0');

program
  .command('setup')
  .description('Setup the rule testing environment')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-f, --frameworks <frameworks>', 'Comma-separated list of frameworks to test')
  .option('--data-size <size>', 'Size of test dataset (small|medium|large)', 'medium')
  .option('--max-rules <count>', 'Maximum number of rules to test', '1000')
  .action(async (options) => {
    try {
      console.log('🚀 Setting up Rule Testing Environment...\n');
      
      let config = defaultConfig;
      
      // Load custom configuration if provided
      if (options.config) {
        const configPath = path.resolve(options.config);
        if (fs.existsSync(configPath)) {
          const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config = { ...defaultConfig, ...customConfig };
          console.log(`📄 Loaded configuration from: ${configPath}`);
 else {
          console.warn(`⚠️  Configuration file not found: ${configPath}. Using default configuration.`);


      
      // Override with command line options
      if (options.frameworks) {
        config.frameworks = options.frameworks.split(',').map((f: string) => f.trim()) as ComplianceFramework[];

      
      if (options.dataSize) {
        config.data.datasetSize = options.dataSize as 'small' | 'medium' | 'large';

      
      if (options.maxRules) {
        config.performance.maxRuleCount = parseInt(options.maxRules);

      
      // Initialize environment
      testEnvironment = new RuleTestingEnvironment(config);
      
      // Setup environment
      console.log('🔧 Initializing testing environment components...');
      const setup = await testEnvironment.setupEnvironment();
      
      // Display setup results
      console.log('\n✅ Environment Setup Complete!\n');
      console.log('📊 Setup Status:');
      console.log(`   Databases: ${Object.values(setup.databases).some(Boolean) ? '✅' : '❌'}`);
      console.log(`   Services: ${Object.values(setup.services).every(Boolean) ? '✅' : '❌'}`);
      console.log(`   Test Data: ${Object.values(setup.testData).some(Boolean) ? '✅' : '❌'}`);
      
      console.log('\n🎯 Configuration:');
      console.log(`   Frameworks: ${config.frameworks.join(', ')}`);
      console.log(`   Max Rules: ${config.performance.maxRuleCount}`);
      console.log(`   Data Size: ${config.data.datasetSize}`);
      console.log(`   Max Execution Time: ${config.performance.maxExecutionTime}ms`);
      
      console.log('\n🚀 Environment is ready for testing!');
      console.log('Use "rule-test run" to execute test suites.');
 catch (error) {
      console.error('❌ Failed to setup testing environment:', error.message);
      process.exit(1);

  });

program
  .command('run')
  .description('Execute rule testing suite')
  .option('-f, --framework <framework>', 'Specific framework to test')
  .option('--integration', 'Run integration tests only')
  .option('--performance', 'Run performance benchmarks only')
  .option('--conflicts', 'Run conflict resolution tests only')
  .option('--output <path>', 'Output directory for test reports')
  .action(async (options) => {
    try {
      if (!testEnvironment) {
        console.error('❌ Environment not setup. Run "rule-test setup" first.');
        process.exit(1);

      
      console.log('🧪 Starting Rule Testing Suite...\n');
      
      let reports = [];
      
      if (options.framework) {
        console.log(`🎯 Testing specific framework: ${options.framework}`);
        const report = await testEnvironment.testFramework(options.framework as ComplianceFramework);
        reports = [report];
 else if (options.integration) {
        console.log('🔗 Running integration tests...');
        const report = await testEnvironment.executeIntegrationTests();
        reports = [report];
 else if (options.performance) {
        console.log('⚡ Running performance benchmarks...');
        const report = await testEnvironment.executePerformanceBenchmarks();
        reports = [report];
 else if (options.conflicts) {
        console.log('⚔️ Running conflict resolution tests...');
        const report = await testEnvironment.testConflictResolution();
        reports = [report];
 else {
        console.log('🏃 Running comprehensive test suite...');
        reports = await testEnvironment.executeTestSuite();

      
      // Display results summary
      console.log('\n📊 Test Results Summary:');
      console.log('═'.repeat(50));
      
      let totalTests = 0;
      let totalPassed = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      let totalDuration = 0;
      
      reports.forEach((report, index) => {
        console.log(`\n📋 Report ${index + 1}: ${report.testSuite.name}`);
        console.log(`   Total: ${report.summary.total}`);
        console.log(`   Passed: ${report.summary.passed} ✅`);
        console.log(`   Failed: ${report.summary.failed} ❌`);
        console.log(`   Skipped: ${report.summary.skipped} ⏭️`);
        console.log(`   Duration: ${report.summary.duration}ms`);
        
        totalTests += report.summary.total;
        totalPassed += report.summary.passed;
        totalFailed += report.summary.failed;
        totalSkipped += report.summary.skipped;
        totalDuration += report.summary.duration;
      });
      
      console.log('\n🎯 Overall Summary:');
      console.log(`   Total Tests: ${totalTests}`);
      console.log(`   Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
      console.log(`   Total Duration: ${totalDuration}ms`);
      
      // Export reports if requested
      if (options.output) {
        const outputDir = path.resolve(options.output);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });

        
        reports.forEach((report, index) => {
          const filename = `test-report-${index + 1}-${Date.now()}.json`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
          console.log(`📄 Report exported to: ${filepath}`);
        });

      
      // Show metrics
      const metrics = testEnvironment.getMetrics();
      console.log('\n📈 Performance Metrics:');
      console.log(`   Avg Execution Time: ${metrics.performance.avgExecutionTime}ms`);
      console.log(`   Rules per Second: ${metrics.performance.rulesPerSecond.toFixed(2)}`);
      
      console.log('\n✅ Test execution completed!');
 catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);

  });

program
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('--rules <count>', 'Number of rules to benchmark', '1000')
  .option('--data <count>', 'Number of data points to test', '10000')
  .option('--concurrency <count>', 'Concurrent execution count', '10')
  .option('--duration <seconds>', 'Benchmark duration in seconds', '60')
  .action(async (options) => {
    try {
      if (!testEnvironment) {
        console.error('❌ Environment not setup. Run "rule-test setup" first.');
        process.exit(1);

      
      console.log('⚡ Running Performance Benchmarks...\n');
      console.log('🎯 Configuration:');
      console.log(`   Rules: ${options.rules}`);
      console.log(`   Data Points: ${options.data}`);
      console.log(`   Concurrency: ${options.concurrency}`);
      console.log(`   Duration: ${options.duration}s\n`);
      
      const report = await testEnvironment.executePerformanceBenchmarks();
      
      console.log('📊 Benchmark Results:');
      console.log('═'.repeat(50));
      
      report.results.forEach(result => {
        console.log(`\n📋 ${result.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Duration: ${result.duration}ms`);
        if (result.metrics) {
          console.log(`   Rules/sec: ${result.metrics.rulesPerSecond?.toFixed(2) || 'N/A'}`);
          console.log(`   Memory: ${result.metrics.memoryUsage || 'N/A'}`);
          console.log(`   CPU: ${result.metrics.cpuUsage || 'N/A'}`);

      });
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });

      
      console.log('\n✅ Benchmarks completed!');
 catch (error) {
      console.error('❌ Benchmark execution failed:', error.message);
      process.exit(1);

  });

program
  .command('status')
  .description('Show current environment status')
  .action(async () => {
    try {
      if (!testEnvironment) {
        console.log('❌ Environment not initialized');
        console.log('Run "rule-test setup" to initialize the testing environment.');
        return;

      
      const config = testEnvironment.getConfig();
      const metrics = testEnvironment.getMetrics();
      
      console.log('📊 Rule Testing Environment Status\n');
      
      console.log('🔧 Configuration:');
      console.log(`   Name: ${config.name}`);
      console.log(`   Frameworks: ${config.frameworks.join(', ')}`);
      console.log(`   Max Rules: ${config.performance.maxRuleCount}`);
      console.log(`   Data Size: ${config.data.datasetSize}`);
      
      console.log('\n📈 Metrics:');
      console.log(`   Total Tests: ${metrics.totalTests}`);
      console.log(`   Passed: ${metrics.passedTests}`);
      console.log(`   Failed: ${metrics.failedTests}`);
      console.log(`   Success Rate: ${metrics.totalTests > 0 ? ((metrics.passedTests / metrics.totalTests) * 100).toFixed(1) : 0}%`);
      console.log(`   Last Execution Time: ${metrics.executionTime}ms`);
      
      console.log('\n⚡ Performance:');
      console.log(`   Avg Execution Time: ${metrics.performance.avgExecutionTime}ms`);
      console.log(`   Max Execution Time: ${metrics.performance.maxExecutionTime}ms`);
      console.log(`   Rules per Second: ${metrics.performance.rulesPerSecond.toFixed(2)}`);
 catch (error) {
      console.error('❌ Failed to get status:', error.message);
      process.exit(1);

  });

program
  .command('teardown')
  .description('Teardown the testing environment and cleanup resources')
  .option('--force', 'Force teardown without confirmation')
  .action(async (options) => {
    try {
      if (!testEnvironment) {
        console.log('✅ Environment not initialized - nothing to teardown');
        return;

      
      if (!options.force) {
        console.log('⚠️  This will teardown the testing environment and cleanup all resources.');
        console.log('Use --force to skip this confirmation.');
        return;

      
      console.log('🧹 Tearing down Rule Testing Environment...');
      
      await testEnvironment.teardownEnvironment();
      testEnvironment = null;
      
      console.log('✅ Environment teardown completed successfully');
 catch (error) {
      console.error('❌ Teardown failed:', error.message);
      process.exit(1);

  });

program
  .command('generate-config')
  .description('Generate a sample configuration file')
  .option('-o, --output <path>', 'Output file path', 'rule-test-config.json')
  .action((options) => {
    try {
      const configPath = path.resolve(options.output);
      
      const sampleConfig = {
        ...defaultConfig,
        name: 'Custom Rule Testing Environment',
        description: 'Customized configuration for rule testing'
        // Add more detailed sample configuration
      };
      
      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));
      
      console.log('📄 Sample configuration generated successfully!');
      console.log(`File: ${configPath}`);
      console.log('\nEdit the configuration file and use it with:');
      console.log(`rule-test setup --config ${options.output}`);
 catch (error) {
      console.error('❌ Failed to generate configuration:', error.message);
      process.exit(1);

  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

program.parse(process.argv);

// Show help if no commands provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
