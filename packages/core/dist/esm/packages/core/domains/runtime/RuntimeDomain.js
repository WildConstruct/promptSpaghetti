dateRange ?  : { start: Date, end: Date };
nodeTypes ?  : string;
limit ?  : number;
offset ?  : number;
values: {
    timestamp: Date;
    value: number;
}
[];
trend: 'improving' | 'degrading' | 'stable';
changeRate: number;
;
// React Hooks
hooks: {
    useRuntime: () => {
        state: RuntimeDomainState;
        executeGraph: (graph, seeds, options) => Promise;
        queueExecution: (graph, seeds) => Promise;
        cancelExecution: (taskId) => Promise;
        getMetrics: () => Promise;
    };
    useExecutionQueue: () => {
        queue: ExecutionTask;
        running: ExecutionInstance;
        completed: ExecutionRecord;
        queueSize: number;
        isProcessing: boolean;
        pauseQueue: () => Promise;
        resumeQueue: () => Promise;
    };
    useNodeRegistry: () => {
        nodes: NodeDefinition;
        loading: boolean;
        registerNode: (definition) => Promise;
        getNode: (nodeType) => NodeDefinition | null;
        searchNodes: (query) => NodeDefinition;
    };
    usePerformanceMetrics: () => {
        metrics: RuntimeMetrics | null;
        nodeMetrics: Map;
        loading: boolean;
        refreshMetrics: () => Promise;
        startProfiling: (executionId) => Promise;
        stopProfiling: (executionId) => Promise;
    };
    useValidation: () => {
        validateGraph: (graph) => Promise;
        validateNode: (node, definition) => Promise;
        getValidationRules: (nodeType) => Promise;
    };
}
;
// Domain Services
services: {
    execution: IExecutionService;
    nodeRegistry: INodeRegistryService;
    validation: IValidationService;
    performance: IPerformanceService;
    cache: ICacheService;
    security: ISecurityService;
}
;
// Event System
events: RuntimeDomainEvents & {
    subscribe: (event, callback) => () => void ,
    emit: (event, ...args) => void 
};
// Configuration
config: {
    getConfig: () => RuntimeConfig;
    updateConfig: (config) => void ;
    resetConfig: () => void ;
}
;
// Utilities
utils: {
    createExecutionContext: (graph, seed) => ExecutionContext;
    measureExecution: (fn) => Promise;
    optimizeGraph: (graph) => Promise;
    validateNodeDefinition: (definition) => ValidationResult;
    generateNodeId: () => string;
    serializeResults: (results) => string;
    deserializeResults: (data) => any;
}
;
export const RUNTIME_DOMAIN_EVENTS = {
    EXECUTION_STARTED: 'runtime:execution:started',
    EXECUTION_COMPLETED: 'runtime:execution:completed',
    EXECUTION_FAILED: 'runtime:execution:failed',
    EXECUTION_CANCELLED: 'runtime:execution:cancelled',
    NODE_EXECUTED: 'runtime:node:executed',
    NODE_FAILED: 'runtime:node:failed',
    VALIDATION_ERROR: 'runtime:validation:error',
    PERFORMANCE_THRESHOLD_EXCEEDED: 'runtime:performance:threshold:exceeded',
    MEMORY_THRESHOLD_EXCEEDED: 'runtime:memory:threshold:exceeded',
    QUEUE_OVERFLOW: 'runtime:queue:overflow',
    NODE_REGISTERED: 'runtime:node:registered',
    NODE_UNREGISTERED: 'runtime:node:unregistered',
    METRICS_UPDATED: 'runtime:metrics:updated',
    CACHE_CLEARED: 'runtime:cache:cleared',
    PROFILING_STARTED: 'runtime:profiling:started',
    PROFILING_COMPLETED: 'runtime:profiling:completed',
};
