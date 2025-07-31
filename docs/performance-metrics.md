# Performance Metrics System - Epic 18

## Overview

The Performance Metrics System provides comprehensive measurement, monitoring, and analysis capabilities for the PromptScape Graph application. This system enables data-driven performance optimization across all application layers.

## Architecture Overview

### Core Components

1. **Performance Utilities** (`packages/core/utils/performance.ts`)
   - Execution timing and memory measurement
   - Performance tracking and aggregation
   - Global performance metrics collection

2. **Web Vitals Integration** (`packages/core/performance/WebVitalsIntegration.ts`)
   - Standardized Web Vitals measurement using official `web-vitals` package
   - Real-time browser performance monitoring
   - User experience metrics collection

3. **Performance Budget System** (`packages/core/performance/PerformanceBudget.ts`)
   - Performance thresholds and violation detection
   - Budget enforcement across multiple categories
   - Performance scoring and recommendations

4. **Monitoring Dashboard** (`packages/core/performance/PerformanceMonitoringDashboard.ts`)
   - Real-time performance monitoring
   - Alert system and automated optimization
   - Performance trend analysis

5. **Server Profiling** (`server/src/performance/PerformanceProfiler.ts`)
   - Comprehensive server-side performance tracking
   - System metrics collection (CPU, memory, disk, network)
   - Database and API performance monitoring

6. **Load Testing Integration** (`scripts/run-k6-tests.js`)
   - Automated K6 load testing with CI/CD integration
   - Multiple load testing scenarios
   - Performance threshold validation

## Performance Measurement Categories

### 1. Web Vitals (Client-Side)

**Core Web Vitals:**

- **FCP (First Contentful Paint)**: Time to first content render
- **LCP (Largest Contentful Paint)**: Time to largest content element
- **FID (First Input Delay)**: Input responsiveness
- **CLS (Cumulative Layout Shift)**: Visual stability
- **TTI (Time to Interactive)**: Full interactivity

**Thresholds:**

```typescript
{
  fcp: { good: 1800, poor: 3000 },      // milliseconds
  lcp: { good: 2500, poor: 4000 },      // milliseconds
  fid: { good: 100, poor: 300 },        // milliseconds
  cls: { good: 0.1, poor: 0.25 },       // score
  tti: { good: 3800, poor: 7300 }       // milliseconds
}
```

### 2. Runtime Performance

**Graph Execution:**

- Node execution timing
- Graph traversal performance
- Memory usage during execution
- Advanced node performance (Epic 7 nodes)

**React Component Performance:**

- Component render timing
- Re-render frequency
- Memory usage per component
- React profiler integration

### 3. API Performance

**Endpoint Metrics:**

- Response time per endpoint
- Request throughput
- Error rates
- Database query performance

**Graph Operations:**

- Graph execution time
- Preview generation time
- Validation performance
- Export/import operations

### 4. Memory Management

**Heap Monitoring:**

- Initial heap size
- Peak heap usage
- Steady-state memory
- Garbage collection frequency

**Memory Leak Detection:**

- Memory growth rate tracking
- Leak threshold monitoring
- Component cleanup validation

### 5. Network Performance

**Request Analysis:**

- Total request count
- Transfer size optimization
- Third-party request tracking
- Critical resource identification

**Bundle Analysis:**

- Main bundle size
- Vendor bundle size
- Chunk size optimization
- Code splitting effectiveness

### 6. Build Performance

**Compilation Metrics:**

- TypeScript compilation time
- Build duration
- Linting performance
- Test execution time

## Getting Started

### 1. Web Vitals Monitoring

```typescript
import { WebVitalsIntegration } from './packages/core/performance/WebVitalsIntegration';

// Initialize with custom configuration
const webVitals = new WebVitalsIntegration({
  enabled: true,
  reportAllChanges: false,
  samplingRate: 1.0,
  enableConsoleLogging: true,
  enableAnalytics: true,
  analyticsEndpoint: '/api/analytics/web-vitals',
});

// Start monitoring
webVitals.initialize();

// Get current metrics
const currentMetrics = await webVitals.getCurrentVitals();
console.log('Web Vitals:', currentMetrics);

// Listen for events
webVitals.on('poor-performance', metric => {
  console.warn(`Poor ${metric.name} performance:`, metric.value);
});
```

### 2. Performance Measurement

```typescript
import { measureExecution, PerformanceTracker } from './packages/core/utils/performance';

// Measure function execution
const { result, metrics } = await measureExecution(
  async () => {
    return await complexOperation();
  },
  { operation: 'complex-calculation' }
);

console.log(`Operation took ${metrics.duration}ms and used ${metrics.memory}MB`);

// Track multiple operations
const tracker = new PerformanceTracker();
tracker.addMetric('api-call', metrics);

// Get average performance
const avgMetrics = tracker.getAverageMetrics('api-call');
```

### 3. Performance Budget Monitoring

```typescript
import { PerformanceBudgetManager } from './packages/core/performance/PerformanceBudget';

const budgetManager = new PerformanceBudgetManager(budgetConfig);

// Check performance against budget
const snapshot = await capturePerformanceSnapshot();
const result = budgetManager.checkBudget(snapshot);

console.log(`Performance score: ${result.score}/100`);
console.log(`Violations: ${result.violations.length}`);
```

### 4. Real-Time Dashboard

