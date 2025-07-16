import { useState, useCallback, useEffect } from "react";
import { Edge, Node } from "reactflow";
import { ValidationError, validateConnection } from "../validation";

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

export const useValidation = ({
  edges,
  nodes,
  highlightNodeIds = new Set(),
  highlightEdgeIds = new Set(),
  validateConnection: customValidateConnection = validateConnection,
}: UseValidationProps): UseValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const runValidation = useCallback(
    (edgesToValidate: Edge[], nodesToValidate: Node[]) => {
      const errs = customValidateConnection(edgesToValidate, nodesToValidate);
      setErrors(errs);
    },
    [customValidateConnection]
  );

  // Apply highlight styles to nodes
  const styledNodes = nodes.map((n) => {
    const highlight = highlightNodeIds.has(n.id)
      ? { border: '2px solid #ffd700' }
      : {};
    return { ...n, style: { ...n.style, ...highlight } };
  });

  // Apply error and highlight styles to edges
  const styledEdges = edges.map((e) => {
    const base = errors.find((err) => err.edgeId === e.id)
      ? { stroke: 'red', strokeWidth: 2 }
      : {};
    const highlight = highlightEdgeIds.has(e.id)
      ? { stroke: '#ffd700', strokeWidth: 3 }
      : {};
    return { ...e, style: { ...e.style, ...base, ...highlight } };
  });

  // Recompute validation errors when edges or nodes change
  useEffect(() => {
    runValidation(edges, nodes);
  }, [edges, nodes, runValidation]);

  return {
    errors,
    styledEdges,
    styledNodes,
    runValidation,
  };
};