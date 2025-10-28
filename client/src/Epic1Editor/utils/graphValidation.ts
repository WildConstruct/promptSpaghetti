import { Node, Edge } from 'reactflow';

export interface ValidationIssue {
  type: 'warning' | 'error';
  message: string;
}

/**
 * Check for disconnected nodes in the graph
 * Optimized to build edge lookup once instead of scanning for each node
 */
export const findDisconnectedNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  // Build edge lookup sets for O(1) access
  const targetNodes = new Set(edges.map(e => e.target));
  const sourceNodes = new Set(edges.map(e => e.source));

  return nodes.filter(
    node => !targetNodes.has(node.id) && !sourceNodes.has(node.id)
  );
};

/**
 * Check if the graph has output nodes
 */
export const hasOutputNodes = (nodes: Node[]): boolean => {
  return nodes.some(node => node.type === 'output');
};

/**
 * Detect cycles in the graph using DFS
 * Optimized with adjacency list for faster neighbor lookup
 */
export const detectCycle = (nodes: Node[], edges: Edge[]): boolean => {
  // Build adjacency list for O(1) neighbor lookup
  const adjacencyList = new Map<string, string[]>();

  for (const edge of edges) {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycleDFS = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {return true;}
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) {return true;}
    }
  }

  return false;
};

/**
 * Validate the entire graph and return issues
 */
export const validateGraph = (
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Check for disconnected nodes
  const disconnectedNodes = findDisconnectedNodes(nodes, edges);
  if (disconnectedNodes.length > 0) {
    issues.push({
      type: 'warning',
      message: `${disconnectedNodes.length} disconnected node(s)`
    });
  }

  // Check for output nodes
  if (!hasOutputNodes(nodes)) {
    issues.push({
      type: 'error',
      message: 'No output node found'
    });
  }

  // Check for cycles
  if (detectCycle(nodes, edges)) {
    issues.push({
      type: 'warning',
      message: 'Graph contains cycles'
    });
  }

  return issues;
};

/**
 * Format validation issues for display
 */
export const formatValidationMessage = (issues: ValidationIssue[]): string => {
  if (issues.length === 0) {
    return '✅ Graph validation passed!';
  }

  const prefix = issues.some(i => i.type === 'error') ? '❌' : '⚠️';
  const messages = issues.map(i => i.message).join('\n');
  return `${prefix} Graph validation issues:\n${messages}`;
};