```typescript
import { PerformanceMonitoringDashboard } from './packages/core/performance/PerformanceMonitoringDashboard';

const dashboard = new PerformanceMonitoringDashboard({
  updateInterval: 5000, // 5 seconds
  historyLimit: 200, // 200 snapshots
  autoOptimize: false, // Manual optimization
  alertThresholds: {
    violations: 3, // Alert after 3 violations
    score: 70, // Alert below score 70
  },
});

// Start monitoring
dashboard.startMonitoring();

// Get dashboard data
const data = dashboard.getDashboardData();
console.log('System status:', data.status);
console.log('Performance score:', data.score);

// Get optimization suggestions
const suggestions = dashboard.getOptimizationSuggestions();
console.log('Optimization suggestions:', suggestions);
```

## CLI Usage

### Performance Budget Checks

```bash
# Basic budget check
npm run perf:budget

# Strict mode (fail on any violations)
npm run perf:budget:strict

# JSON output for CI/CD
npm run perf:budget:json

# Custom configuration
npm run perf:budget:config
```

### Load Testing with K6

```bash
# Basic K6 test
npm run load:k6

# Specific scenarios
npm run load:k6:baseline     # Light load test
npm run load:k6:load         # Normal load test
npm run load:k6:stress       # Stress test
npm run load:k6:spike        # Spike test
npm run load:k6:breakpoint   # Find breaking point

# Run all scenarios
npm run load:k6:all
```

### Performance Monitoring

```bash
# Start real-time monitoring
npm run perf:monitor

# Capture performance snapshot
npm run perf:snapshot

# Run comprehensive performance tests
npm run perf:comprehensive
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Testing

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build

      - name: Start server
        run: pnpm dev:server &

      - name: Wait for server
        run: sleep 10

      - name: Performance budget check
        run: npm run perf:budget:json > performance-budget.json

      - name: K6 load testing
        run: npm run load:k6:baseline

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            performance-budget.json
            test-results/k6/
```

### Performance Gates

Configure performance gates to fail builds on regressions:

```bash
# Fail on critical/high violations
npm run perf:budget

# Fail on any violations
npm run perf:budget:strict

# Load testing with thresholds
npm run load:k6:load
```

## Performance Optimization Workflow

### 1. Baseline Measurement

```bash
# Capture current performance state
npm run perf:snapshot > baseline.json

# Run comprehensive performance tests
npm run perf:comprehensive
```

### 2. Identify Bottlenecks

```typescript
// Use dashboard to identify performance issues
const dashboard = new PerformanceMonitoringDashboard();
dashboard.startMonitoring();

// Monitor specific operations
const { result, metrics } = await measureExecution(() => {
  return suspiciousOperation();
});

if (metrics.duration > 1000) {
  console.warn('Slow operation detected:', metrics);
}
```

### 3. Apply Optimizations

```typescript
// Get optimization suggestions
const suggestions = dashboard.getOptimizationSuggestions();

// Apply automated optimizations
for (const suggestion of suggestions) {
  if (suggestion.implementation.automated) {
    await dashboard.applyOptimization(suggestion.id);
  }
}
```

### 4. Validate Improvements

```bash
# Compare against baseline
npm run perf:budget

# Run load tests to validate
npm run load:k6:load

# Monitor for regressions
npm run perf:monitor
```

## Advanced Features

### Custom Performance Observers

```typescript
// Create custom performance observer
const observer = webVitals.createPerformanceObserver(['navigation', 'resource', 'paint'], entries => {
  entries.forEach(entry => {
    console.log(`${entry.entryType}: ${entry.name} took ${entry.duration}ms`);
  });
});
```

### Memory Profiling

```typescript
// Monitor memory usage
const memoryObserver = setInterval(() => {
  const memory = performance.memory;
  console.log({
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
  });
}, 5000);
```

### Server Performance Monitoring

```typescript
import { PerformanceProfiler } from './server/src/performance/PerformanceProfiler';

const profiler = new PerformanceProfiler({
  monitoringInterval: 5000,
  enableGCTracking: true,
  alertThresholds: {
    cpuUsage: 80,
    memoryUsage: 80,
    responseTime: 1000,
  },
});

profiler.startMonitoring();
```

## Troubleshooting

### Common Issues

1. **Web Vitals Not Collecting**
   - Ensure running in browser environment
   - Check sampling rate configuration
   - Verify page visibility state

2. **High Memory Usage**
   - Enable memory profiling
   - Check for memory leaks in components
   - Monitor garbage collection patterns

3. **Slow API Performance**
   - Enable API profiling
   - Check database query performance
   - Monitor server resource usage

4. **K6 Tests Failing**
   - Verify server is running
   - Check K6 installation
   - Review test thresholds

### Debug Mode

Enable detailed logging:

```bash
DEBUG=performance* npm run perf:monitor
```

## Best Practices

1. **Continuous Monitoring**
   - Monitor performance continuously in production
   - Set up alerts for critical regressions
   - Track performance trends over time

2. **Performance Budget Discipline**
   - Set realistic but challenging budgets
   - Review and update budgets regularly
   - Fail builds on budget violations

3. **Load Testing Strategy**
   - Test under realistic load conditions
   - Include various user scenarios
   - Monitor both client and server metrics

4. **Optimization Approach**
   - Measure before optimizing
   - Focus on user-perceived performance
   - Validate optimizations with real metrics

## Related Documentation

- [Performance Budget System](./performance-budget.md)
- [Epic 18 Technical Debt Reduction](./epic18-technical-debt.md)
- [Build Optimization Guide](./build-optimization.md)
- [Testing Strategy](./testing-strategy.md)
