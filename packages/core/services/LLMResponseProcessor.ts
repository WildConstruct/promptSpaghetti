// LLM Response Processor - Story 2.6
// Processes and validates LLM parsing responses

import { Edge, Node } from 'reactflow';
import {
  LLMParseResponse,
  ParserOptions,
  ParseResult
} from './PromptParser';

type ParsedNode = LLMParseResponse['nodes'][number];
type ParsedEdge = LLMParseResponse['edges'][number];

type NodeType = 'variable' | 'weightedChoice' | 'textBlock' | 'sequential';

interface WeightedChoiceOption {
  id: string;
  text: string;
  weight: number;
  hasBranch: boolean;
}

type NodeData = {
  nodeType: NodeType;
  value: string;
  label: string;
  content?: string;
  text?: string;
  metadata?: Record<string, unknown>;
  language?: string;
  editable?: boolean;
  style?: Record<string, unknown>;
  confidence?: number;
  needsReview?: boolean;
  cycleResolved?: boolean;
  rank?: number;
  variableName?: string;
  name?: string;
  isVariable?: boolean;
  options?: WeightedChoiceOption[];
  sequence?: string;
  step?: number;
};

type VariableNodeData = NodeData & {
  nodeType: 'variable';
  variableName: string;
  name: string;
  isVariable: true;
};

interface EdgeData {
  label?: string;
  variable?: string;
  isVariableReference?: boolean;
}

export class LLMResponseProcessor {
  private nodeIdCounter = 0;

  /**
   * Process LLM response into React Flow nodes and edges
   */
  async processResponse(
    response: LLMParseResponse,
    originalPrompt: string,
    options: ParserOptions,
    originalVariables: Set<string>
  ): Promise<ParseResult> {
    // Validate response version
    if (response.version !== 'psg-parse-v1') {
      throw new Error(`Unsupported response version: ${response.version}`);
    }

    const nodes: Node<NodeData>[] = [];
    const edges: Edge<EdgeData>[] = [];
    const variableIntegrity = new Set<string>();

    // Process nodes
    response.nodes.forEach((nodeData, index) => {
      const nodeId = this.generateNodeId();
      const node = this.createNode(nodeData, nodeId, index);
      nodes.push(node);

      // Track variables
      if (nodeData.variables && options.preserveVariables) {
        const validVariables = this.validateVariables(
          nodeData.variables,
          originalPrompt,
          originalVariables,
          options.allowInferredVariables
        );

        validVariables.forEach(varName => {
          variableIntegrity.add(varName);

          // Create variable nodes if they don't exist
          if (!this.hasVariableNode(nodes, varName)) {
            const varNode = this.createVariableNode(varName, nodes.length);
            nodes.push(varNode);
          }
        });
      }

      // Extract variables from content
      const contentVars = this.extractVariablesFromContent(nodeData.content);
      contentVars.forEach(v => variableIntegrity.add(v));
    });

    // Process edges
    if (options.autoConnect) {
      response.edges.forEach(edgeData => {
        if (this.validateEdge(edgeData, nodes.length)) {
          const edge = this.createEdge(edgeData, nodes);
          edges.push(edge);
        }
      });

      // Add variable reference edges
      if (options.preserveVariables) {
        const varEdges = this.createVariableReferenceEdges(nodes);
        edges.push(...varEdges);
      }
    }

    // Apply topological sort for layout
    const sortedNodes = this.layoutNodesWithTopologicalSort(nodes, edges);

    // Calculate variable integrity score
    const integrityScore = this.calculateVariableIntegrity(
      originalVariables,
      variableIntegrity
    );

    return {
      nodes: sortedNodes,
      edges,
      metadata: {
        version: response.version,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        variableIntegrity: integrityScore,
        variablesPreserved: Array.from(variableIntegrity),
        parserMode: 'llm-enhanced'
      }
    };
  }

