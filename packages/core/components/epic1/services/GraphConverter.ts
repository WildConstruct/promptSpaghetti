import { Node, Edge } from 'reactflow';
import { Epic1Graph } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { nodeDataToRuntimeNode } from '../nodes/nodeFactory';
import type { EditableNodeData } from '../nodes';

export class GraphConverter {
  /**
   * Convert React Flow graph to runtime graph format
   */
  static convertToRuntimeGraph(
    flowNodes: Node<EditableNodeData>[],
    flowEdges: Edge[]
  ): Epic1Graph | null {
    try {
      const runtimeNodes = new Map();

      for (const node of flowNodes) {
        // Skip nodes without proper type or position
        if (!node.type || !node.position) {
          console.warn(
            'GraphConverter: Skipping invalid node:',
            node.id,
            'type:',
            node.type,
            'position:',
            node.position
          );
          continue;
        }
        const runtimeNode = nodeDataToRuntimeNode(node);
        if (runtimeNode) {
          runtimeNodes.set(node.id, runtimeNode);
        }
      }

      return {
        nodes: runtimeNodes,
        edges: flowEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? undefined,
          targetHandle: edge.targetHandle ?? undefined
        }))
      };
    } catch (error) {
      console.error(
        'GraphConverter: Error converting to runtime graph:',
        error
      );
      return null;
    }
  }

  /**
   * Validate graph structure before conversion
   */
  static validateGraph(
    nodes: Node<EditableNodeData>[],
    edges: Edge[]
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for duplicate node IDs
    const nodeIds = nodes.map(n => n.id);
    const duplicates = nodeIds.filter(
      (id, index) => nodeIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate node IDs found: ${duplicates.join(', ')}`);
    }

    // Check for invalid edges (referencing non-existent nodes)
    const nodeIdSet = new Set(nodeIds);
    for (const edge of edges) {
      if (!nodeIdSet.has(edge.source)) {
        errors.push(
          `Edge ${edge.id} references non-existent source node: ${edge.source}`
        );
      }
      if (!nodeIdSet.has(edge.target)) {
        errors.push(
          `Edge ${edge.id} references non-existent target node: ${edge.target}`
        );
      }
    }

    // Check for nodes without type or position
    for (const node of nodes) {
      if (!node.type) {
        errors.push(`Node ${node.id} is missing type`);
      }
      if (!node.position) {
        errors.push(`Node ${node.id} is missing position`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export graph as JSON
   */
  static exportGraph(nodes: Node<EditableNodeData>[], edges: Edge[]): string {
    const graphData = {
      nodes: nodes.map(node => ({
        ...node,
        // Ensure we include all necessary data for reimport
        data: {
          ...node.data,
          nodeType: node.data.nodeType || node.type
        }
      })),
      edges,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(graphData, null, 2);
  }

  /**
   * Import graph from JSON
   */
  static importGraph(jsonString: string): {
    nodes: Node<EditableNodeData>[];
    edges: Edge[];
  } | null {
    try {
      const data = JSON.parse(jsonString);

      // Validate basic structure
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid graph data: missing or invalid nodes array');
      }
      if (!data.edges || !Array.isArray(data.edges)) {
        throw new Error('Invalid graph data: missing or invalid edges array');
      }

      return {
        nodes: data.nodes,
        edges: data.edges
      };
    } catch (error) {
      console.error('GraphConverter: Failed to import graph:', error);
      return null;
    }
  }
}
