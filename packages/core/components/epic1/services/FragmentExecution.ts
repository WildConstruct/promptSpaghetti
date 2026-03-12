import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';

export type FlowNode = Node<EditableNodeData>;
export type FlowEdge = Edge<EditableNodeData>;

export interface EdgeSpliceTarget {
  edgeId: string;
  sourceId: string;
  targetId: string;
  edgeType?: string;
  edgeClassName?: string;
  edgeStyle?: Record<string, unknown>;
  markerEnd?: unknown;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface NodeReplacementTarget {
  nodeId: string;
}

export type PresetInsertionMetadata = {
  preferredInsertion?: 'replace-node' | 'insert-edge' | 'free-place';
  entryStrategy?: 'single-node' | 'auto-boundary' | 'manual';
  exitStrategy?: 'single-node' | 'auto-boundary' | 'manual';
};

export function findFragmentBoundaryNodes(
  nodes: FlowNode[],
  edges: FlowEdge[]
): { entryNode: FlowNode | null; exitNode: FlowNode | null } {
  const nodeIds = new Set(nodes.map(node => node.id));
  const incomingCounts = new Map<string, number>();
  const outgoingCounts = new Map<string, number>();

  for (const node of nodes) {
    incomingCounts.set(node.id, 0);
    outgoingCounts.set(node.id, 0);
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.target)) {
      incomingCounts.set(
        edge.target,
        (incomingCounts.get(edge.target) ?? 0) + 1
      );
    }
    if (nodeIds.has(edge.source)) {
      outgoingCounts.set(
        edge.source,
        (outgoingCounts.get(edge.source) ?? 0) + 1
      );
    }
  }

  const entryCandidates = nodes.filter(
    node => (incomingCounts.get(node.id) ?? 0) === 0
  );
  const exitCandidates = nodes.filter(
    node => (outgoingCounts.get(node.id) ?? 0) === 0
  );

  return {
    entryNode: entryCandidates.length === 1 ? entryCandidates[0] : null,
    exitNode: exitCandidates.length === 1 ? exitCandidates[0] : null
  };
}

export function splicePresetIntoEdge(
  existingEdges: FlowEdge[],
  nodesToAdd: FlowNode[],
  edgesToAdd: FlowEdge[],
  edgeSpliceTarget?: EdgeSpliceTarget | null,
  insertionMetadata?: PresetInsertionMetadata | null
): FlowEdge[] {
  if (!edgeSpliceTarget) {
    return existingEdges.concat(edgesToAdd);
  }

  if (insertionMetadata?.preferredInsertion === 'free-place') {
    return existingEdges.concat(edgesToAdd);
  }

  const untouchedEdges = existingEdges.filter(
    edge => edge.id !== edgeSpliceTarget.edgeId
  );

  if (
    nodesToAdd.length === 1 &&
    (insertionMetadata?.entryStrategy ?? 'single-node') === 'single-node' &&
    (insertionMetadata?.exitStrategy ?? 'single-node') === 'single-node'
  ) {
    const insertedNode = nodesToAdd[0];
    const spliceEdges: FlowEdge[] = [
      {
        id: `${edgeSpliceTarget.sourceId}->${insertedNode.id}:${Date.now()}:a`,
        source: edgeSpliceTarget.sourceId,
        target: insertedNode.id,
        sourceHandle: edgeSpliceTarget.sourceHandle ?? undefined,
        type: edgeSpliceTarget.edgeType,
        className: edgeSpliceTarget.edgeClassName,
        style: edgeSpliceTarget.edgeStyle as FlowEdge['style'],
        markerEnd: edgeSpliceTarget.markerEnd as FlowEdge['markerEnd']
      },
      {
        id: `${insertedNode.id}->${edgeSpliceTarget.targetId}:${Date.now()}:b`,
        source: insertedNode.id,
        target: edgeSpliceTarget.targetId,
        targetHandle: edgeSpliceTarget.targetHandle ?? undefined,
        type: edgeSpliceTarget.edgeType,
        className: edgeSpliceTarget.edgeClassName,
        style: edgeSpliceTarget.edgeStyle as FlowEdge['style'],
        markerEnd: edgeSpliceTarget.markerEnd as FlowEdge['markerEnd']
      }
    ];

    return untouchedEdges.concat(edgesToAdd, spliceEdges);
  }

  if (
    insertionMetadata?.entryStrategy === 'manual' ||
    insertionMetadata?.exitStrategy === 'manual'
  ) {
    return existingEdges.concat(edgesToAdd);
  }

  const { entryNode, exitNode } = findFragmentBoundaryNodes(
    nodesToAdd,
    edgesToAdd
  );
  if (!entryNode || !exitNode) {
    return existingEdges.concat(edgesToAdd);
  }

  const passthroughEdges: FlowEdge[] = [
    {
      id: `${edgeSpliceTarget.sourceId}->${entryNode.id}:${Date.now()}:a`,
      source: edgeSpliceTarget.sourceId,
      target: entryNode.id,
      sourceHandle: edgeSpliceTarget.sourceHandle ?? undefined,
      type: edgeSpliceTarget.edgeType,
      className: edgeSpliceTarget.edgeClassName,
      style: edgeSpliceTarget.edgeStyle as FlowEdge['style'],
      markerEnd: edgeSpliceTarget.markerEnd as FlowEdge['markerEnd']
    },
    {
      id: `${exitNode.id}->${edgeSpliceTarget.targetId}:${Date.now()}:b`,
      source: exitNode.id,
      target: edgeSpliceTarget.targetId,
      targetHandle: edgeSpliceTarget.targetHandle ?? undefined,
      type: edgeSpliceTarget.edgeType,
      className: edgeSpliceTarget.edgeClassName,
      style: edgeSpliceTarget.edgeStyle as FlowEdge['style'],
      markerEnd: edgeSpliceTarget.markerEnd as FlowEdge['markerEnd']
    }
  ];

  return untouchedEdges.concat(edgesToAdd, passthroughEdges);
}

