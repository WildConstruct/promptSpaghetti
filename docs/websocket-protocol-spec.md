# WebSocket Protocol Specification

## Overview

This document provides the technical specification for PromptScape's WebSocket-based real-time collaboration protocol. It defines message formats, communication flows, and implementation requirements for client applications.

## Protocol Information

- **Protocol Version**: 1.0
- **WebSocket URL**: `ws://localhost:8000` (development), `wss://app.promptscape.com/ws` (production)
- **Subprotocol**: `promptscape-collaboration-v1`
- **Message Format**: JSON
- **Authentication**: Required within 30 seconds of connection

## Connection Lifecycle

### 1. Connection Establishment

```javascript
const ws = new WebSocket('ws://localhost:8000', ['promptscape-collaboration-v1']);

ws.onopen = (event) => {
  console.log('WebSocket connection established');
  // Client must authenticate within 30 seconds
  startAuthenticationFlow();
};

ws.onerror = (error) => {
  console.error('WebSocket connection error:', error);
};

ws.onclose = (event) => {
  console.log('WebSocket connection closed:', event.code, event.reason);
  // Implement reconnection logic based on close code
};
```

### 2. Authentication Phase

Immediately after connection, client must send authentication request:

```json
{
  "type": "auth_request",
  "payload": {
    "userId": "user-uuid-here",
    "documentId": "document-uuid-here", 
    "userName": "John Doe",
    "userAvatar": "https://example.com/avatar.jpg",
    "token": "jwt-token-here",
    "platform": "web"
  },
  "timestamp": 1640995200000,
  "messageId": "msg-uuid-here"
}
```

Server responds with authentication result:

```json
{
  "type": "auth_response", 
  "payload": {
    "success": true,
    "message": "Authentication successful",
    "permissions": 127
  },
  "timestamp": 1640995200001,
  "messageId": "response-uuid-here"
}
```

### 3. Document Join

After successful authentication, server automatically joins user to document and broadcasts presence:

```json
{
  "type": "user_join",
  "payload": {
    "userId": "user-uuid-here",
    "userName": "John Doe", 
    "userAvatar": "https://example.com/avatar.jpg",
    "timestamp": 1640995200002
  },
  "timestamp": 1640995200002,
  "messageId": "join-uuid-here",
  "documentId": "document-uuid-here"
}
```

### 4. Active Collaboration

Once joined, client can send/receive collaboration messages:

- **Graph Updates**: Real-time document modifications
- **Presence Updates**: Cursor, selection, and activity status
- **Synchronization**: Document state consistency
- **Conflict Resolution**: Handle editing conflicts

### 5. Graceful Disconnection

Client should send leave notification (optional):

```json
{
  "type": "user_leave_request",
  "payload": {
    "reason": "user_initiated"
  },
  "timestamp": 1640995300000,
  "messageId": "leave-uuid-here"
}
```

## Message Format Specification

### Base Message Structure

All WebSocket messages must conform to this format:

```typescript
interface WSMessage {
  type: string;           // Required: Message type identifier
  payload: object;        // Required: Message-specific data
  timestamp: number;      // Required: Unix timestamp in milliseconds
  messageId: string;      // Required: Unique message identifier (UUID)
  documentId?: string;    // Optional: Document context (server adds if missing)
  userId?: string;        // Optional: Message author (server adds from session)
}
```

### Message Validation

Server validates all incoming messages using Zod schemas:

```typescript
const WSMessageSchema = z.object({
  type: z.string().min(1).max(50),
  payload: z.record(z.unknown()),
  timestamp: z.number().int().positive(),
  messageId: z.string().uuid(),
  documentId: z.string().uuid().optional(),
  userId: z.string().optional()
});
```

Invalid messages result in error response:

```json
{
  "type": "error",
  "payload": {
    "error": "Invalid message format",
    "details": "Missing required field: type"
  },
  "timestamp": 1640995200003,
  "messageId": "error-uuid-here"
}
```

## Message Types

### Authentication Messages

#### `auth_request` (Client → Server)

**Purpose**: Authenticate user for collaboration session

**Payload Schema**:
```typescript
{
  userId: string;         // UUID of authenticated user
  documentId: string;     // UUID of document to join
  userName: string;       // Display name for other users
  userAvatar?: string;    // Profile image URL (optional)
  token?: string;         // JWT authentication token (optional)  
  platform?: string;     // Client platform: 'web', 'desktop', 'mobile'
}
```

