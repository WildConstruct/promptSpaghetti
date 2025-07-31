// Minimal engine stub for server startup
import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Simplified stub for server startup
 */
export function initializeAnalytics(): void {
  console.log('Analytics initialization skipped (stub mode)');
}

/**
 * Simplified stub for server startup
 */
export async function executeGraph(
  graph: Graph,
  sessionId?: string,
  userId?: number
): Promise<{
  outputs: string[];
  executionPath?: any;
}> {
  console.log(`[STUB] executeGraph called with ${graph.nodes?.length || 0} nodes`);

  // Return minimal stub response
  return {
    outputs: ['Stub output - server is running but graph execution is disabled'],
    executionPath: null,
  };
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function executeGraphLegacy(graph: Graph, sessionId?: string, userId?: number): Promise<string[]> {
  const result = await executeGraph(graph, sessionId, userId);
  return result.outputs;
}