  /**
   * Create a React Flow node from LLM node data
   */
  private createNode(
    nodeData: ParsedNode,
    nodeId: string,
    index: number
  ): Node<NodeData> {
    const nodeType = this.mapNodeType(nodeData.type);
    const position = this.calculateNodePosition(index);
    const typeSpecificData = this.getTypeSpecificData(nodeData);

    const baseData: NodeData = {
      nodeType,
      value: nodeData.content || '',
      label: nodeData.content || '',
      content: nodeData.content,
      metadata: (nodeData.metadata as Record<string, unknown>) ?? {}
    };

    if (nodeType === 'textBlock') {
      baseData.text = nodeData.content || '';
    }

    const node: Node<NodeData> = {
      id: nodeId,
      type: nodeType,
      position,
      data: {
        ...baseData,
        ...typeSpecificData
      }
    };

    // Handle special metadata
    if (nodeData.metadata) {
      // Copy all metadata to preserve LLM-generated fields like 'importance'
      node.data.metadata = { ...nodeData.metadata };
      (node as Node<NodeData> & { metadata?: Record<string, unknown> }).metadata =
        { ...nodeData.metadata };

      // Opaque nodes (like code blocks)
      if (nodeData.metadata.opaque) {
        node.data.editable = false;
        node.data.style = { backgroundColor: '#f0f0f0' };
      }

      // Language metadata
      if (nodeData.metadata.lang) {
        node.data.language = String(nodeData.metadata.lang);
      }

      // Uncertainty marker
      if (nodeData.metadata.reason === 'uncertain') {
        node.data.confidence = 0.5;
        node.data.needsReview = true;
      }

      // Cycle resolution marker
      if (nodeData.metadata.cycleResolved) {
        node.data.cycleResolved = true;
      }

      // Rank for topological sort
      if (nodeData.metadata.rank !== undefined) {
        node.data.rank = Number(nodeData.metadata.rank);
      }
    }

    return node;
  }

  /**
   * Create a variable node
   */
  private createVariableNode(
    varName: string,
    index: number
  ): Node<VariableNodeData> {
    const nodeId = this.generateNodeId();
    const variableContent = `{${varName}}`;

    return {
      id: nodeId,
      type: 'variable',
      position: this.calculateNodePosition(index),
      data: {
        nodeType: 'variable',
        value: variableContent,
        label: variableContent,
        content: variableContent,
        variableName: varName,
        name: varName,
        isVariable: true
      }
    };
  }