function cloneEdgeForReplacement(
  edge: FlowEdge,
  overrides: Partial<FlowEdge>
): FlowEdge {
  return {
    ...edge,
    ...overrides,
    id:
      typeof overrides.id === 'string'
        ? overrides.id
        : `${edge.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
  };
}

export function replacePresetAtNode(
  existingNodes: FlowNode[],
  existingEdges: FlowEdge[],
  nodesToAdd: FlowNode[],
  edgesToAdd: FlowEdge[],
  nodeReplacementTarget?: NodeReplacementTarget | null,
  insertionMetadata?: PresetInsertionMetadata | null
): { nodes: FlowNode[]; edges: FlowEdge[]; replaced: boolean } {
  if (!nodeReplacementTarget) {
    return {
      nodes: existingNodes.concat(nodesToAdd),
      edges: existingEdges.concat(edgesToAdd),
      replaced: false
    };
  }

  const nodeToReplace = existingNodes.find(
    node => node.id === nodeReplacementTarget.nodeId
  );
  if (!nodeToReplace) {
    return {
      nodes: existingNodes.concat(nodesToAdd),
      edges: existingEdges.concat(edgesToAdd),
      replaced: false
    };
  }

  if (
    insertionMetadata?.entryStrategy === 'manual' ||
    insertionMetadata?.exitStrategy === 'manual'
  ) {
    return {
      nodes: existingNodes.concat(nodesToAdd),
      edges: existingEdges.concat(edgesToAdd),
      replaced: false
    };
  }

  let entryNode: FlowNode | null = null;
  let exitNode: FlowNode | null = null;

  if (
    nodesToAdd.length === 1 &&
    (insertionMetadata?.entryStrategy ?? 'single-node') === 'single-node' &&
    (insertionMetadata?.exitStrategy ?? 'single-node') === 'single-node'
  ) {
    entryNode = nodesToAdd[0];
    exitNode = nodesToAdd[0];
  } else {
    const boundaries = findFragmentBoundaryNodes(nodesToAdd, edgesToAdd);
    entryNode = boundaries.entryNode;
    exitNode = boundaries.exitNode;
  }

  if (!entryNode || !exitNode) {
    return {
      nodes: existingNodes.concat(nodesToAdd),
      edges: existingEdges.concat(edgesToAdd),
      replaced: false
    };
  }

  const incomingEdges = existingEdges.filter(
    edge => edge.target === nodeReplacementTarget.nodeId
  );
  const outgoingEdges = existingEdges.filter(
    edge => edge.source === nodeReplacementTarget.nodeId
  );
  const retainedEdges = existingEdges.filter(
    edge =>
      edge.source !== nodeReplacementTarget.nodeId &&
      edge.target !== nodeReplacementTarget.nodeId
  );
  const retainedNodes = existingNodes.filter(
    node => node.id !== nodeReplacementTarget.nodeId
  );

  const rewiredIncoming = incomingEdges.map(edge =>
    cloneEdgeForReplacement(edge, {
      source: edge.source,
      target: entryNode.id,
      targetHandle: undefined
    })
  );
  const rewiredOutgoing = outgoingEdges.map(edge =>
    cloneEdgeForReplacement(edge, {
      source: exitNode.id,
      target: edge.target,
      sourceHandle: undefined
    })
  );

  return {
    nodes: retainedNodes.concat(nodesToAdd),
    edges: retainedEdges.concat(edgesToAdd, rewiredIncoming, rewiredOutgoing),
    replaced: true
  };
}
