# Epic 1 Monitoring and Analytics Setup

## Overview

This document describes the comprehensive monitoring and analytics infrastructure implemented for Epic 1 - Prompt Spaghetti MVP. The monitoring system provides real-time insights into system health, performance metrics, error tracking, and user analytics.

## Architecture

### Core Components

1. **MonitoringService** (`packages/core/monitoring/MonitoringService.ts`)
   - Core metrics collection and storage
   - Alert threshold management
   - Health check system
   - Performance tracking decorators

2. **APMService** (`packages/core/monitoring/APMService.ts`)
   - Application Performance Monitoring
   - Transaction and span tracking
   - Performance baseline monitoring
   - Uptime monitoring
   - Workflow metrics

3. **WorkflowMonitor** (`packages/core/monitoring/WorkflowMonitor.ts`)
   - Critical workflow tracking
   - Step-by-step timing
   - Success/failure tracking
   - Custom workflow monitoring

4. **MonitoringDashboard** (`packages/core/monitoring/MonitoringDashboard.tsx`)
   - Real-time visualization
   - Metric cards and alerts
   - Performance baselines
   - Uptime status display

## Key Features

### 1. Performance Baselines

The system monitors key performance indicators against established baselines:

- **Page Load Time**: Target < 2s (Warning: 2-3s, Critical: >3s)
- **Graph Execution**: Target < 1s for 20 variations
- **API Response Time**: Target < 200ms (p95)
- **Error Rate**: Target < 0.1%
- **Memory Usage**: Target < 512MB

### 2. Uptime Monitoring

Automated health checks for critical endpoints:

```typescript
// API Health Check
- Endpoint: /health
- Interval: 30 seconds
- Expected Status: 200

// Preview Endpoint
- Endpoint: /preview
- Interval: 60 seconds
- Expected Status: 200, 400

// Frontend App
- Endpoint: http://localhost:3000
- Interval: 60 seconds
- Expected Status: 200
```

### 3. Critical Workflow Monitoring

Pre-configured workflows for Epic 1:

- **Graph Creation Workflow**
  - Load Editor
  - Parse Prompt
  - Generate Nodes
  - Layout Graph

- **Inline Editing Workflow**
  - Enter Edit Mode (Target: <100ms)
  - Update Content
  - Update Preview (Target: <300ms)

- **Graph Execution Workflow**
  - Validate Graph
  - Execute Nodes
  - Generate Output

- **File Save Workflow**
  - Validate Data
  - Serialize Graph
  - Write to Storage

### 4. Error Tracking

Comprehensive error tracking with context:

- Automatic capture of uncaught exceptions
- Unhandled promise rejections
- Custom error tracking with metadata
- Error rate calculation
- Top error reporting

### 5. User Analytics

Event tracking for user behavior:

- Page views and navigation
- Feature flag evaluations
- User interactions (clicks, inputs)
- Funnel conversion tracking
- Session tracking

### 6. Core Web Vitals

Browser performance metrics:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- DOM Ready Time

## Usage

### Basic Setup

```typescript
import { startMonitoring } from '@core/monitoring';

// Initialize all monitoring systems
startMonitoring();
```

### Recording Metrics

```typescript
import { monitoring } from '@core/monitoring';

// Record a simple metric
monitoring.recordMetric('custom.metric', 42);

// Record with tags
monitoring.recordMetric('api.response.time', 156, {
  endpoint: '/preview',
  method: 'POST',
});

// Set thresholds
monitoring.setThreshold('custom.metric', 50, 100); // Warning at 50, critical at 100
```

### Tracking Workflows

```typescript
import { workflowMonitor } from '@core/monitoring';

// Execute a pre-configured workflow
const result = await workflowMonitor.executeWorkflow('graph-creation', {
  userId: 'user123',
});

// Monitor custom workflow
const data = await workflowMonitor.monitorCustomWorkflow(
  'custom-operation',
  async () => {
    // Your workflow code
    return result;
  },
  {
    expectedDuration: 1000,
    critical: true,
  }
);
```

