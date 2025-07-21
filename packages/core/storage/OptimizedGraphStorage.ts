/**
 * Optimized Graph Storage System
 * Implements hybrid Map-based storage for O(1) node lookups with React-Flow compatibility
 */

import { Edge, Node } from 'reactflow';
import { NodeData, NodeType } from '../types/NodeTypes';

/**
 * Compressed storage format for large graphs
 */
interface CompressedGraphData {
  format_version: '2.0.0';
  compressed: true;
  node_data: Uint8Array;
  edge_data: Uint8Array;
  metadata: {
    node_count: number;
    edge_count: number;
    compression_ratio: number;
    original_size: number;
  };
}

/**
 * Index structures for fast graph queries
 */
interface GraphIndexes {
  // Type-based indexes
  nodesByType: Map<NodeType, Set<string>>;
  edgesBySource: Map<string, Set<string>>;
  edgesByTarget: Map<string, Set<string>>;
  
  // Connection indexes
  incomingEdges: Map<string, Edge[]>;
  outgoingEdges: Map<string, Edge[]>;
  
  // Performance indexes
  leafNodes: Set<string>;    // Nodes with no outgoing edges
  rootNodes: Set<string>;    // Nodes with no incoming edges
  isolatedNodes: Set<string>; // Nodes with no edges
}

/**
 * Optimized graph storage with hybrid Map/Array architecture
 */
export class OptimizedGraphStorage {
  private nodeMap = new Map<string, Node>();
  private edgeMap = new Map<string, Edge>();
  private indexes: GraphIndexes;
  private dirty = new Set<string>(); // Track changed nodes
  private version = 0; // For cache invalidation
  
  // Cached arrays for React-Flow compatibility
  private cachedNodes: Node[] | null = null;
  private cachedEdges: Edge[] | null = null;
  private cacheVersion = -1;

  constructor(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
    this.indexes = this.createEmptyIndexes();
    this.loadData(initialNodes, initialEdges);
  }

  /**
   * Get nodes array (React-Flow compatible) - lazily computed and cached
   */
  get nodes(): Node[] {
    if (this.cachedNodes === null || this.cacheVersion !== this.version) {
      this.cachedNodes = Array.from(this.nodeMap.values());
      this.cacheVersion = this.version;
    }
    return this.cachedNodes;
  }

  /**
   * Get edges array (React-Flow compatible) - lazily computed and cached  
   */
  get edges(): Edge[] {
    if (this.cachedEdges === null || this.cacheVersion !== this.version) {
      this.cachedEdges = Array.from(this.edgeMap.values());
      this.cacheVersion = this.version;
    }
    return this.cachedEdges;
  }

  /**
   * O(1) node lookup
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodeMap.get(nodeId);
  }

  /**
   * O(1) edge lookup
   */
  getEdge(edgeId: string): Edge | undefined {
    return this.edgeMap.get(edgeId);
  }

  /**
   * Add node with automatic indexing
   */
  addNode(node: Node): void {
    this.nodeMap.set(node.id, node);
    this.updateNodeIndexes(node, 'add');
    this.markDirty(node.id);
    this.invalidateCache();
  }

  /**
   * Add edge with automatic indexing
   */
  addEdge(edge: Edge): void {
    this.edgeMap.set(edge.id, edge);
    this.updateEdgeIndexes(edge, 'add');
    this.invalidateCache();
  }

  /**
   * Update node with partial data
   */
  updateNode(nodeId: string, updates: Partial<Node>): boolean {
    const existing = this.nodeMap.get(nodeId);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    
    // Update indexes if type changed
    if (updates.type && updates.type !== existing.type) {
      this.updateNodeIndexes(existing, 'remove');
      this.updateNodeIndexes(updated, 'add');
    }

    this.nodeMap.set(nodeId, updated);
    this.markDirty(nodeId);
    this.invalidateCache();
    return true;
  }

  /**
   * Remove node and all connected edges
   */
  removeNode(nodeId: string): boolean {
    const node = this.nodeMap.get(nodeId);
    if (!node) return false;

    // Remove all connected edges
    const connectedEdges = [
      ...(this.indexes.incomingEdges.get(nodeId) || []),
      ...(this.indexes.outgoingEdges.get(nodeId) || [])
    ];
    
    connectedEdges.forEach(edge => this.removeEdge(edge.id));

    // Remove node and update indexes
    this.nodeMap.delete(nodeId);
    this.updateNodeIndexes(node, 'remove');
    this.dirty.delete(nodeId);
    this.invalidateCache();
    return true;
  }

  /**
   * Remove edge
   */
  removeEdge(edgeId: string): boolean {
    const edge = this.edgeMap.get(edgeId);
    if (!edge) return false;

    this.edgeMap.delete(edgeId);
    this.updateEdgeIndexes(edge, 'remove');
    this.invalidateCache();
    return true;
  }

  /**
   * Get nodes by type - O(1) lookup
   */
  getNodesByType(type: NodeType): Node[] {
    const nodeIds = this.indexes.nodesByType.get(type);
    if (!nodeIds) return [];
    
    return Array.from(nodeIds).map(id => this.nodeMap.get(id)!).filter(Boolean);
  }

