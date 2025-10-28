# Epic 13 - Analytics Dashboard Usage Examples

## Overview

This document provides comprehensive usage examples for the Epic 13 Analytics Dashboard system, including backend analytics collection, real-time WebSocket integration, and frontend dashboard components.

## Backend Analytics Collection

### 1. Basic Analytics Collection

```typescript
import { AnalyticsCollector } from '../server/src/analytics/AnalyticsCollector';

// Initialize analytics collector
const analyticsCollector = new AnalyticsCollector({
  enabled: true,
  sampleRate: 1.0,
  privacyMode: false
});

// Record user events
analyticsCollector.recordEvent('graph_execution', {
  userId: 123,
  graphId: 'graph-456',
  executionTime: 1250,
  nodeCount: 8,
  success: true
});

// Record performance metrics
analyticsCollector.recordEvent('performance_metric', {
  metric: 'response_time',
  value: 340,
  endpoint: '/api/preview',
  timestamp: Date.now()
});
```

### 2. Cost Tracking

```typescript
import { CostTracker } from '../server/src/analytics/CostTracker';

// Initialize cost tracker
const costTracker = new CostTracker(analyticsCollector, analyticsDAO);

// Track API usage costs
await costTracker.trackCost({
  userId: 123,
  provider: 'openai',
  model: 'gpt-4',
  tokenCount: 1500,
  cost: 0.045,
  requestType: 'completion'
});

// Check budget alerts
const alerts = await costTracker.getActiveAlerts();
console.log('Active budget alerts:', alerts);
```

### 3. User Journey Analysis

```typescript
import { UserJourneyAnalyzer } from '../server/src/analytics/UserJourneyAnalyzer';

// Initialize journey analyzer
const journeyAnalyzer = new UserJourneyAnalyzer(analyticsDAO);

// Analyze user journey patterns
const journeyData = await journeyAnalyzer.analyzeUserJourney(123, {
  startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  endTime: Date.now()
});

console.log('User journey patterns:', journeyData.patterns);
console.log('Conversion funnel:', journeyData.funnel);
```

## Frontend Dashboard Integration

### 1. Basic Dashboard Setup

```tsx
import React from 'react';
import { AnalyticsDashboard } from '../packages/core/components/Analytics/AnalyticsDashboard';
import { AnalyticsClient } from '../packages/core/analytics/AnalyticsClient';

const App: React.FC = () => {
  // Initialize analytics client
  const analyticsClient = new AnalyticsClient({
    apiUrl: 'http://localhost:8000/api',
    userId: 123,
    organizationId: 456
  });

  return (
    <div className="app">
      <AnalyticsDashboard
        analyticsClient={analyticsClient}
        userId={123}
        organizationId={456}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </div>
  );
};
```

### 2. Real-time WebSocket Integration

```typescript
import { AnalyticsWebSocketClient } from '../packages/core/analytics/WebSocketClient';

// Initialize WebSocket client
const wsClient = new AnalyticsWebSocketClient({
  url: 'ws://localhost:8000/ws/analytics',
  apiKey: 'your-api-key',
  userId: 123,
  organizationId: 456,
  enableLogging: true
});

// Connect and subscribe to dashboard updates
await wsClient.connect();
await wsClient.subscribeToDashboard();
await wsClient.subscribeToCostAlerts();
await wsClient.subscribeToRecommendations();

// Handle real-time updates
wsClient.on('dashboard_update', data => {
  console.log('Dashboard updated:', data);
  // Update your UI components
});

wsClient.on('alert', alert => {
  console.log('New alert:', alert);
  // Show alert notification
});

wsClient.on('new_recommendation', recommendation => {
  console.log('New recommendation:', recommendation);
  // Update recommendations panel
});
```

### 3. Component-specific Examples

#### Cost Analysis Component

```tsx
import React, { useState, useEffect } from 'react';
import { CostAnalysis } from '../packages/core/components/Analytics/CostAnalysis';

const CostDashboard: React.FC = () => {
  const [costData, setCostData] = useState(null);
  const [budget, setBudget] = useState({
    monthly: 1000,
    daily: 50,
    alerts: true
  });

  return (
    <CostAnalysis
      costData={costData}
      budget={budget}
      onBudgetUpdate={setBudget}
      timeRange={{
        startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
        endTime: Date.now()
      }}
      showForecast={true}
      showRecommendations={true}
    />
  );
};
```

