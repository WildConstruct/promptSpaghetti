# Security Event Logging Guidance

## Overview

This document provides comprehensive guidance for implementing and maintaining security event logging across the Epic 19 Data Protection & Privacy Controls platform. It covers logging strategies, event types, compliance requirements, and operational procedures.

## Table of Contents

1. [Logging Architecture](#logging-architecture)
2. [Event Types and Categories](#event-types-and-categories)
3. [Implementation Guidelines](#implementation-guidelines)
4. [Compliance Requirements](#compliance-requirements)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Operational Procedures](#operational-procedures)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting](#troubleshooting)

## Logging Architecture

### Core Components

#### SecurityEventLoggingFramework
Primary service for all security event logging operations:
- Location: `server/src/services/SecurityEventLoggingFramework.ts`
- Handles structured event collection, enrichment, and storage
- Supports multiple output destinations (databases, SIEM, files)
- Implements event filtering, correlation, and aggregation

#### SecurityAuditLogger
Runtime security logging for real-time threats:
- Location: `packages/core/runtime/security-audit-logger.ts`
- Focused on immediate security violations
- Memory-efficient with automatic cleanup
- Direct integration with runtime components

### Event Flow Architecture

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│ Security Events │ -> │ Enrichment Layer  │ -> │ Storage Layer   │
│                 │    │ - Context         │    │ - Database      │
│ - User Actions  │    │ - Geolocation     │    │ - SIEM          │
│ - System Events │    │ - Risk Scoring    │    │ - File System   │
│ - API Calls     │    │ - Correlation     │    │ - Analytics     │
└─────────────────┘    └───────────────────┘    └─────────────────┘
```

## Event Types and Categories

### Security Event Categories

#### Authentication Events
- **Login attempts** (successful/failed)
- **Password changes**
- **Account lockouts**
- **Two-factor authentication events**
- **Session management events**

```typescript
await logSecurityEvent({
  eventType: SecurityEventType.AUTHENTICATION,
  severity: SecuritySeverity.INFO,
  userId: 'user123',
  details: {
    action: 'login_success',
    method: '2fa',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
});
```

#### Authorization Events
- **Permission grants/denials**
- **Role changes**
- **Privilege escalations**
- **Access control violations**

```typescript
await logSecurityEvent({
  eventType: SecurityEventType.AUTHORIZATION,
  severity: SecuritySeverity.WARNING,
  userId: 'user123',
  resource: 'confidential_document',
  details: {
    action: 'access_denied',
    reason: 'insufficient_permissions',
    requiredRole: 'manager',
    currentRole: 'employee'
  }
});
```

#### Data Access Events
- **Data queries and retrieval**
- **Export operations**
- **Sensitive data access**
- **Bulk operations**

```typescript
await logSecurityEvent({
  eventType: SecurityEventType.DATA_ACCESS,
  severity: SecuritySeverity.MEDIUM,
  userId: 'user123',
  details: {
    action: 'data_export',
    recordCount: 1500,
    classification: 'CONFIDENTIAL',
    exportFormat: 'CSV'
  }
});
```

#### System Events
- **Configuration changes**
- **Service starts/stops**
- **Error conditions**
- **Performance anomalies**

```typescript
await logSecurityEvent({
  eventType: SecurityEventType.SYSTEM,
  severity: SecuritySeverity.HIGH,
  details: {
    action: 'config_change',
    component: 'security_policy',
    changedBy: 'admin123',
    changes: ['max_login_attempts', 'session_timeout']
  }
});
```

#### Policy Events
- **Policy updates**
- **Consent changes**
- **Compliance violations**
- **Audit events**

```typescript
await logSecurityEvent({
  eventType: SecurityEventType.POLICY_VIOLATION,
  severity: SecuritySeverity.CRITICAL,
  userId: 'user123',
  details: {
    policy: 'data_retention',
    violation: 'retention_period_exceeded',
    dataType: 'personal_information',
    retentionPeriod: '7_years',
    actualAge: '8_years'
  }
});
```

### Severity Levels

| Level | Description | Use Cases | Response Time |
|-------|-------------|-----------|---------------|
| **INFO** | Normal operations | Successful operations, routine events | No action required |
| **LOW** | Minor issues | Non-critical errors, warnings | 24-48 hours |
| **MEDIUM** | Notable events | Authentication failures, permission denials | 4-8 hours |
| **HIGH** | Significant issues | Multiple failures, suspicious patterns | 1-2 hours |
| **CRITICAL** | Security incidents | Breaches, attacks, system compromises | Immediate |

## Implementation Guidelines

### Basic Event Logging

```typescript
import { SecurityEventLoggingFramework, SecurityEventType, SecuritySeverity } from '../services/SecurityEventLoggingFramework';

const securityLogger = new SecurityEventLoggingFramework();

// Simple event logging
await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.AUTHENTICATION,
  severity: SecuritySeverity.INFO,
  userId: req.user.id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  details: {
    action: 'login_success',
    method: 'password'
  }
});
```

### Advanced Event Logging with Context

```typescript
// Event with full context and enrichment
await securityLogger.logSecurityEventWithContext({
  eventType: SecurityEventType.DATA_ACCESS,
  severity: SecuritySeverity.MEDIUM,
  userId: req.user.id,
  resource: 'customer_database',
  action: 'bulk_export',
  details: {
    query: 'SELECT * FROM customers WHERE created_at > ?',
    recordCount: 5000,
    exportFormat: 'JSON',
    classification: 'CONFIDENTIAL'
  },
  context: {
    requestId: req.id,
    sessionId: req.session.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    geolocation: {
      country: 'US',
      region: 'CA',
      city: 'San Francisco'
    },
    business: {
      department: 'sales',
      project: 'customer_analysis_q4',
      approvalRequired: true
    }
  },
  technical: {
    responseTime: 1250,
    resourceUsage: {
      cpu: 45,
      memory: 512,
      diskIO: 1024
    },
    errorCount: 0
  }
});
```

### Batch Event Logging

```typescript
// For high-volume scenarios
const events = [
  {
    eventType: SecurityEventType.API_ACCESS,
    severity: SecuritySeverity.INFO,
    userId: 'api_user_1',
    details: { endpoint: '/api/users', method: 'GET' }
  },
  {
    eventType: SecurityEventType.API_ACCESS,
    severity: SecuritySeverity.INFO,
    userId: 'api_user_2',
    details: { endpoint: '/api/orders', method: 'POST' }
  }
];

await securityLogger.logSecurityEventBatch(events);
```

### Event Correlation

```typescript
// Link related events
const correlationId = generateCorrelationId();

await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.AUTHENTICATION,
  severity: SecuritySeverity.WARNING,
  userId: 'user123',
  details: { action: 'login_failed', attempt: 1 },
  correlationId
});

await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.AUTHENTICATION,
  severity: SecuritySeverity.HIGH,
  userId: 'user123',
  details: { action: 'account_locked', reason: 'multiple_failures' },
  correlationId
});
```

## Compliance Requirements

### GDPR Compliance

#### Required Event Types
- All personal data access events
- Consent changes and withdrawals
- Data subject rights requests
- Data processing activities
- Third-party data sharing

#### Data Retention
- Security logs: 6 years minimum
- Access logs: 2 years minimum
- Consent logs: Duration of processing + 3 years

#### Privacy Considerations
```typescript
// Pseudonymize sensitive data in logs
await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.DATA_ACCESS,
  severity: SecuritySeverity.INFO,
  userId: hashUserId(actualUserId), // Pseudonymized
  details: {
    action: 'profile_view',
    dataSubject: hashUserId(targetUserId), // Pseudonymized
    ipAddress: anonymizeIP(req.ip), // Last octet removed
    timestamp: new Date().toISOString()
  }
});
```

### SOX Compliance

#### Financial Data Access
```typescript
await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.FINANCIAL_DATA_ACCESS,
  severity: SecuritySeverity.HIGH,
  userId: req.user.id,
  details: {
    action: 'financial_report_access',
    reportType: 'quarterly_earnings',
    period: 'Q4_2023',
    approver: 'cfo@company.com',
    businessJustification: 'board_presentation'
  },
  compliance: {
    framework: 'SOX',
    controls: ['IT-01', 'FIN-15'],
    auditTrail: true
  }
});
```

### HIPAA Compliance (if applicable)

#### PHI Access Logging
```typescript
await securityLogger.logSecurityEvent({
  eventType: SecurityEventType.PHI_ACCESS,
  severity: SecuritySeverity.MEDIUM,
  userId: req.user.id,
  details: {
    action: 'patient_record_view',
    patientId: hashPatientId(patientId),
    recordType: 'medical_history',
    accessReason: 'treatment',
    minimumNecessary: true
  },
  compliance: {
    framework: 'HIPAA',
    safeguards: ['access_control', 'audit_logs'],
    businessAssociate: false
  }
});
```

## Monitoring and Alerting

### Real-time Monitoring

#### Threshold-based Alerts
```typescript
// Configure automatic alerts
await securityLogger.configureAlert({
  name: 'failed_login_threshold',
  condition: {
    eventType: SecurityEventType.AUTHENTICATION,
    severity: SecuritySeverity.WARNING,
    count: 5,
    timeWindow: '5 minutes',
    groupBy: ['userId', 'ipAddress']
  },
  actions: [
    {
      type: 'email',
      recipients: ['security@company.com'],
      template: 'failed_login_alert'
    },
    {
      type: 'slack',
      channel: '#security-alerts',
      message: 'Multiple failed login attempts detected'
    }
  ]
});
```

#### Pattern-based Detection
```typescript
// Detect suspicious patterns
await securityLogger.configurePatternDetection({
  name: 'privilege_escalation_pattern',
  pattern: [
    { eventType: SecurityEventType.AUTHORIZATION, action: 'role_change' },
    { eventType: SecurityEventType.DATA_ACCESS, classification: 'CONFIDENTIAL' }
  ],
  timeWindow: '30 minutes',
  severity: SecuritySeverity.HIGH,
  autoResponse: 'flag_for_review'
});
```

### Dashboard Integration

#### Key Metrics
- Failed authentication attempts per hour
- Privilege escalation events
- Data export volumes by classification
- Geographic access patterns
- System error rates

#### Visualization Examples
```typescript
// Generate dashboard data
const dashboardData = await securityLogger.generateDashboardMetrics({
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date()
  },
  metrics: [
    'authentication_success_rate',
    'authorization_denials',
    'data_access_volume',
    'geographic_distribution',
    'threat_level_distribution'
  ],
  groupBy: 'hour'
});
```

## Operational Procedures

### Daily Operations

#### Log Review Checklist
1. **Critical Events Review** (0-30 minutes)
   - All CRITICAL severity events
   - Policy violations
   - System failures
   - Unusual access patterns

2. **Trend Analysis** (30-60 minutes)
   - Authentication failure rates
   - Geographic access changes
   - Data access volume trends
   - Performance degradation

3. **Compliance Validation** (60-90 minutes)
   - GDPR data subject requests
   - Financial data access logs
   - Retention policy compliance
   - Audit trail completeness

#### Sample Daily Review Script
```bash
#!/bin/bash
# Daily security log review

