import { Graph } from '../../packages/core/graphSchema';
/**
 * Initialize analytics collection for execution engine
 */
export declare function initializeAnalytics(): void;
/**
 * Execute a graph and return the output(s) from all Output nodes (ordered by id).
 * Automatically detects and supports both basic and advanced nodes.
 * Epic 13 - Enhanced with comprehensive analytics collection.
 * Epic 8.5 - Returns execution path data for visualization.
 */
export declare function executeGraph(
  graph: Graph,
  sessionId?: string,
  userId?: number
): Promise<{
  outputs: string[];
  executionPath?: ExecutionPath;
}>;
/**
 * Legacy wrapper for backward compatibility - returns just the output strings
 */
export declare function executeGraphLegacy(
  graph: Graph,
  sessionId?: string,
  userId?: number
): Promise<string[]>;
//# sourceMappingURL=engine.d.ts.map
