import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { ConnectionInfo, DocumentSession, WSMessage, WSServerConfig, HealthMetrics, AuthPayload } from './types';

export class ConnectionManager extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private connectionInfo: Map<string, ConnectionInfo> = new Map();
  private documentSessions: Map<string, DocumentSession> = new Map();
  private config: WSServerConfig;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private metrics: HealthMetrics;
  private startTime: number;

  constructor(config: WSServerConfig) {
    super();
    this.config = config;
    this.startTime = Date.now();
    this.metrics = {
      totalConnections: 0,
      activeDocuments: 0,
      messagesPerSecond: 0,
      uptime: 0,
      memoryUsage: 0,
      lastUpdated: Date.now(),
    };

    this.startHeartbeat();
    this.startMetricsCollection();
  }

  /**
   * Add a new WebSocket connection
   */
  addConnection(ws: WebSocket, request: any): string {
    const connectionId = uuidv4();

    // Extract basic info from request
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.socket.remoteAddress;

    // Store connection
    this.connections.set(connectionId, ws);

    // Initialize connection info (authentication required)
    const connectionInfo: ConnectionInfo = {
      id: connectionId,
      userId: '', // Will be set during authentication
      documentId: '', // Will be set during authentication
      permissions: [],
      lastSeen: Date.now(),
      authenticated: false,
      userAgent,
      ipAddress,
    };

    this.connectionInfo.set(connectionId, connectionInfo);

    // Set up WebSocket event handlers
    this.setupWebSocketHandlers(ws, connectionId);

    this.emit('connection_added', connectionId, connectionInfo);
    this.updateMetrics();

    return connectionId;
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    const connectionInfo = this.connectionInfo.get(connectionId);

    if (connectionInfo) {
      // Remove from document session
      if (connectionInfo.documentId) {
        this.removeFromDocumentSession(connectionInfo.documentId, connectionId);
      }

      // Clean up connection
      this.connections.delete(connectionId);
      this.connectionInfo.delete(connectionId);

      this.emit('connection_removed', connectionId, connectionInfo);
      this.updateMetrics();
    }
  }

  /**
   * Authenticate a connection
   */
  async authenticateConnection(connectionId: string, authPayload: AuthPayload): Promise<boolean> {
    try {
      if (!this.config.enableAuthentication) {
        // Skip authentication if disabled
        return this.setConnectionAuthenticated(connectionId, 'anonymous', authPayload.documentId, ['read', 'write']);
      }

      if (!this.config.jwtSecret) {
        throw new Error('JWT secret not configured');
      }

      // Verify JWT token
      const decoded = jwt.verify(authPayload.token, this.config.jwtSecret) as any;

      if (!decoded.userId) {
        throw new Error('Invalid token: missing userId');
      }

      // Set authenticated connection info
      const permissions = authPayload.permissions || ['read', 'write'];
      return this.setConnectionAuthenticated(connectionId, decoded.userId, authPayload.documentId, permissions);
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Set connection as authenticated
   */
  private setConnectionAuthenticated(
    connectionId: string,
    userId: string,
    documentId: string,
    permissions: string[]
  ): boolean {
    const connectionInfo = this.connectionInfo.get(connectionId);

    if (!connectionInfo) {
      return false;
    }

    // Update connection info
    connectionInfo.userId = userId;
    connectionInfo.documentId = documentId;
    connectionInfo.permissions = permissions;
    connectionInfo.authenticated = true;
    connectionInfo.lastSeen = Date.now();

    // Add to document session
    this.addToDocumentSession(documentId, connectionId, connectionInfo);

    this.emit('connection_authenticated', connectionId, connectionInfo);
    return true;
  }

  /**
   * Broadcast message to all connections in a document
   */
  broadcastToDocument(documentId: string, message: WSMessage, excludeConnectionId?: string): void {
    const session = this.documentSessions.get(documentId);

    if (!session) {
      return;
    }

    const messageStr = JSON.stringify(message);

    for (const [connectionId, connectionInfo] of session.connections) {
      if (excludeConnectionId && connectionId === excludeConnectionId) {
        continue;
      }

      const ws = this.connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to send message to connection ${connectionId}:`, error);
          this.removeConnection(connectionId);
        }
      }
    }
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId: string, message: WSMessage): boolean {
    const ws = this.connections.get(connectionId);

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
      return false;
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(connectionId: string): ConnectionInfo | undefined {
    return this.connectionInfo.get(connectionId);
  }

  /**
   * Get document session
   */
  getDocumentSession(documentId: string): DocumentSession | undefined {
    return this.documentSessions.get(documentId);
  }

  /**
   * Get all connections for a document
   */
  getDocumentConnections(documentId: string): ConnectionInfo[] {
    const session = this.documentSessions.get(documentId);
    return session ? Array.from(session.connections.values()) : [];
  }

  /**
   * Get health metrics
   */
  getHealthMetrics(): HealthMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if connection has permission
   */
  hasPermission(connectionId: string, permission: string): boolean {
    const connectionInfo = this.connectionInfo.get(connectionId);
    return (connectionInfo?.authenticated && connectionInfo.permissions.includes(permission)) || false;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Close all connections
    for (const ws of this.connections.values()) {
      ws.close();
    }

    this.connections.clear();
    this.connectionInfo.clear();
    this.documentSessions.clear();
  }

  /**
   * Set up WebSocket event handlers for a connection
   */
  private setupWebSocketHandlers(ws: WebSocket, connectionId: string): void {
    ws.on('close', () => {
      this.removeConnection(connectionId);
    });

    ws.on('error', error => {
      console.error(`WebSocket error for connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
    });

    ws.on('pong', () => {
      // Update last seen time
      const connectionInfo = this.connectionInfo.get(connectionId);
      if (connectionInfo) {
        connectionInfo.lastSeen = Date.now();
      }
    });
  }

  /**
   * Add connection to document session
   */
  private addToDocumentSession(documentId: string, connectionId: string, connectionInfo: ConnectionInfo): void {
    let session = this.documentSessions.get(documentId);

    if (!session) {
      session = {
        documentId,
        connections: new Map(),
        lastActivity: Date.now(),
        version: 1,
      };
      this.documentSessions.set(documentId, session);
    }

    session.connections.set(connectionId, connectionInfo);
    session.lastActivity = Date.now();

    this.emit('user_joined_document', documentId, connectionInfo);
  }

  /**
   * Remove connection from document session
   */
  private removeFromDocumentSession(documentId: string, connectionId: string): void {
    const session = this.documentSessions.get(documentId);

    if (!session) {
      return;
    }

    const connectionInfo = session.connections.get(connectionId);
    session.connections.delete(connectionId);

    // Clean up empty sessions
    if (session.connections.size === 0) {
      this.documentSessions.delete(documentId);
    } else {
      session.lastActivity = Date.now();
    }

    if (connectionInfo) {
      this.emit('user_left_document', documentId, connectionInfo);
    }
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = this.config.connectionTimeout;

      for (const [connectionId, connectionInfo] of this.connectionInfo) {
        const ws = this.connections.get(connectionId);

        if (!ws) {
          this.removeConnection(connectionId);
          continue;
        }

        // Check for timed out connections
        if (now - connectionInfo.lastSeen > timeout) {
          console.log(`Connection ${connectionId} timed out`);
          ws.close();
          continue;
        }

        // Send ping
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
          } catch (error) {
            console.error(`Failed to ping connection ${connectionId}:`, error);
            this.removeConnection(connectionId);
          }
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update health metrics
   */
  private updateMetrics(): void {
    this.metrics = {
      totalConnections: this.connections.size,
      activeDocuments: this.documentSessions.size,
      messagesPerSecond: 0, // TODO: Implement message rate tracking
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage().heapUsed,
      lastUpdated: Date.now(),
    };
  }
}
