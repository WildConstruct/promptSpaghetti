import type { Edge, Node, XYPosition } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import type { AgentFragmentRecord } from '@prompt/asset-browser';
import {
  findNearestEdgeInsertionTarget,
  type EdgeInsertionTarget
} from './EdgeInsertionTargeting';

type FlowNode = Node<EditableNodeData>;

export type FragmentDropTarget =
  | {
      kind: 'replace-node';
      nodeId: string;
      nodeType?: string;
      reason: string;
    }
  | {
      kind: 'inside-container';
      nodeId: string;
      nodeType?: string;
      reason: string;
    }
  | {
      kind: 'insert-edge';
      edgeId: string;
      sourceId: string;
      targetId: string;
      midpoint: XYPosition;
      reason: string;
    }
  | {
      kind: 'free-place';
      reason: string;
    };

function getNodeBox(node: FlowNode) {
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + (node.width ?? 180),
    bottom: node.position.y + (node.height ?? 72)
  };
}

function isPointerInsideNode(pointer: XYPosition, node: FlowNode) {
  const box = getNodeBox(node);
  return (
    pointer.x >= box.left &&
    pointer.x <= box.right &&
    pointer.y >= box.top &&
    pointer.y <= box.bottom
  );
}

function isContainerNode(node: FlowNode) {
  return node.type === 'enhancedBoundingBox' || node.type === 'fragmentContainer';
}

function canReplaceNode(fragment: AgentFragmentRecord, node: FlowNode) {
  if (isContainerNode(node)) {
    return false;
  }
  if (!fragment.nodeTypes.length) {
    return true;
  }

  const normalizedType = node.type === 'concat' ? 'merge' : node.type;
  return fragment.nodeTypes.includes(
    normalizedType as AgentFragmentRecord['nodeTypes'][number]
  );
}

function findNodeReplacementTarget(params: {
  pointer: XYPosition;
  nodes: FlowNode[];
  fragment: AgentFragmentRecord;
}) {
  const { pointer, nodes, fragment } = params;

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    if (!isPointerInsideNode(pointer, node)) {
      continue;
    }

    if (!canReplaceNode(fragment, node)) {
      return null;
    }

    return {
      kind: 'replace-node' as const,
      nodeId: node.id,
      nodeType: node.type,
      reason: 'Pointer is directly over a compatible node.'
    };
  }

  return null;
}

function findContainerPlacementTarget(params: {
  pointer: XYPosition;
  nodes: FlowNode[];
}) {
  const { pointer, nodes } = params;

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    if (!isContainerNode(node) || !isPointerInsideNode(pointer, node)) {
      continue;
    }

    return {
      kind: 'inside-container' as const,
      nodeId: node.id,
      nodeType: node.type,
      reason: 'Pointer is inside a region/container placement target.'
    };
  }

  return null;
}

function edgeTargetToDropTarget(target: EdgeInsertionTarget): FragmentDropTarget {
  return {
    kind: 'insert-edge',
    edgeId: target.edgeId,
    sourceId: target.sourceId,
    targetId: target.targetId,
    midpoint: target.midpoint,
    reason: 'Pointer is nearest to an existing edge insertion point.'
  };
}

export function findFragmentDropTarget(params: {
  pointer: XYPosition;
  fragment: AgentFragmentRecord;
  nodes: FlowNode[];
  edges: Edge[];
}): FragmentDropTarget {
  const { pointer, fragment, nodes, edges } = params;

  const replacementTarget = findNodeReplacementTarget({
    pointer,
    nodes,
    fragment
  });
  if (replacementTarget) {
    return replacementTarget;
  }

  const containerTarget = findContainerPlacementTarget({
    pointer,
    nodes
  });
  if (containerTarget) {
    return containerTarget;
  }

  const edgeTarget = findNearestEdgeInsertionTarget({
    pointer,
    edges,
    nodes
  });
  if (edgeTarget) {
    return edgeTargetToDropTarget(edgeTarget);
  }

  return {
    kind: 'free-place',
    reason: 'No compatible node or nearby edge target was found.'
  };
}
