/**
 * Migration bridge that syncs between old and new state systems
 */
export declare class GraphStoreBridge {
    private newStateContainer;
    private isNewStateContainer;
    constructor();
    /**
     * Setup bidirectional synchronization between old and new state
     */
    private setupBidirectionalSync;
    /**
     * Convert nodes from new format to old ReactFlow format
     */
    private convertNodesToOldFormat;
    /**
     * Convert edges from new format to old ReactFlow format
     */
    private convertEdgesToOldFormat;
    /**
     * Convert nodes from old ReactFlow format to new format
     */
    private convertNodesToNewFormat;
    /**
     * Convert edges from old ReactFlow format to new format
     */
    private convertEdgesToNewFormat;
}
//# sourceMappingURL=GraphStoreBridge.d.ts.map