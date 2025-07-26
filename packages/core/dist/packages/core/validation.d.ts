import { Edge, Node } from 'reactflow';
export interface ValidationError {
    edgeId: string;
    message: string;
}
/**
 * Validate current graph connections.
 * Returns an array of errors – empty means valid.
 */
export declare function validateConnection(edges: Edge[], nodes: Node[]): ValidationError[];
//# sourceMappingURL=validation.d.ts.map