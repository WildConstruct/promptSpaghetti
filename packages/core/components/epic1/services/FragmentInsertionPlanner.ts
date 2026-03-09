import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import type {
  AgentFragmentRecord,
  PlacementHint
} from '@prompt/asset-browser';

export type InsertionAnchor =
  | 'downstream-node'
  | 'branch-lane'
  | 'before-output'
  | 'inside-region'
  | 'free-placement';

export type InsertionPlan = {
  anchor: InsertionAnchor;
  position: { x: number; y: number };
  sourceNodeId?: string;
  targetEdgeId?: string;
  notes: string[];
};

type FlowNode = Node<EditableNodeData>;

const DEFAULT_OFFSET_X = 260;
const DEFAULT_OFFSET_Y = 140;

function getNodeCenter(node: FlowNode) {
  return {
    x: node.position.x + (node.width ?? 180) / 2,
    y: node.position.y + (node.height ?? 72) / 2
  };
}

function findFirstOutgoing(
  nodeId: string,
  edges: Edge[],
  nodesById: Map<string, FlowNode>
) {
  for (const edge of edges) {
    if (edge.source !== nodeId) {
      continue;
    }
    const targetNode = nodesById.get(edge.target);
    if (targetNode) {
      return { edge, targetNode };
    }
  }
  return null;
}

function findIncomingBranchEdge(nodeId: string, edges: Edge[]) {
  return edges.find(
    edge => edge.target === nodeId && edge.sourceHandle?.startsWith('branch-')
  );
}

function hasHint(
  fragment: AgentFragmentRecord,
  hint: PlacementHint
): boolean {
  return fragment.placementHints.includes(hint);
}

export function planFragmentInsertion(params: {
  fragment: AgentFragmentRecord;
  selectedNode?: FlowNode | null;
  nodes: FlowNode[];
  edges: Edge[];
}): InsertionPlan {
  const { fragment, selectedNode, nodes, edges } = params;
  const nodesById = new Map(nodes.map(node => [node.id, node]));

  if (!selectedNode) {
    return {
      anchor: 'free-placement',
      position: { x: 240, y: 180 },
      notes: ['No selection; using default free placement.']
    };
  }

  const selectedCenter = getNodeCenter(selectedNode);
  const outgoing = findFirstOutgoing(selectedNode.id, edges, nodesById);
  const incomingBranch = findIncomingBranchEdge(selectedNode.id, edges);

  if (hasHint(fragment, 'inside-region') && selectedNode.type === 'enhancedBoundingBox') {
    return {
      anchor: 'inside-region',
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 60
      },
      sourceNodeId: selectedNode.id,
      notes: ['Selected node is a region; placing fragment inside the container.']
    };
  }

  if (hasHint(fragment, 'before-output')) {
    const outputTarget = outgoing?.targetNode?.type === 'output'
      ? outgoing.targetNode
      : nodes.find(node => node.type === 'output');

    if (outputTarget) {
      return {
        anchor: 'before-output',
        position: {
          x: outputTarget.position.x - DEFAULT_OFFSET_X,
          y: outputTarget.position.y
        },
        sourceNodeId: selectedNode.id,
        targetEdgeId: outgoing?.edge.id,
        notes: ['Fragment is an output finisher; placing it before the output lane.']
      };
    }
  }

  if (hasHint(fragment, 'branch-lane') && incomingBranch) {
    return {
      anchor: 'branch-lane',
      position: {
        x: selectedNode.position.x + DEFAULT_OFFSET_X,
        y: selectedNode.position.y
      },
      sourceNodeId: selectedNode.id,
      targetEdgeId: incomingBranch.id,
      notes: ['Fragment extends an existing branch lane.']
    };
  }

  if (hasHint(fragment, 'downstream-of-choice') || selectedNode.type === 'weightedChoice') {
    return {
      anchor: 'downstream-node',
      position: {
        x: selectedCenter.x + DEFAULT_OFFSET_X,
        y: selectedCenter.y - (selectedNode.height ?? 72) / 2
      },
      sourceNodeId: selectedNode.id,
      targetEdgeId: outgoing?.edge.id,
      notes: ['Placing fragment downstream of the selected node.']
    };
  }

  return {
    anchor: 'free-placement',
    position: {
      x: selectedCenter.x + DEFAULT_OFFSET_X,
      y: selectedCenter.y + DEFAULT_OFFSET_Y
    },
    sourceNodeId: selectedNode.id,
    notes: ['No specific placement hint matched; using free placement near selection.']
  };
}
