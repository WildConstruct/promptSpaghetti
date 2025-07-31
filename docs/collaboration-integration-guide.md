# Collaboration Integration Guide

## Overview

This guide provides step-by-step instructions for integrating PromptScape's real-time collaboration features into client applications. It includes code examples, best practices, and troubleshooting tips for developers.

## Table of Contents

- [Quick Start](#quick-start)
- [Client Setup](#client-setup)
- [Authentication Integration](#authentication-integration)
- [Real-time Editing](#real-time-editing)
- [Presence Management](#presence-management)
- [Conflict Resolution](#conflict-resolution)
- [React Integration](#react-integration)
- [Vue.js Integration](#vue-integration)
- [Angular Integration](#angular-integration)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install uuid throttle-debounce
```

### 2. Create Basic Collaboration Client

```typescript
import { throttle } from 'throttle-debounce';
import { v4 as uuidv4 } from 'uuid';

class CollaborationClient {
  private ws: WebSocket | null = null;
  private documentId: string;
  private userId: string;
  private userName: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Event handlers
  public onConnected: (() => void) | null = null;
  public onDisconnected: (() => void) | null = null;
  public onUserJoin: ((user: any) => void) | null = null;
  public onUserLeave: ((userId: string) => void) | null = null;
  public onGraphUpdate: ((update: any) => void) | null = null;
  public onCursorUpdate: ((userId: string, cursor: any) => void) | null = null;

  constructor(documentId: string, userId: string, userName: string) {
    this.documentId = documentId;
    this.userId = userId;
    this.userName = userName;
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:8000');

    this.ws.onopen = () => {
      console.log('Connected to collaboration server');
      this.authenticate();
      this.onConnected?.();
    };

    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from collaboration server');
      this.onDisconnected?.();
      this.handleReconnection();
    };

    this.ws.onerror = error => {
      console.error('WebSocket error:', error);
    };
  }

  private authenticate() {
    this.send('auth_request', {
      userId: this.userId,
      documentId: this.documentId,
      userName: this.userName,
      platform: 'web',
    });
  }

  private send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          payload,
          timestamp: Date.now(),
          messageId: uuidv4(),
        })
      );
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'auth_response':
        if (message.payload.success) {
          console.log('Authentication successful');
        } else {
          console.error('Authentication failed:', message.payload.message);
        }
        break;

      case 'user_join':
        this.onUserJoin?.(message.payload);
        break;

      case 'user_leave':
        this.onUserLeave?.(message.payload.userId);
        break;

      case 'graph_update':
        this.onGraphUpdate?.(message.payload);
        break;

      case 'presence_update':
        this.onCursorUpdate?.(message.payload.userId, message.payload.cursor);
        break;
    }
  }

  // Public methods
  sendGraphUpdate(operations: any[]) {
    this.send('graph_update', {
      documentId: this.documentId,
      operations,
      version: this.getCurrentVersion(),
    });
  }

  sendCursorUpdate = throttle(50, (x: number, y: number) => {
    this.send('presence_update', {
      cursor: { x, y },
      status: 'active',
    });
  });

  disconnect() {
    this.ws?.close();
  }

  private getCurrentVersion(): number {
    // Return current document version
    return 1;
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }
}
```

### 3. Basic Usage

```typescript
const collaboration = new CollaborationClient('document-uuid-here', 'user-uuid-here', 'John Doe');

collaboration.onUserJoin = user => {
  console.log('User joined:', user.userName);
  updateUsersList();
};

collaboration.onGraphUpdate = update => {
  console.log('Graph updated:', update);
  applyGraphUpdate(update);
};

collaboration.connect();
```

---

## Client Setup

### Environment Configuration

Create a configuration file for different environments:

```typescript
// config/collaboration.ts
interface CollaborationConfig {
  websocketUrl: string;
  reconnectAttempts: number;
  heartbeatInterval: number;
  cursorThrottle: number;
}

export const collaborationConfig: Record<string, CollaborationConfig> = {
  development: {
    websocketUrl: 'ws://localhost:8000',
    reconnectAttempts: 5,
    heartbeatInterval: 30000,
    cursorThrottle: 50,
  },
  production: {
    websocketUrl: 'wss://api.promptscape.com/ws',
    reconnectAttempts: 3,
    heartbeatInterval: 30000,
    cursorThrottle: 50,
  },
};

export const getConfig = (): CollaborationConfig => {
  const env = process.env.NODE_ENV || 'development';
  return collaborationConfig[env] || collaborationConfig.development;
};
```

### Connection State Management

```typescript
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

class ConnectionManager {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private listeners: Map<ConnectionState, Function[]> = new Map();

  setState(newState: ConnectionState) {
    const previousState = this.state;
    this.state = newState;

    // Notify listeners
    const callbacks = this.listeners.get(newState) || [];
    callbacks.forEach(callback => callback(newState, previousState));
  }

  onStateChange(state: ConnectionState, callback: Function) {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, []);
    }
    this.listeners.get(state)!.push(callback);
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === ConnectionState.AUTHENTICATED;
  }
}
```

---

## Authentication Integration

### JWT Token Integration

```typescript
interface AuthConfig {
  getToken: () => Promise<string>;
  onAuthError: (error: string) => void;
}

class AuthenticatedCollaborationClient extends CollaborationClient {
  private authConfig: AuthConfig;

  constructor(documentId: string, userId: string, userName: string, authConfig: AuthConfig) {
    super(documentId, userId, userName);
    this.authConfig = authConfig;
  }

  protected async authenticate() {
    try {
      const token = await this.authConfig.getToken();

      this.send('auth_request', {
        userId: this.userId,
        documentId: this.documentId,
        userName: this.userName,
        token: token,
        platform: 'web',
      });
    } catch (error) {
      this.authConfig.onAuthError('Failed to get authentication token');
    }
  }

  protected handleMessage(message: any) {
    super.handleMessage(message);

    if (message.type === 'auth_response' && !message.payload.success) {
      this.authConfig.onAuthError(message.payload.message);
    }
  }
}

// Usage
const authClient = new AuthenticatedCollaborationClient(documentId, userId, userName, {
  getToken: async () => {
    return localStorage.getItem('auth_token') || '';
  },
  onAuthError: error => {
    console.error('Auth error:', error);
    // Redirect to login page
    window.location.href = '/login';
  },
});
```

### Permission Checking

```typescript
interface UserPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  isAdmin: boolean;
}

