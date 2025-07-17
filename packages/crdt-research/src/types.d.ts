export type PeerId = string;
export interface LogicalTimestamp {
    counter: number;
    peerId: PeerId;
}
export interface CRDTOperation {
    id: string;
    timestamp: LogicalTimestamp | number;
    peerId: PeerId;
    type: string;
}
export interface GraphOperation extends CRDTOperation {
    type: 'node' | 'edge' | 'addNode' | 'removeNode' | 'updateNode' | 'addEdge' | 'removeEdge';
    payload: unknown;
    action?: 'create' | 'update' | 'delete';
    targetId?: string;
    data?: any;
    userId?: string;
}
export interface CRDTGraph {
    nodes: Map<string, CRDTNode>;
    edges: Map<string, CRDTEdge>;
    tombstones: Set<string>;
    version: LogicalTimestamp;
}
export interface CRDTNode {
    id: string;
    type: 'WeightedChoice' | 'Concat' | 'Output' | 'SetVariable' | 'GetVariable' | 'Include' | string;
    position: {
        x: number;
        y: number;
    };
    data: any;
    metadata: Record<string, any>;
    createdBy?: PeerId;
    createdAt?: LogicalTimestamp;
    lastModified?: LogicalTimestamp;
    deleted?: boolean;
}
export interface CRDTEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    metadata: Record<string, any>;
    createdBy?: PeerId;
    createdAt?: LogicalTimestamp;
    deleted?: boolean;
}
export interface SyncMessage {
    type: 'operation' | 'state' | 'request';
    peerId: PeerId;
    timestamp: LogicalTimestamp;
    payload: unknown;
}
export type ConflictResolutionStrategy = 'lastWriteWins' | 'multiValue' | 'custom';
export interface CRDTConfig {
    peerId: PeerId;
    conflictResolution: ConflictResolutionStrategy;
    gcInterval?: number;
    maxHistorySize?: number;
}
export interface UserPresence {
    userId: string;
    cursor?: {
        nodeId?: string;
        position?: {
            x: number;
            y: number;
        };
    };
    selection?: string[];
    color: string;
    name: string;
    timestamp: number;
}
export interface SyncState {
    documentId: string;
    userId: string;
    lastSync: number;
    pendingOps: number;
}
export interface SyncMessage {
    type: 'sync' | 'update' | 'awareness' | 'operation' | 'state' | 'request';
    documentId: string;
    userId: string;
    timestamp: number;
    stateVector?: Uint8Array;
    update?: Uint8Array;
    awareness?: UserPresence;
    peerId?: PeerId;
    payload?: unknown;
}
export interface NodeOperation extends GraphOperation {
    type: 'node';
    action: 'create' | 'update' | 'delete';
    targetId: string;
    data?: Partial<CRDTNode>;
}
export interface EdgeOperation extends GraphOperation {
    type: 'edge';
    action: 'create' | 'update' | 'delete';
    targetId: string;
    data?: Partial<CRDTEdge>;
}
//# sourceMappingURL=types.d.ts.map