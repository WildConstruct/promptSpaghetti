# Performance Testing Methodology and Usage Guide

## Epic 18 - Technical Debt & Refactoring

**Task:** E18-1753114562178-E4CD83 - Implement performance tests

---

## Table of Contents

1. [Overview](#overview)
2. [Performance Testing Architecture](#performance-testing-architecture)
3. [Test Suites](#test-suites)
4. [Running Performance Tests](#running-performance-tests)
5. [Performance Monitoring](#performance-monitoring)
6. [Interpreting Results](#interpreting-results)
7. [Performance Thresholds](#performance-thresholds)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [CI/CD Integration](#cicd-integration)

---

## Overview

This comprehensive performance testing system provides multi-layered performance validation for the PromptScape application, covering:

- **Core Engine Performance**: Runtime execution, memory usage, and deterministic behavior
- **Graph Execution Benchmarks**: Multi-seed testing and scalability analysis
- **Memory Optimization**: Leak detection, GC efficiency, and memory scaling
- **API Load Testing**: Endpoint performance under realistic load conditions
- **Real-time Monitoring**: Continuous performance tracking and alerting

### Performance Testing Goals

1. **Ensure System Reliability**: Validate performance under normal and stress conditions
2. **Detect Regressions**: Catch performance degradations before deployment
3. **Optimize Resource Usage**: Identify memory leaks and inefficient algorithms
4. **Validate Scalability**: Test system behavior with increasing load
5. **Monitor Trends**: Track performance metrics over time

---

## Performance Testing Architecture

```
📊 Performance Testing System
├── Core Engine Tests (tests/performance/core-engine-performance.test.ts)
│   ├── Simple execution benchmarks
│   ├── Complex graph performance
│   ├── Advanced node testing
│   └── Memory scaling analysis
├── Graph Execution Benchmarks (tests/performance/graph-execution-benchmarks.test.ts)
│   ├── Multi-seed determinism
│   ├── Graph complexity scaling
│   └── Performance trend analysis
├── Memory Optimization Tests (tests/performance/memory-optimization.test.ts)
│   ├── Leak detection
│   ├── GC efficiency measurement
│   └── Memory pressure testing
├── API Load Testing (tests/performance/api-load-testing.test.ts)
│   ├── Endpoint-specific load tests
│   ├── Realistic user scenarios
│   └── Concurrent request handling
└── Performance Monitoring (tests/performance/performance-monitoring-dashboard.ts)
    ├── Real-time metrics collection
    ├── Threshold-based alerting
    └── Automated reporting
```

### Integration with Existing Infrastructure

The performance testing system integrates with existing components:

- **Core Runtime**: Leverages `packages/core/runtime/` for engine testing
- **Load Test Framework**: Extends `load-tests/LoadTestFramework.js`
- **Analytics System**: Integrates with server analytics for metrics collection
- **WebSocket Server**: Tests real-time collaboration performance

---

## Test Suites

### 1. Core Engine Performance Tests

**Location**: `tests/performance/core-engine-performance.test.ts`

**Purpose**: Validate core runtime engine performance and memory usage

**Test Categories**:

- **Simple Execution**: Basic node execution performance (target: >1000 ops/sec)
- **Complex Graphs**: Multi-node graph execution (target: >100 ops/sec)
- **Advanced Nodes**: WeightedAdvanced, Conditional, Sequential, Markov (target: >50 ops/sec)
- **Memory Scaling**: Memory usage patterns with increasing graph size
- **Deterministic Consistency**: Verify same seed produces same output

**Key Metrics**:

- Operations per second
- Memory usage (MB)
- Execution time (ms)
- Memory growth patterns
- Determinism score

### 2. Graph Execution Benchmarks

**Location**: `tests/performance/graph-execution-benchmarks.test.ts`

**Purpose**: Comprehensive testing of graph execution across multiple seeds and complexities

**Test Categories**:

- **Linear Graphs**: Sequential node execution
- **Branching Graphs**: Multiple execution paths
- **Complex Graphs**: All node types with variables
- **Seed Variation**: Different random seeds testing
- **Scaling Analysis**: Performance vs. graph size

**Key Metrics**:

- Average execution time
- Throughput (executions/second)
- Determinism score (95%+ expected)
- Memory efficiency
- Scaling characteristics

### 3. Memory Optimization Tests

**Location**: `tests/performance/memory-optimization.test.ts`

**Purpose**: Detect memory leaks and validate memory management

**Test Categories**:

- **Repeated Executions**: Long-running execution cycles
- **Context Scaling**: Memory usage with large execution contexts
- **Advanced Node Memory**: Stateful node memory management
- **Leak Detection**: Long-running scenarios with trend analysis
- **Stress Testing**: High-memory-pressure scenarios

**Key Metrics**:

- Memory growth (MB)
- Garbage collection efficiency
- Memory leak detection
- Peak memory usage
- Memory scaling ratios

### 4. API Load Testing

**Location**: `tests/performance/api-load-testing.test.ts`

**Purpose**: Validate API performance under realistic load conditions

**Test Scenarios**:

- **Preview Endpoint**: Graph execution requests
- **Export Endpoint**: Graph-to-bundle conversion
- **Health Endpoints**: System status checks
- **Analytics Endpoints**: Metrics and dashboard data
- **Workspace Endpoints**: Project and workflow operations
- **Security Endpoints**: Authentication and audit features
- **Realistic User Scenarios**: Mixed workflow testing

**Key Metrics**:

- Requests per second (RPS)
- Response time (average, P95, P99)
- Success rate (%)
- Error rates and types
- Concurrent user handling

### 5. Performance Monitoring Dashboard

**Location**: `tests/performance/performance-monitoring-dashboard.ts`

**Purpose**: Real-time performance monitoring and alerting

**Features**:

- **Metrics Collection**: Automated performance data gathering
- **Threshold Monitoring**: Configurable performance thresholds
- **Alert Generation**: Automated alerts for performance issues
- **Trend Analysis**: Performance trend detection and analysis
- **Report Generation**: HTML, JSON, and Markdown reports
- **Health Scoring**: Overall system health assessment

---

## Running Performance Tests

### Quick Start

```bash
# Run all performance tests
npm run test:performance

# Run specific test suites
npm run test -- tests/performance/core-engine-performance.test.ts
npm run test -- tests/performance/graph-execution-benchmarks.test.ts
npm run test -- tests/performance/memory-optimization.test.ts
npm run test -- tests/performance/api-load-testing.test.ts

# Run with coverage
npm run test:performance -- --coverage

# Enable garbage collection for memory tests
node --expose-gc node_modules/.bin/jest tests/performance/memory-optimization.test.ts
```

### Environment Variables

```bash
# API testing configuration
export API_BASE_URL=http://localhost:8000
export PERF_CONCURRENCY=10
export PERF_DURATION=60000
export PERF_OUTPUT_DIR=./performance-results

# Memory testing configuration
export MEMORY_TEST_ITERATIONS=1000
export MEMORY_RETENTION_DAYS=30

# Monitoring configuration
export PERFORMANCE_MONITORING_ENABLED=true
export PERF_ALERT_WEBHOOK=https://hooks.slack.com/...
```

### Test Configuration

Each test suite supports configuration options:

```javascript
// Core Engine Performance Tests
const coreEngineConfig = {
  simpleExecutionIterations: 1000,
  complexGraphNodeCount: 100,
  advancedNodeIterations: 500,
  memoryScalingSteps: [10, 50, 100, 500, 1000]
};

// Graph Execution Benchmarks
const graphBenchmarkConfig = {
  seeds: [12345, 67890, 11111, 22222, 33333],
  iterations: 10,
  expectedPerformance: {
    maxExecutionTime: 50,
    maxMemoryUsage: 20,
    minThroughput: 100
  }
};

// API Load Testing
const apiLoadConfig = {
  baseUrl: 'http://localhost:8000',
  concurrency: 15,
  duration: 45000,
  expectedPerformance: {
    maxResponseTime: 2000,
    minSuccessRate: 95,
    minThroughput: 10
  }
};
```

---

## Performance Monitoring

### Real-time Monitoring

The Performance Monitoring Dashboard provides continuous monitoring:

```javascript
import { PerformanceMonitoringDashboard } from './tests/performance/performance-monitoring-dashboard';

// Start monitoring
const dashboard = new PerformanceMonitoringDashboard({
  enableRealTimeUpdates: true,
  updateIntervalMs: 5000,
  enableNotifications: true,
  notificationWebhook: 'https://hooks.slack.com/...'
});

// Record metrics
dashboard.recordMetric('core-engine', 'execution_time', 150, 'ms');
dashboard.recordMetric('api', 'response_time', 800, 'ms');

// Generate reports
await dashboard.generateReport('html');
```

### Metrics Collection

Key performance metrics tracked:

```yaml
Core Engine Metrics:
  - execution_time (ms)
  - memory_usage (MB)
  - operations_per_second (ops/sec)
  - determinism_score (0-1)
  - memory_leak_detected (boolean)

API Metrics:
  - response_time (ms)
  - requests_per_second (RPS)
  - success_rate (%)
  - error_count (count)
  - concurrent_users (count)

Memory Metrics:
  - heap_used (MB)
  - heap_total (MB)
  - gc_efficiency (0-1)
  - memory_growth (MB)
  - peak_memory (MB)

System Metrics:
  - cpu_usage (%)
  - active_connections (count)
  - throughput (ops/sec)
  - availability (%)
```

### Alert Configuration

Configure performance thresholds:

```javascript
const thresholds = [
  {
    metric: 'engine.execution_time',
    operator: 'gt',
    value: 2000,
    severity: 'error',
    description: 'Engine execution time exceeds 2 seconds'
  },
  {
    metric: 'api.success_rate',
    operator: 'lt',
    value: 95,
    severity: 'warning',
    description: 'API success rate below 95%'
  },
  {
    metric: 'memory.leak_detected',
    operator: 'eq',
    value: 1,
    severity: 'critical',
    description: 'Memory leak detected'
  }
];
```

---

## Interpreting Results

### Performance Test Results

**Core Engine Performance Results**:

```
✅ Simple Node Execution
   Execution Time: 25.34ms
   Memory Used: 8.42MB
   Operations/sec: 1247
   Avg Node Time: 0.025ms

✅ Complex Graph Execution (100 nodes)
   Execution Time: 245.67ms
   Memory Used: 45.23MB
   Operations/sec: 407
   Memory Scaling Ratio: 1.8x
```

**API Load Testing Results**:

```
✅ Preview Endpoint Load Test
   Requests/sec: 15.2
   Success Rate: 98.5%
   Avg Response: 850ms
   P95 Response: 1200ms
   P99 Response: 1800ms
   Total Requests: 456
```

**Memory Optimization Results**:

```
✅ Long-Running Memory Leak Detection
   Memory Growth: 12.5MB
   Memory Leak: NONE
   GC Efficiency: 67.3%
   Memory Trend: 0.15 (stable)
```

### Health Score Interpretation

**Overall Health Scores**:

- **95-100**: Excellent performance, no issues
- **85-94**: Good performance, minor optimizations possible
- **70-84**: Fair performance, some issues need attention
- **50-69**: Poor performance, significant problems
- **0-49**: Critical issues, immediate action required

### Trend Analysis

**Performance Trends**:

- **Improving**: Metrics trending better over time
- **Degrading**: Performance declining, needs investigation
- **Stable**: Consistent performance within acceptable range

**Change Percentage**:

- **±5%**: Normal variation, no action needed
- **±5-15%**: Monitor closely, may need investigation
- **±15%+**: Significant change, requires immediate review

---

## Performance Thresholds

### Default Thresholds

| Metric                | Warning | Error | Critical | Unit    |
| --------------------- | ------- | ----- | -------- | ------- |
| Engine Execution Time | >1000   | >2000 | >5000    | ms      |
| Memory Usage          | >100    | >200  | >500     | MB      |
| API Response Time     | >2000   | >5000 | >10000   | ms      |
| Success Rate          | <95     | <90   | <80      | %       |
| Operations/sec        | <100    | <50   | <10      | ops/sec |
| Memory Leak           | N/A     | N/A   | Detected | boolean |
| GC Efficiency         | <30     | <20   | <10      | %       |

### Customizing Thresholds

```javascript
// Environment-specific thresholds
const developmentThresholds = {
  'engine.execution_time': { warning: 2000, error: 5000 },
  'api.response_time': { warning: 3000, error: 8000 },
  'memory.usage': { warning: 150, error: 300 }
};

const productionThresholds = {
  'engine.execution_time': { warning: 500, error: 1000 },
  'api.response_time': { warning: 1000, error: 2000 },
  'memory.usage': { warning: 50, error: 100 }
};
```

---

## Troubleshooting

### Common Performance Issues

#### Slow Engine Execution

**Symptoms**:

- Engine execution time >2000ms
- Low operations per second

**Causes & Solutions**:

- **Complex Graphs**: Simplify graph structure, optimize node connections
- **Memory Pressure**: Check for memory leaks, optimize variable usage
- **Inefficient Algorithms**: Profile node execution, optimize hot paths

#### High Memory Usage

**Symptoms**:

- Memory usage >200MB
- Memory growth over time
- GC efficiency <30%

**Causes & Solutions**:

- **Memory Leaks**: Use memory profiler, check for unreleased references
- **Large Contexts**: Optimize variable storage, implement context cleanup
- **Inefficient Data Structures**: Review data structures, use more efficient alternatives

#### API Performance Issues

**Symptoms**:

- Response times >2000ms
- Low success rates
- High error rates

**Causes & Solutions**:

- **Database Bottlenecks**: Optimize queries, add indexing
- **Network Issues**: Check network configuration, implement caching
- **Resource Contention**: Scale infrastructure, optimize resource allocation

#### Memory Leaks

**Symptoms**:

- Continuous memory growth
- GC inefficiency
- Out of memory errors

**Debugging Steps**:

1. **Enable GC Logging**: `node --expose-gc --trace-gc`
2. **Use Memory Profiler**: Chrome DevTools, clinic.js
3. **Analyze Heap Dumps**: Identify retained objects
4. **Review Code**: Check for event listener leaks, closure issues

### Performance Debugging Tools

```bash
# Enable detailed performance logging
NODE_ENV=development npm run test:performance -- --verbose

# Memory profiling
node --inspect --expose-gc node_modules/.bin/jest tests/performance/memory-optimization.test.ts

# CPU profiling
node --prof node_modules/.bin/jest tests/performance/core-engine-performance.test.ts
node --prof-process isolate-*.log > profile.txt

# Load testing with detailed output
npm run test -- tests/performance/api-load-testing.test.ts --verbose --detectOpenHandles
```

---

## Best Practices

### Performance Testing Best Practices

1. **Consistent Environment**:
   - Use dedicated performance testing environment
   - Minimize background processes
   - Use consistent hardware specifications

2. **Baseline Establishment**:
   - Establish performance baselines before changes
   - Track metrics over time
   - Compare against historical data

3. **Test Data Management**:
   - Use consistent test data sets
   - Implement deterministic test scenarios
   - Clean up test data between runs

4. **Load Testing Guidelines**:
   - Start with realistic user scenarios
   - Gradually increase load to find breaking points
   - Test both steady-state and burst scenarios

5. **Memory Testing Protocols**:
   - Enable garbage collection for accurate measurements
   - Run tests for sufficient duration to detect leaks
   - Monitor both heap and non-heap memory

### Code Performance Guidelines

1. **Algorithm Optimization**:
   - Profile hot paths regularly
   - Use efficient data structures
   - Implement caching where appropriate

2. **Memory Management**:
   - Minimize object creation in hot paths
   - Remove event listeners properly
   - Use weak references where appropriate

3. **Asynchronous Operations**:
   - Avoid blocking operations
   - Implement proper error handling
   - Use connection pooling for external resources

### Monitoring Best Practices

1. **Metric Selection**:
   - Focus on user-impacting metrics
   - Include both leading and lagging indicators
   - Monitor resource utilization

2. **Alert Configuration**:
   - Set meaningful thresholds
   - Avoid alert fatigue
   - Include context in alert messages

3. **Report Generation**:
   - Generate regular performance reports
   - Include trend analysis
   - Provide actionable recommendations

---

## CI/CD Integration

### Automated Performance Testing

```yaml
# GitHub Actions example
name: Performance Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start test server
        run: npm run dev &

      - name: Wait for server
        run: npx wait-on http://localhost:8000/health

      - name: Run performance tests
        run: |
          npm run test:performance -- --ci --coverage
          npm run test -- tests/performance/ --reporters=default --reporters=jest-junit
        env:
          NODE_OPTIONS: '--expose-gc --max-old-space-size=4096'
          API_BASE_URL: http://localhost:8000

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            performance-test-results/
            coverage/

      - name: Performance regression check
        run: |
          node scripts/check-performance-regression.js \
            --current-results performance-test-results/ \
            --baseline-results baseline-performance/ \
            --threshold 15
```

### Performance Regression Detection

```javascript
// scripts/check-performance-regression.js
const performanceRegression = {
  thresholds: {
    executionTime: 0.15, // 15% increase is a regression
    memoryUsage: 0.2, // 20% increase is a regression
    throughput: -0.1, // 10% decrease is a regression
    responseTime: 0.15 // 15% increase is a regression
  },

  async checkRegression(currentResults, baselineResults) {
    // Compare current results against baseline
    // Generate regression report
    // Fail CI if significant regressions detected
  }
};
```

### Performance Budgets

```javascript
// performance-budget.json
{
  "budgets": {
    "core-engine": {
      "executionTime": "< 1000ms",
      "memoryUsage": "< 100MB",
      "operationsPerSecond": "> 500"
    },
    "api-endpoints": {
      "responseTime": "< 2000ms",
      "successRate": "> 95%",
      "requestsPerSecond": "> 20"
    },
    "memory-optimization": {
      "memoryLeaks": "= 0",
      "gcEfficiency": "> 30%",
      "peakMemory": "< 300MB"
    }
  }
}
```

### Quality Gates

```bash
# Performance quality gate script
#!/bin/bash
set -e

echo "🔍 Running performance quality gates..."

# Run performance tests
npm run test:performance

# Check performance budgets
node scripts/check-performance-budget.js

# Analyze trends
node scripts/analyze-performance-trends.js

# Generate performance report
node scripts/generate-performance-report.js

echo "✅ Performance quality gates passed!"
```

---

## Conclusion

This comprehensive performance testing system provides:

- **Multi-layered Testing**: Core engine, API, memory, and integration testing
- **Real-time Monitoring**: Continuous performance tracking and alerting
- **Trend Analysis**: Historical performance data and regression detection
- **Automated Reporting**: Detailed performance reports and recommendations
- **CI/CD Integration**: Automated performance validation in deployment pipelines

By following this guide and utilizing the performance testing infrastructure, you can:

- Maintain high performance standards
- Detect and resolve performance issues early
- Scale your application confidently
- Provide optimal user experience

For additional support or questions, refer to the test files in `tests/performance/` or consult the development team.

---

**Epic 18 Task Completion**: ✅ E18-1753114562178-E4CD83 - Implement performance tests

**Performance Testing System Status**: **COMPLETE** with comprehensive test coverage, monitoring, and documentation.
