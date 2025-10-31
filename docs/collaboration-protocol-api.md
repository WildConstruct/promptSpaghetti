# Collaboration Protocol and API Documentation

## Overview

PromptScape's collaborative editing system enables real-time multi-user editing with advanced features including presence awareness, conflict resolution, synchronization, and comprehensive analytics. This document provides complete protocol specifications and API reference for developers.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [WebSocket Communication Protocol](#websocket-communication-protocol)
- [Message Types Reference](#message-types-reference)
- [Presence Management](#presence-management)
- [Conflict Resolution](#conflict-resolution)
- [Synchronization Protocol](#synchronization-protocol)
- [Analytics Integration](#analytics-integration)
- [Authentication & Security](#authentication--security)
- [Client Integration Guide](#client-integration-guide)
- [Performance & Scaling](#performance--scaling)

---

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────┐
│                 Client Applications                 │
├─────────────────────────────────────────────────────┤
│                WebSocket Protocol                   │
├─────────────────────────────────────────────────────┤
│            WebSocket Server (Port 8000)            │
│  ┌─────────────┬─────────────┬─────────────────────┐ │
│  │ Connection  │  Presence   │   Conflict          │ │
│  │ Manager     │  Manager    │   Resolver          │ │
│  └─────────────┴─────────────┴─────────────────────┘ │
│  ┌─────────────┬─────────────┬─────────────────────┐ │
│  │    Sync     │  Analytics  │   Authentication    │ │
│  │   Manager   │  Collector  │   System            │ │
│  └─────────────┴─────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────┤
│           Analytics WebSocket (Port 8001)          │
├─────────────────────────────────────────────────────┤
│              Database & Storage                     │
└─────────────────────────────────────────────────────┘
```

### Key Features

- **Real-time Collaboration**: Multi-user simultaneous editing with instant synchronization
- **Presence Awareness**: Live cursors, selections, and user activity status
- **Conflict Resolution**: CRDT-based automatic conflict resolution with multiple strategies
- **Document Synchronization**: Version-controlled state management with integrity verification
- **Analytics & Telemetry**: Comprehensive collaboration metrics and performance tracking
- **Security**: Authentication, authorization, and secure WebSocket connections

---

## WebSocket Communication Protocol

### Connection Establishment

```javascript
const ws = new WebSocket('ws://localhost:8000');

ws.onopen = () => {
  console.log('Connected to collaboration server');
  // Authentication required immediately after connection
};

ws.onmessage = event => {
  const message = JSON.parse(event.data);
  handleCollaborationMessage(message);
};
```

### Message Format

All WebSocket messages follow this standardized format:

```typescript
interface WSMessage {
  type: string; // Message type identifier
  payload: object; // Type-specific data
  timestamp: number; // Server timestamp (ms since epoch)
  messageId: string; // Unique message identifier
  documentId?: string; // Document context (optional)
}
```

### Message Flow

1. **Connection** → Client connects to WebSocket server
2. **Authentication** → Client sends authentication request
3. **Document Join** → Client joins specific document for editing
4. **Collaboration** → Real-time message exchange begins
5. **Disconnection** → Graceful cleanup and user removal

---

## Message Types Reference

### Authentication Messages

#### `auth_request`

Authenticate user for collaboration session.

```typescript
{
  type: 'auth_request',
  payload: {
    userId: string,
    documentId: string,
    userName: string,
    userAvatar?: string,
    token?: string,        // Authentication token
    platform?: string     // Client platform identifier
  }
}
```

#### `auth_response`

Server authentication result.

```typescript
{
  type: 'auth_response',
  payload: {
    success: boolean,
    message: string,
    permissions?: number  // User permissions bitmask
  }
}
```

### Graph Update Messages

#### `graph_update`

Real-time graph modifications with conflict detection.

```typescript
{
  type: 'graph_update',
  payload: {
    documentId: string,
    operations: Array<{
      type: 'node_add' | 'node_update' | 'node_remove' |
            'edge_add' | 'edge_update' | 'edge_remove',
      nodeId?: string,
      edgeId?: string,
      data: any,
      oldValue?: any,
      timestamp: number,
      userId: string
    }>,
    version: number,
    checksum?: string
  }
}
```

#### `graph_update_response`

Server response to graph update.

```typescript
{
  type: 'graph_update_response',
  payload: {
    success: boolean,
    version: number,
    conflicts?: Array<ConflictInfo>
  }
}
```

### Presence Messages

#### `presence_update`

User presence, cursor, and selection updates.

```typescript
{
  type: 'presence_update',
  payload: {
    cursor?: {
      x: number,
      y: number,
      nodeId?: string,
      viewportBounds?: { x: number, y: number, width: number, height: number }
    },
    selection?: string[],  // Selected node IDs
    status: 'active' | 'idle' | 'away'
  }
}
```

#### `user_join`

Notification when user joins document.

```typescript
{
  type: 'user_join',
  payload: {
    userId: string,
    userName: string,
    userAvatar?: string,
    timestamp: number
  }
}
```

#### `user_leave`

Notification when user leaves document.

```typescript
{
  type: 'user_leave',
  payload: {
    userId: string,
    userName: string,
    timestamp: number
  }
}
```

### Synchronization Messages

#### `sync_request`

Request document state synchronization.

```typescript
{
  type: 'sync_request',
  payload: {
    clientVersion: number,
    fullSync?: boolean,
    checksum?: string
  }
}
```

#### `sync_response`

Server synchronization response.

```typescript
{
  type: 'sync_response',
  payload: {
    syncType: 'up_to_date' | 'patch' | 'full_sync',
    currentVersion: number,
    operations?: Array<Operation>,
    fullState?: any,
    conflicts: Array<ConflictInfo>
  }
}
```

### Conflict Resolution Messages

#### `conflict_detected`

Server notification of editing conflict.

```typescript
{
  type: 'conflict_detected',
  payload: {
    conflictId: string,
    type: ConflictType,
    description: string,
    involvedUsers: string[],
    requiresResolution: boolean,
    autoResolvable: boolean
  }
}
```

#### `resolve_conflict`

Client conflict resolution request.

```typescript
{
  type: 'resolve_conflict',
  payload: {
    conflictId: string,
    strategy: 'accept_local' | 'accept_remote' | 'merge' | 'manual',
    userSelection?: any
  }
}
```

---

## Presence Management

### Presence System Features

- **Real-time Cursors**: Live cursor position sharing with user identification
- **Selection Awareness**: Shared node/edge selections with visual indicators
- **Activity Tracking**: User typing, tool changes, and focus state
- **Status Management**: Online, idle, away, and offline presence states
- **Performance Optimized**: Throttled updates and efficient broadcasting

### Cursor Tracking

```typescript
// Client sends cursor position updates
const updateCursor = (x: number, y: number, nodeId?: string) => {
  ws.send(
    JSON.stringify({
      type: 'cursor_update',
      payload: { x, y, nodeId, viewportBounds: getViewportBounds() }
    })
  );
};

// Throttle cursor updates to avoid spam
const throttledUpdateCursor = throttle(updateCursor, 50); // 20 FPS max
```

### Selection Sharing

```typescript
// Share selected elements with other users
const updateSelection = (nodeIds: string[], edgeIds: string[]) => {
  ws.send(
    JSON.stringify({
      type: 'selection_update',
      payload: {
        nodeIds,
        edgeIds,
        selectionBox: calculateSelectionBounds(nodeIds, edgeIds)
      }
    })
  );
};
```

### Activity Tracking

```typescript
// Track user activity and tool usage
const updateActivity = (activity: {
  currentTool: string;
  isTyping: boolean;
  focusedNodeId?: string;
}) => {
  ws.send(
    JSON.stringify({
      type: 'activity_update',
      payload: activity
    })
  );
};
```

---

## Conflict Resolution

### Conflict Resolution Strategies

1. **Last Writer Wins** - Simple timestamp-based resolution
2. **Operational Transform** - Real-time collaborative editing algorithm
3. **Manual Merge** - User-guided conflict resolution
4. **Auto Merge** - Intelligent automatic merging for non-conflicting changes

### CRDT Integration

The system uses Conflict-free Replicated Data Types (CRDTs) for automatic conflict resolution:

```typescript
interface ConflictOperation {
  id: string;
  type: ConflictType;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  oldValue: any;
  newValue: any;
  userId: string;
  timestamp: number;
  documentId: string;
}

enum ConflictType {
  NODE_CREATION = 'node_creation',
  NODE_DELETION = 'node_deletion',
  NODE_PROPERTIES = 'node_properties',
  NODE_POSITION = 'node_position',
  EDGE_CREATION = 'edge_creation',
  EDGE_DELETION = 'edge_deletion',
  EDGE_PROPERTIES = 'edge_properties'
}
```

### Conflict Resolution Process

1. **Detection**: Server detects conflicting operations
2. **Analysis**: Determine conflict complexity and auto-resolution feasibility
3. **Strategy Selection**: Choose appropriate resolution strategy
4. **Resolution**: Apply resolution and notify all users
5. **Verification**: Ensure document integrity post-resolution

---

## Synchronization Protocol

### Version Control System

Each document maintains a version history with checksums for integrity verification:

```typescript
interface DocumentVersion {
  version: number;
  operations: Operation[];
  checksum: string;
  timestamp: number;
  author: string;
}
```

### Synchronization Types

1. **Incremental Sync**: Apply operation patches (most common)
2. **Full Sync**: Complete document state transfer (fallback)
3. **Verification Sync**: Checksum-based integrity verification

### State Integrity

```typescript
// Client requests state verification
ws.send(
  JSON.stringify({
    type: 'verify_state',
    payload: {
      localChecksum: calculateDocumentChecksum(document),
      localVersion: document.version
    }
  })
);
```

---

## Analytics Integration

### Collaboration Telemetry Events

The system tracks 50+ collaboration-specific events:

#### Session Events

- `collaborative_session_start`
- `collaborative_session_end`
- `user_presence_update`
- `concurrent_editors_peak`

#### Real-time Editing Events

- `simultaneous_edit_detected`
- `conflict_resolution_triggered`
- `conflict_resolution_completed`
- `operational_transform_applied`

#### Performance Events

- `collaboration_latency_measured`
- `websocket_connection_quality`
- `sync_performance_measured`

### Analytics WebSocket Server

Real-time analytics broadcasting on port 8001:

```javascript
const analyticsWs = new WebSocket('ws://localhost:8001');

analyticsWs.onmessage = event => {
  const analyticsEvent = JSON.parse(event.data);

  if (analyticsEvent.topic === 'collaboration_analytics') {
    updateCollaborationDashboard(analyticsEvent.data);
  }

  if (analyticsEvent.topic === 'epic23_alerts') {
    showPerformanceAlert(analyticsEvent.data);
  }
};
```

---

## Authentication & Security

### Authentication Flow

1. **Connection**: Client establishes WebSocket connection
2. **Challenge**: Server requires authentication within 30 seconds
3. **Credentials**: Client provides userId, token, and document context
4. **Validation**: Server validates credentials and workspace permissions
5. **Authorization**: Grant document-specific permissions
6. **Session**: Maintain authenticated session with heartbeat

### Security Features

- **JWT Token Validation**: Secure token-based authentication
- **Permission Checking**: Workspace and document-level access control
- **Rate Limiting**: Prevent message flooding and abuse
- **Input Validation**: Zod schema validation for all messages
- **CORS Protection**: Configurable origin restrictions
- **Connection Limits**: Per-workspace concurrent user limits

### Permission Model

```typescript
const PERMISSIONS = {
  WORKSPACE_READ: 1 << 0,
  WORKSPACE_WRITE: 1 << 1,
  WORKSPACE_ADMIN: 1 << 2,
  PROJECT_CREATE: 1 << 6,
  RESOURCE_WRITE: 1 << 9,
  COMMENT_WRITE: 1 << 13,
  USER_INVITE: 1 << 15
};

// Check user permissions
const hasPermission = (userPermissions: number, required: number): boolean => {
  return (userPermissions & required) === required;
};
```

---

## Client Integration Guide

### Basic Setup

```typescript
class CollaborationClient {
  private ws: WebSocket;
  private documentId: string;
  private userId: string;

  constructor(documentId: string, userId: string) {
    this.documentId = documentId;
    this.userId = userId;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket('ws://localhost:8000');

    this.ws.onopen = () => {
      this.authenticate();
    };

    this.ws.onmessage = event => {
      this.handleMessage(JSON.parse(event.data));
    };

    this.ws.onclose = () => {
      // Implement reconnection logic
      setTimeout(() => this.connect(), 1000);
    };
  }

  private authenticate() {
    this.send('auth_request', {
      userId: this.userId,
      documentId: this.documentId,
      userName: 'User Name',
      token: getAuthToken()
    });
  }

  private send(type: string, payload: any) {
    this.ws.send(JSON.stringify({ type, payload }));
  }
}
```

### React Integration Example

```tsx
import { useEffect, useState } from 'react';
import { CollaborationClient } from './collaboration-client';

export const CollaborativeEditor = ({ documentId, userId }) => {
  const [collaborationClient, setCollaborationClient] =
    useState<CollaborationClient>();
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [userCursors, setUserCursors] = useState<Map<string, CursorData>>(
    new Map()
  );

  useEffect(() => {
    const client = new CollaborationClient(documentId, userId);

    client.onUserJoin = user => {
      setConnectedUsers(prev => [...prev, user]);
    };

    client.onUserLeave = userId => {
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    client.onCursorUpdate = (userId, cursor) => {
      setUserCursors(prev => new Map(prev.set(userId, cursor)));
    };

    setCollaborationClient(client);

    return () => client.disconnect();
  }, [documentId, userId]);

  return (
    <div className="collaborative-editor">
      <UserPresenceIndicator users={connectedUsers} />
      <GraphEditor
        onNodeUpdate={update => collaborationClient?.sendGraphUpdate(update)}
        cursors={userCursors}
      />
    </div>
  );
};
```

---

## Performance & Scaling

### Performance Optimizations

1. **Message Throttling**: Limit cursor updates to 20 FPS
2. **Batch Operations**: Group related graph updates
3. **Selective Broadcasting**: Send messages only to relevant users
4. **Connection Pooling**: Efficient WebSocket connection management
5. **Memory Management**: Cleanup inactive sessions and presence data

### Scaling Recommendations

- **Horizontal Scaling**: Multiple WebSocket server instances with load balancing
- **Database Optimization**: Indexed queries for user permissions and document access
- **Caching**: Redis-based session and presence caching
- **CDN Integration**: WebSocket server distribution across regions
- **Monitoring**: Real-time performance monitoring and alerting

### Performance Metrics

The system tracks key collaboration performance indicators:

- **Real-time Latency**: Target ≤ 150ms (Epic 23 success criteria)
- **Conflict Resolution Rate**: Target ≥ 99% success rate
- **Connection Stability**: Target ≥ 99.9% uptime
- **Concurrent Users**: Support 50+ users per workspace
- **Message Throughput**: 1000+ messages/second per server

### Troubleshooting Guide

#### Common Issues

1. **Connection Failures**: Check network connectivity and server status
2. **Authentication Errors**: Verify token validity and user permissions
3. **Sync Issues**: Trigger manual sync or full document refresh
4. **Conflict Resolution Failures**: Escalate to manual resolution
5. **Performance Degradation**: Monitor server resources and connection counts

#### Debug Tools

```typescript
// Enable debug logging
const client = new CollaborationClient(documentId, userId, {
  debug: true,
  logLevel: 'verbose'
});

// Monitor connection health
client.onConnectionHealthChange = health => {
  console.log('Connection health:', health);
};

// Track message latency
client.onLatencyUpdate = latency => {
  if (latency > 150) {
    console.warn('High collaboration latency detected:', latency);
  }
};
```

---

## API Endpoints

### REST API

While most collaboration features use WebSocket protocol, some management operations use REST endpoints:

#### Workspace Management

- `GET /api/workspaces/:id/members` - Get workspace collaborators
- `PUT /api/workspaces/:id/users/:userId/role` - Update user role
- `DELETE /api/workspaces/:id/users/:userId` - Remove user from workspace

#### Analytics

- `GET /api/collaboration/dashboard` - Get collaboration metrics
- `GET /api/collaboration/epic23/status` - Get Epic 23 success criteria status

#### Health Checks

- `GET /api/collaboration/telemetry/health` - System health status
- `POST /api/workspaces/:id/validate-access` - Validate user access

---

This documentation provides a comprehensive reference for PromptScape's collaboration protocol and API system. For additional implementation details, see the source code documentation and integration examples in the `/examples` directory.
