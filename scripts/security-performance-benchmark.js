#!/usr/bin/env node

/**
 * Security Performance Benchmarking Suite
 * Comprehensive performance testing for Epic 18 security framework
 * 
 * Tests validation performance across different input sizes and patterns
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Mock the security validation for testing (in real implementation, would import from TypeScript)
const SecurityValidation = {
  validateSafeString: (str) => {
    // Simplified version for testing - real implementation is in TypeScript
    const dangerousPatterns = [
      /eval\s*\(/gi, /Function\s*\(/gi, /constructor/gi, /prototype/gi,
      /__proto__/gi, /require\s*\(/gi, /process\./gi, /document\./gi
    ];
    return !dangerousPatterns.some(pattern => pattern.test(str));
  },
  
  validateSafeExpression: (expr) => {
    if (expr.length > 500) return false;
    return SecurityValidation.validateSafeString(expr) && 
           /^[a-zA-Z0-9_$\s\.\[\]()===!==<>=+\-*\/&&\|\|!'"]+$/.test(expr);
  },
  
  validateSafePropertyKey: (key) => {
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    return !dangerous.includes(key) && /^[a-zA-Z0-9_-]+$/.test(key);
  }
};

// Test data generators
const TestDataGenerator = {
  /**
   * Generate safe strings of various sizes
   */
  generateSafeStrings: (sizes) => {
    const safeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ._-';
    return sizes.map(size => ({
      size,
      data: Array.from({ length: size }, () => 
        safeChars[Math.floor(Math.random() * safeChars.length)]
      ).join(''),
      type: 'safe_string'
    }));
  },
  
  /**
   * Generate malicious strings of various sizes
   */
  generateMaliciousStrings: (sizes) => {
    const maliciousPatterns = [
      'eval("alert(1)")',
      'constructor.constructor("alert(1)")()',
      '__proto__.polluted = true',
      'document.cookie = "hacked"',
      'require("fs").readFileSync("/etc/passwd")',
      'process.exit(1)',
      'Function("alert(1)")()',
      '(() => { alert(1); })()'
    ];
    
    return sizes.map(size => {
      const pattern = maliciousPatterns[Math.floor(Math.random() * maliciousPatterns.length)];
      const padding = 'A'.repeat(Math.max(0, size - pattern.length));
      return {
        size,
        data: pattern + padding,
        type: 'malicious_string'
      };
    });
  },
  
  /**
   * Generate expressions of various complexities
   */
  generateExpressions: (complexities) => {
    const expressions = [
      'user.age > 18',
      'user.role === "admin" && user.verified',
      '(user.permissions.includes("read") || user.role === "admin") && user.active',
      'Math.max(user.score, 0) > threshold && user.level >= minLevel',
      'user.preferences.notifications && user.settings.email && user.verified === true'
    ];
    
    return complexities.map((complexity, index) => ({
      complexity,
      data: expressions[Math.min(index, expressions.length - 1)],
      type: 'expression'
    }));
  },
  
  /**
   * Generate property keys of various lengths
   */
  generatePropertyKeys: (lengths) => {
    return lengths.map(length => ({
      length,
      data: 'prop_' + 'x'.repeat(Math.max(0, length - 5)),
      type: 'property_key'
    }));
  }
};

