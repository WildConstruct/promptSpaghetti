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
export declare function useCollaborativeReactFlow(): {
    nodes: FlowNode[];
    edges: FlowEdge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    onNodeDrag: (event: React.MouseEvent, node: FlowNode) => void;
    onSelectionChange: (params: {
        nodes: FlowNode[];
        edges: FlowEdge[];
    }) => void;
    onPaneClick: () => void;
    enableCollaboration: any;
    disableCollaboration: any;
    addNodeAtPosition: (node: Node, position: {
        x: number;
        y: number;
    }) => void;
    isCollaborative: any;
    collaborationEnabled: any;
    connectionStatus: any;
    connectedUsers: any;
    getUserCursors: () => {
        userId: string;
        user: UserPresence;
        position: {
            x: number;
            y: number;
        };
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
export declare function useCollaborationStatus(): any;
//# sourceMappingURL=useCollaborativeReactFlow.d.ts.map