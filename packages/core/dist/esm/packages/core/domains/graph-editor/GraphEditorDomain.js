;
// React Hooks
hooks: {
    useGraphState: () => GraphEditorState;
    useNodeSelection: () => {
        selectedNodeIds: string;
        selectNodes: (nodeIds, isMultiSelect) => void ;
        clearSelection: () => void ;
        isSelected: (nodeId) => boolean;
    };
    useGraphValidation: () => {
        errors: ValidationError;
        validateGraph: (graph) => Promise;
        isValid: boolean;
    };
    usePreviewSeeds: () => {
        seeds: number;
        results: Record;
        isExecuting: boolean;
        executePreview: (graph) => Promise;
        addSeed: () => void ;
        removeSeed: (index) => void ;
    };
    useGraphOperations: () => {
        addNode: (nodeType, position) => void ;
        removeNode: (nodeId) => void ;
        updateNode: (nodeId, updates) => void ;
        addEdge: (sourceId, targetId) => void ;
        removeEdge: (edgeId) => void ;
        moveNode: (nodeId, position) => void ;
    };
    useAutosave: () => {
        isEnabled: boolean;
        isDirty: boolean;
        lastSaved: Date | null;
        save: () => Promise;
        toggleAutosave: () => void ;
    };
}
;
// Domain Services
services: {
    validation: IGraphValidationService;
    operations: IGraphOperationsService;
    execution: IGraphExecutionService;
    state: IGraphStateService;
}
;
// Event System
events: GraphDomainEvents & {
    subscribe: (event, callback) => () => void ,
    emit: (event, ...args) => void 
};
// Configuration
config: {
    getConfig: () => GraphEditorConfig;
    updateConfig: (config) => void ;
    resetConfig: () => void ;
}
;
// Utilities
utils: {
    createEmptyGraph: () => Graph;
    cloneGraph: (graph) => Graph;
    getNodeById: (graph, nodeId) => Node | undefined;
    getConnectedNodes: (graph, nodeId) => Node;
    findNodeByType: (graph, nodeType) => Node;
    calculateGraphBounds: (graph) => { width: number; height: number; };
}
;
export const GRAPH_DOMAIN_EVENTS = {
    GRAPH_MODIFIED: 'graph:modified',
    NODE_SELECTED: 'graph:node:selected',
    NODE_ADDED: 'graph:node:added',
    NODE_REMOVED: 'graph:node:removed',
    NODE_UPDATED: 'graph:node:updated',
    EDGE_ADDED: 'graph:edge:added',
    EDGE_REMOVED: 'graph:edge:removed',
    VALIDATION_ERROR: 'graph:validation:error',
    EXECUTION_STARTED: 'graph:execution:started',
    EXECUTION_COMPLETED: 'graph:execution:completed',
    EXECUTION_ERROR: 'graph:execution:error',
    STATE_SAVED: 'graph:state:saved',
    STATE_LOADED: 'graph:state:loaded',
    CONFIG_UPDATED: 'graph:config:updated',
};
