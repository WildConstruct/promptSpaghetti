# Performance Profiling System

Comprehensive performance monitoring and profiling system for both server-side and client-side performance analysis under load conditions.

**Task:** T-1752989144295-168 - Profile server and client performance under load

## Overview

This system provides end-to-end performance monitoring capabilities including:

- **Server-side profiling** with CPU, memory, database, and application metrics
- **Client-side profiling** with render times, memory usage, and user interaction tracking
- **Load testing integration** for realistic performance analysis
- **Real-time monitoring dashboard** with live metrics visualization
- **Comprehensive reporting** with automated recommendations
- **Performance alerting** based on configurable thresholds

## Architecture

### Server Components

#### 1. Performance Profiler (`server/src/performance/PerformanceProfiler.ts`)

Core server-side profiling engine that collects:

- CPU usage and load averages
- Memory utilization (heap, RSS, external)
- Database connection metrics
- Application-level metrics (RPS, response time, error rate)
- System metrics (disk usage, file descriptors)
- Custom business metrics

#### 2. Performance Middleware (`server/src/middleware/performance-profiler-middleware.ts`)

Fastify plugin that automatically:

- Tracks all HTTP requests
- Measures response times
- Monitors error rates
- Provides profiling API endpoints
- Integrates with existing server infrastructure

#### 3. API Endpoints

- `POST /api/performance/start` - Start profiling
- `POST /api/performance/stop` - Stop profiling and generate report
- `GET /api/performance/stats` - Get current metrics
- `GET /api/performance/status` - Get profiling status
- `GET /api/performance/health` - Health check with performance data
- `POST /api/performance/metric` - Add custom metrics
- `POST /api/performance/client-report` - Receive client metrics

### Client Components

#### 1. Client Performance Profiler (`client/src/utils/clientPerformanceProfiler.ts`)

Browser-based profiling system that tracks:

- React component render times
- Memory usage (JS heap)
- Network request performance
- Web Vitals (FCP, LCP, FID, CLS, TTFB)
- User interactions and timing
- Custom application metrics

#### 2. React Integration (`client/src/hooks/usePerformanceProfiler.ts`)

React hooks for seamless integration:

- `usePerformanceProfiler` - Main profiling hook
- `withPerformanceTracking` - HOC for automatic tracking
- `useInteractionTracking` - User interaction monitoring
- `useAsyncOperationTracking` - Async operation timing
- `useMemoryTracking` - Component memory usage

#### 3. Performance Dashboard (`client/src/components/PerformanceDashboard.tsx`)

Real-time monitoring interface showing:

- Live server and client metrics
- Performance threshold indicators
- Historical trending
- Alert notifications
- Profiling controls

### Integration Components

#### 1. Load Testing Integration (`performance-test-runner.js`)

Orchestrator that combines:

- Load test execution with realistic traffic
- Simultaneous server and client profiling
- System health monitoring
- Comprehensive report generation

#### 2. Test Runner (`test-performance-profiling.js`)

Demonstration and validation system that:

- Tests all profiling components
- Validates API endpoints
- Generates sample reports
- Provides usage examples

## Usage

### Basic Server Profiling

```typescript
import { PerformanceProfiler } from './server/src/performance/PerformanceProfiler';

const profiler = new PerformanceProfiler({
  sampleInterval: 1000,
  alertThresholds: {
    cpuUsage: 80,
    memoryUsage: 85,
    responseTime: 2000,
    errorRate: 5,
  },
});

// Start profiling
await profiler.startProfiling();

// Your application code runs here...

// Stop and get results
const snapshots = await profiler.stopProfiling();
```

### Server Middleware Integration

```typescript
import { createPerformanceMiddleware } from './middleware/performance-profiler-middleware';

// Register middleware
await fastify.register(
  createPerformanceMiddleware({
    enabled: true,
    autoStartProfiling: true,
    trackAllRequests: true,
    excludeRoutes: ['/health', '/favicon.ico'],
  })
);

// Access profiler in routes
fastify.get('/custom-route', async (request, reply) => {
  const profiler = fastify.performanceProfiler;
  profiler.addCustomMetric('route_accessed', Date.now());
  return { success: true };
});
```

### React Component Profiling

```tsx
import { usePerformanceProfiler, withPerformanceTracking } from '../hooks/usePerformanceProfiler';

function MyComponent() {
  const { trackRender, trackInteraction, addCustomMetric } = usePerformanceProfiler({
    componentName: 'MyComponent',
    autoStart: true,
    alertOnSlowRender: true,
  });

  const handleClick = () => {
    const stopTimer = trackInteraction('button_click');
    // ... handle click logic
    stopTimer();
  };

  useEffect(() => {
    addCustomMetric('component_loaded', Date.now());
  }, []);

  return <button onClick={handleClick}>Click me</button>;
}

// Or use HOC for automatic tracking
export default withPerformanceTracking(MyComponent, {
  componentName: 'MyComponent',
  trackRenders: true,
  trackInteractions: true,
});
```

