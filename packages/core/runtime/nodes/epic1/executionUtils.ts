/**
 * Execution utilities for Epic 1 nodes
 * Helper functions for graph execution and testing
 */

import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import {
  Epic1ExecutionEngine,
  Epic1Edge,
  Epic1Graph,
  ExecutionResult
} from './Epic1ExecutionEngine';
import { createNodeFromData } from './nodeFactory';

/**
 * Simple graph builder for testing and examples
 */
export class GraphBuilder {
  private nodes: Map<string, BaseInlineEditableNode> = new Map();
  private edges: Epic1Edge[] = [];
  private edgeIdCounter = 0;

  /**
   * Add a node to the graph
   */
  addNode(node: BaseInlineEditableNode): GraphBuilder {
    this.nodes.set(node.serialize().id, node);
    return this;
  }

  /**
   * Connect two nodes
   */
  connect(
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ): GraphBuilder {
    this.edges.push({
      id: `edge-${this.edgeIdCounter++}`,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle
    });
    return this;
  }

  /**
   * Build the graph
   */
  build(): Epic1Graph {
    return {
      nodes: new Map(this.nodes),
      edges: [...this.edges]
    };
  }
}

/**
 * Execute a graph with multiple seeds for determinism testing
 */
export async function executeWithSeeds(
  graph: Epic1Graph,
  seeds: (string | number)[]
): Promise<Map<string, ExecutionResult>> {
  const results = new Map<string, ExecutionResult>();

  for (const seed of seeds) {
    const engine = new Epic1ExecutionEngine(graph, seed);
    const result = await engine.execute();
    results.set(String(seed), result);
  }

  return results;
}

/**
 * Compare execution results for determinism
 */
export function compareExecutionResults(
  result1: ExecutionResult,
  result2: ExecutionResult
): {
  identical: boolean;
  differences: string[];
} {
  const differences: string[] = [];

  // Compare final outputs
  if (result1.output !== result2.output) {
    differences.push(
      `Output differs: "${result1.output}" vs "${result2.output}"`
    );
  }

  // Compare node results
  result1.results.forEach((nodeResult1, nodeId) => {
    const nodeResult2 = result2.results.get(nodeId);

    if (!nodeResult2) {
      differences.push(`Node ${nodeId} missing in second result`);
      return;
    }

    if (nodeResult1.output !== nodeResult2.output) {
      differences.push(
        `Node ${nodeId} output differs: "${nodeResult1.output}" vs "${nodeResult2.output}"`
      );
    }
  });

  // Check for extra nodes in result2
  result2.results.forEach((_, nodeId) => {
    if (!result1.results.has(nodeId)) {
      differences.push(`Node ${nodeId} missing in first result`);
    }
  });

  return {
    identical: differences.length === 0,
    differences
  };
}

/**
 * Create a graph from serialized data (PSG format)
 */
export function createGraphFromPSG(psgData: any): Epic1Graph {
  const nodes = new Map<string, BaseInlineEditableNode>();
  const edges: Epic1Edge[] = [];

  // Create nodes
  if (psgData.nodes) {
    psgData.nodes.forEach((nodeData: any) => {
      try {
        const node = createNodeFromData(nodeData);
        nodes.set(node.serialize().id, node);
      } catch (error) {
        console.error(`Failed to create node ${nodeData.id}:`, error);
      }
    });
  }

  // Create edges
  if (psgData.edges) {
    psgData.edges.forEach((edgeData: any) => {
      edges.push({
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData.sourceHandle,
        targetHandle: edgeData.targetHandle
      });
    });
  }

  return { nodes, edges };
}

/**
 * Generate execution preview for multiple seeds
 */
export async function generatePreview(
  graph: Epic1Graph,
  seedCount: number = 5,
  baseSeed?: string
): Promise<{
  seeds: string[];
  outputs: string[];
  stats: {
    min: number;
    max: number;
    avg: number;
    success: boolean;
  };
}> {
  const seeds: string[] = [];
  const outputs: string[] = [];
  const durations: number[] = [];
  let allSuccess = true;

  // Generate seeds
  for (let i = 0; i < seedCount; i++) {
    seeds.push(baseSeed ? `${baseSeed}-${i}` : String(Date.now() + i));
  }

  // Execute with each seed
  for (const seed of seeds) {
    const engine = new Epic1ExecutionEngine(graph, seed);
    const result = await engine.execute();

    outputs.push(result.output || '');
    durations.push(result.stats.totalDuration);
    allSuccess = allSuccess && result.success;
  }

  // Calculate stats
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;

  return {
    seeds,
    outputs,
    stats: {
      min,
      max,
      avg,
      success: allSuccess
    }
  };
}

/**
 * Validate determinism by executing the same graph with the same seed multiple times
 */
export async function validateDeterminism(
  graph: Epic1Graph,
  seed: string | number,
  iterations: number = 10
): Promise<{
  isDeterministic: boolean;
  variations: string[];
}> {
  const outputs = new Set<string>();

  for (let i = 0; i < iterations; i++) {
    const engine = new Epic1ExecutionEngine(graph, seed);
    const result = await engine.execute();

    if (result.success) {
      outputs.add(result.output || '');
    }
  }

  return {
    isDeterministic: outputs.size <= 1,
    variations: Array.from(outputs)
  };
}

/**
 * Format execution result for display
 */
export function formatExecutionResult(result: ExecutionResult): string {
  const lines: string[] = [];

  lines.push(`Execution ${result.success ? 'succeeded' : 'failed'}`);
  lines.push(`Output: ${result.output || '(none)'}`);
  lines.push(`Duration: ${result.stats.totalDuration}ms`);
  lines.push(`Nodes executed: ${result.stats.nodesExecuted}`);

  if (result.stats.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.stats.errors.forEach(error => {
      lines.push(`  - ${error.nodeId}: ${error.error.message}`);
    });
  }

  if (result.stats.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    result.stats.warnings.forEach(warning => {
      lines.push(`  - ${warning.nodeId}: ${warning.message}`);
    });
  }

  return lines.join('\n');
}

/**
 * Create a simple example graph for testing
 */
export function createExampleGraph(): Epic1Graph {
  const builder = new GraphBuilder();

  // Import node classes
  const {
    TextBlockNode,
    WeightedChoiceNode,
    ConcatNode,
    VariableNode,
    OutputNode
  } = require('./index');

  // Create nodes
  const greeting = new TextBlockNode('greeting', 'Hello {{name}}!');
  const mood = new WeightedChoiceNode('mood', [
    { id: 'happy', text: "I hope you're having a great day", weight: 70 },
    { id: 'neutral', text: 'How are you doing', weight: 20 },
    { id: 'excited', text: "I'm so excited to see you", weight: 10 }
  ]);
  const nameVar = new VariableNode('nameVar', {
    name: 'name',
    defaultValue: 'friend'
  });
  const concat = new ConcatNode('concat', { separator: ' ' });
  const output = new OutputNode('output');

  // Lock the output node
  output.lock('Output nodes are read-only');

  // Build graph
  builder
    .addNode(nameVar)
    .addNode(greeting)
    .addNode(mood)
    .addNode(concat)
    .addNode(output)
    .connect('greeting', 'concat', undefined, 'input0')
    .connect('mood', 'concat', undefined, 'input1')
    .connect('concat', 'output');

  return builder.build();
}