class PermissionManager {
  private permissions: UserPermissions = {
    canEdit: false,
    canComment: false,
    canInvite: false,
    isAdmin: false,
  };

  updatePermissions(permissionsBitmask: number) {
    this.permissions = {
      canEdit: (permissionsBitmask & 0b10) !== 0,
      canComment: (permissionsBitmask & 0b1000000000000) !== 0,
      canInvite: (permissionsBitmask & 0b1000000000000000) !== 0,
      isAdmin: (permissionsBitmask & 0b100) !== 0,
    };
  }

  getPermissions(): UserPermissions {
    return { ...this.permissions };
  }

  canPerformAction(action: keyof UserPermissions): boolean {
    return this.permissions[action];
  }
}
```

---

## Real-time Editing

### Graph Update Management

```typescript
interface GraphOperation {
  type: 'node_add' | 'node_update' | 'node_remove' | 'edge_add' | 'edge_update' | 'edge_remove';
  nodeId?: string;
  edgeId?: string;
  data: any;
  oldValue?: any;
  timestamp: number;
  userId: string;
}

class GraphUpdateManager {
  private pendingOperations: GraphOperation[] = [];
  private version: number = 0;
  private collaborationClient: CollaborationClient;

  constructor(collaborationClient: CollaborationClient) {
    this.collaborationClient = collaborationClient;

    // Listen for remote updates
    collaborationClient.onGraphUpdate = update => {
      this.applyRemoteUpdate(update);
    };
  }

  // Local operations
  addNode(node: any) {
    const operation: GraphOperation = {
      type: 'node_add',
      nodeId: node.id,
      data: node,
      timestamp: Date.now(),
      userId: this.collaborationClient.userId,
    };

    this.applyLocalOperation(operation);
    this.sendOperation(operation);
  }

  updateNode(nodeId: string, newData: any, oldData: any) {
    const operation: GraphOperation = {
      type: 'node_update',
      nodeId,
      data: newData,
      oldValue: oldData,
      timestamp: Date.now(),
      userId: this.collaborationClient.userId,
    };

    this.applyLocalOperation(operation);
    this.sendOperation(operation);
  }

  removeNode(nodeId: string) {
    const operation: GraphOperation = {
      type: 'node_remove',
      nodeId,
      data: null,
      timestamp: Date.now(),
      userId: this.collaborationClient.userId,
    };

    this.applyLocalOperation(operation);
    this.sendOperation(operation);
  }

  private applyLocalOperation(operation: GraphOperation) {
    // Apply operation to local graph state
    this.executeOperation(operation);
    this.version++;
  }

