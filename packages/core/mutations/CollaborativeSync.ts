/**
 * PromptScape Graph Mutations - Collaborative Synchronization System
 * 
 * Handles real-time synchronization of graph mutations across multiple users
 * with conflict resolution and presence management.
 */

import { EventEmitter } from 'events';
import {
  GraphOperation,
  CollaborativeMessage,
  UserPresence,
  ConflictResult,
  MutationEngineConfig,
  AnyGraphOperation
} from './types';
import { ConflictResolver } from './ConflictResolver';

/**
 * WebSocket service interface for collaborative features
 */
export interface WebSocketService {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  send(message: CollaborativeMessage): Promise<void>;
  broadcast(message: CollaborativeMessage): Promise<void>;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  isConnected(): boolean;
}

/**
 * Simple WebSocket implementation for collaborative editing
 */
export class SimpleWebSocketService extends EventEmitter implements WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  async connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: CollaborativeMessage = JSON.parse(event.data);
            this.emit('message', message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          this.emit('disconnected');
          this.attemptReconnect(url);
        };
        
        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  async send(message: CollaborativeMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    
    this.ws.send(JSON.stringify(message));
  }
  
  async broadcast(message: CollaborativeMessage): Promise<void> {
    // In a real implementation, this would send to all connected clients
    await this.send(message);
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts_reached');
      return;
    }
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(url).catch(() => {
        // Reconnect attempt failed, will try again
      });
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }
}

/**
 * Manages collaborative editing synchronization and conflict resolution
 */
export class CollaborativeSync extends EventEmitter {
  private conflictResolver: ConflictResolver;
  private currentUser: UserPresence | null = null;
  private connectedUsers: Map<string, UserPresence> = new Map();
  private pendingOperations: Map<string, GraphOperation> = new Map();
  private operationQueue: GraphOperation[] = [];
  private isProcessingQueue = false;
  
  constructor(
    private webSocketService: WebSocketService,
    private config: MutationEngineConfig
  ) {
    super();
    
    this.conflictResolver = new ConflictResolver(config.conflictResolution);
    this.setupWebSocketHandlers();
    
    // Setup periodic cleanup
    setInterval(() => this.cleanupStaleData(), 30000); // 30 seconds
  }
  
  /**
   * Initialize collaborative session
   */
  async initialize(user: UserPresence, serverUrl: string): Promise<void> {
    this.currentUser = user;
    
    try {
      await this.webSocketService.connect(serverUrl);
      
      // Send initial presence
      await this.broadcastPresence();
      
      this.emit('collaboration_initialized', { user });
      
    } catch (error) {
      this.emit('collaboration_error', { 
        error: `Failed to initialize collaboration: ${error}` 
      });
      throw error;
    }
  }
  
  /**
   * Disconnect from collaborative session
   */
  async disconnect(): Promise<void> {
    if (this.currentUser) {
      // Broadcast offline presence
      await this.broadcastPresence(false);
    }
    
    await this.webSocketService.disconnect();
    this.connectedUsers.clear();
    this.currentUser = null;
    
    this.emit('collaboration_disconnected');
  }
  
  /**
   * Broadcast a mutation to other collaborators
   */
  async broadcastMutation(operation: GraphOperation): Promise<void> {
    if (!this.webSocketService.isConnected()) {
      // Queue operation for later if not connected
      this.operationQueue.push(operation);
      return;
    }
    
    try {
      const message: CollaborativeMessage = {
        type: 'GRAPH_MUTATION',
        operation,
        timestamp: new Date(),
        userId: this.currentUser?.userId || 'anonymous',
        sessionId: operation.sessionId || this.generateSessionId()
      };
      
      await this.webSocketService.broadcast(message);
      
      // Track pending operation for conflict detection
      this.pendingOperations.set(operation.id, operation);
      
      this.emit('mutation_broadcasted', { operation });
      
    } catch (error) {
      this.emit('broadcast_error', { operation, error });
      throw error;
    }
  }
  
  /**
   * Update user presence (cursor position, selection, etc.)
   */
  async updatePresence(presence: Partial<UserPresence>): Promise<void> {
    if (!this.currentUser || !this.webSocketService.isConnected()) {
      return;
    }
    
    this.currentUser = {
      ...this.currentUser,
      ...presence,
      lastActivity: new Date()
    };
    
    await this.broadcastPresence();
  }
  
  /**
   * Get list of connected users
   */
  getConnectedUsers(): UserPresence[] {
    return Array.from(this.connectedUsers.values());
  }
  
  /**
   * Get current user presence
   */
  getCurrentUser(): UserPresence | null {
    return this.currentUser;
  }
  
