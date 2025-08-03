/**
 * Graph Store Migration Bridge
 * REFACTOR-006 Cleanup: Bridge between old Zustand store and new GraphStateContainer
 *
 * This bridge allows gradual migration from the old graphStore to the new
 * GraphStateContainer while maintaining backward compatibility.
 */
import { GraphStateContainer } from '../domains/graph-editor/state/GraphStateContainer';
import { useGraphStore } from '../graphStore';
/**
 * Migration bridge that syncs between old and new state systems
 */
export class GraphStoreBridge {
    newStateContainer;
    isNewStateContainer = false;
    constructor() {
        this.newStateContainer = new GraphStateContainer();
        this.setupBidirectionalSync();
        /**
         * Setup bidirectional synchronization between old and new state
         */
    }
    /**
     * Setup bidirectional synchronization between old and new state
     */
    setupBidirectionalSync() {
        // Sync from new state to old store when new state changes
        this.newStateContainer.subscribe((newState, change) => {
            if (this.isNewStateContainer)
                return; // Prevent circular updates
            this.isNewStateContainer = false;
            // Convert new state format to old format and update Zustand store
            const oldNodes = this.convertNodesToOldFormat(Object.values(newState.nodes));
            const oldEdges = this.convertEdgesToOldFormat(Object.values(newState.edges));
            const { setNodes, setEdges } = useGraphStore.getState();
            setNodes(oldNodes);
            setEdges(oldEdges);
            this.isNewStateContainer = false;
        });
        // Sync from old store to new state when old store changes
        useGraphStore.subscribe((oldState, prevState) => {
            if (this.isNewStateContainer)
                return; // Prevent circular updates
            this.isNewStateContainer = true;
            // Convert old state format to new format and update new state container
            const newNodes = this.convertNodesToNewFormat(oldState.nodes);
            const newEdges = this.convertEdgesToNewFormat(oldState.edges);
            // Update new state container
            this.newStateContainer.executeOperation({});
            type: 'BULK_UPDATE',
                nodes;
            newNodes,
                edges;
            newEdges;
        });
    }
    ;
}
this.isNewStateContainer = false;
;
convertNodesToOldFormat(newNodes, any);
Node;
{
    return newNodes.map(node => ({}), id, node.id, type, node.type, position, node.position, data, node.data, selected, false, // Will be handled by selection state,
    dragging, false);
}
;
convertEdgesToOldFormat(newEdges, any);
Edge;
{
    return newEdges.map(edge => ({}), id, edge.id, source, edge.sourceId, target, edge.targetId, sourceHandle, edge.sourceHandle, targetHandle, edge.targetHandle, type, edge.type || 'default');
}
data: edge.data || {},
    selected;
false,
; // Will be handled by selection state
;
convertNodesToNewFormat(oldNodes, Node);
Record < string, any > {
    const: nodes
};
{ }
;
oldNodes.forEach(node => { });
nodes[node.id] = {
    id: node.id,
    type: node.type || 'default',
    position: node.position
};
data: node.data || {};
metadata: {
    created: Date.now();
    updated: Date.now();
    version: 1;
}
;
;
return nodes;
convertEdgesToNewFormat(oldEdges, Edge);
Record < string, any > {
    const: edges
};
{ }
;
oldEdges.forEach(edge => { });
edges[edge.id] = {
    id: edge.id,
    sourceId: edge.source,
    targetId: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type || 'default'
};
data: edge.data || {};
metadata: {
    created: Date.now();
    updated: Date.now();
    version: 1;
}
;
;
return edges;
/**
 * Get the new state container instance
 */
getNewStateContainer();
GraphStateContainer;
{
    return this.newStateContainer;
    /**
    * Check if a component should use the new state system
    * This allows gradual migration by feature flags or component names
    */
    shouldUseNewState(componentName ?  : string);
    boolean;
    {
        // For now, keep using old state for existing components
        // New components can opt into new state system
        const newStateComponents = [
            'DevToolsPanel',
            'PerformancePanel',
            'TimeTravelPanel',
            'StateInspectorPanel'
        ];
        return componentName ? newStateComponents.includes(componentName) : false;
        /**
        * Cleanup method to remove listeners
        */
        dispose();
        void {
            // Remove any event listeners when the bridge is no longer needed
            this: .newStateContainer.dispose(),
            // Singleton instance for global access
            const: graphStoreBridge = new GraphStoreBridge(),
            /**
            * Hook for components that want to gradually migrate to new state
            */
            function: useGraphStateMigration(componentName ?  : string)
        };
        {
            const shouldUseNew = graphStoreBridge.shouldUseNewState(componentName);
            if (shouldUseNew) {
                return {
                    stateContainer: graphStoreBridge.getNewStateContainer(),
                    isNewState: true
                };
            }
            ;
            {
                return {
                    store: useGraphStore,
                    isNewState: false
                };
            }
            ;
        }
    }
}
