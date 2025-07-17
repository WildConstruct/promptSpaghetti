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
    }
    /**
     * Get the type name for Yjs
     */
    get _name() {
        return 'Graph';
    }
    /**
     * Clone the graph (required by Yjs)
     */
    _copy() {
        const copy = new YGraph();
        this.nodes.forEach((node, id) => {
            copy.nodes.set(id, { ...node });
        });
        this.edges.forEach((edge, id) => {
            copy.edges.set(id, { ...edge });
        });
        return copy;
    }
    /**
     * Write the graph to an update encoder (required by Yjs)
     */
    _write(encoder) {
        encoder.writeTypeRef(YGraph);
        // Write nodes
        encoder.writeVarUint(this.nodes.size);
        this.nodes.forEach((node, id) => {
            encoder.writeString(id);
            encoder.writeJSON(node);
        });
        // Write edges
        encoder.writeVarUint(this.edges.size);
        this.edges.forEach((edge, id) => {
            encoder.writeString(id);
            encoder.writeJSON(edge);
        });
    }
    /**
     * Add a node to the graph
     */
    addNode(node) {
        this.doc?.transact(() => {
            this.nodes.set(node.id, node);
        });
    }
    /**
     * Update a node in the graph
     */
    updateNode(nodeId, updates) {
        this.doc?.transact(() => {
            const node = this.nodes.get(nodeId);
            if (node) {
                this.nodes.set(nodeId, { ...node, ...updates });
            }
        });
    }
    /**
     * Delete a node from the graph
     */
    deleteNode(nodeId) {
        this.doc?.transact(() => {
            // Delete the node
            this.nodes.delete(nodeId);
            // Delete all connected edges
            this.edges.forEach((edge, edgeId) => {
                if (edge.source === nodeId || edge.target === nodeId) {
                    this.edges.delete(edgeId);
                }
            });
        });
    }
    /**
     * Add an edge to the graph
     */
    addEdge(edge) {
        this.doc?.transact(() => {
            // Verify source and target nodes exist
            if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
                this.edges.set(edge.id, edge);
            }
        });
    }
    /**
     * Update an edge in the graph
     */
    updateEdge(edgeId, updates) {
        this.doc?.transact(() => {
            const edge = this.edges.get(edgeId);
            if (edge) {
                this.edges.set(edgeId, { ...edge, ...updates });
            }
        });
    }
    /**
     * Delete an edge from the graph
     */
    deleteEdge(edgeId) {
        this.doc?.transact(() => {
            this.edges.delete(edgeId);
        });
    }
    /**
     * Get all nodes as an array
     */
    getNodes() {
        return Array.from(this.nodes.values());
    }
    /**
     * Get all edges as an array
     */
    getEdges() {
        return Array.from(this.edges.values());
    }
    /**
     * Get a specific node
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    /**
     * Get a specific edge
     */
    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }
    /**
     * Apply a graph operation
     */
    applyOperation(operation) {
        if (operation.type === 'node') {
            this._applyNodeOperation(operation);
        }
        else if (operation.type === 'edge') {
            this._applyEdgeOperation(operation);
        }
    }
    _applyNodeOperation(operation) {
        switch (operation.action) {
            case 'create':
                if (operation.data) {
                    this.addNode(operation.data);
                }
                break;
            case 'update':
                if (operation.data) {
                    this.updateNode(operation.targetId, operation.data);
                }
                break;
            case 'delete':
                this.deleteNode(operation.targetId);
                break;
        }
    }
    _applyEdgeOperation(operation) {
        switch (operation.action) {
            case 'create':
                if (operation.data) {
                    this.addEdge(operation.data);
                }
                break;
            case 'update':
                if (operation.data) {
                    this.updateEdge(operation.targetId, operation.data);
                }
                break;
            case 'delete':
                this.deleteEdge(operation.targetId);
                break;
        }
    }
    /**
     * Serialize the graph to JSON
     */
    toJSON() {
        return {
            nodes: this.getNodes(),
            edges: this.getEdges()
        };
    }
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
    }
    /**
     * Observe changes to the graph
     */
    observe(callback) {
        this.nodes.observe(callback);
        this.edges.observe(callback);
    }
    /**
     * Unobserve changes
     */
    unobserve(callback) {
        this.nodes.unobserve(callback);
        this.edges.unobserve(callback);
    }
}
// Register the custom type with Yjs
export function registerYGraphType() {
    // @ts-ignore - Yjs type registration
    Y.registerType('Graph', YGraph);
}