### Using Decorators

```typescript
import { trackPerformance, monitorWorkflow } from '@core/monitoring';

class GraphService {
  @trackPerformance
  async executeGraph(graphId: string) {
    // Method execution is automatically tracked
  }
  
  @monitorWorkflow('graph-save')
  async saveGraph(data: any) {
    // Workflow is automatically monitored
  }
}
```

### Error Tracking

```typescript
import { apm, errorTracker } from '@core/monitoring';

try {
  // Your code
} catch (error) {
  // Track with context
  apm.trackError(error, {
    userId: 'user123',
    operation: 'graph-save',
    severity: 'critical',
  });
}

// Global error handling is automatic
```

### Dashboard Integration

```tsx
import { MonitoringDashboard } from '@core/monitoring';

// Full dashboard
<MonitoringDashboard refreshInterval={5} />

// Compact status bar
<MonitoringDashboard refreshInterval={10} compactView />
```

## Alert Configuration

Alerts are automatically triggered when metrics exceed thresholds:

### Critical Alerts
- Error rate > 1%
- Response time > 5s
- Memory usage > 1GB
- Uptime check failures

### Warning Alerts
- Error rate > 0.1%
- Response time > 2s
- Memory usage > 512MB
- Performance baseline deviation > 20%

## Performance Recommendations

The system provides automatic recommendations based on current metrics:

- **High Page Load Time**: "Consider optimizing bundle size and implementing code splitting"
- **High API Response Time**: "Check database queries and consider implementing caching"
- **High Error Rate**: "Review recent deployments and check error logs"
- **High Memory Usage**: "Check for memory leaks and optimize data structures"

## Integration with Epic 1 Features

### Feature Flag Monitoring

```typescript
import { epic1Monitoring } from '@core/monitoring';

// Track feature flag evaluation
epic1Monitoring.trackFeatureFlag('epic1-inline-editing', true);
```

### Inline Editing Tracking

```typescript
const editSession = epic1Monitoring.trackInlineEdit('node-123');

editSession.enterEditMode();
// User edits...
editSession.updateContent();
// Preview updates...
editSession.updatePreview();
// Save or cancel
editSession.complete(true); // saved=true
```

### Graph Operation Tracking

```typescript
const operation = epic1Monitoring.trackGraphOperation('create');

operation.addNode('TextNode');
operation.updateConnection();
// Complete operation
operation.complete(true);
```

## Monitoring Checklist

- [ ] APM service initialized on app startup
- [ ] Uptime checks configured for all critical endpoints
- [ ] Performance baselines established
- [ ] Error tracking enabled globally
- [ ] Critical workflows identified and monitored
- [ ] Dashboard integrated into admin interface
- [ ] Alerts configured with appropriate thresholds
- [ ] Analytics tracking user interactions
- [ ] Core Web Vitals monitored
- [ ] Feature flag usage tracked

## Troubleshooting

### No Metrics Appearing
- Ensure `startMonitoring()` is called on app initialization
- Check that analytics are enabled (not disabled in dev mode)
- Verify metric names don't contain invalid characters

### High Memory Usage
- Check metric retention settings (default: 1000 points per metric)
- Review workflow metric storage
- Clear old data periodically

### Missing Uptime Checks
- Verify endpoints are accessible
- Check network connectivity
- Review timeout settings

### Performance Issues
- Reduce monitoring interval if needed
- Batch metric recordings
- Use rate limiting for high-frequency metrics

## Future Enhancements

1. **External APM Integration**
   - DataDog/New Relic integration
   - Custom APM endpoint configuration

2. **Advanced Analytics**
   - Machine learning for anomaly detection
   - Predictive performance alerts
   - User behavior analysis

3. **Extended Monitoring**
   - Database query performance
   - Third-party API monitoring
   - Browser resource timing

4. **Reporting**
   - Automated daily/weekly reports
   - SLA compliance tracking
   - Custom metric dashboards