/**
 * Graph Store Migration Bridge
 * REFACTOR-006 Cleanup: Bridge between old Zustand store and new GraphStateContainer
 *
 * This bridge allows gradual migration from the old graphStore to the new
 * GraphStateContainer while maintaining backward compatibility.
 */
import { GraphStateContainer } from '../domains/graph-editor/state/GraphStateContainer';
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
    /**
     * Get the new state container instance
     */
    getNewStateContainer(): GraphStateContainer;
    /**
     * Check if a component should use the new state system
     * This allows gradual migration by feature flags or component names
     */
    shouldUseNewState(componentName?: string): boolean;
    /**
     * Cleanup method to remove listeners
     */
    dispose(): void;
}
export declare const graphStoreBridge: GraphStoreBridge;
/**
 * Hook for components that want to gradually migrate to new state
 */
export declare function useGraphStateMigration(componentName?: string): {
    stateContainer: GraphStateContainer;
    isNewState: boolean;
    store?: undefined;
} | {
    store: any;
    isNewState: boolean;
    stateContainer?: undefined;
};
//# sourceMappingURL=GraphStoreBridge.d.ts.map