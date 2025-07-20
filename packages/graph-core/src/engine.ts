/**
 * Graph execution engine
 * Extracted and refactored from server/src/engine.ts for cross-platform use
 */

import { GraphDocument, ExecutionResult, ExecutionContext, GraphNode, RuntimeNode } from './types';
import { GraphValidator, ValidationResult } from './validation';
import seedrandom from 'seedrandom';

// Re-export core runtime nodes
export * from './runtime';

export class GraphEngine {
  private validator = new GraphValidator();

  /**
   * Execute a graph and return outputs from all Output nodes
   */
  async execute(graph: GraphDocument, seed?: number | string): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionSeed = seed ?? graph.seed ?? Date.now();
    const executionId = this.generateExecutionId();

    try {
      // Validate graph structure
      const validation = this.validator.validate(graph);
      if (!validation.valid) {
        return {
          success: false,
          outputs: [],
          error: `Graph validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          metadata: {
            executionTime: Date.now() - startTime,
            seed: executionSeed,
            nodeCount: graph.nodes.size,
            executionId
          }
        };
      }

      // Convert Map-based graph to array for execution
      const nodeArray = Array.from(graph.nodes.values());
      
      // Create execution context
      const context: ExecutionContext = {
        variables: {},
        seed: executionSeed,
        edges: Array.from(graph.edges.values())
      };

      // Execute graph using depth-first traversal
      const outputs = await this.executeNodes(nodeArray, context);

      return {
        success: true,
        outputs,
        metadata: {
          executionTime: Date.now() - startTime,
          seed: executionSeed,
          nodeCount: graph.nodes.size,
          executionId
        }
      };

    } catch (error) {
      return {
        success: false,
        outputs: [],
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTime: Date.now() - startTime,
          seed: executionSeed,
          nodeCount: graph.nodes.size,
          executionId
        }
      };
    }
  }

  /**
   * Validate a graph structure
   */
  validate(graph: GraphDocument): ValidationResult {
    return this.validator.validate(graph);
  }

  /**
   * Check if graph is valid (returns boolean for convenience)
   */
  isValid(graph: GraphDocument): boolean {
    const validation = this.validator.validate(graph);
    return validation.valid;
  }

  /**
   * Serialize graph to binary format for CRDT storage
   */
  serialize(graph: GraphDocument): Uint8Array {
    const jsonString = JSON.stringify({
      id: graph.id,
      nodes: Array.from(graph.nodes.entries()),
      edges: Array.from(graph.edges.entries()),
      metadata: graph.metadata,
      seed: graph.seed
    });
    
    return new TextEncoder().encode(jsonString);
  }

  /**
   * Deserialize binary data to graph document
   */
  deserialize(data: Uint8Array): GraphDocument {
    const jsonString = new TextDecoder().decode(data);
    const parsed = JSON.parse(jsonString);
    
    return {
      id: parsed.id,
      nodes: new Map(parsed.nodes),
      edges: new Map(parsed.edges),
      metadata: parsed.metadata,
      seed: parsed.seed
    };
  }

  /**
   * Create a new empty graph document
   */
  createEmptyGraph(id?: string): GraphDocument {
    return {
      id: id || this.generateGraphId(),
      nodes: new Map(),
      edges: new Map(),
      metadata: {
        version: '1.0.0',
        created: new Date(),
        modified: new Date()
      }
    };
  }

  /**
   * Clone a graph document
   */
  cloneGraph(graph: GraphDocument): GraphDocument {
    return this.deserialize(this.serialize(graph));
  }

  // Private methods

  private async executeNodes(nodes: GraphNode[], context: ExecutionContext): Promise<string[]> {
    const outputs: string[] = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const visited = new Set<string>();
    const executing = new Set<string>();

    // Build dependency graph from edges and inputs
    const dependencies = new Map<string, string[]>();
    for (const node of nodes) {
      dependencies.set(node.id, []);
    }

    // Add dependencies from edges (source -> target relationship)
    for (const edge of context.edges || []) {
      const targetDeps = dependencies.get(edge.target) || [];
      targetDeps.push(edge.source);
      dependencies.set(edge.target, targetDeps);
    }

    // Also add from node.inputs if present
    for (const node of nodes) {
      if (node.inputs) {
        const existingDeps = dependencies.get(node.id) || [];
        dependencies.set(node.id, [...existingDeps, ...node.inputs]);
      }
    }

    // Find Output nodes and execute the graph with dependencies
    const outputNodes = nodes.filter(node => node.type === 'Output');
    
    for (const outputNode of outputNodes) {
      const result = await this.executeNodeWithDeps(outputNode, nodeMap, dependencies, context, visited, executing);
      if (typeof result === 'string') {
        outputs.push(result);
      }
    }

    return outputs;
  }

  private async executeNodeWithDeps(
    node: GraphNode,
    nodeMap: Map<string, GraphNode>,
    dependencies: Map<string, string[]>,
    context: ExecutionContext,
    visited: Set<string>,
    executing: Set<string>
  ): Promise<any> {
    // Detect cycles
    if (executing.has(node.id)) {
      throw new Error(`Cycle detected at node ${node.id}`);
    }

    // Return cached result if already visited
    if (visited.has(node.id)) {
      return context.variables[`__result_${node.id}`];
    }

    executing.add(node.id);

    try {
      // Execute dependency nodes first
      const inputResults: any[] = [];
      const deps = dependencies.get(node.id) || [];
      
      for (const depId of deps) {
        const depNode = nodeMap.get(depId);
        if (depNode) {
          const result = await this.executeNodeWithDeps(depNode, nodeMap, dependencies, context, visited, executing);
          inputResults.push(result);
        }
      }

      // Create runtime node and execute
      const runtimeNode = this.createRuntimeNode(node, inputResults, context);
      const result = await runtimeNode.run(context);

      // Cache result
      context.variables[`__result_${node.id}`] = result;
      visited.add(node.id);

      return result;
    } finally {
      executing.delete(node.id);
    }
  }

  private async executeNode(
    node: GraphNode,
    nodeMap: Map<string, GraphNode>,
    context: ExecutionContext,
    visited: Set<string>,
    executing: Set<string>
  ): Promise<any> {
    // Legacy method - redirect to new implementation
    const dependencies = new Map<string, string[]>();
    for (const [id, n] of nodeMap) {
      dependencies.set(id, n.inputs || []);
    }
    return this.executeNodeWithDeps(node, nodeMap, dependencies, context, visited, executing);
  }

  private createRuntimeNode(node: GraphNode, inputs: any[], context: ExecutionContext): RuntimeNode {
    switch (node.type) {
    case 'WeightedChoice':
      return new WeightedChoiceRuntimeNode(node.id, node.data.choices || []);
      
    case 'Concat':
      return new ConcatRuntimeNode(node.id, node.data.template, inputs, context);
      
    case 'Output':
      return new OutputRuntimeNode(node.id, node.data.text, inputs, context);
      
    case 'Include':
      return new IncludeRuntimeNode(node.id, node.data.name || '', node.data.lookup || {});
      
    case 'SetVariable':
      return new SetVariableRuntimeNode(node.id, node.data.key || '', node.data.value);
      
    case 'GetVariable':
      return new GetVariableRuntimeNode(node.id, node.data.key || '');
      
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  private seededRandom(seed: string | number): number {
    return seedrandom(String(seed))();
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGraphId(): string {
    return `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Runtime node implementations

class WeightedChoiceRuntimeNode extends RuntimeNode<string> {
  constructor(id: string, private choices: Array<{ value: string; weight: number }>) {
    super(id);
  }

  run(ctx: ExecutionContext): string {
    if (this.choices.length === 0) return '';
    
    const total = this.choices.reduce((sum, c) => sum + c.weight, 0);
    if (total === 0) return this.choices[0].value;
    
    // Create node-specific seed for deterministic results
    const nodeSeed = `${ctx.seed}_${this.id}`;
    let r = seedrandom(nodeSeed)() * total;
    
    for (const choice of this.choices) {
      if (r < choice.weight) return choice.value;
      r -= choice.weight;
    }
    return this.choices[this.choices.length - 1].value;
  }
}

class ConcatRuntimeNode extends RuntimeNode<string> {
  constructor(
    id: string, 
    private template: string, 
    private inputs: any[], 
    private context: ExecutionContext
  ) {
    super(id);
  }

  run(): string {
    if (!this.template) {
      return this.inputs.join('');
    }
    return this.substituteTemplate(this.template);
  }

  private substituteTemplate(template: string): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, nodeId) => {
      const value = this.context.variables[`__result_${nodeId}`];
      return value !== undefined ? String(value) : match;
    });
  }
}

class OutputRuntimeNode extends RuntimeNode<string> {
  constructor(
    id: string, 
    private text: string, 
    private inputs: any[], 
    private context: ExecutionContext
  ) {
    super(id);
  }

  run(): string {
    if (!this.text) {
      return this.inputs.join('');
    }
    return this.substituteTemplate(this.text);
  }

  private substituteTemplate(template: string): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, nodeId) => {
      const value = this.context.variables[`__result_${nodeId}`];
      return value !== undefined ? String(value) : match;
    });
  }
}

class IncludeRuntimeNode extends RuntimeNode<string> {
  constructor(id: string, private name: string, private lookup: Record<string, string>) {
    super(id);
  }

  run(): string {
    return this.lookup[this.name] || '';
  }
}

class SetVariableRuntimeNode extends RuntimeNode<void> {
  constructor(id: string, private key: string, private value: any) {
    super(id);
  }

  run(ctx: ExecutionContext): void {
    ctx.variables[this.key] = this.value;
  }
}

class GetVariableRuntimeNode extends RuntimeNode<any> {
  constructor(id: string, private key: string) {
    super(id);
  }

  run(ctx: ExecutionContext): any {
    return ctx.variables[this.key];
  }
}