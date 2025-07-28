import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionManager } from './ConnectionManager';
import { PresenceManager, PresenceConfig, UserPresenceData } from './PresenceManager';
import { ConflictResolver, ConflictResolverConfig, ConflictOperation, ConflictType } from './ConflictResolver';
import { SynchronizationManager, SyncManagerConfig, StateUpdate } from './SynchronizationManager';
import { 
  WSMessage, 
  WSMessageSchema, 
  WSServerConfig, 
  GraphUpdatePayload,
  PresenceUpdatePayload,
  AuthPayload,
  AuthPayloadSchema,
  GraphUpdatePayloadSchema,
  PresenceUpdatePayloadSchema
} from './types';

// Epic 13 Analytics Integration
import { AnalyticsCollector, AnalyticsEventType } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { getDatabase } from '../database/connection';

export class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server | null = null;
  private connectionManager: ConnectionManager;
  private presenceManager: PresenceManager;
  private conflictResolver: ConflictResolver;
  private syncManager: SynchronizationManager;
  private config: WSServerConfig;
  private messageHandlers: Map<string, (connectionId: string, payload: any) => void> = new Map();
  
  // Epic 13 Analytics Integration
  public analyticsCollector: AnalyticsCollector | null = null;
  private analyticsDAO: AnalyticsDAO | null = null;

  constructor(config: WSServerConfig) {
    super();
    this.config = config;
    this.connectionManager = new ConnectionManager(config);
    
    // Initialize presence manager
    const presenceConfig: PresenceConfig = {
      idleTimeout: 30000, // 30 seconds
      awayTimeout: 300000, // 5 minutes
      offlineTimeout: 600000, // 10 minutes
      cleanupInterval: 60000, // 1 minute
      maxUsersPerDocument: 50,
      enableLocationSharing: true,
      enableActivityTracking: true,
      retainPresenceHistory: false,
      historyRetentionPeriod: 86400000 // 24 hours
    };
    this.presenceManager = new PresenceManager(presenceConfig);

    // Initialize conflict resolver
    const conflictConfig: ConflictResolverConfig = {
      defaultStrategy: 'last_writer_wins' as any,
      autoResolveThreshold: 5000, // 5 seconds
      maxConflictAge: 300000, // 5 minutes
      positionConflictThreshold: 50, // 50 pixels
      enableSemanticMerge: false,
      preserveConflictHistory: true,
      conflictHistoryRetention: 86400000 // 24 hours
    };
    this.conflictResolver = new ConflictResolver(conflictConfig);

    // Initialize synchronization manager
    const syncConfig: SyncManagerConfig = {
      maxVersionHistory: 100,
      deltaCompressionThreshold: 10,
      checksumValidation: true,
      conflictDetection: true,
      autoMerge: true,
      syncInterval: 1000, // 1 second
      maxSyncBatchSize: 50
    };
    this.syncManager = new SynchronizationManager(syncConfig);
    
    this.setupMessageHandlers();
    this.setupConnectionManagerEvents();
    this.setupPresenceManagerEvents();
    this.setupConflictResolverEvents();
    this.setupSyncManagerEvents();
    
    // Initialize analytics if enabled
    this.initializeAnalytics();
  }

  /**
   * Initialize analytics collection for WebSocket interactions
   */
  private initializeAnalytics(): void {
    try {
      const db = getDatabase();
      this.analyticsDAO = new AnalyticsDAO(db);
      
      this.analyticsCollector = new AnalyticsCollector({
        enabled: process.env.WS_ANALYTICS_ENABLED !== 'false',
        sampleRate: parseFloat(process.env.WS_ANALYTICS_SAMPLE_RATE || '1.0'),
        privacyMode: process.env.ANALYTICS_PRIVACY_MODE === 'true'
      });

      // Set up event storage handler
      this.analyticsCollector.on('events_flushed', (events) => {
        if (this.analyticsDAO) {
          events.forEach((event: any) => this.analyticsDAO.storeEvent(event));
        }
      });

      console.log('WebSocket analytics collection initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket analytics:', error);
    }
  }

  /**
   * Start the WebSocket server
   */
  start(server?: any): Promise<void> {

    return new Promise((resolve, reject) => {
      try {
        const wsOptions: WebSocket.ServerOptions = {
          port: server ? undefined : this.config.port,
          server: server || undefined,
          verifyClient: (info) => this.verifyClient(info)
        };

        this.wss = new WebSocket.Server(wsOptions);
        
        this.wss.on('connection', (ws, request) => {
          this.handleConnection(ws, request);
        });

        this.wss.on('error', (error) => {
          console.error('WebSocket server error:', error);
          this.emit('error', error);
        });

        console.log(`WebSocket server started on port ${this.config.port}`);
        this.emit('started');
        resolve();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the WebSocket server
   */
  stop(): Promise<void> {

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          this.connectionManager.cleanup();
          this.presenceManager.cleanup();
          this.conflictResolver.cleanup();
          this.syncManager.cleanup();
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server health metrics
   */
  getHealthMetrics() {
    return this.connectionManager.getHealthMetrics();
  }

  /**
   * Get presence statistics
   */
  getPresenceStats() {
    return this.presenceManager.getPresenceStats();
  }

  /**
   * Get document sessions info
   */
  getDocumentSessions() {
    const metrics = this.connectionManager.getHealthMetrics();
    return {
      activeDocuments: metrics.activeDocuments,
      totalConnections: metrics.totalConnections
    };
  }

  /**
   * Get users in a specific document
   */
  getDocumentUsers(documentId: string): UserPresenceData[] {
    return this.presenceManager.getDocumentUsers(documentId);
  }

  /**
   * Get conflict statistics
   */
  getConflictStats(documentId?: string) {
    return this.conflictResolver.getConflictStats(documentId);
  }

  /**
   * Get document synchronization stats
   */
  getDocumentSyncStats(documentId: string) {
    return this.syncManager.getDocumentStats(documentId);
  }

  /**
   * Initialize document for collaboration
   */
  initializeDocument(documentId: string, initialState?: any) {
    return this.syncManager.initializeDocument(documentId, initialState);
  }

  /**
   * Broadcast message to all connections in a document
   */
  broadcastToDocument(documentId: string, message: Omit<WSMessage, 'timestamp'>, excludeConnectionId?: string): void {
    const fullMessage: WSMessage = {
      ...message,
      timestamp: Date.now(),
      messageId: uuidv4(),
      documentId
    };

    this.connectionManager.broadcastToDocument(documentId, fullMessage, excludeConnectionId);
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const connectionId = this.connectionManager.addConnection(ws, request);
    
    console.log(`New WebSocket connection: ${connectionId}`);

    // Set up message handling
    ws.on('message', (data) => {
      this.handleMessage(connectionId, data);
    });

    // Send connection confirmation
    this.sendToConnection(connectionId, {
      type: 'connect',
      payload: { 
        connectionId,
        requiresAuthentication: this.config.enableAuthentication 
      }
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(connectionId: string, data: WebSocket.Data): void {
    try {
      const rawMessage = JSON.parse(data.toString());
      
      // Validate message format
      const message = WSMessageSchema.parse(rawMessage);
      
      // Update last seen time
      const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
      if (connectionInfo) {
        connectionInfo.lastSeen = Date.now();
      }

      // Route message to appropriate handler
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(connectionId, message.payload);
      } else {
        console.warn(`No handler for message type: ${message.type}`);
      }

    } catch (error) {
      console.error(`Invalid message from connection ${connectionId}:`, error);
      
      this.sendToConnection(connectionId, {
        type: 'error',
        payload: { 
          error: 'Invalid message format',
          details: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * Send message to specific connection
   */
  private sendToConnection(connectionId: string, message: Omit<WSMessage, 'timestamp' | 'messageId'>): boolean {
    const fullMessage: WSMessage = {
      ...message,
      timestamp: Date.now(),
      messageId: uuidv4()
    };

    return this.connectionManager.sendToConnection(connectionId, fullMessage);
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Authentication
    this.messageHandlers.set('auth_request', async (connectionId, payload) => {
      try {
        const authPayload = AuthPayloadSchema.parse(payload);
        const success = await this.connectionManager.authenticateConnection(connectionId, authPayload);
        
        // Track authentication event
        if (this.analyticsCollector) {
          this.analyticsCollector.recordUserInteraction(
            success ? AnalyticsEventType.USER_SESSION_START : AnalyticsEventType.ERROR_OCCURRENCE,
            authPayload.documentId || 'unknown',
            {
              connectionId,
              userId: authPayload.userId,
              authenticationSuccess: success,
              interactionType: 'authentication'
            }
          );
        }
        
        this.sendToConnection(connectionId, {
          type: 'auth_response',
          payload: { 
            success,
            message: success ? 'Authentication successful' : 'Authentication failed'
          }
        });

        if (success) {
          const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
          if (connectionInfo) {
            // Add user presence
            const presence = this.presenceManager.addUserPresence(
              connectionId,
              connectionInfo.userId,
              connectionInfo.documentId,
              {
                userName: authPayload.userName,
                userAvatar: authPayload.userAvatar,
                userAgent: connectionInfo.userAgent,
                platform: authPayload.platform
              }
            );

            // Send current users to the new user
            const existingUsers = this.presenceManager.getDocumentUsers(connectionInfo.documentId)
              .filter(user => user.connectionId !== connectionId);
            
            if (existingUsers.length > 0) {
              this.sendToConnection(connectionId, {
                type: 'presence_sync',
                payload: { users: existingUsers }
              });
            }

            // Notify other users in the document
            this.broadcastToDocument(connectionInfo.documentId, {
              type: 'user_join',
              payload: {
                userId: connectionInfo.userId,
                userName: presence.userName,
                userAvatar: presence.userAvatar,
                timestamp: Date.now()
              }
            }, connectionId);
          }
        }

      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'auth_response',
          payload: { 
            success: false,
            message: 'Invalid authentication payload'
          }
        });
      }
    });

    // Graph updates with conflict resolution
    this.messageHandlers.set('graph_update', (connectionId, payload) => {
      if (!this.connectionManager.hasPermission(connectionId, 'write')) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Insufficient permissions for graph updates' }
        });
        return;
      }

      try {
        const updatePayload = GraphUpdatePayloadSchema.parse(payload);
        const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
        
        if (!connectionInfo || !connectionInfo.documentId) {
          return;
        }

        // Track graph update interaction
        if (this.analyticsCollector) {
          const interactionType = this.determineInteractionType(updatePayload);
          this.analyticsCollector.recordUserInteraction(
            interactionType,
            connectionInfo.documentId,
            {
              connectionId,
              userId: connectionInfo.userId,
              updateType: updatePayload.type,
              nodeId: updatePayload.nodeId,
              nodeType: updatePayload.nodeType,
              component: 'graph_editor',
              canvasPosition: updatePayload.position
            }
          );
        }

        // Initialize document if it doesn't exist
        this.syncManager.initializeDocument(connectionInfo.documentId);

        // Convert graph update to operations
        const operations = this.convertGraphUpdateToOperations(updatePayload, connectionInfo.userId);
        
        // Process each operation through conflict resolver
        for (const operation of operations) {
          const resolution = this.conflictResolver.processOperation(operation);
          
          if (resolution && resolution.requiresUserInput) {
            // Send conflict to user for resolution
            this.sendToConnection(connectionId, {
              type: 'conflict_detected',
              payload: {
                conflict: resolution.conflict,
                requiresResolution: true
              }
            });
          }
        }

        // Create state update
        const stateUpdate = this.syncManager.createStateUpdate(
          connectionInfo.documentId,
          operations,
          connectionInfo.userId
        );

        // Apply state update
        const syncResponse = this.syncManager.applyStateUpdate(stateUpdate);

        // Broadcast successful updates to other connections
        if (syncResponse.syncType === 'up_to_date') {
          this.broadcastToDocument(connectionInfo.documentId, {
            type: 'graph_update',
            payload: {
              ...updatePayload,
              version: syncResponse.currentVersion,
              conflicts: syncResponse.conflicts
            }
          }, connectionId);
        }

        // Send response to sender
        this.sendToConnection(connectionId, {
          type: 'graph_update_response',
          payload: {
            success: true,
            version: syncResponse.currentVersion,
            conflicts: syncResponse.conflicts
          }
        });

        // Emit event for persistence layer
        this.emit('graph_update', connectionInfo.documentId, updatePayload, connectionInfo);

      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Invalid graph update payload' }
        });
      }
    });

    // Presence updates (cursor, selection, etc.)
    this.messageHandlers.set('presence_update', (connectionId, payload) => {
      try {
        const presencePayload = PresenceUpdatePayloadSchema.parse(payload);
        const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
        
        if (!connectionInfo || !connectionInfo.documentId) {
          return;
        }

        // Update presence in manager
        const updatedPresence = this.presenceManager.updateUserPresence(connectionId, {
          cursor: presencePayload.cursor,
          selection: presencePayload.selection ? {
            nodeIds: presencePayload.selection,
            edgeIds: [],
            selectionBox: undefined
          } : undefined
        });

        if (updatedPresence) {
          // Broadcast presence to other connections in the document
          this.broadcastToDocument(connectionInfo.documentId, {
            type: 'presence_update',
            payload: {
              userId: updatedPresence.userId,
              userName: updatedPresence.userName,
              cursor: updatedPresence.cursor,
              selection: updatedPresence.selection?.nodeIds || [],
              lastSeen: updatedPresence.lastSeen,
              status: updatedPresence.status
            }
          }, connectionId);
        }

      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Invalid presence update payload' }
        });
      }
    });

    // Cursor position updates
    this.messageHandlers.set('cursor_update', (connectionId, payload) => {
      const { x, y, nodeId, viewportBounds } = payload;
      
      const updatedPresence = this.presenceManager.updateUserCursor(connectionId, {
        x, y, nodeId, viewportBounds
      });

      if (updatedPresence) {
        this.broadcastToDocument(updatedPresence.documentId, {
          type: 'cursor_update',
          payload: {
            userId: updatedPresence.userId,
            cursor: updatedPresence.cursor
          }
        }, connectionId);
      }
    });

    // Selection updates
    this.messageHandlers.set('selection_update', (connectionId, payload) => {
      const { nodeIds, edgeIds, selectionBox } = payload;
      
      const updatedPresence = this.presenceManager.updateUserSelection(connectionId, {
        nodeIds: nodeIds || [],
        edgeIds: edgeIds || [],
        selectionBox
      });

      if (updatedPresence) {
        this.broadcastToDocument(updatedPresence.documentId, {
          type: 'selection_update',
          payload: {
            userId: updatedPresence.userId,
            selection: updatedPresence.selection
          }
        }, connectionId);
      }
    });

    // Activity updates (typing, tool changes, etc.)
    this.messageHandlers.set('activity_update', (connectionId, payload) => {
      const { currentTool, isTyping, focusedNodeId } = payload;
      
      const updatedPresence = this.presenceManager.updateUserActivity(connectionId, {
        currentTool,
        isTyping,
        focusedNodeId
      });

      if (updatedPresence) {
        this.broadcastToDocument(updatedPresence.documentId, {
          type: 'activity_update',
          payload: {
            userId: updatedPresence.userId,
            currentTool: updatedPresence.currentTool,
            isTyping: updatedPresence.isTyping,
            focusedNodeId: updatedPresence.focusedNodeId
          }
        }, connectionId);
      }
    });

    // Request presence data for document
    this.messageHandlers.set('presence_request', (connectionId, payload) => {
      const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo?.documentId) {
        return;
      }

      const users = this.presenceManager.getDocumentUsers(connectionInfo.documentId)
        .filter(user => user.connectionId !== connectionId);

      this.sendToConnection(connectionId, {
        type: 'presence_sync',
        payload: { users }
      });
    });

    // Conflict resolution
    this.messageHandlers.set('resolve_conflict', (connectionId, payload) => {
      const { conflictId, strategy, userSelection } = payload;
      const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo || !this.connectionManager.hasPermission(connectionId, 'write')) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Insufficient permissions to resolve conflicts' }
        });
        return;
      }

      const resolution = this.conflictResolver.resolveConflict(
        conflictId,
        strategy,
        userSelection,
        connectionInfo.userId
      );

      if (resolution) {
        // Apply resolution to document state
        if (resolution.operations.length > 0) {
          const stateUpdate = this.syncManager.createStateUpdate(
            connectionInfo.documentId,
            resolution.operations.map(op => ({
              id: op.id,
              type: 'update' as const,
              target: op.nodeId ? 'node' as const : 'edge' as const,
              targetId: op.nodeId || op.edgeId || '',
              data: op.newValue,
              oldData: op.oldValue,
              timestamp: op.timestamp
            })),
            connectionInfo.userId
          );

          this.syncManager.applyStateUpdate(stateUpdate);
        }

        // Broadcast resolution to other users
        this.broadcastToDocument(connectionInfo.documentId, {
          type: 'conflict_resolved',
          payload: {
            conflictId,
            resolution: resolution.resolvedValue,
            resolvedBy: connectionInfo.userId
          }
        });

        this.sendToConnection(connectionId, {
          type: 'conflict_resolution_response',
          payload: { success: true, resolution }
        });
      } else {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Failed to resolve conflict' }
        });
      }
    });

    // Document synchronization
    this.messageHandlers.set('sync_request', (connectionId, payload) => {
      const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo || !connectionInfo.documentId) {
        return;
      }

      try {
        const syncRequest = {
          documentId: connectionInfo.documentId,
          clientVersion: payload.clientVersion || 0,
          fullSync: payload.fullSync || false,
          checksum: payload.checksum
        };

        const syncResponse = this.syncManager.handleSyncRequest(syncRequest);

        this.sendToConnection(connectionId, {
          type: 'sync_response',
          payload: syncResponse
        });

      } catch (error) {
        this.sendToConnection(connectionId, {
          type: 'error',
          payload: { error: 'Sync request failed' }
        });
      }
    });

    // State verification
    this.messageHandlers.set('verify_state', (connectionId, payload) => {
      const connectionInfo = this.connectionManager.getConnectionInfo(connectionId);
      
      if (!connectionInfo || !connectionInfo.documentId) {
        return;
      }

      const integrity = this.syncManager.verifyStateIntegrity(connectionInfo.documentId);

      this.sendToConnection(connectionId, {
        type: 'state_verification_response',
        payload: integrity
      });
    });

    // Ping/Pong for heartbeat
    this.messageHandlers.set('ping', (connectionId, payload) => {
      this.sendToConnection(connectionId, {
        type: 'pong',
        payload: { timestamp: Date.now() }
      });
    });
  }

  /**
   * Set up connection manager events
   */
  private setupConnectionManagerEvents(): void {
    this.connectionManager.on('user_left_document', (documentId, connectionInfo) => {
      // Remove user presence
      this.presenceManager.removeUserPresence(connectionInfo.id);
    });
  }

  /**
   * Convert graph update payload to conflict operations
   */
  private convertGraphUpdateToOperations(updatePayload: GraphUpdatePayload, userId: string): ConflictOperation[] {
    const operations: ConflictOperation[] = [];
    
    for (const operation of updatePayload.operations) {
      const conflictOp: ConflictOperation = {
        id: uuidv4(),
        type: this.mapOperationTypeToConflictType(operation.type),
        nodeId: operation.nodeId,
        edgeId: operation.edgeId,
        property: operation.type.includes('update') ? 'properties' : undefined,
        oldValue: operation.oldValue || null,
        newValue: operation.data,
        userId,
        timestamp: operation.timestamp,
        documentId: updatePayload.documentId || ''
      };
      
      operations.push(conflictOp);
    }
    
    return operations;
  }

  /**
   * Map operation type to conflict type
   */
  private mapOperationTypeToConflictType(operationType: string): ConflictType {
    switch (operationType) {
    case 'node_add':
      return ConflictType.NODE_CREATION;
    case 'node_remove':
      return ConflictType.NODE_DELETION;
    case 'node_update':
      return ConflictType.NODE_PROPERTIES;
    case 'edge_add':
      return ConflictType.EDGE_CREATION;
    case 'edge_remove':
      return ConflictType.EDGE_DELETION;
    case 'edge_update':
      return ConflictType.EDGE_PROPERTIES;
    default:
      return ConflictType.NODE_PROPERTIES;
    }
  }

  /**
   * Set up conflict resolver events
   */
  private setupConflictResolverEvents(): void {
    this.conflictResolver.on('conflict_detected', (conflict) => {
      // Broadcast conflict to all users in the document
      this.broadcastToDocument(conflict.documentId, {
        type: 'conflict_notification',
        payload: {
          conflictId: conflict.id,
          type: conflict.type,
          description: conflict.description,
          requiresResolution: true
        }
      });
    });

    this.conflictResolver.on('conflict_auto_resolved', (resolution) => {
      // Broadcast auto-resolution
      this.broadcastToDocument(resolution.conflict.documentId, {
        type: 'conflict_auto_resolved',
        payload: {
          conflictId: resolution.conflict.id,
          resolution: resolution.resolvedValue,
          strategy: resolution.conflict.resolutionStrategy
        }
      });
    });

    this.conflictResolver.on('conflict_resolved', (resolution) => {
      // Conflict manually resolved - already handled in message handler
    });
  }

  /**
   * Set up synchronization manager events
   */
  private setupSyncManagerEvents(): void {
    this.syncManager.on('state_updated', (event) => {
      // Broadcast state changes to connected users
      this.broadcastToDocument(event.documentId, {
        type: 'state_updated',
        payload: {
          version: event.version,
          operationCount: event.operations.length,
          hasConflicts: event.conflicts.length > 0
        }
      });
    });

    this.syncManager.on('sync_batch', (batch) => {
      // Handle batch synchronization
      this.emit('sync_batch_processed', batch);
    });
  }

  /**
   * Set up presence manager events
   */
  private setupPresenceManagerEvents(): void {
    this.presenceManager.on('user_joined', (documentId, presence) => {
      // User presence is already broadcast in auth handler
    });

    this.presenceManager.on('user_left', (documentId, presence) => {
      // Notify other users that someone left
      this.broadcastToDocument(documentId, {
        type: 'user_leave',
        payload: {
          userId: presence.userId,
          userName: presence.userName,
          timestamp: Date.now()
        }
      });
    });

    this.presenceManager.on('user_status_changed', (documentId, presence, newStatus) => {
      // Broadcast status change to other users
      this.broadcastToDocument(documentId, {
        type: 'user_status_changed',
        payload: {
          userId: presence.userId,
          status: newStatus,
          timestamp: Date.now()
        }
      });
    });

    this.presenceManager.on('user_updated', (documentId, presence) => {
      // This is handled by specific update handlers above
    });
  }

  /**
   * Verify client connections (CORS, rate limiting, etc.)
   */
  private verifyClient(info: any): boolean {
    // Check origin
    const origin = info.origin;
    if (this.config.corsOrigins.length > 0 && !this.config.corsOrigins.includes(origin)) {
      console.warn(`Rejected connection from unauthorized origin: ${origin}`);
      return false;
    }

    // Check connection limit
    const currentConnections = this.connectionManager.getHealthMetrics().totalConnections;
    if (currentConnections >= this.config.maxConnections) {
      console.warn('Rejected connection: maximum connections reached');
      return false;
    }

    return true;
  }

  /**
   * Determine the analytics event type based on the graph update payload
   */
  private determineInteractionType(updatePayload: any): AnalyticsEventType {
    switch (updatePayload.type) {
    case 'node_created':
    case 'add_node':
      return AnalyticsEventType.NODE_CREATED;
    case 'node_updated':
    case 'update_node':
      return AnalyticsEventType.NODE_UPDATED;
    case 'node_deleted':
    case 'delete_node':
      return AnalyticsEventType.NODE_DELETED;
    case 'connection_created':
    case 'add_connection':
      return AnalyticsEventType.CONNECTION_CREATED;
    case 'connection_deleted':
    case 'delete_connection':
      return AnalyticsEventType.CONNECTION_DELETED;
    case 'canvas_pan':
    case 'canvas_zoom':
    case 'canvas_interaction':
      return AnalyticsEventType.CANVAS_INTERACTION;
    default:
      return AnalyticsEventType.CANVAS_INTERACTION;
    }
  }
}