/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Graph CRDT Adapter - Epic 9.1.2
 * Bridges existing graph schema with CRDT collaborative editing
 */
import { Node, Edge, Graph } from '../graphSchema';

}
}
export interface CollaborativeGraphOptions { documentId: string;
    userId: string;
    onGraphChange?: (graph: Graph) => void;
    onUserPresence?: (users: Map<string, unknown>) => void;
    onConnectionStatus?: (connected: boolean) => void;
/**
 * Adapter that wraps the existing graph model with CRDT capabilities
 */
export declare class GraphCRDTAdapter {
    private syncHandler;
    private yGraph;
    private options;
    private currentGraph;
    private isUpdating;
    constructor(options: CollaborativeGraphOptions, initialGraph?: Graph);
    /**
     * Convert existing Node to CRDTNode
     */
    private toCRDTNode;
    /**
     * Convert existing Edge to CRDTEdge
     */
    private toCRDTEdge;
    /**
     * Convert CRDTNode back to existing Node format
     */
    private fromCRDTNode;
    /**
     * Convert CRDTEdge back to existing Edge format
     */
    private fromCRDTEdge;
    /**
     * Extract position from existing node (assuming UI stores position separately)
     */
    private extractPosition;
    /**
     * Extract node data excluding schema fields
     */
    private extractNodeData;
    /**
     * Extract node metadata
     */
    private extractNodeMetadata;
    /**
     * Extract edge metadata
     */
    private extractEdgeMetadata;
    /**
     * Setup CRDT observers to sync changes back to graph
     */
    private setupObservers;
    /**
     * Import existing graph into CRDT
     */
    private importGraph;
    /**
     * Sync CRDT state back to current graph
     */
    private syncToGraph;
    /**
     * Public API: Get current graph state
     */
    getGraph(): Graph;
    /**
     * Public API: Add a node collaboratively
     */
    addNode(node: Node, position?: {)
        x: number;
        y: number }
}
    }): void;
    /**
     * Public API: Update a node collaboratively
     */
    updateNode(nodeId: string, updates: Partial<Node>): void;
    /**
     * Public API: Delete a node collaboratively
     */
    deleteNode(nodeId: string): void;
    /**
     * Public API: Add an edge collaboratively
     */
    addEdge(edge: Edge): void;
    /**
     * Public API: Delete an edge collaboratively
     */
    deleteEdge(edgeId: string): void;
    /**
     * Public API: Update node position (for React Flow integration)
     */
    updateNodePosition(nodeId: string, position: { )
        x: number;
        y: number }): void;
    /**
     * Public API: Set user presence
     */
    setUserPresence(presence: { )
        cursor?: {
            nodeId?: string;
            position?: {
                x: number;
                y: number };
        };
        selection?: string[];
        name?: string;
        color?: string;
    }): void;
    /**
     * Public API: Get sync state
     */
    getSyncState(): import("../../crdt-research/src/types").SyncState;
    /**
     * Public API: Apply remote update
     */
    applyRemoteUpdate(update: Uint8Array): void;
    /**
     * Public API: Get document state for initial sync
     */
    getDocumentState(): Uint8Array;
    /**
     * Public API: Create snapshot
     */
    createSnapshot(): Uint8Array;
    /**
     * Public API: Get performance metrics
     */
    getMetrics(): { documentSize: number;
        nodeCount: number;
        edgeCount: number;
        syncState: import("../../crdt-research/src/types").SyncState };
    /**
     * Cleanup resources
     */
    destroy(): void;
/**
 * Factory function to create collaborative graph adapter
 */
export declare function createCollaborativeGraph(options: CollaborativeGraphOptions)
  initialGraph?: Graph
): GraphCRDTAdapter;
//# sourceMappingURL=GraphCRDTAdapter.d.ts.map