// Clean graph exporter with advanced functionality
import { z } from 'zod';
import { Graph, Node } from '../../packages/core/graphSchema';

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
  execution: z
    .object({
      deterministic: z.boolean().default(true),
      cacheEnabled: z.boolean().default(true),
      maxDepth: z.number().default(100),
      timeoutMs: z.number().default(30000)
    })
    .optional(),
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
  // Analyze graph complexity
  const nodeCount = graph.nodes?.length || 0;
  const hasVariables =
    graph.nodes?.some(
      n => n.type === 'SetVariable' || n.type === 'GetVariable'
    ) || false;
  const hasWeightedChoice =
    graph.nodes?.some(n => n.type === 'WeightedChoice') || false;

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (nodeCount > 10 || hasVariables) complexity = 'moderate';
  if (nodeCount > 20 || (hasVariables && hasWeightedChoice))
    complexity = 'complex';

  // Extract node types
  const nodeTypes = [...new Set(graph.nodes?.map(n => n.type) || [])];

  // Determine required features
  const requiredFeatures: string[] = [];
  if (hasVariables) requiredFeatures.push('variable-context');
  if (hasWeightedChoice) requiredFeatures.push('weighted-selection');
  if (graph.seed !== undefined) requiredFeatures.push('deterministic-seeding');

  // Build edges from node inputs
  const edges = [];
  if (graph.nodes) {
    for (const node of graph.nodes) {
      if (node.inputs && node.inputs.length > 0) {
        for (let i = 0; i < node.inputs.length; i++) {
          edges.push({
            id: `${node.inputs[i]}->${node.id}`,
            source: node.inputs[i],
            target: node.id,
            sourceHandle: 'output',
            targetHandle: `input-${i}`
          });
        }
      }
    }
  }

  return {
    format: 'PromptScape-v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    metadata: {
      title: metadata?.title || `Graph Export ${Date.now()}`,
      description:
        metadata?.description || `Exported graph with ${nodeCount} nodes`,
      author: metadata?.author || 'PromptScape User',
      tags: metadata?.tags || ['graph', 'export'],
      nodeCount,
      complexity
    },
    graph: {
      nodes: graph.nodes || [],
      edges,
      seed: graph.seed,
      variables: {}
    },
    execution: {
      deterministic: true,
      cacheEnabled: true,
      maxDepth: 100,
      timeoutMs: 30000
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
  // Convert edges back to node inputs
  const nodeInputs = new Map<string, string[]>();

  if (bundle.graph.edges) {
    for (const edge of bundle.graph.edges) {
      const targetId = edge.target;
      if (!nodeInputs.has(targetId)) {
        nodeInputs.set(targetId, []);
      }
      nodeInputs.get(targetId)!.push(edge.source);
    }
  }

  // Rebuild nodes with inputs
  const nodes = bundle.graph.nodes.map(node => ({
    ...node,
    inputs: nodeInputs.get(node.id) || []
  }));

  return {
    id: `imported-${Date.now()}`,
    nodes,
    edges: bundle.graph.edges || [],
    seed: bundle.graph.seed,
    metadata: {
      title: bundle.metadata.title,
      description: bundle.metadata.description,
      imported: true,
      originalFormat: bundle.format
    }
  };
}

/**
 * Export formats supported
 */
export type ExportFormat = 'bundle' | 'json' | 'yaml' | 'text';

/**
 * Export graph in various formats
 */
