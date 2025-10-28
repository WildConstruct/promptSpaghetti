# Execution Monitoring & Observability

This document provides comprehensive guidance on monitoring and observability features for the PromptScape application, with a focus on execution tracking, performance metrics, and Epic 19 security services monitoring.

## Overview

The PromptScape application includes a robust monitoring and observability stack designed to provide real-time insights into system performance, execution metrics, and security events. The system is built around multiple layers of data collection, analysis, and alerting.

## Core Monitoring Components

### 1. Analytics Collection System

**Location**: `server/src/analytics/AnalyticsCollector.ts`

The `AnalyticsCollector` provides comprehensive event tracking across the application:

#### Event Types Tracked

- **Graph Execution**: Start, completion, and error events for graph executions
- **Node Execution**: Individual node processing metrics and errors
- **User Interactions**: Canvas interactions, node creation/updates, connections
- **Performance Metrics**: Execution times, memory usage, token consumption
- **Security Events**: Authentication, authorization, and security violations

#### Key Features

- Configurable sampling rates to manage performance impact
- Privacy mode for anonymizing sensitive data
- Buffer-based event collection with configurable flush intervals
- Event retention management with automatic cleanup
- Real-time event streaming via EventEmitter interface

#### Configuration

```javascript
const analyticsConfig = {
  enabled: true,
  sampleRate: 1.0, // 100% sampling for critical events
  bufferSize: 100, // Events before forced flush
  flushInterval: 10000, // 10 seconds between flushes
  privacyMode: false, // Disable for full tracking
  maxEvents: 10000, // Memory limit
  retentionPeriod: 604800000 // 7 days in milliseconds
};
```

### 2. Performance Metrics Collection

**Location**: `server/src/performance/MetricsCollector.ts`

The `MetricsCollector` focuses on system performance and resource utilization:

#### Metrics Collected

- **System Metrics**: CPU usage, memory consumption, network I/O, disk usage
- **WebSocket Metrics**: Connection counts, message latency, error rates
- **Collaboration Metrics**: Conflict resolution times, synchronization latency
- **Process Metrics**: Heap usage, uptime, garbage collection stats

#### Alerting Thresholds

```javascript
const performanceThresholds = {
  maxCpuUsage: 80, // 80% CPU usage
  maxMemoryUsage: 85, // 85% memory usage
  maxMessageLatency: 1000, // 1 second message latency
  maxConflictResolutionTime: 5000, // 5 seconds conflict resolution
  maxSynchronizationLatency: 2000, // 2 seconds sync latency
  minSuccessRate: 95, // 95% minimum success rate
  maxErrorRate: 5 // 5% maximum error rate
};
```

### 3. Financial Services API Monitoring

**Location**: `server/src/routes/financial-services.ts`, `server/src/services/FinancialDataLifecycleService.ts`

The Financial Services API includes comprehensive monitoring for Epic 19.2.6 compliance and data lifecycle management:

#### Monitored Operations

- **Data Registration**: Financial record registration with retention tracking
- **Deletion Workflows**: Automated deletion execution monitoring
- **Compliance Reporting**: Report generation and export tracking
- **Safety Checks**: Legal hold verification, audit period validation
- **Verification Steps**: Hash verification, approval workflows

#### Audit Events Tracked

```javascript
// Data registration audit
await auditService.logEvent({
  userId: record.ownerId,
  action: 'financial_data_registered',
  resourceType: 'financial_record',
  resourceId: record.id,
  details: {
    dataType: record.dataType,
    externalId: record.externalId,
    retentionPeriodYears: record.retentionPeriodYears,
    jurisdiction: record.jurisdiction
  },
  severity: 'info'
});

// Deletion workflow execution audit
await auditService.logEvent({
  userId: executedBy,
  action: 'deletion_workflow_executed',
  resourceType: 'deletion_workflow',
  resourceId: workflowId,
  details: {
    batchId,
    recordsProcessed: eligibleRecords.length,
    recordsDeleted: deletedCount,
    recordsFailed: failedCount,
    workflowName: workflow.workflowName
  },
  severity: 'info'
});
```

## Monitoring Dashboards

### 1. Analytics Dashboard

**Location**: `server/src/analytics/AnalyticsDashboard.ts`

Provides real-time insights into application usage and performance:

#### Features

