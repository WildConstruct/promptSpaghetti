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

export class GraphCRDT {
  private ydoc: Y.Doc;
  private nodes: Y.Map<any>;
  private edges: Y.Map<any>;
  private metadata: Y.Map<any>;
  private operationHistory: Y.Array<any>;
  private clientId: string;
  private changeListeners: Set<(event: Y.YEvent<any>[]) => void> = new Set();

  constructor(options: CRDTOptions = {}) {
    this.clientId = options.clientId || this.generateClientId();
    this.ydoc = new Y.Doc();
    
    this.nodes = this.ydoc.getMap('nodes');
    this.edges = this.ydoc.getMap('edges');
    this.metadata = this.ydoc.getMap('metadata');
    this.operationHistory = this.ydoc.getArray('history');

    // Set up change tracking
    this.setupChangeTracking();
  }

  /**
   * Add or update a node in the graph
   */
  addNode(node: GraphNode): void {
    this.ydoc.transact(() => {
      this.nodes.set(node.id, {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        inputs: node.inputs,
        lastModified: new Date().toISOString(),
        modifiedBy: this.clientId
      });

      this.recordOperation('addNode', { nodeId: node.id, type: node.type });
    });
  }

  /**
   * Update an existing node
   */
  updateNode(nodeId: string, updates: Partial<GraphNode>): void {
    this.ydoc.transact(() => {
      const existing = this.nodes.get(nodeId);
      if (existing) {
        const updated = {
          ...existing,
          ...updates,
          id: nodeId, // Ensure ID doesn't change
          lastModified: new Date().toISOString(),
          modifiedBy: this.clientId
        };
        this.nodes.set(nodeId, updated);
        this.recordOperation('updateNode', { nodeId, updates });
      }
    });
  }

  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): void {
    this.ydoc.transact(() => {
      this.nodes.delete(nodeId);
      
      // Remove edges connected to this node
      const edgesToRemove: string[] = [];
      this.edges.forEach((edge, edgeId) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          edgesToRemove.push(edgeId);
        }
      });
      
      edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
      
      this.recordOperation('removeNode', { nodeId, removedEdges: edgesToRemove });
    });
  }

  /**
   * Add or update an edge
   */
  addEdge(edge: GraphEdge): void {
    this.ydoc.transact(() => {
      // Validate that source and target nodes exist
      if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
        throw new Error('Cannot create edge: source or target node does not exist');
      }

      this.edges.set(edge.id, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        lastModified: new Date().toISOString(),
        modifiedBy: this.clientId
      });

      this.recordOperation('addEdge', { edgeId: edge.id, source: edge.source, target: edge.target });
    });
  }

  /**
   * Remove an edge
   */
  removeEdge(edgeId: string): void {
    this.ydoc.transact(() => {
      const edge = this.edges.get(edgeId);
      this.edges.delete(edgeId);
      this.recordOperation('removeEdge', { edgeId, edge });
    });
  }

  /**
   * Update graph metadata
   */
  updateMetadata(metadata: Partial<GraphMetadata>): void {
    this.ydoc.transact(() => {
      const current = this.metadata.get('current') || {};
      const updated = {
        ...current,
        ...metadata,
        modified: new Date().toISOString(),
        modifiedBy: this.clientId
      };
      this.metadata.set('current', updated);
      this.recordOperation('updateMetadata', { metadata });
    });
  }

  /**
   * Convert CRDT state to GraphDocument
   */
  toGraphDocument(): GraphDocument {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge>();

    // Convert nodes
    this.nodes.forEach((nodeData, nodeId) => {
      nodes.set(nodeId, {
        id: nodeData.id,
        type: nodeData.type,
        position: nodeData.position,
        data: nodeData.data,
        inputs: nodeData.inputs
      });
    });

    // Convert edges
    this.edges.forEach((edgeData, edgeId) => {
      edges.set(edgeId, {
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData.sourceHandle,
        targetHandle: edgeData.targetHandle
      });
    });

    // Get metadata
    const metadataData = this.metadata.get('current') || {};

    return {
      id: metadataData.id || this.generateGraphId(),
      nodes,
      edges,
      metadata: {
        version: metadataData.version || '1.0.0',
        created: new Date(metadataData.created || Date.now()),
        modified: new Date(metadataData.modified || Date.now()),
        author: metadataData.author,
        platform: metadataData.platform
      },
      seed: metadataData.seed
    };
  }

  /**
   * Load a GraphDocument into the CRDT
   */
  fromGraphDocument(graph: GraphDocument): void {
    this.ydoc.transact(() => {
      // Clear existing data
      this.nodes.clear();
      this.edges.clear();
      this.metadata.clear();

      // Load nodes
      graph.nodes.forEach((node, nodeId) => {
        this.nodes.set(nodeId, {
          ...node,
          lastModified: new Date().toISOString(),
          modifiedBy: this.clientId
        });
      });

      // Load edges
      graph.edges.forEach((edge, edgeId) => {
        this.edges.set(edgeId, {
          ...edge,
          lastModified: new Date().toISOString(),
          modifiedBy: this.clientId
        });
      });

      // Load metadata
      this.metadata.set('current', {
        ...graph.metadata,
        id: graph.id,
        seed: graph.seed,
        modified: new Date().toISOString(),
        modifiedBy: this.clientId
      });

      this.recordOperation('loadGraph', { graphId: graph.id, nodeCount: graph.nodes.size });
    });
  }

  /**
   * Get the underlying Yjs document for sync providers
   */
  getDoc(): Y.Doc {
    return this.ydoc;
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      connected: false, // Will be updated by sync provider
      lastSync: new Date(),
      pendingOperations: this.operationHistory.length,
      conflictCount: 0 // Will be tracked by conflict resolution
    };
  }

  /**
   * Subscribe to changes
   */
  onChange(callback: (event: Y.YEvent<any>[]) => void): () => void {
    this.changeListeners.add(callback);
    return () => this.changeListeners.delete(callback);
  }

  /**
   * Get operation history
   */
  getHistory(): any[] {
    return this.operationHistory.toArray();
  }

  /**
   * Clear operation history (keep only recent entries)
   */
  pruneHistory(maxEntries: number = 1000): void {
    this.ydoc.transact(() => {
      const currentLength = this.operationHistory.length;
      if (currentLength > maxEntries) {
        const toRemove = currentLength - maxEntries;
        this.operationHistory.delete(0, toRemove);
      }
    });
  }

  /**
   * Export graph state as update for sync
   */
  exportUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Apply update from remote sync
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update);
  }

  /**
   * Get state vector for efficient sync
   */
  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.ydoc);
  }

  /**
   * Get diff update since state vector
   */
  getDiffUpdate(stateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc, stateVector);
  }

  /**
   * Destroy the CRDT instance
   */
  destroy(): void {
    this.changeListeners.clear();
    this.ydoc.destroy();
  }

  // Private methods

  private setupChangeTracking(): void {
    const observer = (event: Y.YMapEvent<any>, _transaction: Y.Transaction) => {
      // Convert single event to array format for compatibility
      const events = [event];
      
      // Notify all change listeners
      this.changeListeners.forEach(callback => {
        try {
          callback(events);
        } catch (error) {
          console.error('Error in CRDT change listener:', error);
        }
      });
    };

    this.nodes.observe(observer);
    this.edges.observe(observer);
    this.metadata.observe(observer);
  }

  private recordOperation(type: string, data: any): void {
    this.operationHistory.push([{
      type,
      data,
      timestamp: new Date().toISOString(),
      clientId: this.clientId,
      id: this.generateOperationId()
    }]);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }


  private generateGraphId(): string {
    return `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create a GraphCRDT instance
 */
export function createGraphCRDT(options?: CRDTOptions): GraphCRDT {
  return new GraphCRDT(options);
}

/**
 * Merge multiple graph documents using CRDT semantics
 */
export function mergeGraphs(graphs: GraphDocument[]): GraphDocument {
  if (graphs.length === 0) {
    throw new Error('Cannot merge empty graph array');
  }

  if (graphs.length === 1) {
    return graphs[0];
  }

  const crdt = new GraphCRDT();
  
  // Apply each graph as an update
  graphs.forEach(graph => {
    const tempCrdt = new GraphCRDT();
    tempCrdt.fromGraphDocument(graph);
    const update = tempCrdt.exportUpdate();
    crdt.applyUpdate(update);
    tempCrdt.destroy();
  });

  const merged = crdt.toGraphDocument();
  crdt.destroy();
  
  return merged;
}