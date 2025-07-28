import { Graph } from '../graphSchema';
export interface CollaborativeGraphOptions {
    documentId: string;
    userId: string;
    onGraphChange?: (graph: Graph) => void;
    onUserPresence?: (users: Map<string, unknown>) => void;
    onConnectionStatus?: (connected: boolean) => void;
}
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
}
//# sourceMappingURL=GraphCRDTAdapter.d.ts.map