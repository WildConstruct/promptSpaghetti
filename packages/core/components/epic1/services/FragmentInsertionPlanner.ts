import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import type { AgentFragmentRecord, PlacementHint } from '@prompt/asset-browser';

export type InsertionAnchor =
  | 'replace-node'
  | 'downstream-node'
  | 'branch-lane'
  | 'before-output'
  | 'inside-region'
  | 'free-placement';

export type InsertionIntent =
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
      reason: string;
    }
  | {
      kind: 'free-place';
      reason: string;
    };

export type InsertionPlan = {
  anchor: InsertionAnchor;
  position: { x: number; y: number };
  intent: InsertionIntent;
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

function isContainerNode(node: FlowNode) {
  return (
    node.type === 'enhancedBoundingBox' || node.type === 'fragmentContainer'
  );
}

function nodeTypeToFragmentType(nodeType?: string) {
  switch (nodeType) {
    case 'weightedChoice':
      return 'weighted-choice';
    case 'textBlock':
      return 'text';
    case 'concat':
      return 'merge';
    case 'output':
      return 'output';
    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return 'variable';
    case 'enhancedBoundingBox':
    case 'fragmentContainer':
      return 'region';
    default:
      return nodeType;
  }
}

function canReplaceSelectedNode(
  fragment: AgentFragmentRecord,
  selectedNode: FlowNode
) {
  if (isContainerNode(selectedNode)) {
    return false;
  }
  if (!fragment.nodeTypes.length) {
    return true;
  }

  const normalizedType = nodeTypeToFragmentType(selectedNode.type);
  return fragment.nodeTypes.includes(
    normalizedType as AgentFragmentRecord['nodeTypes'][number]
  );
}

function buildEdgeIntent(edge: Edge, reason: string): InsertionIntent {
  return {
    kind: 'insert-edge',
    edgeId: edge.id,
    sourceId: edge.source,
    targetId: edge.target,
    reason
  };
}

function buildFreePlaceIntent(reason: string): InsertionIntent {
  return {
    kind: 'free-place',
    reason
  };
}

function hasHint(fragment: AgentFragmentRecord, hint: PlacementHint): boolean {
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
      intent: buildFreePlaceIntent('No selected node is available.'),
      notes: ['No selection; using default free placement.']
    };
  }

  const selectedCenter = getNodeCenter(selectedNode);
  const outgoing = findFirstOutgoing(selectedNode.id, edges, nodesById);
  const incomingBranch = findIncomingBranchEdge(selectedNode.id, edges);
  const shouldUseEdgeIntent = fragment.preferredInsertion !== 'free-place';

  if (
    fragment.preferredInsertion === 'replace-node' &&
    canReplaceSelectedNode(fragment, selectedNode)
  ) {
    return {
      anchor: 'replace-node',
      position: selectedNode.position,
      intent: {
        kind: 'replace-node',
        nodeId: selectedNode.id,
        nodeType: selectedNode.type,
        reason:
          'Fragment metadata prefers replacement and the selection is compatible.'
      },
      sourceNodeId: selectedNode.id,
      notes: ['Replacing the selected compatible node.']
    };
  }

  if (
    hasHint(fragment, 'inside-region') &&
    selectedNode.type === 'enhancedBoundingBox'
  ) {
    return {
      anchor: 'inside-region',
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 60
      },
      intent: {
        kind: 'inside-container',
        nodeId: selectedNode.id,
        nodeType: selectedNode.type,
        reason: 'Selected node is a region/container placement target.'
      },
      sourceNodeId: selectedNode.id,
      notes: [
        'Selected node is a region; placing fragment inside the container.'
      ]
    };
  }

  if (hasHint(fragment, 'before-output')) {
    const outputEdge =
      outgoing?.targetNode?.type === 'output' ? outgoing.edge : null;
    const outputTarget = outputEdge
      ? outgoing?.targetNode
      : nodes.find(node => node.type === 'output');

    if (outputTarget) {
      return {
        anchor: 'before-output',
        position: {
          x: outputTarget.position.x - DEFAULT_OFFSET_X,
          y: outputTarget.position.y
        },
        intent:
          outputEdge && shouldUseEdgeIntent
            ? buildEdgeIntent(
                outputEdge,
                'Fragment is being inserted before the output edge.'
              )
            : buildFreePlaceIntent(
                'Output target has no selected outgoing edge to splice.'
              ),
        sourceNodeId: selectedNode.id,
        targetEdgeId:
          outputEdge && shouldUseEdgeIntent ? outputEdge.id : undefined,
        notes: [
          'Fragment is an output finisher; placing it before the output lane.'
        ]
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
      intent: shouldUseEdgeIntent
        ? buildEdgeIntent(
            incomingBranch,
            'Fragment extends an existing branch lane.'
          )
        : buildFreePlaceIntent(
            'Fragment prefers free placement near the branch lane.'
          ),
      sourceNodeId: selectedNode.id,
      targetEdgeId: shouldUseEdgeIntent ? incomingBranch.id : undefined,
      notes: ['Fragment extends an existing branch lane.']
    };
  }

  if (
    hasHint(fragment, 'downstream-of-choice') ||
    selectedNode.type === 'weightedChoice'
  ) {
    return {
      anchor: 'downstream-node',
      position: {
        x: selectedCenter.x + DEFAULT_OFFSET_X,
        y: selectedCenter.y - (selectedNode.height ?? 72) / 2
      },
      intent:
        outgoing?.edge && shouldUseEdgeIntent
          ? buildEdgeIntent(
              outgoing.edge,
              'Fragment is being inserted downstream on the selected node edge.'
            )
          : buildFreePlaceIntent(
              'No outgoing edge is available, or the fragment prefers free placement.'
            ),
      sourceNodeId: selectedNode.id,
      targetEdgeId:
        outgoing?.edge && shouldUseEdgeIntent ? outgoing.edge.id : undefined,
      notes: ['Placing fragment downstream of the selected node.']
    };
  }

  return {
    anchor: 'free-placement',
    position: {
      x: selectedCenter.x + DEFAULT_OFFSET_X,
      y: selectedCenter.y + DEFAULT_OFFSET_Y
    },
    intent: buildFreePlaceIntent('No specific insertion target matched.'),
    sourceNodeId: selectedNode.id,
    notes: [
      'No specific placement hint matched; using free placement near selection.'
    ]
  };
}
