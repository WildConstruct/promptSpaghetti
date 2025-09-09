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
        '[ExecutionEngine] Total nodes in graph:',
        this.graph.nodes.size,
        'Node IDs:',
        Array.from(this.graph.nodes.keys())
      );
      debugLogExecution(
        '[ExecutionEngine] Graph edges:',
        this.graph.edges.length,
        'edges:',
        this.graph.edges.map(
          e =>
            `${e.source} --[${e.sourceHandle || 'output'}]--> ${e.target}[${e.targetHandle || 'input'}]`
        )
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

    debugLogExecution(
      `[ExecutionEngine] Executing TextBlock with value "${value}" and ${inputs.length} input(s)`
    );

    // Substitute variables
    const substituted = this.context.substituteVariables(value);

    // If there are inputs, prepend them to the output
    if (inputs.length > 0) {
      const inputStr = inputs
        .map(i => String(i || ''))
        .filter(s => s)
        .join(' ');
      const result = inputStr ? `${inputStr} ${substituted}` : substituted;
      debugLogExecution(
        `[ExecutionEngine] TextBlock with input, output: "${result}"`
      );
      return result;
    }

    debugLogExecution(`[ExecutionEngine] TextBlock output: "${substituted}"`);
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
    const nodeId = node.serialize().id;

    debugLogExecution(
      `[ExecutionEngine] Executing WeightedChoice ${nodeId} with ${options.length} option(s) and ${inputs.length} input(s):`,
      { options, inputs }
    );

    // Process inputs first - concatenate them if there are any
    let inputStr = '';
    if (inputs.length > 0) {
      inputStr = inputs
        .map(i => String(i || ''))
        .filter(s => s)
        .join(' ');
      debugLogExecution(
        `[ExecutionEngine] WeightedChoice ${nodeId} input string: "${inputStr}"`
      );
    }

    if (options.length === 0) {
      // If no options, just return the input
      return inputStr;
    }

    let selectedText = '';
    let selectedIndex = 0;

    // If there's only one option, return it directly
    if (options.length === 1) {
      selectedText = this.context.substituteVariables(options[0].text);
      selectedIndex = 0;
      debugLogExecution(
        `[ExecutionEngine] WeightedChoice ${nodeId} single option, selected: "${selectedText}"`
      );
    } else {
      // Calculate total weight
      const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

      if (totalWeight === 0) {
        selectedText = options[0].text; // Fallback to first option
        selectedIndex = 0;
      } else {
        // Get node-specific PRNG for deterministic selection
        const prng = this.context.getNodePRNG(nodeId);
        const random = prng() * totalWeight;

        // Select based on weight
        let accumulator = 0;
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          accumulator += option.weight;
          if (random <= accumulator) {
            // Substitute variables in the selected text
            selectedText = this.context.substituteVariables(option.text);
            selectedIndex = i;
            debugLogExecution(
              `[ExecutionEngine] WeightedChoice ${nodeId} selected option ${i}: "${selectedText}"`
            );
            break;
          }
        }

        // Fallback (shouldn't reach here)
        if (!selectedText && options.length > 0) {
          selectedText = options[options.length - 1].text;
          selectedIndex = options.length - 1;
        }
      }
    }

    // Store which branch was selected for potential branch routing
    // This could be used later if we implement branch-specific outputs
    debugLogExecution(
      `[ExecutionEngine] WeightedChoice ${nodeId} selected branch index: ${selectedIndex}`
    );

    // Concatenate input with selected text
    const result = inputStr ? `${inputStr} ${selectedText}` : selectedText;
    debugLogExecution(
      `[ExecutionEngine] WeightedChoice ${nodeId} final output: "${result}"`
    );
    return result;
  }

  /**
   * Execute a Concat node
   */
  private async executeConcat(
    node: ConcatNode,
    inputs: any[]
  ): Promise<string> {
    // ConcatNode stores its config in 'value' field
    const config = node.getData().value || node.getData().configuration || {};
    const separator = config.separator !== undefined ? config.separator : ' ';
    const trimInputs = config.trimInputs !== false;

    debugLogExecution(
      `[ExecutionEngine] Concat node ${node.serialize().id} config:`,
      { separator, trimInputs },
      'inputs:',
      inputs
    );

    // Process inputs
    const processedInputs = inputs
      .filter(input => input != null && input !== '') // Remove null/undefined/empty
      .map(input => {
        const str = String(input);
        return trimInputs ? str.trim() : str;
      })
      .filter(str => str.length > 0); // Remove empty after trimming

    const result = processedInputs.join(separator);
    debugLogExecution(
      `[ExecutionEngine] Concat node ${node.serialize().id} result:`,
      result
    );

    return result;
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
    debugLogExecution(
      '[ExecutionEngine] Output node receiving',
      inputs.length,
      'input(s):',
      inputs
    );

    // Pass all inputs to the OutputNode - it will handle concatenation
    if (inputs.length > 1) {
      // Pass array for auto-concatenation
      node.setInput(inputs.map(i => String(i || '')));
    } else if (inputs.length === 1) {
      // Single input
      node.setInput(String(inputs[0] || ''));
    } else {
      // No inputs
      node.setInput('');
    }

    // Return the concatenated result
    const result = await node.run(this.context);
    debugLogExecution('[ExecutionEngine] Output node result:', result);
    return result;
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

    debugLogExecution(
      `[ExecutionEngine] Node ${nodeId} has ${incomingEdges.length} incoming edges:`,
      incomingEdges.map(e => ({
        source: e.source,
        sourceHandle: e.sourceHandle || 'output',
        targetHandle: e.targetHandle || 'input'
      }))
    );

    // Sort by targetHandle to maintain order
    // Handles like 'input1', 'input2' should be ordered, 'target' comes first
    incomingEdges.sort((a, b) => {
      const handleA = a.targetHandle || 'target';
      const handleB = b.targetHandle || 'target';

      // Special handling for concat node inputs
      if (handleA.startsWith('input') && handleB.startsWith('input')) {
        // Extract numbers from handles like 'input1', 'input2'
        const numA = parseInt(handleA.replace('input', '')) || 0;
        const numB = parseInt(handleB.replace('input', '')) || 0;
        return numA - numB;
      }

      return handleA.localeCompare(handleB);
    });

    // Collect outputs from source nodes
    for (const edge of incomingEdges) {
      const sourceResult = this.results.get(edge.source);

      if (sourceResult && !sourceResult.error) {
        inputs.push(sourceResult.output);
        debugLogExecution(
          `[ExecutionEngine] Added input from ${edge.source} (via ${edge.sourceHandle || 'output'}): "${sourceResult.output}"`
        );
      } else if (!sourceResult) {
        debugLogExecution(
          `[ExecutionEngine] WARNING: No result found for source node ${edge.source}`
        );
      } else if (sourceResult.error) {
        debugLogExecution(
          `[ExecutionEngine] WARNING: Source node ${edge.source} has error: ${sourceResult.error}`
        );
      }
    }

    debugLogExecution(
      `[ExecutionEngine] Node ${nodeId} collected ${inputs.length} inputs:`,
      inputs
    );

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

    debugLogExecution('[ExecutionEngine] Graph edges:', this.graph.edges);
    debugLogExecution(
      '[ExecutionEngine] Adjacency list:',
      Array.from(adjacency.entries())
    );

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

      debugLogExecution(
        `[ExecutionEngine] Node ${nodeId} has dependencies:`,
        dependencies
      );

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
    debugLogExecution(
      '[ExecutionEngine] Final execution order:',
      this.executionOrder
    );
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
