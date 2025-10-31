// Standalone graph exporter with minimal dependencies
import { z } from 'zod';

/**
 * Minimal Graph type definition to avoid corrupted imports
 */
export interface Graph {
  id?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  seed?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  type: string;
  inputs?: string[];
  [key: string]: unknown;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * GeneratorBundle format for external compatibility
 */
export const GeneratorBundleSchema = z.object({
  format: z.string().default('PromptScape-v1.0'),
  version: z.string().default('1.0.0'),
  timestamp: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    nodeCount: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex']).default('simple')
  }),
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()).default([]),
    seed: z.number().optional(),
    variables: z.record(z.string(), z.any()).default({})
  }),
  execution: z.object({
    deterministic: z.boolean().default(true),
    cacheEnabled: z.boolean().default(true),
    maxDepth: z.number().default(100),
    timeoutMs: z.number().default(30_000)
  }).optional(),
  compatibility: z.object({
    engineVersion: z.string().default('basic'),
    nodeTypes: z.array(z.string()),
    requiredFeatures: z.array(z.string()).default([])
  })
});

export type GeneratorBundle = z.infer<typeof GeneratorBundleSchema>;

/**
 * Convert a Graph to GeneratorBundle format
 */
export function graphToBundle(
  graph: Graph,
  metadata?: Partial<GeneratorBundle['metadata']>
): GeneratorBundle {
  const nodes = graph.nodes ?? [];
  const nodeCount = nodes.length;
  const hasVariables = nodes.some(node =>
    ['SetVariable', 'GetVariable'].includes(node.type)
  );
  const hasWeightedChoice = nodes.some(node => node.type === 'WeightedChoice');

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (nodeCount > 10 || hasVariables) {
    complexity = 'moderate';
  }
  if (nodeCount > 20 || (hasVariables && hasWeightedChoice)) {
    complexity = 'complex';
  }

  const nodeTypes = [...new Set(nodes.map(node => node.type))];

  const requiredFeatures: string[] = [];
  if (hasVariables) {
    requiredFeatures.push('variable-context');
  }
  if (hasWeightedChoice) {
    requiredFeatures.push('weighted-selection');
  }
  if (graph.seed !== undefined) {
    requiredFeatures.push('deterministic-seeding');
  }

  const edges: GraphEdge[] = [];
  nodes.forEach(node => {
    (node.inputs ?? []).forEach((inputId, index) => {
      edges.push({
        id: `${inputId}->${node.id}`,
        source: inputId,
        target: node.id,
        sourceHandle: 'output',
        targetHandle: `input-${index}`
      });
    });
  });

  return {
    format: 'PromptScape-v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    metadata: {
      title: metadata?.title ?? `Graph Export ${Date.now()}`,
      description:
        metadata?.description ??
        `Exported graph with ${nodeCount} nodes`,
      author: metadata?.author ?? 'PromptScape User',
      tags: metadata?.tags ?? ['graph', 'export'],
      nodeCount,
      complexity
    },
    graph: {
      nodes,
      edges,
      seed: graph.seed,
      variables: {}
    },
    execution: {
      deterministic: true,
      cacheEnabled: true,
      maxDepth: 100,
      timeoutMs: 30_000
    },
    compatibility: {
      engineVersion: 'basic',
      nodeTypes,
      requiredFeatures
    }
  };
}

/**
 * Convert a GeneratorBundle back to Graph format
 */
export function bundleToGraph(bundle: GeneratorBundle): Graph {
  const inputsByNode = new Map<string, string[]>();

  (bundle.graph.edges ?? []).forEach(edge => {
    const list = inputsByNode.get(edge.target) ?? [];
    list.push(edge.source);
    inputsByNode.set(edge.target, list);
  });

  const nodes: GraphNode[] = (bundle.graph.nodes ?? []).map(node => ({
    ...node,
    inputs: inputsByNode.get((node as GraphNode).id) ?? []
  }));

  return {
    nodes,
    edges: bundle.graph.edges as GraphEdge[] | undefined,
    seed: bundle.graph.seed,
    metadata: bundle.metadata
  };
}