  private applyRemoteUpdate(update: any) {
    // Apply remote operations to local state
    update.operations.forEach((op: GraphOperation) => {
      if (op.userId !== this.collaborationClient.userId) {
        this.executeOperation(op);
      }
    });

    this.version = update.version;
  }

  private executeOperation(operation: GraphOperation) {
    switch (operation.type) {
      case 'node_add':
        this.addNodeToGraph(operation.data);
        break;
      case 'node_update':
        this.updateNodeInGraph(operation.nodeId!, operation.data);
        break;
      case 'node_remove':
        this.removeNodeFromGraph(operation.nodeId!);
        break;
      // Handle edge operations similarly
    }
  }

  private sendOperation(operation: GraphOperation) {
    this.collaborationClient.sendGraphUpdate([operation]);
  }

  // Graph manipulation methods (implement based on your graph library)
  private addNodeToGraph(nodeData: any) {
    // Implementation specific to your graph library
  }

  private updateNodeInGraph(nodeId: string, newData: any) {
    // Implementation specific to your graph library
  }

  private removeNodeFromGraph(nodeId: string) {
    // Implementation specific to your graph library
  }
}
```

### Operational Transform Integration

```typescript
class OperationalTransform {
  static transform(op1: GraphOperation, op2: GraphOperation): [GraphOperation, GraphOperation] {
    // Implement operational transform logic based on operation types

    if (op1.type === 'node_update' && op2.type === 'node_update' && op1.nodeId === op2.nodeId) {
      // Both operations update the same node - need to merge
      return OperationalTransform.transformNodeUpdate(op1, op2);
    }

    if (op1.type === 'node_remove' && op2.type === 'node_update' && op1.nodeId === op2.nodeId) {
      // One removes, one updates - removal wins
      return [op1, { ...op2, type: 'node_remove' }];
    }

    // No conflict, operations can be applied as-is
    return [op1, op2];
  }

  private static transformNodeUpdate(op1: GraphOperation, op2: GraphOperation): [GraphOperation, GraphOperation] {
    // Merge properties from both updates
    const mergedData = {
      ...op1.oldValue,
      ...op1.data,
      ...op2.data,
    };

    return [
      { ...op1, data: mergedData },
      { ...op2, data: mergedData },
    ];
  }
}
```

---

## Presence Management

### Cursor Tracking

```typescript
interface CursorData {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
  nodeId?: string;
}

class CursorManager {
  private cursors: Map<string, CursorData> = new Map();
  private collaborationClient: CollaborationClient;
  private cursorColors: string[] = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  constructor(collaborationClient: CollaborationClient) {
    this.collaborationClient = collaborationClient;

    collaborationClient.onCursorUpdate = (userId, cursor) => {
      this.updateCursor(userId, cursor);
    };

    collaborationClient.onUserJoin = user => {
      this.addUser(user);
    };

    collaborationClient.onUserLeave = userId => {
      this.removeUser(userId);
    };
  }

  private addUser(user: any) {
    const color = this.cursorColors[this.cursors.size % this.cursorColors.length];

    this.cursors.set(user.userId, {
      x: 0,
      y: 0,
      userId: user.userId,
      userName: user.userName,
      color: color,
    });

    this.renderCursors();
  }

  private removeUser(userId: string) {
    this.cursors.delete(userId);
    this.renderCursors();
  }

  private updateCursor(userId: string, cursor: any) {
    const existingCursor = this.cursors.get(userId);
    if (existingCursor) {
      existingCursor.x = cursor.x;
      existingCursor.y = cursor.y;
      existingCursor.nodeId = cursor.nodeId;

      this.renderCursors();
    }
  }

  sendCursorPosition(x: number, y: number, nodeId?: string) {
    this.collaborationClient.sendCursorUpdate(x, y);
  }

  private renderCursors() {
    // Remove existing cursor elements
    document.querySelectorAll('.collaboration-cursor').forEach(el => el.remove());

    // Render each cursor
    this.cursors.forEach(cursor => {
      if (cursor.userId !== this.collaborationClient.userId) {
        this.renderCursor(cursor);
      }
    });
  }

