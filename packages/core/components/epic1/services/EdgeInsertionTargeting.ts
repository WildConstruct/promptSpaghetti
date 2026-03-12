import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';

type FlowNode = Node<EditableNodeData>;

export type EdgeInsertionTarget = {
  edgeId: string;
  sourceId: string;
  targetId: string;
  midpoint: { x: number; y: number };
  distance: number;
};

function getNodeCenter(node: FlowNode) {
  return {
    x: node.position.x + (node.width ?? 180) / 2,
    y: node.position.y + (node.height ?? 72) / 2
  };
}

export function getEdgeMidpoint(
  edge: Edge,
  nodesById: Map<string, FlowNode>
): { x: number; y: number } | null {
  const sourceNode = nodesById.get(edge.source);
  const targetNode = nodesById.get(edge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);

  return {
    x: (sourceCenter.x + targetCenter.x) / 2,
    y: (sourceCenter.y + targetCenter.y) / 2
  };
}

export function findNearestEdgeInsertionTarget(params: {
  pointer: { x: number; y: number };
  edges: Edge[];
  nodes: FlowNode[];
  maxDistance?: number;
}): EdgeInsertionTarget | null {
  const { pointer, edges, nodes, maxDistance = 120 } = params;
  const nodesById = new Map(nodes.map(node => [node.id, node]));

  let bestTarget: EdgeInsertionTarget | null = null;

  for (const edge of edges) {
    const midpoint = getEdgeMidpoint(edge, nodesById);
    if (!midpoint) {
      continue;
    }

    const dx = midpoint.x - pointer.x;
    const dy = midpoint.y - pointer.y;
    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) {
      continue;
    }

    if (!bestTarget || distance < bestTarget.distance) {
      bestTarget = {
        edgeId: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        midpoint,
        distance
      };
    }
  }

  return bestTarget;
}