  /**
   * Check if collaboration is active
   */
  isCollaborationActive(): boolean {
    return this.webSocketService.isConnected() && this.currentUser !== null;
  }
  
  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.pendingOperations.size;
  }
  
  // PRIVATE METHODS
  
  private setupWebSocketHandlers(): void {
    this.webSocketService.on('message', (message: CollaborativeMessage) => {
      this.handleRemoteMessage(message);
    });
    
    this.webSocketService.on('connected', () => {
      this.emit('connection_established');
      this.processQueuedOperations();
    });
    
    this.webSocketService.on('disconnected', () => {
      this.emit('connection_lost');
    });
    
    this.webSocketService.on('error', (error) => {
      this.emit('connection_error', { error });
    });
    
    // Forward conflict resolver events
    this.conflictResolver.on('conflict_resolved', (data) => {
      this.emit('conflict_resolved', data);
    });
  }
  
  private async handleRemoteMessage(message: CollaborativeMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'GRAPH_MUTATION':
          await this.handleRemoteMutation(message);
          break;
          
        case 'CURSOR_UPDATE':
          await this.handleCursorUpdate(message);
          break;
          
        case 'SELECTION_CHANGE':
          await this.handleSelectionChange(message);
          break;
          
        case 'PRESENCE_UPDATE':
          await this.handlePresenceUpdate(message);
          break;
          
        default:
          console.warn('Unknown collaborative message type:', message.type);
      }
    } catch (error) {
      this.emit('message_handling_error', { message, error });
    }
  }
  
  private async handleRemoteMutation(message: CollaborativeMessage): Promise<void> {
    if (!message.operation) {
      console.error('Remote mutation message missing operation data');
      return;
    }
    
    // Skip if this is our own operation
    if (message.userId === this.currentUser?.userId) {
      // Remove from pending operations
      this.pendingOperations.delete(message.operation.id);
      return;
    }
    
    try {
      // Check for conflicts with pending operations
      const conflictResult = await this.checkMutationConflicts(message.operation);
      
      if (conflictResult.hasConflicts) {
        this.emit('mutation_conflict_detected', {
          remoteOperation: message.operation,
          conflicts: conflictResult.conflicts
        });
        
        if (this.config.conflictResolution.autoResolve && conflictResult.canAutoResolve) {
          // Resolve conflicts automatically
          const resolvedOperation = await this.conflictResolver.resolve(
            message.operation,
            conflictResult
          );
          
          this.emit('remote_mutation_received', {
            operation: resolvedOperation,
            original: message.operation,
            resolved: true
          });
        } else {
          // Emit for manual resolution
          this.emit('manual_conflict_resolution_required', {
            remoteOperation: message.operation,
            conflictResult
          });
        }
      } else {
        // No conflicts, apply the operation
        this.emit('remote_mutation_received', {
          operation: message.operation,
          resolved: false
        });
      }
    } catch (error) {
      this.emit('remote_mutation_error', {
        operation: message.operation,
        error
      });
    }
  }
  
  private async handleCursorUpdate(message: CollaborativeMessage): Promise<void> {
    const user = this.connectedUsers.get(message.userId);
    if (user && message.data?.cursor) {
      const updatedUser: UserPresence = {
        ...user,
        cursor: message.data.cursor,
        lastActivity: message.timestamp
      };
      
      this.connectedUsers.set(message.userId, updatedUser);
      this.emit('user_cursor_updated', { user: updatedUser });
    }
  }
  
  private async handleSelectionChange(message: CollaborativeMessage): Promise<void> {
    const user = this.connectedUsers.get(message.userId);
    if (user && message.data?.selection) {
      const updatedUser: UserPresence = {
        ...user,
        selection: message.data.selection,
        lastActivity: message.timestamp
      };
      
      this.connectedUsers.set(message.userId, updatedUser);
      this.emit('user_selection_updated', { user: updatedUser });
    }
  }
  
  private async handlePresenceUpdate(message: CollaborativeMessage): Promise<void> {
    if (message.data?.user) {
      const user = message.data.user as UserPresence;
      
      if (user.isActive) {
        this.connectedUsers.set(message.userId, user);
        this.emit('user_joined', { user });
      } else {
        this.connectedUsers.delete(message.userId);
        this.emit('user_left', { user });
      }
      
      this.emit('presence_updated', {
        connectedUsers: this.getConnectedUsers()
      });
    }
  }
  
  private async checkMutationConflicts(remoteOperation: GraphOperation): Promise<ConflictResult> {
    // Create a simplified current state for conflict checking
    // In a real implementation, this would come from the mutation engine
    const mockState = { nodes: [], edges: [] };
    
    return await this.conflictResolver.checkConflicts(remoteOperation, mockState);
  }
  
  private async broadcastPresence(isActive: boolean = true): Promise<void> {
    if (!this.currentUser || !this.webSocketService.isConnected()) {
      return;
    }
    
    const message: CollaborativeMessage = {
      type: 'PRESENCE_UPDATE',
      timestamp: new Date(),
      userId: this.currentUser.userId,
      sessionId: this.generateSessionId(),
      data: {
        user: {
          ...this.currentUser,
          isActive,
          lastActivity: new Date()
        }
      }
    };
    
    await this.webSocketService.broadcast(message);
  }
  
  private async processQueuedOperations(): Promise<void> {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      while (this.operationQueue.length > 0) {
        const operation = this.operationQueue.shift()!;
        await this.broadcastMutation(operation);
      }
    } catch (error) {
      this.emit('queue_processing_error', { error });
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  private cleanupStaleData(): void {
    const now = Date.now();
    const staleThreshold = 60000; // 1 minute
    
    // Cleanup stale pending operations
    for (const [operationId, operation] of this.pendingOperations.entries()) {
      if (now - operation.timestamp.getTime() > staleThreshold) {
        this.pendingOperations.delete(operationId);
      }
    }
    
    // Cleanup inactive users
    for (const [userId, user] of this.connectedUsers.entries()) {
      if (now - user.lastActivity.getTime() > staleThreshold * 2) { // 2 minutes
        this.connectedUsers.delete(userId);
        this.emit('user_timed_out', { user });
      }
    }
  }
  
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}