import { Edge, Node } from 'reactflow';
import { ValidationError } from '../validation';
interface UseValidationReturn {
    errors: ValidationError[];
    styledEdges: Edge[];
    styledNodes: Node[];
    runValidation: (edges: Edge[], nodes: Node[]) => void;
}
interface UseValidationProps {
    edges: Edge[];
    nodes: Node[];
    highlightNodeIds?: Set<string>;
    highlightEdgeIds?: Set<string>;
    validateConnection?: (edges: Edge[], nodes: Node[]) => ValidationError[];
}
export declare const useValidation: ({ edges, nodes, highlightNodeIds, highlightEdgeIds, validateConnection: customValidateConnection }: UseValidationProps) => UseValidationReturn;
export {};
//# sourceMappingURL=useValidation.d.ts.map