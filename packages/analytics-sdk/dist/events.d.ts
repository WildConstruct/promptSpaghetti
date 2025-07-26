/**
 * Predefined analytics events for cross-platform tracking
 */
import { AnalyticsEvent } from './types';
export declare const Events: {
    readonly GRAPH_CREATED: "graph_created";
    readonly GRAPH_EXECUTED: "graph_executed";
    readonly NODE_ADDED: "node_added";
    readonly NODE_DELETED: "node_deleted";
    readonly EDGE_CREATED: "edge_created";
    readonly SYNC_COMPLETED: "sync_completed";
    readonly SYNC_CONFLICT: "sync_conflict";
    readonly PERFORMANCE_FPS: "performance_fps";
    readonly PERFORMANCE_MEMORY: "performance_memory";
};
export type EventName = typeof Events[keyof typeof Events];
export declare function createEvent(
  name: EventName,
  properties?: Record<string,
  unknown>
): Omit<AnalyticsEvent, 'timestamp' | 'platform'>;
//# sourceMappingURL=events.d.ts.map