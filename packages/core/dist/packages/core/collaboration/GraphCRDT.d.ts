/**
 * CRDT representation of a graph node
 */
export interface GraphNodeCRDT {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: Record<string, any>;
    inputs: string;
    metadata: {
        version: number;
        lastModified: string;
        modifiedBy: string;
        created: string;
        createdBy: string;
    };
}
export interface GraphEdgeCRDT {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourcePort?: string;
    targetPort?: string;
    type: 'data' | 'control' | 'conditional';
    metadata: {
        version: number;
        lastModified: string;
        modifiedBy: string;
        created: string;
        createdBy: string;
        [key: string]: any;
    };
}
export interface OperationRecord {
    operationId: string;
    type: string;
    nodeId?: string;
    edgeId?: string;
    timestamp: number;
    userId: string;
    applied: boolean;
    reverted: boolean;
    conflicted: boolean;
}
export declare class GraphCRDT {
    private ydoc;
    private nodes;
    private edges;
    private operations;
    private metadata;
    private documentId;
    private clientId;
    private userId;
    private versionVector;
    private onOperationApplied?;
    private onConflictDetected?;
    private onStateChanged?;
    constructor(documentId: string, clientId: string, userId: string);
    /**
    * Setup change handlers for CRDT updates
    */
    private setupChangeHandlers;
    /**
     * Handle node change events
     */
    private handleNodeChanges;
    if(change: any, action: any): any;
}
//# sourceMappingURL=GraphCRDT.d.ts.map