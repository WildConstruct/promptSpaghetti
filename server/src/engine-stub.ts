// Minimal engine stub for server startup
import { Graph } from '../../packages/core/graphSchema';

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
  graph: Graph
): Promise<{
  outputs: string[];
  executionPath?: unknown[];
}> {
  console.log(
    `[STUB] executeGraph called with ${graph.nodes?.length || 0} nodes`
  );

  // Return minimal stub response
  return {
    outputs: [
      'Stub output - server is running but graph execution is disabled'
    ],
    executionPath: null
  };
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function executeGraphLegacy(
  graph: Graph,
  _sessionId?: string,
  _userId?: number
): Promise<string[]> {
  void _sessionId;
  void _userId;
  const result = await executeGraph(graph);
  return result.outputs;
}