echo "=== Daily Security Log Review $(date) ==="

# Critical events in last 24 hours
echo "Critical events:"
node scripts/security-log-review.js --severity CRITICAL --hours 24

# Authentication failures by user
echo "Top authentication failures:"
node scripts/security-log-review.js --event-type AUTHENTICATION --failed --top 10

# Data access patterns
echo "Unusual data access:"
node scripts/security-log-review.js --event-type DATA_ACCESS --anomaly-detection

# Compliance summary
echo "Compliance status:"
node scripts/compliance-summary.js --frameworks GDPR,SOX
```

### Incident Response Integration

#### Automated Incident Creation
```typescript
await securityLogger.configureIncidentTrigger({
  name: 'data_breach_trigger',
  conditions: [
    {
      eventType: SecurityEventType.DATA_ACCESS,
      severity: SecuritySeverity.CRITICAL,
      classification: 'RESTRICTED'
    },
    {
      eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
      count: 1
    }
  ],
  actions: [
    'create_incident',
    'notify_security_team',
    'escalate_to_management',
    'begin_containment_procedures'
  ]
});
```

### Backup and Archive Procedures

#### Log Archival Strategy
```typescript
// Archive old logs
await securityLogger.archiveLogs({
  olderThan: '1 year',
  destination: 's3://security-logs-archive/',
  compression: 'gzip',
  encryption: 'AES-256',
  retentionPeriod: '7 years',
  compliance: ['GDPR', 'SOX']
});
```

## Performance Considerations

### Async Logging
```typescript
// Non-blocking event logging
await securityLogger.logSecurityEventAsync({
  eventType: SecurityEventType.API_ACCESS,
  severity: SecuritySeverity.INFO,
  userId: req.user.id,
  details: { endpoint: req.path, method: req.method }
});
```

### Batch Processing
```typescript
// Configure batch processing for high-volume events
await securityLogger.configureBatchProcessing({
  batchSize: 1000,
  flushInterval: 30000, // 30 seconds
  maxMemoryUsage: '100MB',
  compressionEnabled: true
});
```

### Database Optimization
```sql
-- Recommended indexes for security event tables
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_composite ON security_events(event_type, severity, timestamp);