**Example**:
```json
{
  "type": "auth_request",
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "documentId": "550e8400-e29b-41d4-a716-446655440002", 
    "userName": "Alice Smith",
    "userAvatar": "https://example.com/avatars/alice.jpg",
    "platform": "web"
  },
  "timestamp": 1640995200000,
  "messageId": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### `auth_response` (Server → Client)

**Purpose**: Authentication result

**Payload Schema**:
```typescript
{
  success: boolean;       // Authentication success/failure
  message: string;        // Human-readable message
  permissions?: number;   // User permissions bitmask (if successful)
}
```

### Graph Update Messages

#### `graph_update` (Client → Server, Server → Clients)

**Purpose**: Real-time graph modifications with conflict detection

**Payload Schema**:
```typescript
{
  documentId: string;     // Document being modified
  operations: Array<{    // Atomic operations to apply
    type: 'node_add' | 'node_update' | 'node_remove' | 
          'edge_add' | 'edge_update' | 'edge_remove';
    nodeId?: string;      // Target node ID (if applicable)
    edgeId?: string;      // Target edge ID (if applicable) 
    data: any;            // Operation data (new values)
    oldValue?: any;       // Previous values (for updates)
    timestamp: number;    // Operation timestamp
    userId: string;       // Operation author
  }>;
  version: number;        // Expected document version
  checksum?: string;      // Document integrity checksum
}
```

**Example**:
```json
{
  "type": "graph_update",
  "payload": {
    "documentId": "550e8400-e29b-41d4-a716-446655440002",
    "operations": [
      {
        "type": "node_update",
        "nodeId": "node-123",
        "data": {
          "label": "Updated Node Label",
          "position": { "x": 100, "y": 200 }
        },
        "oldValue": {
          "label": "Old Node Label",
          "position": { "x": 50, "y": 150 }
        },
        "timestamp": 1640995200000,
        "userId": "550e8400-e29b-41d4-a716-446655440001"
      }
    ],
    "version": 15,
    "checksum": "sha256:abc123..."
  },
  "timestamp": 1640995200000,
  "messageId": "550e8400-e29b-41d4-a716-446655440004"
}
```

#### `graph_update_response` (Server → Client)

**Purpose**: Server response to graph update

**Payload Schema**:
```typescript
{
  success: boolean;           // Update success/failure
  version: number;            // Current document version
  conflicts?: Array<{        // Detected conflicts (if any)
    conflictId: string;
    type: ConflictType;
    description: string;
    requiresUserInput: boolean;
  }>;
}
```

### Presence Messages

#### `presence_update` (Client → Server, Server → Clients)

**Purpose**: User presence, cursor, and selection updates

**Payload Schema**:
```typescript
{
  cursor?: {              // Cursor position (optional)
    x: number;            // Absolute X coordinate
    y: number;            // Absolute Y coordinate  
    nodeId?: string;      // Node being hovered/edited
    viewportBounds?: {    // Client viewport info
      x: number;
      y: number; 
      width: number;
      height: number;
    };
  };
  selection?: string[];   // Array of selected node/edge IDs
  status: 'active' | 'idle' | 'away' | 'offline';  // User status
  activity?: {           // Current user activity
    tool: string;        // Active tool name
    isTyping: boolean;   // User is typing
    focusedElement?: string;  // Focused node/edge ID
  };
}
```

**Example**:
```json
{
  "type": "presence_update",
  "payload": {
    "cursor": {
      "x": 250,
      "y": 180,
      "nodeId": "node-456"
    },
    "selection": ["node-123", "node-456"],
    "status": "active",
    "activity": {
      "tool": "select",
      "isTyping": false
    }
  },
  "timestamp": 1640995200000,
  "messageId": "550e8400-e29b-41d4-a716-446655440005"
}
```

#### `user_join` (Server → Clients)

**Purpose**: Notification when user joins document

**Payload Schema**:
```typescript
{
  userId: string;         // Joining user ID
  userName: string;       // Display name
  userAvatar?: string;    // Avatar URL
  timestamp: number;      // Join timestamp
}
```

#### `user_leave` (Server → Clients)

**Purpose**: Notification when user leaves document

**Payload Schema**:
```typescript
{
  userId: string;         // Leaving user ID
  userName: string;       // Display name
  timestamp: number;      // Leave timestamp
}
```

### Synchronization Messages

#### `sync_request` (Client → Server)

**Purpose**: Request document state synchronization

**Payload Schema**:
```typescript
{
  clientVersion: number;  // Client's current document version
  fullSync?: boolean;     // Request full document state (optional)
  checksum?: string;      // Client's document checksum for verification
}
```

#### `sync_response` (Server → Client)

**Purpose**: Server synchronization response

**Payload Schema**:
```typescript
{
  syncType: 'up_to_date' | 'patch' | 'full_sync';  // Sync operation type
  currentVersion: number;                          // Server document version
  operations?: Array<Operation>;                   // Operations to apply (patch mode)
  fullState?: any;                                // Complete document state (full sync)
  conflicts: Array<ConflictInfo>;                // Any unresolved conflicts
  checksum: string;                               // Server document checksum
}
```

### Conflict Resolution Messages

#### `conflict_detected` (Server → Client)

**Purpose**: Server notification of editing conflict

**Payload Schema**:
```typescript
{
  conflictId: string;             // Unique conflict identifier
  type: ConflictType;             // Type of conflict detected
  description: string;            // Human-readable description
  involvedUsers: string[];        // Users involved in conflict
  requiresResolution: boolean;    // Needs manual resolution
  autoResolvable: boolean;        // Can be auto-resolved
  conflictData: {                // Conflict details
    operation1: Operation;        // First conflicting operation
    operation2: Operation;        // Second conflicting operation
    timestamp: number;            // Conflict detection time
  };
}
```

#### `resolve_conflict` (Client → Server)

**Purpose**: Client conflict resolution request

**Payload Schema**:
```typescript
{
  conflictId: string;                                    // Conflict to resolve
  strategy: 'accept_local' | 'accept_remote' |          // Resolution strategy
           'merge' | 'manual';
  userSelection?: any;                                   // Manual resolution data
}
```

### Utility Messages

#### `ping` (Client → Server)

**Purpose**: Heartbeat/latency measurement

**Payload Schema**:
```typescript
{
  timestamp: number;      // Client timestamp for latency calculation
}
```

#### `pong` (Server → Client)

**Purpose**: Heartbeat response

**Payload Schema**:
```typescript
{
  timestamp: number;      // Server timestamp
  clientTimestamp: number; // Original client timestamp
}
```

#### `error` (Server → Client)

**Purpose**: Error notification

**Payload Schema**:
```typescript
{
  error: string;          // Error type/code
  details: string;        // Detailed error message
  recoverable: boolean;   // Whether client should retry
}
```

## Error Handling

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `AUTHENTICATION_FAILED` | Invalid credentials | Re-authenticate |
| `PERMISSION_DENIED` | Insufficient permissions | Show error to user |
| `DOCUMENT_NOT_FOUND` | Document doesn't exist | Redirect to document list |
| `VERSION_CONFLICT` | Document version mismatch | Trigger full sync |
| `INVALID_MESSAGE` | Malformed message | Fix client implementation |
| `RATE_LIMITED` | Too many messages | Implement throttling |
| `SERVER_ERROR` | Internal server error | Retry with backoff |

### Error Response Format

```json
{
  "type": "error",
  "payload": {
    "error": "PERMISSION_DENIED",
    "details": "User does not have write permissions for this document",
    "recoverable": false
  },
  "timestamp": 1640995200000,
  "messageId": "error-uuid-here"
}
```

### Client Error Handling

```typescript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'error') {
    const { error, details, recoverable } = message.payload;
    
    switch (error) {
      case 'AUTHENTICATION_FAILED':
        // Redirect to login
        break;
      case 'PERMISSION_DENIED':
        // Show permission error
        break;
      case 'VERSION_CONFLICT':
        // Trigger full document sync
        requestFullSync();
        break;
      default:
        console.error('Collaboration error:', details);
    }
  }
};
```

## Implementation Requirements

### Client Requirements

1. **Message Validation**: Validate all outgoing messages before sending
2. **Throttling**: Implement rate limiting for high-frequency messages (cursors, presence)
3. **Reconnection Logic**: Automatic reconnection with exponential backoff
4. **State Management**: Maintain local document state and sync status
5. **Error Handling**: Graceful error handling and user notification
6. **Heartbeat**: Send ping messages every 30 seconds to maintain connection

### Server Requirements

1. **Message Validation**: Validate all incoming messages using Zod schemas
2. **Authentication**: Verify user credentials and permissions
3. **Conflict Detection**: Identify and resolve editing conflicts
4. **State Synchronization**: Maintain document consistency across clients
5. **Performance Monitoring**: Track latency and connection health
6. **Cleanup**: Remove inactive sessions and presence data

## Performance Guidelines

### Message Throttling

```typescript
// Throttle cursor updates to 20 FPS maximum
const throttledCursorUpdate = throttle((x, y) => {
  ws.send(JSON.stringify({
    type: 'cursor_update',
    payload: { x, y },
    timestamp: Date.now(),
    messageId: generateUUID()
  }));
}, 50); // 50ms = 20 FPS
```

### Batch Operations

```typescript
// Batch multiple graph operations into single message
const batchedOperations = [];

const addOperation = (operation) => {
  batchedOperations.push(operation);
  
  // Send batch when it reaches certain size or after timeout
  if (batchedOperations.length >= 10) {
    sendGraphUpdate(batchedOperations);
    batchedOperations.length = 0;
  }
};

// Send remaining operations after timeout
setTimeout(() => {
  if (batchedOperations.length > 0) {
    sendGraphUpdate(batchedOperations);
    batchedOperations.length = 0;
  }
}, 100); // 100ms timeout
```

### Connection Management

```typescript
class CollaborationWebSocket {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.connect();
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
      }, this.reconnectDelay);
    }
  }
  
  private onOpen() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay
    this.authenticate();
  }
}
```

This specification provides the complete technical details for implementing WebSocket-based collaboration in PromptScape applications.