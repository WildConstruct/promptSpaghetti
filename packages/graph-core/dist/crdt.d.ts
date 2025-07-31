/**
 * CRDT integration for graph synchronization
 * Enhanced implementation with conflict resolution and real-time sync
 */
import * as Y from 'yjs';
import { GraphDocument, GraphNode, GraphEdge, GraphMetadata } from './types';
export interface CRDTOptions {
  clientId?: string;
  enableUndo?: boolean;
  maxHistorySize?: number;
}
export interface SyncStatus {
  connected: boolean;
  lastSync: Date;
  pendingOperations: number;
  conflictCount: number;
}
export declare class GraphCRDT {
  private ydoc;
  private nodes;
  private edges;
  private metadata;
  private operationHistory;
  private clientId;
  private changeListeners;
  constructor(options?: CRDTOptions);
  /**
   * Add or update a node in the graph
   */
  addNode(node: GraphNode): void;
  /**
   * Update an existing node
   */
  updateNode(nodeId: string, updates: Partial<GraphNode>): void;
  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): void;
  /**
   * Add or update an edge
   */
  addEdge(edge: GraphEdge): void;
  /**
   * Remove an edge
   */
  removeEdge(edgeId: string): void;
  /**
   * Update graph metadata
   */
  updateMetadata(metadata: Partial<GraphMetadata>): void;
  /**
   * Convert CRDT state to GraphDocument
   */
  toGraphDocument(): GraphDocument;
  /**
   * Load a GraphDocument into the CRDT
   */
  fromGraphDocument(graph: GraphDocument): void;
  /**
   * Get the underlying Yjs document for sync providers
   */
  getDoc(): Y.Doc;
  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus;
  /**
   * Subscribe to changes
   */
  onChange(callback: (event: Y.YEvent<any>[]) => void): () => void;
  /**
   * Get operation history
   */
  getHistory(): any[];
  /**
   * Clear operation history (keep only recent entries)
   */
  pruneHistory(maxEntries?: number): void;
  /**
   * Export graph state as update for sync
   */
  exportUpdate(): Uint8Array;
  /**
   * Apply update from remote sync
   */
  applyUpdate(update: Uint8Array): void;
  /**
   * Get state vector for efficient sync
   */
  getStateVector(): Uint8Array;
  /**
   * Get diff update since state vector
   */
  getDiffUpdate(stateVector: Uint8Array): Uint8Array;
  /**
   * Destroy the CRDT instance
   */
  destroy(): void;
  private setupChangeTracking;
  private recordOperation;
  private generateClientId;
  private generateGraphId;
  private generateOperationId;
}
/**
 * Factory function to create a GraphCRDT instance
 */
export declare function createGraphCRDT(options?: CRDTOptions): GraphCRDT;
/**
 * Merge multiple graph documents using CRDT semantics
 */
export declare function mergeGraphs(graphs: GraphDocument[]): GraphDocument;
//# sourceMappingURL=crdt.d.ts.map
