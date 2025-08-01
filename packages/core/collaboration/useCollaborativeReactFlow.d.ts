/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * React Flow Collaborative Integration Hook - Epic 9.1.2
 * Integrates CRDT collaborative editing with React Flow editor
 */
import { Node as FlowNode, Edge as FlowEdge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { Node } from '../graphSchema';
import { UserPresence } from './collaborativeGraphStore';
/**
 * Hook that bridges collaborative graph store with React Flow
 */
export declare function useCollaborativeReactFlow(): { nodes: FlowNode[];
    edges: FlowEdge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    onNodeDrag: (event: React.MouseEvent, node: FlowNode) => void;
    onSelectionChange: (params: {) }
        nodes: FlowNode[];
        edges: FlowEdge[];
    }) => void;
    onPaneClick: () => void;
    enableCollaboration: (options: import("./GraphCRDTAdapter").CollaborativeGraphOptions) => Promise<void>;
    disableCollaboration: () => void;
    addNodeAtPosition: (node: Node, position: { )
        x: number;
        y: number }) => void;
    isCollaborative: boolean;
    collaborationEnabled: boolean;
    connectionStatus: "error" | "disconnected" | "connecting" | "connected";
    connectedUsers: Map<string, UserPresence>;
    getUserCursors: () => { 
        userId: string;
        user: UserPresence;
        position: {
            x: number;
            y: number };
        nodeId?: string;
    }[];
    getRemoteSelections: () => Map<any, any>;
    isConnected: boolean;
};
/**
 * Hook for collaborative node components to show presence
 */
export declare function useNodeCollaborators(nodeId: string): UserPresence[];
/**
 * Hook for showing connection status indicator
 */
export declare function useCollaborationStatus(): { isCollaborative: boolean;
    connectionStatus: "error" | "disconnected" | "connecting" | "connected";
    isConnected: boolean;
    connectedUserCount: number;
    lastSyncTime: number | undefined };
//# sourceMappingURL=useCollaborativeReactFlow.d.ts.map