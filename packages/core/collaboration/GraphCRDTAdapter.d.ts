import { Node, Edge, Graph } from '../graphSchema';
export interface CollaborativeGraphOptions {
    documentId: string;
    userId: string;
    onGraphChange?: (graph: Graph) => void;
    onUserPresence?: (users: Map<string, any>) => void;
    onConnectionStatus?: (connected: boolean) => void;
}
export declare class GraphCRDTAdapter {
    private syncHandler;
    private yGraph;
    private options;
    private currentGraph;
    private isUpdating;
    constructor(options: CollaborativeGraphOptions, initialGraph?: Graph);
    private toCRDTNode;
    private toCRDTEdge;
    private fromCRDTNode;
    private fromCRDTEdge;
    private extractPosition;
    private extractNodeData;
    private extractNodeMetadata;
    private extractEdgeMetadata;
    private setupObservers;
    private importGraph;
    private syncToGraph;
    getGraph(): Graph;
    addNode(node: Node, position?: {
        x: number;
        y: number;
    }): void;
    updateNode(nodeId: string, updates: Partial<Node>): void;
    deleteNode(nodeId: string): void;
    addEdge(edge: Edge): void;
    deleteEdge(edgeId: string): void;
    updateNodePosition(nodeId: string, position: {
        x: number;
        y: number;
    }): void;
    setUserPresence(presence: {
        cursor?: {
            nodeId?: string;
            position?: {
                x: number;
                y: number;
            };
        };
        selection?: string[];
        name?: string;
        color?: string;
    }): void;
    getSyncState(): import("../../crdt-research/src/types").SyncState;
    applyRemoteUpdate(update: Uint8Array): void;
    getDocumentState(): Uint8Array;
    createSnapshot(): Uint8Array;
    getMetrics(): {
        documentSize: number;
        nodeCount: number;
        edgeCount: number;
        syncState: import("../../crdt-research/src/types").SyncState;
    };
    destroy(): void;
}
export declare function createCollaborativeGraph(options: CollaborativeGraphOptions, initialGraph?: Graph): GraphCRDTAdapter;
//# sourceMappingURL=GraphCRDTAdapter.d.ts.map