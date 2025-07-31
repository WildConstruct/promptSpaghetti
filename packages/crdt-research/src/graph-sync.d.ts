/**
 * Graph Synchronization Handler
 * Epic 9.1.1 - Manages CRDT synchronization for collaborative graph editing
 */
import * as Y from 'yjs';
import { YGraph } from './y-graph';
import { SyncState, SyncMessage, UserPresence } from './types';
export declare class GraphSyncHandler {
  private doc;
  private graph;
  private nodes;
  private edges;
  private awareness;
  private syncState;
  private onUpdate?;
  private onAwarenessUpdate?;
  constructor(documentId: string, userId: string);
  /**
   * Get the graph instance
   */
  getGraph(): YGraph;
  /**
   * Get the Yjs document
   */
  getDoc(): Y.Doc;
  /**
   * Apply an update from a remote peer
   */
  applyUpdate(update: Uint8Array, origin?: any): void;
  /**
   * Get the current document state as an update
   */
  getStateAsUpdate(): Uint8Array;
  /**
   * Get state vector for synchronization
   */
  getStateVector(): Uint8Array;
  /**
   * Get diff update from a state vector
   */
  getDiffUpdate(stateVector: Uint8Array): Uint8Array;
  /**
   * Create a sync message
   */
  createSyncMessage(type: 'sync' | 'update' | 'awareness', data?: any): SyncMessage;
  /**
   * Handle incoming sync message
   */
  handleSyncMessage(message: SyncMessage): SyncMessage | null;
  /**
   * Update user presence/awareness
   */
  updateAwareness(userId: string, presence: UserPresence): void;
  /**
   * Get current awareness state
   */
  getAwareness(): Map<string, UserPresence>;
  /**
   * Set local user presence
   */
  setLocalPresence(presence: Partial<UserPresence>): void;
  /**
   * Subscribe to document updates
   */
  onDocumentUpdate(callback: (update: Uint8Array, origin: any) => void): void;
  /**
   * Subscribe to awareness updates
   */
  onAwarenessChange(callback: (awareness: Map<string, UserPresence>) => void): void;
  /**
   * Get sync state
   */
  getSyncState(): SyncState;
  /**
   * Create a snapshot of the current state
   */
  createSnapshot(): Uint8Array;
  /**
   * Restore from a snapshot
   */
  restoreFromSnapshot(snapshot: Uint8Array): void;
  /**
   * Get operation history
   */
  getHistory(limit?: number): any[];
  /**
   * Calculate document size
   */
  getDocumentSize(): number;
  /**
   * Garbage collect deleted items
   */
  garbageCollect(): void;
  /**
   * Destroy the sync handler
   */
  destroy(): void;
}
//# sourceMappingURL=graph-sync.d.ts.map