-- Partitioning for large datasets
CREATE TABLE security_events_2024_01 PARTITION OF security_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Troubleshooting

### Common Issues

#### High Log Volume
**Problem**: Excessive logging affecting performance
**Solution**:
```typescript
// Implement intelligent filtering
await securityLogger.configureFiltering({
  rules: [
    {
      condition: { eventType: 'API_ACCESS', endpoint: '/health' },
      action: 'discard' // Don't log health checks
    },
    {
      condition: { severity: 'INFO', source: 'automated_process' },
      action: 'sample', // Log only 10% of INFO events from automated processes
      sampleRate: 0.1
    }
  ]
});
```

#### Missing Events
**Problem**: Expected events not appearing in logs
**Diagnostics**:
```typescript
// Check logger configuration
const status = await securityLogger.getStatus();
console.log('Logger status:', status);

// Verify event pipeline
const pipeline = await securityLogger.testEventPipeline();
console.log('Pipeline test:', pipeline);

// Check error logs
const errors = await securityLogger.getRecentErrors();
console.log('Recent errors:', errors);
```

#### Performance Degradation
**Problem**: Logging causing application slowdown
**Optimization**:
```typescript
// Enable async mode
await securityLogger.configure({
  asyncMode: true,
  bufferSize: 10000,
  flushInterval: 5000,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 10,
    timeout: 30000
  }
});
```