#### Usage Patterns Component

```tsx
import React from 'react';
import { UsagePatterns } from '../packages/core/components/Analytics/UsagePatterns';

const UsageDashboard: React.FC = () => {
  const analyticsClient = new AnalyticsClient({
    apiUrl: 'http://localhost:8000/api'
  });

  return (
    <UsagePatterns
      analyticsClient={analyticsClient}
      userId={123}
      organizationId={456}
      showHeatMap={true}
      showJourneyAnalysis={true}
      showCohortAnalysis={true}
      timeRange={{
        startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endTime: Date.now()
      }}
    />
  );
};
```

#### Alerts Panel

```tsx
import React, { useState } from 'react';
import { AlertsPanel } from '../packages/core/components/Analytics/AlertsPanel';

const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState([]);

  const handleAcknowledge = async (alertId: string) => {
    // Acknowledge alert via API
    await analyticsClient.acknowledgeAlert(alertId);
    // Update local state
    setAlerts(
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleDismiss = async (alertId: string) => {
    // Dismiss alert via API
    await analyticsClient.dismissAlert(alertId);
    // Remove from local state
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <AlertsPanel
      alerts={alerts}
      onAcknowledge={handleAcknowledge}
      onDismiss={handleDismiss}
      showSummary={true}
    />
  );
};
```

## API Usage Examples

### 1. Dashboard Data Retrieval

```typescript
// Get dashboard overview
const dashboardData = await analyticsClient.getDashboardData({
  timeRange: {
    startTime: Date.now() - 24 * 60 * 60 * 1000,
    endTime: Date.now()
  }
});

// Get performance metrics
const metrics = await analyticsClient.getPerformanceMetrics({
  metrics: ['response_time', 'throughput', 'error_rate'],
  timeRange: {
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  }
});
```

### 2. Cost Analysis

```typescript
// Get cost data
const costData = await analyticsClient.getCostData({
  timeRange: {
    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  },
  groupBy: 'provider',
  includeForecasting: true
});

// Get budget information
const budgetInfo = await analyticsClient.getBudgetInfo(456); // organizationId
```

### 3. Usage Patterns

```typescript
// Get usage patterns
const patterns = await analyticsClient.getUsagePatterns({
  userId: 123,
  timeRange: {
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  },
  includeHeatMap: true,
  includeJourneyAnalysis: true
});

// Get cohort analysis
const cohortData = await analyticsClient.getCohortAnalysis({
  organizationId: 456,
  cohortType: 'weekly',
  timeRange: {
    startTime: Date.now() - 90 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  }
});
```

### 4. Export Functionality

```typescript
// Export dashboard data
const exportData = await analyticsClient.exportData(
  {
    startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  },
  'json'
);

// Generate comprehensive report
const report = await analyticsClient.generateReport({
  startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
  endTime: Date.now(),
  format: 'pdf',
  includeHeatMap: true,
  includeCostAnalysis: true,
  includePatterns: true
});
```

## Session Replay System

```typescript
import { SessionReplaySystem } from '../server/src/analytics/SessionReplaySystem';

// Initialize session replay system
const sessionReplay = new SessionReplaySystem(analyticsDAO);

// Start recording session
await sessionReplay.startRecording({
  userId: 123,
  sessionId: 'session-789',
  initialState: {
    url: '/dashboard',
    timestamp: Date.now()
  }
});

// Record user interactions
await sessionReplay.recordInteraction('session-789', {
  type: 'click',
  element: 'button#export',
  timestamp: Date.now(),
  metadata: {
    x: 100,
    y: 200
  }
});

// Get session recordings
const recordings = await sessionReplay.getRecordings({
  userId: 123,
  startTime: Date.now() - 24 * 60 * 60 * 1000,
  endTime: Date.now()
});
```

## Cohort Analysis

```typescript
import { CohortAnalyzer } from '../server/src/analytics/CohortAnalyzer';

// Initialize cohort analyzer
const cohortAnalyzer = new CohortAnalyzer(analyticsDAO);

// Analyze user cohorts
const cohortData = await cohortAnalyzer.analyzeCohorts({
  organizationId: 456,
  cohortType: 'monthly',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

// Get retention analysis
const retentionData = await cohortAnalyzer.getRetentionAnalysis({
  organizationId: 456,
  cohortType: 'weekly',
  timeRange: {
    startTime: Date.now() - 90 * 24 * 60 * 60 * 1000,
    endTime: Date.now()
  }
});
```