  /**
   * Get incoming edges for a node - O(1) lookup
   */
  getIncomingEdges(nodeId: string): Edge[] {
    return this.indexes.incomingEdges.get(nodeId) || [];
  }

  /**
   * Get outgoing edges for a node - O(1) lookup
   */
  getOutgoingEdges(nodeId: string): Edge[] {
    return this.indexes.outgoingEdges.get(nodeId) || [];
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<string, number>;
    connectivityStats: {
      leafNodes: number;
      rootNodes: number;
      isolatedNodes: number;
      averageConnections: number;
    };
    memoryUsage: {
      estimatedBytes: number;
      cacheHitRatio?: number;
    };
  } {
    const nodeTypes: Record<string, number> = {};
    for (const [type, nodeSet] of this.indexes.nodesByType) {
      nodeTypes[type] = nodeSet.size;
    }

    const totalConnections = Array.from(this.nodeMap.keys())
      .reduce((sum, nodeId) => {
        return sum + this.getIncomingEdges(nodeId).length + this.getOutgoingEdges(nodeId).length;
      }, 0);

    return {
      nodeCount: this.nodeMap.size,
      edgeCount: this.edgeMap.size,
      nodeTypes,
      connectivityStats: {
        leafNodes: this.indexes.leafNodes.size,
        rootNodes: this.indexes.rootNodes.size,
        isolatedNodes: this.indexes.isolatedNodes.size,
        averageConnections: this.nodeMap.size > 0 ? totalConnections / this.nodeMap.size : 0
      },
      memoryUsage: {
        estimatedBytes: this.estimateMemoryUsage()
      }
    };
  }

  /**
   * Serialize to compressed format for storage
   */
  toCompressedFormat(): CompressedGraphData | { nodes: Node[]; edges: Edge[] } {
    const nodeCount = this.nodeMap.size;
    const edgeCount = this.edgeMap.size;
    
    // Use compression for large graphs (>1000 nodes or >2MB estimated)
    const estimatedSize = this.estimateMemoryUsage();
    const shouldCompress = nodeCount > 1000 || estimatedSize > 2 * 1024 * 1024;

    if (!shouldCompress) {
      // Return regular format for small graphs
      return {
        nodes: this.nodes,
        edges: this.edges
      };
    }

    try {
      // Compress node and edge data
      const nodeData = this.compressNodes();
      const edgeData = this.compressEdges();
      const compressionRatio = (nodeData.length + edgeData.length) / estimatedSize;

      return {
        format_version: '2.0.0',
        compressed: true,
        node_data: nodeData,
        edge_data: edgeData,
        metadata: {
          node_count: nodeCount,
          edge_count: edgeCount,
          compression_ratio: compressionRatio,
          original_size: estimatedSize
        }
      };
    } catch (error) {
      console.warn('Compression failed, falling back to regular format:', error);
      return {
        nodes: this.nodes,
        edges: this.edges
      };
    }
  }

  /**
   * Load from regular or compressed format
   */
  static fromStorageFormat(data: any): OptimizedGraphStorage {
    if (data.compressed && data.format_version === '2.0.0') {
      return OptimizedGraphStorage.fromCompressed(data as CompressedGraphData);
    }
    
    // Regular format
    return new OptimizedGraphStorage(data.nodes || [], data.edges || []);
  }

  /**
   * Load from compressed format
   */
  static fromCompressed(compressed: CompressedGraphData): OptimizedGraphStorage {
    try {
      const nodes = OptimizedGraphStorage.decompressNodes(compressed.node_data);
      const edges = OptimizedGraphStorage.decompressEdges(compressed.edge_data);
      return new OptimizedGraphStorage(nodes, edges);
    } catch (error) {
      console.error('Failed to decompress graph data:', error);
      throw new Error('Invalid compressed graph data');
    }
  }

  /**
   * Get dirty nodes for incremental saves
   */
  getDirtyNodes(): Node[] {
    return Array.from(this.dirty).map(id => this.nodeMap.get(id)!).filter(Boolean);
  }

  /**
   * Mark all nodes as clean (after successful save)
   */
  markClean(): void {
    this.dirty.clear();
  }

  // Private methods

  private createEmptyIndexes(): GraphIndexes {
    return {
      nodesByType: new Map(),
      edgesBySource: new Map(),
      edgesByTarget: new Map(),
      incomingEdges: new Map(),
      outgoingEdges: new Map(),
      leafNodes: new Set(),
      rootNodes: new Set(),
      isolatedNodes: new Set()
    };
  }

  private loadData(nodes: Node[], edges: Edge[]): void {
    // Clear existing data
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.indexes = this.createEmptyIndexes();

    // Load nodes
    nodes.forEach(node => {
      this.nodeMap.set(node.id, node);
      this.updateNodeIndexes(node, 'add');
    });

    // Load edges
    edges.forEach(edge => {
      this.edgeMap.set(edge.id, edge);
      this.updateEdgeIndexes(edge, 'add');
    });

    this.invalidateCache();
  }

