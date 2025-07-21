# Epic 23 Collaboration Telemetry Integration Guide

This guide explains how to integrate and use the Epic 23 collaboration telemetry system for tracking real-time collaboration activities, measuring performance metrics, and monitoring success criteria.

## Overview

The Epic 23 telemetry system provides comprehensive tracking of:
- Real-time collaboration sessions and presence
- Conflict resolution activities and success rates
- Performance metrics (latency, throughput, reliability)
- User engagement and feature adoption
- Epic 23 success criteria progress

## Architecture

### Core Components

1. **CollaborationTelemetry.ts** - Event schemas and validation using Zod
2. **CollaborationAnalyticsCollector.ts** - Analytics collection with Epic 23 metrics
3. **CollaborationTelemetryService.ts** - WebSocket event integration service
4. **CollaborationTelemetryFactory.ts** - Setup and configuration factory
5. **Database Schema** - MySQL/PostgreSQL tables for telemetry storage

### Integration Flow

```
WebSocket Events → TelemetryService → AnalyticsCollector → Database Storage
                                   ↓
                          Real-time Dashboard Updates
```

## Server Integration

### 1. Basic Setup

Add to your server initialization:

```typescript
import { WebSocketServer } from './websocket/WebSocketServer';
import { CollaborationTelemetryFactory } from './analytics/CollaborationTelemetryFactory';

// Initialize WebSocket server
const wsServer = new WebSocketServer(wsConfig);

// Initialize telemetry system
const telemetrySetup = await CollaborationTelemetryFactory.initialize(
  wsServer,
  CollaborationTelemetryFactory.createConfigFromEnvironment()
);

// Add telemetry routes
const telemetryRoutes = CollaborationTelemetryFactory.createTelemetryRoutes(telemetrySetup);

// Register routes with your Fastify server
server.get('/api/collaboration/dashboard', telemetryRoutes['/api/collaboration/dashboard']);
server.get('/api/collaboration/epic23/status', telemetryRoutes['/api/collaboration/epic23/status']);
server.get('/api/collaboration/telemetry/health', telemetryRoutes['/api/collaboration/telemetry/health']);

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
  await CollaborationTelemetryFactory.cleanup(telemetrySetup);
  process.exit(0);
});
```

### 2. Environment Configuration

Add these environment variables:

```env
# Epic 23 Telemetry Settings
EPIC23_TELEMETRY_ENABLED=true
EPIC23_LATENCY_MEASUREMENT=true
EPIC23_LATENCY_INTERVAL=5000
EPIC23_HEARTBEAT_INTERVAL=30000
EPIC23_PERFORMANCE_TRACKING=true
EPIC23_CONFLICT_TRACKING=true

# Analytics Settings
COLLABORATION_ANALYTICS_ENABLED=true
COLLABORATION_ANALYTICS_SAMPLE_RATE=1.0
ANALYTICS_PRIVACY_MODE=false

# Analytics WebSocket Server
ANALYTICS_WS_PORT=8001
ANALYTICS_WS_AUTH_ENABLED=false
ANALYTICS_WS_CORS_ORIGINS=http://localhost:3000,https://yourapp.com
ANALYTICS_WS_MAX_CONNECTIONS=1000
```

### 3. Database Migration

Run the collaboration events schema migration:

```sql
-- Execute the schema from server/src/database/migrations/collaboration_events_schema.sql
mysql -u your_user -p your_database < server/src/database/migrations/collaboration_events_schema.sql
```

## Event Types and Usage

### Session Events

```typescript
// Automatically tracked when users join/leave collaborative sessions
CollaborationEventType.COLLABORATIVE_SESSION_START
CollaborationEventType.COLLABORATIVE_SESSION_END
CollaborationEventType.COLLABORATIVE_SESSION_HEARTBEAT
CollaborationEventType.USER_PRESENCE_UPDATE
```

### Real-time Editing Events

```typescript
// Tracked during concurrent editing activities
CollaborationEventType.SIMULTANEOUS_EDIT_DETECTED
CollaborationEventType.CONFLICT_RESOLUTION_TRIGGERED
CollaborationEventType.CONFLICT_RESOLUTION_COMPLETED
CollaborationEventType.OPERATIONAL_TRANSFORM_APPLIED
```

### Performance Events

```typescript
// Automated performance measurement
CollaborationEventType.COLLABORATION_LATENCY_MEASURED
CollaborationEventType.WEBSOCKET_CONNECTION_QUALITY
CollaborationEventType.SYNC_PERFORMANCE_MEASURED
```

## Epic 23 Success Criteria

The system automatically tracks these success metrics:

1. **Real-time Latency**: Target ≤ 150ms
2. **Conflict Resolution Success Rate**: Target ≥ 99%
3. **Workspace Adoption Rate**: Target ≥ 80%

Access via API:
```javascript
GET /api/collaboration/epic23/status
```

## Dashboard Integration

### Real-time Collaboration Dashboard