  private renderCursor(cursor: CursorData) {
    const cursorElement = document.createElement('div');
    cursorElement.className = 'collaboration-cursor';
    cursorElement.style.cssText = `
      position: absolute;
      left: ${cursor.x}px;
      top: ${cursor.y}px;
      width: 20px;
      height: 20px;
      background-color: ${cursor.color};
      border-radius: 50% 50% 0 50%;
      transform: rotate(-45deg);
      pointer-events: none;
      z-index: 1000;
    `;

    // Add user name label
    const label = document.createElement('div');
    label.textContent = cursor.userName;
    label.style.cssText = `
      position: absolute;
      left: 25px;
      top: -5px;
      background: ${cursor.color};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      transform: rotate(45deg);
    `;

    cursorElement.appendChild(label);
    document.body.appendChild(cursorElement);
  }
}
```

### Selection Sharing

```typescript
class SelectionManager {
  private selections: Map<string, string[]> = new Map();
  private collaborationClient: CollaborationClient;

  constructor(collaborationClient: CollaborationClient) {
    this.collaborationClient = collaborationClient;

    collaborationClient.onSelectionUpdate = (userId, selection) => {
      this.updateUserSelection(userId, selection);
    };
  }

  updateLocalSelection(selectedIds: string[]) {
    this.collaborationClient.send('selection_update', {
      nodeIds: selectedIds,
      edgeIds: [],
    });

    this.renderSelections();
  }

  private updateUserSelection(userId: string, selection: string[]) {
    this.selections.set(userId, selection);
    this.renderSelections();
  }

  private renderSelections() {
    // Remove existing selection indicators
    document.querySelectorAll('.collaboration-selection').forEach(el => el.remove());

    // Render each user's selection
    this.selections.forEach((selection, userId) => {
      if (userId !== this.collaborationClient.userId) {
        this.renderUserSelection(userId, selection);
      }
    });
  }

  private renderUserSelection(userId: string, selection: string[]) {
    selection.forEach(nodeId => {
      const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeElement) {
        const indicator = document.createElement('div');
        indicator.className = 'collaboration-selection';
        indicator.style.cssText = `
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid ${this.getUserColor(userId)};
          border-radius: 4px;
          pointer-events: none;
        `;

        nodeElement.style.position = 'relative';
        nodeElement.appendChild(indicator);
      }
    });
  }

  private getUserColor(userId: string): string {
    // Return consistent color for user
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const index = Array.from(this.selections.keys()).indexOf(userId);
    return colors[index % colors.length];
  }
}
```

---

## Conflict Resolution

### Conflict Detection and Handling

```typescript
interface ConflictInfo {
  conflictId: string;
  type: string;
  description: string;
  involvedUsers: string[];
  requiresResolution: boolean;
  conflictData: any;
}

class ConflictResolver {
  private activeConflicts: Map<string, ConflictInfo> = new Map();
  private collaborationClient: CollaborationClient;

  constructor(collaborationClient: CollaborationClient) {
    this.collaborationClient = collaborationClient;

    collaborationClient.onConflictDetected = conflict => {
      this.handleConflictDetected(conflict);
    };

    collaborationClient.onConflictResolved = resolution => {
      this.handleConflictResolved(resolution);
    };
  }

  private handleConflictDetected(conflict: ConflictInfo) {
    this.activeConflicts.set(conflict.conflictId, conflict);

    if (conflict.requiresResolution) {
      this.showConflictResolutionDialog(conflict);
    } else {
      // Auto-resolve conflict
      this.resolveConflict(conflict.conflictId, 'auto');
    }
  }

  private showConflictResolutionDialog(conflict: ConflictInfo) {
    const dialog = document.createElement('div');
    dialog.className = 'conflict-resolution-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Editing Conflict Detected</h3>
        <p>${conflict.description}</p>
        <div class="conflict-options">
          <button onclick="resolveConflict('${conflict.conflictId}', 'accept_local')">
            Keep My Changes
          </button>
          <button onclick="resolveConflict('${conflict.conflictId}', 'accept_remote')">
            Accept Their Changes
          </button>
          <button onclick="resolveConflict('${conflict.conflictId}', 'merge')">
            Merge Changes
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Make resolution function globally available
    (window as any).resolveConflict = (conflictId: string, strategy: string) => {
      this.resolveConflict(conflictId, strategy);
      dialog.remove();
    };
  }

  private resolveConflict(conflictId: string, strategy: string, userSelection?: any) {
    this.collaborationClient.send('resolve_conflict', {
      conflictId,
      strategy,
      userSelection,
    });
  }

  private handleConflictResolved(resolution: any) {
    const conflict = this.activeConflicts.get(resolution.conflictId);
    if (conflict) {
      this.activeConflicts.delete(resolution.conflictId);

      // Apply resolution to local state
      this.applyConflictResolution(resolution);

      // Show success message
      this.showResolutionSuccess(conflict);
    }
  }

