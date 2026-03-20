import type { Edge, Node } from 'reactflow';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 80;
const BOX_PADDING = 32;
const BOX_HEADER_OFFSET = 36;
const DEFAULT_BOX_WIDTH = 420;
const DEFAULT_BOX_HEIGHT = 260;
const CONTAINER_INSET_X = 40;
const CONTAINER_INSET_Y = 60;

export type BootstrapInsertionTarget = {
  anchor?: { x: number; y: number };
  container?: Pick<Node, 'id' | 'position' | 'type'>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getMinPosition(
  nodes: Node[]
): {
  x: number;
  y: number;
} {
  return nodes.reduce(
    (min, node) => ({
      x: Math.min(min.x, node.position?.x ?? 0),
      y: Math.min(min.y, node.position?.y ?? 0)
    }),
    { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY }
  );
}

function getNodeWidth(node: Node): number {
  return Number(node.width ?? node.style?.width) || DEFAULT_NODE_WIDTH;
}

function getNodeHeight(node: Node): number {
  return Number(node.height ?? node.style?.height) || DEFAULT_NODE_HEIGHT;
}

function wrapInsertedNodesIfNeeded(
  nodes: Node[],
  idSeed: number,
  bootstrapGroupId: string
): Node[] {
  const hasBoundingBox = nodes.some(node => node.type === 'enhancedBoundingBox');
  const contentNodes = nodes.filter(node => node.type !== 'enhancedBoundingBox');

  if (hasBoundingBox || contentNodes.length < 2) {
    return nodes;
  }

  const minX = contentNodes.reduce(
    (min, node) => Math.min(min, node.position?.x ?? 0),
    Number.POSITIVE_INFINITY
  );
  const minY = contentNodes.reduce(
    (min, node) => Math.min(min, node.position?.y ?? 0),
    Number.POSITIVE_INFINITY
  );
  const maxX = contentNodes.reduce(
    (max, node) =>
      Math.max(max, (node.position?.x ?? 0) + getNodeWidth(node)),
    Number.NEGATIVE_INFINITY
  );
  const maxY = contentNodes.reduce(
    (max, node) =>
      Math.max(max, (node.position?.y ?? 0) + getNodeHeight(node)),
    Number.NEGATIVE_INFINITY
  );

  const boxId = `bootstrap-box-${idSeed}`;
  const boxWidth = Math.max(
    DEFAULT_BOX_WIDTH,
    maxX - minX + BOX_PADDING * 2
  );
  const boxHeight = Math.max(
    DEFAULT_BOX_HEIGHT,
    maxY - minY + BOX_PADDING * 2 + BOX_HEADER_OFFSET
  );
  const boxPosition = {
    x: minX - BOX_PADDING,
    y: minY - BOX_PADDING - BOX_HEADER_OFFSET
  };

  const wrappedNodes = nodes.map(node => {
    if (node.type === 'enhancedBoundingBox' || node.parentNode) {
      return node;
    }

    return {
      ...node,
      parentNode: boxId,
      extent: 'parent' as const,
      expandParent: true,
      position: {
        x: (node.position?.x ?? 0) - boxPosition.x,
        y: (node.position?.y ?? 0) - boxPosition.y
      }
    };
  });

  return [
    {
      id: boxId,
      type: 'enhancedBoundingBox',
      position: boxPosition,
      width: boxWidth,
      height: boxHeight,
      data: {
        bootstrapGroupId,
        bootstrapInserted: true,
        title: 'Image Bootstrap',
        description: 'Inserted image bootstrap draft',
        backgroundColor: '#1a202c',
        opacity: 0.1,
        borderColor: '#22d3ee',
        borderStyle: 'solid',
        borderWidth: 2,
        locked: false,
        isCollapsed: false,
        width: boxWidth,
        height: boxHeight,
        nodeCount: contentNodes.length,
        fragmentImported: true,
        fragmentSource: 'image-bootstrap',
        fragmentRegions: [
          {
            id: 'bootstrap-region',
            name: 'Image Bootstrap',
            nodes: contentNodes.map(node => node.id)
          }
        ],
        regionCount: 1
      },
      style: {
        width: boxWidth,
        height: boxHeight
      },
      selected: false
    },
    ...wrappedNodes
  ];
}

function parentInsertedNodesToContainer(
  nodes: Node[],
  container: Pick<Node, 'id' | 'position' | 'type'>
): Node[] {
  if (container.type !== 'enhancedBoundingBox') {
    return nodes;
  }

  return nodes.map(node => {
    if (node.parentNode) {
      return node;
    }

    return {
      ...node,
      parentNode: container.id,
      extent: 'parent' as const,
      expandParent: true,
      position: {
        x: (node.position?.x ?? 0) - (container.position?.x ?? 0),
        y: (node.position?.y ?? 0) - (container.position?.y ?? 0)
      }
    };
  });
}

function getContentNodes(nodes: Node[]) {
  return nodes.filter(node => node.type !== 'enhancedBoundingBox');
}

function getPreferredBoundaryNodes(nodes: Node[], edges: Edge[]) {
  const contentNodes = getContentNodes(nodes);
  const nodeIds = new Set(contentNodes.map(node => node.id));
  const incomingCounts = new Map<string, number>();
  const outgoingCounts = new Map<string, number>();

  contentNodes.forEach(node => {
    incomingCounts.set(node.id, 0);
    outgoingCounts.set(node.id, 0);
  });

  edges.forEach(edge => {
    if (nodeIds.has(edge.target)) {
      incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
    }
    if (nodeIds.has(edge.source)) {
      outgoingCounts.set(edge.source, (outgoingCounts.get(edge.source) || 0) + 1);
    }
  });

  const entryNode =
    contentNodes.find(node => (incomingCounts.get(node.id) || 0) === 0) ||
    [...contentNodes].sort(
      (left, right) => (left.position?.x ?? 0) - (right.position?.x ?? 0)
    )[0];
  const exitNode =
    contentNodes.find(node => (outgoingCounts.get(node.id) || 0) === 0) ||
    [...contentNodes].sort(
      (left, right) => (right.position?.x ?? 0) - (left.position?.x ?? 0)
    )[0];

  return { entryNode, exitNode };
}

export function mergeDraftIntoGraph(
  currentNodes: Node[],
  currentEdges: Edge[],
  draftNodes: Node[],
  draftEdges: Edge[],
  idSeed = Date.now(),
  target?: BootstrapInsertionTarget
): { nodes: Node[]; edges: Edge[] } {
  if (draftNodes.length === 0) {
    return { nodes: currentNodes, edges: currentEdges };
  }

  const maxX = currentNodes.reduce(
    (max, node) => Math.max(max, node.position?.x ?? 0),
    0
  );
  const draftMin = getMinPosition(draftNodes);
  const insertionOrigin = target?.anchor ||
    (target?.container
      ? {
          x: (target.container.position?.x ?? 0) + CONTAINER_INSET_X,
          y: (target.container.position?.y ?? 0) + CONTAINER_INSET_Y
        }
      : { x: maxX + 320, y: 0 });
  const idMap = new Map<string, string>();
  const bootstrapGroupId = `bootstrap-group-${idSeed}`;

  draftNodes.forEach((node, index) => {
    idMap.set(node.id, `bootstrap-${idSeed}-${index + 1}-${node.id}`);
  });

  const remappedNodes = draftNodes.map(node => ({
    ...node,
    id: idMap.get(node.id) || node.id,
    data: {
      ...(typeof node.data === 'object' && node.data !== null ? node.data : {}),
      bootstrapGroupId,
      bootstrapInserted: true
    },
    parentNode: node.parentNode
      ? idMap.get(node.parentNode) || node.parentNode
      : undefined,
    position: {
      x: (node.position?.x ?? 0) - draftMin.x + insertionOrigin.x,
      y: (node.position?.y ?? 0) - draftMin.y + insertionOrigin.y
    },
    selected: false
  }));
  const wrappedNodes = wrapInsertedNodesIfNeeded(
    remappedNodes,
    idSeed,
    bootstrapGroupId
  );
  const nextNodes = target?.container
    ? parentInsertedNodesToContainer(wrappedNodes, target.container)
    : wrappedNodes;

  const nextEdges = draftEdges.map((edge, index) => ({
    ...edge,
    id: `bootstrap-edge-${idSeed}-${index + 1}-${edge.id}`,
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
    data: {
      ...(typeof edge.data === 'object' && edge.data !== null ? edge.data : {}),
      bootstrapGroupId,
      bootstrapInserted: true
    },
    selected: true
  }));

  const selectedNodeIds = new Set(nextNodes.map(node => node.id));
  const mergedNodes = [
    ...currentNodes.map(node => ({ ...node, selected: false })),
    ...nextNodes.map(node => ({
      ...node,
      selected: selectedNodeIds.has(node.id)
    }))
  ];
  const mergedEdges = [
    ...currentEdges.map(edge => ({ ...edge, selected: false })),
    ...nextEdges
  ];

  return {
    nodes: mergedNodes,
    edges: mergedEdges
  };
}

export function replaceBootstrapGroupInGraph(
  currentNodes: Node[],
  currentEdges: Edge[],
  draftNodes: Node[],
  draftEdges: Edge[],
  bootstrapGroupId: string,
  idSeed = Date.now()
): { nodes: Node[]; edges: Edge[] } {
  const groupNodes = currentNodes.filter(
    node =>
      isRecord(node.data) && node.data.bootstrapGroupId === bootstrapGroupId
  );
  if (groupNodes.length === 0) {
    return mergeDraftIntoGraph(
      currentNodes,
      currentEdges,
      draftNodes,
      draftEdges,
      idSeed
    );
  }

  const groupNodeIds = new Set(groupNodes.map(node => node.id));
  const topLevelGroupNode =
    groupNodes.find(node => !node.parentNode) ||
    groupNodes.find(node => node.type === 'enhancedBoundingBox') ||
    groupNodes[0];

  const replacementTarget: BootstrapInsertionTarget = topLevelGroupNode.parentNode
    ? {
        container: currentNodes.find(node => node.id === topLevelGroupNode.parentNode)
          ? {
              id: topLevelGroupNode.parentNode,
              type:
                currentNodes.find(node => node.id === topLevelGroupNode.parentNode)
                  ?.type || 'enhancedBoundingBox',
              position:
                currentNodes.find(node => node.id === topLevelGroupNode.parentNode)
                  ?.position || { x: 0, y: 0 }
            }
          : undefined,
        anchor: topLevelGroupNode.parentNode
          ? undefined
          : {
              x: topLevelGroupNode.position?.x ?? 0,
              y: topLevelGroupNode.position?.y ?? 0
            }
      }
    : {
        anchor: {
          x: topLevelGroupNode.position?.x ?? 0,
          y: topLevelGroupNode.position?.y ?? 0
        }
      };

  const nextNodes = currentNodes.filter(node => !groupNodeIds.has(node.id));
  const preservedBoundaryEdges = currentEdges.filter(
    edge =>
      (groupNodeIds.has(edge.source) && !groupNodeIds.has(edge.target)) ||
      (!groupNodeIds.has(edge.source) && groupNodeIds.has(edge.target))
  );
  const nextEdges = currentEdges.filter(
    edge =>
      !groupNodeIds.has(edge.source) &&
      !groupNodeIds.has(edge.target) &&
      !(
        isRecord(edge.data) && edge.data.bootstrapGroupId === bootstrapGroupId
      )
  );

  const merged = mergeDraftIntoGraph(
    nextNodes,
    nextEdges,
    draftNodes,
    draftEdges,
    idSeed,
    replacementTarget
  );
  const nextBootstrapGroupId = `bootstrap-group-${idSeed}`;
  const insertedNodes = merged.nodes.filter(
    node =>
      isRecord(node.data) && node.data.bootstrapGroupId === nextBootstrapGroupId
  );
  const insertedEdges = merged.edges.filter(
    edge =>
      isRecord(edge.data) && edge.data.bootstrapGroupId === nextBootstrapGroupId
  );
  const { entryNode, exitNode } = getPreferredBoundaryNodes(
    insertedNodes,
    insertedEdges
  );
  const reattachedEdges = preservedBoundaryEdges.flatMap((edge, index) => {
    if (groupNodeIds.has(edge.target) && entryNode) {
      return [
        {
          ...edge,
          id: `bootstrap-reattach-in-${idSeed}-${index + 1}-${edge.id}`,
          target: entryNode.id,
          selected: true
        }
      ];
    }
    if (groupNodeIds.has(edge.source) && exitNode) {
      return [
        {
          ...edge,
          id: `bootstrap-reattach-out-${idSeed}-${index + 1}-${edge.id}`,
          source: exitNode.id,
          selected: true
        }
      ];
    }
    return [];
  });

  return {
    nodes: merged.nodes,
    edges: [...merged.edges, ...reattachedEdges]
  };
}
