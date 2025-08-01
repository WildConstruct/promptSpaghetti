/**
 * Y.Graph - Custom Yjs type for collaborative graph editing
 * Epic 9.1.1 - CRDT Implementation Research
 */
import * as Y from 'yjs';
/**
 * Custom Yjs type for graph structures
 * Provides conflict-free collaborative editing of nodes and edges
 */
export class YGraph extends Y.AbstractType {
  nodes;
  edges;
  constructor() {
    super();
    this.nodes = new Y.Map();
    this.edges = new Y.Map();

  /**
   * Get the type name for Yjs
   */
  get _name() {
    return 'Graph';

  /**
   * Clone the graph (required by Yjs)
   */
  _copy() {
    const copy = new YGraph();
    // The maps will be replaced with document-integrated ones
    // so we don't need to copy data here
    return copy;

  /**
   * Write the graph to an update encoder (required by Yjs)
   */
  _write(encoder) {
    // Since we're using standard Y.Maps, we don't need custom serialization
    // The maps will handle their own serialization
    encoder.writeTypeRef(YGraph);
    encoder.writeVarUint(0); // No custom data

  /**
   * Add a node to the graph
   */
  addNode(node) {
    // If doc is available, use transaction
    if (this.doc) {
      this.doc.transact(() => {
        this.nodes.set(node.id, node);
      });
 else {
      // Direct set for testing
      this.nodes.set(node.id, node);


  /**
   * Update a node in the graph
   */
  updateNode(nodeId, updates) {
    if (this.doc) {
      this.doc.transact(() => {
        const node = this.nodes.get(nodeId);
        if (node) {
          this.nodes.set(nodeId, { ...node, ...updates });

      });
 else {
      const node = this.nodes.get(nodeId);
      if (node) {
        this.nodes.set(nodeId, { ...node, ...updates });



  /**
   * Delete a node from the graph
   */
  deleteNode(nodeId) {
    if (this.doc) {
      this.doc.transact(() => {
        // Delete the node
        this.nodes.delete(nodeId);
        // Delete all connected edges
        this.edges.forEach((edge, edgeId) => {
          if (edge.source === nodeId || edge.target === nodeId) {
            this.edges.delete(edgeId);

        });
      });
 else {
      // Direct operations for testing
      this.nodes.delete(nodeId);
      this.edges.forEach((edge, edgeId) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          this.edges.delete(edgeId);

      });


  /**
   * Add an edge to the graph
   */
  addEdge(edge) {
    if (this.doc) {
      this.doc.transact(() => {
        // Verify source and target nodes exist
        if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
          this.edges.set(edge.id, edge);

      });
 else {
      // Direct operations for testing
      if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
        this.edges.set(edge.id, edge);



  /**
   * Update an edge in the graph
   */
  updateEdge(edgeId, updates) {
    this.doc?.transact(() => {
      const edge = this.edges.get(edgeId);
      if (edge) {
        this.edges.set(edgeId, { ...edge, ...updates });

    });

  /**
   * Delete an edge from the graph
   */
  deleteEdge(edgeId) {
    if (this.doc) {
      this.doc.transact(() => {
        this.edges.delete(edgeId);
      });
 else {
      this.edges.delete(edgeId);


  /**
   * Get all nodes as an array
   */
  getNodes() {
    return Array.from(this.nodes.values());

  /**
   * Get all edges as an array
   */
  getEdges() {
    return Array.from(this.edges.values());

  /**
   * Get a specific node
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId);

  /**
   * Get a specific edge
   */
  getEdge(edgeId) {
    return this.edges.get(edgeId);

  /**
   * Apply a graph operation
   */
  applyOperation(operation) {
    if (operation.type === 'node') {
      this._applyNodeOperation(operation);
 else if (operation.type === 'edge') {
      this._applyEdgeOperation(operation);


  _applyNodeOperation(operation) {
    switch (operation.action) {
      case 'create':
        if (operation.data) {
          this.addNode(operation.data);

        break;
      case 'update':
        if (operation.data) {
          this.updateNode(operation.targetId, operation.data);

        break;
      case 'delete':
        this.deleteNode(operation.targetId);
        break;


  _applyEdgeOperation(operation) {
    switch (operation.action) {
      case 'create':
        if (operation.data) {
          this.addEdge(operation.data);

        break;
      case 'update':
        if (operation.data) {
          this.updateEdge(operation.targetId, operation.data);

        break;
      case 'delete':
        this.deleteEdge(operation.targetId);
        break;


  /**
   * Serialize the graph to JSON
   */
  toJSON() {
    return {
      nodes: this.getNodes(),
      edges: this.getEdges(),
    };

  /**
   * Load graph from JSON
   */
  fromJSON(data) {
    this.doc?.transact(() => {
      // Clear existing data
      this.nodes.clear();
      this.edges.clear();
      // Load nodes
      data.nodes.forEach(node => {
        this.nodes.set(node.id, node);
      });
      // Load edges
      data.edges.forEach(edge => {
        this.edges.set(edge.id, edge);
      });
    });

  /**
   * Observe changes to nodes
   */
  observeNodes(callback) {
    this.nodes.observe(callback);

  /**
   * Observe changes to edges
   */
  observeEdges(callback) {
    this.edges.observe(callback);

  /**
   * Unobserve changes to nodes
   */
  unobserveNodes(callback) {
    this.nodes.unobserve(callback);

  /**
   * Unobserve changes to edges
   */
  unobserveEdges(callback) {
    this.edges.unobserve(callback);


// Register the custom type with Yjs
export function registerYGraphType() {
  // @ts-ignore - Yjs type registration
  Y.registerType('Graph', YGraph);

