import { ConnectionState } from '../websocket/WebSocketClient';
import { GraphUpdatePayload, PresenceUpdatePayload } from '../../../server/src/websocket/types';

}
export interface UseWebSocketOptions {
    url?: string;
    documentId: string;
    userId?: string;
    authToken?: string;
    enabled?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onGraphUpdate?: (update: GraphUpdatePayload) => void;
    onPresenceUpdate?: (presence: PresenceUpdatePayload) => void;
    onUserJoin?: (user: any) => void;
    onUserLeave?: (user: any) => void;
    onError?: (error: any) => void;

}
export interface UseWebSocketReturn {
    connectionState: ConnectionState;
    isConnected: boolean;
    isConnecting: boolean;
    sendGraphUpdate: (update: GraphUpdatePayload) => boolean;
    sendPresenceUpdate: (presence: PresenceUpdatePayload) => boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    queuedMessages: number;
    clearQueue: () => void;

export declare function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn;
export declare function usePresence(documentId: string, userId: string, userName?: string, userAvatar?: string): {
    cursor: {
        x: number;
        y: number;
        nodeId?: string;
}
    } | null;
    selection: string[];
    currentTool: string;
    isTyping: boolean;
    focusedNodeId: string;
    otherUsers: any[];
    userCursors: [string, any][];
    userSelections: [string, any][];
    typingUsers: any[];
    updateCursor: (x: number, y: number, nodeId?: string, viewportBounds?: any) => void;
    updateSelection: (newSelection: string[]) => void;
    updateActivity: (tool?: string, typing?: boolean, focusedNode?: string) => void;
};
//# sourceMappingURL=useWebSocket.d.ts.map