### Monitoring Script
```javascript
// scripts/security-log-monitor.js
const { SecurityEventLoggingFramework } = require('./src/services/SecurityEventLoggingFramework');

async function monitorSecurityLogs() {
  const logger = new SecurityEventLoggingFramework();
  
  // Check system health
  const health = await logger.getHealthStatus();
  console.log('Security logging health:', health);
  
  // Recent critical events
  const criticalEvents = await logger.getEvents({
    severity: 'CRITICAL',
    timeRange: { hours: 1 }
  });
  
  if (criticalEvents.length > 0) {
    console.warn(`${criticalEvents.length} critical events in last hour`);
    criticalEvents.forEach(event => {
      console.log(`  - ${event.eventType}: ${event.details.action}`);
    });
  }
  
  // Performance metrics
  const metrics = await logger.getPerformanceMetrics();
  console.log('Performance metrics:', {
    eventsPerSecond: metrics.throughput,
    avgProcessingTime: metrics.avgProcessingTime,
    errorRate: metrics.errorRate
  });
}

if (require.main === module) {
  monitorSecurityLogs().catch(console.error);
}
```

### Alerting Configuration
```yaml
# alerts.yml
alerts:
  - name: "Critical Security Events"
    condition: "severity = 'CRITICAL'"
    threshold: 1
    timeWindow: "1m"
    channels: ["email", "slack", "pagerduty"]
    
  - name: "Failed Login Spike"
    condition: "eventType = 'AUTHENTICATION' AND details.action = 'login_failed'"
    threshold: 10
    timeWindow: "5m"
    groupBy: ["ipAddress"]
    channels: ["slack"]
    
  - name: "Unusual Data Access"
    condition: "eventType = 'DATA_ACCESS' AND classification IN ('CONFIDENTIAL', 'RESTRICTED')"
    threshold: 100
    timeWindow: "1h"
    channels: ["email"]
```

## Best Practices Summary

### Development
1. **Always log security-relevant events** at appropriate severity levels
2. **Include sufficient context** for investigation and correlation
3. **Use structured logging** with consistent schemas
4. **Implement async logging** for performance-critical paths
5. **Test logging configuration** in development and staging

### Operations
1. **Monitor log volume and performance** impact
2. **Regular review of critical and high-severity events**
3. **Maintain compliance with retention policies**
4. **Test incident response procedures** regularly
5. **Keep alerting rules tuned** to minimize false positives

### Security
1. **Protect log integrity** with appropriate access controls
2. **Encrypt sensitive log data** at rest and in transit
3. **Pseudonymize personal data** where possible
4. **Implement log tampering detection**
5. **Regular security reviews** of logging infrastructure

---

*This guidance document is part of Epic 19 - Data Protection & Privacy Controls. For implementation questions, contact the security team.*