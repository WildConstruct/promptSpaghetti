/**
 * PromptScape Graph Mutations - Collaborative Synchronization System
 *
 * Handles real-time synchronization of graph mutations across multiple users
 * with conflict resolution and presence management.
 */
import { EventEmitter } from 'events';
import { CollaborativeMessage } from './types';
/**
 * WebSocket service interface for collaborative features
 */
export interface WebSocketService {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    send(message: CollaborativeMessage): Promise<void>;
    broadcast(message: CollaborativeMessage): Promise<void>;
    on(event: string, callback: (data: CollaborativeMessage) => void): void;
    off(event: string, callback: (data: CollaborativeMessage) => void): void;
    isConnected(): boolean;
}
export declare class SimpleWebSocketService extends EventEmitter implements WebSocketService {
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    connect(url: string): Promise<void>;
}
//# sourceMappingURL=CollaborativeSync.d.ts.map