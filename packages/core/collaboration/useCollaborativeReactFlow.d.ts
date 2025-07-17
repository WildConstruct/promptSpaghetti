import { Node as FlowNode, Edge as FlowEdge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { Node } from '../graphSchema';
import { UserPresence } from './collaborativeGraphStore';
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
    enableCollaboration: (options: import("./GraphCRDTAdapter").CollaborativeGraphOptions) => Promise<void>;
    disableCollaboration: () => void;
    addNodeAtPosition: (node: Node, position: {
        x: number;
        y: number;
    }) => void;
    isCollaborative: boolean;
    collaborationEnabled: boolean;
    connectionStatus: "error" | "connected" | "disconnected" | "connecting";
    connectedUsers: Map<string, UserPresence>;
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
export declare function useNodeCollaborators(nodeId: string): UserPresence[];
export declare function useCollaborationStatus(): {
    isCollaborative: boolean;
    connectionStatus: "error" | "connected" | "disconnected" | "connecting";
    isConnected: boolean;
    connectedUserCount: number;
    lastSyncTime: number | undefined;
};
//# sourceMappingURL=useCollaborativeReactFlow.d.ts.map