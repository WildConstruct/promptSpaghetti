/**
 * Graph Synchronization Handler
 * Epic 9.1.1 - Manages CRDT synchronization for collaborative graph editing
 */

import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { YGraph } from './y-graph';
import { SyncState, SyncMessage, UserPresence, CRDTNode, CRDTEdge } from './types';

export class GraphSyncHandler {
  private doc: Y.Doc;
  private graph: YGraph;
  private nodes: Y.Map<CRDTNode>;
  private edges: Y.Map<CRDTEdge>;
  private awareness: Map<string, UserPresence>;
  private syncState: SyncState;
  private onUpdate?: (update: Uint8Array, origin: any) => void;
  private onAwarenessUpdate?: (awareness: Map<string, UserPresence>) => void;

  constructor(documentId: string, userId: string) {
    this.doc = new Y.Doc();
    
    // Get the maps from the document
    this.nodes = this.doc.getMap('nodes');
    this.edges = this.doc.getMap('edges');
    
    // Create YGraph and assign the document-integrated maps
    this.graph = new YGraph();
    this.graph.nodes = this.nodes;
    this.graph.edges = this.edges;
    
    // Set the document reference on the graph
    (this.graph as any).doc = this.doc;
    
    this.awareness = new Map();
    this.syncState = {
      documentId,
      userId,
      lastSync: Date.now(),
      pendingOps: 0
    };

    // Set up update observer
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      this.syncState.lastSync = Date.now();
      if (this.onUpdate) {
        this.onUpdate(update, origin);
      }
    });
  }

  /**
   * Get the graph instance
   */
  getGraph(): YGraph {
    return this.graph;
  }

  /**
   * Get the Yjs document
   */
  getDoc(): Y.Doc {
    return this.doc;
  }

  /**
   * Apply an update from a remote peer
   */
  applyUpdate(update: Uint8Array, origin?: any): void {
    Y.applyUpdate(this.doc, update, origin);
  }

  /**
   * Get the current document state as an update
   */
  getStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Get state vector for synchronization
   */
  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }

  /**
   * Get diff update from a state vector
   */
  getDiffUpdate(stateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc, stateVector);
  }

  /**
   * Create a sync message
   */
  createSyncMessage(type: 'sync' | 'update' | 'awareness', data?: any): SyncMessage {
    const message: SyncMessage = {
      type,
      documentId: this.syncState.documentId,
      userId: this.syncState.userId,
      timestamp: Date.now()
    };

    switch (type) {
    case 'sync':
      message.stateVector = this.getStateVector();
      break;
    case 'update':
      message.update = data;
      break;
    case 'awareness':
      message.awareness = data;
      break;
    }

    return message;
  }

  /**
   * Handle incoming sync message
   */
  handleSyncMessage(message: SyncMessage): SyncMessage | null {
    switch (message.type) {
    case 'sync':
      // Respond with diff update
      if (message.stateVector) {
        const diffUpdate = this.getDiffUpdate(message.stateVector);
        return this.createSyncMessage('update', diffUpdate);
      }
      break;
      
    case 'update':
      // Apply the update
      if (message.update) {
        this.applyUpdate(message.update, message.userId);
      }
      break;
      
    case 'awareness':
      // Update awareness information
      if (message.awareness && message.userId) {
        this.updateAwareness(message.userId, message.awareness);
      }
      break;
    }

    return null;
  }

  /**
   * Update user presence/awareness
   */
  updateAwareness(userId: string, presence: UserPresence): void {
    this.awareness.set(userId, presence);
    
    // Clean up stale presence (older than 30 seconds)
    const now = Date.now();
    this.awareness.forEach((presence, id) => {
      if (now - presence.timestamp > 30000) {
        this.awareness.delete(id);
      }
    });

    if (this.onAwarenessUpdate) {
      this.onAwarenessUpdate(this.awareness);
    }
  }

  /**
   * Get current awareness state
   */
  getAwareness(): Map<string, UserPresence> {
    return new Map(this.awareness);
  }

  /**
   * Set local user presence
   */
  setLocalPresence(presence: Partial<UserPresence>): void {
    const fullPresence: UserPresence = {
      userId: this.syncState.userId,
      cursor: presence.cursor,
      selection: presence.selection,
      color: presence.color || '#' + Math.floor(Math.random()*16777215).toString(16),
      name: presence.name || 'Anonymous',
      timestamp: Date.now()
    };

    this.updateAwareness(this.syncState.userId, fullPresence);
  }

  /**
   * Subscribe to document updates
   */
  onDocumentUpdate(callback: (update: Uint8Array, origin: any) => void): void {
    this.onUpdate = callback;
  }

  /**
   * Subscribe to awareness updates
   */
  onAwarenessChange(callback: (awareness: Map<string, UserPresence>) => void): void {
    this.onAwarenessUpdate = callback;
  }

  /**
   * Get sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Create a snapshot of the current state
   */
  createSnapshot(): Uint8Array {
    return Y.encodeSnapshot(this.doc);
  }

  /**
   * Restore from a snapshot
   */
  restoreFromSnapshot(snapshot: Uint8Array): void {
    const newDoc = Y.decodeSnapshot(snapshot);
    const update = Y.encodeStateAsUpdate(newDoc);
    Y.applyUpdate(this.doc, update);
  }

  /**
   * Get operation history
   */
  getHistory(limit: number = 100): any[] {
    // This would integrate with Yjs history plugin
    // For now, return empty array
    return [];
  }

  /**
   * Calculate document size
   */
  getDocumentSize(): number {
    const update = this.getStateAsUpdate();
    return update.byteLength;
  }

  /**
   * Garbage collect deleted items
   */
  garbageCollect(): void {
    // Yjs automatically handles garbage collection
    // This method can be used to force GC if needed
    this.doc.gc = true;
  }

  /**
   * Destroy the sync handler
   */
  destroy(): void {
    this.doc.destroy();
    this.awareness.clear();
  }
}