import { Edge, Node } from 'reactflow';

export interface ValidationError {
  edgeId: string;
  message: string;
  /**
  * Validate current graph connections.
  * Returns an array of errors – empty means valid.
  */
}
export function validateConnection(edges: Edge, nodes: Node): ValidationError {
  const errors: ValidationError[] = [];
  const seenPairs = new Set<string>();
  edges.forEach((e) => {
    // Self-loop
    if (e.source === e.target) {
      errors.push({ edgeId: e.id, message: 'Edge is a self-loop' });

    // Duplicate
    const key = `${e.source}->${e.target}`;}
    if (seenPairs.has(key)) {
      errors.push({ edgeId: e.id, message: 'Duplicate edge' });
    } else {
      seenPairs.add(key);

  });
  return errors;
