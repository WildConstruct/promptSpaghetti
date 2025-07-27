/**
 * Collaborative Graph Store - Epic 9.1.2
 * Extends existing graph store with collaborative editing capabilities
 */
import { Graph, Node, Edge } from '../graphSchema';
import { GraphCRDTAdapter, CollaborativeGraphOptions } from './GraphCRDTAdapter';
export interface UserPresence {
    userId: string;
    name: string;
    color: string;
    cursor?: {
        nodeId?: string;
        position?: {
            x: number;
            y: number;
        };
    };
    selection?: string[];
    lastSeen: number;
}
export interface CollaborativeGraphState {
    graph: Graph;
    isCollaborative: boolean;
    collaborationEnabled: boolean;
    documentId?: string;
    userId?: string;
    connectedUsers: Map<string, UserPresence>;
    localPresence?: UserPresence;
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    lastSyncTime?: number;
    crdtAdapter?: GraphCRDTAdapter;
    enableCollaboration: (options: CollaborativeGraphOptions) => Promise<void>;
    disableCollaboration: () => void;
    setGraph: (graph: Graph) => void;
    addNode: (node: Node, position?: {
        x: number;
        y: number;
    }) => void;
    updateNode: (nodeId: string, updates: Partial<Node>) => void;
    deleteNode: (nodeId: string) => void;
    addEdge: (edge: Edge) => void;
    deleteEdge: (edgeId: string) => void;
    updateNodePosition: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    updateLocalPresence: (presence: Partial<UserPresence>) => void;
    updateUserCursor: (nodeId?: string, position?: {
        x: number;
        y: number;
    }) => void;
    updateUserSelection: (nodeIds: string[]) => void;
    applyRemoteUpdate: (update: Uint8Array) => void;
    getDocumentState: () => Uint8Array | null;
    createSnapshot: () => Uint8Array | null;
    getMetrics: () => any;
    getSyncState: () => any;
}
export declare const crdtAdapter: GraphCRDTAdapter;
//# sourceMappingURL=collaborativeGraphStore.d.ts.map