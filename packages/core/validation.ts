import { Edge, Node } from 'reactflow';

/**
 * Error object for validation errors.
 */
export interface ValidationError {
  edgeId: string;
  message: string;
}

/**
 * Validate current graph connections.
 * Returns an array of errors – empty means valid.
 */
export function validateConnection(
  edges: Edge[],
  nodes: Node[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenPairs = new Set<string>();

  for (const e of edges) {
    // Self-loop
    if (e.source === e.target) {
      errors.push({ edgeId: e.id, message: 'Edge is a self-loop' });
      continue;
    }

    // Duplicate connection between the same source and target
    const key = `${e.source}->${e.target}`;
    if (seenPairs.has(key)) {
      errors.push({ edgeId: e.id, message: 'Duplicate edge' });
    } else {
      seenPairs.add(key);
    }
  }

  // Ensure edges reference existing nodes
  const nodeIds = new Set(nodes.map(n => n.id));
  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      errors.push({ edgeId: e.id, message: 'Edge references missing node' });
    }
  }

  return errors;
}