### Performance Dashboard Usage

```tsx
import PerformanceDashboard from '../components/PerformanceDashboard';

function App() {
  return (
    <div>
      {/* Other app components */}
      <PerformanceDashboard showServerMetrics={true} showClientMetrics={true} refreshInterval={2000} />
    </div>
  );
}
```

## Load Testing Integration

### Running Complete Performance Analysis

```bash
# Run comprehensive performance test
node performance-test-runner.js

# Run specific load tests with profiling
node load-tests/run-all-load-tests.js --parallel

# Test the profiling system
node test-performance-profiling.js
```

### Custom Load Test Configuration

```javascript
const { PerformanceTestOrchestrator } = require('./performance-test-runner');

const orchestrator = new PerformanceTestOrchestrator({
  server: {
    profileDuration: 300000, // 5 minutes
    alertThresholds: {
      cpuUsage: 75,
      memoryUsage: 80,
      responseTime: 1500,
      errorRate: 3,
    },
  },
  loadTests: [
    {
      name: 'Custom Load Test',
      script: './my-load-test.js',
      concurrency: 20,
      duration: 180000,
    },
  ],
});

orchestrator.runPerformanceTests();
```

## Configuration

### Server Configuration

```typescript
interface ProfilingConfig {
  sampleInterval: number; // Metrics collection interval (ms)
  databaseEnabled: boolean; // Include database metrics
  systemMetricsEnabled: boolean; // Include system-level metrics
  gcMetricsEnabled: boolean; // Include garbage collection metrics
  outputDirectory: string; // Report output location
  maxSnapshots: number; // Memory limit for snapshots
  alertThresholds: {
    cpuUsage: number; // CPU alert threshold (%)
    memoryUsage: number; // Memory alert threshold (%)
    responseTime: number; // Response time alert threshold (ms)
    errorRate: number; // Error rate alert threshold (%)
  };
}
```

### Client Configuration

```typescript
interface ClientProfilingConfig {
  sampleInterval: number; // Metrics collection interval (ms)
  trackRenderMetrics: boolean; // Track React render performance
  trackMemoryMetrics: boolean; // Track browser memory usage
  trackNetworkMetrics: boolean; // Track network request performance
  trackUserInteractions: boolean; // Track user interactions
  trackWebVitals: boolean; // Track Core Web Vitals
  maxSnapshots: number; // Memory limit for snapshots
  alertThresholds: {
    renderTime: number; // Render time alert threshold (ms)
    memoryUsage: number; // Memory alert threshold (%)
    responseTime: number; // Network response alert threshold (ms)
    layoutShift: number; // Layout shift alert threshold
  };
}
```

## Performance Metrics

### Server Metrics

| Metric          | Description           | Good    | Warning    | Critical |
| --------------- | --------------------- | ------- | ---------- | -------- |
| CPU Usage       | Processor utilization | < 50%   | 50-80%     | > 80%    |
| Memory Usage    | RAM utilization       | < 70%   | 70-85%     | > 85%    |
| Response Time   | HTTP response latency | < 200ms | 200-1000ms | > 1000ms |
| Error Rate      | HTTP error percentage | < 1%    | 1-5%       | > 5%     |
| Requests/Second | Throughput rate       | > 100   | 50-100     | < 50     |

### Client Metrics

| Metric       | Description               | Good    | Warning    | Critical |
| ------------ | ------------------------- | ------- | ---------- | -------- |
| Render Time  | Component render duration | < 16ms  | 16-33ms    | > 33ms   |
| Memory Usage | JS heap utilization       | < 70%   | 70-85%     | > 85%    |
| Network Time | Request response time     | < 500ms | 500-2000ms | > 2000ms |
| Layout Shift | CLS score                 | < 0.1   | 0.1-0.25   | > 0.25   |
| FCP          | First Contentful Paint    | < 1.8s  | 1.8-3s     | > 3s     |
| LCP          | Largest Contentful Paint  | < 2.5s  | 2.5-4s     | > 4s     |

## Alerting System

### Server Alerts

- High CPU usage detection
- Memory leak identification
- Response time degradation
- Error rate spikes
- Database performance issues

### Client Alerts

- Slow render detection
- Memory growth patterns
- Network performance issues
- Layout shift problems
- Core Web Vitals failures

### Alert Configuration

```typescript
profiler.on('performance_alert', alert => {
  console.warn('Performance Alert:', alert);

  // Integration examples:
  // - Send to Slack/Discord
  // - Log to monitoring service
  // - Trigger automated scaling
  // - Create support tickets
});
```

## Report Generation

### Automated Reports