  private applyConflictResolution(resolution: any) {
    // Apply the resolved state to the document
    console.log('Conflict resolved:', resolution);
  }

  private showResolutionSuccess(conflict: ConflictInfo) {
    const notification = document.createElement('div');
    notification.className = 'conflict-resolution-success';
    notification.textContent = 'Conflict resolved successfully';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 1001;
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}
```

---

## React Integration

### Collaboration Hook

```typescript
import { useEffect, useState, useCallback } from 'react';
import { CollaborationClient } from './collaboration-client';

interface UseCollaborationOptions {
  documentId: string;
  userId: string;
  userName: string;
  onError?: (error: string) => void;
}

interface UseCollaborationReturn {
  isConnected: boolean;
  connectedUsers: any[];
  cursors: Map<string, any>;
  sendGraphUpdate: (operations: any[]) => void;
  sendCursorUpdate: (x: number, y: number) => void;
  disconnect: () => void;
}

export const useCollaboration = (options: UseCollaborationOptions): UseCollaborationReturn => {
  const [client, setClient] = useState<CollaborationClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const collaborationClient = new CollaborationClient(options.documentId, options.userId, options.userName);

    // Set up event handlers
    collaborationClient.onConnected = () => {
      setIsConnected(true);
    };

    collaborationClient.onDisconnected = () => {
      setIsConnected(false);
    };

    collaborationClient.onUserJoin = user => {
      setConnectedUsers(prev => [...prev, user]);
    };

    collaborationClient.onUserLeave = userId => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== userId));
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
    };

    collaborationClient.onCursorUpdate = (userId, cursor) => {
      setCursors(prev => new Map(prev.set(userId, cursor)));
    };

    // Connect to server
    collaborationClient.connect();
    setClient(collaborationClient);

    // Cleanup on unmount
    return () => {
      collaborationClient.disconnect();
    };
  }, [options.documentId, options.userId, options.userName]);

  const sendGraphUpdate = useCallback(
    (operations: any[]) => {
      client?.sendGraphUpdate(operations);
    },
    [client]
  );

  const sendCursorUpdate = useCallback(
    (x: number, y: number) => {
      client?.sendCursorUpdate(x, y);
    },
    [client]
  );

  const disconnect = useCallback(() => {
    client?.disconnect();
  }, [client]);

  return {
    isConnected,
    connectedUsers,
    cursors,
    sendGraphUpdate,
    sendCursorUpdate,
    disconnect,
  };
};
```

### React Component Example

```tsx
import React, { useEffect, useRef } from 'react';
import { useCollaboration } from './hooks/useCollaboration';

interface CollaborativeGraphEditorProps {
  documentId: string;
  userId: string;
  userName: string;
}

export const CollaborativeGraphEditor: React.FC<CollaborativeGraphEditorProps> = ({ documentId, userId, userName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isConnected, connectedUsers, cursors, sendGraphUpdate, sendCursorUpdate } = useCollaboration({
    documentId,
    userId,
    userName,
  });

  // Handle mouse movement for cursor sharing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      sendCursorUpdate(x, y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sendCursorUpdate]);

  // Render cursors
  const renderCursors = () => {
    return Array.from(cursors.entries()).map(([userId, cursor]) => (
      <div
        key={userId}
        className="collaboration-cursor"
        style={{
          position: 'absolute',
          left: cursor.x,
          top: cursor.y,
          pointerEvents: 'none',
        }}
      >
        <div className="cursor-pointer" />
        <div className="cursor-label">{cursor.userName}</div>
      </div>
    ));
  };

  return (
    <div className="collaborative-editor">
      <div className="connection-status">
        {isConnected ? (
          <span className="connected">Connected</span>
        ) : (
          <span className="disconnected">Connecting...</span>
        )}
      </div>

      <div className="users-list">
        <h4>Active Users ({connectedUsers.length})</h4>
        {connectedUsers.map(user => (
          <div key={user.userId} className="user-item">
            <img src={user.userAvatar} alt={user.userName} />
            <span>{user.userName}</span>
          </div>
        ))}
      </div>

      <div className="editor-container" style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #ccc' }} />
        {renderCursors()}
      </div>
    </div>
  );
};
```

---

This integration guide provides comprehensive examples and patterns for implementing real-time collaboration in various frameworks and scenarios. For more advanced features and custom implementations, refer to the complete API documentation and protocol specifications.
