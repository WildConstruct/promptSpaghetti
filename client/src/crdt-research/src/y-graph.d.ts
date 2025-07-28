/**
 * Y.Graph - Custom Yjs type for collaborative graph editing
 * Epic 9.1.1 - CRDT Implementation Research
 */
import * as Y from 'yjs';
import { CRDTNode, CRDTEdge, GraphOperation } from './types';
/**
 * Custom Yjs type for graph structures
 * Provides conflict-free collaborative editing of nodes and edges
 */
export declare class YGraph extends Y.AbstractType<any> {
    nodes: Y.Map<CRDTNode>;
    edges: Y.Map<CRDTEdge>;
    constructor();
    /**
     * Get the type name for Yjs
     */
    get _name(): string;
    /**
     * Clone the graph (required by Yjs)
     */
    _copy(): any;
    /**
     * Write the graph to an update encoder (required by Yjs)
     */
    _write(encoder: any): void;
    /**
     * Add a node to the graph
     */
    addNode(node: CRDTNode): void;
    /**
     * Update a node in the graph
     */
    updateNode(nodeId: string, updates: Partial<CRDTNode>): void;
    /**
     * Delete a node from the graph
     */
    deleteNode(nodeId: string): void;
    /**
     * Add an edge to the graph
     */
    addEdge(edge: CRDTEdge): void;
    /**
     * Update an edge in the graph
     */
    updateEdge(edgeId: string, updates: Partial<CRDTEdge>): void;
    /**
     * Delete an edge from the graph
     */
    deleteEdge(edgeId: string): void;
    /**
     * Get all nodes as an array
     */
    getNodes(): CRDTNode[];
    /**
     * Get all edges as an array
     */
    getEdges(): CRDTEdge[];
    /**
     * Get a specific node
     */
    getNode(nodeId: string): CRDTNode | undefined;
    /**
     * Get a specific edge
     */
    getEdge(edgeId: string): CRDTEdge | undefined;
    /**
     * Apply a graph operation
     */
    applyOperation(operation: GraphOperation): void;
    private _applyNodeOperation;
    private _applyEdgeOperation;
    /**
     * Serialize the graph to JSON
     */
    toJSON(): {
        nodes: CRDTNode[];
        edges: CRDTEdge[];
    };
    /**
     * Load graph from JSON
     */
    fromJSON(data: {)
        nodes: CRDTNode[];
        edges: CRDTEdge[];
    }): void;
    /**
     * Observe changes to nodes
     */
    observeNodes(callback: (event: Y.YEvent<any>) => void): void;
    /**
     * Observe changes to edges
     */
    observeEdges(callback: (event: Y.YEvent<any>) => void): void;
    /**
     * Unobserve changes to nodes
     */
    unobserveNodes(callback: (event: Y.YEvent<any>) => void): void;
    /**
     * Unobserve changes to edges
     */
    unobserveEdges(callback: (event: Y.YEvent<any>) => void): void;
}
export declare function registerYGraphType(): void;
//# sourceMappingURL=y-graph.d.ts.map