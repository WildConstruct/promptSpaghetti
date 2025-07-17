// Epic 12 - LLM Agent Randomizer System
// Story 12.3 - Parser Implementation
// Semantic analysis and graph construction

import { GraphAST, NodeDefinitionAST, EdgeDefinitionAST, ParseError } from '../ast/ast-builder';
import { Graph, Node, NodeTypeEnum } from '../../../graphSchema';

export interface SemanticError extends ParseError {
  nodeId?: string;
  errorCode: string;
}

export interface ValidationContext {
  nodeIds: Set<string>;
  nodeMap: Map<string, NodeDefinitionAST>;
  edgeMap: Map<string, Set<string>>; // source -> targets
  reverseEdgeMap: Map<string, Set<string>>; // target -> sources
  visitedNodes: Set<string>;
  currentPath: string[];
}

export interface SemanticAnalysisResult {
  graph: Graph | null;
  errors: SemanticError[];
  warnings: SemanticError[];
}

export class SemanticAnalyzer {
  private context: ValidationContext;
  private errors: SemanticError[] = [];
  private warnings: SemanticError[] = [];

  constructor() {
    this.context = {
      nodeIds: new Set(),
      nodeMap: new Map(),
      edgeMap: new Map(),
      reverseEdgeMap: new Map(),
      visitedNodes: new Set(),
      currentPath: []
    };
  }

