// server/src/exporter.ts
// Exports a Graph to a GeneratorBundle format compatible with the Randomizer Engine
// Also includes import functionality to convert from GeneratorBundle back to Graph
import { z } from 'zod';
import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';

/**
 * GeneratorBundle schema matching the Randomizer Engine's expected format
 */
export const GeneratorBundleSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(), // semver
    author: z.string(),
    created: z.string(), // ISO-8601 date
    debug: z.object({
      seed: z.number().optional(),
      originGraphGuid: z.string().optional(),
    }).optional(),
  }),
  variables: z.record(z.string(), z.unknown()),
  grammar: z.record(z.string(), z.union([
    z.array(z.string()), // ArrayRule
    z.array(z.object({   // WeightedArrayRule
      text: z.string(),
      weight: z.number().optional(),
    })),
    z.object({           // ConditionalRule
      type: z.literal('conditional'),
      cases: z.array(z.object({
        condition: z.string(),
        value: z.string(),
      })),
    }),
    z.object({           // SequentialRule
      type: z.literal('sequential'),
      items: z.array(z.string()),
    }),
    z.union([            // IncludeRule (two formats)
      z.object({ $include: z.string() }),
      z.array(z.union([
        z.object({ _meta: z.record(z.string(), z.unknown()).optional() }),
        z.object({ $include: z.string() }),
      ])),
    ]),
    z.object({           // ModifierChainRule
      type: z.literal('modifier_chain'),
      base: z.string(),
      mods: z.array(z.string()),
    }),
  ])),
  entry_points: z.object({
    default: z.string(),
    alternatives: z.array(z.string()).optional(),
  }),
  lockedValues: z.record(z.string(), z.string()).optional(),
  seed: z.number().optional(),
});

export type GeneratorBundle = z.infer<typeof GeneratorBundleSchema>;

/**
 * Converts a graph to a generator bundle format
 * @param graph Graph to convert
 * @param options Additional metadata for the bundle
 * @returns A GeneratorBundle compatible with the Randomizer Engine
 */
export function graphToBundle(
  graph: Graph, 
  options: {
    name: string;
    version?: string;
    author?: string;
  }
): GeneratorBundle {
  // Create default metadata
  const metadata = {
    name: options.name,
    version: options.version || '1.0.0',
    author: options.author || 'PromptScape Graph Editor',
    created: new Date().toISOString(),
    debug: {
      seed: typeof graph.seed === 'number' ? graph.seed : undefined,
      originGraphGuid: undefined, // Could be added as an optional parameter if needed
    },
  };

  // Initialize bundle structure
  const bundle: GeneratorBundle = {
    metadata,
    variables: {},
    grammar: {},
    entry_points: {
      default: 'main',
      alternatives: [],
    },
    seed: typeof graph.seed === 'number' ? graph.seed : undefined,
  };

  // Find all variable declarations in the graph
  const variables: Record<string, any> = {};
  const outputNodes: Node[] = [];
  const nodeMap = new Map<string, Node>();
  
  // First pass - catalog all nodes and extract variables
  graph.nodes.forEach(node => {
    nodeMap.set(node.id, node);
    
    if (node.type === 'SetVariable') {
      variables[node.key] = node.value;
    }
    
    if (node.type === 'Output') {
      outputNodes.push(node);
    }
  });

  // Add variables to bundle
  bundle.variables = variables;
  
  // Create grammar rules for each node
  graph.nodes.forEach(node => {
    const ruleId = node.id;
    bundle.grammar[ruleId] = convertNodeToRule(node, nodeMap);
  });
  
  // Set the default entry point to the first output node
  if (outputNodes.length > 0) {
    bundle.entry_points.default = outputNodes[0].id;
    
    // If there are multiple output nodes, add them as alternatives
    if (outputNodes.length > 1) {
      bundle.entry_points.alternatives = outputNodes.slice(1).map(n => n.id);
    }
  }
  
  return bundle;
}

/**
 * Convert a node to its corresponding grammar rule in the GeneratorBundle format
 */
function convertNodeToRule(node: Node, nodeMap: Map<string, Node>): any {
  switch (node.type) {
    case 'WeightedChoice':
      // Convert to weighted array rule
      return node.choices.map(choice => ({
        text: choice.value,
        weight: choice.weight,
      }));
      
    case 'Concat':
      // If inputs exist, create a sequential rule
      if (node.inputs && node.inputs.length > 0) {
        return {
          type: 'sequential',
          items: node.inputs,
        };
      }
      return ['']; // Empty concat gives empty string
      
    case 'Output':
      // Output nodes reference their input
      if (node.inputs && node.inputs.length > 0) {
        return [node.inputs[0]];
      }
      return [''];
      
    case 'Include':
      // Create an include rule
      return { $include: node.name };
      
    case 'SetVariable':
      // Variable setting doesn't produce content directly
      return [''];
      
    case 'GetVariable':
      // Create a reference to the variable
      return [`$${node.key}`];
      
    default:
      // For unknown node types, return empty
      return [''];
  }
}

/**
 * Validates a GeneratorBundle against the schema
 * @param bundle The bundle to validate
 * @returns True if valid, false otherwise
 */