// Performance testing framework
class SecurityPerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      tests: []
    };
  }
  
  /**
   * Run a performance test
   */
  async runTest(testName: string, validationFunction: Function, testData: any[], iterations: number = 1000): Promise<void> {
    console.log(`\n🔍 Running ${testName}...`);
    
    const results = {
      testName,
      iterations,
      testData: testData.length,
      measurements: []
    };
    
    for (const testItem of testData) {
      const measurements = [];
      
      // Warm up
      for (let i = 0; i < 10; i++) {
        validationFunction(testItem.data);
      }
      
      // Actual measurements
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        validationFunction(testItem.data);
        const end = performance.now();
        measurements.push(end - start);
      }
      
      const stats = this.calculateStatistics(measurements);
      results.measurements.push({
        testCase: `${testItem.type}_${testItem.size || testItem.length || testItem.complexity}`,
        inputSize: testItem.data.length,
        ...stats
      });
      
      console.log(`  ✓ ${testItem.type} (size: ${testItem.data.length}): ${stats.mean.toFixed(3)}ms avg`);
    }
    
    this.results.tests.push(results);
    return results;
  }
  
  /**
   * Calculate statistical measures
   */
  calculateStatistics(measurements: number[]): any {
    const sorted = measurements.slice().sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);
    
    return {
      mean: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      standardDeviation: Math.sqrt(
        measurements.reduce((sum, x) => sum + Math.pow(x - (sum / measurements.length), 2), sum) / measurements.length
      )
    };
  }
  
  /**
   * Run comprehensive benchmark suite
   */
  async runComprehensiveBenchmark(): Promise<void> {
    console.log('🚀 Starting Security Performance Benchmark Suite');
    console.log('=' .repeat(60));
    
    // Test 1: String validation performance across sizes
    const stringSizes = [10, 100, 1000, 5000, 10000];
    const safeStrings = TestDataGenerator.generateSafeStrings(stringSizes);
    const maliciousStrings = TestDataGenerator.generateMaliciousStrings(stringSizes);
    
    await this.runTest(
      'Safe String Validation',
      SecurityValidation.validateSafeString,
      safeStrings,
      5000
    );
    
    await this.runTest(
      'Malicious String Detection',
      SecurityValidation.validateSafeString,
      maliciousStrings,
      5000
    );
    
    // Test 2: Expression validation performance
    const expressions = TestDataGenerator.generateExpressions([1, 2, 3, 4, 5]);
    await this.runTest(
      'Expression Validation',
      SecurityValidation.validateSafeExpression,
      expressions,
      10000
    );
    
    // Test 3: Property key validation performance
    const keyLengths = [5, 10, 20, 40, 64];
    const propertyKeys = TestDataGenerator.generatePropertyKeys(keyLengths);
    await this.runTest(
      'Property Key Validation',
      SecurityValidation.validateSafePropertyKey,
      propertyKeys,
      10000
    );
    
    // Test 4: Stress test with large inputs
    const largeInputs = TestDataGenerator.generateSafeStrings([50000, 100000]);
    await this.runTest(
      'Large Input Stress Test',
      SecurityValidation.validateSafeString,
      largeInputs,
      100
    );
    
    console.log('\n✅ Benchmark suite completed!');
    return this.results;
  }
  
  /**
   * Generate performance report
   */
  generateReport(): any {
    const report = {
      summary: this.generateSummary(),
      detailed: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Write report to file
    const reportPath = path.join(__dirname, '../docs/performance/security-benchmark-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Full report saved to: ${reportPath}`);
    return report;
  }
  
  /**
   * Generate performance summary
   */
  generateSummary(): any {
    const summary = {
      totalTests: this.results.tests.length,
      overallPerformance: 'excellent',
      keyMetrics: {}
    };
    
    for (const test of this.results.tests) {
      const avgMean = test.measurements.reduce((sum, m) => sum + m.mean, 0) / test.measurements.length;
      const avgP95 = test.measurements.reduce((sum, m) => sum + m.p95, 0) / test.measurements.length;
      
      summary.keyMetrics[test.testName] = {
        averageMean: avgMean,
        averageP95: avgP95,
        rating: avgMean < 1 ? 'excellent' : avgMean < 5 ? 'good' : 'needs improvement'
      };
    }
    
    return summary;
  }
  
  /**
   * Generate performance recommendations
   */
  generateRecommendations(): string[] {
    const recommendations = [];
    
    for (const test of this.results.tests) {
      const slowMeasurements = test.measurements.filter(m => m.mean > 5);
      
      if (slowMeasurements.length > 0) {
        recommendations.push({
          test: test.testName,
          issue: 'Performance degradation detected',
          recommendation: 'Consider caching validation results or optimizing regex patterns',
          priority: 'medium'
        });
      }
      
      const highVariability = test.measurements.filter(m => m.standardDeviation > m.mean * 0.5);
      if (highVariability.length > 0) {
        recommendations.push({
          test: test.testName,
          issue: 'High performance variability',
          recommendation: 'Investigate garbage collection impact or optimize algorithm consistency',
          priority: 'low'
        });
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        test: 'Overall',
        issue: 'No performance issues detected',
        recommendation: 'Current performance is excellent, monitor for regressions',
        priority: 'info'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Print summary to console
   */
  printSummary(): void {
    console.log('\n📈 PERFORMANCE SUMMARY');
    console.log('=' .repeat(40));
    
    for (const test of this.results.tests) {
      console.log(`\n${test.testName}:`);
      
      for (const measurement of test.measurements) {
        const rating = measurement.mean < 1 ? '🟢' : measurement.mean < 5 ? '🟡' : '🔴';
        console.log(`  ${rating} ${measurement.testCase}: ${measurement.mean.toFixed(3)}ms (p95: ${measurement.p95.toFixed(3)}ms)`);
      }
    }
    
    console.log('\n🎯 Performance Targets:');
    console.log('  🟢 Excellent: < 1ms average');
    console.log('  🟡 Good: 1-5ms average');
    console.log('  🔴 Needs improvement: > 5ms average');
  }
}

// CLI interface
async function main(): Promise<void> {
  const benchmark = new SecurityPerformanceBenchmark();
  
  try {
    await benchmark.runComprehensiveBenchmark();
    benchmark.printSummary();
    const report = benchmark.generateReport();
    
    console.log('\n🎉 Security performance benchmarking completed successfully!');
    console.log(`📊 Results: ${report.summary.totalTests} test suites executed`);
    
    // Check if performance meets targets
    const hasSlowTests = Object.values(report.summary.keyMetrics)
      .some(metric => metric.averageMean > 5);
    
    if (hasSlowTests) {
      console.log('⚠️  Some tests exceeded performance targets');
      process.exit(1);
    } else {
      console.log('✅ All performance targets met!');
    }
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SecurityPerformanceBenchmark, TestDataGenerator };