  /**
   * Create an edge from LLM edge data
   */
  private createEdge(
    edgeData: ParsedEdge,
    nodes: Node<NodeData>[]
  ): Edge<EdgeData> {
    const sourceNode = nodes[edgeData.source];
    const targetNode = nodes[edgeData.target];

    return {
      id: `edge-${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      type: 'default',
      data: {
        label: edgeData.label || undefined
      }
    };
  }

  /**
   * Create edges for variable references
   */
  private createVariableReferenceEdges(
    nodes: Node<NodeData>[]
  ): Edge<EdgeData>[] {
    const edges: Edge<EdgeData>[] = [];
    const varNodes = new Map<string, Node<VariableNodeData>>();

    // Find all variable nodes
    nodes.forEach(node => {
      if (node.data.isVariable && 'name' in node.data && node.data.name) {
        varNodes.set(node.data.name, node as Node<VariableNodeData>);
      }
    });

    // Connect nodes that reference variables
    nodes.forEach(node => {
      if (!node.data.isVariable && 'content' in node.data) {
        const referencedVars = this.extractVariablesFromContent(
          String(node.data.content ?? '')
        );

        referencedVars.forEach(varName => {
          const varNode = varNodes.get(varName);
          if (varNode && varNode.id !== node.id) {
            edges.push({
              id: `var-edge-${varNode.id}-${node.id}`,
              source: varNode.id,
              target: node.id,
              type: 'variable',
              animated: true,
              style: { stroke: '#9ca3af', strokeDasharray: '5,5' },
              data: {
                variable: varName,
                isVariableReference: true
              }
            });
          }
        });
      }
    });

    // Mark broken references
    nodes.forEach(node => {
      const referencedVars = this.extractVariablesFromContent(
        String(node.data.content || '')
      );
      referencedVars.forEach(varName => {
        if (!varNodes.has(varName)) {
          const metadata = (node.data.metadata ?? {}) as Record<string, unknown>;
          node.data.metadata = {
            ...metadata,
            missingVariableRef: true,
            missingVariable: varName
          };
        }
      });
    });

    return edges;
  }

  /**
   * Validate variables against original prompt
   */
  private validateVariables(
    variables: string[],
    originalPrompt: string,
    originalVariables: Set<string>,
    allowInferred: boolean = false
  ): string[] {
    if (allowInferred) {
      return variables;
    }

    // Only keep variables that exist in the original prompt
    return variables.filter(varName => {
      const exists =
        originalPrompt.includes(`{${varName}}`) ||
        originalVariables.has(varName);

      if (!exists) {
        console.warn(`Hallucinated variable detected and removed: ${varName}`);
      }

      return exists;
    });
  }

  /**
   * Validate edge references
   */
  private validateEdge(edgeData: ParsedEdge, nodeCount: number): boolean {
    // Check valid indices
    if (
      edgeData.source < 0 ||
      edgeData.source >= nodeCount ||
      edgeData.target < 0 ||
      edgeData.target >= nodeCount
    ) {
      console.warn(
        `Invalid edge indices: ${edgeData.source} -> ${edgeData.target}`
      );
      return false;
    }

    // No self-loops
    if (edgeData.source === edgeData.target) {
      console.warn(`Self-loop detected and removed: node ${edgeData.source}`);
      return false;
    }

    return true;
  }

  /**
   * Apply topological sort for logical node layout
   */
  private layoutNodesWithTopologicalSort(
    nodes: Node<NodeData>[],
    edges: Edge<EdgeData>[]
  ): Node<NodeData>[] {
    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (!edge.data?.isVariableReference) {
        // Skip variable reference edges for layout
        adjacency.get(edge.source)?.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    });

    // Topological sort
    const queue: string[] = [];
    const sorted: string[] = [];

    // Find nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      sorted.push(nodeId);

      adjacency.get(nodeId)?.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Handle nodes not in the sort (disconnected or in cycles)
    nodes.forEach(node => {
      if (!sorted.includes(node.id)) {
        sorted.push(node.id);
      }
    });

    // Apply layout based on sort order
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const layouted: Node<NodeData>[] = [];
    const horizontalSpacing = 200;
    const verticalSpacing = 120;
    const nodesPerRow = 4;

    sorted.forEach((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        const row = Math.floor(index / nodesPerRow);
        const col = index % nodesPerRow;

        layouted.push({
          ...node,
          position: {
            x: col * horizontalSpacing + 100,
            y: row * verticalSpacing + 100
          },
          data: {
            ...node.data,
            rank: index // Store topological rank
          }
        });
      }
    });

    return layouted;
  }

  /**
   * Calculate variable integrity score (Jaccard similarity)
   */
  private calculateVariableIntegrity(
    original: Set<string>,
    extracted: Set<string>
  ): number {
    if (original.size === 0 && extracted.size === 0) {
      return 1.0;
    }

    if (original.size === 0 || extracted.size === 0) {
      return 0.0;
    }

    const intersection = new Set([...original].filter(x => extracted.has(x)));

    const union = new Set([...original, ...extracted]);

    return intersection.size / union.size;
  }

  /**
   * Extract variables from content
   */
  private extractVariablesFromContent(content: string): Set<string> {
    const variables = new Set<string>();
    const pattern = /\{([^}]+)\}/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return variables;
  }

  /**
   * Check if a variable node already exists
   */
  private hasVariableNode(
    nodes: Node<NodeData>[],
    varName: string
  ): boolean {
    return nodes.some(
      node => node.data.isVariable && 'name' in node.data && node.data.name === varName
    );
  }

  /**
   * Map LLM node type to React Flow type
   */
  private mapNodeType(llmType: ParsedNode['type']): NodeType {
    const typeMap: Record<ParsedNode['type'], NodeType> = {
      Variable: 'variable',
      WeightedChoice: 'weightedChoice',
      TextBlock: 'textBlock',
      Sequential: 'sequential'
    };

    return typeMap[llmType];
  }

  /**
   * Get type-specific data for node
   */
  private getTypeSpecificData(
    nodeData: ParsedNode
  ): Partial<NodeData> {
    switch (nodeData.type) {
      case 'WeightedChoice': {
        const metadataAlternatives = Array.isArray(
          nodeData.metadata?.alternatives
        )
          ? (nodeData.metadata?.alternatives as unknown[]).filter(
              (alternative): alternative is string =>
                typeof alternative === 'string'
            )
          : undefined;

        const choices = metadataAlternatives ?? nodeData.content.split(/\s*\|\s*/);

        const weight = choices.length > 0 ? Math.floor(100 / choices.length) : 100;

        const options: WeightedChoiceOption[] = choices.map((choice, i) => ({
          id: `option-${i + 1}`,
          text: choice.trim(),
          weight,
          hasBranch: false
        }));

        return {
          options,
          value: JSON.stringify(options, null, 2)
        };
      }

      case 'Variable': {
        const varName = nodeData.content.replace(/[{}]/g, '');
        return {
          name: varName,
          variableName: varName,
          isVariable: true
        };
      }

      case 'Sequential': {
        const metadata = nodeData.metadata ?? {};
        const sequence =
          typeof metadata.sequence === 'string' ? metadata.sequence : 'linear';
        const stepValue =
          typeof metadata.step === 'number'
            ? metadata.step
            : Number(metadata.step ?? 0);

        return {
          sequence,
          step: stepValue
        };
      }

      default:
        return {};
    }
  }

  /**
   * Calculate node position
   */
  private calculateNodePosition(index: number): { x: number; y: number } {
    const horizontalSpacing = 200;
    const verticalSpacing = 120;
    const nodesPerRow = 4;

    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    return {
      x: col * horizontalSpacing + 100,
      y: row * verticalSpacing + 100
    };
  }

  /**
   * Generate unique node ID
   */
  private generateNodeId(): string {
    return `llm-node-${++this.nodeIdCounter}`;
  }
}
