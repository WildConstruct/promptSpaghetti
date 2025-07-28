import { Edge, Node } from 'reactflow';
export interface ValidationError {
    edgeId: string;
    message: string;
}
export declare function validateConnection(edges: Edge, nodes: Node): ValidationError;
//# sourceMappingURL=validation.d.ts.map