/**
 * Epic 1 Execution Engine
 * Executes graphs of Epic 1 nodes with deterministic behavior
 */

import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import { Epic1ExecutionContext } from './Epic1ExecutionContext';
import { Epic1NodeType } from './nodeTypes';
import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode, VariableMode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { validateGraph } from './validation';
import { debugLogExecution } from '../../../utils/debug';

/**
 * Edge definition for graph connections
 */
export interface Epic1Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Graph definition
 */
export interface Epic1Graph {
  nodes: Map<string, BaseInlineEditableNode>;
  edges: Epic1Edge[];
}

/**
 * Execution result for a single node
 */
export interface NodeExecutionResult {
  nodeId: string;
  output: any;
  duration: number;
  error?: Error;
}

/**
 * Overall execution result
 */
export interface ExecutionResult {
  success: boolean;
  output: any;
  results: Map<string, NodeExecutionResult>;
  stats: {
    totalDuration: number;
    nodesExecuted: number;
    errors: Array<{ nodeId: string; error: Error }>;
    warnings: Array<{ nodeId: string; message: string }>;
  };
  context: Epic1ExecutionContext;
}

/**
 * Epic 1 Execution Engine
 * Handles graph traversal and node execution with deterministic behavior
 */
export class Epic1ExecutionEngine {
  private readonly graph: Epic1Graph;
  private readonly context: Epic1ExecutionContext;
  private readonly results: Map<string, NodeExecutionResult>;
  private readonly executionOrder: string[];
  private outputNodeId: string | null = null;

  constructor(graph: Epic1Graph, seed?: string | number) {
    this.graph = graph;
    this.context = new Epic1ExecutionContext(seed);
    this.results = new Map();
    this.executionOrder = [];
  }

  /**
   * Execute the entire graph
   */
  async execute(): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      debugLogExecution(
        '[ExecutionEngine] Starting execution with',
        this.graph.nodes.size,
        'nodes'
      );