Access dashboard data:
```javascript
GET /api/collaboration/dashboard
```

Response includes:
- Epic 23 progress metrics
- Active collaboration statistics
- Performance metrics
- User engagement data

### WebSocket Real-time Updates

Connect to analytics WebSocket for live updates:
```javascript
const ws = new WebSocket('ws://localhost:8001');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  if (event.topic === 'collaboration_analytics') {
    // Handle real-time collaboration event
    updateDashboard(event.data);
  }
  
  if (event.topic === 'epic23_alerts') {
    // Handle Epic 23 success criteria alerts
    showAlert(event.data);
  }
});
```

## Custom Event Tracking

### Manual Event Recording

```typescript
import { CollaborationAnalyticsCollector } from './analytics/CollaborationAnalyticsCollector';
import { CollaborationEventType } from './analytics/CollaborationTelemetry';

// Record custom collaboration event
await collaborationAnalytics.recordCollaborationEvent({
  eventType: CollaborationEventType.COMMENT_CREATED,
  context: {
    workspaceId: 'workspace_123',
    projectId: 'project_456',
    resourceId: 'graph_789',
    sessionId: 'session_abc',
    userId: 'user_def',
    userRole: 'collaborator',
    timestamp: new Date()
  },
  data: {
    commentId: 'comment_123',
    threadId: 'thread_456',
    targetElementId: 'node_789',
    commentLength: 142,
    mentionedUsers: ['user_ghi'],
    attachmentCount: 1,
    isReply: false,
    threadDepth: 1
  }
});
```

### Performance Measurement

```typescript
// Record custom latency measurement
await collaborationAnalytics.recordCollaborationLatency(
  context,
  latencyMs,
  'custom_operation'
);

// Record conflict resolution
await collaborationAnalytics.recordConflictResolution(
  context,
  {
    conflictId: 'conflict_123',
    conflictType: 'node_edit',
    involvedUsers: ['user_1', 'user_2'],
    resolutionStrategy: 'operational_transform',
    resolutionTimeMs: 250,
    success: true
  }
);
```

## Monitoring and Alerts

### Health Monitoring

Check telemetry system health:
```javascript
GET /api/collaboration/telemetry/health
```

### Epic 23 Success Alerts

The system automatically emits alerts when Epic 23 criteria are at risk:

```javascript
// WebSocket alert example
{
  "topic": "epic23_alerts",
  "type": "latency_threshold_exceeded",
  "data": {
    "measured": 180,
    "target": 150
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "severity": "warning"
}
```

## Performance Considerations

### Sampling and Privacy

- Default sample rate: 100% (configurable via `COLLABORATION_ANALYTICS_SAMPLE_RATE`)
- Privacy mode available (`ANALYTICS_PRIVACY_MODE=true`)
- Event batching for database efficiency

### Database Optimization

- Automated cleanup of old events (90-day retention)
- Indexed queries for real-time dashboard performance
- Automated Epic 23 metrics calculations

### Resource Usage

- Minimal WebSocket overhead (< 1KB per event)
- Asynchronous event processing
- Configurable measurement intervals

## Troubleshooting

### Common Issues

1. **Events not recording**: Check `EPIC23_TELEMETRY_ENABLED` environment variable
2. **High latency measurements**: Verify WebSocket connection stability
3. **Dashboard not updating**: Check Analytics WebSocket server status
4. **Database errors**: Verify migration schema applied correctly

### Debug Logging

Enable detailed logging:
```env
DEBUG=collaboration:telemetry
```

### Validation

Test the telemetry system:
```bash
# Health check
curl http://localhost:8000/api/collaboration/telemetry/health

# Dashboard data
curl http://localhost:8000/api/collaboration/dashboard

# Epic 23 status
curl http://localhost:8000/api/collaboration/epic23/status
```

## Best Practices

1. **Event Context**: Always provide complete collaboration context
2. **Error Handling**: Telemetry failures should not break collaboration features
3. **Privacy**: Be mindful of sensitive data in event payloads
4. **Performance**: Use appropriate measurement intervals for your use case
5. **Monitoring**: Set up alerts for Epic 23 success criteria

## API Reference

### Event Schema Validation

All events use Zod schemas for validation:
```typescript
import { CollaborationTelemetrySchemas } from './analytics/CollaborationTelemetry';

const schema = CollaborationTelemetrySchemas[eventType];
const validatedEvent = schema.parse(event);
```

### Success Criteria Constants

```typescript
import { EPIC_23_SUCCESS_CRITERIA } from './analytics/CollaborationTelemetry';

console.log('Latency target:', EPIC_23_SUCCESS_CRITERIA.REAL_TIME_LATENCY_TARGET);
console.log('Conflict resolution target:', EPIC_23_SUCCESS_CRITERIA.CONFLICT_RESOLUTION_SUCCESS_RATE);
```

This telemetry system provides comprehensive insights into Epic 23 collaboration features while maintaining performance and privacy standards.