  private updateNodeIndexes(node: Node, operation: 'add' | 'remove'): void {
    const nodeType = (node.data as NodeData)?.type || node.type as NodeType;
    
    if (operation === 'add') {
      // Add to type index
      if (!this.indexes.nodesByType.has(nodeType)) {
        this.indexes.nodesByType.set(nodeType, new Set());
      }
      this.indexes.nodesByType.get(nodeType)!.add(node.id);

      // Update connectivity indexes
      this.updateConnectivityIndexes(node.id);
    } else {
      // Remove from type index
      this.indexes.nodesByType.get(nodeType)?.delete(node.id);
      if (this.indexes.nodesByType.get(nodeType)?.size === 0) {
        this.indexes.nodesByType.delete(nodeType);
      }

      // Remove from connectivity indexes
      this.indexes.leafNodes.delete(node.id);
      this.indexes.rootNodes.delete(node.id);
      this.indexes.isolatedNodes.delete(node.id);
    }
  }

  private updateEdgeIndexes(edge: Edge, operation: 'add' | 'remove'): void {
    if (operation === 'add') {
      // Update source/target indexes
      this.addToSetMap(this.indexes.edgesBySource, edge.source, edge.id);
      this.addToSetMap(this.indexes.edgesByTarget, edge.target, edge.id);

      // Update incoming/outgoing edge lists
      this.addToArrayMap(this.indexes.incomingEdges, edge.target, edge);
      this.addToArrayMap(this.indexes.outgoingEdges, edge.source, edge);

      // Update connectivity for affected nodes
      this.updateConnectivityIndexes(edge.source);
      this.updateConnectivityIndexes(edge.target);
    } else {
      // Remove from indexes
      this.removeFromSetMap(this.indexes.edgesBySource, edge.source, edge.id);
      this.removeFromSetMap(this.indexes.edgesByTarget, edge.target, edge.id);
      
      this.removeFromArrayMap(this.indexes.incomingEdges, edge.target, edge);
      this.removeFromArrayMap(this.indexes.outgoingEdges, edge.source, edge);

      // Update connectivity for affected nodes
      this.updateConnectivityIndexes(edge.source);
      this.updateConnectivityIndexes(edge.target);
    }
  }

  private updateConnectivityIndexes(nodeId: string): void {
    const hasIncoming = (this.indexes.incomingEdges.get(nodeId)?.length || 0) > 0;
    const hasOutgoing = (this.indexes.outgoingEdges.get(nodeId)?.length || 0) > 0;

    // Update connectivity sets
    if (!hasIncoming && !hasOutgoing) {
      this.indexes.isolatedNodes.add(nodeId);
      this.indexes.leafNodes.delete(nodeId);
      this.indexes.rootNodes.delete(nodeId);
    } else if (!hasIncoming) {
      this.indexes.rootNodes.add(nodeId);
      this.indexes.leafNodes.delete(nodeId);
      this.indexes.isolatedNodes.delete(nodeId);
    } else if (!hasOutgoing) {
      this.indexes.leafNodes.add(nodeId);
      this.indexes.rootNodes.delete(nodeId);
      this.indexes.isolatedNodes.delete(nodeId);
    } else {
      this.indexes.leafNodes.delete(nodeId);
      this.indexes.rootNodes.delete(nodeId);
      this.indexes.isolatedNodes.delete(nodeId);
    }
  }

  private addToSetMap<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key)!.add(value);
  }

  private removeFromSetMap<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
    const set = map.get(key);
    if (set) {
      set.delete(value);
      if (set.size === 0) {
        map.delete(key);
      }
    }
  }

  private addToArrayMap<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(value);
  }

  private removeFromArrayMap<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    const array = map.get(key);
    if (array) {
      const index = array.indexOf(value);
      if (index !== -1) {
        array.splice(index, 1);
        if (array.length === 0) {
          map.delete(key);
        }
      }
    }
  }

  private markDirty(nodeId: string): void {
    this.dirty.add(nodeId);
  }

  private invalidateCache(): void {
    this.cachedNodes = null;
    this.cachedEdges = null;
    this.version++;
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate node memory usage
    this.nodeMap.forEach(node => {
      size += JSON.stringify(node).length * 2; // Rough estimate (UTF-16)
    });

    // Estimate edge memory usage
    this.edgeMap.forEach(edge => {
      size += JSON.stringify(edge).length * 2;
    });

    return size;
  }

  private compressNodes(): Uint8Array {
    const nodeArray = Array.from(this.nodeMap.values());
    const jsonString = JSON.stringify(nodeArray);
    return new TextEncoder().encode(jsonString);
  }

  private compressEdges(): Uint8Array {
    const edgeArray = Array.from(this.edgeMap.values());
    const jsonString = JSON.stringify(edgeArray);
    return new TextEncoder().encode(jsonString);
  }

  private static decompressNodes(data: Uint8Array): Node[] {
    const jsonString = new TextDecoder().decode(data);
    return JSON.parse(jsonString);
  }

  private static decompressEdges(data: Uint8Array): Edge[] {
    const jsonString = new TextDecoder().decode(data);
    return JSON.parse(jsonString);
  }
}