# Performance Budget System - Epic 18

## Overview

The Performance Budget System provides comprehensive performance monitoring and enforcement for the PromptScape Graph application. It establishes performance thresholds across multiple dimensions and provides real-time monitoring with automated alerts.

## Features

- **Bundle Size Monitoring**: Track main, vendor, and chunk sizes with configurable budgets
- **Runtime Performance**: Monitor Web Vitals (FCP, LCP, FID, CLS, TTI)
- **API Performance**: Track graph execution, preview generation, and validation times
- **Memory Management**: Monitor heap usage and detect memory leaks
- **Network Optimization**: Track request counts and transfer sizes
- **Build Performance**: Monitor compilation and build times
- **Real-time Dashboard**: Live performance monitoring with alerts
- **CI/CD Integration**: Automated performance checks in build pipeline

## Quick Start

### 1. Run Performance Budget Check

```bash
# Basic check with default configuration
npm run perf:budget

# Strict mode (fail on any violations)
npm run perf:budget:strict

# JSON output for CI/CD integration
npm run perf:budget:json

# Custom configuration
npm run perf:budget:config
```

### 2. Start Performance Monitoring

```bash
# Start real-time monitoring
npm run perf:monitor

# Capture single performance snapshot
npm run perf:snapshot
```

## Configuration

### Default Budget Configuration

The system comes with sensible defaults in `packages/core/performance/PerformanceBudget.ts`:

```typescript
{
  bundles: {
    main: 250,      // 250KB main bundle
    vendor: 500,    // 500KB vendor bundle
    chunks: 100,    // 100KB max chunk size
    total: 1000     // 1MB total bundle size
  },
  runtime: {
    firstContentfulPaint: 1500,    // 1.5s FCP
    largestContentfulPaint: 2500,  // 2.5s LCP
    firstInputDelay: 100,          // 100ms FID
    cumulativeLayoutShift: 0.1,    // 0.1 CLS
    timeToInteractive: 3000        // 3s TTI
  },
  // ... additional categories
}
```

### Custom Configuration

Create a `performance-budget.json` file in your project root:

```bash
cp performance-budget.example.json performance-budget.json
# Edit the file to match your requirements
```

Or add configuration to your `package.json`:

```json
{
  "performanceBudget": {
    "bundles": {
      "main": 200,
      "vendor": 400
    }
  }
}
```

## Performance Budget Categories

### 1. Bundle Sizes
- **Main Bundle**: Core application code
- **Vendor Bundle**: Third-party dependencies  
- **Chunks**: Individual code chunks
- **Total**: Combined bundle size

### 2. Runtime Performance (Web Vitals)
- **FCP (First Contentful Paint)**: Time to first content
- **LCP (Largest Contentful Paint)**: Time to largest content
- **FID (First Input Delay)**: Input responsiveness
- **CLS (Cumulative Layout Shift)**: Visual stability
- **TTI (Time to Interactive)**: Full interactivity

### 3. API Performance
- **Graph Execution**: Time to execute graphs
- **Preview Generation**: Time to generate previews
- **Validation**: Graph validation time
- **Authentication**: Auth response time

### 4. Memory Management
- **Initial Heap**: Starting memory usage
- **Peak Heap**: Maximum memory usage
- **Steady State**: Normal operating memory
- **Leak Threshold**: Memory growth rate

### 5. Network Optimization
- **Request Count**: Total HTTP requests
- **Transfer Size**: Total bytes transferred
- **Third-party Requests**: External dependencies
- **Critical Resources**: Essential resources

### 6. Build Performance
- **Build Time**: Total build duration
- **TypeScript Check**: Type checking time
- **Linting**: Code quality check time
- **Test Execution**: Test suite duration

## Violation Severity Levels

The system categorizes violations by severity:

- **Critical**: >2x budget (25 point penalty)
- **High**: >1.5x budget (15 point penalty)
- **Medium**: >1.2x budget (10 point penalty)
- **Low**: >1x budget (5 point penalty)

## Performance Monitoring Dashboard

The real-time dashboard provides:

- **Live Metrics**: Current performance across all categories
- **Trend Analysis**: Historical performance tracking
- **Alert System**: Automated notifications for violations
- **Optimization Suggestions**: AI-powered performance recommendations
- **Score Tracking**: Overall performance score (0-100)

### Dashboard Events

```typescript
// Listen for performance events
dashboard.on('snapshot-captured', (snapshot, budgetResult) => {
  console.log(`Performance score: ${budgetResult.score}`);
});

dashboard.on('alert-created', (alert) => {
  console.log(`New alert: ${alert.title}`);
});

dashboard.on('optimization-applied', (suggestionId) => {
  console.log(`Applied optimization: ${suggestionId}`);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Performance Budget Check
  run: |
    npm run perf:budget:json > performance-results.json
    
- name: Upload Performance Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: performance-results.json
```

### Performance Gates

The system can be configured to fail builds on budget violations:

```bash
# Fail build on critical/high violations (default)
npm run perf:budget

# Fail build on any violations
npm run perf:budget:strict
```

## Optimization Suggestions

The system provides automated optimization suggestions:

### Bundle Optimization
- Code splitting strategies
- Dynamic import implementation
- Dependency auditing
- Tree shaking configuration

### Runtime Optimization
- Critical rendering path optimization
- Resource preloading
- Component memoization
- Memory cleanup strategies

### API Optimization
- Caching strategies
- Background processing
- Request batching
- Timeout handling

## Performance Metrics Collection

### Web Vitals Integration

For production monitoring, integrate with Web Vitals:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTI } from 'web-vitals';

// Collect and send metrics to dashboard
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTI(sendToAnalytics);
```

### Custom Metrics

Add custom performance metrics:

```typescript
import { measureExecution } from './packages/core/utils/performance';

const { result, metrics } = await measureExecution(async () => {
  return await complexOperation();
}, { operation: 'complex-calculation' });

// Metrics include duration, memory usage, and metadata
```

## Troubleshooting

### Common Issues

1. **No Build Directory Found**
   - Ensure your project builds to `dist`, `build`, `out`, or `public`
   - Run `npm run build` before performance checks

2. **TypeScript Errors**
   - Fix TypeScript compilation errors
   - Configure `tsconfig.json` properly

3. **Memory Monitoring**
   - Node.js environment required for memory metrics
   - Browser metrics require Web Vitals integration

### Debug Mode

Enable debug logging:

```bash
DEBUG=performance* npm run perf:budget
```

## Best Practices

1. **Set Realistic Budgets**: Start with current performance and gradually improve
2. **Monitor Trends**: Use dashboard for trend analysis rather than one-time checks
3. **Automate Monitoring**: Integrate with CI/CD for continuous monitoring
4. **Act on Violations**: Address budget violations promptly
5. **Regular Reviews**: Review and update budgets as the application evolves

## API Reference

### PerformanceBudgetManager

```typescript
const manager = new PerformanceBudgetManager(config);
const result = manager.checkBudget(snapshot);
```

### PerformanceMonitoringDashboard

```typescript
const dashboard = new PerformanceMonitoringDashboard(config);
dashboard.startMonitoring();
const data = dashboard.getDashboardData();
const suggestions = dashboard.getOptimizationSuggestions();
```

### Performance Utilities

```typescript
import { measureExecution, PerformanceTimer } from './packages/core/utils/performance';

const timer = new PerformanceTimer();
// ... operation
const metrics = timer.stop();
```

## Related Documentation

- [Epic 18 Technical Debt Reduction](./epic18-technical-debt.md)
- [Performance Testing Strategy](./performance-testing.md)
- [Build Optimization Guide](./build-optimization.md)