## Environment Configuration

### Server Configuration

```bash
# .env file
ANALYTICS_ENABLED=true
ANALYTICS_SAMPLE_RATE=1.0
ANALYTICS_PRIVACY_MODE=false
ENABLE_WS_AUTH=true
WS_PORT=8001
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

### Client Configuration

```typescript
const analyticsClient = new AnalyticsClient({
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  userId: getCurrentUserId(),
  organizationId: getCurrentOrganizationId(),
  enableRetries: true,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 10000
});
```

## Best Practices

### 1. Performance Optimization

```typescript
// Use caching for dashboard data
const analyticsClient = new AnalyticsClient({
  apiUrl: 'http://localhost:8000/api',
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
});

// Batch multiple requests
const [dashboardData, costData, patterns] = await Promise.all([
  analyticsClient.getDashboardData(timeRange),
  analyticsClient.getCostData(timeRange),
  analyticsClient.getUsagePatterns(timeRange)
]);
```

### 2. Error Handling

```typescript
try {
  const dashboardData = await analyticsClient.getDashboardData(timeRange);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Retry request
  } else {
    // Handle other errors
    console.error('Dashboard data fetch failed:', error);
  }
}
```

### 3. Privacy Compliance

```typescript
// Initialize with privacy mode
const analyticsCollector = new AnalyticsCollector({
  enabled: true,
  privacyMode: true, // Enable privacy mode
  dataRetention: 90 * 24 * 60 * 60 * 1000, // 90 days
  anonymizeIPs: true,
  respectDoNotTrack: true
});
```

## Testing

### Unit Tests

```typescript
import { AnalyticsClient } from '../packages/core/analytics/AnalyticsClient';

describe('AnalyticsClient', () => {
  it('should fetch dashboard data', async () => {
    const client = new AnalyticsClient({
      apiUrl: 'http://localhost:8000/api'
    });

    const data = await client.getDashboardData({
      timeRange: {
        startTime: Date.now() - 24 * 60 * 60 * 1000,
        endTime: Date.now()
      }
    });

    expect(data).toBeDefined();
    expect(data.summary).toBeDefined();
  });
});
```

### Integration Tests

```typescript
import { AnalyticsWebSocketClient } from '../packages/core/analytics/WebSocketClient';

describe('WebSocket Integration', () => {
  it('should receive real-time updates', async () => {
    const wsClient = new AnalyticsWebSocketClient({
      url: 'ws://localhost:8000/ws/analytics'
    });

    await wsClient.connect();
    await wsClient.subscribeToDashboard();

    const updatePromise = new Promise(resolve => {
      wsClient.on('dashboard_update', resolve);
    });

    // Trigger an update
    // ... trigger code ...

    const update = await updatePromise;
    expect(update).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check server is running on correct port
   - Verify CORS settings
   - Ensure WebSocket server is properly initialized

2. **Dashboard Not Loading**
   - Check API endpoint URLs
   - Verify authentication headers
   - Check network connectivity

3. **Real-time Updates Not Working**
   - Verify WebSocket connection status
   - Check subscription topics
   - Ensure server is broadcasting updates

### Debug Configuration

```typescript
// Enable debug logging
const analyticsClient = new AnalyticsClient({
  apiUrl: 'http://localhost:8000/api',
  enableLogging: true,
  logLevel: 'debug'
});

const wsClient = new AnalyticsWebSocketClient({
  url: 'ws://localhost:8000/ws/analytics',
  enableLogging: true
});
```

## Conclusion

The Epic 13 Analytics Dashboard provides a comprehensive solution for real-time analytics collection, visualization, and reporting. The system includes:

- **Backend Analytics Collection**: Event tracking, performance monitoring, cost analysis
- **Real-time WebSocket Integration**: Live dashboard updates, alerts, notifications
- **Frontend Dashboard Components**: Interactive charts, cost analysis, usage patterns
- **Advanced Analytics**: User journey analysis, session replay, cohort analysis
- **Export Capabilities**: Multi-format data export with customizable options

This implementation provides a production-ready analytics solution with excellent performance, scalability, and user experience.