The system generates comprehensive reports including:

- **Executive Summary** - High-level performance overview
- **Detailed Metrics** - Time-series data for all measurements
- **Performance Analysis** - Trend identification and bottleneck analysis
- **Recommendations** - Actionable optimization suggestions
- **Historical Comparison** - Performance trending over time

### Report Formats

- **JSON** - Raw data for programmatic analysis
- **HTML** - Interactive dashboard with charts
- **CSV** - Spreadsheet-compatible format
- **PDF** - Portable document for sharing (optional)

### Sample Report Structure

```json
{
  "metadata": {
    "testStartTime": "2024-01-15T10:00:00Z",
    "testEndTime": "2024-01-15T10:05:00Z",
    "duration": 300000,
    "configuration": {...}
  },
  "executiveSummary": {
    "overallGrade": "B",
    "testSuccessRate": 95.2,
    "systemStability": "stable",
    "criticalIssues": 0,
    "warnings": 2
  },
  "serverMetrics": {
    "averageCPU": 45.2,
    "peakMemory": 78.5,
    "averageResponseTime": 185,
    "errorRate": 1.2,
    "throughput": 125.3
  },
  "clientMetrics": {
    "averageRenderTime": 12.4,
    "memoryGrowth": 2.1,
    "networkLatency": 245,
    "coreWebVitals": {...}
  },
  "recommendations": [
    "Consider implementing response caching for /api/heavy-endpoint",
    "Optimize UserList component rendering with React.memo",
    "Monitor memory usage trend - potential leak detected"
  ]
}
```

## Best Practices

### Development

1. **Start Profiling Early** - Integrate profiling from the beginning of development
2. **Profile Continuously** - Run regular performance tests, not just before releases
3. **Set Realistic Thresholds** - Configure alerts based on your application's requirements
4. **Monitor Key Metrics** - Focus on metrics that impact user experience
5. **Test Under Load** - Always profile with realistic user loads

### Production

1. **Sampling Strategy** - Use appropriate sampling intervals to balance accuracy with overhead
2. **Resource Management** - Monitor profiling overhead and adjust collection frequency
3. **Data Retention** - Implement appropriate data retention policies for historical analysis
4. **Alert Fatigue** - Fine-tune thresholds to minimize false positives
5. **Performance Budget** - Set and enforce performance budgets for new features

### Optimization Workflow

1. **Baseline Measurement** - Establish current performance baselines
2. **Identify Bottlenecks** - Use profiling data to find specific issues
3. **Implement Changes** - Make targeted optimizations
4. **Measure Impact** - Verify improvements with before/after profiling
5. **Monitor Regression** - Continuously monitor for performance regressions

## Troubleshooting

### Common Issues

**Server profiling not starting:**

- Verify server is running and accessible
- Check API endpoints are properly registered
- Ensure sufficient permissions for file system access

**Client metrics not collecting:**

- Verify browser supports Performance API
- Check console for JavaScript errors
- Ensure profiler is properly initialized

**High profiling overhead:**

- Increase sample interval
- Disable unnecessary metric collection
- Reduce snapshot retention count

**Missing performance data:**

- Check network connectivity between client and server
- Verify API endpoints are accessible
- Review server logs for errors

### Debug Mode

Enable detailed logging:

```javascript
// Server-side
process.env.DEBUG = 'performance:*';

// Client-side
localStorage.setItem('performance-debug', 'true');
```

## Integration Examples

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Performance Testing
  run: |
    npm start &
    sleep 10
    node performance-test-runner.js
    if [ $? -ne 0 ]; then
      echo "Performance test failed"
      exit 1
    fi
```

### Monitoring Integration

```typescript
// Datadog integration example
profiler.on('snapshot_collected', snapshot => {
  dogstatsd.gauge('app.cpu_usage', snapshot.cpu.percentage);
  dogstatsd.gauge('app.memory_usage', snapshot.memory.heapUtilization);
  dogstatsd.gauge('app.response_time', snapshot.application.averageResponseTime);
});
```

## Future Enhancements

### Planned Features

- Machine learning-based anomaly detection
- Predictive performance modeling
- Advanced visualization and charting
- Multi-environment comparison
- Performance regression testing
- Custom dashboard builder

### Extensibility

- Plugin system for custom metrics
- Third-party integrations (APM tools)
- Custom alert channels
- Advanced reporting templates
- Performance testing automation

## Support

For questions, issues, or feature requests related to the performance profiling system:

1. **Documentation** - Review this comprehensive guide
2. **Code Examples** - Check `test-performance-profiling.js` for usage examples
3. **API Reference** - See endpoint documentation in middleware files
4. **Demo Application** - Run the test suite to see the system in action

The performance profiling system provides enterprise-grade monitoring capabilities to ensure optimal application performance under any load conditions.
