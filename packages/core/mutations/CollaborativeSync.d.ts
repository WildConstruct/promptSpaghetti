/**
 * PromptScape Graph Mutations - Collaborative Synchronization System
 *
 * Handles real-time synchronization of graph mutations across multiple users
 * with conflict resolution and presence management.
 */
import { EventEmitter } from 'events';
import { GraphOperation, CollaborativeMessage, UserPresence, MutationEngineConfig } from './types';
/**
 * WebSocket service interface for collaborative features
 */

}
export interface WebSocketService {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    send(message: CollaborativeMessage): Promise<void>;
    broadcast(message: CollaborativeMessage): Promise<void>;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    isConnected(): boolean;


/**
 * Simple WebSocket implementation for collaborative editing
 */
export declare class SimpleWebSocketService extends EventEmitter implements WebSocketService {
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    send(message: CollaborativeMessage): Promise<void>;
    broadcast(message: CollaborativeMessage): Promise<void>;
    isConnected(): boolean;
    private attemptReconnect;

/**
 * Manages collaborative editing synchronization and conflict resolution
 */
export declare class CollaborativeSync extends EventEmitter {
    private webSocketService;
    private config;
    private conflictResolver;
    private currentUser;
    private connectedUsers;
    private pendingOperations;
    private operationQueue;
    private isProcessingQueue;
    constructor(webSocketService: WebSocketService, config: MutationEngineConfig);
    /**
     * Initialize collaborative session
     */
    initialize(user: UserPresence, serverUrl: string): Promise<void>;
    /**
     * Disconnect from collaborative session
     */
    disconnect(): Promise<void>;
    /**
     * Broadcast a mutation to other collaborators
     */
    broadcastMutation(operation: GraphOperation): Promise<void>;
    /**
     * Update user presence (cursor position, selection, etc.)
     */
    updatePresence(presence: Partial<UserPresence>): Promise<void>;
    /**
     * Get list of connected users
     */
    getConnectedUsers(): UserPresence[];
    /**
     * Get current user presence
     */
    getCurrentUser(): UserPresence | null;
    /**
     * Check if collaboration is active
     */
    isCollaborationActive(): boolean;
    /**
     * Get pending operations count
     */
    getPendingOperationsCount(): number;
    private setupWebSocketHandlers;
    private handleRemoteMessage;
    private handleRemoteMutation;
    private handleCursorUpdate;
    private handleSelectionChange;
    private handlePresenceUpdate;
    private checkMutationConflicts;
    private broadcastPresence;
    private processQueuedOperations;
    private cleanupStaleData;
    private generateSessionId;

//# sourceMappingURL=CollaborativeSync.d.ts.map
}