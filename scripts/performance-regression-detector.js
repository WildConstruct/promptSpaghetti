#!/usr/bin/env node

/**
 * Performance Regression Detector
 * 
 * Automated system to detect performance regressions by comparing
 * current performance metrics with historical baselines.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class PerformanceRegressionDetector {
  constructor() {
    this.baselineDir = 'performance-baselines';
    this.currentMetrics = {};
    this.baselineMetrics = {};
    this.regressions = [];
    this.improvements = [];
    
    // Performance thresholds (percentage increase that triggers regression alert)
    this.thresholds = {
      testExecution: 20,      // 20% slower test execution
      bundleSize: 10,         // 10% larger bundle size
      memoryUsage: 15,        // 15% more memory usage
      apiResponseTime: 25,    // 25% slower API responses
      renderTime: 30,         // 30% slower React render times
      buildTime: 15           // 15% longer build times
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(title) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, 'cyan');
    this.log(`⚡ ${title}`, 'bold');
    this.log(border, 'cyan');
  }

  logStep(step, status = 'info') {
    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
    const colorMap = { info: 'blue', success: 'green', warning: 'yellow', error: 'red' };
    this.log(`${icons[status]} ${step}`, colorMap[status]);
  }

  async runRegressionDetection() {
    this.logHeader('Performance Regression Detection');
    
    await this.createBaselineDirectory();
    await this.collectCurrentMetrics();
    await this.loadBaselineMetrics();
    await this.detectRegressions();
    await this.generateRegressionReport();
    
    return this.hasRegressions();
  }

  async createBaselineDirectory() {
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
      this.logStep('Created performance baselines directory', 'success');
    }
  }

  async collectCurrentMetrics() {
    this.logStep('Collecting current performance metrics...', 'info');
    
    // Test execution performance
    await this.collectTestExecutionMetrics();
    
    // Bundle size metrics
    await this.collectBundleMetrics();
    
    // Memory usage metrics
    await this.collectMemoryMetrics();
    
    // Build time metrics
    await this.collectBuildMetrics();
    
    // Quality test performance
    await this.collectQualityTestMetrics();
    
    this.logStep('Current metrics collected', 'success');
  }

  async collectTestExecutionMetrics() {
    try {
      const startTime = Date.now();
      
      // Run tests and capture timing
      execSync('pnpm test -- --passWithNoTests --silent', { stdio: 'pipe' });
      
      const endTime = Date.now();
      const testDuration = endTime - startTime;
      
      this.currentMetrics.testExecution = {
        duration: testDuration,
        timestamp: new Date().toISOString()
      };
      
      this.logStep(`Test execution: ${testDuration}ms`, 'info');
    } catch (error) {
      this.logStep('Test execution measurement failed', 'warning');
      this.currentMetrics.testExecution = {
        duration: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async collectBundleMetrics() {
    try {
      const startTime = Date.now();
      
      // Build and measure bundle size
      execSync('pnpm --filter client build', { stdio: 'pipe' });
      
      const buildTime = Date.now() - startTime;
      
      // Measure bundle sizes
      const distPath = 'client/dist';
      const bundleMetrics = {};
      
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        let totalSize = 0;
        
        files.forEach(file => {
          const filePath = path.join(distPath, file);
          if (fs.statSync(filePath).isFile()) {
            const size = fs.statSync(filePath).size;
            totalSize += size;
            
            if (file.endsWith('.js') || file.endsWith('.css')) {
              bundleMetrics[file] = size;
            }
          }
        });
        
        bundleMetrics.total = totalSize;
        bundleMetrics.buildTime = buildTime;
      }
      
      this.currentMetrics.bundle = {
        ...bundleMetrics,
        timestamp: new Date().toISOString()
      };
      
      this.logStep(`Bundle size: ${Math.round(bundleMetrics.total / 1024)}KB, Build time: ${buildTime}ms`, 'info');
    } catch (error) {
      this.logStep('Bundle metrics collection failed', 'warning');
      this.currentMetrics.bundle = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async collectMemoryMetrics() {
    try {
      // Use our memory monitoring utilities
      const memoryBefore = process.memoryUsage();
      
      // Run quality tests to simulate memory usage
      const { runQualityTests } = require('../client/src/utils/__tests__/testRunner.js');
      await runQualityTests();
      
      const memoryAfter = process.memoryUsage();
      
      this.currentMetrics.memory = {
        heapUsedDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        heapTotalDelta: memoryAfter.heapTotal - memoryBefore.heapTotal,
        peakHeapUsed: memoryAfter.heapUsed,
        timestamp: new Date().toISOString()
      };
      
      this.logStep(`Memory delta: ${Math.round(this.currentMetrics.memory.heapUsedDelta / 1024 / 1024)}MB`, 'info');
    } catch (error) {
      this.logStep('Memory metrics collection failed', 'warning');
      this.currentMetrics.memory = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async collectBuildMetrics() {
    try {
      const startTime = Date.now();
      
      // Clean build
      execSync('pnpm --filter client build', { stdio: 'pipe' });
      
      const buildTime = Date.now() - startTime;
      
      this.currentMetrics.build = {
        duration: buildTime,
        timestamp: new Date().toISOString()
      };
      
      this.logStep(`Build time: ${buildTime}ms`, 'info');
    } catch (error) {
      this.logStep('Build metrics collection failed', 'warning');
      this.currentMetrics.build = {
        duration: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async collectQualityTestMetrics() {
    try {
      const startTime = Date.now();
      
      // Run our comprehensive quality tests
      const { runQualityTests } = require('../client/src/utils/__tests__/testRunner.js');
      const report = await runQualityTests();
      
      const qualityTestDuration = Date.now() - startTime;
      
      this.currentMetrics.qualityTests = {
        duration: qualityTestDuration,
        totalTests: report.totalTests,
        passedTests: report.passedTests,
        failedTests: report.failedTests,
        coverage: report.coverage,
        timestamp: new Date().toISOString()
      };
      
      this.logStep(`Quality tests: ${qualityTestDuration}ms, ${report.passedTests}/${report.totalTests} passed`, 'info');
    } catch (error) {
      this.logStep('Quality test metrics collection failed', 'warning');
      this.currentMetrics.qualityTests = {
        duration: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async loadBaselineMetrics() {
    const baselineFile = path.join(this.baselineDir, 'latest-baseline.json');
    
    if (fs.existsSync(baselineFile)) {
      try {
        const baselineData = fs.readFileSync(baselineFile, 'utf8');
        this.baselineMetrics = JSON.parse(baselineData);
        this.logStep('Loaded baseline metrics for comparison', 'success');
      } catch (error) {
        this.logStep('Failed to load baseline metrics', 'warning');
        this.baselineMetrics = {};
      }
    } else {
      this.logStep('No baseline metrics found - creating initial baseline', 'info');
      this.saveCurrentAsBaseline();
    }
  }

  async detectRegressions() {
    this.logStep('Analyzing for performance regressions...', 'info');
    
    // Compare test execution times
    this.compareMetric(
      'testExecution',
      'duration',
      'Test Execution Time',
      this.thresholds.testExecution,
      'ms'
    );
    
    // Compare bundle sizes
    this.compareMetric(
      'bundle',
      'total',
      'Bundle Size',
      this.thresholds.bundleSize,
      'bytes'
    );
    
    // Compare build times
    this.compareMetric(
      'build',
      'duration',
      'Build Time',
      this.thresholds.buildTime,
      'ms'
    );
    
    // Compare memory usage
    this.compareMetric(
      'memory',
      'heapUsedDelta',
      'Memory Usage',
      this.thresholds.memoryUsage,
      'bytes'
    );
    
    // Compare quality test performance
    this.compareMetric(
      'qualityTests',
      'duration',
      'Quality Test Duration',
      this.thresholds.testExecution,
      'ms'
    );
    
    this.logStep(`Found ${this.regressions.length} regressions and ${this.improvements.length} improvements`, 
                 this.regressions.length > 0 ? 'warning' : 'success');
  }

  compareMetric(category, metric, displayName, threshold, unit) {
    const current = this.currentMetrics[category];
    const baseline = this.baselineMetrics[category];
    
    if (!current || !baseline || current[metric] === null || baseline[metric] === null) {
      return; // Skip comparison if data is missing
    }
    
    const currentValue = current[metric];
    const baselineValue = baseline[metric];
    const percentChange = ((currentValue - baselineValue) / baselineValue) * 100;
    
    if (Math.abs(percentChange) > threshold) {
      const result = {
        category,
        metric: displayName,
        currentValue,
        baselineValue,
        percentChange: Math.round(percentChange * 100) / 100,
        unit,
        threshold
      };
      
      if (percentChange > 0) {
        this.regressions.push(result);
        this.logStep(`📈 Regression: ${displayName} increased by ${Math.round(percentChange)}%`, 'warning');
      } else {
        this.improvements.push(result);
        this.logStep(`📉 Improvement: ${displayName} decreased by ${Math.round(Math.abs(percentChange))}%`, 'success');
      }
    }
  }

  async generateRegressionReport() {
    this.logHeader('Performance Regression Report');
    
    const reportData = {
      timestamp: new Date().toISOString(),
      regressions: this.regressions,
      improvements: this.improvements,
      currentMetrics: this.currentMetrics,
      baselineMetrics: this.baselineMetrics,
      thresholds: this.thresholds
    };
    
    // Display summary
    this.log('📊 Performance Summary:', 'cyan');
    this.log(`   🔴 Regressions: ${this.regressions.length}`, this.regressions.length > 0 ? 'red' : 'green');
    this.log(`   🟢 Improvements: ${this.improvements.length}`, 'green');
    
    if (this.regressions.length > 0) {
      this.log('\n❌ Performance Regressions Detected:', 'red');
      this.regressions.forEach((regression, index) => {
        this.log(`\n${index + 1}. ${regression.metric}`, 'yellow');
        this.log(`   Current: ${this.formatValue(regression.currentValue, regression.unit)}`, 'blue');
        this.log(`   Baseline: ${this.formatValue(regression.baselineValue, regression.unit)}`, 'blue');
        this.log(`   Change: +${regression.percentChange}% (threshold: ${regression.threshold}%)`, 'red');
        this.log(`   Impact: Performance degradation detected`, 'yellow');
      });
    }
    
    if (this.improvements.length > 0) {
      this.log('\n✅ Performance Improvements:', 'green');
      this.improvements.forEach((improvement, index) => {
        this.log(`\n${index + 1}. ${improvement.metric}`, 'cyan');
        this.log(`   Current: ${this.formatValue(improvement.currentValue, improvement.unit)}`, 'blue');
        this.log(`   Baseline: ${this.formatValue(improvement.baselineValue, improvement.unit)}`, 'blue');
        this.log(`   Change: ${improvement.percentChange}%`, 'green');
        this.log(`   Impact: Performance improvement achieved`, 'green');
      });
    }
    
    // Save report
    const reportFile = path.join(this.baselineDir, `regression-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    
    // Update baseline if no regressions
    if (this.regressions.length === 0) {
      this.saveCurrentAsBaseline();
      this.logStep('Updated performance baseline', 'success');
    }
    
    this.logStep(`Report saved to ${reportFile}`, 'success');
    
    return reportData;
  }

  formatValue(value, unit) {
    switch (unit) {
      case 'bytes':
        if (value > 1024 * 1024) {
          return `${Math.round(value / 1024 / 1024 * 100) / 100}MB`;
        } else if (value > 1024) {
          return `${Math.round(value / 1024 * 100) / 100}KB`;
        }
        return `${value}B`;
      case 'ms':
        if (value > 1000) {
          return `${Math.round(value / 1000 * 100) / 100}s`;
        }
        return `${value}ms`;
      default:
        return value.toString();
    }
  }

  saveCurrentAsBaseline() {
    const baselineFile = path.join(this.baselineDir, 'latest-baseline.json');
    const archiveFile = path.join(this.baselineDir, `baseline-${Date.now()}.json`);
    
    // Archive current baseline if it exists
    if (fs.existsSync(baselineFile)) {
      fs.copyFileSync(baselineFile, archiveFile);
    }
    
    // Save current metrics as new baseline
    fs.writeFileSync(baselineFile, JSON.stringify(this.currentMetrics, null, 2));
  }

  hasRegressions() {
    return this.regressions.length > 0;
  }

  // Performance trend analysis
  async analyzeTrends() {
    this.logHeader('Performance Trend Analysis');
    
    const trendData = this.loadHistoricalData();
    
    if (trendData.length < 3) {
      this.logStep('Insufficient data for trend analysis', 'warning');
      return;
    }
    
    // Analyze trends for key metrics
    const metrics = ['testExecution.duration', 'bundle.total', 'build.duration'];
    
    metrics.forEach(metricPath => {
      const trend = this.calculateTrend(trendData, metricPath);
      if (trend) {
        this.logStep(`${metricPath}: ${trend.direction} trend (${trend.changeRate}% per week)`, 
                     trend.direction === 'improving' ? 'success' : 'warning');
      }
    });
  }

  loadHistoricalData() {
    const files = fs.readdirSync(this.baselineDir)
      .filter(file => file.startsWith('baseline-'))
      .sort();
    
    return files.map(file => {
      try {
        const data = fs.readFileSync(path.join(this.baselineDir, file), 'utf8');
        return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }).filter(Boolean);
  }

  calculateTrend(data, metricPath) {
    const values = data.map(entry => {
      const value = metricPath.split('.').reduce((obj, key) => obj?.[key], entry);
      return value !== null && value !== undefined ? value : null;
    }).filter(v => v !== null);
    
    if (values.length < 3) return null;
    
    // Simple linear regression to detect trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgValue = sumY / n;
    const changeRate = (slope / avgValue) * 100;
    
    return {
      direction: slope < 0 ? 'improving' : 'degrading',
      changeRate: Math.round(Math.abs(changeRate) * 100) / 100
    };
  }
}

// CLI execution
if (require.main === module) {
  const detector = new PerformanceRegressionDetector();
  
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Performance Regression Detector

Usage: node scripts/performance-regression-detector.js [options]

Options:
  --help, -h          Show this help message
  --trends            Analyze performance trends over time
  --set-baseline      Set current metrics as new baseline
  --threshold <n>     Set custom regression threshold percentage

This script detects performance regressions by comparing current metrics
with historical baselines including:
- Test execution times
- Bundle sizes  
- Build times
- Memory usage
- Quality test performance

The detector integrates with our quality infrastructure to provide
continuous performance monitoring and regression detection.
`);
    process.exit(0);
  }
  
  if (args.includes('--trends')) {
    detector.analyzeTrends().then(() => {
      console.log('✅ Trend analysis completed');
    });
  } else if (args.includes('--set-baseline')) {
    detector.collectCurrentMetrics().then(() => {
      detector.saveCurrentAsBaseline();
      console.log('✅ Baseline updated');
    });
  } else {
    detector.runRegressionDetection().then(hasRegressions => {
      if (hasRegressions) {
        console.error('\n❌ Performance regressions detected!');
        process.exit(1);
      } else {
        console.log('\n✅ No performance regressions detected');
        process.exit(0);
      }
    }).catch(error => {
      console.error('Performance regression detection failed:', error);
      process.exit(1);
    });
  }
}

module.exports = { PerformanceRegressionDetector };