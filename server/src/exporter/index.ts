// Refactored exporter - main export functions
import { Graph, Node } from '../../../packages/core/graphSchema';
import { GeneratorBundle, GeneratorBundleSchema } from './schemas';
import { graphToVFXBundle } from './vfx-exporter';
import { graphToSceneAwareBundle } from './scene-exporter';

// Re-export all types and functions for backward compatibility
export * from './schemas';
export * from './vfx-exporter';
export * from './scene-exporter';

/**
 * Convert a Node to a rule in the GeneratorBundle format
 */
function convertNodeToRule(node: Node): Record<string, unknown> {
  const rule: Record<string, unknown> = {
    type: node.type,
    data: node.data
  };

  // Handle different node types
  switch (node.type) {
    case 'WeightedChoice':
      if (node.data.options) {
        rule.options = node.data.options;
      }
      break;

    case 'Concat':
      if (node.data.separator !== undefined) {
        rule.separator = node.data.separator;
      }
      if (node.data.inputs) {
        rule.inputs = node.data.inputs;
      }
      break;

    case 'Output':
      if (node.data.template) {
        rule.template = node.data.template;
      }
      break;

    case 'Variable':
      if (node.data.variableName) {
        rule.variableName = node.data.variableName;
      }
      if (node.data.defaultValue !== undefined) {
        rule.defaultValue = node.data.defaultValue;
      }
      break;

    case 'Include':
      if (node.data.referencedNodeId) {
        rule.referencedNodeId = node.data.referencedNodeId;
      }
      break;
  }

  return rule;
}

/**
 * Main export function - converts a Graph to a GeneratorBundle
 */
export function graphToBundle(
  graph: Graph,
  options?: {
    includeVFX?: boolean;
    includeScene?: boolean;
  }
): GeneratorBundle {
  // Create node map for quick lookups
  // Find entry point (Output node or first node)
  let entryPoint = graph.nodes.find(n => n.type === 'Output')?.id;
  if (!entryPoint && graph.nodes.length > 0) {
    entryPoint = graph.nodes[0].id;
  }
  if (!entryPoint) {
    throw new Error('No nodes found in graph');
  }

  // Convert nodes to rules
  const rules: Record<string, Record<string, unknown>> = {};
  graph.nodes.forEach(node => {
    rules[node.id] = convertNodeToRule(node);
  });

  // Add edge information to rules
  graph.edges.forEach(edge => {
    const targetRule = rules[edge.target];
    if (targetRule) {
      if (!targetRule.inputs) {
        targetRule.inputs = [];
      }
      (targetRule.inputs as string[]).push(edge.source);
    }
  });

  // Create base bundle
  let bundle: GeneratorBundle = {
    version: '1.0.0',
    metadata: {
      name: graph.metadata?.name || 'Untitled Graph',
      description: graph.metadata?.description,
      author: graph.metadata?.author,
      created: graph.metadata?.created || new Date().toISOString(),
      modified: new Date().toISOString(),
      tags: graph.metadata?.tags,
      category: graph.metadata?.category
    },
    entryPoint,
    rules
  };

  // Apply VFX enhancements if requested
  if (options?.includeVFX) {
    bundle = graphToVFXBundle(graph, bundle);
  }

  // Apply scene enhancements if requested
  if (options?.includeScene) {
    bundle = graphToSceneAwareBundle(graph, bundle);
  }

  return bundle;
}

/**
 * Validate a GeneratorBundle
 */
export function validateGeneratorBundle(
  bundle: Record<string, unknown>
): boolean {
  try {
    GeneratorBundleSchema.parse(bundle);
    return true;
  } catch (error) {
    console.error('Bundle validation failed:', error);
    return false;
  }
}

/**
 * Convert a GeneratorBundle back to a Graph
 */
type ExportedEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
};

export function bundleToGraph(bundle: GeneratorBundle): Graph {
  const nodes: Node[] = [];
  const edges: ExportedEdge[] = [];

  // Convert rules back to nodes
  Object.entries(bundle.rules).forEach(([id, rule]) => {
    const node = convertRuleToNode(id, rule);
    if (node) {
      nodes.push(node);

      // Extract edges from inputs
      if (rule.inputs && Array.isArray(rule.inputs)) {
        rule.inputs.forEach((sourceId: string) => {
          edges.push({
            id: `${sourceId}-${id}`,
            source: sourceId,
            target: id,
            type: 'default'
          });
        });
      }
    }
  });

  // Ensure we have an output node
  if (!nodes.find(n => n.type === 'Output')) {
    ensureOutputNode({ nodes, edges }, bundle.entryPoint);
  }

  return {
    nodes,
    edges,
    metadata: bundle.metadata
  };
}

/**
 * Convert a rule back to a Node
 */
function convertRuleToNode(
  id: string,
  rule: Record<string, unknown>
): Node | null {
  if (!rule.type || typeof rule.type !== 'string') {
    return null;
  }

  const node: Node = {
    id,
    type: rule.type,
    data: (rule.data as Record<string, unknown>) || {},
    position: { x: 0, y: 0 } // Will be recalculated by layout
  };

  // Copy relevant fields based on node type
  switch (rule.type) {
    case 'WeightedChoice':
      if (rule.options) {
        node.data.options = rule.options;
      }
      break;

    case 'Concat':
      if (rule.separator !== undefined) {
        node.data.separator = rule.separator;
      }
      break;

    case 'Output':
      if (rule.template) {
        node.data.template = rule.template;
      }
      break;

    case 'Variable':
      if (rule.variableName) {
        node.data.variableName = rule.variableName;
      }
      if (rule.defaultValue !== undefined) {
        node.data.defaultValue = rule.defaultValue;
      }
      break;

    case 'Include':
      if (rule.referencedNodeId) {
        node.data.referencedNodeId = rule.referencedNodeId;
      }
      break;
  }

  return node;
}

/**
 * Ensure the graph has an Output node
 */
function ensureOutputNode(graph: Graph, entryPointId: string): void {
  const outputNode: Node = {
    id: 'output-generated',
    type: 'Output',
    data: {
      template: `{${entryPointId}}`
    },
    position: { x: 500, y: 200 }
  };

  graph.nodes.push(outputNode);

  // Connect entry point to output
  graph.edges.push({
    id: `${entryPointId}-output-generated`,
    source: entryPointId,
    target: 'output-generated',
    type: 'default'
  });
}