- Real-time event streaming dashboard
- User journey analysis and cohort tracking
- Performance trend analysis
- Cost tracking for API usage and token consumption
- Session replay capabilities for debugging
- Customizable time windows and aggregations

### 2. Performance Dashboard

**Location**: `server/src/performance/PerformanceDashboard.ts`

Focuses on system health and performance metrics:

#### Features

- System resource monitoring (CPU, memory, network)
- WebSocket connection health tracking
- Collaboration performance metrics
- Automated alerting based on configurable thresholds
- Performance trend analysis and capacity planning
- Export capabilities for external monitoring tools

## WebSocket Real-time Monitoring

**Location**: `server/src/websocket/WebSocketServer.ts`, `server/src/websocket/AnalyticsWebSocketServer.ts`

### Real-time Metrics Streaming

- Live connection counts and session tracking
- Message throughput and latency monitoring
- Error rate tracking and alerting
- Document collaboration metrics
- User presence and activity tracking

### Health Endpoints

```javascript
// WebSocket status endpoint
GET /ws/status
{
  "status": "running",
  "metrics": {
    "totalConnections": 45,
    "activeDocuments": 12,
    "uptime": 3600000
  },
  "sessions": {...},
  "presence": {...},
  "timestamp": "2025-07-21T..."
}

// Document-specific user tracking
GET /ws/documents/:documentId/users
{
  "documentId": "abc123",
  "users": [...],
  "count": 3,
  "timestamp": "2025-07-21T..."
}
```

## Security and Compliance Monitoring

### Epic 19 Security Services Monitoring

The Epic 19 Security & Compliance Framework includes monitoring for:

#### 1. Authentication & Authorization

- Login attempt tracking and anomaly detection
- MFA verification monitoring
- Device fingerprinting and trust scoring
- Location-based risk assessment
- Behavior analytics and pattern detection

#### 2. Data Protection & Privacy

- Data classification monitoring and compliance tracking
- Access control enforcement logging
- Encryption key management audit trails
- Data retention policy enforcement tracking
- GDPR/CCPA compliance monitoring

#### 3. Audit & Compliance

- Comprehensive audit trail collection
- Evidence mapping for compliance frameworks
- Policy update and acceptance tracking
- Team collaboration on audit activities
- Automated compliance report generation

#### 4. Rule Evaluation Engine Monitoring

**Location**: `server/src/services/RuleEvaluationEngine.ts`

The Rule Evaluation Engine provides high-performance compliance rule processing with comprehensive monitoring:

##### Performance Metrics Tracked

- **Concurrent Evaluations**: Real-time tracking of parallel rule evaluations
- **Evaluation Timeout**: Monitoring of rule evaluation duration against thresholds
- **Memory Usage**: Memory consumption during rule processing
- **CPU Utilization**: CPU usage during complex rule evaluation
- **Batch Processing**: Throughput metrics for bulk rule evaluations
- **Cache Performance**: Hit ratios and cache efficiency metrics

##### Configuration Monitoring

```javascript
const ruleEngineConfig = {
  performance: {
    maxConcurrentEvaluations: 100,
    evaluationTimeout: 5000, // 5 seconds
    memoryLimit: 104857600, // 100MB
    cpuThreshold: 70, // 70% CPU usage
    batchSize: 50,
    enableProfiling: true,
    performanceMetrics: true
  },
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour cache
    maxCacheSize: 10000, // 10k entries
    cacheStrategy: 'LRU',
    compressionEnabled: true
  },
  monitoring: {
    enableRealTimeMetrics: true,
    enableAlerting: true,
    performanceThresholds: [
      { metric: 'evaluationTime', warning: 1000, critical: 5000, unit: 'ms' },
      { metric: 'memoryUsage', warning: 75, critical: 90, unit: 'percent' },
      { metric: 'cpuUsage', warning: 60, critical: 80, unit: 'percent' }
    ],
    healthCheckInterval: 30000, // 30 seconds
    metricRetentionDays: 30
  }
};
```

##### Security and Audit Monitoring

- **Sandbox Mode**: Monitoring for unsafe rule execution attempts
- **Operation Filtering**: Tracking of allowed vs blocked operations
- **Result Encryption**: Monitoring of sensitive rule result encryption
- **Audit Trail**: Complete audit logging for all rule evaluations

## Observability Best Practices

### 1. Structured Logging

All monitoring components use structured logging with consistent formats:

