import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';

export interface ComponentClosureValidationResult {
  isClosed: boolean;
  externalIncomingEdges: Edge[];
  externalOutgoingEdges: Edge[];
}

export function validateClosedComponentSelection(
  selectedNodes: Array<Node<EditableNodeData>>,
  edges: Edge[]
): ComponentClosureValidationResult {
  const selectedNodeIds = new Set(selectedNodes.map(node => node.id));

  const externalIncomingEdges = edges.filter(
    edge =>
      selectedNodeIds.has(edge.target) && !selectedNodeIds.has(edge.source)
  );
  const externalOutgoingEdges = edges.filter(
    edge =>
      selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)
  );

  return {
    isClosed:
      externalIncomingEdges.length === 0 && externalOutgoingEdges.length === 0,
    externalIncomingEdges,
    externalOutgoingEdges
  };
}
