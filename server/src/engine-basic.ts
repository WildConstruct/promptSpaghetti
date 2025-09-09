// Basic graph execution engine - no external dependencies
import { Graph, Node, NodeTypeEnum } from '../../packages/core/graphSchema';
import seedrandom from 'seedrandom';
import { v4 as uuidv4 } from 'uuid';

/**
 * Basic execution context for graph execution
 */

interface ExecutionContext {
  variables: Record<string, any>;
  seed: number;
  rng: seedrandom.PRNG;
}

/**
 * Simple analytics stub
 */
export function initializeAnalytics(): void {
  console.log('Analytics initialized (basic mode)');
}

/**
 * Basic graph executor with support for core node types
 */
export async function executeGraph(
  graph: Graph,
  sessionId?: string,
  userId?: number
): Promise<{
  outputs: string[];
  executionPath?: any;
}> {
  console.log(`[BASIC] Executing graph with ${graph.nodes?.length || 0} nodes`);

  // Create execution context
  const seed = typeof graph.seed === 'number' ? graph.seed : Date.now();
  const rng = seedrandom(seed.toString());
  const context: ExecutionContext = {
    variables: {},
    seed,
    rng
  };

  // Build node map for fast lookup
  const nodeMap = new Map<string, Node>();
  const outputNodes: Node[] = [];

  for (const node of graph.nodes || []) {
    nodeMap.set(node.id, node);
    if (node.type === 'Output') {
      outputNodes.push(node);
    }
  }

  // Memoization for node results
  const memo = new Map<string, any>();

  /**
   * Execute a single node recursively
   */
  async function executeNode(nodeId: string, depth: number = 0): Promise<any> {
    // Prevent infinite recursion
    if (depth > 100) {
      throw new Error(`Maximum execution depth exceeded at node ${nodeId}`);
    }
    // Return memoized result if available
    if (memo.has(nodeId)) {
      return memo.get(nodeId);
    }
    const node = nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    // Execute input nodes first
    const inputValues: any[] = [];
    if (node.inputs && node.inputs.length > 0) {
      for (const inputId of node.inputs) {
        const inputValue = await executeNode(inputId, depth + 1);
        inputValues.push(inputValue);
      }
    }

    // Execute the node based on its type
    let result: any;

    switch (node.type) {
      case 'Output':
        // Output node just returns the first input, or template if available
        result = inputValues[0] || node.template || '';
        break;

      case 'Concat':
        // Concatenate all inputs
        result = inputValues.map(v => String(v || '')).join('');
        break;

      case 'WeightedChoice':
        // Simple weighted choice implementation
        const choices = (node as any).choices || [];
        if (choices.length === 0) {
          result = '';
        } else if (choices.length === 1) {
          result =
            typeof choices[0] === 'string' ? choices[0] : choices[0].value;
        } else {
          // Extract weights and values
          const items = choices.map((choice: any) => ({
            value: typeof choice === 'string' ? choice : choice.value,
            weight: typeof choice === 'string' ? 1 : choice.weight || 1
          }));

          // Calculate total weight
          const totalWeight = items.reduce(
            (sum: number, item: any) => sum + item.weight,
            0
          );

          // Generate random number and select item
          const random = context.rng() * totalWeight;
          let currentWeight = 0;

          for (const item of items) {
            currentWeight += item.weight;
            if (random <= currentWeight) {
              result = item.value;
              break;
            }
          }
          // Fallback to first item
          if (result === undefined) {
            result = items[0].value;
          }
        }
        break;

      case 'SetVariable':
        // Set a variable in the context
        const key = (node as any).key;
        const value = (node as any).value || inputValues[0] || '';
        if (key) {
          context.variables[key] = value;
        }

        result = value;
        break;

      case 'GetVariable':
        // Get a variable from the context
        const varKey = (node as any).key;
        result = context.variables[varKey] || '';
        break;

      case 'Include':
        // Simple include - just return the name or empty string
        result = (node as any).name || '';
        break;

      default:
        console.warn(
          `Unsupported node type: ${node.type}, returning empty string`
        );
        result = '';
        break;
    }
    // Memoize the result
    memo.set(nodeId, result);
    return result;
  }
  // Execute all output nodes
  const outputs: string[] = [];

  if (outputNodes.length === 0) {
    // No output nodes, return a message
    outputs.push('Graph has no output nodes');
  } else {
    // Execute each output node
    for (const outputNode of outputNodes) {
      try {
        const output = await executeNode(outputNode.id);
        outputs.push(String(output || ''));
      } catch (error) {
        console.error(`Error executing output node ${outputNode.id}:`, error);
        outputs.push(`Error: ${error.message}`);
      }
    }
  }

  return {
    outputs,
    executionPath: {
      nodeCount: graph.nodes?.length || 0,
      outputCount: outputs.length,
      seed,
      variables: context.variables
    }
  };
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function executeGraphLegacy(
  graph: Graph,
  sessionId?: string,
  userId?: number
): Promise<string[]> {
  const result = await executeGraph(graph, sessionId, userId);
  return result.outputs;
}
