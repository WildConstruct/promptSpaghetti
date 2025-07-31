/**
 * Core types for graph-core package
 * Extracted from existing packages/core for Epic 15 cross-platform support
 */
import { z } from 'zod';
export declare const NodeTypeEnum: z.ZodEnum<
  [
    'WeightedChoice',
    'Concat',
    'Output',
    'Include',
    'SetVariable',
    'GetVariable',
    'WeightedAdvanced',
    'Conditional',
    'Sequential',
    'Markov',
    'PythonTransform',
  ]
>;
export type NodeType = z.infer<typeof NodeTypeEnum>;
export interface ExecutionContext {
  variables: Record<string, unknown>;
  seed: string | number;
  edges?: Array<{
    source: string;
    target: string;
    [key: string]: any;
  }>;
  [key: string]: unknown;
}
export interface AdvancedExecutionContext extends ExecutionContext {
  nodeStates: Map<string, unknown>;
  evaluationDepth: number;
  performanceCache: Map<string, unknown>;
  executionTrace: string[];
}
export interface GraphDocument {
  id: string;
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  metadata: GraphMetadata;
  seed?: string | number;
}
export interface GraphNode {
  id: string;
  type: NodeType;
  position?: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
  inputs?: string[];
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
export interface GraphMetadata {
  version: string;
  created: Date;
  modified: Date;
  author?: string;
  platform?: 'web' | 'mobile' | 'desktop';
}
export interface ExecutionResult {
  success: boolean;
  outputs: string[];
  error?: string;
  metadata: {
    executionTime: number;
    seed?: number | string;
    nodeCount: number;
    executionId: string;
  };
}
export declare abstract class RuntimeNode<TOutput = unknown> {
  id: string;
  constructor(id: string);
  /**
   * Execute this node and return its output. May mutate context.
   */
  abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;
}
export interface WeightedChoice {
  value: string;
  weight: number;
}
//# sourceMappingURL=types.d.ts.map