  /**
   * Analyze AST and build validated Graph object
   */
  analyze(ast: GraphAST): SemanticAnalysisResult {
    this.reset();

    try {
      // Phase 1: Build context and validate basic structure
      this.buildContext(ast);
      
      // Phase 2: Validate semantics
      this.validateSemantics(ast);
      
      // Phase 3: Build Graph object if no critical errors
      const graph = this.hasBlockingErrors() ? null : this.buildGraph(ast);
      
      return {
        graph,
        errors: this.errors,
        warnings: this.warnings
      };
    } catch (error) {
      this.addError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error');
      return {
        graph: null,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Reset analyzer state
   */
  private reset(): void {
    this.context = {
      nodeIds: new Set(),
      nodeMap: new Map(),
      edgeMap: new Map(),
      reverseEdgeMap: new Map(),
      visitedNodes: new Set(),
      currentPath: []
    };
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Build analysis context from AST
   */
  private buildContext(ast: GraphAST): void {
    // Collect all node IDs and build node map
    for (const node of ast.nodes) {
      if (this.context.nodeIds.has(node.id)) {
        this.addError('DUPLICATE_NODE_ID', `Duplicate node ID: ${node.id}`, node.id);
      } else {
        this.context.nodeIds.add(node.id);
        this.context.nodeMap.set(node.id, node);
      }
    }

    // Build edge maps
    for (const edge of ast.edges) {
      this.addEdgeToContext(edge.source, edge.target);
    }

    // Add edges from node inputs
    for (const node of ast.nodes) {
      if (node.inputs) {
        for (const inputId of node.inputs) {
          this.addEdgeToContext(inputId, node.id);
        }
      }
    }
  }

  /**
   * Add edge to context maps
   */
  private addEdgeToContext(source: string, target: string): void {
    // Forward edge map (source -> targets)
    if (!this.context.edgeMap.has(source)) {
      this.context.edgeMap.set(source, new Set());
    }
    this.context.edgeMap.get(source)!.add(target);

    // Reverse edge map (target -> sources)
    if (!this.context.reverseEdgeMap.has(target)) {
      this.context.reverseEdgeMap.set(target, new Set());
    }
    this.context.reverseEdgeMap.get(target)!.add(source);
  }

  /**
   * Validate semantic correctness
   */
  private validateSemantics(ast: GraphAST): void {
    // Validate version
    this.validateVersion(ast.version);
    
    // Validate nodes
    for (const node of ast.nodes) {
      this.validateNode(node);
    }
    
    // Validate edges
    for (const edge of ast.edges) {
      this.validateEdge(edge);
    }
    
    // Validate graph structure
    this.validateGraphStructure();
  }

  /**
   * Validate format version
   */
  private validateVersion(version?: string): void {
    if (!version) {
      this.addError('MISSING_VERSION', 'Version is required in graph header');
      return;
    }

    const supportedVersions = ['1.0.0'];
    if (!supportedVersions.includes(version)) {
      this.addError('UNSUPPORTED_VERSION', `Unsupported version: ${version}. Supported: ${supportedVersions.join(', ')}`);
    }
  }

  /**
   * Validate individual node
   */
  private validateNode(node: NodeDefinitionAST): void {
    // Validate node ID format
    if (!this.isValidNodeId(node.id)) {
      this.addError('INVALID_NODE_ID', `Invalid node ID format: ${node.id}. Use alphanumeric, underscore, and hyphen only`, node.id);
    }

    // Validate node type
    if (!node.nodeType) {
      this.addError('MISSING_NODE_TYPE', `Node ${node.id} is missing type property`, node.id);
      return;
    }

    if (!NodeTypeEnum.options.includes(node.nodeType as any)) {
      this.addError('INVALID_NODE_TYPE', `Node ${node.id} has invalid type: ${node.nodeType}`, node.id);
      return;
    }

    // Validate node-specific properties
    this.validateNodeProperties(node);

    // Validate inputs
    if (node.inputs) {
      for (const inputId of node.inputs) {
        if (!this.context.nodeIds.has(inputId)) {
          this.addError('INVALID_NODE_REFERENCE', `Node ${node.id} references non-existent input: ${inputId}`, node.id);
        }
      }
    }
  }

  /**
   * Validate node-specific properties
   */
  private validateNodeProperties(node: NodeDefinitionAST): void {
    const { nodeType, properties } = node;

    switch (nodeType) {
      case 'WeightedChoice':
      case 'WeightedAdvanced':
        this.validateWeightedChoiceProperties(node);
        break;

      case 'Conditional':
        this.validateConditionalProperties(node);
        break;

      case 'Sequential':
        this.validateSequentialProperties(node);
        break;

      case 'Markov':
        this.validateMarkovProperties(node);
        break;

      case 'SetVariable':
      case 'GetVariable':
        this.validateVariableProperties(node);
        break;

      case 'Include':
        this.validateIncludeProperties(node);
        break;

      case 'PythonTransform':
        this.validatePythonTransformProperties(node);
        break;

      case 'Concat':
      case 'Output':
        // These nodes don't require special properties
        break;

      default:
        this.addWarning('UNKNOWN_NODE_TYPE', `Unknown node type: ${nodeType}`, node.id);
    }
  }

  /**
   * Validate WeightedChoice properties
   */
  private validateWeightedChoiceProperties(node: NodeDefinitionAST): void {
    const choices = node.properties?.choices;
    
    if (!choices || !Array.isArray(choices)) {
      this.addError('MISSING_CHOICES', `${node.nodeType} node ${node.id} missing required choices array`, node.id);
      return;
    }

    if (choices.length === 0) {
      this.addError('EMPTY_CHOICES', `${node.nodeType} node ${node.id} has empty choices array`, node.id);
      return;
    }

    let totalWeight = 0;
    choices.forEach((choice, index) => {
      if (!choice || typeof choice !== 'object') {
        this.addError('INVALID_CHOICE', `${node.nodeType} node ${node.id} choice ${index} is not an object`, node.id);
        return;
      }

      if (typeof choice.value !== 'string') {
        this.addError('INVALID_CHOICE_VALUE', `${node.nodeType} node ${node.id} choice ${index} missing string value`, node.id);
      }

      if (typeof choice.weight !== 'number' || choice.weight < 0) {
        this.addError('INVALID_CHOICE_WEIGHT', `${node.nodeType} node ${node.id} choice ${index} has invalid weight`, node.id);
      } else {
        totalWeight += choice.weight;
      }
    });

    if (totalWeight === 0) {
      this.addError('ZERO_TOTAL_WEIGHT', `${node.nodeType} node ${node.id} has zero total weight`, node.id);
    }
  }

  /**
   * Validate Conditional properties
   */
  private validateConditionalProperties(node: NodeDefinitionAST): void {
    const branches = node.properties?.branches;
    
    if (!branches || !Array.isArray(branches)) {
      this.addError('MISSING_BRANCHES', `Conditional node ${node.id} missing required branches array`, node.id);
      return;
    }

    branches.forEach((branch, index) => {
      if (!branch.condition || typeof branch.condition !== 'string') {
        this.addError('INVALID_CONDITION', `Conditional node ${node.id} branch ${index} missing condition`, node.id);
      }

      if (!branch.output || typeof branch.output !== 'string') {
        this.addError('INVALID_BRANCH_OUTPUT', `Conditional node ${node.id} branch ${index} missing output`, node.id);
      }
    });
  }

  /**
   * Validate Sequential properties
   */
  private validateSequentialProperties(node: NodeDefinitionAST): void {
    const sequence = node.properties?.sequence;
    
    if (!sequence || !Array.isArray(sequence)) {
      this.addError('MISSING_SEQUENCE', `Sequential node ${node.id} missing required sequence array`, node.id);
      return;
    }

    if (sequence.length === 0) {
      this.addError('EMPTY_SEQUENCE', `Sequential node ${node.id} has empty sequence array`, node.id);
    }
  }

  /**
   * Validate Markov properties
   */
  private validateMarkovProperties(node: NodeDefinitionAST): void {
    const states = node.properties?.states;
    
    if (!states || typeof states !== 'object') {
      this.addError('MISSING_STATES', `Markov node ${node.id} missing required states object`, node.id);
      return;
    }

    const stateNames = Object.keys(states);
    if (stateNames.length === 0) {
      this.addError('EMPTY_STATES', `Markov node ${node.id} has no states defined`, node.id);
    }

    // Validate each state's transitions
    for (const [stateName, state] of Object.entries(states)) {
      if (state && typeof state === 'object' && 'transitions' in state) {
        const transitions = (state as any).transitions;
        if (transitions && typeof transitions === 'object') {
          for (const targetState of Object.keys(transitions)) {
            if (!stateNames.includes(targetState)) {
              this.addError('INVALID_TRANSITION', `Markov node ${node.id} state ${stateName} transitions to undefined state: ${targetState}`, node.id);
            }
          }
        }
      }
    }
  }

  /**
   * Validate Variable properties
   */
  private validateVariableProperties(node: NodeDefinitionAST): void {
    const key = node.properties?.key;
    
    if (!key || typeof key !== 'string') {
      this.addError('MISSING_VARIABLE_KEY', `${node.nodeType} node ${node.id} missing required key property`, node.id);
    }

    if (node.nodeType === 'SetVariable' && !('value' in (node.properties || {}))) {
      this.addError('MISSING_VARIABLE_VALUE', `SetVariable node ${node.id} missing required value property`, node.id);
    }
  }

  /**
   * Validate Include properties
   */
  private validateIncludeProperties(node: NodeDefinitionAST): void {
    const name = node.properties?.name;
    
    if (!name || typeof name !== 'string') {
      this.addError('MISSING_INCLUDE_NAME', `Include node ${node.id} missing required name property`, node.id);
    }
  }

  /**
   * Validate PythonTransform properties
   */
  private validatePythonTransformProperties(node: NodeDefinitionAST): void {
    const code = node.properties?.code;
    
    if (!code || typeof code !== 'string') {
      this.addError('MISSING_PYTHON_CODE', `PythonTransform node ${node.id} missing required code property`, node.id);
    }

    // Validate timeout if present
    const timeout = node.properties?.timeout;
    if (timeout !== undefined && (typeof timeout !== 'number' || timeout <= 0)) {
      this.addError('INVALID_TIMEOUT', `PythonTransform node ${node.id} has invalid timeout value`, node.id);
    }
  }

  /**
   * Validate edge reference
   */
  private validateEdge(edge: EdgeDefinitionAST): void {
    if (!this.context.nodeIds.has(edge.source)) {
      this.addError('INVALID_EDGE_SOURCE', `Edge references non-existent source node: ${edge.source}`);
    }

    if (!this.context.nodeIds.has(edge.target)) {
      this.addError('INVALID_EDGE_TARGET', `Edge references non-existent target node: ${edge.target}`);
    }
  }

  /**
   * Validate overall graph structure
   */
  private validateGraphStructure(): void {
    // Check for cycles
    this.detectCycles();
    
    // Check for output nodes
    this.validateOutputNodes();
    
    // Check for unreachable nodes
    this.detectUnreachableNodes();
  }

  /**
   * Detect cycles in the graph using DFS
   */
  private detectCycles(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        const cycle = [...path, nodeId];
        this.addError('CYCLE_DETECTED', `Cycle detected: ${cycle.join(' -> ')}`, nodeId);
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const targets = this.context.edgeMap.get(nodeId);
      if (targets) {
        for (const target of targets) {
          if (dfs(target, [...path, nodeId])) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.context.nodeIds) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }
  }

  /**
   * Validate presence of output nodes
   */
  private validateOutputNodes(): void {
    const outputNodes = Array.from(this.context.nodeMap.values())
      .filter(node => node.nodeType === 'Output');

    if (outputNodes.length === 0) {
      this.addWarning('NO_OUTPUT_NODES', 'Graph has no Output nodes - results may not be accessible');
    }
  }

  /**
   * Detect unreachable nodes
   */
  private detectUnreachableNodes(): void {
    const reachable = new Set<string>();
    
    // Find root nodes (no inputs)
    const rootNodes = Array.from(this.context.nodeIds)
      .filter(nodeId => !this.context.reverseEdgeMap.has(nodeId));

    // DFS from root nodes
    const dfs = (nodeId: string) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);

      const targets = this.context.edgeMap.get(nodeId);
      if (targets) {
        for (const target of targets) {
          dfs(target);
        }
      }
    };

    for (const rootId of rootNodes) {
      dfs(rootId);
    }

    // Check for unreachable nodes
    for (const nodeId of this.context.nodeIds) {
      if (!reachable.has(nodeId)) {
        this.addWarning('UNREACHABLE_NODE', `Node ${nodeId} is unreachable from root nodes`, nodeId);
      }
    }
  }

  /**
   * Build Graph object from validated AST
   */
  private buildGraph(ast: GraphAST): Graph {
    const nodes: Node[] = [];

    for (const astNode of ast.nodes) {
      const node = this.buildNodeFromAST(astNode);
      if (node) {
        nodes.push(node);
      }
    }

    return {
      nodes,
      seed: Date.now() // Default seed
    };
  }

  /**
   * Build Node object from AST node
   */
  private buildNodeFromAST(astNode: NodeDefinitionAST): Node | null {
    const baseNode = {
      id: astNode.id,
      type: astNode.nodeType as any,
      inputs: astNode.inputs
    };

    // Add type-specific properties
    const properties = astNode.properties || {};
    
    return {
      ...baseNode,
      ...properties
    } as Node;
  }

  /**
   * Helper methods
   */
  private isValidNodeId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }

  private hasBlockingErrors(): boolean {
    return this.errors.some(error => 
      error.errorCode !== 'UNKNOWN_NODE_TYPE' && 
      error.severity === 'error'
    );
  }

  private addError(errorCode: string, message: string, nodeId?: string): void {
    this.errors.push({
      errorCode,
      message,
      nodeId,
      position: { line: 0, column: 0, offset: 0 },
      severity: 'error'
    });
  }

  private addWarning(errorCode: string, message: string, nodeId?: string): void {
    this.warnings.push({
      errorCode,
      message,
      nodeId,
      position: { line: 0, column: 0, offset: 0 },
      severity: 'warning'
    });
  }
}