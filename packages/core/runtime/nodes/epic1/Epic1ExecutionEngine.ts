/**
 * Epic 1 Execution Engine
 * Executes graphs of Epic 1 nodes with deterministic behavior
 */

import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import { Epic1ExecutionContext } from './Epic1ExecutionContext';
import { Epic1NodeType } from './nodeTypes';
import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { applyWeightDistribution } from './weightDistribution';
import { ConcatNode } from './ConcatNode';
import { VariableNode, VariableMode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { TemplateNode } from './TemplateNode';
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
  private executionOrder: string[];
  private outputNodeId: string | null = null;
  private readonly selectedBranches: Map<string, number>;
  // WeightedChoice nodes whose *selected* option carries its own branch. Their
  // default output is suppressed (router semantics): the branch takes over.
  private readonly branchedSelections: Set<string>;

  constructor(graph: Epic1Graph, seed?: string | number) {
    this.graph = graph;
    this.context = new Epic1ExecutionContext(seed);
    this.results = new Map();
    this.executionOrder = [];
    this.selectedBranches = new Map();
    this.branchedSelections = new Set();
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

      const incomingEdges = this.graph.edges.filter(edge => edge.target === nodeId);
      const activeIncomingEdges = incomingEdges.filter(edge => this.isActiveEdge(edge));

      // Get inputs for this node
      const inputs = this.getNodeInputs(nodeId);
      debugLogExecution(
        `[ExecutionEngine] Executing node ${nodeId} of type ${node.getNodeType()} with ${inputs.length} inputs:`,
        inputs
      );

      // Branch-aware short circuit: if a node has incoming edges but none of them
      // are currently active, or all active predecessors resolved to no input,
      // this node should stay silent instead of behaving like a root node.
      if (incomingEdges.length > 0 && (activeIncomingEdges.length === 0 || inputs.length === 0)) {
        this.results.set(nodeId, {
          nodeId,
          output: '',
          duration: Date.now() - startTime
        });
        debugLogExecution(
          `[ExecutionEngine] Node ${nodeId} short-circuited due to inactive or empty incoming branch inputs`
        );
        this.context.decrementDepth();
        return;
      }

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

        case Epic1NodeType.Template:
          output = await this.executeTemplate(node as TemplateNode, nodeId);
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

    // Locked option ("fixed DNA") wins over weighted randomness: always select
    // it. First locked option wins if several are somehow set.
    const lockedIndex = options.findIndex(
      (opt: { locked?: boolean }) => opt.locked
    );

    if (lockedIndex >= 0) {
      selectedText = this.context.substituteVariables(options[lockedIndex].text);
      selectedIndex = lockedIndex;
      debugLogExecution(
        `[ExecutionEngine] WeightedChoice ${nodeId} locked option ${lockedIndex} selected: "${selectedText}"`
      );
    } else if (options.length === 1) {
      // If there's only one option, return it directly
      selectedText = this.context.substituteVariables(options[0].text);
      selectedIndex = 0;
      debugLogExecution(
        `[ExecutionEngine] WeightedChoice ${nodeId} single option, selected: "${selectedText}"`
      );
    } else {
      // Reshape weights by the node's configured distribution before selection
      // (linear/absent == identity, so existing graphs are unchanged).
      const weighted = applyWeightDistribution(options, node.getDistribution());

      // Calculate total weight
      const totalWeight = weighted.reduce((sum, opt) => sum + opt.weight, 0);

      if (totalWeight === 0) {
        selectedText = weighted[0].text; // Fallback to first option
        selectedIndex = 0;
      } else {
        // Get node-specific PRNG for deterministic selection
        const prng = this.context.getNodePRNG(nodeId);
        const random = prng() * totalWeight;

        // Select based on weight
        let accumulator = 0;
        for (let i = 0; i < weighted.length; i++) {
          const option = weighted[i];
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
        if (!selectedText && weighted.length > 0) {
          selectedText = weighted[weighted.length - 1].text;
          selectedIndex = weighted.length - 1;
        }
      }
    }

    // Store which branch was selected for potential branch routing
    // This could be used later if we implement branch-specific outputs
    debugLogExecution(
      `[ExecutionEngine] WeightedChoice ${nodeId} selected branch index: ${selectedIndex}`
    );
    this.selectedBranches.set(nodeId, selectedIndex);

    // Router semantics: if the chosen option has its own branch, the default
    // output is suppressed so only the branch path fires for this selection.
    if (options[selectedIndex]?.hasBranch) {
      this.branchedSelections.add(nodeId);
    }

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
    node.setInputs(inputs.map(input => String(input ?? '')));
    const result = await node.run(this.context.getExecutionContext());
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
    const nodeConfig = node.getNodeConfig();
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
    const result = await node.run(this.context.getExecutionContext());
    debugLogExecution('[ExecutionEngine] Output node result:', result);
    return result;
  }

  /**
   * Execute a Template node — fill skeleton from slot-* handle inputs.
   */
  private async executeTemplate(
    node: TemplateNode,
    nodeId: string
  ): Promise<string> {
    const slots = this.getSlotInputs(nodeId);
    node.setSlotValues(slots);
    const result = await node.run(this.context.getExecutionContext());
    debugLogExecution(
      `[ExecutionEngine] Template ${nodeId} filled with slots`,
      slots,
      '→',
      result
    );
    return result;
  }

  /**
   * Collect slot values from edges targeting slot-{name} handles.
   * Multiple edges into the same slot are space-joined.
   */
  private getSlotInputs(nodeId: string): Record<string, string> {
    const slots: Record<string, string> = {};
    const incomingEdges = this.graph.edges.filter(
      edge => edge.target === nodeId
    );

    for (const edge of incomingEdges) {
      if (!this.isActiveEdge(edge)) {
        continue;
      }
      const handle = edge.targetHandle || '';
      if (!handle.startsWith('slot-')) {
        continue;
      }
      const name = handle.slice('slot-'.length);
      if (!name) {
        continue;
      }
      const sourceResult = this.results.get(edge.source);
      if (!sourceResult || sourceResult.error) {
        continue;
      }
      const piece = String(sourceResult.output ?? '');
      if (slots[name]) {
        slots[name] = `${slots[name]} ${piece}`.trim();
      } else {
        slots[name] = piece;
      }
    }

    return slots;
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
      if (!this.isActiveEdge(edge)) {
        debugLogExecution(
          `[ExecutionEngine] Skipping inactive branch edge ${edge.id} from ${edge.source} via ${edge.sourceHandle || 'output'}`
        );
        continue;
      }

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

  private isActiveEdge(edge: Epic1Edge): boolean {
    const sourceHandle = edge.sourceHandle;

    // Per-option branch outputs are gated by which option the WeightedChoice
    // selected. Modern handles are `branch-${i}`; legacy graphs persisted the
    // same wiring as `option-${i}`. Both must gate identically — otherwise a
    // legacy `option-` edge (which does not start with `branch-`) would be
    // treated as always-active and fire regardless of the selected option.
    const branchPrefix = sourceHandle?.startsWith('branch-')
      ? 'branch-'
      : sourceHandle?.startsWith('option-')
        ? 'option-'
        : null;

    if (!branchPrefix) {
      // Default/main/source output. Under router semantics, when the selected
      // option of the source WeightedChoice has its own branch, that branch
      // carries the value and the default output is suppressed. For every other
      // source (non-branched selection, or any non-WeightedChoice node) the
      // default output stays active.
      return !this.branchedSelections.has(edge.source);
    }

    const selectedBranch = this.selectedBranches.get(edge.source);
    if (selectedBranch === undefined) {
      return false;
    }

    const branchIndex = Number.parseInt(
      sourceHandle!.replace(branchPrefix, ''),
      10
    );
    return Number.isFinite(branchIndex) && branchIndex === selectedBranch;
  }

  /**
   * Build execution order using topological sort
   */
  private buildExecutionOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    debugLogExecution('[ExecutionEngine] Graph edges:', this.graph.edges);

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

    // Prioritize setup-oriented Variable nodes so disconnected variable
    // initializers run before template/output consumers while still honoring
    // explicit graph dependencies.
    const orderedNodeIds = Array.from(this.graph.nodes.entries())
      .map(([nodeId, node], index) => ({
        nodeId,
        index,
        priority: node.getNodeType() === Epic1NodeType.Variable ? 0 : 1
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        return a.index - b.index;
      })
      .map(entry => entry.nodeId);

    orderedNodeIds.forEach(nodeId => {
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
