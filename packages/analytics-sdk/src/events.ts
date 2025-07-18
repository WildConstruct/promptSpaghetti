/**
 * Predefined analytics events for cross-platform tracking
 */

import { AnalyticsEvent } from './types';

export const Events = {
  GRAPH_CREATED: 'graph_created',
  GRAPH_EXECUTED: 'graph_executed',
  NODE_ADDED: 'node_added',
  NODE_DELETED: 'node_deleted',
  EDGE_CREATED: 'edge_created',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_CONFLICT: 'sync_conflict',
  PERFORMANCE_FPS: 'performance_fps',
  PERFORMANCE_MEMORY: 'performance_memory'
} as const;

export type EventName = typeof Events[keyof typeof Events];

export function createEvent(
  name: EventName, 
  properties: Record<string, any> = {}
): Omit<AnalyticsEvent, 'timestamp' | 'platform'> {
  return {
    name,
    properties
  };
}