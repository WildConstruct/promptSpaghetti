/**
 * Core types for graph-core package
 * Extracted from existing packages/core for Epic 15 cross-platform support
 */

import { z } from 'zod';

// Re-export node type definitions from existing schema
export const NodeTypeEnum = z.enum([
  'WeightedChoice',
  'Concat',
  'Output',
  'Include',
  'SetVariable',
  'GetVariable',
  // Epic 7 Advanced Node Types
  'WeightedAdvanced',
  'Conditional',
  'Sequential',
  'Markov',
  // Epic 8 Python Integration
  'PythonTransform',
]);

export type NodeType = z.infer<typeof NodeTypeEnum>;

// Base node schema for cross-platform compatibility
export const BaseNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  inputs: z.array(z.string()).optional(), // ids of upstream nodes (ordered)
});

// Execution context for deterministic graph execution
export interface ExecutionContext {
  variables: Record<string, any>;
  seed: string | number;
  [key: string]: any; // Allow for extensions
}

// Advanced execution context for Epic 7 compatibility
export interface AdvancedExecutionContext extends ExecutionContext {
  nodeStates: Map<string, any>;
  evaluationDepth: number;
  performanceCache: Map<string, any>;
  executionTrace: string[];
}

// Graph document structure for CRDT integration
export interface GraphDocument {
  id: string;
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  metadata: GraphMetadata;
  seed?: string | number;
}

// Node definition compatible with existing schema
export interface GraphNode {
  id: string;
  type: NodeType;
  position?: { x: number; y: number }; // Optional for non-UI contexts
  data: Record<string, any>;
  inputs?: string[]; // Input node IDs
}

// Edge definition for graph connections
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Metadata for graph documents
export interface GraphMetadata {
  version: string;
  created: Date;
  modified: Date;
  author?: string;
  platform?: 'web' | 'mobile' | 'desktop';
}

// Execution result interface
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

// Abstract base for runtime nodes
export abstract class RuntimeNode<TOutput = unknown> {
  constructor(public id: string) {}

  /**
   * Execute this node and return its output. May mutate context.
   */
  abstract run(ctx: ExecutionContext): Promise<TOutput> | TOutput;
}

// Choice structure for weighted nodes
export interface WeightedChoice {
  value: string;
  weight: number;
}