export function exportGraph(
  graph: Graph,
  format: ExportFormat = 'bundle',
  metadata?: Partial<GeneratorBundle['metadata']>
): { data: string; filename: string; mimeType: string } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  switch (format) {
    case 'bundle': {
      const bundle = graphToBundle(graph, metadata);
      return {
        data: JSON.stringify(bundle, null, 2),
        filename: `graph-bundle-${timestamp}.json`,
        mimeType: 'application/json'
      };
    }

    case 'json': {
      return {
        data: JSON.stringify(graph, null, 2),
        filename: `graph-${timestamp}.json`,
        mimeType: 'application/json'
      };
    }

    case 'yaml': {
      // Simple YAML-like format
      const yamlData = [
        '# PromptScape Graph Export',
        `# Generated: ${new Date().toISOString()}`,
        `# Nodes: ${graph.nodes?.length || 0}`,
        '',
        'graph:',
        '  nodes:'
      ];

      if (graph.nodes) {
        for (const node of graph.nodes) {
          yamlData.push(`    - id: "${node.id}"`);
          yamlData.push(`      type: "${node.type}"`);
          if (node.inputs && node.inputs.length > 0) {
            yamlData.push(
              `      inputs: [${node.inputs.map(id => `"${id}"`).join(', ')}]`
            );
          }
          yamlData.push('');
        }
      }

      if (graph.seed !== undefined) {
        yamlData.push(`  seed: ${graph.seed}`);
      }

      return {
        data: yamlData.join('\n'),
        filename: `graph-${timestamp}.yaml`,
        mimeType: 'text/yaml'
      };
    }

    case 'text': {
      const textData = [
        'PromptScape Graph Export',
        '='.repeat(25),
        `Generated: ${new Date().toISOString()}`,
        `Nodes: ${graph.nodes?.length || 0}`,
        `Seed: ${graph.seed || 'none'}`,
        '',
        'Node Structure:',
        '---------------'
      ];

      if (graph.nodes) {
        for (const node of graph.nodes) {
          textData.push(`${node.id} (${node.type})`);
          if (node.inputs && node.inputs.length > 0) {
            textData.push(`  ← inputs: ${node.inputs.join(', ')}`);
          }
          textData.push('');
        }
      }

      return {
        data: textData.join('\n'),
        filename: `graph-${timestamp}.txt`,
        mimeType: 'text/plain'
      };
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Validate that a bundle is compatible with current engine
 */
export function validateBundleCompatibility(bundle: GeneratorBundle): {
  compatible: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check engine compatibility
  if (bundle.compatibility.engineVersion !== 'basic') {
    warnings.push(
      `Bundle created for engine "${bundle.compatibility.engineVersion}", current engine is "basic"`
    );
  }

  // Check node type support
  const supportedNodeTypes = [
    'WeightedChoice',
    'Output',
    'Concat',
    'SetVariable',
    'GetVariable',
    'Include'
  ];
  const unsupportedTypes = bundle.compatibility.nodeTypes.filter(
    type => !supportedNodeTypes.includes(type)
  );

  if (unsupportedTypes.length > 0) {
    issues.push(`Unsupported node types: ${unsupportedTypes.join(', ')}`);
  }

  // Check required features
  const supportedFeatures = [
    'variable-context',
    'weighted-selection',
    'deterministic-seeding'
  ];
  const unsupportedFeatures = bundle.compatibility.requiredFeatures.filter(
    feature => !supportedFeatures.includes(feature)
  );

  if (unsupportedFeatures.length > 0) {
    issues.push(`Unsupported features: ${unsupportedFeatures.join(', ')}`);
  }

  // Check graph structure
  if (!bundle.graph.nodes || bundle.graph.nodes.length === 0) {
    issues.push('Bundle contains no nodes');
  }

  return {
    compatible: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Get export statistics
 */
export function getExportStats(graph: Graph): {
  nodeCount: number;
  nodeTypes: Record<string, number>;
  hasVariables: boolean;
  hasWeightedChoice: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedOutputs: number;
} {
  const nodeCount = graph.nodes?.length || 0;
  const nodeTypes: Record<string, number> = {};

  if (graph.nodes) {
    for (const node of graph.nodes) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }
  }

  const hasVariables =
    (nodeTypes['SetVariable'] || 0) > 0 || (nodeTypes['GetVariable'] || 0) > 0;
  const hasWeightedChoice = (nodeTypes['WeightedChoice'] || 0) > 0;
  const outputCount = nodeTypes['Output'] || 0;

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (nodeCount > 10 || hasVariables) complexity = 'moderate';
  if (nodeCount > 20 || (hasVariables && hasWeightedChoice))
    complexity = 'complex';

  return {
    nodeCount,
    nodeTypes,
    hasVariables,
    hasWeightedChoice,
    complexity,
    estimatedOutputs: Math.max(1, outputCount)
  };
}
