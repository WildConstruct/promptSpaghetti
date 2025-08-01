/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Graph CRDT Adapter - Epic 9.1.2
 * Bridges existing graph schema with CRDT collaborative editing
 */
import * as Y from 'yjs';
import { Node, Edge, Graph } from '../graphSchema';
import { GraphSyncHandler } from '../../crdt-research/src/graph-sync';
import { YGraph } from '../../crdt-research/src/y-graph';
import { CRDTNode, CRDTEdge } from '../../crdt-research/src/types';


export interface CollaborativeGraphOptions {
  documentId: string;
  userId: string;
  onGraphChange?: (graph: Graph) => void;
  onUserPresence?: (users: Map<string, unknown>) => void;
  onConnectionStatus?: (connected: boolean) => void;
  /**
  * Adapter that wraps the existing graph model with CRDT capabilities
  */


export class GraphCRDTAdapter {
  private syncHandler: GraphSyncHandler;
  private yGraph: YGraph;
  private options: CollaborativeGraphOptions;
  private currentGraph: Graph;
  private isUpdating = false;
  constructor(options: CollaborativeGraphOptions, initialGraph?: Graph) {
    this.options = options;
    this.syncHandler = new GraphSyncHandler(options.documentId, options.userId);
    this.yGraph = this.syncHandler.getGraph();
    // Initialize with existing graph if provided
    this.currentGraph = initialGraph || { nodes: [], edges: [] };
    // Set up observers
    this.setupObservers();
    // Import initial graph to CRDT
    if (initialGraph) { this.importGraph(initialGraph) }


  /**
   * Convert existing Node to CRDTNode
   */
  private toCRDTNode(node: Node): CRDTNode { return {
  id: node.id
  type: node.type
  position: this.extractPosition(node)
  data: this.extractNodeData(node)
  metadata: {
  originalType: node.type
  inputs: (node as any).inputs || [] }
  ...this.extractNodeMetadata(node)

    };


  /**
   * Convert existing Edge to CRDTEdge  
   */
  private toCRDTEdge(edge: Edge, sourceNode: Node, targetNode: Node): CRDTEdge { return {
  id: edge.id
  source: edge.source
  target: edge.target
  sourceHandle: edge.sourceHandle || 'output'
  targetHandle: edge.targetHandle || 'input'
  metadata: {
  sourceType: sourceNode.type
  targetType: targetNode.type }
  ...this.extractEdgeMetadata(edge)

  };


  /**
   * Convert CRDTNode back to existing Node format
   */
  private fromCRDTNode(crdtNode: CRDTNode): Node { const baseNode = {
  id: crdtNode.id
  type: crdtNode.type as any
  inputs: crdtNode.metadata.inputs || [] }
};
    // Add type-specific properties based on node type
    switch (crdtNode.type) { case 'WeightedChoice':
  return {
  ...baseNode
  type: 'WeightedChoice'
  choices: crdtNode.data.choices || [] }
};
    case 'Concat':
      return { ...baseNode
  type: 'Concat' }
};
    case 'Output':
      return { ...baseNode
  type: 'Output' }
};
    case 'SetVariable':
      return { ...baseNode
  type: 'SetVariable'
  variableName: crdtNode.data.variableName || ''
  value: crdtNode.data.value || '' }
};
    case 'GetVariable':
      return { ...baseNode
  type: 'GetVariable'
  variableName: crdtNode.data.variableName || '' }
};
    case 'Include':
      return { ...baseNode
  type: 'Include'
  name: crdtNode.data.name || '' }
};
    default:
      // For unknown types, preserve original data
      return { ...baseNode }
        ...crdtNode.data
      };



  /**
   * Convert CRDTEdge back to existing Edge format
   */
  private fromCRDTEdge(crdtEdge: CRDTEdge): Edge { return {
  id: crdtEdge.id
  source: crdtEdge.source
  target: crdtEdge.target
  sourceHandle: crdtEdge.sourceHandle
  targetHandle: crdtEdge.targetHandle }
};


  /**
   * Extract position from existing node (assuming UI stores position separately)
   */
  private extractPosition(node: Node): { x: number; y: number } {
    // For now, return default position
    // In real implementation, this would extract from React Flow node data
    return { x: 0, y: 0 };


  /**
   * Extract node data excluding schema fields
   */
  private extractNodeData(node: Node): any {
    const { id, type, inputs, ...data } = node as any;
    return data;


  /**
   * Extract node metadata
   */
  private extractNodeMetadata(node: Node): Record<string, unknown> { return {
  created: Date.now()
  lastModified: Date.now() }
};


  /**
   * Extract edge metadata
   */
  private extractEdgeMetadata(edge: Edge): Record<string, unknown> { return {
  created: Date.now() }
};

  /**
   * Setup CRDT observers to sync changes back to graph
   */
  private setupObservers(): void { // Observe CRDT changes and update current graph
    this.yGraph.observe((event) => {
      if (!this.isUpdating) {
        this.syncToGraph() }
    });
    // Observe document updates for network sync
    this.syncHandler.onDocumentUpdate((update, origin) => { // Handle remote updates
      if (origin !== this.options.userId) {
        this.syncToGraph() }
    });
    // Observe user presence
    this.syncHandler.onAwarenessChange((awareness) => { if (this.options.onUserPresence) {
        this.options.onUserPresence(awareness) }
    });

  /**
   * Import existing graph into CRDT
   */
  private importGraph(graph: Graph): void { this.isUpdating = true;
    try {
      // Create a map of nodes for edge validation
      const nodeMap = new Map<string, Node>();
      graph.nodes.forEach(node => nodeMap.set(node.id, node));
      // Import nodes
      graph.nodes.forEach(node => {
        const crdtNode = this.toCRDTNode(node);
        this.yGraph.addNode(crdtNode) });
      // Import edges
      graph.edges.forEach(edge => { const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
          const crdtEdge = this.toCRDTEdge(edge, sourceNode, targetNode);
          this.yGraph.addEdge(crdtEdge) }
      });
 finally { this.isUpdating = false }
  /**
   * Sync CRDT state back to current graph
   */
  private syncToGraph(): void {
    const nodes = this.yGraph.getNodes().map(node => this.fromCRDTNode(node));
    const edges = this.yGraph.getEdges().map(edge => this.fromCRDTEdge(edge));
    this.currentGraph = { nodes, edges };
    if (this.options.onGraphChange) { this.options.onGraphChange(this.currentGraph) }
  /**
   * Public API: Get current graph state
   */
  getGraph(): Graph {
    return { ...this.currentGraph };

  /**
   * Public API: Add a node collaboratively
   */
  addNode(node: Node, position?: { x: number; y: number }): void { const crdtNode = this.toCRDTNode(node);
    if (position) {
      crdtNode.position = position }
    this.isUpdating = true;
    this.yGraph.addNode(crdtNode);
    this.isUpdating = false;
    this.syncToGraph();

  /**
   * Public API: Update a node collaboratively
   */
  updateNode(nodeId: string, updates: Partial<Node>): void { const existingNode = this.yGraph.getNode(nodeId);
    if (!existingNode) return;
    const crdtUpdates: Partial<CRDTNode> = { }
  data: { ...existingNode.data, ...this.extractNodeData(updates as Node) }
      metadata: { ...existingNode.metadata, lastModified: Date.now() }
    };
    this.isUpdating = true;
    this.yGraph.updateNode(nodeId, crdtUpdates);
    this.isUpdating = false;
    this.syncToGraph();

  /**
   * Public API: Delete a node collaboratively
   */
  deleteNode(nodeId: string): void { this.isUpdating = true;
    this.yGraph.deleteNode(nodeId);
    this.isUpdating = false;
    this.syncToGraph() }
  /**
   * Public API: Add an edge collaboratively
   */
  addEdge(edge: Edge): void { const sourceNode = this.currentGraph.nodes.find(n => n.id === edge.source);
    const targetNode = this.currentGraph.nodes.find(n => n.id === edge.target);
    if (sourceNode && targetNode) {
      const crdtEdge = this.toCRDTEdge(edge, sourceNode, targetNode);
      this.isUpdating = true;
      this.yGraph.addEdge(crdtEdge);
      this.isUpdating = false;
      this.syncToGraph() }
  /**
   * Public API: Delete an edge collaboratively
   */
  deleteEdge(edgeId: string): void { this.isUpdating = true;
    this.yGraph.deleteEdge(edgeId);
    this.isUpdating = false;
    this.syncToGraph() }
  /**
   * Public API: Update node position (for React Flow integration)
   */
  updateNodePosition(nodeId: string, position: { x: number; y: number }): void {
    this.isUpdating = true;
    this.yGraph.updateNode(nodeId, { position });
    this.isUpdating = false;
    // Don't sync to graph for position-only updates to avoid feedback loops

  /**
   * Public API: Set user presence
   */
  setUserPresence(presence: {
    cursor?: { nodeId?: string; position?: { x: number; y: number } };
    selection?: string;
    name?: string;
    color?: string;
  }): void { this.syncHandler.setLocalPresence(presence) }
  /**
   * Public API: Get sync state
   */
  getSyncState() { return this.syncHandler.getSyncState() }
  /**
   * Public API: Apply remote update
   */
  applyRemoteUpdate(update: Uint8Array): void { this.syncHandler.applyUpdate(update) }
  /**
   * Public API: Get document state for initial sync
   */
  getDocumentState(): Uint8Array { return this.syncHandler.getStateAsUpdate() }
  /**
   * Public API: Create snapshot
   */
  createSnapshot(): Uint8Array { return this.syncHandler.createSnapshot() }
  /**
   * Public API: Get performance metrics
   */
  getMetrics() { return {
  documentSize: this.syncHandler.getDocumentSize()
  nodeCount: this.yGraph.getNodes().length
  edgeCount: this.yGraph.getEdges().length
  syncState: this.syncHandler.getSyncState() }
};

  /**
   * Cleanup resources
   */
  destroy(): void { this.syncHandler.destroy() }


/**
 * Factory function to create collaborative graph adapter
 */
export function createCollaborativeGraph(
  options: CollaborativeGraphOptions
  initialGraph?: Graph
): GraphCRDTAdapter { return new GraphCRDTAdapter(options, initialGraph) }