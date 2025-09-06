// LLM Response Processor - Story 2.6
// Processes and validates LLM parsing responses

import { z } from 'zod';
import { Node, Edge } from 'reactflow';
import { LLMParseResponse, ParserOptions, ParseResult } from './PromptParser';

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

    const nodes: Node[] = [];
    const edges: Edge[] = [];
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
        const varEdges = this.createVariableReferenceEdges(nodes, variableIntegrity);
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
  private createNode(nodeData: any, nodeId: string, index: number): Node {
    const nodeType = this.mapNodeType(nodeData.type);
    const position = this.calculateNodePosition(index);

    const node: Node = {
      id: nodeId,
      type: nodeType,
      position,
      data: {
        label: nodeData.content || '',
        content: nodeData.content,
        metadata: nodeData.metadata || {},
        // Add any type-specific data
        ...this.getTypeSpecificData(nodeData)
      }
    };

    // Handle special metadata
    if (nodeData.metadata) {
      // Opaque nodes (like code blocks)
      if (nodeData.metadata.opaque) {
        node.data.editable = false;
        node.data.style = { backgroundColor: '#f0f0f0' };
      }

      // Language metadata
      if (nodeData.metadata.lang) {
        node.data.language = nodeData.metadata.lang;
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
        node.data.rank = nodeData.metadata.rank;
      }
    }

    return node;
  }

  /**
   * Create a variable node
   */
  private createVariableNode(varName: string, index: number): Node {
    const nodeId = this.generateNodeId();
    
    return {
      id: nodeId,
      type: 'variable',
      position: this.calculateNodePosition(index),
      data: {
        label: `{${varName}}`,
        name: varName,
        content: `{${varName}}`,
        isVariable: true
      }
    };
  }

  /**
   * Create an edge from LLM edge data
   */
  private createEdge(edgeData: any, nodes: Node[]): Edge {
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
  private createVariableReferenceEdges(nodes: Node[], variables: Set<string>): Edge[] {
    const edges: Edge[] = [];
    const varNodes = new Map<string, Node>();

    // Find all variable nodes
    nodes.forEach(node => {
      if (node.data.isVariable && node.data.name) {
        varNodes.set(node.data.name, node);
      }
    });

    // Connect nodes that reference variables
    nodes.forEach(node => {
      if (!node.data.isVariable && node.data.content) {
        const referencedVars = this.extractVariablesFromContent(node.data.content);
        
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
      const referencedVars = this.extractVariablesFromContent(node.data.content || '');
      referencedVars.forEach(varName => {
        if (!varNodes.has(varName)) {
          node.data.metadata = {
            ...node.data.metadata,
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
      const exists = originalPrompt.includes(`{${varName}}`) || 
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
  private validateEdge(edgeData: any, nodeCount: number): boolean {
    // Check valid indices
    if (edgeData.source < 0 || edgeData.source >= nodeCount ||
        edgeData.target < 0 || edgeData.target >= nodeCount) {
      console.warn(`Invalid edge indices: ${edgeData.source} -> ${edgeData.target}`);
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
  private layoutNodesWithTopologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (!edge.data?.isVariableReference) { // Skip variable reference edges for layout
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
    const layouted: Node[] = [];
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

    const intersection = new Set(
      [...original].filter(x => extracted.has(x))
    );
    
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
  private hasVariableNode(nodes: Node[], varName: string): boolean {
    return nodes.some(node => 
      node.data.isVariable && node.data.name === varName
    );
  }

  /**
   * Map LLM node type to React Flow type
   */
  private mapNodeType(llmType: string): string {
    const typeMap: Record<string, string> = {
      'Variable': 'variable',
      'WeightedChoice': 'weightedChoice',
      'TextBlock': 'textBlock',
      'Sequential': 'sequential'
    };
    
    return typeMap[llmType] || 'textBlock';
  }

  /**
   * Get type-specific data for node
   */
  private getTypeSpecificData(nodeData: any): any {
    switch (nodeData.type) {
      case 'WeightedChoice':
        // Parse choices from content or metadata
        const choices = nodeData.metadata?.alternatives || 
                       nodeData.content.split(/\s*\|\s*/);
        return {
          options: choices.map((choice: string, i: number) => ({
            id: `opt-${i}`,
            text: choice.trim(),
            weight: 100 / choices.length
          }))
        };
      
      case 'Variable':
        const varName = nodeData.content.replace(/[{}]/g, '');
        return {
          name: varName,
          isVariable: true
        };
      
      case 'Sequential':
        return {
          sequence: nodeData.metadata?.sequence || 'linear',
          step: nodeData.metadata?.step || 0
        };
      
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