```javascript
// Example structured log entry
{
  "timestamp": "2025-07-21T10:30:00.000Z",
  "level": "info",
  "service": "financial-data-lifecycle",
  "operation": "deletion-workflow-executed",
  "userId": "user-123",
  "resourceId": "workflow-456",
  "duration": 1250,
  "details": {
    "recordsProcessed": 25,
    "recordsDeleted": 23,
    "recordsFailed": 2
  }
}
```

### 2. Correlation IDs

Request tracing uses correlation IDs for tracking operations across services:

- Session ID tracking for user operations
- Batch ID tracking for bulk operations
- Execution ID tracking for workflow operations
- Request ID tracking for API operations

### 3. Health Check Endpoints

#### Application Health

```javascript
GET /health
{
  "status": "healthy",
  "database": "connected",
  "websocket": {
    "status": "healthy",
    "connections": 42,
    "activeDocuments": 15,
    "uptime": 3600000
  },
  "timestamp": "2025-07-21T..."
}
```

#### Service-specific Health

```javascript
GET /api/financial-services/health
{
  "success": true,
  "service": "Financial Data Lifecycle Management API",
  "timestamp": "2025-07-21T...",
  "version": "1.0.0"
}
```

### 4. Performance Targets

Based on the performance requirements documented in `docs/PERF.md`:

- **Graph Execution**: Generate 5 prompt variants in < 1 second
- **Memory Usage**: Peak memory < 500 MB during execution
- **UI Responsiveness**: Maintain ≥ 30 FPS during canvas interactions
- **Large Graph Support**: Support up to 1000 nodes with virtualization

## Alerting and Notifications

### Alert Configuration

Alerts are configured with severity levels and notification channels:

```javascript
// Example alert configuration
const alertConfig = {
  cpu_usage: {
    threshold: 80,
    severity: 'warning',
    channels: ['email', 'webhook']
  },
  memory_usage: {
    threshold: 85,
    severity: 'critical',
    channels: ['email', 'webhook', 'slack']
  },
  financial_deletion_failure: {
    threshold: 1,
    severity: 'critical',
    channels: ['email', 'webhook', 'compliance_team']
  }
};
```

### Notification Channels

- **Email**: Critical alerts sent to operations team
- **Webhook**: Integration with external monitoring systems
- **Slack**: Real-time notifications for development team
- **Compliance Team**: Dedicated channel for regulatory alerts

## Monitoring Data Export

### Analytics Export

```javascript
// Export analytics data
const analytics = new AnalyticsCollector();
const data = analytics.exportData('json'); // or 'csv'

// Export to file
await analytics.exportMetrics('/path/to/export.json', 'json');
```

### Performance Export

```javascript
// Export performance metrics
const metrics = new MetricsCollector();
await metrics.exportMetrics('/path/to/performance.csv', 'csv');
```

## Integration with External Tools

### OpenTelemetry Integration

The application supports OpenTelemetry for integration with external observability platforms:

- Distributed tracing for request flows
- Metrics export to Prometheus/Grafana
- Log aggregation to ELK stack
- Custom instrumentation for business metrics

### Monitoring Tool Compatibility

- **Prometheus**: Metrics scraping endpoints
- **Grafana**: Pre-built dashboards for visualization
- **DataDog**: APM integration for full-stack monitoring
- **New Relic**: Application performance monitoring
- **Splunk**: Log aggregation and analysis

## Troubleshooting and Debug Tools

### Performance Debugging

```javascript
// Memory profiling in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      });
    }
  }, 10000);
}
```

### Debug Commands

```bash
# Performance profiling
npm run dev:profile

# Memory analysis
npm run analyze:memory

# Bundle analysis
npm run analyze:bundle
```

## Security Considerations

### Data Privacy

- Sensitive data anonymization in privacy mode
- PII redaction in logs and metrics
- Secure storage of monitoring data
- Access controls for monitoring dashboards

### Compliance Requirements

- Audit trail integrity and immutability
- Data retention policy enforcement
- Regulatory reporting automation
- Evidence preservation for compliance audits

## Future Enhancements

### Planned Improvements

- Machine learning-based anomaly detection
- Predictive performance monitoring
- Advanced user behavior analytics
- Automated performance optimization recommendations
- Enhanced security incident correlation

---

_Last updated: 2025-07-21_  
_Next review: 2025-08-21_