      // Validate the graph first
      const validation = await validateGraph(
        this.graph.nodes,
        this.graph.edges
      );
      if (!validation.valid) {
        throw new Error(
          `Graph validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        );
      }

      // Add warnings from validation
      validation.warnings.forEach(warning => {
        this.context.addWarning(warning.nodeId, warning.message);
      });

      // Find output node(s)
      const outputNodes = Array.from(this.graph.nodes.entries()).filter(
        ([_, node]) => node.getNodeType() === Epic1NodeType.Output
      );

      debugLogExecution(
        '[ExecutionEngine] Found output nodes:',
        outputNodes.map(([id]) => id)
      );
      debugLogExecution(
        '[ExecutionEngine] Graph edges:',
        this.graph.edges.length,
        'edges:',
        this.graph.edges
      );

      if (outputNodes.length === 0) {
        debugLogExecution(
          '[ExecutionEngine] No output node found in graph - returning empty result'
        );
        // Return a special empty result instead of throwing an error
        return {
          success: true, // Mark as success to avoid red error styling
          output: '',
          results: new Map(),
          stats: {
            totalDuration: 0,
            nodesExecuted: 0,
            errors: [],
            warnings: [
              {
                nodeId: '',
                message: 'Connect an Output node to see results'
              }
            ]
          },
          context: this.context
        };
      }

      // Use the first output node as the target
      this.outputNodeId = outputNodes[0][0];

      // Build execution order (topological sort)
      this.buildExecutionOrder();
      debugLogExecution(
        '[ExecutionEngine] Execution order:',
        this.executionOrder
      );

      // Execute nodes in order
      for (const nodeId of this.executionOrder) {
        await this.executeNode(nodeId);
      }

      // Get final output
      const outputResult = this.results.get(this.outputNodeId);
      const finalOutput = outputResult?.output || null;
      debugLogExecution(
        '[ExecutionEngine] Final output from node',
        this.outputNodeId,
        ':',
        finalOutput
      );

      // Finalize stats
      const stats = this.context.finalize();

      return {
        success: stats.errors.length === 0,
        output: finalOutput,
        results: this.results,
        stats: {
          totalDuration: Date.now() - startTime,
          nodesExecuted: stats.nodesExecuted,
          errors: stats.errors,
          warnings: stats.warnings
        },
        context: this.context
      };
    } catch (error) {
      const stats = this.context.finalize();

      return {
        success: false,
        output: null,
        results: this.results,
        stats: {
          totalDuration: Date.now() - startTime,
          nodesExecuted: stats.nodesExecuted,
          errors: [
            ...stats.errors,
            { nodeId: 'engine', error: error as Error }
          ],
          warnings: stats.warnings
        },
        context: this.context
      };
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(nodeId: string): Promise<void> {
    const startTime = Date.now();
    const node = this.graph.nodes.get(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    try {
      this.context.incrementDepth();
      this.context.recordNodeExecution(nodeId);

      // Get inputs for this node
      const inputs = this.getNodeInputs(nodeId);
      debugLogExecution(
        `[ExecutionEngine] Executing node ${nodeId} of type ${node.getNodeType()} with ${inputs.length} inputs:`,
        inputs
      );

      // Execute based on node type
      let output: any = null;

      switch (node.getNodeType()) {
        case Epic1NodeType.TextBlock:
          output = await this.executeTextBlock(node as TextBlockNode, inputs);
          break;

        case Epic1NodeType.WeightedChoice:
          output = await this.executeWeightedChoice(
            node as WeightedChoiceNode,
            inputs
          );
          break;

        case Epic1NodeType.Concat:
          output = await this.executeConcat(node as ConcatNode, inputs);
          break;

        case Epic1NodeType.Variable:
          output = await this.executeVariable(node as VariableNode, inputs);
          break;

        case Epic1NodeType.Output:
          output = await this.executeOutput(node as OutputNode, inputs);
          break;

        default:
          throw new Error(`Unknown node type: ${node.getNodeType()}`);
      }

      // Store result
      this.results.set(nodeId, {
        nodeId,
        output,
        duration: Date.now() - startTime
      });
      debugLogExecution(
        `[ExecutionEngine] Node ${nodeId} produced output:`,
        output
      );

      this.context.decrementDepth();
    } catch (error) {
      this.context.decrementDepth();

      const err = error as Error;
      this.context.addError(nodeId, err);

      this.results.set(nodeId, {
        nodeId,
        output: null,
        duration: Date.now() - startTime,
        error: err
      });

      // Don't propagate error - continue execution
      // This allows partial execution results
    }
  }

  /**
   * Execute a TextBlock node
   */
  private async executeTextBlock(
    node: TextBlockNode,
    inputs: any[]
  ): Promise<string> {
    const value = node.getCurrentValue();

    // Substitute variables
    const substituted = this.context.substituteVariables(value);

    return substituted;
  }

  /**
   * Execute a WeightedChoice node
   */
  private async executeWeightedChoice(
    node: WeightedChoiceNode,
    inputs: any[]
  ): Promise<string> {
    const options = node.getData().value;

    if (options.length === 0) {
      return '';
    }

    // Calculate total weight
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

    if (totalWeight === 0) {
      return options[0].text; // Fallback to first option
    }

    // Get node-specific PRNG for deterministic selection
    const prng = this.context.getNodePRNG(node.serialize().id);
    const random = prng() * totalWeight;

    // Select based on weight
    let accumulator = 0;
    for (const option of options) {
      accumulator += option.weight;
      if (random <= accumulator) {
        // Substitute variables in the selected text
        return this.context.substituteVariables(option.text);
      }
    }

    // Fallback (shouldn't reach here)
    return options[options.length - 1].text;
  }

  /**
   * Execute a Concat node
   */
  private async executeConcat(
    node: ConcatNode,
    inputs: any[]
  ): Promise<string> {
    const config = node.getData().configuration || {};
    const separator = config.separator || ' ';
    const trimInputs = config.trimInputs !== false;

    // Process inputs
    const processedInputs = inputs
      .filter(input => input != null && input !== '') // Remove null/undefined/empty
      .map(input => {
        const str = String(input);
        return trimInputs ? str.trim() : str;
      })
      .filter(str => str.length > 0); // Remove empty after trimming

    return processedInputs.join(separator);
  }

  /**
   * Execute a Variable node
   */
  private async executeVariable(
    node: VariableNode,
    inputs: any[]
  ): Promise<any> {
    const config = node.getData().value;
    const nodeConfig = node.getData().configuration || {};
    const mode = nodeConfig.mode || 'both';

    // Get input value (if any)
    const inputValue = inputs.length > 0 ? inputs[0] : undefined;

    if (mode === 'set' || mode === 'both') {
      // Set the variable
      const valueToSet =
        inputValue !== undefined ? inputValue : config.defaultValue;

      if (valueToSet !== undefined) {
        this.context.setVariable(config.name, valueToSet);
      }
    }

    if (mode === 'get' || mode === 'both') {
      // Get the variable
      const value = this.context.getVariable(config.name);

      if (value !== undefined) {
        return value;
      } else if (config.defaultValue !== undefined) {
        return config.defaultValue;
      }
    }

    // For set mode, pass through the input
    if (mode === 'set') {
      return inputValue;
    }

    return null;
  }

  /**
   * Execute an Output node
   */
  private async executeOutput(node: OutputNode, inputs: any[]): Promise<any> {
    const input = inputs.length > 0 ? inputs[0] : '';
    debugLogExecution(
      '[ExecutionEngine] Output node receiving input:',
      input,
      'from',
      inputs.length,
      'sources'
    );

    // Set the input on the node for display
    node.setInput(input);

    return input;
  }

  /**
   * Get inputs for a node by following incoming edges
   */
  private getNodeInputs(nodeId: string): any[] {
    const inputs: any[] = [];

    // Find edges targeting this node
    const incomingEdges = this.graph.edges.filter(
      edge => edge.target === nodeId
    );

    // Sort by targetHandle to maintain order (if handles are like 'input0', 'input1', etc.)
    incomingEdges.sort((a, b) => {
      const handleA = a.targetHandle || '0';
      const handleB = b.targetHandle || '0';
      return handleA.localeCompare(handleB);
    });

    // Collect outputs from source nodes
    for (const edge of incomingEdges) {
      const sourceResult = this.results.get(edge.source);

      if (sourceResult && !sourceResult.error) {
        inputs.push(sourceResult.output);
      }
    }

    return inputs;
  }

  /**
   * Build execution order using topological sort
   */
  private buildExecutionOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    this.graph.nodes.forEach((_, nodeId) => {
      adjacency.set(nodeId, []);
    });

    this.graph.edges.forEach(edge => {
      const neighbors = adjacency.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacency.set(edge.source, neighbors);
    });

    // DFS for topological sort
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      if (visiting.has(nodeId)) {
        throw new Error('Cycle detected in graph');
      }

      visiting.add(nodeId);

      // Visit dependencies first
      const dependencies = this.graph.edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);

      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      order.push(nodeId);
    };

    // Start from output node
    if (this.outputNodeId) {
      visit(this.outputNodeId);
    }

    // Visit any remaining nodes (disconnected components)
    this.graph.nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    });

    this.executionOrder = order;
  }

  /**
   * Get the execution context (for inspection/debugging)
   */
  getContext(): Epic1ExecutionContext {
    return this.context;
  }

  /**
   * Get the execution order (for inspection/debugging)
   */
  getExecutionOrder(): string[] {
    return [...this.executionOrder];
  }
}
