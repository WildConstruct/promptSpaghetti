# Performance Testing and Optimization Suite

This comprehensive performance testing and optimization suite provides tools for monitoring, testing, and optimizing the collaborative editing system's performance under various load conditions.

## 📋 Table of Contents

- [Overview](#overview)
- [Components](#components)
- [Quick Start](#quick-start)
- [CLI Usage](#cli-usage)
- [API Reference](#api-reference)
- [Test Scenarios](#test-scenarios)
- [Optimization Strategies](#optimization-strategies)
- [Monitoring and Metrics](#monitoring-and-metrics)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The performance suite consists of four main components:

1. **Performance Test Suite** - Simulates multiple users editing collaboratively
2. **Metrics Collector** - Collects and analyzes system performance metrics
3. **Performance Dashboard** - Real-time monitoring and visualization
4. **Performance Optimizer** - Automatic performance optimization strategies

## 🧩 Components

### PerformanceTestSuite

Simulates realistic collaborative editing scenarios with multiple concurrent users performing various operations like creating nodes, editing content, moving elements, and resolving conflicts.

### MetricsCollector

Continuously monitors system resources, WebSocket performance, and collaboration-specific metrics like conflict resolution time and synchronization latency.

### PerformanceDashboard

Provides real-time visualization of system health, active alerts, and performance trends through a web-based dashboard.

### PerformanceOptimizer

Automatically applies optimization strategies based on current performance metrics, including message batching, response caching, and connection throttling.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run basic health check
npm run perf:health

# Start performance monitoring
npm run perf:monitor

# Run load tests
npm run perf:test
```

### Basic Usage

```typescript
import { PerformanceSystem } from './performance';

// Initialize the complete system
const performanceSystem = new PerformanceSystem();

// Start monitoring
performanceSystem.start();

// Run performance assessment
const report = await performanceSystem.runPerformanceAssessment('ws://localhost:8000');
console.log('Performance Report:', report);

// Stop monitoring
performanceSystem.stop();
```

## 🖥️ CLI Usage

The performance CLI provides convenient commands for various testing scenarios:

### Health Check

```bash
# Quick system health check
npm run perf:health

# Health check with custom server
npm run perf:health -- --url ws://localhost:8001
```

### Load Testing

```bash
# Run standard test suite
npm run perf:test

# Run specific scenario
npm run perf:test -- --scenario medium_collaboration

# Custom test parameters
npm run perf:test -- --users 10 --duration 120000

# Stress test with increasing load
npm run perf:stress

# Endurance test (5 minutes)
npm run perf:test -- --endurance 5
```

### Monitoring

```bash
# Start real-time monitoring dashboard
npm run perf:monitor

# Metrics collection only (no dashboard)
npm run perf:monitor -- --metrics-only
```

### Optimization

```bash
# Get performance recommendations
npm run perf:optimize

# Run specific optimization strategy
npm run perf:optimize -- --strategy message_batching

# Enable automatic optimization
npm run perf:optimize -- --auto
```

### Reporting

```bash
# Generate HTML report (last 24 hours)
npm run perf:report

# Generate JSON report (last 12 hours)
npm run perf:report -- --format json --period 12

# Custom output file
npm run perf:report -- --output my-report.html
```

### Available Scenarios

```bash
# List all test scenarios
npx ts-node src/performance/performance-cli.ts scenarios
```

## 📊 Test Scenarios

### Predefined Scenarios

| Scenario               | Users | Duration | Ops/sec/user | Complexity | Description                    |
| ---------------------- | ----- | -------- | ------------ | ---------- | ------------------------------ |
| `light_editing`        | 2     | 1 min    | 0.5          | Simple     | Light collaborative editing    |
| `medium_collaboration` | 5     | 2 min    | 1.0          | Medium     | Medium intensity collaboration |
| `heavy_editing`        | 10    | 3 min    | 2.0          | Complex    | Heavy collaborative editing    |
| `stress_test`          | 25    | 5 min    | 3.0          | Enterprise | Maximum load stress test       |
| `conflict_heavy`       | 8     | 2 min    | 2.0          | Medium     | High conflict rate scenario    |

### Custom Scenarios

```typescript
import { TestScenario, OperationType, DocumentComplexity } from './PerformanceTestSuite';

const customScenario: TestScenario = {
  name: 'custom_test',
  description: 'Custom collaborative editing test',
  userCount: 15,
  duration: 180000, // 3 minutes
  operationRate: 1.5, // 1.5 operations per second per user
  operationTypes: [
    OperationType.CREATE_NODE,
    OperationType.UPDATE_NODE_PROPERTIES,
    OperationType.MOVE_NODE,
    OperationType.UPDATE_CURSOR,
  ],
  documentComplexity: DocumentComplexity.COMPLEX,
};
```

## ⚡ Optimization Strategies

### Built-in Strategies

| Strategy                 | Priority | Trigger            | Action                       | Description                |
| ------------------------ | -------- | ------------------ | ---------------------------- | -------------------------- |
| `message_batching`       | Medium   | Latency > 500ms    | Batch WebSocket messages     | Reduces network overhead   |
| `response_caching`       | Medium   | CPU > 70%          | Cache frequent responses     | Reduces computation load   |
| `connection_throttling`  | High     | CPU > 85%          | Limit new connections        | Prevents overload          |
| `message_compression`    | Low      | Latency > 2s       | Compress large messages      | Reduces bandwidth usage    |
| `message_prioritization` | Medium   | Latency > 1.5s     | Prioritize critical messages | Improves responsiveness    |
| `memory_cleanup`         | Critical | Memory > 85%       | Clean up and force GC        | Frees memory resources     |
| `conflict_optimization`  | High     | Conflict time > 3s | Batch conflict operations    | Speeds conflict resolution |

### Custom Optimization

```typescript
import { OptimizationStrategy } from './PerformanceOptimizer';

const customStrategy: OptimizationStrategy = {
  name: 'custom_optimization',
  description: 'Custom performance optimization',
  enabled: true,
  priority: 'high',
  triggerConditions: {
    latencyThreshold: 1000,
    connectionCountThreshold: 50,
  },
  actions: [
    {
      type: 'throttle',
      target: 'custom_operations',
      parameters: { maxRate: 10 },
      description: 'Throttle custom operations',
    },
  ],
};

optimizer.addStrategy(customStrategy);
```

## 📈 Monitoring and Metrics

### System Metrics

- CPU usage percentage
- Memory usage and heap statistics
- Network I/O statistics
- Process uptime and health

### WebSocket Metrics

- Connection count and rate
- Message latency and throughput
- Error rate and disconnection rate
- Bytes transferred

### Collaboration Metrics

- Conflict rate and resolution time
- Synchronization latency
- Operation rate and queue length
- Document size and complexity

### Health Scoring

Each system component receives a health score (0-100) based on:

- **Excellent (90-100)**: All metrics within optimal ranges
- **Good (75-89)**: Minor performance issues
- **Warning (50-74)**: Performance degradation detected
- **Critical (0-49)**: Immediate attention required

## 💡 Examples

### Basic Load Test

```typescript
import { LoadTestRunner } from './LoadTestRunner';

const runner = new LoadTestRunner();
const config = LoadTestRunner.createCollaborativeEditingTests('ws://localhost:8000')[0];

const result = await runner.runLoadTest(config);
console.log(`Success rate: ${result.summary.successRate}%`);
console.log(`Average latency: ${result.summary.averageLatency}ms`);
```

### Real-time Monitoring

```typescript
import { MetricsCollector, PerformanceDashboard } from './performance';

const collector = new MetricsCollector();
const dashboard = new PerformanceDashboard(collector);

collector.startCollection();
dashboard.start();

// Monitor for performance alerts
collector.on('alert_created', alert => {
  console.log(`⚠️ Performance alert: ${alert.description}`);
});
```

### Stress Testing

```typescript
import { LoadTestRunner } from './LoadTestRunner';

const runner = new LoadTestRunner();
const baseConfig = LoadTestRunner.createCollaborativeEditingTests('ws://localhost:8000')[0];

// Test from 5 to 100 users in steps of 10
const results = await runner.runStressTest(baseConfig, 100, 10);

// Find maximum sustainable user count
const maxUsers = results.findIndex(r => r.summary.successRate < 95);
console.log(`Maximum users: ${maxUsers * 10}`);
```

### Custom Metrics

```typescript
import { MetricsCollector } from './MetricsCollector';

const collector = new MetricsCollector();

// Record custom WebSocket metrics
collector.recordWebSocketMetrics({
  connectionCount: 25,
  messageLatency: 150,
  errorRate: 2.5,
  bytesTransferred: 50000,
});

// Record collaboration metrics
collector.recordCollaborationMetrics({
  conflictRate: 0.05,
  conflictResolutionTime: 800,
  synchronizationLatency: 200,
});
```

## 🔧 Troubleshooting

### Common Issues

**High CPU Usage**

- Enable connection throttling
- Implement message batching
- Check for infinite loops in event handlers

**Memory Leaks**

- Enable automatic memory cleanup
- Monitor for disconnected user sessions
- Clear old cache entries regularly

**High Latency**

- Enable message compression
- Implement response caching
- Check network conditions

**Connection Issues**

- Verify WebSocket server is running
- Check firewall settings
- Validate server URL format

### Performance Thresholds

Default thresholds (configurable):

- CPU usage: 80%
- Memory usage: 85%
- Message latency: 1000ms
- Conflict resolution: 5000ms
- Error rate: 5%

### Debugging

Enable debug logging:

```typescript
// Set environment variable
process.env.DEBUG = 'performance:*';

// Or use console logging
const collector = new MetricsCollector({
  enableDebugLogging: true,
});
```

## 📝 Contributing

When adding new performance tests or optimizations:

1. Add comprehensive unit tests
2. Document performance characteristics
3. Include example usage
4. Update this README with new features

## 🔗 API Reference

For detailed API documentation, see the TypeScript interfaces and JSDoc comments in the source files:

- `PerformanceTestSuite.ts` - Load testing framework
- `MetricsCollector.ts` - Metrics collection and monitoring
- `PerformanceDashboard.ts` - Real-time dashboard
- `PerformanceOptimizer.ts` - Automatic optimization
- `LoadTestRunner.ts` - Comprehensive load testing

## 📄 License

This performance testing suite is part of the collaborative editing system and follows the same license terms.