export function validateGeneratorBundle(bundle: any): boolean {
  try {
    GeneratorBundleSchema.parse(bundle);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Converts a GeneratorBundle back to a Graph format
 * @param bundle GeneratorBundle to convert
 * @returns Graph compatible with the editor
 */
export function bundleToGraph(bundle: GeneratorBundle): Graph {
  // Validate the bundle first
  if (!validateGeneratorBundle(bundle)) {
    throw new Error('Invalid GeneratorBundle format');
  }
  
  // Initialize the graph structure
  const graph: Graph = {
    nodes: [],
    seed: bundle.seed
  };
  
  // Track created nodes by ID to avoid duplicates
  const createdNodeIds = new Set<string>();
  
  // Process variables first
  Object.entries(bundle.variables).forEach(([key, value]) => {
    const nodeId = `var_${key}`;
    graph.nodes.push({
      id: nodeId,
      type: 'SetVariable',
      key,
      value
    });
    createdNodeIds.add(nodeId);
  });
  
  // Process grammar rules
  Object.entries(bundle.grammar).forEach(([ruleId, rule]) => {
    // Skip if we already created this node (from variables)
    if (createdNodeIds.has(ruleId)) return;
    
    const node = convertRuleToNode(ruleId, rule);
    if (node) {
      graph.nodes.push(node);
      createdNodeIds.add(ruleId);
    }
  });
  
  // Process connections between nodes
  Object.entries(bundle.grammar).forEach(([ruleId, rule]) => {
    // Find referenced nodes and establish connections
    const references = findNodeReferences(rule);
    if (references.length > 0) {
      const node = graph.nodes.find(n => n.id === ruleId);
      if (node) {
        node.inputs = references;
      }
    }
  });
  
  // Ensure at least one output node exists
  ensureOutputNode(graph, bundle.entry_points.default);
  
  return graph;
}

/**
 * Converts a grammar rule to a node in the graph
 */
function convertRuleToNode(id: string, rule: any): Node | null {
  // Handle weighted array rule (WeightedChoice)
  if (Array.isArray(rule) && rule.length > 0 && typeof rule[0] === 'object' && 'text' in rule[0]) {
    return {
      id,
      type: 'WeightedChoice',
      choices: rule.map(item => ({
        value: item.text,
        weight: item.weight || 1
      }))
    };
  }
  
  // Handle simple array rule (can be Output or Include depending on content)
  if (Array.isArray(rule) && rule.length > 0 && typeof rule[0] === 'string') {
    return {
      id,
      type: 'Output',
    };
  }
  
  // Handle include rule
  if (!Array.isArray(rule) && typeof rule === 'object' && '$include' in rule) {
    return {
      id,
      type: 'Include',
      name: rule.$include
    };
  }
  
  // Handle sequential rule (Concat)
  if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'sequential') {
    return {
      id,
      type: 'Concat',
    };
  }
  
  // Handle conditional rule
  if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'conditional') {
    // For now, convert conditionals to weighted choices as a simplification
    return {
      id,
      type: 'WeightedChoice',
      choices: rule.cases.map((c: { condition: string; value: string }) => ({
        value: c.value,
        weight: 1 // Equal weights as a default
      }))
    };
  }
  
  // Handle modifier chain (simplify to concat for now)
  if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'modifier_chain') {
    return {
      id,
      type: 'Concat',
    };
  }
  
  // Unknown rule type
  console.warn(`Unsupported rule type for ID ${id}:`, rule);
  return null;
}

/**
 * Find references to other nodes in a rule
 */
function findNodeReferences(rule: any): string[] {
  const refs: string[] = [];
  
  // Handle sequential rule
  if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'sequential') {
    return rule.items || [];
  }
  
  // Handle array rule that references other rules
  if (Array.isArray(rule)) {
    rule.forEach(item => {
      if (typeof item === 'string' && !item.startsWith('$')) {
        refs.push(item);
      }
    });
  }
  
  // Handle modifier chain
  if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'modifier_chain') {
    if (rule.base) refs.push(rule.base);
  }
  
  return refs;
}

/**
 * Ensures that at least one output node exists for the entry point
 */
function ensureOutputNode(graph: Graph, entryPointId: string): void {
  // Check if entry point exists as a node
  const entryExists = graph.nodes.some(n => n.id === entryPointId);
  
  if (!entryExists) {
    // Create a default output node
    graph.nodes.push({
      id: entryPointId,
      type: 'Output'
    });
  } else {
    // If node exists but isn't an output, add an output node that references it
    const isOutput = graph.nodes.some(n => n.id === entryPointId && n.type === 'Output');
    if (!isOutput) {
      const outputId = `output_${entryPointId}`;
      graph.nodes.push({
        id: outputId,
        type: 'Output',
        inputs: [entryPointId]
      });
    }
  }
  
  // Make sure at least one output node exists in the graph
  const hasOutput = graph.nodes.some(n => n.type === 'Output');
  if (!hasOutput) {
    graph.nodes.push({
      id: 'default_output',
      type: 'Output'
    });
  }
}
