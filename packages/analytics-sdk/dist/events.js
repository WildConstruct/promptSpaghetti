/**
 * Predefined analytics events for cross-platform tracking
 */
export const Events = {
    GRAPH_CREATED: 'graph_created',
    GRAPH_EXECUTED: 'graph_executed',
    NODE_ADDED: 'node_added',
    NODE_DELETED: 'node_deleted',
    EDGE_CREATED: 'edge_created',
    SYNC_COMPLETED: 'sync_completed',
    SYNC_CONFLICT: 'sync_conflict',
    PERFORMANCE_FPS: 'performance_fps',
    PERFORMANCE_MEMORY: 'performance_memory',
};
export function createEvent(name, properties = {}) {
    return {
        name,
        properties,
    };
}
//# sourceMappingURL=events.js.map